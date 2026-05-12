import { Router } from "express";
import { z } from "zod";
import { accountsDb as prisma } from "../lib/db.js";
import { authenticateRequest, type AuthenticatedRequest } from "../middleware/auth.js";

const router = Router();

function buildSuggestion(prompt: string) {
  if (/caption|caption/i.test(prompt)) {
    return "Try: 'Soft neon, hard launch.'";
  }
  if (/reply|dm|message/i.test(prompt)) {
    return "Reply idea: 'Say less, I'm already in.'";
  }
  return "Yowl AI placeholder: sharp, warm and launch-ready.";
}

router.get("/conversations", authenticateRequest, async (req: AuthenticatedRequest, res, next) => {
  try {
    const conversations = await prisma.aiConversation.findMany({
      where: { userId: req.auth!.userId },
      orderBy: { updatedAt: "desc" }
    });

    res.json(conversations.map((conversation: any) => ({
      id: conversation.id,
      title: conversation.title,
      createdAt: conversation.createdAt.toISOString(),
      updatedAt: conversation.updatedAt.toISOString()
    })));
  } catch (error) {
    next(error);
  }
});

router.post("/chat", authenticateRequest, async (req: AuthenticatedRequest, res, next) => {
  try {
    const body = z.object({
      prompt: z.string().min(1)
    }).parse(req.body);

    const conversation =
      (await prisma.aiConversation.findFirst({
        where: { userId: req.auth!.userId },
        orderBy: { updatedAt: "desc" }
      })) ??
      (await prisma.aiConversation.create({
        data: {
          userId: req.auth!.userId,
          title: "Yowl AI"
        }
      }));

    await prisma.aiMessage.createMany({
      data: [
        {
          conversationId: conversation.id,
          role: "user",
          content: body.prompt
        },
        {
          conversationId: conversation.id,
          role: "assistant",
          content: buildSuggestion(body.prompt)
        }
      ]
    });

    const response = buildSuggestion(body.prompt);
    res.json({
      conversationId: conversation.id,
      reply: response,
      suggestions: [
        "Generate another caption",
        "Suggest a photo filter",
        "Write a more playful reply"
      ]
    });
  } catch (error) {
    next(error);
  }
});

export default router;
