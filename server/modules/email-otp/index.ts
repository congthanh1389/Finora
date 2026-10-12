import { createHash, randomInt, timingSafeEqual } from "node:crypto";
import type { Express, Request, Response } from "express";

type Challenge = {
  codeHash: string;
  expiresAt: number;
  attempts: number;
  createdAt: number;
};

const OTP_TTL_MS = 5 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_SENDS_PER_HOUR = 5;
const MAX_VERIFY_ATTEMPTS = 5;

// In-memory state is intentionally scoped to the development backend process.
// A production deployment must move challenges and rate-limit counters to shared persistent storage.
const challenges = new Map<string, Challenge>();
const sendTimes = new Map<string, number[]>();
const lastSentAt = new Map<string, number>();
const ipSendTimes = new Map<string, number[]>();

function normalizeEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}

function hashCode(email: string, code: string): string {
  return createHash("sha256").update(`${email}: ${code}`).digest("hex");
}

function recentTimes(map: Map<string, number[]>, key: string, now: number): number[] {
  const recent = (map.get(key) ?? []).filter((time) => now - time < 60 * 60 * 1000);
  map.set(key, recent);
  return recent;
}

function clientIp(req: Request): string {
  return req.ip || req.socket.remoteAddress || "unknown";
}

function sendError(res: Response, status: number, error: string) {
  return res.status(status).json({ error });
}

export function registerEmailOtpRoutes(app: Express): void {
  app.post("/api/auth/email-otp/send", async (req: Request, res: Response) => {
    const email = normalizeEmail(req.body?.email);
    if (!email) return sendError(res, 400, "Vui lòng nhập địa chỉ email hợp lệ.");

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM_EMAIL;
    if (!apiKey || !from) {
      return sendError(res, 503, "Dịch vụ gửi email chưa được cấu hình trên máy chủ.");
    }

    const now = Date.now();
    const lastSent = lastSentAt.get(email) ?? 0;
    if (now - lastSent < RESEND_COOLDOWN_MS) {
      return sendError(res, 429, "Vui lòng đợi 60 giây trước khi gửi mã mới.");
    }

    const emailTimes = recentTimes(sendTimes, email, now);
    if (emailTimes.length >= MAX_SENDS_PER_HOUR) {
      return sendError(res, 429, "Email đã vượt quá số lần gửi mã cho phép. Vui lòng thử lại sau.");
    }

    const ip = clientIp(req);
    const ipTimes = recentTimes(ipSendTimes, ip, now);
    if (ipTimes.length >= 20) {
      return sendError(res, 429, "Quá nhiều yêu cầu gửi mã. Vui lòng thử lại sau.");
    }

    // Count attempts before contacting Resend so provider failures cannot bypass throttling.
    lastSentAt.set(email, now);
    emailTimes.push(now);
    sendTimes.set(email, emailTimes);
    ipTimes.push(now);
    ipSendTimes.set(ip, ipTimes);

    const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject: "Mã xác minh email Finora",
        text: `Mã xác minh email Finora của bạn là: ${code}\n\nMã có hiệu lực trong 5 phút. Không chia sẻ mã này với bất kỳ ai.`,
      }),
    }).catch(() => null);

    if (!response?.ok) {
      return sendError(res, 502, "Không gửi được email xác minh. Vui lòng thử lại sau.");
    }

    challenges.set(email, {
      codeHash: hashCode(email, code),
      expiresAt: now + OTP_TTL_MS,
      attempts: 0,
      createdAt: now,
    });
    return res.status(200).json({
      success: true,
      message: "Đã tiếp nhận yêu cầu gửi mã xác minh. Vui lòng kiểm tra email.",
      expiresInSeconds: OTP_TTL_MS / 1000,
      resendAfterSeconds: RESEND_COOLDOWN_MS / 1000,
    });
  });

  app.post("/api/auth/email-otp/verify", (req: Request, res: Response) => {
    const email = normalizeEmail(req.body?.email);
    const code = typeof req.body?.code === "string" ? req.body.code.trim() : "";
    if (!email || !/^\d{6}$/.test(code)) {
      return sendError(res, 400, "Email hoặc mã OTP không hợp lệ.");
    }

    const challenge = challenges.get(email);
    if (!challenge) return sendError(res, 400, "Vui lòng yêu cầu mã OTP mới.");
    if (Date.now() >= challenge.expiresAt) {
      challenges.delete(email);
      return sendError(res, 400, "Mã OTP đã hết hạn. Vui lòng gửi mã mới.");
    }
    if (challenge.attempts >= MAX_VERIFY_ATTEMPTS) {
      challenges.delete(email);
      return sendError(res, 429, "Bạn đã nhập sai quá số lần cho phép. Vui lòng gửi mã mới.");
    }

    challenge.attempts += 1;
    const expected = Buffer.from(challenge.codeHash, "hex");
    const actual = Buffer.from(hashCode(email, code), "hex");
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
      if (challenge.attempts >= MAX_VERIFY_ATTEMPTS) challenges.delete(email);
      return sendError(res, 400, "Mã OTP không đúng.");
    }

    challenges.delete(email);
    return res.status(200).json({ verified: true });
  });
}
