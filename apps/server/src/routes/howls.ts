import { Router } from "express";
import { z } from "zod";
import { coreDb as prisma } from "../lib/db.js";
import { authenticateRequest, type AuthenticatedRequest } from "../middleware/auth.js";
import { HttpError } from "../lib/errors.js";
import { serializeUser } from "../lib/serializers.js";
import { paramString } from "../lib/params.js";

const router = Router();

router.get("/", authenticateRequest, async (req: AuthenticatedRequest, res, next) => {
  try {
    const stories = await prisma.story.findMany({
      where: {
        expiresAt: {
          gt: new Date()
        }
      },
      orderBy: { createdAt: "desc" },
      include: { author: true }
    });

    const enriched = await Promise.all(stories.map(async (story: any) => {
      const [views, reactions] = await Promise.all([
        prisma.storyView.findMany({ where: { storyId: story.id } }),
        prisma.reaction.findMany({ where: { storyId: story.id } })
      ]);

      return {
        id: story.id,
        authorId: story.authorId,
        mediaUrl: story.mediaUrl,
        mediaType: story.mediaType as "image" | "video",
        caption: story.caption,
        expiresAt: story.expiresAt.toISOString(),
        viewers: views.map((view: any) => view.userId),
        reactions: reactions.map((reaction: any) => ({
          emoji: reaction.emoji,
          userId: reaction.userId
        })),
        author: serializeUser(story.author)
      };
    }));

    res.json(enriched);
  } catch (error) {
    next(error);
  }
});

router.post("/", authenticateRequest, async (req: AuthenticatedRequest, res, next) => {
  try {
    const body = z
      .object({
        mediaUrl: z.string().min(1),
        mediaType: z.enum(["image", "video"]),
        caption: z.string().optional(),
        expiresAt: z.string().datetime().optional()
      })
      .parse(req.body);

    const story = await prisma.story.create({
      data: {
        authorId: req.auth!.userId,
        mediaUrl: body.mediaUrl,
        mediaType: body.mediaType,
        caption: body.caption,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    });

    const author = await prisma.user.findUniqueOrThrow({ where: { id: req.auth!.userId } });
    res.status(201).json({
      id: story.id,
      authorId: story.authorId,
      mediaUrl: story.mediaUrl,
      mediaType: story.mediaType as "image" | "video",
      caption: story.caption,
      expiresAt: story.expiresAt.toISOString(),
      viewers: [],
      reactions: [],
      author: serializeUser(author)
    });
  } catch (error) {
    next(error);
  }
});

router.post("/:storyId/view", authenticateRequest, async (req: AuthenticatedRequest, res, next) => {
  try {
    const storyId = paramString(req.params.storyId);
    if (!storyId) throw new HttpError(400, "Missing story id");
    await prisma.storyView.upsert({
      where: {
        storyId_userId: {
          storyId,
          userId: req.auth!.userId
        }
      },
      update: { viewedAt: new Date() },
      create: {
        storyId,
        userId: req.auth!.userId
      }
    });

    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

router.post("/:storyId/react", authenticateRequest, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { emoji } = z.object({ emoji: z.string().min(1).max(8) }).parse(req.body);
    const storyId = paramString(req.params.storyId);
    if (!storyId) throw new HttpError(400, "Missing story id");
    const story = await prisma.story.findUniqueOrThrow({ where: { id: storyId } });
    if (story.expiresAt <= new Date()) {
      throw new HttpError(404, "Story expired");
    }

    const reaction = await prisma.reaction.create({
      data: {
        emoji,
        userId: req.auth!.userId,
        storyId: story.id
      }
    });

    res.status(201).json(reaction);
  } catch (error) {
    next(error);
  }
});

export default router;
