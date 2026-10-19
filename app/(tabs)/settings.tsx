import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ScreenContainer } from "@/components/screen-container";
import { FinoraHeaderBanner } from "@/components/ui/finora-header-banner";
import { useAuth } from "@/hooks/use-auth";
import { localLogin } from "@/lib/_core/auth";
import { clearDeviceFinancialData } from "@/src/core/storage/device-store";

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
        backgroundColor: danger ? "#FFF1F2" : "#E6FFFA", marginRight: 12,
      }}>
        <Feather name={icon} size={20} color={danger ? "#BE123C" : "#22B8A8"} strokeWidth={2} />
      </View>
      <View style={{ flex: 1, paddingRight: 8 }}>
        <Text style={{ color: titleColor ?? (danger ? "#BE123C" : "#172033"), fontSize: 15, fontWeight: "700" }}>{title}</Text>
        {subtitle ? <Text style={{ color: "#7B8798", fontSize: 12, marginTop: 4, lineHeight: 17 }}>{subtitle}</Text> : null}
      </View>
      {trailing === "v1.0" ? <Text style={{ color: "#94A3B8", fontSize: 11, fontWeight: "700" }}>{trailing}</Text> : <Feather name="chevron-right" size={20} color={danger ? "#E11D48" : "#94A3B8"} /> }
    </TouchableOpacity>
  );
}

function SettingsGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginTop: 22 }}>
      <Text style={{ marginBottom: 9, marginLeft: 4, color: "#008F83", fontSize: 12, fontWeight: "800", letterSpacing: 1 }}>
        {title.toLocaleUpperCase("vi-VN")}
      </Text>
      <View style={{ overflow: "hidden", borderRadius: 22, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E8EEF3" }}>
        {children}
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

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
    <ScreenContainer className="bg-[#F8FAFC]">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 36 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <View>
            <Text style={{ color: "#008F83", fontSize: 25, fontWeight: "800", letterSpacing: -0.5 }}>Cài đặt</Text>
            <Text style={{ color: "#64748B", fontSize: 14, marginTop: 5 }}>Cá nhân hóa trải nghiệm Finora</Text>
          </View>
          <View style={{ width: 48, height: 48, borderRadius: 17, backgroundColor: "#E6FAF6", alignItems: "center", justifyContent: "center" }}>
            <Feather name="settings" size={23} color="#008F83" />
          </View>
        </View>

        <FinoraHeaderBanner
          eyebrow="HỒ SƠ FINORA"
          title="Tài khoản của bạn"
          subtitle={`${user?.name || "Người dùng Finora"} · ${user?.email ?? "Chưa có thông tin tài khoản"}`}
          badgeText={(user?.name || user?.email || "F").trim().charAt(0).toUpperCase()}
          footer={
            <View style={{ marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#079B8B" }}>
              <Text style={{ color: "#F0FFFC", fontSize: 12, lineHeight: 18 }}>
                Quản lý thông tin đăng nhập và các thiết lập tài chính của bạn tại đây.
              </Text>
            </View>
          }
        />

        <SettingsGroup title="Tài khoản">
          <SettingRow icon="user" title="Thông tin tài khoản" subtitle="Thông tin đăng nhập hiện tại" onPress={() => router.push("/account-information" as never)} titleColor="#008F83" />
          <View style={{ height: 1, backgroundColor: "#F0F3F5", marginLeft: 68 }} />
          <SettingRow icon="shield" title="Danh sách tài khoản" subtitle="Quản lý tài khoản đã lưu trên thiết bị" onPress={() => router.push("/account-list" as never)} />
        </SettingsGroup>

        <SettingsGroup title="Quản lý tài chính">
          <SettingRow icon="tag" title="Danh mục thu chi" subtitle="Tùy chỉnh nhóm thu nhập và chi tiêu" onPress={() => router.push("/category" as never)} titleColor="#008F83" />
          <View style={{ height: 1, backgroundColor: "#F0F3F5", marginLeft: 68 }} />
          <SettingRow icon="sliders" title="Thiết lập tài chính" subtitle="Ví, ngân sách và các thiết lập liên quan" onPress={() => Alert.alert("Thiết lập tài chính", "Các tùy chọn nâng cao sẽ được bổ sung ở bước tiếp theo.")} />
        </SettingsGroup>

        <SettingsGroup title="Ứng dụng">
          <SettingRow icon="droplet" title="Giao diện" subtitle="Màu sắc và chế độ hiển thị" onPress={() => Alert.alert("Giao diện", "Tùy chỉnh giao diện sẽ được bổ sung ở bước tiếp theo.")} titleColor="#008F83" />
          <View style={{ height: 1, backgroundColor: "#F0F3F5", marginLeft: 68 }} />
          <SettingRow icon="life-buoy" title="Trợ giúp & hỗ trợ" subtitle="Hướng dẫn sử dụng Finora" onPress={() => Alert.alert("Trợ giúp & hỗ trợ", "Trung tâm trợ giúp sẽ được bổ sung ở bước tiếp theo.")} titleColor="#008F83" />
          <View style={{ height: 1, backgroundColor: "#F0F3F5", marginLeft: 68 }} />
          <SettingRow icon="info" title="Về Finora" subtitle="Thông tin ứng dụng" onPress={() => router.push("/about" as never)} trailing="v1.0" titleColor="#008F83" />
        </SettingsGroup>

        <SettingsGroup title="Khu vực nguy hiểm">
          <SettingRow icon="trash-2" title="Xóa dữ liệu tài chính" subtitle="Xóa ví, giao dịch, danh mục và ngân sách trên thiết bị" onPress={handleClearFinancialData} danger />
        </SettingsGroup>

        <TouchableOpacity
          onPress={handleLogout}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Đăng xuất"
          style={{ marginTop: 22, minHeight: 54, borderRadius: 18, borderWidth: 1, borderColor: "#F3C8CC", backgroundColor: "#FFF7F7", flexDirection: "row", alignItems: "center", justifyContent: "center" }}
        >
          <Feather name="log-out" size={17} color="#BE123C" style={{ marginRight: 9 }} />
          <Text style={{ color: "#BE123C", fontSize: 15, fontWeight: "800" }}>Đăng xuất</Text>
        </TouchableOpacity>
        <Text style={{ textAlign: "center", color: "#9AA6A3", fontSize: 11, marginTop: 20 }}>FINORA · Tài chính rõ ràng, cuộc sống an tâm</Text>
      </ScrollView>
        <Modal
          visible={passwordModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => { setPasswordModalVisible(false); setPassword(""); }}
        >
          <View style={{ flex: 1, justifyContent: "center", padding: 24, backgroundColor: "rgba(15, 23, 42, 0.48)" }}>
            <View style={{ backgroundColor: "#FFFFFF", borderRadius: 24, padding: 22 }}>
              <Text style={{ color: "#008F83", fontSize: 20, fontWeight: "800" }}>Xác thực mật khẩu</Text>
              <Text style={{ color: "#64748B", fontSize: 14, lineHeight: 21, marginTop: 9 }}>Nhập mật khẩu đăng nhập để tiếp tục.</Text>
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
                style={{ marginTop: 18, borderWidth: 1, borderColor: "#B8F0E5", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, color: "#172033" }}
              />
              <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 20 }}>
                <TouchableOpacity disabled={verifyingPassword} onPress={() => { setPasswordModalVisible(false); setPassword(""); }} style={{ padding: 12, marginRight: 8 }}>
                  <Text style={{ color: "#64748B", fontWeight: "700" }}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity disabled={!password || verifyingPassword} onPress={() => void handleVerifyPassword()} style={{ paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, backgroundColor: !password || verifyingPassword ? "#94A3B8" : "#22B8A8" }}>
                  <Text style={{ color: "#FFFFFF", fontWeight: "800" }}>{verifyingPassword ? "Đang xác thực..." : "Xác thực"}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScreenContainer>
  );
}
