import { getDeviceDatabase, initializeDeviceStorage } from "../../../core/storage/device-store";
import type { CreateBudgetInput, BudgetSummary, UpdateBudgetInput } from "../types/budget.types";

function positiveSafeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}

function validDate(value: unknown): value is Date {
  return value instanceof Date && !Number.isNaN(value.getTime());
}

function budgetFromRow(row: any): BudgetSummary {
  const id = Number(row.id);
  const userId = Number(row.user_id);
  const categoryId = Number(row.category_id);
  const walletId = row.wallet_id == null ? null : Number(row.wallet_id);
  const amount = Number(row.amount);
  const spent = Number(row.spent ?? 0);
  const currency = String(row.currency);
  const periodStart = new Date(row.period_start);
  const periodEnd = new Date(row.period_end);
  const createdAt = new Date(row.created_at);
  const updatedAt = new Date(row.updated_at);

  if (!positiveSafeInteger(id) || !positiveSafeInteger(userId) || !positiveSafeInteger(categoryId)) {
    throw new Error("Invalid persisted budget identifier.");
  }
  if (walletId !== null && !positiveSafeInteger(walletId)) {
    throw new Error("Invalid persisted budget wallet reference.");
  }
  if (!Number.isSafeInteger(amount) || amount <= 0 || !Number.isSafeInteger(spent) || spent < 0) {
    throw new Error("Invalid persisted budget amount.");
  }
  if (!/^[A-Z]{3}$/.test(currency)) {
    throw new Error("Invalid persisted budget currency.");
  }
  if (!validDate(periodStart) || !validDate(periodEnd) || periodStart >= periodEnd) {
    throw new Error("Invalid persisted budget period.");
  }
  if (!validDate(createdAt) || !validDate(updatedAt)) {
    throw new Error("Invalid persisted budget timestamp.");
  }
  if (row.category_name != null && typeof row.category_name !== "string") {
    throw new Error("Invalid persisted budget category name.");
  }
  if (row.wallet_name != null && typeof row.wallet_name !== "string") {
    throw new Error("Invalid persisted budget wallet name.");
  }

  return {
    id,
    userId,
    categoryId,
    walletId,
    amount,
    currency,
    periodStart,
    periodEnd,
    createdAt,
    updatedAt,
    categoryName: row.category_name == null ? null : String(row.category_name),
    walletName: row.wallet_name == null ? null : String(row.wallet_name),
    spent,
    remaining: amount - spent,
    progress: amount > 0 ? Math.min(1, spent / amount) : 0,
  };
}

function validatePersistedBudgetMutationRow(row: {
  id: number;
  user_id: number;
  category_id: number;
  wallet_id: number | null;
  amount: number;
  currency: string;
  period_start: string;
  period_end: string;
  created_at: string;
  updated_at: string;
}): void {
  if (!positiveSafeInteger(Number(row.id)) || !positiveSafeInteger(Number(row.user_id)) || !positiveSafeInteger(Number(row.category_id))) {
    throw new Error("Invalid persisted budget identifier.");
  }
  if (row.wallet_id !== null && !positiveSafeInteger(Number(row.wallet_id))) {
    throw new Error("Invalid persisted budget wallet reference.");
  }
  if (!Number.isSafeInteger(Number(row.amount)) || Number(row.amount) <= 0) {
    throw new Error("Invalid persisted budget amount.");
  }
  if (!/^[A-Z]{3}$/.test(String(row.currency))) {
    throw new Error("Invalid persisted budget currency.");
  }
  const periodStart = new Date(row.period_start);
  const periodEnd = new Date(row.period_end);
  if (!validDate(periodStart) || !validDate(periodEnd) || periodStart >= periodEnd) {
    throw new Error("Invalid persisted budget period.");
  }
  if (!validDate(new Date(row.created_at)) || !validDate(new Date(row.updated_at))) {
    throw new Error("Invalid persisted budget timestamp.");
  }
}

export class DeviceBudgetRepository {
  async listByPeriod(userId: number, periodStart: Date, periodEnd: Date): Promise<BudgetSummary[]> {
    if (!positiveSafeInteger(userId)) {
      throw new Error("Invalid user ID.");
    }
    if (!validDate(periodStart) || !validDate(periodEnd) || periodStart >= periodEnd) {
      throw new Error("Invalid budget period.");
    }

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
    if (!positiveSafeInteger(input.userId) || !positiveSafeInteger(input.categoryId)) {
      throw new Error("Invalid budget identifier.");
    }
    if (input.walletId != null && !positiveSafeInteger(input.walletId)) {
      throw new Error("Invalid budget wallet reference.");
    }
    if (!Number.isSafeInteger(input.amount) || input.amount <= 0) {
      throw new Error("Invalid budget amount.");
    }
    if (input.currency != null && !/^[A-Z]{3}$/.test(input.currency)) {
      throw new Error("Invalid budget currency.");
    }
    if (!validDate(input.periodStart) || !validDate(input.periodEnd) || input.periodStart >= input.periodEnd) {
      throw new Error("Invalid budget period.");
    }

    await initializeDeviceStorage();
    const db = await getDeviceDatabase();
    const now = new Date().toISOString();
    const category = await db.getFirstAsync<{ id: number; type: string; is_archived: number; currency?: string }>(
      "SELECT id, type, is_archived FROM categories WHERE user_id = ? AND id = ?", input.userId, input.categoryId,
    );
    if (!category) throw new Error("Không tìm thấy danh mục.");
    if (!positiveSafeInteger(Number(category.id))) {
      throw new Error("Invalid budget category reference.");
    }
    if (category.type !== "expense" || ![0, 1].includes(Number(category.is_archived))) {
      throw new Error("Invalid persisted category state.");
    }
    if (Number(category.is_archived) === 1) throw new Error("Chỉ có thể lập ngân sách cho danh mục chi tiêu đang hoạt động.");
    if (input.walletId != null) {
      const wallet = await db.getFirstAsync<{ id: number; currency: string; is_archived: number }>(
        "SELECT id, currency, is_archived FROM wallets WHERE user_id = ? AND id = ?", input.userId, input.walletId,
      );
      if (!wallet) throw new Error("Không tìm thấy ví.");
      if (Number(wallet.is_archived) === 1) throw new Error("Không thể lập ngân sách cho ví đã lưu trữ.");
      if (String(wallet.currency) !== String(input.currency ?? "VND")) throw new Error("Tiền tệ ngân sách không khớp với ví.");
    }
    let result: { lastInsertRowId: number };
    await db.withTransactionAsync(async () => {
      const duplicate = await db.getFirstAsync<{ id: number }>(
        "SELECT id FROM budgets WHERE user_id = ? AND category_id = ? AND period_start = ? AND period_end = ? AND (wallet_id = ? OR (wallet_id IS NULL AND ? IS NULL)) LIMIT 1",
        input.userId,
        input.categoryId,
        input.periodStart.toISOString(),
        input.periodEnd.toISOString(),
        input.walletId ?? null,
        input.walletId ?? null,
      );
      if (duplicate) throw new Error("Ngân sách cho danh mục và ví này đã tồn tại.");
      result = await db.runAsync(
        "INSERT INTO budgets (user_id, category_id, wallet_id, amount, currency, period_start, period_end, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        input.userId, input.categoryId, input.walletId ?? null, input.amount, input.currency ?? "VND",
        input.periodStart.toISOString(), input.periodEnd.toISOString(), now, now,
      );
    });
    const rows = await this.listByPeriod(input.userId, input.periodStart, input.periodEnd);
    const created = rows.find((item) => item.id === result.lastInsertRowId);
    if (!created) throw new Error("Không thể đọc ngân sách vừa tạo.");
    return created;
  }

  async update(userId: number, budgetId: number, input: UpdateBudgetInput): Promise<BudgetSummary> {
    if (!positiveSafeInteger(userId) || !positiveSafeInteger(budgetId)) {
      throw new Error("Invalid budget identifier.");
    }
    if (input.categoryId != null && !positiveSafeInteger(input.categoryId)) {
      throw new Error("Invalid budget category reference.");
    }
    if (input.walletId != null && !positiveSafeInteger(input.walletId)) {
      throw new Error("Invalid budget wallet reference.");
    }
    if (input.amount != null && (!Number.isSafeInteger(input.amount) || input.amount <= 0)) {
      throw new Error("Invalid budget amount.");
    }

    await initializeDeviceStorage();
    const db = await getDeviceDatabase();
    let periodStart: Date;
    let periodEnd: Date;
    await db.withTransactionAsync(async () => {
      const current = await db.getFirstAsync<{
        id: number; user_id: number; category_id: number; wallet_id: number | null; amount: number; currency: string;
        period_start: string; period_end: string; created_at: string; updated_at: string;
      }>(
        "SELECT id, user_id, category_id, wallet_id, amount, currency, period_start, period_end, created_at, updated_at FROM budgets WHERE user_id = ? AND id = ?",
        userId, budgetId,
      );
      if (!current) throw new Error("Không tìm thấy ngân sách.");
      validatePersistedBudgetMutationRow(current);
      const nextCategoryId = input.categoryId ?? Number(current.category_id);
      const nextWalletId = input.walletId === undefined ? (current.wallet_id == null ? null : Number(current.wallet_id)) : input.walletId;
      const category = await db.getFirstAsync<{ id: number; type: string; is_archived: number }>(
        "SELECT id, type, is_archived FROM categories WHERE user_id = ? AND id = ?", userId, nextCategoryId,
      );
      if (!category || category.type !== "expense" || Number(category.is_archived) === 1) throw new Error("Chỉ có thể dùng danh mục chi tiêu đang hoạt động.");
      if (nextWalletId != null) {
        const wallet = await db.getFirstAsync<{ id: number; currency: string; is_archived: number }>(
          "SELECT id, currency, is_archived FROM wallets WHERE user_id = ? AND id = ?", userId, nextWalletId,
        );
        if (!wallet) throw new Error("Không tìm thấy ví.");
        if (Number(wallet.is_archived) === 1) throw new Error("Không thể dùng ví đã lưu trữ.");
        if (String(wallet.currency) !== String(current.currency)) throw new Error("Tiền tệ ngân sách không khớp với ví.");
      }
      const duplicate = await db.getFirstAsync<{ id: number }>(
        "SELECT id FROM budgets WHERE user_id = ? AND category_id = ? AND period_start = ? AND period_end = ? AND (wallet_id = ? OR (wallet_id IS NULL AND ? IS NULL)) AND id <> ? LIMIT 1",
        userId, nextCategoryId, current.period_start, current.period_end, nextWalletId, nextWalletId, budgetId,
      );
      if (duplicate) throw new Error("Ngân sách cho danh mục và ví này đã tồn tại.");
      await db.runAsync(
        "UPDATE budgets SET category_id = ?, wallet_id = ?, amount = ?, updated_at = ? WHERE user_id = ? AND id = ?",
        nextCategoryId, nextWalletId, input.amount ?? Number(current.amount), new Date().toISOString(), userId, budgetId,
      );
      periodStart = new Date(current.period_start);
      periodEnd = new Date(current.period_end);
    });
    const rows = await this.listByPeriod(userId, periodStart!, periodEnd!);
    const updated = rows.find((item) => item.id === budgetId);
    if (!updated) throw new Error("Không thể đọc ngân sách sau khi cập nhật.");
    return updated;
  }

  async delete(userId: number, budgetId: number): Promise<void> {
    if (!positiveSafeInteger(userId) || !positiveSafeInteger(budgetId)) {
      throw new Error("Invalid budget identifier.");
    }

    await initializeDeviceStorage();
    const db = await getDeviceDatabase();
    const result = await db.runAsync("DELETE FROM budgets WHERE user_id = ? AND id = ?", userId, budgetId);
    if (result.changes === 0) throw new Error("Không tìm thấy ngân sách.");
  }
}
