import { useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/hooks/use-auth";

type DetailRowProps = {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
  last?: boolean;
};

function DetailRow({ icon, label, value, last = false }: DetailRowProps) {
  return (
    <View>
      <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 15 }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 14,
            backgroundColor: "#ECFDF5",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          <Feather name={icon} size={18} color="#138363" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: "#718096", fontSize: 12 }}>{label}</Text>
          <Text selectable style={{ color: "#172033", fontSize: 14, fontWeight: "700", marginTop: 4 }}>
            {value}
          </Text>
        </View>
      </View>
      {!last ? <View style={{ height: 1, backgroundColor: "#F0F3F5", marginLeft: 52 }} /> : null}
    </View>
  );
}

function formatDate(value: Date | string | null | undefined): string {
  if (!value) return "Chưa có thông tin";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa có thông tin";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatLoginMethod(value: string | null | undefined): string {
  if (!value) return "Chưa xác định";
  if (value === "local-password") return "Email và mật khẩu";
  if (value === "manus") return "Manus";
  return value;
}

export default function AccountInfoScreen() {
  const router = useRouter();
  const { user, loading } = useAuth();

  return (
    <ScreenContainer className="bg-[#F5F8F7]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: 36 }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 18 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Quay lại"
            style={{
              width: 42,
              height: 42,
              borderRadius: 14,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#FFFFFF",
              borderWidth: 1,
              borderColor: "#E5ECE9",
              marginRight: 12,
            }}
          >
            <Feather name="arrow-left" size={20} color="#123E36" />
          </TouchableOpacity>
          <View>
            <Text style={{ color: "#122D2A", fontSize: 25, fontWeight: "800", letterSpacing: -0.5 }}>
              Thông tin tài khoản
            </Text>
            <Text style={{ color: "#72817F", fontSize: 13, marginTop: 3 }}>
              Chi tiết tài khoản đang đăng nhập
            </Text>
          </View>
        </View>

        {loading ? (
          <View style={{ borderRadius: 24, padding: 22, backgroundColor: "#FFFFFF" }}>
            <Text style={{ color: "#64748B", fontSize: 14 }}>Đang tải thông tin tài khoản…</Text>
          </View>
        ) : user ? (
          <>
            <View
              style={{
                borderRadius: 26,
                padding: 20,
                backgroundColor: "#123E36",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 62,
                  height: 62,
                  borderRadius: 21,
                  backgroundColor: "#D4F6E6",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 14,
                }}
              >
                <Text style={{ color: "#12664D", fontSize: 26, fontWeight: "900" }}>
                  {(user.name || user.email || "F").trim().charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#BDEBD8", fontSize: 11, fontWeight: "800", letterSpacing: 0.7 }}>
                  TÀI KHOẢN FINORA
                </Text>
                <Text numberOfLines={1} style={{ color: "#FFFFFF", fontSize: 18, fontWeight: "800", marginTop: 5 }}>
                  {user.name || "Người dùng Finora"}
                </Text>
                <Text numberOfLines={1} style={{ color: "#D1E6DE", fontSize: 13, marginTop: 3 }}>
                  {user.email || "Chưa có email"}
                </Text>
              </View>
            </View>

            <View style={{ marginTop: 22 }}>
              <Text style={{ color: "#64748B", fontSize: 12, fontWeight: "800", letterSpacing: 1, marginBottom: 10, marginLeft: 4 }}>
                CHI TIẾT
              </Text>
              <View
                style={{
                  borderRadius: 22,
                  backgroundColor: "#FFFFFF",
                  borderWidth: 1,
                  borderColor: "#E8EEF3",
                  paddingHorizontal: 15,
                }}
              >
                <DetailRow icon="mail" label="Email đăng nhập" value={user.email || "Chưa có email"} />
                <DetailRow icon="hash" label="Mã tài khoản trên thiết bị" value={String(user.id)} />
                <DetailRow icon="key" label="Phương thức đăng nhập" value={formatLoginMethod(user.loginMethod)} />
                <DetailRow icon="clock" label="Đăng nhập gần nhất" value={formatDate(user.lastSignedIn)} last />
              </View>
            </View>

            <TouchableOpacity
              onPress={() => router.push("/account-list" as never)}
              activeOpacity={0.8}
              accessibilityRole="button"
              style={{
                marginTop: 18,
                minHeight: 58,
                borderRadius: 18,
                paddingHorizontal: 16,
                backgroundColor: "#FFFFFF",
                borderWidth: 1,
                borderColor: "#E8EEF3",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Feather name="users" size={19} color="#138363" style={{ marginRight: 11 }} />
              <Text style={{ flex: 1, color: "#172033", fontSize: 14, fontWeight: "700" }}>
                Quản lý tài khoản đã lưu
              </Text>
              <Feather name="chevron-right" size={20} color="#94A3B8" />
            </TouchableOpacity>

            <View
              style={{
                marginTop: 18,
                borderRadius: 20,
                padding: 16,
                backgroundColor: "#EAF7F1",
                borderWidth: 1,
                borderColor: "#CFEBDD",
                flexDirection: "row",
                alignItems: "flex-start",
              }}
            >
              <Feather name="shield" size={18} color="#138363" style={{ marginTop: 1, marginRight: 10 }} />
              <Text style={{ flex: 1, color: "#31594D", fontSize: 12, lineHeight: 19 }}>
                Thông tin này chỉ để xem. Để xóa tài khoản cùng dữ liệu tài chính trên thiết bị, hãy dùng mục Danh sách tài khoản trong Cài đặt.
              </Text>
            </View>
          </>
        ) : (
          <View style={{ borderRadius: 24, padding: 22, backgroundColor: "#FFFFFF", alignItems: "flex-start" }}>
            <Text style={{ color: "#172033", fontSize: 16, fontWeight: "800" }}>Chưa có tài khoản đăng nhập</Text>
            <Text style={{ color: "#64748B", fontSize: 13, lineHeight: 20, marginTop: 7 }}>
              Đăng nhập vào Finora để xem thông tin tài khoản của bạn.
            </Text>
            <TouchableOpacity
              onPress={() => router.replace("/login" as never)}
              activeOpacity={0.8}
              style={{ marginTop: 16, borderRadius: 12, backgroundColor: "#138363", paddingHorizontal: 16, paddingVertical: 11 }}
            >
              <Text style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "800" }}>Đăng nhập</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={{ textAlign: "center", color: "#8A9995", fontSize: 12, marginTop: 26 }}>
          Finora · Quản lý tài chính cá nhân
        </Text>
      </ScrollView>
    </ScreenContainer>
  );
}
