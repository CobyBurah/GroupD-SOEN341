import { test, expect } from '@playwright/test'
import { startPreview } from '../fixtures/recruiter-preview.mjs'

// AT-US20-01..03: archive a posting, keep its applications, restore it.
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
  await expect(page).toHaveURL(base() + (email.includes('recruiter') ? '/recruiter' : '/dashboard'))
}

test('recruiter archives a posting, keeps its applicants, and restores it', async ({ page, browser }, testInfo) => {
  await login(page, 'recruiter@example.test')
  await page.goto(base() + '/recruiter/jobs/new')
  await page.getByLabel('Job title').fill('Archive Engineer')
  await page.getByLabel('Company').fill('Acceptance Co')
  await page.getByLabel('Job description').fill('A posting used to test archiving.')
  await page.getByRole('button', { name: 'Publish posting' }).click()
  await expect(page.getByRole('status')).toHaveText('Posting published.')
  await expect(page.getByText('0 applications received')).toBeVisible()

  // A seeker applies while the posting is open.
  const seekerContext = await browser.newContext()
  const seeker = await seekerContext.newPage()
  await login(seeker, 'jobseeker@example.test')
  await seeker.goto(base() + '/resumes')
  await seeker.getByLabel('Upload resumes (PDF or DOCX, up to 5 MB each)').setInputFiles([{ name: 'archive.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4\n%%EOF\n') }])
  await seeker.getByRole('button', { name: 'Upload', exact: true }).click()
  await expect(seeker.getByText('Resume uploaded.')).toBeVisible()
  const [job] = await (await fetch(api('jobs'))).json()
  const jobUrl = `${base()}/jobs/${job.id}`
  await seeker.goto(jobUrl + '/apply')
  await seeker.getByLabel('Resume', { exact: true }).selectOption({ label: 'archive.pdf' })
  await seeker.getByRole('button', { name: 'Submit application' }).click()
  await expect(seeker.getByText('You have applied for this job. Status: Applied.')).toBeVisible()

  // AT-US20-01: archiving moves the posting to the archived section with its application count.
  await page.goto(base() + '/recruiter')
  await expect(page.getByText('1 application received')).toBeVisible()
  await page.getByRole('button', { name: 'Archive Archive Engineer', exact: true }).click()
  await expect(page.getByRole('status')).toHaveText('Posting archived. It no longer appears in job search or accepts applications.')
  await expect(page.getByRole('heading', { name: 'Archived postings' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'No active postings' })).toBeVisible()
  await expect(page.getByText('Archived · 1 application received')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Edit Archive Engineer', exact: true })).toHaveCount(0)
  await page.screenshot({ path: testInfo.outputPath('recruiter-archived-posting.png'), fullPage: true })

  // AT-US20-02: archived postings leave job search and refuse new applicants,
  // while the existing applicant keeps the job in their history.
  await seeker.goto(base() + '/jobs')
  await expect(seeker.getByRole('heading', { name: 'No jobs posted yet' })).toBeVisible()
  await seeker.goto(base() + '/applications')
  await expect(seeker.getByText('This posting is closed to new applications.')).toBeVisible()

  const otherContext = await browser.newContext()
  const other = await otherContext.newPage()
  await login(other, 'other-seeker@example.test')
  await other.goto(jobUrl)
  await expect(other.getByText('This posting is closed and no longer accepts applications.')).toBeVisible()
  await expect(other.getByRole('link', { name: 'Apply Now' })).toHaveCount(0)
  await other.goto(jobUrl + '/apply')
  await expect(other.getByText('This posting is closed and no longer accepts applications.')).toBeVisible()
  await expect(other.getByRole('button', { name: 'Submit application' })).toHaveCount(0)

  // The recruiter still reviews applicants of the archived posting.
  await page.getByRole('link', { name: 'Applications for Archive Engineer', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Demo Job Seeker' })).toBeVisible()
  await page.getByLabel('Status for Demo Job Seeker').selectOption('Interview')
  await page.getByRole('button', { name: 'Update status', exact: true }).click()
  await expect(page.getByRole('status')).toHaveText('Status updated to Interview.')
  await page.getByRole('link', { name: 'Back to your postings' }).click()

  // AT-US20-03: restoring reopens the posting.
  await page.getByRole('button', { name: 'Restore Archive Engineer', exact: true }).click()
  await expect(page.getByRole('status')).toHaveText('Posting restored to active listings.')
  await expect(page.getByRole('heading', { name: 'Archived postings' })).toHaveCount(0)
  await expect(page.getByRole('link', { name: 'Edit Archive Engineer', exact: true })).toBeVisible()
  await other.goto(base() + '/jobs')
  await expect(other.getByRole('link', { name: /Archive Engineer/ }).first()).toBeVisible()
  await other.goto(jobUrl)
  await expect(other.getByRole('link', { name: 'Apply Now' }).first()).toBeVisible()

  await seekerContext.close()
  await otherContext.close()
})
