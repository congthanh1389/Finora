import { useMemo, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";

type ReportCalendarProps = {
  visible: boolean;
  value: Date | null;
  title: string;
  onCancel: () => void;
  onConfirm: (date: Date) => void;
};

const WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function daysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function formatMonth(date: Date): string {
  return `Tháng ${date.getMonth() + 1}/${date.getFullYear()}`;
}

function sameDate(left: Date | null, right: Date | null): boolean {
  return Boolean(
    left &&
      right &&
      left.getFullYear() === right.getFullYear() &&
      left.getMonth() === right.getMonth() &&
      left.getDate() === right.getDate(),
  );
}

function normalizeDate(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function ReportCalendar({
  visible,
  value,
  title,
  onCancel,
  onConfirm,
}: ReportCalendarProps) {
  const [month, setMonth] = useState(() => startOfMonth(value ?? new Date()));
  const [selected, setSelected] = useState<Date | null>(value ? normalizeDate(value) : null);


  const weeks = useMemo(() => {
    const firstDay = startOfMonth(month);
    const mondayFirstIndex = (firstDay.getDay() + 6) % 7;
    const dates = Array.from({ length: daysInMonth(month) }, (_, index) => index + 1);
    const cells: Array<number | null> = [
      ...Array.from({ length: mondayFirstIndex }, () => null),
      ...dates,
    ];
    while (cells.length % 7 !== 0) {
      cells.push(null);
    }

    return Array.from({ length: cells.length / 7 }, (_, rowIndex) =>
      cells.slice(rowIndex * 7, rowIndex * 7 + 7),
    );
  }, [month]);

  const moveMonth = (offset: number) => {
    setMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View className="flex-1 justify-end bg-black/40">
        <View className="rounded-t-3xl bg-white px-5 pb-8 pt-5">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-xs font-semibold text-[#64748B]">{title}</Text>
              <Text className="mt-1 text-lg font-bold text-[#0F2A5F]">{formatMonth(month)}</Text>
            </View>
            <Pressable onPress={onCancel} className="rounded-full bg-[#F1F5F9] px-4 py-2">
              <Text className="text-sm font-semibold text-[#475569]">Đóng</Text>
            </Pressable>
          </View>

          <View className="mt-5 flex-row">
            {WEEKDAYS.map((day) => (
              <Text key={day} className="flex-1 text-center text-xs font-bold text-[#94A3B8]">
                {day}
              </Text>
            ))}
          </View>

          <View className="mt-2">
            {weeks.map((week, weekIndex) => (
              <View key={`week-${weekIndex}`} className="flex-row">
                {week.map((day, dayIndex) => {
                  if (day === null) {
                    return <View key={`blank-${weekIndex}-${dayIndex}`} className="flex-1 p-1" />;
                  }

                  const date = new Date(month.getFullYear(), month.getMonth(), day);
                  const isSelected = sameDate(date, selected);

                  return (
                    <View key={day} className="flex-1 p-1">
                      <Pressable
                        onPress={() => setSelected(date)}
                        className={`h-12 items-center justify-center rounded-full ${isSelected ? "bg-[#22B8A8]" : "bg-transparent"}`}
                      >
                        <Text className={`text-base font-semibold ${isSelected ? "text-white" : "text-[#334155]"}`}>
                          {day}
                        </Text>
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            ))}
          </View>

          <View className="mt-3 flex-row justify-between">
            <Pressable onPress={() => moveMonth(-1)} className="rounded-xl bg-[#F8FAFC] px-4 py-2.5">
              <Text className="text-sm font-semibold text-[#475569]">‹ Tháng trước</Text>
            </Pressable>
            <Pressable onPress={() => moveMonth(1)} className="rounded-xl bg-[#F8FAFC] px-4 py-2.5">
              <Text className="text-sm font-semibold text-[#475569]">Tháng sau ›</Text>
            </Pressable>
          </View>

          <View className="mt-4 flex-row gap-3">
            <Pressable
              onPress={() => onConfirm(normalizeDate(new Date()))}
              className="flex-1 rounded-2xl border border-[#E2E8F0] bg-white py-3"
            >
              <Text className="text-center text-sm font-bold text-[#475569]">Hôm nay</Text>
            </Pressable>
            <Pressable
              disabled={!selected}
              onPress={() => selected && onConfirm(selected)}
              className="flex-1 rounded-2xl bg-[#22B8A8] py-3"
            >
              <Text className="text-center text-sm font-bold text-white">Xác nhận</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
