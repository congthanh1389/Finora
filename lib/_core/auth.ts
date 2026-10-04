import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { SESSION_TOKEN_KEY, USER_INFO_KEY } from "@/constants/oauth";

export type User = {
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  loginMethod: string | null;
  lastSignedIn: Date;
};

export async function getSessionToken(): Promise<string | null> {
  try {
    // Web platform uses cookie-based auth, no manual token management needed
    if (Platform.OS === "web") {
      console.log("[Auth] Web platform uses cookie-based auth, skipping token retrieval");
      return null;
    }

    // Use SecureStore for native
    console.log("[Auth] Getting session token...");
    const token = await SecureStore.getItemAsync(SESSION_TOKEN_KEY);
    return token;
  } catch {
    console.error("[Auth] Failed to get session token");
    return null;
  }
}

export async function setSessionToken(token: string): Promise<void> {
  try {
    // Web platform uses cookie-based auth, no manual token management needed
    if (Platform.OS === "web") {
      console.log("[Auth] Web platform uses cookie-based auth, skipping token storage");
      return;
    }

    // Use SecureStore for native
    console.log("[Auth] Setting session token...");
    await SecureStore.setItemAsync(SESSION_TOKEN_KEY, token);
    console.log("[Auth] Session token stored in SecureStore successfully");
  } catch (error) {
    console.error("[Auth] Failed to set session token");
    throw error;
  }
}

export async function removeSessionToken(): Promise<void> {
  try {
    // Web platform uses cookie-based auth, logout is handled by server clearing cookie
    if (Platform.OS === "web") {
      console.log("[Auth] Web platform uses cookie-based auth, skipping token removal");
      return;
    }

    // Use SecureStore for native
    console.log("[Auth] Removing session token...");
    await SecureStore.deleteItemAsync(SESSION_TOKEN_KEY);
    console.log("[Auth] Session token removed from SecureStore successfully");
  } catch {
    console.error("[Auth] Failed to remove session token");
  }
}

export async function getUserInfo(): Promise<User | null> {
  try {
    console.log("[Auth] Getting user info...");

    let info: string | null = null;
    if (Platform.OS === "web") {
      // Use localStorage for web
      info = window.localStorage.getItem(USER_INFO_KEY);
    } else {
      // Use SecureStore for native
      info = await SecureStore.getItemAsync(USER_INFO_KEY);
    }

    if (!info) {
      console.log("[Auth] No user info found");
      return null;
    }
    const user = JSON.parse(info);
    console.log("[Auth] User info retrieved");
    return user;
  } catch {
    console.error("[Auth] Failed to get user info");
    return null;
  }
}

export async function setUserInfo(user: User): Promise<void> {
  try {
    console.log("[Auth] Setting user info...");

    if (Platform.OS === "web") {
      // Use localStorage for web
      window.localStorage.setItem(USER_INFO_KEY, JSON.stringify(user));
      console.log("[Auth] User info stored in localStorage successfully");
      return;
    }

    // Use SecureStore for native
    await SecureStore.setItemAsync(USER_INFO_KEY, JSON.stringify(user));
    console.log("[Auth] User info stored in SecureStore successfully");
  } catch {
    console.error("[Auth] Failed to set user info");
  }
}

export async function clearUserInfo(): Promise<void> {
  try {
    if (Platform.OS === "web") {
      // Use localStorage for web
      window.localStorage.removeItem(USER_INFO_KEY);
      return;
    }

    // Use SecureStore for native
    await SecureStore.deleteItemAsync(USER_INFO_KEY);
  } catch {
    console.error("[Auth] Failed to clear user info");
  }
}


const LOCAL_ACCOUNT_KEY = "finora.local.account.v2";
const LOCAL_SESSION_KEY = "finora.local.session.v2";

type LocalAccount = User & { password: string };

export async function localGetAccount(): Promise<LocalAccount | null> {
  try {
    const raw = await SecureStore.getItemAsync(LOCAL_ACCOUNT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LocalAccount;
  } catch {
    return null;
  }
}

export async function localRegister(input: { email: string; name: string; password: string; userId?: number }): Promise<User> {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();
  const password = input.password;
  if (!email || !email.includes("@")) throw new Error("Email không hợp lệ.");
  if (!name) throw new Error("Vui lòng nhập họ và tên.");
  if (password.length < 6) throw new Error("Mật khẩu phải có ít nhất 6 ký tự.");

  const existing = await localGetAccount();
  if (existing && existing.email?.toLowerCase() !== email) {
    throw new Error("Thiết bị đã có tài khoản Finora.");
  }

  const { listDeviceUserIds } = await import("@/src/core/storage/device-store");
  const existingIds = await listDeviceUserIds();
  const id = existing?.id ?? input.userId ?? existingIds[0] ?? 1;
  const now = new Date();
  const user: User = {
    id,
    openId: existing?.openId ?? `local_${id}`,
    name,
    email,
    loginMethod: "local-password",
    lastSignedIn: now,
  };
  await SecureStore.setItemAsync(LOCAL_ACCOUNT_KEY, JSON.stringify({ ...user, password }));
  await setSessionToken(`local-session-${id}`);
  await setUserInfo(user);
  return user;
}

export async function localLogin(email: string, password: string): Promise<User> {
  const account = await localGetAccount();
  if (!account || account.email?.toLowerCase() !== email.trim().toLowerCase() || account.password !== password) {
    throw new Error("Email hoặc mật khẩu không đúng.");
  }
  const { password: _storedPassword, ...storedUser } = account;
  const user: User = { ...storedUser, lastSignedIn: new Date() };
  await SecureStore.setItemAsync(LOCAL_ACCOUNT_KEY, JSON.stringify({ ...account, lastSignedIn: user.lastSignedIn }));
  await setSessionToken(`local-session-${user.id}`);
  await setUserInfo(user);
  return user;
}

export async function localLogout(): Promise<void> {
  await removeSessionToken();
  await clearUserInfo();
}
