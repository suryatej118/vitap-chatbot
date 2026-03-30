import { NextResponse } from "next/server";
import { searchPlaces } from "@/lib/data/loaders";
import { formatPlaceLocation } from "@/lib/format/location";
import { isOpenNow } from "@/lib/hours/isOpenNow";
import { formatHoursShort } from "@/lib/hours/formatHours";

type ChatRequest = { message: string };
type ChatResponse = { reply: string; place_id?: string };

function normalize(s: string) {
  return s.trim().toLowerCase();
}

type Intent = "where" | "open_now" | "hours" | "unknown";

function detectIntent(message: string): Intent {
  const m = normalize(message);

  if (m.includes("open now") || m.startsWith("is ") && m.includes(" open")) return "open_now";
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
    if (m.startsWith(p)) return message.trim().slice(p.length).trim();
  }

  // remove trailing question marks
  return message.trim().replace(/[?!.]+$/g, "").trim();
}

export async function POST(req: Request) {
  const body = (await req.json()) as ChatRequest;
  const raw = body?.message ?? "";
  const intent = detectIntent(raw);
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
      open.status === "unknown" ? "I don't know the hours for this place." :
      open.status === "open" ? "Yes — it should be open now (IST)." :
      "No — it should be closed right now (IST).";

    const res: ChatResponse = {
      reply: `${best.name}\n${status}\n${formatHoursShort(best.hours)}\nDetails: /places/${best.place_id}`,
      place_id: best.place_id,
    };
    return NextResponse.json(res);
  }

  if (intent === "hours") {
    const open = isOpenNow(best.hours);
    const nowLine =
      open.status === "unknown"
        ? "Open now: unknown"
        : `Open now (IST): ${open.status}`;

    const res: ChatResponse = {
      reply: `${best.name}\n${nowLine}\n${formatHoursShort(best.hours)}\nDetails: /places/${best.place_id}`,
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
