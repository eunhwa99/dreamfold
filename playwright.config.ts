import { defineConfig } from "@playwright/test";

const baseUrl = process.env.PLAYWRIGHT_BASE_URL;

if (!baseUrl) {
  throw new Error("PLAYWRIGHT_BASE_URL is required. Run E2E via `npm run test:e2e` so the wrapper can provide an isolated server.");
}

export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL: baseUrl,
    trace: "on-first-retry"
  }
});
