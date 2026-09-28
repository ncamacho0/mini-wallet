import { beforeEach, describe, expect, it } from "vitest";
import { resetDb } from "@/server/db";
import { getSessionUserId } from "@/server/services/session.service";
import { createSessionToken } from "@/server/services/session.service";
import { SESSION_COOKIE } from "@/shared/lib/constants";
import { POST } from "./route";

beforeEach(() => {
  resetDb();
});

function logoutRequest(token?: string) {
  return new Request("http://localhost/api/auth/logout", {
    method: "POST",
    headers: token ? { cookie: `${SESSION_COOKIE}=${token}` } : {},
  });
}

describe("POST /api/auth/logout", () => {
  it("returns 204 and expires the session cookie", async () => {
    const response = await POST(logoutRequest());

    expect(response.status).toBe(204);
    expect(response.headers.get("set-cookie")).toContain(SESSION_COOKIE);
  });

  it("destroys the active session", async () => {
    const token = createSessionToken("usr_demo_1", "noel@example.com");

    const response = await POST(logoutRequest(token));

    expect(response.status).toBe(204);
    expect(getSessionUserId(token)).toBeNull();
  });
});
