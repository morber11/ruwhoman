import { test, expect } from '@playwright/test';

test.describe('Create Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.route('**/api/challenges', async (route) => {
            if (route.request().method() === 'POST') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        challengeUrl: 'http://localhost:5173/abc123',
                        monitorUrl: 'http://localhost:5173/monitor/xyz789',
                    }),
                });
            } else {
                await route.continue();
            }
        });

        await page.goto('/');
    });

    test('creates a challenge and shows URLs', async ({ page }) => {
        await page.getByRole('button', { name: /create/i }).click();

        await expect(
            page.getByText('http://localhost:5173/abc123'),
        ).toBeVisible();
        await expect(
            page.getByText('http://localhost:5173/monitor/xyz789'),
        ).toBeVisible();
    });
});

test.describe('Create Page - errors', () => {
    test('shows rate limit error on 429', async ({ page }) => {
        await page.route('**/api/challenges', async (route) => {
            if (route.request().method() === 'POST') {
                await route.fulfill({ status: 429 });
            } else {
                await route.continue();
            }
        });

        await page.goto('/');
        await page.getByRole('button', { name: /create/i }).click();

        await expect(
            page.getByText(/rate limited/i),
        ).toBeVisible();
    });

    test('shows generic error on network failure', async ({ page }) => {
        await page.route('**/api/challenges', async (route) => {
            if (route.request().method() === 'POST') {
                await route.abort('connectionrefused');
            } else {
                await route.continue();
            }
        });

        await page.goto('/');
        await page.getByRole('button', { name: /create/i }).click();

        await expect(
            page.getByText(/failed to create/i),
        ).toBeVisible();
    });
});
