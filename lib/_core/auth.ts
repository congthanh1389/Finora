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
const LOCAL_ACCOUNTS_INDEX_KEY = "finora.local.accounts.v4.index";
const LOCAL_ACCOUNT_PREFIX = "finora.local.account.v4.";

export type LocalAccount = User & { password: string };

function accountStorageKey(id: number): string {
  return `${LOCAL_ACCOUNT_PREFIX}${id}`;
}

function normalizeLocalAccount(value: unknown): LocalAccount | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Partial<LocalAccount>;
  const id = Number(item.id);
  if (!Number.isSafeInteger(id) || id <= 0 || typeof item.email !== "string" || typeof item.password !== "string") {
    return null;
  }
  const lastSignedIn = item.lastSignedIn instanceof Date
    ? item.lastSignedIn
    : new Date(item.lastSignedIn as unknown as string);
  return {
    id,
    openId: typeof item.openId === "string" ? item.openId : `local_${id}`,
    name: typeof item.name === "string" ? item.name : null,
    email: item.email,
    loginMethod: typeof item.loginMethod === "string" ? item.loginMethod : "local-password",
    lastSignedIn: Number.isNaN(lastSignedIn.getTime()) ? new Date(0) : lastSignedIn,
    password: item.password,
  };
}

/**
 * Account credentials are stored one account per SecureStore item.
 * This avoids SecureStore's per-value size limit when several accounts are saved.
 * The index contains only numeric IDs. Older v2/v3 data is migrated lazily.
 */
async function readAccounts(): Promise<LocalAccount[]> {
  // Validate the native module before calling it so a stale/mismatched Android
  // binary produces an actionable error instead of Hermes' generic TypeError.
  await requireSecureStoreMethod("getItemAsync");
  const indexRaw = await SecureStore.getItemAsync(LOCAL_ACCOUNTS_INDEX_KEY);
  if (indexRaw !== null) {
    let ids: unknown;
    try {
      ids = JSON.parse(indexRaw);
    } catch {
      throw new Error("Danh sách tài khoản đã lưu bị lỗi định dạng. Dữ liệu tài chính không bị ảnh hưởng.");
    }
    if (!Array.isArray(ids)) {
      throw new Error("Danh sách tài khoản đã lưu không hợp lệ. Dữ liệu tài chính không bị ảnh hưởng.");
    }

    const accounts: LocalAccount[] = [];
    const seen = new Set<number>();
    for (const rawId of ids) {
      const id = Number(rawId);
      if (!Number.isSafeInteger(id) || id <= 0 || seen.has(id)) continue;
      seen.add(id);
      const rawAccount = await SecureStore.getItemAsync(accountStorageKey(id));
      if (!rawAccount) continue;
      let parsed: unknown;
      try {
        parsed = JSON.parse(rawAccount);
      } catch {
        throw new Error(`Dữ liệu đăng nhập của tài khoản ID ${id} bị lỗi định dạng.`);
      }
      const account = normalizeLocalAccount(parsed);
      if (account) accounts.push({ ...account, id });
    }
    return accounts;
  }

  // Migrate the previous single-list format into per-account SecureStore items.
  const listRaw = await SecureStore.getItemAsync(LOCAL_ACCOUNTS_KEY);
  if (listRaw) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(listRaw);
    } catch {
      throw new Error("Không đọc được danh sách tài khoản đã lưu.");
    }
    if (!Array.isArray(parsed)) throw new Error("Danh sách tài khoản đã lưu không hợp lệ.");
    const accounts = parsed.map(normalizeLocalAccount).filter((item): item is LocalAccount => item !== null);
    await writeAccounts(accounts);
    return accounts;
  }

  // Migrate the oldest single-account format.
  const legacyRaw = await SecureStore.getItemAsync(LOCAL_ACCOUNT_KEY);
  if (!legacyRaw) return [];
  let legacyParsed: unknown;
  try {
    legacyParsed = JSON.parse(legacyRaw);
  } catch {
    throw new Error("Không đọc được tài khoản đã lưu theo định dạng cũ.");
  }
  const legacyAccount = normalizeLocalAccount(legacyParsed);
  if (!legacyAccount) throw new Error("Tài khoản đã lưu theo định dạng cũ không hợp lệ.");
  const accounts = [legacyAccount];
  await writeAccounts(accounts);
  return accounts;
}

async function requireSecureStoreMethod(name: "getItemAsync" | "setItemAsync" | "deleteItemAsync"): Promise<void> {
  const method = SecureStore[name];
  if (typeof method !== "function") {
    throw new Error(`SecureStore.${name} không khả dụng trong bản Android đang chạy. Hãy đồng bộ mã và chạy lại ứng dụng Android.`);
  }
}

async function writeAccounts(accounts: LocalAccount[]): Promise<void> {
  const normalized = accounts.map((account) => normalizeLocalAccount(account));
  if (normalized.some((item) => item === null)) {
    throw new Error("Không thể lưu danh sách vì có thông tin tài khoản không hợp lệ.");
  }
  const validAccounts = normalized as LocalAccount[];
  const ids = validAccounts.map((account) => Number(account.id));
  if (ids.some((id) => !Number.isSafeInteger(id) || id <= 0) || new Set(ids).size !== ids.length) {
    throw new Error("Danh sách tài khoản có ID không hợp lệ hoặc bị trùng.");
  }

  let previousIndexRaw: string | null;
  try {
    await requireSecureStoreMethod("getItemAsync");
    previousIndexRaw = await SecureStore.getItemAsync(LOCAL_ACCOUNTS_INDEX_KEY);
  } catch (error) {
    throw new Error(`Không đọc được chỉ mục tài khoản đã lưu: ${error instanceof Error ? error.message : String(error)}`);
  }

  let previousIds: number[] = [];
  if (previousIndexRaw) {
    try {
      const parsed = JSON.parse(previousIndexRaw);
      if (Array.isArray(parsed)) previousIds = parsed.map(Number).filter((id) => Number.isSafeInteger(id) && id > 0);
    } catch {
      // A malformed old index must not prevent writing a fresh authoritative index.
    }
  }

  // Do not switch the index until every remaining account has been written successfully.
  try {
    await requireSecureStoreMethod("setItemAsync");
    for (const account of validAccounts) {
      await SecureStore.setItemAsync(accountStorageKey(account.id), JSON.stringify(account));
    }
    await SecureStore.setItemAsync(LOCAL_ACCOUNTS_INDEX_KEY, JSON.stringify(ids));
  } catch (error) {
    throw new Error(`Không ghi được danh sách tài khoản đã lưu: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Cleanup happens after the new index is committed. Cleanup failure must not report removal as failed.
  if (typeof SecureStore.deleteItemAsync === "function") {
    for (const oldId of previousIds) {
      if (!ids.includes(oldId)) {
        try {
          await SecureStore.deleteItemAsync(accountStorageKey(oldId));
        } catch (error) {
          console.warn("[Auth] Could not clean up removed saved-account credentials.", error);
        }
      }
    }
    for (const legacyKey of [LOCAL_ACCOUNTS_KEY, LOCAL_ACCOUNT_KEY]) {
      try {
        await SecureStore.deleteItemAsync(legacyKey);
      } catch (error) {
        console.warn("[Auth] Could not clean up a legacy saved-account key.", error);
      }
    }
  } else {
    console.warn("[Auth] SecureStore.deleteItemAsync is unavailable; skipped legacy credential cleanup.");
  }
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

/**
 * Permanently deletes this account's local financial records and saved credentials.
 */
export async function localRemoveSavedAccount(userId: number): Promise<void> {
  let stage = "validate account ID";
  try {
    const normalizedUserId = Number(userId);
    if (!Number.isSafeInteger(normalizedUserId) || normalizedUserId <= 0) {
      throw new Error("Tài khoản không hợp lệ.");
    }

    stage = "read saved accounts";
    const accounts = await readAccounts();

    stage = "find selected account";
    const selected = accounts.find((account) => Number(account.id) === normalizedUserId);
    if (!selected) {
      throw new Error("Không tìm thấy tài khoản trong danh sách đã lưu. Hãy tải lại danh sách rồi thử lại.");
    }

    stage = "delete local financial data";
    const { deleteDeviceUserData } = await import("@/src/core/storage/device-store");
    await deleteDeviceUserData(normalizedUserId);

    stage = "remove saved credentials";
    const remaining = accounts.filter((account) => Number(account.id) !== normalizedUserId);
    await writeAccounts(remaining);

    stage = "clean up active session";
    try {
      const token = await getSessionToken();
      if (token === `local-session-${normalizedUserId}`) {
        await removeSessionToken();
        await clearUserInfo();
      }
    } catch (error) {
      console.warn("[Auth] Account was removed from the saved list, but session cleanup failed.", error);
    }
    console.log("[Auth] Saved account removed from this device.", normalizedUserId);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    console.error("[Auth] Failed to remove saved account at stage:", stage, detail, stack);
    throw new Error(`Lỗi khi gỡ tài khoản tại bước "${stage}": ${detail}`);
  }
}


/**
 * Updates the active local account's display name without touching financial records.
 */
export async function localUpdateAccountName(userId: number, name: string): Promise<User> {
  const normalizedName = name.trim();
  if (!normalizedName) throw new Error("Vui lòng nhập tên hiển thị.");
  if (normalizedName.length > 60) throw new Error("Tên hiển thị không được vượt quá 60 ký tự.");

  const accounts = await readAccounts();
  const account = accounts.find((item) => item.id === userId);
  if (!account) throw new Error("Không tìm thấy tài khoản đang đăng nhập.");

  const updatedAccount = { ...account, name: normalizedName };
  await writeAccounts(accounts.map((item) => item.id === userId ? updatedAccount : item));
  const user: User = {
    id: updatedAccount.id,
    openId: updatedAccount.openId,
    name: updatedAccount.name,
    email: updatedAccount.email,
    loginMethod: updatedAccount.loginMethod,
    lastSignedIn: updatedAccount.lastSignedIn,
  };
  await setUserInfo(user);
  return user;
}
