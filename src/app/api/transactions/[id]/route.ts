import { NextResponse } from "next/server";
import { READ_FAULTS, faultApiError, resolveFault, sleep } from "@/server/faults";
import { apiErrorResponse, unauthorizedResponse } from "@/server/lib/http";
import { db } from "@/server/db";
import { getAuthenticatedUserId } from "@/server/services/session.service";
import type { CreateTransactionResponse } from "@/shared/types";

export async function GET(request: Request, context: RouteContext<"/api/transactions/[id]">) {
  const fault = resolveFault(request, READ_FAULTS, { random: false });
  await sleep(fault.delayMs);

  const faultError = faultApiError(fault.kind);
  if (faultError) return apiErrorResponse(faultError);

  const userId = getAuthenticatedUserId(request);
  if (!userId) return unauthorizedResponse();

  const { id } = await context.params;
  const transaction = db.transactions.find((item) => item.id === id);
  if (!transaction) {
    return apiErrorResponse({ code: "UNKNOWN", message: "Transacción no encontrada" }, 404);
  }

  return NextResponse.json<CreateTransactionResponse>({ transaction });
}
