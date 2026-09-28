import { describe, expect, it } from "vitest";
import { createTransactionSchema } from "./schemas";

describe("createTransactionSchema", () => {
  it("accepts an amount with an existing contact", () => {
    const result = createTransactionSchema.safeParse({
      amountMinorUnits: 5_000,
      recipientId: "contact-1",
    });
    expect(result.success).toBe(true);
  });

  it("accepts an amount with a new contact", () => {
    const result = createTransactionSchema.safeParse({
      amountMinorUnits: 5_000,
      newRecipient: { name: "Ana", phone: "+525512345678" },
    });
    expect(result.success).toBe(true);
  });

  it("rejects a zero amount", () => {
    const result = createTransactionSchema.safeParse({ amountMinorUnits: 0, recipientId: "c1" });
    expect(result.success).toBe(false);
  });

  it("rejects a negative amount", () => {
    const result = createTransactionSchema.safeParse({ amountMinorUnits: -100, recipientId: "c1" });
    expect(result.success).toBe(false);
  });

  it("rejects an amount with decimals", () => {
    const result = createTransactionSchema.safeParse({ amountMinorUnits: 10.5, recipientId: "c1" });
    expect(result.success).toBe(false);
  });

  it("rejects a request without a recipient", () => {
    const result = createTransactionSchema.safeParse({ amountMinorUnits: 1_000 });
    expect(result.success).toBe(false);
  });

  it("rejects a new contact without phone or email", () => {
    const result = createTransactionSchema.safeParse({
      amountMinorUnits: 1_000,
      newRecipient: { name: "Ana" },
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty recipientId", () => {
    const result = createTransactionSchema.safeParse({ amountMinorUnits: 1_000, recipientId: "" });
    expect(result.success).toBe(false);
  });
});
