import { getDirectionsFile } from "@/lib/data/loaders";

export async function findDirections(start_id: string, place_id: string) {
  const { directions } = await getDirectionsFile();
  return directions.find((d) => d.start_id === start_id && d.place_id === place_id) ?? null;
}
