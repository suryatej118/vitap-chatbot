export async function searchPlaces(query: string): Promise<Place[]> {
  const qRaw = query.trim().toLowerCase();
  if (!qRaw) return [];

  const q = qRaw.replace(/[^\w\s-]/g, " ").trim(); // keep dash for IDs like MH-1
  const qTokens = q.split(/\s+/).filter(Boolean);

  const places = await getPlaces();

  function scoreOne(p: Place): number {
    const candidates = [p.name, ...p.aliases]
      .map((s) => s.toLowerCase())
      .map((s) => s.replace(/[^\w\s-]/g, " ").trim());

    // Big boosts
    if (candidates.some((c) => c === q)) return 1000;

    // substring boosts
    let best = 0;
    for (const c of candidates) {
      if (c.includes(q)) best = Math.max(best, 300);

      // token overlap
      const cTokens = c.split(/\s+/).filter(Boolean);
      const cSet = new Set(cTokens);

      let overlap = 0;
      for (const t of qTokens) {
        if (cSet.has(t)) overlap += 1;
      }

      // prefix match (handles "coe" in "coe office")
      let prefixHits = 0;
      for (const t of qTokens) {
        if (cTokens.some((ct) => ct.startsWith(t))) prefixHits += 1;
      }

      // combine
      best = Math.max(best, overlap * 50 + prefixHits * 30);

      // slight boost if query tokens all appear as prefixes
      if (qTokens.length > 0 && prefixHits === qTokens.length) {
        best = Math.max(best, 260);
      }
    }

    // tiny category/verified boosts (optional)
    if (p.is_verified) best += 2;

    return best;
  }

  return places
    .map((p) => ({ p, score: scoreOne(p) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.p);
}
