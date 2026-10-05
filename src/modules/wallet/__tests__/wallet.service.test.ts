import { describe, expect, it } from "vitest";

import type { IWalletRepository, NewWallet } from "../../../core/database/repository-contracts";
import { WalletService } from "../service/wallet.service";

function createRepository(): IWalletRepository {
  const rows: {
    id: number;
    userId: number;
    name: string;
    type: "cash" | "bank" | "ewallet" | "credit_card" | "savings" | "investment" | "other_asset" | "receivable" | "payable";
    currency: string;
    openingBalance: number;
    allowNegative: number;
    isArchived: number;
    createdAt: Date;
    updatedAt: Date;
  }[] = [];

  return {
    async create(input: NewWallet) {
      const wallet = {
        currency: input.currency ?? "VND",
        openingBalance: input.openingBalance ?? 0,
        allowNegative: input.allowNegative ?? 0,
        isArchived: input.isArchived ?? 0,
        id: rows.length + 1,
        ...input,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      rows.push(wallet);
      return wallet;
    },
    async findById(userId, walletId) {
      return rows.find((row) => row.userId === userId && row.id === walletId);
    },
    async listByUser(userId) {
      return rows.filter((row) => row.userId === userId);
    },
    async update(userId, walletId, input) {
      const row = rows.find((item) => item.userId === userId && item.id === walletId);
      if (!row) throw new Error("Wallet not found.");
      Object.assign(row, input, { updatedAt: new Date() });
      return row;
    },
    async archive(userId, walletId) {
      const row = rows.find((item) => item.userId === userId && item.id === walletId);
      if (!row) throw new Error("Wallet not found.");
      row.isArchived = 1;
      row.updatedAt = new Date();
      return row;
    },
  };
}

describe("WalletService", () => {
  it("normalizes a valid wallet before persistence", async () => {
    const service = new WalletService(createRepository());

    const wallet = await service.createWallet({
      userId: 1,
      name: "  Ví tiền mặt  ",
      type: "cash",
      currency: "vnd",
      openingBalance: 250000,
      allowNegative: true,
    });

    expect(wallet).toMatchObject({
      id: 1,
      name: "Ví tiền mặt",
      type: "cash",
      currency: "VND",
      openingBalance: 250000,
      allowNegative: true,
      isArchived: false,
    });
  });

  it("rejects an empty wallet name", async () => {
    const service = new WalletService(createRepository());

    await expect(
      service.createWallet({ userId: 1, name: "   ", type: "cash" }),
    ).rejects.toThrow("Wallet name is required");
  });

  it("rejects an invalid currency", async () => {
    const service = new WalletService(createRepository());

    await expect(
      service.createWallet({ userId: 1, name: "Ví", type: "cash", currency: "VN" }),
    ).rejects.toThrow("Currency must be a 3-letter code");
  });

  it("updates a wallet without changing its opening balance", async () => {
    const service = new WalletService(createRepository());
    const created = await service.createWallet({ userId: 1, name: "Ví cũ", type: "cash", openingBalance: 500000 });
    const updated = await service.updateWallet(1, created.id, {
      name: "Ví mới",
      type: "bank",
      allowNegative: true,
    });
    expect(updated).toMatchObject({
      name: "Ví mới",
      type: "bank",
      openingBalance: 500000,
      allowNegative: true,
    });
  });

  it("archives a wallet", async () => {
    const service = new WalletService(createRepository());
    const created = await service.createWallet({ userId: 1, name: "Ví cần lưu trữ", type: "cash" });
    const archived = await service.archiveWallet(1, created.id);
    expect(archived.isArchived).toBe(true);
  });

  it("lists wallets through the repository", async () => {
    const repository = createRepository();
    const service = new WalletService(repository);

    await service.createWallet({ userId: 1, name: "Ví tiền mặt", type: "cash" });
    await service.createWallet({ userId: 1, name: "Ngân hàng", type: "bank" });
    await service.createWallet({ userId: 2, name: "Ví khác", type: "cash" });

    const wallets = await service.listWallets(1);

    expect(wallets).toHaveLength(2);
    expect(wallets.map((wallet) => wallet.name)).toEqual(["Ví tiền mặt", "Ngân hàng"]);
  });
});
