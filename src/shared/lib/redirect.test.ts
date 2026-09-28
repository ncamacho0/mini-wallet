import { describe, expect, it } from "vitest";
import { sanitizeRedirect } from "./redirect";

describe("sanitizeRedirect", () => {
  it("accepts internal paths", () => {
    expect(sanitizeRedirect("/transactions/new")).toBe("/transactions/new");
    expect(sanitizeRedirect("/home?tab=all")).toBe("/home?tab=all");
  });

  it("uses the fallback when there is no value", () => {
    expect(sanitizeRedirect(undefined)).toBe("/home");
    expect(sanitizeRedirect("")).toBe("/home");
  });

  it("rejects absolute URLs (open redirect)", () => {
    expect(sanitizeRedirect("https://evil.example.com")).toBe("/home");
    expect(sanitizeRedirect("//evil.example.com")).toBe("/home");
  });

  it("takes the first value when an array is provided", () => {
    expect(sanitizeRedirect(["/home", "/other"])).toBe("/home");
  });

  it("respects a custom fallback", () => {
    expect(sanitizeRedirect("https://evil.example.com", "/login")).toBe("/login");
  });
});
