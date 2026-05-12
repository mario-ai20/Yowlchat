"use client";

import { useEffect, useState } from "react";
import { createYowlSocket } from "../lib/socket";

export function useYowlSocket() {
  const [status, setStatus] = useState<"idle" | "connecting" | "connected" | "error">("idle");

  useEffect(() => {
    const socket = createYowlSocket();
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
  }, []);

  return { status };
}
