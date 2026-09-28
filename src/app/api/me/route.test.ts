import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetDb } from "@/server/db";
import { createSessionToken } from "@/server/services/session.service";
import { createTransaction } from "@/server/services/transaction.service";
import { SESSION_COOKIE } from "@/shared/lib/constants";
import type { ApiError, MeResponse } from "@/shared/types";
import { GET } from "./route";

beforeEach(() => {
  resetDb();
  vi.stubEnv("MW_MOCK_LATENCY", "0");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

function meRequest(token?: string, fault = "success") {
  return new Request("http://localhost/api/me", {
    headers: {
      "x-fault": fault,
      ...(token ? { cookie: `${SESSION_COOKIE}=${token}` } : {}),
    },
  });
}

describe("GET /api/me", () => {
  it("returns 401 without a session", async () => {
    const response = await GET(meRequest());

    expect(response.status).toBe(401);
    const payload = (await response.json()) as ApiError;
    expect(payload.code).toBe("INVALID_CREDENTIALS");
  });

  it("returns 401 with an invalid token", async () => {
    const response = await GET(meRequest("token-invalido"));

    expect(response.status).toBe(401);
  });

  it("returns 200 with user and balance for a valid session", async () => {
    const token = createSessionToken("usr_demo_1", "noel@example.com");

    const response = await GET(meRequest(token));

    expect(response.status).toBe(200);
    const payload = (await response.json()) as MeResponse;
    expect(payload.user.fullName).toBe("Noel Camacho");
    expect(payload.account.balanceMinorUnits).toBe(2_500_000);
  });

  it("reflects the updated balance after a transaction", async () => {
    const token = createSessionToken("usr_demo_1", "noel@example.com");
    createTransaction({ amountMinorUnits: 1_000_000, recipientId: "cnt_1001" });

    const response = await GET(meRequest(token));

    const payload = (await response.json()) as MeResponse;
    expect(payload.account.balanceMinorUnits).toBe(1_500_000);
  });

  it("allows forcing a network error with x-fault", async () => {
    const token = createSessionToken("usr_demo_1", "noel@example.com");

    const response = await GET(meRequest(token, "network"));

    expect(response.status).toBe(503);
  });
});
