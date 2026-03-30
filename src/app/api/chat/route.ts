// src/app/api/chat/route.ts
import { NextResponse } from 'next/server';
import { searchPlaces } from '../../../lib/data/loaders';
import { formatLocation } from '../../../lib/format/location';

export async function POST(request: Request) {
    const { message } = await request.json();
    // Parse message and perform logic to search for places
    const results = await searchPlaces(message);
    const formattedLocation = results.length ? formatLocation(results[0]) : null;
    // Prepare reply and place_id if available
    const reply = 'Here is the information you requested.';
    const place_id = formattedLocation ? formattedLocation.id : undefined;
    return NextResponse.json({ reply, place_id });
}