import { describe, expect, it } from "vitest";
import type { ErrorCode } from "@/shared/types";
import {
  toApiError,
  validateAmount,
  validateRecipient,
  validateSufficientBalance,
  validateTransaction,
  type RuleResult,
  type RuleViolation,
} from "./rules";

function expectViolation(result: RuleResult, code: ErrorCode) {
  expect(result.ok).toBe(false);
  expect(result).toMatchObject({ ok: false, code });
}

describe("validateAmount", () => {
  it("rejects a zero amount", () => {
    expectViolation(validateAmount(0), "AMOUNT_INVALID");
  });

  it("rejects a negative amount", () => {
    expectViolation(validateAmount(-500), "AMOUNT_INVALID");
  });

  it("rejects a non-integer amount (fraction of a cent)", () => {
    expectViolation(validateAmount(10.5), "AMOUNT_INVALID");
  });

  it("rejects NaN", () => {
    expectViolation(validateAmount(Number.NaN), "AMOUNT_INVALID");
  });

  it("accepts a positive integer amount", () => {
    expect(validateAmount(1).ok).toBe(true);
    expect(validateAmount(50_000).ok).toBe(true);
  });
});

describe("validateSufficientBalance", () => {
  it("rejects an amount greater than the available balance", () => {
    expectViolation(validateSufficientBalance(10_001, 10_000), "INSUFFICIENT_FUNDS");
  });

  it("accepts an amount equal to the available balance", () => {
    expect(validateSufficientBalance(10_000, 10_000).ok).toBe(true);
  });

  it("accepts an amount less than the available balance", () => {
    expect(validateSufficientBalance(9_999, 10_000).ok).toBe(true);
  });
});

describe("validateRecipient", () => {
  it("rejects a completely missing recipient", () => {
    expectViolation(validateRecipient({}), "RECIPIENT_REQUIRED");
  });

  it("rejects an empty or blank recipientId", () => {
    expectViolation(validateRecipient({ recipientId: "" }), "RECIPIENT_REQUIRED");
    expectViolation(validateRecipient({ recipientId: "   " }), "RECIPIENT_REQUIRED");
  });

  it("rejects a new contact without a name", () => {
    expectViolation(
      validateRecipient({ newRecipient: { name: "  ", phone: "+525512345678" } }),
      "RECIPIENT_REQUIRED",
    );
  });

  it("rejects a new contact without phone or email", () => {
    expectViolation(validateRecipient({ newRecipient: { name: "Ana" } }), "RECIPIENT_REQUIRED");
  });

  it("accepts a valid recipientId", () => {
    expect(validateRecipient({ recipientId: "contact-1" }).ok).toBe(true);
  });

  it("accepts a valid new contact", () => {
    expect(validateRecipient({ newRecipient: { name: "Ana", phone: "+525512345678" } }).ok).toBe(
      true,
    );
    expect(validateRecipient({ newRecipient: { name: "Ana", email: "ana@example.com" } }).ok).toBe(
      true,
    );
  });
});

describe("validateTransaction", () => {
  const balance = { balanceMinorUnits: 10_000 };

  it("prioritizes the amount error over the others", () => {
    expectViolation(validateTransaction({ amountMinorUnits: 0 }, balance), "AMOUNT_INVALID");
  });

  it("requires a recipient when the amount is valid", () => {
    expectViolation(
      validateTransaction({ amountMinorUnits: 1_000 }, balance),
      "RECIPIENT_REQUIRED",
    );
  });

  it("validates sufficient balance with valid amount and recipient", () => {
    expectViolation(
      validateTransaction({ amountMinorUnits: 20_000, recipientId: "c1" }, balance),
      "INSUFFICIENT_FUNDS",
    );
  });

  it("accepts a valid transaction with an existing contact", () => {
    const result = validateTransaction({ amountMinorUnits: 5_000, recipientId: "c1" }, balance);
    expect(result.ok).toBe(true);
  });

  it("accepts a valid transaction with a new contact", () => {
    const result = validateTransaction(
      {
        amountMinorUnits: 5_000,
        newRecipient: { name: "Ana", phone: "+525512345678" },
      },
      balance,
    );
    expect(result.ok).toBe(true);
  });
});

describe("toApiError", () => {
  it("converts a violation into an ApiError", () => {
    const violation: RuleViolation = {
      ok: false,
      code: "INSUFFICIENT_FUNDS",
      message: "Saldo insuficiente para realizar esta transacción",
    };
    expect(toApiError(violation)).toEqual({
      code: "INSUFFICIENT_FUNDS",
      message: "Saldo insuficiente para realizar esta transacción",
    });
  });
});
