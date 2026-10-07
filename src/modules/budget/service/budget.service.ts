import type { BudgetSummary, CreateBudgetInput, UpdateBudgetInput } from "../types/budget.types";

export interface BudgetRepository {
  listByPeriod(userId: number, periodStart: Date, periodEnd: Date): Promise<BudgetSummary[]>;
  create(input: CreateBudgetInput): Promise<BudgetSummary>;
  update(userId: number, budgetId: number, input: UpdateBudgetInput): Promise<BudgetSummary>;
  delete(userId: number, budgetId: number): Promise<void>;
}

export class BudgetService {
  constructor(private readonly repository: BudgetRepository) {}

  async listCurrentMonth(userId: number, now = new Date()): Promise<BudgetSummary[]> {
    this.validateUser(userId);
    const { start, end } = this.getMonthPeriod(now);
    return this.repository.listByPeriod(userId, start, end);
  }

  async createBudget(input: CreateBudgetInput): Promise<BudgetSummary> {
    this.validateUser(input.userId);
    this.validateAmount(input.amount);
    this.validatePeriod(input.periodStart, input.periodEnd);
    if (!Number.isInteger(input.categoryId) || input.categoryId <= 0) throw new Error("Invalid category id.");
    if (input.walletId != null && (!Number.isInteger(input.walletId) || input.walletId <= 0)) throw new Error("Invalid wallet id.");
    const currency = (input.currency ?? "VND").trim().toUpperCase();
    if (!/^[A-Z]{3}$/.test(currency)) throw new Error("Currency must be a 3-letter code.");

    const existing = await this.repository.listByPeriod(input.userId, input.periodStart, input.periodEnd);
    if (existing.some((item) => item.categoryId === input.categoryId && item.walletId === (input.walletId ?? null))) {
      throw new Error("Ngân sách cho danh mục và ví này đã tồn tại.");
    }

    return this.repository.create({ ...input, currency });
  }

  async updateBudget(userId: number, budgetId: number, input: UpdateBudgetInput): Promise<BudgetSummary> {
    this.validateUser(userId);
    if (!Number.isInteger(budgetId) || budgetId <= 0) throw new Error("Invalid budget id.");
    if (input.amount !== undefined) this.validateAmount(input.amount);
    if (input.categoryId !== undefined && (!Number.isInteger(input.categoryId) || input.categoryId <= 0)) throw new Error("Invalid category id.");
    if (input.walletId != null && (!Number.isInteger(input.walletId) || input.walletId <= 0)) throw new Error("Invalid wallet id.");
    return this.repository.update(userId, budgetId, input);
  }

  async deleteBudget(userId: number, budgetId: number): Promise<void> {
    this.validateUser(userId);
    if (!Number.isInteger(budgetId) || budgetId <= 0) throw new Error("Invalid budget id.");
    return this.repository.delete(userId, budgetId);
  }

  getMonthPeriod(now = new Date()) {
    return {
      start: new Date(now.getFullYear(), now.getMonth(), 1),
      end: new Date(now.getFullYear(), now.getMonth() + 1, 1),
    };
  }

  private validateUser(userId: number) {
    if (!Number.isInteger(userId) || userId <= 0) throw new Error("Invalid user id");
  }

  private validateAmount(amount: number) {
    if (!Number.isSafeInteger(amount) || amount <= 0) throw new Error("Số tiền ngân sách phải là số nguyên dương.");
  }

  private validatePeriod(start: Date, end: Date) {
    if (!(start instanceof Date) || Number.isNaN(start.getTime()) || !(end instanceof Date) || Number.isNaN(end.getTime()) || start >= end) {
      throw new Error("Khoảng thời gian ngân sách không hợp lệ.");
    }
  }
}
