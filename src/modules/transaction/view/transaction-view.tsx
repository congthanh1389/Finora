import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { FinoraMockupIcon, type FinoraMockupIconName } from "@/components/ui/finora-mockup-icons";
import { ScreenContainer } from "@/components/screen-container";
import { useTransactionViewModel } from "../viewmodel/use-transaction-view-model";
import { useTransferViewModel } from "../viewmodel/use-transfer-view-model";

function formatAmount(value: string) {
  const digits = value.replace(/[^0-9]/g, "");
  if (!digits) return "";
  return new Intl.NumberFormat("vi-VN").format(Number(digits));
}

type TransactionViewProps = {
  initialType?: "income" | "expense";
};

export function TransactionView({ initialType: initialTypeProp }: TransactionViewProps = {}) {
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: string }>();
  const initialType = initialTypeProp ?? (params.type === "income" ? "income" : "expense");
  const vm = useTransactionViewModel(initialType);
  const transferVm = useTransferViewModel();
  const isTransfer = params.type === "transfer";
  const isIncome = vm.type === "income";
  const options = vm.categories;

  async function save() {
    const ok = isTransfer ? await transferVm.submit() : await vm.submit(isIncome ? "income" : "expense");
    if (ok) router.back();
  }

  return (
    <ScreenContainer className="bg-[#F8FAFC]">
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="gap-5 px-5 pt-4">
          <View className="flex-row items-center">
            <Pressable onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-full bg-white">
              <Text className="text-2xl text-[#475569]">‹</Text>
            </Pressable>
            <Text className="ml-3 flex-1 text-[24px] font-bold text-[#0F2A5F]">Thêm giao dịch</Text>
          </View>

          <View className="flex-row rounded-2xl bg-[#E2E8F0] p-1">
            <Pressable onPress={() => { vm.setType("expense"); vm.setCategory(""); router.setParams({ type: "expense" }); }} style={{ backgroundColor: !isTransfer && !isIncome ? "#22B8A8" : "transparent" }} className="flex-1 rounded-xl px-2 py-3">
              <Text className={`text-center text-sm font-bold ${!isTransfer && !isIncome ? "text-white" : "text-[#64748B]"}`}>Chi tiêu</Text>
            </Pressable>
            <Pressable onPress={() => { vm.setType("income"); vm.setCategory(""); router.setParams({ type: "income" }); }} style={{ backgroundColor: !isTransfer && isIncome ? "#22B8A8" : "transparent" }} className="flex-1 rounded-xl px-2 py-3">
              <Text className={`text-center text-sm font-bold ${!isTransfer && isIncome ? "text-white" : "text-[#64748B]"}`}>Thu nhập</Text>
            </Pressable>
            <Pressable onPress={() => router.setParams({ type: "transfer" })} style={{ backgroundColor: isTransfer ? "#22B8A8" : "transparent" }} className="flex-1 rounded-xl px-2 py-3">
              <Text className={`text-center text-sm font-bold ${isTransfer ? "text-white" : "text-[#64748B]"}`}>Chuyển tiền</Text>
            </Pressable>
          </View>

          {isTransfer ? (
            <>
              <View className="items-center rounded-3xl bg-white p-6">
                <Text className="text-sm font-medium text-[#64748B]">Số tiền chuyển</Text>
                <View className="mt-2 flex-row items-center">
                  <TextInput value={formatAmount(transferVm.amount)} onChangeText={transferVm.setAmount} placeholder="0" placeholderTextColor="#CBD5E1" keyboardType="numeric" textAlign="right" className="max-w-[280px] text-[38px] font-bold text-[#0F2A5F]" />
                  <Text className="ml-2 text-xl font-bold text-[#64748B]">₫</Text>
                </View>
              </View>
              <View className="rounded-3xl border border-[#E2E8F0] bg-white p-5">
                <Text className="text-base font-bold text-[#0F2A5F]">Ví nguồn</Text>
                {transferVm.isLoading ? <ActivityIndicator className="mt-4" /> : <View className="mt-3 gap-2">{transferVm.wallets.map((wallet) => (
                  <Pressable key={wallet.id} onPress={() => transferVm.setSourceWalletId(wallet.id)} className={`flex-row items-center rounded-2xl border p-3 ${transferVm.sourceWalletId === wallet.id ? "border-[#22B8A8] bg-[#E6FFFA]" : "border-[#E2E8F0]"}`}>
                    <View className="flex-1"><Text className="font-bold text-[#0F2A5F]">{wallet.name}</Text><Text className="mt-0.5 text-xs text-[#64748B]">{wallet.currency}</Text></View>
                    <Text className="text-sm font-bold text-[#0F172A]">{new Intl.NumberFormat("vi-VN").format(wallet.balance)} ₫</Text>
                  </Pressable>
                ))}</View>}
              </View>
              <View className="rounded-3xl border border-[#E2E8F0] bg-white p-5">
                <Text className="text-base font-bold text-[#0F2A5F]">Ví nhận</Text>
                {transferVm.isLoading ? <ActivityIndicator className="mt-4" /> : <View className="mt-3 gap-2">{transferVm.wallets.map((wallet) => (
                  <Pressable key={wallet.id} onPress={() => transferVm.setDestinationWalletId(wallet.id)} className={`flex-row items-center rounded-2xl border p-3 ${transferVm.destinationWalletId === wallet.id ? "border-[#22B8A8] bg-[#E6FFFA]" : "border-[#E2E8F0]"}`}>
                    <View className="flex-1"><Text className="font-bold text-[#0F2A5F]">{wallet.name}</Text><Text className="mt-0.5 text-xs text-[#64748B]">{wallet.currency}</Text></View>
                    <Text className="text-sm font-bold text-[#0F172A]">{new Intl.NumberFormat("vi-VN").format(wallet.balance)} ₫</Text>
                  </Pressable>
                ))}</View>}
              </View>
            </>
          ) : (
            <>
            </>
          )}
          
          {isTransfer && transferVm.error ? <Text className="text-sm text-[#DC2626]">{transferVm.error.message}</Text> : null}
          {!isTransfer && vm.createError ? <Text className="text-sm text-[#DC2626]">{vm.createError.message}</Text> : null}

          <View className="mt-1 pb-2">
            <Pressable
              disabled={isTransfer ? transferVm.isCreating || transferVm.wallets.length < 2 : vm.isCreating}
              onPress={() => void save()}
              style={{ backgroundColor: "#22B8A8", opacity: (isTransfer ? transferVm.isCreating : vm.isCreating) ? 0.7 : 1 }}
              className="items-center rounded-full py-4"
            >
              {(isTransfer ? transferVm.isCreating : vm.isCreating) ? <ActivityIndicator color="#FFFFFF" /> : <Text className="font-bold text-white">{isTransfer ? "Lưu chuyển tiền" : "Lưu giao dịch"}</Text>}
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
