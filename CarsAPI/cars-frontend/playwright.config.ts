import { defineConfig } from "@playwright/test";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

export default defineConfig({
    testDir: "./tests/e2e",
    fullyParallel: false,
    workers: 1,
    timeout: 30000,
    use: {
        baseURL: "http://localhost:3100",
        browserName: "chromium",
        channel: process.env.PLAYWRIGHT_CHANNEL || "msedge",
        trace: "retain-on-failure",
        screenshot: "only-on-failure",
    },
    webServer: {
        command: "npm run start -- --port 3100",
        url: "http://localhost:3100",
        reuseExistingServer: false,
        timeout: 120000,
    },
});
