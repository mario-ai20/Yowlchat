"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bookmark,
  Camera,
  ChevronRight,
  Heart,
  MapPinned,
  Search,
  Send,
  Share2,
  Sparkles,
  UserPlus,
  Video,
  X
} from "lucide-react";
import { HOWL_CATEGORIES, EXPLORE_TRENDS } from "@yowl/config";
import { Avatar, Badge, Button, Card, GlassPanel, Input } from "@yowl/ui";
import { cn, formatCompactNumber, timeAgo } from "../../lib/utils";
import { apiFetch } from "../../lib/api";
import { uploadMedia } from "../../lib/media";
import { useSessionStore } from "../../store/session";
import type { EchoMemory, HowlStory, YowlUser } from "@yowl/types";

function TitleBlock({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] uppercase tracking-[0.28em] text-white/40">{eyebrow}</p>
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <p className="max-w-2xl text-sm text-white/58">{description}</p>
    </div>
  );
}

export function FriendsScreen() {
  const sessionUser = useSessionStore((state) => state.user);
  const hydrated = useSessionStore((state) => state.hydrated);
  const [query, setQuery] = useState("");
  const [requestUsername, setRequestUsername] = useState("");
  const [payload, setPayload] = useState<{
    friends: YowlUser[];
    requests: Array<{ id: string; requester: YowlUser }>;
    outgoingRequests: Array<{ id: string; addressee: YowlUser }>;
    suggestions: YowlUser[];
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const reload = async () => {
    if (!hydrated || !sessionUser) {
      setPayload(null);
      return;
    }

    setLoading(true);
    try {
      const data = await apiFetch<{
        friends: YowlUser[];
        requests: Array<{ id: string; requester: YowlUser }>;
        outgoingRequests: Array<{ id: string; addressee: YowlUser }>;
        suggestions: YowlUser[];
      }>("/friends");
      setPayload(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload().catch(() => undefined);
  }, [hydrated, sessionUser]);

  const friends = payload?.friends ?? [];
  const filtered = friends.filter((friend) =>
    `${friend.displayName} ${friend.username}`.toLowerCase().includes(query.toLowerCase())
  );

  const addFriend = async (username: string) => {
    if (!username.trim()) return;
    await apiFetch("/friends/request", {
      method: "POST",
      body: JSON.stringify({ username: username.trim().replace(/^@/, "") })
    });
    setRequestUsername("");
    await reload();
  };

  const updateRequest = async (id: string, action: "accept" | "reject") => {
    await apiFetch(`/friends/${id}/${action}`, { method: "POST" });
    await reload();
  };

  return (
    <div className="space-y-5">
      <GlassPanel className="p-5">
        <TitleBlock
          eyebrow="Friends"
          title="Add, find and keep the circle alive"
          description="Suggested friends, QR/Yowl codes, mutuals and instant requests with premium motion."
        />

        <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_320px]">
          <Card className="border-white/8 bg-white/[0.04]">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-white/35" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by username or name"
                className="border-none bg-transparent px-0 focus:ring-0"
              />
            </div>

            <div className="mt-4 flex gap-2">
              <Input
                value={requestUsername}
                onChange={(event) => setRequestUsername(event.target.value)}
                placeholder="Add by username"
                className="border-white/8 bg-black/20"
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addFriend(requestUsername).catch(() => undefined);
                  }
                }}
              />
              <Button onClick={() => addFriend(requestUsername).catch(() => undefined)} disabled={loading}>
                <UserPlus className="h-4 w-4" />
                Add
              </Button>
            </div>

            <div className="mt-4 space-y-3">
              {filtered.length ? (
                filtered.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center gap-3 rounded-[24px] border border-white/8 bg-white/5 px-4 py-3"
                  >
                    <Avatar name={friend.displayName} className="h-12 w-12" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-semibold">{friend.displayName}</p>
                        {friend.publicProfile ? <Badge>Public</Badge> : <Badge>Private</Badge>}
                      </div>
                      <p className="truncate text-sm text-white/50">@{friend.username}</p>
                    </div>
                    <div className="hidden text-right sm:block">
                      <p className="text-xs text-white/45">{friend.location ?? "No location"}</p>
                      <p className="text-xs text-white/45">{friend.friendsCount ?? 0} friends</p>
                    </div>
                    <Button variant="glass" size="sm">
                      <Send className="h-4 w-4" />
                      Chat
                    </Button>
                  </div>
                ))
              ) : (
                <div className="rounded-[24px] border border-dashed border-white/10 bg-white/5 px-4 py-4 text-sm text-white/58">
                  {hydrated && sessionUser
                    ? "Nog geen echte vrienden gesynchroniseerd. Voeg iemand toe via username."
                    : "Log in om je echte vrienden te zien."}
                </div>
              )}
            </div>
          </Card>

          <div className="space-y-4">
            <Card className="border-white/8 bg-white/[0.04]">
              <p className="text-xs uppercase tracking-[0.26em] text-white/38">QR / Yowl code</p>
              <div className="mt-4 grid place-items-center rounded-[28px] border border-dashed border-white/12 bg-black/20 p-6">
                <div className="grid grid-cols-5 gap-1 rounded-[24px] bg-white p-3">
                  {Array.from({ length: 25 }).map((_, index) => (
                    <span
                      key={index}
                      className={cn("h-4 w-4 rounded-[4px]", index % 3 === 0 ? "bg-black" : "bg-white")}
                    />
                  ))}
                </div>
                <p className="mt-4 text-sm text-white/60">
                  {sessionUser ? `yowl://${sessionUser.username}` : "yowl://your-account"}
                </p>
              </div>
            </Card>
            <Card className="border-white/8 bg-white/[0.04]">
              <p className="text-xs uppercase tracking-[0.26em] text-white/38">Mutuals</p>
              <div className="mt-4 flex -space-x-3">
                {friends.length ? (
                  friends.slice(0, 5).map((friend) => (
                    <Avatar key={friend.id} name={friend.displayName} className="h-12 w-12 ring-2 ring-black" />
                  ))
                ) : (
                  <p className="text-sm text-white/58">Nog geen mutuals zichtbaar.</p>
                )}
              </div>
              <p className="mt-4 text-sm text-white/58">Suggested by shared Flames and live map pings.</p>
            </Card>
            <Card className="border-white/8 bg-white/[0.04]">
              <p className="text-xs uppercase tracking-[0.26em] text-white/38">Requests</p>
              <div className="mt-4 space-y-3">
                {(payload?.requests ?? []).length ? (
                  (payload?.requests ?? []).map((request) => (
                    <div key={request.id} className="flex items-center justify-between rounded-2xl bg-white/5 px-3 py-3">
                      <span className="text-sm font-semibold">{request.requester.displayName}</span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="glass" onClick={() => updateRequest(request.id, "accept").catch(() => undefined)}>
                          Add
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => updateRequest(request.id, "reject").catch(() => undefined)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-white/58">Geen open requests.</p>
                )}
              </div>
            </Card>
            <Card className="border-white/8 bg-white/[0.04]">
              <p className="text-xs uppercase tracking-[0.26em] text-white/38">Outgoing</p>
              <div className="mt-4 space-y-3">
                {(payload?.outgoingRequests ?? []).length ? (
                  (payload?.outgoingRequests ?? []).map((request) => (
                    <div key={request.id} className="flex items-center justify-between rounded-2xl bg-white/5 px-3 py-3">
                      <span className="text-sm font-semibold">{request.addressee.displayName}</span>
                      <Badge>Pending</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-white/58">Geen outgoing requests.</p>
                )}
              </div>
            </Card>
            <Card className="border-white/8 bg-white/[0.04]">
              <p className="text-xs uppercase tracking-[0.26em] text-white/38">Suggestions</p>
              <div className="mt-4 space-y-3">
                {(payload?.suggestions ?? []).length ? (
                  (payload?.suggestions ?? []).map((suggestion) => (
                    <div key={suggestion.id} className="flex items-center justify-between rounded-2xl bg-white/5 px-3 py-3">
                      <div>
                        <span className="text-sm font-semibold">{suggestion.displayName}</span>
                        <p className="text-xs text-white/48">@{suggestion.username}</p>
                      </div>
                      <Button size="sm" variant="glass" onClick={() => addFriend(suggestion.username).catch(() => undefined)}>
                        Add
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-white/58">Geen suggesties beschikbaar totdat echte data binnenkomt.</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}

export function HowlsScreen() {
  const sessionUser = useSessionStore((state) => state.user);
  const hydrated = useSessionStore((state) => state.hydrated);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [stories, setStories] = useState<Array<HowlStory & { author?: YowlUser }>>([]);
  const [selectedId, setSelectedId] = useState("");
  const [caption, setCaption] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!hydrated || !sessionUser) {
      setStories([]);
      return;
    }

    apiFetch<Array<HowlStory & { author?: YowlUser }>>("/howls")
      .then((data) => setStories(data))
      .catch(() => setStories([]));
  }, [hydrated, sessionUser]);

  useEffect(() => {
    if (!stories.length) {
      setSelectedId("");
      return;
    }

    if (!stories.some((story) => story.id === selectedId)) {
      setSelectedId(stories[0].id);
    }
  }, [stories, selectedId]);

  const selected = stories.find((item) => item.id === selectedId) ?? stories[0];

  const createHowl = async () => {
    if (!file) return;
    setSaving(true);

    try {
      const uploaded = await uploadMedia(file);
      const story = await apiFetch<HowlStory & { author?: YowlUser }>("/howls", {
        method: "POST",
        body: JSON.stringify({
          mediaUrl: uploaded.url,
          mediaType,
          caption: caption || undefined
        })
      });

      setStories((current) => [story, ...current]);
      setSelectedId(story.id);
      setCaption("");
      setFile(null);
      if (fileRef.current) {
        fileRef.current.value = "";
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <GlassPanel className="p-5">
        <TitleBlock
          eyebrow="Howls"
          title="Stories with a cinematic glow"
          description="Tap through a viewer with progress bars, reactions and auto-expiring media."
        />

        <div className="mt-5 grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
          <Card className="border-white/8 bg-white/[0.04]">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.26em] text-white/38">Active Howls</p>
              <Badge>24h auto expire</Badge>
            </div>
            <div className="mt-4 space-y-3 rounded-[28px] border border-white/8 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <Input
                  ref={fileRef}
                  type="file"
                  accept="image/*,video/*"
                  className="bg-black/20"
                  onChange={(event) => {
                    const nextFile = event.target.files?.[0] ?? null;
                    setFile(nextFile);
                    if (nextFile) {
                      setMediaType(nextFile.type.startsWith("video") ? "video" : "image");
                    }
                  }}
                />
                <Button variant="glass" size="sm" onClick={createHowl} disabled={!file || saving}>
                  <Camera className="h-4 w-4" />
                  {saving ? "Posting" : "Post"}
                </Button>
              </div>
              <Input value={caption} onChange={(event) => setCaption(event.target.value)} placeholder="Howl caption" className="bg-black/20" />
            </div>
            <div className="mt-4 flex gap-3 overflow-auto pb-2">
              {stories.length ? (
                stories.map((story) => (
                  <button key={story.id} onClick={() => setSelectedId(story.id)} className="shrink-0 text-center">
                    <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-[var(--yowl-primary)] via-white to-cyan-400 p-[3px]">
                      <Avatar name={story.author?.displayName ?? "Yowl"} className="h-full w-full border-none bg-black" />
                    </span>
                    <span className="mt-2 block text-xs text-white/60">
                      {story.author?.displayName?.split(" ")[0] ?? "You"}
                    </span>
                  </button>
                ))
              ) : (
                <div className="rounded-[24px] border border-dashed border-white/10 bg-white/5 px-4 py-4 text-sm text-white/58">
                  Nog geen Howls. Post de eerste echte story zodra Supabase live is.
                </div>
              )}
            </div>

            <div className="mt-5 rounded-[30px] border border-white/8 bg-black/30 p-4">
              <div className="grid grid-cols-5 gap-1">
                {Array.from({ length: 5 }).map((_, index) => (
                  <span
                    key={index}
                    className={cn("h-1.5 rounded-full", index < 3 ? "bg-[var(--yowl-primary)]" : "bg-white/10")}
                  />
                ))}
              </div>
              <div className="mt-4 rounded-[28px] bg-gradient-to-br from-fuchsia-600 via-slate-900 to-[var(--yowl-primary)] p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold">{selected ? "Now viewing" : "No story yet"}</p>
                    <p className="text-xs text-white/65">{selected ? timeAgo(selected.expiresAt) + " left" : ""}</p>
                  </div>
                  <Badge>{selected?.mediaType ?? "image"}</Badge>
                </div>
                <div className="mt-10 flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-semibold">{selected?.caption ?? "Untitled Howl"}</p>
                    <p className="mt-2 text-sm text-white/75">Viewer taps, reactions and swipe navigation are ready.</p>
                  </div>
                  <div className="grid h-16 w-16 place-items-center rounded-full border border-white/18 bg-black/25">
                    <Video className="h-7 w-7" />
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-3 text-sm text-white/55">
                  <span>{selected?.viewers.length ?? 0} viewers</span>
                  <span className="h-1 w-1 rounded-full bg-white/30" />
                  <span>{selected?.reactions.length ?? 0} reactions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="glass" size="sm">
                    <Heart className="h-4 w-4" />
                    React
                  </Button>
                  <Button variant="glass" size="sm">
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-white/8 bg-white/[0.04]">
            <p className="text-xs uppercase tracking-[0.26em] text-white/38">Viewer list</p>
            <div className="mt-4 space-y-3">
              {selected?.author ? (
                <div className="flex items-center justify-between rounded-[24px] border border-white/8 bg-white/5 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={selected.author.displayName} className="h-11 w-11" />
                    <div>
                      <p className="font-semibold">{selected.author.displayName}</p>
                      <p className="text-xs text-white/48">@{selected.author.username}</p>
                    </div>
                  </div>
                  <Badge>author</Badge>
                </div>
              ) : (
                <p className="text-sm text-white/58">Nog geen viewers of authors zichtbaar.</p>
              )}
            </div>
          </Card>
        </div>
      </GlassPanel>
    </div>
  );
}

export function MoonlightScreen() {
  const clips = [
    { title: "Launch vibes", creator: "Featured clip", likes: 1824, comments: 96, color: "from-violet-600 to-fuchsia-500" },
    { title: "Camera test", creator: "Featured clip", likes: 992, comments: 41, color: "from-cyan-600 to-blue-500" },
    { title: "Yowl UI", creator: "Featured clip", likes: 2441, comments: 123, color: "from-emerald-500 to-lime-400" }
  ];

  return (
    <div className="space-y-5">
      <GlassPanel className="p-5">
        <TitleBlock
          eyebrow="Moonlight"
          title="Vertical feed that feels algorithmically alive"
          description="Infinite-scroll style discovery with fullscreen cards, likes and shares."
        />

        <div className="mt-5 grid gap-4">
          {clips.map((clip, index) => (
            <motion.article
              key={clip.title}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06, type: "spring", stiffness: 180, damping: 24 }}
              className={cn("overflow-hidden rounded-[34px] border border-white/8 bg-white/[0.04]")}
            >
              <div className={cn("min-h-[420px] bg-gradient-to-br p-5", clip.color)}>
                <div className="flex items-start justify-between">
                  <div className="rounded-full border border-white/20 bg-black/20 px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em]">
                    Moonlight
                  </div>
                  <Badge>Auto play</Badge>
                </div>
                <div className="mt-28 max-w-md">
                  <p className="text-3xl font-semibold tracking-tight">{clip.title}</p>
                  <p className="mt-2 text-white/80">Creator feed, cinematic gradient surfaces and full screen motion.</p>
                </div>
              </div>
              <div className="flex items-center justify-between px-4 py-4">
                <div>
                  <p className="font-semibold">{clip.creator}</p>
                  <p className="text-xs text-white/48">{formatCompactNumber(clip.likes)} likes</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="glass" size="sm">
                    <Heart className="h-4 w-4" />
                    {formatCompactNumber(clip.likes)}
                  </Button>
                  <Button variant="glass" size="sm">
                    <ChevronRight className="h-4 w-4" />
                    {clip.comments}
                  </Button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </GlassPanel>
    </div>
  );
}

export function ExploreScreen() {
  const creators = [
    { id: "creator_1", displayName: "Launch Studio", username: "launch.studio", followers: 1400 },
    { id: "creator_2", displayName: "Night Lens", username: "night.lens", followers: 2265 },
    { id: "creator_3", displayName: "Motion Lab", username: "motion.lab", followers: 3110 }
  ];

  return (
    <div className="space-y-5">
      <GlassPanel className="p-5">
        <TitleBlock
          eyebrow="Explore"
          title="Trending topics, creators and recommendations"
          description="Search, categories and algorithm placeholders tuned for a premium social feed."
        />

        <div className="mt-5 flex items-center gap-2 rounded-[24px] border border-white/8 bg-white/5 px-4 py-3">
          <Search className="h-4 w-4 text-white/35" />
          <Input placeholder="Search hashtags, people or sounds" className="border-none bg-transparent px-0 focus:ring-0" />
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {HOWL_CATEGORIES.map((category) => (
            <Badge key={category}>{category}</Badge>
          ))}
        </div>

        <div className="mt-6 grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
          <Card className="border-white/8 bg-white/[0.04]">
            <p className="text-xs uppercase tracking-[0.26em] text-white/38">Trending</p>
            <div className="mt-4 space-y-3">
              {EXPLORE_TRENDS.map((trend, index) => (
                <div key={trend} className="flex items-center justify-between rounded-[24px] bg-white/5 px-4 py-3">
                  <div>
                    <p className="font-semibold">{trend}</p>
                    <p className="text-xs text-white/48">{1200 + index * 340} posts</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-[var(--yowl-primary)]" />
                </div>
              ))}
            </div>
          </Card>
          <Card className="border-white/8 bg-white/[0.04]">
            <p className="text-xs uppercase tracking-[0.26em] text-white/38">Creators</p>
            <div className="mt-4 space-y-3">
              {creators.map((creator) => (
                <div key={creator.id} className="flex items-center gap-3 rounded-[24px] border border-white/8 bg-white/5 px-4 py-3">
                  <Avatar name={creator.displayName} className="h-12 w-12" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{creator.displayName}</p>
                    <p className="truncate text-sm text-white/48">@{creator.username}</p>
                  </div>
                  <Badge>{formatCompactNumber(creator.followers)} fans</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </GlassPanel>
    </div>
  );
}

export function YowlMapScreen() {
  const [selected, setSelected] = useState<null | { id: string; displayName: string; username: string; lastSeen: string; ghost: boolean }>(null);

  return (
    <div className="space-y-5">
      <GlassPanel className="p-5">
        <TitleBlock
          eyebrow="YowlMap"
          title="Realtime presence in a premium map shell"
          description="Friend locations, ghost mode and profile jump-ins with original map UI."
        />

        <div className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <Card className="min-h-[64vh] overflow-hidden border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.08),transparent_30%),linear-gradient(135deg,rgba(10,10,16,0.95),rgba(22,22,28,0.9))]">
            <div className="flex items-center justify-between">
              <Badge>Ghost mode available</Badge>
              <Badge>Live location</Badge>
            </div>
            <div className="relative mt-5 grid h-[52vh] place-items-center overflow-hidden rounded-[32px] border border-white/8 bg-[linear-gradient(135deg,rgba(255,255,255,0.05),transparent)]">
              <div className="absolute inset-0 bg-[linear-gradient(transparent_49%,rgba(255,255,255,0.05)_50%)] bg-[length:100%_42px]" />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_49%,rgba(255,255,255,0.05)_50%)] bg-[length:42px_100%]" />
              <div className="relative z-10 max-w-md rounded-[28px] border border-white/10 bg-black/35 p-6 text-center">
                <MapPinned className="mx-auto h-10 w-10 text-[var(--yowl-primary)]" />
                <p className="mt-4 text-lg font-semibold">No live locations yet</p>
                <p className="mt-2 text-sm text-white/58">
                  Zodra echte vrienden live zijn, verschijnen hun pins hier met YowlMojis en ghost mode.
                </p>
              </div>
            </div>
          </Card>
          <Card className="border-white/8 bg-white/[0.04]">
            <p className="text-xs uppercase tracking-[0.26em] text-white/38">Selected friend</p>
            <div className="mt-4 rounded-[24px] border border-dashed border-white/10 bg-white/5 px-4 py-4 text-sm text-white/58">
              {selected ? selected.displayName : "No friend selected"}
            </div>
            <div className="mt-4 space-y-3">
              <div className="rounded-[24px] bg-white/5 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.22em] text-white/38">Last seen</p>
                <p className="mt-2 text-lg font-semibold">{selected ? timeAgo(selected.lastSeen) : "Waiting for real presence"}</p>
              </div>
              <div className="rounded-[24px] bg-white/5 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.22em] text-white/38">Privacy</p>
                <p className="mt-2 text-lg font-semibold">{selected?.ghost ? "Ghost mode" : "Visible"}</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button className="flex-1">
                <MapPinned className="h-4 w-4" />
                View profile
              </Button>
              <Button variant="glass" className="flex-1">
                <Send className="h-4 w-4" />
                Chat
              </Button>
            </div>
          </Card>
        </div>
      </GlassPanel>
    </div>
  );
}

export function EchoesScreen() {
  const sessionUser = useSessionStore((state) => state.user);
  const hydrated = useSessionStore((state) => state.hydrated);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const folders = ["All", "Favorites", "UI", "Launch", "Private"];
  const [activeFolder, setActiveFolder] = useState("All");
  const [query, setQuery] = useState("");
  const [memoriesState, setMemoriesState] = useState<EchoMemory[]>([]);
  const [title, setTitle] = useState("");
  const [folder, setFolder] = useState("Favorites");
  const [favorite, setFavorite] = useState(false);
  const [isPrivate, setIsPrivate] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!hydrated || !sessionUser) {
      setMemoriesState([]);
      return;
    }

    apiFetch<EchoMemory[]>("/echoes")
      .then((data) => setMemoriesState(data))
      .catch(() => setMemoriesState([]));
  }, [hydrated, sessionUser]);

  const filtered = memoriesState.filter((item) => {
    const folderMatch = activeFolder === "All" || item.folder === activeFolder;
    const queryMatch = `${item.title} ${item.folder}`.toLowerCase().includes(query.toLowerCase());
    return folderMatch && queryMatch;
  });

  const saveEcho = async () => {
    if (!file || !title.trim()) return;
    setSaving(true);

    try {
      const uploaded = await uploadMedia(file);
      const memory = await apiFetch<EchoMemory>("/echoes", {
        method: "POST",
        body: JSON.stringify({
          title: title.trim(),
          mediaUrl: uploaded.url,
          folder,
          favorite,
          isPrivate
        })
      });

      setMemoriesState((current) => [memory, ...current]);
      setTitle("");
      setFile(null);
      setFavorite(false);
      setIsPrivate(true);
      if (fileRef.current) {
        fileRef.current.value = "";
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <GlassPanel className="p-5">
        <TitleBlock
          eyebrow="Echoes"
          title="Private vault for saved photos and videos"
          description="Folders, search, favorites and cloud-sync-ready memory management."
        />

        <div className="mt-5 flex flex-wrap gap-2">
          {folders.map((folder) => (
            <button
              key={folder}
              onClick={() => setActiveFolder(folder)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium transition",
                activeFolder === folder
                  ? "border-[var(--yowl-primary)] bg-[var(--yowl-primary)] text-black"
                  : "border-white/8 bg-white/5 text-white/65 hover:bg-white/8"
              )}
            >
              {folder}
            </button>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-[24px] border border-white/8 bg-white/5 px-4 py-3">
          <Search className="h-4 w-4 text-white/35" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search Echoes" className="border-none bg-transparent px-0 focus:ring-0" />
        </div>

        <Card className="mt-5 border-white/8 bg-white/[0.04]">
          <div className="grid gap-3 lg:grid-cols-[1fr_1fr_160px]">
            <Input ref={fileRef} type="file" accept="image/*,video/*" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
            <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Echo title" />
            <Button onClick={saveEcho} disabled={!file || !title.trim() || saving}>
              <Bookmark className="h-4 w-4" />
              {saving ? "Saving" : "Save"}
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant={folder === "Favorites" ? "default" : "glass"} size="sm" onClick={() => setFolder("Favorites")}>
              Favorites
            </Button>
            <Button variant={folder === "UI" ? "default" : "glass"} size="sm" onClick={() => setFolder("UI")}>
              UI
            </Button>
            <Button variant={folder === "Launch" ? "default" : "glass"} size="sm" onClick={() => setFolder("Launch")}>
              Launch
            </Button>
            <Button variant={folder === "Private" ? "default" : "glass"} size="sm" onClick={() => setFolder("Private")}>
              Private
            </Button>
            <Button variant={favorite ? "default" : "glass"} size="sm" onClick={() => setFavorite((current) => !current)}>
              Favorite
            </Button>
            <Button variant={isPrivate ? "default" : "glass"} size="sm" onClick={() => setIsPrivate((current) => !current)}>
              {isPrivate ? "Private" : "Shared"}
            </Button>
          </div>
        </Card>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.length ? (
            filtered.map((memory) => (
              <Card key={memory.id} className="overflow-hidden border-white/8 bg-white/[0.04] p-0">
                <div className="min-h-48 bg-gradient-to-br from-white/12 via-white/6 to-transparent p-4">
                  <div className="flex items-center justify-between">
                    <Badge>{memory.folder}</Badge>
                    <Badge>{memory.isPrivate ? "Private" : "Shared"}</Badge>
                  </div>
                  <div className="mt-10">
                    <p className="text-2xl font-semibold">{memory.title}</p>
                    <p className="mt-2 text-sm text-white/58">Saved {timeAgo(memory.createdAt)} ago</p>
                  </div>
                </div>
                <div className="flex items-center justify-between px-4 py-4">
                  <span className="text-sm text-white/56">Favorites {memory.favorite ? "on" : "off"}</span>
                  <Button variant="glass" size="sm">
                    <Bookmark className="h-4 w-4" />
                    Open
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <div className="rounded-[28px] border border-dashed border-white/10 bg-white/5 p-6 text-sm text-white/58">
              Geen Echoes yet. Zodra echte media in Supabase zit, verschijnt hier je vault.
            </div>
          )}
        </div>
      </GlassPanel>
    </div>
  );
}

const hairStyles = ["Buzz", "Wave", "Layered", "Curtain", "Neon"];
const outfits = ["Hoodie", "Bomber", "Oversized Tee", "Puffer", "Suit"];
const accessories = ["Cap", "Glasses", "Earbuds", "Chains", "None"];
const emotions = ["Chill", "Hype", "Smirk", "Focused", "Zen"];
const skinTones = ["Porcelain", "Warm", "Deep", "Olive", "Tan"];

export function YowlMojiScreen() {
  const [hair, setHair] = useState(hairStyles[1]);
  const [outfit, setOutfit] = useState(outfits[0]);
  const [accessory, setAccessory] = useState(accessories[1]);
  const [emotion, setEmotion] = useState(emotions[1]);
  const [skinTone, setSkinTone] = useState(skinTones[1]);

  return (
    <div className="space-y-5">
      <GlassPanel className="p-5">
        <TitleBlock
          eyebrow="YowlMoji"
          title="Original avatar builder with expressive placeholders"
          description="Mix hair, clothes, accessories and moods to shape your Yowl identity."
        />

        <div className="mt-5 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
          <Card className="border-white/8 bg-white/[0.04]">
            <div className="grid place-items-center rounded-[32px] border border-white/8 bg-gradient-to-br from-white/10 via-black/20 to-transparent p-8">
              <div className="grid h-48 w-48 place-items-center rounded-full border border-white/12 bg-[radial-gradient(circle,rgba(168,85,247,0.22),rgba(0,0,0,0.3))] text-center">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-white/40">YowlMoji</p>
                  <p className="mt-2 text-3xl font-semibold">{emotion}</p>
                </div>
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            {[
              { label: "Hair", value: hair, setter: setHair, options: hairStyles },
              { label: "Outfit", value: outfit, setter: setOutfit, options: outfits },
              { label: "Accessory", value: accessory, setter: setAccessory, options: accessories },
              { label: "Emotion", value: emotion, setter: setEmotion, options: emotions },
              { label: "Skin tone", value: skinTone, setter: setSkinTone, options: skinTones }
            ].map((section) => (
              <Card key={section.label} className="border-white/8 bg-white/[0.04]">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{section.label}</p>
                  <Badge>{section.value}</Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {section.options.map((option) => (
                    <button
                      key={option}
                      onClick={() => section.setter(option)}
                      className={cn(
                        "rounded-full border px-3 py-2 text-sm transition",
                        section.value === option
                          ? "border-[var(--yowl-primary)] bg-[var(--yowl-primary)] text-black"
                          : "border-white/8 bg-white/5 text-white/68 hover:bg-white/8"
                      )}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}
