import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/hooks/use-auth";
import { changeLocalAccountPassword } from "@/lib/_core/auth";

const C = {
  background: "#EAF9F4",
  card: "#FFFFFF",
  primary: "#27B99A",
  dark: "#08665D",
  text: "#164F4B",
  muted: "#718C8A",
  border: "#C9EEE3",
  error: "#B4233C",
};

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const changePassword = async () => {
    if (saving) return;
    setError("");
    setSuccess("");

    if (!user?.id) {
      setError("Bạn cần đăng nhập để đổi mật khẩu.");
      return;
    }
    if (!currentPassword) {
      setError("Vui lòng nhập mật khẩu hiện tại.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    if (newPassword === currentPassword) {
      setError("Mật khẩu mới phải khác mật khẩu hiện tại.");
      return;
    }

    setSaving(true);
    try {
      await changeLocalAccountPassword(
        Number(user.id),
        currentPassword,
        newPassword,
      );
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess(
        "Đổi mật khẩu thành công trên thiết bị này. Hãy dùng mật khẩu mới ở lần đăng nhập tiếp theo.",
      );
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Không thể đổi mật khẩu. Vui lòng thử lại.",
      );
    } finally {
      setSaving(false);
    }
  };

  const renderField = (
    label: string,
    value: string,
    placeholder: string,
    visible: boolean,
    toggleVisible: () => void,
    onChangeText: (text: string) => void,
    isCurrent: boolean,
  ) => (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: C.text, fontSize: 14, fontWeight: "700", marginBottom: 8 }}>
        {label}
      </Text>
      <View
        style={{
          minHeight: 54,
          flexDirection: "row",
          alignItems: "center",
          borderWidth: 1,
          borderColor: C.border,
          borderRadius: 15,
          paddingLeft: 14,
          paddingRight: 6,
          backgroundColor: C.card,
        }}
      >
        <TextInput
          value={value}
          onChangeText={(text) => {
            onChangeText(text);
            setError("");
            setSuccess("");
          }}
          placeholder={placeholder}
          placeholderTextColor="#9BAEAA"
          secureTextEntry={!visible}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete={isCurrent ? "current-password" : "new-password"}
          textContentType={isCurrent ? "password" : "newPassword"}
          style={{ flex: 1, color: C.text, fontSize: 15, paddingVertical: 13 }}
          accessibilityLabel={label}
        />
        <TouchableOpacity
          onPress={toggleVisible}
          accessibilityRole="button"
          accessibilityLabel={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          style={{ padding: 10 }}
        >
          <Feather name={visible ? "eye-off" : "eye"} size={19} color={C.dark} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScreenContainer className="bg-[#EAF9F4]">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 36 }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 22 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Quay lại"
            style={{ width: 42, height: 42, justifyContent: "center" }}
          >
            <Feather name="arrow-left" size={24} color={C.dark} />
          </TouchableOpacity>
          <Text style={{ color: C.text, fontSize: 22, fontWeight: "800", marginLeft: 10 }}>
            Đổi mật khẩu
          </Text>
        </View>

        <View
          style={{
            backgroundColor: C.card,
            borderRadius: 24,
            padding: 18,
            borderWidth: 1,
            borderColor: C.border,
          }}
        >
          <View
            style={{
              width: 54,
              height: 54,
              borderRadius: 18,
              backgroundColor: "#E6FAF6",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 14,
            }}
          >
            <Feather name="shield" size={25} color={C.dark} />
          </View>
          <Text style={{ color: C.text, fontSize: 18, fontWeight: "800", marginBottom: 7 }}>
            Bảo mật tài khoản
          </Text>
          <Text style={{ color: C.muted, fontSize: 13, lineHeight: 20, marginBottom: 20 }}>
            Xác nhận mật khẩu hiện tại, sau đó tạo mật khẩu mới có ít nhất 6 ký tự.
            Việc này không thay đổi dữ liệu tài chính.
          </Text>

          {renderField(
            "Mật khẩu hiện tại",
            currentPassword,
            "Nhập mật khẩu hiện tại",
            showCurrent,
            () => setShowCurrent((value) => !value),
            setCurrentPassword,
            true,
          )}
          {renderField(
            "Mật khẩu mới",
            newPassword,
            "Nhập mật khẩu mới",
            showNew,
            () => setShowNew((value) => !value),
            setNewPassword,
            false,
          )}
          {renderField(
            "Xác nhận mật khẩu mới",
            confirmPassword,
            "Nhập lại mật khẩu mới",
            showConfirm,
            () => setShowConfirm((value) => !value),
            setConfirmPassword,
            false,
          )}

          {error ? (
            <Text accessibilityRole="alert" style={{ color: C.error, fontSize: 13, lineHeight: 20, marginBottom: 14 }}>
              {error}
            </Text>
          ) : null}
          {success ? (
            <Text accessibilityRole="alert" style={{ color: C.dark, fontSize: 13, lineHeight: 20, marginBottom: 14 }}>
              {success}
            </Text>
          ) : null}

          <TouchableOpacity
            onPress={() => { void changePassword(); }}
            disabled={saving}
            activeOpacity={0.82}
            accessibilityRole="button"
            style={{
              minHeight: 54,
              borderRadius: 17,
              backgroundColor: saving ? "#8DDCC8" : C.primary,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              marginTop: 2,
            }}
          >
            {saving ? (
              <ActivityIndicator color={C.card} style={{ marginRight: 9 }} />
            ) : (
              <Feather name="lock" size={17} color={C.card} style={{ marginRight: 9 }} />
            )}
            <Text style={{ color: C.card, fontSize: 15, fontWeight: "800" }}>
              {saving ? "Đang cập nhật..." : "Xác nhận đổi mật khẩu"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}