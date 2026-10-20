import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, FlatList, Text, TouchableOpacity, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { FinoraProfilePageHeader } from "@/components/ui/finora-profile-page-header";
import * as Auth from "@/lib/_core/auth";

export default function AccountListScreen() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Auth.LocalAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingAccountId, setDeletingAccountId] = useState<number | null>(null);

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
      "Xóa tài khoản khỏi thiết bị?",
      `Xóa tài khoản ${account.email} và toàn bộ dữ liệu tài chính được lưu cục bộ của tài khoản này (ví, giao dịch, danh mục và ngân sách)? Thao tác này không thể hoàn tác.`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa tài khoản và dữ liệu",
          style: "destructive",
          onPress: async () => {
            if (deletingAccountId !== null) return;
            setDeletingAccountId(Number(account.id));
            let stage = "check auth functions";
            try {
              // Guard each imported function so an undefined export is reported by name.
              if (typeof Auth.getSessionToken !== "function") {
                throw new Error("Auth.getSessionToken không khả dụng trong bundle đang chạy.");
              }
              if (typeof Auth.localRemoveSavedAccount !== "function") {
                throw new Error("Auth.localRemoveSavedAccount không khả dụng trong bundle đang chạy.");
              }

              stage = "check current session";
              const isCurrent = (await Auth.getSessionToken()) === `local-session-${Number(account.id)}`;

              stage = "delete account and local financial data";
              await Auth.localRemoveSavedAccount(Number(account.id));

              if (isCurrent) {
                stage = "navigate to login";
                router.replace("/login" as never);
                return;
              }

              stage = "reload account list";
              await loadAccounts();
            } catch (deleteError) {
              const detail = deleteError instanceof Error ? deleteError.message : String(deleteError);
              const stack = deleteError instanceof Error ? deleteError.stack : undefined;
              const message = `Lỗi tại bước "${stage}": ${detail}`;
              console.error("[AccountList] Failed to remove saved account", {
                accountId: account.id,
                stage,
                message,
                stack,
                error: deleteError,
              });
              Alert.alert("Không thể xóa tài khoản", message);
            } finally {
              setDeletingAccountId(null);
            }
          },
        },
      ],
    );
  };

  return (
    <ScreenContainer className="bg-[#EAF9F4] px-[18px] pt-[10px]">
      <FinoraProfilePageHeader title="Danh sách tài khoản" onBack={() => router.back()} onSettings={() => router.push("/(tabs)/settings" as never)} />

      <View style={{ flex: 1 }}>
        <View style={{ marginBottom: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ color: "#164F4B", fontSize: 18, fontWeight: "800" }}>Tài khoản của bạn</Text>
          {!loading && !error ? (
            <View style={{ flexDirection: "row", alignItems: "center", borderRadius: 16, backgroundColor: "#E8F8F2", paddingHorizontal: 10, paddingVertical: 6 }}>
              <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: "#159B70", marginRight: 7 }} />
              <Text style={{ color: "#08665D", fontSize: 11, fontWeight: "800" }}>{accounts.length} đã lưu</Text>
            </View>
          ) : null}
        </View>

        {loading ? (
          <View style={{ alignItems: "center", borderRadius: 25, borderWidth: 1, borderColor: "#E0F4ED", backgroundColor: "#FFFFFF", paddingVertical: 28, paddingHorizontal: 20 }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: "#718C8A" }}>Đang tải danh sách tài khoản...</Text>
          </View>
        ) : error ? (
          <View style={{ borderRadius: 25, borderWidth: 1, borderColor: "#FECACA", backgroundColor: "#FFF7F7", padding: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: "800", color: "#B91C1C" }}>Không thể tải danh sách tài khoản</Text>
            <Text style={{ marginTop: 8, fontSize: 13, lineHeight: 19, color: "#B91C1C" }}>{error}</Text>
            <TouchableOpacity
              onPress={loadAccounts}
              activeOpacity={0.8}
              style={{ marginTop: 16, alignSelf: "flex-start", borderRadius: 13, backgroundColor: "#007F73", paddingHorizontal: 17, paddingVertical: 11 }}
            >
              <Text style={{ fontWeight: "700", color: "#FFFFFF" }}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : accounts.length === 0 ? (
          <View style={{ alignItems: "center", borderRadius: 26, borderWidth: 1, borderColor: "#E0F4ED", backgroundColor: "#FFFFFF", paddingHorizontal: 24, paddingVertical: 30 }}>
            <View style={{ width: 62, height: 62, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: "#E8F8F2", marginBottom: 14 }}>
              <Text style={{ fontSize: 28 }}>👤</Text>
            </View>
            <Text style={{ textAlign: "center", fontSize: 16, fontWeight: "800", color: "#164F4B" }}>Chưa có tài khoản nào</Text>
            <Text style={{ textAlign: "center", marginTop: 7, fontSize: 13, lineHeight: 19, color: "#718C8A" }}>
              Các tài khoản đã lưu trên thiết bị sẽ xuất hiện tại đây.
            </Text>
          </View>
        ) : (
          <FlatList
            data={accounts}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  borderRadius: 22,
                  borderWidth: 1,
                  borderColor: "#E0F4ED",
                  backgroundColor: "#FFFFFF",
                  padding: 15,
                  shadowColor: "#187D6A",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.05,
                  shadowRadius: 10,
                  elevation: 2,
                }}
              >
                <View
                  style={{
                    width: 49,
                    height: 49,
                    borderRadius: 17,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#E8F8F2",
                    marginRight: 13,
                  }}
                >
                  <Text style={{ fontSize: 19, fontWeight: "800", color: "#08665D" }}>
                    {(item.name || item.email || "F").trim().charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text numberOfLines={1} style={{ fontSize: 15, fontWeight: "800", color: "#164F4B" }}>
                    {item.name || "Tài khoản Finora"}
                  </Text>
                  <Text numberOfLines={2} style={{ marginTop: 4, fontSize: 12, lineHeight: 17, color: "#718C8A" }}>
                    {item.email}
                  </Text>
                  <View style={{ alignSelf: "flex-start", flexDirection: "row", alignItems: "center", marginTop: 9, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 10, backgroundColor: "#EFFAF6" }}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#159B70", marginRight: 6 }} />
                    <Text style={{ fontSize: 10, fontWeight: "700", color: "#08665D" }}>Đã lưu trên thiết bị</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => handleDelete(item)}
                  disabled={deletingAccountId !== null}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel={`Xóa tài khoản ${item.email} và dữ liệu tài chính cục bộ`}
                  style={{
                    marginLeft: 10,
                    height: 42,
                    width: 42,
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 15,
                    backgroundColor: deletingAccountId === Number(item.id) ? "#CBD5E1" : "#FFF0F0",
                    borderWidth: 1,
                    borderColor: deletingAccountId === Number(item.id) ? "#CBD5E1" : "#FFE0E0",
                    opacity: deletingAccountId !== null && deletingAccountId !== Number(item.id) ? 0.5 : 1,
                  }}
                >
                  <Text style={{ fontSize: 18 }}>{deletingAccountId === Number(item.id) ? "…" : "🗑️"}</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </View>
    </ScreenContainer>
  );
}
