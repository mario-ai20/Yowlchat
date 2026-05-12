import type { Request } from "express";
import type { Server } from "socket.io";

export function getSocketServer(req: Request) {
  return req.app.get("io") as Server;
}

export function getClientIp(req: Request) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0]?.trim();
  }
  return req.ip;
}
