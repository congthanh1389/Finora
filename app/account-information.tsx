import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/hooks/use-auth";

const COLORS = {
  background: "#F6FBF8",
  white: "#FFFFFF",
  mint: "#1A9B7A",
  mintDark: "#167B64",
  mintSoft: "#E9F8F1",
  mintBorder: "#D7EEE3",
  text: "#263C35",
  muted: "#7B8C85",
  divider: "#EDF3EF",
  success: "#20A66A",
};

function DetailRow({
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
      <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 15 }}>
        <View style={{ width: 38, height: 38, borderRadius: 13, backgroundColor: COLORS.mintSoft, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
          <Feather name={icon} size={17} color={COLORS.mintDark} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: COLORS.muted, fontSize: 12, fontWeight: "500", marginBottom: 4 }}>{label}</Text>
          <Text selectable style={{ color: COLORS.text, fontSize: 14, fontWeight: "700", lineHeight: 20 }}>{value}</Text>
        </View>
      </View>
      {!last ? <View style={{ height: 1, backgroundColor: COLORS.divider, marginLeft: 50 }} /> : null}
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
    <ScreenContainer className="bg-[#F6FBF8]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 28 }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 23 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Quay lại"
            style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.mintBorder, alignItems: "center", justifyContent: "center", marginRight: 12 }}
          >
            <Feather name="arrow-left" size={19} color={COLORS.text} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ color: COLORS.text, fontSize: 21, fontWeight: "800" }}>Thông tin tài khoản</Text>
            <Text style={{ color: COLORS.muted, fontSize: 12, marginTop: 4 }}>Hồ sơ cá nhân của bạn</Text>
          </View>
        </View>

        <View style={{ backgroundColor: COLORS.white, borderRadius: 23, borderWidth: 1, borderColor: COLORS.mintBorder, padding: 18, marginBottom: 25 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ width: 66, height: 66, borderRadius: 22, backgroundColor: COLORS.mintSoft, borderWidth: 1, borderColor: "#D5EFE3", alignItems: "center", justifyContent: "center", marginRight: 14 }}>
              <Text style={{ color: COLORS.mintDark, fontSize: 27, fontWeight: "800" }}>{initial}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: COLORS.text, fontSize: 17, fontWeight: "800" }} numberOfLines={1}>{loading ? "Đang tải thông tin..." : displayName}</Text>
              <Text style={{ color: COLORS.muted, fontSize: 12, marginTop: 5 }}>Tài khoản Finora</Text>
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 9 }}>
                <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: loading ? "#D9A441" : user ? COLORS.success : "#9AA8A2", marginRight: 6 }} />
                <Text style={{ color: loading ? "#98722C" : user ? COLORS.success : COLORS.muted, fontSize: 11, fontWeight: "700" }}>
                  {loading ? "Đang kiểm tra trạng thái" : user ? "Đang đăng nhập" : "Chưa đăng nhập"}
                </Text>
              </View>
            </View>
          </View>

          <View style={{ height: 1, backgroundColor: COLORS.divider, marginVertical: 16 }} />

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ width: 34, height: 34, borderRadius: 11, backgroundColor: COLORS.mintSoft, alignItems: "center", justifyContent: "center", marginRight: 10 }}>
              <Feather name="mail" size={16} color={COLORS.mintDark} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: COLORS.muted, fontSize: 11, marginBottom: 3 }}>Email tài khoản</Text>
              <Text selectable style={{ color: COLORS.text, fontSize: 13, fontWeight: "600" }}>{email}</Text>
            </View>
          </View>

          <View style={{ alignSelf: "flex-start", flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 9, borderRadius: 13, backgroundColor: COLORS.mintSoft, marginTop: 16 }}>
            <Feather name="edit-2" size={14} color={COLORS.mintDark} style={{ marginRight: 7 }} />
            <Text style={{ color: COLORS.mintDark, fontSize: 12, fontWeight: "700" }}>Chỉnh sửa hồ sơ</Text>
          </View>
        </View>

        <View style={{ marginBottom: 9, paddingHorizontal: 2 }}>
          <Text style={{ color: COLORS.text, fontSize: 15, fontWeight: "800" }}>Chi tiết tài khoản</Text>
          <Text style={{ color: COLORS.muted, fontSize: 11, marginTop: 4 }}>Thông tin đăng nhập và phiên hiện tại</Text>
        </View>

        <View style={{ backgroundColor: COLORS.white, borderRadius: 21, borderWidth: 1, borderColor: COLORS.mintBorder, paddingHorizontal: 14, marginBottom: 18 }}>
          <DetailRow icon="user" label="Tên hiển thị" value={user?.name?.trim() || "Chưa cập nhật"} />
          <DetailRow icon="key" label="Phương thức đăng nhập" value={loginMethod} />
          <DetailRow icon="calendar" label="Đăng nhập gần nhất" value={lastSignedIn} last />
        </View>

        <View style={{ flexDirection: "row", alignItems: "flex-start", backgroundColor: "#EFF9F4", borderRadius: 16, padding: 14, marginBottom: 22 }}>
          <Feather name="shield" size={17} color={COLORS.mintDark} style={{ marginRight: 9, marginTop: 1 }} />
          <Text style={{ flex: 1, color: "#61776D", fontSize: 11, lineHeight: 18 }}>
            Thông tin này thuộc tài khoản đang đăng nhập. Để quản lý các tài khoản đã lưu, hãy quay lại Cài đặt và chọn “Danh sách tài khoản”.
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.82}
          accessibilityRole="button"
          style={{ minHeight: 50, borderRadius: 16, backgroundColor: COLORS.mint, alignItems: "center", justifyContent: "center", flexDirection: "row" }}
        >
          <Feather name="check" size={17} color={COLORS.white} style={{ marginRight: 8 }} />
          <Text style={{ color: COLORS.white, fontSize: 14, fontWeight: "800" }}>Hoàn tất</Text>
        </TouchableOpacity>
        <Text style={{ textAlign: "center", color: "#96A69F", fontSize: 10, marginTop: 17 }}>FINORA · Tài chính rõ ràng, cuộc sống an tâm</Text>
      </ScrollView>
    </ScreenContainer>
  );
}
