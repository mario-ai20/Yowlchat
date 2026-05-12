"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Camera,
  ChevronRight,
  Circle,
  MessageCircle,
  Search,
  Send,
  Sparkles,
  SwitchCamera,
  UserPlus,
  Zap
} from "lucide-react";
import { useCamera } from "../../hooks/use-camera";
import { apiFetch } from "../../lib/api";
import { cn, formatCompactNumber } from "../../lib/utils";
import { useSessionStore } from "../../store/session";
import type { YowlUser } from "@yowl/types";
import { Avatar, Badge, Button, GlassPanel, Input } from "@yowl/ui";

type FriendsPayload = {
  friends: YowlUser[];
  requests: Array<{ id: string }>;
  outgoingRequests: Array<{ id: string }>;
  suggestions: YowlUser[];
};

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

export function HomeScreen() {
  const router = useRouter();
  const sessionUser = useSessionStore((state) => state.user);
  const hydrated = useSessionStore((state) => state.hydrated);
  const camera = useCamera();
  const [query, setQuery] = useState("");
  const [payload, setPayload] = useState<FriendsPayload | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!hydrated || !sessionUser) {
      setPayload(null);
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

  const friends = payload?.friends ?? [];
  const visibleFriends = friends.filter((friend) => {
    const haystack = `${friend.displayName} ${friend.username}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  const onlineFriends = visibleFriends.filter((friend) => friend.isOnline).slice(0, 3);
  const firstFriend = visibleFriends[0] ?? friends[0] ?? null;

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
      <div className="mx-auto grid min-h-[calc(100dvh-1.5rem)] w-full gap-3 xl:grid-cols-[330px_minmax(0,1fr)_360px]">
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
                    <p className="text-xs uppercase tracking-[0.28em] text-white/38">Quick actions</p>
                    <p className="mt-1 text-sm text-white/58">Snelle routes vanop je YowlMoji</p>
                  </div>
                  <Sparkles className="h-5 w-5 text-[var(--yowl-primary)]" />
                </div>
                <div className="mt-4 grid gap-2">
                  <Button variant="glass" className="justify-between">
                    <span className="inline-flex items-center gap-2">
                      <Camera className="h-4 w-4" />
                      Camera
                    </span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button variant="glass" className="justify-between">
                    <span className="inline-flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" />
                      Chat
                    </span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </GlassPanel>
        </motion.aside>
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
