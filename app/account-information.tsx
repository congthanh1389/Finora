import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/hooks/use-auth";

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
  const { user } = useAuth();
  const displayName = user?.name?.trim() || "Người dùng Finora";
  const email = user?.email?.trim() || "Chưa có email";
  const initials = useMemo(() => (user?.name || user?.email || "F").trim().charAt(0).toUpperCase(), [user?.email, user?.name]);

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
          <AccountRow icon="user" title="Tên hiển thị" subtitle={displayName} onPress={() => Alert.alert("Tên hiển thị", "Chỉnh sửa tên hiển thị sẽ được triển khai ở commit tiếp theo.")} />
          <View style={{ height: 1, backgroundColor: "#F0F3F5", marginLeft: 66 }} />
          <AccountRow icon="mail" title="Email đăng nhập" subtitle={email} onPress={() => Alert.alert("Email đăng nhập", email)} />
        </Group>

        <Group title="Bảo mật">
          <AccountRow icon="lock" title="Đổi mật khẩu" subtitle="Cập nhật mật khẩu đăng nhập" onPress={() => Alert.alert("Đổi mật khẩu", "Luồng đổi mật khẩu sẽ được tích hợp sau khi xác minh tương thích với cơ chế đăng nhập hiện tại.")} />
        </Group>

        <Group title="Phiên đăng nhập">
          <AccountRow icon="smartphone" title="Phiên hiện tại" subtitle="Tài khoản đang sử dụng trên thiết bị này" onPress={() => Alert.alert("Phiên đăng nhập", "Đây là thông tin tài khoản đang hoạt động trên thiết bị.")} />
          <View style={{ height: 1, backgroundColor: "#F0F3F5", marginLeft: 66 }} />
          <AccountRow icon="log-out" title="Đăng xuất" subtitle="Kết thúc phiên đăng nhập hiện tại" onPress={() => Alert.alert("Đăng xuất", "Bạn có thể đăng xuất từ màn hình Cài đặt.")} />
        </Group>

        <Group title="Quản lý dữ liệu">
          <AccountRow icon="database" title="Dữ liệu tài chính" subtitle="Ví, giao dịch, danh mục và ngân sách" onPress={() => Alert.alert("Quản lý dữ liệu", "Thao tác xóa dữ liệu tài chính vẫn được quản lý riêng trong Cài đặt để tránh xóa nhầm.")} />
        </Group>

        <Text style={{ textAlign: "center", color: "#9AA6A3", fontSize: 11, marginTop: 22 }}>FINORA · Tài chính rõ ràng, cuộc sống an tâm</Text>
      </ScrollView>
    </ScreenContainer>
  );
}
