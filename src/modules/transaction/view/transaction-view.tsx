import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";

import { FinoraMockupIcon } from "@/components/ui/finora-mockup-icons";
import { ScreenContainer } from "@/components/screen-container";
import { useTransactionViewModel } from "../viewmodel/use-transaction-view-model";

const categories = [
  { label: "Ăn uống", icon: "cat_food" },
  { label: "Mua sắm", icon: "cat_shopping" },
  { label: "Khác", icon: "01_finance_wallet" },
] as const;

function formatAmount(value: string) {
  const digits = value.replace(/[^0-9]/g, "");
  if (!digits) return "";
  return new Intl.NumberFormat("vi-VN").format(Number(digits));
}

export function TransactionView() {
  const router = useRouter();
  const vm = useTransactionViewModel();

  async function save() {
    const ok = await vm.submit();
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
            <Pressable onPress={() => vm.setType("expense")} className={`flex-1 rounded-xl px-4 py-3 ${vm.type === "expense" ? "bg-white" : ""}`}>
              <Text className={`text-center font-bold ${vm.type === "expense" ? "text-[#E11D48]" : "text-[#64748B]"}`}>Chi tiêu</Text>
            </Pressable>
            <Pressable onPress={() => vm.setType("income")} className={`flex-1 rounded-xl px-4 py-3 ${vm.type === "income" ? "bg-white" : ""}`}>
              <Text className={`text-center font-bold ${vm.type === "income" ? "text-[#059669]" : "text-[#64748B]"}`}>Thu nhập</Text>
            </Pressable>
          </View>

          <View className="items-center rounded-3xl bg-white p-6">
            <Text className="text-sm font-medium text-[#64748B]">Số tiền</Text>
            <View className="mt-2 flex-row items-center">
              <TextInput
                value={formatAmount(vm.amount)}
                onChangeText={vm.setAmount}
                placeholder="0"
                placeholderTextColor="#CBD5E1"
                keyboardType="numeric"
                textAlign="right"
                className="max-w-[280px] text-[38px] font-bold text-[#0F2A5F]"
              />
              <Text className="ml-2 text-xl font-bold text-[#64748B]">₫</Text>
            </View>
          </View>

          <View className="rounded-3xl border border-[#E2E8F0] bg-white p-5">
            <Text className="text-base font-bold text-[#0F2A5F]">Danh mục</Text>
            <View className="mt-3 flex-row gap-2">
              {categories.map((item) => (
                <Pressable
                  key={item.label}
                  onPress={() => vm.setCategory(item.label)}
                  className={`flex-1 items-center rounded-2xl border p-3 ${vm.category === item.label ? "border-[#22B8A8] bg-[#E6FFFA]" : "border-[#E2E8F0]"}`}
                >
                  <FinoraMockupIcon name={item.icon} size={34} />
                  <Text className="mt-2 text-xs font-semibold text-[#334155]">{item.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View className="rounded-3xl border border-[#E2E8F0] bg-white p-5">
            <Text className="text-base font-bold text-[#0F2A5F]">Ví</Text>
            {vm.isLoadingWallets ? (
              <ActivityIndicator className="mt-4" />
            ) : vm.wallets.length === 0 ? (
              <Text className="mt-3 text-sm text-[#64748B]">Bạn cần thêm ví trước khi ghi giao dịch.</Text>
            ) : (
              <View className="mt-3 gap-2">
                {vm.wallets.map((wallet) => (
                  <Pressable
                    key={wallet.id}
                    onPress={() => vm.setWalletId(wallet.id)}
                    className={`flex-row items-center rounded-2xl border p-3 ${(vm.walletId ?? vm.wallets[0]?.id) === wallet.id ? "border-[#22B8A8] bg-[#E6FFFA]" : "border-[#E2E8F0]"}`}
                  >
                    <FinoraMockupIcon name="01_finance_wallet" size={34} />
                    <View className="ml-3 flex-1">
                      <Text className="font-bold text-[#0F2A5F]">{wallet.name}</Text>
                      <Text className="mt-0.5 text-xs text-[#64748B]">{wallet.currency}</Text>
                    </View>
                    <Text className="text-sm font-bold text-[#0F172A]">{new Intl.NumberFormat("vi-VN").format(wallet.openingBalance)} ₫</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          <View className="rounded-3xl border border-[#E2E8F0] bg-white p-5">
            <Text className="text-base font-bold text-[#0F2A5F]">Ghi chú</Text>
            <TextInput
              value={vm.note}
              onChangeText={vm.setNote}
              placeholder="Ví dụ: Cơm trưa với đồng nghiệp"
              placeholderTextColor="#94A3B8"
              multiline
              className="mt-3 min-h-[90px] rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-base text-[#0F172A]"
            />
          </View>

          {vm.createError ? <Text className="text-sm text-[#DC2626]">Không thể lưu giao dịch. Vui lòng thử lại.</Text> : null}

          <Pressable
            disabled={vm.isCreating || vm.wallets.length === 0 || !vm.amount.replace(/[^0-9]/g, "")}
            onPress={() => void save()}
            className={`items-center rounded-full py-4 ${vm.isCreating || vm.wallets.length === 0 || !vm.amount.replace(/[^0-9]/g, "") ? "bg-[#CBD5E1]" : "bg-[#22B8A8]"}`}
          >
            {vm.isCreating ? <ActivityIndicator color="#FFFFFF" /> : <Text className="font-bold text-white">Lưu giao dịch</Text>}
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
