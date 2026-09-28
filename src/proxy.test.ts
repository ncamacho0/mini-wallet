import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/shared/lib/constants";
import { proxy } from "./proxy";

function nextRequest(path: string, cookie?: string) {
  return new NextRequest(`http://localhost${path}`, {
    headers: cookie ? { cookie } : undefined,
  });
}

describe("proxy", () => {
  it("redirects to /login with the destination when there is no session", () => {
    const response = proxy(nextRequest("/home"));

    expect(response.status).toBe(307);
    const location = new URL(response.headers.get("location") ?? "");
    expect(location.pathname).toBe("/login");
    expect(location.searchParams.get("redirect")).toBe("/home");
  });

  it("preserves the query string in the destination", () => {
    const response = proxy(nextRequest("/transactions/new?step=amount"));

    const location = new URL(response.headers.get("location") ?? "");
    expect(location.searchParams.get("redirect")).toBe("/transactions/new?step=amount");
  });

  it("allows access to /login without a session", () => {
    const response = proxy(nextRequest("/login"));

    expect(response.status).not.toBe(307);
  });

  it("allows access when the session cookie exists", () => {
    const response = proxy(nextRequest("/home", `${SESSION_COOKIE}=token`));

    expect(response.status).not.toBe(307);
  });
});
