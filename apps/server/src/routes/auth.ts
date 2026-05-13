import { Router } from "express";
import bcrypt from "bcryptjs";
import { randomInt } from "node:crypto";
import { z } from "zod";
import { accountsDb as prisma, coreDb as corePrisma } from "../lib/db.js";
import { HttpError } from "../lib/errors.js";
import { clearAuthCookies, getOrCreateDeviceId, setAuthCookies } from "../lib/cookies.js";
import { authenticateRequest, type AuthenticatedRequest } from "../middleware/auth.js";
import { getClientIp } from "../lib/http.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../lib/jwt.js";
import { sendPasswordResetEmail, sendVerificationEmail } from "../lib/email.js";
import { serializeUser } from "../lib/serializers.js";
import { APP_LOCALE_CODES, type AppLocale } from "@yowl/types";

const router = Router();

const usernameRegex = /^[a-z0-9](?:[a-z0-9._-]*[a-z0-9])?$/;
const usernameSchema = z.preprocess(
  (value) => (typeof value === "string" ? value.trim().replace(/^@/, "").toLowerCase() : value),
  z
    .string()
    .min(3)
    .max(24)
    .regex(usernameRegex, "Invalid username")
);

const registerSchema = z.object({
  email: z.string().email(),
  username: usernameSchema,
  firstName: z.string().min(2).max(40),
  lastName: z.string().min(2).max(40),
  birthDate: z.coerce.date(),
  phoneNumber: z.string().min(6).max(32),
  gender: z.enum(["man", "vrouw", "geen_van_beide"]),
  locale: z.enum(APP_LOCALE_CODES).default("nl"),
  theme: z.enum(["light", "dark"]).default("dark"),
  password: z.string().min(8).max(128),
});

const loginSchema = z.object({
  identifier: z.string().min(3),
  password: z.string().min(8).max(128)
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1)
});

const verificationSchema = z.object({
  email: z.string().email(),
  code: z.string().min(4).max(12)
});

const resetPasswordSchema = z.object({
  email: z.string().email(),
  code: z.string().min(4).max(12),
  password: z.string().min(8).max(128)
});

const updateMeSchema = z.object({
  displayName: z.string().min(2).max(64).optional(),
  username: usernameSchema.optional(),
  firstName: z.string().min(2).max(40).nullable().optional(),
  lastName: z.string().min(2).max(40).nullable().optional(),
  birthDate: z.coerce.date().nullable().optional(),
  phoneNumber: z.string().min(6).max(32).nullable().optional(),
  gender: z.enum(["man", "vrouw", "geen_van_beide"]).nullable().optional(),
  bio: z.string().max(160).nullable().optional(),
  location: z.string().max(80).nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
  locale: z.enum(APP_LOCALE_CODES).optional(),
  theme: z.enum(["light", "dark"]).optional(),
  pushNotificationsEnabled: z.boolean().optional(),
  autoSaveEchoes: z.boolean().optional(),
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

function createDisplayName(firstName: string, lastName: string) {
  return `${firstName.trim()} ${lastName.trim()}`.replace(/\s+/g, " ").trim();
}

function createVerificationCode() {
  return String(randomInt(100000, 1000000));
}

async function issueVerificationCode(userId: string, email: string, displayName: string) {
  const code = createVerificationCode();
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.user.update({
    where: { id: userId },
    data: {
      verificationCodeHash: codeHash,
      verificationCodeExpiresAt: expiresAt,
      verificationCodeSentAt: new Date(),
      emailVerifiedAt: null
    }
  });

  const delivery = await sendVerificationEmail({
    to: email,
    displayName,
    code,
    expiresMinutes: 10
  });

  return { expiresAt, previewCode: delivery.sent ? null : delivery.previewCode ?? code };
}

async function issuePasswordResetCode(userId: string, email: string, displayName: string) {
  const code = createVerificationCode();
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.user.update({
    where: { id: userId },
    data: {
      resetCodeHash: codeHash,
      resetCodeExpiresAt: expiresAt,
      resetCodeSentAt: new Date()
    }
  });

  const delivery = await sendPasswordResetEmail({
    to: email,
    displayName,
    code,
    expiresMinutes: 10
  });

  return { expiresAt, previewCode: delivery.sent ? null : delivery.previewCode ?? code };
}

function normalizeAppLocale(locale: string | null | undefined): AppLocale {
  return APP_LOCALE_CODES.includes(locale as AppLocale) ? (locale as AppLocale) : "nl";
}

async function clearVerificationCode(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      verificationCodeHash: null,
      verificationCodeExpiresAt: null,
      verificationCodeSentAt: null
    }
  });
}

async function clearPasswordResetCode(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      resetCodeHash: null,
      resetCodeExpiresAt: null,
      resetCodeSentAt: null
    }
  });
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
  theme: string;
  pushNotificationsEnabled: boolean;
  autoSaveEchoes: boolean;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  location: string | null;
  locale: string;
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
      theme: user.theme,
      pushNotificationsEnabled: user.pushNotificationsEnabled,
      autoSaveEchoes: user.autoSaveEchoes,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      location: user.location,
      locale: normalizeAppLocale(user.locale),
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
      theme: user.theme,
      pushNotificationsEnabled: user.pushNotificationsEnabled,
      autoSaveEchoes: user.autoSaveEchoes,
      displayName: user.displayName,
      passwordHash: "",
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      location: user.location,
      locale: normalizeAppLocale(user.locale),
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

async function buildAuthResponse(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const friends = await friendsCount(userId);
  await syncCoreUserSafely(user);
  return {
    user: serializeUser(user, { friendsCount: friends, isOnline: true })
  };
}

router.post("/register", async (req, res, next) => {
  try {
    const body = registerSchema.parse(req.body);
    const email = body.email.trim().toLowerCase();
    const displayName = createDisplayName(body.firstName, body.lastName);
    const existingEmail = await prisma.user.findFirst({
      where: {
        email
      }
    });

    const existingUsername = await prisma.user.findFirst({
      where: {
        username: body.username
      }
    });

    if (existingUsername && existingUsername.id !== existingEmail?.id) {
      throw new HttpError(409, "Username already in use");
    }

    const passwordHash = await bcrypt.hash(body.password, 12);

    if (existingEmail) {
      if (existingEmail.emailVerifiedAt) {
        throw new HttpError(409, "Email or username already in use");
      }

      const updatedUser = await prisma.user.update({
        where: { id: existingEmail.id },
        data: {
          username: body.username,
          firstName: body.firstName,
          lastName: body.lastName,
          birthDate: body.birthDate,
          phoneNumber: body.phoneNumber,
          gender: body.gender,
          locale: body.locale,
          theme: body.theme,
          displayName,
          passwordHash,
          emailVerifiedAt: null,
          verificationCodeHash: null,
          verificationCodeExpiresAt: null,
          verificationCodeSentAt: null,
          resetCodeHash: null,
          resetCodeExpiresAt: null,
          resetCodeSentAt: null,
          yowlScore: 100,
          flames: 1
        }
      });

      try {
        const verification = await issueVerificationCode(updatedUser.id, updatedUser.email, displayName);

        res.status(201).json({
          requiresVerification: true,
          email: updatedUser.email,
          expiresAt: verification.expiresAt.toISOString(),
          previewCode: process.env.NODE_ENV !== "production" ? verification.previewCode : undefined
        });
      } catch (verificationError) {
        throw verificationError;
      }

      return;
    }

    const user = await prisma.user.create({
      data: {
        email,
        username: body.username,
        firstName: body.firstName,
        lastName: body.lastName,
        birthDate: body.birthDate,
        phoneNumber: body.phoneNumber,
        gender: body.gender,
        locale: body.locale,
        theme: body.theme,
        pushNotificationsEnabled: true,
        autoSaveEchoes: true,
        displayName,
        passwordHash,
        yowlScore: 100,
        flames: 1,
        emailVerifiedAt: null,
        verificationCodeHash: null,
        verificationCodeExpiresAt: null,
        verificationCodeSentAt: null
      }
    });

    try {
      const verification = await issueVerificationCode(user.id, user.email, displayName);

      res.status(201).json({
        requiresVerification: true,
        email: user.email,
        expiresAt: verification.expiresAt.toISOString(),
        previewCode: process.env.NODE_ENV !== "production" ? verification.previewCode : undefined
      });
    } catch (verificationError) {
      await prisma.user.delete({ where: { id: user.id } }).catch(() => undefined);
      throw verificationError;
    }
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body);
    const identifier = body.identifier.trim().toLowerCase();
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }]
      }
    });

    if (!user) {
      throw new HttpError(404, "Account niet gevonden");
    }

    if (!user.emailVerifiedAt) {
      throw new HttpError(403, "Account niet bevestigd");
    }

    const valid = await bcrypt.compare(body.password, user.passwordHash);
    if (!valid) {
      throw new HttpError(401, "Invalid credentials");
    }

    const deviceId = getOrCreateDeviceId(req, res);
    const session = await prisma.session.upsert({
      where: {
        userId_deviceId: {
          userId: user.id,
          deviceId
        }
      },
      update: {
        refreshTokenHash: "",
        userAgent: req.get("user-agent"),
        ipAddress: getClientIp(req),
        revokedAt: null
      },
      create: {
        userId: user.id,
        deviceId,
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
    setAuthCookies(res, tokens);

    res.json(await buildAuthResponse(user.id));
  } catch (error) {
    next(error);
  }
});

router.post("/verification/resend", async (req, res, next) => {
  try {
    const body = verificationSchema.pick({ email: true }).parse(req.body);
    const user = await prisma.user.findFirst({ where: { email: body.email.trim().toLowerCase() } });

    if (!user) {
      throw new HttpError(404, "Account niet gevonden");
    }

    if (user.emailVerifiedAt) {
      throw new HttpError(409, "Account is al bevestigd");
    }

    const verification = await issueVerificationCode(user.id, user.email, user.displayName);
    res.json({
      sent: true,
      expiresAt: verification.expiresAt.toISOString(),
      previewCode: process.env.NODE_ENV !== "production" ? verification.previewCode : undefined
    });
  } catch (error) {
    next(error);
  }
});

router.post("/verification/confirm", async (req, res, next) => {
  try {
    const body = verificationSchema.parse(req.body);
    const user = await prisma.user.findFirst({ where: { email: body.email.trim().toLowerCase() } });

    if (!user) {
      throw new HttpError(404, "Account niet gevonden");
    }

    if (user.emailVerifiedAt) {
      const deviceId = getOrCreateDeviceId(req, res);
      const session = await prisma.session.upsert({
        where: {
          userId_deviceId: {
            userId: user.id,
            deviceId
          }
        },
        update: {
          refreshTokenHash: "",
          userAgent: req.get("user-agent"),
          ipAddress: getClientIp(req),
          revokedAt: null
        },
        create: {
          userId: user.id,
          deviceId,
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
      setAuthCookies(res, tokens);
      res.json(await buildAuthResponse(user.id));
      return;
    }

    if (!user.verificationCodeHash || !user.verificationCodeExpiresAt) {
      throw new HttpError(400, "Bevestigingscode ontbreekt");
    }

    if (user.verificationCodeExpiresAt.getTime() < Date.now()) {
      throw new HttpError(410, "Bevestigingscode verlopen");
    }

    const valid = await bcrypt.compare(body.code.trim(), user.verificationCodeHash);
    if (!valid) {
      throw new HttpError(401, "Ongeldige bevestigingscode");
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerifiedAt: new Date()
      }
    });

    const deviceId = getOrCreateDeviceId(req, res);
    const session = await prisma.session.upsert({
      where: {
        userId_deviceId: {
          userId: user.id,
          deviceId
        }
      },
      update: {
        refreshTokenHash: "",
        userAgent: req.get("user-agent"),
        ipAddress: getClientIp(req),
        revokedAt: null
      },
      create: {
        userId: user.id,
        deviceId,
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
    setAuthCookies(res, tokens);
    await clearVerificationCode(user.id);
    res.json(await buildAuthResponse(user.id));
  } catch (error) {
    next(error);
  }
});

router.post("/refresh", async (req, res, next) => {
  try {
    const body = refreshSchema.parse(req.body);
    const deviceId = getOrCreateDeviceId(req, res);
    const payload = verifyRefreshToken(body.refreshToken);
    const session = await prisma.session.findUnique({
      where: { id: payload.sessionId }
    });

    if (!session || session.revokedAt || session.deviceId !== deviceId) {
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
    setAuthCookies(res, tokens);

    const user = await prisma.user.findUniqueOrThrow({ where: { id: payload.sub } });
    await syncCoreUserSafely(user);
    res.json({
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
    clearAuthCookies(res);

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
    const body = z.object({ email: z.string().email() }).parse(req.body);
    const email = body.email.trim().toLowerCase();
    const user = await prisma.user.findFirst({ where: { email } });

    if (!user) {
      throw new HttpError(404, "Account niet gevonden");
    }

    const reset = await issuePasswordResetCode(user.id, user.email, user.displayName);
    res.json({
      sent: true,
      email: user.email,
      expiresAt: reset.expiresAt.toISOString(),
      previewCode: process.env.NODE_ENV !== "production" ? reset.previewCode : undefined
    });
  } catch (error) {
    next(error);
  }
});

router.post("/reset-password", async (req, res, next) => {
  try {
    const body = resetPasswordSchema.parse(req.body);
    const email = body.email.trim().toLowerCase();
    const user = await prisma.user.findFirst({ where: { email } });

    if (!user) {
      throw new HttpError(404, "Account niet gevonden");
    }

    if (!user.resetCodeHash || !user.resetCodeExpiresAt) {
      throw new HttpError(400, "Herstelcode ontbreekt");
    }

    if (user.resetCodeExpiresAt.getTime() < Date.now()) {
      throw new HttpError(410, "Herstelcode verlopen");
    }

    const valid = await bcrypt.compare(body.code.trim(), user.resetCodeHash);
    if (!valid) {
      throw new HttpError(401, "Ongeldige herstelcode");
    }

    const passwordHash = await bcrypt.hash(body.password, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash
      }
    });

    await prisma.session.updateMany({
      where: { userId: user.id },
      data: { revokedAt: new Date() }
    });

    await clearPasswordResetCode(user.id);

    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

router.patch("/me", authenticateRequest, async (req: AuthenticatedRequest, res, next) => {
  try {
    const body = updateMeSchema.parse(req.body);
    if (body.username) {
      const existingUsername = await prisma.user.findFirst({
        where: {
          username: body.username
        }
      });

      if (existingUsername && existingUsername.id !== req.auth!.userId) {
        throw new HttpError(409, "Username already in use");
      }
    }

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
