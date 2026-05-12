"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
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
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);

  const currentLabel = APP_LOCALE_OPTIONS.find((option) => option.code === value)?.label ?? value;

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (target && menuRef.current && !menuRef.current.contains(target)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [value]);

  return (
    <div ref={menuRef} className={cn("relative inline-flex flex-col items-start gap-1.5", className)}>
      <span className="text-[11px] font-semibold uppercase tracking-[0.26em] text-white/46">{label}</span>
      <button
        id={selectId}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="inline-flex appearance-none items-center gap-1 border-0 bg-transparent px-0 py-0 text-sm font-semibold text-white/86 shadow-none transition hover:text-white focus:outline-none"
      >
        <span>{currentLabel}</span>
        <ChevronDown className="h-4 w-4 text-white/52" />
      </button>
      {helper ? <p className="text-xs text-white/42">{helper}</p> : null}

      {open ? (
        <div className="absolute bottom-full left-0 z-30 mb-2 w-[min(280px,calc(100vw-1rem))] overflow-hidden rounded-[22px] border border-white/10 bg-[rgba(18,10,26,0.98)] p-1 shadow-[0_24px_70px_rgba(0,0,0,0.42)] backdrop-blur-2xl">
          <div className="px-3 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/36">Taal kiezen</p>
          </div>
          <div role="listbox" aria-label={label} className="max-h-72 overflow-auto">
            {APP_LOCALE_OPTIONS.map((option) => {
              const active = option.code === value;
              return (
                <button
                  key={option.code}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    onChange(option.code);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-[16px] px-3 py-3 text-left text-sm transition",
                    active ? "bg-white/12 text-white" : "text-white/72 hover:bg-white/6 hover:text-white"
                  )}
                >
                  <span>{option.label}</span>
                  {active ? <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#d8b4fe]">Actief</span> : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
