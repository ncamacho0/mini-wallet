import type { ApiError, ErrorCode } from "@/shared/types";

export class ApiClientError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly details?: unknown;

  constructor(code: ErrorCode, message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiClientError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export interface ApiFetchOptions extends RequestInit {
  timeoutMs?: number;
}

const DEFAULT_TIMEOUT_MS = 8_000;

function errorName(error: unknown): string | undefined {
  if (typeof error === "object" && error !== null && "name" in error) {
    return String((error as { name: unknown }).name);
  }
  return undefined;
}

function isApiErrorShape(data: unknown): data is ApiError {
  if (typeof data !== "object" || data === null) return false;
  const candidate = data as Partial<ApiError>;
  return typeof candidate.code === "string" && typeof candidate.message === "string";
}

async function parseApiError(response: Response): Promise<ApiError> {
  const fallback: ApiError = {
    code: "UNKNOWN",
    message: "Ocurrió un error inesperado. Intenta de nuevo.",
  };

  try {
    const data = await response.json();
    return isApiErrorShape(data) ? data : fallback;
  } catch {
    return fallback;
  }
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, headers: rawHeaders, body, ...init } = options;

  const headers = new Headers(rawHeaders);
  if (body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(path, {
      ...init,
      body,
      headers,
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    if (errorName(error) === "TimeoutError") {
      throw new ApiClientError(
        "TIMEOUT",
        "La operación tardó demasiado. Verifica tu conexión e intenta de nuevo.",
        0,
      );
    }
    throw new ApiClientError(
      "NETWORK_ERROR",
      "No pudimos conectar con el servidor. Verifica tu conexión e intenta de nuevo.",
      0,
    );
  }

  if (!response.ok) {
    const apiError = await parseApiError(response);
    throw new ApiClientError(apiError.code, apiError.message, response.status, apiError.details);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
