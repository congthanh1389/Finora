import { describe, expect, it } from "vitest";
import type { Account, Category, Transaction } from "../../../../drizzle/schema";
import type { IFinoraRepository } from "../../../core/database/finora-repository";
import { TransactionService } from "../service/transaction.service";

const wallet = (id: number, isArchived = 0): Account => ({
  id,
  userId: 1,
  name: `Wallet ${id}`,
  type: "cash",
  currency: "VND",
  openingBalance: "0.00",
  isArchived,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const category = (id: number, type: Category["type"], isArchived = 0): Category => ({
  id,
  userId: 1,
  name: `Category ${id}`,
  type,
  parentId: null,
  icon: null,
  isSystem: 0,
  isArchived,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const transaction = (
  id: number,
  type: Transaction["type"],
  overrides: Partial<Transaction> = {},
): Transaction => ({
  id,
  userId: 1,
  accountId: 1,
  categoryId: type === "transfer" ? null : 10,
  type,
  amount: "100.00",
  transactionDate: new Date("2026-10-01T12:00:00Z"),
  note: null,
  transferAccountId: type === "transfer" ? 2 : null,
  isVoided: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

function repositoryMock(
  wallets: Account[],
  categories: Category[],
  transactions: Transaction[],
): IFinoraRepository {
  return {
    listAccounts: async (userId) => wallets.filter((item) => item.userId === userId),
    getAccount: async (userId, accountId) =>
      wallets.find((item) => item.userId === userId && item.id === accountId),
    createAccount: async () => { throw new Error("not implemented"); },
    updateAccount: async () => { throw new Error("not implemented"); },
    archiveAccount: async () => {},
    listCategories: async (userId) => categories.filter((item) => item.userId === userId),
    getCategory: async (userId, categoryId) =>
      categories.find((item) => (item.userId === userId || item.isSystem === 1) && item.id === categoryId),
    createCategory: async () => { throw new Error("not implemented"); },
    updateCategory: async () => undefined,
    listTransactions: async (userId) =>
      transactions.filter((item) => item.userId === userId && item.isVoided === 0),
    getTransaction: async (userId, transactionId) =>
      transactions.find((item) => item.userId === userId && item.id === transactionId),
    createTransaction: async (input) => {
      const created = transaction(transactions.length + 1, input.type, input as Partial<Transaction>);
      transactions.push(created);
      return created;
    },
    updateTransaction: async (userId, transactionId, input) => {
      const item = transactions.find((row) => row.userId === userId && row.id === transactionId);
      if (!item) return undefined;
      Object.assign(item, input);
      return item;
    },
    deleteTransaction: async () => {},
  };
}

describe("TransactionService", () => {
  it("creates an income with a matching category", async () => {
    const service = new TransactionService(
      repositoryMock([wallet(1)], [category(10, "income")], []),
    );

    await expect(service.createTransaction({
      userId: 1,
      accountId: 1,
      categoryId: 10,
      type: "income",
      amount: "250000.5",
    })).resolves.toMatchObject({
      type: "income",
      amount: "250000.50",
      categoryId: 10,
    });
  });

  it("rejects an expense using an income category", async () => {
    const service = new TransactionService(
      repositoryMock([wallet(1)], [category(10, "income")], []),
    );

    await expect(service.createTransaction({
      userId: 1,
      accountId: 1,
      categoryId: 10,
      type: "expense",
      amount: "100",
    })).rejects.toThrow("Category type does not match transaction type");
  });

  it("creates a transfer without a category and validates both wallets", async () => {
    const service = new TransactionService(
      repositoryMock([wallet(1), wallet(2)], [], []),
    );

    await expect(service.createTransaction({
      userId: 1,
      accountId: 1,
      type: "transfer",
      amount: "300",
      transferAccountId: 2,
    })).resolves.toMatchObject({
      type: "transfer",
      categoryId: null,
      transferAccountId: 2,
      amount: "300.00",
    });
  });

  it("rejects transfer with the same source and destination", async () => {
    const service = new TransactionService(
      repositoryMock([wallet(1)], [], []),
    );

    await expect(service.createTransaction({
      userId: 1,
      accountId: 1,
      type: "transfer",
      amount: "300",
      transferAccountId: 1,
    })).rejects.toThrow("Transfer source and destination must differ");
  });

  it("voids a transaction instead of deleting financial history", async () => {
    const rows = [transaction(1, "expense")];
    const service = new TransactionService(
      repositoryMock([wallet(1)], [category(10, "expense")], rows),
    );

    await service.voidTransaction(1, 1);
    expect(rows[0].isVoided).toBe(1);
  });

  it("rejects zero or negative amounts", async () => {
    const service = new TransactionService(
      repositoryMock([wallet(1)], [category(10, "expense")], []),
    );

    await expect(service.createTransaction({
      userId: 1,
      accountId: 1,
      categoryId: 10,
      type: "expense",
      amount: "0",
    })).rejects.toThrow("Transaction amount must be greater than zero");
  });
});
