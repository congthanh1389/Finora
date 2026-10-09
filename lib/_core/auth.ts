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
const LOCAL_ACCOUNTS_KEY = "finora.local.accounts.v3";

export type LocalAccount = User & { password: string };

async function readAccounts(): Promise<LocalAccount[]> {
  try {
    const raw = await SecureStore.getItemAsync(LOCAL_ACCOUNTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as LocalAccount[];
    }
    const legacyRaw = await SecureStore.getItemAsync(LOCAL_ACCOUNT_KEY);
    if (!legacyRaw) return [];
    const legacy = JSON.parse(legacyRaw) as LocalAccount;
    const accounts = [legacy];
    await SecureStore.setItemAsync(LOCAL_ACCOUNTS_KEY, JSON.stringify(accounts));
    return accounts;
  } catch {
    return [];
  }
}

async function writeAccounts(accounts: LocalAccount[]): Promise<void> {
  await SecureStore.setItemAsync(LOCAL_ACCOUNTS_KEY, JSON.stringify(accounts));
  await SecureStore.deleteItemAsync(LOCAL_ACCOUNT_KEY);
}

export async function localGetAccounts(): Promise<LocalAccount[]> {
  return readAccounts();
}

export async function localGetAccount(): Promise<LocalAccount | null> {
  const accounts = await readAccounts();
  const sessionToken = await getSessionToken();
  if (sessionToken?.startsWith("local-session-")) {
    const id = Number(sessionToken.replace("local-session-", ""));
    const active = accounts.find((account) => account.id === id);
    if (active) return active;
  }
  return accounts[0] ?? null;
}

export async function localRegister(input: {
  email: string;
  name: string;
  password: string;
  userId?: number;
}): Promise<User> {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();
  const password = input.password;
  if (!email || !email.includes("@")) throw new Error("Email không hợp lệ.");
  if (!name) throw new Error("Vui lòng nhập họ và tên.");
  if (password.length < 6) throw new Error("Mật khẩu phải có ít nhất 6 ký tự.");

  const accounts = await readAccounts();
  if (accounts.some((account) => account.email?.toLowerCase() === email)) {
    throw new Error("Email này đã được đăng ký trên thiết bị.");
  }

  const { listDeviceUserIds } = await import("@/src/core/storage/device-store");
  const existingIds = await listDeviceUserIds();
  const usedIds = new Set([...accounts.map((account) => account.id), ...existingIds]);
  let id = input.userId ?? 1;
  while (usedIds.has(id)) id += 1;

  const now = new Date();
  const user: User = {
    id,
    openId: `local_${id}`,
    name,
    email,
    loginMethod: "local-password",
    lastSignedIn: now,
  };
  await writeAccounts([...accounts, { ...user, password }]);
  await setSessionToken(`local-session-${id}`);
  await setUserInfo(user);
  return user;
}

export async function localLogin(email: string, password: string): Promise<User> {
  const accounts = await readAccounts();
  const account = accounts.find((item) => item.email?.toLowerCase() === email.trim().toLowerCase());
  if (!account || account.password !== password) {
    throw new Error("Email hoặc mật khẩu không đúng.");
  }
  const user: User = { ...account, lastSignedIn: new Date() };
  const updatedAccounts = accounts.map((item) =>
    item.id === account.id ? { ...item, lastSignedIn: user.lastSignedIn } : item,
  );
  await writeAccounts(updatedAccounts);
  await setSessionToken(`local-session-${user.id}`);
  await setUserInfo(user);
  return user;
}

export async function localLogout(): Promise<void> {
  await removeSessionToken();
  await clearUserInfo();
}

export async function localDeleteAccount(userId: number): Promise<void> {
  const accounts = await readAccounts();
  const remaining = accounts.filter((account) => account.id !== userId);
  if (remaining.length === accounts.length) throw new Error("Không tìm thấy tài khoản.");

  const { deleteDeviceUserData } = await import("@/src/core/storage/device-store");
  await deleteDeviceUserData(userId);
  await writeAccounts(remaining);

  if ((await getSessionToken()) === `local-session-${userId}`) {
    await removeSessionToken();
    await clearUserInfo();
  }
}


export async function localChangePassword(
  userId: number,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  if (newPassword.length < 6) throw new Error("Mật khẩu mới phải có ít nhất 6 ký tự.");
  const accounts = await readAccounts();
  const account = accounts.find((item) => item.id === userId);
  if (!account) throw new Error("Không tìm thấy tài khoản.");
  if (account.loginMethod !== "local-password") {
    throw new Error("Tài khoản này không sử dụng mật khẩu đăng nhập trên thiết bị.");
  }
  if (account.password !== currentPassword) {
    throw new Error("Mật khẩu hiện tại không đúng.");
  }
  if (currentPassword === newPassword) {
    throw new Error("Mật khẩu mới phải khác mật khẩu hiện tại.");
  }
  await writeAccounts(accounts.map((item) =>
    item.id === userId ? { ...item, password: newPassword } : item,
  ));
}

export async function localVerifyPassword(userId: number, password: string): Promise<boolean> {
  const accounts = await readAccounts();
  const account = accounts.find((item) => item.id === userId);
  if (!account) throw new Error("Không tìm thấy tài khoản.");
  if (account.loginMethod !== "local-password") {
    throw new Error("Tài khoản này không sử dụng mật khẩu đăng nhập trên thiết bị nên không thể xác minh bằng mật khẩu cục bộ.");
  }
  return account.password === password;
}

