import { createRequire } from "node:module";
import type WebSocket from "ws";
import { User } from "./Managers/User.js";

const require = createRequire(import.meta.url);
const wsPkg = require("ws");

const WSServer = wsPkg.Server;

const wss = new WSServer({ port: 8080 });

wss.on("connect", (socket: WebSocket) => {
  console.log('WebSocket Client Connected');
  socket.on("error", console.error);

  let user = new User(socket);

  socket.on("close", () => {
    user?.destroy();
  });
});