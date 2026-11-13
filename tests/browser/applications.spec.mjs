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

test('job seeker tracks application status and history, filters and withdraws', async ({ page, browser }, testInfo) => {
  const frontend = await postJob({ title: 'Frontend Developer', company: 'Acme', employment_type: 'full_time' })
  const intern = await postJob({ title: 'Data Intern', company: 'Globex', employment_type: 'internship' })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  const base = await signIn(page, 'jobseeker@example.test')
  const card = title => page.getByRole('listitem').filter({ has: page.getByRole('link', { name: title, exact: true }) })

  await page.getByRole('link', { name: 'My applications' }).click()
  await expect(page.getByRole('heading', { name: 'My applications', level: 1 })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'My activity' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Applications over time' })).toHaveCount(0)
  await expect(page.getByLabel('Total application: 0')).toBeVisible()
  await expect(page.getByLabel('Applications this week: 0')).toBeVisible()
  await expect(page.getByLabel('Applications this month: 0')).toBeVisible()
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
  await expect(page.locator('main > header').getByText('2 applications', { exact: true })).toBeVisible()
  await expect(page.getByLabel('Total applications: 2')).toBeVisible()
  await expect(page.getByLabel('Applications this week: 2')).toBeVisible()
  await expect(page.getByLabel('Applications this month: 2')).toBeVisible()
  const activityChart = page.getByRole('list', { name: /^Applications submitted per / })
  await expect(page.getByLabel('Activity time period')).toHaveValue('7d')
  await expect(activityChart).toHaveAccessibleName('Applications submitted per day')
  await expect(activityChart.getByRole('listitem')).toHaveCount(7)
  await expect(page.getByRole('region', { name: 'My activity' }).locator('time')).toHaveCount(7)

  await page.getByLabel('Activity time period').selectOption('3m')
  await expect(activityChart).toHaveAccessibleName('Applications submitted per week')
  expect(await activityChart.getByRole('listitem').count()).toBeGreaterThanOrEqual(9)
  const monthlyTicks = page.getByRole('region', { name: 'My activity' }).locator('time')
  await expect(monthlyTicks).toHaveCount(3)
  for (const tick of await monthlyTicks.all()) {
    expect(new Date(await tick.getAttribute('datetime')).getUTCDate()).toBe(1)
  }
  await page.reload()
  await expect(page.getByLabel('Activity time period')).toHaveValue('3m')
  await expect(activityChart).toHaveAccessibleName('Applications submitted per week')
  await expect(monthlyTicks).toHaveCount(3)
  // The saved range must already be in the server HTML, before hydration.
  const serverContext = await browser.newContext({ javaScriptEnabled: false, storageState: await page.context().storageState() })
  try {
    const serverPage = await serverContext.newPage()
    await serverPage.goto(base + '/applications')
    await expect(serverPage.getByLabel('Activity time period')).toHaveValue('3m')
    await expect(serverPage.locator('[aria-label="Applications submitted per week"]')).toHaveCount(1)
    await expect(serverPage.locator('[aria-label="Applications submitted per day"]')).toHaveCount(0)
  } finally {
    await serverContext.close()
  }
  await testInfo.attach('activity-three-months', { body: await page.getByRole('region', { name: 'My activity' }).screenshot(), contentType: 'image/png' })

  await page.getByLabel('Activity time period').selectOption('12m')
  await expect(activityChart).toHaveAccessibleName('Applications submitted per month')
  await expect(activityChart.getByRole('listitem')).toHaveCount(12)
  await page.reload()
  await expect(page.getByLabel('Activity time period')).toHaveValue('12m')
  await expect(activityChart.getByRole('listitem')).toHaveCount(12)
  expect(await page.getByRole('region', { name: 'My activity' }).locator('time').count()).toBeGreaterThanOrEqual(3)

  await page.getByLabel('Activity time period').selectOption('30d')
  await expect(activityChart.getByRole('listitem')).toHaveCount(30)

  const activity = page.getByRole('region', { name: 'My activity' })
  const zeroPeriod = activityChart.getByRole('listitem', { name: /: 0 applications$/ }).first()
  await expect(zeroPeriod.locator('[style*=height]')).toHaveCSS('height', '0px')
  await zeroPeriod.hover()
  await expect(zeroPeriod.locator('strong')).toHaveCount(0)
  await expect(zeroPeriod).not.toHaveAttribute('tabindex')

  // The sidebar stacks above results at tablet widths, with no clipped content.
  for (const width of [1280, 1024, 980, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 })
    const bounds = await activity.boundingBox()
    expect(bounds.x).toBeGreaterThanOrEqual(0)
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(width)
    expect(await activity.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true)
    const results = await page.getByRole('navigation', { name: 'Filter by status' }).boundingBox()
    if (width <= 1100) expect(bounds.y + bounds.height).toBeLessThanOrEqual(results.y)
    else expect(bounds.x).toBeGreaterThan(results.x + results.width)

    // Read all positions together: ResizeObserver can update label density
    // between separate locator reads when switching responsive layouts.
    await expect.poll(() => activity.evaluate(section => {
      const bars = [...section.querySelectorAll('[role=listitem]')]
      return Math.max(...[...section.querySelectorAll('time')].map(time => {
        const dateLabel = new Date(time.dateTime).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
        const bar = bars.find(element => element.getAttribute('aria-label').startsWith(`${dateLabel}: `))
        if (!bar) return Infinity
        const bounds = bar.getBoundingClientRect()
        return Math.abs(time.getBoundingClientRect().x - (bounds.x + bounds.width / 2))
      }))
    })).toBeLessThan(1)

    const metric = page.getByLabel('Total applications: 2')
    const metricBounds = await metric.boundingBox()
    for (const metricLabel of ['Applications this week: 2', 'Applications this month: 2']) {
      const otherBounds = await page.getByLabel(metricLabel).boundingBox()
      expect(Math.abs(otherBounds.width - metricBounds.width)).toBeLessThan(1)
      expect(Math.abs(otherBounds.height - metricBounds.height)).toBeLessThan(1)
      expect(Math.abs(otherBounds.y - metricBounds.y)).toBeLessThan(1)
    }
    const value = await metric.locator('dd').boundingBox()
    const label = await metric.locator('dt').boundingBox()
    expect(value.y + value.height).toBeLessThanOrEqual(label.y)
    expect(Math.abs((value.x + value.width / 2) - (label.x + label.width / 2))).toBeLessThan(1)

    await page.getByLabel('Activity time period').selectOption('7d')
    await expect(activity.locator('time')).toHaveCount(7)
    for (const text of await activity.locator('time span').allTextContents()) expect(text).toMatch(/^[MTWFS]$/)
    let previousLabelRight = bounds.x
    for (const time of await activity.locator('time').all()) {
      const labelBounds = await time.locator('span').boundingBox()
      expect(labelBounds.x).toBeGreaterThanOrEqual(previousLabelRight)
      expect(labelBounds.x + labelBounds.width).toBeLessThanOrEqual(bounds.x + bounds.width)
      previousLabelRight = labelBounds.x + labelBounds.width
    }
    if (width === 1280 || width === 390) {
      await testInfo.attach(`activity-seven-days-${width}px`, { body: await activity.screenshot(), contentType: 'image/png' })
    }
    await page.getByLabel('Activity time period').selectOption('30d')

    for (const item of [activityChart.getByRole('listitem', { name: /: 2 applications$/ })]) {
      await item.focus()
      const tooltip = item.locator('[aria-hidden=true]').first()
      await expect(tooltip).toBeVisible()
      const tooltipBounds = await tooltip.boundingBox()
      const barBounds = await item.boundingBox()
      expect(tooltipBounds.y).toBeGreaterThanOrEqual(barBounds.y)
      expect(tooltipBounds.y + tooltipBounds.height).toBeLessThanOrEqual(barBounds.y + barBounds.height)
      expect(tooltipBounds.x).toBeGreaterThanOrEqual(bounds.x)
      expect(tooltipBounds.x + tooltipBounds.width).toBeLessThanOrEqual(bounds.x + bounds.width)
      await item.press('Tab')
      await item.dispatchEvent('pointerdown', { pointerType: 'touch' })
      await expect(tooltip).toBeVisible()
      await item.press('Tab')
    }
    if (width === 1280 || width === 390) {
      await testInfo.attach(`activity-${width}px`, { body: await activity.screenshot(), contentType: 'image/png' })
    }
  }
  await page.setViewportSize({ width: 1280, height: 900 })
  await expect(card('Frontend Developer').getByText('Applied', { exact: true }).first()).toBeVisible()
  await expect(card('Frontend Developer').getByRole('link', { name: 'cv.pdf' })).toBeVisible()

  // Both entry points remember that the job was opened from applications.
  for (const entry of ['View job', 'Frontend Developer']) {
    await card('Frontend Developer').getByRole('link', { name: entry, exact: entry !== 'View job' }).click()
    await expect(page.getByRole('link', { name: 'Back to My applications' })).toHaveAttribute('href', '/applications')
    await expect(page.getByRole('status')).toHaveText('You have applied for this job. Status: Applied.')
    await expect(page.getByRole('link', { name: 'Apply Now' })).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'View my applications', exact: true })).toHaveCount(2)
    for (const link of await page.getByRole('link', { name: 'View my applications', exact: true }).all()) {
      await expect(link).toHaveAttribute('href', '/applications')
    }
    await page.reload()
    await page.getByRole('link', { name: 'Back to My applications' }).click()
    await expect(page).toHaveURL(base + '/applications')
  }

  // Applied state comes from the signed-in user's record, even on a direct URL.
  await page.goto(`${base}/jobs/${frontend.id}`)
  await expect(page.getByRole('link', { name: 'Back to Jobs' })).toHaveAttribute('href', '/jobs')
  await expect(page.getByRole('link', { name: 'Apply Now' })).toHaveCount(0)
  await expect(page.getByRole('status')).toHaveText('You have applied for this job. Status: Applied.')
  await page.getByRole('link', { name: 'View my applications', exact: true }).first().click()
  await expect(page).toHaveURL(base + '/applications')

  await setStatus(frontend.id, 'Interview')
  await page.reload()
  await expect(card('Frontend Developer').getByText('Interview', { exact: true }).first()).toBeVisible()
  await card('Frontend Developer').getByText('View history').click()
  await expect(card('Frontend Developer').getByRole('list', { name: 'Status history' }).getByRole('listitem')).toHaveText([/^Applied/, /^Interview/])

  await page.getByRole('link', { name: 'Interview (1)' }).click()
  await expect(page).toHaveURL(base + '/applications?status=Interview')
  await expect(card('Frontend Developer')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Data Intern', exact: true })).toHaveCount(0)
  await expect(page.getByLabel('Total applications: 2')).toBeVisible()
  for (const entry of ['View job', 'Frontend Developer']) {
    await card('Frontend Developer').getByRole('link', { name: entry, exact: entry !== 'View job' }).click()
    await expect(page.getByRole('heading', { name: 'Frontend Developer', level: 1 })).toBeVisible()
    expect(new URL(page.url()).searchParams.get('returnTo')).toBe('/applications?status=Interview')
    await expect(page.getByRole('status')).toHaveText('You have applied for this job. Status: Interview.')
    await expect(page.getByRole('link', { name: 'Apply Now' })).toHaveCount(0)
    await page.reload()
    await expect(page.getByRole('link', { name: 'Back to My applications' })).toHaveAttribute('href', '/applications?status=Interview')
    await page.getByRole('link', { name: 'Back to My applications' }).click()
    await expect(page).toHaveURL(base + '/applications?status=Interview')
    await expect(page.getByRole('link', { name: 'Data Intern', exact: true })).toHaveCount(0)
  }
  await page.goto(`${base}/jobs/${frontend.id}/apply?returnTo=${encodeURIComponent('/applications?status=Interview')}`)
  await expect(page.getByRole('link', { name: 'Back to My applications' })).toHaveAttribute('href', '/applications?status=Interview')
  await expect(page.getByRole('button', { name: 'Submit application' })).toHaveCount(0)
  await page.getByRole('link', { name: 'Back to My applications' }).click()
  await page.getByRole('link', { name: 'Offered (0)' }).click()
  await expect(page.getByRole('heading', { name: 'No applications with status Offered' })).toBeVisible()

  await page.getByRole('link', { name: 'All (2)' }).click()
  // Visit this details route before withdrawal to exercise cache invalidation.
  await card('Data Intern').getByRole('link', { name: 'View job' }).click()
  await expect(page.getByRole('link', { name: 'Apply Now' })).toHaveCount(0)
  await page.getByRole('link', { name: 'Back to My applications' }).click()
  page.once('dialog', dialog => dialog.accept())
  await page.getByRole('button', { name: 'Withdraw application for Data Intern' }).click()
  await expect(page.locator('main > header').getByText('1 application', { exact: true })).toBeVisible()
  await expect(page.getByLabel('Total application: 1')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Data Intern', exact: true })).toHaveCount(0)

  // Withdrawing lets the seeker apply again.
  await page.goto(`${base}/jobs/${intern.id}?returnTo=${encodeURIComponent('/applications')}`)
  await expect(page.getByRole('link', { name: 'Apply Now' })).toHaveCount(2)
  await page.getByRole('link', { name: 'Apply Now' }).first().click()
  await expect(page.getByRole('link', { name: 'Back to My applications' })).toHaveAttribute('href', '/applications')
  await expect(page.getByRole('button', { name: 'Submit application' })).toBeVisible()

  // Ignore preferences from removed options rather than indexing a missing chart.
  await page.context().addCookies([{ name: 'cc-application-activity-range', value: 'all', domain: '127.0.0.1', path: '/applications' }])
  await page.goto(base + '/applications')
  await expect(page.getByLabel('Activity time period')).toHaveValue('7d')
  await expect(activityChart.getByRole('listitem')).toHaveCount(7)

  // A blocked preference cookie must not prevent changing the current chart.
  await page.evaluate(() => {
    const cookie = document.cookie
    Object.defineProperty(document, 'cookie', {
      configurable: true,
      get: () => cookie,
      set: () => { throw new DOMException('Cookies blocked', 'SecurityError') },
    })
  })
  await page.getByLabel('Activity time period').selectOption('3m')
  await expect(page.getByLabel('Activity time period')).toHaveValue('3m')
  await expect(activityChart).toHaveAccessibleName('Applications submitted per week')
  expect(errors).toEqual([])
})

test('recruiters do not get the applications page', async ({ page }) => {
  const base = await signIn(page, 'recruiter@example.test')
  await expect(page.getByRole('link', { name: 'My applications' })).toHaveCount(0)
  await page.goto(base + '/applications')
  await expect(page.getByText('Only job seekers can apply to jobs.')).toBeVisible()
})
