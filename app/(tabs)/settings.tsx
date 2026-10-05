import { Link, useRouter } from "expo-router";
import { Pressable, Text, TouchableOpacity, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/hooks/use-auth";

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace("/login" as never);
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

        <Link href="/account-list" asChild>
          <Pressable className="mt-6 h-12 items-center justify-center rounded-2xl border border-[#CBD5E1] bg-white active:opacity-80">
            <Text className="text-base font-bold text-[#0F2A5F]">Danh sách tài khoản</Text>
          </Pressable>
        </Link>

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
