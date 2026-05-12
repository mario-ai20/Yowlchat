import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { accountsDb as prisma, coreDb as corePrisma } from "../lib/db.js";
import { HttpError } from "../lib/errors.js";
import { authenticateRequest, type AuthenticatedRequest } from "../middleware/auth.js";
import { getClientIp } from "../lib/http.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../lib/jwt.js";
import { serializeUser } from "../lib/serializers.js";
import { hasAccountsDatabase } from "../lib/db.js";

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(2).max(40),
  lastName: z.string().min(2).max(40),
  birthDate: z.coerce.date(),
  phoneNumber: z.string().min(6).max(32),
  gender: z.enum(["man", "vrouw", "geen_van_beide"]),
  password: z.string().min(8).max(128),
});

const loginSchema = z.object({
  identifier: z.string().min(3),
  password: z.string().min(8).max(128)
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1)
});

const updateMeSchema = z.object({
  displayName: z.string().min(2).max(64).optional(),
  firstName: z.string().min(2).max(40).nullable().optional(),
  lastName: z.string().min(2).max(40).nullable().optional(),
  birthDate: z.coerce.date().nullable().optional(),
  phoneNumber: z.string().min(6).max(32).nullable().optional(),
  gender: z.enum(["man", "vrouw", "geen_van_beide"]).nullable().optional(),
  bio: z.string().max(160).nullable().optional(),
  location: z.string().max(80).nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
  publicProfile: z.boolean().optional(),
  isGhostMode: z.boolean().optional()
});

async function friendsCount(userId: string) {
  return prisma.friendship.count({
    where: {
      status: "accepted",
      OR: [{ requesterId: userId }, { addresseeId: userId }]
    }
  });
}

async function issueTokens(userId: string, sessionId: string) {
  return {
    accessToken: signAccessToken({ sub: userId, sessionId }),
    refreshToken: signRefreshToken({ sub: userId, sessionId })
  };
}

function createUsername(firstName: string, lastName: string, email: string) {
  const seed = `${firstName}.${lastName}`.toLowerCase().replace(/[^a-z0-9.]+/g, "").replace(/\.{2,}/g, ".");
  const fallback = email.split("@")[0].toLowerCase().replace(/[^a-z0-9.]+/g, "");
  return (seed || fallback || "yowl").slice(0, 24);
}

function createDisplayName(firstName: string, lastName: string) {
  return `${firstName.trim()} ${lastName.trim()}`.replace(/\s+/g, " ").trim();
}

async function syncCoreUser(user: {
  id: string;
  email: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  birthDate: Date | null;
  phoneNumber: string | null;
  gender: string | null;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  location: string | null;
  publicProfile: boolean;
  isGhostMode: boolean;
  flames: number;
  yowlScore: number;
  lastSeenAt: Date | null;
}) {
  await corePrisma.user.upsert({
    where: { id: user.id },
    update: {
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      birthDate: user.birthDate,
      phoneNumber: user.phoneNumber,
      gender: user.gender,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      location: user.location,
      publicProfile: user.publicProfile,
      isGhostMode: user.isGhostMode,
      flames: user.flames,
      yowlScore: user.yowlScore,
      lastSeenAt: user.lastSeenAt
    },
    create: {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      birthDate: user.birthDate,
      phoneNumber: user.phoneNumber,
      gender: user.gender,
      displayName: user.displayName,
      passwordHash: "",
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      location: user.location,
      publicProfile: user.publicProfile,
      isGhostMode: user.isGhostMode,
      flames: user.flames,
      yowlScore: user.yowlScore,
      lastSeenAt: user.lastSeenAt
    }
  });
}

async function syncCoreUserSafely(user: Parameters<typeof syncCoreUser>[0]) {
  try {
    await syncCoreUser(user);
  } catch (error) {
    console.warn("Core sync skipped:", error instanceof Error ? error.message : error);
  }
}

async function buildAuthResponse(userId: string, sessionId: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const [friends, tokens] = await Promise.all([friendsCount(userId), issueTokens(userId, sessionId)]);
  await syncCoreUserSafely(user);
  return {
    ...tokens,
    user: serializeUser(user, { friendsCount: friends, isOnline: true })
  };
}

router.post("/register", async (req, res, next) => {
  try {
    if (!hasAccountsDatabase) {
      throw new HttpError(503, "Accounts database is not configured");
    }

    const body = registerSchema.parse(req.body);
    const displayName = createDisplayName(body.firstName, body.lastName);
    const existingEmail = await prisma.user.findFirst({
      where: {
        email: body.email
      }
    });

    if (existingEmail) {
      throw new HttpError(409, "Email or username already in use");
    }

    const baseUsername = createUsername(body.firstName, body.lastName, body.email);
    let finalUsername = baseUsername;
    let suffix = 0;

    while (await prisma.user.findFirst({ where: { username: finalUsername } })) {
      suffix += 1;
      finalUsername = `${baseUsername.slice(0, Math.max(4, 24 - String(suffix).length - 1))}-${suffix}`;
    }

    const passwordHash = await bcrypt.hash(body.password, 12);
    const user = await prisma.user.create({
      data: {
        email: body.email,
        username: finalUsername,
        firstName: body.firstName,
        lastName: body.lastName,
        birthDate: body.birthDate,
        phoneNumber: body.phoneNumber,
        gender: body.gender,
        displayName,
        passwordHash,
        yowlScore: 100,
        flames: 1
      }
    });

    const session = await prisma.session.create({
      data: {
        userId: user.id,
        refreshTokenHash: "",
        userAgent: req.get("user-agent"),
        ipAddress: getClientIp(req)
      }
    });

    const tokens = await issueTokens(user.id, session.id);
    await prisma.session.update({
      where: { id: session.id },
      data: { refreshTokenHash: await bcrypt.hash(tokens.refreshToken, 12) }
    });

    res.json(await buildAuthResponse(user.id, session.id));
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    if (!hasAccountsDatabase) {
      throw new HttpError(503, "Accounts database is not configured");
    }

    const body = loginSchema.parse(req.body);
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: body.identifier }, { username: body.identifier }]
      }
    });

    if (!user) {
      throw new HttpError(401, "Invalid credentials");
    }

    const valid = await bcrypt.compare(body.password, user.passwordHash);
    if (!valid) {
      throw new HttpError(401, "Invalid credentials");
    }

    const session = await prisma.session.create({
      data: {
        userId: user.id,
        refreshTokenHash: "",
        userAgent: req.get("user-agent"),
        ipAddress: getClientIp(req)
      }
    });

    const tokens = await issueTokens(user.id, session.id);
    await prisma.session.update({
      where: { id: session.id },
      data: { refreshTokenHash: await bcrypt.hash(tokens.refreshToken, 12) }
    });

    res.json(await buildAuthResponse(user.id, session.id));
  } catch (error) {
    next(error);
  }
});

router.post("/refresh", async (req, res, next) => {
  try {
    const body = refreshSchema.parse(req.body);
    const payload = verifyRefreshToken(body.refreshToken);
    const session = await prisma.session.findUnique({
      where: { id: payload.sessionId }
    });

    if (!session || session.revokedAt) {
      throw new HttpError(401, "Session revoked");
    }

    const matches = await bcrypt.compare(body.refreshToken, session.refreshTokenHash);
    if (!matches) {
      throw new HttpError(401, "Invalid refresh token");
    }

    const tokens = await issueTokens(payload.sub, payload.sessionId);
    await prisma.session.update({
      where: { id: payload.sessionId },
      data: { refreshTokenHash: await bcrypt.hash(tokens.refreshToken, 12) }
    });

    const user = await prisma.user.findUniqueOrThrow({ where: { id: payload.sub } });
    await syncCoreUserSafely(user);
    res.json({
      ...tokens,
      user: serializeUser(user, { friendsCount: await friendsCount(user.id), isOnline: true })
    });
  } catch (error) {
    next(error);
  }
});

router.post("/logout", authenticateRequest, async (req: AuthenticatedRequest, res, next) => {
  try {
    await prisma.session.updateMany({
      where: {
        id: req.auth?.sessionId,
        userId: req.auth?.userId
      },
      data: {
        revokedAt: new Date()
      }
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.get("/me", authenticateRequest, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: req.auth!.userId }
    });

    await syncCoreUserSafely(user);
    res.json(serializeUser(user, { friendsCount: await friendsCount(user.id), isOnline: true }));
  } catch (error) {
    next(error);
  }
});

router.post("/forgot-password", async (req, res, next) => {
  try {
    z.object({ email: z.string().email() }).parse(req.body);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

router.patch("/me", authenticateRequest, async (req: AuthenticatedRequest, res, next) => {
  try {
    const body = updateMeSchema.parse(req.body);
    const user = await prisma.user.update({
      where: { id: req.auth!.userId },
      data: body
    });

    await syncCoreUserSafely(user);
    res.json(serializeUser(user, { friendsCount: await friendsCount(user.id), isOnline: true }));
  } catch (error) {
    next(error);
  }
});

export default router;
