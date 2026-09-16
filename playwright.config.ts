import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: true,
  workers: 2,
  timeout: 45_000,
  expect: { timeout: 7000 },
  use: {
    baseURL: 'http://127.0.0.1:5188',
    channel: 'chrome',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    viewport: { width: 1440, height: 1000 },
  },
  webServer: {
    command: 'npm run preview -- --port 5188',
    url: 'http://127.0.0.1:5188',
    reuseExistingServer: false,
    timeout: 30_000,
  },
  reporter: [['list']],
});
