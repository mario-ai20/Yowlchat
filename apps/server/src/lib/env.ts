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
  SUPABASE_ACCOUNTS_ANON_KEY: z.string().optional(),
  SUPABASE_CORE_URL: z.string().optional(),
  SUPABASE_CORE_SERVICE_ROLE_KEY: z.string().optional(),
  SUPABASE_CORE_ANON_KEY: z.string().optional(),
  SUPABASE_URL: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  NEXT_PUBLIC_ACCOUNT_SUPABASE_URL: z.string().optional(),
  NEXT_PUBLIC_ACCOUNT_SUPABASE_ANON_KEY: z.string().optional(),
  NEXT_PUBLIC_CHAT_SUPABASE_URL: z.string().optional(),
  NEXT_PUBLIC_CHAT_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_STORAGE_BUCKET: z.string().default("yowl-media"),
  JWT_ACCESS_SECRET: z.string().default("dev-access-secret-change-me"),
  JWT_REFRESH_SECRET: z.string().default("dev-refresh-secret-change-me"),
  JWT_ISSUER: z.string().default("yowlchat"),
  JWT_AUDIENCE: z.string().default("yowlchat-users"),
  PORT: z.coerce.number().default(4000),
  WEB_ORIGIN: z.string().default("http://127.0.0.1:3000")
});

export const env = schema.parse(process.env);
