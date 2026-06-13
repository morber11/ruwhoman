import { test, expect } from '@playwright/test';

const now = new Date();
const future = new Date(now.getTime() + 86400000);

test.describe('Monitor Page', () => {
    test('shows pending status', async ({ page }) => {
        await page.route('**/api/monitor/xyz', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    status: 'pending',
                    createdAt: now.toISOString(),
                    expiresAt: future.toISOString(),
                    completedAt: null,
                }),
            });
        });

        await page.goto('/monitor/xyz');

        await expect(page.getByText('Waiting for response')).toBeVisible();
        await expect(page.getByText(/Created/i)).toBeVisible();
        await expect(page.getByText(/Expires/i)).toBeVisible();
    });

    test('shows failed status', async ({ page }) => {
        await page.route('**/api/monitor/xyz', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    status: 'failed',
                    createdAt: now.toISOString(),
                    expiresAt: future.toISOString(),
                    completedAt: now.toISOString(),
                }),
            });
        });

        await page.goto('/monitor/xyz');

        await expect(page.getByText('Verification failed')).toBeVisible();
    });
});
