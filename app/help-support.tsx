import { useState } from "react";
import { Alert, Linking, Pressable, ScrollView, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { FinoraProfilePageHeader } from "@/components/ui/finora-profile-page-header";

const SUPPORT_EMAIL = "sali.vn89@gmail.com";

const FAQS = [
  {
    question: "Bắt đầu sử dụng Finora như thế nào?",
    answer: "Mở mục Ví để kiểm tra các ví đang có, sau đó thêm giao dịch thu hoặc chi. Hãy chọn đúng ví, danh mục và ngày giao dịch để báo cáo phản ánh chính xác.",
  },
  {
    question: "Làm thế nào để quản lý ví và giao dịch?",
    answer: "Vào mục Ví để theo dõi số dư; dùng mục Giao dịch để xem lịch sử và thêm hoặc chỉnh sửa giao dịch. Kiểm tra ví và danh mục trước khi lưu.",
  },
  {
    question: "Tôi xem báo cáo thu chi ở đâu?",
    answer: "Mở mục Báo cáo để xem tổng thu, tổng chi, dòng tiền và phân tích theo danh mục. Bạn có thể chọn khoảng thời gian phù hợp để đối chiếu.",
  },
  {
    question: "Dữ liệu tài chính được lưu ở đâu?",
    answer: "Phiên bản hiện tại lưu dữ liệu tài chính cục bộ trên thiết bị. Hãy giữ thiết bị an toàn và thận trọng khi xóa dữ liệu tài chính hoặc xóa tài khoản khỏi thiết bị.",
  },
  {
    question: "Tôi cần hỗ trợ hoặc muốn báo lỗi thì làm sao?",
    answer: "Gửi email đến địa chỉ hỗ trợ của Finora. Mô tả các bước dẫn đến vấn đề và kết quả bạn mong đợi. Không gửi mật khẩu, mã OTP hoặc thông tin ngân hàng nhạy cảm.",
  },
];

export default function HelpSupportScreen() {
  const router = useRouter();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const contactSupport = async () => {
    const subject = encodeURIComponent("Yêu cầu hỗ trợ Finora");
    const body = encodeURIComponent(
      "Xin chào đội ngũ hỗ trợ Finora,\n\nTôi cần hỗ trợ về vấn đề sau:\n\nCác bước gặp vấn đề:\n\nKết quả mong đợi:\n\nThiết bị / phiên bản ứng dụng (nếu biết):\n",
    );
    const url = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert("Không thể mở ứng dụng email", `Bạn có thể gửi email trực tiếp đến ${SUPPORT_EMAIL}.`);
    }
  };

  return (
    <ScreenContainer className="bg-[#EAF9F4] dark:bg-[#10211F]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 10, paddingBottom: 34 }}
      >
        <FinoraProfilePageHeader
          title="Trợ giúp & hỗ trợ"
          onBack={() => router.back()}
          onSettings={() => router.push("/(tabs)/settings" as never)}
        />

        <View style={{ borderRadius: 26, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#D9F1E8", padding: 20 }}>
          <View style={{ width: 52, height: 52, borderRadius: 18, backgroundColor: "#E4F8F0", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
            <Feather name="life-buoy" size={26} color="#087F8C" />
          </View>
          <Text style={{ color: "#164F4B", fontSize: 22, lineHeight: 29, fontWeight: "900" }}>
            Chúng tôi sẵn sàng hỗ trợ bạn
          </Text>
          <Text style={{ color: "#647F7A", fontSize: 14, lineHeight: 21, marginTop: 8 }}>
            Tìm câu trả lời nhanh hoặc liên hệ đội ngũ hỗ trợ nếu bạn gặp khó khăn khi sử dụng Finora.
          </Text>
          <Pressable
            onPress={() => void contactSupport()}
            accessibilityRole="button"
            style={({ pressed }) => ({
              marginTop: 18,
              minHeight: 52,
              borderRadius: 16,
              backgroundColor: pressed ? "#087F8C" : "#0EA5A8",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 14,
            })}
          >
            <Feather name="mail" size={18} color="#FFFFFF" style={{ marginRight: 9 }} />
            <Text style={{ color: "#FFFFFF", fontSize: 15, fontWeight: "800" }}>Gửi email hỗ trợ</Text>
          </Pressable>
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 14, padding: 12, borderRadius: 14, backgroundColor: "#F0FBF6" }}>
            <Feather name="at-sign" size={17} color="#087F8C" style={{ marginRight: 9 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#718C8A", fontSize: 11, fontWeight: "700" }}>EMAIL HỖ TRỢ</Text>
              <Text selectable style={{ color: "#08665D", fontSize: 14, fontWeight: "800", marginTop: 3 }}>{SUPPORT_EMAIL}</Text>
            </View>
          </View>
        </View>

        <View style={{ marginTop: 24 }}>
          <Text style={{ color: "#164F4B", fontSize: 18, fontWeight: "900", marginBottom: 10, marginLeft: 2 }}>
            Câu hỏi thường gặp
          </Text>
          <View style={{ borderRadius: 24, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#D9F1E8", paddingHorizontal: 15 }}>
            {FAQS.map((faq, index) => {
              const expanded = expandedIndex === index;
              return (
                <View key={faq.question}>
                  {index > 0 ? <View style={{ height: 1, backgroundColor: "#EAF2EF" }} /> : null}
                  <Pressable
                    onPress={() => setExpandedIndex(expanded ? null : index)}
                    accessibilityRole="button"
                    accessibilityState={{ expanded }}
                    style={{ flexDirection: "row", alignItems: "center", paddingVertical: 16 }}
                  >
                    <Text style={{ flex: 1, paddingRight: 12, color: "#164F4B", fontSize: 14, lineHeight: 20, fontWeight: "800" }}>
                      {faq.question}
                    </Text>
                    <Feather name={expanded ? "minus-circle" : "plus-circle"} size={19} color="#0EA5A8" />
                  </Pressable>
                  {expanded ? (
                    <Text style={{ color: "#647F7A", fontSize: 13, lineHeight: 21, paddingBottom: 16, paddingRight: 8 }}>
                      {faq.answer}
                    </Text>
                  ) : null}
                </View>
              );
            })}
          </View>
        </View>

        <View style={{ marginTop: 20, borderRadius: 20, backgroundColor: "#DFF6ED", borderWidth: 1, borderColor: "#C9EEE3", padding: 16, flexDirection: "row", alignItems: "flex-start" }}>
          <Feather name="shield" size={19} color="#08665D" style={{ marginRight: 10, marginTop: 1 }} />
          <Text style={{ flex: 1, color: "#35665F", fontSize: 12, lineHeight: 19 }}>
            Để bảo vệ tài khoản, vui lòng không gửi mật khẩu, mã OTP, mã xác minh hoặc thông tin ngân hàng nhạy cảm qua email hỗ trợ.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
