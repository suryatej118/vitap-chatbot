import type { Hours } from "@/lib/data/types";

export function formatHoursShort(hours: Hours | null): string {
  if (!hours) return "Hours unknown";
  if (hours.type === "always_open") return "Open 24/7";
  if (hours.type === "weekly_windows") return "Weekly hours available";
  return "Hours unknown";
}
