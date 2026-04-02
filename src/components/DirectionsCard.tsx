"use client";

import { useEffect, useMemo, useState } from "react";

const LS_KEY = "vitap.startPointId";
const DEFAULT_ID = "MAIN_GATE";

type StartPoint = { start_id: string; name: string; description: string };

export function DirectionsCard(props: {
  placeId: string;
  placeName: string;
  startPoints: StartPoint[];
}) {
  const byId = useMemo(() => {
    const m = new Map<string, StartPoint>();
    for (const sp of props.startPoints) m.set(sp.start_id, sp);
    return m;
  }, [props.startPoints]);

  const [startId, setStartId] = useState(DEFAULT_ID);
  const [steps, setSteps] = useState<string[] | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "not_found" | "error">("idle");

  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY);
    if (saved && byId.has(saved)) setStartId(saved);
  }, [byId]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setStatus("loading");
      setSteps(null);
      try {
        const res = await fetch(
          `/api/directions?start_id=${encodeURIComponent(startId)}&place_id=${encodeURIComponent(props.placeId)}`
        );
        if (!res.ok) throw new Error("bad response");
        const data = (await res.json()) as { steps: string[] | null };

        if (cancelled) return;

        if (!data.steps || data.steps.length === 0) setStatus("not_found");
        else {
          setSteps(data.steps);
          setStatus("idle");
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [startId, props.placeId]);

  const startName = byId.get(startId)?.name ?? startId;

  return (
    <div className="rounded-lg border bg-white p-3">
      <div className="text-sm text-gray-600">Directions</div>
      <div className="mt-1 font-medium">
        From {startName} → {props.placeName}
      </div>

      {status === "loading" && <div className="mt-2 text-sm text-gray-500">Loading…</div>}
      {status === "not_found" && (
        <div className="mt-2 text-sm text-gray-600">Directions not added yet for this route.</div>
      )}
      {status === "error" && (
        <div className="mt-2 text-sm text-red-700">Could not load directions right now.</div>
      )}

      {steps && (
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
          {steps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      )}
    </div>
  );
}
