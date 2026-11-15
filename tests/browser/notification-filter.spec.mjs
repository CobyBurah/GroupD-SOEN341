import { test, expect } from '@playwright/test'
import { startPreview } from '../fixtures/recruiter-preview.mjs'
import { unreadInboxSeed } from '../fixtures/unread-inbox.mjs'

test('Unread finds alerts beyond 200 newer read messages and keeps the bell in sync', async ({ page }, testInfo) => {
  const preview = await startPreview({ notificationSeed: unreadInboxSeed() })
  try {
    const base = `http://127.0.0.1:${preview.appPort}`
    await page.goto(base + '/login')
    await page.getByLabel('Email').fill('jobseeker@example.test')
    await page.getByLabel('Password').fill('any-password')
    await page.getByRole('button', { name: 'Log in', exact: true }).click()
    const bell = count => page.getByRole('link', { name: `Notifications (${count} unread)`, exact: true })
    await bell(21).click()
    const rows = page.getByRole('main').getByRole('listitem')
    await expect(rows.first()).toContainText('Reviewed update 201.')
    const filter = page.getByRole('navigation', { name: 'Filter notifications' })
    await filter.getByRole('link', { name: 'Unread', exact: true }).click()
    await expect(filter.getByRole('link', { name: 'Unread' })).toHaveAttribute('aria-current', 'page')
    await expect(rows).toHaveCount(20)
    await expect(rows.first()).toContainText('Interview invitation for QA Engineer.')
    await page.screenshot({ path: testInfo.outputPath('unread-filter.png') })
    await page.reload()
    await expect(rows.first()).toContainText('Interview invitation for QA Engineer.')
    await page.getByRole('button', { name: 'Load more' }).click()
    await expect(rows).toHaveCount(21)
    const invitation = rows.filter({ hasText: 'Interview invitation for Product Designer.' })
    await expect(invitation).toBeVisible()
    await invitation.getByRole('button', { name: /Mark as read/ }).click()
    await expect(invitation).toHaveCount(0)
    await expect(bell(20)).toBeVisible()
    await page.getByRole('button', { name: 'Mark all as read' }).click()
    await expect(page.getByRole('heading', { name: 'No unread notifications' })).toBeVisible()
    await expect(bell(0)).toBeVisible()
    await page.screenshot({ path: testInfo.outputPath('unread-inbox-cleared.png') })
    await page.getByRole('link', { name: 'View all notifications' }).click()
    await expect(rows.first()).toContainText('Reviewed update 201.')
    await page.goBack()
    await expect(page.getByRole('heading', { name: 'No unread notifications' })).toBeVisible()
  } finally { await preview.close() }
})
