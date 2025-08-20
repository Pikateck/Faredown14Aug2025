import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { useChatBeats } from '@/hooks/useChatBeats';
import { chooseVariant, formatCurrency } from '@/lib/copySelector';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Sparkles, Plane, Building, MapPin, Car, Clock, Shield } from 'lucide-react';
import copyPack from '../../api/data/copy_packs.json';
import '@/styles/fd-bargain.css';

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
  attempt?: number;
}

type ModalStep = 'input' | 'chat' | 'decision' | 'hold';

export function ClassyBargainModal({
  isOpen,
  flight,
  fareType,
  onClose,
  onAccept,
  onBookOriginal,
  attempt = 1
}: ClassyBargainModalProps) {
  const [step, setStep] = useState<ModalStep>('input');
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

  // Module configuration
  const moduleConfig = {
    icon: <Plane className="w-4 h-4" />,
    supplierName: 'Airline'
  };

  // Chat beats template with natural timings
  const beatsTemplate = useMemo(() => [
    { id: 'b1', speaker: 'agent' as const, typingMs: 900, revealMs: 300 },
    { id: 'b2', speaker: 'supplier' as const, typingMs: 1400, revealMs: 280 },
    { id: 'b3', speaker: 'supplier' as const, typingMs: 1100, revealMs: 320 },
    { id: 'b4', speaker: 'agent' as const, typingMs: 800, revealMs: 260 },
  ], []);

  const { beats, cursor, running, start, reset } = useChatBeats(beatsTemplate);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      console.log('🎭 ClassyBargainModal opened with data:', { flight, fareType, isOpen });
      setStep('input');
      setOffer(null);
      setCounter(null);
      setNegotiatedMs(0);
      setCountdown(30);
      setError(null);
      sessionUsed.clear();
      reset();
    } else {
      console.log('🎭 ClassyBargainModal closed');
    }
  }, [isOpen, reset]);

  // Keep counterRef in sync
  useEffect(() => {
    counterRef.current = counter;
  }, [counter]);

  // Countdown timer for decision/hold phases
  useEffect(() => {
    if (step === 'decision' || step === 'hold') {
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            if (step === 'decision') {
              setStep('input'); // Offer expired
            } else {
              // Use counterRef to avoid stale closure
              if (counterRef.current) {
                onAccept(counterRef.current, `ORDER-${Date.now()}`);
              }
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [step]); // Remove counter and onAccept dependencies

  // Start quote function with realistic timing
  async function startQuote(offerAmount: number): Promise<{ counter: number; negotiatedMs: number }> {
    const t0 = performance.now();
    try {
      const response = await fetch('/api/bargains/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          module: 'flights',
          productRef: flight?.id,
          userOffer: offerAmount,
          sessionId: `session_${Date.now()}`,
          routeInfo: {
            airline: flight?.airline,
            flight_no: flight?.flightNumber,
          }
        })
      });

      if (!response.ok) throw new Error(`quote ${response.status}`);
      const data = await response.json();
      const t1 = performance.now();
      return { counter: data.finalPrice || data.counter, negotiatedMs: t1 - t0 };
    } catch (e) {
      // Graceful fallback
      const t1 = performance.now();
      const jitter = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
      const counterOffer = Math.max(offerAmount + jitter(300, 1200), offerAmount);
      return { counter: counterOffer, negotiatedMs: t1 - t0 + jitter(800, 1500) };
    }
  }

  // Start AI negotiation
  const onStartNegotiation = useCallback(async () => {
    if (!offer || !flight || !fareType) return;

    // Price validation
    if (offer >= fareType.price) {
      setError('Please enter a price lower than the current fare');
      return;
    }

    setError(null);
    setStep('chat');
    setIsProcessing(true);

    // Create placeholders for copy variants
    const placeholders = {
      offer: formatCurrency(offer, selectedCurrency.symbol),
      base: formatCurrency(fareType.price, selectedCurrency.symbol),
      counter: '', // filled later
      airline: flight.airline,
      flight_no: flight.flightNumber,
      hotel_name: '',
      city: '',
      tour_name: '',
      pickup: '',
      dropoff: ''
    };

    try {
      // Pre-fill beat texts
      const filledBeats = [
        {
          ...beatsTemplate[0],
          text: chooseVariant(copyPack, {
            module: 'flights',
            beat: 'agent_offer',
            attempt: attempt as 1|2|3,
            sessionUsedKeys: sessionUsed,
            placeholders
          }).text
        },
        {
          ...beatsTemplate[1],
          text: chooseVariant(copyPack, {
            module: 'flights',
            beat: 'supplier_check',
            attempt: attempt as 1|2|3,
            sessionUsedKeys: sessionUsed,
            placeholders
          }).text
        },
        {
          ...beatsTemplate[2],
          text: '' // Will be filled after API call
        },
        {
          ...beatsTemplate[3],
          text: chooseVariant(copyPack, {
            module: 'flights',
            beat: 'agent_user_confirm',
            attempt: attempt as 1|2|3,
            sessionUsedKeys: sessionUsed,
            placeholders
          }).text
        }
      ];

      // Start chat beats
      start(filledBeats);

      // Call API in parallel
      const result = await startQuote(offer);
      setCounter(result.counter);
      setNegotiatedMs(result.negotiatedMs);

      // Update counter placeholder and supplier counter text
      placeholders.counter = formatCurrency(result.counter, selectedCurrency.symbol);
      filledBeats[2].text = chooseVariant(copyPack, {
        module: 'flights',
        beat: 'supplier_counter',
        attempt: attempt as 1|2|3,
        sessionUsedKeys: sessionUsed,
        placeholders
      }).text;

      // Wait for beats to finish, then show decision
      const checkCompletion = setInterval(() => {
        console.log('🎭 Checking completion - running:', running, 'cursor:', cursor, 'beats length:', filledBeats.length);
        if (!running && cursor >= filledBeats.length) {
          console.log('🎭 Chat completed! Transitioning to decision step');
          clearInterval(checkCompletion);
          clearTimeout(fallbackTimer);
          setStep('decision');
          setCountdown(30); // Reset countdown for decision
        }
      }, 100);

      // Fallback: Force transition after 10 seconds if stuck
      const fallbackTimer = setTimeout(() => {
        console.log('🎭 Fallback timer triggered - forcing transition to decision');
        clearInterval(checkCompletion);
        setStep('decision');
        setCountdown(30);
      }, 10000);

      // Cleanup function
      return () => {
        clearInterval(checkCompletion);
        clearTimeout(fallbackTimer);
      };

    } catch (err) {
      console.error('Negotiation error:', err);
      setError('Negotiation failed. Please try again.');
      setStep('input');
    } finally {
      setIsProcessing(false);
    }
  }, [offer, flight, fareType, selectedCurrency.symbol, attempt, sessionUsed, beatsTemplate, start, running, cursor]);

  // Accept offer
  const onAcceptOffer = useCallback(() => {
    if (!counter) return;
    setStep('hold');
    setCountdown(30);
  }, [counter]);

  // Retry bargain
  const onRetry = useCallback(() => {
    reset();
    setStep('input');
    setOffer(null);
    setCounter(null);
    setError(null);
  }, [reset]);

  // Stable input handler
  const handleOfferChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value.replace(/\D/g, '')) || null;
    setOffer(value);
    setError(null);
  }, []);

  if (!isOpen || !flight || !fareType) return null;

  const savings = counter && fareType.price - counter > 0 ? fareType.price - counter : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="fd-modal">
      {/* Header */}
      <header className="fd-modal__hdr">
        <div className="fd-hdr__left">
          <div className="fd-title">AI Price Negotiator</div>
          <div className="fd-sub">
            {flight.airline} {flight.flightNumber} • {flight.departureCode} → {flight.arrivalCode}
          </div>
        </div>
        <div className="fd-hdr__right">
          {formatCurrency(fareType.price, selectedCurrency.symbol)}
        </div>
        <button className="fd-close" onClick={onClose} aria-label="Close">
          ×
        </button>
      </header>

      {/* Input Step */}
      {step === 'input' && (
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
              placeholder="Enter your target price"
              onChange={handleOfferChange}
              value={offer || ''}
            />
          </div>

          {error && (
            <div style={{color: '#dc2626', textAlign: 'center', marginBottom: '16px', fontSize: '0.9rem'}}>
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
              Book Original Price {formatCurrency(fareType.price, selectedCurrency.symbol)}
            </button>
          </div>
        </section>
      )}

      {/* Chat Step */}
      {step === 'chat' && (
        <section className="fd-chat">
          {beats.slice(0, Math.min(cursor + 1, beats.length)).map((beat, i) => (
            <div key={beat.id} className={`fd-bubble fd-bubble--${beat.speaker}`}>
              {i === cursor && running ? (
                <span className="fd-typing" aria-hidden>•••</span>
              ) : i < cursor ? (
                <span>{beat.text}</span>
              ) : null}
            </div>
          ))}
          
          <div className="fd-meta">
            {negotiatedMs > 0 && (
              <span className="fd-chip">
                Negotiated in {(negotiatedMs / 1000).toFixed(1)}s
              </span>
            )}
          </div>
        </section>
      )}

      {/* Decision Step */}
      {step === 'decision' && counter && (
        <section className="fd-decision">
          <div className="fd-offerCard">
            <div className="fd-offerPrice">
              {formatCurrency(counter, selectedCurrency.symbol)}
            </div>
            {savings > 0 && (
              <div className="fd-savings">
                You save {formatCurrency(savings, selectedCurrency.symbol)}
              </div>
            )}
            <div className="fd-exp">
              Offer expires in: <strong>{countdown}s</strong>
            </div>
            <div className="fd-bar" />
          </div>
          
          <div className="fd-actions">
            <button 
              className="fd-btn fd-btn--success"
              onClick={onAcceptOffer}
            >
              <Shield className="w-4 h-4" />
              Accept {formatCurrency(counter, selectedCurrency.symbol)} — {countdown}s to book
            </button>
            
            {attempt < 3 && (
              <button 
                className="fd-btn fd-btn--outline"
                onClick={onRetry}
              >
                Bargain Again ({attempt}/3)
              </button>
            )}
          </div>
          
          <p className="fd-fomo">
            Most customers get the best deal early — demand is rising fast.
          </p>
        </section>
      )}

      {/* Hold Step */}
      {step === 'hold' && counter && (
        <section className="fd-hold">
          <div className="fd-lock">
            Price locked — completing your booking...
          </div>
          <div className="fd-bar" />
          <div style={{marginTop: '16px', color: '#6b7280', fontSize: '0.9rem'}}>
            Hold expires in: {countdown}s
          </div>
        </section>
      )}
      </div>
    </div>
  );
}
