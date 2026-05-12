import { create } from "zustand";
import type { YowlUser } from "@yowl/types";

interface SessionState {
  user: YowlUser | null;
  hydrated: boolean;
  setAuth: (user: YowlUser) => void;
  updateUser: (user: YowlUser) => void;
  setHydrated: (hydrated: boolean) => void;
  clearAuth: () => void;
}

export const useSessionStore = create<SessionState>()((set) => ({
  user: null,
  hydrated: false,
  setAuth: (user) => set({ user, hydrated: true }),
  updateUser: (user) => set({ user }),
  setHydrated: (hydrated) => set({ hydrated }),
  clearAuth: () => set({ user: null, hydrated: true })
}));
