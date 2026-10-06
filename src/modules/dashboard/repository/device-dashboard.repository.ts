import { getDeviceDatabase, initializeDeviceStorage } from "../../../core/storage/device-store";
import type { DashboardData, DashboardPeriodSummary, DashboardRecentTransaction } from "../types/dashboard.types";

function transactionFromRow(row: any): DashboardRecentTransaction {
  return {
    id: Number(row.id),
    userId: Number(row.user_id),
    type: row.type,
    amount: Number(row.amount),
    currency: String(row.currency),
    walletId: row.wallet_id == null ? null : Number(row.wallet_id),
    sourceWalletId: row.source_wallet_id == null ? null : Number(row.source_wallet_id),
    destinationWalletId: row.destination_wallet_id == null ? null : Number(row.destination_wallet_id),
    categoryId: row.category_id == null ? null : Number(row.category_id),
    note: row.note == null ? null : String(row.note),
    occurredAt: new Date(row.occurred_at),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    walletName: String(row.wallet_name ?? "Ví"),
    walletType: row.wallet_type ?? null,
    categoryName: row.category_name == null ? null : String(row.category_name),
  };
}

export class DeviceDashboardRepository {
  async getTotalActiveWalletBalance(userId: number): Promise<number> {
    await initializeDeviceStorage();
    const db = await getDeviceDatabase();
    const row = await db.getFirstAsync<{ total_balance: number | null }>(
      "SELECT COALESCE(SUM(w.opening_balance + COALESCE(e.balance_effect, 0)), 0) AS total_balance\n       FROM wallets w\n       LEFT JOIN (\n         SELECT wallet_id, SUM(effect) AS balance_effect\n         FROM (\n           SELECT wallet_id,\n                  SUM(CASE WHEN type = 'income' THEN amount WHEN type = 'expense' THEN -amount ELSE 0 END) AS effect\n           FROM transactions\n           WHERE user_id = ? AND wallet_id IS NOT NULL AND type IN ('income', 'expense')\n           GROUP BY wallet_id\n           UNION ALL\n           SELECT source_wallet_id AS wallet_id, SUM(-amount) AS effect\n           FROM transactions\n           WHERE user_id = ? AND source_wallet_id IS NOT NULL AND type = 'transfer'\n           GROUP BY source_wallet_id\n           UNION ALL\n           SELECT destination_wallet_id AS wallet_id, SUM(amount) AS effect\n           FROM transactions\n           WHERE user_id = ? AND destination_wallet_id IS NOT NULL AND type = 'transfer'\n           GROUP BY destination_wallet_id\n         ) effects\n         GROUP BY wallet_id\n       ) e ON e.wallet_id = w.id\n       WHERE w.user_id = ? AND w.is_archived = 0",
      userId, userId, userId, userId,
    );
    return Number(row?.total_balance ?? 0);
  }

  async getPeriodSummary(userId: number, from: Date, to: Date): Promise<DashboardPeriodSummary> {
    await initializeDeviceStorage();
    const db = await getDeviceDatabase();
    const row = await db.getFirstAsync<{ income: number | null; expense: number | null; transfer: number | null }>(
      "SELECT\n         COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS income,\n         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expense,\n         COALESCE(SUM(CASE WHEN type = 'transfer' THEN amount ELSE 0 END), 0) AS transfer\n       FROM transactions\n       WHERE user_id = ? AND occurred_at >= ? AND occurred_at < ?",
      userId, from.toISOString(), to.toISOString(),
    );
    const income = Number(row?.income ?? 0);
    const expense = Number(row?.expense ?? 0);
    return { income, expense, transfer: Number(row?.transfer ?? 0), netCashflow: income - expense };
  }

  async listRecent(userId: number, limit = 3): Promise<DashboardRecentTransaction[]> {
    const safeLimit = Number.isSafeInteger(limit) && limit > 0 ? limit : 3;
    await initializeDeviceStorage();
    const db = await getDeviceDatabase();
    const rows = await db.getAllAsync(
      "SELECT t.*,\n         COALESCE(w.name, source_wallet.name, destination_wallet.name, 'Ví') AS wallet_name,\n         COALESCE(w.type, source_wallet.type, destination_wallet.type) AS wallet_type,\n         c.name AS category_name\n       FROM transactions t\n       LEFT JOIN wallets w ON w.id = t.wallet_id\n       LEFT JOIN wallets source_wallet ON source_wallet.id = t.source_wallet_id\n       LEFT JOIN wallets destination_wallet ON destination_wallet.id = t.destination_wallet_id\n       LEFT JOIN categories c ON c.id = t.category_id\n       WHERE t.user_id = ?\n       ORDER BY t.occurred_at DESC, t.id DESC\n       LIMIT ?",
      userId, safeLimit,
    );
    return rows.map(transactionFromRow);
  }

  async getDashboardData(userId: number, now = new Date()): Promise<DashboardData> {
    const currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const [totalBalance, currentMonth, previousMonth, recentTransactions] = await Promise.all([
      this.getTotalActiveWalletBalance(userId),
      this.getPeriodSummary(userId, currentStart, nextStart),
      this.getPeriodSummary(userId, previousStart, currentStart),
      this.listRecent(userId, 3),
    ]);
    return {
      totalBalance,
      currentMonth,
      previousMonth,
      recentTransactions,
      monthLabel: new Intl.DateTimeFormat("vi-VN", { month: "long" }).format(now),
    };
  }
}
