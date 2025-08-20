import React, { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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

interface BargainSession {
  sessionId: string;
  module: 'flights' | 'hotels' | 'sightseeing' | 'transfers';
  productRef: string;
  userOffer: number;
  attemptCount?: number;
  productDetails: {
    title: string;
    subtitle?: string;
    basePrice: number;
    airline?: string;
    flightNo?: string;
    route?: { from: string; to: string };
    hotelName?: string;
    city?: string;
    tourName?: string;
    location?: string;
    pickup?: string;
    dropoff?: string;
  };
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

interface AINegotiationModalProps {
  isOpen: boolean;
  session: BargainSession | null;
  onClose: () => void;
  onAccept: (finalPrice: number, orderRef: string) => void;
  onRetry: () => void;
}

type BargainStep = 'negotiating' | 'decision' | 'holding' | 'success' | 'expired';

export function AINegotiationModal({
  isOpen,
  session,
  onClose,
  onAccept,
  onRetry
}: AINegotiationModalProps) {
  const [chatBeats, setChatBeats] = useState<ChatBeat[]>([]);
  const [currentStep, setCurrentStep] = useState<BargainStep>('negotiating');
  const [bargainResult, setBargainResult] = useState<BargainResult | null>(null);
  const [holdData, setHoldData] = useState<HoldResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [error, setError] = useState<string | null>(null);
  const [minDisplayTime, setMinDisplayTime] = useState(true);
  const [sessionUsedKeys, setSessionUsedKeys] = useState<Set<string>>(new Set());
  const [attemptNumber, setAttemptNumber] = useState(1);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const { selectedCurrency } = useCurrency();

  // Module configuration
  const moduleConfig = useMemo(() => {
    if (!session) return { icon: <Sparkles className="w-4 h-4" />, color: 'bg-gray-50 text-gray-600', supplierName: 'Supplier' };
    
    switch (session.module) {
      case 'flights':
        return { 
          icon: <Plane className="w-4 h-4" />, 
          color: 'bg-blue-50 text-blue-600',
          supplierName: 'Airline'
        };
      case 'hotels':
        return { 
          icon: <Building className="w-4 h-4" />, 
          color: 'bg-green-50 text-green-600',
          supplierName: 'Hotel'
        };
      case 'sightseeing':
        return { 
          icon: <MapPin className="w-4 h-4" />, 
          color: 'bg-purple-50 text-purple-600',
          supplierName: 'Tour Provider'
        };
      case 'transfers':
        return { 
          icon: <Car className="w-4 h-4" />, 
          color: 'bg-orange-50 text-orange-600',
          supplierName: 'Transfer Service'
        };
      default:
        return { 
          icon: <Sparkles className="w-4 h-4" />, 
          color: 'bg-gray-50 text-gray-600',
          supplierName: 'Supplier'
        };
    }
  }, [session?.module]);

  // Create template variables for copy variants (numbers for auto-formatting)
  const templateVars = useMemo(() => {
    if (!session) return {};
    return {
      offer: session.userOffer,
      base: session.productDetails.basePrice,
      airline: session.productDetails.airline || '',
      flight_no: session.productDetails.flightNo || '',
      hotel_name: session.productDetails.hotelName || '',
      city: session.productDetails.city || '',
      tour_name: session.productDetails.tourName || '',
      location: session.productDetails.location || '',
      pickup: session.productDetails.pickup || '',
      dropoff: session.productDetails.dropoff || ''
    };
  }, [session]);

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
      
      const beatId = `reveal-${Date.now()}`;
      
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

  // Start negotiation sequence with smooth flow
  const startNegotiation = async () => {
    if (!session || isProcessing) return;
    
    setIsProcessing(true);
    setError(null);
    setChatBeats([]);
    setCurrentStep('negotiating');
    setSessionUsedKeys(new Set());
    
    try {
      const attemptNo = session.attemptCount || 1;
      setAttemptNumber(attemptNo);
      
      // Beat 1: Faredown AI offers (with dynamic content and currency formatting)
      const agentOfferVariant = getCopyVariantWithCurrency(
        session.module,
        'agent_offer',
        attemptNo,
        'counter',
        templateVars,
        sessionUsedKeys,
        [],
        (amount: number) => formatPriceNoDecimals(amount, selectedCurrency)
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

      // Beat 2: Supplier checks (with dynamic content and currency formatting)
      const supplierCheckVariant = getCopyVariantWithCurrency(
        session.module,
        'supplier_check',
        1,
        'counter',
        templateVars,
        sessionUsedKeys,
        [],
        (amount: number) => formatPriceNoDecimals(amount, selectedCurrency)
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
          module: session.module,
          productRef: session.productRef,
          userOffer: session.userOffer,
          sessionId: session.sessionId,
          routeInfo: {
            airline: session.productDetails.airline,
            flight_no: session.productDetails.flightNo,
            hotel_name: session.productDetails.hotelName,
            city: session.productDetails.city,
            tour_name: session.productDetails.tourName,
            pickup: session.productDetails.pickup,
            dropoff: session.productDetails.dropoff,
          }
        })
      });

      let result: BargainResult;

      if (!response.ok) {
        // Fallback response for development
        console.warn('API call failed, using fallback');
        result = {
          status: Math.random() > 0.3 ? 'counter' : 'accepted',
          finalPrice: Math.random() > 0.5 ? Math.round(session.userOffer * 1.1) : session.userOffer,
          basePrice: session.productDetails.basePrice,
          negotiatedInMs: Math.random() * 5000 + 2000,
          sessionId: session.sessionId,
          attempt: {
            count: attemptNo,
            max: 3,
            canRetry: attemptNo < 3
          }
        };
      } else {
        result = await response.json();
      }

      setBargainResult(result);

      // Beat 3: Supplier responds (with dynamic content and currency formatting)
      const supplierCounterVariant = getCopyVariantWithCurrency(
        session.module,
        'supplier_counter',
        1,
        result.status as 'accepted' | 'counter',
        {
          ...templateVars,
          counter: result.finalPrice || session.userOffer
        },
        sessionUsedKeys,
        [],
        (amount: number) => formatPriceNoDecimals(amount, selectedCurrency)
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

      // Beat 4: Faredown AI confirms (with dynamic content and currency formatting)
      const agentConfirmVariant = getCopyVariantWithCurrency(
        session.module,
        'agent_user_confirm',
        1,
        'counter',
        templateVars,
        sessionUsedKeys,
        [],
        (amount: number) => formatPriceNoDecimals(amount, selectedCurrency)
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
    if (!bargainResult?.finalPrice || !session?.sessionId || minDisplayTime) return;
    
    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/bargains/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.sessionId,
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
      onRetry();
      // Reset state for new attempt
      setCurrentStep('negotiating');
      setBargainResult(null);
      setError(null);
      startNegotiation();
    }
  };

  // Start negotiation when session opens
  useEffect(() => {
    if (session && isOpen) {
      startNegotiation();
    }
  }, [session, isOpen]);

  if (!isOpen || !session) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto h-[600px] flex flex-col p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-semibold text-gray-900">
                {getBrandString('negotiatorTitle')}
              </DialogTitle>
              <p className="text-sm text-gray-600 mt-1 truncate">{session.productDetails.title}</p>
              {session.productDetails.subtitle && (
                <p className="text-xs text-gray-500">{session.productDetails.subtitle}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          {/* Attempt indicator */}
          {bargainResult?.attempt && (
            <div className="mt-2">
              <span className="text-xs text-gray-500">
                Round {bargainResult.attempt.count} of {bargainResult.attempt.max}
              </span>
            </div>
          )}
        </DialogHeader>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
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
                  <>{getBrandString('acceptButton').replace('{final_price}', formatPriceNoDecimals(bargainResult.finalPrice || 0, selectedCurrency)).replace('{seconds_left}', '30')}</>
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
