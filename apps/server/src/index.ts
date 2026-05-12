import http from "node:http";
import { env } from "./lib/env.js";
import { createApp } from "./app.js";
import { createSocketServer } from "./services/socket.js";

const app = createApp();
const server = http.createServer(app);
const io = createSocketServer(server);

app.set("io", io);

server.listen(env.PORT, () => {
  console.log(`YowlChat API listening on http://localhost:${env.PORT}`);
});
