import { getPlaces } from "@/lib/data/loaders";
import { formatPlaceLocation } from "@/lib/format/location";
import { OpenNowBadge } from "@/components/OpenNowBadge";

export default async function PlacesPage() {
  const places = await getPlaces();

  return (
    <main className="space-y-4">
      <h1 className="text-xl font-bold">Places</h1>

      <div className="space-y-2">
        {places.map((p) => (
          <a
            key={p.place_id}
            href={`/places/${p.place_id}`}
            className="block rounded-lg border bg-white p-3"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="font-semibold">{p.name}</div>
              <OpenNowBadge hours={p.hours} />
            </div>

            <div className="mt-1 text-sm text-gray-600">
              {formatPlaceLocation(p)}
            </div>
          </a>
        ))}
      </div>
    </main>
  );
}
