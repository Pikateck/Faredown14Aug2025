// utils/flight.ts
export type Segment = {
  carrierCode: string;         // "AI"
  flightNumber: string;        // "144"
  origin: { code: string; name?: string; time?: string };   // e.g. DXB
  destination: { code: string; name?: string; time?: string }; // e.g. BOM
  durationMinutes?: number;
};

export type Itin = {
  id?: string;
  segments: Segment[];
};

export function normalizeIata(x?: string | null) {
  return (x || "").trim().toUpperCase();
}

/**
 * Ensure the itinerary direction matches URL from/to.
 * If the first segment origin != from and last segment destination != to,
 * but the reverse matches, we return a *reversed* copy of the segments.
 * Otherwise return as-is.
 */
export function orientSegmentsToRoute(itin: Itin, urlFrom?: string | null, urlTo?: string | null): Itin {
  const from = normalizeIata(urlFrom);
  const to   = normalizeIata(urlTo);
  if (!itin?.segments?.length) return itin;

  const first = itin.segments[0];
  const last  = itin.segments[itin.segments.length - 1];

  const firstOrigin = normalizeIata(first.origin?.code);
  const lastDest    = normalizeIata(last.destination?.code);
  const firstDest   = normalizeIata(first.destination?.code);
  const lastOrigin  = normalizeIata(last.origin?.code);

  const matchesForward = (!from || firstOrigin === from) && (!to || lastDest === to);
  const matchesReverse = (!from || lastOrigin  === from) && (!to || firstDest === to);

  if (matchesForward || !matchesReverse) return itin;

  // Reverse: also swap origin/destination per segment
  const reversed = [...itin.segments].reverse().map(seg => ({
    ...seg,
    origin: seg.destination,
    destination: seg.origin,
  }));
  return { ...itin, segments: reversed };
}

/** Convenience helpers */
export function getRouteEnds(segments: Segment[]) {
  if (!segments?.length) return { from: "", to: "" };
  return {
    from: normalizeIata(segments[0]?.origin?.code),
    to:   normalizeIata(segments[segments.length - 1]?.destination?.code),
  };
}

export function timeLabel(t?: string) { 
  return t ? t : ""; 
}

export function legDuration(min?: number) { 
  return min ? `${Math.floor(min/60)}h ${min%60}m` : ""; 
}

export function totalDuration(segs: Segment[]) {
  const sum = segs.reduce((a, s) => a + (s.durationMinutes || 0), 0);
  return legDuration(sum);
}
