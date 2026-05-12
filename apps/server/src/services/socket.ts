import type { Server as HttpServer } from "node:http";
import bcrypt from "bcryptjs";
import { Server } from "socket.io";
import { verifyAccessToken, verifyRefreshToken } from "../lib/jwt.js";
import { markOffline, markOnline, touchPresence } from "./presence.js";
import { accountsDb as authPrisma, coreDb as prisma } from "../lib/db.js";
import { AUTH_ACCESS_COOKIE, AUTH_DEVICE_COOKIE, AUTH_REFRESH_COOKIE, readCookie } from "../lib/cookies.js";

async function isChatParticipant(chatId: string, userId: string) {
  return Boolean(
    await prisma.chatParticipant.findUnique({
      where: { chatId_userId: { chatId, userId } }
    })
  );
}

export function createSocketServer(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: true,
      credentials: true
    }
  });

  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ??
        readCookie(socket.request.headers.cookie, AUTH_ACCESS_COOKIE);

      if (!token) {
        const refreshToken = readCookie(socket.request.headers.cookie, AUTH_REFRESH_COOKIE);
        const deviceId = readCookie(socket.request.headers.cookie, AUTH_DEVICE_COOKIE);
        if (!refreshToken || !deviceId) return next();

        const payload = verifyRefreshToken(refreshToken);
        const session = await authPrisma.session.findUnique({
          where: { id: payload.sessionId }
        });

        if (!session || session.revokedAt || session.deviceId !== deviceId) return next();

        const matches = await bcrypt.compare(refreshToken, session.refreshTokenHash);
        if (!matches) return next();

        socket.data.userId = payload.sub;
        socket.data.sessionId = payload.sessionId;
        return next();
      }

      const payload = verifyAccessToken(token);
      socket.data.userId = payload.sub;
      socket.data.sessionId = payload.sessionId;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", async (socket) => {
    const userId = socket.data.userId as string | undefined;
    if (userId) {
      markOnline(userId, socket.id);
      socket.join(`user:${userId}`);
      await touchPresence(userId);
      socket.broadcast.emit("presence:update", { userId, online: true });
    }

    socket.on("chat:join", async ({ chatId }) => {
      if (!userId || !(await isChatParticipant(chatId, userId))) return;
      socket.join(`chat:${chatId}`);
      socket.emit("chat:joined", { chatId });
    });

    socket.on("chat:leave", async ({ chatId }) => {
      if (!userId) return;
      socket.leave(`chat:${chatId}`);
      socket.emit("chat:left", { chatId });
    });

    socket.on("typing:start", async ({ chatId }) => {
      if (!userId || !(await isChatParticipant(chatId, userId))) return;
      await prisma.chatParticipant.updateMany({
        where: { chatId, userId },
        data: { isTyping: true }
      });
      socket.to(`chat:${chatId}`).emit("typing:update", { chatId, userId, typing: true });
    });

    socket.on("typing:stop", async ({ chatId }) => {
      if (!userId || !(await isChatParticipant(chatId, userId))) return;
      await prisma.chatParticipant.updateMany({
        where: { chatId, userId },
        data: { isTyping: false }
      });
      socket.to(`chat:${chatId}`).emit("typing:update", { chatId, userId, typing: false });
    });

    socket.on("message:send", async ({ chatId, content, mediaUrl, mediaType, replyToId, ephemeralSeconds }) => {
      if (!userId || !(await isChatParticipant(chatId, userId))) return;
      const message = await prisma.message.create({
        data: {
          chatId,
          senderId: userId,
          content,
          mediaUrl,
          mediaType,
          replyToId,
          ephemeralSeconds
        }
      });

      await prisma.messageReceipt.createMany({
        data: (
          await prisma.chatParticipant.findMany({ where: { chatId } })
        ).map((participant: any) => ({
          messageId: message.id,
          userId: participant.userId,
          deliveredAt: new Date()
        }))
      });

      const payload = {
        id: message.id,
        chatId,
        senderId: userId,
        content,
        mediaUrl,
        mediaType,
        replyToId,
        ephemeralSeconds,
        createdAt: message.createdAt.toISOString()
      };

      io.to(`chat:${chatId}`).emit("message:new", payload);
    });

    socket.on("message:read", async ({ chatId, messageId }) => {
      if (!userId || !(await isChatParticipant(chatId, userId))) return;
      await prisma.messageReceipt.upsert({
        where: {
          messageId_userId: {
            messageId,
            userId
          }
        },
        update: {
          readAt: new Date()
        },
        create: {
          messageId,
          userId,
          readAt: new Date(),
          deliveredAt: new Date()
        }
      });
      socket.to(`chat:${chatId}`).emit("message:read", { chatId, messageId, userId });
    });

    socket.on("map:ping", async ({ lat, lng, ghostMode }) => {
      if (!userId) return;
      await prisma.locationPing.create({
        data: {
          userId,
          lat,
          lng,
          ghostMode: Boolean(ghostMode)
        }
      });
      io.emit("map:update", { userId, lat, lng, ghostMode: Boolean(ghostMode) });
    });

    socket.on("disconnect", async () => {
      if (!userId) return;
      markOffline(userId, socket.id);
      await touchPresence(userId);
      socket.broadcast.emit("presence:update", { userId, online: false });
    });
  });

  return io;
}
