import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Animated, Modal, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/hooks/use-auth";
import { localLogin } from "@/lib/_core/auth";
import { clearDeviceFinancialData } from "@/src/core/storage/device-store";
import { useThemeContext } from "@/lib/theme-provider";


const DARK_COLOR_OVERRIDES: Record<string, string> = {
  "#FFFFFF": "#17322D",
  "#F8FAFC": "#10211F",
  "#E8EEF3": "#31554B",
  "#E6FFFA": "#1C4038",
  "#E6FAF6": "#1C4038",
  "#22B8A8": "#51D3B2",
  "#00D4B3": "#51D3B2",
  "#008F83": "#51D3B2",
  "#0F766E": "#51D3B2",
  "#075E55": "#B5EEE4",
  "#172033": "#E7F5F0",
  "#1F2937": "#DCEAE5",
  "#64748B": "#A5BCB5",
  "#7B8798": "#A5BCB5",
  "#52616B": "#B7CBC4",
  "#9AA6A3": "#A5BCB5",
  "#94A3B8": "#A5BCB5",
  "#E8F7F2": "#1C4038",
  "#E6EEF0": "#31554B",
  "#F0F3F5": "#31554B",
  "#B5EEE4": "#31554B",
  "#B8F0E5": "#31554B",
  "#FFF1F2": "#4A202A",
  "#BE123C": "#FF8291",
  "#E11D48": "#FF8291",
  "#F3C8CC": "#67303A",
  "#FFF7F7": "#2C1D22",
  "#F1F5F9": "#263A35",
  "#475569": "#B7CBC4",
  "#059669": "#51D3A1",
  "#E2E8F0": "#31554B",
  "#E9EEF2": "#31554B"
};

function themeColor(color: string, scheme: "light" | "dark") {
  return scheme === "dark" ? (DARK_COLOR_OVERRIDES[color.toUpperCase()] ?? color) : color;
}

type SettingRowProps = {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
  danger?: boolean;
  trailing?: string;
  titleColor?: string;
};

function SettingRow({ icon, title, subtitle, onPress, danger = false, trailing = "›", titleColor }: SettingRowProps) {
  const { colorScheme } = useThemeContext();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={{ flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 14 }}
    >
      <View style={{
        width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center",
        backgroundColor: danger ? themeColor("#FFF1F2", colorScheme) : themeColor("#E6FFFA", colorScheme), marginRight: 12,
      }}>
        <Feather name={icon} size={20} color={danger ? themeColor("#BE123C", colorScheme) : themeColor("#22B8A8", colorScheme)} strokeWidth={2} />
      </View>
      <View style={{ flex: 1, paddingRight: 8 }}>
        <Text style={{ color: titleColor ?? (danger ? themeColor("#BE123C", colorScheme) : themeColor("#172033", colorScheme)), fontSize: 15, fontWeight: "700" }}>{title}</Text>
        {subtitle ? <Text style={{ color: themeColor("#7B8798", colorScheme), fontSize: 12, marginTop: 4, lineHeight: 17 }}>{subtitle}</Text> : null}
      </View>
      {trailing === "v1.0" ? <Text style={{ color: themeColor("#94A3B8", colorScheme), fontSize: 11, fontWeight: "700" }}>{trailing}</Text> : <Feather name="chevron-right" size={20} color={danger ? themeColor("#E11D48", colorScheme) : themeColor("#94A3B8", colorScheme)} /> }
    </TouchableOpacity>
  );
}

function SettingsGroup({ title, children }: { title: string; children: React.ReactNode }) {
  const { colorScheme } = useThemeContext();
  return (
    <View style={{ marginTop: 22 }}>
      <Text style={{ marginBottom: 9, marginLeft: 4, color: themeColor("#008F83", colorScheme), fontSize: 12, fontWeight: "800", letterSpacing: 1 }}>
        {title.toLocaleUpperCase("vi-VN")}
      </Text>
      <View style={{ overflow: "hidden", borderRadius: 22, backgroundColor: themeColor("#FFFFFF", colorScheme), borderWidth: 1, borderColor: themeColor("#E8EEF3", colorScheme) }}>
        {children}
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const { colorScheme } = useThemeContext();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [profileCardScale] = useState(() => new Animated.Value(1));

  const animateProfileCard = (toValue: number) => {
    Animated.spring(profileCardScale, {
      toValue,
      speed: 26,
      bounciness: 3,
      useNativeDriver: true,
    }).start();
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/login" as never);
  };

  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [password, setPassword] = useState("");
  const [verifyingPassword, setVerifyingPassword] = useState(false);

  const handleClearFinancialData = () => {
    if (!user?.id || !user?.email) {
      Alert.alert("Chưa có tài khoản", "Vui lòng đăng nhập trước khi xóa dữ liệu tài chính.");
      return;
    }
    setPassword("");
    setPasswordModalVisible(true);
  };

  const handleVerifyPassword = async () => {
    if (!user?.email || !user?.id || !password.trim() || verifyingPassword) return;
    setVerifyingPassword(true);
    try {
      await localLogin(user.email, password);
      setPasswordModalVisible(false);
      setPassword("");
      Alert.alert(
        "Xác nhận xóa dữ liệu tài chính?",
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
    } catch {
      Alert.alert("Mật khẩu không đúng", "Vui lòng nhập đúng mật khẩu. Dữ liệu chưa bị xóa.");
    } finally {
      setVerifyingPassword(false);
    }
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 36 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <View>
            <Text style={{ color: themeColor("#008F83", colorScheme), fontSize: 25, fontWeight: "800", letterSpacing: -0.5 }}>Cài đặt</Text>
            <Text style={{ color: themeColor("#64748B", colorScheme), fontSize: 14, marginTop: 5 }}>Cá nhân hóa trải nghiệm Finora</Text>
          </View>
          <View style={{ width: 48, height: 48, borderRadius: 17, backgroundColor: themeColor("#E6FAF6", colorScheme), alignItems: "center", justifyContent: "center" }}>
            <Feather name="settings" size={23} color=themeColor("#008F83", colorScheme) />
          </View>
        </View>

        <Pressable
          onPressIn={() => animateProfileCard(0.985)}
          onPressOut={() => animateProfileCard(1)}
          accessible={false}
        >
        <Animated.View
          style={{
            position: "relative",
            marginBottom: 18,
            borderRadius: 24,
            backgroundColor: themeColor("#FFFFFF", colorScheme),
            borderWidth: 1,
            borderColor: themeColor("#B5EEE4", colorScheme),
            padding: 18,
            paddingTop: 23,
            overflow: "hidden",
            shadowColor: themeColor("#0F766E", colorScheme),
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 2,
            transform: [{ scale: profileCardScale }],
          }}
        >
          <View style={{ position: "absolute", top: 0, left: 0, right: 0, height: 5, backgroundColor: themeColor("#00D4B3", colorScheme) }} />
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ width: 58, height: 58, borderRadius: 20, backgroundColor: themeColor("#E6FAF6", colorScheme), borderWidth: 1, borderColor: themeColor("#B5EEE4", colorScheme), alignItems: "center", justifyContent: "center", marginRight: 14 }}>
              <Text style={{ color: themeColor("#008F83", colorScheme), fontSize: 24, fontWeight: "900" }}>
                {(user?.name || user?.email || "F").trim().charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: themeColor("#075E55", colorScheme), fontSize: 26, lineHeight: 32, fontWeight: "900", letterSpacing: -0.4 }}>
                Tài khoản của bạn
              </Text>
              <Text numberOfLines={1} style={{ color: themeColor("#1F2937", colorScheme), fontSize: 15, fontWeight: "700", marginTop: 5 }}>
                {user?.name || "Người dùng Finora"}
              </Text>
            </View>
          </View>

          <View style={{ height: 1, backgroundColor: themeColor("#E6EEF0", colorScheme), marginTop: 16, marginBottom: 12 }} />
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ width: 30, height: 30, borderRadius: 10, backgroundColor: themeColor("#E6FAF6", colorScheme), alignItems: "center", justifyContent: "center", marginRight: 10 }}>
              <Feather name="mail" size={15} color=themeColor("#008F83", colorScheme) />
            </View>
            <Text numberOfLines={1} style={{ flex: 1, color: themeColor("#52616B", colorScheme), fontSize: 13, fontWeight: "600" }}>
              {user?.email ?? "Chưa có email"}
            </Text>
          </View>

          <View style={{ alignSelf: "flex-start", flexDirection: "row", alignItems: "center", marginTop: 14, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 18, backgroundColor: user ? themeColor("#E8F7F2", colorScheme) : themeColor("#F1F5F9", colorScheme) }}>
            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: user ? themeColor("#059669", colorScheme) : themeColor("#94A3B8", colorScheme), marginRight: 8 }} />
            <Text style={{ color: user ? themeColor("#0F766E", colorScheme) : themeColor("#475569", colorScheme), fontSize: 11, fontWeight: "800" }}>
              {user ? "Đang đăng nhập" : "Chưa đăng nhập"}
            </Text>
          </View>
        </Animated.View>
        </Pressable>

        <SettingsGroup title="Tài khoản">
          <SettingRow icon="user" title="Thông tin tài khoản" subtitle="Thông tin đăng nhập hiện tại" onPress={() => router.push("/account-information" as never)} titleColor={themeColor("#008F83", colorScheme)} />
          <View style={{ height: 1, backgroundColor: themeColor("#F0F3F5", colorScheme), marginLeft: 68 }} />
          <SettingRow icon="shield" title="Danh sách tài khoản" subtitle="Quản lý tài khoản đã lưu trên thiết bị" onPress={() => router.push("/account-list" as never)} />
        </SettingsGroup>

        <SettingsGroup title="Quản lý tài chính">
          <SettingRow icon="tag" title="Danh mục thu chi" subtitle="Tùy chỉnh nhóm thu nhập và chi tiêu" onPress={() => router.push("/category" as never)} titleColor={themeColor("#008F83", colorScheme)} />
          <View style={{ height: 1, backgroundColor: themeColor("#F0F3F5", colorScheme), marginLeft: 68 }} />
          <SettingRow icon="sliders" title="Thiết lập tài chính" subtitle="Ví, ngân sách và các thiết lập liên quan" onPress={() => Alert.alert("Thiết lập tài chính", "Các tùy chọn nâng cao sẽ được bổ sung ở bước tiếp theo.")} />
        </SettingsGroup>

        <SettingsGroup title="Ứng dụng">
          <SettingRow icon="droplet" title="Giao diện" subtitle="Màu sắc và chế độ hiển thị" onPress={() => router.push("/appearance" as never)} titleColor={themeColor("#008F83", colorScheme)} />
          <View style={{ height: 1, backgroundColor: themeColor("#F0F3F5", colorScheme), marginLeft: 68 }} />
          <SettingRow icon="life-buoy" title="Trợ giúp & hỗ trợ" subtitle="Hướng dẫn sử dụng Finora" onPress={() => Alert.alert("Trợ giúp & hỗ trợ", "Trung tâm trợ giúp sẽ được bổ sung ở bước tiếp theo.")} titleColor={themeColor("#008F83", colorScheme)} />
          <View style={{ height: 1, backgroundColor: themeColor("#F0F3F5", colorScheme), marginLeft: 68 }} />
          <SettingRow icon="info" title="Về Finora" subtitle="Thông tin ứng dụng" onPress={() => router.push("/about" as never)} trailing="v1.0" titleColor={themeColor("#008F83", colorScheme)} />
        </SettingsGroup>

        <SettingsGroup title="Khu vực nguy hiểm">
          <SettingRow icon="trash-2" title="Xóa dữ liệu tài chính" subtitle="Xóa ví, giao dịch, danh mục và ngân sách trên thiết bị" onPress={handleClearFinancialData} danger />
        </SettingsGroup>

        <TouchableOpacity
          onPress={handleLogout}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Đăng xuất"
          style={{ marginTop: 22, minHeight: 54, borderRadius: 18, borderWidth: 1, borderColor: themeColor("#F3C8CC", colorScheme), backgroundColor: themeColor("#FFF7F7", colorScheme), flexDirection: "row", alignItems: "center", justifyContent: "center" }}
        >
          <Feather name="log-out" size={17} color=themeColor("#BE123C", colorScheme) style={{ marginRight: 9 }} />
          <Text style={{ color: themeColor("#BE123C", colorScheme), fontSize: 15, fontWeight: "800" }}>Đăng xuất</Text>
        </TouchableOpacity>
        <Text style={{ textAlign: "center", color: themeColor("#9AA6A3", colorScheme), fontSize: 11, marginTop: 20 }}>FINORA · Tài chính rõ ràng, cuộc sống an tâm</Text>
      </ScrollView>
        <Modal
          visible={passwordModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => { setPasswordModalVisible(false); setPassword(""); }}
        >
          <View style={{ flex: 1, justifyContent: "center", padding: 24, backgroundColor: "rgba(15, 23, 42, 0.48)" }}>
            <View style={{ backgroundColor: themeColor("#FFFFFF", colorScheme), borderRadius: 24, padding: 22 }}>
              <Text style={{ color: themeColor("#008F83", colorScheme), fontSize: 20, fontWeight: "800" }}>Xác thực mật khẩu</Text>
              <Text style={{ color: themeColor("#64748B", colorScheme), fontSize: 14, lineHeight: 21, marginTop: 9 }}>Nhập mật khẩu đăng nhập để tiếp tục.</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Mật khẩu đăng nhập"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!verifyingPassword}
                returnKeyType="done"
                onSubmitEditing={handleVerifyPassword}
                style={{ marginTop: 18, borderWidth: 1, borderColor: themeColor("#B8F0E5", colorScheme), borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, color: themeColor("#172033", colorScheme) }}
              />
              <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 20 }}>
                <TouchableOpacity disabled={verifyingPassword} onPress={() => { setPasswordModalVisible(false); setPassword(""); }} style={{ padding: 12, marginRight: 8 }}>
                  <Text style={{ color: themeColor("#64748B", colorScheme), fontWeight: "700" }}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity disabled={!password || verifyingPassword} onPress={() => void handleVerifyPassword()} style={{ paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, backgroundColor: !password || verifyingPassword ? themeColor("#94A3B8", colorScheme) : themeColor("#22B8A8", colorScheme) }}>
                  <Text style={{ color: themeColor("#FFFFFF", colorScheme), fontWeight: "800" }}>{verifyingPassword ? "Đang xác thực..." : "Xác thực"}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScreenContainer>
  );
}
