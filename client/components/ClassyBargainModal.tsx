import React, {
  useMemo,
  useRef,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useChatBeats } from "@/hooks/useChatBeats";
import { chooseVariant, formatCurrency } from "@/lib/copySelector";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useAuth } from "@/contexts/AuthContext";
import { Sparkles, Clock, Shield, X, Zap, TrendingUp, Star } from "lucide-react";
import copyPack from "../../api/data/copy_packs.json";
import DecisionCard from "./DecisionCard";
import { PriceChip, formatChatTextWithPrices } from "./PriceChip";
import { getModuleConfig, ModuleType } from "@/lib/moduleConfig";
import "@/styles/fd-bargain.css";

interface FlightDetails {
  id: string;
  airline: string;
  flightNumber: string;
  departureCode: string;
  arrivalCode: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  aircraft: string;
  price: number;
}

interface FareType {
  type: string;
  price: number;
  currency: string;
  features: string[];
}

interface ClassyBargainModalProps {
  isOpen: boolean;
  flight: FlightDetails | null;
  fareType: FareType | null;
  onClose: () => void;
  onAccept: (finalPrice: number, orderRef: string) => void;
  onBookOriginal: () => void;
  onRetry?: () => void;
  attempt?: number;
  moduleType?: ModuleType;
}

type ModalStep = "input" | "chat" | "decision" | "hold";

export function ClassyBargainModal({
  isOpen,
  flight,
  fareType,
  onClose,
  onAccept,
  onBookOriginal,
  onRetry,
  attempt = 1,
  moduleType = "flights",
}: ClassyBargainModalProps) {
  const [step, setStep] = useState<ModalStep>("input");
  const [offer, setOffer] = useState<number | null>(null);
  const [counter, setCounter] = useState<number | null>(null);
  const [negotiatedMs, setNegotiatedMs] = useState<number>(0);
  const [countdown, setCountdown] = useState(30);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sessionUsed = useRef(new Set<string>()).current;
  const holdTimer = useRef<number | null>(null);
  const counterRef = useRef<number | null>(null);

  const { selectedCurrency } = useCurrency();
  const { user } = useAuth();

  // Module configuration with role styling
  const moduleConfig = getModuleConfig(moduleType);

  // Chat beats template with natural timings
  const beatsTemplate = useMemo(
    () => [
      { id: "b1", speaker: "agent" as const, typingMs: 900, revealMs: 300 },
      { id: "b2", speaker: "supplier" as const, typingMs: 1400, revealMs: 280 },
      { id: "b3", speaker: "supplier" as const, typingMs: 1100, revealMs: 320 },
      { id: "b4", speaker: "agent" as const, typingMs: 800, revealMs: 260 },
    ],
    [],
  );

  const { beats, cursor, running, start, reset } = useChatBeats(beatsTemplate);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      console.log("🎭 ClassyBargainModal opened with data:", {
        flight,
        fareType,
        isOpen,
        routeInfo: flight
          ? `${flight.departureCode} → ${flight.arrivalCode}`
          : "No route data",
      });
      setStep("input");
      setOffer(null);
      setCounter(null);
      setNegotiatedMs(0);
      setCountdown(30);
      setError(null);
      sessionUsed.clear();
      reset();
    } else {
      console.log("🎭 ClassyBargainModal closed");
    }
  }, [isOpen, reset]);

  // Keep counterRef in sync
  useEffect(() => {
    counterRef.current = counter;
  }, [counter]);

  // Countdown timer for hold phase only (decision handled by DecisionCard)
  useEffect(() => {
    if (step === "hold") {
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 0) {
            clearInterval(interval);
            // Auto-accept in hold phase
            if (counterRef.current) {
              onAccept(counterRef.current, `ORDER-${Date.now()}`);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [step]); // Remove counter and onAccept dependencies

  // Debug logging for decision step
  useEffect(() => {
    if (step === "decision" && counter) {
      console.log("🎭 Decision step activated with:", {
        step,
        counter,
        countdown,
        negotiatedMs,
        isOpen,
      });
    }
  }, [step, counter, countdown, negotiatedMs, isOpen]);

  // Start quote function with realistic timing
  async function startQuote(
    offerAmount: number,
  ): Promise<{ counter: number; negotiatedMs: number }> {
    const t0 = performance.now();
    try {
      const response = await fetch("/api/bargains/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          module: moduleType,
          productRef: flight?.id,
          userOffer: offerAmount,
          sessionId: `session_${Date.now()}`,
          routeInfo: {
            airline: flight?.airline,
            flight_no: flight?.flightNumber,
          },
        }),
      });

      if (!response.ok) throw new Error(`quote ${response.status}`);
      const data = await response.json();
      const t1 = performance.now();
      return {
        counter: data.finalPrice || data.counter,
        negotiatedMs: t1 - t0,
      };
    } catch (e) {
      // Graceful fallback
      const t1 = performance.now();
      const jitter = (min: number, max: number) =>
        Math.floor(Math.random() * (max - min + 1)) + min;
      const counterOffer = Math.max(
        offerAmount + jitter(300, 1200),
        offerAmount,
      );
      return {
        counter: counterOffer,
        negotiatedMs: t1 - t0 + jitter(800, 1500),
      };
    }
  }

  // Start AI negotiation
  const onStartNegotiation = useCallback(async () => {
    if (!offer || !flight || !fareType) return;

    // Price validation
    if (offer >= fareType.price) {
      setError("Please enter a price lower than the current fare");
      return;
    }

    setError(null);
    setStep("chat");
    setIsProcessing(true);

    // Create placeholders for copy variants with personalization
    const firstName = user?.name?.split(" ")[0] || "there";
    const title = user?.name
      ? firstName.toLowerCase() === "mr"
        ? firstName
        : `Mr. ${firstName}`
      : "";

    const placeholders = {
      offer: formatCurrency(offer, selectedCurrency.symbol),
      base: formatCurrency(fareType.price, selectedCurrency.symbol),
      counter: "", // filled later
      airline: flight.airline,
      flight_no: flight.flightNumber,
      hotel_name: "",
      city: "",
      tour_name: "",
      pickup: "",
      dropoff: "",
      user_name: firstName,
      user_title: title,
    };

    try {
      // **Simplified Beat Scheduler** - prevent premature closure
      const t0 = performance.now();

      // Pre-fill beat texts
      const filledBeats = [
        {
          ...beatsTemplate[0],
          text: chooseVariant(copyPack, {
            module: moduleType,
            beat: "agent_offer",
            attempt: attempt as 1 | 2 | 3,
            sessionUsedKeys: sessionUsed,
            placeholders,
          }).text,
        },
        {
          ...beatsTemplate[1],
          text: chooseVariant(copyPack, {
            module: moduleType,
            beat: "supplier_check",
            attempt: attempt as 1 | 2 | 3,
            sessionUsedKeys: sessionUsed,
            placeholders,
          }).text,
        },
        {
          ...beatsTemplate[2],
          text: "", // Will be filled after API call
        },
        {
          ...beatsTemplate[3],
          text: "", // Will be filled after API call
        },
      ];

      // Start chat beats
      start(filledBeats);

      // Call API and handle response
      const result = await startQuote(offer);
      setCounter(result.counter);
      setNegotiatedMs(result.negotiatedMs);

      // Update counter placeholder and supplier counter text
      placeholders.counter = formatCurrency(
        result.counter,
        selectedCurrency.symbol,
      );
      filledBeats[2].text = chooseVariant(copyPack, {
        module: moduleType,
        beat: "supplier_counter",
        attempt: attempt as 1 | 2 | 3,
        sessionUsedKeys: sessionUsed,
        placeholders,
      }).text;

      filledBeats[3].text = chooseVariant(copyPack, {
        module: moduleType,
        beat: "agent_user_confirm",
        attempt: attempt as 1 | 2 | 3,
        sessionUsedKeys: sessionUsed,
        placeholders,
      }).text;

      // Enhanced completion monitoring with multiple triggers
      let transitioned = false;

      const transitionToDecision = () => {
        if (!transitioned) {
          transitioned = true;
          console.log("🎭 Transitioning to decision step");
          setStep("decision");
          setCountdown(30);
        }
      };

      // Primary completion check
      const checkCompletion = setInterval(() => {
        console.log(
          "🎭 Checking completion - running:",
          running,
          "cursor:",
          cursor,
          "beats length:",
          filledBeats.length,
        );
        if (!running && cursor >= filledBeats.length) {
          console.log("🎭 Chat completed naturally!");
          clearInterval(checkCompletion);
          // Small delay for last bubble to settle
          setTimeout(transitionToDecision, 200);
        }
      }, 100);

      // Multiple fallback triggers for reliability
      const fallbackTimer1 = setTimeout(() => {
        console.log("🎭 Fallback 1: 6s elapsed");
        if (step === "chat" && !transitioned) {
          clearInterval(checkCompletion);
          transitionToDecision();
        }
      }, 6000);

      const fallbackTimer2 = setTimeout(() => {
        console.log("🎭 Fallback 2: 8s elapsed - forcing transition");
        if (step === "chat" && !transitioned) {
          clearInterval(checkCompletion);
          transitionToDecision();
        }
      }, 8000);

      // Cleanup function
      return () => {
        clearInterval(checkCompletion);
        clearTimeout(fallbackTimer1);
        clearTimeout(fallbackTimer2);
      };
    } catch (err) {
      console.error("Negotiation error:", err);
      setError("Negotiation failed. Please try again.");
      setStep("input");
    } finally {
      setIsProcessing(false);
    }
  }, [
    offer,
    flight,
    fareType,
    selectedCurrency.symbol,
    attempt,
    sessionUsed,
    beatsTemplate,
    start,
    running,
    cursor,
  ]);

  // Accept offer
  const onAcceptOffer = useCallback(() => {
    if (!counter) return;
    setStep("hold");
    setCountdown(30);
  }, [counter]);

  // Retry bargain
  const handleRetry = useCallback(() => {
    console.log("🔄 Retry bargain clicked - resetting to input step");

    // Reset modal internal state
    reset();
    setStep("input");
    setOffer(null);
    setCounter(null);
    setError(null);
    setNegotiatedMs(0);
    setCountdown(30);
    sessionUsed.clear(); // Clear used copy keys for new attempt

    // Call parent onRetry if provided (for attempt increment)
    if (onRetry) {
      onRetry();
    }
  }, [reset, onRetry]);

  // Stable input handler
  const handleOfferChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      const numValue = parseFloat(value);
      setOffer(value === "" ? null : (isNaN(numValue) ? null : numValue));
      setError(null);
    },
    [],
  );

  if (!isOpen || !flight || !fareType) return null;

  const savings =
    counter && fareType.price - counter > 0 ? fareType.price - counter : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="fd-modal">
        {/* Header */}
        <header className="fd-modal__hdr">
          <div className="fd-hdr__left">
            <div className="fd-title flex items-center gap-2">
              {moduleConfig.icon}
              AI Price Negotiator
            </div>
            <div className="fd-sub">
              {flight.airline} {flight.flightNumber} • {flight.departureCode} →{" "}
              {flight.arrivalCode}
            </div>
          </div>
          <div className="fd-hdr__right">
            {formatCurrency(fareType.price, selectedCurrency.symbol)}
          </div>
          <button className="fd-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </header>

        {/* Input Step */}
        {step === "input" && (
          <section className="fd-body">
            <div className="fd-label">What's your target price?</div>
            <div className="fd-sublabel">
              Our AI will negotiate with the airline on your behalf
            </div>

            <div className="fd-input">
              <span className="fd-currency">{selectedCurrency.symbol}</span>
              <input
                type="number"
                inputMode="numeric"
                placeholder="Enter amount"
                onChange={handleOfferChange}
                value={offer === null ? "" : offer}
              />
            </div>

            {error && (
              <div
                style={{
                  color: "#dc2626",
                  textAlign: "center",
                  marginBottom: "16px",
                  fontSize: "0.9rem",
                }}
              >
                {error}
              </div>
            )}

            <div className="fd-actions">
              <button
                className="fd-btn fd-btn--primary"
                onClick={onStartNegotiation}
                disabled={!offer || offer <= 0 || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className="fd-typing">•••</div>
                    Starting...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Start AI Negotiation
                  </>
                )}
              </button>
              <button
                className="fd-btn fd-btn--outline"
                onClick={onBookOriginal}
              >
                Book Original Price{" "}
                {formatCurrency(fareType.price, selectedCurrency.symbol)}
              </button>
            </div>
          </section>
        )}

        {/* Chat Step */}
        {step === "chat" && (
          <section className="fd-chat">
            {beats
              .slice(0, Math.min(cursor + 1, beats.length))
              .map((beat, i) => {
                const roleConfig = moduleConfig.roles[beat.speaker];
                const bubbleClasses = `fd-bubble fd-bubble--${beat.speaker}${beat.speaker === "supplier" ? ` fd-bubble--${moduleType}` : ""}`;
                return (
                  <div key={beat.id} className={bubbleClasses}>
                    {/* Speaker label */}
                    <div className="text-xs opacity-75 mb-1 font-medium">
                      {roleConfig.label}
                    </div>

                    {/* Message content */}
                    <div>
                      {i === cursor && running ? (
                        <span className="fd-typing" aria-hidden>
                          •••
                        </span>
                      ) : i < cursor ? (
                        <span>
                          {formatChatTextWithPrices(
                            beat.text,
                            roleConfig.priceVariant,
                          )}
                        </span>
                      ) : null}
                    </div>
                  </div>
                );
              })}

            <div className="fd-meta">
              {negotiatedMs > 0 && (
                <span className="fd-chip">
                  Negotiated in {(negotiatedMs / 1000).toFixed(1)}s
                </span>
              )}
            </div>
          </section>
        )}

        {/* Sticky Action Bar - Brief preview before decision card */}
        {step === "chat" && counter && cursor >= 3 && (
          <div className="sticky bottom-3 mx-4 flex gap-3 justify-end opacity-80 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
            <button
              className="px-3 py-2 text-sm rounded-md border bg-white text-slate-700 hover:bg-slate-50 transition-colors"
              onClick={handleRetry}
            >
              Bargain Again
            </button>
            <button
              className="px-3 py-2 text-sm rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
              onClick={onAcceptOffer}
            >
              Accept
            </button>
          </div>
        )}

        {/* Decision Step - New DecisionCard Component */}
        {step === "decision" && counter && (
          <section className="p-4">
            <DecisionCard
              price={counter}
              negotiatedMs={negotiatedMs}
              attempt={attempt as 1 | 2 | 3}
              onAccept={() => {
                console.log("🎯 Decision card - Accept clicked");
                onAcceptOffer();
              }}
              onBargainAgain={() => {
                console.log("🔄 Decision card - Bargain Again clicked");
                handleRetry();
              }}
              onExpire={() => {
                console.log("🕐 Decision card - Timer expired");
                onClose();
              }}
              holdSeconds={30}
              userName={user?.name?.split(" ")[0]}
            />
          </section>
        )}

        {/* Hold Step */}
        {step === "hold" && counter && (
          <section className="fd-hold">
            <div className="fd-lock">
              Price locked • completing your booking...
            </div>
            <div className="fd-bar" />
            <div
              style={{
                marginTop: "16px",
                color: "#6b7280",
                fontSize: "0.9rem",
              }}
            >
              Hold expires in: {countdown}s
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
