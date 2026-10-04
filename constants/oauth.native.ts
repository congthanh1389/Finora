import * as Linking from "expo-linking";

const bundleId = "space.manus.finora.t138610991084852";
const timestamp = bundleId.split(".").pop()?.replace(/^t/, "") ?? "";
const schemeFromBundleId = `manus${timestamp}`;

export const OAUTH_PORTAL_URL = "";
export const OAUTH_SERVER_URL = "";
export const APP_ID = "";
export const OWNER_OPEN_ID = "";
export const OWNER_NAME = "";
export const API_BASE_URL = "";

export function getApiBaseUrl(): string {
  return "";
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
