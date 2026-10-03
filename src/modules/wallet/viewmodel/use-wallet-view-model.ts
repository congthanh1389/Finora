import { useCallback, useEffect, useMemo, useState } from "react";

import * as Auth from "@/lib/_core/auth";
import type { User } from "@/lib/_core/auth";
import { DeviceTransactionRepository } from "../../transaction/repository/device-transaction.repository";
import { TransactionService } from "../../transaction/service/transaction.service";
import type { TransactionSummary } from "../../transaction/types/transaction.types";
import { DeviceWalletRepository } from "../repository/device-wallet.repository";
import { WalletService } from "../service/wallet.service";
import type { WalletType, WalletSummary } from "../types/wallet.types";

export function useWalletViewModel() {
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<WalletType>("cash");
  const [openingBalance, setOpeningBalance] = useState("");
  const [wallets, setWallets] = useState<WalletSummary[]>([]);
  const [transactions, setTransactions] = useState<TransactionSummary[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [isLoadingTransactions, setLoadingTransactions] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [createError, setCreateError] = useState<Error | null>(null);
  const [isCreating, setCreating] = useState(false);

  const repository = useMemo(() => new DeviceWalletRepository(), []);
  const service = useMemo(() => new WalletService(repository), [repository]);
  const transactionRepository = useMemo(() => new DeviceTransactionRepository(), []);
  const transactionService = useMemo(
    () => new TransactionService(transactionRepository),
    [transactionRepository],
  );

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setLoadingTransactions(true);
      setError(null);
      const currentUser = await Auth.getUserInfo();
      setUser(currentUser);
      if (!currentUser) {
        setWallets([]);
        setTransactions([]);
        return;
      }

      const [walletList, transactionList] = await Promise.all([
        service.listWallets(currentUser.id),
        transactionService.listTransactions(currentUser.id),
      ]);
      setWallets(walletList);
      setTransactions(transactionList);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load local data"));
    } finally {
      setLoading(false);
      setLoadingTransactions(false);
    }
  }, [service, transactionService]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const totalBalance = useMemo(
    () => wallets.reduce((sum, wallet) => sum + wallet.openingBalance, 0),
    [wallets],
  );

  function resetForm() {
    setName("");
    setType("cash");
    setOpeningBalance("");
    setCreateOpen(false);
    setCreateError(null);
  }

  async function submit() {
    if (!user || !name.trim()) return;
    const balance = openingBalance.trim()
      ? Number(openingBalance.replace(/[,\.\s]/g, ""))
      : 0;
    if (!Number.isSafeInteger(balance)) return;

    try {
      setCreating(true);
      setCreateError(null);
      await service.createWallet({
        userId: user.id,
        name,
        type,
        openingBalance: balance,
        currency: "VND",
      });
      await loadData();
      resetForm();
    } catch (err) {
      setCreateError(err instanceof Error ? err : new Error("Failed to create wallet"));
    } finally {
      setCreating(false);
    }
  }

  return {
    wallets,
    transactions,
    totalBalance,
    isLoading,
    isLoadingTransactions,
    error,
    isCreateOpen,
    name,
    type,
    openingBalance,
    isCreating,
    createError,
    setCreateOpen,
    setName,
    setType,
    setOpeningBalance,
    submit,
    resetForm,
    reload: loadData,
  };
}
