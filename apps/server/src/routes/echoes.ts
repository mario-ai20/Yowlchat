import { Router } from "express";
import { z } from "zod";
import { coreDb as prisma } from "../lib/db.js";
import { authenticateRequest, type AuthenticatedRequest } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticateRequest, async (req: AuthenticatedRequest, res, next) => {
  try {
    const memories = await prisma.memory.findMany({
      where: { userId: req.auth!.userId },
      orderBy: { createdAt: "desc" }
    });

    res.json(
      memories.map((memory: any) => ({
        id: memory.id,
        title: memory.title,
        mediaUrl: memory.mediaUrl,
        folder: memory.folder,
        favorite: memory.favorite,
        isPrivate: memory.isPrivate,
        createdAt: memory.createdAt.toISOString()
      }))
    );
  } catch (error) {
    next(error);
  }
});

router.post("/", authenticateRequest, async (req: AuthenticatedRequest, res, next) => {
  try {
    const body = z.object({
      title: z.string().min(1),
      mediaUrl: z.string().min(1),
      folder: z.string().min(1),
      favorite: z.boolean().optional(),
      isPrivate: z.boolean().optional()
    }).parse(req.body);

    const memory = await prisma.memory.create({
      data: {
        userId: req.auth!.userId,
        title: body.title,
        mediaUrl: body.mediaUrl,
        folder: body.folder,
        favorite: body.favorite ?? false,
        isPrivate: body.isPrivate ?? true
      }
    });

    res.status(201).json({
      id: memory.id,
      title: memory.title,
      mediaUrl: memory.mediaUrl,
      folder: memory.folder,
      favorite: memory.favorite,
      isPrivate: memory.isPrivate,
      createdAt: memory.createdAt.toISOString()
    });
  } catch (error) {
    next(error);
  }
});

export default router;
