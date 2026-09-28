import type { Account, Contact, Transaction, User } from "./domain";

export interface SessionSnapshot {
  user: User;
  account: Account;
}

export type LoginResponse = SessionSnapshot;

export type MeResponse = SessionSnapshot;

export interface ContactsResponse {
  contacts: Contact[];
}

export interface CreateContactResponse {
  contact: Contact;
}

export interface TransactionsResponse {
  transactions: Transaction[];
}

export interface CreateTransactionResponse {
  transaction: Transaction;
}
