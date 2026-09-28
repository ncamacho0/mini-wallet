import { describe, expect, it } from "vitest";
import { formatCurrency, formatDate, formatSignedCurrency } from "./format";

describe("formatCurrency", () => {
  it("formats MXN cents as Mexican pesos", () => {
    expect(formatCurrency(2_500_000)).toContain("25,000");
    expect(formatCurrency(1_000)).toContain("10");
  });

  it("accepts another currency", () => {
    expect(formatCurrency(100_000, "USD")).toContain("1,000");
  });
});

describe("formatSignedCurrency", () => {
  it("uses a negative sign for outgoing transfers", () => {
    const text = formatSignedCurrency(100_000, "transfer_out");
    expect(text.startsWith("-")).toBe(true);
  });

  it("uses a positive sign for incoming transfers and recharges", () => {
    expect(formatSignedCurrency(100_000, "transfer_in").startsWith("+")).toBe(true);
    expect(formatSignedCurrency(100_000, "recharge").startsWith("+")).toBe(true);
  });
});

describe("formatDate", () => {
  it("formats an ISO date into readable text", () => {
    const text = formatDate("2026-09-26T10:30:00.000Z");
    expect(text).toMatch(/2026/);
    expect(text).toMatch(/sep|sept/i);
  });
});
