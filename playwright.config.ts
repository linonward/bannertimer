import { defineConfig, devices } from "@playwright/test";
import { BUILD_NOW, baseURL, port } from "./e2e/server";

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  use: { baseURL, trace: "on-first-retry" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // The same server as production: the OpenNext Worker and its static assets (wrangler.jsonc).
    command: `pnpm build && pnpm exec wrangler dev --port ${port} --ip 127.0.0.1`,
    env: { WRANGLER_SEND_METRICS: "false", BANNERTIMER_NOW: BUILD_NOW },
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
});
