import { buildSuggestions } from "../engine/suggestion-engine";
import type { Suggestion, SuggestionEngineOptions } from "../model/suggestion.types";
import type { ReportSnapshot } from "@/src/modules/report/model/report.types";

export class SuggestionService {
  getSuggestions(
    snapshot: ReportSnapshot,
    options: SuggestionEngineOptions = {},
  ): Suggestion[] {
    return buildSuggestions(
      {
        income: snapshot.summary.income,
        expense: snapshot.summary.expense,
        previousIncome: snapshot.previous.income,
        previousExpense: snapshot.previous.expense,
        savingsRate: snapshot.summary.savingsRate,
        previousSavingsRate: snapshot.previous.savingsRate,
        categories: snapshot.categories,
        budgets: snapshot.budgets,
        wallets: snapshot.wallets.map((wallet) => ({
          walletId: wallet.walletId,
          name: wallet.name,
          expense: wallet.amount,
          balance: wallet.balance,
        })),
      },
      options,
    );
  }
}
