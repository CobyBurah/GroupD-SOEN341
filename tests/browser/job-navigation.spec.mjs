import { test, expect } from '@playwright/test'
import { startPreview } from '../fixtures/recruiter-preview.mjs'

let preview, job
const seededJobs = []
test.beforeAll(async () => {
  preview = await startPreview({ paginateJobs: true })
  const api = `http://127.0.0.1:${preview.apiPort}/rest/v1/jobs`
  // All 25 jobs match both listing URLs. Insert out of timestamp order so the
  // test also fails if the fixture ignores the requested newest-first ordering.
  for (let position = 0; position < 25; position++) {
    const index = (position * 7) % 25
    const response = await fetch(api, {
      method: 'POST',
      body: JSON.stringify({ recruiter_id: '00000000-0000-0000-0000-000000000001', title: `Navigation Developer C++ & 100% ${index + 1}`, company: 'Acme', description: 'Synthetic posting.', location: 'Montreal, Québec', category: 'Software', employment_type: 'full_time', workplace_type: 'hybrid' }),
    })
    expect(response.ok).toBe(true)
    const created = (await response.json())[0]
    const dated = await fetch(`${api}?id=eq.${created.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ created_at: new Date(Date.UTC(2026, 0, index + 1)).toISOString() }),
    })
    expect(dated.ok).toBe(true)
    seededJobs[index] = created
  }
  // The oldest job is deterministically the last result on page 3.
  job = seededJobs[0]
})
test.afterAll(async () => { await preview?.close() })

async function signIn(page) {
  const base = `http://127.0.0.1:${preview.appPort}`
  await page.goto(base + '/login')
  await page.getByLabel('Email').fill('jobseeker@example.test')
  await page.getByLabel('Password').fill('any-password')
  await page.getByRole('button', { name: 'Log in' }).click()
  await expect(page).toHaveURL(base + '/')
  return base
}

const filteredQuery = 'keyword=Developer&location=Montreal&category=Software&category=Marketing&employmentType=full_time&workplaceType=hybrid&filterOrder=category%3ASoftware'
const specialQuery = 'keyword=Developer+C%2B%2B+%26+100%25&location=Montreal%2C+Qu%C3%A9bec&category=Software&category=Marketing&employmentType=full_time&workplaceType=hybrid&filterOrder=category%3ASoftware&filterOrder=category%3AMarketing'

for (const listing of ['/jobs?page=2', '/jobs?page=3', `/jobs?${filteredQuery}&page=2`, `/jobs?${filteredQuery}&page=3`, `/jobs?${specialQuery}&page=3`]) {
  test(`listing links and details-to-apply preserve ${listing}`, async ({ page }) => {
    const pageNumber = Number(new URL(listing, 'http://localhost').searchParams.get('page'))
    const expectedJobs = [...seededJobs].reverse().slice((pageNumber - 1) * 10, pageNumber * 10)
    const job = expectedJobs.at(-1)
    const base = await signIn(page)
    const firstPage = new URL(listing, base)
    firstPage.searchParams.delete('page')
    await page.goto(firstPage.href)
    await expect(page.getByRole('listitem').getByRole('heading', { level: 2 })).toHaveText(seededJobs.slice(15).reverse().map(job => job.title))
    await expect(page.getByRole('link', { name: job.title, exact: true })).toHaveCount(0)
    await expect(page.getByRole('navigation', { name: 'Job pages' }).getByRole('link', { name: '1', exact: true })).toHaveAttribute('aria-current', 'page')
    await page.goto(base + listing)
    await page.reload()
    // Give the filter effect time to run after hydration (its debounce is 150 ms).
    await expect(page.getByRole('link', { name: job.title, exact: true })).toBeVisible()
    await page.waitForTimeout(350)
    await expect(page).toHaveURL(base + listing)
    const expectListingPage = async () => {
      await expect(page.getByRole('listitem').getByRole('heading', { level: 2 })).toHaveText(expectedJobs.map(job => job.title))
      await expect(page.getByRole('navigation', { name: 'Job pages' }).getByRole('link', { name: String(pageNumber), exact: true })).toHaveAttribute('aria-current', 'page')
      await expect(page.getByText('25 open roles', { exact: true })).toBeVisible()
    }
    await expectListingPage()
    // Inspect every card's title, View Details and Apply destinations.
    for (const link of await page.getByRole('listitem').getByRole('link').all()) {
      expect(new URL(await link.getAttribute('href'), base).searchParams.get('returnTo')).toBe(listing)
    }

    for (const route of ['details', 'apply', 'details-apply', 'title']) {
      const card = page.getByRole('listitem').filter({ has: page.getByRole('link', { name: job.title, exact: true }) })
      if (route === 'apply') {
        await card.getByRole('link', { name: `Apply for ${job.title}`, exact: true }).click()
      } else {
        await card.getByRole('link', { name: route === 'title' ? job.title : /View Details/, exact: route === 'title' }).click()
        await expect(page.getByRole('link', { name: 'Back to Jobs' })).toHaveAttribute('href', listing)
        await expect(page.getByRole('link', { name: 'Apply Now' })).toHaveCount(2)
        for (const link of await page.getByRole('link', { name: 'Apply Now' }).all()) {
          expect(new URL(await link.getAttribute('href'), base).searchParams.get('returnTo')).toBe(listing)
        }
        if (route === 'details-apply') await page.getByRole('link', { name: 'Apply Now' }).last().click()
      }
      await expect(page.getByRole('link', { name: /Back to jobs/i })).toHaveAttribute('href', listing)
      if (route === 'apply' || route === 'details-apply') {
        await expect(page).toHaveURL(new RegExp(`/jobs/${job.id}/apply\\?`))
      }
      await page.reload()
      await page.getByRole('link', { name: /Back to jobs/i }).click()
      await expect(page.getByRole('link', { name: job.title, exact: true })).toBeVisible()
      await page.waitForTimeout(350)
      await expect(page).toHaveURL(base + listing)
      await expectListingPage()
    }
  })
}

test('direct details/apply links and unsafe return URLs fall back to jobs', async ({ page }) => {
  const base = await signIn(page)
  for (const suffix of ['', '/apply']) {
    for (const query of ['', '?returnTo=https%3A%2F%2Fexample.com', '?returnTo=%2F%2Fexample.com', '?returnTo=%2Fjobs%2F..%2Flogin', '?returnTo=javascript%3Aalert(1)', '?returnTo=%252Fjobs%253Fpage%253D3', '?returnTo=%2Fjobs%3Fpage%3D3&returnTo=https%3A%2F%2Fexample.com']) {
      await page.goto(`${base}/jobs/${job.id}${suffix}${query}`)
      await expect(page.getByRole('link', { name: /Back to jobs/i })).toHaveAttribute('href', '/jobs')
      if (!suffix) {
        for (const link of await page.getByRole('link', { name: 'Apply Now' }).all()) {
          expect(new URL(await link.getAttribute('href'), base).searchParams.get('returnTo')).toBe('/jobs')
        }
      }
    }
  }
})

test('pagination links, deep links, reloads and search/filter resets preserve issue 108 behavior', async ({ page }) => {
  const base = await signIn(page)
  const nav = page.getByRole('navigation', { name: 'Job pages' })
  const expectPage = async number => {
    await expect(nav.getByRole('link', { name: String(number), exact: true })).toHaveAttribute('aria-current', 'page')
    await expect(page.getByRole('listitem').getByRole('heading', { level: 2 })).toHaveText([...seededJobs].reverse().slice((number - 1) * 10, number * 10).map(job => job.title))
  }
  // Existing pagination intentionally fills in missing active-filter order keys.
  const completeFilterQuery = `${filteredQuery}&filterOrder=category%3AMarketing&filterOrder=workplaceType%3Ahybrid&filterOrder=employmentType%3Afull_time`
  for (const query of ['', completeFilterQuery]) {
    const url = number => `${base}/jobs?${query ? query + '&' : ''}page=${number}`
    await page.goto(url(2))
    await expectPage(2)
    await page.reload()
    await expectPage(2)
    await page.waitForTimeout(350)
    await expect(page).toHaveURL(url(2))
    await nav.getByRole('link', { name: /Next/ }).click()
    await expectPage(3)
    await expect(page).toHaveURL(url(3))
    await page.reload()
    await expectPage(3)
    await page.waitForTimeout(350)
    await expect(page).toHaveURL(url(3))
    await nav.getByRole('link', { name: /Previous/ }).click()
    await expectPage(2)
    await nav.getByRole('link', { name: '1', exact: true }).click()
    await expectPage(1)
    await nav.getByRole('link', { name: '3', exact: true }).click()
    await expectPage(3)
  }
  await page.getByRole('textbox', { name: 'Search Jobs', exact: true }).fill('Navigation')
  await page.getByRole('button', { name: 'Search', exact: true }).click()
  await expectPage(1)
  expect(new URL(page.url()).searchParams.has('page')).toBe(false)
  for (const filter of ['Software', 'Full time', 'Hybrid']) {
    await page.goto(`${base}/jobs?${filteredQuery.replace('&category=Marketing', '')}&page=3`)
    await expectPage(3)
    await page.getByRole('checkbox', { name: filter, exact: true }).uncheck()
    await expectPage(1)
    expect(new URL(page.url()).searchParams.has('page')).toBe(false)
  }
  await page.goto(`${base}/jobs?page=3`)
  await page.getByRole('textbox', { name: 'Location', exact: true }).fill('Montreal')
  await page.getByRole('button', { name: 'Search', exact: true }).click()
  await expectPage(1)
  expect(new URL(page.url()).searchParams.has('page')).toBe(false)
})

test('space encoding preserves decoded listing state without double-encoding', async ({ page }) => {
  const base = await signIn(page)
  const listing = `/jobs?${specialQuery.replaceAll('+', '%20')}&page=3`
  const listingState = value => {
    const url = new URL(value, base)
    return {
      origin: url.origin,
      pathname: url.pathname,
      hash: url.hash,
      query: Object.fromEntries([...new Set(url.searchParams.keys())].sort().map(key => [key, url.searchParams.getAll(key)])),
    }
  }
  const expected = {
    origin: base,
    pathname: '/jobs',
    hash: '',
    query: {
      page: ['3'],
      keyword: ['Developer C++ & 100%'],
      location: ['Montreal, Qu\u00e9bec'],
      category: ['Software', 'Marketing'],
      employmentType: ['full_time'],
      workplaceType: ['hybrid'],
      filterOrder: ['category:Software', 'category:Marketing'],
    },
  }
  expect(listingState(listing)).toEqual(expected)
  await page.goto(base + listing)
  await page.getByRole('listitem').filter({ has: page.getByRole('link', { name: job.title, exact: true }) }).getByRole('link', { name: /View Details/ }).click()
  const back = page.getByRole('link', { name: /Back to jobs/i })
  await expect(back).toBeVisible()
  const href = await back.getAttribute('href')
  await back.click()
  await expect(page.getByRole('link', { name: job.title, exact: true })).toBeVisible()
  // URLSearchParams decodes once. Compare every key and all repeated values,
  // retaining their order, so double-encoding or missing values still fail.
  expect(listingState(href)).toEqual(expected)
  expect(listingState(page.url())).toEqual(expected)
})

test('invalid and out-of-range pages safely show page 1 and retain search/filter state', async ({ page }) => {
  const base = await signIn(page)
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  for (const query of ['', filteredQuery]) {
    for (const value of ['0', '-2', 'invalid', '1.5', '4', '999', '3323232432423', '999999999999999999999999999999999999', '1e309']) {
      const url = `${base}/jobs?${query ? query + '&' : ''}page=${value}`
      const response = await page.goto(url)
      expect(response.status()).toBeLessThan(400)
      await expect(page.getByRole('listitem').getByRole('heading', { level: 2 })).toHaveText([...seededJobs].reverse().slice(0, 10).map(job => job.title))
      await expect(page.getByRole('navigation', { name: 'Job pages' }).getByRole('link', { name: '1', exact: true })).toHaveAttribute('aria-current', 'page')
      await expect(page.getByRole('heading', { name: 'No jobs posted yet' })).toHaveCount(0)
      const actual = new URL(page.url())
      const expected = new URL(url)
      // Invalid syntax continues defaulting to page 1; positive out-of-range
      // values redirect to a listing URL with page removed.
      if (Number.isInteger(Number(value)) && Number(value) > 1) {
        expect(actual.searchParams.has('page')).toBe(false)
      }
      actual.searchParams.delete('page')
      expected.searchParams.delete('page')
      expect([...actual.searchParams]).toEqual([...expected.searchParams])
    }
  }
  // This search matches exactly one of the 25 jobs: pagination must use the
  // filtered count, rather than the unfiltered three-page total.
  const narrowQuery = filteredQuery.replace('keyword=Developer', 'keyword=Navigation+Developer+C%2B%2B+%26+100%25+25')
  await page.goto(`${base}/jobs?${narrowQuery}&page=2`)
  await expect(page).toHaveURL(`${base}/jobs?${narrowQuery}`)
  await expect(page.getByRole('listitem').getByRole('heading', { level: 2 })).toHaveText([seededJobs[24].title])
  await expect(page.getByText('1 open role', { exact: true })).toBeVisible()
  await page.reload()
  await expect(page).toHaveURL(`${base}/jobs?${narrowQuery}`)
  // returnTo must now refer to the corrected listing, not the rejected page.
  await page.getByRole('listitem').getByRole('link', { name: /View Details/ }).click()
  await expect(page.getByRole('link', { name: /Back to jobs/i })).toHaveAttribute('href', `/jobs?${narrowQuery}`)
  await page.getByRole('link', { name: /Back to jobs/i }).click()
  await expect(page).toHaveURL(`${base}/jobs?${narrowQuery}`)
  await page.goto(`${base}/jobs?keyword=NoSuchNavigationJob&page=999`)
  await expect(page).toHaveURL(`${base}/jobs?keyword=NoSuchNavigationJob`)
  await expect(page.getByRole('heading', { name: 'No jobs match your search' })).toBeVisible()
  expect(errors).toEqual([])
})
