import { defineConfig } from '@playwright/test';

// TODO: Run `pnpm playwright install` before first E2E run.
export default defineConfig({
  testDir: './tests-e2e',
  use: { baseURL: 'http://localhost:3002' },
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3002',
    reuseExistingServer: !process.env.CI,
  },
});
