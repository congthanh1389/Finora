import { apiCall } from "./api";

export type EmailOtpSendResult = {
  success: true;
  expiresInSeconds: number;
  resendAfterSeconds: number;
};

export type EmailOtpVerifyResult = {
  verified: true;
};

export async function sendEmailOtp(email: string): Promise<EmailOtpSendResult> {
  return apiCall<EmailOtpSendResult>("/api/auth/email-otp/send", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function verifyEmailOtp(
  email: string,
  code: string,
): Promise<EmailOtpVerifyResult> {
  return apiCall<EmailOtpVerifyResult>("/api/auth/email-otp/verify", {
    method: "POST",
    body: JSON.stringify({ email, code }),
  });
}
