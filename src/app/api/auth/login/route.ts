import { NextResponse } from "next/server";
import { loginSchema } from "@/features/auth";
import { LOGIN_FAULTS, faultApiError, resolveFault, sleep } from "@/server/faults";
import { apiErrorResponse, readJsonBody, validationErrorResponse } from "@/server/lib/http";
import { login } from "@/server/services/auth.service";
import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from "@/shared/lib/constants";
import type { LoginResponse } from "@/shared/types";

export async function POST(request: Request) {
  const fault = resolveFault(request, LOGIN_FAULTS, { random: false });
  await sleep(fault.delayMs);

  const faultError = faultApiError(fault.kind);
  if (faultError) return apiErrorResponse(faultError);

  const body = await readJsonBody(request);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return validationErrorResponse(parsed.error);

  const { token, user, account } = login(parsed.data.identifier);

  const response = NextResponse.json<LoginResponse>({ user, account });
  response.cookies.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return response;
}
