export type PlaceCategory = "academic" | "admin_services" | "food" | "hostel" | "other";

export type HoursAlwaysOpen = { tz: "Asia/Kolkata"; type: "always_open" };

export type HoursWeeklyWindows = {
  tz: "Asia/Kolkata";
  type: "weekly_windows";
  days: Record<
    "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun",
    { start: string; end: string }[]
  >;
};

export type Hours = HoursAlwaysOpen | HoursWeeklyWindows;

export type Place = {
  place_id: string;
  name: string;
  aliases: string[];
  category: PlaceCategory;
  location: {
    block: "AB1" | "AB2" | "CB" | "";
    floor: number | null; // Ground = 0
    room: string | null;
    landmark: string | null;
  };
  hours: Hours | null;
  notes: string | null;
  is_verified: boolean;
};

export type PlacesFile = { version: number; places: Place[] };

export type StartPoint = { start_id: string; name: string; description: string };
export type StartPointsFile = { version: number; startPoints: StartPoint[] };

export type DirectionsFile = { version: number; directions: unknown[] };
