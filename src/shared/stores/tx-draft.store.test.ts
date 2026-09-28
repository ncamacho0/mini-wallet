import { beforeEach, describe, expect, it } from "vitest";
import { useTxDraftStore } from "./tx-draft.store";

beforeEach(() => {
  useTxDraftStore.setState({ amountMinorUnits: null, recipient: null, step: "amount" });
});

describe("useTxDraftStore", () => {
  it("stores the amount and advances to recipient", () => {
    useTxDraftStore.getState().setAmount(1_000_000);

    expect(useTxDraftStore.getState().amountMinorUnits).toBe(1_000_000);
    expect(useTxDraftStore.getState().step).toBe("recipient");
  });

  it("stores the recipient and advances to summary", () => {
    useTxDraftStore.getState().setRecipient({ recipientId: "cnt_1", name: "Ana" });

    expect(useTxDraftStore.getState().recipient).toEqual({ recipientId: "cnt_1", name: "Ana" });
    expect(useTxDraftStore.getState().step).toBe("summary");
  });

  it("allows navigating manually between steps", () => {
    useTxDraftStore.getState().setStep("summary");

    expect(useTxDraftStore.getState().step).toBe("summary");
  });

  it("resets the draft", () => {
    useTxDraftStore.getState().setAmount(1_000_000);
    useTxDraftStore.getState().setRecipient({ recipientId: "cnt_1", name: "Ana" });

    useTxDraftStore.getState().reset();

    expect(useTxDraftStore.getState().amountMinorUnits).toBeNull();
    expect(useTxDraftStore.getState().recipient).toBeNull();
    expect(useTxDraftStore.getState().step).toBe("amount");
  });
});
