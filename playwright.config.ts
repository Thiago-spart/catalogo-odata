import { defineConfig, devices } from '@playwright/test';

// The E2E run uses the real Northwind service, so it proves the OData contract
// end to end. It runs on a phone viewport because the product is mobile first.
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  use: { baseURL: 'http://localhost:4173', trace: 'retain-on-failure' },
  projects: [
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: { command: 'pnpm build && pnpm preview --port 4173', port: 4173, reuseExistingServer: !process.env.CI },
});
