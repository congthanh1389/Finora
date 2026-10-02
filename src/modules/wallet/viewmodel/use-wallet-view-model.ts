import { useMemo, useState } from "react";

import { trpc } from "@/lib/trpc";
import type { WalletType } from "../types/wallet.types";

export function useWalletViewModel() {
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<WalletType>("cash");
  const [openingBalance, setOpeningBalance] = useState("");

  const walletsQuery = trpc.wallet.list.useQuery();
  const createWallet = trpc.wallet.create.useMutation({
    onSuccess: async () => {
      await walletsQuery.refetch();
      resetForm();
    },
  });

  const totalBalance = useMemo(
    () => (walletsQuery.data ?? []).reduce((sum, wallet) => sum + wallet.openingBalance, 0),
    [walletsQuery.data],
  );

  function resetForm() {
    setName("");
    setType("cash");
    setOpeningBalance("");
    setCreateOpen(false);
    createWallet.reset();
  }

  async function submit() {
    const balance = openingBalance.trim() ? Number(openingBalance.replace(/[,\.\s]/g, "")) : 0;
    if (!name.trim() || !Number.isSafeInteger(balance)) return;

    const input = {
      name,
      type,
      openingBalance: balance,
      currency: "VND",
    };

    await createWallet.mutateAsync(input);
  }

  return {
    wallets: walletsQuery.data ?? [],
    totalBalance,
    isLoading: walletsQuery.isLoading,
    error: walletsQuery.error,
    isCreateOpen,
    name,
    type,
    openingBalance,
    isCreating: createWallet.isPending,
    createError: createWallet.error,
    setCreateOpen,
    setName,
    setType,
    setOpeningBalance,
    submit,
    resetForm,
  };
}
