import { readFile } from "node:fs/promises";
import path from "node:path";
import type { DirectionsFile, PlacesFile, StartPointsFile, Place } from "./types";

const repoRoot = process.cwd();
const dataDir = path.join(repoRoot, "data");

async function readJsonFile<T>(relPath: string): Promise<T> {
  const abs = path.join(dataDir, relPath);
  const raw = await readFile(abs, "utf8");
  return JSON.parse(raw) as T;
}

export async function getPlacesFile(): Promise<PlacesFile> {
  return readJsonFile<PlacesFile>("places.json");
}

export async function getPlaces(): Promise<Place[]> {
  const { places } = await getPlacesFile();
  return places;
}

export async function getPlaceById(placeId: string): Promise<Place | null> {
  const places = await getPlaces();
  return places.find((p) => p.place_id === placeId) ?? null;
}

export async function searchPlaces(query: string): Promise<Place[]> {
  const qRaw = query.trim().toLowerCase();
  if (!qRaw) return [];

  const q = qRaw.replace(/[^
\w\s-]/g, " ").trim();
  const qTokens = q.split(/\s+/).filter(Boolean);

  const places = await getPlaces();

  function normalizeCandidate(s: string) {
    return s.toLowerCase().replace(/[^
\w\s-]/g, " ").trim();
  }

  function tokens(s: string) {
    return normalizeCandidate(s).split(/\s+/).filter(Boolean);
  }

  function scoreCandidate(candidate: string): number {
    const c = normalizeCandidate(candidate);
    const cTokens = tokens(candidate);

    if (c === q) return 1000;
    if (c.includes(q)) return 400;

    // Token / prefix scoring (order-independent)
    let exactHits = 0;
    let prefixHits = 0;

    for (const qt of qTokens) {
      if (cTokens.includes(qt)) exactHits += 1;
      if (cTokens.some((ct) => ct.startsWith(qt))) prefixHits += 1;
    }

    // Require at least 1 hit
    if (exactHits === 0 && prefixHits === 0) return 0;

    return exactHits * 120 + prefixHits * 60;
  }

  function scorePlace(p: Place): number {
    const cands = [p.name, ...p.aliases];
    let best = 0;
    for (const c of cands) best = Math.max(best, scoreCandidate(c));
    if (p.is_verified) best += 2;
    return best;
  }

  return places
    .map((p) => ({ p, score: scorePlace(p) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.p);
}
export async function getStartPointsFile(): Promise<StartPointsFile> {
  return readJsonFile<StartPointsFile>("start-points.json");
}

export async function getDirectionsFile(): Promise<DirectionsFile> {
  return readJsonFile<DirectionsFile>("directions.json");
}
