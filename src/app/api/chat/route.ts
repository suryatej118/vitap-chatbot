import { NextResponse } from "next/server";
import { searchPlaces } from "@/lib/data/loaders";
import { formatPlaceLocation } from "@/lib/format/location";
import { isOpenNow } from "@/lib/hours/isOpenNow";
import { formatHoursShort } from "@/lib/hours/formatHours";
import { findDirections } from "@/lib/directions/findDirections";

type ChatRequest = { message: string; start_id?: string };
type ChatResponse = { reply: string; place_id?: string };

function normalize(s: string) {
  return s.trim().toLowerCase();
}

type Intent = "where" | "open_now" | "hours" | "directions" | "unknown";

function detectIntent(message: string): Intent {
  const m = normalize(message);

  if (m.includes("direction") || m.includes("route") || m.includes("how to get")) return "directions";
  if (m.includes("open now") || (m.startsWith("is ") && m.includes(" open"))) return "open_now";
  if (m.startsWith("hours") || m.includes(" hours") || m.includes("timings") || m.includes("timing"))
    return "hours";
  if (m.startsWith("where") || m.startsWith("find") || m.startsWith("show") || m.startsWith("locate"))
    return "where";

  return "unknown";
}

function extractPlaceQuery(message: string): string {
  const m = normalize(message);

  const prefixes = [
    "where is ",
    "where's ",
    "wheres ",
    "find ",
    "show ",
    "locate ",
    "location of ",
    "hours of ",
    "hours for ",
    "timings of ",
    "timings for ",
    "timing of ",
    "timing for ",
    "is ",
  ];

  for (const p of prefixes) {
    if (m.startsWith(p)) {
      return message.trim().slice(p.length).replace(/[?!.]+$/g, "").trim();
    }
  }

  // remove trailing question marks
  return message.trim().replace(/[?!.]+$/g, "").trim();
}

function extractDirectionsParts(message: string): { from?: string; to: string } {
  const cleaned = message.trim().replace(/[?!.]+$/g, "");
  const m = cleaned.toLowerCase();

  // from X to Y
  const fromIdx = m.indexOf("from ");
  const toIdx = m.indexOf(" to ");

  if (fromIdx !== -1 && toIdx !== -1 && toIdx > fromIdx) {
    const from = cleaned.slice(fromIdx + 5, toIdx).trim();
    const to = cleaned.slice(toIdx + 4).trim();
    return { from, to };
  }

  // directions to Y
  const toOnlyPrefixes = ["directions to ", "direction to ", "route to ", "how to get to "];
  for (const p of toOnlyPrefixes) {
    if (m.startsWith(p)) return { to: cleaned.slice(p.length).trim() };
  }

  // fallback: treat whole message as place query
  return { to: extractPlaceQuery(message) };
}

export async function POST(req: Request) {
  const body = (await req.json()) as ChatRequest;
  const raw = body?.message ?? "";
  const intent = detectIntent(raw);
  const clientStartId = body?.start_id || "MAIN_GATE";

  if (intent === "directions") {
    const parts = extractDirectionsParts(raw);

    // resolve destination place
    const toMatches = await searchPlaces(parts.to);
    if (toMatches.length === 0) {
      const res: ChatResponse = { reply: `I couldn't find “${parts.to}”. Try another name.` };
      return NextResponse.json(res);
    }
    const dest = toMatches[0];

    // resolve start_id
    let startId = clientStartId;

    // If user explicitly gave "from X", try to match it to a known start point id by simple heuristics:
    if (parts.from) {
      const fromNorm = parts.from.trim().toLowerCase();
      // quick mapping for common ones (extend later)
      if (fromNorm.includes("cb")) startId = "CB";
      else if (fromNorm.includes("ab1")) startId = "AB1";
      else if (fromNorm.includes("ab2")) startId = "AB2";
      else if (fromNorm.includes("main")) startId = "MAIN_GATE";
      else if (fromNorm.includes("mh-1") || fromNorm.includes("mh 1")) startId = "MH_1";
      else if (fromNorm.includes("mh-2") || fromNorm.includes("mh 2")) startId = "MH_2";
      else if (fromNorm.includes("lh-1") || fromNorm.includes("lh 1")) startId = "LH_1";
      else if (fromNorm.includes("lh-2") || fromNorm.includes("lh 2")) startId = "LH_2";
    }

    const dir = await findDirections(startId, dest.place_id);

    if (!dir) {
      const res: ChatResponse = {
        reply: `Directions not added yet.\nFrom: ${startId}\nTo: ${dest.name}\n(You can add it in data/directions.json)`,
        place_id: dest.place_id,
      };
      return NextResponse.json(res);
    }

    const steps = dir.steps.map((s, i) => `${i + 1}. ${s}`).join("\n");

    const res: ChatResponse = {
      reply: `Directions: ${startId} → ${dest.name}\n${steps}\nDetails: /places/${dest.place_id}`,
      place_id: dest.place_id,
    };
    return NextResponse.json(res);
  }

  const query = extractPlaceQuery(raw);

  if (!query) {
    const res: ChatResponse = { reply: "Type a place name (e.g., “COE Office”)." };
    return NextResponse.json(res);
  }

  const matches = await searchPlaces(query);

  if (matches.length === 0) {
    const res: ChatResponse = {
      reply: `I couldn't find “${query}”. Try another name or abbreviation.`,
    };
    return NextResponse.json(res);
  }

  const best = matches[0];
  const loc = formatPlaceLocation(best);

  if (intent === "open_now") {
    const open = isOpenNow(best.hours);
    const status =
      open.status === "unknown"
        ? "Hours not added yet for this place."
        : open.status === "open"
          ? "Yes — it should be open now (IST)."
          : "No — it should be closed right now (IST).";

    const hoursLine =
      best.hours ? formatHoursShort(best.hours) : "Add hours in data/places.json to enable open/closed checks.";

    const res: ChatResponse = {
      reply: `${best.name}\n${status}\n${hoursLine}\nDetails: /places/${best.place_id}`,
      place_id: best.place_id,
    };
    return NextResponse.json(res);
  }

  if (intent === "hours") {
    const open = isOpenNow(best.hours);
    const nowLine =
      open.status === "unknown"
        ? "Open now (IST): cannot determine (hours not added yet)"
        : `Open now (IST): ${open.status}`;

    const hoursLine =
      best.hours ? formatHoursShort(best.hours) : "Hours not added yet for this place.";

    const res: ChatResponse = {
      reply: `${best.name}\n${nowLine}\n${hoursLine}\nDetails: /places/${best.place_id}`,
      place_id: best.place_id,
    };
    return NextResponse.json(res);
  }

  // default: where/unknown => location
  const res: ChatResponse = {
    reply: `${best.name}\n${loc || "(Location not available)"}\nDetails: /places/${best.place_id}`,
    place_id: best.place_id,
  };
  return NextResponse.json(res);
}
