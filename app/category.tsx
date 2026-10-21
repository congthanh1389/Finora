import { useMemo } from "react";
import { useRouter } from "expo-router";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { FinoraProfilePageHeader } from "@/components/ui/finora-profile-page-header";
import { CategoryIcon, EXPENSE_CATEGORY_ICONS, INCOME_CATEGORY_ICONS } from "@/components/ui/category-icons";
import type { Category } from "@/drizzle/schema";
import { useCategoryViewModel } from "@/src/modules/category/viewmodel/use-category-view-model";

const FINORA_TURQUOISE = "#27B99A";
const FINORA_TURQUOISE_DARK = "#08665D";
const FINORA_TURQUOISE_SOFT = "#E8F8F2";

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
    deleteCategoryPermanently,
  } = useCategoryViewModel();

  const iconOptions = useMemo(
    () => (type === "expense" ? EXPENSE_CATEGORY_ICONS : INCOME_CATEGORY_ICONS),
    [type],
  );

  function confirmDelete(category: Category) {
    Alert.alert("Lưu trữ danh mục", `Bạn có chắc muốn lưu trữ “${category.name}” khỏi danh sách đang dùng?`, [
      { text: "Hủy", style: "cancel" },
      { text: "Lưu trữ", style: "destructive", onPress: () => void deleteCategory(category.id) },
    ]);
  }

  function confirmPermanentDelete(category: Category) {
    Alert.alert(
      "Xóa hẳn danh mục",
      `Danh mục “${category.name}” sẽ bị xóa vĩnh viễn và không thể khôi phục. Bạn có chắc không?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa hẳn",
          style: "destructive",
          onPress: () => void deleteCategoryPermanently(category.id),
        },
      ],
    );
  }

  return (
    <ScreenContainer className="bg-[#EAF9F4]">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 10, paddingBottom: 32 }}>
        <FinoraProfilePageHeader title="Danh mục thu chi" onBack={() => router.back()} onSettings={() => router.push("/(tabs)/settings" as never)} />

        <View className="mt-1 flex-row rounded-2xl p-1" style={{ backgroundColor: FINORA_TURQUOISE_SOFT }}>
          <Pressable onPress={() => setShowArchived(false)} className="flex-1 rounded-xl px-3 py-3" style={{ backgroundColor: !showArchived ? FINORA_TURQUOISE : "transparent" }}>
            <Text className={!showArchived ? "text-center font-bold text-white" : "text-center font-bold text-[#718C8A]"}>Đang dùng</Text>
          </Pressable>
          <Pressable onPress={() => setShowArchived(true)} className="flex-1 rounded-xl px-3 py-3" style={{ backgroundColor: showArchived ? FINORA_TURQUOISE_DARK : "transparent" }}>
            <Text className={showArchived ? "text-center font-bold text-white" : "text-center font-bold text-[#718C8A]"}>Đã lưu trữ</Text>
          </Pressable>
        </View>

        {!showArchived && (
          <View className="mt-2 flex-row rounded-2xl p-1" style={{ backgroundColor: FINORA_TURQUOISE_SOFT }}>
            <Pressable onPress={() => resetForm("expense")} className="flex-1 rounded-xl px-3 py-3" style={{ backgroundColor: type === "expense" ? FINORA_TURQUOISE : "transparent" }}>
              <Text className={type === "expense" ? "text-center font-bold text-white" : "text-center font-bold text-[#718C8A]"}>Mục chi tiêu</Text>
            </Pressable>
            <Pressable onPress={() => resetForm("income")} className="flex-1 rounded-xl px-3 py-3" style={{ backgroundColor: type === "income" ? FINORA_TURQUOISE : "transparent" }}>
              <Text className={type === "income" ? "text-center font-bold text-white" : "text-center font-bold text-[#718C8A]"}>Nguồn thu nhập</Text>
            </Pressable>
          </View>
        )}

        <View className="mt-5 rounded-[26px] border border-[#E0F4ED] bg-white dark:bg-[#17322D] p-5">
          <Text className="text-base font-bold text-[#164F4B]">Thêm mục mới</Text>
          <TextInput value={name} onChangeText={(value) => { setName(value); setError(""); }} placeholder={type === "expense" ? "Ví dụ: Ăn uống, Đi chơi" : "Ví dụ: Lương, Làm thêm"} placeholderTextColor="#9BAEAA" className="mt-3 rounded-2xl border border-[#DDE9ED] bg-[#F7FBF9] px-4 py-3 text-base text-[#164F4B]" />
          <Text className="mt-4 text-sm font-bold text-[#164F4B]">Chọn biểu tượng</Text>
          <View className="mt-3 flex-row flex-wrap">
            {iconOptions.map((item) => {
              const selected = selectedIcon === item.name;
              return (
                <Pressable key={item.name} onPress={() => setSelectedIcon(item.name)} className="mb-3 mr-3 h-[72px] w-[72px] items-center justify-center rounded-2xl border" style={{ borderColor: selected ? FINORA_TURQUOISE : "#E0F4ED", backgroundColor: selected ? FINORA_TURQUOISE_SOFT : "#F7FBF9" }}>
                  <CategoryIcon name={item.name} size={34} color={selected ? FINORA_TURQUOISE_DARK : undefined} />
                  <Text className="mt-1 text-[9px] font-semibold text-[#718C8A]" numberOfLines={1}>{item.label}</Text>
                </Pressable>
              );
            })}
          </View>
          {error ? <Text className="mt-2 text-sm text-[#DC2626]">{error}</Text> : null}
          <Pressable onPress={() => void addCategory()} className="mt-1 items-center rounded-2xl py-3" style={{ backgroundColor: FINORA_TURQUOISE }}>
            <Text className="font-bold text-white">+ Thêm danh mục</Text>
          </Pressable>
        </View>

        <View className="mt-5 rounded-[26px] border border-[#E0F4ED] bg-white dark:bg-[#17322D] p-5">
          <Text className="text-base font-bold text-[#164F4B]">{showArchived ? "Danh mục đã lưu trữ" : type === "expense" ? "Danh sách mục chi tiêu" : "Danh sách nguồn thu nhập"}</Text>
          {(showArchived ? archivedCategories : categories).length === 0 ? <Text className="mt-4 text-sm text-[#718C8A]">{showArchived ? "Chưa có danh mục đã lưu trữ." : "Chưa có mục nào. Hãy thêm mục đầu tiên."}</Text> : (showArchived ? archivedCategories : categories).map((item) => (
            <View key={item.id} className="mt-3 rounded-2xl border border-[#E6F2ED] bg-[#F7FBF9] p-3">
              <View className="flex-row items-center">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-[#17322D]">
                  <CategoryIcon name={(item.icon || "other") as never} size={24} />
                </View>
                {editingId === item.id ? (
                  <View className="ml-3 flex-1">
                    <TextInput value={editingName} onChangeText={(value) => { setEditingName(value); setError(""); }} autoFocus className="rounded-xl border border-[#C9EEE3] bg-white dark:bg-[#17322D] px-3 py-2 font-semibold text-[#164F4B]" />
                  </View>
                ) : <Text className="ml-3 flex-1 font-semibold text-[#334155] dark:text-[#DCEAE5]">{item.name}</Text>}
              </View>
              {editingId === item.id ? (
                <View className="mt-3">
                  <Text className="mb-2 text-xs font-bold text-[#64748B] dark:text-[#A5BCB5]">Chọn biểu tượng</Text>
                  <View className="flex-row flex-wrap">
                    {iconOptions.map((iconItem) => {
                      const selected = editingIcon === iconItem.name;
                      return (
                        <Pressable
                          key={iconItem.name}
                          onPress={() => { setEditingIcon(iconItem.name); setError(""); }}
                          className="mb-2 mr-2 h-14 w-14 items-center justify-center rounded-xl border"
                          style={{
                            borderColor: selected ? FINORA_TURQUOISE : "#E0F4ED",
                            backgroundColor: selected ? FINORA_TURQUOISE_SOFT : "#F7FBF9",
                          }}
                        >
                          <CategoryIcon name={iconItem.name} size={25} color={selected ? FINORA_TURQUOISE_DARK : undefined} />
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ) : null}
              <View className="mt-2 flex-row justify-end gap-2">
                {showArchived ? (
                  <>
                    <Pressable onPress={() => void restoreCategory(item.id)} className="rounded-xl bg-[#DCFCE7] dark:bg-[#1C4038] px-3 py-2"><Text className="text-sm font-bold text-[#15803D]">Khôi phục</Text></Pressable>
                    <Pressable onPress={() => confirmPermanentDelete(item)} className="rounded-xl bg-[#FEE2E2] px-3 py-2"><Text className="text-sm font-bold text-[#DC2626]">Xóa hẳn</Text></Pressable>
                  </>
                ) : editingId === item.id ? <>
                  <Pressable onPress={cancelEdit} className="rounded-xl bg-[#E2E8F0] dark:bg-[#31554B] px-3 py-2"><Text className="text-sm font-bold text-[#475569] dark:text-[#B7CBC4]">Hủy</Text></Pressable>
                  <Pressable onPress={() => void saveEdit(item.id)} className="rounded-xl px-3 py-2" style={{ backgroundColor: FINORA_TURQUOISE }}><Text className="text-sm font-bold text-white">Lưu</Text></Pressable>
                </> : <>
                  <Pressable onPress={() => startEdit(item)} className="rounded-xl bg-[#E8F8F2] px-3 py-2"><Text className="text-sm font-bold text-[#08665D]">Sửa</Text></Pressable>
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
