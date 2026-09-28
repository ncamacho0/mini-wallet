export type ISODateString = string;

export type Currency = "MXN";

export interface User {
  id: string;
  fullName: string;
  email?: string;
  /** E.164, ej. "+525512345678" */
  phone?: string;
}

export interface Account {
  id: string;
  userId: string;
  /** Dinero en unidades menores (centavos). Siempre enteros, nunca floats. */
  balanceMinorUnits: number;
  currency: Currency;
}

export interface Contact {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  isFavorite: boolean;
}

export type TransactionType = "transfer_out" | "recharge" | "transfer_in";

export type TransactionStatus = "pending" | "completed" | "failed";

export interface Transaction {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  amountMinorUnits: number;
  recipientName: string;
  createdAt: ISODateString;
  /** Identificador legible para el comprobante */
  reference: string;
}
