import type { Response } from "express";
import { randomUUID } from "node:crypto";

export const AUTH_ACCESS_COOKIE = "yowl_access";
export const AUTH_REFRESH_COOKIE = "yowl_refresh";
export const AUTH_DEVICE_COOKIE = "yowl_device";

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/"
  };
}

function deviceCookieOptions() {
  return {
    ...cookieOptions(),
    maxAge: 365 * 24 * 60 * 60 * 1000
  };
}

export function setAuthCookies(
  res: Response,
  payload: {
    accessToken: string;
    refreshToken: string;
  }
) {
  res.cookie(AUTH_ACCESS_COOKIE, payload.accessToken, {
    ...cookieOptions(),
    maxAge: 15 * 60 * 1000
  });
  res.cookie(AUTH_REFRESH_COOKIE, payload.refreshToken, {
    ...cookieOptions(),
    maxAge: 30 * 24 * 60 * 60 * 1000
  });
}

export function clearAuthCookies(res: Response) {
  res.clearCookie(AUTH_ACCESS_COOKIE, cookieOptions());
  res.clearCookie(AUTH_REFRESH_COOKIE, cookieOptions());
}

export function readCookie(header: string | undefined, name: string) {
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const [rawKey, ...rest] = part.trim().split("=");
    if (rawKey === name) return decodeURIComponent(rest.join("="));
  }
  return undefined;
}

export function getOrCreateDeviceId(req: { header(name: string): string | undefined }, res: Response) {
  const existing = readCookie(req.header("cookie"), AUTH_DEVICE_COOKIE);
  if (existing) return existing;

  const deviceId = randomUUID();
  res.cookie(AUTH_DEVICE_COOKIE, deviceId, deviceCookieOptions());
  return deviceId;
}
