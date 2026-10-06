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

const TOTAL_BALANCE_SQL = [
  "SELECT COALESCE(SUM(w.opening_balance + COALESCE(e.balance_effect, 0)), 0) AS total_balance",
  "FROM wallets w",
  "LEFT JOIN (",
  "  SELECT wallet_id, SUM(effect) AS balance_effect",
  "  FROM (",
  "    SELECT wallet_id, SUM(CASE WHEN type = 'income' THEN amount WHEN type = 'expense' THEN -amount ELSE 0 END) AS effect",
  "    FROM transactions WHERE user_id = ? AND wallet_id IS NOT NULL AND type IN ('income', 'expense') GROUP BY wallet_id",
  "    UNION ALL",
  "    SELECT source_wallet_id AS wallet_id, SUM(-amount) AS effect",
  "    FROM transactions WHERE user_id = ? AND source_wallet_id IS NOT NULL AND type = 'transfer' GROUP BY source_wallet_id",
  "    UNION ALL",
  "    SELECT destination_wallet_id AS wallet_id, SUM(amount) AS effect",
  "    FROM transactions WHERE user_id = ? AND destination_wallet_id IS NOT NULL AND type = 'transfer' GROUP BY destination_wallet_id",
  "  ) effects",
  "  GROUP BY wallet_id",
  ") e ON e.wallet_id = w.id",
  "WHERE w.user_id = ? AND w.is_archived = 0",
].join(" ");

const PERIOD_SUMMARY_SQL = [
  "SELECT",
  "COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS income,",
  "COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expense,",
  "COALESCE(SUM(CASE WHEN type = 'transfer' THEN amount ELSE 0 END), 0) AS transfer",
  "FROM transactions",
  "WHERE user_id = ? AND occurred_at >= ? AND occurred_at < ?",
].join(" ");

const RECENT_TRANSACTIONS_SQL = [
  "SELECT t.*,",
  "COALESCE(w.name, source_wallet.name, destination_wallet.name, 'Ví') AS wallet_name,",
  "COALESCE(w.type, source_wallet.type, destination_wallet.type) AS wallet_type,",
  "c.name AS category_name",
  "FROM transactions t",
  "LEFT JOIN wallets w ON w.id = t.wallet_id",
  "LEFT JOIN wallets source_wallet ON source_wallet.id = t.source_wallet_id",
  "LEFT JOIN wallets destination_wallet ON destination_wallet.id = t.destination_wallet_id",
  "LEFT JOIN categories c ON c.id = t.category_id",
  "WHERE t.user_id = ?",
  "ORDER BY t.occurred_at DESC, t.id DESC",
  "LIMIT ?",
].join(" ");

export class DeviceDashboardRepository {
  async getTotalActiveWalletBalance(userId: number): Promise<number> {
    await initializeDeviceStorage();
    const db = await getDeviceDatabase();
    const row = await db.getFirstAsync<{ total_balance: number | null }>(
      TOTAL_BALANCE_SQL,
      userId, userId, userId, userId,
    );
    return Number(row?.total_balance ?? 0);
  }

  async getPeriodSummary(userId: number, from: Date, to: Date): Promise<DashboardPeriodSummary> {
    await initializeDeviceStorage();
    const db = await getDeviceDatabase();
    const row = await db.getFirstAsync<{ income: number | null; expense: number | null; transfer: number | null }>(
      PERIOD_SUMMARY_SQL,
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
      RECENT_TRANSACTIONS_SQL,
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
