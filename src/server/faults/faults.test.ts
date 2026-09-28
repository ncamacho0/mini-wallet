import { afterEach, describe, expect, it, vi } from "vitest";
import {
  FAULT_HEADER,
  faultApiError,
  LOGIN_FAULTS,
  READ_FAULTS,
  resolveFault,
  TRANSACTION_FAULTS,
  type FaultKind,
} from "./index";

function requestWithFault(kind: string): Request {
  return new Request("http://localhost/api/test", { headers: { [FAULT_HEADER]: kind } });
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("resolveFault", () => {
  it("respects a header-forced fault without random latency", () => {
    for (const kind of ["success", "network", "unknown"] as const) {
      expect(resolveFault(requestWithFault(kind))).toEqual({ kind, delayMs: 0 });
    }
  });

  it("uses the configurable latency for the timeout fault", () => {
    vi.stubEnv("MW_MOCK_TIMEOUT_MS", "1234");

    expect(resolveFault(requestWithFault("timeout"))).toEqual({
      kind: "timeout",
      delayMs: 1234,
    });
  });

  it("ignores a forced fault that does not apply to the endpoint", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);

    const decision = resolveFault(requestWithFault("insufficient_funds"), READ_FAULTS);

    expect(decision.kind).not.toBe("insufficient_funds");
  });

  it("ignores a header with an unknown value and falls back to random selection", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);

    expect(resolveFault(requestWithFault("explode")).kind).toBe("success");
  });

  it("selects in a weighted way according to Math.random", () => {
    const random = vi.spyOn(Math, "random");

    random.mockReturnValue(0);
    expect(resolveFault(requestWithFault("nope"), TRANSACTION_FAULTS).kind).toBe("success");

    random.mockReturnValue(0.999);
    expect(resolveFault(requestWithFault("nope"), TRANSACTION_FAULTS).kind).toBe(
      "insufficient_funds",
    );
  });

  it("applies MW_MOCK_LATENCY to the random latency", () => {
    vi.stubEnv("MW_MOCK_LATENCY", "0");
    vi.spyOn(Math, "random").mockReturnValue(0.5);

    const decision = resolveFault(requestWithFault("nope"), LOGIN_FAULTS);

    expect(decision.delayMs).toBe(0);
  });

  it("returns success when no weight is positive", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);

    const decision = resolveFault(requestWithFault("nope"), { network: 0, timeout: 0 });

    expect(decision).toEqual({ kind: "success", delayMs: expect.any(Number) });
  });

  it("returns success without latency when random=false", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.999);

    expect(resolveFault(requestWithFault("nope"), READ_FAULTS, { random: false })).toEqual({
      kind: "success",
      delayMs: 0,
    });
  });

  it("still respects a forced fault when random=false", () => {
    expect(resolveFault(requestWithFault("network"), READ_FAULTS, { random: false })).toEqual({
      kind: "network",
      delayMs: 0,
    });
  });
});

describe("faultApiError", () => {
  it("maps each fault to its ApiError (or null on success)", () => {
    expect(faultApiError("success")).toBeNull();
    expect(faultApiError("network")).toMatchObject({ code: "NETWORK_ERROR" });
    expect(faultApiError("timeout")).toMatchObject({ code: "TIMEOUT" });
    expect(faultApiError("unknown")).toMatchObject({ code: "UNKNOWN" });
    expect(faultApiError("insufficient_funds")).toMatchObject({ code: "INSUFFICIENT_FUNDS" });
    expect(faultApiError("invalid_credentials")).toMatchObject({ code: "INVALID_CREDENTIALS" });
  });

  it("covers all defined FaultKinds", () => {
    const kinds: FaultKind[] = [
      "success",
      "network",
      "timeout",
      "unknown",
      "insufficient_funds",
      "invalid_credentials",
    ];

    for (const kind of kinds) {
      const error = faultApiError(kind);
      if (kind !== "success") {
        expect(error?.message.length).toBeGreaterThan(0);
      }
    }
  });
});
