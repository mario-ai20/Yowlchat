import { cn } from "@yowl/ui";
import { DEFAULT_APP_LOCALE, type AppLocale } from "@yowl/types";

export { cn };

export function formatCompactNumber(value: number, locale: AppLocale = DEFAULT_APP_LOCALE) {
  return new Intl.NumberFormat(locale, {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value);
}

export function timeAgo(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}
