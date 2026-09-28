import { expect, test, type Page } from "@playwright/test";

async function login(page: Page, identifier = "noel@example.com") {
  await page.getByLabel("Teléfono o email").fill(identifier);
  await page.getByRole("button", { name: "Ingresar" }).click();
}

test.describe("home", () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post("/api/reset");
    await page.setExtraHTTPHeaders({ "x-fault": "success" });
    await page.goto("/login");
    await login(page);
    await expect(page).toHaveURL(/\/home$/);
  });

  test("shows balance and recent transactions", async ({ page }) => {
    await expect(page.getByText(/saldo disponible/i)).toBeVisible();
    await expect(page.getByTestId("balance-amount")).toBeVisible();
    await expect(page.getByRole("heading", { name: /movimientos recientes/i })).toBeVisible();
    await expect(page.getByText("Luis Gómez").first()).toBeVisible();
    await expect(page.getByText("Marta Ruiz").first()).toBeVisible();
  });

  test("the main CTA navigates to a new transaction", async ({ page }) => {
    await page.getByRole("button", { name: "Enviar dinero" }).click();

    await expect(page).toHaveURL(/\/transactions\/new$/);
  });

  test("shows the error state when /api/me fails", async ({ page }) => {
    await page.setExtraHTTPHeaders({ "x-fault": "network" });
    await page.reload();

    await expect(page.getByText(/no pudimos cargar tu cuenta/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /intentar de nuevo/i })).toBeVisible();
  });
});
