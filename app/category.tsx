import { useMemo } from "react";
import { useRouter } from "expo-router";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { CategoryIcon, EXPENSE_CATEGORY_ICONS, INCOME_CATEGORY_ICONS } from "@/components/ui/category-icons";
import type { Category } from "@/drizzle/schema";
import { useCategoryViewModel } from "@/src/modules/category/viewmodel/use-category-view-model";

export default function CategoryScreen() {
  const router = useRouter();
  const {
    type,
    categories,
    archivedCategories,
    showArchived,
    setShowArchived,
    name,
    selectedIcon,
    editingId,
    editingName,
    editingIcon,
    error,
    setError,
    setName,
    setSelectedIcon,
    setEditingName,
    setEditingIcon,
    resetForm,
    addCategory,
    startEdit,
    cancelEdit,
    saveEdit,
    deleteCategory,
    restoreCategory,
  } = useCategoryViewModel();

  const iconOptions = useMemo(
    () => (type === "expense" ? EXPENSE_CATEGORY_ICONS : INCOME_CATEGORY_ICONS),
    [type],
  );

  function confirmDelete(category: Category) {
    Alert.alert("Xóa danh mục", `Bạn có chắc muốn xóa “${category.name}” khỏi danh sách?`, [
      { text: "Hủy", style: "cancel" },
      { text: "Xóa", style: "destructive", onPress: () => void deleteCategory(category.id) },
    ]);
  }

  return (
    <ScreenContainer className="bg-[#F8FAFC]">
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 36 }}>
        <View className="flex-row items-center">
          <Pressable onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-full bg-white"><Text className="text-2xl text-[#475569]">‹</Text></Pressable>
          <View className="ml-3 flex-1">
            <Text className="text-2xl font-bold text-[#0F2A5F]">Danh mục</Text>
            <Text className="mt-1 text-xs text-[#64748B]">Tự tạo các mục chi tiêu và nguồn thu nhập của bạn.</Text>
          </View>
        </View>

        <View className="mt-6 flex-row rounded-2xl bg-[#E2E8F0] p-1">
          <Pressable onPress={() => setShowArchived(false)} className="flex-1 rounded-xl px-3 py-3" style={{ backgroundColor: !showArchived ? "#22B8A8" : "transparent" }}>
            <Text className={!showArchived ? "text-center font-bold text-white" : "text-center font-bold text-[#64748B]"}>Đang dùng</Text>
          </Pressable>
          <Pressable onPress={() => setShowArchived(true)} className="flex-1 rounded-xl px-3 py-3" style={{ backgroundColor: showArchived ? "#64748B" : "transparent" }}>
            <Text className={showArchived ? "text-center font-bold text-white" : "text-center font-bold text-[#64748B]"}>Đã lưu trữ</Text>
          </Pressable>
        </View>

        {!showArchived && <View className="mt-2 flex-row rounded-2xl bg-[#E2E8F0] p-1">
          <Pressable onPress={() => resetForm("expense")} className="flex-1 rounded-xl px-3 py-3" style={{ backgroundColor: type === "expense" ? "#22B8A8" : "transparent" }}>
            <Text className={type === "expense" ? "text-center font-bold text-white" : "text-center font-bold text-[#64748B]"}>Mục chi tiêu</Text>
          </Pressable>
          <Pressable onPress={() => resetForm("income")} className="flex-1 rounded-xl px-3 py-3" style={{ backgroundColor: type === "income" ? "#059669" : "transparent" }}>
            <Text className={type === "income" ? "text-center font-bold text-white" : "text-center font-bold text-[#64748B]"}>Nguồn thu nhập</Text>
          </Pressable>
        </View>}

        <View className="mt-5 rounded-3xl border border-[#E2E8F0] bg-white p-5">
          <Text className="text-base font-bold text-[#0F2A5F]">Thêm mục mới</Text>
          <TextInput value={name} onChangeText={(value) => { setName(value); setError(""); }} placeholder={type === "expense" ? "Ví dụ: Ăn uống, Đi chơi" : "Ví dụ: Lương, Làm thêm"} placeholderTextColor="#94A3B8" className="mt-3 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-base text-[#0F172A]" />
          <Text className="mt-4 text-sm font-bold text-[#334155]">Chọn biểu tượng</Text>
          <View className="mt-3 flex-row flex-wrap">
            {iconOptions.map((item) => {
              const selected = selectedIcon === item.name;
              return (
                <Pressable key={item.name} onPress={() => setSelectedIcon(item.name)} className="mb-3 mr-3 h-[72px] w-[72px] items-center justify-center rounded-2xl border" style={{ borderColor: selected ? "#22B8A8" : "#E2E8F0", backgroundColor: selected ? "#E6FFFA" : "#F8FAFC" }}>
                  <CategoryIcon name={item.name} size={34} color={selected ? "#0F766E" : undefined} />
                  <Text className="mt-1 text-[9px] font-semibold text-[#64748B]" numberOfLines={1}>{item.label}</Text>
                </Pressable>
              );
            })}
          </View>
          {error ? <Text className="mt-2 text-sm text-[#DC2626]">{error}</Text> : null}
          <Pressable onPress={() => void addCategory()} className="mt-1 items-center rounded-2xl bg-[#22B8A8] py-3">
            <Text className="font-bold text-white">+ Thêm danh mục</Text>
          </Pressable>
        </View>

        <View className="mt-5 rounded-3xl border border-[#E2E8F0] bg-white p-5">
          <Text className="text-base font-bold text-[#0F2A5F]">{showArchived ? "Danh mục đã lưu trữ" : type === "expense" ? "Danh sách mục chi tiêu" : "Danh sách nguồn thu nhập"}</Text>
          {(showArchived ? archivedCategories : categories).length === 0 ? <Text className="mt-4 text-sm text-[#64748B]">{showArchived ? "Chưa có danh mục đã lưu trữ." : "Chưa có mục nào. Hãy thêm mục đầu tiên."}</Text> : (showArchived ? archivedCategories : categories).map((item) => (
            <View key={item.id} className="mt-3 rounded-2xl bg-[#F8FAFC] p-3">
              <View className="flex-row items-center">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-white">
                  <CategoryIcon name={(item.icon || "other") as never} size={24} />
                </View>
                {editingId === item.id ? (
                  <View className="ml-3 flex-1">
                    <TextInput value={editingName} onChangeText={(value) => { setEditingName(value); setError(""); }} autoFocus className="rounded-xl border border-[#CBD5E1] bg-white px-3 py-2 font-semibold text-[#334155]" />
                  </View>
                ) : <Text className="ml-3 flex-1 font-semibold text-[#334155]">{item.name}</Text>}
              </View>
              {editingId === item.id ? (
                <View className="mt-3">
                  <Text className="mb-2 text-xs font-bold text-[#64748B]">Chọn biểu tượng</Text>
                  <View className="flex-row flex-wrap">
                    {iconOptions.map((iconItem) => {
                      const selected = editingIcon === iconItem.name;
                      return (
                        <Pressable
                          key={iconItem.name}
                          onPress={() => { setEditingIcon(iconItem.name); setError(""); }}
                          className="mb-2 mr-2 h-14 w-14 items-center justify-center rounded-xl border"
                          style={{
                            borderColor: selected ? "#22B8A8" : "#E2E8F0",
                            backgroundColor: selected ? "#E6FFFA" : "#F8FAFC",
                          }}
                        >
                          <CategoryIcon name={iconItem.name} size={25} color={selected ? "#0F766E" : undefined} />
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ) : null}
              <View className="mt-2 flex-row justify-end gap-2">
                {showArchived ? (
                  <Pressable onPress={() => void restoreCategory(item.id)} className="rounded-xl bg-[#DCFCE7] px-3 py-2"><Text className="text-sm font-bold text-[#15803D]">Khôi phục</Text></Pressable>
                ) : editingId === item.id ? <>
                  <Pressable onPress={cancelEdit} className="rounded-xl bg-[#E2E8F0] px-3 py-2"><Text className="text-sm font-bold text-[#475569]">Hủy</Text></Pressable>
                  <Pressable onPress={() => void saveEdit(item.id)} className="rounded-xl bg-[#22B8A8] px-3 py-2"><Text className="text-sm font-bold text-white">Lưu</Text></Pressable>
                </> : <>
                  <Pressable onPress={() => startEdit(item)} className="rounded-xl bg-[#DBEAFE] px-3 py-2"><Text className="text-sm font-bold text-[#2563EB]">Sửa</Text></Pressable>
                  <Pressable onPress={() => confirmDelete(item)} className="rounded-xl bg-[#FEE2E2] px-3 py-2"><Text className="text-sm font-bold text-[#DC2626]">Xóa</Text></Pressable>
                </>}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
