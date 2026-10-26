import { test, expect } from '@playwright/test'
import { startPreview } from '../fixtures/recruiter-preview.mjs'

let preview
test.beforeAll(async () => { preview = await startPreview() })
test.afterAll(async () => { await preview?.close() })

// Small, readable PDFs with a real cross-reference table, not header-only mocks.
function pdf(name, text) {
  const stream = `BT /F1 12 Tf 30 100 Td (${text}) Tj ET\n`
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 150] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}endstream`,
  ]
  let content = '%PDF-1.4\n'
  const offsets = []
  objects.forEach((object, index) => { offsets.push(Buffer.byteLength(content)); content += `${index + 1} 0 obj\n${object}\nendobj\n` })
  const xref = Buffer.byteLength(content)
  content += `xref\n0 6\n0000000000 65535 f \n${offsets.map(offset => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`
  return { name, mimeType: 'application/pdf', buffer: Buffer.from(content) }
}

test('submitted versions remain unchanged across rename, replacement and deletion, with private recruiter review', async ({ browser }) => {
  test.setTimeout(90000)
  const base = `http://127.0.0.1:${preview.appPort}`
  const contexts = []
  async function login(email) {
    const context = await browser.newContext()
    contexts.push(context)
    const page = await context.newPage()
    await page.goto(base + '/login')
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Password').fill('local-test-password')
    await page.getByRole('button', { name: 'Log in' }).click()
    await expect(page).toHaveURL(base + '/')
    return page
  }
  async function job(title) {
    const response = await fetch(`http://127.0.0.1:${preview.apiPort}/rest/v1/jobs`, {
      method: 'POST', body: JSON.stringify({ recruiter_id: '00000000-0000-0000-0000-000000000001', title, company: 'Version Test', description: 'Dedicated application fixture.' }),
    })
    expect(response.ok).toBe(true)
    return (await response.json())[0]
  }
  async function apply(page, posting, resumeName) {
    await page.goto(`${base}/jobs/${posting.id}/apply`)
    await page.getByLabel('Resume', { exact: true }).selectOption({ label: resumeName })
    await page.getByRole('button', { name: 'Submit application' }).click()
    await expect(page.getByText('You have applied for this job. Status: Applied.')).toBeVisible()
  }
  async function assertFile(page, href, expected) {
    const response = await page.request.get(base + href)
    expect(response.ok()).toBe(true)
    expect(await response.body()).toEqual(expected.buffer)
  }
  try {
    const first = await job('Original resume application')
    const second = await job('Replacement resume application')
    const original = pdf('original.pdf', 'ORIGINAL SUBMITTED RESUME')
    const replacement = pdf('replacement.pdf', 'REPLACEMENT FOR FUTURE APPLICATIONS')
    const seeker = await login('jobseeker@example.test')
    const recruiter = await login('recruiter@example.test')

    await seeker.goto(base + '/resumes')
    await seeker.getByLabel('Upload resumes (PDF or DOCX, up to 5 MB each)').setInputFiles(original)
    await seeker.getByRole('button', { name: 'Upload', exact: true }).click()
    await expect(seeker.getByText('Resume uploaded.')).toBeVisible()
    await apply(seeker, first, 'original.pdf')
    await seeker.goto(base + '/applications')
    const originalHref = await seeker.getByRole('link', { name: 'original.pdf', exact: true }).getAttribute('href')
    expect(originalHref).toMatch(/^\/applications\/[0-9a-f-]+\/resume$/)

    await seeker.goto(base + '/resumes')
    await seeker.getByLabel('Resume name').fill('New display name')
    await seeker.getByRole('button', { name: 'Rename', exact: true }).click()
    await expect(seeker.getByText('Resume renamed.')).toBeVisible()
    await seeker.getByLabel('Replace file').setInputFiles(replacement)
    await seeker.getByRole('button', { name: 'Replace', exact: true }).click()
    await expect(seeker.getByText('Resume replaced.')).toBeVisible()
    await apply(seeker, second, 'replacement.pdf')
    await seeker.goto(base + '/applications')
    await expect(seeker.getByRole('link', { name: 'original.pdf', exact: true })).toBeVisible()
    const replacementHref = await seeker.getByRole('link', { name: 'replacement.pdf', exact: true }).getAttribute('href')
    await assertFile(seeker, originalHref, original)
    await assertFile(seeker, replacementHref, replacement)

    await seeker.goto(base + '/resumes')
    seeker.once('dialog', dialog => dialog.accept())
    await seeker.getByRole('button', { name: 'Delete', exact: true }).click()
    await expect(seeker.getByText('No resumes uploaded yet.')).toBeVisible()
    await assertFile(seeker, originalHref, original)
    await assertFile(seeker, replacementHref, replacement)

    await recruiter.goto(`${base}/recruiter/jobs/${first.id}/applications`)
    await expect(recruiter.getByRole('heading', { name: 'Demo Job Seeker' })).toBeVisible()
    await expect(recruiter.getByRole('link', { name: 'View submitted resume: original.pdf' })).toHaveAttribute('href', originalHref)
    await assertFile(recruiter, originalHref, original)
    for (const status of ['Under Review', 'Interview']) {
      await recruiter.getByLabel('Status for Demo Job Seeker').selectOption(status)
      await recruiter.getByRole('button', { name: 'Update status' }).click()
      await expect(recruiter.getByRole('status')).toHaveText(`Status updated to ${status}.`)
    }
    await seeker.goto(base + '/applications')
    const firstCard = seeker.getByRole('listitem').filter({ has: seeker.getByRole('link', { name: first.title, exact: true }) })
    await firstCard.getByText('View history').click()
    await expect(firstCard.getByRole('list', { name: 'Status history' }).getByRole('listitem')).toHaveText([/^Applied/, /^Under Review/, /^Interview/])

    for (const email of ['other-recruiter@example.test', 'other-seeker@example.test']) {
      const stranger = await login(email)
      expect((await stranger.request.get(base + originalHref)).status()).toBe(404)
    }
    const anonymous = await browser.newContext()
    contexts.push(anonymous)
    expect((await anonymous.request.get(base + originalHref)).status()).toBe(404)

    // Withdrawing one application revokes its route and owning recruiter's
    // access, without destroying the other application's separate version.
    seeker.once('dialog', dialog => dialog.accept())
    await firstCard.getByRole('button', { name: `Withdraw application for ${first.title}` }).click()
    await expect(seeker.getByText('1 application', { exact: true })).toBeVisible()
    expect((await recruiter.request.get(base + originalHref)).status()).toBe(404)
    await assertFile(recruiter, replacementHref, replacement)
  } finally { await Promise.all(contexts.map(context => context.close())) }
})
