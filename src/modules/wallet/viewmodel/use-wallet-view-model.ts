import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";
import { useFocusEffect } from "expo-router";

import * as Auth from "@/lib/_core/auth";
import type { User } from "@/lib/_core/auth";
import { DeviceWalletRepository } from "../repository/device-wallet.repository";
import { WalletService } from "../service/wallet.service";
import type { WalletType, WalletSummary } from "../types/wallet.types";

export function useWalletViewModel() {
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<WalletType>("cash");
  const [openingBalance, setOpeningBalance] = useState("");
  const [wallets, setWallets] = useState<WalletSummary[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setLoading] = useState(true);
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

  const loadWallets = useCallback(async (userId: number) => {
    const walletList = await service.listWallets(userId);
    setWallets(walletList);
  }, [service]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const currentUser = await Auth.getUserInfo();
      setUser(currentUser);
      if (!currentUser) {
        setWallets([]);
        return;
      }

      await loadWallets(currentUser.id);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load local data"));
    } finally {
      setLoading(false);
    }
  }, [loadWallets]);

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData]),
  );

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
      await loadWallets(user.id);
      closeEdit();
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to update wallet"));
    } finally {
      setSavingEdit(false);
    }
  }

  async function deleteArchivedWallet(wallet: WalletSummary) {
    if (!user || !wallet.isArchived) return;
    Alert.alert(
      "Xóa ví vĩnh viễn?",
      `Ví "${wallet.name}" sẽ bị xóa khỏi thiết bị. Ví có giao dịch sẽ không thể xóa để bảo toàn lịch sử.`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa ví",
          style: "destructive",
          onPress: () => {
            void (async () => {
              try {
                await service.deleteArchivedWallet(user.id, wallet.id);
                setWallets((current) => current.filter((item) => item.id !== wallet.id));
              } catch (err) {
                setError(err instanceof Error ? err : new Error("Không thể xóa ví."));
              }
            })();
          },
        },
      ],
    );
  }

  async function restoreWallet(wallet: WalletSummary) {
    if (!user || !wallet.isArchived) return;
    try {
      const restoredWallet = await service.restoreWallet(user.id, wallet.id);
      setWallets((current) =>
        current.map((currentWallet) =>
          currentWallet.id === restoredWallet.id ? restoredWallet : currentWallet,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to restore wallet"));
    }
  }

  async function archiveWallet(wallet: WalletSummary) {
    if (!user || wallet.isArchived) return;
    try {
      await service.archiveWallet(user.id, wallet.id);
      await loadWallets(user.id);
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
      const createdWallet = await service.createWallet({
        userId: user.id,
        name,
        type,
        openingBalance: balance,
        currency: "VND",
      });
      setWallets((current) => [createdWallet, ...current]);
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
    totalBalance,
    isLoading,
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
    restoreWallet,
    deleteArchivedWallet,
    setName,
    setType,
    setOpeningBalance,
    submit,
    resetForm,
    reload: loadData,
  };
}
