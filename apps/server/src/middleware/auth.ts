import type { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { HttpError } from "../lib/errors.js";
import { accountsDb as prisma } from "../lib/db.js";
import { AUTH_ACCESS_COOKIE, AUTH_REFRESH_COOKIE, getOrCreateDeviceId, readCookie, setAuthCookies } from "../lib/cookies.js";
import { signAccessToken, verifyAccessToken, verifyRefreshToken } from "../lib/jwt.js";

export interface AuthenticatedRequest extends Request {
  auth?: {
    userId: string;
    sessionId: string;
  };
}

export async function authenticateRequest(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const deviceId = getOrCreateDeviceId(req, res);
  const header = req.header("authorization");
  const token =
    header?.startsWith("Bearer ") ? header.slice(7) : readCookie(req.header("cookie"), AUTH_ACCESS_COOKIE);

  if (!token) {
    const refreshToken = readCookie(req.header("cookie"), AUTH_REFRESH_COOKIE);
    if (!refreshToken) {
      return next(new HttpError(401, "Missing bearer token"));
    }

    try {
      const payload = verifyRefreshToken(refreshToken);
      const session = await prisma.session.findUnique({
        where: { id: payload.sessionId }
      });

      if (!session || session.revokedAt || session.deviceId !== deviceId) {
        return next(new HttpError(401, "Session revoked"));
      }

      const matches = await bcrypt.compare(refreshToken, session.refreshTokenHash);
      if (!matches) {
        return next(new HttpError(401, "Invalid refresh token"));
      }

      const accessToken = signAccessToken({ sub: payload.sub, sessionId: payload.sessionId });
      setAuthCookies(res, { accessToken, refreshToken });
      req.auth = {
        userId: payload.sub,
        sessionId: payload.sessionId
      };
      return next();
    } catch {
      return next(new HttpError(401, "Invalid or expired access token"));
    }
  }

  try {
    const payload = verifyAccessToken(token);
    req.auth = {
      userId: payload.sub,
      sessionId: payload.sessionId
    };
    return next();
  } catch {
    const refreshToken = readCookie(req.header("cookie"), AUTH_REFRESH_COOKIE);
    if (!refreshToken) {
      return next(new HttpError(401, "Invalid or expired access token"));
    }

    try {
      const payload = verifyRefreshToken(refreshToken);
      const session = await prisma.session.findUnique({
        where: { id: payload.sessionId }
      });

      if (!session || session.revokedAt || session.deviceId !== deviceId) {
        return next(new HttpError(401, "Session revoked"));
      }

      const matches = await bcrypt.compare(refreshToken, session.refreshTokenHash);
      if (!matches) {
        return next(new HttpError(401, "Invalid refresh token"));
      }

      const accessToken = signAccessToken({ sub: payload.sub, sessionId: payload.sessionId });
      setAuthCookies(res, { accessToken, refreshToken });
      req.auth = {
        userId: payload.sub,
        sessionId: payload.sessionId
      };
      return next();
    } catch {
      return next(new HttpError(401, "Invalid or expired access token"));
    }
  }
}
