import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ScreenContainer } from "@/components/screen-container";

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
    <Text
      style={{
        color: "#64748B",
        fontSize: 12,
        fontWeight: "800",
        letterSpacing: 1,
        marginBottom: 10,
        marginLeft: 4,
        textTransform: "uppercase",
      }}
    >
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
            <Text style={{ color: "#008F83", fontSize: 26, fontWeight: "800", letterSpacing: -0.5 }}>
              Về Finora
            </Text>
            <Text style={{ color: "#72817F", fontSize: 13, marginTop: 3 }}>
              Thông tin về ứng dụng
            </Text>
          </View>
        </View>

        <View
          style={{
            borderRadius: 28,
            padding: 22,
            backgroundColor: "#123E36",
            overflow: "hidden",
          }}
        >
          <View
            style={{
              width: 62,
              height: 62,
              borderRadius: 21,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#D4F6E6",
              marginBottom: 17,
            }}
          >
            <Feather name="pie-chart" size={30} color="#12664D" />
          </View>
          <Text style={{ color: "#FFFFFF", fontSize: 30, fontWeight: "900", letterSpacing: -0.8 }}>
            Finora
          </Text>
          <Text style={{ color: "#BDEBD8", fontSize: 14, fontWeight: "700", marginTop: 5 }}>
            Tài chính rõ ràng, cuộc sống an tâm
          </Text>
          <Text style={{ color: "#E1F0EA", fontSize: 14, lineHeight: 21, marginTop: 16 }}>
            Finora giúp cá nhân và gia đình quản lý tài chính hằng ngày, theo dõi dòng tiền và
            hiểu rõ hơn cách mình sử dụng tiền.
          </Text>
        </View>

        <View style={{ marginTop: 24 }}>
          <SectionTitle>Finora giúp bạn</SectionTitle>
          <View
            style={{
              borderRadius: 22,
              backgroundColor: "#FFFFFF",
              borderWidth: 1,
              borderColor: "#E8EEF3",
              paddingHorizontal: 15,
            }}
          >
            {FEATURES.map((feature, index) => (
              <View key={feature.title}>
                {index > 0 ? <View style={{ height: 1, backgroundColor: "#F0F3F5", marginLeft: 52 }} /> : null}
                <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 14 }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 14,
                      backgroundColor: "#E6FAF6",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    <Feather name={feature.icon} size={19} color="#008F83" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: "#172033", fontSize: 14, fontWeight: "800" }}>
                      {feature.title}
                    </Text>
                    <Text style={{ color: "#718096", fontSize: 12, lineHeight: 18, marginTop: 4 }}>
                      {feature.description}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={{ marginTop: 24 }}>
          <SectionTitle>Thông tin ứng dụng</SectionTitle>
          <View
            style={{
              borderRadius: 22,
              backgroundColor: "#FFFFFF",
              borderWidth: 1,
              borderColor: "#E8EEF3",
              padding: 16,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 5 }}>
              <Text style={{ color: "#718096", fontSize: 13 }}>Phiên bản</Text>
              <Text style={{ color: "#172033", fontSize: 13, fontWeight: "800" }}>v{version}</Text>
            </View>
            <View style={{ height: 1, backgroundColor: "#F0F3F5", marginVertical: 9 }} />
            <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 5 }}>
              <Text style={{ color: "#718096", fontSize: 13 }}>Nền tảng</Text>
              <Text style={{ color: "#172033", fontSize: 13, fontWeight: "800" }}>{platformName}</Text>
            </View>
          </View>
        </View>

        <View style={{ marginTop: 24 }}>
          <SectionTitle>Dữ liệu của bạn</SectionTitle>
          <View
            style={{
              borderRadius: 22,
              padding: 17,
              backgroundColor: "#EAF7F1",
              borderWidth: 1,
              borderColor: "#CFEBDD",
              flexDirection: "row",
              alignItems: "flex-start",
            }}
          >
            <Feather name="shield" size={20} color="#008F83" style={{ marginTop: 1, marginRight: 11 }} />
            <Text style={{ flex: 1, color: "#31594D", fontSize: 13, lineHeight: 20 }}>
              Trong phiên bản hiện tại, ví, giao dịch, danh mục và ngân sách được lưu cục bộ trên
              thiết bị. Khi xóa tài khoản khỏi danh sách trên thiết bị, dữ liệu tài chính cục bộ
              thuộc tài khoản đó cũng sẽ bị xóa.
            </Text>
          </View>
        </View>

        <Text
          style={{
            textAlign: "center",
            color: "#8A9995",
            fontSize: 12,
            lineHeight: 18,
            marginTop: 26,
          }}
        >
          FINORA · Tài chính rõ ràng, cuộc sống an tâm
        </Text>
      </ScrollView>
    </ScreenContainer>
  );
}
