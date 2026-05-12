import * as React from "react";
import { cn } from "../lib/cn";

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-[color:var(--yowl-border)] bg-[color:var(--yowl-surface)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--yowl-muted)]",
        className
      )}
      {...props}
    />
  );
}
