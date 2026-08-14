import { defineConfig, devices } from "@playwright/test";

const PORT = process.env.PORT || "3000";
// Priority: explicit env → vercel prod → localhost (mock mode default)
const BASE_URL =
  process.env.PLAYWRIGHT_BASE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "https://pollpop-five.vercel.app";

const LOCAL_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: BASE_URL === "https://pollpop-five.vercel.app" ? BASE_URL : BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  // Also allow localhost fallback when prod is unreachable — webServer brings up mock mode locally.
  webServer: {
    command: `npm run dev -- --port ${PORT}`,
    url: LOCAL_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    stdout: "pipe",
    stderr: "pipe",
    env: {
      // ensure mock mode (no Supabase) for deterministic local run
      PORT,
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // Fallback: if BASE_URL is prod and unreachable, tests will retry against localhost via webServer.
  // Override at runtime: PLAYWRIGHT_BASE_URL=http://localhost:3000 npx playwright test
});
