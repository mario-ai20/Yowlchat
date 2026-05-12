import * as React from "react";
import { cn } from "../lib/cn";

type ButtonVariant = "default" | "ghost" | "outline" | "glass" | "destructive";

const variantClasses: Record<ButtonVariant, string> = {
  default: "bg-[var(--yowl-primary)] text-black shadow-[0_0_36px_var(--yowl-glow)] hover:brightness-105",
  ghost: "bg-transparent text-[var(--yowl-text)] hover:bg-[color:var(--yowl-surface-strong)]",
  outline: "border border-[color:var(--yowl-border)] bg-[color:var(--yowl-surface)] text-[var(--yowl-text)] hover:bg-[color:var(--yowl-surface-strong)]",
  glass: "border border-[color:var(--yowl-border)] bg-[color:var(--yowl-surface)] text-[var(--yowl-text)] backdrop-blur-xl hover:bg-[color:var(--yowl-surface-strong)]",
  destructive: "bg-red-500 text-white hover:bg-red-400"
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", type = "button", ...props }, ref) => {
    const sizeClasses = {
      sm: "h-9 px-3 text-sm",
      md: "h-11 px-4 text-sm",
      lg: "h-12 px-5 text-base"
    }[size];

    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 active:scale-[0.98]",
          sizeClasses,
          variantClasses[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
