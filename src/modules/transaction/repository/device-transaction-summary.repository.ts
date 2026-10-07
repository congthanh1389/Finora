import { getDeviceDatabase, initializeDeviceStorage } from "../../../core/storage/device-store";
import type { TransactionType } from "../types/transaction.types";
import type {
  TransactionSummaryFilter,
  TransactionSummaryResult,
} from "../types/transaction-summary.types";

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
  ): Promise<TransactionSummaryResult> {
    await initializeDeviceStorage();
    const db = await getDeviceDatabase();

    const typeClause = filter === "all" ? "" : " AND type = ?";
    const params: Array<string | number> = [userId, start.toISOString(), end.toISOString()];
    if (filter !== "all") params.push(filter);

    const row = await db.getFirstAsync<SummaryRow>(
      `SELECT
         COALESCE(SUM(amount), 0) AS total_amount,
         COUNT(*) AS transaction_count,
         COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS income_amount,
         SUM(CASE WHEN type = 'income' THEN 1 ELSE 0 END) AS income_count,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expense_amount,
         SUM(CASE WHEN type = 'expense' THEN 1 ELSE 0 END) AS expense_count,
         COALESCE(SUM(CASE WHEN type = 'transfer' THEN amount ELSE 0 END), 0) AS transfer_amount,
         SUM(CASE WHEN type = 'transfer' THEN 1 ELSE 0 END) AS transfer_count
       FROM transactions
       WHERE user_id = ?
         AND occurred_at >= ?
         AND occurred_at < ?${typeClause}`,
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