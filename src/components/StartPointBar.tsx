"use client";

import { useEffect, useMemo, useState } from "react";

type StartPoint = { start_id: string; name: string; description: string };

const LS_KEY = "vitap.startPointId";
const DEFAULT_ID = "MAIN_GATE";

export function StartPointBar(props: { startPoints: StartPoint[] }) {
  const { startPoints } = props;

  const byId = useMemo(() => {
    const m = new Map<string, StartPoint>();
    for (const sp of startPoints) m.set(sp.start_id, sp);
    return m;
  }, [startPoints]);

  const [startId, setStartId] = useState(DEFAULT_ID);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function syncFromStorage() {
      const saved = localStorage.getItem(LS_KEY);
      if (saved && byId.has(saved)) setStartId(saved);
    }

    syncFromStorage();
    window.addEventListener("vitap:startPointChanged", syncFromStorage);
    return () => window.removeEventListener("vitap:startPointChanged", syncFromStorage);
  }, [byId]);

  const current = byId.get(startId) ?? byId.get(DEFAULT_ID);

  function choose(id: string) {
    setStartId(id);
    localStorage.setItem(LS_KEY, id);
    setOpen(false);
  }

  return (
    <div className="sticky bottom-0 border-t bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <div className="text-sm">
          <div className="text-gray-500">Starting from</div>
          <div className="font-medium">{current?.name ?? DEFAULT_ID}</div>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="rounded-md border px-3 py-2 text-sm"
        >
          Change
        </button>
      </div>

      {open && (
        <div className="mx-auto max-w-3xl px-4 pb-4">
          <div className="rounded-lg border bg-white p-3">
            <div className="mb-2 text-sm font-semibold">Choose start point</div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {startPoints.map((sp) => (
                <button
                  key={sp.start_id}
                  onClick={() => choose(sp.start_id)}
                  className={`rounded-md border px-3 py-2 text-left text-sm ${
                    sp.start_id === startId ? "border-black" : ""
                  }`}
                >
                  {sp.name}
                </button>
              ))}
            </div>
            <div className="mt-3 flex justify-end">
              <button onClick={() => setOpen(false)} className="text-sm underline">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
