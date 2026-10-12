import * as Linking from "expo-linking";
import { Platform } from "react-native";

const bundleId = "space.manus.finora.t138610991084852";
const timestamp = bundleId.split(".").pop()?.replace(/^t/, "") ?? "";
const schemeFromBundleId = `manus${timestamp}`;

const configuredApiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL ?? "";
export const OAUTH_PORTAL_URL = "";
export const OAUTH_SERVER_URL = "";
export const APP_ID = "";
export const OWNER_OPEN_ID = "";
export const OWNER_NAME = "";
export const API_BASE_URL = configuredApiBaseUrl;

export function getApiBaseUrl(): string {
  if (Platform.OS !== "android") return API_BASE_URL.replace(/\/$/, "");

  // Android Emulator reaches the host computer through 10.0.2.2, not 127.0.0.1.
  return API_BASE_URL
    .replace("://127.0.0.1", "://10.0.2.2")
    .replace("://localhost", "://10.0.2.2")
    .replace(/\/$/, "");
}

export const SESSION_TOKEN_KEY = "app_session_token";
export const USER_INFO_KEY = "manus-runtime-user-info";

export const getRedirectUri = () =>
  Linking.createURL("/oauth/callback", {
    scheme: schemeFromBundleId,
  });

export function getLoginUrl(): never {
  throw new Error("Finora Android uses local authentication and does not use OAuth.");
}

export async function startOAuthLogin(): Promise<never> {
  throw new Error("Finora Android uses local authentication and does not use OAuth.");
}
