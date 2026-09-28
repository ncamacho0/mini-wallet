import { create } from "zustand";
import type { Account, SessionSnapshot, User } from "@/shared/types";

interface SessionState {
  user: User | null;
  account: Account | null;
  setSession: (snapshot: SessionSnapshot) => void;
  clear: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  account: null,
  setSession: ({ user, account }) => set({ user, account }),
  clear: () => set({ user: null, account: null }),
}));
