import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View, ScrollView } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { FinoraHeaderBanner } from "@/components/ui/finora-header-banner";
import { useAuth } from "@/hooks/use-auth";

const BLUE = "#00A995";
const DARK_BLUE = "#008F83";
const MUTED = "#64748B";
const BORDER = "#B5EEE4";
const SOFT_BLUE = "#E6FAF6";

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
        <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: SOFT_BLUE, alignItems: "center", justifyContent: "center", marginRight: 13 }}>
          <Feather name={icon} size={18} color={BLUE} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: MUTED, fontSize: 12, fontWeight: "600", marginBottom: 5 }}>{label}</Text>
          <Text selectable style={{ color: "#172033", fontSize: 15, fontWeight: "700" }}>{value}</Text>
        </View>
        <Feather name="check-circle" size={17} color={BLUE} />
      </View>
      {!last ? <View style={{ height: 1, backgroundColor: "#EAF0F8", marginLeft: 55 }} /> : null}
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
    <ScreenContainer className="bg-[#F3FAF8]">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 36 }}>
        <FinoraHeaderBanner
          eyebrow="QUẢN LÝ CÁ NHÂN"
          title="Thông tin tài khoản"
          subtitle={loading ? "Đang tải thông tin hồ sơ..." : `${user?.name || "Người dùng Finora"} · ${user?.email || "Chưa có email"}`}
          onBack={() => router.back()}
          badgeText={initial}
          footer={
            <View style={{ alignSelf: "flex-start", flexDirection: "row", alignItems: "center", marginTop: 14, paddingHorizontal: 11, paddingVertical: 6, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.90)" }}>
              <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: "#009E8A", marginRight: 8 }} />
              <Text style={{ color: "#075E55", fontSize: 11, fontWeight: "800" }}>
                {loading ? "Đang tải trạng thái..." : user ? "Tài khoản đang hoạt động" : "Chưa đăng nhập"}
              </Text>
            </View>
          }
        />

        <View style={{ marginTop: 4 }}>
          <Text style={{ color: DARK_BLUE, fontSize: 12, fontWeight: "800", letterSpacing: 1, marginBottom: 10, marginLeft: 3 }}>CHI TIẾT TÀI KHOẢN</Text>
          <View style={{ backgroundColor: "#FFFFFF", borderRadius: 24, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 16 }}>
            <InfoRow icon="user" label="Tên hiển thị" value={user?.name?.trim() || "Chưa cập nhật"} />
            <InfoRow icon="mail" label="Địa chỉ email" value={user?.email || "Chưa có email"} />
            <InfoRow icon="key" label="Phương thức đăng nhập" value={user?.loginMethod || "Tài khoản Finora"} />
            <InfoRow icon="calendar" label="Đăng nhập gần nhất" value={lastSignedIn} last />
          </View>
        </View>

        <View style={{ marginTop: 18, padding: 16, borderRadius: 18, backgroundColor: "#E6FAF6", flexDirection: "row", alignItems: "flex-start" }}>
          <Feather name="info" size={18} color={BLUE} style={{ marginRight: 10, marginTop: 1 }} />
          <Text style={{ flex: 1, color: "#475569", fontSize: 12, lineHeight: 19 }}>
            Thông tin tài khoản được hiển thị riêng tư trên thiết bị của bạn. Đây là tài khoản đang đăng nhập; để quản lý các tài khoản đã lưu, hãy quay lại Cài đặt và chọn “Danh sách tài khoản”.
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.82}
          accessibilityRole="button"
          style={{ marginTop: 24, minHeight: 54, borderRadius: 17, backgroundColor: BLUE, alignItems: "center", justifyContent: "center", flexDirection: "row" }}
        >
          <Feather name="check" size={18} color="#FFFFFF" style={{ marginRight: 9 }} />
          <Text style={{ color: "#FFFFFF", fontSize: 15, fontWeight: "800" }}>Hoàn tất</Text>
        </TouchableOpacity>
        <Text style={{ textAlign: "center", color: "#9AA6A3", fontSize: 11, marginTop: 20 }}>FINORA · Tài chính rõ ràng, cuộc sống an tâm</Text>
      </ScrollView>
    </ScreenContainer>
  );
}
