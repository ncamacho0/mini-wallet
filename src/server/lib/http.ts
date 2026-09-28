import { NextResponse } from "next/server";
import type { ZodError } from "zod";
import type { ApiError, ErrorCode } from "@/shared/types";

const STATUS_BY_CODE: Record<ErrorCode, number> = {
  VALIDATION_ERROR: 400,
  INVALID_CREDENTIALS: 401,
  RECIPIENT_REQUIRED: 422,
  AMOUNT_INVALID: 422,
  INSUFFICIENT_FUNDS: 422,
  RATE_LIMITED: 429,
  NETWORK_ERROR: 503,
  TIMEOUT: 504,
  UNKNOWN: 500,
};

export function apiErrorResponse(error: ApiError, status?: number) {
  return NextResponse.json<ApiError>(error, { status: status ?? STATUS_BY_CODE[error.code] });
}

export function unauthorizedResponse() {
  return apiErrorResponse(
    { code: "INVALID_CREDENTIALS", message: "Sesión no válida o expirada" },
    401,
  );
}

export function validationErrorResponse(error?: ZodError) {
  return apiErrorResponse(
    {
      code: "VALIDATION_ERROR",
      message: "Los datos enviados no son válidos",
      details: error?.issues,
    },
    400,
  );
}

export async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}
