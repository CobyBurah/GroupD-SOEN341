import { test, expect } from '@playwright/test'
import { startPreview } from '../fixtures/recruiter-preview.mjs'
let preview
test.beforeAll(async () => { preview = await startPreview() })
test.afterAll(async () => { await preview?.close() })

async function postJob(fields) {
  const response = await fetch(`http://127.0.0.1:${preview.apiPort}/rest/v1/jobs`, { method: 'POST', body: JSON.stringify({ recruiter_id: '00000000-0000-0000-0000-000000000001', description: 'Synthetic posting.', ...fields }) })
  expect(response.ok).toBe(true)
}

test('job seeker saves jobs to favourites and removes them', async ({ page }) => {
  await postJob({ title: 'Frontend Developer', company: 'Acme', location: 'Montreal', employment_type: 'full_time' })
  await postJob({ title: 'Data Intern', company: 'Globex', employment_type: 'internship' })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  const base = `http://127.0.0.1:${preview.appPort}`

  await page.goto(base + '/login')
  await page.getByLabel('Email').fill('jobseeker@example.test')
  await page.getByLabel('Password').fill('any-password')
  await page.getByRole('button', { name: 'Log in' }).click()
  await expect(page).toHaveURL(base + '/')

  await page.getByRole('link', { name: 'Favourites' }).click()
  await expect(page.getByRole('heading', { name: 'Favourites', level: 1 })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'No favourites yet' })).toBeVisible()

  await page.goto(base + '/jobs')
  const save = page.getByRole('button', { name: 'Add Frontend Developer to favourites' })
  await expect(save).toHaveAttribute('aria-pressed', 'false')
  await save.click()
  const saved = page.getByRole('button', { name: 'Remove Frontend Developer from favourites' })
  await expect(saved).toHaveAttribute('aria-pressed', 'true')
  await page.reload()
  await expect(saved).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('button', { name: 'Add Data Intern to favourites' })).toHaveAttribute('aria-pressed', 'false')

  await page.goto(base + '/favourites')
  await expect(page.getByText('1 saved job', { exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Frontend Developer', exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Data Intern', exact: true })).toHaveCount(0)

  await page.getByRole('button', { name: 'Remove Frontend Developer from favourites' }).click()
  await expect(page.getByRole('heading', { name: 'No favourites yet' })).toBeVisible()
  await page.goto(base + '/jobs')
  await expect(page.getByRole('button', { name: 'Add Frontend Developer to favourites' })).toHaveAttribute('aria-pressed', 'false')
  expect(errors).toEqual([])
})

test('recruiters do not get favourites', async ({ page }) => {
  const base = `http://127.0.0.1:${preview.appPort}`
  await page.goto(base + '/login')
  await page.getByLabel('Email').fill('recruiter@example.test')
  await page.getByLabel('Password').fill('any-password')
  await page.getByRole('button', { name: 'Log in' }).click()
  await expect(page).toHaveURL(base + '/')
  await expect(page.getByRole('link', { name: 'Favourites' })).toHaveCount(0)
  await page.goto(base + '/favourites')
  await expect(page.getByText('Only job seekers can save favourite jobs.')).toBeVisible()
})
