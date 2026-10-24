import { test, expect } from '@playwright/test'
import { startPreview } from '../fixtures/recruiter-preview.mjs'
let preview
test.beforeAll(async () => { preview = await startPreview() })
test.afterAll(async () => { await preview?.close() })

const api = path => `http://127.0.0.1:${preview.apiPort}/rest/v1/${path}`

async function postJob(fields) {
  const response = await fetch(api('jobs'), { method: 'POST', body: JSON.stringify({ recruiter_id: '00000000-0000-0000-0000-000000000001', description: 'Synthetic posting.', ...fields }) })
  expect(response.ok).toBe(true)
  return (await response.json())[0]
}

// Requests without a token act as the demo recruiter, who owns the posted jobs.
async function setStatus(jobId, status) {
  const [application] = await (await fetch(api(`applications?job_id=eq.${jobId}`))).json()
  const response = await fetch(api(`applications?id=eq.${application.id}&job_id=eq.${jobId}`), { method: 'PATCH', body: JSON.stringify({ status }) })
  expect(response.ok).toBe(true)
}

async function signIn(page, email) {
  const base = `http://127.0.0.1:${preview.appPort}`
  await page.goto(base + '/login')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill('any-password')
  await page.getByRole('button', { name: 'Log in' }).click()
  await expect(page).toHaveURL(base + '/')
  return base
}

test('job seeker tracks application status and history, filters and withdraws', async ({ page }) => {
  const frontend = await postJob({ title: 'Frontend Developer', company: 'Acme', employment_type: 'full_time' })
  const intern = await postJob({ title: 'Data Intern', company: 'Globex', employment_type: 'internship' })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  const base = await signIn(page, 'jobseeker@example.test')
  const card = title => page.getByRole('listitem').filter({ has: page.getByRole('link', { name: title, exact: true }) })

  await page.getByRole('link', { name: 'My applications' }).click()
  await expect(page.getByRole('heading', { name: 'My applications', level: 1 })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'No applications yet' })).toBeVisible()

  await page.goto(base + '/resumes')
  await page.getByLabel('Upload resumes (PDF or DOCX, up to 5 MB each)').setInputFiles([{ name: 'cv.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4\n%%EOF\n') }])
  await page.getByRole('button', { name: 'Upload', exact: true }).click()
  await expect(page.getByText('Resume uploaded.')).toBeVisible()

  for (const job of [frontend, intern]) {
    await page.goto(`${base}/jobs/${job.id}/apply`)
    await page.getByLabel('Resume').selectOption({ label: 'cv.pdf' })
    await page.getByRole('button', { name: 'Submit application' }).click()
    await expect(page.getByText('You have applied for this job. Status: Applied.')).toBeVisible()
  }

  await page.goto(base + '/applications')
  await expect(page.getByText('2 applications', { exact: true })).toBeVisible()
  await expect(card('Frontend Developer').getByText('Applied', { exact: true }).first()).toBeVisible()
  await expect(card('Frontend Developer').getByRole('link', { name: 'cv.pdf' })).toBeVisible()

  await setStatus(frontend.id, 'Interview')
  await page.reload()
  await expect(card('Frontend Developer').getByText('Interview', { exact: true }).first()).toBeVisible()
  await card('Frontend Developer').getByText('View history').click()
  await expect(card('Frontend Developer').getByRole('list', { name: 'Status history' }).getByRole('listitem')).toHaveText([/^Applied/, /^Interview/])

  await page.getByRole('link', { name: 'Interview (1)' }).click()
  await expect(page).toHaveURL(base + '/applications?status=Interview')
  await expect(card('Frontend Developer')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Data Intern', exact: true })).toHaveCount(0)
  await page.getByRole('link', { name: 'Offered (0)' }).click()
  await expect(page.getByRole('heading', { name: 'No applications with status Offered' })).toBeVisible()

  await page.getByRole('link', { name: 'All (2)' }).click()
  page.once('dialog', dialog => dialog.accept())
  await page.getByRole('button', { name: 'Withdraw application for Data Intern' }).click()
  await expect(page.getByText('1 application', { exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Data Intern', exact: true })).toHaveCount(0)
  // Withdrawing lets the seeker apply again.
  await page.goto(`${base}/jobs/${intern.id}/apply`)
  await expect(page.getByRole('button', { name: 'Submit application' })).toBeVisible()
  expect(errors).toEqual([])
})

test('recruiters do not get the applications page', async ({ page }) => {
  const base = await signIn(page, 'recruiter@example.test')
  await expect(page.getByRole('link', { name: 'My applications' })).toHaveCount(0)
  await page.goto(base + '/applications')
  await expect(page.getByText('Only job seekers can apply to jobs.')).toBeVisible()
})
