import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../lib/errors.js";
import { verifyAccessToken } from "../lib/jwt.js";

export interface AuthenticatedRequest extends Request {
  auth?: {
    userId: string;
    sessionId: string;
  };
}

export function authenticateRequest(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const header = req.header("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token) {
    return next(new HttpError(401, "Missing bearer token"));
  }

  try {
    const payload = verifyAccessToken(token);
    req.auth = {
      userId: payload.sub,
      sessionId: payload.sessionId
    };
    return next();
  } catch {
    return next(new HttpError(401, "Invalid or expired access token"));
  }
}
