import { db } from "@/server/db";
import type { Account } from "@/shared/types";

export function getAccount(): Account {
  return db.account;
}

export function debitAccount(amountMinorUnits: number): Account {
  db.account.balanceMinorUnits -= amountMinorUnits;
  return db.account;
}
