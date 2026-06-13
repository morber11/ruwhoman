import { test, expect } from '@playwright/test';

test('shows 404 page for unknown routes', async ({ page }) => {
  await page.goto('/foo/bar');

  await expect(page.getByText('Page not found')).toBeVisible();
});
