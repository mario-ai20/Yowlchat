"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { Camera, MessageCircle, Settings, Sparkles, User, Video } from "lucide-react";
import { APP_NAME } from "@yowl/config";
import { cn, GlassPanel } from "@yowl/ui";
import { BrandLogo } from "./brand-logo";
import { getPreferredLocale } from "../lib/locale";
import { getUiCopy } from "../lib/i18n";
import { useSessionStore } from "../store/session";

const icons = {
  camera: Camera,
  "message-circle": MessageCircle,
  sparkles: Sparkles,
  video: Video,
  user: User,
  settings: Settings
} as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const sessionUser = useSessionStore((state) => state.user);
  const locale = sessionUser?.locale ?? getPreferredLocale();
  const copy = getUiCopy(locale).shell;
  const isHome = pathname === "/";
  const navItems = [
    { href: "/", label: copy.nav.camera, icon: "camera" },
    { href: "/chat", label: copy.nav.chat, icon: "message-circle" },
    { href: "/howls", label: copy.nav.howls, icon: "sparkles" },
    { href: "/moonlight", label: copy.nav.moonlight, icon: "video" },
    { href: "/profile", label: copy.nav.profile, icon: "user" },
    { href: "/settings", label: copy.nav.settings, icon: "settings" }
  ] as const;

  if (isHome) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[var(--yowl-app-bg)] text-[var(--yowl-text)]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-12%] top-[-10%] h-[380px] w-[380px] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.22),transparent_70%)] blur-3xl" />
          <div className="absolute right-[-18%] top-[18%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.12),transparent_70%)] blur-3xl" />
          <div className="absolute bottom-[-14%] left-[28%] h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,rgba(88,126,255,0.16),transparent_70%)] blur-3xl" />
        </div>
        <main className="relative z-10">{children}</main>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--yowl-app-bg)] text-[var(--yowl-text)]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-12%] top-[-10%] h-[380px] w-[380px] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.22),transparent_70%)] blur-3xl" />
        <div className="absolute right-[-18%] top-[18%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.12),transparent_70%)] blur-3xl" />
        <div className="absolute bottom-[-14%] left-[28%] h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,rgba(88,126,255,0.16),transparent_70%)] blur-3xl" />
      </div>

      <header className="sticky top-0 z-40 border-b border-[color:var(--yowl-border)] bg-[color:var(--yowl-shell-bg)] backdrop-blur-2xl">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-3 sm:px-6">
          <BrandLogo variant="icon" size={38} label={APP_NAME} caption={copy.premiumSocial} priority />
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-[color:var(--yowl-border)] bg-[color:var(--yowl-surface)] px-3 py-1 text-xs text-[var(--yowl-muted)]">
              {copy.live}
            </span>
            <span className="rounded-full bg-[var(--yowl-primary)] px-3 py-1 text-xs font-semibold text-black shadow-glow">
              Yowl
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-72px)] w-full max-w-[1200px] flex-col gap-6 px-3 pb-28 pt-4 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 16, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -16, filter: "blur(12px)" }}
            transition={{ type: "spring", stiffness: 180, damping: 22 }}
            className="grid flex-1 gap-6 lg:grid-cols-[1fr_320px]"
          >
            <section className="min-h-[calc(100vh-176px)]">{children}</section>
            <aside className="hidden lg:block">
              <GlassPanel className="sticky top-24 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--yowl-muted)]">{copy.navigationLabel}</p>
                <nav className="mt-4 space-y-2">
                  {navItems.map((item) => {
                    const Icon = icons[item.icon];
                    const active = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition",
                        active
                          ? "bg-[color:var(--yowl-surface)] text-[var(--yowl-text)]"
                          : "text-[var(--yowl-muted)] hover:bg-[color:var(--yowl-surface)] hover:text-[var(--yowl-text)]"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                    );
                  })}
                </nav>
                <div className="mt-6 rounded-[24px] border border-[color:var(--yowl-border)] bg-gradient-to-br from-[color:var(--yowl-surface)] to-transparent p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-[var(--yowl-muted)]">{copy.currentMode}</p>
                  <p className="mt-2 text-lg font-semibold">{copy.cameraFirst}</p>
                  <p className="mt-2 text-sm text-[var(--yowl-muted)]">{copy.currentModeBody}</p>
                </div>
              </GlassPanel>
            </aside>
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-[color:var(--yowl-border)] bg-[color:var(--yowl-shell-bg)] backdrop-blur-2xl lg:hidden">
        <div className="mx-auto grid max-w-[720px] grid-cols-6 gap-1 px-2 py-3 sm:px-3">
          {navItems.map((item) => {
            const Icon = icons[item.icon];
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-[10px] font-medium text-[var(--yowl-muted)] sm:text-[11px]"
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-2xl bg-[color:var(--yowl-surface)]"
                    transition={{ type: "spring", stiffness: 380, damping: 28 }}
                  />
                )}
                <Icon className={cn("relative z-10 h-4 w-4", active && "text-[var(--yowl-primary)]")} />
                <span className="relative z-10">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
