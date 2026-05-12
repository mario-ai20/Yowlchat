import type { NextApiRequest, NextApiResponse } from "next";
let expressAppPromise: Promise<any> | null = null;

export const config = {
  api: {
    bodyParser: false
  }
};

async function getExpressApp() {
  if (!expressAppPromise) {
    // The server build is emitted as JS during the web prebuild step.
    // Next's type checker does not know this file at authoring time.
    // @ts-ignore - resolved at runtime after the server prebuild.
    expressAppPromise = import("../../../server-dist/src/app.js").then((module) => module.createApp());
  }

  return expressAppPromise;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const expressApp = await getExpressApp();
    const originalUrl = req.url ?? "/";
    req.url = originalUrl.replace(/^\/api/, "") || "/";
    return expressApp(req as never, res as never);
  } catch (error) {
    console.error("API handler crashed", error);
    if (!res.headersSent) {
      return res.status(503).json({ error: "API temporarily unavailable" });
    }
    return undefined;
  }
}
