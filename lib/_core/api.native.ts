import { getApiBaseUrl } from "@/constants/oauth";

export type ApiUser = {
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  loginMethod: string | null;
  lastSignedIn: string;
};

function nativeApiUnavailable(): never {
  throw new Error("Finora Android uses local device authentication and does not use the server API.");
}

export async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = getApiBaseUrl().replace(/\/$/, "");
  if (!baseUrl) {
    throw new Error("EXPO_PUBLIC_API_BASE_URL is not configured for Android API requests.");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const response = await fetch(`${baseUrl}${cleanEndpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });

  const contentType = response.headers.get("content-type") || "";
  const body = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof body === "object" && body
        ? body.error || body.message
        : body;
    throw new Error(message || `API call failed: ${response.statusText}`);
  }

  return body as T;
}

export async function localLogin(_email: string, _password: string) {
  return nativeApiUnavailable() as Promise<{ app_session_id: string; user: ApiUser }>;
}

export async function localRegister(_email: string, _name: string, _password: string) {
  return nativeApiUnavailable() as Promise<{ app_session_id: string; user: ApiUser }>;
}

export async function exchangeOAuthCode(_code: string, _state: string) {
  return nativeApiUnavailable() as Promise<{ sessionToken: string; user: ApiUser }>;
}

export async function logout(): Promise<void> {
  return nativeApiUnavailable();
}

export async function getMe(): Promise<ApiUser | null> {
  return nativeApiUnavailable();
}

export async function establishSession(_token: string): Promise<boolean> {
  return nativeApiUnavailable();
}