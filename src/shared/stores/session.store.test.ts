import { beforeEach, describe, expect, it } from "vitest";
import { useSessionStore } from "./session.store";

beforeEach(() => {
  useSessionStore.setState({ user: null, account: null });
});

describe("useSessionStore", () => {
  it("stores the session snapshot", () => {
    useSessionStore.getState().setSession({
      user: { id: "usr_1", fullName: "Noel Camacho" },
      account: { id: "acc_1", userId: "usr_1", balanceMinorUnits: 2_500_000, currency: "MXN" },
    });

    expect(useSessionStore.getState().user?.fullName).toBe("Noel Camacho");
    expect(useSessionStore.getState().account?.balanceMinorUnits).toBe(2_500_000);
  });

  it("clears the session", () => {
    useSessionStore.getState().setSession({
      user: { id: "usr_1", fullName: "Noel Camacho" },
      account: { id: "acc_1", userId: "usr_1", balanceMinorUnits: 1, currency: "MXN" },
    });

    useSessionStore.getState().clear();

    expect(useSessionStore.getState().user).toBeNull();
    expect(useSessionStore.getState().account).toBeNull();
  });
});
