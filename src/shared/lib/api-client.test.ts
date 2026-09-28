import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiFetch, ApiClientError } from "./api-client";

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function jsonResponse(body: unknown, status = 200, headers?: HeadersInit) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

describe("apiFetch", () => {
  it("returns the parsed JSON when the response is successful", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ user: { id: "u1" } }));

    const result = await apiFetch<{ user: { id: string } }>("/api/me");

    expect(result).toEqual({ user: { id: "u1" } });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/me",
      expect.objectContaining({ headers: expect.any(Headers) }),
    );
  });

  it("adds Content-Type when there is a body", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ ok: true }, 201));

    await apiFetch("/api/contacts", { method: "POST", body: JSON.stringify({ name: "Ana" }) });

    const [, init] = fetchMock.mock.calls[0] ?? [];
    const headers = new Headers(init?.headers);
    expect(headers.get("Content-Type")).toBe("application/json");
  });

  it("throws ApiClientError with the API code and status", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ code: "INSUFFICIENT_FUNDS", message: "Saldo insuficiente" }, 422),
    );

    const promise = apiFetch("/api/transactions", { method: "POST", body: "{}" });

    await expect(promise).rejects.toBeInstanceOf(ApiClientError);
    await expect(promise).rejects.toMatchObject({
      code: "INSUFFICIENT_FUNDS",
      message: "Saldo insuficiente",
      status: 422,
    });
  });

  it("uses UNKNOWN when the API error is not valid JSON", async () => {
    fetchMock.mockResolvedValue(new Response("<html>error</html>", { status: 500 }));

    await expect(apiFetch("/api/me")).rejects.toMatchObject({
      code: "UNKNOWN",
      status: 500,
    });
  });

  it("maps network failures to NETWORK_ERROR", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(apiFetch("/api/me")).rejects.toMatchObject({
      code: "NETWORK_ERROR",
      status: 0,
    });
  });

  it("maps timeout to TIMEOUT", async () => {
    fetchMock.mockRejectedValue(new DOMException("The operation timed out", "TimeoutError"));

    await expect(apiFetch("/api/me", { timeoutMs: 10 })).rejects.toMatchObject({
      code: "TIMEOUT",
      status: 0,
    });
  });

  it("returns undefined on 204 responses", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    await expect(apiFetch<void>("/api/auth/logout", { method: "POST" })).resolves.toBeUndefined();
  });
});
