import { existsSync, unlinkSync } from "node:fs";
import { readFile } from "node:fs/promises";
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
    port = Number(await readFile(portFile, "utf8"));
    break;
  }
  await delay(100);
}

if (!port) {
  server.kill();
  throw new Error("Finora API server did not publish its port.");
}

console.log(`[finora] API port: ${port}`);

const expo = spawn(process.platform === "win32" ? "npx.cmd" : "npx", ["expo", "run:android"], {
  cwd: root,
  stdio: "inherit",
  env: {
    ...process.env,
    EXPO_PUBLIC_API_BASE_URL: `http://10.0.2.2:${port}`,
  },
});

const shutdown = () => server.kill();
process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);

const code = await new Promise((resolve) => expo.once("exit", resolve));
server.kill();
process.exit(typeof code === "number" ? code : 0);
