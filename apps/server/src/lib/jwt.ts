import jwt from "jsonwebtoken";
import { env } from "./env.js";

export interface AccessTokenPayload {
  sub: string;
  sessionId: string;
  type: "access";
}

export interface RefreshTokenPayload {
  sub: string;
  sessionId: string;
  type: "refresh";
}

export function signAccessToken(payload: Omit<AccessTokenPayload, "type">) {
  return jwt.sign({ ...payload, type: "access" }, env.JWT_ACCESS_SECRET, {
    expiresIn: "15m",
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE
  });
}

export function signRefreshToken(payload: Omit<RefreshTokenPayload, "type">) {
  return jwt.sign({ ...payload, type: "refresh" }, env.JWT_REFRESH_SECRET, {
    expiresIn: "30d",
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE
  });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET, {
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE
  }) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET, {
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE
  }) as RefreshTokenPayload;
}
