import React, { useState, useEffect, useRef, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Plane,
  Building,
  MapPin,
  Car,
  MessageCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  Sparkles,
  TrendingUp,
  Shield,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatPriceNoDecimals } from "@/lib/formatPrice";
import { useBargainStatus, useCountdown, useChatBeats } from "@/hooks/useBargainStatus";

interface ChatBeat {
  id: string;
  type: 'agent' | 'supplier' | 'system';
  message: string;
  timestamp: number;
  icon?: React.ReactNode;
  emotion?: string;
}

interface AINegotiationChatProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  module: 'flights' | 'hotels' | 'sightseeing' | 'transfers';
  productDetails: {
    productRef: string;
    basePrice: number;
    // Flight specific
    airline?: string;
    flightNo?: string;
    route?: { from: string; to: string };
    // Hotel specific
    hotelName?: string;
    city?: string;
    // Sightseeing specific
    tourName?: string;
    location?: string;
    // Transfer specific
    pickup?: string;
    dropoff?: string;
  };
  userOffer: number;
  onBargainSuccess: (finalPrice: number, orderRef: string) => void;
  onBargainFailed: () => void;
}

interface BargainResponse {
  status: 'accepted' | 'counter' | 'reprice_needed' | 'expired' | 'error';
  finalPrice?: number;
  basePrice?: number;
  negotiatedInMs?: number;
  attempt?: {
    count: number;
    max: number;
    canRetry: boolean;
  };
  sessionId?: string;
  ai?: {
    emotion: string;
    strategy: string;
  };
  ui?: {
    templateVars?: Record<string, any>;
  };
}

interface HoldResponse {
  holdSeconds: number;
  orderRef: string;
  expiresAt: string;
  finalPrice: number;
}

export function AINegotiationChat({
  isOpen,
  onClose,
  title,
  module,
  productDetails,
  userOffer,
  onBargainSuccess,
  onBargainFailed,
}: AINegotiationChatProps) {
  const [chatBeats, setChatBeats] = useState<ChatBeat[]>([]);
  const [currentStep, setCurrentStep] = useState<'negotiating' | 'decision' | 'holding' | 'success' | 'failed'>('negotiating');
  const [bargainResult, setBargainResult] = useState<BargainResponse | null>(null);
  const [holdData, setHoldData] = useState<HoldResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [retryOffer, setRetryOffer] = useState(userOffer);
  const [error, setError] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Real-time status polling
  const bargainStatus = useBargainStatus({
    sessionId,
    enabled: currentStep === 'holding',
    onStateChange: (status) => {
      console.log('Bargain status changed:', status);
    },
    onExpired: () => {
      setCurrentStep('failed');
      setError('Hold expired');
    },
    onBooked: (orderRef, finalPrice) => {
      setCurrentStep('success');
      onBargainSuccess(finalPrice, orderRef);
    }
  });

  // Countdown timer for holds
  const countdown = useCountdown(30, () => {
    setCurrentStep('success');
    if (holdData) {
      onBargainSuccess(holdData.finalPrice, holdData.orderRef);
    }
  });
  const { selectedCurrency } = useCurrency();

  // Module-specific icons and colors
  const moduleConfig = useMemo(() => {
    switch (module) {
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
          icon: <MessageCircle className="w-4 h-4" />, 
          color: 'bg-gray-50 text-gray-600',
          supplierName: 'Supplier'
        };
    }
  }, [module]);

  // Format product summary
  const productSummary = useMemo(() => {
    switch (module) {
      case 'flights':
        return `${productDetails.airline || 'Flight'} ${productDetails.flightNo || ''} • ${productDetails.route?.from} → ${productDetails.route?.to}`;
      case 'hotels':
        return `${productDetails.hotelName || 'Hotel'} • ${productDetails.city || 'City'}`;
      case 'sightseeing':
        return `${productDetails.tourName || 'Tour'} • ${productDetails.location || 'Location'}`;
      case 'transfers':
        return `${productDetails.pickup || 'Pickup'} → ${productDetails.dropoff || 'Dropoff'}`;
      default:
        return 'Product Details';
    }
  }, [module, productDetails]);

  // Add chat beat with animation
  const addChatBeat = (beat: Omit<ChatBeat, 'id' | 'timestamp'>) => {
    const newBeat: ChatBeat = {
      ...beat,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };
    
    setChatBeats(prev => [...prev, newBeat]);
    
    // Scroll to bottom
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Start negotiation sequence
  const startNegotiation = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    setError(null);
    setChatBeats([]);
    
    try {
      // Beat 1: Faredown AI offers
      addChatBeat({
        type: 'agent',
        message: `We have ${formatPriceNoDecimals(userOffer, selectedCurrency)} for ${productSummary}. Can you approve?`,
        icon: <Sparkles className="w-4 h-4 text-blue-500" />,
      });

      // Wait 4 seconds for users to read
      await new Promise(resolve => setTimeout(resolve, 4000));

      // Beat 2: Supplier checks
      addChatBeat({
        type: 'supplier',
        message: `Listed at ${formatPriceNoDecimals(productDetails.basePrice, selectedCurrency)}. Checking now…`,
        icon: <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", moduleConfig.color)}>
          {moduleConfig.icon}
        </div>,
      });

      // Wait 3 seconds for processing simulation
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Call API
      const response = await fetch('/api/bargains/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          module,
          productRef: productDetails.productRef,
          userOffer,
          sessionId,
          routeInfo: {
            airline: productDetails.airline,
            flight_no: productDetails.flightNo,
            hotel_name: productDetails.hotelName,
            city: productDetails.city,
            tour_name: productDetails.tourName,
            pickup: productDetails.pickup,
            dropoff: productDetails.dropoff,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: BargainResponse = await response.json();
      setBargainResult(result);
      setSessionId(result.sessionId || null);

      // Beat 3: Supplier responds
      const supplierMessage = result.status === 'accepted' 
        ? `I can do ${formatPriceNoDecimals(result.finalPrice || userOffer, selectedCurrency)}.`
        : `Best I can return now is ${formatPriceNoDecimals(result.finalPrice || productDetails.basePrice, selectedCurrency)}.`;

      addChatBeat({
        type: 'supplier',
        message: supplierMessage,
        icon: <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", moduleConfig.color)}>
          {moduleConfig.icon}
        </div>,
      });

      // Wait 3 seconds for users to read supplier response
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Beat 4: Faredown AI confirms
      addChatBeat({
        type: 'agent',
        message: "Let me check with you if you want it.",
        icon: <Sparkles className="w-4 h-4 text-blue-500" />,
      });

      // Wait 2 seconds then show decision
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setCurrentStep('decision');
      
    } catch (error) {
      console.error('Negotiation error:', error);
      setError(error instanceof Error ? error.message : 'Negotiation failed');
      setCurrentStep('failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // Accept the offer
  const acceptOffer = async () => {
    if (!bargainResult?.finalPrice || !sessionId) return;
    
    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/bargains/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          finalPrice: bargainResult.finalPrice
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to accept offer: ${response.statusText}`);
      }

      const holdResult: HoldResponse = await response.json();
      setHoldData(holdResult);
      setCurrentStep('holding');

      // Start countdown timer
      countdown.reset(holdResult.holdSeconds);
      countdown.start();

    } catch (error) {
      console.error('Accept error:', error);
      setError(error instanceof Error ? error.message : 'Failed to accept offer');
    } finally {
      setIsProcessing(false);
    }
  };

  // Retry with new offer
  const retryBargain = () => {
    if (!bargainResult?.attempt?.canRetry) {
      setCurrentStep('failed');
      return;
    }
    
    setCurrentStep('negotiating');
    setBargainResult(null);
    setRetryOffer(prev => prev || userOffer);
    startNegotiation();
  };

  // Auto-start negotiation when opened
  useEffect(() => {
    if (isOpen && currentStep === 'negotiating' && chatBeats.length === 0) {
      startNegotiation();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto h-[600px] flex flex-col p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-semibold text-gray-900">
                {title}
              </DialogTitle>
              <p className="text-sm text-gray-600 mt-1">{productSummary}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
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
                <div className={cn(
                  "px-4 py-3 rounded-lg max-w-[280px]",
                  beat.type === 'agent' 
                    ? "bg-blue-500 text-white" 
                    : "bg-white border shadow-sm"
                )}>
                  <p className="text-sm">{beat.message}</p>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {beat.type === 'agent' ? 'Faredown AI' : moduleConfig.supplierName}
                </p>
              </div>
            </div>
          ))}

          {/* Processing indicator */}
          {isProcessing && currentStep === 'negotiating' && (
            <div className="flex items-center justify-center py-4">
              <div className="flex items-center space-x-2 text-gray-500">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Decision Panel */}
        {currentStep === 'decision' && bargainResult && (
          <div className="p-6 border-t bg-white">
            <div className="text-center mb-4">
              <Badge variant="secondary" className="mb-2">
                Negotiated in {((bargainResult.negotiatedInMs || 0) / 1000).toFixed(1)}s
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
                onClick={acceptOffer}
                disabled={isProcessing}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                Accept {formatPriceNoDecimals(bargainResult.finalPrice || 0, selectedCurrency)} — 30s to book
              </Button>

              {bargainResult.attempt?.canRetry && (
                <Button
                  onClick={retryBargain}
                  variant="outline"
                  className="w-full"
                  disabled={isProcessing}
                >
                  Bargain Again ({bargainResult.attempt.count}/{bargainResult.attempt.max})
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
                {countdown.seconds}s
              </div>

              <Progress value={(countdown.seconds / 30) * 100} className="mb-3" />

              <p className="text-sm text-gray-600">
                Hold expires in {countdown.seconds} seconds
              </p>
              
              <p className="text-xs text-gray-500 mt-2">
                Order Ref: {holdData.orderRef}
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {currentStep === 'failed' && (
          <div className="p-6 border-t bg-white">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 text-red-600 mb-3">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Bargain Window Expired</span>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                {error || "This fare can no longer be negotiated right now. Please re-search to try again."}
              </p>
              
              <Button onClick={onBargainFailed} className="w-full">
                Re-search Now
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
