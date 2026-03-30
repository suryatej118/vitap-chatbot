import { NextResponse } from "next/server";
import { searchPlaces } from "@/lib/data/loaders";
import { formatPlaceLocation } from "@/lib/format/location";

type ChatRequest = { message: string };
type ChatResponse = { reply: string; place_id?: string };

function normalize(s: string) {
  return s.trim().toLowerCase();
}

function extractQuery(message: string): string {
  const m = normalize(message);
  const prefixes = [
    "where is ",
    "where's ",
    "wheres ",
    "find ",
    "show ",
    "locate ",
    "location of ",
  ];
  for (const p of prefixes) {
    if (m.startsWith(p)) return message.trim().slice(p.length).trim();
  }
  return message.trim();
}

export async function POST(req: Request) {
  const body = (await req.json()) as ChatRequest;
  const raw = body?.message ?? "";
  const query = extractQuery(raw);

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

  const res: ChatResponse = {
    reply: `${best.name}\n${loc || "(Location not available)"}\nDetails: /places/${best.place_id}`,
    place_id: best.place_id,
  };

  return NextResponse.json(res);
}
