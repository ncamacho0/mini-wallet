import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { db, resetDb } from "@/server/db";
import { createSessionToken } from "@/server/services/session.service";
import { SESSION_COOKIE } from "@/shared/lib/constants";
import type { ApiError, CreateTransactionResponse, TransactionsResponse } from "@/shared/types";
import { GET, POST } from "./route";

beforeEach(() => {
  resetDb();
  vi.stubEnv("MW_MOCK_LATENCY", "0");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

function transactionsRequest(
  method: "GET" | "POST",
  options: { body?: unknown; token?: string; query?: string; fault?: string } = {},
) {
  const { body, token, query = "", fault = "success" } = options;
  return new Request(`http://localhost/api/transactions${query}`, {
    method,
    headers: {
      "content-type": "application/json",
      "x-fault": fault,
      ...(token ? { cookie: `${SESSION_COOKIE}=${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

describe("GET /api/transactions", () => {
  it("returns 401 without a session", async () => {
    const response = await GET(transactionsRequest("GET"));

    expect(response.status).toBe(401);
  });

  it("returns 200 with transactions sorted and respects limit", async () => {
    const token = createSessionToken("usr_demo_1", "noel@example.com");

    const response = await GET(transactionsRequest("GET", { token, query: "?limit=2" }));

    expect(response.status).toBe(200);
    const payload = (await response.json()) as TransactionsResponse;
    expect(payload.transactions).toHaveLength(2);
    expect(payload.transactions[0].id).toBe("txn_seed_1");
  });

  it("returns 400 with an invalid limit", async () => {
    const token = createSessionToken("usr_demo_1", "noel@example.com");

    const response = await GET(transactionsRequest("GET", { token, query: "?limit=0" }));

    expect(response.status).toBe(400);
  });
});

describe("POST /api/transactions", () => {
  it("returns 201, debits the balance and returns the receipt", async () => {
    const token = createSessionToken("usr_demo_1", "noel@example.com");

    const response = await POST(
      transactionsRequest("POST", {
        token,
        body: { amountMinorUnits: 1_000_000, recipientId: "cnt_1001" },
      }),
    );

    expect(response.status).toBe(201);
    const payload = (await response.json()) as CreateTransactionResponse;
    expect(payload.transaction).toMatchObject({
      status: "completed",
      recipientName: "Luis Gómez",
      amountMinorUnits: 1_000_000,
    });
    expect(db.account.balanceMinorUnits).toBe(1_500_000);
  });

  it("returns 422 with a real insufficient balance", async () => {
    const token = createSessionToken("usr_demo_1", "noel@example.com");
    const before = db.account.balanceMinorUnits;

    const response = await POST(
      transactionsRequest("POST", {
        token,
        body: { amountMinorUnits: before + 1, recipientId: "cnt_1001" },
      }),
    );

    expect(response.status).toBe(422);
    const payload = (await response.json()) as ApiError;
    expect(payload.code).toBe("INSUFFICIENT_FUNDS");
    expect(db.account.balanceMinorUnits).toBe(before);
  });

  it("allows forcing insufficient funds with x-fault without touching the balance", async () => {
    const token = createSessionToken("usr_demo_1", "noel@example.com");
    const before = db.account.balanceMinorUnits;

    const response = await POST(
      transactionsRequest("POST", {
        token,
        fault: "insufficient_funds",
        body: { amountMinorUnits: 1_000_000, recipientId: "cnt_1001" },
      }),
    );

    expect(response.status).toBe(422);
    expect(db.account.balanceMinorUnits).toBe(before);
  });

  it("returns 400 with an invalid body", async () => {
    const token = createSessionToken("usr_demo_1", "noel@example.com");

    const response = await POST(
      transactionsRequest("POST", {
        token,
        body: { amountMinorUnits: 0, recipientId: "cnt_1001" },
      }),
    );

    expect(response.status).toBe(400);
    const payload = (await response.json()) as ApiError;
    expect(payload.code).toBe("VALIDATION_ERROR");
  });

  it("allows forcing an unknown error with x-fault", async () => {
    const token = createSessionToken("usr_demo_1", "noel@example.com");

    const response = await POST(
      transactionsRequest("POST", {
        token,
        fault: "unknown",
        body: { amountMinorUnits: 1_000_000, recipientId: "cnt_1001" },
      }),
    );

    expect(response.status).toBe(500);
    const payload = (await response.json()) as ApiError;
    expect(payload.code).toBe("UNKNOWN");
  });
});
