export async function searchPlaces(query: string): Promise<Place[]> {
  const qRaw = query.trim().toLowerCase();
  if (!qRaw) return [];

  const q = qRaw.replace(/[^\w\s-]/g, " ").trim();
  const qTokens = q.split(/\s+/).filter(Boolean);

  const places = await getPlaces();

  function normalizeCandidate(s: string) {
    return s.toLowerCase().replace(/[^\w\s-]/g, " ").trim();
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

    // Require at least 1 hit to be considered
    if (exactHits === 0 && prefixHits === 0) return 0;

    // Strongly reward matching multiple tokens (office + coe)
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
