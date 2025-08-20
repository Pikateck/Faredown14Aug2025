// lib/copySelector.ts
type Variant = { text: string; w?: number; key?: string; tone?: 'info'|'firm'|'urgent' };
type CopyPack = Record<string, any>; // your loaded copy_packs.json

export type SelectorCtx = {
  module: 'flights'|'hotels'|'sightseeing'|'transfers';
  beat: 'agent_offer'|'supplier_check'|'supplier_counter'|'agent_user_confirm';
  attempt: 1|2|3;
  tone?: 'info'|'firm'|'urgent';
  // recent keys from Redis (last 8) + session used set
  userRecentKeys?: string[];
  sessionUsedKeys: Set<string>;
  placeholders: Record<string,string|number>;
};

export function chooseVariant(
  pack: CopyPack,
  ctx: SelectorCtx
): { text: string; key: string } {
  const tone = ctx.tone ?? (ctx.attempt === 1 ? 'info' : ctx.attempt === 2 ? 'firm' : 'urgent');
  const bucket = (
    pack?.modules?.[ctx.module]?.[ctx.beat]?.[String(ctx.attempt)] ||
    pack?.modules?.[ctx.module]?.[ctx.beat]?.['any'] ||
    []
  ) as Variant[];

  // ensure keys
  const variants = bucket.map((v, i) => ({
    ...v, w: v.w ?? 1, key: v.key ?? `${ctx.module}|${ctx.beat}|${ctx.attempt}|${i}`
  }));

  // filter by tone when present
  const toned = variants.filter(v => !v.tone || v.tone === tone);

  const pool = toned.filter(v =>
    !ctx.sessionUsedKeys.has(v.key!) &&
    !(ctx.userRecentKeys || []).includes(v.key!)
  );

  const base = pool.length ? pool : toned;
  if (!base.length) {
    // Fallback variant
    return {
      text: getFallbackText(ctx.beat),
      key: `fallback|${ctx.module}|${ctx.beat}|${ctx.attempt}`
    };
  }

  const totalW = base.reduce((a, v) => a + (v.w || 1), 0);
  let r = Math.random() * totalW;
  let chosen = base[0];
  for (const v of base) { r -= (v.w || 1); if (r <= 0) { chosen = v; break; } }

  // fill placeholders
  const text = fill(chosen.text!, ctx.placeholders);

  ctx.sessionUsedKeys.add(chosen.key!); // remember in session
  return { text, key: chosen.key! };
}

export function fill(tpl: string, map: Record<string, any>) {
  return tpl.replace(/\{(\w+)\}/g, (_, k) => {
    const v = map[k];
    if (v == null) return '';
    if (typeof v === 'number') return String(v);
    if (typeof v === 'object') return String(v); // prevent [object Object]
    return String(v);
  });
}

function getFallbackText(beat: string): string {
  const fallbacks: Record<string, string> = {
    'agent_offer': 'We have your offer. Can you approve?',
    'supplier_check': 'Checking availability...',
    'supplier_counter': 'Here\'s our best offer.',
    'agent_user_confirm': 'Let me check with you if you want it.'
  };
  return fallbacks[beat] || 'Processing your request...';
}

// Helper function to format numbers with currency
export function formatCurrency(amount: number, symbol: string = '₹'): string {
  return `${symbol}${Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(amount)}`;
}
