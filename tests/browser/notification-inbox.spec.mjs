import { test, expect } from '@playwright/test'
import { startPreview } from '../fixtures/recruiter-preview.mjs'

const id = n => `00000000-0000-0000-0000-${String(n).padStart(12, '0')}`
const inboxSeed = Array.from({ length: 21 }, (_, n) => ({
  id: id(100 + n), user_id: id(3), title: `Application ${n + 1}`,
  message: 'Your application status changed.', is_read: false,
  created_at: new Date(Date.UTC(2026, 10, n + 1)).toISOString(),
}))
inboxSeed.push({ id: id(200), user_id: id(1), title: 'New applicant', message: 'A seeker applied.', is_read: false,
  created_at: '2026-11-10T12:00:00Z' })

let preview
test.beforeAll(async () => { preview = await startPreview({ inboxSeed }) })
test.afterAll(async () => { await preview?.close() })

async function login(page, email) {
  const base = `http://127.0.0.1:${preview.appPort}`
  await page.goto(base + '/login')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill('local-test-password')
  await page.getByRole('button', { name: 'Log in' }).click()
  await expect(page).toHaveURL(base + '/')
}

test('unread count covers all pages; reading one item updates the bell and persists', async ({ page }) => {
  await login(page, 'jobseeker@example.test')
  await page.getByRole('link', { name: 'Notifications, 21 unread' }).click()
  const items = page.getByRole('list', { name: 'Notifications' }).getByRole('listitem')
  await expect(items).toHaveCount(20)
  await expect(items.first().getByRole('heading')).toHaveText('Application 21')
  await expect(page.getByText('New applicant')).toHaveCount(0)
  const otherTab = await page.context().newPage()
  await otherTab.goto(`http://127.0.0.1:${preview.appPort}/dashboard`)
  await expect(otherTab.getByRole('link', { name: 'Notifications, 21 unread' })).toBeVisible()

  await items.first().getByRole('button', { name: 'Mark as read: Application 21' }).click()
  await expect(items.first().getByText('Read', { exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Notifications, 20 unread' })).toBeVisible()
  await expect(items.nth(1).getByText('Unread', { exact: true })).toBeVisible()
  await otherTab.getByRole('link', { name: 'My profile' }).click()
  await expect(otherTab.getByRole('link', { name: 'Notifications, 20 unread' })).toBeVisible()
  await otherTab.close()

  await page.getByRole('link', { name: 'Older notifications' }).click()
  await expect(items).toHaveCount(1)
  await expect(items.first().getByRole('heading')).toHaveText('Application 1')
  await page.getByRole('link', { name: 'Newer notifications' }).click()
  await expect(page).toHaveURL(/\/notifications$/)
  await expect(items.first().getByRole('heading')).toHaveText('Application 21')
  await page.reload()
  await expect(items.first().getByText('Read', { exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Notifications, 20 unread' })).toBeVisible()
})

test('recruiter and empty inboxes have independent counts; signed-out users must log in', async ({ page }) => {
  const base = `http://127.0.0.1:${preview.appPort}`
  await page.goto(base + '/notifications')
  await expect(page).toHaveURL(/\/login(?:\?|$)/)
  await expect(page.getByRole('link', { name: /^Notifications/ })).toHaveCount(0)
  await login(page, 'recruiter@example.test')
  await page.getByRole('link', { name: 'Notifications, 1 unread' }).click()
  await expect(page.getByRole('listitem')).toHaveCount(1)
  await page.getByRole('button', { name: 'Mark as read: New applicant' }).click()
  await expect(page.getByRole('link', { name: 'Notifications, 0 unread' })).toBeVisible()
  await page.getByRole('button', { name: 'Log out' }).click()
  await login(page, 'other-seeker@example.test')
  await page.getByRole('link', { name: 'Notifications, 0 unread' }).click()
  await expect(page.getByText('No notifications yet.')).toBeVisible()
})
