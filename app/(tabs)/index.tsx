import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { useDashboardViewModel } from "@/src/modules/dashboard/viewmodel/use-dashboard-view-model";
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from "react-native-svg";
import { FinoraMockupIcon } from "@/components/ui/finora-mockup-icons";
import { ScreenContainer } from "@/components/screen-container";

const money = (value: number) => new Intl.NumberFormat("vi-VN").format(value) + " ₫";
const percent = (value: number) => new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 1 }).format(value) + "%";

const quickActions = [
  { icon: "01_finance_wallet", label: "Ví của tôi", box: "bg-[#EFF6FF]", route: "/wallet" },
  { icon: "02_management_budget", label: "Ngân sách", box: "bg-[#FFF7ED]", route: "/budget" },
  { icon: "04_reports_report", label: "Báo cáo", box: "bg-[#F5F3FF]", route: "/reports" },
] as const;

const greetingMessages = {
  morning: ["Một ngày mới, cùng bắt đầu thật chủ động nhé.", "Hôm nay, bạn muốn chăm sóc tài chính của mình thế nào?", "Cùng Finora bắt đầu ngày mới thật chủ động nhé."],
  afternoon: ["Cùng nhìn lại một chút xem hôm nay tiền của bạn đang đi đâu nhé.", "Buổi chiều rồi, bạn muốn kiểm tra tài chính một chút không?", "Cùng giữ nhịp tài chính thật nhẹ nhàng cho phần còn lại của ngày nhé."],
  evening: ["Đã đến lúc nhìn lại một ngày tài chính của bạn.", "Tối rồi, dành một chút thời gian cho tài chính của bạn nhé.", "Khép lại ngày hôm nay bằng một chút nhìn lại thật nhẹ nhàng."],
} as const;

function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return { title: "Chào buổi sáng 👋", messages: greetingMessages.morning };
  if (hour >= 12 && hour < 18) return { title: "Chào buổi chiều 👋", messages: greetingMessages.afternoon };
  return { title: "Chào buổi tối 👋", messages: greetingMessages.evening };
}

function getRandomMessage(messages: readonly string[]) {
  return messages[Math.floor(Math.random() * messages.length)];
}

function SavingRing({ ratio }: { ratio: number }) {
  const safeRatio = Math.max(0, Math.min(1, ratio));
  const circumference = 226;
  return (
    <View className="h-[92px] w-[92px] items-center justify-center">
      <Svg width={92} height={92} viewBox="0 0 92 92">
        <Defs><LinearGradient id="savingRing" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#10B981" /><Stop offset="1" stopColor="#3B82F6" /></LinearGradient></Defs>
        <Circle cx="46" cy="46" r="36" stroke="#E2E8F0" strokeWidth="10" fill="none" />
        <Circle cx="46" cy="46" r="36" stroke="url(#savingRing)" strokeWidth="10" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - safeRatio)} fill="none" rotation="-90" origin="46, 46" />
      </Svg>
      <View className="absolute items-center"><Text className="text-lg font-bold text-[#0F172A]">{Math.round(safeRatio * 100)}%</Text><Text className="text-[9px] text-[#64748B]">Tiết kiệm</Text></View>
    </View>
  );
}

function changePercent(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / Math.abs(previous)) * 100;
}

export default function HomeScreen() {
  const router = useRouter();
  const [greeting] = useState(getGreeting);
  const [greetingMessage] = useState(() => getRandomMessage(greeting.messages));
  const { data } = useDashboardViewModel();

  const current = data?.currentMonth;
  const previous = data?.previousMonth;
  const savingRatio = current && current.income > 0 ? Math.max(0, current.netCashflow / current.income) : 0;
  const cashflowChange = current && previous ? changePercent(current.netCashflow, previous.netCashflow) : null;

  return (
    <ScreenContainer className="bg-[#F8FAFC]">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View className="gap-4 px-5 pt-4">
          <View className="flex-row items-center">
            <FinoraMockupIcon name="00_brand_finora_mark" size={42} />
            <View className="ml-2 flex-1"><Text className="text-[22px] font-bold text-[#0F2A5F]">Finora</Text><Text className="mt-1 text-[21px] font-bold text-[#0F2A5F]">{greeting.title}</Text><Text className="mt-0.5 text-sm text-[#64748B]">{greetingMessage}</Text></View>
            <View className="mr-2 h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm"><FinoraMockupIcon name="05_calendar_notifications_notification" size={25} /></View>
            <View className="h-11 w-11 items-center justify-center rounded-full bg-[#EFF6FF]"><Text className="text-lg">●</Text></View>
          </View>

          <View className="overflow-hidden rounded-[28px] bg-[#0EA5A8] shadow-sm">
            <Svg pointerEvents="none" width="100%" height="190" viewBox="0 0 400 190" preserveAspectRatio="none" style={{ position: "absolute", left: 0, right: 0, top: 0 }}>
              <Defs><LinearGradient id="assetGradient" x1="0" y1="0" x2="1" y2="0"><Stop offset="0" stopColor="#1769D2" /><Stop offset="0.55" stopColor="#17B6C0" /><Stop offset="1" stopColor="#8BE28B" /></LinearGradient></Defs>
              <Circle cx="325" cy="78" r="48" fill="#8BE2D0" opacity="0.55" /><Circle cx="350" cy="112" r="38" fill="#D4F58A" opacity="0.8" /><Path d="M0 142 C70 110 120 160 188 130 C260 96 310 118 400 86 V190 H0 Z" fill="#167CC6" opacity="0.9" /><Path d="M0 160 C90 132 130 180 210 150 C292 118 334 136 400 112 V190 H0 Z" fill="url(#assetGradient)" opacity="0.9" />
            </Svg>
            <View className="p-6"><View className="flex-row items-center justify-between"><View className="flex-row items-center"><FinoraMockupIcon name="01_finance_wallet" size={24} /><Text className="ml-2 text-sm font-semibold text-white">TỔNG TÀI SẢN</Text></View><FinoraMockupIcon name="status_visibility" size={24} /></View><Text className="mt-3 text-[36px] font-bold tracking-tight text-white">{money(data?.totalBalance ?? 0)}</Text>
              <View className="mt-2 flex-row items-center"><View className="h-7 w-7 items-center justify-center rounded-full bg-[#10B981]"><Text className="text-base font-bold text-white">{cashflowChange != null && cashflowChange < 0 ? "↓" : "↑"}</Text></View><Text className="ml-2 text-base font-bold text-white">{cashflowChange == null ? "—" : percent(Math.abs(cashflowChange))}</Text><Text className="ml-2 text-xs text-white/90">dòng tiền so với tháng trước</Text></View>
            </View>
            <View className="mx-0 flex-row rounded-t-[22px] bg-white px-5 py-4"><View className="flex-1 flex-row items-center"><View className="h-10 w-10 items-center justify-center rounded-full bg-[#DCFCE7]"><Text className="text-xl font-bold text-[#16A34A]">↓</Text></View><View className="ml-3"><Text className="text-xs text-[#64748B]">Tiền vào</Text><Text className="mt-1 text-base font-bold text-[#047857]">+{money(current?.income ?? 0)}</Text></View></View><View className="my-1 w-px bg-[#E2E8F0]" /><View className="flex-1 flex-row items-center pl-4"><View className="h-10 w-10 items-center justify-center rounded-full bg-[#FFE4E6]"><Text className="text-xl font-bold text-[#F43F5E]">↑</Text></View><View className="ml-3"><Text className="text-xs text-[#64748B]">Tiền ra</Text><Text className="mt-1 text-base font-bold text-[#E11D48]">-{money(current?.expense ?? 0)}</Text></View></View></View>
          </View>

          <TouchableOpacity activeOpacity={0.88} onPress={() => router.push("/transaction/new")} className="flex-row items-center justify-center rounded-full bg-[#22B8A8] px-5 py-4"><Text className="mr-3 text-3xl font-light text-white">+</Text><Text className="text-base font-bold text-white">Thêm giao dịch</Text><Text className="ml-auto text-2xl text-white">›</Text></TouchableOpacity>

          <View className="flex-row gap-3">{quickActions.map((action) => <TouchableOpacity key={action.label} activeOpacity={0.85} onPress={action.route ? () => router.push(action.route) : undefined} disabled={!action.route} className={`flex-1 items-center rounded-2xl border border-white p-3.5 shadow-sm ${action.box}`}><FinoraMockupIcon name={action.icon} size={46} /><Text className="mt-2 text-center text-sm font-semibold text-[#0F2A5F]">{action.label}</Text><Text className="mt-0.5 text-lg text-[#64748B]">›</Text></TouchableOpacity>)}</View>

          <View className="rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
            <View className="flex-row items-center"><FinoraMockupIcon name="util_calendar" size={23} /><Text className="ml-2 flex-1 text-lg font-bold uppercase text-[#0F2A5F]">{data?.monthLabel ?? "tháng hiện tại"}</Text><Text className="text-xs font-medium text-[#64748B]">Xem chi tiết ›</Text></View>
            <View className="mt-5 gap-4">
              <View className="flex-row items-center"><View className="h-9 w-9 items-center justify-center rounded-full bg-[#DCFCE7]"><Text className="text-lg font-bold text-[#16A34A]">↓</Text></View><View className="ml-3 flex-1"><View className="flex-row"><Text className="flex-1 text-sm text-[#334155]">Thu nhập</Text><Text className="text-sm font-bold text-[#047857]">{money(current?.income ?? 0)}</Text></View><View className="mt-2 h-2 overflow-hidden rounded-full bg-[#D1FAE5]"><View className="h-full rounded-full bg-[#22C55E]" style={{ width: `${current?.income ? 100 : 0}%` }} /></View></View></View>
              <View className="flex-row items-center"><View className="h-9 w-9 items-center justify-center rounded-full bg-[#FFE4E6]"><Text className="text-lg font-bold text-[#F43F5E]">↑</Text></View><View className="ml-3 flex-1"><View className="flex-row"><Text className="flex-1 text-sm text-[#334155]">Chi tiêu</Text><Text className="text-sm font-bold text-[#E11D48]">{money(current?.expense ?? 0)}</Text></View><View className="mt-2 h-2 overflow-hidden rounded-full bg-[#FFE4E6]"><View className="h-full rounded-full bg-[#FB7185]" style={{ width: `${current?.income ? Math.min(100, current.expense / current.income * 100) : 0}%` }} /></View></View></View>
              <View className="flex-row items-center"><View className="h-9 w-9 items-center justify-center rounded-full bg-[#EDE9FE]"><Text className="text-lg font-bold text-[#8B5CF6]">◆</Text></View><View className="ml-3 flex-1"><View className="flex-row"><Text className="flex-1 text-sm text-[#334155]">Tiết kiệm</Text><Text className="text-sm font-bold text-[#6D28D9]">{money(current?.netCashflow ?? 0)}</Text></View><View className="mt-2 h-2 overflow-hidden rounded-full bg-[#EDE9FE]"><View className="h-full rounded-full bg-[#8B5CF6]" style={{ width: `${savingRatio * 100}%` }} /></View></View></View>
            </View>
          </View>

          <View className="rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
            <View className="flex-row items-center"><Text className="flex-1 text-lg font-bold text-[#0F2A5F]">Giao dịch gần đây</Text><TouchableOpacity onPress={() => router.push("/transaction")}><Text className="text-sm font-semibold text-[#0EA5A8]">Xem tất cả ›</Text></TouchableOpacity></View>
            <View className="mt-4 gap-3">
              {(data?.recentTransactions ?? []).length === 0 ? <Text className="py-4 text-sm text-[#64748B]">Chưa có giao dịch nào.</Text> : data?.recentTransactions.map((transaction) => {
                const isIncome = transaction.type === "income";
                const isTransfer = transaction.type === "transfer";
                const amountPrefix = isTransfer ? "" : isIncome ? "+" : "−";
                return <View key={transaction.id} className="flex-row items-center"><View className={"h-10 w-10 items-center justify-center rounded-full " + (isTransfer ? "bg-[#EDE9FE]" : isIncome ? "bg-[#DCFCE7]" : "bg-[#FFE4E6]")}><Text className={"text-lg font-bold " + (isTransfer ? "text-[#7C3AED]" : isIncome ? "text-[#16A34A]" : "text-[#E11D48]")}>{isTransfer ? "↔" : isIncome ? "↓" : "↑"}</Text></View><View className="ml-3 flex-1"><Text className="text-sm font-semibold text-[#334155]">{transaction.categoryName || (isTransfer ? "Chuyển khoản" : isIncome ? "Thu nhập" : "Chi tiêu")}</Text><Text className="mt-1 text-xs text-[#64748B]">{transaction.walletName}{transaction.walletType ? ` · ${transaction.walletType}` : ""}</Text></View><View className="items-end"><Text className={"text-sm font-bold " + (isTransfer ? "text-[#7C3AED]" : isIncome ? "text-[#047857]" : "text-[#E11D48]")}>{amountPrefix}{money(transaction.amount)}</Text><Text className="mt-1 text-[10px] text-[#64748B]">{new Date(transaction.occurredAt).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })}</Text></View></View>;
              })}
            </View>
          </View>

          <View className="rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-sm"><View className="flex-row items-center"><View className="flex-1"><Text className="text-lg font-bold text-[#0F2A5F]">Tiến độ tiết kiệm</Text><Text className="mt-1 text-xs text-[#64748B]">Tỷ lệ tiền còn lại sau chi tiêu trong tháng.</Text></View><SavingRing ratio={savingRatio} /></View><View className="mt-3 h-2 overflow-hidden rounded-full bg-[#E2E8F0]"><View className="h-full rounded-full bg-[#22B8A8]" style={{ width: `${savingRatio * 100}%` }} /></View></View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
