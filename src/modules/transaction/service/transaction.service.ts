import { TransactionRepository } from "../repository/transaction.repository";
import type { CreateTransactionInput } from "../types/transaction.types";

export class TransactionService {
  constructor(private readonly repository: TransactionRepository) {}

  listTransactions(userId: number) {
    return this.repository.list(userId);
  }

  createTransaction(input: CreateTransactionInput) {
    if (!Number.isSafeInteger(input.amount) || input.amount <= 0) {
      throw new Error("Transaction amount must be a positive integer.");
    }
    return this.repository.create(input);
  }
}
