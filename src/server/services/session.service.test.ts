import { beforeEach, describe, expect, it } from "vitest";
import { db, resetDb } from "@/server/db";
import { SESSION_COOKIE } from "@/shared/lib/constants";
import {
  createSessionToken,
  destroySession,
  getAuthenticatedUserId,
  getSessionToken,
  getSessionUserId,
} from "./session.service";

beforeEach(() => {
  resetDb();
});

describe("sessions", () => {
  it("creates a token associated with the user and stores the identifier used", () => {
    const token = createSessionToken("usr_demo_1", "noel@example.com");

    expect(db.sessions.get(token)).toMatchObject({
      userId: "usr_demo_1",
      identifier: "noel@example.com",
    });
    expect(getSessionUserId(token)).toBe("usr_demo_1");
  });

  it("returns null for nonexistent tokens", () => {
    expect(getSessionUserId("token-invalido")).toBeNull();
  });

  it("destroys the session", () => {
    const token = createSessionToken("usr_demo_1", "+525512345678");

    destroySession(token);

    expect(getSessionUserId(token)).toBeNull();
  });

  it("extracts the token from the request cookie", () => {
    const request = new Request("http://localhost/api/me", {
      headers: { cookie: `foo=bar; ${SESSION_COOKIE}=tok_123; baz=qux` },
    });

    expect(getSessionToken(request)).toBe("tok_123");
  });

  it("returns null when the request has no cookies", () => {
    expect(getSessionToken(new Request("http://localhost/api/me"))).toBeNull();
  });

  it("authenticates a request with a valid session", () => {
    const token = createSessionToken("usr_demo_1", "noel@example.com");
    const request = new Request("http://localhost/api/me", {
      headers: { cookie: `${SESSION_COOKIE}=${token}` },
    });

    expect(getAuthenticatedUserId(request)).toBe("usr_demo_1");
  });

  it("does not authenticate a request with an invalid token", () => {
    const request = new Request("http://localhost/api/me", {
      headers: { cookie: `${SESSION_COOKIE}=invalid` },
    });

    expect(getAuthenticatedUserId(request)).toBeNull();
  });
});
