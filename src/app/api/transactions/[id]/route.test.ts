import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetDb } from "@/server/db";
import { createSessionToken } from "@/server/services/session.service";
import { SESSION_COOKIE } from "@/shared/lib/constants";
import { GET } from "./route";

beforeEach(() => {
  resetDb();
  vi.stubEnv("MW_MOCK_LATENCY", "0");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

function transactionRequest(id: string, token?: string, fault = "success") {
  return new Request(`http://localhost/api/transactions/${id}`, {
    headers: {
      "x-fault": fault,
      ...(token ? { cookie: `${SESSION_COOKIE}=${token}` } : {}),
    },
  });
}

describe("GET /api/transactions/[id]", () => {
  it("returns 401 without a session", async () => {
    const response = await GET(transactionRequest("txn_seed_1"), {
      params: Promise.resolve({ id: "txn_seed_1" }),
    });

    expect(response.status).toBe(401);
  });

  it("returns the requested transaction", async () => {
    const token = createSessionToken("usr_demo_1", "noel@example.com");

    const response = await GET(transactionRequest("txn_seed_1", token), {
      params: Promise.resolve({ id: "txn_seed_1" }),
    });

    expect(response.status).toBe(200);
    const payload = (await response.json()) as { transaction: { id: string } };
    expect(payload.transaction.id).toBe("txn_seed_1");
  });

  it("returns 404 for a nonexistent transaction", async () => {
    const token = createSessionToken("usr_demo_1", "noel@example.com");

    const response = await GET(transactionRequest("txn_nope", token), {
      params: Promise.resolve({ id: "txn_nope" }),
    });

    expect(response.status).toBe(404);
  });
});
