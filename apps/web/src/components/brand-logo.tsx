"use client";

import { APP_NAME } from "@yowl/config";
import { cn } from "@yowl/ui";

const BRAND_SOURCES = {
  full: "/brand/yowl-logo-full-1024.png",
  icon: "/brand/icon-512.png"
} as const;

type BrandLogoProps = {
  variant?: "full" | "icon";
  size?: number;
  className?: string;
  label?: string;
  caption?: string;
  hideText?: boolean;
  priority?: boolean;
};

export function BrandLogo({
  variant = "icon",
  size = 44,
  className,
  label = APP_NAME,
  caption,
  hideText = false,
  priority = false
}: BrandLogoProps) {
  const source = BRAND_SOURCES[variant];

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <img
        src={source}
        alt={`${APP_NAME} logo`}
        width={size}
        height={size}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className={cn(
          "shrink-0 object-contain drop-shadow-[0_0_22px_rgba(168,85,247,0.25)]",
          variant === "full" ? "rounded-[20px]" : "rounded-[18px]"
        )}
      />
      {!hideText ? (
        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold uppercase tracking-[0.3em] text-white/48">{label}</p>
          {caption ? <p className="truncate text-sm text-white/62">{caption}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
