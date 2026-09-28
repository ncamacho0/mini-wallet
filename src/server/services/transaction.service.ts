import {
  toApiError,
  validateTransaction,
  type CreateTransactionRequest,
} from "@/features/transactions";
import { db } from "@/server/db";
import { debitAccount } from "@/server/services/account.service";
import { createContact, findContactById } from "@/server/services/contacts.service";
import type { ApiError, Transaction } from "@/shared/types";

export type CreateTransactionResult =
  { ok: true; transaction: Transaction } | { ok: false; error: ApiError };

export function listTransactions(limit: number): Transaction[] {
  return [...db.transactions]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}

function createReference(): string {
  return `MW-${crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

export function createTransaction(input: CreateTransactionRequest): CreateTransactionResult {
  const ruleResult = validateTransaction(input, {
    balanceMinorUnits: db.account.balanceMinorUnits,
  });
  if (!ruleResult.ok) {
    return { ok: false, error: toApiError(ruleResult) };
  }

  let recipientName: string;
  if ("recipientId" in input) {
    const contact = findContactById(input.recipientId);
    if (!contact) {
      return {
        ok: false,
        error: {
          code: "RECIPIENT_REQUIRED",
          message: "No encontramos el destinatario seleccionado",
        },
      };
    }
    recipientName = contact.name;
  } else {
    recipientName = input.newRecipient.name;
  }

  debitAccount(input.amountMinorUnits);
  if ("newRecipient" in input) {
    createContact(input.newRecipient);
  }

  const transaction: Transaction = {
    id: `txn_${crypto.randomUUID().split("-")[0]}`,
    type: "transfer_out",
    status: "completed",
    amountMinorUnits: input.amountMinorUnits,
    recipientName,
    createdAt: new Date().toISOString(),
    reference: createReference(),
  };

  db.transactions.push(transaction);
  return { ok: true, transaction };
}
