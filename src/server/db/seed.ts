import type { Account, Contact, Transaction, User } from "@/shared/types";

export interface SessionData {
  userId: string;
  identifier: string;
  createdAt: string;
}

export interface Db {
  user: User;
  account: Account;
  contacts: Contact[];
  transactions: Transaction[];
  sessions: Map<string, SessionData>;
}

export function createSeed(): Db {
  const user: User = {
    id: "usr_demo_1",
    fullName: "Noel Camacho",
    email: "noel@example.com",
    phone: "+525512345678",
  };

  const account: Account = {
    id: "acc_demo_1",
    userId: user.id,
    balanceMinorUnits: 2_500_000,
    currency: "MXN",
  };

  const contacts: Contact[] = [
    {
      id: "cnt_1001",
      name: "Luis Gómez",
      phone: "+525576543210",
      isFavorite: true,
    },
    {
      id: "cnt_1002",
      name: "Marta Ruiz",
      email: "marta.ruiz@example.com",
      isFavorite: true,
    },
    {
      id: "cnt_1003",
      name: "Carlos Díaz",
      phone: "+528112345678",
      isFavorite: false,
    },
    {
      id: "cnt_1004",
      name: "Sofía Herrera",
      email: "sofia.herrera@example.com",
      isFavorite: false,
    },
  ];

  const transactions: Transaction[] = [
    {
      id: "txn_seed_1",
      type: "transfer_out",
      status: "completed",
      amountMinorUnits: 85_000,
      recipientName: "Luis Gómez",
      createdAt: "2026-09-25T15:10:00.000Z",
      reference: "MW-8F2K1Q7A",
    },
    {
      id: "txn_seed_2",
      type: "recharge",
      status: "completed",
      amountMinorUnits: 150_000,
      recipientName: "Recarga SPEI",
      createdAt: "2026-09-24T09:45:00.000Z",
      reference: "MW-3B7D9X2C",
    },
    {
      id: "txn_seed_3",
      type: "transfer_in",
      status: "completed",
      amountMinorUnits: 45_000,
      recipientName: "Marta Ruiz",
      createdAt: "2026-09-23T18:20:00.000Z",
      reference: "MW-5T1M8W4E",
    },
    {
      id: "txn_seed_4",
      type: "transfer_out",
      status: "completed",
      amountMinorUnits: 12_500,
      recipientName: "Sofía Herrera",
      createdAt: "2026-09-20T12:05:00.000Z",
      reference: "MW-9Q4V6N3H",
    },
  ];

  return { user, account, contacts, transactions, sessions: new Map() };
}
