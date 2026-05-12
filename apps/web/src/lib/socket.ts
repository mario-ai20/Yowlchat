import { io, type Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "";

export function createYowlSocket(): Socket | null {
  if (!SOCKET_URL) return null;
  return io(SOCKET_URL, {
    transports: ["websocket"],
    withCredentials: true,
    autoConnect: false
  });
}
