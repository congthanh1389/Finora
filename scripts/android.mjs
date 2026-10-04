import { spawn } from "node:child_process";

const root = process.cwd();

const run = (command, args, env = {}) =>
  process.platform === "win32"
    ? spawn("cmd.exe", ["/d", "/s", "/c", command, ...args], {
        cwd: root,
        stdio: "inherit",
        env: { ...process.env, ...env },
      })
    : spawn(command, args, {
        cwd: root,
        stdio: "inherit",
        env: { ...process.env, ...env },
      });

console.log("[finora] Android build: local-first mode (no API server).");
console.log("[finora] Using the existing native Android project.");

const expo = run("npx", ["expo", "run:android"]);

const shutdown = () => {
  expo.kill();
};

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);

const code = await new Promise((resolve) => expo.once("exit", resolve));
process.exit(typeof code === "number" ? code : 0);
