import { defineConfig } from "@playwright/test";

// MVP smoke test config. Single test, single browser, mock-mode dev server.
// Phase 9 of the build plan: lock the UI contract before Phase 7 swaps the
// backend. Mock mode keeps the test deterministic and free of LLM cost.

export default defineConfig({
  testDir: "tests",
  timeout: 30_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : [["list"]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    env: {
      NEXT_PUBLIC_API_MODE: "mock",
      NEXT_PUBLIC_API_URL: "http://localhost:8000",
    },
  },
});
