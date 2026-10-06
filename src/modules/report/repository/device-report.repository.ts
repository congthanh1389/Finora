import { getDeviceDatabase, initializeDeviceStorage } from "../../../core/storage/device-store";

export type ReportCategoryRow = {
  categoryId: number | null;
  name: string;
  amount: number;
};

export type ReportData = {
  income: number;
  expense: number;
  transfer: number;
  incomeCount: number;
  expenseCount: number;
  categoryRows: ReportCategoryRow[];
};

export class DeviceReportRepository {
  async getCurrentMonth(userId: number, now = new Date()): Promise<ReportData> {
    await initializeDeviceStorage();
    const db = await getDeviceDatabase();
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    const to = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const summary = await db.getFirstAsync<{ income: number | null; expense: number | null; transfer: number | null; income_count: number; expense_count: number }>(
      `SELECT
         COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS income,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expense,
         COALESCE(SUM(CASE WHEN type = 'transfer' THEN amount ELSE 0 END), 0) AS transfer,
         COALESCE(SUM(CASE WHEN type = 'income' THEN 1 ELSE 0 END), 0) AS income_count,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN 1 ELSE 0 END), 0) AS expense_count
       FROM transactions
       WHERE user_id = ? AND occurred_at >= ? AND occurred_at < ?`,
      userId, from.toISOString(), to.toISOString(),
    );

    const rows = await db.getAllAsync<{ category_id: number | null; name: string | null; amount: number }>(
      `SELECT t.category_id, COALESCE(c.name, 'Khác') AS name, SUM(t.amount) AS amount
       FROM transactions t
       LEFT JOIN categories c ON c.id = t.category_id
       WHERE t.user_id = ? AND t.type = 'expense'
         AND t.occurred_at >= ? AND t.occurred_at < ?
       GROUP BY t.category_id, c.name
       ORDER BY amount DESC
       LIMIT 5`,
      userId, from.toISOString(), to.toISOString(),
    );

    return {
      income: Number(summary?.income ?? 0),
      expense: Number(summary?.expense ?? 0),
      transfer: Number(summary?.transfer ?? 0),
      incomeCount: Number(summary?.income_count ?? 0),
      expenseCount: Number(summary?.expense_count ?? 0),
      categoryRows: rows.map((row) => ({
        categoryId: row.category_id == null ? null : Number(row.category_id),
        name: String(row.name ?? "Khác"),
        amount: Number(row.amount),
      })),
    };
  }
}
