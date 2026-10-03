import { spawn } from "node:child_process";

const root = process.cwd();

const run = (command, args, env = {}, options = {}) =>
  process.platform === "win32"
    ? spawn("cmd.exe", ["/d", "/s", "/c", command, ...args], {
        cwd: root,
        stdio: options.stdio ?? "inherit",
        env: { ...process.env, ...env },
      })
    : spawn(command, args, {
        cwd: root,
        stdio: options.stdio ?? "inherit",
        env: { ...process.env, ...env },
      });

const server = run("pnpm", ["dev:server"], {
  NODE_ENV: "development",
  PORT: "0",
}, { stdio: ["ignore", "pipe", "inherit"] });

let port;
server.stdout.on("data", (chunk) => {
  const text = chunk.toString();
  process.stdout.write(text);
  const match = text.match(/server listening on http:\/\/127\.0\.0\.1:(\d+)/);
  if (match) port = Number(match[1]);
});

for (let i = 0; i < 300 && !port; i++) {
  await new Promise((resolve) => setTimeout(resolve, 100));
}

if (!port) {
  server.kill();
  throw new Error("Finora API server did not publish its port.");
}

console.log(`[finora] API port: ${port}`);

const expo = run("npx", ["expo", "run:android"], {
  EXPO_PUBLIC_API_BASE_URL: `http://10.0.2.2:${port}`,
});

const shutdown = () => {
  server.kill();
  expo.kill();
};

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);

const code = await new Promise((resolve) => expo.once("exit", resolve));
server.kill();
process.exit(typeof code === "number" ? code : 0);
