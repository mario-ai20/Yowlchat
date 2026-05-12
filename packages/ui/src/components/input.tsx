import * as React from "react";
import { cn } from "../lib/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded-2xl border border-[color:var(--yowl-border)] bg-[color:var(--yowl-surface)] px-4 text-sm text-[var(--yowl-text)] outline-none placeholder:text-[var(--yowl-muted)] focus:border-[var(--yowl-primary)]/40 focus:ring-2 focus:ring-[var(--yowl-primary)]/15",
        className
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";
