import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { Platform, ScrollView, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ScreenContainer } from "@/components/screen-container";
import { FinoraProfilePageHeader } from "@/components/ui/finora-profile-page-header";

type Feature = {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  description: string;
};

const FEATURES: Feature[] = [
  {
    icon: "repeat",
    title: "Theo dõi thu chi",
    description: "Ghi nhận thu nhập, chi tiêu và chuyển tiền giữa các ví.",
  },
  {
    icon: "credit-card",
    title: "Quản lý ví",
    description: "Theo dõi nhiều ví và xem số dư theo từng loại tiền.",
  },
  {
    icon: "target",
    title: "Ngân sách & danh mục",
    description: "Tổ chức khoản thu chi và theo dõi kế hoạch ngân sách.",
  },
  {
    icon: "bar-chart-2",
    title: "Báo cáo & nhắc nhở",
    description: "Xem tổng quan dòng tiền và những điểm cần lưu ý.",
  },
];

function SectionTitle({ children }: { children: string }) {
  return (
    <Text style={{ color: "#164F4B", fontSize: 18, fontWeight: "800", marginBottom: 7, marginLeft: 2 }}>
      {children}
    </Text>
  );
}

export default function AboutFinoraScreen() {
  const router = useRouter();
  const version = Constants.expoConfig?.version ?? "Chưa xác định";
  const platformName =
    Platform.OS === "android" ? "Android" : Platform.OS === "ios" ? "iOS" : "Web";

  return (
    <ScreenContainer className="bg-[#EAF9F4]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 10, paddingBottom: 32 }}
      >
        <FinoraProfilePageHeader
          title="Về Finora"
          onBack={() => router.back()}
          onSettings={() => router.push("/(tabs)/settings" as never)}
        />

        <View style={{ borderRadius: 25, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E0F4ED", padding: 18 }}>
          <Text style={{ color: "#164F4B", fontSize: 14, lineHeight: 21 }}>
            Finora giúp cá nhân và gia đình quản lý tài chính hằng ngày, theo dõi dòng tiền và hiểu rõ hơn cách mình sử dụng tiền.
          </Text>
        </View>

        <View style={{ marginTop: 20 }}>
          <SectionTitle>Finora giúp bạn</SectionTitle>
          <View
            style={{
              borderRadius: 25,
              backgroundColor: "#FFFFFF",
              borderWidth: 1,
              borderColor: "#E0F4ED",
              paddingHorizontal: 15,
            }}
          >
            {FEATURES.map((feature, index) => (
              <View key={feature.title}>
                {index > 0 ? <View style={{ height: 1, backgroundColor: "#EAF2EF", marginLeft: 52 }} /> : null}
                <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 14 }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 14,
                      backgroundColor: "#E8F8F2",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    <Feather name={feature.icon} size={19} color="#08665D" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: "#164F4B", fontSize: 14, fontWeight: "800" }}>
                      {feature.title}
                    </Text>
                    <Text style={{ color: "#718C8A", fontSize: 12, lineHeight: 18, marginTop: 4 }}>
                      {feature.description}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={{ marginTop: 20 }}>
          <SectionTitle>Thông tin ứng dụng</SectionTitle>
          <View
            style={{
              borderRadius: 25,
              backgroundColor: "#FFFFFF",
              borderWidth: 1,
              borderColor: "#E0F4ED",
              padding: 16,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 5 }}>
              <Text style={{ color: "#718C8A", fontSize: 13 }}>Phiên bản</Text>
              <Text style={{ color: "#164F4B", fontSize: 13, fontWeight: "800" }}>v{version}</Text>
            </View>
            <View style={{ height: 1, backgroundColor: "#EAF2EF", marginVertical: 9 }} />
            <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 5 }}>
              <Text style={{ color: "#718C8A", fontSize: 13 }}>Nền tảng</Text>
              <Text style={{ color: "#164F4B", fontSize: 13, fontWeight: "800" }}>{platformName}</Text>
            </View>
          </View>
        </View>

        <View style={{ marginTop: 20 }}>
          <SectionTitle>Dữ liệu của bạn</SectionTitle>
          <View
            style={{
              borderRadius: 20,
              padding: 17,
              backgroundColor: "#DFF6ED",
              borderWidth: 1,
              borderColor: "#C9EEE3",
              flexDirection: "row",
              alignItems: "flex-start",
            }}
          >
            <Feather name="shield" size={20} color="#08665D" style={{ marginTop: 1, marginRight: 11 }} />
            <Text style={{ flex: 1, color: "#164F4B", fontSize: 13, lineHeight: 20 }}>
              Trong phiên bản hiện tại, ví, giao dịch, danh mục và ngân sách được lưu cục bộ trên
              thiết bị. Khi xóa tài khoản khỏi danh sách trên thiết bị, dữ liệu tài chính cục bộ
              thuộc tài khoản đó cũng sẽ bị xóa.
            </Text>
          </View>
        </View>

        <Text style={{ textAlign: "center", color: "#718C8A", fontSize: 10, lineHeight: 18, marginTop: 22 }}>
          FINORA · Tài chính rõ ràng, cuộc sống an tâm
        </Text>
      </ScrollView>
    </ScreenContainer>
  );
}
