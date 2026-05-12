import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { YowlUser } from "@yowl/types";

interface SessionState {
  accessToken: string | null;
  refreshToken: string | null;
  user: YowlUser | null;
  setAuth: (payload: { accessToken: string; refreshToken: string; user: YowlUser }) => void;
  updateUser: (user: YowlUser) => void;
  clearAuth: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setAuth: ({ accessToken, refreshToken, user }) =>
        set({
          accessToken,
          refreshToken,
          user
        }),
      updateUser: (user) => set({ user }),
      clearAuth: () => set({ accessToken: null, refreshToken: null, user: null })
    }),
    {
      name: "yowlchat-session"
    }
  )
);
