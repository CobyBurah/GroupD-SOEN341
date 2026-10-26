import { test, expect } from '@playwright/test'
import { startPreview } from '../fixtures/recruiter-preview.mjs'

let preview
test.beforeEach(async () => { preview = await startPreview({ paginateJobs: true }) })
test.afterEach(async () => { await preview?.close() })

async function signIn(page) {
  const base = `http://127.0.0.1:${preview.appPort}`
  await page.goto(base + '/login')
  await page.getByLabel('Email').fill('jobseeker@example.test')
  await page.getByLabel('Password').fill('any-password')
  await page.getByRole('button', { name: 'Log in' }).click()
  await expect(page).toHaveURL(base + '/')
  return base
}

async function seedJob(index, createdAt) {
  const api = `http://127.0.0.1:${preview.apiPort}/rest/v1/jobs`
  const response = await fetch(api, {
    method: 'POST',
    body: JSON.stringify({ recruiter_id: '00000000-0000-0000-0000-000000000001', title: `Pagination Developer ${index}`, company: 'Acme', description: 'Pagination fixture.', location: 'Montreal', category: 'Software', employment_type: 'full_time', workplace_type: 'hybrid' }),
  })
  expect(response.ok).toBe(true)
  const [job] = await response.json()
  // Fixed IDs make the expected tie order independent of generated UUIDs and
  // insertion order. Both are ordinary mutable fields in this local fixture.
  const dated = await fetch(`${api}?id=eq.${job.id}`, {
    method: 'PATCH',
    body: JSON.stringify({ id: `00000000-0000-0000-0000-${String(index + 1).padStart(12, '0')}`, created_at: createdAt }),
  })
  expect(dated.ok).toBe(true)
  return (await dated.json())[0]
}

test('an empty database resolves page 999 to the normal empty listing', async ({ page }) => {
  const base = await signIn(page)
  const response = await page.goto(base + '/jobs?page=999')
  expect(response.status()).toBeLessThan(400)
  await expect(page).toHaveURL(base + '/jobs')
  await expect(page.getByRole('heading', { name: 'No jobs posted yet' })).toBeVisible()
  await expect(page.getByText('0 open roles', { exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'No jobs match your search' })).toHaveCount(0)
  await expect(page.getByRole('navigation', { name: 'Job pages' })).toHaveCount(0)
  await page.reload()
  await expect(page.getByRole('heading', { name: 'No jobs posted yet' })).toBeVisible()
})

test('exactly ten matching jobs fit on page 1 and page 2 returns to them', async ({ page }) => {
  const jobs = []
  for (let index = 0; index < 10; index++) jobs.push(await seedJob(index, new Date(Date.UTC(2026, 0, index + 1)).toISOString()))
  const base = await signIn(page)
  for (const query of ['', 'keyword=Developer&location=Montreal&category=Software&employmentType=full_time&workplaceType=hybrid&filterOrder=category%3ASoftware']) {
    const listing = `${base}/jobs${query ? '?' + query : ''}`
    for (const url of [listing, `${listing}${query ? '&' : '?'}page=2`]) {
      const response = await page.goto(url)
      expect(response.status()).toBeLessThan(400)
      await expect(page).toHaveURL(listing)
      await expect(page.getByRole('listitem').getByRole('heading', { level: 2 })).toHaveText([...jobs].reverse().map(job => job.title))
      await expect(page.getByText('10 open roles', { exact: true })).toBeVisible()
      await expect(page.getByRole('navigation', { name: 'Job pages' })).toHaveCount(0)
      await expect(page.getByRole('heading', { name: /No jobs/ })).toHaveCount(0)
    }
  }
})

test('timestamp ties have stable disjoint pages and preserve newest-first ordering', async ({ page }) => {
  const jobs = []
  for (let position = 0; position < 25; position++) {
    jobs.push(await seedJob((position * 7) % 25, '2026-01-02T00:00:00.000Z'))
  }
  jobs.push(await seedJob(25, '2026-01-03T00:00:00.000Z'))
  jobs.push(await seedJob(26, '2026-01-01T00:00:00.000Z'))
  const expected = [...jobs].sort((a, b) => a.created_at === b.created_at
    ? a.id.localeCompare(b.id)
    : a.created_at > b.created_at ? -1 : 1)
  const base = await signIn(page)
  for (let pass = 0; pass < 2; pass++) {
    const seen = []
    for (const number of [1, 2, 3]) {
      await page.goto(`${base}/jobs?page=${number}`)
      await page.reload()
      await expect(page.getByRole('navigation', { name: 'Job pages' }).getByRole('link', { name: String(number), exact: true })).toHaveAttribute('aria-current', 'page')
      const headings = page.getByRole('listitem').getByRole('heading', { level: 2 })
      await expect(headings).toHaveText(expected.slice((number - 1) * 10, number * 10).map(job => job.title))
      for (const link of await headings.getByRole('link').all()) {
        seen.push(new URL(await link.getAttribute('href'), base).pathname.split('/').at(-1))
      }
    }
    expect(seen).toEqual(expected.map(job => job.id))
    expect(new Set(seen).size).toBe(27)
  }
})
