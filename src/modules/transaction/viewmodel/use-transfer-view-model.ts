import { useCallback, useEffect, useMemo, useState } from "react";
import { useFocusEffect } from "expo-router";

import * as Auth from "@/lib/_core/auth";
import { createTransactionDependencies } from "../transaction.factory";
import type { WalletSummary } from "../../wallet/types/wallet.types";

export function useTransferViewModel() {
  const [amount, setAmount] = useState("");
  const [sourceWalletId, setSourceWalletId] = useState<number | null>(null);
  const [destinationWalletId, setDestinationWalletId] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [wallets, setWallets] = useState<WalletSummary[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [isCreating, setCreating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const dependencies = useMemo(() => createTransactionDependencies(), []);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const user = await Auth.getUserInfo();
      if (!user) {
        setWallets([]);
        return;
      }
      const list = (await dependencies.walletService.listWallets(user.id)).filter((wallet) => !wallet.isArchived);
      setWallets(list);
      setSourceWalletId((current) => current ?? list[0]?.id ?? null);
      setDestinationWalletId((current) => current ?? list[1]?.id ?? null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Không thể tải danh sách ví."));
    } finally {
      setLoading(false);
    }
  }, [dependencies.walletService]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  useFocusEffect(useCallback(() => {
    void load();
  }, [load]));

  async function submit() {
    const parsedAmount = Number(amount.replace(/[^0-9]/g, ""));
    if (!Number.isSafeInteger(parsedAmount) || parsedAmount <= 0) {
      setError(new Error("Vui lòng nhập số tiền hợp lệ."));
      return false;
    }
    if (!sourceWalletId || !destinationWalletId || sourceWalletId === destinationWalletId) {
      setError(new Error("Hãy chọn hai ví khác nhau."));
      return false;
    }

    try {
      setCreating(true);
      setError(null);
      const user = await Auth.getUserInfo();
      if (!user) throw new Error("Không tìm thấy người dùng hiện tại.");

      const source = wallets.find((wallet) => wallet.id === sourceWalletId);
      const destination = wallets.find((wallet) => wallet.id === destinationWalletId);
      if (!source || !destination) throw new Error("Không tìm thấy ví.");
      if (source.currency !== destination.currency) {
        throw new Error("Hai ví phải dùng cùng loại tiền.");
      }

      await dependencies.transactionService.createTransaction({
        userId: user.id,
        type: "transfer",
        amount: parsedAmount,
        walletId: null,
        sourceWalletId,
        destinationWalletId,
        categoryId: null,
        note: note.trim() || "Chuyển tiền",
        occurredAt: new Date(),
      });

      setAmount("");
      setNote("");
      await load();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Không thể chuyển tiền."));
      return false;
    } finally {
      setCreating(false);
    }
  }

  return {
    amount,
    sourceWalletId,
    destinationWalletId,
    note,
    wallets,
    isLoading,
    isCreating,
    error,
    setAmount,
    setSourceWalletId,
    setDestinationWalletId,
    setNote,
    submit,
  };
}
