import { test, expect } from '@playwright/test'
import { startPreview } from '../fixtures/recruiter-preview.mjs'

let preview
test.beforeEach(async () => { preview = await startPreview({ paginateJobs: true }) })
test.afterEach(async () => { await preview?.close() })

async function postJob(fields, index = 0) {
  const api = `http://127.0.0.1:${preview.apiPort}/rest/v1/jobs`
  const response = await fetch(api, {
    method: 'POST',
    body: JSON.stringify({ recruiter_id: '00000000-0000-0000-0000-000000000001', company: 'Acme', description: 'Synthetic search fixture.', category: 'Software', employment_type: 'contract', workplace_type: 'hybrid', location: 'Montreal', ...fields }),
  })
  expect(response.ok).toBe(true)
  const [job] = await response.json()
  const dated = await fetch(`${api}?id=eq.${job.id}`, {
    method: 'PATCH',
    body: JSON.stringify({ created_at: new Date(Date.UTC(2026, 0, index + 1)).toISOString(), ...(fields.archived_at && { archived_at: fields.archived_at }), ...(fields.deleted_at && { deleted_at: fields.deleted_at }) }),
  })
  expect(dated.ok).toBe(true)
  return job
}

async function signIn(page) {
  const base = `http://127.0.0.1:${preview.appPort}`
  await page.goto(base + '/login')
  await page.getByLabel('Email').fill('jobseeker@example.test')
  await page.getByLabel('Password').fill('any-password')
  await page.getByRole('button', { name: 'Log in', exact: true }).click()
  await expect(page).toHaveURL(base + '/dashboard')
  return base
}

const titles = page => page.getByRole('main').getByRole('listitem').getByRole('heading', { level: 2 })

async function search(page, keyword, expected) {
  await page.getByRole('textbox', { name: 'Search Jobs', exact: true }).fill(keyword)
  await page.getByRole('button', { name: 'Search', exact: true }).click()
  await expect(page).toHaveURL(url => url.pathname === '/jobs' && url.searchParams.get('keyword') === keyword && !url.searchParams.has('page'))
  await expect(titles(page)).toHaveText(expected)
}

test('search treats whitespace and reserved characters as literal text through the form', async ({ page }) => {
  const fixtures = [
    ['developer', 'Developer'], ['senior', 'Senior Developer'],
    ['percent', '100% Guaranteed Engineer'], ['percent-decoy', '1000 Guaranteed Engineer'],
    ['underscore', 'data_engineer'], ['underscore-decoy', 'dataXengineer'],
    ['backslash', 'C:\\tools\\ Engineer'], ['backslash-decoy', 'C:tools Engineer'],
    ['comma', 'Research, Development'], ['comma-decoy', 'Research Development'],
    ['parentheses', 'Engineer (Platform)'], ['parentheses-decoy', 'Engineer Platform'],
    ['single', "O'Reilly Engineer"], ['double', '"Quoted" Engineer'],
    ['escape-quote', 'Slash \\" Engineer'], ['injection', 'x",company.ilike.%,title.ilike."'],
  ]
  for (let index = 0; index < fixtures.length; index++) await postJob({ title: fixtures[index][1] }, index)
  const base = await signIn(page)
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('response', response => { if (response.status() >= 500) errors.push(`${response.status()} ${response.url()}`) })
  await page.goto(base + '/jobs')
  for (const [keyword, ids] of [
    ['  developer  ', ['developer', 'senior']], ['  Senior   Developer  ', ['senior']],
    ['%', ['percent', 'injection']], ['data_', ['underscore']], ['_', ['underscore']],
    ['\\', ['backslash', 'escape-quote']], ['C:\\tools\\', ['backslash']],
    ['Research, Development', ['comma']], ['(Platform)', ['parentheses']],
    ["O'Reilly", ['single']], ['"Quoted"', ['double']], ['\\"', ['escape-quote']],
    ['x",company.ilike.%,title.ilike."', ['injection']], ['dEvElOpEr', ['developer', 'senior']],
  ]) {
    await search(page, keyword, fixtures.filter(([id]) => ids.includes(id)).reverse().map(([, title]) => title))
    await expect(page.locator('main > header').getByText(`${ids.length} ${ids.length === 1 ? 'open role' : 'open roles'}`, { exact: true })).toBeVisible()
  }
  await search(page, '   ', fixtures.slice(-10).reverse().map(([, title]) => title))
  await expect(page.locator('main > header').getByText('16 open roles', { exact: true })).toBeVisible()
  expect(errors).toEqual([])
})

test('ordinary field searches, employment names and workplace variants still work', async ({ page }) => {
  const fixtures = [
    { title: 'Backend Engineer', company: 'Northstar Labs', category: 'Software', location: 'Quebec', workplace_type: 'remote', employment_type: 'full_time' },
    { title: 'Designer', company: 'Acme', category: 'Design', location: 'Montreal', workplace_type: 'onsite', employment_type: 'part_time' },
    { title: 'Analyst', company: 'Acme', category: 'Finance', location: 'Toronto', workplace_type: 'hybrid', employment_type: 'contract' },
  ]
  for (let index = 0; index < fixtures.length; index++) await postJob(fixtures[index], index)
  const base = await signIn(page)
  await page.goto(base + '/jobs')
  for (const [keyword, expected] of [
    ['backend', 'Backend Engineer'], ['Northstar', 'Backend Engineer'], ['Design', 'Designer'],
    ['Toronto', 'Analyst'], ['  full   time  ', 'Backend Engineer'], ['part time', 'Designer'],
    ['REMOTE', 'Backend Engineer'], ['Hybrid', 'Analyst'], ['On-site', 'Designer'], ['on   site', 'Designer'],
  ]) await search(page, keyword, [expected])
  await search(page, 'time', ['Designer', 'Backend Engineer'])
})

test('multi-word keywords match partial words in any order and across visible fields', async ({ page }) => {
  const developer = await postJob({ title: 'QA-S4 Junior TypeScript Developer (edited)', company: 'Northstar Labs', location: 'Montreal, Quebec, Canada', employment_type: 'full_time', workplace_type: 'onsite' })
  await postJob({ title: 'Junior Designer', company: 'Northstar Labs', employment_type: 'full_time', workplace_type: 'onsite' }, 1)
  await postJob({ title: 'Developer', company: 'Elsewhere', workplace_type: 'remote' }, 2)
  const base = await signIn(page)
  await page.goto(base + '/jobs')
  for (const keyword of ['jun dev', 'dev jun', 'script north', 'queb dev', 'dev full time', 'dev on site', 'dev onsite']) {
    await search(page, keyword, [developer.title])
  }
  for (const keyword of ['jun absent', 'jun remote', 'jun _', 'jun %', 'jun \\', 'jun *']) await search(page, keyword, [])
  const literal = await postJob({ title: 'Junior Developer _ % \\ *', company: 'Literal Symbols' }, 3)
  for (const keyword of ['jun _', '% dev', '\\ dev', '* dev']) await search(page, keyword, [literal.title])
})

test('location suggestions and submitted searches support normalized, reordered location prefixes', async ({ page }) => {
  const jobs = []
  for (const [index, location] of ['East Montreal, Canada', 'Montreal, Quebec, Canada', 'New York, USA', 'NewYork, USA', 'Ammontreal, Canada'].entries()) {
    jobs.push(await postJob({ title: 'Developer ' + index, location }, index))
  }
  const base = await signIn(page)
  const params = new URLSearchParams({ keyword: 'dev', category: 'Software', employmentType: 'contract', workplaceType: 'hybrid' })
  await page.goto(`${base}/jobs?${params}`)
  const input = page.getByRole('textbox', { name: 'Location', exact: true })
  await input.fill('mont')
  await expect(page.getByRole('button', { name: jobs[1].location, exact: true })).toBeVisible()
  const suggestionLabels = await page.locator('button').filter({ hasText: /Montreal|Ammontreal/ }).allTextContents()
  expect(suggestionLabels).toEqual([jobs[1].location, jobs[4].location, jobs[0].location])
  for (const [location, expected, suggested] of [
    ['  New   York ', [jobs[2].title], [jobs[2].location]],
    ['can mont', [jobs[1].title, jobs[0].title], [jobs[0].location, jobs[1].location]],
    ['mont que', [jobs[1].title], [jobs[1].location]],
  ]) {
    await input.fill(location)
    for (const label of suggested) await expect(page.getByRole('button', { name: label, exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: jobs[3].location, exact: true })).toHaveCount(0)
    await page.getByRole('button', { name: 'Search', exact: true }).click()
    await expect(page).toHaveURL(url => url.searchParams.get('location') === location)
    await expect(titles(page)).toHaveText(expected)
  }
  await input.fill('can mont')
  await expect(page.getByRole('button', { name: jobs[4].location, exact: true })).toHaveCount(0)
  await page.getByRole('button', { name: jobs[1].location, exact: true }).click()
  await expect(page).toHaveURL(url => url.searchParams.get('location') === jobs[1].location)
  await expect(titles(page)).toHaveText([jobs[1].title])
  for (const [key, value] of params) expect(new URL(page.url()).searchParams.get(key)).toBe(value)
})

test('multi-term keyword and location matching preserve filters, counts, pagination and return navigation', async ({ page }) => {
  const fields = { company: 'Northstar Labs', location: 'Montreal, Quebec, Canada', employment_type: 'full_time', workplace_type: 'remote' }
  const jobs = []
  for (let index = 0; index < 25; index++) jobs.push(await postJob({ ...fields, title: 'Junior TypeScript Developer ' + index }, index))
  for (const [index, decoy] of [
    { title: 'Junior Designer' }, { company: 'Elsewhere' }, { location: 'Montreal, USA' },
    { category: 'Marketing' }, { employment_type: 'part_time' }, { workplace_type: 'onsite' },
    { archived_at: '2026-01-01T00:00:00Z' }, { deleted_at: '2026-01-01T00:00:00Z' },
  ].entries()) await postJob({ ...fields, title: 'Junior TypeScript Developer decoy', ...decoy }, 30 + index)
  const base = await signIn(page)
  const params = new URLSearchParams({ keyword: ' north  dev remote ', location: ' can mont ', category: 'Software', employmentType: 'full_time', workplaceType: 'remote' })
  await page.goto(`${base}/jobs?${params}`)
  const expected = [...jobs].reverse()
  await expect(titles(page)).toHaveText(expected.slice(0, 10).map(job => job.title))
  await expect(page.locator('main > header').getByText('25 open roles', { exact: true })).toBeVisible()
  const nav = page.getByRole('navigation', { name: 'Job pages' })
  for (const [number, start, end] of [['2', 10, 20], ['3', 20, 25]]) {
    await nav.getByRole('link', { name: number, exact: true }).click()
    await expect(titles(page)).toHaveText(expected.slice(start, end).map(job => job.title))
    await page.reload()
    await expect(titles(page)).toHaveText(expected.slice(start, end).map(job => job.title))
  }
  const listing = page.url()
  await page.getByRole('link', { name: /View Details/ }).first().click()
  await page.getByRole('link', { name: /Back to jobs/i }).click()
  await expect(page).toHaveURL(listing)
  await expect(titles(page)).toHaveText(expected.slice(20).map(job => job.title))
  const invalid = new URL(listing)
  invalid.searchParams.set('page', '999')
  await page.goto(invalid.href)
  await expect(titles(page)).toHaveText(expected.slice(0, 10).map(job => job.title))
  expect(new URL(page.url()).searchParams.has('page')).toBe(false)
  for (const [key, value] of params) expect(new URL(page.url()).searchParams.get(key)).toBe(value)
})

test('literal search combines filters and preserves pagination, reload and return navigation', async ({ page }) => {
  const jobs = []
  for (let index = 0; index < 25; index++) {
    jobs.push(await postJob({ title: `Paged 100% Engineer ${index + 1}`, employment_type: 'full_time' }, index))
  }
  for (const fields of [
    { title: 'Paged 1000 Engineer', employment_type: 'full_time' },
    { category: 'Marketing' }, { location: 'Toronto' }, { employment_type: 'contract' }, { workplace_type: 'remote' },
    { archived_at: '2026-01-01T00:00:00Z' }, { deleted_at: '2026-01-01T00:00:00Z' },
  ]) await postJob({ title: 'Paged 100% Decoy', employment_type: 'full_time', ...fields }, 30)
  const base = await signIn(page)
  const query = new URLSearchParams({ keyword: 'Paged', location: 'Montreal', category: 'Software', employmentType: 'full_time', workplaceType: 'hybrid', page: '2' })
  await page.goto(`${base}/jobs?${query}`)
  const keyword = '  Paged   100%  '
  const expected = [...jobs].reverse()
  await search(page, keyword, expected.slice(0, 10).map(job => job.title))
  const listingState = new URL(page.url()).searchParams
  for (const [key, value] of [['location', 'Montreal'], ['category', 'Software'], ['employmentType', 'full_time'], ['workplaceType', 'hybrid']]) {
    expect(listingState.get(key)).toBe(value)
  }
  await expect(page.locator('main > header').getByText('25 open roles', { exact: true })).toBeVisible()
  const nav = page.getByRole('navigation', { name: 'Job pages' })
  await nav.getByRole('link', { name: '2', exact: true }).click()
  await expect(titles(page)).toHaveText(expected.slice(10, 20).map(job => job.title))
  await page.reload()
  await expect(nav.getByRole('link', { name: '2', exact: true })).toHaveAttribute('aria-current', 'page')
  await expect(titles(page)).toHaveText(expected.slice(10, 20).map(job => job.title))
  await nav.getByRole('link', { name: '3', exact: true }).click()
  await expect(titles(page)).toHaveText(expected.slice(20).map(job => job.title))
  const listing = new URL(page.url())
  await page.getByRole('listitem').filter({ has: page.getByRole('link', { name: expected[20].title, exact: true }) }).getByRole('link', { name: /View Details/ }).click()
  const back = page.getByRole('link', { name: /Back to jobs/i })
  expect(new URL(await back.getAttribute('href'), base).searchParams.toString()).toBe(listing.searchParams.toString())
  await back.click()
  await expect(titles(page)).toHaveText(expected.slice(20).map(job => job.title))
  listing.searchParams.set('page', '999')
  await page.goto(listing.href)
  await expect(titles(page)).toHaveText(expected.slice(0, 10).map(job => job.title))
  expect(new URL(page.url()).searchParams.has('page')).toBe(false)
  expect(new URL(page.url()).searchParams.get('keyword')).toBe(keyword)
})

test('location input normalizes whitespace and treats special characters literally', async ({ page }) => {
  const locations = ['New York', 'NewYork', 'Sector 100%', 'Sector 1000', 'Zone_A', 'ZoneXA', 'C:\\Sites', 'C:Sites', 'O\'Reilly, ("East")', 'District *', 'District X']
  const jobs = []
  for (let index = 0; index < locations.length; index++) jobs.push(await postJob({ title: 'Location result ' + index, location: locations[index] }, index))
  const base = await signIn(page)
  await page.goto(base + '/jobs')
  for (const [input, index] of [['  New York  ', 0], ['New   York', 0], ['%', 2], ['_', 4], ['\\', 6], ['O\'Reilly, ("East")', 8], ['*', 9]]) {
    await page.getByRole('textbox', { name: 'Location', exact: true }).fill(input)
    await page.getByRole('button', { name: 'Search', exact: true }).click()
    await expect(page).toHaveURL(url => url.pathname === '/jobs' && url.searchParams.get('location') === input)
    await expect(titles(page)).toHaveText([jobs[index].title])
    await expect(page.locator('main > header').getByText('1 open role', { exact: true })).toBeVisible()
  }
  await page.getByRole('textbox', { name: 'Location', exact: true }).fill('   ')
  await page.getByRole('button', { name: 'Search', exact: true }).click()
  await expect(titles(page)).toHaveText(jobs.slice(-10).reverse().map(job => job.title))
  await expect(page.locator('main > header').getByText('11 open roles', { exact: true })).toBeVisible()
})

for (const symbol of ['_', '%', '\\']) {
  test('symbol-only keyword ' + symbol + ' excludes the QA-S4 job until visible text contains that symbol', async ({ page }) => {
    const qa = await postJob({ title: 'QA-S4 Junior TypeScript Developer (edited)', employment_type: 'full_time', workplace_type: 'onsite' })
    const base = await signIn(page)
    await page.goto(base + '/jobs')
    const card = page.getByRole('listitem').filter({ has: page.getByRole('link', { name: qa.title, exact: true }) })
    await expect(card.getByText('Full Time', { exact: true })).toBeVisible()
    await expect(card.getByText('full_time', { exact: true })).toHaveCount(0)
    await search(page, symbol, [])
    await expect(page.getByRole('heading', { name: 'No jobs match your search' })).toBeVisible()
    await expect(page.locator('main > header').getByText('0 open roles', { exact: true })).toBeVisible()
    const literal = await postJob({ title: 'Literal ' + symbol + ' marker' }, 1)
    await search(page, symbol, [literal.title])
    await expect(page.locator('main > header').getByText('1 open role', { exact: true })).toBeVisible()
    await expect(page.getByRole('link', { name: qa.title, exact: true })).toHaveCount(0)
    await page.reload()
    await expect(titles(page)).toHaveText([literal.title])
    await search(page, 'full time', [qa.title])
    await search(page, 'on site', [qa.title])
  })
}

test('repeated keyword parameters use the first value without breaking reload or details navigation', async ({ page }) => {
  const developer = await postJob({ title: 'Developer' }, 0)
  const designer = await postJob({ title: 'Designer' }, 1)
  const base = await signIn(page)
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  for (const [first, second, expected] of [
    ['  developer  ', 'designer', [developer.title]],
    ['designer', 'developer', [designer.title]],
    ['', 'designer', [designer.title, developer.title]],
  ]) {
    const query = new URLSearchParams()
    query.append('keyword', first)
    query.append('keyword', second)
    query.set('page', '999')
    const response = await page.goto(base + '/jobs?' + query)
    expect(response.status()).toBe(200)
    await expect(titles(page)).toHaveText(expected)
    expect(new URL(page.url()).searchParams.has('page')).toBe(false)
    await expect(page.getByRole('textbox', { name: 'Search Jobs', exact: true })).toHaveValue(first)
    await page.reload()
    await expect(titles(page)).toHaveText(expected)
    await page.getByRole('listitem').first().getByRole('link', { name: /View Details/ }).click()
    const back = page.getByRole('link', { name: /Back to jobs/i })
    expect(new URL(await back.getAttribute('href'), base).searchParams.getAll('keyword')).toEqual([first, second])
    await back.click()
    await expect(titles(page)).toHaveText(expected)
  }
  expect(errors).toEqual([])
})

test('literal asterisks keep regex punctuation, filters and pagination safe', async ({ page }) => {
  const jobs = []
  for (let index = 0; index < 25; index++) jobs.push(await postJob({ title: 'Paged * Engineer ' + index, employment_type: 'full_time' }, index))
  await postJob({ title: 'Paged X Engineer', employment_type: 'full_time' }, 26)
  await postJob({ title: 'Paged * Engineer marketing', employment_type: 'full_time', category: 'Marketing' }, 27)
  const metaTitle = 'Meta [x].+?^$(){}|\\*" 100%_'
  const metaLocation = 'District [east].+?^$(){}|\\*" 100%_'
  await postJob({ title: metaTitle, location: metaLocation }, 28)
  const base = await signIn(page)
  const query = new URLSearchParams({ location: '  Montreal  ', category: 'Software', employmentType: 'full_time', workplaceType: 'hybrid' })
  await page.goto(base + '/jobs?' + query)
  const expected = [...jobs].reverse()
  await search(page, '  Paged *   Engineer ', expected.slice(0, 10).map(job => job.title))
  await expect(page.locator('main > header').getByText('25 open roles', { exact: true })).toBeVisible()
  const nav = page.getByRole('navigation', { name: 'Job pages' })
  await nav.getByRole('link', { name: '2', exact: true }).click()
  await expect(titles(page)).toHaveText(expected.slice(10, 20).map(job => job.title))
  await page.reload()
  await expect(titles(page)).toHaveText(expected.slice(10, 20).map(job => job.title))
  await nav.getByRole('link', { name: '3', exact: true }).click()
  await expect(titles(page)).toHaveText(expected.slice(20).map(job => job.title))
  await page.goto(base + '/jobs')
  await search(page, metaTitle.toLowerCase(), [metaTitle])
  await page.goto(base + '/jobs')
  await page.getByRole('textbox', { name: 'Location', exact: true }).fill(metaLocation.toLowerCase())
  await search(page, '', [metaTitle])
})
