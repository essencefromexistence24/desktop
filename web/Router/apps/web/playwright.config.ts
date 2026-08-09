import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: "http://localhost:3000",
  },
  webServer: {
    command: "bun run dev",
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
