import { getDeviceDatabase, initializeDeviceStorage } from "../../../core/storage/device-store";
import type { ReportPeriodRange } from "../model/report.types";

export type ReportRepositoryData = {
  periodStart: string;
  periodEnd: string;
  income: number;
  expense: number;
  transfer: number;
  incomeCount: number;
  expenseCount: number;
  previousIncome: number;
  previousExpense: number;
  previousTransfer: number;
  previousIncomeCount: number;
  previousExpenseCount: number;
  categories: { categoryId: number | null; name: string; amount: number }[];
  wallets: { walletId: number; name: string; amount: number; balance: number; type: string; currency: string }[];
  cashFlow: { date: string; income: number; expense: number }[];
  budgets: { budgetId: number; categoryId: number; categoryName: string; limit: number; spent: number; walletId: number | null; walletName: string | null; walletType: string | null; currency: string }[];
};

type SummaryRow = {
  income: number | null;
  expense: number | null;
  transfer: number | null;
  income_count: number | null;
  expense_count: number | null;
};

function assertUserId(userId: number): void {
  if (!Number.isSafeInteger(userId) || userId <= 0) throw new Error("Invalid user id");
}

function assertDateRange(start: Date, end: Date, name: string): void {
  if (!(start instanceof Date) || Number.isNaN(start.getTime()) ||
      !(end instanceof Date) || Number.isNaN(end.getTime()) || start >= end) {
    throw new Error(`Invalid ${name} report period.`);
  }
}

export class DeviceReportRepository {
  async getReport(userId: number, range: ReportPeriodRange): Promise<ReportRepositoryData> {
    assertUserId(userId);
    assertDateRange(range.start, range.end, "current");
    assertDateRange(range.previousStart, range.previousEnd, "previous");

    await initializeDeviceStorage();
    const db = await getDeviceDatabase();
    const startIso = range.start.toISOString();
    const endIso = range.end.toISOString();
    const previousStartIso = range.previousStart.toISOString();
    const previousEndIso = range.previousEnd.toISOString();
    const timezoneOffsetMinutes = -range.start.getTimezoneOffset();
    const timezoneHours = Math.trunc(timezoneOffsetMinutes / 60);
    const timezoneMinutes = Math.abs(timezoneOffsetMinutes % 60);
    const timezoneModifier = `${timezoneHours >= 0 ? "+" : "-"}${String(Math.abs(timezoneHours)).padStart(2, "0")} hours${timezoneMinutes === 0 ? "" : ` ${timezoneMinutes >= 0 ? "+" : "-"}${String(Math.abs(timezoneMinutes)).padStart(2, "0")} minutes`}`;

    const summary = await db.getFirstAsync<SummaryRow>(
      `SELECT COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS income,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expense,
         COALESCE(SUM(CASE WHEN type = 'transfer' THEN amount ELSE 0 END), 0) AS transfer,
         COALESCE(SUM(CASE WHEN type = 'income' THEN 1 ELSE 0 END), 0) AS income_count,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN 1 ELSE 0 END), 0) AS expense_count
       FROM transactions WHERE user_id = ? AND occurred_at >= ? AND occurred_at < ?`,
      userId, startIso, endIso,
    );

    const previous = await db.getFirstAsync<SummaryRow>(
      `SELECT COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS income,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expense,
         COALESCE(SUM(CASE WHEN type = 'transfer' THEN amount ELSE 0 END), 0) AS transfer,
         COALESCE(SUM(CASE WHEN type = 'income' THEN 1 ELSE 0 END), 0) AS income_count,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN 1 ELSE 0 END), 0) AS expense_count
       FROM transactions WHERE user_id = ? AND occurred_at >= ? AND occurred_at < ?`,
      userId, previousStartIso, previousEndIso,
    );

    const categories = await db.getAllAsync<{ category_id: number | null; name: string | null; amount: number | null }>(
      `SELECT t.category_id, COALESCE(c.name, 'Khác') AS name, COALESCE(SUM(t.amount), 0) AS amount
       FROM transactions t
       LEFT JOIN categories c ON c.id = t.category_id AND c.user_id = t.user_id
       WHERE t.user_id = ? AND t.type = 'expense' AND t.occurred_at >= ? AND t.occurred_at < ?
       GROUP BY t.category_id, c.name ORDER BY amount DESC`,
      userId, startIso, endIso,
    );

    const wallets = await db.getAllAsync<{
      wallet_id: number;
      name: string | null;
      type: string | null;
      currency: string | null;
      amount: number | null;
      balance: number | null;
    }>(
      `SELECT w.id AS wallet_id,
         w.name,
         w.type,
         w.currency,
         w.opening_balance + COALESCE(wallet_effect.balance, 0) AS balance,
         COALESCE(period_expense.amount, 0) AS amount
       FROM wallets w
       LEFT JOIN (
         SELECT wallet_id, SUM(effect) AS balance
         FROM (
           SELECT wallet_id,
             SUM(CASE WHEN type = 'income' THEN amount WHEN type = 'expense' THEN -amount ELSE 0 END) AS effect
           FROM transactions
           WHERE user_id = ? AND wallet_id IS NOT NULL AND type IN ('income', 'expense')
           GROUP BY wallet_id
           UNION ALL
           SELECT source_wallet_id AS wallet_id, SUM(-amount) AS effect
           FROM transactions
           WHERE user_id = ? AND source_wallet_id IS NOT NULL AND type = 'transfer'
           GROUP BY source_wallet_id
           UNION ALL
           SELECT destination_wallet_id AS wallet_id, SUM(amount) AS effect
           FROM transactions
           WHERE user_id = ? AND destination_wallet_id IS NOT NULL AND type = 'transfer'
           GROUP BY destination_wallet_id
         ) effects
         GROUP BY wallet_id
       ) wallet_effect ON wallet_effect.wallet_id = w.id
       LEFT JOIN (
         SELECT wallet_id, SUM(amount) AS amount
         FROM transactions
         WHERE user_id = ? AND type = 'expense' AND wallet_id IS NOT NULL
           AND occurred_at >= ? AND occurred_at < ?
         GROUP BY wallet_id
       ) period_expense ON period_expense.wallet_id = w.id
       WHERE w.user_id = ?
       ORDER BY amount DESC, w.created_at DESC`,
      userId, userId, userId, userId, startIso, endIso, userId,
    );

    const cashFlow = await db.getAllAsync<{ date: string; income: number | null; expense: number | null }>(
      `SELECT date(occurred_at, ?) AS date,
         COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS income,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expense
       FROM transactions
       WHERE user_id = ? AND occurred_at >= ? AND occurred_at < ?
       GROUP BY date(occurred_at, ?) ORDER BY date ASC`,
      timezoneModifier, userId, startIso, endIso, timezoneModifier,
    );

    const budgets = await db.getAllAsync<{
      id: number;
      category_id: number;
      category_name: string | null;
      wallet_id: number | null;
      wallet_name: string | null;
      wallet_type: string | null;
      currency: string | null;
      amount: number;
      spent: number | null;
    }>(
      `SELECT b.id, b.category_id, c.name AS category_name,
         b.wallet_id, w.name AS wallet_name, w.type AS wallet_type, b.currency,
         b.amount,
         CASE
           WHEN b.wallet_id IS NULL THEN COALESCE(category_expense.spent, 0)
           ELSE COALESCE(wallet_expense.spent, 0)
         END AS spent
       FROM budgets b
       LEFT JOIN categories c ON c.id = b.category_id AND c.user_id = b.user_id
       LEFT JOIN wallets w ON w.id = b.wallet_id AND w.user_id = b.user_id
       LEFT JOIN (
         SELECT user_id, category_id, SUM(amount) AS spent
         FROM transactions
         WHERE user_id = ? AND type = 'expense'
           AND occurred_at >= ? AND occurred_at < ?
         GROUP BY user_id, category_id
       ) category_expense
         ON category_expense.user_id = b.user_id
        AND category_expense.category_id = b.category_id
       LEFT JOIN (
         SELECT user_id, category_id, wallet_id, SUM(amount) AS spent
         FROM transactions
         WHERE user_id = ? AND type = 'expense'
           AND occurred_at >= ? AND occurred_at < ?
         GROUP BY user_id, category_id, wallet_id
       ) wallet_expense
         ON wallet_expense.user_id = b.user_id
        AND wallet_expense.category_id = b.category_id
        AND wallet_expense.wallet_id = b.wallet_id
       WHERE b.user_id = ?
         AND b.period_start < ?
         AND b.period_end > ?
       ORDER BY spent DESC, b.id ASC`,
      userId, startIso, endIso, userId, startIso, endIso, userId, endIso, startIso,
    );

    return {
      periodStart: startIso,
      periodEnd: endIso,
      income: Number(summary?.income ?? 0),
      expense: Number(summary?.expense ?? 0),
      transfer: Number(summary?.transfer ?? 0),
      incomeCount: Number(summary?.income_count ?? 0),
      expenseCount: Number(summary?.expense_count ?? 0),
      previousIncome: Number(previous?.income ?? 0),
      previousExpense: Number(previous?.expense ?? 0),
      previousTransfer: Number(previous?.transfer ?? 0),
      previousIncomeCount: Number(previous?.income_count ?? 0),
      previousExpenseCount: Number(previous?.expense_count ?? 0),
      categories: categories.map((row) => ({
        categoryId: row.category_id == null ? null : Number(row.category_id),
        name: String(row.name ?? "Khác"),
        amount: Number(row.amount ?? 0),
      })),
      wallets: wallets.map((row) => ({
        walletId: Number(row.wallet_id),
        name: String(row.name ?? "Ví không xác định"),
        type: String(row.type ?? "other_asset"),
        currency: String(row.currency ?? "VND"),
        amount: Number(row.amount ?? 0),
        balance: Number(row.balance ?? 0),
      })),
      cashFlow: cashFlow.map((row) => ({
        date: String(row.date),
        income: Number(row.income ?? 0),
        expense: Number(row.expense ?? 0),
      })),
      budgets: budgets.map((row) => ({
        budgetId: Number(row.id),
        categoryId: Number(row.category_id),
        categoryName: String(row.category_name ?? "Không xác định"),
        limit: Number(row.amount),
        spent: Number(row.spent ?? 0),
        walletId: row.wallet_id == null ? null : Number(row.wallet_id),
        walletName: row.wallet_name == null ? null : String(row.wallet_name),
        walletType: row.wallet_type == null ? null : String(row.wallet_type),
        currency: String(row.currency ?? "VND"),
      })),
    };
  }
}