import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View, ScrollView } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/hooks/use-auth";

const GREEN = "#138363";
const DARK_GREEN = "#123E36";
const MUTED = "#71817D";
const BORDER = "#E3ECE7";
const SOFT_GREEN = "#E6F7EF";

function InfoRow({
  icon,
  label,
  value,
  last = false,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View>
      <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 17 }}>
        <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: SOFT_GREEN, alignItems: "center", justifyContent: "center", marginRight: 13 }}>
          <Feather name={icon} size={18} color={GREEN} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: MUTED, fontSize: 12, fontWeight: "600", marginBottom: 5 }}>{label}</Text>
          <Text selectable style={{ color: "#1B302B", fontSize: 15, fontWeight: "700" }}>{value}</Text>
        </View>
        <Feather name="check-circle" size={17} color={GREEN} />
      </View>
      {!last ? <View style={{ height: 1, backgroundColor: "#EEF3F0", marginLeft: 55 }} /> : null}
    </View>
  );
}

export default function AccountInformationScreen() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const initial = (user?.name || user?.email || "F").trim().charAt(0).toUpperCase();
  const lastSignedIn = user?.lastSignedIn instanceof Date && !Number.isNaN(user.lastSignedIn.getTime())
    ? user.lastSignedIn.toLocaleDateString("vi-VN", { day: "2-digit", month: "long", year: "numeric" })
    : "Chưa có thông tin";

  return (
    <ScreenContainer className="bg-[#F5F8F7]">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 36 }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 24 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Quay lại cài đặt"
            style={{ width: 44, height: 44, borderRadius: 15, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: BORDER, alignItems: "center", justifyContent: "center", marginRight: 13 }}
          >
            <Feather name="arrow-left" size={20} color={DARK_GREEN} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ color: "#122D2A", fontSize: 25, fontWeight: "800", letterSpacing: -0.5 }}>Thông tin tài khoản</Text>
            <Text style={{ color: MUTED, fontSize: 13, marginTop: 4 }}>Thông tin hồ sơ Finora của bạn</Text>
          </View>
        </View>

        <View style={{ backgroundColor: DARK_GREEN, borderRadius: 26, padding: 22, overflow: "hidden" }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ width: 68, height: 68, borderRadius: 23, backgroundColor: "#D4F6E6", alignItems: "center", justifyContent: "center", marginRight: 15, borderWidth: 3, borderColor: "#FFFFFF30" }}>
              <Text style={{ color: GREEN, fontSize: 29, fontWeight: "800" }}>{initial}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#BDEBD8", fontSize: 11, fontWeight: "800", letterSpacing: 1 }}>HỒ SƠ CỦA BẠN</Text>
              <Text numberOfLines={2} style={{ color: "#FFFFFF", fontSize: 19, fontWeight: "800", marginTop: 6 }}>
                {loading ? "Đang tải thông tin..." : user?.name || "Người dùng Finora"}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 9, alignSelf: "flex-start", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: "#24594D" }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#78E0B3", marginRight: 6 }} />
                <Text style={{ color: "#D4F6E6", fontSize: 11, fontWeight: "700" }}>{user ? "Tài khoản đang hoạt động" : "Chưa đăng nhập"}</Text>
              </View>
            </View>
          </View>
          <View style={{ marginTop: 20, paddingTop: 15, borderTopWidth: 1, borderTopColor: "#326257", flexDirection: "row", alignItems: "center" }}>
            <Feather name="shield" size={16} color="#BDEBD8" style={{ marginRight: 9 }} />
            <Text style={{ flex: 1, color: "#D1E6DE", fontSize: 12, lineHeight: 18 }}>Thông tin tài khoản được hiển thị riêng tư trên thiết bị của bạn.</Text>
          </View>
        </View>

        <View style={{ marginTop: 25 }}>
          <Text style={{ color: "#536C64", fontSize: 12, fontWeight: "800", letterSpacing: 1, marginBottom: 10, marginLeft: 3 }}>CHI TIẾT TÀI KHOẢN</Text>
          <View style={{ backgroundColor: "#FFFFFF", borderRadius: 24, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 16 }}>
            <InfoRow icon="user" label="Tên hiển thị" value={user?.name?.trim() || "Chưa cập nhật"} />
            <InfoRow icon="mail" label="Địa chỉ email" value={user?.email || "Chưa có email"} />
            <InfoRow icon="key" label="Phương thức đăng nhập" value={user?.loginMethod || "Tài khoản Finora"} />
            <InfoRow icon="calendar" label="Đăng nhập gần nhất" value={lastSignedIn} last />
          </View>
        </View>

        <View style={{ marginTop: 18, padding: 16, borderRadius: 18, backgroundColor: "#EAF6F0", flexDirection: "row", alignItems: "flex-start" }}>
          <Feather name="info" size={18} color={GREEN} style={{ marginRight: 10, marginTop: 1 }} />
          <Text style={{ flex: 1, color: "#45675B", fontSize: 12, lineHeight: 19 }}>
            Đây là thông tin của tài khoản đang đăng nhập. Để quản lý các tài khoản đã lưu trên thiết bị, hãy quay lại Cài đặt và chọn “Danh sách tài khoản”.
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.82}
          accessibilityRole="button"
          style={{ marginTop: 24, minHeight: 54, borderRadius: 17, backgroundColor: GREEN, alignItems: "center", justifyContent: "center", flexDirection: "row" }}
        >
          <Feather name="check" size={18} color="#FFFFFF" style={{ marginRight: 9 }} />
          <Text style={{ color: "#FFFFFF", fontSize: 15, fontWeight: "800" }}>Hoàn tất</Text>
        </TouchableOpacity>
        <Text style={{ textAlign: "center", color: "#9AA6A3", fontSize: 11, marginTop: 20 }}>FINORA · Tài chính rõ ràng, cuộc sống an tâm</Text>
      </ScrollView>
    </ScreenContainer>
  );
}
