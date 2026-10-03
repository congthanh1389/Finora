import { useCallback, useEffect, useMemo, useState } from "react";

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

  const repository = useMemo(() => new DeviceWalletRepository(), []);
  const service = useMemo(() => new WalletService(repository), [repository]);

  const loadWallets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const currentUser = await Auth.getUserInfo();
      setUser(currentUser);
      if (!currentUser) {
        setWallets([]);
        return;
      }
      setWallets(await service.listWallets(currentUser.id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load wallets"));
    } finally {
      setLoading(false);
    }
  }, [service]);

  useEffect(() => {
    void loadWallets();
  }, [loadWallets]);

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
      await loadWallets();
      resetForm();
    } catch (err) {
      setCreateError(err instanceof Error ? err : new Error("Failed to create wallet"));
    } finally {
      setCreating(false);
    }
  }

  return {
    wallets,
    totalBalance,
    isLoading,
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
  };
}
