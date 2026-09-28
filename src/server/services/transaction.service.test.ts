import { beforeEach, describe, expect, it } from "vitest";
import { db, resetDb } from "@/server/db";
import { listContacts } from "./contacts.service";
import { createTransaction, listTransactions } from "./transaction.service";

beforeEach(() => {
  resetDb();
});

function balanceMinorUnits(): number {
  return db.account.balanceMinorUnits;
}

describe("listTransactions", () => {
  it("sorts by date descending and respects the limit", () => {
    const all = listTransactions(10);

    expect(all).toHaveLength(4);
    expect(all[0].id).toBe("txn_seed_1");
    expect(listTransactions(2)).toHaveLength(2);
  });
});

describe("createTransaction", () => {
  it("debits the balance and persists the transaction with an existing contact", () => {
    const before = balanceMinorUnits();

    const result = createTransaction({ amountMinorUnits: 1_000_000, recipientId: "cnt_1001" });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.transaction).toMatchObject({
      status: "completed",
      recipientName: "Luis Gómez",
      amountMinorUnits: 1_000_000,
      type: "transfer_out",
    });
    expect(result.transaction.reference).toMatch(/^MW-/);
    expect(balanceMinorUnits()).toBe(before - 1_000_000);
    expect(listTransactions(1)[0].id).toBe(result.transaction.id);
  });

  it("creates and persists the new contact when transferring", () => {
    const result = createTransaction({
      amountMinorUnits: 500_000,
      newRecipient: { name: "Ana Pérez", phone: "+525598765432" },
    });

    expect(result.ok).toBe(true);
    expect(listContacts().some((contact) => contact.name === "Ana Pérez")).toBe(true);
  });

  it("rejects invalid amounts without touching the balance", () => {
    const before = balanceMinorUnits();

    const result = createTransaction({ amountMinorUnits: 0, recipientId: "cnt_1001" });

    expect(result).toMatchObject({ ok: false, error: { code: "AMOUNT_INVALID" } });
    expect(balanceMinorUnits()).toBe(before);
  });

  it("rejects insufficient balance without touching the balance", () => {
    const before = balanceMinorUnits();

    const result = createTransaction({ amountMinorUnits: before + 1, recipientId: "cnt_1001" });

    expect(result).toMatchObject({ ok: false, error: { code: "INSUFFICIENT_FUNDS" } });
    expect(balanceMinorUnits()).toBe(before);
  });

  it("rejects a nonexistent recipient without touching the balance", () => {
    const before = balanceMinorUnits();

    const result = createTransaction({ amountMinorUnits: 1_000, recipientId: "cnt_nope" });

    expect(result).toMatchObject({ ok: false, error: { code: "RECIPIENT_REQUIRED" } });
    expect(balanceMinorUnits()).toBe(before);
  });
});
