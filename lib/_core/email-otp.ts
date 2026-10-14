import { Platform } from "react-native";
import { getApiBaseUrl } from "@/constants/oauth";

export type EmailOtpSendResult = {
  success: true;
  expiresInSeconds: number;
  resendAfterSeconds: number;
};

export type EmailOtpVerifyResult = {
  verified: true;
};

async function otpRequest<T>(endpoint: string, body: Record<string, string>): Promise<T> {
  const baseUrl = getApiBaseUrl().replace(/\/$/, "");
  if (Platform.OS !== "web" && !baseUrl) {
    throw new Error("Chưa cấu hình địa chỉ máy chủ để xác minh email. Hãy kiểm tra EXPO_PUBLIC_API_BASE_URL trong môi trường chạy ứng dụng.");
  }

  const url = baseUrl ? `${baseUrl}${endpoint}` : endpoint;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message = typeof payload === "object" && payload
      ? (payload as { error?: string; message?: string }).error
        || (payload as { message?: string }).message
      : payload;
    throw new Error(typeof message === "string" && message ? message : `Không thể xác minh email (${response.status}).`);
  }

  return payload as T;
}

export function sendEmailOtp(email: string): Promise<EmailOtpSendResult> {
  return otpRequest("/api/auth/email-otp/send", { email });
}

export function verifyEmailOtp(email: string, code: string): Promise<EmailOtpVerifyResult> {
  return otpRequest("/api/auth/email-otp/verify", { email, code });
}
