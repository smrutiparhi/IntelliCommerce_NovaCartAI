import { defineConfig } from '@playwright/test'
import base from './playwright.config'

// An isolated frontend suite, separate from the live backend checkout test.
// The suite intercepts API calls and never submits real purchases.
export default defineConfig({
  ...base,
  testMatch: 'redesign.spec.ts',
  use: { ...base.use, baseURL: 'http://127.0.0.1:5180' },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 5180 --strictPort',
    url: 'http://127.0.0.1:5180',
    reuseExistingServer: false,
    timeout: 60_000,
  },
})
