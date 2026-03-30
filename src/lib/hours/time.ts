export type WeekdayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export function getIndiaNowParts(now = new Date()) {
  // Use Intl to avoid adding timezone deps.
  const dtf = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = dtf.formatToParts(now);
  const map = new Map(parts.map((p) => [p.type, p.value]));

  const weekdayShort = (map.get("weekday") ?? "Mon").toLowerCase(); // mon, tue...
  const weekday: WeekdayKey =
    weekdayShort.startsWith("mon") ? "mon" :
    weekdayShort.startsWith("tue") ? "tue" :
    weekdayShort.startsWith("wed") ? "wed" :
    weekdayShort.startsWith("thu") ? "thu" :
    weekdayShort.startsWith("fri") ? "fri" :
    weekdayShort.startsWith("sat") ? "sat" :
    "sun";

  const hh = Number(map.get("hour") ?? "0");
  const mm = Number(map.get("minute") ?? "0");
  const minutesSinceMidnight = hh * 60 + mm;

  return { weekday, hh, mm, minutesSinceMidnight };
}

export function parseHHMMToMinutes(hhmm: string): number | null {
  // expects "HH:MM"
  const m = /^(\d{2}):(\d{2})$/.exec(hhmm);
  if (!m) return null;
  const hh = Number(m[1]);
  const mm = Number(m[2]);
  if (hh < 0 || hh > 23 || mm < 0 || mm > 59) return null;
  return hh * 60 + mm;
}
