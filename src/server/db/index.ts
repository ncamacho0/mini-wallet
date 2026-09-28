import { createSeed, type Db } from "./seed";

export type { Db, SessionData } from "./seed";

const globalForDb = globalThis as unknown as { miniWalletDb?: Db };

export const db: Db = globalForDb.miniWalletDb ?? createSeed();

globalForDb.miniWalletDb = db;

export function resetDb(): void {
  Object.assign(db, createSeed());
}
