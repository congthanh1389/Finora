import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/hooks/use-auth";

const COLORS = {
  background: "#F3FAF7",
  surface: "#FFFFFF",
  primary: "#0B8875",
  primaryDark: "#086B5D",
  primarySoft: "#E3F7F1",
  text: "#18332F",
  muted: "#71847F",
  border: "#DDEDE7",
  success: "#15966E",
  danger: "#C85D5D",
};

type InfoRowProps = {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
  last?: boolean;
  tone?: "default" | "danger";
};

function SectionTitle({
  icon,
  title,
  subtitle,
}: {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle: string;
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 11, paddingHorizontal: 2 }}>
      <View style={{ width: 34, height: 34, borderRadius: 12, backgroundColor: COLORS.primarySoft, alignItems: "center", justifyContent: "center", marginRight: 10 }}>
        <Feather name={icon} size={17} color={COLORS.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: COLORS.text, fontSize: 15, fontWeight: "800" }}>{title}</Text>
        <Text style={{ color: COLORS.muted, fontSize: 11, marginTop: 2 }}>{subtitle}</Text>
      </View>
    </View>
  );
}

function InfoRow({ icon, label, value, last = false, tone = "default" }: InfoRowProps) {
  const iconColor = tone === "danger" ? COLORS.danger : COLORS.primary;
  return (
    <View>
      <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 14 }}>
        <View style={{ width: 38, height: 38, borderRadius: 13, backgroundColor: tone === "danger" ? "#FFF0F0" : COLORS.primarySoft, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
          <Feather name={icon} size={17} color={iconColor} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: COLORS.muted, fontSize: 11, fontWeight: "600", marginBottom: 4 }}>{label}</Text>
          <Text selectable style={{ color: COLORS.text, fontSize: 14, fontWeight: "700", lineHeight: 20 }}>{value}</Text>
        </View>
        <Feather name="check-circle" size={16} color={COLORS.success} />
      </View>
      {!last ? <View style={{ height: 1, backgroundColor: "#EDF3F0", marginLeft: 50 }} /> : null}
    </View>
  );
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ backgroundColor: COLORS.surface, borderRadius: 21, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 14, marginBottom: 19 }}>
      {children}
    </View>
  );
}

export default function AccountInformationScreen() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const displayName = user?.name?.trim() || "Người dùng Finora";
  const email = user?.email?.trim() || "Chưa có email";
  const initial = (user?.name || user?.email || "F").trim().charAt(0).toUpperCase();
  const loginMethod = user?.loginMethod || "Tài khoản Finora";
  const lastSignedIn =
    user?.lastSignedIn instanceof Date && !Number.isNaN(user.lastSignedIn.getTime())
      ? user.lastSignedIn.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : "Chưa có thông tin";

  return (
    <ScreenContainer className="bg-[#F3FAF7]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 30 }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 19 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Quay lại"
            style={{ width: 43, height: 43, borderRadius: 15, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, alignItems: "center", justifyContent: "center", marginRight: 13 }}
          >
            <Feather name="arrow-left" size={20} color={COLORS.text} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ color: COLORS.text, fontSize: 22, fontWeight: "900", letterSpacing: -0.4 }}>Thông tin tài khoản</Text>
            <Text style={{ color: COLORS.muted, fontSize: 12, marginTop: 4 }}>Quản lý hồ sơ và bảo mật</Text>
          </View>
          <View style={{ width: 39, height: 39, borderRadius: 14, backgroundColor: COLORS.primarySoft, alignItems: "center", justifyContent: "center" }}>
            <Feather name="user-round" size={19} color={COLORS.primary} />
          </View>
        </View>

        <View style={{ backgroundColor: COLORS.primaryDark, borderRadius: 25, padding: 20, marginBottom: 25, overflow: "hidden" }}>
          <View style={{ position: "absolute", right: -24, top: -35, width: 145, height: 145, borderRadius: 75, backgroundColor: "rgba(255,255,255,0.06)" }} />
          <View style={{ position: "absolute", right: 40, bottom: -67, width: 125, height: 125, borderRadius: 65, borderWidth: 1, borderColor: "rgba(255,255,255,0.10)" }} />
          <Text style={{ color: "#B9EEE0", fontSize: 10, fontWeight: "800", letterSpacing: 1.5, marginBottom: 16 }}>HỒ SƠ FINORA</Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ width: 65, height: 65, borderRadius: 22, backgroundColor: "#D4F5E9", borderWidth: 3, borderColor: "rgba(255,255,255,0.24)", alignItems: "center", justifyContent: "center", marginRight: 14 }}>
              <Text style={{ color: COLORS.primaryDark, fontSize: 27, fontWeight: "900" }}>{initial}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text numberOfLines={1} style={{ color: "#FFFFFF", fontSize: 19, fontWeight: "900" }}>{loading ? "Đang tải hồ sơ..." : displayName}</Text>
              <Text numberOfLines={2} style={{ color: "#D2EDE5", fontSize: 12, marginTop: 5, lineHeight: 17 }}>{email}</Text>
              <View style={{ alignSelf: "flex-start", flexDirection: "row", alignItems: "center", marginTop: 10, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.13)" }}>
                <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: "#75E2B6", marginRight: 7 }} />
                <Text style={{ color: "#E8FFF6", fontSize: 10, fontWeight: "800" }}>{loading ? "Đang kiểm tra" : user ? "Tài khoản đang hoạt động" : "Chưa đăng nhập"}</Text>
              </View>
            </View>
          </View>
          <View style={{ height: 1, backgroundColor: "rgba(255,255,255,0.16)", marginTop: 19, marginBottom: 13 }} />
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Feather name="shield" size={14} color="#B9EEE0" style={{ marginRight: 7 }} />
            <Text style={{ color: "#D2EDE5", fontSize: 11, flex: 1 }}>Thông tin tài khoản của bạn</Text>
            <Text style={{ color: "#FFFFFF", fontSize: 11, fontWeight: "800" }}>FINORA</Text>
          </View>
        </View>

        <SectionTitle icon="user" title="Hồ sơ cá nhân" subtitle="Thông tin nhận diện tài khoản" />
        <SectionCard>
          <InfoRow icon="user" label="Tên hiển thị" value={user?.name?.trim() || "Chưa cập nhật"} />
          <InfoRow icon="mail" label="Địa chỉ email" value={email} last />
        </SectionCard>

        <SectionTitle icon="shield" title="Bảo mật" subtitle="Phương thức xác thực tài khoản" />
        <SectionCard>
          <InfoRow icon="key" label="Phương thức đăng nhập" value={loginMethod} />
          <InfoRow icon="lock" label="Trạng thái tài khoản" value={user ? "Đã xác thực phiên đăng nhập" : "Chưa có phiên đăng nhập"} last />
        </SectionCard>

        <SectionTitle icon="smartphone" title="Phiên đăng nhập" subtitle="Thông tin lần truy cập gần nhất" />
        <SectionCard>
          <InfoRow icon="calendar" label="Đăng nhập gần nhất" value={lastSignedIn} />
          <InfoRow icon="monitor" label="Trạng thái phiên hiện tại" value={loading ? "Đang kiểm tra..." : user ? "Đang hoạt động trên thiết bị này" : "Không có phiên hoạt động"} last />
        </SectionCard>

        <SectionTitle icon="database" title="Quản lý dữ liệu" subtitle="Thông tin lưu trữ và quản lý tài khoản" />
        <View style={{ backgroundColor: "#E8F8F2", borderWidth: 1, borderColor: "#CDEDE1", borderRadius: 19, padding: 15, flexDirection: "row", alignItems: "flex-start", marginBottom: 20 }}>
          <View style={{ width: 35, height: 35, borderRadius: 12, backgroundColor: "#D3F2E6", alignItems: "center", justifyContent: "center", marginRight: 11 }}>
            <Feather name="info" size={17} color={COLORS.primary} />
          </View>
          <Text style={{ flex: 1, color: "#46665D", fontSize: 12, lineHeight: 19 }}>
            Để quản lý các tài khoản đã lưu, hãy quay lại Cài đặt và chọn “Danh sách tài khoản”. Màn hình này chỉ hiển thị thông tin tài khoản hiện tại.
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.82}
          accessibilityRole="button"
          style={{ minHeight: 52, borderRadius: 17, backgroundColor: COLORS.primary, alignItems: "center", justifyContent: "center", flexDirection: "row" }}
        >
          <Feather name="check" size={18} color="#FFFFFF" style={{ marginRight: 9 }} />
          <Text style={{ color: "#FFFFFF", fontSize: 15, fontWeight: "800" }}>Hoàn tất</Text>
        </TouchableOpacity>
        <Text style={{ textAlign: "center", color: "#92A69F", fontSize: 11, marginTop: 17 }}>FINORA · Tài chính rõ ràng, cuộc sống an tâm</Text>
      </ScrollView>
    </ScreenContainer>
  );
}
