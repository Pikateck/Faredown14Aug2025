import { useState, useEffect, useCallback, useRef } from "react";

interface BargainStatus {
  sessionId: string;
  state: "negotiating" | "holding" | "expired" | "booked";
  secondsLeft: number | null;
  attempt: {
    count: number;
    max: number;
  };
  hold?: {
    orderRef: string;
    finalPrice: number;
    status: string;
  } | null;
}

interface UseBargainStatusOptions {
  sessionId: string | null;
  enabled?: boolean;
  pollInterval?: number; // milliseconds
  onStateChange?: (status: BargainStatus) => void;
  onExpired?: () => void;
  onBooked?: (orderRef: string, finalPrice: number) => void;
}

export function useBargainStatus({
  sessionId,
  enabled = true,
  pollInterval = 1000, // 1 second default
  onStateChange,
  onExpired,
  onBooked,
}: UseBargainStatusOptions) {
  const [status, setStatus] = useState<BargainStatus | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastStateRef = useRef<string | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!sessionId) return;

    try {
      const response = await fetch(
        `/api/bargains/status?sessionId=${sessionId}`,
      );

      if (!response.ok) {
        if (response.status === 404) {
          setError("Session not found");
          return;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const newStatus: BargainStatus = await response.json();

      // Call state change callback if state changed
      if (newStatus.state !== lastStateRef.current) {
        lastStateRef.current = newStatus.state;
        onStateChange?.(newStatus);

        // Call specific callbacks
        if (newStatus.state === "expired") {
          onExpired?.();
        } else if (newStatus.state === "booked" && newStatus.hold) {
          onBooked?.(newStatus.hold.orderRef, newStatus.hold.finalPrice);
        }
      }

      setStatus(newStatus);
      setError(null);

      // Stop polling if we've reached a final state
      if (newStatus.state === "expired" || newStatus.state === "booked") {
        setIsPolling(false);
      }
    } catch (err) {
      console.error("Status polling error:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch status");
    }
  }, [sessionId, onStateChange, onExpired, onBooked]);

  const startPolling = useCallback(() => {
    if (!sessionId || !enabled) return;

    setIsPolling(true);
    setError(null);

    // Initial fetch
    fetchStatus();

    // Set up interval
    intervalRef.current = setInterval(fetchStatus, pollInterval);
  }, [sessionId, enabled, pollInterval, fetchStatus]);

  const stopPolling = useCallback(() => {
    setIsPolling(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Auto-start/stop polling based on sessionId and enabled
  useEffect(() => {
    if (sessionId && enabled) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => {
      stopPolling();
    };
  }, [sessionId, enabled, startPolling, stopPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return {
    status,
    isPolling,
    error,
    startPolling,
    stopPolling,
    refetch: fetchStatus,
  };
}

// Hook for countdown timer
export function useCountdown(initialSeconds: number, onComplete?: () => void) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const start = useCallback(() => {
    setIsActive(true);
  }, []);

  const stop = useCallback(() => {
    setIsActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const reset = useCallback(
    (newSeconds?: number) => {
      stop();
      setSeconds(newSeconds ?? initialSeconds);
    },
    [initialSeconds, stop],
  );

  useEffect(() => {
    if (isActive && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            onComplete?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, seconds, onComplete]);

  return {
    seconds,
    isActive,
    start,
    stop,
    reset,
  };
}

// Hook for chat beat timing
export function useChatBeats(
  beats: Array<{ delay: number; action: () => void }>,
) {
  const [currentBeat, setCurrentBeat] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  const start = useCallback(() => {
    if (isRunning) return;

    setIsRunning(true);
    setCurrentBeat(0);

    // Clear any existing timeouts
    timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    timeoutsRef.current = [];

    // Schedule all beats
    beats.forEach((beat, index) => {
      const timeout = setTimeout(() => {
        setCurrentBeat(index + 1);
        beat.action();

        // Mark as complete if this was the last beat
        if (index === beats.length - 1) {
          setIsRunning(false);
        }
      }, beat.delay);

      timeoutsRef.current.push(timeout);
    });
  }, [beats, isRunning]);

  const stop = useCallback(() => {
    setIsRunning(false);
    timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    timeoutsRef.current = [];
  }, []);

  const reset = useCallback(() => {
    stop();
    setCurrentBeat(0);
  }, [stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    };
  }, []);

  return {
    currentBeat,
    isRunning,
    start,
    stop,
    reset,
  };
}
