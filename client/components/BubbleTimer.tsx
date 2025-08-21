import React from "react";

type Props = {
  expiryTs?: number;            // UTC ms from server
  onExpire?: () => void;
  lowTimeSeconds?: number;      // when to start pulse animation
};

export default function BubbleTimer({ expiryTs, onExpire, lowTimeSeconds = 10 }: Props) {
  const [, force] = React.useReducer((x) => x + 1, 0);

  React.useEffect(() => {
    if (!expiryTs) return;
    let raf = 0;
    const tick = () => {
      const now = Date.now();
      if (now >= expiryTs) {
        onExpire?.();
        return;
      }
      raf = requestAnimationFrame(tick);
      force();
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [expiryTs, onExpire]);

  if (!expiryTs) return null;

  const total = Math.max(0, Math.floor((expiryTs - Date.now()) / 1000));
  const mm = String(Math.floor(total / 60)).padStart(2, "0");
  const ss = String(total % 60).padStart(2, "0");
  const isLow = total <= lowTimeSeconds;

  return (
    <span
      aria-live="polite"
      className={`ml-2 text-sm opacity-85 ${isLow ? "animate-pulse" : ""}`}
      data-testid="bubble-timer"
    >
      {mm}:{ss}
    </span>
  );
}
