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
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const places = await getPlaces();

  return places
    .map((p) => {
      const hay = [p.name, ...p.aliases].join(" ").toLowerCase();
      const score = hay === q ? 100 : hay.includes(q) ? 10 : 0;
      return { p, score };
    })
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
