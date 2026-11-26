import { test, expect } from '@playwright/test'
import { startPreview } from '../fixtures/recruiter-preview.mjs'
let preview
test.beforeAll(async () => { preview = await startPreview({ paginateJobs: true }) })
test.afterAll(async () => { await preview?.close() })
const base = () => `http://127.0.0.1:${preview.appPort}`
const api = path => `http://127.0.0.1:${preview.apiPort}/rest/v1/${path}`
const day = offset => new Date(Date.now() + offset * 86400000).toISOString().slice(0, 10)

async function login(page, email) {
  await page.goto(base() + '/login')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill('any-password')
  await page.getByRole('button', { name: 'Log in', exact: true }).click()
  await expect(page).toHaveURL(base() + (email.includes('recruiter') ? '/recruiter' : '/dashboard'))
}

// Sprint 4 bug fix: application deadlines are enforced end to end.
test('past deadlines are rejected, and expired postings leave listings and stop taking applications', async ({ page, browser }) => {
  await login(page, 'recruiter@example.test')
  await page.goto(base() + '/recruiter/jobs/new')
  await page.getByLabel('Job title').fill('Deadline Analyst')
  await page.getByLabel('Company').fill('Acceptance Co')
  await page.getByLabel('Job description').fill('A posting used to test deadlines.')

  // A deadline in the past is refused and the typed values are kept.
  await page.getByLabel('Application deadline').fill(day(-2))
  await page.getByRole('button', { name: 'Publish posting' }).click()
  await expect(page.getByText('Choose today or a later date, or leave the deadline empty.')).toBeVisible()
  await expect(page.getByLabel('Job title')).toHaveValue('Deadline Analyst')

  // Today is still open.
  await page.getByLabel('Application deadline').fill(day(0))
  await page.getByRole('button', { name: 'Publish posting' }).click()
  await expect(page.getByRole('status')).toHaveText('Posting published.')
  const [job] = await (await fetch(api('jobs'))).json()

  const seeker = await (await browser.newContext()).newPage()
  await login(seeker, 'jobseeker@example.test')
  await seeker.goto(base() + '/jobs?keyword=Deadline')
  await expect(seeker.getByRole('link', { name: 'Deadline Analyst', exact: true })).toBeVisible()

  // The deadline passes (simulated by moving it to yesterday).
  await fetch(api(`jobs?id=eq.${job.id}`), { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ application_deadline: day(-1) }) })
  await seeker.goto(base() + '/jobs?keyword=Deadline')
  await expect(seeker.getByText('No jobs match your search')).toBeVisible()

  await seeker.goto(base() + `/jobs/${job.id}`)
  await expect(seeker.getByText('The application deadline for this posting has passed.')).toBeVisible()
  await expect(seeker.getByRole('link', { name: 'Apply Now' })).toHaveCount(0)
  await seeker.goto(base() + `/jobs/${job.id}/apply`)
  await expect(seeker.getByText('The application deadline for this posting has passed.')).toBeVisible()
  await expect(seeker.getByRole('button', { name: 'Submit application' })).toHaveCount(0)
})
