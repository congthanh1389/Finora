import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import * as Auth from "@/lib/_core/auth";

const C = {
  card: "#FFFFFF",
  primary: "#27B99A",
  dark: "#08665D",
  text: "#164F4B",
  muted: "#718C8A",
  border: "#C9EEE3",
  error: "#B4233C",
};

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const resetPassword = async () => {
    if (saving) return;
    setError("");
    setSuccess("");

    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Vui lòng nhập email hợp lệ.");
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

    setSaving(true);
    try {
      await Auth.resetLocalAccountPasswordByEmail(normalizedEmail, newPassword);
      setNewPassword("");
      setConfirmPassword("");
      setSuccess("Đặt lại mật khẩu thành công trên thiết bị này. Bạn có thể đăng nhập bằng mật khẩu mới.");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Không thể đặt lại mật khẩu. Vui lòng thử lại.",
      );
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    minHeight: 52,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    backgroundColor: C.card,
    paddingHorizontal: 14,
    color: C.text,
    fontSize: 15,
  } as const;

  const passwordField = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    visible: boolean,
    toggle: () => void,
    placeholder: string,
  ) => (
    <View style={{ marginTop: 16 }}>
      <Text style={{ color: C.text, fontSize: 14, fontWeight: "700", marginBottom: 8 }}>
        {label}
      </Text>
      <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: C.border, borderRadius: 14, backgroundColor: C.card, paddingRight: 6 }}>
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
          editable={!saving}
          style={{ flex: 1, minHeight: 52, paddingHorizontal: 14, color: C.text, fontSize: 15 }}
        />
        <TouchableOpacity onPress={toggle} accessibilityRole="button" accessibilityLabel={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"} style={{ padding: 10 }}>
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
            Quên mật khẩu
          </Text>
        </View>

        <View style={{ backgroundColor: C.card, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: C.border }}>
          <View style={{ width: 54, height: 54, borderRadius: 18, backgroundColor: "#E6FAF6", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
            <Feather name="lock" size={25} color={C.dark} />
          </View>
          <Text style={{ color: C.text, fontSize: 19, fontWeight: "800", marginBottom: 8 }}>
            Đặt lại mật khẩu
          </Text>
          <Text style={{ color: C.muted, fontSize: 13, lineHeight: 20, marginBottom: 20 }}>
            Nhập email tài khoản đã lưu trên thiết bị này và tạo mật khẩu mới. Không cần mã OTP.
          </Text>

          <Text style={{ color: C.text, fontSize: 14, fontWeight: "700", marginBottom: 8 }}>Email tài khoản</Text>
          <TextInput
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              setError("");
              setSuccess("");
            }}
            placeholder="Nhập email đã đăng ký trên thiết bị"
            placeholderTextColor="#9BAEAA"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!saving}
            style={inputStyle}
          />

          {passwordField("Mật khẩu mới", newPassword, setNewPassword, showPassword, () => setShowPassword((v) => !v), "Ít nhất 6 ký tự")}
          {passwordField("Xác nhận mật khẩu mới", confirmPassword, setConfirmPassword, showConfirm, () => setShowConfirm((v) => !v), "Nhập lại mật khẩu mới")}

          <TouchableOpacity
            onPress={() => { void resetPassword(); }}
            disabled={saving}
            activeOpacity={0.82}
            style={{ minHeight: 54, borderRadius: 16, backgroundColor: saving ? "#8DDCC8" : C.primary, alignItems: "center", justifyContent: "center", flexDirection: "row", marginTop: 22 }}
          >
            {saving ? <ActivityIndicator color="#FFFFFF" style={{ marginRight: 9 }} /> : <Feather name="check-circle" size={18} color="#FFFFFF" style={{ marginRight: 9 }} />}
            <Text style={{ color: "#FFFFFF", fontSize: 15, fontWeight: "800" }}>
              {saving ? "Đang lưu mật khẩu..." : "Đặt lại mật khẩu"}
            </Text>
          </TouchableOpacity>

          {error ? <Text accessibilityRole="alert" style={{ color: C.error, fontSize: 13, lineHeight: 20, marginTop: 16 }}>{error}</Text> : null}
          {success ? <Text accessibilityRole="alert" style={{ color: C.dark, fontSize: 13, lineHeight: 20, marginTop: 16 }}>{success}</Text> : null}

          {success ? (
            <TouchableOpacity
              onPress={() => router.replace("/login" as never)}
              activeOpacity={0.8}
              style={{ minHeight: 52, borderRadius: 15, backgroundColor: C.dark, alignItems: "center", justifyContent: "center", marginTop: 16 }}
            >
              <Text style={{ color: "#FFFFFF", fontSize: 15, fontWeight: "800" }}>Quay lại đăng nhập</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}