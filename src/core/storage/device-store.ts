import AsyncStorage from "@react-native-async-storage/async-storage";

import type { Wallet, Transaction } from "../../../drizzle/schema";

const STORAGE_KEY = "finora.device.database.v1";

type DeviceData = {
  nextWalletId: number;
  nextTransactionId: number;
  wallets: Wallet[];
  transactions: Transaction[];
};

const emptyData = (): DeviceData => ({
  nextWalletId: 1,
  nextTransactionId: 1,
  wallets: [],
  transactions: [],
});

async function load(): Promise<DeviceData> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return emptyData();

  try {
    const parsed = JSON.parse(raw) as Partial<DeviceData>;
    return {
      nextWalletId: parsed.nextWalletId ?? 1,
      nextTransactionId: parsed.nextTransactionId ?? 1,
      wallets: (parsed.wallets ?? []).map((wallet) => ({
        ...wallet,
        createdAt: new Date(wallet.createdAt),
        updatedAt: new Date(wallet.updatedAt),
      })),
      transactions: (parsed.transactions ?? []).map((transaction) => ({
        ...transaction,
        occurredAt: new Date(transaction.occurredAt),
        createdAt: new Date(transaction.createdAt),
        updatedAt: new Date(transaction.updatedAt),
      })),
    };
  } catch {
    return emptyData();
  }
}

async function save(data: DeviceData) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export async function listDeviceWallets(userId: number) {
  const data = await load();
  return data.wallets
    .filter((wallet) => wallet.userId === userId)
    .sort((a, b) => b.isArchived - a.isArchived || b.createdAt.getTime() - a.createdAt.getTime());
}

export async function getDeviceWallet(userId: number, walletId: number) {
  const data = await load();
  return data.wallets.find((wallet) => wallet.userId === userId && wallet.id === walletId);
}

export async function createDeviceWallet(
  input: Omit<Wallet, "id" | "createdAt" | "updatedAt">,
) {
  const data = await load();
  const now = new Date();
  const wallet: Wallet = {
    ...input,
    id: data.nextWalletId++,
    createdAt: now,
    updatedAt: now,
  };
  data.wallets.push(wallet);
  await save(data);
  return wallet;
}

export async function listDeviceTransactions(userId: number) {
  const data = await load();
  return data.transactions
    .filter((transaction) => transaction.userId === userId)
    .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());
}

export async function createDeviceTransaction(
  input: Omit<Transaction, "id" | "createdAt" | "updatedAt">,
) {
  const data = await load();
  const wallet = data.wallets.find(
    (item) => item.userId === input.userId && item.id === input.walletId,
  );
  if (!wallet) throw new Error("Wallet not found.");

  const now = new Date();
  const transaction: Transaction = {
    ...input,
    id: data.nextTransactionId++,
    createdAt: now,
    updatedAt: now,
    occurredAt: input.occurredAt ?? now,
  };
  data.transactions.push(transaction);
  await save(data);
  return transaction;
}
