import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/hooks/use-auth";

const C = {
  bg: "#EAF9F4",
  white: "#FFFFFF",
  mint: "#27B99A",
  mintDark: "#08665D",
  soft: "#E8F8F2",
  border: "#C9EEE3",
  text: "#164F4B",
  muted: "#718C8A",
  line: "#EAF2EF",
  green: "#159B70",
};

function DetailRow({
  icon,
  label,
  value,
  onPress,
  last = false,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
  onPress?: () => void;
  last?: boolean;
}) {
  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.72 : 1}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? "button" : undefined}
      style={{ flexDirection: "row", alignItems: "center", paddingVertical: 15 }}
    >
      <View style={{ width: 44, height: 44, borderRadius: 16, backgroundColor: C.soft, alignItems: "center", justifyContent: "center", marginRight: 13 }}>
        <Feather name={icon} size={19} color={C.mintDark} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: C.muted, fontSize: 12, marginBottom: 5 }}>{label}</Text>
        <Text selectable style={{ color: C.text, fontSize: 14, fontWeight: "600", lineHeight: 20 }}>{value}</Text>
      </View>
      {onPress ? <Feather name="chevron-right" size={20} color={C.muted} /> : null}
      {!last ? null : null}
    </TouchableOpacity>
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
      ? user.lastSignedIn.toLocaleDateString("vi-VN", { day: "2-digit", month: "long", year: "numeric" })
      : "Chưa có thông tin";

  return (
    <ScreenContainer className="bg-[#EAF9F4]">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 10, paddingBottom: 32 }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 17 }}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.75} accessibilityRole="button" accessibilityLabel="Quay lại" style={{ width: 42, height: 42, alignItems: "center", justifyContent: "center" }}>
            <Feather name="arrow-left" size={24} color={C.mintDark} />
          </TouchableOpacity>
          <Text style={{ flex: 1, textAlign: "center", color: C.text, fontSize: 22, fontWeight: "800", marginRight: 42 }}>Hồ sơ</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/settings" as never)} accessibilityRole="button" accessibilityLabel="Cài đặt" style={{ width: 42, height: 42, alignItems: "center", justifyContent: "center" }}>
            <Feather name="settings" size={23} color={C.mintDark} />
          </TouchableOpacity>
        </View>

        <View style={{ paddingHorizontal: 12, paddingTop: 4, paddingBottom: 23 }}>
          <Text style={{ color: "#37A991", fontSize: 17, fontStyle: "italic", fontWeight: "600", lineHeight: 25 }}>Quản lý tài chính{"\n"}Tận hưởng cuộc sống ♡</Text>
          <View style={{ position: "absolute", right: 12, top: 2, width: 88, height: 88, borderRadius: 44, backgroundColor: "#D7F6EC", opacity: 0.8 }} />
        </View>

        <View style={{ backgroundColor: C.white, borderRadius: 26, padding: 19, borderWidth: 1, borderColor: "#E0F4ED", marginBottom: 17, shadowColor: "#187D6A", shadowOpacity: 0.06, shadowRadius: 14, shadowOffset: { width: 0, height: 5 }, elevation: 2 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ width: 92, height: 92, borderRadius: 46, backgroundColor: "#B9F1E1", borderWidth: 4, borderColor: "#FFFFFF", alignItems: "center", justifyContent: "center", marginRight: 14, shadowColor: "#0C7768", shadowOpacity: 0.12, shadowRadius: 5, elevation: 3 }}>
              <Text style={{ color: C.mintDark, fontSize: 37, fontWeight: "800" }}>{initial}</Text>
              <View style={{ position: "absolute", right: -2, bottom: -1, width: 31, height: 31, borderRadius: 16, backgroundColor: "#07866E", borderWidth: 2, borderColor: C.white, alignItems: "center", justifyContent: "center" }}>
                <Feather name="camera" size={15} color={C.white} />
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text numberOfLines={2} style={{ color: C.text, fontSize: 17, fontWeight: "800", lineHeight: 23 }}>{loading ? "Đang tải hồ sơ..." : displayName}</Text>
              <Text style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>{user?.email?.split("@")[0] || "Tài khoản Finora"}</Text>
              <TouchableOpacity onPress={() => router.push("/account-edit" as never)} activeOpacity={0.75} style={{ alignSelf: "flex-start", flexDirection: "row", alignItems: "center", backgroundColor: C.soft, borderRadius: 18, paddingHorizontal: 12, paddingVertical: 8, marginTop: 10 }}>
                <Feather name="edit-2" size={13} color={C.mintDark} style={{ marginRight: 6 }} />
                <Text style={{ color: C.mintDark, fontSize: 12, fontWeight: "700" }}>Chỉnh sửa</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ backgroundColor: "#EFFAF6", borderRadius: 17, padding: 13, marginTop: 18, flexDirection: "row", alignItems: "center" }}>
            <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: loading ? "#D8A33B" : user ? C.green : "#9AA8A2", marginRight: 10 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: C.mintDark, fontSize: 14, fontWeight: "800" }}>{loading ? "Đang kiểm tra trạng thái" : user ? "Đang đăng nhập" : "Chưa đăng nhập"}</Text>
              <Text style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>Trên thiết bị này</Text>
            </View>
            <Feather name="chevron-right" size={20} color={C.mintDark} />
          </View>
        </View>

        <View style={{ backgroundColor: C.white, borderRadius: 25, paddingHorizontal: 18, paddingTop: 18, paddingBottom: 4, borderWidth: 1, borderColor: "#E0F4ED", marginBottom: 17 }}>
          <Text style={{ color: C.text, fontSize: 18, fontWeight: "800", marginBottom: 3 }}>Thông tin tài khoản</Text>
          <DetailRow icon="mail" label="Email" value={email} onPress={() => {}} />
          <View style={{ height: 1, backgroundColor: C.line, marginLeft: 57 }} />
          <DetailRow icon="user" label="Tên hiển thị" value={user?.name?.trim() || "Chưa cập nhật"} onPress={() => router.push("/account-edit" as never)} />
          <View style={{ height: 1, backgroundColor: C.line, marginLeft: 57 }} />
          <DetailRow icon="key" label="Phương thức đăng nhập" value={loginMethod} />
          <View style={{ height: 1, backgroundColor: C.line, marginLeft: 57 }} />
          <DetailRow icon="calendar" label="Đăng nhập gần nhất" value={lastSignedIn} last />
        </View>

        <View style={{ backgroundColor: "#DFF6ED", borderRadius: 18, padding: 15, flexDirection: "row", alignItems: "flex-start" }}>
          <Feather name="shield" size={18} color={C.mintDark} style={{ marginRight: 10, marginTop: 1 }} />
          <Text style={{ flex: 1, color: "#4B7770", fontSize: 12, lineHeight: 19 }}>Thông tin tài khoản của bạn được hiển thị riêng trên thiết bị này. Bạn có thể cập nhật hồ sơ bất cứ lúc nào.</Text>
        </View>
        <Text style={{ textAlign: "center", color: "#7FA49A", fontSize: 10, marginTop: 22 }}>FINORA · Tài chính rõ ràng, cuộc sống an tâm</Text>
      </ScrollView>
    </ScreenContainer>
  );
}
