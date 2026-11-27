import { defineConfig } from "@playwright/test";

const externalBaseURL = process.env.E2E_BASE_URL;
const port = Number(process.env.E2E_PORT ?? 3000);
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  fullyParallel: true,
  workers: 2,
  reporter: "list",
  use: {
    baseURL: externalBaseURL ?? `http://127.0.0.1:${port}`,
    browserName: "chromium",
    headless: true,
    trace: "retain-on-failure",
    ...(executablePath ? { launchOptions: { executablePath, args: ["--no-sandbox"] } } : {}),
  },
  webServer: externalBaseURL ? undefined : {
    command: `npm run dev -- --hostname 0.0.0.0 --port ${port}`,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
