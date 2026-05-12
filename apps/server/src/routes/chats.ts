import { Router } from "express";
import { z } from "zod";
import { coreDb as prisma } from "../lib/db.js";
import { authenticateRequest, type AuthenticatedRequest } from "../middleware/auth.js";
import { HttpError } from "../lib/errors.js";
import { getSocketServer } from "../lib/http.js";
import type { Prisma } from "@prisma/client";
import { paramString } from "../lib/params.js";

const router = Router();

const createMessageSchema = z.object({
  content: z.string().min(1).max(2000),
  mediaUrl: z.string().url().optional().or(z.literal("")),
  mediaType: z.enum(["image", "video", "voice"]).optional(),
  replyToId: z.string().optional(),
  ephemeralSeconds: z.number().int().positive().max(86400).optional()
});

async function ensureParticipant(chatId: string, userId: string) {
  const participant = await prisma.chatParticipant.findUnique({
    where: { chatId_userId: { chatId, userId } }
  });

  if (!participant) {
    throw new HttpError(403, "Not a member of this chat");
  }
}

function formatMessage(message: any) {
  return {
    id: message.id,
    chatId: message.chatId,
    senderId: message.senderId,
    content: message.content,
    mediaUrl: message.mediaUrl,
    mediaType: message.mediaType,
    ephemeralSeconds: message.ephemeralSeconds,
    createdAt: message.createdAt.toISOString(),
    updatedAt: message.updatedAt.toISOString(),
    replyToId: message.replyToId,
    reactions: message.reactions.map((reaction: { emoji: string; userId: string }) => ({
      emoji: reaction.emoji,
      userId: reaction.userId
    })),
    receipts: Object.fromEntries(
      message.receipts.map((receipt: { userId: string; deliveredAt: Date | null; readAt: Date | null }) => [
        receipt.userId,
        {
          deliveredAt: receipt.deliveredAt?.toISOString() ?? null,
          readAt: receipt.readAt?.toISOString() ?? null
        }
      ])
    )
  };
}

router.get("/", authenticateRequest, async (req: AuthenticatedRequest, res, next) => {
  try {
    const chats = await prisma.chat.findMany({
      where: {
        participants: {
          some: {
            userId: req.auth!.userId
          }
        }
      },
      orderBy: [{ pinnedAt: "desc" }, { updatedAt: "desc" }],
      include: {
        participants: {
          include: { user: true }
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: { receipts: true, reactions: true }
        }
      }
    });

    res.json(
      chats.map((chat: any) => ({
        id: chat.id,
        title: chat.title,
        participantIds: chat.participants.map((participant: any) => participant.userId),
        pinned: Boolean(chat.pinnedAt),
        unreadCount: 0,
        lastMessage: chat.messages[0] ? formatMessage(chat.messages[0]) : null,
        isStreakActive: false,
        flameCount: 0,
        typingUsers: []
      }))
    );
  } catch (error) {
    next(error);
  }
});

router.get("/:chatId/messages", authenticateRequest, async (req: AuthenticatedRequest, res, next) => {
  try {
    const chatId = paramString(req.params.chatId);
    if (!chatId) throw new HttpError(400, "Missing chat id");
    await ensureParticipant(chatId, req.auth!.userId);
    const messages = await prisma.message.findMany({
      where: { chatId, deletedAt: null },
      orderBy: { createdAt: "asc" },
      include: {
        receipts: true,
        reactions: true
      }
    });
    res.json(messages.map((message: any) => formatMessage(message)));
  } catch (error) {
    next(error);
  }
});

router.post("/:chatId/messages", authenticateRequest, async (req: AuthenticatedRequest, res, next) => {
  try {
    const chatId = paramString(req.params.chatId);
    if (!chatId) throw new HttpError(400, "Missing chat id");
    await ensureParticipant(chatId, req.auth!.userId);
    const body = createMessageSchema.parse(req.body);
    const message = await prisma.message.create({
      data: {
        chatId,
        senderId: req.auth!.userId,
        content: body.content,
        mediaUrl: body.mediaUrl || null,
        mediaType: body.mediaType,
        replyToId: body.replyToId,
        ephemeralSeconds: body.ephemeralSeconds
      },
      include: {
        receipts: true,
        reactions: true
      }
    });

    const recipients = await prisma.chatParticipant.findMany({
      where: { chatId }
    });

    await prisma.messageReceipt.createMany({
      data: recipients.map((participant: any) => ({
        messageId: message.id,
        userId: participant.userId,
        deliveredAt: new Date(),
        readAt: participant.userId === req.auth!.userId ? new Date() : null
      }))
    });

    const io = getSocketServer(req);
    const payload = formatMessage(
      await prisma.message.findUniqueOrThrow({
        where: { id: message.id },
        include: { receipts: true, reactions: true }
      })
    );

    io.to(`chat:${chatId}`).emit("message:new", payload);
    res.status(201).json(payload);
  } catch (error) {
    next(error);
  }
});

router.post("/:chatId/read", authenticateRequest, async (req: AuthenticatedRequest, res, next) => {
  try {
    const chatId = paramString(req.params.chatId);
    if (!chatId) throw new HttpError(400, "Missing chat id");
    await ensureParticipant(chatId, req.auth!.userId);
    const body = z.object({ messageId: z.string() }).parse(req.body);
    await prisma.messageReceipt.upsert({
      where: {
        messageId_userId: {
          messageId: body.messageId,
          userId: req.auth!.userId
        }
      },
      update: { readAt: new Date() },
      create: {
        messageId: body.messageId,
        userId: req.auth!.userId,
        deliveredAt: new Date(),
        readAt: new Date()
      }
    });

    const io = getSocketServer(req);
    io.to(`chat:${chatId}`).emit("message:read", {
      chatId,
      messageId: body.messageId,
      userId: req.auth!.userId
    });

    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

export default router;
