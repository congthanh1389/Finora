import { buildReminders } from "../engine/reminder-engine";
import type { Reminder, ReminderEngineOptions } from "../model/reminder.types";
import type { ReportSnapshot } from "@/src/modules/report/model/report.types";

export class ReminderService {
  getReminders(
    snapshot: ReportSnapshot,
    options: ReminderEngineOptions = {},
  ): Reminder[] {
    return buildReminders(
      {
        income: snapshot.summary.income,
        expense: snapshot.summary.expense,
        previousExpense: snapshot.previous.expense,
        budgets: snapshot.budgets,
        wallets: snapshot.wallets.map((wallet) => ({
          walletId: wallet.walletId,
          name: wallet.name,
          balance: wallet.balance,
        })),
      },
      options,
    );
  }
}
