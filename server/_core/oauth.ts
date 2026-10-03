import { ONE_YEAR_MS } from "../../shared/const.js";
import type { Express, Request, Response } from "express";
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { getUserByEmail, getUserByOpenId, createLocalUser, upsertUser } from "../db";
import {
  getSessionCookieName,
  getSessionCookieOptions,
} from "./cookies";
import { sdk } from "./sdk";

const scrypt = promisify(scryptCallback);
const PASSWORD_MIN_LENGTH = 8;

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt:${salt}:${derivedKey.toString("hex")}`;
}

async function verifyPassword(password: string, storedHash: string) {
  const [algorithm, salt, hashHex] = storedHash.split(":");
  if (algorithm !== "scrypt" || !salt || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = (await scrypt(password, salt, expected.length)) as Buffer;
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function normalizeEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function buildUserResponse(
  user:
    | Awaited<ReturnType<typeof getUserByOpenId>>
    | {
        openId: string;
        name?: string | null;
        email?: string | null;
        loginMethod?: string | null;
        lastSignedIn?: Date | null;
      },
) {
  return {
    id: (user as any)?.id ?? null,
    openId: user?.openId ?? null,
    name: user?.name ?? null,
    email: user?.email ?? null,
    loginMethod: user?.loginMethod ?? null,
    lastSignedIn: (user?.lastSignedIn ?? new Date()).toISOString(),
  };
}

function setSession(res: Response, req: Request, sessionToken: string) {
  const cookieOptions = getSessionCookieOptions(req);
  res.cookie(getSessionCookieName(req), sessionToken, {
    ...cookieOptions,
    maxAge: ONE_YEAR_MS,
  });
}

async function syncUser(userInfo: {
  openId?: string | null;
  name?: string | null;
  email?: string | null;
  loginMethod?: string | null;
  platform?: string | null;
}) {
  if (!userInfo.openId) throw new Error("openId missing from user info");

  const lastSignedIn = new Date();
  await upsertUser({
    openId: userInfo.openId,
    name: userInfo.name || null,
    email: userInfo.email ?? null,
    loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
    lastSignedIn,
  });
  const saved = await getUserByOpenId(userInfo.openId);
  return saved ?? {
    openId: userInfo.openId,
    name: userInfo.name,
    email: userInfo.email,
    loginMethod: userInfo.loginMethod ?? null,
    lastSignedIn,
  };
}

export function registerOAuthRoutes(app: Express) {
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const email = normalizeEmail(req.body?.email);
      const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
      const password = typeof req.body?.password === "string" ? req.body.password : "";

      if (!email || !email.includes("@")) {
        res.status(400).json({ error: "Email không hợp lệ" });
        return;
      }
      if (name.length < 2) {
        res.status(400).json({ error: "Tên phải có ít nhất 2 ký tự" });
        return;
      }
      if (password.length < PASSWORD_MIN_LENGTH) {
        res.status(400).json({ error: `Mật khẩu phải có ít nhất ${PASSWORD_MIN_LENGTH} ký tự` });
        return;
      }
      if (await getUserByEmail(email)) {
        res.status(409).json({ error: "Email đã được đăng ký" });
        return;
      }

      const user = await createLocalUser({
        email,
        name,
        passwordHash: await hashPassword(password),
      });
      const sessionToken = await sdk.createSessionToken(user.openId, {
        name: user.name || name,
        expiresInMs: ONE_YEAR_MS,
      });
      setSession(res, req, sessionToken);

      res.status(201).json({
        app_session_id: sessionToken,
        user: buildUserResponse(user),
      });
    } catch (error) {
      console.error("[Auth] Registration failed", error);
      res.status(500).json({ error: "Không thể tạo tài khoản" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const email = normalizeEmail(req.body?.email);
      const password = typeof req.body?.password === "string" ? req.body.password : "";
      const user = email ? await getUserByEmail(email) : undefined;

      if (!user?.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
        res.status(401).json({ error: "Email hoặc mật khẩu không đúng" });
        return;
      }

      await upsertUser({ openId: user.openId, lastSignedIn: new Date() });
      const updatedUser = await getUserByOpenId(user.openId);
      const sessionToken = await sdk.createSessionToken(user.openId, {
        name: user.name || "",
        expiresInMs: ONE_YEAR_MS,
      });
      setSession(res, req, sessionToken);

      res.json({
        app_session_id: sessionToken,
        user: buildUserResponse(updatedUser ?? user),
      });
    } catch (error) {
      console.error("[Auth] Login failed", error);
      res.status(500).json({ error: "Không thể đăng nhập" });
    }
  });

  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      await syncUser(userInfo);
      const sessionToken = await sdk.createSessionToken(userInfo.openId!, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });
      setSession(res, req, sessionToken);
      const frontendUrl =
        process.env.EXPO_WEB_PREVIEW_URL ||
        process.env.EXPO_PACKAGER_PROXY_URL ||
        "http://localhost:8081";
      res.redirect(302, frontendUrl);
    } catch {
      console.error("[OAuth] Callback failed");
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });

  app.get("/api/oauth/mobile", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      const user = await syncUser(userInfo);
      const sessionToken = await sdk.createSessionToken(userInfo.openId!, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });
      setSession(res, req, sessionToken);
      res.json({ app_session_id: sessionToken, user: buildUserResponse(user) });
    } catch {
      console.error("[OAuth] Mobile exchange failed");
      res.status(500).json({ error: "OAuth mobile exchange failed" });
    }
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    const cookieOptions = getSessionCookieOptions(req);
    res.clearCookie(getSessionCookieName(req), { ...cookieOptions, maxAge: -1 });
    res.json({ success: true });
  });

  app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      const user = await sdk.authenticateRequest(req);
      res.json({ user: buildUserResponse(user) });
    } catch {
      res.status(401).json({ error: "Not authenticated", user: null });
    }
  });

  app.post("/api/auth/session", async (req: Request, res: Response) => {
    try {
      const user = await sdk.authenticateRequest(req);
      const authHeader = req.headers.authorization || req.headers.Authorization;
      if (typeof authHeader !== "string" || !authHeader.startsWith("Bearer ")) {
        res.status(400).json({ error: "Bearer token required" });
        return;
      }
      const token = authHeader.slice("Bearer ".length).trim();
      setSession(res, req, token);
      res.json({ success: true, user: buildUserResponse(user) });
    } catch {
      res.status(401).json({ error: "Invalid token" });
    }
  });
}
