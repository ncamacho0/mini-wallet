import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetDb } from "@/server/db";
import { createSessionToken } from "@/server/services/session.service";
import { SESSION_COOKIE } from "@/shared/lib/constants";
import type { ApiError, ContactsResponse, CreateContactResponse } from "@/shared/types";
import { GET, POST } from "./route";

beforeEach(() => {
  resetDb();
  vi.stubEnv("MW_MOCK_LATENCY", "0");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

function contactsRequest(method: "GET" | "POST", options: { body?: unknown; token?: string } = {}) {
  const { body, token } = options;
  return new Request("http://localhost/api/contacts", {
    method,
    headers: {
      "content-type": "application/json",
      "x-fault": "success",
      ...(token ? { cookie: `${SESSION_COOKIE}=${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

describe("GET /api/contacts", () => {
  it("returns 401 without a session", async () => {
    const response = await GET(contactsRequest("GET"));

    expect(response.status).toBe(401);
  });

  it("returns 200 with contacts sorted (favorites first)", async () => {
    const token = createSessionToken("usr_demo_1", "noel@example.com");

    const response = await GET(contactsRequest("GET", { token }));

    expect(response.status).toBe(200);
    const payload = (await response.json()) as ContactsResponse;
    expect(payload.contacts).toHaveLength(4);
    expect(payload.contacts[0]).toMatchObject({ name: "Luis Gómez", isFavorite: true });
  });
});

describe("POST /api/contacts", () => {
  it("returns 201 and persists the new contact", async () => {
    const token = createSessionToken("usr_demo_1", "noel@example.com");

    const response = await POST(
      contactsRequest("POST", {
        token,
        body: { name: "Ana Pérez", phone: "+525598765432" },
      }),
    );

    expect(response.status).toBe(201);
    const payload = (await response.json()) as CreateContactResponse;
    expect(payload.contact).toMatchObject({ name: "Ana Pérez", isFavorite: false });
    expect(payload.contact.id).toMatch(/^cnt_/);
  });

  it("returns 400 with invalid data", async () => {
    const token = createSessionToken("usr_demo_1", "noel@example.com");

    const response = await POST(contactsRequest("POST", { token, body: { name: "A" } }));

    expect(response.status).toBe(400);
    const payload = (await response.json()) as ApiError;
    expect(payload.code).toBe("VALIDATION_ERROR");
  });

  it("returns 401 without a session", async () => {
    const response = await POST(
      contactsRequest("POST", { body: { name: "Ana Pérez", phone: "+525598765432" } }),
    );

    expect(response.status).toBe(401);
  });
});
