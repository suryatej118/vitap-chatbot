import { NextResponse } from "next/server";
import { findDirections } from "@/lib/directions/findDirections";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const start_id = url.searchParams.get("start_id") ?? "";
  const place_id = url.searchParams.get("place_id") ?? "";

  if (!start_id || !place_id) {
    return NextResponse.json({ steps: null }, { status: 400 });
  }

  const dir = await findDirections(start_id, place_id);
  return NextResponse.json({ steps: dir?.steps ?? null });
}
