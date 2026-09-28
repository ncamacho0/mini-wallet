import { expect, test, type Page } from "@playwright/test";

async function login(page: Page, identifier = "noel@example.com") {
  await page.getByLabel("Teléfono o email").fill(identifier);
  await page.getByRole("button", { name: "Ingresar" }).click();
}

test.describe("accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post("/api/reset");
    await page.setExtraHTTPHeaders({ "x-fault": "success" });
  });

  test("the skip link is keyboard navigable", async ({ page }) => {
    await page.goto("/home");
    await login(page);

    const skipLink = page.getByRole("link", { name: /saltar al contenido principal/i });
    await expect(skipLink).not.toBeVisible();

    await page.keyboard.press("Tab");
    await expect(skipLink).toBeVisible();

    await skipLink.press("Enter");
    await expect(page.locator("#main-content")).toBeFocused();
  });

  test("form errors are announced with role=alert", async ({ page }) => {
    await page.goto("/transactions/new");
    await login(page);

    await page.getByRole("button", { name: "Continuar" }).click();

    const error = page.locator('[id="amount-error"][role="alert"]');
    await expect(error).toContainText("mayor a cero");
  });
});
