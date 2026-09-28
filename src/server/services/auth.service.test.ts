import { beforeEach, describe, expect, it } from "vitest";
import { resetDb } from "@/server/db";
import { getSessionUser, login } from "./auth.service";
import { getSessionUserId } from "./session.service";

beforeEach(() => {
  resetDb();
});

describe("login", () => {
  it("logs in as the demo user and returns snapshot + token", () => {
    const result = login("noel@example.com");

    expect(result.user.fullName).toBe("Noel Camacho");
    expect(result.account.balanceMinorUnits).toBeGreaterThan(0);
    expect(result.account.currency).toBe("MXN");
    expect(getSessionUserId(result.token)).toBe(result.user.id);
  });
});

describe("getSessionUser", () => {
  it("returns the snapshot of the authenticated user", () => {
    const result = login("+525512345678");

    expect(getSessionUser(result.user.id)).toMatchObject({
      user: { id: result.user.id },
      account: { userId: result.user.id },
    });
  });

  it("returns null for an unknown user", () => {
    expect(getSessionUser("usr_x")).toBeNull();
  });
});
