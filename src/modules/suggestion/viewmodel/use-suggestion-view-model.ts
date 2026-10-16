import { useMemo } from "react";
import type { ReportSnapshot } from "@/src/modules/report/model/report.types";
import { SuggestionService } from "../service/suggestion.service";

const suggestionService = new SuggestionService();

export function useSuggestionViewModel(snapshot: ReportSnapshot | null) {
  return useMemo(
    () => (snapshot ? suggestionService.getSuggestions(snapshot) : []),
    [snapshot],
  );
}
