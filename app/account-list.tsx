import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, FlatList, Pressable, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import * as Auth from "@/lib/_core/auth";

export default function AccountListScreen() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Auth.LocalAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setAccounts(await Auth.localGetAccounts());
    } catch (error) {
      setAccounts([]);
      setError(error instanceof Error ? error.message : "Không thể đọc danh sách tài khoản.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadAccounts(); }, [loadAccounts]));

  const handleDelete = (account: Auth.LocalAccount) => {
    Alert.alert("Xóa tài khoản", `Xóa tài khoản ${account.email}? Toàn bộ ví, giao dịch, danh mục và dữ liệu cục bộ của tài khoản này sẽ bị xóa vĩnh viễn.`, [
      { text: "Hủy", style: "cancel" },
      { text: "Xóa", style: "destructive", onPress: async () => {
        try {
          const isCurrent = (await Auth.getSessionToken()) === `local-session-${account.id}`;
          await Auth.localDeleteAccount(account.id);
          if (isCurrent) router.replace("/login" as never);
          else await loadAccounts();
        } catch (error) {
          Alert.alert("Không thể xóa", error instanceof Error ? error.message : "Đã xảy ra lỗi khi xóa tài khoản.");
        }
      }},
    ]);
  };

  return (
    <ScreenContainer className="bg-[#F8FAFC] px-5 pt-6">
      <View className="mb-5 flex-row items-center">
        <Pressable onPress={() => router.back()} className="mr-3 px-1 py-2">
          <Text className="text-base font-semibold text-[#0F2A5F]">‹ Quay lại</Text>
        </Pressable>
        <Text className="text-2xl font-bold text-[#0F2A5F]">Danh sách tài khoản</Text>
      </View>
      {loading ? <Text className="text-sm text-[#64748B]">Đang tải...</Text> : error ? (
        <View className="rounded-3xl border border-[#FECACA] bg-[#FEF2F2] p-5">
          <Text className="text-base font-semibold text-[#B91C1C]">Không thể tải danh sách tài khoản</Text>
          <Text className="mt-2 text-sm text-[#B91C1C]">{error}</Text>
          <Pressable onPress={loadAccounts} className="mt-4 self-start rounded-xl bg-[#0F2A5F] px-4 py-2 active:opacity-70">
            <Text className="font-semibold text-white">Thử lại</Text>
          </Pressable>
        </View>
      ) : accounts.length === 0 ? (
        <View className="rounded-3xl border border-[#E2E8F0] bg-white p-5">
          <Text className="text-base text-[#64748B]">Chưa có tài khoản nào được lưu.</Text>
        </View>
      ) : (
        <FlatList data={accounts} keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ gap: 10, paddingBottom: 24 }}
          renderItem={({ item }) => (
            <View className="flex-row items-center rounded-2xl border border-[#E2E8F0] bg-white p-4">
              <View className="flex-1">
                <Text className="text-base font-semibold text-[#0F172A]">{item.name || "Tài khoản Finora"}</Text>
                <Text className="mt-1 text-sm text-[#64748B]">{item.email}</Text>
              </View>
              <Pressable onPress={() => handleDelete(item)}
                className="ml-3 h-10 w-10 items-center justify-center rounded-xl bg-[#FEE2E2] active:opacity-70"
                accessibilityLabel={`Xóa tài khoản ${item.email}`}>
                <Text className="text-xl">🗑️</Text>
              </Pressable>
            </View>
          )}
        />
      )}
    </ScreenContainer>
  );
}
