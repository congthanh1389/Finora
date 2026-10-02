import { and, desc, eq } from "drizzle-orm";

import { wallets } from "../../../../drizzle/schema";
import type {
  IWalletRepository,
  NewWallet,
} from "../../../core/database/repository-contracts";
import { getDb } from "../../../../server/db";

export class WalletRepository implements IWalletRepository {
  async create(input: NewWallet) {
    const db = await getDb();
    if (!db) throw new Error("Database is not available");

    const result = await db.insert(wallets).values(input);
    const walletId = Number(result[0].insertId);
    const wallet = await this.findById(input.userId, walletId);

    if (!wallet) throw new Error("Wallet was created but could not be loaded");
    return wallet;
  }

  async findById(userId: number, walletId: number) {
    const db = await getDb();
    if (!db) throw new Error("Database is not available");

    const result = await db
      .select()
      .from(wallets)
      .where(and(eq(wallets.id, walletId), eq(wallets.userId, userId)))
      .limit(1);

    return result[0];
  }

  async listByUser(userId: number) {
    const db = await getDb();
    if (!db) throw new Error("Database is not available");

    return db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, userId))
      .orderBy(desc(wallets.isArchived), desc(wallets.createdAt));
  }
}