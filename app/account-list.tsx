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
    <ScreenContainer className="bg-[#F3FAF8] px-5 pt-5">
      <View
        style={{
          backgroundColor: "#00BFA5",
          borderRadius: 28,
          paddingHorizontal: 22,
          paddingTop: 22,
          paddingBottom: 24,
          marginBottom: 22,
          overflow: "hidden",
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Quay lại"
          style={{
            alignSelf: "flex-start",
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 22,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 14,
            backgroundColor: "rgba(0, 83, 76, 0.14)",
          }}
        >
          <Text style={{ color: "#064E49", fontSize: 14, fontWeight: "700" }}>‹  Quay lại</Text>
        </TouchableOpacity>

        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={{ color: "#075E55", fontSize: 11, fontWeight: "800", letterSpacing: 1.4, marginBottom: 8 }}>
              QUẢN LÝ CÁ NHÂN
            </Text>
            <Text style={{ color: "#FFFFFF", fontSize: 27, lineHeight: 33, fontWeight: "800" }}>
              Danh sách tài khoản
            </Text>
            <Text style={{ color: "#E7FFFA", fontSize: 13, lineHeight: 19, marginTop: 8 }}>
              Quản lý các tài khoản đã lưu trên thiết bị của bạn.
            </Text>
          </View>
          <View
            style={{
              width: 54,
              height: 54,
              borderRadius: 19,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(255,255,255,0.22)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.35)",
            }}
          >
            <Text style={{ fontSize: 27 }}>👥</Text>
          </View>
        </View>

        {!loading && !error && (
          <View
            style={{
              alignSelf: "flex-start",
              flexDirection: "row",
              alignItems: "center",
              marginTop: 18,
              paddingHorizontal: 12,
              paddingVertical: 7,
              borderRadius: 20,
              backgroundColor: "rgba(0, 83, 76, 0.14)",
            }}
          >
            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: "#FFFFFF", marginRight: 8 }} />
            <Text style={{ color: "#064E49", fontSize: 12, fontWeight: "700" }}>
              {accounts.length} tài khoản đã lưu
            </Text>
          </View>
        )}
      </View>

      <View style={{ flex: 1 }}>
        <View style={{ marginBottom: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ color: "#123B3A", fontSize: 18, fontWeight: "800" }}>Tài khoản của bạn</Text>
          <View style={{ width: 34, height: 4, borderRadius: 3, backgroundColor: "#00BFA5" }} />
        </View>

        {loading ? (
          <View style={{ alignItems: "center", borderRadius: 22, borderWidth: 1, borderColor: "#D9EFEB", backgroundColor: "#FFFFFF", paddingVertical: 28, paddingHorizontal: 20 }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: "#527371" }}>Đang tải danh sách tài khoản...</Text>
          </View>
        ) : error ? (
          <View style={{ borderRadius: 22, borderWidth: 1, borderColor: "#FECACA", backgroundColor: "#FFF7F7", padding: 20 }}>
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
          <View style={{ alignItems: "center", borderRadius: 24, borderWidth: 1, borderColor: "#D9EFEB", backgroundColor: "#FFFFFF", paddingHorizontal: 24, paddingVertical: 30 }}>
            <View style={{ width: 62, height: 62, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: "#DDF8F2", marginBottom: 14 }}>
              <Text style={{ fontSize: 28 }}>👤</Text>
            </View>
            <Text style={{ textAlign: "center", fontSize: 16, fontWeight: "800", color: "#123B3A" }}>Chưa có tài khoản nào</Text>
            <Text style={{ textAlign: "center", marginTop: 7, fontSize: 13, lineHeight: 19, color: "#66817F" }}>
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
                  borderColor: "#DDEEEB",
                  backgroundColor: "#FFFFFF",
                  padding: 15,
                  shadowColor: "#0B4F49",
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
                    backgroundColor: "#DDF8F2",
                    marginRight: 13,
                  }}
                >
                  <Text style={{ fontSize: 19, fontWeight: "800", color: "#007F73" }}>
                    {(item.name || item.email || "F").trim().charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text numberOfLines={1} style={{ fontSize: 15, fontWeight: "800", color: "#163B39" }}>
                    {item.name || "Tài khoản Finora"}
                  </Text>
                  <Text numberOfLines={2} style={{ marginTop: 4, fontSize: 12, lineHeight: 17, color: "#66817F" }}>
                    {item.email}
                  </Text>
                  <View style={{ alignSelf: "flex-start", flexDirection: "row", alignItems: "center", marginTop: 9, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 10, backgroundColor: "#E8F8F4" }}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#00A88F", marginRight: 6 }} />
                    <Text style={{ fontSize: 10, fontWeight: "700", color: "#087568" }}>Đã lưu trên thiết bị</Text>
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
