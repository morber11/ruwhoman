import { test, expect } from '@playwright/test';

test.describe('Challenge Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.route('**/api/challenges/abc', async (route) => {
            if (route.request().method() === 'GET') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        type: 'math',
                        question: 'What is 2 + 2?',
                    }),
                });
            } else {
                await route.continue();
            }
        });

        await page.route('**/api/challenges/abc/submit', async (route) => {
            if (route.request().method() === 'POST') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ passed: true }),
                });
            } else {
                await route.continue();
            }
        });

        await page.goto('/abc');
    });

    test('shows correct answer result', async ({ page }) => {
        await expect(page.getByText('What is 2 + 2?')).toBeVisible();

        await page.getByPlaceholder('Enter your answer').fill('4');
        await page.getByRole('button', { name: /submit/i }).click();

        await expect(page.getByText('Correct! You are human')).toBeVisible();
    });

    test('shows wrong answer result', async ({ page }) => {
        await page.route('**/api/challenges/abc/submit', async (route) => {
            if (route.request().method() === 'POST') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ passed: false }),
                });
            } else {
                await route.continue();
            }
        });

        await page.goto('/abc');
        await expect(page.getByText('What is 2 + 2?')).toBeVisible();

        await page.getByPlaceholder('Enter your answer').fill('5');
        await page.getByRole('button', { name: /submit/i }).click();

        await expect(
            page.getByText('Wrong answer'),
        ).toBeVisible();
    });

    test('shows expired for 404', async ({ page }) => {
        await page.route('**/api/challenges/abc', async (route) => {
            if (route.request().method() === 'GET') {
                await route.fulfill({ status: 404 });
            } else {
                await route.continue();
            }
        });

        await page.goto('/abc');

        await expect(
            page.getByText(/not found or expired/i),
        ).toBeVisible();
    });

    test('shows completed for 409', async ({ page }) => {
        await page.route('**/api/challenges/abc', async (route) => {
            if (route.request().method() === 'GET') {
                await route.fulfill({ status: 409 });
            } else {
                await route.continue();
            }
        });

        await page.goto('/abc');

        await expect(
            page.getByText(/already been completed/i),
        ).toBeVisible();
    });

    test('submits answer with Enter key', async ({ page }) => {
        await expect(page.getByText('What is 2 + 2?')).toBeVisible();

        await page.getByPlaceholder('Enter your answer').fill('4');
        await page.getByPlaceholder('Enter your answer').press('Enter');

        await expect(page.getByText('Correct! You are human')).toBeVisible();
    });
});
