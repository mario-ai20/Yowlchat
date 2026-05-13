import { config } from "dotenv";
import { z } from "zod";

config();

const schema = z.object({
  DATABASE_PROVIDER: z.enum(["split"]).default("split"),
  SUPABASE_ACCOUNTS_DATABASE_URL: z.string().optional(),
  SUPABASE_CORE_DATABASE_URL: z.string().optional(),
  SUPABASE_DATABASE_URL: z.string().optional(),
  ACCOUNTS_DATABASE_URL: z.string().optional(),
  CORE_DATABASE_URL: z.string().optional(),
  POSTGRES_DATABASE_URL: z.string().optional(),
  DATABASE_URL: z.string().optional(),
  SUPABASE_ACCOUNTS_URL: z.string().optional(),
  SUPABASE_ACCOUNTS_SERVICE_ROLE_KEY: z.string().optional(),
  SUPABASE_CORE_URL: z.string().optional(),
  SUPABASE_CORE_SERVICE_ROLE_KEY: z.string().optional(),
  SUPABASE_STORAGE_BUCKET: z.string().default("yowl-media"),
  SMTP_URL: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_SECURE: z
    .preprocess((value) => {
      if (typeof value === "string") {
        return value.toLowerCase() === "true";
      }
      return value;
    }, z.boolean())
    .optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.string().optional(),
  JWT_ACCESS_SECRET: z.string().default("dev-access-secret-change-me"),
  JWT_REFRESH_SECRET: z.string().default("dev-refresh-secret-change-me"),
  JWT_ISSUER: z.string().default("yowlchat"),
  JWT_AUDIENCE: z.string().default("yowlchat-users"),
  PORT: z.coerce.number().default(4000),
  WEB_ORIGIN: z.string().default("http://127.0.0.1:3000")
});

export const env = schema.parse(process.env);
