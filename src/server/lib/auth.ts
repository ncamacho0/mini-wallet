import { cookies } from "next/headers";
import { getSessionUser } from "@/server/services/auth.service";
import { getSessionUserId } from "@/server/services/session.service";
import { SESSION_COOKIE } from "@/shared/lib/constants";
import type { SessionSnapshot } from "@/shared/types";

export async function getServerSession(): Promise<SessionSnapshot | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const userId = getSessionUserId(token);
  if (!userId) return null;

  return getSessionUser(userId);
}
