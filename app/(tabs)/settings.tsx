import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/hooks/use-auth";
import { clearDeviceFinancialData } from "@/src/core/storage/device-store";
import * as Auth from "@/lib/_core/auth";

type SettingRowProps = {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
  danger?: boolean;
  trailing?: string;
};

function SettingRow({ icon, title, subtitle, onPress, danger = false, trailing = "›" }: SettingRowProps) {
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
        backgroundColor: danger ? "#FFF1F2" : "#ECFDF5", marginRight: 12,
      }}>
        <Feather name={icon} size={20} color={danger ? "#BE123C" : "#138363"} strokeWidth={2} />
      </View>
      <View style={{ flex: 1, paddingRight: 8 }}>
        <Text style={{ color: danger ? "#BE123C" : "#172033", fontSize: 15, fontWeight: "700" }}>{title}</Text>
        {subtitle ? <Text style={{ color: "#7B8798", fontSize: 12, marginTop: 4, lineHeight: 17 }}>{subtitle}</Text> : null}
      </View>
      {trailing === "v1.0" ? <Text style={{ color: "#94A3B8", fontSize: 11, fontWeight: "700" }}>{trailing}</Text> : <Feather name="chevron-right" size={20} color={danger ? "#E11D48" : "#94A3B8"} /> }
    </TouchableOpacity>
  );
}

function SettingsGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginTop: 22 }}>
      <Text style={{ marginBottom: 9, marginLeft: 4, color: "#64748B", fontSize: 12, fontWeight: "800", letterSpacing: 1 }}>
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
  const [deletePassword, setDeletePassword] = useState("");
  const [deletePasswordError, setDeletePasswordError] = useState<string | null>(null);
  const [deletingFinancialData, setDeletingFinancialData] = useState(false);

  const handleClearFinancialData = () => {
    if (!user?.id) {
      Alert.alert("Chưa có tài khoản", "Vui lòng đăng nhập trước khi xóa dữ liệu tài chính.");
      return;
    }

    Alert.alert(
      "Xóa dữ liệu tài chính?",
      "Toàn bộ giao dịch, ví, danh mục và ngân sách sẽ bị xóa. Tài khoản đăng nhập vẫn được giữ lại. Bạn sẽ cần xác nhận mật khẩu đăng nhập trước khi xóa.",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Tiếp tục",
          style: "destructive",
          onPress: () => {
            setDeletePassword("");
            setDeletePasswordError(null);
            setPasswordModalVisible(true);
          },
        },
      ],
    );
  };

  const confirmClearFinancialData = async () => {
    if (!user?.id) {
      setDeletePasswordError("Không tìm thấy tài khoản đang đăng nhập.");
      return;
    }
    if (!deletePassword) {
      setDeletePasswordError("Vui lòng nhập mật khẩu đăng nhập.");
      return;
    }

    try {
      setDeletingFinancialData(true);
      setDeletePasswordError(null);
      const validPassword = await Auth.localVerifyPassword(user.id, deletePassword);
      if (!validPassword) {
        setDeletePasswordError("Mật khẩu đăng nhập không đúng.");
        return;
      }

      await clearDeviceFinancialData(user.id);
      setPasswordModalVisible(false);
      setDeletePassword("");
      Alert.alert("Đã xóa", "Dữ liệu tài chính đã được xóa.");
    } catch (error) {
      setDeletePasswordError(error instanceof Error ? error.message : "Không thể xác minh mật khẩu. Vui lòng thử lại.");
    } finally {
      setDeletingFinancialData(false);
    }
  };

  return (
    <ScreenContainer className="bg-[#F5F8F7]">
        <Modal
          visible={passwordModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => {
            if (!deletingFinancialData) setPasswordModalVisible(false);
          }}
        >
          <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: 24, backgroundColor: "rgba(15, 23, 42, 0.55)" }}>
            <View style={{ borderRadius: 24, padding: 22, backgroundColor: "#FFFFFF" }}>
              <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: "#FFF1F2", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                <Feather name="shield" size={23} color="#BE123C" />
              </View>
              <Text style={{ color: "#172033", fontSize: 20, fontWeight: "800" }}>Xác nhận mật khẩu</Text>
              <Text style={{ color: "#64748B", fontSize: 13, lineHeight: 20, marginTop: 8 }}>
                Nhập mật khẩu đăng nhập hiện tại để xác nhận xóa toàn bộ dữ liệu tài chính trên thiết bị.
              </Text>
              <TextInput
                value={deletePassword}
                onChangeText={(value) => {
                  setDeletePassword(value);
                  if (deletePasswordError) setDeletePasswordError(null);
                }}
                placeholder="Mật khẩu đăng nhập"
                placeholderTextColor="#94A3B8"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!deletingFinancialData}
                returnKeyType="done"
                onSubmitEditing={() => void confirmClearFinancialData()}
                accessibilityLabel="Mật khẩu đăng nhập để xác nhận xóa dữ liệu"
                style={{ minHeight: 52, borderRadius: 14, borderWidth: 1, borderColor: deletePasswordError ? "#FDA4AF" : "#DCE7E2", paddingHorizontal: 14, marginTop: 18, color: "#172033", backgroundColor: "#FFFFFF" }}
              />
              {deletePasswordError ? (
                <Text style={{ color: "#BE123C", fontSize: 12, lineHeight: 18, marginTop: 9 }}>{deletePasswordError}</Text>
              ) : null}
              <View style={{ flexDirection: "row", gap: 10, marginTop: 20 }}>
                <TouchableOpacity
                  onPress={() => setPasswordModalVisible(false)}
                  disabled={deletingFinancialData}
                  style={{ flex: 1, minHeight: 48, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: "#F1F5F9" }}
                >
                  <Text style={{ color: "#475569", fontWeight: "700" }}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => void confirmClearFinancialData()}
                  disabled={deletingFinancialData}
                  style={{ flex: 1, minHeight: 48, borderRadius: 14, alignItems: "center", justifyContent: "center", flexDirection: "row", backgroundColor: deletingFinancialData ? "#FDA4AF" : "#BE123C" }}
                >
                  {deletingFinancialData ? <ActivityIndicator color="#FFFFFF" /> : <Feather name="trash-2" size={16} color="#FFFFFF" />}
                  <Text style={{ color: "#FFFFFF", fontWeight: "800", marginLeft: 7 }}>{deletingFinancialData ? "Đang xóa..." : "Xác nhận xóa"}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
              <Text style={{ color: "#12664D", fontSize: 24, fontWeight: "800" }}>
                {(user?.name || user?.email || "F").trim().charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#BDEBD8", fontSize: 12, fontWeight: "700" }}>TÀI KHOẢN CỦA BẠN</Text>
              <Text numberOfLines={1} style={{ color: "#FFFFFF", fontSize: 17, fontWeight: "800", marginTop: 5 }}>
                {user?.name || "Người dùng Finora"}
              </Text>
              <Text numberOfLines={1} style={{ color: "#D1E6DE", fontSize: 12, marginTop: 3 }}>
                {user?.email ?? "Chưa có thông tin tài khoản"}
              </Text>
            </View>
          </View>
          <View style={{ marginTop: 17, paddingTop: 14, borderTopWidth: 1, borderTopColor: "#326257" }}>
            <Text style={{ color: "#D1E6DE", fontSize: 12, lineHeight: 18 }}>Quản lý thông tin đăng nhập và các thiết lập tài chính của bạn tại đây.</Text>
          </View>
        </View>

        <SettingsGroup title="Tài khoản">
          <SettingRow icon="user" title="Thông tin tài khoản" subtitle="Thông tin đăng nhập hiện tại" onPress={() => Alert.alert("Thông tin tài khoản", user?.email ?? "Chưa có thông tin tài khoản")} />
          <View style={{ height: 1, backgroundColor: "#F0F3F5", marginLeft: 68 }} />
          <SettingRow icon="shield" title="Danh sách tài khoản" subtitle="Quản lý tài khoản đã lưu trên thiết bị" onPress={() => router.push("/account-list" as never)} />
          {user?.loginMethod === "local-password" ? <>
            <View style={{ height: 1, backgroundColor: "#F0F3F5", marginLeft: 68 }} />
            <SettingRow icon="key" title="Đổi mật khẩu đăng nhập" subtitle="Cập nhật mật khẩu cho tài khoản này" onPress={() => router.push("/change-password" as never)} />
          </> : null}
        </SettingsGroup>

        <SettingsGroup title="Quản lý tài chính">
          <SettingRow icon="tag" title="Danh mục thu chi" subtitle="Tùy chỉnh nhóm thu nhập và chi tiêu" onPress={() => router.push("/category" as never)} />
          <View style={{ height: 1, backgroundColor: "#F0F3F5", marginLeft: 68 }} />
          <SettingRow icon="sliders" title="Thiết lập tài chính" subtitle="Ví, ngân sách và các thiết lập liên quan" onPress={() => Alert.alert("Thiết lập tài chính", "Các tùy chọn nâng cao sẽ được bổ sung ở bước tiếp theo.")} />
        </SettingsGroup>

        <SettingsGroup title="Ứng dụng">
          <SettingRow icon="droplet" title="Giao diện" subtitle="Màu sắc và chế độ hiển thị" onPress={() => Alert.alert("Giao diện", "Tùy chỉnh giao diện sẽ được bổ sung ở bước tiếp theo.")} />
          <View style={{ height: 1, backgroundColor: "#F0F3F5", marginLeft: 68 }} />
          <SettingRow icon="life-buoy" title="Trợ giúp & hỗ trợ" subtitle="Hướng dẫn sử dụng Finora" onPress={() => Alert.alert("Trợ giúp & hỗ trợ", "Trung tâm trợ giúp sẽ được bổ sung ở bước tiếp theo.")} />
          <View style={{ height: 1, backgroundColor: "#F0F3F5", marginLeft: 68 }} />
          <SettingRow icon="info" title="Về Finora" subtitle="Thông tin ứng dụng" onPress={() => Alert.alert("Finora", "Ứng dụng quản lý tài chính cá nhân.")} trailing="v1.0" />
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
    </ScreenContainer>
  );
}
