import { getDeviceDatabase, initializeDeviceStorage } from "../../../core/storage/device-store";
import type {
  TransactionSummaryFilter,
  TransactionSummaryResult,
} from "../types/transaction-summary.types";
import type { TransactionHistoryFilters } from "../types/transaction.types";

type SummaryRow = {
  total_amount: number | null;
  transaction_count: number;
  income_amount: number | null;
  income_count: number;
  expense_amount: number | null;
  expense_count: number;
  transfer_amount: number | null;
  transfer_count: number;
};

export class DeviceTransactionSummaryRepository {
  async getSummary(
    userId: number,
    start: Date,
    end: Date,
    filter: TransactionSummaryFilter = "all",
    filters?: TransactionHistoryFilters,
  ): Promise<TransactionSummaryResult> {
    await initializeDeviceStorage();
    const db = await getDeviceDatabase();

    const conditions = ["t.user_id = ?", "t.occurred_at >= ?", "t.occurred_at < ?"];
    const params: (string | number)[] = [userId, start.toISOString(), end.toISOString()];

    if (filter !== "all") {
      conditions.push("t.type = ?");
      params.push(filter);
    }
    if (filters?.walletId !== undefined) {
      conditions.push("(t.wallet_id = ? OR t.source_wallet_id = ? OR t.destination_wallet_id = ?)");
      params.push(filters.walletId, filters.walletId, filters.walletId);
    }
    if (filters?.categoryId !== undefined) {
      conditions.push("t.category_id = ?");
      params.push(filters.categoryId);
    }
    if (filters?.minAmount !== undefined) {
      conditions.push("t.amount >= ?");
      params.push(filters.minAmount);
    }
    if (filters?.maxAmount !== undefined) {
      conditions.push("t.amount <= ?");
      params.push(filters.maxAmount);
    }

    const row = await db.getFirstAsync<SummaryRow>(
      `SELECT
         COALESCE(SUM(t.amount), 0) AS total_amount,
         COUNT(*) AS transaction_count,
         COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) AS income_amount,
         COALESCE(SUM(CASE WHEN t.type = 'income' THEN 1 ELSE 0 END), 0) AS income_count,
         COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) AS expense_amount,
         COALESCE(SUM(CASE WHEN t.type = 'expense' THEN 1 ELSE 0 END), 0) AS expense_count,
         COALESCE(SUM(CASE WHEN t.type = 'transfer' THEN t.amount ELSE 0 END), 0) AS transfer_amount,
         COALESCE(SUM(CASE WHEN t.type = 'transfer' THEN 1 ELSE 0 END), 0) AS transfer_count
       FROM transactions t
       LEFT JOIN wallets w ON w.id = t.wallet_id AND w.user_id = t.user_id
       LEFT JOIN wallets sw ON sw.id = t.source_wallet_id AND sw.user_id = t.user_id
       LEFT JOIN wallets dw ON dw.id = t.destination_wallet_id AND dw.user_id = t.user_id
       LEFT JOIN categories c ON c.id = t.category_id AND c.user_id = t.user_id
       WHERE ${conditions.join(" AND ")}`,
      ...params,
    );

    const incomeAmount = Number(row?.income_amount ?? 0);
    const expenseAmount = Number(row?.expense_amount ?? 0);
    const transferAmount = Number(row?.transfer_amount ?? 0);

    return {
      period: { start, end },
      filter,
      totals: {
        totalAmount: Number(row?.total_amount ?? 0),
        transactionCount: Number(row?.transaction_count ?? 0),
        incomeAmount,
        incomeCount: Number(row?.income_count ?? 0),
        expenseAmount,
        expenseCount: Number(row?.expense_count ?? 0),
        transferAmount,
        transferCount: Number(row?.transfer_count ?? 0),
        netCashflow: incomeAmount - expenseAmount,
      },
    };
  }
}