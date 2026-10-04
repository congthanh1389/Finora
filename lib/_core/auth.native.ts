import * as SecureStore from "expo-secure-store";

export type User = {
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  loginMethod: string | null;
  lastSignedIn: Date;
};

const SESSION_TOKEN_KEY = "app_session_token";
const USER_INFO_KEY = "manus-runtime-user-info";
const LOCAL_ACCOUNT_KEY = "finora.local.account.v2";
const LEGACY_LOCAL_ACCOUNT_KEYS = ["finora.local.account.v1", "finora.local.account"];

type LocalAccount = User & { password: string };

export async function getSessionToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(SESSION_TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setSessionToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(SESSION_TOKEN_KEY, token);
}

export async function removeSessionToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(SESSION_TOKEN_KEY);
  } catch {
    // Ignore missing native secure-storage entries.
  }
}

export async function getUserInfo(): Promise<User | null> {
  try {
    const info = await SecureStore.getItemAsync(USER_INFO_KEY);
    if (!info) return null;
    return JSON.parse(info) as User;
  } catch {
    return null;
  }
}

export async function setUserInfo(user: User): Promise<void> {
  await SecureStore.setItemAsync(USER_INFO_KEY, JSON.stringify(user));
}

export async function clearUserInfo(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(USER_INFO_KEY);
  } catch {
    // Ignore missing native secure-storage entries.
  }
}

export async function localGetAccount(): Promise<LocalAccount | null> {
  try {
    const current = await SecureStore.getItemAsync(LOCAL_ACCOUNT_KEY);
    if (current) return JSON.parse(current) as LocalAccount;

    for (const key of LEGACY_LOCAL_ACCOUNT_KEYS) {
      const legacy = await SecureStore.getItemAsync(key);
      if (!legacy) continue;

      const account = JSON.parse(legacy) as LocalAccount;
      if (account.email && account.password) {
        await SecureStore.setItemAsync(LOCAL_ACCOUNT_KEY, JSON.stringify(account));
        return account;
      }
    }

    return null;
  } catch {
    return null;
  }
}

export async function localRegister(input: {
  email: string;
  name: string;
  password: string;
  userId?: number;
}): Promise<User> {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();
  if (!email || !email.includes("@")) throw new Error("Email không hợp lệ.");
  if (!name) throw new Error("Vui lòng nhập họ và tên.");
  if (input.password.length < 6) throw new Error("Mật khẩu phải có ít nhất 6 ký tự.");

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

  await SecureStore.setItemAsync(
    LOCAL_ACCOUNT_KEY,
    JSON.stringify({ ...user, password: input.password }),
  );
  await setSessionToken(`local-session-${id}`);
  await setUserInfo(user);
  return user;
}

export async function localLogin(email: string, password: string): Promise<User> {
  const account = await localGetAccount();
  if (
    !account ||
    account.email?.toLowerCase() !== email.trim().toLowerCase() ||
    account.password !== password
  ) {
    throw new Error("Email hoặc mật khẩu không đúng.");
  }

  const { password: _storedPassword, ...storedUser } = account;
  const user: User = { ...storedUser, lastSignedIn: new Date() };
  await SecureStore.setItemAsync(
    LOCAL_ACCOUNT_KEY,
    JSON.stringify({ ...account, lastSignedIn: user.lastSignedIn }),
  );
  await setSessionToken(`local-session-${user.id}`);
  await setUserInfo(user);
  return user;
}

export async function localLogout(): Promise<void> {
  await removeSessionToken();
  await clearUserInfo();
}
