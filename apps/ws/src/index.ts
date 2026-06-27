import { createRequire } from "node:module";
import type WebSocket from "ws";
import { User } from "./Managers/User.js";

const require = createRequire(import.meta.url);
const wsPkg = require("ws");

const WSServer = wsPkg.Server;

const port = Number(process.env.PORT) || 8080;
const wss = new WSServer({ port });

wss.on("listening", () => {
  console.log(`WebSocket server running on port ${port}`);
});

wss.on("connection", (ws: WebSocket) => {
  console.log('WebSocket Client Connected');
  let user = new User(ws);
  ws.on('error', console.error);

  ws.on('close', () => {
    user?.destroy();
  });

  
});