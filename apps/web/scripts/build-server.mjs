import { existsSync, cpSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const webRoot = resolve(__dirname, "..");
const repoRoot = resolve(webRoot, "..", "..");
const serverDist = resolve(repoRoot, "apps", "server", "dist");
const target = resolve(webRoot, "server-dist");
const npmCli = process.env.npm_execpath;

if (!npmCli) {
  throw new Error("npm_execpath is not set");
}

const install = spawnSync(process.execPath, [npmCli, "install", "--include=dev"], {
  cwd: repoRoot,
  stdio: "inherit",
  env: process.env
});

if (install.error) {
  throw install.error;
}

if ((install.status ?? 1) !== 0) {
  process.exit(install.status ?? 1);
}

const build = spawnSync(process.execPath, [npmCli, "run", "build", "--workspace", "@yowl/server"], {
  cwd: repoRoot,
  stdio: "inherit",
  env: process.env
});

if (build.error) {
  throw build.error;
}

if ((build.status ?? 1) !== 0) {
  process.exit(build.status ?? 1);
}

if (existsSync(target)) {
  rmSync(target, { recursive: true, force: true });
}

cpSync(serverDist, target, { recursive: true });
console.log(`Copied server dist from ${serverDist} to ${target}`);
