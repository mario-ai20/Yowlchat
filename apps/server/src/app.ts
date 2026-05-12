import express from "express";
import cors from "cors";
import helmetPkg from "helmet";
import cookieParser from "cookie-parser";
import { env } from "./lib/env.js";
import healthRoutes from "./routes/health.js";
import authRoutes from "./routes/auth.js";
import chatsRoutes from "./routes/chats.js";
import friendsRoutes from "./routes/friends.js";
import howlsRoutes from "./routes/howls.js";
import mapRoutes from "./routes/map.js";
import echoesRoutes from "./routes/echoes.js";
import mediaRoutes from "./routes/media.js";
import aiRoutes from "./routes/ai.js";
import { authLimiter, aiLimiter } from "./middleware/rate-limit.js";
import { HttpError } from "./lib/errors.js";
import type { NextFunction, Request, Response } from "express";

const helmet = helmetPkg as unknown as () => import("express").RequestHandler;

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.WEB_ORIGIN,
      credentials: true
    })
  );
  app.use(express.json({ limit: "15mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.use("/health", healthRoutes);
  app.use("/auth", authLimiter, authRoutes);
  app.use("/chats", chatsRoutes);
  app.use("/friends", friendsRoutes);
  app.use("/howls", howlsRoutes);
  app.use("/map", mapRoutes);
  app.use("/echoes", echoesRoutes);
  app.use("/media", mediaRoutes);
  app.use("/ai", aiLimiter, aiRoutes);

  app.use((_req, _res, next) => {
    next(new HttpError(404, "Route not found"));
  });

  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (error instanceof HttpError) {
      return res.status(error.status).json({ error: error.message });
    }

    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(500).json({ error: "Unexpected server error" });
  });

  return app;
}
