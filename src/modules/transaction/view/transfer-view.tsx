import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { useTransferViewModel } from "../viewmodel/use-transfer-view-model";

function formatAmount(value: string) {
  const digits = value.replace(/[^0-9]/g, "");
  return digits ? new Intl.NumberFormat("vi-VN").format(Number(digits)) : "";
}

export function TransferView() {
  const router = useRouter();
  const vm = useTransferViewModel();

  return (
    <ScreenContainer className="bg-[#F8FAFC]">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="gap-5 px-5 pt-4">
          <View className="flex-row items-center">
            <Pressable onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-full bg-white">
              <Text className="text-2xl text-[#475569]">‹</Text>
            </Pressable>
            <Text className="ml-3 flex-1 text-[24px] font-bold text-[#0F2A5F]">Chuyển tiền</Text>
          </View>

          <View className="rounded-3xl bg-white p-5">
            <Text className="text-sm font-semibold text-[#334155]">Số tiền</Text>
            <TextInput
              value={formatAmount(vm.amount)}
              onChangeText={vm.setAmount}
              placeholder="0"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              className="mt-2 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-4 text-2xl font-bold text-[#0F2A5F]"
            />
          </View>

          {(["source", "destination"] as const).map((kind) => (
            <View key={kind} className="rounded-3xl border border-[#E2E8F0] bg-white p-5">
              <Text className="text-base font-bold text-[#0F2A5F]">
                {kind === "source" ? "Ví nguồn" : "Ví nhận"}
              </Text>
              {vm.isLoading ? <ActivityIndicator className="mt-4" /> : (
                <View className="mt-3 gap-2">
                  {vm.wallets.map((wallet) => {
                    const selected = (kind === "source" ? vm.sourceWalletId : vm.destinationWalletId) === wallet.id;
                    return (
                      <Pressable
                        key={wallet.id}
                        onPress={() => kind === "source" ? vm.setSourceWalletId(wallet.id) : vm.setDestinationWalletId(wallet.id)}
                        className={"rounded-2xl border p-3 " + (selected ? "border-[#22B8A8] bg-[#E6FFFA]" : "border-[#E2E8F0]")}
                      >
                        <Text className="font-bold text-[#0F2A5F]">{wallet.name}</Text>
                        <Text className="mt-1 text-xs text-[#64748B]">
                          {wallet.currency} · Số dư {new Intl.NumberFormat("vi-VN").format(wallet.balance)} ₫
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>
          ))}

          <View className="rounded-3xl border border-[#E2E8F0] bg-white p-5">
            <Text className="text-base font-bold text-[#0F2A5F]">Ghi chú</Text>
            <TextInput
              value={vm.note}
              onChangeText={vm.setNote}
              placeholder="Ví dụ: Chuyển tiền sang ngân hàng"
              placeholderTextColor="#94A3B8"
              className="mt-3 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3.5 text-base text-[#0F172A]"
            />
          </View>

          {vm.error ? <Text className="text-sm text-[#DC2626]">{vm.error.message}</Text> : null}

          <Pressable
            disabled={vm.isCreating || vm.wallets.length < 2}
            onPress={() => void vm.submit().then((ok) => { if (ok) router.back(); })}
            style={{ backgroundColor: "#22B8A8", opacity: vm.isCreating ? 0.7 : 1 }}
            className="items-center rounded-full py-4"
          >
            {vm.isCreating ? <ActivityIndicator color="#FFFFFF" /> : <Text className="font-bold text-white">Lưu chuyển tiền</Text>}
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
