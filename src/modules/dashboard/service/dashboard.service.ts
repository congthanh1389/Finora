import type { Account, Category, Transaction } from "../../../../drizzle/schema";
import type { IFinoraRepository } from "../../../core/database/finora-repository";
import { FinancialEngine } from "../../../core/financial/financial-engine";
import type {
  DashboardCategoryExpense,
  DashboardData,
  DashboardPeriod,
} from "../types/dashboard.types";

function toMinorUnits(value: string | number): bigint {
  const normalized = String(value).trim();
  const negative = normalized.startsWith("-");
  const unsigned = negative ? normalized.slice(1) : normalized;
  const [wholePart, fractionPart = ""] = unsigned.split(".");
  if (!/^\d+$/.test(wholePart) || !/^\d*$/.test(fractionPart)) {
    throw new Error(`Invalid monetary value: ${normalized}`);
  }
  const minor = BigInt(wholePart) * 100n + BigInt((fractionPart + "00").slice(0, 2));
  return negative ? -minor : minor;
}

function formatMinorUnits(value: bigint): string {
  const negative = value < 0n;
  const absolute = negative ? -value : value;
  return `${negative ? "-" : ""}${absolute / 100n}.${String(absolute % 100n).padStart(2, "0")}`;
}

function startOfCurrentMonth(now: Date): Date {
  return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
}

function endOfCurrentMonth(now: Date): Date {
  return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
}

export function getCurrentMonthPeriod(now = new Date()): DashboardPeriod {
  return { from: startOfCurrentMonth(now), to: endOfCurrentMonth(now) };
}

export class DashboardService {
  constructor(
    private readonly repository: IFinoraRepository,
    private readonly financialEngine = new FinancialEngine(),
  ) {}

  async getDashboard(
    userId: number,
    period: DashboardPeriod = getCurrentMonthPeriod(),
  ): Promise<DashboardData> {
    if (period.from > period.to) {
      throw new Error("Dashboard period is invalid");
    }

    const [accounts, allTransactions, periodTransactions, categories] = await Promise.all([
      this.repository.listAccounts(userId),
      this.repository.listTransactions(userId),
      this.repository.listTransactions(userId, { from: period.from, to: period.to }),
      this.repository.listCategories(userId),
    ]);

    const activeAccounts = accounts.filter((account) => account.isArchived === 0);
    const activeAccountIds = new Set(activeAccounts.map((account) => account.id));
    const accountMap = new Map(activeAccounts.map((account) => [account.id, account]));
    const categoryMap = new Map(categories.map((category) => [category.id, category]));

    const balances = activeAccounts.map((account) => ({
      accountId: account.id,
      name: account.name,
      type: account.type,
      currency: account.currency,
      balance: this.addMoney(
        account.openingBalance,
        this.financialEngine.getNetEffect({
          accountId: account.id,
          transactions: allTransactions,
        }),
      ),
    }));

    const totalBalance = balances.reduce(
      (total, account) => total + toMinorUnits(account.balance),
      0n,
    );
    const summary = this.financialEngine.getSummary(periodTransactions);

    const recentTransactions = periodTransactions.slice(0, 5).map((transaction) => ({
      id: transaction.id,
      type: transaction.type,
      amount: String(transaction.amount),
      transactionDate: transaction.transactionDate,
      note: transaction.note,
      accountName: accountMap.get(transaction.accountId)?.name ?? "Ví không xác định",
      categoryName: this.getCategoryName(transaction, categoryMap),
    }));

    const expenseByCategory = this.getExpenseByCategory(periodTransactions, categoryMap, activeAccountIds);

    return {
      period,
      summary: {
        totalBalance: formatMinorUnits(totalBalance),
        income: summary.income,
        expense: summary.expense,
        netCashFlow: summary.net,
      },
      accounts: balances,
      recentTransactions,
      expenseByCategory,
    };
  }

  private getCategoryName(
    transaction: Transaction,
    categoryMap: Map<number, Category>,
  ): string | null {
    if (transaction.type === "transfer" || transaction.categoryId == null) return null;
    return categoryMap.get(transaction.categoryId)?.name ?? null;
  }

  private getExpenseByCategory(
    transactions: Transaction[],
    categoryMap: Map<number, Category>,
    activeAccountIds: Set<number>,
  ): DashboardCategoryExpense[] {
    const totals = new Map<number, bigint>();

    for (const transaction of transactions) {
      if (transaction.type !== "expense" || transaction.categoryId == null) continue;
      if (!activeAccountIds.has(transaction.accountId)) continue;
      const current = totals.get(transaction.categoryId) ?? 0n;
      totals.set(transaction.categoryId, current + toMinorUnits(transaction.amount));
    }

    return [...totals.entries()]
      .map(([categoryId, amount]) => ({
        categoryId,
        categoryName: categoryMap.get(categoryId)?.name ?? "Danh mục khác",
        amount: formatMinorUnits(amount),
      }))
      .sort((a, b) => (toMinorUnits(b.amount) > toMinorUnits(a.amount) ? 1 : -1));
  }

  private addMoney(...values: (string | number)[]): string {
    return formatMinorUnits(values.reduce((total, value) => total + toMinorUnits(value), 0n));
  }
}
