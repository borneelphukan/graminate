import { test, expect } from '@playwright/test';

test('homepage has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  // You can adjust this assertion based on your actual page title
  await expect(page).toHaveTitle(/Graminate/i);
});
