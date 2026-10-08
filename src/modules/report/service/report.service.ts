import type { ReportPeriod, ReportPeriodRange } from "../model/report.types";

export interface IReportRepository {
  getReport(userId: number, range: ReportPeriodRange): Promise<{
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
    categories: Array<{ categoryId: number | null; name: string; amount: number }>;
    wallets: Array<{ walletId: number; name: string; amount: number }>;
    cashFlow: Array<{ date: string; income: number; expense: number }>;
  }>;
}

function assertUserId(userId: number): void {
  if (!Number.isSafeInteger(userId) || userId <= 0) {
    throw new Error("Invalid user id");
  }
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function getReportPeriodRange(period: ReportPeriod, now = new Date()): ReportPeriodRange {
  const current = startOfDay(now);

  if (period === "week") {
    const day = current.getDay();
    const start = addDays(current, day === 0 ? -6 : 1 - day);
    const end = addDays(start, 7);
    return {
      start,
      end,
      previousStart: addDays(start, -7),
      previousEnd: start,
    };
  }

  if (period === "month") {
    const start = new Date(current.getFullYear(), current.getMonth(), 1);
    const end = new Date(current.getFullYear(), current.getMonth() + 1, 1);
    const previousStart = new Date(current.getFullYear(), current.getMonth() - 1, 1);
    return { start, end, previousStart, previousEnd: start };
  }

  if (period === "quarter") {
    const quarterStartMonth = Math.floor(current.getMonth() / 3) * 3;
    const start = new Date(current.getFullYear(), quarterStartMonth, 1);
    const end = new Date(current.getFullYear(), quarterStartMonth + 3, 1);
    const previousStart = new Date(current.getFullYear(), quarterStartMonth - 3, 1);
    return { start, end, previousStart, previousEnd: start };
  }

  const start = new Date(current.getFullYear(), 0, 1);
  const end = new Date(current.getFullYear() + 1, 0, 1);
  const previousStart = new Date(current.getFullYear() - 1, 0, 1);
  return { start, end, previousStart, previousEnd: start };
}

export class ReportService {
  constructor(private readonly repository: IReportRepository) {}

  async getReport(userId: number, period: ReportPeriod, now = new Date()) {
    assertUserId(userId);
    const range = getReportPeriodRange(period, now);
    const raw = await this.repository.getReport(userId, range);
    const balance = raw.income - raw.expense;
    const previousBalance = raw.previousIncome - raw.previousExpense;

    const toRate = (value: number, base: number): number =>
      base === 0 ? (value === 0 ? 0 : 100) : ((value - base) / Math.abs(base)) * 100;

    const expenseTotal = raw.categories.reduce((sum, item) => sum + item.amount, 0);
    const walletTotal = raw.wallets.reduce((sum, item) => sum + item.amount, 0);

    return {
      periodStart: raw.periodStart,
      periodEnd: raw.periodEnd,
      summary: {
        income: raw.income,
        expense: raw.expense,
        transfer: raw.transfer,
        incomeCount: raw.incomeCount,
        expenseCount: raw.expenseCount,
        balance,
        savingsRate: raw.income === 0 ? 0 : (balance / raw.income) * 100,
      },
      previous: {
        income: raw.previousIncome,
        expense: raw.previousExpense,
        transfer: raw.previousTransfer,
        incomeCount: raw.previousIncomeCount,
        expenseCount: raw.previousExpenseCount,
        balance: previousBalance,
        savingsRate:
          raw.previousIncome === 0 ? 0 : (previousBalance / raw.previousIncome) * 100,
      },
      comparison: {
        incomeChange: toRate(raw.income, raw.previousIncome),
        expenseChange: toRate(raw.expense, raw.previousExpense),
        balanceChange: toRate(balance, previousBalance),
      },
      categories: raw.categories.map((item) => ({
        ...item,
        percentage: expenseTotal === 0 ? 0 : (item.amount / expenseTotal) * 100,
      })),
      wallets: raw.wallets.map((item) => ({
        ...item,
        percentage: walletTotal === 0 ? 0 : (item.amount / walletTotal) * 100,
      })),
      cashFlow: raw.cashFlow.map((item) => ({
        ...item,
        net: item.income - item.expense,
      })),
    };
  }
}
