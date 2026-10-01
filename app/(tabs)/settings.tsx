import { Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";

export default function CitScreen() {
  return (
    <ScreenContainer className="bg-[#F8FAFC] px-5 pt-6">
      <View className="rounded-3xl border border-[#E2E8F0] bg-white p-5">
        <Text className="text-2xl font-bold text-[#0F2A5F]">Cài đặt</Text>
        <Text className="mt-2 text-sm text-[#64748B]">Màn hình đang được triển khai trong các Phase tiếp theo.</Text>
      </View>
    </ScreenContainer>
  );
}
