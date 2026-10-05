import { useCallback, useEffect, useMemo, useState } from "react";
import { DeviceEventEmitter } from "react-native";
import { useFocusEffect } from "expo-router";

import * as Auth from "@/lib/_core/auth";
import type { User } from "@/lib/_core/auth";
import { DEVICE_TRANSACTIONS_CHANGED_EVENT } from "../../../core/storage/device-store";
import { DeviceTransactionRepository } from "../../transaction/repository/device-transaction.repository";
import { TransactionService } from "../../transaction/service/transaction.service";
import type { TransactionSummary } from "../../transaction/types/transaction.types";
import { DeviceWalletRepository } from "../repository/device-wallet.repository";
import { WalletService } from "../service/wallet.service";
import { CategoryRepository } from "../../category/repository/category.repository";
import type { WalletType, WalletSummary } from "../types/wallet.types";

export function useWalletViewModel() {
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<WalletType>("cash");
  const [openingBalance, setOpeningBalance] = useState("");
  const [wallets, setWallets] = useState<WalletSummary[]>([]);
  const [transactions, setTransactions] = useState<TransactionSummary[]>([]);
  const [categories, setCategories] = useState<Awaited<ReturnType<CategoryRepository["listByUser"]>>>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [isLoadingTransactions, setLoadingTransactions] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [createError, setCreateError] = useState<Error | null>(null);
  const [isCreating, setCreating] = useState(false);
  const [editingWallet, setEditingWallet] = useState<WalletSummary | null>(null);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState<WalletType>("cash");
  const [editAllowNegative, setEditAllowNegative] = useState(false);
  const [isSavingEdit, setSavingEdit] = useState(false);

  const repository = useMemo(() => new DeviceWalletRepository(), []);
  const service = useMemo(() => new WalletService(repository), [repository]);
  const transactionRepository = useMemo(() => new DeviceTransactionRepository(), []);
  const transactionService = useMemo(
    () => new TransactionService(transactionRepository),
    [transactionRepository],
  );
  const categoryRepository = useMemo(() => new CategoryRepository(), []);

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

      const [walletList, transactionList, categoryList] = await Promise.all([
        service.listWallets(currentUser.id),
        transactionService.listTransactions(currentUser.id),
        categoryRepository.listByUser(currentUser.id),
      ]);
      setWallets(walletList);
      setTransactions(transactionList);
      setCategories(categoryList);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load local data"));
    } finally {
      setLoading(false);
      setLoadingTransactions(false);
    }
  }, [service, transactionService, categoryRepository]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadData();
  }, [loadData]);

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData]),
  );

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      DEVICE_TRANSACTIONS_CHANGED_EVENT,
      () => {
        void loadData();
      },
    );

    return () => subscription.remove();
  }, [loadData]);

  const activeWallets = useMemo(() => wallets.filter((wallet) => !wallet.isArchived), [wallets]);
  const archivedWallets = useMemo(() => wallets.filter((wallet) => wallet.isArchived), [wallets]);
  const totalBalance = useMemo(
    () => activeWallets.reduce((sum, wallet) => sum + wallet.balance, 0),
    [activeWallets],
  );

  function openEdit(wallet: WalletSummary) {
    setEditingWallet(wallet);
    setEditName(wallet.name);
    setEditType(wallet.type);
    setEditAllowNegative(wallet.allowNegative);
  }

  function closeEdit() {
    setEditingWallet(null);
    setEditName("");
    setEditType("cash");
    setEditAllowNegative(false);
  }

  async function saveEdit() {
    if (!user || !editingWallet || !editName.trim()) return;
    try {
      setSavingEdit(true);
      await service.updateWallet(user.id, editingWallet.id, {
        name: editName,
        type: editType,
        allowNegative: editAllowNegative,
      });
      await loadData();
      closeEdit();
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to update wallet"));
    } finally {
      setSavingEdit(false);
    }
  }

  async function archiveWallet(wallet: WalletSummary) {
    if (!user || wallet.isArchived) return;
    try {
      await service.archiveWallet(user.id, wallet.id);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to archive wallet"));
    }
  }

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
    activeWallets,
    archivedWallets,
    transactions,
    categories,
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
    editingWallet,
    editName,
    editType,
    editAllowNegative,
    isSavingEdit,
    setCreateOpen,
    setEditName,
    setEditType,
    setEditAllowNegative,
    openEdit,
    closeEdit,
    saveEdit,
    archiveWallet,
    setName,
    setType,
    setOpeningBalance,
    submit,
    resetForm,
    reload: loadData,
  };
}
