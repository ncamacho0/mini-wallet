import { create } from "zustand";

export type WizardStep = "amount" | "recipient" | "summary" | "result";

export interface Recipient {
  recipientId: string;
  name: string;
}

interface TxDraftState {
  amountMinorUnits: number | null;
  recipient: Recipient | null;
  step: WizardStep;
  setAmount: (amountMinorUnits: number) => void;
  setRecipient: (recipient: Recipient) => void;
  setStep: (step: WizardStep) => void;
  reset: () => void;
}

const initialState = {
  amountMinorUnits: null,
  recipient: null,
  step: "amount" as WizardStep,
};

export const useTxDraftStore = create<TxDraftState>((set) => ({
  ...initialState,
  setAmount: (amountMinorUnits) => set({ amountMinorUnits, step: "recipient" }),
  setRecipient: (recipient) => set({ recipient, step: "summary" }),
  setStep: (step) => set({ step }),
  reset: () => set(initialState),
}));
