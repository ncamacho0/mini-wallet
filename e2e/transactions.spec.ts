import { expect, test, type Page } from "@playwright/test";

async function login(page: Page, identifier = "noel@example.com") {
  await page.getByLabel("Teléfono o email").fill(identifier);
  await page.getByRole("button", { name: "Ingresar" }).click();
}

async function startTransfer(page: Page, amount = "1000") {
  await page.goto("/home");
  await page.getByRole("button", { name: "Enviar dinero" }).click();
  await expect(page).toHaveURL(/\/transactions\/new$/);
  await page.getByLabel("Monto").fill(amount);
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByText("Luis Gómez").click();
}

test.describe("send money", () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post("/api/reset");
    await page.setExtraHTTPHeaders({ "x-fault": "success" });
    await page.goto("/login");
    await login(page);
    await expect(page).toHaveURL(/\/home$/);
  });

  test("full flow up to the receipt", async ({ page }) => {
    await startTransfer(page, "1000");

    await expect(page.getByText("Resumen de la transferencia")).toBeVisible();
    await page.getByRole("button", { name: "Confirmar transferencia" }).click();

    await expect(page).toHaveURL(/\/transactions\/.*\/receipt/);
    await expect(page.getByText("Comprobante")).toBeVisible();
    await expect(page.getByText("Luis Gómez")).toBeVisible();
    await expect(page.getByRole("button", { name: "Volver al inicio" })).toBeVisible();
  });

  test("allows creating a new contact as recipient", async ({ page }) => {
    await page.goto("/transactions/new");
    await page.getByLabel("Monto").fill("500");
    await page.getByRole("button", { name: "Continuar" }).click();

    await page.getByRole("button", { name: "Nuevo contacto" }).click();
    await page.getByLabel("Nombre").fill("Ana E2E");
    await page.getByLabel("Teléfono").fill("+525598765432");
    await page.getByRole("button", { name: "Guardar y continuar" }).click();

    await expect(page.getByText("Resumen de la transferencia")).toBeVisible();
    await expect(page.getByText("Ana E2E")).toBeVisible();
  });

  test("the Mini Wallet logo returns home from the receipt", async ({ page }) => {
    await page.goto("/transactions/txn_seed_1/receipt");
    await page.getByRole("link", { name: "Mini Wallet" }).click();

    await expect(page).toHaveURL(/\/home$/);
  });

  test("validates a zero amount", async ({ page }) => {
    await page.goto("/transactions/new");
    await page.getByLabel("Monto").fill("0");
    await page.getByRole("button", { name: "Continuar" }).click();

    await expect(page.getByText("El monto debe ser mayor a cero")).toBeVisible();
  });

  test("validates an amount greater than the balance", async ({ page }) => {
    await page.goto("/transactions/new");
    await page.getByLabel("Monto").fill("99999999");
    await page.getByRole("button", { name: "Continuar" }).click();

    await expect(page.getByText("El monto no puede superar tu saldo disponible")).toBeVisible();
  });

  test("shows the insufficient funds error forced with x-fault", async ({ page }) => {
    await startTransfer(page, "1000");

    await page.setExtraHTTPHeaders({ "x-fault": "insufficient_funds" });
    await page.getByRole("button", { name: "Confirmar transferencia" }).click();

    await expect(page.getByText(/saldo insuficiente/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /reintentar/i })).toBeVisible();
  });

  test("shows the network error forced with x-fault", async ({ page }) => {
    await startTransfer(page, "1000");

    await page.setExtraHTTPHeaders({ "x-fault": "network" });
    await page.getByRole("button", { name: "Confirmar transferencia" }).click();

    await expect(page.getByText(/no se pudo completar la transferencia/i)).toBeVisible();
  });
});
