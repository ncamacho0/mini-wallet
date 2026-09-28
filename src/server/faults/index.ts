import type { ApiError } from "@/shared/types";

export const FAULT_HEADER = "x-fault";

export type FaultKind =
  "success" | "network" | "timeout" | "unknown" | "insufficient_funds" | "invalid_credentials";

export type FaultWeights = Partial<Record<FaultKind, number>>;

export interface FaultDecision {
  kind: FaultKind;
  delayMs: number;
}

const FAULT_KINDS: readonly FaultKind[] = [
  "success",
  "network",
  "timeout",
  "unknown",
  "insufficient_funds",
  "invalid_credentials",
];

export const READ_FAULTS: FaultWeights = {
  success: 88,
  network: 5,
  timeout: 4,
  unknown: 3,
};

export const WRITE_FAULTS: FaultWeights = {
  success: 85,
  network: 6,
  timeout: 5,
  unknown: 4,
};

export const LOGIN_FAULTS: FaultWeights = {
  success: 85,
  network: 6,
  timeout: 5,
  unknown: 4,
  invalid_credentials: 0,
};

export const TRANSACTION_FAULTS: FaultWeights = {
  success: 68,
  network: 8,
  timeout: 7,
  unknown: 7,
  insufficient_funds: 10,
};

const MIN_LATENCY_MS = 120;
const MAX_LATENCY_MS = 450;
const DEFAULT_TIMEOUT_MS = 6_000;

function isFaultKind(value: string): value is FaultKind {
  return (FAULT_KINDS as readonly string[]).includes(value);
}

function latencyScale(): number {
  const parsed = Number(process.env.MW_MOCK_LATENCY ?? "1");
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 1;
}

function timeoutDelayMs(): number {
  const parsed = Number(process.env.MW_MOCK_TIMEOUT_MS ?? String(DEFAULT_TIMEOUT_MS));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : DEFAULT_TIMEOUT_MS;
}

function randomDelayMs(): number {
  const span = MAX_LATENCY_MS - MIN_LATENCY_MS;
  return Math.round((MIN_LATENCY_MS + Math.random() * span) * latencyScale());
}

function pickWeightedKind(weights: FaultWeights): FaultKind {
  const entries = (Object.entries(weights) as Array<[FaultKind, number]>).filter(
    ([, weight]) => weight > 0,
  );
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);

  if (entries.length === 0 || total <= 0) return "success";

  let threshold = Math.random() * total;
  for (const [kind, weight] of entries) {
    threshold -= weight;
    if (threshold < 0) return kind;
  }
  return entries[entries.length - 1][0];
}

export interface ResolveFaultOptions {
  /**
   * Si es `false`, el endpoint responde siempre `success` sin latencia salvo que
   * se fuerce un fault determinista con el header `x-fault`. Se usa en todos los
   * endpoints excepto la confirmación de transferencia (POST /api/transactions).
   */
  random?: boolean;
}

export function resolveFault(
  request: Request,
  weights: FaultWeights = WRITE_FAULTS,
  options: ResolveFaultOptions = {},
): FaultDecision {
  const { random = true } = options;
  const forced = request.headers.get(FAULT_HEADER);

  if (forced && isFaultKind(forced) && weights[forced] !== undefined) {
    return { kind: forced, delayMs: forced === "timeout" ? timeoutDelayMs() : 0 };
  }

  if (!random) {
    return { kind: "success", delayMs: 0 };
  }

  const kind = pickWeightedKind(weights);
  return { kind, delayMs: kind === "timeout" ? timeoutDelayMs() : randomDelayMs() };
}

export function faultApiError(kind: FaultKind): ApiError | null {
  switch (kind) {
    case "success":
      return null;
    case "network":
      return {
        code: "NETWORK_ERROR",
        message: "Se perdió la conexión con el servidor. Intenta de nuevo.",
      };
    case "timeout":
      return {
        code: "TIMEOUT",
        message: "El servidor tardó demasiado en responder. Intenta de nuevo.",
      };
    case "unknown":
      return {
        code: "UNKNOWN",
        message: "Ocurrió un error inesperado. Intenta de nuevo.",
      };
    case "insufficient_funds":
      return {
        code: "INSUFFICIENT_FUNDS",
        message: "Saldo insuficiente para realizar esta transacción",
      };
    case "invalid_credentials":
      return {
        code: "INVALID_CREDENTIALS",
        message: "Credenciales inválidas",
      };
  }
}

export function sleep(ms: number): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}
