// hooks/useChatBeats.ts
import { useEffect, useRef, useState, useCallback } from "react";

export type Speaker = "agent" | "supplier" | "system";
export type Beat = {
  id: string;
  speaker: Speaker;
  text?: string; // will be filled by copy selector
  typingMs?: number; // 1000–1600
  revealMs?: number; // 220–300 per bubble animation
};

export type ChatEvent =
  | { type: "START" }
  | { type: "NEXT" }
  | { type: "RESET" };

export function useChatBeats(beatsTemplate: Omit<Beat, "text">[]) {
  const [beats, setBeats] = useState<Beat[]>([]);
  const [cursor, setCursor] = useState(0); // which beat is "live"
  const [running, setRunning] = useState(false);
  const timerRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  const stop = useCallback(() => {
    clearTimer();
    setRunning(false);
  }, [clearTimer]);

  const start = useCallback(
    (filledBeats: Beat[]) => {
      clearTimer();
      setBeats(filledBeats);
      setCursor(0);
      setRunning(true);
    },
    [clearTimer],
  );

  // moves to next beat with natural delays (typing → reveal)
  useEffect(() => {
    if (!running) return;
    const b = beats[cursor];
    if (!b) {
      stop();
      return;
    }

    // typing pause
    timerRef.current = window.setTimeout(() => {
      // after typing, reveal and move on
      timerRef.current = window.setTimeout(() => {
        setCursor((c) => c + 1);
      }, b.revealMs ?? 260);
    }, b.typingMs ?? 1200);

    return clearTimer;
  }, [running, cursor, beats]);

  const reset = useCallback(() => {
    stop();
    setBeats([]);
    setCursor(0);
  }, [stop]);

  return {
    running,
    cursor, // UI can show typing indicator for current beat
    beats, // array of beats; render <= cursor for revealed items
    start,
    stop,
    reset,
  };
}
