import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const cwd = fileURLToPath(new URL("..", import.meta.url));
const prismaCli = fileURLToPath(new URL("../../../node_modules/prisma/build/index.js", import.meta.url));
const fallbackUrl = "postgresql://prisma:prisma@127.0.0.1:5432/yowlchat?schema=public";

const accountsUrl = process.env.SUPABASE_ACCOUNTS_DATABASE_URL?.trim();
const defaultUrl = process.env.DATABASE_URL?.trim();
const resolvedUrl = accountsUrl || defaultUrl || fallbackUrl;

process.env.SUPABASE_ACCOUNTS_DATABASE_URL = resolvedUrl;
process.env.DATABASE_URL = resolvedUrl;

const result = spawnSync(process.execPath, [prismaCli, "generate", "--schema", "prisma/schema.prisma"], {
  cwd,
  env: process.env,
  stdio: "inherit"
});

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
