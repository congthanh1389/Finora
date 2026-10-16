import type {
  Suggestion,
  SuggestionEngineOptions,
  SuggestionInput,
} from "../model/suggestion.types";

const DEFAULT_LIMIT = 5;

function changeRate(value: number, previous: number): number | null {
  if (previous === 0) return null;
  return ((value - previous) / Math.abs(previous)) * 100;
}

function pushTrendSuggestion(input: SuggestionInput, suggestions: Suggestion[]): void {
  const expenseChange = changeRate(input.expense, input.previousExpense);

  if (expenseChange !== null && expenseChange >= 20) {
    suggestions.push({
      id: "expense-trend-up",
      type: "trend",
      severity: "warning",
      priority: 75,
      title: "Chi tiêu đang tăng",
      description: `Tổng chi tăng ${expenseChange.toFixed(1)}% so với kỳ trước.`,
    });
    return;
  }

  if (expenseChange !== null && expenseChange <= -20 && input.previousExpense > 0) {
    suggestions.push({
      id: "expense-trend-down",
      type: "trend",
      severity: "positive",
      priority: 55,
      title: "Chi tiêu đang giảm",
      description: `Tổng chi giảm ${Math.abs(expenseChange).toFixed(1)}% so với kỳ trước.`,
    });
  }
}

function pushCashFlowSuggestion(input: SuggestionInput, suggestions: Suggestion[]): void {
  const balance = input.income - input.expense;

  if (balance < 0) {
    suggestions.push({
      id: "cash-flow-negative",
      type: "cash_flow",
      severity: "warning",
      priority: 95,
      title: "Dòng tiền âm",
      description: `Tiền ra đang cao hơn tiền vào ${Math.abs(balance).toLocaleString("vi-VN")}đ trong kỳ này.`,
    });
    return;
  }

  if (balance > 0 && input.income > 0 && input.savingsRate >= 20) {
    suggestions.push({
      id: "cash-flow-positive",
      type: "cash_flow",
      severity: "positive",
      priority: 60,
      title: "Dòng tiền tích cực",
      description: `Bạn đang giữ lại ${input.savingsRate.toFixed(1)}% thu nhập trong kỳ.`,
    });
  }
}

function pushBudgetSuggestions(input: SuggestionInput, suggestions: Suggestion[]): void {
  const overBudget = input.budgets
    .filter((item) => item.isOverBudget)
    .sort((a, b) => b.percentageUsed - a.percentageUsed);

  for (const budget of overBudget.slice(0, 2)) {
    suggestions.push({
      id: `budget-over-${budget.budgetId}`,
      type: "budget",
      severity: "warning",
      priority: 100,
      title: `Vượt ngân sách ${budget.categoryName}`,
      description: `Đã sử dụng ${budget.percentageUsed.toFixed(0)}% ngân sách, vượt ${Math.max(0, budget.spent - budget.limit).toLocaleString("vi-VN")}đ.`,
    });
  }

  if (overBudget.length === 0) {
    const nearing = input.budgets
      .filter((item) => item.percentageUsed >= 80)
      .sort((a, b) => b.percentageUsed - a.percentageUsed)[0];

    if (nearing) {
      suggestions.push({
        id: `budget-nearing-${nearing.budgetId}`,
        type: "budget",
        severity: "info",
        priority: 85,
        title: `Ngân sách ${nearing.categoryName} sắp chạm giới hạn`,
        description: `Bạn đã sử dụng ${nearing.percentageUsed.toFixed(0)}% ngân sách trong kỳ.`,
      });
    }
  }
}

function pushCategorySuggestion(input: SuggestionInput, suggestions: Suggestion[]): void {
  const top = [...input.categories]
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.amount - a.amount)[0];

  if (!top || top.percentage < 25) return;

  suggestions.push({
    id: `category-top-${top.categoryId ?? "other"}`,
    type: "category",
    severity: "info",
    priority: 50,
    title: `${top.name} là khoản chi lớn nhất`,
    description: `${top.name} chiếm ${top.percentage.toFixed(1)}% tổng chi tiêu trong kỳ.`,
  });
}

function pushWalletSuggestion(input: SuggestionInput, suggestions: Suggestion[]): void {
  const wallet = [...input.wallets]
    .filter((item) => item.expense > 0)
    .sort((a, b) => b.expense - a.expense)[0];

  if (!wallet || input.expense <= 0 || wallet.expense < input.expense * 0.25) return;

  suggestions.push({
    id: `wallet-top-${wallet.walletId}`,
    type: "wallet",
    severity: "info",
    priority: 35,
    title: `${wallet.name} có mức chi tiêu nổi bật`,
    description: `Ví này chiếm ${((wallet.expense / input.expense) * 100).toFixed(1)}% tổng chi tiêu trong kỳ.`,
  });
}

export function buildSuggestions(
  input: SuggestionInput,
  options: SuggestionEngineOptions = {},
): Suggestion[] {
  const limit = Math.max(1, Math.min(options.limit ?? DEFAULT_LIMIT, 10));
  const suggestions: Suggestion[] = [];

  pushCashFlowSuggestion(input, suggestions);
  pushTrendSuggestion(input, suggestions);
  pushBudgetSuggestions(input, suggestions);
  pushCategorySuggestion(input, suggestions);
  pushWalletSuggestion(input, suggestions);

  return suggestions
    .sort((a, b) => b.priority - a.priority)
    .slice(0, limit);
}
