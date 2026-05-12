import * as React from "react";
import { cn } from "../lib/cn";

export function GlassPanel({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[32px] border border-[color:var(--yowl-border)] bg-[color:var(--yowl-surface)] shadow-[0_30px_120px_rgba(0,0,0,0.32)] backdrop-blur-3xl",
        className
      )}
      {...props}
    />
  );
}
