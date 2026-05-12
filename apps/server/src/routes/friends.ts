import { Router } from "express";
import { z } from "zod";
import { accountsDb as prisma } from "../lib/db.js";
import { authenticateRequest, type AuthenticatedRequest } from "../middleware/auth.js";
import { HttpError } from "../lib/errors.js";
import { serializeUser } from "../lib/serializers.js";
import { paramString } from "../lib/params.js";

const router = Router();

async function friendsOf(userId: string) {
  const friendships = await prisma.friendship.findMany({
    where: {
      status: "accepted",
      OR: [{ requesterId: userId }, { addresseeId: userId }]
    },
    include: {
      requester: true,
      addressee: true
    }
  });

  return friendships.map((friendship: any) => {
    const friend = friendship.requesterId === userId ? friendship.addressee : friendship.requester;
    return serializeUser(friend);
  });
}

router.get("/", authenticateRequest, async (req: AuthenticatedRequest, res, next) => {
  try {
    const relations = await prisma.friendship.findMany({
      where: {
        OR: [{ requesterId: req.auth!.userId }, { addresseeId: req.auth!.userId }]
      }
    });

    const relatedIds = new Set(
      relations.flatMap((relation: any) => [relation.requesterId, relation.addresseeId])
    );
    relatedIds.delete(req.auth!.userId);

    const [friends, requests, outgoingRequests, suggestions] = await Promise.all([
      friendsOf(req.auth!.userId),
      prisma.friendship.findMany({
        where: {
          addresseeId: req.auth!.userId,
          status: "pending"
        },
        include: {
          requester: true
        }
      }),
      prisma.friendship.findMany({
        where: {
          requesterId: req.auth!.userId,
          status: "pending"
        },
        include: {
          addressee: true
        }
      }),
      prisma.user.findMany({
        where: {
          id: { notIn: Array.from(relatedIds).concat(req.auth!.userId) }
        },
        take: 8
      })
    ]);

    res.json({
      friends,
      requests: requests.map((request: any) => ({
        ...request,
        requester: serializeUser(request.requester)
      })),
      outgoingRequests: outgoingRequests.map((request: any) => ({
        ...request,
        addressee: serializeUser(request.addressee)
      })),
      suggestions: suggestions.map((suggestion: any) => serializeUser(suggestion))
    });
  } catch (error) {
    next(error);
  }
});

router.post("/request", authenticateRequest, async (req: AuthenticatedRequest, res, next) => {
  try {
    const body = z.object({ username: z.string().min(3) }).parse(req.body);
    const addressee = await prisma.user.findUnique({ where: { username: body.username } });
    if (!addressee) {
      throw new HttpError(404, "User not found");
    }

    const friendship = await prisma.friendship.upsert({
      where: {
        requesterId_addresseeId: {
          requesterId: req.auth!.userId,
          addresseeId: addressee.id
        }
      },
      update: { status: "pending" },
      create: {
        requesterId: req.auth!.userId,
        addresseeId: addressee.id,
        status: "pending"
      }
    });

    res.status(201).json(friendship);
  } catch (error) {
    next(error);
  }
});

router.post("/:friendshipId/accept", authenticateRequest, async (req: AuthenticatedRequest, res, next) => {
  try {
    const friendshipId = paramString(req.params.friendshipId);
    if (!friendshipId) throw new HttpError(400, "Missing friendship id");
    const friendship = await prisma.friendship.findUniqueOrThrow({
      where: { id: friendshipId }
    });

    if (friendship.addresseeId !== req.auth!.userId) {
      throw new HttpError(403, "Not allowed");
    }

    const updated = await prisma.friendship.update({
      where: { id: friendship.id },
      data: { status: "accepted" }
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.post("/:friendshipId/reject", authenticateRequest, async (req: AuthenticatedRequest, res, next) => {
  try {
    const friendshipId = paramString(req.params.friendshipId);
    if (!friendshipId) throw new HttpError(400, "Missing friendship id");
    const friendship = await prisma.friendship.findUniqueOrThrow({
      where: { id: friendshipId }
    });

    if (friendship.addresseeId !== req.auth!.userId) {
      throw new HttpError(403, "Not allowed");
    }

    const updated = await prisma.friendship.update({
      where: { id: friendship.id },
      data: { status: "rejected" }
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

export default router;
