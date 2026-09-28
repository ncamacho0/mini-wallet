import { db } from "@/server/db";
import { SESSION_COOKIE } from "@/shared/lib/constants";

export function createSessionToken(userId: string, identifier: string): string {
  const token = crypto.randomUUID();
  db.sessions.set(token, { userId, identifier, createdAt: new Date().toISOString() });
  return token;
}

export function destroySession(token: string): void {
  db.sessions.delete(token);
}

export function getSessionUserId(token: string): string | null {
  return db.sessions.get(token)?.userId ?? null;
}

export function getSessionToken(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  for (const part of cookieHeader.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === SESSION_COOKIE && rest.length > 0) {
      return decodeURIComponent(rest.join("="));
    }
  }
  return null;
}

export function getAuthenticatedUserId(request: Request): string | null {
  const token = getSessionToken(request);
  if (!token) return null;
  return getSessionUserId(token);
}
