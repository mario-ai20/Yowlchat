import { Router } from "express";
import { z } from "zod";
import { coreDb as prisma } from "../lib/db.js";
import { authenticateRequest, type AuthenticatedRequest } from "../middleware/auth.js";
import { serializeUser } from "../lib/serializers.js";

const router = Router();

router.get("/friends", authenticateRequest, async (req: AuthenticatedRequest, res, next) => {
  try {
    const pings = await prisma.locationPing.findMany({
      orderBy: { createdAt: "desc" },
      distinct: ["userId"],
      include: { user: true }
    });

    res.json(
      pings.map((ping: any) => ({
        user: serializeUser(ping.user),
        lat: ping.lat,
        lng: ping.lng,
        lastSeen: ping.createdAt.toISOString()
      }))
    );
  } catch (error) {
    next(error);
  }
});

router.post("/ping", authenticateRequest, async (req: AuthenticatedRequest, res, next) => {
  try {
    const body = z.object({
      lat: z.number(),
      lng: z.number(),
      ghostMode: z.boolean().optional()
    }).parse(req.body);

    const ping = (await prisma.locationPing.create({
      data: {
        userId: req.auth!.userId,
        lat: body.lat,
        lng: body.lng,
        ghostMode: body.ghostMode ?? false
      },
      include: { user: true }
    })) as any;

    res.status(201).json({
      user: serializeUser(ping.user),
      lat: ping.lat,
      lng: ping.lng,
      lastSeen: ping.createdAt.toISOString()
    });
  } catch (error) {
    next(error);
  }
});

export default router;
