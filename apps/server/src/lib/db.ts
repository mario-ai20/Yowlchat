import { PrismaClient } from "@prisma/client";
import { env } from "./env.js";
import { isConfiguredDatabaseUrl, normalizeDatabaseUrl } from "./database-url.js";
import { memoryPrisma } from "./memory-db.js";

type DbClient = PrismaClient;

declare global {
  // eslint-disable-next-line no-var
  var __yowlAccountsPrisma: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var __yowlCorePrisma: PrismaClient | undefined;
}

function resolveUrl(kind: "accounts" | "core") {
  if (kind === "accounts") {
    return normalizeDatabaseUrl(
      env.SUPABASE_ACCOUNTS_DATABASE_URL ??
        env.SUPABASE_DATABASE_URL ??
        env.ACCOUNTS_DATABASE_URL ??
        env.DATABASE_URL ??
        env.SUPABASE_CORE_DATABASE_URL ??
        env.CORE_DATABASE_URL ??
        env.POSTGRES_DATABASE_URL
    );
  }

  return normalizeDatabaseUrl(
    env.SUPABASE_CORE_DATABASE_URL ?? env.CORE_DATABASE_URL ?? env.POSTGRES_DATABASE_URL ?? env.DATABASE_URL
  );
}

function createClient(kind: "accounts" | "core") {
  const url = resolveUrl(kind);

  if (!url) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(`[db] Missing persistent ${kind} database URL in production`);
    }
    return memoryPrisma as unknown as PrismaClient;
  }

  const globalKey = kind === "accounts" ? "__yowlAccountsPrisma" : "__yowlCorePrisma";
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

function createLazyClient(kind: "accounts" | "core") {
  return new Proxy({} as PrismaClient, {
    get(_target, prop, receiver) {
      const client = createClient(kind);
      const value = Reflect.get(client as never, prop, receiver);

      if (typeof value === "function") {
        return (value as (...args: never[]) => unknown).bind(client);
      }

      return value;
    },
    has(_target, prop) {
      const client = createClient(kind);
      return prop in client;
    },
    ownKeys() {
      const client = createClient(kind);
      return Reflect.ownKeys(client);
    },
    getOwnPropertyDescriptor(_target, prop) {
      const client = createClient(kind);
      return Object.getOwnPropertyDescriptor(client, prop);
    }
  });
}

export const accountsDb: DbClient = createLazyClient("accounts");

export const coreDb: DbClient = createLazyClient("core");

export const hasAccountsDatabase = isConfiguredDatabaseUrl(
  env.SUPABASE_ACCOUNTS_DATABASE_URL ??
    env.SUPABASE_DATABASE_URL ??
    env.ACCOUNTS_DATABASE_URL ??
    env.DATABASE_URL ??
    env.SUPABASE_CORE_DATABASE_URL ??
    env.CORE_DATABASE_URL ??
    env.POSTGRES_DATABASE_URL
);
export const hasCoreDatabase = isConfiguredDatabaseUrl(
  env.SUPABASE_CORE_DATABASE_URL ?? env.CORE_DATABASE_URL ?? env.POSTGRES_DATABASE_URL ?? env.DATABASE_URL
);

export const prisma = accountsDb;
