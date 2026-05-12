"use client";

import { useEffect } from "react";
import type { YowlUser } from "@yowl/types";
import { apiFetch } from "../lib/api";
import { useSessionStore } from "../store/session";

function applyTheme(theme: "light" | "dark") {
  document.documentElement.dataset.yowlTheme = theme;
  document.documentElement.style.colorScheme = theme;
  document.body.dataset.yowlTheme = theme;
}

export function ThemeBootstrap() {
  const sessionUser = useSessionStore((state) => state.user);
  const setAuth = useSessionStore((state) => state.setAuth);
  const clearAuth = useSessionStore((state) => state.clearAuth);
  const setHydrated = useSessionStore((state) => state.setHydrated);

  useEffect(() => {
    applyTheme(sessionUser?.theme ?? "dark");
  }, [sessionUser?.theme]);

  useEffect(() => {
    let cancelled = false;

    apiFetch<{ user: YowlUser }>("/auth/me")
      .then((response) => {
        if (!cancelled) {
          setAuth(response.user);
        }
      })
      .catch(() => {
        if (!cancelled) {
          clearAuth();
        }
      })
      .finally(() => {
        if (!cancelled) {
          setHydrated(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [clearAuth, setAuth, setHydrated]);

  return null;
}
