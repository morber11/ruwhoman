import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './e2e',
    fullyParallel: true,
    retries: 0,
    use: {
        baseURL: 'http://localhost:5173',
        browserName: 'chromium',
    },
    webServer: {
        command: 'npx vite',
        port: 5173,
        reuseExistingServer: true,
        timeout: 30000,
    },
});
