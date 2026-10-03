import type { CreateTransactionInput } from "../types/transaction.types";

type TransactionServiceRepository = {
  list(userId: number): Promise<unknown[]>;
  create(input: CreateTransactionInput): Promise<unknown>;
};

export class TransactionService {
  constructor(private readonly repository: TransactionServiceRepository) {}

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
