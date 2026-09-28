import { NextResponse } from "next/server";
import {
  TRANSACTION_FAULTS,
  READ_FAULTS,
  faultApiError,
  resolveFault,
  sleep,
} from "@/server/faults";
import {
  apiErrorResponse,
  readJsonBody,
  unauthorizedResponse,
  validationErrorResponse,
} from "@/server/lib/http";
import { getAuthenticatedUserId } from "@/server/services/session.service";
import { createTransaction, listTransactions } from "@/server/services/transaction.service";
import { createTransactionSchema, listTransactionsQuerySchema } from "@/features/transactions";
import type { CreateTransactionResponse, TransactionsResponse } from "@/shared/types";

export async function GET(request: Request) {
  const fault = resolveFault(request, READ_FAULTS, { random: false });
  await sleep(fault.delayMs);

  const faultError = faultApiError(fault.kind);
  if (faultError) return apiErrorResponse(faultError);

  const userId = getAuthenticatedUserId(request);
  if (!userId) return unauthorizedResponse();

  const url = new URL(request.url);
  const parsed = listTransactionsQuerySchema.safeParse({
    limit: url.searchParams.get("limit") ?? undefined,
  });
  if (!parsed.success) return validationErrorResponse(parsed.error);

  return NextResponse.json<TransactionsResponse>({
    transactions: listTransactions(parsed.data.limit),
  });
}

export async function POST(request: Request) {
  const fault = resolveFault(request, TRANSACTION_FAULTS);
  await sleep(fault.delayMs);

  const faultError = faultApiError(fault.kind);
  if (faultError) return apiErrorResponse(faultError);

  const userId = getAuthenticatedUserId(request);
  if (!userId) return unauthorizedResponse();

  const body = await readJsonBody(request);
  const parsed = createTransactionSchema.safeParse(body);
  if (!parsed.success) return validationErrorResponse(parsed.error);

  const result = createTransaction(parsed.data);
  if (!result.ok) return apiErrorResponse(result.error);

  return NextResponse.json<CreateTransactionResponse>(
    { transaction: result.transaction },
    { status: 201 },
  );
}
