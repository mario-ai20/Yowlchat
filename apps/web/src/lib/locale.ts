import { APP_LOCALE_OPTIONS, DEFAULT_APP_LOCALE, type AppLocale } from "@yowl/types";

const STORAGE_KEY = "yowl-locale";

function isAppLocale(value: string | null | undefined): value is AppLocale {
  return APP_LOCALE_OPTIONS.some((option) => option.code === value);
}

export function normalizeLocale(value: string | null | undefined): AppLocale {
  if (!value) {
    return DEFAULT_APP_LOCALE;
  }

  const lower = value.toLowerCase();
  if (isAppLocale(lower)) {
    return lower;
  }

  const matched = APP_LOCALE_OPTIONS.find((option) => lower.startsWith(option.code));
  return matched?.code ?? DEFAULT_APP_LOCALE;
}

export function getBrowserLocale(): AppLocale {
  if (typeof navigator === "undefined") {
    return DEFAULT_APP_LOCALE;
  }

  const candidates = [navigator.language, ...(navigator.languages ?? [])];
  for (const candidate of candidates) {
    const normalized = normalizeLocale(candidate);
    if (normalized) {
      return normalized;
    }
  }

  return DEFAULT_APP_LOCALE;
}

export function getStoredLocale(): AppLocale | null {
  if (typeof window === "undefined") {
    return null;
  }

  const value = window.localStorage.getItem(STORAGE_KEY);
  return value ? normalizeLocale(value) : null;
}

export function setStoredLocale(locale: AppLocale) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, locale);
}

export function getPreferredLocale(fallback?: string | null): AppLocale {
  return normalizeLocale(getStoredLocale() ?? fallback ?? getBrowserLocale());
}

export function applyLocale(locale: AppLocale) {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.lang = locale;
  document.body.dataset.yowlLocale = locale;
}

