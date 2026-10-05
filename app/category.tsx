import { useCallback, useMemo, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import * as Auth from "@/lib/_core/auth";
import { ScreenContainer } from "@/components/screen-container";
import { CategoryService } from "@/src/modules/category/service/category.service";
import type { Category } from "@/drizzle/schema";

export default function CategoryScreen() {
  const router = useRouter();
  const service = useMemo(() => new CategoryService(), []);
  const [type, setType] = useState<Category["type"]>("expense");
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const user = await Auth.getUserInfo();
    if (!user) return setCategories([]);
    setCategories(await service.listCategories(user.id, type));
  }, [service, type]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  async function addCategory() {
    try {
      const user = await Auth.getUserInfo();
      if (!user) throw new Error("Không tìm thấy người dùng hiện tại.");
      const created = await service.createCategory(user.id, name, type);
      setCategories((current) => [...current, created].sort((a, b) => a.name.localeCompare(b.name, "vi")));
      setName("");
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể thêm danh mục.");
    }
  }

  return (
    <ScreenContainer className="bg-[#F8FAFC]">
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 36 }}>
        <View className="flex-row items-center">
          <Pressable onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-full bg-white">
            <Text className="text-2xl text-[#475569]">‹</Text>
          </Pressable>
          <View className="ml-3 flex-1">
            <Text className="text-2xl font-bold text-[#0F2A5F]">Danh mục</Text>
            <Text className="mt-1 text-xs text-[#64748B]">Tự tạo các mục chi tiêu và nguồn thu nhập của bạn.</Text>
          </View>
        </View>

        <View className="mt-6 flex-row rounded-2xl bg-[#E2E8F0] p-1">
          <Pressable onPress={() => { setType("expense"); setName(""); setError(""); }} className="flex-1 rounded-xl px-3 py-3" style={{ backgroundColor: type === "expense" ? "#22B8A8" : "transparent" }}>
            <Text className={type === "expense" ? "text-center font-bold text-white" : "text-center font-bold text-[#64748B]"}>Mục chi tiêu</Text>
          </Pressable>
          <Pressable onPress={() => { setType("income"); setName(""); setError(""); }} className="flex-1 rounded-xl px-3 py-3" style={{ backgroundColor: type === "income" ? "#059669" : "transparent" }}>
            <Text className={type === "income" ? "text-center font-bold text-white" : "text-center font-bold text-[#64748B]"}>Nguồn thu nhập</Text>
          </Pressable>
        </View>

        <View className="mt-5 rounded-3xl border border-[#E2E8F0] bg-white p-5">
          <Text className="text-base font-bold text-[#0F2A5F]">Thêm mục mới</Text>
          <TextInput value={name} onChangeText={(value) => { setName(value); setError(""); }} placeholder={type === "expense" ? "Ví dụ: Tiền điện" : "Ví dụ: Làm thêm"} placeholderTextColor="#94A3B8" className="mt-3 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-base text-[#0F172A]" />
          {error ? <Text className="mt-2 text-sm text-[#DC2626]">{error}</Text> : null}
          <Pressable onPress={() => void addCategory()} className="mt-3 items-center rounded-2xl bg-[#22B8A8] py-3">
            <Text className="font-bold text-white">+ Thêm danh mục</Text>
          </Pressable>
        </View>

        <View className="mt-5 rounded-3xl border border-[#E2E8F0] bg-white p-5">
          <Text className="text-base font-bold text-[#0F2A5F]">{type === "expense" ? "Danh sách mục chi tiêu" : "Danh sách nguồn thu nhập"}</Text>
          {categories.length === 0 ? (
            <Text className="mt-4 text-sm text-[#64748B]">Chưa có mục nào. Hãy thêm mục đầu tiên.</Text>
          ) : categories.map((item) => (
            <View key={item.id} className="mt-3 flex-row items-center rounded-2xl bg-[#F8FAFC] p-3">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-white"><Text className="text-lg">{type === "expense" ? "↑" : "↓"}</Text></View>
              <Text className="ml-3 flex-1 font-semibold text-[#334155]">{item.name}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
