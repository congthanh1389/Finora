import { Feather } from "@expo/vector-icons";
import { startOAuthLogin } from "@/constants/oauth";
import { ScreenContainer } from "@/components/screen-container";
import { useState } from "react";
import { ActivityIndicator, Alert, Image, Text, TouchableOpacity, View } from "react-native";

export default function LoginScreen() {
  const [openingLogin, setOpeningLogin] = useState(false);

  const handleLogin = async () => {
    if (openingLogin) return;
    setOpeningLogin(true);
    try {
      await startOAuthLogin();
      setOpeningLogin(false);
    } catch (error) {
      Alert.alert(
        "Không thể mở đăng nhập",
        error instanceof Error
          ? error.message
          : "Vui lòng thử lại sau.",
      );
      setOpeningLogin(false);
    }
  };

  return (
    <ScreenContainer className="flex-1 bg-[#F3FBF7]">
      <View className="flex-1 justify-center px-6 py-10">
        <Image
          source={require("@/assets/images/icon.png")}
          style={{ width: 148, height: 148, marginBottom: 24 }}
          resizeMode="contain"
          accessibilityLabel="Logo Finora"
        />

        <Text className="text-center text-4xl font-extrabold tracking-tight text-[#123E36]">
          Finora
        </Text>
        <Text className="mt-3 text-center text-base leading-6 text-[#607B72]">
          Tài chính rõ ràng, cuộc sống an tâm.
        </Text>

        <View className="mt-10 rounded-[28px] border border-[#DDEFE6] bg-white p-6">
          <Text className="text-xl font-bold text-[#173D34]">
            Chào mừng trở lại
          </Text>
          <Text className="mt-2 text-sm leading-6 text-[#6C8179]">
            Đăng nhập để tiếp tục quản lý tài chính và xem dữ liệu của bạn.
          </Text>

          <TouchableOpacity
            onPress={handleLogin}
            disabled={openingLogin}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Đăng nhập vào Finora"
            className="mt-6 min-h-14 flex-row items-center justify-center rounded-2xl bg-[#147A5A] px-5 py-4"
          >
            {openingLogin ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Feather name="log-in" size={19} color="#FFFFFF" />
                <Text className="ml-2 text-base font-bold text-white">
                  Đăng nhập
                </Text>
              </>
            )}
          </TouchableOpacity>

          <View className="mt-5 flex-row items-start">
            <Feather name="shield" size={17} color="#16815F" />
            <Text className="ml-2 flex-1 text-xs leading-5 text-[#6C8179]">
              Phiên đăng nhập được xác thực qua cổng đăng nhập bảo mật của Finora.
            </Text>
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}
