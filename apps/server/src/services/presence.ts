import type { Socket } from "socket.io";
import { accountsDb as prisma } from "../lib/db.js";

const onlineUsers = new Map<string, Set<string>>();

export function markOnline(userId: string, socketId: string) {
  const sockets = onlineUsers.get(userId) ?? new Set<string>();
  sockets.add(socketId);
  onlineUsers.set(userId, sockets);
}

export function markOffline(userId: string, socketId: string) {
  const sockets = onlineUsers.get(userId);
  if (!sockets) return;
  sockets.delete(socketId);
  if (!sockets.size) {
    onlineUsers.delete(userId);
  }
}

export function isOnline(userId: string) {
  return onlineUsers.has(userId);
}

export async function touchPresence(userId: string, ghostMode = false) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      lastSeenAt: new Date(),
      isGhostMode: ghostMode
    }
  });
}

export async function emitUserPresence(socket: Socket, userId: string) {
  socket.broadcast.emit("presence:update", {
    userId,
    online: true
  });
}
