import { getApiBaseUrl } from "@/constants/oauth";

export type EmailOtpSendResult = {
  success: true;
  expiresInSeconds: number;
  resendAfterSeconds: number;
};

export type EmailOtpVerifyResult = {
  verified: true;
};

const OTP_REQUEST_TIMEOUT_MS = 15_000;

function getOtpApiUrl(endpoint: "/send" | "/verify"): string {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    throw new Error(
      "Chưa cấu hình máy chủ xác minh email. Vui lòng kiểm tra EXPO_PUBLIC_API_BASE_URL trong bản Android.",
    );
  }

  if (!/^https?:\/\//i.test(baseUrl)) {
    throw new Error("Địa chỉ máy chủ xác minh email không hợp lệ.");
  }
  if (!__DEV__ && !/^https:\/\//i.test(baseUrl)) {
    throw new Error("Bản Android production chỉ được dùng máy chủ HTTPS.");
  }

  return `${baseUrl}/api/auth/email-otp${endpoint}`;
}

async function otpRequest<T>(
  endpoint: "/send" | "/verify",
  body: Record<string, string>,
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OTP_REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(getOtpApiUrl(endpoint), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const contentType = response.headers.get("content-type") || "";
    const payload = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      const message =
        typeof payload === "object" && payload
          ? payload.error || payload.message
          : payload;
      throw new Error(message || `Không thể kết nối máy chủ xác minh (${response.status}).`);
    }

    return payload as T;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Kết nối máy chủ xác minh email quá thời gian. Vui lòng thử lại.");
    }
    if (error instanceof TypeError) {
      throw new Error("Không thể kết nối máy chủ xác minh email. Vui lòng kiểm tra Internet.");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export function sendEmailOtp(email: string): Promise<EmailOtpSendResult> {
  return otpRequest<EmailOtpSendResult>("/send", { email });
}

export function verifyEmailOtp(
  email: string,
  code: string,
): Promise<EmailOtpVerifyResult> {
  return otpRequest<EmailOtpVerifyResult>("/verify", { email, code });
}
