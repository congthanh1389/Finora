import type {
  ReportCustomRange,
  ReportPeriod,
  ReportPeriodRange,
  ReportSnapshot,
  ReportInsight,
} from "../model/report.types";

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
    categories: { categoryId: number | null; name: string; amount: number }[];
    wallets: { walletId: number; name: string; amount: number; balance: number; type: string; currency: string }[];
    cashFlow: { date: string; income: number; expense: number }[];
    budgets: {
      budgetId: number;
      categoryId: number;
      categoryName: string;
      limit: number;
      spent: number;
      walletId: number | null;
      walletName: string | null;
      walletType: string | null;
      currency: string;
    }[];
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

function assertValidDate(date: Date, name: string): void {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new Error(`Invalid ${name} report date.`);
  }
}

export function getCustomReportPeriodRange(
  customRange: ReportCustomRange,
): ReportPeriodRange {
  assertValidDate(customRange.start, "start");
  if (!customRange.end) {
    throw new Error("Custom report end date is required.");
  }
  assertValidDate(customRange.end, "end");

  const start = startOfDay(customRange.start);
  const selectedEnd = startOfDay(customRange.end);

  if (selectedEnd < start) {
    throw new Error("Report end date must be on or after start date.");
  }

  const end = addDays(selectedEnd, 1);
  const durationDays = Math.round(
    (end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000),
  );

  return {
    start,
    end,
    previousStart: addDays(start, -durationDays),
    previousEnd: start,
  };
}

export function getReportPeriodRange(
  period: Exclude<ReportPeriod, "custom">,
  now = new Date(),
): ReportPeriodRange {
  const current = startOfDay(now);

  if (period === "today") {
    const end = addDays(current, 1);
    return {
      start: current,
      end,
      previousStart: addDays(current, -1),
      previousEnd: current,
    };
  }

  if (period === "week") {
    const day = current.getDay();
    const start = addDays(current, day === 0 ? -6 : 1 - day);
    const end = addDays(start, 7);
    return { start, end, previousStart: addDays(start, -7), previousEnd: start };
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

function changeRate(value: number, base: number): number | null {
  if (base === 0) {
    return null;
  }
  return ((value - base) / Math.abs(base)) * 100;
}

type CashFlowGranularity = "day" | "week" | "month";

function formatDateKey(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export function getCashFlowGranularity(
  period: ReportPeriod,
  start: Date,
  end: Date,
): CashFlowGranularity {
  if (period === "today" || period === "week" || period === "month") {
    return "day";
  }

  if (period === "quarter") {
    return "week";
  }

  if (period === "year") {
    return "month";
  }

  const durationDays = Math.round(
    (end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000),
  );

  if (durationDays <= 31) {
    return "day";
  }

  if (durationDays <= 120) {
    return "week";
  }

  return "month";
}

function buildCashFlowCalendar(
  points: { date: string; income: number; expense: number }[],
  start: Date,
  end: Date,
  granularity: CashFlowGranularity,
): ReportSnapshot["cashFlow"] {
  const byDate = new Map(points.map((item) => [item.date, item]));
  const result: ReportSnapshot["cashFlow"] = [];

  if (granularity === "month") {
    for (
      let cursor = new Date(start.getFullYear(), start.getMonth(), 1);
      cursor < end;
      cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)
    ) {
      const bucketStart = new Date(cursor);
      const bucketEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
      let income = 0;
      let expense = 0;

      for (const [date, point] of byDate) {
        const pointDate = new Date(
          Number(date.slice(0, 4)),
          Number(date.slice(5, 7)) - 1,
          Number(date.slice(8, 10)),
        );
        if (pointDate >= bucketStart && pointDate < bucketEnd) {
          income += point.income;
          expense += point.expense;
        }
      }

      result.push({
        date: formatDateKey(bucketStart),
        income,
        expense,
        net: income - expense,
      });
    }
    return result;
  }

  const stepDays = granularity === "week" ? 7 : 1;
  for (
    let cursor = new Date(start);
    cursor < end;
    cursor.setDate(cursor.getDate() + stepDays)
  ) {
    const bucketStart = new Date(cursor);
    const bucketEnd = new Date(cursor);
    bucketEnd.setDate(bucketEnd.getDate() + stepDays);

    let income = 0;
    let expense = 0;

    for (const [date, point] of byDate) {
      const pointDate = new Date(
        Number(date.slice(0, 4)),
        Number(date.slice(5, 7)) - 1,
        Number(date.slice(8, 10)),
      );
      if (pointDate >= bucketStart && pointDate < bucketEnd && pointDate < end) {
        income += point.income;
        expense += point.expense;
      }
    }

    result.push({
      date: formatDateKey(bucketStart),
      income,
      expense,
      net: income - expense,
    });
  }

  return result;
}

function buildInsights(snapshot: Omit<ReportSnapshot, "insights">): ReportInsight[] {
  const insights: ReportInsight[] = [];

  if (snapshot.summary.income > 0 && snapshot.summary.savingsRate >= 20) {
    insights.push({
      type: "positive",
      title: "Tỷ lệ tiết kiệm tốt",
      description: `Bạn đang giữ lại ${snapshot.summary.savingsRate.toFixed(1)}% thu nhập trong kỳ.`,
    });
  }

  if (snapshot.comparison.expenseChange > 10) {
    insights.push({
      type: "warning",
      title: "Chi tiêu đang tăng",
      description: `Tổng chi tăng ${snapshot.comparison.expenseChange.toFixed(1)}% so với kỳ trước.`,
    });
  }

  const overBudget = snapshot.budgets.filter((item) => item.isOverBudget);
  if (overBudget.length > 0) {
    insights.push({
      type: "warning",
      title: "Có ngân sách vượt mức",
      description: `${overBudget.length} ngân sách đã vượt hạn mức trong kỳ.`,
    });
  } else if (snapshot.budgets.some((item) => item.percentageUsed >= 80)) {
    insights.push({
      type: "info",
      title: "Ngân sách sắp chạm giới hạn",
      description: "Có ngân sách đã sử dụng từ 80% hạn mức trở lên.",
    });
  }

  if (insights.length === 0) {
    insights.push({
      type: "info",
      title: "Tài chính đang ổn định",
      description: "Chưa có cảnh báo nổi bật trong kỳ báo cáo này.",
    });
  }

  return insights.slice(0, 3);
}

export class ReportService {
  constructor(private readonly repository: IReportRepository) {}

  async getReport(
    userId: number,
    period: ReportPeriod,
    now = new Date(),
    customRange?: ReportCustomRange,
  ): Promise<ReportSnapshot> {
    assertUserId(userId);

    const range =
      period === "custom"
        ? customRange
          ? getCustomReportPeriodRange(customRange)
          : (() => {
              throw new Error("Custom report range is required.");
            })()
        : getReportPeriodRange(period, now);

    const raw = await this.repository.getReport(userId, range);
    const balance = raw.income - raw.expense;
    const previousBalance = raw.previousIncome - raw.previousExpense;
    const categoryTotal = raw.categories.reduce((sum, item) => sum + item.amount, 0);
    const walletTotal = raw.wallets.reduce((sum, item) => sum + item.amount, 0);

    const snapshot: Omit<ReportSnapshot, "insights"> = {
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
        incomeChange: changeRate(raw.income, raw.previousIncome),
        expenseChange: changeRate(raw.expense, raw.previousExpense),
        balanceChange: changeRate(balance, previousBalance),
      },
      categories: raw.categories.map((item) => ({
        ...item,
        percentage: categoryTotal === 0 ? 0 : (item.amount / categoryTotal) * 100,
      })),
      wallets: raw.wallets.map((item) => ({
        ...item,
        type: item.type,
        currency: item.currency,
        percentage: walletTotal === 0 ? 0 : (item.amount / walletTotal) * 100,
      })),
      cashFlow: buildCashFlowCalendar(
        raw.cashFlow,
        range.start,
        range.end,
        getCashFlowGranularity(period, range.start, range.end),
      ),
      budgets: raw.budgets.map((item) => {
        const percentageUsed = item.limit === 0 ? 0 : (item.spent / item.limit) * 100;
        return {
          ...item,
          remaining: item.limit - item.spent,
          percentageUsed,
          isOverBudget: percentageUsed > 100,
        };
      }),
    };

    return { ...snapshot, insights: buildInsights(snapshot) };
  }
}
