import type {
  Reminder,
  ReminderEngineOptions,
  ReminderInput,
} from "../model/reminder.types";

const DEFAULT_LIMIT = 8;
const MAX_LIMIT = 8;

function pushBudgetReminders(input: ReminderInput, reminders: Reminder[]): void {
  const over = input.budgets
    .filter((item) => item.isOverBudget)
    .sort((a, b) => b.percentageUsed - a.percentageUsed);

  for (const budget of over.slice(0, 2)) {
    reminders.push({
      id: `budget-over-${budget.budgetId}`,
      type: "budget",
      severity: "warning",
      priority: 100,
      title: `Ngân sách ${budget.categoryName} đã vượt`,
      description: `Đã sử dụng ${budget.percentageUsed.toFixed(0)}% ngân sách, vượt ${Math.max(0, budget.spent - budget.limit).toLocaleString("vi-VN")}đ.`,
    });
  }

  if (over.length === 0) {
    const nearing = input.budgets
      .filter((item) => item.percentageUsed >= 80)
      .sort((a, b) => b.percentageUsed - a.percentageUsed)[0];

    if (nearing) {
      reminders.push({
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

function pushCashFlowReminder(input: ReminderInput, reminders: Reminder[]): void {
  const balance = input.income - input.expense;
  if (balance >= 0) return;

  reminders.push({
    id: "cash-flow-negative",
    type: "cash_flow",
    severity: "warning",
    priority: 95,
    title: "Dòng tiền đang âm",
    description: `Kỳ này tiền ra cao hơn tiền vào ${Math.abs(balance).toLocaleString("vi-VN")}đ.`,
  });
}

function pushTrendReminder(input: ReminderInput, reminders: Reminder[]): void {
  if (input.previousExpense <= 0) return;

  const change = ((input.expense - input.previousExpense) / Math.abs(input.previousExpense)) * 100;
  if (change < 20) return;

  reminders.push({
    id: "expense-trend-up",
    type: "trend",
    severity: "warning",
    priority: 75,
    title: "Chi tiêu tăng đáng chú ý",
    description: `Tổng chi tăng ${change.toFixed(1)}% so với kỳ trước.`,
  });
}

function pushWalletReminders(input: ReminderInput, reminders: Reminder[]): void {
  for (const wallet of input.wallets.filter((item) => item.balance < 0).slice(0, 1)) {
    reminders.push({
      id: `wallet-negative-${wallet.walletId}`,
      type: "wallet",
      severity: "warning",
      priority: 90,
      title: `Ví ${wallet.name} đang âm`,
      description: `Số dư hiện tại của ví là ${wallet.balance.toLocaleString("vi-VN")}đ.`,
    });
  }
}

export function buildReminders(
  input: ReminderInput,
  options: ReminderEngineOptions = {},
): Reminder[] {
  const limit = Math.max(1, Math.min(options.limit ?? DEFAULT_LIMIT, MAX_LIMIT));
  const reminders: Reminder[] = [];

  pushBudgetReminders(input, reminders);
  pushCashFlowReminder(input, reminders);
  pushWalletReminders(input, reminders);
  pushTrendReminder(input, reminders);

  return reminders.sort((a, b) => b.priority - a.priority).slice(0, limit);
}
