import { Router } from "express";
import { z } from "zod";
import { authenticateRequest, type AuthenticatedRequest } from "../middleware/auth.js";
import { uploadSupabaseMedia } from "../lib/supabase-storage.js";

const router = Router();

router.post("/upload", authenticateRequest, async (req: AuthenticatedRequest, res, next) => {
  try {
    const body = z.object({
      dataUrl: z.string().min(1),
      fileName: z.string().optional(),
      bucket: z.string().optional()
    }).parse(req.body);

    const uploaded = await uploadSupabaseMedia({
      dataUrl: body.dataUrl,
      fileName: body.fileName,
      bucket: body.bucket
    });

    res.status(201).json(uploaded);
  } catch (error) {
    next(error);
  }
});

export default router;
