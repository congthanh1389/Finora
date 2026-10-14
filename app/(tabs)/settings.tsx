import { useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/hooks/use-auth";

export default function SettingsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const displayName = user?.name?.trim() || "Người dùng Finora";
  const email = user?.email?.trim() || "Chưa có thông tin tài khoản";
  const initials = (user?.name || user?.email || "F").trim().charAt(0).toUpperCase();

  return (
    <ScreenContainer className="bg-[#F5F8F7]">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 36 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <View>
            <Text style={{ color: "#122D2A", fontSize: 29, fontWeight: "800", letterSpacing: -0.8 }}>Cài đặt</Text>
            <Text style={{ color: "#72817F", fontSize: 14, marginTop: 5 }}>Cá nhân hóa trải nghiệm Finora</Text>
          </View>
          <View style={{ width: 48, height: 48, borderRadius: 17, backgroundColor: "#DDF7EB", alignItems: "center", justifyContent: "center" }}>
            <Feather name="settings" size={23} color="#12664D" />
          </View>
        </View>

        <View style={{ borderRadius: 26, padding: 19, backgroundColor: "#123E36", overflow: "hidden" }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ width: 54, height: 54, borderRadius: 19, backgroundColor: "#D4F6E6", alignItems: "center", justifyContent: "center", marginRight: 13 }}>
              <Text style={{ color: "#12664D", fontSize: 24, fontWeight: "800" }}>{initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#BDEBD8", fontSize: 12, fontWeight: "700" }}>TÀI KHOẢN CỦA BẠN</Text>
              <Text numberOfLines={1} style={{ color: "#FFFFFF", fontSize: 17, fontWeight: "800", marginTop: 5 }}>{displayName}</Text>
              <Text numberOfLines={1} style={{ color: "#D1E6DE", fontSize: 12, marginTop: 3 }}>{email}</Text>
            </View>
          </View>
          <View style={{ marginTop: 17, paddingTop: 14, borderTopWidth: 1, borderTopColor: "#326257" }}>
            <Text style={{ color: "#D1E6DE", fontSize: 12, lineHeight: 18 }}>Quản lý thông tin đăng nhập và các thiết lập của bạn tại đây.</Text>
          </View>
        </View>

        <Text style={{ marginTop: 26, marginBottom: 9, marginLeft: 4, color: "#64748B", fontSize: 12, fontWeight: "800", letterSpacing: 1 }}>TÀI KHOẢN</Text>
        <View style={{ overflow: "hidden", borderRadius: 22, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E8EEF3" }}>
          <TouchableOpacity onPress={() => router.push("/account-information" as never)} activeOpacity={0.75} accessibilityRole="button" accessibilityLabel="Thông tin tài khoản" style={{ flexDirection: "row", alignItems: "center", paddingVertical: 15, paddingHorizontal: 14 }}>
            <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: "#ECFDF5", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
              <Feather name="user" size={20} color="#138363" />
            </View>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={{ color: "#172033", fontSize: 15, fontWeight: "700" }}>Thông tin tài khoản</Text>
              <Text style={{ color: "#7B8798", fontSize: 12, marginTop: 4 }}>Hồ sơ, bảo mật và phiên đăng nhập</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: 22, padding: 16, borderRadius: 18, backgroundColor: "#EAF7F0", flexDirection: "row", alignItems: "flex-start" }}>
          <Feather name="shield" size={18} color="#138363" style={{ marginRight: 10, marginTop: 1 }} />
          <Text style={{ flex: 1, color: "#35695A", fontSize: 12, lineHeight: 18 }}>Các thao tác bảo mật và dữ liệu sẽ được tích hợp theo từng bước để bảo vệ tài khoản và dữ liệu tài chính của bạn.</Text>
        </View>
        <Text style={{ textAlign: "center", color: "#9AA6A3", fontSize: 11, marginTop: 24 }}>FINORA · Tài chính rõ ràng, cuộc sống an tâm</Text>
      </ScrollView>
    </ScreenContainer>
  );
}
