import { defineConfig } from '@playwright/test'
export default defineConfig({
  testDir: './tests/browser',
  workers: 1,
  timeout: 45000,
  use: { channel: process.env.PLAYWRIGHT_CHANNEL || undefined, viewport: { width: 1280, height: 900 } },
})
