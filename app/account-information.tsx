import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";

import { ScreenContainer } from "@/components/screen-container";
import { notifyAuthState, useAuth } from "@/hooks/use-auth";
import * as Auth from "@/lib/_core/auth";

const C = {
  bg: "#F4FBF8",
  white: "#FFFFFF",
  ink: "#12463D",
  text: "#263B38",
  muted: "#738782",
  mint: "#DDF7EE",
  green: "#11745C",
  soft: "#F0FAF6",
  border: "#DDEFE8",
  line: "#EDF4F1",
  darkMint: "#BDEBDD",
};

function ProfileRow({
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
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 14 }}>
        <View style={{ width: 42, height: 42, borderRadius: 15, backgroundColor: C.soft, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
          <Feather name={icon} size={19} color={C.green} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ color: C.muted, fontSize: 12 }}>{label}</Text>
          <Text selectable numberOfLines={2} style={{ color: C.text, fontSize: 14, fontWeight: "700", marginTop: 4 }}>{value}</Text>
        </View>
      </View>
      {!last ? <View style={{ height: 1, backgroundColor: C.line, marginLeft: 68 }} /> : null}
    </View>
  );
}

function ActionRow({
  icon,
  title,
  subtitle,
  onPress,
  danger = false,
  last = false,
}: {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
  danger?: boolean;
  last?: boolean;
}) {
  return (
    <View>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel={title}
        style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 13 }}
      >
        <View style={{ width: 42, height: 42, borderRadius: 15, backgroundColor: danger ? "#FFF1F1" : C.soft, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
          <Feather name={icon} size={19} color={danger ? "#C2414B" : C.green} />
        </View>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text style={{ color: danger ? "#B93843" : C.text, fontSize: 14, fontWeight: "700" }}>{title}</Text>
          <Text style={{ color: C.muted, fontSize: 12, marginTop: 4, lineHeight: 17 }}>{subtitle}</Text>
        </View>
        <Feather name="chevron-right" size={19} color={danger ? "#D46B73" : "#91AAA2"} />
      </TouchableOpacity>
      {!last ? <View style={{ height: 1, backgroundColor: C.line, marginLeft: 68 }} /> : null}
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginTop: 20 }}>
      <Text style={{ marginBottom: 9, marginLeft: 4, color: C.ink, fontSize: 14, fontWeight: "800" }}>{title}</Text>
      <View style={{ overflow: "hidden", borderRadius: 21, backgroundColor: C.white, borderWidth: 1, borderColor: C.border }}>
        {children}
      </View>
    </View>
  );
}

export default function AccountInformationScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [editorVisible, setEditorVisible] = useState(false);
  const [nameDraft, setNameDraft] = useState(user?.name ?? "");
  const [savingName, setSavingName] = useState(false);

  const displayName = user?.name?.trim() || "Người dùng Finora";
  const email = user?.email?.trim() || "Chưa có email";
  const initial = useMemo(
    () => (user?.name || user?.email || "F").trim().charAt(0).toUpperCase() || "F",
    [user?.email, user?.name],
  );
  const loginMethod = user?.loginMethod || "Tài khoản Finora";
  const lastSignedIn = user?.lastSignedIn
    ? new Date(user.lastSignedIn).toLocaleString("vi-VN")
    : "Đang sử dụng trên thiết bị này";

  function openEditor() {
    if (!user) {
      Alert.alert("Chưa đăng nhập", "Vui lòng đăng nhập để chỉnh sửa hồ sơ.");
      return;
    }
    setNameDraft(user.name ?? "");
    setEditorVisible(true);
  }

  async function saveName() {
    const value = nameDraft.trim();
    if (value.length < 2 || value.length > 60) {
      Alert.alert("Tên hiển thị chưa hợp lệ", "Tên cần có từ 2 đến 60 ký tự.");
      return;
    }
    if (!user || savingName) return;
    if (Platform.OS === "web") {
      Alert.alert("Chưa hỗ trợ trên Web", "Hiện tại chức năng đổi tên hỗ trợ tài khoản lưu cục bộ trên Android.");
      return;
    }

    setSavingName(true);
    try {
      const updatedUser = await Auth.localUpdateAccountName(user.id, value);
      notifyAuthState(updatedUser);
      setEditorVisible(false);
      Alert.alert("Đã cập nhật", "Tên hiển thị đã được lưu trên thiết bị.");
    } catch (error) {
      Alert.alert(
        "Chưa thể cập nhật",
        error instanceof Error
          ? error.message
          : "Không thể cập nhật tên hiển thị. Vui lòng thử lại.",
      );
    } finally {
      setSavingName(false);
    }
  }

  function showSecurityInfo() {
    Alert.alert(
      "Bảo mật tài khoản",
      `Phương thức đăng nhập: ${loginMethod}. Nếu bạn đăng nhập qua nhà cung cấp bên ngoài, hãy quản lý mật khẩu tại nhà cung cấp đó.`,
    );
  }

  function showSessionInfo() {
    Alert.alert(
      "Phiên đăng nhập hiện tại",
      `Phương thức: ${loginMethod}\nĐăng nhập gần nhất: ${lastSignedIn}`,
    );
  }

  function signOut() {
    Alert.alert("Đăng xuất khỏi Finora?", "Bạn sẽ cần đăng nhập lại để tiếp tục sử dụng tài khoản.", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: () => {
          void (async () => {
            await logout();
            router.replace("/login" as never);
          })();
        },
      },
    ]);
  }

  return (
    <ScreenContainer className="bg-[#F4FBF8]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 14, paddingBottom: 36 }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 18 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Quay lại cài đặt"
            style={{ width: 42, height: 42, borderRadius: 15, backgroundColor: C.white, borderWidth: 1, borderColor: C.border, alignItems: "center", justifyContent: "center", marginRight: 12 }}
          >
            <Feather name="arrow-left" size={20} color={C.ink} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ color: C.ink, fontSize: 25, fontWeight: "800", letterSpacing: -0.5 }}>Thông tin tài khoản của tôi</Text>
            <Text style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>Hồ sơ và trạng thái đăng nhập</Text>
          </View>
        </View>

        <View style={{ borderRadius: 24, padding: 17, backgroundColor: C.white, borderWidth: 1, borderColor: C.darkMint, shadowColor: "#347D68", shadowOpacity: 0.07, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 2 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ width: 66, height: 66, borderRadius: 23, backgroundColor: C.mint, borderWidth: 1, borderColor: "#C5F0E1", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
              <Text style={{ color: C.green, fontSize: 28, fontWeight: "800" }}>{initial}</Text>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ color: C.green, fontSize: 11, fontWeight: "800", letterSpacing: 0.8 }}>HỒ SƠ CỦA BẠN</Text>
              <Text numberOfLines={2} style={{ color: C.ink, fontSize: 18, fontWeight: "800", marginTop: 5 }}>{displayName}</Text>
              <Text numberOfLines={2} style={{ color: C.muted, fontSize: 12, marginTop: 3 }}>{email}</Text>
            </View>
            <TouchableOpacity
              onPress={openEditor}
              accessibilityRole="button"
              accessibilityLabel="Chỉnh sửa tên hiển thị"
              style={{ flexDirection: "row", alignItems: "center", borderRadius: 13, paddingHorizontal: 9, paddingVertical: 9, backgroundColor: C.soft, borderWidth: 1, borderColor: "#D8F0E6" }}
            >
              <Feather name="edit-2" size={14} color={C.green} />
              <Text style={{ color: C.green, fontSize: 12, fontWeight: "800", marginLeft: 5 }}>Chỉnh sửa</Text>
            </TouchableOpacity>
          </View>

          <View style={{ marginTop: 16, borderRadius: 15, backgroundColor: C.soft, paddingHorizontal: 12, paddingVertical: 11, flexDirection: "row", alignItems: "center" }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: user ? "#19A879" : "#D97706", marginRight: 9 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: user ? C.green : "#9A5B13", fontSize: 13, fontWeight: "800" }}>{user ? "Đang đăng nhập" : "Chưa đăng nhập"}</Text>
              <Text style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>{user ? "Phiên tài khoản trên thiết bị này" : "Vui lòng đăng nhập để xem hồ sơ"}</Text>
            </View>
            <Feather name="shield-check" size={19} color="#20A783" />
          </View>
        </View>

        <Section title="Thông tin tài khoản">
          <ProfileRow icon="mail" label="Email đăng nhập" value={email} />
          <ProfileRow icon="key" label="Phương thức đăng nhập" value={loginMethod} />
          <ProfileRow icon="user" label="Tên hiển thị" value={displayName} last />
        </Section>

        <Section title="Quản lý hồ sơ">
          <ActionRow icon="edit-3" title="Đổi tên hiển thị" subtitle="Tên xuất hiện trên hồ sơ và trong ứng dụng" onPress={openEditor} />
          <ActionRow icon="shield" title="Bảo mật tài khoản" subtitle="Xem phương thức đăng nhập và hướng dẫn bảo mật" onPress={showSecurityInfo} />
          <ActionRow icon="smartphone" title="Phiên đăng nhập hiện tại" subtitle={lastSignedIn} onPress={showSessionInfo} />
          <ActionRow icon="log-out" title="Đăng xuất" subtitle="Kết thúc phiên đăng nhập trên thiết bị này" onPress={signOut} danger last />
        </Section>

        <View style={{ marginTop: 17, padding: 14, borderRadius: 17, backgroundColor: "#E8F8F1", flexDirection: "row", alignItems: "flex-start" }}>
          <Feather name="info" size={17} color={C.green} style={{ marginRight: 9, marginTop: 1 }} />
          <Text style={{ flex: 1, color: "#56736A", fontSize: 12, lineHeight: 18 }}>
            Email và phương thức đăng nhập được hiển thị để bạn kiểm tra. Tên hiển thị có thể chỉnh sửa với tài khoản lưu cục bộ được hỗ trợ. Quản lý tài khoản đã lưu trên thiết bị trong mục “Danh sách tài khoản”.
          </Text>
        </View>
        <Text style={{ textAlign: "center", color: "#93A8A0", fontSize: 11, marginTop: 20 }}>FINORA · Tài chính rõ ràng, cuộc sống an tâm</Text>
      </ScrollView>

      <Modal visible={editorVisible} transparent animationType="fade" onRequestClose={() => !savingName && setEditorVisible(false)}>
        <View style={{ flex: 1, justifyContent: "center", padding: 24, backgroundColor: "rgba(12, 47, 39, 0.42)" }}>
          <View style={{ borderRadius: 24, padding: 22, backgroundColor: C.white, borderWidth: 1, borderColor: C.border }}>
            <Text style={{ color: C.ink, fontSize: 21, fontWeight: "800" }}>Chỉnh sửa hồ sơ</Text>
            <Text style={{ color: C.muted, fontSize: 13, lineHeight: 19, marginTop: 7 }}>Cập nhật tên hiển thị của bạn trên Finora.</Text>
            <Text style={{ color: C.text, fontSize: 13, fontWeight: "700", marginTop: 18, marginBottom: 7 }}>Tên hiển thị</Text>
            <TextInput
              value={nameDraft}
              onChangeText={setNameDraft}
              autoFocus
              maxLength={60}
              editable={!savingName}
              placeholder="Nhập tên hiển thị"
              placeholderTextColor="#94A3B8"
              returnKeyType="done"
              onSubmitEditing={() => void saveName()}
              accessibilityLabel="Tên hiển thị"
              style={{ borderWidth: 1, borderColor: "#CFE8DE", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, color: C.text, fontSize: 16 }}
            />
            <Text style={{ color: C.muted, fontSize: 11, marginTop: 6 }}>{nameDraft.trim().length}/60 ký tự · Tối thiểu 2 ký tự</Text>
            <View style={{ flexDirection: "row", gap: 10, marginTop: 20 }}>
              <TouchableOpacity
                onPress={() => setEditorVisible(false)}
                disabled={savingName}
                style={{ flex: 1, alignItems: "center", paddingVertical: 13, borderRadius: 14, backgroundColor: "#F0F6F3", opacity: savingName ? 0.6 : 1 }}
              >
                <Text style={{ color: "#52615D", fontWeight: "700" }}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => void saveName()}
                disabled={savingName}
                style={{ flex: 1, flexDirection: "row", gap: 8, justifyContent: "center", alignItems: "center", paddingVertical: 13, borderRadius: 14, backgroundColor: C.green, opacity: savingName ? 0.7 : 1 }}
              >
                {savingName ? <ActivityIndicator size="small" color={C.white} /> : null}
                <Text style={{ color: C.white, fontWeight: "800" }}>{savingName ? "Đang lưu..." : "Lưu thay đổi"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
