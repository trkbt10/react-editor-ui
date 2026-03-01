/**
 * @file Playwright configuration for ChatInput E2E tests
 */

import { defineConfig, devices } from "@playwright/test";
import { BASE_URL } from "./config";

export default defineConfig({
  testDir: "./tests",
  testMatch: "*.e2e.ts",
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "bun run e2e:chat",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
  },
});
