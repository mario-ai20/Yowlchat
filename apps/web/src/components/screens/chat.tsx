"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCheck,
  Flame,
  Paperclip,
  Pin,
  Reply,
  Send,
  SmilePlus,
  Sparkles,
  Wifi,
  WifiOff
} from "lucide-react";
import { apiFetch } from "../../lib/api";
import { Badge, Button, Card, GlassPanel, Input, Avatar } from "@yowl/ui";
import { cn, timeAgo } from "../../lib/utils";
import type { YowlChat, YowlMessage } from "@yowl/types";
import { useYowlSocket } from "../../hooks/use-socket";
import { useSessionStore } from "../../store/session";

function receiptState(message: YowlMessage, userId: string) {
  const receipt = message.receipts[userId] ?? Object.values(message.receipts)[0];
  if (!receipt) return "sent";
  if (receipt.readAt) return "read";
  if (receipt.deliveredAt) return "delivered";
  return "sent";
}

export function ChatScreen() {
  const token = useSessionStore((state) => state.accessToken);
  const sessionUser = useSessionStore((state) => state.user);
  const [selectedChatId, setSelectedChatId] = useState("");
  const [draft, setDraft] = useState("");
  const [replyTo, setReplyTo] = useState<YowlMessage | null>(null);
  const [remoteChats, setRemoteChats] = useState<YowlChat[]>([]);
  const [threads, setThreads] = useState<Record<string, YowlMessage[]>>({});
  const [loadingChats, setLoadingChats] = useState(false);
  const [sending, setSending] = useState(false);
  const { status } = useYowlSocket();

  useEffect(() => {
    if (!token) {
      setRemoteChats([]);
      setThreads({});
      return;
    }

    let cancelled = false;
    setLoadingChats(true);

    apiFetch<YowlChat[]>("/chats")
      .then((data) => {
        if (!cancelled) setRemoteChats(data);
      })
      .catch(() => {
        if (!cancelled) setRemoteChats([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingChats(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (!remoteChats.length) {
      setSelectedChatId("");
      return;
    }

    if (!remoteChats.some((chat) => chat.id === selectedChatId)) {
      setSelectedChatId(remoteChats[0].id);
    }
  }, [remoteChats, selectedChatId]);

  const selectedChat = useMemo(
    () => remoteChats.find((chat) => chat.id === selectedChatId) ?? null,
    [remoteChats, selectedChatId]
  );

  useEffect(() => {
    if (!selectedChat?.id || !token || threads[selectedChat.id]) return;

    let cancelled = false;

    apiFetch<YowlMessage[]>(`/chats/${selectedChat.id}/messages`)
      .then((messages) => {
        if (!cancelled) {
          setThreads((current) => ({
            ...current,
            [selectedChat.id]: messages
          }));
        }
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [selectedChat?.id, threads, token]);

  const thread = selectedChat ? threads[selectedChat.id] ?? [] : [];

  const sendMessage = async () => {
    if (!selectedChat || !sessionUser || !draft.trim() || sending) return;

    const content = draft.trim();
    setDraft("");
    setReplyTo(null);
    setSending(true);

    try {
      const result = await apiFetch<YowlMessage>(`/chats/${selectedChat.id}/messages`, {
        method: "POST",
        body: JSON.stringify({
          content,
          replyToId: replyTo?.id ?? undefined
        })
      });

      setThreads((current) => ({
        ...current,
        [selectedChat.id]: [...(current[selectedChat.id] ?? []), result]
      }));

      setRemoteChats((current) =>
        current.map((chat) =>
          chat.id === selectedChat.id
            ? {
                ...chat,
                lastMessage: result,
                unreadCount: 0,
                typingUsers: []
              }
            : chat
        )
      );
    } catch {
      // If the backend is temporarily unavailable, keep the composer responsive.
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
      <GlassPanel className="overflow-hidden p-0">
        <div className="border-b border-white/8 px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.26em] text-white/42">Realtime chat</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">Conversations that feel alive</h2>
            </div>
            <Badge>{loadingChats ? "Syncing" : status === "connected" ? "Socket live" : "Socket idle"}</Badge>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              { label: "Delivered", value: "99.8%", icon: CheckCheck },
              { label: "Typing", value: "Live", icon: Sparkles },
              { label: "Flames", value: "Ready", icon: Flame }
            ].map((metric) => {
              const Icon = metric.icon;
              return (
                <Card key={metric.label} className="border-white/8 bg-white/[0.04] p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-[0.22em] text-white/42">{metric.label}</p>
                    <Icon className="h-4 w-4 text-[var(--yowl-primary)]" />
                  </div>
                  <p className="mt-2 text-lg font-semibold">{metric.value}</p>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="space-y-2 p-3 premium-scrollbar max-h-[72vh] overflow-auto">
          {!remoteChats.length ? (
            <div className="rounded-[28px] border border-dashed border-white/10 bg-white/5 p-5 text-sm text-white/58">
              Geen chats yet. Voeg eerst een echt account toe en start daarna een gesprek.
            </div>
          ) : null}

          {remoteChats.map((chat) => {
            const last = chat.lastMessage;
            const isActive = chat.id === selectedChatId;

            return (
              <button
                key={chat.id}
                onClick={() => setSelectedChatId(chat.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-[24px] border px-3 py-3 text-left transition",
                  isActive
                    ? "border-[var(--yowl-primary)]/30 bg-[var(--yowl-primary)]/10"
                    : "border-white/8 bg-white/[0.04] hover:bg-white/[0.07]"
                )}
              >
                <Avatar name={chat.title} className="h-12 w-12" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate font-semibold">{chat.title}</p>
                    <span className="text-xs text-white/45">{last ? timeAgo(last.createdAt) : "now"}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-sm text-white/55">
                    <span className="truncate">{last?.content ?? "No messages yet"}</span>
                    {chat.pinned && <Pin className="h-3.5 w-3.5 text-[var(--yowl-primary)]" />}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {chat.unreadCount > 0 ? (
                    <span className="rounded-full bg-[var(--yowl-primary)] px-2 py-1 text-[11px] font-bold text-black">
                      {chat.unreadCount}
                    </span>
                  ) : null}
                  {chat.isStreakActive ? <Wifi className="h-4 w-4 text-emerald-400" /> : <WifiOff className="h-4 w-4 text-white/40" />}
                  <Badge>{chat.isStreakActive ? `${chat.flameCount} flames` : "quiet"}</Badge>
                </div>
              </button>
            );
          })}
        </div>
      </GlassPanel>

      <GlassPanel className="flex min-h-[72vh] flex-col overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-white/8 px-4 py-4">
          <div className="flex items-center gap-3">
            <Avatar name={selectedChat?.title ?? "YowlChat"} className="h-12 w-12" />
            <div>
              <h3 className="text-lg font-semibold">{selectedChat?.title ?? "No chat selected"}</h3>
              <div className="mt-1 flex items-center gap-2 text-sm text-white/55">
                <WifiOff className="h-4 w-4" />
                <span>{selectedChat ? "waiting for a real reply" : "open a chat to start"}</span>
                <span className="h-1 w-1 rounded-full bg-white/25" />
                <span>{selectedChat ? "visible" : "idle"}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge>{selectedChat?.isStreakActive ? "Flame active" : "No flame"}</Badge>
            <Button variant="glass" size="sm">
              <Pin className="h-4 w-4" />
              Pin
            </Button>
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-auto px-4 py-4 premium-scrollbar">
          {!selectedChat ? (
            <div className="grid h-full place-items-center rounded-[28px] border border-dashed border-white/10 bg-white/5 p-8 text-center text-sm text-white/58">
              Geen chat geselecteerd. Zodra je een echte vriend toevoegt, verschijnt de thread hier.
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {thread.map((message, index) => {
                const isMine = message.senderId === sessionUser?.id;
                const state = receiptState(message, sessionUser?.id ?? "");

                return (
                  <motion.div
                    key={message.id}
                    layout
                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ type: "spring", stiffness: 220, damping: 24, delay: index * 0.01 }}
                    className={cn("flex", isMine ? "justify-end" : "justify-start")}
                  >
                    <div
                      className={cn(
                        "max-w-[82%] rounded-[28px] border px-4 py-3 shadow-[0_18px_50px_rgba(0,0,0,0.25)] backdrop-blur-xl",
                        isMine
                          ? "border-[var(--yowl-primary)]/20 bg-[var(--yowl-primary)]/15 text-white"
                          : "border-white/8 bg-white/8 text-white"
                      )}
                    >
                      {message.replyToId ? (
                        <div className="mb-2 rounded-2xl border border-white/8 bg-black/20 px-3 py-2 text-xs text-white/55">
                          Replying to a previous Yowl
                        </div>
                      ) : null}
                      <p className="text-sm leading-6">{message.content}</p>
                      <div className="mt-3 flex items-center justify-between gap-4 text-[11px] text-white/48">
                        <span>{timeAgo(message.createdAt)}</span>
                        <span className="flex items-center gap-1">
                          {state === "read" ? <CheckCheck className="h-3.5 w-3.5 text-[var(--yowl-primary)]" /> : null}
                          {state === "delivered" ? "delivered" : state === "read" ? "read" : "sent"}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}

          {selectedChat?.typingUsers.length ? (
            <div className="flex items-center gap-2 text-sm text-white/55">
              <span className="inline-flex h-2 w-2 rounded-full bg-[var(--yowl-primary)] animate-pulse" />
              Someone is typing a Yowl...
            </div>
          ) : null}
        </div>

        {replyTo ? (
          <div className="mx-4 rounded-2xl border border-white/8 bg-white/5 px-3 py-2 text-sm text-white/65">
            Replying to: {replyTo.content}
          </div>
        ) : null}

        <div className="border-t border-white/8 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="glass" size="sm">
              <Reply className="h-4 w-4" />
              Reply
            </Button>
            <Button variant="glass" size="sm">
              <Paperclip className="h-4 w-4" />
              Media
            </Button>
            <Button variant="glass" size="sm">
              <SmilePlus className="h-4 w-4" />
              React
            </Button>
            <Badge>Swipe to archive</Badge>
          </div>

          <div className="mt-3 flex items-end gap-2">
            <Input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={selectedChat ? "Send a disappearing Yowl..." : "Open a chat first"}
              className="min-h-12 flex-1 bg-white/8"
              disabled={!selectedChat || !sessionUser}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  sendMessage();
                }
              }}
            />
            <Button variant="glass" className="h-12 w-12 px-0" disabled={!selectedChat || !sessionUser}>
              <Sparkles className="h-4 w-4" />
            </Button>
            <Button className="h-12 px-5" onClick={sendMessage} disabled={sending || !selectedChat || !sessionUser}>
              <Send className="h-4 w-4" />
              {sending ? "Sending" : "Send"}
            </Button>
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}
