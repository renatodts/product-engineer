import { defineConfig } from '@playwright/test';

// TODO: Run `pnpm playwright install` before first E2E run.
export default defineConfig({
  testDir: './tests-e2e',
  use: { baseURL: 'http://localhost:3004' },
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3004',
    reuseExistingServer: !process.env.CI,
  },
});
