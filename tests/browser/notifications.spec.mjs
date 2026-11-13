import { test, expect } from '@playwright/test'
import { startPreview } from '../fixtures/recruiter-preview.mjs'
let preview
test.beforeAll(async () => { preview = await startPreview() })
test.afterAll(async () => { await preview?.close() })
const base = () => `http://127.0.0.1:${preview.appPort}`
const api = path => `http://127.0.0.1:${preview.apiPort}/rest/v1/${path}`
async function login(page, email) {
  await page.goto(base() + '/login')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill('any-password')
  await page.getByRole('button', { name: 'Log in', exact: true }).click()
  await expect(page).toHaveURL(base() + '/')
}

test('recruiter deadline, application alerts, interview, read state and private inbox', async ({ page, browser }, testInfo) => {
  await login(page, 'recruiter@example.test')
  await page.goto(base() + '/recruiter/jobs/new')
  await page.getByLabel('Job title').fill('Notification Engineer')
  await page.getByLabel('Company').fill('Acceptance Co')
  await page.getByLabel('Job description').fill('A dedicated notification test job.')
  const deadline = new Date(Date.now() + 86400000).toISOString().slice(0, 10)
  await page.getByLabel('Application deadline').fill(deadline)
  await page.getByRole('button', { name: 'Publish posting' }).click()
  await expect(page.getByRole('status')).toHaveText('Posting published.')
  const [job] = await (await fetch(api('jobs'))).json()
  expect(job.application_deadline).toBe(deadline)
  await page.getByRole('link', { name: 'Edit Notification Engineer', exact: true }).click()
  await expect(page.getByLabel('Application deadline')).toHaveValue(deadline)

  const seekerContext = await browser.newContext()
  const seeker = await seekerContext.newPage()
  await login(seeker, 'jobseeker@example.test')
  await seeker.goto(`${base()}/jobs/${job.id}`)
  await expect(seeker.getByText(deadline, { exact: false })).toBeVisible()
  await seeker.goto(base() + '/jobs')
  await seeker.getByRole('button', { name: 'Add Notification Engineer to favourites' }).click()
  await seeker.goto(base() + '/notifications')
  await expect(seeker.getByText(`Application deadline for Notification Engineer: ${deadline} (UTC).`, { exact: true })).toBeVisible()
  await expect(seeker.getByRole('link', { name: 'Notifications (1 unread)', exact: true })).toBeVisible()
  await expect(seeker.getByRole('link', { name: 'Notifications (1 unread)', exact: true })).toHaveCSS('color', 'rgb(255, 255, 255)')

  await seeker.goto(base() + '/resumes')
  await seeker.getByLabel('Upload resumes (PDF or DOCX, up to 5 MB each)').setInputFiles([{ name: 'alerts.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4\n%%EOF\n') }])
  await seeker.getByRole('button', { name: 'Upload', exact: true }).click()
  await expect(seeker.getByText('Resume uploaded.')).toBeVisible()
  await seeker.goto(`${base()}/jobs/${job.id}/apply`)
  await seeker.getByLabel('Resume', { exact: true }).selectOption({ label: 'alerts.pdf' })
  await seeker.getByRole('button', { name: 'Submit application' }).click()
  await expect(seeker.getByText('You have applied for this job. Status: Applied.')).toBeVisible()

  await page.goto(base() + '/notifications')
  await expect(page.getByText('New application for Notification Engineer.', { exact: true })).toBeVisible()
  await page.getByRole('link', { name: 'View details', exact: true }).click()
  await page.getByLabel('Status for Demo Job Seeker').selectOption('Interview')
  await page.getByRole('button', { name: 'Update status', exact: true }).click()
  await expect(page.getByRole('status')).toHaveText('Status updated to Interview.')

  await seeker.goto(base() + '/notifications')
  const invitation = 'Interview invitation: your application for Notification Engineer is now at Interview. Check the posting and contact the recruiter for details.'
  await expect(seeker.getByText(invitation, { exact: true })).toBeVisible()
  // Saving the same status and refreshing repeatedly creates no duplicates.
  await page.getByRole('button', { name: 'Update status', exact: true }).click()
  await seeker.getByRole('button', { name: 'Refresh', exact: true }).click()
  await expect(seeker.getByRole('listitem')).toHaveCount(2)
  await expect(seeker.getByRole('link', { name: 'Notifications (2 unread)', exact: true })).toBeVisible()
  await seeker.screenshot({ path: testInfo.outputPath('notifications-desktop.png'), fullPage: true })
  await seeker.getByRole('button', { name: `Mark as read: ${invitation}`, exact: true }).click()
  await expect(seeker.getByRole('link', { name: 'Notifications (1 unread)', exact: true })).toBeVisible()
  await seeker.reload()
  await expect(seeker.getByRole('button', { name: `Mark as read: ${invitation}`, exact: true })).toHaveCount(0)
  await seeker.getByRole('button', { name: 'Mark all as read', exact: true }).click()
  await expect(seeker.getByRole('link', { name: 'Notifications (0 unread)', exact: true })).toBeVisible()
  await seeker.setViewportSize({ width: 390, height: 844 })
  await expect.poll(() => seeker.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await seeker.screenshot({ path: testInfo.outputPath('notifications-mobile.png'), fullPage: true })

  // Unread totals and mark-all cover rows beyond the first page.
  const [application] = await (await fetch(api(`applications?job_id=eq.${job.id}`))).json()
  for (let i = 0; i < 22; i++) {
    const response = await fetch(api(`applications?id=eq.${application.id}`), {
      method: 'PATCH', body: JSON.stringify({ status: i % 2 ? 'Rejected' : 'Offered' }),
    })
    expect(response.ok).toBe(true)
  }
  await seeker.getByRole('button', { name: 'Refresh', exact: true }).click()
  await expect(seeker.getByRole('listitem')).toHaveCount(20)
  await expect(seeker.getByRole('link', { name: 'Notifications (22 unread)', exact: true })).toBeVisible()
  await seeker.getByRole('button', { name: 'Load more', exact: true }).click()
  await expect(seeker.getByRole('listitem')).toHaveCount(24)
  await seeker.getByRole('button', { name: 'Mark all as read', exact: true }).click()
  await expect(seeker.getByRole('link', { name: 'Notifications (0 unread)', exact: true })).toBeVisible()

  const otherContext = await browser.newContext()
  const other = await otherContext.newPage()
  await login(other, 'other-seeker@example.test')
  await other.goto(base() + '/notifications')
  await expect(other.getByRole('heading', { name: 'No notifications yet' })).toBeVisible()
  await expect(other.getByText(invitation, { exact: true })).toHaveCount(0)
  await otherContext.close()
  await seekerContext.close()
})

test('notification failures show retry and API rejects signed-out and cross-origin writes', async ({ page, request }) => {
  const unauthorized = await request.post(base() + '/api/notifications', { headers: { Origin: base() }, data: { action: 'refresh' } })
  expect(unauthorized.status()).toBe(401)
  const crossOrigin = await request.post(base() + '/api/notifications', { headers: { Origin: 'https://unrelated.example' }, data: { action: 'read_all' } })
  expect(crossOrigin.status()).toBe(403)
  await login(page, 'other-seeker@example.test')
  await page.route('**/api/notifications', route => route.fulfill({ status: 503, json: { error: 'Notifications are unavailable. Please try again.' } }))
  await page.goto(base() + '/notifications')
  await expect(page.getByRole('main').getByRole('alert')).toHaveText('Notifications are unavailable. Please try again.')
  await page.unroute('**/api/notifications')
  await page.getByRole('button', { name: 'Refresh', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'No notifications yet' })).toBeVisible()
  const invalid = await page.request.post(base() + '/api/notifications', { headers: { Origin: base() }, data: { action: 'read', id: 'invalid' } })
  expect(invalid.status()).toBe(400)
})
