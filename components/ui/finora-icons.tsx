import Svg, { Circle, G, Path, Rect } from "react-native-svg";
import type { ColorValue, StyleProp, ViewStyle } from "react-native";

export type FinoraIconProps = {
  size?: number;
  color: ColorValue;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

export function Finora00BrandFinoraMarkIcon({ size = 24, color, style, accessibilityLabel }: FinoraIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" style={style} accessibilityLabel={accessibilityLabel}>
      <G fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M5 5.2C7.2 3.2 10.2 2.5 13.1 3.1c2.8.6 5.1 2.4 6.2 4.8H12c-2.5 0-4.7 1.2-6 3.2-.9-1.9-1.3-3.9-1-5.9Z" fill={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M6.2 12.1c1.5-1.5 3.5-2.2 5.6-2.1h6.2c-.7 3.8-3.2 6.5-6.8 7.4-2.1.5-4.1.2-5.8-.8 1.1-.9 1.4-2.8.8-4.5Z" fill={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" opacity={.65} />
        <Path d="M5.3 16.3c1.5-.5 3-.3 4.3.4-1.1 1.8-2.8 3.1-4.8 3.7-.5-1.4-.3-2.9.5-4.1Z" fill={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" opacity={.38} />
      </G>
    </Svg>
  );
}

export function Finora01FinanceBankIcon({ size = 24, color, style, accessibilityLabel }: FinoraIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" style={style} accessibilityLabel={accessibilityLabel}>
      <G fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <Path d="m3 9 9-5 9 5" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M5 10v7M9 10v7M15 10v7M19 10v7" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M3 19h18" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      </G>
    </Svg>
  );
}

export function Finora01FinanceCashIcon({ size = 24, color, style, accessibilityLabel }: FinoraIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" style={style} accessibilityLabel={accessibilityLabel}>
      <G fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <Rect x="3" y="6" width="18" height="12" rx="2" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        <Circle cx="12" cy="12" r="3" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M6 9h.01M18 15h.01" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      </G>
    </Svg>
  );
}

export function Finora01FinanceExpenseIcon({ size = 24, color, style, accessibilityLabel }: FinoraIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" style={style} accessibilityLabel={accessibilityLabel}>
      <G fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M5 7h10.5a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M9 13l2 2 2-2" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M11 9v6" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      </G>
    </Svg>
  );
}

export function Finora01FinanceIncomeIcon({ size = 24, color, style, accessibilityLabel }: FinoraIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" style={style} accessibilityLabel={accessibilityLabel}>
      <G fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M5 7h10.5a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M15 7V5H6a2 2 0 0 0-2 2" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="m9 13 2-2 2 2" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M11 11v6" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      </G>
    </Svg>
  );
}

export function Finora01FinanceTransferIcon({ size = 24, color, style, accessibilityLabel }: FinoraIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" style={style} accessibilityLabel={accessibilityLabel}>
      <G fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M7 7h11" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="m14 4 4 3-4 3" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M17 17H6" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="m10 14-4 3 4 3" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      </G>
    </Svg>
  );
}

export function Finora01FinanceWalletIcon({ size = 24, color, style, accessibilityLabel }: FinoraIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" style={style} accessibilityLabel={accessibilityLabel}>
      <G fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M4 6h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M2 8V6a2 2 0 0 1 2-2h11" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M20 11h-5a2 2 0 0 0 0 4h5" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        <Circle cx="15" cy="13" r=".7" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      </G>
    </Svg>
  );
}

export function Finora02ManagementBudgetIcon({ size = 24, color, style, accessibilityLabel }: FinoraIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" style={style} accessibilityLabel={accessibilityLabel}>
      <G fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <Circle cx="12" cy="12" r="8.5" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="m12 7 1.4 3.3 3.6.3-2.8 2.3.9 3.5-3.1-1.9-3.1 1.9.9-3.5-2.8-2.3 3.6-.3L12 7Z" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      </G>
    </Svg>
  );
}

export function Finora02ManagementRecurringIcon({ size = 24, color, style, accessibilityLabel }: FinoraIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" style={style} accessibilityLabel={accessibilityLabel}>
      <G fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <Rect x="4" y="5" width="16" height="15" rx="2" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M8 3v4M16 3v4M4 9h16" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M8 13h3M8 16h3" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M16 14a2.5 2.5 0 1 1-1.7-2.4" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="m16 12 .2 2.2-2.1-.5" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      </G>
    </Svg>
  );
}

export function Finora02ManagementSavingsIcon({ size = 24, color, style, accessibilityLabel }: FinoraIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" style={style} accessibilityLabel={accessibilityLabel}>
      <G fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M5 10c0-2 1.6-3.5 3.5-3.5h5.8c2.6 0 4.7 2.1 4.7 4.7V15c0 2.2-1.8 4-4 4H8c-2.8 0-5-2.2-5-5v-1" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M5 10H3v4h2" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M16 8.5 18 6M18 10l2-1" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        <Circle cx="14" cy="12" r="1" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      </G>
    </Svg>
  );
}

export function Finora03PeopleDebtReceivableIcon({ size = 24, color, style, accessibilityLabel }: FinoraIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" style={style} accessibilityLabel={accessibilityLabel}>
      <G fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3 19v-1a4 4 0 0 1 4-4h2" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M15 13a3 3 0 1 0 0-6" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M13 14h4a4 4 0 0 1 4 4v1" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="m14 17 2 2 4-4" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      </G>
    </Svg>
  );
}

export function Finora03PeopleFamilyIcon({ size = 24, color, style, accessibilityLabel }: FinoraIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" style={style} accessibilityLabel={accessibilityLabel}>
      <G fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <Circle cx="8" cy="8" r="2.5" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        <Circle cx="16" cy="8" r="2.5" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        <Circle cx="12" cy="13" r="2" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M3.5 19a4.5 4.5 0 0 1 9 0M11.5 19a4.5 4.5 0 0 1 9 0" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      </G>
    </Svg>
  );
}

export function Finora04ReportsReportIcon({ size = 24, color, style, accessibilityLabel }: FinoraIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" style={style} accessibilityLabel={accessibilityLabel}>
      <G fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M5 19V9M12 19V5M19 19v-8" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M3 19h18" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      </G>
    </Svg>
  );
}

export function Finora04ReportsSpendingAnalysisIcon({ size = 24, color, style, accessibilityLabel }: FinoraIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" style={style} accessibilityLabel={accessibilityLabel}>
      <G fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M12 4a8 8 0 1 0 8 8h-8V4Z" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M15 4a8 8 0 0 1 5 5h-5V4Z" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      </G>
    </Svg>
  );
}

export function Finora05CalendarNotificationsCalendarIcon({ size = 24, color, style, accessibilityLabel }: FinoraIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" style={style} accessibilityLabel={accessibilityLabel}>
      <G fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <Rect x="3" y="5" width="18" height="16" rx="2" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M7 3v4M17 3v4M3 9h18" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M7 13h.01M11 13h.01M15 13h.01M7 17h.01M11 17h.01" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      </G>
    </Svg>
  );
}

export function Finora05CalendarNotificationsNotificationIcon({ size = 24, color, style, accessibilityLabel }: FinoraIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" style={style} accessibilityLabel={accessibilityLabel}>
      <G fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 8h18c0-1-3-1-3-8Z" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M10 21h4" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      </G>
    </Svg>
  );
}

export function Finora06SettingsHelpIcon({ size = 24, color, style, accessibilityLabel }: FinoraIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" style={style} accessibilityLabel={accessibilityLabel}>
      <G fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <Circle cx="12" cy="12" r="9" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M9.6 9a2.5 2.5 0 1 1 4.3 1.8c-1.2 1.1-1.9 1.5-1.9 3" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M12 17h.01" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      </G>
    </Svg>
  );
}

export function Finora06SettingsSettingsIcon({ size = 24, color, style, accessibilityLabel }: FinoraIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" style={style} accessibilityLabel={accessibilityLabel}>
      <G fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <Path d="m9.2 3.5.7-1.5h4.2l.7 1.5 1.4.8 1.6-.4 2.1 3.6-1.2 1.1v1.7l1.2 1.1-2.1 3.6-1.6-.4-1.4.8-.7 1.5H9.9l-.7-1.5-1.4-.8-1.6.4-2.1-3.6 1.2-1.1V8.2L4.1 7.1l2.1-3.6 1.6.4 1.4-.8Z" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        <Circle cx="12" cy="10.7" r="2.8" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      </G>
    </Svg>
  );
}

export function Finora07NavigationBudgetIcon({ size = 24, color, style, accessibilityLabel }: FinoraIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" style={style} accessibilityLabel={accessibilityLabel}>
      <G fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <Circle cx="12" cy="12" r="9" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M12 7v5l3 2" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M8 4.5 6 3M16 4.5 18 3" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      </G>
    </Svg>
  );
}

export function Finora07NavigationHomeIcon({ size = 24, color, style, accessibilityLabel }: FinoraIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" style={style} accessibilityLabel={accessibilityLabel}>
      <G fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <Path d="m3 10 9-7 9 7" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M5 9v11h14V9" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M9 20v-6h6v6" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      </G>
    </Svg>
  );
}

export function Finora07NavigationProfileIcon({ size = 24, color, style, accessibilityLabel }: FinoraIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" style={style} accessibilityLabel={accessibilityLabel}>
      <G fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <Circle cx="12" cy="8" r="3" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M5 20a7 7 0 0 1 14 0" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      </G>
    </Svg>
  );
}

export function Finora07NavigationReportsIcon({ size = 24, color, style, accessibilityLabel }: FinoraIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" style={style} accessibilityLabel={accessibilityLabel}>
      <G fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M5 19V11M12 19V6M19 19V9" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M3 19h18" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      </G>
    </Svg>
  );
}

export function Finora07NavigationTransactionsIcon({ size = 24, color, style, accessibilityLabel }: FinoraIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" style={style} accessibilityLabel={accessibilityLabel}>
      <G fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <Rect x="4" y="4" width="16" height="16" rx="2" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M8 8h8M8 12h8M8 16h5" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="m16 15 2 2-2 2" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      </G>
    </Svg>
  );
}

export function Finora07NavigationWalletIcon({ size = 24, color, style, accessibilityLabel }: FinoraIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" style={style} accessibilityLabel={accessibilityLabel}>
      <G fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M4 6h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M2 8V6a2 2 0 0 1 2-2h11" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M20 11h-5a2 2 0 0 0 0 4h5" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        <Circle cx="15" cy="13" r=".7" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      </G>
    </Svg>
  );
}

export function Finora08ActionsAddIcon({ size = 24, color, style, accessibilityLabel }: FinoraIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" style={style} accessibilityLabel={accessibilityLabel}>
      <G fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <Circle cx="12" cy="12" r="9" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M12 8v8M8 12h8" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      </G>
    </Svg>
  );
}

export function Finora08ActionsDeleteIcon({ size = 24, color, style, accessibilityLabel }: FinoraIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" style={style} accessibilityLabel={accessibilityLabel}>
      <G fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M5 7h14M10 11v5M14 11v5" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M9 7V4h6v3M7 7l1 14h8l1-14" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      </G>
    </Svg>
  );
}

export function Finora08ActionsEditIcon({ size = 24, color, style, accessibilityLabel }: FinoraIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" style={style} accessibilityLabel={accessibilityLabel}>
      <G fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <Path d="m4 16.5-.8 3.3 3.3-.8L18 7.5a2.1 2.1 0 0 0-3-3L4 16.5Z" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="m13.5 6.5 4 4" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      </G>
    </Svg>
  );
}

export function Finora08ActionsFilterIcon({ size = 24, color, style, accessibilityLabel }: FinoraIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" style={style} accessibilityLabel={accessibilityLabel}>
      <G fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M4 5h16l-6.5 7v6l-3 1v-7L4 5Z" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      </G>
    </Svg>
  );
}

export function Finora08ActionsSearchIcon({ size = 24, color, style, accessibilityLabel }: FinoraIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" style={style} accessibilityLabel={accessibilityLabel}>
      <G fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <Circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="m16 16 5 5" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      </G>
    </Svg>
  );
}

const ICON_COMPONENTS = {
  "00_brand_finora_mark": Finora00BrandFinoraMarkIcon,
  "01_finance_bank": Finora01FinanceBankIcon,
  "01_finance_cash": Finora01FinanceCashIcon,
  "01_finance_expense": Finora01FinanceExpenseIcon,
  "01_finance_income": Finora01FinanceIncomeIcon,
  "01_finance_transfer": Finora01FinanceTransferIcon,
  "01_finance_wallet": Finora01FinanceWalletIcon,
  "02_management_budget": Finora02ManagementBudgetIcon,
  "02_management_recurring": Finora02ManagementRecurringIcon,
  "02_management_savings": Finora02ManagementSavingsIcon,
  "03_people_debt_receivable": Finora03PeopleDebtReceivableIcon,
  "03_people_family": Finora03PeopleFamilyIcon,
  "04_reports_report": Finora04ReportsReportIcon,
  "04_reports_spending_analysis": Finora04ReportsSpendingAnalysisIcon,
  "05_calendar_notifications_calendar": Finora05CalendarNotificationsCalendarIcon,
  "05_calendar_notifications_notification": Finora05CalendarNotificationsNotificationIcon,
  "06_settings_help": Finora06SettingsHelpIcon,
  "06_settings_settings": Finora06SettingsSettingsIcon,
  "07_navigation_budget": Finora07NavigationBudgetIcon,
  "07_navigation_home": Finora07NavigationHomeIcon,
  "07_navigation_profile": Finora07NavigationProfileIcon,
  "07_navigation_reports": Finora07NavigationReportsIcon,
  "07_navigation_transactions": Finora07NavigationTransactionsIcon,
  "07_navigation_wallet": Finora07NavigationWalletIcon,
  "08_actions_add": Finora08ActionsAddIcon,
  "08_actions_delete": Finora08ActionsDeleteIcon,
  "08_actions_edit": Finora08ActionsEditIcon,
  "08_actions_filter": Finora08ActionsFilterIcon,
  "08_actions_search": Finora08ActionsSearchIcon
} as const;

export type FinoraIconName = keyof typeof ICON_COMPONENTS;

export function FinoraIcon({ name, ...props }: { name: FinoraIconName } & FinoraIconProps) {
  const Icon = ICON_COMPONENTS[name];
  return <Icon {...props} />;
}
