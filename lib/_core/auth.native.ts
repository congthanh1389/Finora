import * as SecureStore from "expo-secure-store";

export type User = {
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  loginMethod: string | null;
  lastSignedIn: Date;
};

export type LocalAccount = User & { password: string };

const SESSION_TOKEN_KEY = "app_session_token";
const USER_INFO_KEY = "manus-runtime-user-info";
const LOCAL_ACCOUNT_KEY = "finora.local.account.v2";
const LOCAL_ACCOUNTS_KEY = "finora.local.accounts.v3";
const LEGACY_LOCAL_ACCOUNT_KEYS = ["finora.local.account.v1", "finora.local.account"];

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
  } catch {}
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
  } catch {}
}

async function readAccounts(): Promise<LocalAccount[]> {
  try {
    const stored = await SecureStore.getItemAsync(LOCAL_ACCOUNTS_KEY);
    if (stored) {
      const accounts = JSON.parse(stored) as LocalAccount[];
      if (Array.isArray(accounts) && accounts.length > 0) return accounts;
    }

    const single = await SecureStore.getItemAsync(LOCAL_ACCOUNT_KEY);
    if (single) {
      const account = JSON.parse(single) as LocalAccount;
      const accounts = [account];
      await SecureStore.setItemAsync(LOCAL_ACCOUNTS_KEY, JSON.stringify(accounts));
      await SecureStore.deleteItemAsync(LOCAL_ACCOUNT_KEY);
      return accounts;
    }

    for (const key of LEGACY_LOCAL_ACCOUNT_KEYS) {
      const legacy = await SecureStore.getItemAsync(key);
      if (!legacy) continue;
      const account = JSON.parse(legacy) as LocalAccount;
      const accounts = [account];
      await SecureStore.setItemAsync(LOCAL_ACCOUNTS_KEY, JSON.stringify(accounts));
      await SecureStore.deleteItemAsync(key);
      return accounts;
    }
  } catch {}
  return [];
}

async function writeAccounts(accounts: LocalAccount[]): Promise<void> {
  await SecureStore.setItemAsync(LOCAL_ACCOUNTS_KEY, JSON.stringify(accounts));
  try {
    await SecureStore.deleteItemAsync(LOCAL_ACCOUNT_KEY);
  } catch {}
  for (const key of LEGACY_LOCAL_ACCOUNT_KEYS) {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {}
  }
}

export async function localGetAccounts(): Promise<LocalAccount[]> {
  return readAccounts();
}

export async function localGetAccount(email?: string): Promise<LocalAccount | null> {
  const accounts = await readAccounts();
  const normalizedEmail = email?.trim().toLowerCase();

  if (normalizedEmail) {
    return (
      accounts.find((account) => account.email?.trim().toLowerCase() === normalizedEmail) ?? null
    );
  }

  const token = await getSessionToken();
  if (token?.startsWith("local-session-")) {
    const id = Number(token.replace("local-session-", ""));
    return accounts.find((account) => account.id === id) ?? null;
  }

  const userInfo = await getUserInfo();
  if (userInfo) {
    return accounts.find((account) => account.id === userInfo.id) ?? null;
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

  if (!email || !email.includes("@")) throw new Error("Email không hợp lệ.");
  if (!name) throw new Error("Vui lòng nhập họ và tên.");
  if (input.password.length < 6) throw new Error("Mật khẩu phải có ít nhất 6 ký tự.");

  const accounts = await readAccounts();
  if (accounts.some((account) => account.email?.trim().toLowerCase() === email)) {
    throw new Error("Email này đã được đăng ký trên thiết bị.");
  }

  const { listDeviceUserIds } = await import("@/src/core/storage/device-store");
  const existingIds = await listDeviceUserIds();
  const usedIds = new Set([...accounts.map((account) => account.id), ...existingIds]);
  let id = input.userId && !usedIds.has(input.userId) ? input.userId : 1;
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

  await writeAccounts([...accounts, { ...user, password: input.password }]);
  await setSessionToken(`local-session-${id}`);
  await setUserInfo(user);
  return user;
}

export async function localLogin(email: string, password: string): Promise<User> {
  const normalizedEmail = email.trim().toLowerCase();
  const accounts = await readAccounts();
  const account = accounts.find(
    (item) =>
      item.email?.trim().toLowerCase() === normalizedEmail && item.password === password,
  );

  if (!account) {
    throw new Error("Email hoặc mật khẩu không đúng.");
  }

  const user: User = { ...account, lastSignedIn: new Date() };
  await writeAccounts(
    accounts.map((item) =>
      item.id === account.id ? { ...item, lastSignedIn: user.lastSignedIn } : item,
    ),
  );
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
  const exists = accounts.some((account) => account.id === userId);
  if (!exists) return;

  const { deleteDeviceUserData } = await import("@/src/core/storage/device-store");
  await deleteDeviceUserData(userId);
  await writeAccounts(accounts.filter((account) => account.id !== userId));

  const token = await getSessionToken();
  if (token === `local-session-${userId}`) {
    await localLogout();
  }
}
