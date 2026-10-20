import { test, expect } from '@playwright/test'
import { startPreview } from '../fixtures/recruiter-preview.mjs'
let preview
test.beforeAll(async () => { preview = await startPreview() })
test.afterAll(async () => { await preview?.close() })
test('user requests a reset link, follows it and sets a new password', async ({ page }) => {
  const base = `http://127.0.0.1:${preview.appPort}`
  await page.goto(base + '/login')
  await page.getByRole('link', { name: 'Forgot your password?' }).click()
  await expect(page.getByRole('heading', { name: 'Forgot your password?' })).toBeVisible()
  await page.getByRole('button', { name: 'Send reset link' }).click()
  await expect(page.getByText('Enter a valid email address.')).toBeVisible()
  await page.getByLabel('Email').fill('jobseeker@example.test')
  await page.getByRole('button', { name: 'Send reset link' }).click()
  await expect(page.getByText('If an account exists for that email, a password reset link is on its way.')).toBeVisible()

  // Opening the reset page without the email link's session explains instead of showing the form.
  await page.goto(base + '/reset-password')
  await expect(page.getByRole('heading', { name: 'Reset link expired' })).toBeVisible()

  await page.goto(base + '/auth/confirm?token_hash=expired&type=recovery&next=/reset-password')
  await expect(page).toHaveURL(/\/forgot-password\?error=expired$/)
  await expect(page.getByText('That reset link is invalid or has expired.')).toBeVisible()

  await page.goto(base + '/auth/confirm?token_hash=valid&type=recovery&next=/reset-password')
  await expect(page.getByRole('heading', { name: 'Choose a new password' })).toBeVisible()
  await page.getByLabel('New password', { exact: true }).fill('new-password')
  await page.getByLabel('Confirm new password').fill('different-password')
  await page.getByRole('button', { name: 'Set new password' }).click()
  await expect(page.getByText('Passwords do not match.')).toBeVisible()
  await page.getByLabel('New password', { exact: true }).fill('new-password')
  await page.getByLabel('Confirm new password').fill('new-password')
  await page.getByRole('button', { name: 'Set new password' }).click()
  await expect(page).toHaveURL(base + '/dashboard')
})

test('default Supabase reset email returns through /auth/callback in the same browser', async ({ page }) => {
  const base = `http://127.0.0.1:${preview.appPort}`
  // Requesting the email stores the PKCE code verifier cookie the callback needs.
  await page.goto(base + '/forgot-password')
  await page.getByLabel('Email').fill('jobseeker@example.test')
  await page.getByRole('button', { name: 'Send reset link' }).click()
  await expect(page.getByText('If an account exists for that email, a password reset link is on its way.')).toBeVisible()

  await page.goto(base + '/auth/callback?next=/reset-password&code=expired')
  await expect(page).toHaveURL(/\/forgot-password\?error=expired$/)

  await page.goto(base + '/auth/callback?next=/reset-password&code=valid')
  await expect(page.getByRole('heading', { name: 'Choose a new password' })).toBeVisible()
})

test('email links never redirect off-site', async ({ page }) => {
  const base = `http://127.0.0.1:${preview.appPort}`
  await page.goto(base + '/auth/confirm?token_hash=valid&type=recovery&next=//evil.example')
  await expect(page).toHaveURL(base + '/')
})
