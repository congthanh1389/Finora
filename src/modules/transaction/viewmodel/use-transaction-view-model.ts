import { useState } from "react";

import { trpc } from "@/lib/trpc";

export function useTransactionViewModel() {
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [walletId, setWalletId] = useState<number | null>(null);
  const [category, setCategory] = useState("Ăn uống");
  const [note, setNote] = useState("");

  const walletsQuery = trpc.wallet.list.useQuery();
  const createTransaction = trpc.transaction.create.useMutation();

  const wallets = walletsQuery.data ?? [];

  function resetForm() {
    setType("expense");
    setAmount("");
    setWalletId(null);
    setCategory("Ăn uống");
    setNote("");
    createTransaction.reset();
  }

  async function submit() {
    const parsedAmount = Number(amount.replace(/[^0-9]/g, ""));
    const selectedWalletId = walletId ?? wallets[0]?.id;
    if (!selectedWalletId || !Number.isSafeInteger(parsedAmount) || parsedAmount <= 0) return false;

    await createTransaction.mutateAsync({
      type,
      amount: parsedAmount,
      walletId: selectedWalletId,
      note: note.trim() || null,
    });
    return true;
  }

  return {
    type,
    amount,
    walletId,
    category,
    note,
    wallets,
    isLoadingWallets: walletsQuery.isLoading,
    walletsError: walletsQuery.error,
    isCreating: createTransaction.isPending,
    createError: createTransaction.error,
    setType,
    setAmount,
    setWalletId,
    setCategory,
    setNote,
    submit,
    resetForm,
  };
}
