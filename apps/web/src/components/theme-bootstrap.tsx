"use client";

import { useEffect } from "react";

const THEME_KEY = "yowl-theme";

function applyTheme(theme: "light" | "dark") {
  document.documentElement.dataset.yowlTheme = theme;
  document.documentElement.style.colorScheme = theme;
  document.body.dataset.yowlTheme = theme;
}

export function ThemeBootstrap() {
  useEffect(() => {
    const storedTheme = window.localStorage.getItem(THEME_KEY) === "light" ? "light" : "dark";
    applyTheme(storedTheme);

    const onStorage = (event: StorageEvent) => {
      if (event.key !== THEME_KEY) return;
      const nextTheme = event.newValue === "light" ? "light" : "dark";
      applyTheme(nextTheme);
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return null;
}
