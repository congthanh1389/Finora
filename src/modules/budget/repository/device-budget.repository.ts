import { getDeviceDatabase, initializeDeviceStorage } from "../../../core/storage/device-store";
import type { Budget } from "../../../../drizzle/schema";
import type { CreateBudgetInput, BudgetSummary, UpdateBudgetInput } from "../types/budget.types";

function budgetFromRow(row: any): BudgetSummary {
  const amount = Number(row.amount);
  const spent = Number(row.spent ?? 0);
  return {
    id: Number(row.id),
    userId: Number(row.user_id),
    categoryId: Number(row.category_id),
    walletId: row.wallet_id == null ? null : Number(row.wallet_id),
    amount,
    currency: String(row.currency),
    periodStart: new Date(row.period_start),
    periodEnd: new Date(row.period_end),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    categoryName: row.category_name == null ? null : String(row.category_name),
    walletName: row.wallet_name == null ? null : String(row.wallet_name),
    spent,
    remaining: amount - spent,
    progress: amount > 0 ? Math.min(1, spent / amount) : 0,
  };
}

export class DeviceBudgetRepository {
  async listByPeriod(userId: number, periodStart: Date, periodEnd: Date): Promise<BudgetSummary[]> {
    await initializeDeviceStorage();
    const db = await getDeviceDatabase();
    const rows = await db.getAllAsync(
      [
        "SELECT b.*, c.name AS category_name, w.name AS wallet_name,",
        "COALESCE((SELECT SUM(t.amount) FROM transactions t",
        "WHERE t.user_id = b.user_id AND t.type = 'expense'",
        "AND t.category_id = b.category_id AND t.occurred_at >= b.period_start AND t.occurred_at < b.period_end",
        "AND (b.wallet_id IS NULL OR t.wallet_id = b.wallet_id)), 0) AS spent",
        "FROM budgets b",
        "LEFT JOIN categories c ON c.id = b.category_id AND c.user_id = b.user_id",
        "LEFT JOIN wallets w ON w.id = b.wallet_id AND w.user_id = b.user_id",
        "WHERE b.user_id = ? AND b.period_start = ? AND b.period_end = ?",
        "ORDER BY c.name ASC, b.id ASC",
      ].join(" "),
      userId,
      periodStart.toISOString(),
      periodEnd.toISOString(),
    );
    return rows.map(budgetFromRow);
  }

  async create(input: CreateBudgetInput): Promise<BudgetSummary> {
    await initializeDeviceStorage();
    const db = await getDeviceDatabase();
    const now = new Date().toISOString();
    const result = await db.runAsync(
      "INSERT INTO budgets (user_id, category_id, wallet_id, amount, currency, period_start, period_end, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      input.userId, input.categoryId, input.walletId ?? null, input.amount, input.currency ?? "VND",
      input.periodStart.toISOString(), input.periodEnd.toISOString(), now, now,
    );
    const rows = await this.listByPeriod(input.userId, input.periodStart, input.periodEnd);
    const created = rows.find((item) => item.id === result.lastInsertRowId);
    if (!created) throw new Error("Không thể đọc ngân sách vừa tạo.");
    return created;
  }

  async update(userId: number, budgetId: number, input: UpdateBudgetInput): Promise<BudgetSummary> {
    await initializeDeviceStorage();
    const db = await getDeviceDatabase();
    const current = await db.getFirstAsync<Budget>(
      "SELECT id, user_id, category_id, wallet_id, amount, currency, period_start, period_end, created_at, updated_at FROM budgets WHERE user_id = ? AND id = ?",
      userId, budgetId,
    );
    if (!current) throw new Error("Không tìm thấy ngân sách.");
    await db.runAsync(
      "UPDATE budgets SET category_id = ?, wallet_id = ?, amount = ?, updated_at = ? WHERE user_id = ? AND id = ?",
      input.categoryId ?? current.categoryId,
      input.walletId === undefined ? current.walletId : input.walletId,
      input.amount ?? current.amount,
      new Date().toISOString(), userId, budgetId,
    );
    const rows = await this.listByPeriod(userId, current.periodStart, current.periodEnd);
    const updated = rows.find((item) => item.id === budgetId);
    if (!updated) throw new Error("Không thể đọc ngân sách sau khi cập nhật.");
    return updated;
  }

  async delete(userId: number, budgetId: number): Promise<void> {
    await initializeDeviceStorage();
    const db = await getDeviceDatabase();
    const result = await db.runAsync("DELETE FROM budgets WHERE user_id = ? AND id = ?", userId, budgetId);
    if (result.changes === 0) throw new Error("Không tìm thấy ngân sách.");
  }
}
