import React, { useEffect, useRef, useState } from "react";
import { Shield } from "lucide-react";

type DecisionCardProps = {
  price: number;                 // e.g., 21581
  negotiatedMs: number;          // e.g., 1250 -> "Negotiated in 1.2s"
  attempt: 1 | 2 | 3;            // to vary copy
  onAccept: () => void;
  onBargainAgain: () => void;
  onExpire: () => void;          // called when countdown hits 0
  holdSeconds?: number;          // default 30
};

export default function DecisionCard({
  price,
  negotiatedMs,
  attempt,
  onAccept,
  onBargainAgain,
  onExpire,
  holdSeconds = 30,
}: DecisionCardProps) {
  const [secondsLeft, setSecondsLeft] = useState<number>(holdSeconds);
  const [mounted, setMounted] = useState(false);
  const [lastAnnounced, setLastAnnounced] = useState<number>(holdSeconds);
  const intervalRef = useRef<number | null>(null);

  // mount animation
  useEffect(() => {
    const id = window.setTimeout(() => setMounted(true), 15); // tiny delay to trigger CSS transition
    return () => window.clearTimeout(id);
  }, []);

  // robust countdown (no resets, no premature close)
  useEffect(() => {
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          // stop + expire exactly once
          if (intervalRef.current) window.clearInterval(intervalRef.current);
          onExpire();
          return 0;
        }

        // Announce countdown every 5 seconds for accessibility
        const newValue = s - 1;
        if (newValue % 5 === 0 && newValue !== lastAnnounced && newValue <= 15) {
          setLastAnnounced(newValue);
        }

        return newValue;
      });
    }, 1000) as unknown as number;

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [onExpire]);

  const negotiatedSecs = Math.max(0.1, Math.round((negotiatedMs / 1000) * 10) / 10).toFixed(1);

  const ctasByAttempt: Record<1 | 2 | 3, { headline: string; sub?: string }> = {
    1: { headline: `Good news — approved at ₹${price.toLocaleString("en-IN")}. Shall I hold it for 30s?` },
    2: { headline: `Approved at ₹${price.toLocaleString("en-IN")}. I can hold it for 30s — secure it now?` },
    3: { headline: `Last slot approved at ₹${price.toLocaleString("en-IN")}. Hold for 30s?`, sub: `Demand is rising quickly.` },
  };

  return (
    <div
      className={
        `rounded-xl border border-slate-200 bg-white shadow-lg p-5 transition-all duration-150 ease-out
         ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"}`
      }
      role="dialog"
      aria-labelledby="decision-title"
    >
      <div className="mb-3 text-xs text-emerald-700 font-medium">
        Negotiated in {negotiatedSecs}s
      </div>

      <h3 id="decision-title" className="text-2xl font-semibold tracking-tight text-gray-900">
        ₹{price.toLocaleString("en-IN")}
      </h3>
      <p className="mt-1 text-sm text-slate-600">{ctasByAttempt[attempt].headline}</p>
      {ctasByAttempt[attempt].sub && (
        <p className="text-xs text-slate-500 mt-0.5">{ctasByAttempt[attempt].sub}</p>
      )}

      {/* progress bar */}
      <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 transition-[width] duration-1000 ease-linear"
          style={{ width: `${(secondsLeft / holdSeconds) * 100}%` }}
        />
      </div>

      <div className="mt-2 text-xs text-slate-500">
        Offer expires in: <span className="font-medium text-slate-700">{secondsLeft}s</span>
      </div>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={onAccept}
          className="inline-flex items-center justify-center rounded-lg border border-emerald-600 bg-emerald-600 text-white px-4 py-3 font-medium hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-opacity"
        >
          <Shield className="w-4 h-4 mr-2" />
          Accept ₹{price.toLocaleString("en-IN")} — {secondsLeft}s to book
        </button>

        {attempt < 3 && (
          <button
            onClick={onBargainAgain}
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-800 px-4 py-3 font-medium hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 transition-colors"
          >
            Bargain Again ({attempt}/3)
          </button>
        )}
      </div>
    </div>
  );
}
