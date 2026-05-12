import type { Response } from "express";

export const AUTH_ACCESS_COOKIE = "yowl_access";
export const AUTH_REFRESH_COOKIE = "yowl_refresh";

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/"
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
