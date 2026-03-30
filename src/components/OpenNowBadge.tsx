import type { Hours } from "@/lib/data/types";
import { isOpenNow } from "@/lib/hours/isOpenNow";

export function OpenNowBadge(props: { hours: Hours | null }) {
  const r = isOpenNow(props.hours);

  if (r.status === "unknown") {
    return (
      <span className="inline-flex items-center rounded-full border bg-white px-3 py-1 text-xs font-medium text-gray-700">
        Hours not added yet
      </span>
    );
  }

  if (r.status === "open") {
    return (
      <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
        Open now (IST)
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
      Closed now (IST)
    </span>
  );
}
