import { NextResponse } from "next/server";
import { READ_FAULTS, faultApiError, resolveFault, sleep } from "@/server/faults";
import { apiErrorResponse, unauthorizedResponse } from "@/server/lib/http";
import { getSessionUser } from "@/server/services/auth.service";
import { getAuthenticatedUserId } from "@/server/services/session.service";
import type { MeResponse } from "@/shared/types";

export async function GET(request: Request) {
  const fault = resolveFault(request, READ_FAULTS, { random: false });
  await sleep(fault.delayMs);

  const faultError = faultApiError(fault.kind);
  if (faultError) return apiErrorResponse(faultError);

  const userId = getAuthenticatedUserId(request);
  if (!userId) return unauthorizedResponse();

  const session = getSessionUser(userId);
  if (!session) return unauthorizedResponse();

  return NextResponse.json<MeResponse>(session);
}
