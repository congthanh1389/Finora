import { useMemo } from "react";
import type { ReportSnapshot } from "@/src/modules/report/model/report.types";
import { ReminderService } from "../service/reminder.service";

const reminderService = new ReminderService();

export function useReminderViewModel(snapshot: ReportSnapshot | null) {
  return useMemo(
    () => (snapshot ? reminderService.getReminders(snapshot) : []),
    [snapshot],
  );
}
