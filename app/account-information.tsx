import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ActivityIndicator, Alert, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/hooks/use-auth";
import * as Auth from "@/lib/_core/auth";
import { trpc } from "@/lib/trpc";

type RowProps = {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
  danger?: boolean;
};

function AccountRow({ icon, title, subtitle, onPress, danger = false }: RowProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={{ flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 14 }}
    >
      <View style={{ width: 40, height: 40, borderRadius: 14, backgroundColor: danger ? "#FFF1F2" : "#ECFDF5", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
        <Feather name={icon} size={19} color={danger ? "#BE123C" : "#138363"} />
      </View>
      <View style={{ flex: 1, paddingRight: 8 }}>
        <Text style={{ color: danger ? "#BE123C" : "#172033", fontSize: 14, fontWeight: "700" }}>{title}</Text>
        <Text style={{ color: "#7B8798", fontSize: 12, marginTop: 4, lineHeight: 17 }}>{subtitle}</Text>
      </View>
      <Feather name="chevron-right" size={19} color={danger ? "#E11D48" : "#94A3B8"} />
    </TouchableOpacity>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
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

export default function AccountInformationScreen() {
  const router = useRouter();
  const { user, refresh, logout } = useAuth();
  const [isNameEditorVisible, setIsNameEditorVisible] = useState(false);
  const [nameDraft, setNameDraft] = useState(user?.name ?? "");
  const updateDisplayName = trpc.auth.updateDisplayName.useMutation();
  const displayName = user?.name?.trim() || "Người dùng Finora";
  const email = user?.email?.trim() || "Chưa có email";
  const initials = useMemo(() => (user?.name || user?.email || "F").trim().charAt(0).toUpperCase(), [user?.email, user?.name]);

  async function saveDisplayName() {
    const name = nameDraft.trim();
    if (name.length < 2 || name.length > 60) {
      Alert.alert("Tên hiển thị chưa hợp lệ", "Tên cần có từ 2 đến 60 ký tự.");
      return;
    }

    try {
      await updateDisplayName.mutateAsync({ name });
      if (user) {
        await Auth.setUserInfo({ ...user, name });
      }
      await refresh();
      setIsNameEditorVisible(false);
      Alert.alert("Đã cập nhật", "Tên hiển thị của bạn đã được lưu.");
    } catch {
      Alert.alert("Chưa thể cập nhật", "Không lưu được tên hiển thị. Hãy kiểm tra kết nối và thử lại.");
    }
  }

  function openNameEditor() {
    setNameDraft(user?.name ?? "");
    setIsNameEditorVisible(true);
  }

  return (
    <ScreenContainer className="bg-[#F5F8F7]">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 36 }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
          <TouchableOpacity onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Quay lại" style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E2EDE8", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
            <Feather name="arrow-left" size={20} color="#12664D" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ color: "#122D2A", fontSize: 27, fontWeight: "800", letterSpacing: -0.7 }}>Thông tin tài khoản</Text>
            <Text style={{ color: "#72817F", fontSize: 13, marginTop: 4 }}>Quản lý hồ sơ và bảo mật</Text>
          </View>
        </View>

        <View style={{ borderRadius: 26, padding: 20, backgroundColor: "#123E36" }}>
          <View style={{ alignItems: "center" }}>
            <View style={{ width: 76, height: 76, borderRadius: 26, backgroundColor: "#D4F6E6", alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: "#12664D", fontSize: 31, fontWeight: "800" }}>{initials}</Text>
            </View>
            <Text numberOfLines={1} style={{ maxWidth: "100%", color: "#FFFFFF", fontSize: 20, fontWeight: "800", marginTop: 13 }}>{displayName}</Text>
            <Text numberOfLines={1} style={{ maxWidth: "100%", color: "#D1E6DE", fontSize: 13, marginTop: 5 }}>{email}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#24594D", borderRadius: 20, paddingHorizontal: 11, paddingVertical: 6, marginTop: 13 }}>
              <Feather name="shield" size={13} color="#BDEBD8" />
              <Text style={{ color: "#BDEBD8", fontSize: 11, fontWeight: "700", marginLeft: 6 }}>Tài khoản đang đăng nhập</Text>
            </View>
          </View>
        </View>

        <Group title="Hồ sơ">
          <AccountRow icon="user" title="Tên hiển thị" subtitle={displayName} onPress={openNameEditor} />
          <View style={{ height: 1, backgroundColor: "#F0F3F5", marginLeft: 66 }} />
          <AccountRow icon="mail" title="Email đăng nhập" subtitle={email} onPress={() => Alert.alert("Email đăng nhập", email)} />
        </Group>

        <Group title="Bảo mật">
          <AccountRow icon="lock" title="Đổi mật khẩu" subtitle="Cập nhật mật khẩu đăng nhập" onPress={() => Alert.alert("Đổi mật khẩu", "Tài khoản hiện đăng nhập qua nhà cung cấp OAuth. Chức năng đổi mật khẩu cần được xử lý tại nhà cung cấp đăng nhập.")} />
        </Group>

        <Group title="Phiên đăng nhập">
          <AccountRow icon="smartphone" title="Phiên hiện tại" subtitle={user?.loginMethod ? `Đăng nhập bằng ${user.loginMethod}` : "Tài khoản đang sử dụng trên thiết bị này"} onPress={() => Alert.alert("Phiên đăng nhập", `Tài khoản: ${displayName}\nPhương thức: ${user?.loginMethod || "Không xác định"}\nĐăng nhập gần nhất: ${user?.lastSignedIn ? new Date(user.lastSignedIn).toLocaleString("vi-VN") : "Không có dữ liệu"}`)} />
          <View style={{ height: 1, backgroundColor: "#F0F3F5", marginLeft: 66 }} />
          <AccountRow
            icon="log-out"
            title="Đăng xuất"
            subtitle="Xóa phiên đăng nhập khỏi thiết bị này"
            onPress={() =>
              Alert.alert(
                "Đăng xuất khỏi Finora?",
                "Bạn sẽ cần đăng nhập lại để tiếp tục sử dụng tài khoản.",
                [
                  { text: "Hủy", style: "cancel" },
                  {
                    text: "Đăng xuất",
                    style: "destructive",
                    onPress: () => {
                      void (async () => {
                        await logout();
                        router.replace("/(tabs)" as never);
                        Alert.alert("Đã đăng xuất", "Phiên đăng nhập trên thiết bị này đã được xóa.");
                      })();
                    },
                  },
                ],
              )
            }
          />
        </Group>

        <Group title="Quản lý dữ liệu">
          <AccountRow icon="database" title="Dữ liệu tài chính" subtitle="Ví, giao dịch, danh mục và ngân sách" onPress={() => Alert.alert("Quản lý dữ liệu", "Thao tác xóa dữ liệu tài chính vẫn được quản lý riêng trong Cài đặt để tránh xóa nhầm.")} />
        </Group>

        <Text style={{ textAlign: "center", color: "#9AA6A3", fontSize: 11, marginTop: 22 }}>FINORA · Tài chính rõ ràng, cuộc sống an tâm</Text>
      </ScrollView>

      <Modal visible={isNameEditorVisible} transparent animationType="fade" onRequestClose={() => setIsNameEditorVisible(false)}>
        <View style={{ flex: 1, justifyContent: "center", padding: 24, backgroundColor: "rgba(15, 23, 42, 0.45)" }}>
          <View style={{ borderRadius: 24, padding: 22, backgroundColor: "#FFFFFF" }}>
            <Text style={{ color: "#122D2A", fontSize: 21, fontWeight: "800" }}>Đổi tên hiển thị</Text>
            <Text style={{ color: "#72817F", fontSize: 13, lineHeight: 19, marginTop: 7 }}>Tên mới sẽ hiển thị trên hồ sơ tài khoản Finora.</Text>
            <TextInput
              value={nameDraft}
              onChangeText={setNameDraft}
              autoFocus
              maxLength={60}
              placeholder="Nhập tên hiển thị"
              placeholderTextColor="#94A3B8"
              returnKeyType="done"
              onSubmitEditing={() => void saveDisplayName()}
              style={{ marginTop: 18, borderWidth: 1, borderColor: "#D8E7E0", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, color: "#172033", fontSize: 16 }}
            />
            <Text style={{ color: "#94A3B8", fontSize: 11, marginTop: 6 }}>Từ 2 đến 60 ký tự</Text>
            <View style={{ flexDirection: "row", gap: 10, marginTop: 20 }}>
              <TouchableOpacity onPress={() => setIsNameEditorVisible(false)} disabled={updateDisplayName.isPending} style={{ flex: 1, alignItems: "center", paddingVertical: 13, borderRadius: 14, backgroundColor: "#F1F5F4" }}>
                <Text style={{ color: "#52615D", fontWeight: "700" }}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => void saveDisplayName()} disabled={updateDisplayName.isPending} style={{ flex: 1, flexDirection: "row", gap: 8, justifyContent: "center", alignItems: "center", paddingVertical: 13, borderRadius: 14, backgroundColor: updateDisplayName.isPending ? "#86CDB3" : "#138363" }}>
                {updateDisplayName.isPending ? <ActivityIndicator color="#FFFFFF" size="small" /> : null}
                <Text style={{ color: "#FFFFFF", fontWeight: "800" }}>Lưu thay đổi</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
