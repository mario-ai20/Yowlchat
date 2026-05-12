"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Lock, LogOut, Moon, PencilLine, Shield, Sparkles, UserRound, Zap } from "lucide-react";
import { Badge, Button, Card, GlassPanel, Input, Avatar } from "@yowl/ui";
import { cn, formatCompactNumber } from "../../lib/utils";
import { useSessionStore } from "../../store/session";
import { apiFetch } from "../../lib/api";
import type { AiConversationMessage, YowlUser } from "@yowl/types";

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Card className="border-white/8 bg-white/[0.04] p-4">
      <p className="text-xs uppercase tracking-[0.22em] text-white/38">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </Card>
  );
}

export function ProfileScreen() {
  const router = useRouter();
  const sessionUser = useSessionStore((state) => state.user);
  const updateUser = useSessionStore((state) => state.updateUser);
  const [bio, setBio] = useState("");
  const [visible, setVisible] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setBio(sessionUser?.bio ?? "");
    setVisible(sessionUser?.publicProfile ?? true);
  }, [sessionUser]);

  if (!sessionUser) {
    return (
      <div className="space-y-5">
        <GlassPanel className="p-5">
          <p className="text-[11px] uppercase tracking-[0.28em] text-white/40">Profile</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">Log in om je echte profiel te zien</h2>
          <p className="mt-2 max-w-2xl text-sm text-white/58">
            Er worden geen demo-accounts of fake profielen meer getoond. Maak of open eerst een echt account.
          </p>
          <div className="mt-5">
            <Button onClick={() => router.push("/login")}>Go to login</Button>
          </div>
        </GlassPanel>
      </div>
    );
  }

  const saveProfile = async () => {
    setSaving(true);
    try {
      const updated = await apiFetch<YowlUser>("/auth/me", {
        method: "PATCH",
        body: JSON.stringify({
          bio,
          publicProfile: visible
        })
      });

      updateUser(updated);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <GlassPanel className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/40">Profile</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">Your Yowl identity</h2>
            <p className="mt-2 max-w-2xl text-sm text-white/58">
              A modern profile with YowlMoji avatar, Flames, YowlScore and privacy toggles.
            </p>
          </div>
          <Button variant="glass" onClick={saveProfile} disabled={saving}>
            <PencilLine className="h-4 w-4" />
            {saving ? "Saving" : "Save"}
          </Button>
        </div>

        <div className="mt-6 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
          <Card className="border-white/8 bg-white/[0.04]">
            <div className="flex flex-col items-center text-center">
              <div className="rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.46),transparent_70%)] p-2">
                <Avatar name={sessionUser.displayName} className="h-24 w-24" />
              </div>
              <h3 className="mt-4 text-2xl font-semibold">{sessionUser.displayName}</h3>
              <p className="mt-1 text-white/52">@{sessionUser.username}</p>
              <p className="mt-3 text-sm text-white/62">{sessionUser.bio ?? "No bio yet."}</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Badge>{sessionUser.location ?? "No location"}</Badge>
                <Badge>{visible ? "Public profile" : "Private profile"}</Badge>
                <Badge>{sessionUser.isGhostMode ? "Ghost mode" : "Visible"}</Badge>
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <Metric label="YowlScore" value={formatCompactNumber(sessionUser.yowlScore)} />
              <Metric label="Flames" value={formatCompactNumber(sessionUser.flames)} />
              <Metric label="Friends" value={formatCompactNumber(sessionUser.friendsCount)} />
            </div>

            <Card className="border-white/8 bg-white/[0.04]">
              <p className="text-xs uppercase tracking-[0.24em] text-white/38">Bio</p>
              <Input value={bio} onChange={(event) => setBio(event.target.value)} className="mt-3 bg-white/5" />
              <div className="mt-4 flex flex-wrap gap-2">
                {(sessionUser.links ?? []).map((link) => (
                  <Badge key={link.label}>{link.label}</Badge>
                ))}
              </div>
            </Card>

            <Card className="border-white/8 bg-white/[0.04]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-white/38">Privacy</p>
                  <p className="mt-1 font-semibold">Public Yowl profile</p>
                </div>
                <button
                  onClick={() => setVisible((current) => !current)}
                  className={cn(
                    "relative h-8 w-14 rounded-full border transition",
                    visible ? "border-[var(--yowl-primary)] bg-[var(--yowl-primary)]/20" : "border-white/10 bg-white/5"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-1 h-6 w-6 rounded-full bg-white transition",
                      visible ? "left-7" : "left-1"
                    )}
                  />
                </button>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Button variant="glass">
                  <Sparkles className="h-4 w-4" />
                  YowlMoji
                </Button>
                <Button variant="glass">
                  <UserRound className="h-4 w-4" />
                  Link profile
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}

export function SettingsScreen() {
  const router = useRouter();
  const sessionUser = useSessionStore((state) => state.user);
  const updateUser = useSessionStore((state) => state.updateUser);
  const clearAuth = useSessionStore((state) => state.clearAuth);
  const [darkMode, setDarkMode] = useState(sessionUser?.theme !== "light");
  const [notificationsEnabled, setNotificationsEnabled] = useState(sessionUser?.pushNotificationsEnabled ?? true);
  const [ghostMode, setGhostMode] = useState(sessionUser?.isGhostMode ?? false);
  const [autoSave, setAutoSave] = useState(sessionUser?.autoSaveEchoes ?? true);

  useEffect(() => {
    setDarkMode(sessionUser?.theme !== "light");
    setNotificationsEnabled(sessionUser?.pushNotificationsEnabled ?? true);
    setGhostMode(sessionUser?.isGhostMode ?? false);
    setAutoSave(sessionUser?.autoSaveEchoes ?? true);
  }, [sessionUser?.autoSaveEchoes, sessionUser?.isGhostMode, sessionUser?.pushNotificationsEnabled, sessionUser?.theme]);

  const saveSetting = async (patch: Record<string, unknown>) => {
    if (!sessionUser) return;
    const updated = await apiFetch<YowlUser>("/auth/me", {
      method: "PATCH",
      body: JSON.stringify(patch)
    });
    updateUser(updated);
  };

  const switches = [
    { label: "Dark mode", icon: Moon, value: darkMode, setter: setDarkMode },
    { label: "Push notifications", icon: Shield, value: notificationsEnabled, setter: setNotificationsEnabled },
    { label: "Ghost mode", icon: Shield, value: ghostMode, setter: setGhostMode },
    { label: "Auto save Echoes", icon: Zap, value: autoSave, setter: setAutoSave }
  ];

  const notifications: Array<{ id: string; type: string; title: string; body: string; seen: boolean }> = [
    {
      id: "notif_security",
      type: "security",
      title: "Account security",
      body: "JWT auth, rate limits and refresh tokens are active.",
      seen: false
    },
    {
      id: "notif_storage",
      type: "storage",
      title: "Media vault",
      body: "Supabase Storage is ready for uploads.",
      seen: true
    },
    {
      id: "notif_sync",
      type: "sync",
      title: "Live sync",
      body: "Real chats and stories will persist once Supabase is configured.",
      seen: false
    }
  ];

  const logout = async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } finally {
      clearAuth();
      router.push("/login");
    }
  };

  return (
    <div className="space-y-5">
      <GlassPanel className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/40">Settings</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">Fine-tune the Yowl experience</h2>
          </div>
          <Badge>Production-ready structure</Badge>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {switches.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.label} className="border-white/8 bg-white/[0.04]">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-[var(--yowl-primary)]" />
                    <div>
                      <p className="font-semibold">{item.label}</p>
                      <p className="text-sm text-white/48">Modern controls and graceful defaults.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const next = !item.value;
                      item.setter(next);
                      if (item.label === "Dark mode") {
                        saveSetting({ theme: next ? "dark" : "light" }).catch(() => undefined);
                      } else if (item.label === "Push notifications") {
                        saveSetting({ pushNotificationsEnabled: next }).catch(() => undefined);
                      } else if (item.label === "Ghost mode") {
                        saveSetting({ isGhostMode: next }).catch(() => undefined);
                      } else if (item.label === "Auto save Echoes") {
                        saveSetting({ autoSaveEchoes: next }).catch(() => undefined);
                      }
                    }}
                    className={cn(
                      "relative h-8 w-14 rounded-full border transition",
                      item.value ? "border-[var(--yowl-primary)] bg-[var(--yowl-primary)]/20" : "border-white/10 bg-white/5"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-1 h-6 w-6 rounded-full bg-white transition",
                        item.value ? "left-7" : "left-1"
                      )}
                    />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="border-white/8 bg-white/[0.04]">
            <p className="text-xs uppercase tracking-[0.24em] text-white/38">Notifications</p>
            <div className="mt-4 space-y-3">
              {notifications.map((notification) => (
                <div key={notification.id} className="flex items-start gap-3 rounded-[24px] border border-white/8 bg-white/5 px-4 py-3">
                  <div className={cn("mt-1 h-2.5 w-2.5 rounded-full", notification.seen ? "bg-white/25" : "bg-[var(--yowl-primary)]")} />
                  <div className="flex-1">
                    <p className="font-semibold">{notification.title}</p>
                    <p className="text-sm text-white/50">{notification.body}</p>
                  </div>
                  <Badge>{notification.type}</Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card className="border-white/8 bg-white/[0.04]">
            <p className="text-xs uppercase tracking-[0.24em] text-white/38">Security</p>
            <div className="mt-4 space-y-3">
              <div className="rounded-[24px] bg-white/5 px-4 py-4">
                <p className="font-semibold">JWT auth</p>
                <p className="text-sm text-white/48">Access and refresh token flow</p>
              </div>
              <div className="rounded-[24px] bg-white/5 px-4 py-4">
                <p className="font-semibold">Rate limiting</p>
                <p className="text-sm text-white/48">Protection on auth and chat endpoints</p>
              </div>
              <div className="rounded-[24px] bg-white/5 px-4 py-4">
                <p className="font-semibold">Media vault</p>
                <p className="text-sm text-white/48">Supabase Storage ready</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="glass" className="flex-1">
                <Lock className="h-4 w-4" />
                Password
              </Button>
              <Button variant="destructive" className="flex-1" onClick={logout}>
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </div>
          </Card>
        </div>
      </GlassPanel>
    </div>
  );
}

export function AiScreen() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<AiConversationMessage[]>([
    {
      id: "ai_system_1",
      role: "system",
      content: "Yowl AI helps with captions, replies, filters and recommendations.",
      createdAt: new Date().toISOString()
    },
    {
      id: "ai_assistant_1",
      role: "assistant",
      content: "Try: 'Soft neon, hard launch.' for your Moonlight caption.",
      createdAt: new Date().toISOString()
    }
  ]);
  const suggestions = ["Generate a caption", "Suggest a reply", "Write a Moonlight hook", "Recommend a filter"];

  const sendPrompt = () => {
    if (!prompt.trim()) return;
    setMessages((current) => [
      ...current,
      {
        id: `ai_${Math.random().toString(36).slice(2, 8)}`,
        role: "user",
        content: prompt,
        createdAt: new Date().toISOString()
      },
      {
        id: `ai_${Math.random().toString(36).slice(2, 8)}`,
        role: "assistant",
        content: "Yowl AI placeholder: that reads sharp, premium and launch-ready.",
        createdAt: new Date().toISOString()
      }
    ]);
    setPrompt("");
  };

  return (
    <div className="space-y-5">
      <GlassPanel className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/40">Yowl AI</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">Smart replies and caption ideas</h2>
          </div>
          <Badge>Assistive mode</Badge>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_340px]">
          <Card className="border-white/8 bg-white/[0.04]">
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "max-w-[88%] rounded-[28px] border px-4 py-3",
                    message.role === "assistant"
                      ? "border-white/8 bg-white/8"
                      : "ml-auto border-[var(--yowl-primary)]/20 bg-[var(--yowl-primary)]/12"
                  )}
                >
                  <p className="text-sm leading-6">{message.content}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {suggestions.map((item) => (
                <button
                  key={item}
                  onClick={() => setPrompt(item)}
                  className="rounded-full border border-white/8 bg-white/5 px-3 py-2 text-sm text-white/68 transition hover:bg-white/8"
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <Input
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="Ask Yowl AI..."
                className="bg-white/5"
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    sendPrompt();
                  }
                }}
              />
              <Button onClick={sendPrompt}>
                <Sparkles className="h-4 w-4" />
                Generate
              </Button>
            </div>
          </Card>

          <Card className="border-white/8 bg-white/[0.04]">
            <p className="text-xs uppercase tracking-[0.24em] text-white/38">Recommendations</p>
            <div className="mt-4 space-y-3">
              {[
                "Use warm captions for Howls",
                "Hide seen receipts in ghost mode",
                "Boost Moonlight reach with topic tags",
                "Surface mutual Flames first"
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-[24px] bg-white/5 px-4 py-3">
                  <Check className="h-4 w-4 text-[var(--yowl-primary)]" />
                  <p className="text-sm text-white/68">{item}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-[28px] border border-white/8 bg-gradient-to-br from-white/10 to-transparent p-4">
              <p className="text-sm font-semibold">Filter placeholder</p>
              <p className="mt-1 text-sm text-white/55">AI-powered lens ideas and caption prompts are wired for growth.</p>
            </div>
          </Card>
        </div>
      </GlassPanel>
    </div>
  );
}
