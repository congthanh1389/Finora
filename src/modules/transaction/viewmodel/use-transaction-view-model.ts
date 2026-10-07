import { useCallback, useEffect, useMemo, useState } from "react";
import { useFocusEffect } from "expo-router";

import * as Auth from "@/lib/_core/auth";
import type { User } from "@/lib/_core/auth";
import { createTransactionDependencies } from "../transaction.factory";
import type { TransactionSummary } from "../types/transaction.types";
import type { WalletSummary } from "../../wallet/types/wallet.types";
import type { Category } from "../../../../drizzle/schema";

export function useTransactionViewModel(initialType: "income" | "expense" = "expense") {
  const [type, setType] = useState<"income" | "expense">(initialType);
  const [amount, setAmount] = useState("");
  const [walletId, setWalletId] = useState<number | null>(null);
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [note, setNote] = useState("");
  const [wallets, setWallets] = useState<WalletSummary[]>([]);
  const [transactions, setTransactions] = useState<TransactionSummary[]>([]);
  const [isLoadingWallets, setLoadingWallets] = useState(true);
  const [isCreating, setCreating] = useState(false);
  const [walletsError, setWalletsError] = useState<Error | null>(null);
  const [createError, setCreateError] = useState<Error | null>(null);
  const [, setUser] = useState<User | null>(null);

  const dependencies = useMemo(() => createTransactionDependencies(), []);


  const loadCategories = useCallback(async (userId: number, transactionType: "income" | "expense") => {
    const all = await dependencies.categoryService.listCategories(userId, transactionType);
    const matching = all.filter((item) => item.type === transactionType && item.isArchived === 0);
    setCategories(matching);
    setCategory((current) => matching.some((item) => item.name === current) ? current : "");
    return matching;
  }, [dependencies.categoryService]);

  const loadWallets = useCallback(async () => {
    try {
      setLoadingWallets(true);
      setWalletsError(null);
      const currentUser = await Auth.getUserInfo();
      setUser(currentUser);
      if (!currentUser) {
        setWallets([]);
        return;
      }
      const walletList = await dependencies.walletService.listWallets(currentUser.id);
      setWallets(walletList.filter((wallet) => !wallet.isArchived));
    } catch (err) {
      setWalletsError(err instanceof Error ? err : new Error("Không thể tải danh sách ví."));
    } finally {
      setLoadingWallets(false);
    }
  }, [dependencies.walletService]);

  useFocusEffect(
    useCallback(() => {
      void loadWallets();
    }, [loadWallets]),
  );

  useEffect(() => {
    let active = true;
    void Auth.getUserInfo().then((currentUser) => {
      if (!active || !currentUser) return;
      void loadCategories(currentUser.id, type);
    });
    return () => {
      active = false;
    };
  }, [loadCategories, type]);

  function resetForm() {
    setType(initialType);
    setAmount("");
    setWalletId(null);
    setCategory("");
    setNote("");
    setCreateError(null);
  }

  async function submit(transactionType: "income" | "expense" = type) {
    const parsedAmount = Number(amount.replace(/[^0-9]/g, ""));
    if (!Number.isSafeInteger(parsedAmount) || parsedAmount <= 0) {
      setCreateError(new Error("Vui lòng nhập số tiền hợp lệ."));
      return false;
    }

    try {
      setCreating(true);
      setCreateError(null);

      const currentUser = await Auth.getUserInfo();
      if (!currentUser) {
        throw new Error("Không tìm thấy người dùng hiện tại.");
      }

      const currentWallets = (await walletService.listWallets(currentUser.id)).filter(
        (wallet) => !wallet.isArchived,
      );
      const matchingCategories = await loadCategories(currentUser.id, transactionType);
      const selectedWalletId = walletId ?? currentWallets[0]?.id;
      if (!selectedWalletId) {
        throw new Error("Bạn cần thêm ví trước khi ghi giao dịch.");
      }

      setUser(currentUser);
      setWallets(currentWallets);

      if (!category) {
        throw new Error(
          transactionType === "income"
            ? "Vui lòng chọn nguồn thu nhập."
            : "Vui lòng chọn danh mục chi tiêu.",
        );
      }

      const transaction = await dependencies.transactionService.createTransaction({
        userId: currentUser.id,
        type: transactionType,
        amount: parsedAmount,
        walletId: selectedWalletId,
        categoryId: matchingCategories.find((item) => item.name === category)?.id ?? null,
        note: note.trim() || (transactionType === "income" ? category : null),
        occurredAt: new Date(),
      });

      setTransactions((current) => [transaction, ...current]);
      resetForm();
      return true;
    } catch (err) {
      setCreateError(err instanceof Error ? err : new Error("Không thể lưu giao dịch."));
      return false;
    } finally {
      setCreating(false);
    }
  }

  return {
    type,
    amount,
    walletId,
    category,
    note,
    wallets,
    categories,
    transactions,
    isLoadingWallets,
    walletsError,
    isCreating,
    createError,
    setType,
    setAmount,
    setWalletId,
    setCategory,
    setNote,
    submit,
    resetForm,
  };
}
