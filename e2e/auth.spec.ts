import { expect, test, type Page } from "@playwright/test";

async function login(page: Page, identifier = "noel@example.com") {
  await page.getByLabel("Teléfono o email").fill(identifier);
  await page.getByRole("button", { name: "Ingresar" }).click();
}

test.describe("authentication", () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post("/api/reset");
  });

  test("redirects to home after a successful login", async ({ page }) => {
    await page.setExtraHTTPHeaders({ "x-fault": "success" });
    await page.goto("/login");

    await login(page);

    await expect(page).toHaveURL(/\/home$/);
    await expect(page.getByText(/hola, noel/i)).toBeVisible();
  });

  test("local validation rejects invalid identifiers", async ({ page }) => {
    await page.goto("/login");

    await login(page, "abc");

    await expect(page.getByText(/formato inválido/i)).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test("shows the invalid credentials error forced with x-fault", async ({ page }) => {
    await page.setExtraHTTPHeaders({ "x-fault": "invalid_credentials" });
    await page.goto("/login");

    await login(page);

    await expect(page.getByText(/credenciales inválidas/i)).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test("protects private routes and preserves the destination", async ({ page }) => {
    await page.setExtraHTTPHeaders({ "x-fault": "success" });
    await page.goto("/home");

    await expect(page).toHaveURL(/\/login\?redirect=%2Fhome/);

    await login(page);

    await expect(page).toHaveURL(/\/home$/);
  });

  test("logout returns to login", async ({ page }) => {
    await page.setExtraHTTPHeaders({ "x-fault": "success" });
    await page.goto("/login");
    await login(page);
    await expect(page).toHaveURL(/\/home$/);

    await page.getByRole("button", { name: "Cerrar sesión" }).click();

    await expect(page).toHaveURL(/\/login$/);
  });
});
