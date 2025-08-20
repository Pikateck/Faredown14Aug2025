// api/startQuote.ts
export async function startQuote(offer: number): Promise<{ counter: number; negotiatedMs: number }> {
  const t0 = performance.now();
  try {
    const res = await fetch('/api/bargains/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userOffer: offer,
        module: 'flights',
        productRef: 'flight-' + Date.now(),
        sessionId: 'session-' + Date.now() + '-' + Math.random().toString(36).slice(2),
        userId: 'user-demo',
        routeInfo: {},
        departureDate: new Date().toISOString()
      }),
    });
    if (!res.ok) throw new Error(`quote ${res.status}`);
    const data = await res.json();
    const t1 = performance.now();
    return {
      counter: data.finalPrice || data.counter || offer + 500,
      negotiatedMs: data.negotiatedInMs || (t1 - t0)
    };
  } catch (e) {
    console.log('API call failed, using fallback:', e);
    // graceful fallback (dev/offline)
    const t1 = performance.now();
    const jitter = (min: number, max: number) => Math.floor(Math.random()*(max-min+1))+min;
    const counter = Math.max(offer + jitter(300, 1200), offer); // guard above offer
    return { counter, negotiatedMs: t1 - t0 + jitter(500, 1200) };
  }
}

// Accept & Hold flow — 30s lock with progress bar + server sync
export async function acceptHold(sessionId: string, price: number) {
  try {
    const res = await fetch('/api/bargains/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, price }),
    });
    if (!res.ok) throw new Error(`accept ${res.status}`);
    return await res.json(); // { holdId, expiresAt } (ISO)
  } catch {
    // fallback: client-side 30s window
    const expiresAt = new Date(Date.now() + 30_000).toISOString();
    return { holdId: `mock-${Math.random().toString(36).slice(2,8)}`, expiresAt };
  }
}
