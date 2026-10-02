import { describe, expect, it } from "vitest";
import type { Account, Transaction } from "../../../../drizzle/schema";
import type { IFinoraRepository } from "../../../core/database/finora-repository";
import { WalletService } from "../service/wallet.service";

function account(id: number, openingBalance: string): Account {
  return {
    id,
    userId: 1,
    name: `Wallet ${id}`,
    type: "cash",
    currency: "VND",
    openingBalance,
    isArchived: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function transaction(
  id: number,
  type: Transaction["type"],
  amount: string,
  accountId: number,
  transferAccountId?: number,
): Transaction {
  return {
    id,
    userId: 1,
    accountId,
    categoryId: null,
    type,
    amount,
    transactionDate: new Date("2026-10-01T12:00:00Z"),
    note: null,
    transferAccountId: transferAccountId ?? null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function repositoryMock(
  wallets: Account[],
  transactions: Transaction[],
): IFinoraRepository {
  return {
    listAccounts: async (userId) => wallets.filter((wallet) => wallet.userId === userId),
    getAccount: async (userId, walletId) =>
      wallets.find((wallet) => wallet.userId === userId && wallet.id === walletId),
    createAccount: async () => {
      throw new Error("not implemented");
    },
    updateAccount: async () => {
      throw new Error("not implemented");
    },
    archiveAccount: async () => {},
    listCategories: async () => [],
    getCategory: async () => undefined,
    createCategory: async () => {
      throw new Error("not implemented");
    },
    updateCategory: async () => undefined,
    listTransactions: async (userId) =>
      transactions.filter((item) => item.userId === userId),
    getTransaction: async () => undefined,
    createTransaction: async () => {
      throw new Error("not implemented");
    },
    updateTransaction: async () => undefined,
    deleteTransaction: async () => {},
  };
}

describe("WalletService", () => {
  it("calculates balance from opening balance plus income and expense effects", async () => {
    const service = new WalletService(
      repositoryMock(
        [account(1, "1000000.00")],
        [
          transaction(1, "income", "500000.00", 1),
          transaction(2, "expense", "300000.00", 1),
        ],
      ),
    );

    await expect(service.getBalance(1, 1)).resolves.toEqual({
      walletId: 1,
      currency: "VND",
      openingBalance: "1000000.00",
      transactionEffect: "200000.00",
      currentBalance: "1200000.00",
    });
  });

  it("applies a transfer as a decrease on the source and increase on the destination", async () => {
    const service = new WalletService(
      repositoryMock(
        [account(1, "1000000.00"), account(2, "500000.00")],
        [transaction(1, "transfer", "300000.00", 1, 2)],
      ),
    );

    await expect(service.getBalance(1, 1)).resolves.toMatchObject({
      transactionEffect: "-300000.00",
      currentBalance: "700000.00",
    });
    await expect(service.getBalance(1, 2)).resolves.toMatchObject({
      transactionEffect: "300000.00",
      currentBalance: "800000.00",
    });
  });

  it("does not lose cents through floating-point arithmetic", async () => {
    const service = new WalletService(
      repositoryMock(
        [account(1, "0.00")],
        [
          transaction(1, "income", "0.10", 1),
          transaction(2, "income", "0.20", 1),
        ],
      ),
    );

    await expect(service.getBalance(1, 1)).resolves.toMatchObject({
      transactionEffect: "0.30",
      currentBalance: "0.30",
    });
  });

  it("throws when the wallet does not exist", async () => {
    const service = new WalletService(repositoryMock([], []));

    await expect(service.getBalance(1, 99)).rejects.toThrow("Wallet not found");
  });
});
