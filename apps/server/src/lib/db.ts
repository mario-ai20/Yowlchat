import { PrismaClient } from "@prisma/client";
import { env } from "./env.js";

type DbClient = PrismaClient;

declare global {
  // eslint-disable-next-line no-var
  var __yowlAccountsPrisma: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var __yowlCorePrisma: PrismaClient | undefined;
}

function resolveUrl(kind: "accounts" | "core") {
  if (kind === "accounts") {
    return (
      env.SUPABASE_ACCOUNTS_DATABASE_URL ??
      env.SUPABASE_DATABASE_URL ??
      env.ACCOUNTS_DATABASE_URL ??
      env.DATABASE_URL
    );
  }

  return (
    env.SUPABASE_CORE_DATABASE_URL ??
    env.CORE_DATABASE_URL ??
    env.POSTGRES_DATABASE_URL ??
    env.DATABASE_URL
  );
}

function createClient(kind: "accounts" | "core") {
  const globalKey = kind === "accounts" ? "__yowlAccountsPrisma" : "__yowlCorePrisma";
  const url = resolveUrl(kind);

  if (!url) {
    throw new Error(`${kind} database URL is not configured`);
  }

  const existing = globalThis[globalKey as keyof typeof globalThis] as PrismaClient | undefined;
  if (existing) return existing;

  const client = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    datasources: {
      db: { url }
    }
  });

  if (process.env.NODE_ENV !== "production") {
    (globalThis as any)[globalKey] = client;
  }

  return client;
}

export const accountsDb: DbClient =
  createClient("accounts");

export const coreDb: DbClient =
  createClient("core");

export const hasAccountsDatabase = Boolean(resolveUrl("accounts"));
export const hasCoreDatabase = Boolean(resolveUrl("core"));

export const prisma = accountsDb;
