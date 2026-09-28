export type ErrorCode =
  | "VALIDATION_ERROR"
  | "INVALID_CREDENTIALS"
  | "RECIPIENT_REQUIRED"
  | "AMOUNT_INVALID"
  | "INSUFFICIENT_FUNDS"
  | "RATE_LIMITED"
  | "NETWORK_ERROR"
  | "TIMEOUT"
  | "UNKNOWN";

export interface ApiError {
  code: ErrorCode;
  /** Mensaje apto para mostrar al usuario */
  message: string;
  /** Detalle técnico opcional (ej. issues de Zod) */
  details?: unknown;
}
