import { db } from "@/server/db";
import { createSessionToken } from "./session.service";
import type { SessionSnapshot } from "@/shared/types";

export interface LoginResult extends SessionSnapshot {
  token: string;
}

export function login(identifier: string): LoginResult {
  const token = createSessionToken(db.user.id, identifier);
  return { token, user: db.user, account: db.account };
}

export function getSessionUser(userId: string): SessionSnapshot | null {
  if (db.user.id !== userId) return null;
  return { user: db.user, account: db.account };
}
