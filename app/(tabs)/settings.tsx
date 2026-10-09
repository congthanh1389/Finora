import { useRouter } from "expo-router";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/hooks/use-auth";
import { clearDeviceFinancialData } from "@/src/core/storage/device-store";

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace("/login" as never);
  };

  const handleClearFinancialData = () => {
    if (!user?.id) {
      Alert.alert("Chưa có tài khoản", "Vui lòng đăng nhập trước khi xóa dữ liệu tài chính.");
      return;
    }

    Alert.alert(
      "Xóa dữ liệu tài chính?",
      "Toàn bộ giao dịch, ví, danh mục và ngân sách sẽ bị xóa. Tài khoản đăng nhập vẫn được giữ lại.",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa dữ liệu",
          style: "destructive",
          onPress: () => {
            void clearDeviceFinancialData(user.id)
              .then(() => Alert.alert("Đã xóa", "Dữ liệu tài chính đã được xóa."))
              .catch((error) => Alert.alert("Không thể xóa", error instanceof Error ? error.message : "Đã xảy ra lỗi."));
          },
        },
      ],
    );
  };

  return (
    <ScreenContainer className="bg-[#F8FAFC] px-5 pt-6">
      <View className="rounded-3xl border border-[#E2E8F0] bg-white p-5">
        <Text className="text-2xl font-bold text-[#0F2A5F]">Cài đặt</Text>
        <Text className="mt-2 text-sm text-[#64748B]">Quản lý tài khoản và các thiết lập của Finora.</Text>

        <Text className="mt-6 text-sm font-semibold text-[#475569]">Tài khoản hiện tại</Text>
        <Text className="mt-1 text-base font-medium text-[#0F172A]">
          {user?.email ?? "Chưa có thông tin tài khoản"}
        </Text>

        {user?.loginMethod === "local-password" ? (
          <TouchableOpacity
            onPress={() => router.push("/change-password" as never)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Đổi mật khẩu đăng nhập"
            style={{
              marginTop: 16,
              minHeight: 54,
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 14,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: "#D1FAE5",
              backgroundColor: "#F0FDF4",
            }}
          >
            <Feather name="key" size={20} color="#138363" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ fontSize: 15, fontWeight: "700", color: "#172033" }}>Đổi mật khẩu đăng nhập</Text>
              <Text style={{ marginTop: 3, fontSize: 12, color: "#64748B" }}>Cập nhật mật khẩu cho tài khoản này</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#94A3B8" />
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          onPress={() => router.push("/category" as never)}
          activeOpacity={0.8}
          style={{
            marginTop: 24,
            height: 48,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "#CBD5E1",
            backgroundColor: "#FFFFFF",
          }}
          accessibilityRole="button"
          accessibilityLabel="Quản lý danh mục"
        >
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#0F2A5F" }}>
            Danh mục chi tiêu & nguồn thu
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/account-list" as never)}
          activeOpacity={0.8}
          style={{
            marginTop: 24,
            height: 48,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "#CBD5E1",
            backgroundColor: "#FFFFFF",
          }}
          accessibilityRole="button"
          accessibilityLabel="Danh sách tài khoản"
        >
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#0F2A5F" }}>
            Danh sách tài khoản
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleClearFinancialData}
          activeOpacity={0.8}
          style={{
            marginTop: 24,
            height: 48,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "#FCA5A5",
            backgroundColor: "#FFF1F2",
          }}
          accessibilityRole="button"
          accessibilityLabel="Xóa dữ liệu tài chính"
        >
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#B91C1C" }}>
            Xóa dữ liệu tài chính
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleLogout}
          activeOpacity={0.8}
          style={{
            marginTop: 12,
            height: 48,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 16,
            backgroundColor: "#DC2626",
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#FFFFFF" }}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}
