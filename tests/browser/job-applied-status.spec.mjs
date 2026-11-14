import { test, expect } from '@playwright/test'
import { startPreview } from '../fixtures/recruiter-preview.mjs'

let preview
test.beforeEach(async () => { preview = await startPreview({ paginateJobs: true }) })
test.afterEach(async () => { await preview?.close() })

const api = path => `http://127.0.0.1:${preview.apiPort}/rest/v1/${path}`

async function postJob(index) {
  const response = await fetch(api('jobs'), {
    method: 'POST',
    body: JSON.stringify({
      recruiter_id: '00000000-0000-0000-0000-000000000001',
      title: `Applied Status Developer ${index + 1}`, company: 'Acme', description: 'Synthetic posting.',
      location: 'Montreal', category: 'Software', employment_type: 'full_time', workplace_type: 'hybrid',
    }),
  })
  expect(response.ok).toBe(true)
  const [job] = await response.json()
  const dated = await fetch(api(`jobs?id=eq.${job.id}`), {
    method: 'PATCH', body: JSON.stringify({ created_at: new Date(Date.UTC(2026, 0, index + 1)).toISOString() }),
  })
  expect(dated.ok).toBe(true)
  return job
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

const cardFor = (page, job) => page.getByRole('listitem').filter({ has: page.getByRole('link', { name: job.title, exact: true }) })

test('listing reflects applying and withdrawing while preserving details, favourites and filtered pagination', async ({ page, browser }) => {
  const jobs = []
  for (let index = 0; index < 12; index++) jobs.push(await postJob(index))
  const [job, unapplied] = jobs
  const base = await signIn(page, 'jobseeker@example.test')
  await page.goto(base + '/resumes')
  await page.getByLabel('Upload resumes (PDF or DOCX, up to 5 MB each)').setInputFiles({
    name: 'applied-status.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4\n%%EOF\n'),
  })
  await page.getByRole('button', { name: 'Upload', exact: true }).click()
  await expect(page.getByText('Resume uploaded.')).toBeVisible()

  const listing = '/jobs?keyword=Developer&location=Montreal&category=Software&employmentType=full_time&workplaceType=hybrid&page=2'
  await page.goto(base + listing)
  const card = cardFor(page, job)
  await expect(card.getByText('Applied', { exact: true })).toHaveCount(0)
  const apply = card.getByRole('link', { name: `Apply for ${job.title}`, exact: true })
  await expect(apply).toBeVisible()
  expect(new URL(await apply.getAttribute('href'), base).searchParams.get('returnTo')).toBe(listing)
  await apply.click()
  await page.getByLabel('Resume', { exact: true }).selectOption({ label: 'applied-status.pdf' })
  await page.getByRole('button', { name: 'Submit application' }).click()
  await expect(page.getByText('You have applied for this job. Status: Applied.')).toBeVisible()
  await page.getByRole('link', { name: /Back to jobs/i }).click()
  await expect(page).toHaveURL(base + listing)

  const indicator = card.getByText('Applied', { exact: true })
  await expect(indicator).toBeVisible()
  expect(await indicator.evaluate(element => element.closest('a, button') === null && element.tabIndex === -1)).toBe(true)
  await expect(apply).toHaveCount(0)
  await expect(cardFor(page, unapplied).getByRole('link', { name: `Apply for ${unapplied.title}`, exact: true })).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Job pages' }).getByRole('link', { name: '2', exact: true })).toHaveAttribute('aria-current', 'page')

  // A later application status still produces only the simple Applied indicator.
  const updated = await fetch(api(`applications?job_id=eq.${job.id}`), { method: 'PATCH', body: JSON.stringify({ status: 'Interview' }) })
  expect(updated.ok).toBe(true)
  await page.reload()
  await expect(indicator).toBeVisible()
  await expect(card.getByText('Interview', { exact: true })).toHaveCount(0)

  await card.getByRole('button', { name: `Add ${job.title} to favourites`, exact: true }).click()
  await expect(card.getByRole('button', { name: `Remove ${job.title} from favourites`, exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(indicator).toBeVisible()
  for (const entry of [/View Details/, job.title]) {
    await card.getByRole('link', { name: entry, exact: typeof entry === 'string' }).click()
    await expect(page.getByRole('heading', { name: job.title, exact: true })).toBeVisible()
    await expect(page.getByRole('status')).toHaveText('You have applied for this job. Status: Interview.')
    await expect(page.getByRole('link', { name: 'Back to Jobs' })).toHaveAttribute('href', listing)
    await page.getByRole('link', { name: 'Back to Jobs' }).click()
    await expect(page).toHaveURL(base + listing)
    await expect(indicator).toBeVisible()
  }
  await card.getByRole('button', { name: `Remove ${job.title} from favourites`, exact: true }).click()
  await expect(card.getByRole('button', { name: `Add ${job.title} to favourites`, exact: true })).toHaveAttribute('aria-pressed', 'false')
  await expect(indicator).toBeVisible()

  // The same job is unapplied for a different signed-in seeker.
  const otherContext = await browser.newContext()
  try {
    const otherPage = await otherContext.newPage()
    await signIn(otherPage, 'other-seeker@example.test')
    await otherPage.goto(base + listing)
    const otherCard = cardFor(otherPage, job)
    await expect(otherCard.getByRole('link', { name: `Apply for ${job.title}`, exact: true })).toBeVisible()
    await expect(otherCard.getByText('Applied', { exact: true })).toHaveCount(0)
  } finally {
    await otherContext.close()
  }

  // Reach the cached listing via client navigation after withdrawing.
  await page.getByRole('link', { name: 'My applications', exact: true }).click()
  const application = cardFor(page, job)
  await expect(application.getByText('Interview', { exact: true }).first()).toBeVisible()
  page.once('dialog', dialog => dialog.accept())
  await application.getByRole('button', { name: `Withdraw application for ${job.title}`, exact: true }).click()
  await expect(page.getByRole('heading', { name: 'No applications yet' })).toBeVisible()
  await page.goBack()
  await expect(page).toHaveURL(base + listing)
  await expect(apply).toBeVisible()
  await expect(indicator).toHaveCount(0)
  await page.reload()
  await expect(apply).toBeVisible()
  await expect(indicator).toHaveCount(0)
})

test('favourites shows Applied after submitting and restores Apply after withdrawing', async ({ page }) => {
  const job = await postJob(0)
  const unapplied = await postJob(1)
  const base = await signIn(page, 'jobseeker@example.test')
  await page.goto(base + '/resumes')
  await page.getByLabel('Upload resumes (PDF or DOCX, up to 5 MB each)').setInputFiles({
    name: 'favourites-status.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4\n%%EOF\n'),
  })
  await page.getByRole('button', { name: 'Upload', exact: true }).click()
  await expect(page.getByText('Resume uploaded.')).toBeVisible()
  await page.goto(base + '/jobs')
  for (const posting of [job, unapplied]) {
    await cardFor(page, posting).getByRole('button', { name: `Add ${posting.title} to favourites`, exact: true }).click()
    await expect(cardFor(page, posting).getByRole('button', { name: `Remove ${posting.title} from favourites`, exact: true })).toHaveAttribute('aria-pressed', 'true')
  }

  await page.getByRole('link', { name: 'Favourites', exact: true }).click()
  const card = cardFor(page, job)
  const apply = card.getByRole('link', { name: `Apply for ${job.title}`, exact: true })
  const indicator = card.getByText('Applied', { exact: true })
  await expect(apply).toBeVisible()
  await expect(indicator).toHaveCount(0)
  await apply.click()
  await page.getByLabel('Resume', { exact: true }).selectOption({ label: 'favourites-status.pdf' })
  await page.getByRole('button', { name: 'Submit application' }).click()
  await expect(page.getByText('You have applied for this job. Status: Applied.')).toBeVisible()
  await page.getByRole('link', { name: '← Back to Favourites', exact: true }).click()
  await expect(page).toHaveURL(base + '/favourites')
  await expect(indicator).toBeVisible()
  expect(await indicator.evaluate(element => element.closest('a, button') === null && element.tabIndex === -1)).toBe(true)
  await expect(apply).toHaveCount(0)
  await expect(cardFor(page, unapplied).getByRole('link', { name: `Apply for ${unapplied.title}`, exact: true })).toBeVisible()
  await page.reload()
  await expect(indicator).toBeVisible()

  const updated = await fetch(api(`applications?job_id=eq.${job.id}`), { method: 'PATCH', body: JSON.stringify({ status: 'Interview' }) })
  expect(updated.ok).toBe(true)
  await page.reload()
  await expect(indicator).toBeVisible()
  await expect(card.getByText('Interview', { exact: true })).toHaveCount(0)
  for (const entry of [/View Details/, job.title]) {
    await card.getByRole('link', { name: entry, exact: typeof entry === 'string' }).click()
    await expect(page.getByRole('heading', { name: job.title, exact: true })).toBeVisible()
    await expect(page.getByRole('link', { name: '← Back to Favourites', exact: true })).toHaveAttribute('href', '/favourites')
    await page.getByRole('link', { name: '← Back to Favourites', exact: true }).click()
    await expect(indicator).toBeVisible()
  }

  await page.getByRole('link', { name: 'My applications', exact: true }).click()
  page.once('dialog', dialog => dialog.accept())
  await cardFor(page, job).getByRole('button', { name: `Withdraw application for ${job.title}`, exact: true }).click()
  await expect(page.getByRole('heading', { name: 'No applications yet' })).toBeVisible()
  await page.goBack()
  await expect(page).toHaveURL(base + '/favourites')
  await expect(apply).toBeVisible()
  await expect(indicator).toHaveCount(0)
  await page.reload()
  await expect(apply).toBeVisible()
  await card.getByRole('button', { name: `Remove ${job.title} from favourites`, exact: true }).click()
  await expect(card).toHaveCount(0)
  await expect(cardFor(page, unapplied)).toBeVisible()
})

test('recruiter listing keeps its existing details action without seeker controls', async ({ page }) => {
  const job = await postJob(0)
  const base = await signIn(page, 'recruiter@example.test')
  await page.goto(base + '/jobs')
  const card = cardFor(page, job)
  await expect(card.getByRole('link', { name: /View Details/ })).toBeVisible()
  await expect(card.getByRole('link', { name: /^Apply for / })).toHaveCount(0)
  await expect(card.getByText('Applied', { exact: true })).toHaveCount(0)
  await expect(card.getByRole('button', { name: /favourites/ })).toHaveCount(0)
  await card.getByRole('link', { name: /View Details/ }).click()
  await expect(page.getByRole('heading', { name: job.title, exact: true })).toBeVisible()
})
