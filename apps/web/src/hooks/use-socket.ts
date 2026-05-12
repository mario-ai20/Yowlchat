"use client";

import { useEffect, useState } from "react";
import { createYowlSocket } from "../lib/socket";
import { useSessionStore } from "../store/session";

export function useYowlSocket() {
  const token = useSessionStore((state) => state.accessToken);
  const [status, setStatus] = useState<"idle" | "connecting" | "connected" | "error">("idle");

  useEffect(() => {
    const socket = createYowlSocket(token);
    if (!socket) {
      setStatus("idle");
      return;
    }

    setStatus("connecting");
    socket.connect();

    socket.on("connect", () => setStatus("connected"));
    socket.on("connect_error", () => setStatus("error"));

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, [token]);

  return { status };
}
