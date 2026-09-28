import type { ApiError, ErrorCode } from "@/shared/types";

export type RuleOk = { ok: true };
export type RuleViolation = { ok: false; code: ErrorCode; message: string };
export type RuleResult = RuleOk | RuleViolation;

const OK: RuleOk = { ok: true };

export interface TransactionRulesInput {
  amountMinorUnits: number;
  recipientId?: string | null;
  newRecipient?: { name: string; phone?: string; email?: string } | null;
}

export interface TransactionRulesContext {
  balanceMinorUnits: number;
}

export function validateAmount(amountMinorUnits: number): RuleResult {
  if (!Number.isInteger(amountMinorUnits) || amountMinorUnits <= 0) {
    return {
      ok: false,
      code: "AMOUNT_INVALID",
      message: "El monto debe ser mayor a cero",
    };
  }
  return OK;
}

export function validateSufficientBalance(
  amountMinorUnits: number,
  balanceMinorUnits: number,
): RuleResult {
  if (amountMinorUnits > balanceMinorUnits) {
    return {
      ok: false,
      code: "INSUFFICIENT_FUNDS",
      message: "Saldo insuficiente para realizar esta transacción",
    };
  }
  return OK;
}

export function validateRecipient(
  input: Pick<TransactionRulesInput, "recipientId" | "newRecipient">,
): RuleResult {
  const hasExistingRecipient =
    typeof input.recipientId === "string" && input.recipientId.trim().length > 0;

  const hasNewRecipient =
    input.newRecipient != null &&
    input.newRecipient.name.trim().length > 0 &&
    (Boolean(input.newRecipient.phone) || Boolean(input.newRecipient.email));

  if (!hasExistingRecipient && !hasNewRecipient) {
    return {
      ok: false,
      code: "RECIPIENT_REQUIRED",
      message: "Debes seleccionar o crear un destinatario",
    };
  }
  return OK;
}

export function validateTransaction(
  input: TransactionRulesInput,
  context: TransactionRulesContext,
): RuleResult {
  const results: RuleResult[] = [
    validateAmount(input.amountMinorUnits),
    validateRecipient(input),
    validateSufficientBalance(input.amountMinorUnits, context.balanceMinorUnits),
  ];

  for (const result of results) {
    if (!result.ok) return result;
  }
  return OK;
}

export function toApiError(violation: RuleViolation): ApiError {
  return { code: violation.code, message: violation.message };
}
