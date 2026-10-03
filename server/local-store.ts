import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { InsertUser, User, Wallet } from "../drizzle/schema";

type StoredData = {
  nextUserId: number;
  nextWalletId: number;
  users: User[];
  wallets: Wallet[];
};

const DATA_DIR = join(dirname(fileURLToPath(import.meta.url)), ".data");
const DATA_FILE = join(DATA_DIR, "finora.json");

const emptyData = (): StoredData => ({
  nextUserId: 1,
  nextWalletId: 1,
  users: [],
  wallets: [],
});

async function load(): Promise<StoredData> {
  try {
    const raw = await readFile(DATA_FILE, "utf8");
    const data = JSON.parse(raw) as StoredData;
    data.users = data.users.map((u) => ({ ...u, createdAt: new Date(u.createdAt), updatedAt: new Date(u.updatedAt), lastSignedIn: new Date(u.lastSignedIn) }));
    data.wallets = data.wallets.map((w) => ({ ...w, createdAt: new Date(w.createdAt), updatedAt: new Date(w.updatedAt) }));
    return data;
  } catch {
    return emptyData();
  }
}

async function save(data: StoredData) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

export async function getLocalUserByOpenId(openId: string) {
  const data = await load();
  return data.users.find((u) => u.openId === openId);
}

export async function getLocalUserByEmail(email: string) {
  const data = await load();
  return data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
}

export async function upsertLocalUser(input: InsertUser): Promise<void> {
  const data = await load();
  const index = data.users.findIndex((u) => u.openId === input.openId);
  const now = new Date();
  if (index < 0) {
    const user: User = {
      id: data.nextUserId++,
      openId: input.openId!,
      name: input.name ?? null,
      email: input.email ?? null,
      passwordHash: input.passwordHash ?? null,
      loginMethod: input.loginMethod ?? null,
      role: input.role ?? "user",
      createdAt: input.createdAt ?? now,
      updatedAt: input.updatedAt ?? now,
      lastSignedIn: input.lastSignedIn ?? now,
    };
    data.users.push(user);
  } else {
    data.users[index] = {
      ...data.users[index],
      ...input,
      name: input.name === undefined ? data.users[index].name : input.name ?? null,
      email: input.email === undefined ? data.users[index].email : input.email ?? null,
      passwordHash: input.passwordHash === undefined ? data.users[index].passwordHash : input.passwordHash ?? null,
      loginMethod: input.loginMethod === undefined ? data.users[index].loginMethod : input.loginMethod ?? null,
      updatedAt: now,
    };
  }
  await save(data);
}

export async function createLocalUser(input: { email: string; name: string; passwordHash: string }) {
  const data = await load();
  const now = new Date();
  const user: User = {
    id: data.nextUserId++,
    openId: `local_${crypto.randomUUID()}`,
    email: input.email,
    name: input.name,
    passwordHash: input.passwordHash,
    loginMethod: "password",
    role: "user",
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now,
  };
  data.users.push(user);
  await save(data);
  return user;
}

export async function touchLocalUserLastSignedIn(openId: string) {
  const data = await load();
  const user = data.users.find((u) => u.openId === openId);
  if (!user) return;
  user.lastSignedIn = new Date();
  user.updatedAt = new Date();
  await save(data);
}

export async function createLocalWallet(input: Omit<Wallet, "id" | "createdAt" | "updatedAt">) {
  const data = await load();
  const now = new Date();
  const wallet: Wallet = { ...input, id: data.nextWalletId++, createdAt: now, updatedAt: now };
  data.wallets.push(wallet);
  await save(data);
  return wallet;
}

export async function getLocalWallet(userId: number, walletId: number) {
  const data = await load();
  return data.wallets.find((w) => w.userId === userId && w.id === walletId);
}

export async function listLocalWallets(userId: number) {
  const data = await load();
  return data.wallets
    .filter((w) => w.userId === userId)
    .sort((a, b) => b.isArchived - a.isArchived || b.createdAt.getTime() - a.createdAt.getTime());
}
