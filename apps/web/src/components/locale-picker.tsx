"use client";

import { useId } from "react";
import { ChevronDown, Globe2 } from "lucide-react";
import { APP_LOCALE_OPTIONS, type AppLocale } from "@yowl/types";
import { cn } from "@yowl/ui";

export function LocalePicker({
  value,
  onChange,
  label = "Taal",
  helper = "Kies de taal voor je hele app",
  className
}: {
  value: AppLocale;
  onChange: (locale: AppLocale) => void;
  label?: string;
  helper?: string;
  className?: string;
}) {
  const selectId = useId();

  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={selectId} className="flex items-center gap-2 text-[13px] font-semibold text-white/72">
        <Globe2 className="h-4 w-4 text-[#d8b4fe]" />
        {label}
      </label>
      <div className="relative">
        <select
          id={selectId}
          value={value}
          onChange={(event) => onChange(event.target.value as AppLocale)}
          className={cn(
            "h-12 w-full appearance-none rounded-[14px] border border-white/10 bg-white/5 px-4 pr-10 text-sm font-medium text-white outline-none transition",
            "focus:border-[#c084fc]/60 focus:ring-2 focus:ring-[#c084fc]/20"
          )}
        >
          {APP_LOCALE_OPTIONS.map((option) => (
            <option key={option.code} value={option.code} className="bg-[#1a1029] text-white">
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
      </div>
      {helper ? <p className="text-xs text-white/45">{helper}</p> : null}
    </div>
  );
}
