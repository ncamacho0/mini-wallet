import { expect, test } from "@playwright/test";

test("the landing page loads with the app title", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Mini Wallet/i);
});
