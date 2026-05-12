import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const cwd = fileURLToPath(new URL("..", import.meta.url));
const fallbackUrl = "postgresql://prisma:prisma@127.0.0.1:5432/yowlchat?schema=public";
const require = createRequire(import.meta.url);
const prismaCli = require.resolve("prisma/build/index.js");
const postgresProtocolRe = /^postgres(?:ql)?:\/\//i;
const placeholderSegmentsRe = /(PASTE_|CHANGE_ME|REPLACE_ME|YOUR_|_HERE\b|TODO|EXAMPLE|PLACEHOLDER)/i;

function normalizeDatabaseUrl(url) {
  const value = url?.trim();
  if (!value) {
    return null;
  }

  if (placeholderSegmentsRe.test(value)) {
    return null;
  }

  if (postgresProtocolRe.test(value)) {
    return value;
  }

  if (value.includes("://")) {
    return value;
  }

  return `postgresql://${value}`;
}

const accountsUrl = normalizeDatabaseUrl(process.env.SUPABASE_ACCOUNTS_DATABASE_URL);
const defaultUrl = normalizeDatabaseUrl(process.env.DATABASE_URL);
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
