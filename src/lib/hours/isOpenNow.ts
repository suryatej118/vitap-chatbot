import type { Hours } from "@/lib/data/types";
import { getIndiaNowParts, parseHHMMToMinutes } from "./time";

export type OpenNowResult =
  | { known: false; status: "unknown" }
  | { known: true; status: "open" | "closed" };

export function isOpenNow(hours: Hours | null, now = new Date()): OpenNowResult {
  if (!hours) return { known: false, status: "unknown" };

  if (hours.type === "always_open") {
    return { known: true, status: "open" };
  }

  if (hours.type === "weekly_windows") {
    const { weekday, minutesSinceMidnight } = getIndiaNowParts(now);
    const windows = hours.days?.[weekday] ?? [];
    for (const w of windows) {
      const start = parseHHMMToMinutes(w.start);
      const end = parseHHMMToMinutes(w.end);
      if (start === null || end === null) continue;
      if (minutesSinceMidnight >= start && minutesSinceMidnight < end) {
        return { known: true, status: "open" };
      }
    }
    return { known: true, status: "closed" };
  }

  return { known: false, status: "unknown" };
}
