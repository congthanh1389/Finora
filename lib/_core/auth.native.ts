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
  try { return await SecureStore.getItemAsync(SESSION_TOKEN_KEY); } catch { return null; }
}

export async function setSessionToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(SESSION_TOKEN_KEY, token);
}

export async function removeSessionToken(): Promise<void> {
  try { await SecureStore.deleteItemAsync(SESSION_TOKEN_KEY); } catch {}
}

export async function getUserInfo(): Promise<User | null> {
  try {
    const info = await SecureStore.getItemAsync(USER_INFO_KEY);
    if (!info) return null;
    return JSON.parse(info) as User;
  } catch { return null; }
}

export async function setUserInfo(user: User): Promise<void> {
  await SecureStore.setItemAsync(USER_INFO_KEY, JSON.stringify(user));
}

export async function clearUserInfo(): Promise<void> {
  try { await SecureStore.deleteItemAsync(USER_INFO_KEY); } catch {}
}

async function readSecureAccounts(): Promise<LocalAccount[]> {
  try {
    const stored = await SecureStore.getItemAsync(LOCAL_ACCOUNTS_KEY);
    if (stored) {
      const accounts = JSON.parse(stored) as LocalAccount[];
      if (Array.isArray(accounts)) return accounts;
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

async function writeSecureAccounts(accounts: LocalAccount[]): Promise<void> {
  await SecureStore.setItemAsync(LOCAL_ACCOUNTS_KEY, JSON.stringify(accounts));
  try { await SecureStore.deleteItemAsync(LOCAL_ACCOUNT_KEY); } catch {}
  for (const key of LEGACY_LOCAL_ACCOUNT_KEYS) {
    try { await SecureStore.deleteItemAsync(key); } catch {}
  }
}

async function syncAccountsToDeviceStore(accounts: LocalAccount[]): Promise<void> {
  const { upsertDeviceLocalAccount } = await import("@/src/core/storage/device-store");
  for (const account of accounts) {
    await upsertDeviceLocalAccount({
      id: account.id,
      openId: account.openId,
      name: account.name,
      email: account.email ?? "",
      loginMethod: account.loginMethod,
      lastSignedIn: new Date(account.lastSignedIn),
    });
  }
}

async function readDeviceAccounts(): Promise<LocalAccount[]> {
  const { listDeviceLocalAccounts, upsertDeviceLocalAccount } =
    await import("@/src/core/storage/device-store");

  const secureAccounts = await readSecureAccounts();
  let stored: Awaited<ReturnType<typeof listDeviceLocalAccounts>> = [];

  try {
    stored = await listDeviceLocalAccounts();
  } catch {
    // SecureStore remains the source of truth for local login accounts.
  }

  const merged = stored.map((account) => {
    const secure = secureAccounts.find((item) => item.id === account.id);
    return {
      ...account,
      password: secure?.password ?? "",
    };
  });

  for (const secure of secureAccounts) {
    const index = merged.findIndex((account) => account.id === secure.id);
    if (index >= 0) {
      merged[index] = { ...secure, email: secure.email ?? "" };
      continue;
    }

    try {
      await upsertDeviceLocalAccount({
        id: secure.id,
        openId: secure.openId,
        name: secure.name,
        email: secure.email ?? "",
        loginMethod: secure.loginMethod,
        lastSignedIn: new Date(secure.lastSignedIn),
      });
    } catch {}

    merged.push({ ...secure, email: secure.email ?? "" });
  }

  if (merged.length > 0) return merged;

  const currentUser = await getUserInfo();
  if (currentUser?.email) {
    try {
      await upsertDeviceLocalAccount({
        id: currentUser.id,
        openId: currentUser.openId,
        name: currentUser.name,
        email: currentUser.email,
        loginMethod: currentUser.loginMethod,
        lastSignedIn: new Date(currentUser.lastSignedIn),
      });
    } catch {}
    return [{ ...currentUser, password: "" }];
  }

  return [];
}

export async function localGetAccounts(): Promise<LocalAccount[]> {
  return readDeviceAccounts();
}

export async function localGetAccount(email?: string): Promise<LocalAccount | null> {
  const accounts = await readDeviceAccounts();
  const normalizedEmail = email?.trim().toLowerCase();

  if (normalizedEmail) {
    return accounts.find((account) => account.email?.trim().toLowerCase() === normalizedEmail) ?? null;
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

  const accounts = await readDeviceAccounts();
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

  const nextAccounts = [...accounts, { ...user, password: input.password }];
  await writeSecureAccounts(nextAccounts);
  await syncAccountsToDeviceStore(nextAccounts);
  await setSessionToken(`local-session-${id}`);
  await setUserInfo(user);
  return user;
}

export async function localLogin(email: string, password: string): Promise<User> {
  const normalizedEmail = email.trim().toLowerCase();
  const secureAccounts = await readSecureAccounts();
  const account = secureAccounts.find(
    (item) =>
      item.email?.trim().toLowerCase() === normalizedEmail &&
      item.password === password,
  );

  if (!account) throw new Error("Email hoặc mật khẩu không đúng.");

  const user: User = { ...account, lastSignedIn: new Date() };
  const nextAccounts = secureAccounts.map((item) =>
    item.id === account.id ? { ...item, lastSignedIn: user.lastSignedIn } : item,
  );
  await writeSecureAccounts(nextAccounts);
  await syncAccountsToDeviceStore(nextAccounts);
  await setSessionToken(`local-session-${user.id}`);
  await setUserInfo(user);
  return user;
}

export async function localLogout(): Promise<void> {
  await removeSessionToken();
  await clearUserInfo();
}

export async function localDeleteAccount(userId: number): Promise<void> {
  const accounts = await readDeviceAccounts();
  const exists = accounts.some((account) => account.id === userId);
  if (!exists) return;

  const { deleteDeviceUserData } = await import("@/src/core/storage/device-store");
  await deleteDeviceUserData(userId);

  const secureAccounts = await readSecureAccounts();
  await writeSecureAccounts(secureAccounts.filter((account) => account.id !== userId));

  const token = await getSessionToken();
  if (token === `local-session-${userId}`) await localLogout();
}

export async function localChangePassword(
  userId: number,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  if (newPassword.length < 6) {
    throw new Error("Mật khẩu mới phải có ít nhất 6 ký tự.");
  }

  const accounts = await readSecureAccounts();
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

  const updatedAccounts = accounts.map((item) =>
    item.id === userId ? { ...item, password: newPassword } : item,
  );

  await writeSecureAccounts(updatedAccounts);
  await syncAccountsToDeviceStore(updatedAccounts);
}

export async function localVerifyPassword(userId: number, password: string): Promise<boolean> {
  const accounts = await readSecureAccounts();
  const account = accounts.find((item) => item.id === userId);
  if (!account) throw new Error("Không tìm thấy tài khoản.");
  if (account.loginMethod !== "local-password") {
    throw new Error("Tài khoản này không sử dụng mật khẩu đăng nhập trên thiết bị nên không thể xác minh bằng mật khẩu cục bộ.");
  }
  return account.password === password;
}

