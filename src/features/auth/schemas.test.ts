import { describe, expect, it } from "vitest";
import { loginSchema } from "./schemas";

describe("loginSchema", () => {
  it("accepts a valid email", () => {
    const result = loginSchema.safeParse({ identifier: "user@example.com" });
    expect(result.success).toBe(true);
  });

  it("accepts a valid phone with E.164 format", () => {
    expect(loginSchema.safeParse({ identifier: "+525512345678" }).success).toBe(true);
  });

  it("accepts a phone with spaces and dashes", () => {
    expect(loginSchema.safeParse({ identifier: "300 123-4567" }).success).toBe(true);
  });

  it("trims spaces from the identifier", () => {
    const result = loginSchema.safeParse({ identifier: "  user@example.com  " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.identifier).toBe("user@example.com");
    }
  });

  it("rejects an empty field (required)", () => {
    const result = loginSchema.safeParse({ identifier: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Ingresa tu teléfono o email");
    }
  });

  it("rejects text that is neither email nor phone", () => {
    expect(loginSchema.safeParse({ identifier: "abc" }).success).toBe(false);
    expect(loginSchema.safeParse({ identifier: "user@" }).success).toBe(false);
    expect(loginSchema.safeParse({ identifier: "12345" }).success).toBe(false);
  });

  it("rejects a missing identifier", () => {
    expect(loginSchema.safeParse({}).success).toBe(false);
  });
});
