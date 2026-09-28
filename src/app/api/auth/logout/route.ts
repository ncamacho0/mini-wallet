import { NextResponse } from "next/server";
import { destroySession, getSessionToken } from "@/server/services/session.service";
import { SESSION_COOKIE } from "@/shared/lib/constants";

export async function POST(request: Request) {
  const token = getSessionToken(request);
  if (token) {
    destroySession(token);
  }

  const response = new NextResponse(null, { status: 204 });
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
