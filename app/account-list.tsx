import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, FlatList, Text, TouchableOpacity, View } from "react-native";
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
    Alert.alert(
      "Gỡ tài khoản đã lưu",
      `Gỡ tài khoản ${account.email} khỏi danh sách đăng nhập đã lưu trên thiết bị? Ví, giao dịch, danh mục và ngân sách sẽ được giữ nguyên. Bạn sẽ cần đăng nhập lại để thêm tài khoản này vào danh sách.`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              const isCurrent = (await Auth.getSessionToken()) === `local-session-${account.id}`;
              await Auth.localRemoveSavedAccount(account.id);
              if (isCurrent) {
                router.replace("/login" as never);
                return;
              }
              await loadAccounts();
            } catch (error) {
              Alert.alert("Không thể gỡ tài khoản", error instanceof Error ? error.message : "Đã xảy ra lỗi khi gỡ tài khoản.");
            }
          },
        },
      ],
    );
  };

  return (
    <ScreenContainer className="bg-[#F8FAFC] px-5 pt-6">
      <View className="mb-5 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8} style={{ marginRight: 12, paddingVertical: 8, paddingHorizontal: 4 }}>
          <Text style={{ fontSize: 16, fontWeight: "600", color: "#0F2A5F" }}>‹ Quay lại</Text>
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-[#0F2A5F]">Danh sách tài khoản</Text>
      </View>
      {loading ? <Text className="text-sm text-[#64748B]">Đang tải...</Text> : error ? (
        <View className="rounded-3xl border border-[#FECACA] bg-[#FEF2F2] p-5">
          <Text className="text-base font-semibold text-[#B91C1C]">Không thể tải danh sách tài khoản</Text>
          <Text className="mt-2 text-sm text-[#B91C1C]">{error}</Text>
          <TouchableOpacity onPress={loadAccounts} activeOpacity={0.8} style={{ marginTop: 16, alignSelf: "flex-start", borderRadius: 12, backgroundColor: "#0F2A5F", paddingHorizontal: 16, paddingVertical: 8 }}>
            <Text style={{ fontWeight: "600", color: "#FFFFFF" }}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : accounts.length === 0 ? (
        <View className="rounded-3xl border border-[#E2E8F0] bg-white p-5">
          <Text className="text-base text-[#64748B]">Chưa có tài khoản nào được lưu.</Text>
        </View>
      ) : (
        <FlatList
          data={accounts}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ gap: 10, paddingBottom: 24 }}
          renderItem={({ item }) => (
            <View className="flex-row items-center rounded-2xl border border-[#E2E8F0] bg-white p-4">
              <View className="flex-1">
                <Text className="text-base font-semibold text-[#0F172A]">{item.name || "Tài khoản Finora"}</Text>
                <Text className="mt-1 text-sm text-[#64748B]">{item.email}</Text>
              </View>
              <TouchableOpacity
                onPress={() => handleDelete(item)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={`Gỡ tài khoản ${item.email} khỏi danh sách đã lưu`}
                style={{ marginLeft: 12, height: 40, width: 40, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: "#FEE2E2" }}
              >
                <Text style={{ fontSize: 20 }}>🗑️</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </ScreenContainer>
  );
}
