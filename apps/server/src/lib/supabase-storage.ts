import { randomUUID } from "node:crypto";
import { env } from "./env.js";
import { HttpError } from "./errors.js";

function parseDataUrl(input: string) {
  const match = /^data:([^;]+);base64,(.+)$/i.exec(input);
  if (!match) {
    throw new HttpError(400, "Expected a base64 data URL");
  }

  return {
    mimeType: match[1],
    buffer: Buffer.from(match[2], "base64")
  };
}

function safeName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 96) || "media";
}

export async function uploadSupabaseMedia(params: {
  dataUrl: string;
  fileName?: string;
  bucket?: string;
}) {
  if (!env.SUPABASE_CORE_URL || !env.SUPABASE_CORE_SERVICE_ROLE_KEY) {
    throw new HttpError(503, "Supabase Storage is not configured");
  }

  const { mimeType, buffer } = parseDataUrl(params.dataUrl);
  const bucket = params.bucket ?? env.SUPABASE_STORAGE_BUCKET;
  const extension = mimeType.split("/")[1]?.split("+")[0] ?? "bin";
  const objectPath = `${new Date().toISOString().slice(0, 10)}/${randomUUID()}-${safeName(params.fileName ?? "media")}.${extension}`;
  const encodedPath = objectPath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  const uploadUrl = `${env.SUPABASE_CORE_URL.replace(/\/$/, "")}/storage/v1/object/${bucket}/${encodedPath}`;

  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      apikey: env.SUPABASE_CORE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_CORE_SERVICE_ROLE_KEY}`,
      "Content-Type": mimeType,
      "x-upsert": "true"
    },
    body: buffer
  });

  if (!response.ok) {
    const error = await response.text();
    throw new HttpError(response.status, error || "Supabase upload failed");
  }

  return {
    bucket,
    path: objectPath,
    mimeType,
    url: `${env.SUPABASE_CORE_URL.replace(/\/$/, "")}/storage/v1/object/public/${bucket}/${encodedPath}`
  };
}
