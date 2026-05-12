import * as React from "react";
import { cn } from "../lib/cn";

export function Avatar({
  name,
  src,
  className
}: {
  name: string;
  src?: string | null;
  className?: string;
}) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className={cn(
        "relative grid shrink-0 place-items-center overflow-hidden rounded-full border border-white/12 bg-gradient-to-br from-white/20 via-white/10 to-transparent text-xs font-bold text-white shadow-[0_0_30px_rgba(168,85,247,0.16)]",
        className
      )}
    >
      {src ? <img src={src} alt={name} className="h-full w-full object-cover" /> : initials}
    </div>
  );
}
