import type { Place } from "@/lib/data/types";

export function formatFloor(floor: number | null): string | null {
  if (floor === null) return null;
  if (floor === 0) return "Ground";
  return `${floor}`;
}

export function formatPlaceLocation(p: Place): string {
  const parts: string[] = [];

  if (p.location.block) parts.push(p.location.block);

  const floor = formatFloor(p.location.floor);
  if (floor) parts.push(`Floor ${floor}`);

  if (p.location.room) parts.push(`Room ${p.location.room}`);
  if (p.location.landmark) parts.push(p.location.landmark);

  return parts.join(" • ");
}
