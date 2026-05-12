"use client";

import { useEffect, useRef, useState } from "react";
import type { ComponentType } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Bell,
  Camera,
  ChevronRight,
  Circle,
  Flag,
  HelpCircle,
  LogOut,
  MessageSquarePlus,
  Moon,
  RotateCcw,
  MessageCircle,
  Search,
  Send,
  Sparkles,
  Settings,
  SwitchCamera,
  Video,
  Volume2,
  VolumeX,
  UserPlus,
  Zap
} from "lucide-react";
import { BRAND_TERMS } from "@yowl/config";
import { useCamera } from "../../hooks/use-camera";
import { apiFetch } from "../../lib/api";
import { cn, formatCompactNumber, timeAgo } from "../../lib/utils";
import { useSessionStore } from "../../store/session";
import type { HowlStory, YowlUser } from "@yowl/types";
import { Avatar, Badge, Button, GlassPanel, Input } from "@yowl/ui";

type FriendsPayload = {
  friends: YowlUser[];
  requests: Array<{ id: string }>;
  outgoingRequests: Array<{ id: string }>;
  suggestions: YowlUser[];
};

type HowlStoryWithAuthor = HowlStory & { author?: YowlUser };

type CameraState = ReturnType<typeof useCamera>;

function CameraStage({ camera, sessionUser }: { camera: CameraState; sessionUser: YowlUser }) {
  const {
    activeFilter,
    capturedFrame,
    captureFrame,
    flashEnabled,
    flipCamera,
    permission,
    recording,
    setLens,
    setRecording,
    toggleFlash,
    videoRef
  } = camera;

  const statusLabel =
    permission === "granted" ? "Camera aan" : permission === "denied" ? "Geen camera toegang" : "Camera klaar";

  const triggerCapture = () => {
    setRecording(true);
    window.setTimeout(() => setRecording(false), 700);
    captureFrame();
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 170, damping: 20 }}
      className="relative flex min-h-[calc(100dvh-1.5rem)] items-center justify-center overflow-hidden rounded-[34px] border border-[color:var(--yowl-border)] bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.2),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(76,180,255,0.14),transparent_26%),linear-gradient(180deg,rgba(14,14,18,0.96),rgba(6,6,10,0.96))] p-4 shadow-[0_40px_140px_rgba(0,0,0,0.42)]"
    >
      <div className="pointer-events-none absolute inset-0 opacity-35 noise" />
      <div className="pointer-events-none absolute inset-x-12 top-10 h-24 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.14),transparent_70%)] blur-3xl" />

      <div className="relative z-10 flex h-[min(76vh,760px)] w-full max-w-[460px] flex-col overflow-hidden rounded-[36px] border border-white/10 bg-black/34 shadow-[0_28px_90px_rgba(0,0,0,0.46)] backdrop-blur-2xl">
        <div className="flex items-center justify-between border-b border-white/8 px-4 py-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-10 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 text-xs font-medium text-white/78">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_6px_rgba(16,185,129,0.12)]" />
              {statusLabel}
            </span>
            <Badge>{activeFilter}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="glass"
              size="sm"
              className="h-10 w-10 rounded-full p-0"
              onClick={toggleFlash}
              aria-label="Toggle flash"
            >
              <Zap className={cn("h-4 w-4", flashEnabled && "text-[var(--yowl-primary)]")} />
            </Button>
            <Button variant="glass" size="sm" className="h-10 w-10 rounded-full p-0" onClick={flipCamera} aria-label="Flip camera">
              <SwitchCamera className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="relative flex flex-1 items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),transparent_30%,rgba(168,85,247,0.12))]" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/82 to-transparent" />

          {capturedFrame ? (
            <img src={capturedFrame} alt="Captured frame" className="absolute inset-0 h-full w-full object-cover opacity-95" />
          ) : permission === "granted" ? (
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className={cn(
                "absolute inset-0 h-full w-full object-cover",
                activeFilter === "Noir" && "grayscale",
                activeFilter === "Glow" && "contrast-125 saturate-125",
                activeFilter === "Chrome" && "sepia-[0.18] saturate-150",
                activeFilter === "Sunbeam" && "brightness-110 saturate-125",
                activeFilter === "Dream" && "blur-[0.25px] saturate-150",
                activeFilter === "Yowl Pop" && "contrast-150 saturate-[1.8]"
              )}
            />
          ) : (
            <div className="relative z-10 flex h-[72%] w-[76%] max-w-[320px] flex-col items-center justify-center rounded-[30px] border border-white/10 bg-white/12 px-6 text-center backdrop-blur-2xl">
              <div className="grid h-24 w-24 place-items-center rounded-full border border-white/10 bg-black/25">
                <Camera className="h-10 w-10 text-white/70" />
              </div>
              <p className="mt-5 text-xl font-semibold">Camera preview</p>
              <p className="mt-2 text-sm text-white/62">Hier komt de live camera zodra browser-toegang is toegestaan.</p>
            </div>
          )}

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_55%)]" />

          <div className="absolute bottom-5 left-1/2 z-20 w-[88%] -translate-x-1/2 rounded-[26px] border border-white/10 bg-black/38 px-4 py-3 backdrop-blur-2xl">
            <p className="text-xs uppercase tracking-[0.28em] text-white/42">Houd vast om video te maken</p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setLens("Glow")}
                  className="rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-xs font-semibold text-white/72 transition hover:bg-white/10"
                >
                  0.5x
                </button>
                <button
                  type="button"
                  onClick={() => setLens("Noir")}
                  className="rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-xs font-semibold text-white/72 transition hover:bg-white/10"
                >
                  Noir
                </button>
              </div>

              <Button
                className={cn(
                  "h-16 w-16 rounded-full border-4 border-white bg-white p-0 text-black shadow-[0_0_0_12px_rgba(255,255,255,0.08)]",
                  recording && "scale-105 shadow-[0_0_0_18px_rgba(168,85,247,0.14)]"
                )}
                onPointerDown={() => setRecording(true)}
                onPointerUp={() => setRecording(false)}
                onPointerLeave={() => setRecording(false)}
                onClick={triggerCapture}
                aria-label="Take photo"
              >
                <Circle className="h-6 w-6 fill-current" />
              </Button>

              <div className="flex items-center gap-2">
                <Badge>{sessionUser.displayName.split(" ")[0]}</Badge>
                <Badge>{permission === "granted" ? "Live" : "Preview"}</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function FriendRow({ friend }: { friend: YowlUser }) {
  const tone = friend.isOnline ? "Online" : friend.isGhostMode ? "Ghost" : "Recent";

  return (
    <div className="flex items-center gap-3 rounded-[24px] border border-white/8 bg-white/[0.05] px-3 py-3">
      <Avatar name={friend.displayName} src={friend.avatarUrl} className="h-12 w-12" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{friend.displayName}</p>
        <p className="truncate text-xs text-white/50">@{friend.username}</p>
        <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-white/36">{tone}</p>
      </div>
      <button type="button" className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/10">
        <MessageCircle className="h-4 w-4" />
      </button>
    </div>
  );
}

function HowlBubble({ story }: { story: HowlStoryWithAuthor }) {
  return (
    <button type="button" className="flex w-20 shrink-0 flex-col items-center gap-2 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-full border-2 border-[var(--yowl-primary)] p-[2px]">
        <Avatar name={story.author?.displayName ?? "Yowl"} src={story.author?.avatarUrl} className="h-full w-full border-none bg-black" />
      </span>
      <span className="w-full truncate text-xs font-medium text-white/72">{story.author?.displayName?.split(" ")[0] ?? "Yowl"}</span>
    </button>
  );
}

function MenuEntry({
  icon: Icon,
  label,
  detail,
  onClick,
  danger = false,
  external = false
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  detail?: string;
  onClick: () => void;
  danger?: boolean;
  external?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-[18px] px-3 py-3 text-left transition hover:bg-white/6",
        danger ? "text-[var(--yowl-accent)]" : "text-[var(--yowl-text)]"
      )}
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/6">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{label}</span>
        {detail ? <span className="mt-0.5 block text-xs text-white/40">{detail}</span> : null}
      </span>
      {external ? <ArrowUpRight className="h-4 w-4 text-white/40" /> : null}
    </button>
  );
}

function TopProfileMenu({
  user,
  soundEffectsEnabled,
  onToggleTheme,
  onToggleSoundEffects,
  onEnableNotifications,
  onOpenSettings,
  onLogout,
  onReload
}: {
  user: YowlUser;
  soundEffectsEnabled: boolean;
  onToggleTheme: () => void;
  onToggleSoundEffects: () => void;
  onEnableNotifications: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
  onReload: () => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

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

  return (
    <div ref={menuRef} className="relative z-40">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-2 py-2 text-left transition hover:bg-white/[0.07]"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <div className="relative">
          <Avatar name={user.displayName} src={user.avatarUrl} className="h-11 w-11" />
          <span className="absolute -bottom-0.5 -right-0.5 grid h-5 w-5 place-items-center rounded-full border border-black/50 bg-white text-[10px] text-black shadow-lg">
            <Settings className="h-3 w-3" />
          </span>
        </div>
        <div className="hidden pr-1 text-left sm:block">
          <p className="text-xs uppercase tracking-[0.24em] text-white/36">YowlMoji</p>
          <p className="max-w-[9rem] truncate text-sm font-semibold">{user.displayName}</p>
        </div>
      </button>

      {open ? (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
          className="absolute left-0 top-[calc(100%+0.75rem)] w-[min(360px,calc(100vw-1.5rem))] overflow-hidden rounded-[28px] border border-white/10 bg-[rgba(10,10,12,0.96)] p-2 shadow-[0_30px_100px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
        >
          <div className="flex items-center justify-between px-3 py-2">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-white/40">Instellingen</p>
              <p className="text-sm font-semibold">{user.displayName}</p>
            </div>
            <Badge>Yowl</Badge>
          </div>

          <div className="my-2 h-px bg-white/8" />

          <div className="space-y-1">
            <MenuEntry
              icon={Moon}
              label={`Thema: ${user.theme === "light" ? "licht" : "donker"}`}
              detail="Wissel tussen light en dark mode."
              onClick={onToggleTheme}
            />
            <MenuEntry
              icon={soundEffectsEnabled ? Volume2 : VolumeX}
              label={soundEffectsEnabled ? "Geluidseffecten uitschakelen" : "Geluidseffecten inschakelen"}
              detail="Behoudt je voorkeur lokaal in de browser."
              onClick={onToggleSoundEffects}
            />
            <MenuEntry
              icon={Bell}
              label="Meldingen aanzetten"
              detail="Vraag browsermeldingen aan en sync de setting."
              onClick={onEnableNotifications}
            />
            <MenuEntry icon={HelpCircle} label="Helpcentrum" detail="Open hulp en uitleg." onClick={() => window.open("mailto:support@yowl.chat?subject=Yowl%20Helpcentrum")} external />
            <MenuEntry icon={Flag} label="Een probleem melden" detail="Stuur ons een bugreport." onClick={() => window.open("mailto:support@yowl.chat?subject=Yowl%20Bugreport")} external />
            <MenuEntry icon={MessageSquarePlus} label="Ik heb een suggestie" detail="Deel een idee met het team." onClick={() => window.open("mailto:support@yowl.chat?subject=Yowl%20Suggestie")} external />
            <MenuEntry icon={Settings} label="Accountinstellingen" detail="Open je account- en privacyopties." onClick={onOpenSettings} />
            <MenuEntry icon={ArrowUpRight} label="Privacybeleid" detail="Bekijk hoe we met data omgaan." onClick={onOpenSettings} external />
            <div className="my-2 h-px bg-white/8" />
            <MenuEntry icon={LogOut} label="Uitloggen" detail="Beëindig je sessie." onClick={onLogout} danger />
            <MenuEntry icon={RotateCcw} label="Opnieuw laden" detail="Ververs de app onmiddellijk." onClick={onReload} />
          </div>
        </motion.div>
      ) : null}
    </div>
  );
}

export function HomeScreen() {
  const router = useRouter();
  const sessionUser = useSessionStore((state) => state.user);
  const hydrated = useSessionStore((state) => state.hydrated);
  const updateUser = useSessionStore((state) => state.updateUser);
  const clearAuth = useSessionStore((state) => state.clearAuth);
  const camera = useCamera();
  const [query, setQuery] = useState("");
  const [payload, setPayload] = useState<FriendsPayload | null>(null);
  const [howls, setHowls] = useState<HowlStoryWithAuthor[]>([]);
  const [loading, setLoading] = useState(false);
  const [howlsLoading, setHowlsLoading] = useState(false);
  const [soundEffectsEnabled, setSoundEffectsEnabled] = useState(true);

  useEffect(() => {
    const stored = window.localStorage.getItem("yowl.soundEffectsEnabled");
    if (stored !== null) {
      setSoundEffectsEnabled(stored !== "false");
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("yowl.soundEffectsEnabled", soundEffectsEnabled ? "true" : "false");
    document.documentElement.dataset.yowlSoundEffects = soundEffectsEnabled ? "enabled" : "disabled";
  }, [soundEffectsEnabled]);

  useEffect(() => {
    if (!hydrated || !sessionUser) {
      setPayload(null);
      setHowls([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    apiFetch<FriendsPayload>("/friends")
      .then((data) => {
        if (!cancelled) setPayload(data);
      })
      .catch(() => {
        if (!cancelled) setPayload(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [hydrated, sessionUser]);

  useEffect(() => {
    if (!hydrated || !sessionUser) {
      setHowls([]);
      return;
    }

    let cancelled = false;
    setHowlsLoading(true);

    apiFetch<HowlStoryWithAuthor[]>("/howls")
      .then((data) => {
        if (!cancelled) setHowls(data);
      })
      .catch(() => {
        if (!cancelled) setHowls([]);
      })
      .finally(() => {
        if (!cancelled) setHowlsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [hydrated, sessionUser]);

  const friends = payload?.friends ?? [];
  const visibleFriends = friends.filter((friend) => {
    const haystack = `${friend.displayName} ${friend.username}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  const onlineFriends = visibleFriends.filter((friend) => friend.isOnline).slice(0, 3);
  const firstFriend = visibleFriends[0] ?? friends[0] ?? null;
  const featuredHowl = howls[0] ?? null;

  const toggleTheme = async () => {
    if (!sessionUser) return;

    const nextTheme = sessionUser.theme === "light" ? "dark" : "light";
    const updated = await apiFetch<YowlUser>("/auth/me", {
      method: "PATCH",
      body: JSON.stringify({ theme: nextTheme })
    });
    updateUser(updated);
  };

  const toggleSoundEffects = () => {
    setSoundEffectsEnabled((current) => !current);
  };

  const enableNotifications = async () => {
    if (!("Notification" in window)) return;

    const permission = await window.Notification.requestPermission();
    if (permission === "granted") {
      const updated = await apiFetch<YowlUser>("/auth/me", {
        method: "PATCH",
        body: JSON.stringify({ pushNotificationsEnabled: true })
      });
      updateUser(updated);
    }
  };

  const openSettings = () => {
    router.push("/settings");
  };

  const logout = async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } finally {
      clearAuth();
      router.push("/login");
    }
  };

  const reloadApp = () => {
    window.location.reload();
  };

  if (!sessionUser) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center px-4 py-8">
        <GlassPanel className="w-full max-w-xl p-6 text-center">
          <p className="text-[11px] uppercase tracking-[0.32em] text-white/40">Welkom bij Yowl</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Log in om je vrienden, camera en YowlMoji te zien</h1>
          <p className="mt-3 text-sm text-white/58">
            Deze startpagina toont de vriendenrail links, de live camera in het midden en je YowlMoji rechts zodra je account geladen is.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button onClick={() => router.push("/login")}>Log in</Button>
            <Button variant="glass" onClick={() => router.push("/register")}>
              Maak account
            </Button>
          </div>
        </GlassPanel>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] px-3 py-3 sm:px-4 lg:px-5">
      <div className="mx-auto flex min-h-[calc(100dvh-1.5rem)] w-full flex-col gap-3">
        <div className="flex items-start justify-between gap-3 px-1 sm:px-0">
          <TopProfileMenu
            user={sessionUser}
            soundEffectsEnabled={soundEffectsEnabled}
            onToggleTheme={() => {
              toggleTheme().catch(() => undefined);
            }}
            onToggleSoundEffects={toggleSoundEffects}
            onEnableNotifications={() => {
              enableNotifications().catch(() => undefined);
            }}
            onOpenSettings={openSettings}
            onLogout={() => {
              logout().catch(() => undefined);
            }}
            onReload={reloadApp}
          />
          <div className="hidden h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/50 sm:flex">
            <Sparkles className="h-5 w-5" />
          </div>
        </div>

        <div className="grid w-full flex-1 gap-3 xl:grid-cols-[330px_minmax(0,1fr)_360px]">
          <motion.aside
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 170, damping: 20 }}
            className="flex min-h-[calc(100dvh-1.5rem)] flex-col gap-3"
          >
            <GlassPanel className="flex flex-col gap-4 p-4">
              <div className="flex items-center justify-between">
                <Button variant="glass" size="sm" className="h-12 w-12 rounded-full p-0" aria-label="Camera on">
                  <Camera className="h-5 w-5" />
                </Button>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-[0.28em] text-white/40">YowlMoji</p>
                    <p className="text-sm font-semibold">{sessionUser.displayName}</p>
                  </div>
                  <Avatar name={sessionUser.displayName} src={sessionUser.avatarUrl} className="h-14 w-14" />
                </div>
              </div>

              <div className="rounded-[28px] border border-blue-400/20 bg-[linear-gradient(135deg,rgba(59,130,246,0.9),rgba(14,165,233,0.72))] p-4 shadow-[0_18px_50px_rgba(59,130,246,0.16)]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-white">Ontvang updates van je vrienden</p>
                    <p className="mt-2 text-sm text-white/84">Meldingen inschakelen voor nieuwe berichten en inkomende gesprekken</p>
                  </div>
                  <button type="button" className="rounded-full bg-white/18 px-2 py-1 text-white/80 transition hover:bg-white/24">
                    x
                  </button>
                </div>
              </div>

              <div className="rounded-[24px] border border-white/8 bg-white/[0.05] px-4 py-3">
                <div className="flex items-center gap-3">
                  <Search className="h-4 w-4 text-white/36" />
                  <Input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Zoeken"
                    className="border-none bg-transparent px-0 focus:ring-0"
                  />
                  <div className="flex items-center gap-2 rounded-full bg-black/26 px-2 py-1">
                    <Avatar name={sessionUser.displayName} src={sessionUser.avatarUrl} className="h-8 w-8" />
                    <ChevronRight className="h-4 w-4 text-white/68" />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 overflow-x-auto pb-1">
                {onlineFriends.length ? (
                  onlineFriends.map((friend) => (
                    <div key={friend.id} className="flex w-20 shrink-0 flex-col items-center gap-2">
                      <div className="rounded-full border-2 border-[var(--yowl-primary)] p-[2px]">
                        <Avatar name={friend.displayName} src={friend.avatarUrl} className="h-14 w-14" />
                      </div>
                      <p className="w-full truncate text-center text-xs font-medium text-white/72">{friend.displayName.split(" ")[0]}</p>
                    </div>
                  ))
                ) : (
                  Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="flex w-20 shrink-0 flex-col items-center gap-2">
                      <div className="h-16 w-16 rounded-full border border-white/10 bg-white/5" />
                      <div className="h-2 w-12 rounded-full bg-white/6" />
                    </div>
                  ))
                )}
              </div>
            </GlassPanel>

            <GlassPanel className="flex-1 overflow-hidden p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-white/38">Vrienden</p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-tight">Je circle</h2>
                </div>
                <Badge>{friends.length ? `${friends.length} live` : "0 live"}</Badge>
              </div>

              <div className="mt-4 flex-1 space-y-3 overflow-auto pr-1 premium-scrollbar">
                {loading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="h-20 rounded-[24px] border border-white/8 bg-white/[0.04]" />
                  ))
                ) : visibleFriends.length ? (
                  visibleFriends.map((friend) => <FriendRow key={friend.id} friend={friend} />)
                ) : (
                  <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.04] p-4 text-sm text-white/58">
                    Nog geen vrienden gevonden voor deze zoekopdracht.
                  </div>
                )}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <Button variant="glass">
                  <UserPlus className="h-4 w-4" />
                  Toevoegen
                </Button>
                <Button variant="glass">
                  <Send className="h-4 w-4" />
                  Chats
                </Button>
              </div>
            </GlassPanel>
          </motion.aside>

          <CameraStage camera={camera} sessionUser={sessionUser} />

          <motion.aside
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 170, damping: 20 }}
            className="flex min-h-[calc(100dvh-1.5rem)] flex-col gap-3"
          >
            <GlassPanel className="flex flex-1 flex-col p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-white/38">YowlMoji</p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-tight">Je poppetje</h2>
                </div>
                <Badge>Camera links</Badge>
              </div>

              <div className="mt-6 flex items-center justify-center">
                <div className="rounded-[42px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.22),rgba(255,255,255,0.04))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.3)]">
                  <Avatar name={sessionUser.displayName} src={sessionUser.avatarUrl} className="h-40 w-40 text-3xl" />
                </div>
              </div>

              <div className="mt-5 rounded-[28px] border border-white/8 bg-white/[0.04] p-4 text-center">
                <p className="text-lg font-semibold">{sessionUser.displayName}</p>
                <p className="mt-1 text-sm text-white/50">@{sessionUser.username}</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <Badge>{formatCompactNumber(sessionUser.flames)} Flames</Badge>
                  <Badge>{formatCompactNumber(sessionUser.yowlScore)} YowlScore</Badge>
                  <Badge>{sessionUser.isGhostMode ? "Ghost mode" : "Visible"}</Badge>
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                <div className="rounded-[24px] border border-white/8 bg-white/[0.05] p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-[0.28em] text-white/38">Live context</p>
                    <Badge>{permissionLabel(camera.permission)}</Badge>
                  </div>
                  <div className="mt-3 space-y-2 text-sm text-white/62">
                    <p>{firstFriend ? `Je kunt meteen naar ${firstFriend.displayName} sturen.` : "Je vriendenlijst laadt zodra er echte data binnenkomt."}</p>
                    <p>{firstFriend ? `${firstFriend.friendsCount} vrienden in hun netwerk.` : "Gebruik de camera om direct een Yowl te maken."}</p>
                  </div>
                </div>

                <div className="rounded-[24px] border border-white/8 bg-white/[0.05] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.28em] text-white/38">{BRAND_TERMS.Stories}</p>
                      <p className="mt-1 text-sm text-white/58">Verhalen van je vrienden</p>
                    </div>
                    <Badge>{howls.length ? `${howls.length} live` : "0 live"}</Badge>
                  </div>

                  <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                    {howlsLoading ? (
                      Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="flex w-20 shrink-0 flex-col items-center gap-2">
                          <div className="h-16 w-16 rounded-full border border-white/10 bg-white/5" />
                          <div className="h-2 w-12 rounded-full bg-white/6" />
                        </div>
                      ))
                    ) : howls.length ? (
                      howls.slice(0, 5).map((story) => <HowlBubble key={story.id} story={story} />)
                    ) : (
                      <div className="rounded-[20px] border border-dashed border-white/10 bg-white/5 px-4 py-4 text-sm text-white/58">
                        Nog geen Howls gesynchroniseerd.
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-[24px] border border-white/8 bg-white/[0.05] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.28em] text-white/38">{BRAND_TERMS.Spotlight}</p>
                      <p className="mt-1 text-sm text-white/58">Uitgelichte momenten en trending clips</p>
                    </div>
                    <Sparkles className="h-5 w-5 text-[var(--yowl-primary)]" />
                  </div>

                  <div className="mt-4 overflow-hidden rounded-[28px] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.18),rgba(255,255,255,0.04)),linear-gradient(135deg,rgba(17,17,24,0.94),rgba(32,32,40,0.84))] p-4">
                    <div className="flex items-center justify-between">
                      <Badge>Moonlight</Badge>
                      <Badge>{featuredHowl ? "Featured Howl" : "Spotlight"}</Badge>
                    </div>
                    <div className="mt-4 flex items-end justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-2xl font-semibold tracking-tight">
                          {featuredHowl?.caption ?? "Moonlight spotlight"}
                        </p>
                        <p className="mt-2 text-sm text-white/68">
                          {featuredHowl
                            ? `Van ${featuredHowl.author?.displayName ?? "een vriend"} in ${timeAgo(featuredHowl.expiresAt)}.`
                            : "Hier verschijnt straks de uitgelichte Moonlight-feed met de beste clips."}
                        </p>
                      </div>
                      <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full border border-white/12 bg-black/25">
                        <Video className="h-7 w-7 text-white/90" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <Button variant="glass" size="sm" className="flex-1 justify-between">
                        <span className="inline-flex items-center gap-2">
                          <Sparkles className="h-4 w-4" />
                          Moonlight
                        </span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button variant="glass" size="sm" className="flex-1 justify-between">
                        <span className="inline-flex items-center gap-2">
                          <Video className="h-4 w-4" />
                          Open
                        </span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </GlassPanel>
          </motion.aside>
        </div>
      </div>
    </div>
  );
}

function permissionLabel(permission: ReturnType<typeof useCamera>["permission"]) {
  if (permission === "granted") return "Live";
  if (permission === "denied") return "Denied";
  if (permission === "unsupported") return "Unsupported";
  return "Preview";
}
