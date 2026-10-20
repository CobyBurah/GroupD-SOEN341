import { test, expect } from '@playwright/test'
import { startPreview } from '../fixtures/recruiter-preview.mjs'
let preview
test.beforeAll(async () => { preview = await startPreview() })
test.afterAll(async () => { await preview?.close() })

const pdf = name => ({ name, mimeType: 'application/pdf', buffer: Buffer.from(`%PDF-1.4\n% ${name}\n%%EOF\n`) })
const docx = name => ({ name, mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', buffer: Buffer.concat([Buffer.from([0x50, 0x4b, 0x03, 0x04]), Buffer.from(`fake docx ${name}`)]) })

async function signIn(page, email) {
  const errors = []
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
  page.on('pageerror', error => errors.push(error.message))
  const base = `http://127.0.0.1:${preview.appPort}`
  await page.goto(base + '/login')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill('any-password')
  await page.getByRole('button', { name: 'Log in' }).click()
  await expect(page).toHaveURL(base + '/')
  await page.goto(base + '/resumes')
  await expect(page.getByRole('heading', { name: 'Resumes', level: 1 })).toBeVisible()
  return { base, errors }
}

test('job seeker uploads several resumes at once, renames and deletes them', async ({ page }) => {
  const { base, errors } = await signIn(page, 'jobseeker@example.test')
  const upload = page.getByLabel('Upload resumes (PDF or DOCX, up to 5 MB each)')
  const row = name => page.getByRole('listitem').filter({ has: page.getByRole('link', { name, exact: true }) })
  await expect(upload).toHaveAttribute('multiple', '')

  await upload.setInputFiles([pdf('alpha.pdf'), pdf('beta.pdf'), docx('gamma.docx')])
  await page.getByRole('button', { name: 'Upload', exact: true }).click()
  await expect(page.getByText('Uploaded 3 resumes.')).toBeVisible()
  await expect(page.getByText('3 resumes', { exact: true })).toBeVisible()
  for (const name of ['alpha.pdf', 'beta.pdf', 'gamma.docx']) await expect(page.getByRole('link', { name, exact: true })).toBeVisible()

  await upload.setInputFiles([pdf('delta.pdf')])
  await page.getByRole('button', { name: 'Upload', exact: true }).click()
  await expect(page.getByText('Resume uploaded.')).toBeVisible()
  await expect(page.getByText('4 resumes', { exact: true })).toBeVisible()

  // One bad file rejects the whole batch.
  await upload.setInputFiles([pdf('epsilon.pdf'), { name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('plain text') }])
  await page.getByRole('button', { name: 'Upload', exact: true }).click()
  await expect(page.getByText(/^notes\.txt: /)).toBeVisible()
  await expect(page.getByText('4 resumes', { exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: 'epsilon.pdf', exact: true })).toHaveCount(0)

  await upload.setInputFiles(Array.from({ length: 11 }, (_, i) => pdf(`bulk-${i}.pdf`)))
  await page.getByRole('button', { name: 'Upload', exact: true }).click()
  await expect(page.getByText('You can upload up to 10 resumes at a time.')).toBeVisible()
  await expect(page.getByText('4 resumes', { exact: true })).toBeVisible()

  // The title link serves the stored file through a signed storage URL.
  const href = await page.getByRole('link', { name: 'alpha.pdf', exact: true }).getAttribute('href')
  const file = await page.request.get(base + href)
  expect(file.ok()).toBe(true)
  expect((await file.body()).toString()).toContain('%PDF-1.4\n% alpha.pdf')

  const beta = row('beta.pdf')
  await expect(beta.getByLabel('Resume name')).toHaveValue('beta.pdf')
  // A blank field is stopped by the browser (required); whitespace reaches the server check.
  await beta.getByLabel('Resume name').fill('')
  await beta.getByRole('button', { name: 'Rename' }).click()
  expect(await beta.getByLabel('Resume name').evaluate(input => input.validity.valueMissing)).toBe(true)
  await beta.getByLabel('Resume name').fill('   ')
  await beta.getByRole('button', { name: 'Rename' }).click()
  await expect(beta.getByText('Enter a name for the resume.')).toBeVisible()
  await beta.getByLabel('Resume name').fill('cv/2026')
  await beta.getByRole('button', { name: 'Rename' }).click()
  await expect(beta.getByText('Name cannot contain slashes or control characters.')).toBeVisible()
  await beta.getByLabel('Resume name').fill('Software Engineer CV 2026')
  await beta.getByRole('button', { name: 'Rename' }).click()
  await expect(page.getByText('Resume renamed.')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Software Engineer CV 2026', exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: 'beta.pdf', exact: true })).toHaveCount(0)
  await page.reload()
  await expect(page.getByRole('link', { name: 'Software Engineer CV 2026', exact: true })).toBeVisible()
  await expect(row('Software Engineer CV 2026').getByLabel('Resume name')).toHaveValue('Software Engineer CV 2026')

  page.on('dialog', dialog => dialog.accept())
  await row('gamma.docx').getByRole('button', { name: 'Delete' }).click()
  await expect(page.getByText('3 resumes', { exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: 'gamma.docx', exact: true })).toHaveCount(0)

  expect(errors).toEqual([])
})

test('recruiters cannot manage resumes', async ({ page }) => {
  const { errors } = await signIn(page, 'recruiter@example.test')
  await expect(page.getByText('Only job seekers can manage resumes.')).toBeVisible()
  await expect(page.getByLabel('Upload resumes (PDF or DOCX, up to 5 MB each)')).toHaveCount(0)
  expect(errors).toEqual([])
})
