import { getDeviceDatabase, initializeDeviceStorage } from "../../../core/storage/device-store";

export type ReportCategoryRow = {
  categoryId: number | null;
  name: string;
  amount: number;
};

export type ReportWalletRow = {
  walletId: number;
  name: string;
  amount: number;
};

export type ReportSummary = {
  income: number;
  expense: number;
  transfer: number;
  incomeCount: number;
  expenseCount: number;
};

export type ReportData = ReportSummary & {
  categoryRows: ReportCategoryRow[];
  walletRows: ReportWalletRow[];
  periodStart: string;
  periodEnd: string;
  previous: ReportSummary;
};

export class DeviceReportRepository {
  async getCurrentMonth(userId: number, now = new Date()): Promise<ReportData> {
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    const to = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const previousFrom = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousTo = from;
    return this.getReport(userId, from, to, previousFrom, previousTo);
  }

  async getReport(
    userId: number,
    from: Date,
    to: Date,
    previousFrom: Date,
    previousTo: Date,
  ): Promise<ReportData> {
    if (!Number.isInteger(userId) || userId <= 0) throw new Error("Invalid user id");
    if (!(from instanceof Date) || !(to instanceof Date) || from >= to) throw new Error("Invalid report period.");

    await initializeDeviceStorage();
    const db = await getDeviceDatabase();
    const fromIso = from.toISOString();
    const toIso = to.toISOString();
    const previousFromIso = previousFrom.toISOString();
    const previousToIso = previousTo.toISOString();

    const summary = await db.getFirstAsync<ReportSummary & {
      income_count: number;
      expense_count: number;
    }>(
      `SELECT
         COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS income,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expense,
         COALESCE(SUM(CASE WHEN type = 'transfer' THEN amount ELSE 0 END), 0) AS transfer,
         COALESCE(SUM(CASE WHEN type = 'income' THEN 1 ELSE 0 END), 0) AS income_count,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN 1 ELSE 0 END), 0) AS expense_count
       FROM transactions
       WHERE user_id = ? AND occurred_at >= ? AND occurred_at < ?`,
      userId, fromIso, toIso,
    );

    const previous = await db.getFirstAsync<ReportSummary & {
      income_count: number;
      expense_count: number;
    }>(
      `SELECT
         COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS income,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expense,
         COALESCE(SUM(CASE WHEN type = 'transfer' THEN amount ELSE 0 END), 0) AS transfer,
         COALESCE(SUM(CASE WHEN type = 'income' THEN 1 ELSE 0 END), 0) AS income_count,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN 1 ELSE 0 END), 0) AS expense_count
       FROM transactions
       WHERE user_id = ? AND occurred_at >= ? AND occurred_at < ?`,
      userId, previousFromIso, previousToIso,
    );

    const categoryRows = await db.getAllAsync<{ category_id: number | null; name: string | null; amount: number }>(
      `SELECT t.category_id, COALESCE(c.name, 'Khác') AS name, SUM(t.amount) AS amount
       FROM transactions t
       LEFT JOIN categories c ON c.id = t.category_id
       WHERE t.user_id = ? AND t.type = 'expense'
         AND t.occurred_at >= ? AND t.occurred_at < ?
       GROUP BY t.category_id, c.name
       ORDER BY amount DESC
       LIMIT 5`,
      userId, fromIso, toIso,
    );

    const walletRows = await db.getAllAsync<{ wallet_id: number; name: string | null; amount: number }>(
      `SELECT t.wallet_id, COALESCE(w.name, 'Ví không xác định') AS name, SUM(t.amount) AS amount
       FROM transactions t
       LEFT JOIN wallets w ON w.id = t.wallet_id
       WHERE t.user_id = ? AND t.type = 'expense' AND t.wallet_id IS NOT NULL
         AND t.occurred_at >= ? AND t.occurred_at < ?
       GROUP BY t.wallet_id, w.name
       ORDER BY amount DESC
       LIMIT 5`,
      userId, fromIso, toIso,
    );

    return {
      income: Number(summary?.income ?? 0),
      expense: Number(summary?.expense ?? 0),
      transfer: Number(summary?.transfer ?? 0),
      incomeCount: Number(summary?.income_count ?? 0),
      expenseCount: Number(summary?.expense_count ?? 0),
      categoryRows: categoryRows.map((row) => ({
        categoryId: row.category_id == null ? null : Number(row.category_id),
        name: String(row.name ?? "Khác"),
        amount: Number(row.amount),
      })),
      walletRows: walletRows.map((row) => ({
        walletId: Number(row.wallet_id),
        name: String(row.name ?? "Ví không xác định"),
        amount: Number(row.amount),
      })),
      periodStart: fromIso,
      periodEnd: toIso,
      previous: {
        income: Number(previous?.income ?? 0),
        expense: Number(previous?.expense ?? 0),
        transfer: Number(previous?.transfer ?? 0),
        incomeCount: Number(previous?.income_count ?? 0),
        expenseCount: Number(previous?.expense_count ?? 0),
      },
    };
  }
}
