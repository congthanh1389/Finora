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
  const configuredBaseUrl = getApiBaseUrl().replace(/\/$/, "");
  // Android Studio's standard emulator reaches the Windows host through 10.0.2.2.
  // A configured API URL takes precedence for physical devices or remote backends.
  const baseUrl = configuredBaseUrl || (Platform.OS === "android" ? "http://10.0.2.2:3000" : "");
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
