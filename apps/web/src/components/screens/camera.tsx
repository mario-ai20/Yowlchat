"use client";

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  Circle,
  Camera as CameraIcon,
  FlipHorizontal,
  Flashlight,
  GalleryVerticalEnd,
  MoveHorizontal,
  Palette,
  PenTool,
  Smile,
  Sparkles,
  Video
} from "lucide-react";
import { Button, Badge, Card, GlassPanel, Input, Avatar } from "@yowl/ui";
import { cn } from "@yowl/ui";
import { useCamera } from "../../hooks/use-camera";
import { CAMERA_FILTERS } from "@yowl/config";
import { useSessionStore } from "../../store/session";

export function CameraScreen() {
  const sessionUser = useSessionStore((state) => state.user);
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
    videoRef,
    toggleFlash
  } = useCamera();
  const [caption, setCaption] = useState("");
  const [selectedSticker] = useState("spark");
  const stopTimer = useRef<number | null>(null);

  const recents = useMemo(
    () => [
      { name: "New chat", type: "Message", accent: "from-fuchsia-500/70 to-violet-500/70" },
      { name: "Fresh Howl", type: "Story", accent: "from-cyan-500/70 to-blue-500/70" },
      { name: "Map update", type: "Presence", accent: "from-emerald-500/70 to-lime-500/70" }
    ],
    []
  );

  const triggerRecord = () => {
    setRecording(true);
    if (stopTimer.current) {
      window.clearTimeout(stopTimer.current);
    }
    stopTimer.current = window.setTimeout(() => setRecording(false), 1800);
  };

  return (
    <div className="space-y-5">
      <GlassPanel className="overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-white/8 px-4 py-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/42">Camera-first main page</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">Capture the moment in Yowl</h2>
          </div>
          <div className="flex items-center gap-2">
            <Badge>Live</Badge>
            <Badge>{permission === "granted" ? "Camera ready" : "Preview mode"}</Badge>
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="relative min-h-[72vh] bg-black/40">
            <div className="absolute inset-0 overflow-hidden">
              {capturedFrame ? (
                <img src={capturedFrame} alt="Captured frame" className="h-full w-full object-cover opacity-90" />
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className={cn(
                    "h-full w-full object-cover",
                    activeFilter === "Noir" && "grayscale",
                    activeFilter === "Glow" && "contrast-125 saturate-125",
                    activeFilter === "Chrome" && "sepia-[0.18] saturate-150",
                    activeFilter === "Sunbeam" && "brightness-110 saturate-125",
                    activeFilter === "Dream" && "blur-[0.2px] saturate-150",
                    activeFilter === "Yowl Pop" && "contrast-150 saturate-[1.8]"
                  )}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.1),transparent_55%)]" />
            </div>

            <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-2 backdrop-blur-xl">
                <div className="h-2.5 w-2.5 rounded-full bg-[var(--yowl-primary)] shadow-glow" />
                <span className="text-xs font-medium text-white/80">Yowl camera</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="glass" size="sm" onClick={toggleFlash}>
                  <Flashlight className={cn("h-4 w-4", flashEnabled && "text-[var(--yowl-primary)]")} />
                  {flashEnabled ? "Flash on" : "Flash"}
                </Button>
                <Button variant="glass" size="sm" onClick={flipCamera}>
                  <FlipHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="absolute left-4 top-20 flex flex-col gap-2">
              <Button variant="glass" size="sm" onClick={() => setLens("Glow")}>
                <Sparkles className="h-4 w-4" />
                Filter
              </Button>
              <Button variant="glass" size="sm">
                <PenTool className="h-4 w-4" />
                Draw
              </Button>
              <Button variant="glass" size="sm">
                <Smile className="h-4 w-4" />
                Stickers
              </Button>
            </div>

            <div className="absolute inset-x-0 bottom-0 p-4">
              <div className="mx-auto max-w-xl space-y-4 rounded-[32px] border border-white/10 bg-black/28 p-4 backdrop-blur-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/42">Hold to record</p>
                    <p className="text-sm text-white/68">Butter-smooth photo, video and send flow</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge>{activeFilter}</Badge>
                    <Badge>{selectedSticker}</Badge>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <Input
                      value={caption}
                      onChange={(event) => setCaption(event.target.value)}
                      placeholder="Caption your Yowl..."
                      className="h-12 bg-white/8"
                    />
                  </div>
                  <Button variant="ghost" className="border border-white/10 bg-white/6">
                    <GalleryVerticalEnd className="h-4 w-4" />
                  </Button>
                  <Button
                    className={cn(
                      "h-14 w-14 rounded-full p-0",
                      recording && "scale-105 shadow-[0_0_0_12px_rgba(168,85,247,0.12)]"
                    )}
                    onPointerDown={triggerRecord}
                    onPointerUp={() => setRecording(false)}
                    onClick={() => captureFrame()}
                  >
                    <Circle className="h-5 w-5 fill-current" />
                  </Button>
                  <Button variant="ghost" className="border border-white/10 bg-white/6">
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {CAMERA_FILTERS.map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setLens(filter)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                        activeFilter === filter
                          ? "border-[var(--yowl-primary)] bg-[var(--yowl-primary)] text-black"
                          : "border-white/10 bg-white/6 text-white/68 hover:bg-white/10"
                      )}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 border-t border-white/8 p-4 lg:border-l lg:border-t-0">
            <Card className="border-white/8 bg-white/[0.04]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.26em] text-white/38">Quick send</p>
                  <h3 className="mt-1 text-lg font-semibold">Friends and recent targets</h3>
                </div>
                <Badge>{sessionUser ? "Connected" : "No account"}</Badge>
              </div>
              <div className="mt-4 space-y-3">
                {sessionUser ? (
                  <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/5 px-3 py-3">
                    <Avatar name={sessionUser.displayName} className="h-11 w-11" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{sessionUser.displayName}</p>
                      <p className="text-xs text-white/45">@{sessionUser.username}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="border border-white/8 bg-white/6">
                      Send
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-3 py-4 text-sm text-white/58">
                    Log in om echte vrienden en send-targets te zien.
                  </div>
                )}
              </div>
            </Card>

            <Card className="border-white/8 bg-white/[0.04]">
              <p className="text-xs uppercase tracking-[0.26em] text-white/38">Recent activity</p>
              <div className="mt-4 space-y-3">
                {recents.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "rounded-[24px] bg-gradient-to-br p-4",
                      item.accent
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-white">{item.name}</p>
                      <Badge className="bg-black/20 text-white">{item.type}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-white/78">
                      Mobile-first, premium motion, ready for launch.
                    </p>
                  </motion.div>
                ))}
              </div>
            </Card>

            <Card className="border-white/8 bg-white/[0.04]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.26em] text-white/38">AR placeholder</p>
                  <h3 className="mt-1 text-lg font-semibold">Lens playground</h3>
                </div>
                <Badge>Coming now</Badge>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button className="rounded-[22px] border border-white/8 bg-white/5 p-4 text-left transition hover:bg-white/8">
                  <Palette className="h-5 w-5 text-[var(--yowl-primary)]" />
                  <p className="mt-3 text-sm font-semibold">Color wave</p>
                </button>
                <button className="rounded-[22px] border border-white/8 bg-white/5 p-4 text-left transition hover:bg-white/8">
                  <MoveHorizontal className="h-5 w-5 text-[var(--yowl-primary)]" />
                  <p className="mt-3 text-sm font-semibold">Face tracking</p>
                </button>
              </div>
            </Card>
          </div>
        </div>
      </GlassPanel>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-white/8 bg-white/[0.04]">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.24em] text-white/38">Status</p>
            <Badge>{recording ? "Recording" : "Idle"}</Badge>
          </div>
          <p className="mt-3 text-2xl font-semibold">{sessionUser?.displayName ?? "Your account"}</p>
          <p className="mt-2 text-sm text-white/58">
            {sessionUser ? "Ready to capture a Howl, a chat or a map ping." : "Log in om dit scherm aan je echte account te koppelen."}
          </p>
        </Card>
        <Card className="border-white/8 bg-white/[0.04]">
          <p className="text-xs uppercase tracking-[0.24em] text-white/38">Default feel</p>
          <p className="mt-3 text-2xl font-semibold">Smooth spring physics</p>
          <p className="mt-2 text-sm text-white/58">Bottom bar, blurred cards and haptic-like motion.</p>
        </Card>
        <Card className="border-white/8 bg-white/[0.04]">
          <p className="text-xs uppercase tracking-[0.24em] text-white/38">Output</p>
          <p className="mt-3 text-2xl font-semibold">{capturedFrame ? "Frame captured" : "Ready to send"}</p>
          <p className="mt-2 text-sm text-white/58">Drop into chats, stories or Echoes.</p>
        </Card>
      </div>
    </div>
  );
}
