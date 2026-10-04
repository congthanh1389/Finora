import "dotenv/config";
import { unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import express from "express";
import { createServer } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { createCorsMiddleware } from "./cors";
import { clearLegacySessionCookie } from "./cookies";

const PORT_FILE = join(process.cwd(), "server", ".data", "dev-server-port");

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(createCorsMiddleware());
  app.use(clearLegacySessionCookie());

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  registerStorageProxy(app);
  registerOAuthRoutes(app);

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, timestamp: Date.now() });
  });

  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    }),
  );

  const requestedPort = Number(process.env.PORT ?? 0);
  server.listen(requestedPort, "127.0.0.1", async () => {
    const address = server.address();
    if (!address || typeof address === "string") {
      throw new Error("[api] unable to determine listening port");
    }

    await writeFile(PORT_FILE, String(address.port), "utf8");
    console.log(`[api] server listening on http://127.0.0.1:${address.port}`);
  });

  const cleanup = async () => {
    try {
      await unlink(PORT_FILE);
    } catch {
      // Ignore when the file does not exist.
    }
  };

  process.once("SIGINT", () => {
    void cleanup().finally(() => process.exit(0));
  });
  process.once("SIGTERM", () => {
    void cleanup().finally(() => process.exit(0));
  });
}

startServer().catch((error) => {
  console.error("[api] server failed to start", error);
  process.exit(1);
});
