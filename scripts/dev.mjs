import { existsSync, unlinkSync } from "node:fs";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

const root = process.cwd();
const portFile = `${root}/server/.data/dev-server-port`;

if (existsSync(portFile)) unlinkSync(portFile);

const command = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const server = spawn(command, ["dev:server"], {
  cwd: root,
  stdio: "inherit",
  env: { ...process.env, NODE_ENV: "development", PORT: "0" },
});

let port;
for (let i = 0; i < 100; i++) {
  if (existsSync(portFile)) {
    port = Number((await import("node:fs/promises")).readFile(portFile, "utf8"));
    break;
  }
  await delay(100);
}

if (!port) {
  server.kill();
  throw new Error("Finora API server did not publish its port.");
}

console.log(`[finora] API port: ${port}`);

const metro = spawn(command, ["dev:metro"], {
  cwd: root,
  stdio: "inherit",
  env: {
    ...process.env,
    EXPO_PUBLIC_API_BASE_URL: `http://127.0.0.1:${port}`,
  },
});

const shutdown = () => {
  server.kill();
  metro.kill();
};

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
server.once("exit", (code) => {
  if (code && code !== 0) metro.kill();
});
await new Promise(() => {});
