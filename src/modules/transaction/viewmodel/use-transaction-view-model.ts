import { useCallback, useEffect, useMemo, useState } from "react";
import { useFocusEffect } from "expo-router";

import * as Auth from "@/lib/_core/auth";
import type { User } from "@/lib/_core/auth";
import { DeviceTransactionRepository } from "../repository/device-transaction.repository";
import { TransactionService } from "../service/transaction.service";
import type { TransactionSummary } from "../types/transaction.types";
import type { WalletSummary } from "../../wallet/types/wallet.types";
import { DeviceWalletRepository } from "../../wallet/repository/device-wallet.repository";
import { WalletService } from "../../wallet/service/wallet.service";

export function useTransactionViewModel(initialType: "income" | "expense" = "expense") {
  const [type, setType] = useState<"income" | "expense">(initialType);
  const [amount, setAmount] = useState("");
  const [walletId, setWalletId] = useState<number | null>(null);
  const [category, setCategory] = useState(initialType === "income" ? "Lương" : "Ăn uống");
  const [note, setNote] = useState("");
  const [wallets, setWallets] = useState<WalletSummary[]>([]);
  const [transactions, setTransactions] = useState<TransactionSummary[]>([]);
  const [isLoadingWallets, setLoadingWallets] = useState(true);
  const [isCreating, setCreating] = useState(false);
  const [walletsError, setWalletsError] = useState<Error | null>(null);
  const [createError, setCreateError] = useState<Error | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const walletRepository = useMemo(() => new DeviceWalletRepository(), []);
  const walletService = useMemo(() => new WalletService(walletRepository), [walletRepository]);
  const transactionRepository = useMemo(() => new DeviceTransactionRepository(), []);
  const transactionService = useMemo(
    () => new TransactionService(transactionRepository),
    [transactionRepository],
  );

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
      setWallets(await walletService.listWallets(currentUser.id));
    } catch (err) {
      setWalletsError(err instanceof Error ? err : new Error("Không thể tải danh sách ví."));
    } finally {
      setLoadingWallets(false);
    }
  }, [walletService]);

  useEffect(() => {
    void loadWallets();
  }, [loadWallets]);

  useFocusEffect(
    useCallback(() => {
      void loadWallets();
    }, [loadWallets]),
  );

  function resetForm() {
    setType(initialType);
    setAmount("");
    setWalletId(null);
    setCategory(initialType === "income" ? "Lương" : "Ăn uống");
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

      const currentWallets = await walletService.listWallets(currentUser.id);
      const selectedWalletId = walletId ?? currentWallets[0]?.id;
      if (!selectedWalletId) {
        throw new Error("Bạn cần thêm ví trước khi ghi giao dịch.");
      }

      setUser(currentUser);
      setWallets(currentWallets);

      const transaction = await transactionService.createTransaction({
        userId: currentUser.id,
        type: transactionType,
        amount: parsedAmount,
        walletId: selectedWalletId,
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
