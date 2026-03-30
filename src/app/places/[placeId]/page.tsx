import { getPlaceById } from "@/lib/data/loaders";
import { formatPlaceLocation } from "@/lib/format/location";
import { notFound } from "next/navigation";
import { OpenNowBadge } from "@/components/OpenNowBadge";

export default async function PlaceDetailPage(props: {
  params: Promise<{ placeId: string }>;
}) {
  const { placeId } = await props.params;
  const place = await getPlaceById(placeId);
  if (!place) return notFound();

  return (
    <main className="space-y-3">
      <a href="/places" className="text-sm underline">
        ← Back to Places
      </a>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-bold">{place.name}</h1>
        <OpenNowBadge hours={place.hours} />
      </div>

      <div className="rounded-lg border bg-white p-3">
        <div className="text-sm text-gray-600">Location</div>
        <div>{formatPlaceLocation(place)}</div>
      </div>

      {place.aliases.length > 0 && (
        <div className="rounded-lg border bg-white p-3">
          <div className="text-sm text-gray-600">Also known as</div>
          <div className="text-sm">{place.aliases.join(", ")}</div>
        </div>
      )}

      {place.notes && (
        <div className="rounded-lg border bg-white p-3">
          <div className="text-sm text-gray-600">Notes</div>
          <div className="text-sm">{place.notes}</div>
        </div>
      )}
    </main>
  );
}
