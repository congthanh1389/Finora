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
console.log("[finora] Regenerating Android native project from Expo config...");

const prebuild = run("npx", ["expo", "prebuild", "--platform", "android", "--clean"]);

const prebuildCode = await new Promise((resolve) => prebuild.once("exit", resolve));
if (prebuildCode !== 0) {
  process.exit(typeof prebuildCode === "number" ? prebuildCode : 1);
}

console.log("[finora] Native project regenerated. Building and installing Android app...");

const expo = run("npx", ["expo", "run:android"]);

const shutdown = () => {
  expo.kill();
};

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);

const code = await new Promise((resolve) => expo.once("exit", resolve));
process.exit(typeof code === "number" ? code : 0);
