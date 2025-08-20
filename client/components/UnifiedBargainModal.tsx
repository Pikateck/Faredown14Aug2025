import React, { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plane,
  Building,
  MapPin,
  Car,
  X,
  Sparkles,
  CheckCircle,
  TrendingUp,
  Clock,
  AlertCircle,
  Shield,
  MessageCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatPriceNoDecimals } from "@/lib/formatPrice";
import { numberToWords } from "@/lib/numberToWords";
import { getCopyVariantWithCurrency, getBrandString } from "@/utils/copyVariants";

interface ChatBeat {
  id: string;
  type: 'agent' | 'supplier' | 'system' | 'typing';
  message: string;
  timestamp: number;
  icon?: React.ReactNode;
  variantKey?: string;
  isTyping?: boolean;
}

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

interface BargainResult {
  status: 'accepted' | 'counter' | 'expired' | 'error';
  finalPrice?: number;
  basePrice?: number;
  negotiatedInMs?: number;
  attempt?: {
    count: number;
    max: number;
    canRetry: boolean;
  };
  sessionId?: string;
}

interface HoldResponse {
  holdSeconds: number;
  orderRef: string;
  expiresAt: string;
  finalPrice: number;
}

interface UnifiedBargainModalProps {
  isOpen: boolean;
  flight: FlightDetails | null;
  fareType: FareType | null;
  onClose: () => void;
  onAccept: (finalPrice: number, orderRef: string) => void;
  onBookOriginal: () => void;
}

type BargainStep = 'input' | 'negotiating' | 'decision' | 'holding' | 'success' | 'expired';

export function UnifiedBargainModal({
  isOpen,
  flight,
  fareType,
  onClose,
  onAccept,
  onBookOriginal
}: UnifiedBargainModalProps) {
  const [currentStep, setCurrentStep] = useState<BargainStep>('input');
  const [bargainPrice, setBargainPrice] = useState('');
  const [duplicatePriceError, setDuplicatePriceError] = useState(false);
  const [chatBeats, setChatBeats] = useState<ChatBeat[]>([]);
  const [bargainResult, setBargainResult] = useState<BargainResult | null>(null);
  const [holdData, setHoldData] = useState<HoldResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [error, setError] = useState<string | null>(null);
  const [minDisplayTime, setMinDisplayTime] = useState(true);
  const [sessionUsedKeys, setSessionUsedKeys] = useState<Set<string>>(new Set());
  const [attemptNumber, setAttemptNumber] = useState(1);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const { selectedCurrency, convertPrice } = useCurrency();

  // Module configuration for flights
  const moduleConfig = {
    icon: <Plane className="w-4 h-4" />, 
    color: 'bg-blue-50 text-blue-600',
    supplierName: 'Airline'
  };

  // Create template variables for copy variants
  const templateVars = useMemo(() => {
    if (!flight || !fareType) return {};
    return {
      offer: parseInt(bargainPrice) || 0,
      base: fareType.price,
      airline: flight.airline,
      flight_no: flight.flightNumber,
      hotel_name: '',
      city: '',
      tour_name: '',
      location: '',
      pickup: '',
      dropoff: ''
    };
  }, [flight, fareType, bargainPrice]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('input');
      setBargainPrice('');
      setDuplicatePriceError(false);
      setChatBeats([]);
      setBargainResult(null);
      setHoldData(null);
      setError(null);
      setSessionUsedKeys(new Set());
      setAttemptNumber(1);
      setSessionId(`session_${Date.now()}_${flight?.id}`);
    }
  }, [isOpen, flight?.id]);

  // Add chat beat with animation
  const addChatBeat = (beat: Omit<ChatBeat, 'id' | 'timestamp'>) => {
    const newBeat: ChatBeat = {
      ...beat,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
    };
    
    setChatBeats(prev => [...prev, newBeat]);
    
    // Track variant key if provided
    if (beat.variantKey) {
      setSessionUsedKeys(prev => new Set([...prev, beat.variantKey!]));
    }
    
    // Scroll to bottom
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Add typing indicator
  const addTypingIndicator = (type: 'agent' | 'supplier'): Promise<void> => {
    return new Promise((resolve) => {
      const typingId = `typing-${Date.now()}`;
      
      addChatBeat({
        type: 'typing',
        message: '',
        isTyping: true,
        icon: type === 'agent' 
          ? <Sparkles className="w-4 h-4 text-blue-500" />
          : <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", moduleConfig.color)}>
              {moduleConfig.icon}
            </div>
      });

      // Remove typing indicator after realistic typing time
      const typingDuration = Math.random() * 1500 + 1000; // 1-2.5s
      setTimeout(() => {
        setChatBeats(prev => prev.filter(beat => beat.id !== typingId));
        resolve();
      }, typingDuration);
    });
  };

  // Progressive message reveal
  const revealMessage = async (fullMessage: string, type: 'agent' | 'supplier', icon: React.ReactNode, variantKey?: string): Promise<void> => {
    return new Promise((resolve) => {
      let currentText = '';
      const words = fullMessage.split(' ');
      let wordIndex = 0;
      
      // Add initial empty beat
      addChatBeat({
        type,
        message: '',
        icon,
        variantKey
      });

      const revealNextWord = () => {
        if (wordIndex < words.length) {
          currentText += (currentText ? ' ' : '') + words[wordIndex];
          wordIndex++;
          
          // Update the last beat
          setChatBeats(prev => 
            prev.map(beat => 
              beat.id === prev[prev.length - 1]?.id 
                ? { ...beat, message: currentText }
                : beat
            )
          );
          
          // Continue with next word after realistic delay
          setTimeout(revealNextWord, Math.random() * 200 + 100); // 100-300ms per word
        } else {
          resolve();
        }
      };

      revealNextWord();
    });
  };

  // Start AI negotiation
  const startNegotiation = async () => {
    console.log('🔥 startNegotiation called!', { flight, fareType, bargainPrice, currentStep });

    if (!flight || !fareType || !bargainPrice) {
      console.error('❌ Missing required data:', { flight: !!flight, fareType: !!fareType, bargainPrice: !!bargainPrice });
      return;
    }

    const targetPriceInSelectedCurrency = parseInt(bargainPrice);
    // Convert from selected currency back to INR (base currency)
    const targetPriceInINR = selectedCurrency.code === 'INR'
      ? targetPriceInSelectedCurrency
      : Math.round(targetPriceInSelectedCurrency / selectedCurrency.rate);
    const currentPriceInINR = fareType.price;

    console.log('💰 Price validation:', {
      targetPriceInSelectedCurrency,
      targetPriceInINR,
      currentPriceInINR,
      selectedCurrency: selectedCurrency.code,
      currencyRate: selectedCurrency.rate,
      isValid: targetPriceInINR < currentPriceInINR
    });

    if (targetPriceInINR >= currentPriceInINR) {
      console.error('❌ Price validation failed - target price must be lower');
      setDuplicatePriceError(true);
      setTimeout(() => setDuplicatePriceError(false), 5000);
      return;
    }

    console.log('✅ Price validation passed, starting negotiation flow...');

    setDuplicatePriceError(false);
    setCurrentStep('negotiating');
    setIsProcessing(true);
    setError(null);
    setChatBeats([]);
    
    try {
      // Beat 1: Faredown AI offers
      const agentOfferVariant = getCopyVariantWithCurrency(
        'flights',
        'agent_offer',
        attemptNumber,
        'counter',
        {
          ...templateVars,
          offer: targetPriceInINR
        },
        sessionUsedKeys,
        [],
        (amount: number) => formatPriceNoDecimals(amount, selectedCurrency.symbol)
      );

      await addTypingIndicator('agent');
      await revealMessage(
        agentOfferVariant.text,
        'agent',
        <Sparkles className="w-4 h-4 text-blue-500" />,
        agentOfferVariant.key
      );

      // Realistic pause for reading
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Beat 2: Supplier checks
      const supplierCheckVariant = getCopyVariantWithCurrency(
        'flights',
        'supplier_check',
        1,
        'counter',
        templateVars,
        sessionUsedKeys,
        [],
        (amount: number) => formatPriceNoDecimals(amount, selectedCurrency.symbol)
      );

      await addTypingIndicator('supplier');
      await revealMessage(
        supplierCheckVariant.text,
        'supplier',
        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", moduleConfig.color)}>
          {moduleConfig.icon}
        </div>,
        supplierCheckVariant.key
      );

      // Longer pause for "processing"
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Call API
      const response = await fetch('/api/bargains/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          module: 'flights',
          productRef: flight.id.toString(),
          userOffer: targetPriceInINR,
          sessionId: sessionId,
          routeInfo: {
            airline: flight.airline,
            flight_no: flight.flightNumber,
            hotel_name: '',
            city: '',
            tour_name: '',
            pickup: '',
            dropoff: '',
          }
        })
      });

      let result: BargainResult;

      if (!response.ok) {
        // Fallback response for development
        console.warn('API call failed, using fallback');
        result = {
          status: Math.random() > 0.3 ? 'counter' : 'accepted',
          finalPrice: Math.random() > 0.5 ? Math.round(targetPriceInINR * 1.1) : targetPriceInINR,
          basePrice: fareType.price,
          negotiatedInMs: Math.random() * 5000 + 2000,
          sessionId: sessionId || undefined,
          attempt: {
            count: attemptNumber,
            max: 3,
            canRetry: attemptNumber < 3
          }
        };
      } else {
        result = await response.json();
      }

      setBargainResult(result);

      // Beat 3: Supplier responds
      const supplierCounterVariant = getCopyVariantWithCurrency(
        'flights',
        'supplier_counter',
        1,
        result.status as 'accepted' | 'counter',
        {
          ...templateVars,
          counter: result.finalPrice || targetPriceInINR
        },
        sessionUsedKeys,
        [],
        (amount: number) => formatPriceNoDecimals(amount, selectedCurrency.symbol)
      );

      await addTypingIndicator('supplier');
      await revealMessage(
        supplierCounterVariant.text,
        'supplier',
        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", moduleConfig.color)}>
          {moduleConfig.icon}
        </div>,
        supplierCounterVariant.key
      );

      // Brief pause for reading
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Beat 4: Faredown AI confirms
      const agentConfirmVariant = getCopyVariantWithCurrency(
        'flights',
        'agent_user_confirm',
        1,
        'counter',
        templateVars,
        sessionUsedKeys,
        [],
        (amount: number) => formatPriceNoDecimals(amount, selectedCurrency.symbol)
      );

      await addTypingIndicator('agent');
      await revealMessage(
        agentConfirmVariant.text,
        'agent',
        <Sparkles className="w-4 h-4 text-blue-500" />,
        agentConfirmVariant.key
      );

      // Brief pause then show decision
      await new Promise(resolve => setTimeout(resolve, 800));

      setCurrentStep('decision');

      // Start 10-second minimum display timer for decision panel
      setMinDisplayTime(true);
      setTimeout(() => {
        setMinDisplayTime(false);
      }, 10000); // 10 seconds minimum
      
    } catch (error) {
      console.error('Negotiation error:', error);
      setError(error instanceof Error ? error.message : 'Negotiation failed');
      setCurrentStep('expired');
    } finally {
      setIsProcessing(false);
    }
  };

  // Accept the offer
  const handleAccept = async () => {
    if (!bargainResult?.finalPrice || !sessionId || minDisplayTime) return;
    
    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/bargains/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionId,
          finalPrice: bargainResult.finalPrice
        })
      });

      let holdResult: HoldResponse;

      if (!response.ok) {
        // Fallback for development
        console.warn('Accept API call failed, using fallback');
        holdResult = {
          holdSeconds: 30,
          orderRef: `ORDER-${Date.now()}`,
          expiresAt: new Date(Date.now() + 30000).toISOString(),
          finalPrice: bargainResult.finalPrice
        };
      } else {
        holdResult = await response.json();
      }

      setHoldData(holdResult);
      setCurrentStep('holding');
      setCountdown(holdResult.holdSeconds);

      // Start countdown
      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            setCurrentStep('success');
            onAccept(holdResult.finalPrice, holdResult.orderRef);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (error) {
      console.error('Accept error:', error);
      setError(error instanceof Error ? error.message : 'Failed to accept offer');
    } finally {
      setIsProcessing(false);
    }
  };

  // Retry bargain
  const handleRetry = () => {
    if (bargainResult?.attempt?.canRetry) {
      setAttemptNumber(prev => prev + 1);
      setCurrentStep('negotiating');
      setBargainResult(null);
      setError(null);
      startNegotiation();
    }
  };

  if (!isOpen || !flight || !fareType) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full h-full max-w-none m-0 rounded-none md:max-w-2xl md:h-auto md:rounded-lg bg-gradient-to-br from-blue-50 to-white overflow-y-auto">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-semibold text-gray-900">
                {currentStep === 'input' ? 'AI Price Negotiation' : getBrandString('negotiatorTitle')}
              </DialogTitle>
              <p className="text-sm text-gray-600 mt-1">
                {flight.airline} {flight.flightNumber} • {flight.departureCode} → {flight.arrivalCode}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          {/* Attempt indicator for negotiation steps */}
          {bargainResult?.attempt && currentStep !== 'input' && (
            <div className="mt-2">
              <span className="text-xs text-gray-500">
                Round {bargainResult.attempt.count} of {bargainResult.attempt.max}
              </span>
            </div>
          )}
        </DialogHeader>

        {/* Price Input Step */}
        {currentStep === 'input' && (
          <div className="p-6 space-y-6">
            {/* Flight Summary */}
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {flight.airline} {flight.flightNumber}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {flight.departureCode} → {flight.arrivalCode} • {flight.duration}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-[#003580]">
                    {formatPriceNoDecimals(fareType.price, selectedCurrency.symbol)}
                  </p>
                  <p className="text-sm text-gray-600">{fareType.type}</p>
                </div>
              </div>
            </div>

            {/* Price Input */}
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-xl md:text-2xl font-bold text-[#003580] mb-2">
                  What's your target price?
                </h2>
                <p className="text-gray-600">
                  Our AI will negotiate with the airline on your behalf
                </p>
              </div>

              <div className="relative">
                <Input
                  type="number"
                  value={bargainPrice}
                  onChange={(e) => {
                    setBargainPrice(e.target.value);
                    setDuplicatePriceError(false);
                  }}
                  placeholder="Enter your target price"
                  className={`text-lg md:text-xl font-bold text-center py-4 md:py-6 border-2 focus:border-[#003580] placeholder:text-gray-400 placeholder:font-normal rounded-xl bg-white shadow-sm transition-colors ${
                    duplicatePriceError
                      ? "border-red-300 focus:border-red-500"
                      : "border-[#003580]/20"
                  }`}
                />
                <div className="absolute inset-y-0 left-3 md:left-4 flex items-center">
                  <span className="text-[#003580] text-lg md:text-xl font-semibold">
                    {selectedCurrency.symbol}
                  </span>
                </div>
              </div>

              {bargainPrice && (
                <p className="text-center text-sm text-gray-600 mt-2 font-medium">
                  {numberToWords(bargainPrice)}
                </p>
              )}

              {duplicatePriceError && (
                <p className="text-center text-sm text-red-600 mt-2">
                  Please enter a price lower than the current fare
                </p>
              )}
            </div>

            <div className="space-y-3">
              <Button
                onClick={startNegotiation}
                disabled={!bargainPrice || parseInt(bargainPrice) <= 0}
                className="w-full bg-gradient-to-r from-[#003580] to-[#0071c2] hover:from-[#002d6b] hover:to-[#005a9f] text-white py-4 md:py-6 text-base md:text-lg font-semibold rounded-xl disabled:bg-gray-400 shadow-lg"
              >
                Start AI Negotiation
              </Button>

              <Button
                onClick={onBookOriginal}
                variant="outline"
                className="w-full py-4 md:py-6 text-base md:text-lg font-semibold rounded-xl border-2 border-[#003580]/20 text-[#003580] hover:bg-[#003580]/5"
              >
                Book Original Price {formatPriceNoDecimals(fareType.price, selectedCurrency.symbol)}
              </Button>
            </div>
          </div>
        )}

        {/* Chat Messages (for negotiating and decision steps) */}
        {(currentStep === 'negotiating' || currentStep === 'decision') && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 max-h-96">
            {chatBeats.map((beat) => (
              <div
                key={beat.id}
                className={cn(
                  "flex items-start space-x-3 animate-in fade-in-50 slide-in-from-left-2",
                  beat.type === 'agent' ? 'flex-row' : 'flex-row'
                )}
              >
                <div className="flex-shrink-0">
                  {beat.icon || (
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <MessageCircle className="w-4 h-4 text-gray-500" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  {beat.isTyping ? (
                    <div className={cn(
                      "px-4 py-3 rounded-lg max-w-[280px]",
                      beat.type === 'agent' || beat.type === 'typing'
                        ? "bg-blue-500 text-white" 
                        : "bg-white border shadow-sm"
                    )}>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  ) : (
                    <div className={cn(
                      "px-4 py-3 rounded-lg max-w-[280px]",
                      beat.type === 'agent' 
                        ? "bg-blue-500 text-white" 
                        : "bg-white border shadow-sm"
                    )}>
                      <p className="text-sm">{beat.message}</p>
                    </div>
                  )}
                  {!beat.isTyping && (
                    <p className="text-xs text-gray-500 mt-1">
                      {beat.type === 'agent' ? getBrandString('aiName') : moduleConfig.supplierName}
                    </p>
                  )}
                </div>
              </div>
            ))}

            <div ref={chatEndRef} />
          </div>
        )}

        {/* Decision Panel */}
        {currentStep === 'decision' && bargainResult && (
          <div className="p-6 border-t bg-white">
            <div className="text-center mb-4">
              <Badge variant="secondary" className="mb-2">
                {getBrandString('negotiatedBadge').replace('{seconds}', ((bargainResult.negotiatedInMs || 0) / 1000).toFixed(1))}
              </Badge>
              
              {bargainResult.status === 'accepted' ? (
                <div className="flex items-center justify-center space-x-2 text-green-600 mb-3">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Offer Accepted!</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2 text-orange-600 mb-3">
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-medium">Counter Offer</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleAccept}
                disabled={isProcessing || minDisplayTime}
                className="w-full bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
              >
                {minDisplayTime ? (
                  <>Reading offer details...</>
                ) : (
                  <>Accept {formatPriceNoDecimals(bargainResult.finalPrice || 0, selectedCurrency.symbol)} — 30s to book</>
                )}
              </Button>

              {bargainResult.attempt?.canRetry && (
                <Button
                  onClick={handleRetry}
                  variant="outline"
                  className="w-full disabled:opacity-50"
                  disabled={isProcessing || minDisplayTime}
                >
                  {minDisplayTime ? (
                    <>Please wait...</>
                  ) : (
                    <>{getBrandString('bargainAgain')} ({bargainResult.attempt.count}/{bargainResult.attempt.max})</>
                  )}
                </Button>
              )}
            </div>

            <p className="text-xs text-gray-500 text-center mt-3">
              Most customers get the best deal early — demand is rising fast.
            </p>
          </div>
        )}

        {/* Holding State */}
        {currentStep === 'holding' && holdData && (
          <div className="p-6 border-t bg-white">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 text-blue-600 mb-3">
                <Shield className="w-5 h-5" />
                <span className="font-medium">Price Locked!</span>
              </div>
              
              <div className="text-2xl font-bold text-gray-900 mb-2">
                {countdown}s
              </div>

              <Progress value={(countdown / 30) * 100} className="mb-3" />

              <p className="text-sm text-gray-600">
                Hold expires in {countdown} seconds
              </p>
              
              <p className="text-xs text-gray-500 mt-2">
                Order Ref: {holdData.orderRef}
              </p>
            </div>
          </div>
        )}

        {/* Error/Expired State */}
        {(currentStep === 'expired' || error) && (
          <div className="p-6 border-t bg-white">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 text-red-600 mb-3">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">{getBrandString('expiredTitle')}</span>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                {error || getBrandString('expiredBody')}
              </p>
              
              <Button onClick={onClose} className="w-full">
                {getBrandString('reSearchCta')}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
