import React from "react";
import BubbleTimer from "./BubbleTimer";

type Offer = {
  price_now: number;      // e.g. 21679
  was?: number;
  expiry_ts?: number;     // server UTC ms (now + 30s)
  hold_seconds?: number;  // 30
};

type Props = {
  userName: string;                    // "Mr. Zubin"
  offer: Offer;
  negotiationId: string;
  onCounter: () => Promise<void>;      // calls /bargain/counter
  onHold: () => Promise<void>;         // calls /bargain/hold
  onRefreshAfterExpiry: () => Promise<void>; // calls /bargain/refresh
};

export default function AgentOfferBubble({
  userName,
  offer,
  negotiationId,
  onCounter,
  onHold,
  onRefreshAfterExpiry,
}: Props) {
  const [busy, setBusy] = React.useState<"none" | "hold" | "counter">("none");
  const [expired, setExpired] = React.useState(false);

  const disableAll = busy !== "none" || expired;

  const handleExpire = React.useCallback(() => {
    setExpired(true);
    // Small delay so the user sees "expired", then refresh
    setTimeout(() => onRefreshAfterExpiry(), 500);
  }, [onRefreshAfterExpiry]);

  const handleHold = async () => {
    if (disableAll) return;
    setBusy("hold");
    try { await onHold(); } finally { setBusy("none"); }
  };

  const handleCounter = async () => {
    if (disableAll) return;
    setBusy("counter");
    try { await onCounter(); } finally { setBusy("none"); }
  };

  return (
    <div className="max-w-[560px] rounded-2xl bg-emerald-700 text-white p-4 shadow">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[15px]/6">
          <strong>Faredown Agent:</strong>{" "}
          Perfect, {userName} — <strong>₹{offer.price_now.toLocaleString("en-IN")}</strong> is confirmed.
          <span className="opacity-90"> Valid for 30s.</span>
        </p>
        {!expired && offer.expiry_ts ? (
          <BubbleTimer expiryTs={offer.expiry_ts} onExpire={handleExpire} />
        ) : null}
      </div>

      {!expired ? (
        <div className="mt-3 flex items-center gap-8">
          <button
            onClick={handleHold}
            disabled={disableAll}
            className={`px-4 py-2 rounded-xl font-medium shadow ${
              disableAll ? "bg-emerald-900/50 cursor-not-allowed" : "bg-white text-emerald-800 hover:bg-emerald-50"
            }`}
          >
            {busy === "hold" ? "Placing hold…" : `Place ${offer.hold_seconds ?? 30}s Hold`}
          </button>

          <button
            onClick={handleCounter}
            disabled={busy === "hold" || expired}
            className={`px-3 py-2 rounded-xl border border-white/40 hover:bg-emerald-600/30 ${
              busy === "counter" ? "opacity-60" : ""
            }`}
          >
            {busy === "counter" ? "Negotiating…" : "Bargain Again"}
          </button>
        </div>
      ) : (
        <div className="mt-3">
          <span className="text-sm bg-white/15 rounded-md px-2 py-1">
            Offer expired — recalculating…
          </span>
        </div>
      )}
    </div>
  );
}
