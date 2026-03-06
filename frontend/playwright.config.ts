import { defineConfig } from '@playwright/test';

export default defineConfig({
  workers: 1,
  testDir: './playwright-tests',
  timeout: 20000,
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    video: 'retain-on-failure',
  },
  expect: {
    timeout: 8000,
  },
});
