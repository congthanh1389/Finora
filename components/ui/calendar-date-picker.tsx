import { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";

export function formatCalendarDate(value: string) {
  if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(value)) return "Chọn ngày";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function parseCalendarDate(value: string) {
  if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(value)) return new Date();
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function CalendarDatePicker({
  visible,
  value,
  title = "Chọn ngày",
  onSelect,
  onClose,
}: {
  visible: boolean;
  value: string;
  title?: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}) {
  const [monthShown, setMonthShown] = useState(() => {
    const selected = parseCalendarDate(value);
    return new Date(selected.getFullYear(), selected.getMonth(), 1);
  });

  const firstWeekday = (new Date(monthShown.getFullYear(), monthShown.getMonth(), 1).getDay() + 6) % 7;
  const daysInMonth = new Date(monthShown.getFullYear(), monthShown.getMonth() + 1, 0).getDate();
  const cells = [...Array(firstWeekday).fill(0), ...Array.from({ length: daysInMonth }, (_, index) => index + 1)];
  while (cells.length % 7 !== 0) cells.push(0);
  const monthTitle = new Intl.DateTimeFormat("vi-VN", { month: "long", year: "numeric" }).format(monthShown);
  const selectedDate = parseCalendarDate(value);
  const selectedIsInMonth = selectedDate.getFullYear() === monthShown.getFullYear() && selectedDate.getMonth() === monthShown.getMonth();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/40 px-5">
        <View className="w-full rounded-3xl bg-white p-5">
          <Text className="text-lg font-bold text-[#0F2A5F]">{title}</Text>
          <View className="mt-4 flex-row items-center justify-between">
            <Pressable accessibilityLabel="Tháng trước" onPress={() => setMonthShown((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))} className="h-10 w-10 items-center justify-center rounded-full bg-[#F1F5F9]">
              <Text className="text-xl text-[#334155]">‹</Text>
            </Pressable>
            <Text className="text-base font-bold capitalize text-[#0F2A5F]">{monthTitle}</Text>
            <Pressable accessibilityLabel="Tháng sau" onPress={() => setMonthShown((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))} className="h-10 w-10 items-center justify-center rounded-full bg-[#F1F5F9]">
              <Text className="text-xl text-[#334155]">›</Text>
            </Pressable>
          </View>
          <View className="mt-4 flex-row">
            {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((day) => (
              <View key={day} className="flex-1 items-center py-2"><Text className="text-xs font-semibold text-[#64748B]">{day}</Text></View>
            ))}
          </View>
          <View>
            {Array.from({ length: cells.length / 7 }, (_, weekIndex) => (
              <View key={`week-${monthShown.getFullYear()}-${monthShown.getMonth()}-${weekIndex}`} className="flex-row">
                {cells.slice(weekIndex * 7, weekIndex * 7 + 7).map((day, dayIndex) => {
                  const index = weekIndex * 7 + dayIndex;
                  const isSelected = day !== 0 && selectedIsInMonth && selectedDate.getDate() === day;
                  return (
                    <View key={`${monthShown.getFullYear()}-${monthShown.getMonth()}-${index}`} className="flex-1 items-center py-1">
                      {day === 0 ? <View className="h-10 w-10" /> : (
                        <Pressable onPress={() => onSelect(`${monthShown.getFullYear()}-${String(monthShown.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`)} className="h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: isSelected ? "#0F766E" : "transparent" }}>
                          <Text className={`text-sm font-semibold ${isSelected ? "text-white" : "text-[#334155]"}`}>{day}</Text>
                        </Pressable>
                      )}
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
          <Pressable onPress={onClose} className="mt-4 items-center rounded-xl bg-[#F1F5F9] py-3"><Text className="font-semibold text-[#475569]">Đóng lịch</Text></Pressable>
        </View>
      </View>
    </Modal>
  );
}
