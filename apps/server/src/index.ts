import http from "node:http";
import { env } from "./lib/env.js";
import { hasAccountsDatabase, hasCoreDatabase } from "./lib/db.js";
import { createApp } from "./app.js";
import { createSocketServer } from "./services/socket.js";
import { hasSmtpConfig } from "./lib/email.js";

const app = createApp();
const server = http.createServer(app);
const io = createSocketServer(server);

app.set("io", io);

void hasSmtpConfig().then((configured) => {
  if (!configured) {
    console.warn("[mail] SMTP is not configured yet. Account verification and reset emails will not be delivered until the accounts DB SMTP record or SMTP_* env vars are set.");
    return;
  }

  console.log("[mail] SMTP configured and ready for verification/reset emails.");
});

console.log(
  "[db] runtime configuration:",
  JSON.stringify(
    {
      accountsDatabase: hasAccountsDatabase ? "configured" : "missing",
      coreDatabase: hasCoreDatabase ? "configured" : "missing",
      port: env.PORT,
      nodeEnv: process.env.NODE_ENV ?? "unknown"
    },
    null,
    0
  )
);

server.listen(env.PORT, () => {
  console.log(`YowlChat API listening on http://localhost:${env.PORT}`);
});
