import { once } from "node:events";
import { request } from "node:http";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { randomUUID } from "node:crypto";
import express from "express";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { registerEmailOtpRoutes } from "../server/modules/email-otp";

type JsonResponse = { status: number; body: Record<string, unknown> };

let server: Server;
let port: number;
let sentCode = "";

function postJson(path: string, body: unknown): Promise<JsonResponse> {
  return new Promise((resolve, reject) => {
    const req = request(
      {
        hostname: "127.0.0.1",
        port,
        path,
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
      (res) => {
        let raw = "";
        res.setEncoding("utf8");
        res.on("data", (chunk: string) => {
          raw += chunk;
        });
        res.on("end", () => {
          resolve({
            status: res.statusCode ?? 0,
            body: raw ? JSON.parse(raw) as Record<string, unknown> : {},
          });
        });
      },
    );
    req.on("error", reject);
    req.write(JSON.stringify(body));
    req.end();
  });
}

describe("email OTP routes", () => {
  beforeEach(async () => {
    sentCode = "";
    vi.stubEnv("RESEND_API_KEY", "test-resend-key");
    vi.stubEnv("RESEND_FROM_EMAIL", "Finora Test <otp@example.com>");
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
        const payload = JSON.parse(String(init?.body)) as { text: string };
        sentCode = payload.text.match(/là: (\d{6})/)?.[1] ?? "";
        return new Response(JSON.stringify({ id: "test-email-id" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }),
    );

    const app = express();
    app.use(express.json());
    registerEmailOtpRoutes(app);
    server = app.listen(0, "127.0.0.1");
    await once(server, "listening");
    port = (server.address() as AddressInfo).port;
  });

  afterEach(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("verifies an OTP once and rejects reuse", async () => {
    const email = `otp-${randomUUID()}@example.com`;
    const sent = await postJson("/api/auth/email-otp/send", { email });
    expect(sent.status).toBe(200);
    expect(sent.body.success).toBe(true);
    expect(sentCode).toMatch(/^\d{6}$/);

    const verified = await postJson("/api/auth/email-otp/verify", { email, code: sentCode });
    expect(verified.status).toBe(200);
    expect(verified.body.verified).toBe(true);

    const reused = await postJson("/api/auth/email-otp/verify", { email, code: sentCode });
    expect(reused.status).toBe(400);
  });

  it("blocks verification after five incorrect attempts", async () => {
    const email = `attempts-${randomUUID()}@example.com`;
    await postJson("/api/auth/email-otp/send", { email });
    const wrongCode = sentCode === "000000" ? "000001" : "000000";

    for (let attempt = 1; attempt <= 4; attempt += 1) {
      const result = await postJson("/api/auth/email-otp/verify", { email, code: wrongCode });
      expect(result.status).toBe(400);
    }
    const locked = await postJson("/api/auth/email-otp/verify", { email, code: wrongCode });
    expect(locked.status).toBe(429);
  });

  it("enforces resend cooldown", async () => {
    const email = `cooldown-${randomUUID()}@example.com`;
    expect((await postJson("/api/auth/email-otp/send", { email })).status).toBe(200);
    expect((await postJson("/api/auth/email-otp/send", { email })).status).toBe(429);
  });

  it("rejects malformed email without calling Resend", async () => {
    const result = await postJson("/api/auth/email-otp/send", { email: "not-an-email" });
    expect(result.status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });
});
