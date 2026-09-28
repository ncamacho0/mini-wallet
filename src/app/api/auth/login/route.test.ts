import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetDb } from "@/server/db";
import { SESSION_COOKIE } from "@/shared/lib/constants";
import type { ApiError, LoginResponse } from "@/shared/types";
import { POST } from "./route";

beforeEach(() => {
  resetDb();
  vi.stubEnv("MW_MOCK_LATENCY", "0");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

function loginRequest(body: unknown, fault = "success") {
  return new Request("http://localhost/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json", "x-fault": fault },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("POST /api/auth/login", () => {
  it("returns 200 with user, account and httpOnly session cookie", async () => {
    const response = await POST(loginRequest({ identifier: "noel@example.com" }));

    expect(response.status).toBe(200);
    const payload = (await response.json()) as LoginResponse;
    expect(payload.user.fullName).toBe("Noel Camacho");
    expect(payload.account.balanceMinorUnits).toBe(2_500_000);

    const setCookie = response.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain(`${SESSION_COOKIE}=`);
    expect(setCookie.toLowerCase()).toContain("httponly");
  });

  it("returns 400 when the identifier is invalid", async () => {
    const response = await POST(loginRequest({ identifier: "abc" }));

    expect(response.status).toBe(400);
    const payload = (await response.json()) as ApiError;
    expect(payload.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 when the body is not JSON", async () => {
    const response = await POST(loginRequest("no-es-json"));

    expect(response.status).toBe(400);
  });

  it("allows forcing invalid credentials with x-fault", async () => {
    const response = await POST(
      loginRequest({ identifier: "noel@example.com" }, "invalid_credentials"),
    );

    expect(response.status).toBe(401);
    const payload = (await response.json()) as ApiError;
    expect(payload.code).toBe("INVALID_CREDENTIALS");
  });

  it("allows forcing a network failure with x-fault", async () => {
    const response = await POST(loginRequest({ identifier: "noel@example.com" }, "network"));

    expect(response.status).toBe(503);
    const payload = (await response.json()) as ApiError;
    expect(payload.code).toBe("NETWORK_ERROR");
  });

  it("allows forcing a timeout with x-fault", async () => {
    vi.stubEnv("MW_MOCK_TIMEOUT_MS", "1");

    const response = await POST(loginRequest({ identifier: "noel@example.com" }, "timeout"));

    expect(response.status).toBe(504);
  });
});
