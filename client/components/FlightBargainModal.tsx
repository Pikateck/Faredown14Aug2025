import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  RefreshCw,
  Info,
  Plane,
  Clock,
  Shield,
  CheckCircle,
  AlertCircle,
  X,
  XCircle,
} from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Flight } from "@/services/flightsService";
import { numberToWords } from "@/lib/numberToWords";

interface FlightBargainModalProps {
  flight: Flight | null;
  isOpen: boolean;
  onClose: () => void;
  onBookingSuccess?: (finalPrice: number) => void;
}

interface BargainState {
  phase: "initial" | "negotiating" | "counter_offer" | "accepted" | "rejected";
  userOffers: number[];
  currentCounterOffer?: number;
  timeRemaining: number;
  isTimerActive: boolean;
  negotiationProgress: number;
}

// Format number with commas
const formatNumberWithCommas = (num: string | number): string => {
  const numStr = typeof num === "string" ? num : num.toString();
  return parseInt(numStr).toLocaleString("en-IN");
};

export function FlightBargainModal({
  flight,
  isOpen,
  onClose,
  onBookingSuccess,
}: FlightBargainModalProps) {
  const { selectedCurrency } = useCurrency();
  const navigate = useNavigate();
  const [bargainPrice, setBargainPrice] = useState("");
  const [bargainState, setBargainState] = useState<BargainState>({
    phase: "initial",
    userOffers: [],
    timeRemaining: 30,
    isTimerActive: false,
    negotiationProgress: 0,
  });
  const [usedPrices, setUsedPrices] = useState<Set<string>>(new Set());
  const [duplicatePriceError, setDuplicatePriceError] = useState(false);

  // Timer effect
  useEffect(() => {
    if (bargainState.isTimerActive && bargainState.timeRemaining > 0) {
      const timer = setTimeout(() => {
        setBargainState((prev) => ({
          ...prev,
          timeRemaining: prev.timeRemaining - 1,
        }));
      }, 1000);
      return () => clearTimeout(timer);
    } else if (bargainState.isTimerActive && bargainState.timeRemaining === 0) {
      if (bargainState.phase === "counter_offer") {
        setBargainState((prev) => ({
          ...prev,
          phase: "rejected",
          isTimerActive: false,
        }));
      } else if (bargainState.phase === "accepted") {
        setBargainState((prev) => ({
          ...prev,
          isTimerActive: false,
        }));
      }
    }
  }, [
    bargainState.isTimerActive,
    bargainState.timeRemaining,
    bargainState.phase,
  ]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setBargainState({
        phase: "initial",
        userOffers: [],
        timeRemaining: 30,
        isTimerActive: false,
        negotiationProgress: 0,
      });
      setBargainPrice("");
      setUsedPrices(new Set());
      setDuplicatePriceError(false);
    }
  }, [isOpen]);

  const startBargaining = async () => {
    if (!bargainPrice || !flight) return;

    const proposedPrice = parseInt(bargainPrice);
    const priceKey = `${flight.id}-${proposedPrice}`;

    // Allow same price to be entered multiple times for different AI responses
    // Remove duplicate price restriction as requested by user

    // Check if price is too high
    if (proposedPrice >= flight.price.amount) {
      setDuplicatePriceError(true);
      return;
    }

    // Don't track used prices anymore to allow repeats

    setBargainState((prev) => ({
      ...prev,
      phase: "negotiating",
      userOffers: [...prev.userOffers, proposedPrice],
      negotiationProgress: 0,
    }));

    // Simulate negotiation with progress animation
    const progressInterval = setInterval(() => {
      setBargainState((prev) => {
        const newProgress = prev.negotiationProgress + 10;
        if (newProgress >= 100) {
          clearInterval(progressInterval);
          return { ...prev, negotiationProgress: 100 };
        }
        return { ...prev, negotiationProgress: newProgress };
      });
    }, 300);

    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Negotiation logic
    const originalPrice = flight.price.amount;
    const minAcceptablePrice = originalPrice * 0.65;
    const goodPrice = originalPrice * 0.95;

    // 80% chance of counter offer for testing
    const shouldCounter = Math.random() > 0.2;

    if (proposedPrice >= goodPrice && !shouldCounter) {
      setBargainState((prev) => ({
        ...prev,
        phase: "accepted",
        isTimerActive: true,
        timeRemaining: 28,
      }));
    } else if (proposedPrice >= minAcceptablePrice) {
      const counterOffer = Math.round(
        originalPrice * (0.75 + Math.random() * 0.15),
      );
      setBargainState((prev) => ({
        ...prev,
        phase: "counter_offer",
        currentCounterOffer: counterOffer,
        timeRemaining: 30,
        isTimerActive: true,
      }));
    } else {
      setBargainState((prev) => ({
        ...prev,
        phase: "rejected",
        isTimerActive: false,
      }));
    }

    setBargainPrice("");
  };

  const handleAcceptCounterOffer = () => {
    setBargainState((prev) => ({
      ...prev,
      phase: "accepted",
      isTimerActive: true,
      timeRemaining: 28,
    }));
  };

  const handleBookDeal = () => {
    const finalPrice =
      bargainState.currentCounterOffer ||
      bargainState.userOffers[bargainState.userOffers.length - 1] ||
      0;

    // Close modal immediately to prevent double-click issues
    onClose();

    if (onBookingSuccess) {
      onBookingSuccess(finalPrice);
    } else {
      // Navigate to booking flow with bargained price
      navigate("/booking-flow", {
        state: {
          selectedFlight: flight,
          selectedFareType: {
            id: "bargained",
            name: flight?.fareClass || "Economy",
            price: finalPrice,
            refundability: "Non-Refundable",
          },
          negotiatedPrice: finalPrice,
          passengers: { adults: 1, children: 0 },
        },
      });
    }
  };

  const formatPrice = (amount: number) => {
    return `${selectedCurrency.symbol}${amount.toLocaleString("en-IN")}`;
  };

  if (!flight) return null;

  const renderContent = () => {
    switch (bargainState.phase) {
      case "initial":
        return (
          <>
            {/* Flight Info */}
            <div className="bg-white rounded-xl p-3 md:p-6 border border-[#003580]/10 shadow-sm">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-[#003580]/10 rounded-lg flex items-center justify-center">
                    <Plane className="w-6 h-6 text-[#003580]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">
                      {flight.airline}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {flight.fareClass || "Economy"} • {flight.flightNumber}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl md:text-3xl font-bold text-[#003580] mb-1">
                    {formatPrice(flight.price.amount)}
                  </p>
                  <p className="text-xs text-gray-500">(All Inclusive Price)</p>
                </div>
              </div>
            </div>

            {/* AI Interface */}
            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center space-x-3 md:space-x-4 p-3 md:p-4 bg-gradient-to-r from-[#003580]/5 to-[#0071c2]/5 rounded-xl border border-[#003580]/10">
                <div className="w-12 h-12 bg-gradient-to-r from-[#003580] to-[#0071c2] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">AI</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">
                    AI Assistant
                  </p>
                  <p className="text-sm text-gray-600">
                    Tell me your target price and I'll negotiate with the airline!
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm md:text-base font-semibold mb-3 text-gray-900 text-center">
                  What price would you like to pay? ({selectedCurrency.symbol})
                </label>

                {/* Error Message Box */}
                {duplicatePriceError && (
                  <div className="mb-4 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-4 shadow-lg animate-pulse">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <XCircle className="w-6 h-6 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-red-800 font-bold text-lg mb-1">
                          Invalid Price!
                        </h4>
                        <p className="text-red-700 text-sm font-medium">
                          {usedPrices.has(`${flight.id}-${parseInt(bargainPrice)}`)
                            ? "You've already tried this exact price! Please enter a different amount."
                            : "Please enter a price lower than the current price to start negotiation!"}
                        </p>
                      </div>
                      <button
                        onClick={() => setDuplicatePriceError(false)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}

                <div className="relative">
                  <Input
                    type="text"
                    value={
                      bargainPrice ? formatNumberWithCommas(bargainPrice) : ""
                    }
                    onChange={(e) => {
                      const numericValue = e.target.value.replace(/[^0-9]/g, "");
                      setBargainPrice(numericValue);
                      if (duplicatePriceError) {
                        setDuplicatePriceError(false);
                      }
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

                {/* Price in Words */}
                {bargainPrice && (
                  <p className="text-center text-sm text-gray-600 mt-2 font-medium">
                    {numberToWords(parseInt(bargainPrice))} rupees only
                  </p>
                )}
              </div>

              <Button
                onClick={startBargaining}
                disabled={!bargainPrice || parseInt(bargainPrice) <= 0}
                className="w-full bg-gradient-to-r from-[#003580] to-[#0071c2] hover:from-[#002d6b] hover:to-[#005a9f] active:from-[#002447] active:to-[#004687] text-white py-4 md:py-6 text-base md:text-lg font-semibold rounded-xl disabled:bg-gray-400 shadow-lg active:shadow-md transition-all touch-manipulation min-h-[52px]"
              >
                Start AI Negotiation
              </Button>
            </div>
          </>
        );

      case "negotiating":
        return (
          <div className="space-y-4">
            {/* AI Negotiation Header */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">AI</span>
                  </div>
                  AI Price Negotiator
                </h3>
                <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                  {bargainState.negotiationProgress < 100 ? "Negotiating..." : "Negotiated in 8.2s"}
                </div>
              </div>

              <div className="text-sm text-gray-600">
                {flight?.airline} {flight?.flightNumber} • Flight
              </div>
            </div>

            {/* Live Chat Messages */}
            <div className="space-y-3 bg-gray-50 rounded-xl p-4 max-h-60 overflow-y-auto">
              {/* Beat 1: AI Agent */}
              <div className="flex items-start space-x-3 animate-in fade-in-50 slide-in-from-left-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">AI</span>
                </div>
                <div className="flex-1">
                  <div className="bg-blue-500 text-white p-3 rounded-lg max-w-[280px]">
                    <p className="text-sm">
                      We have {formatPrice(parseInt(bargainPrice || "0"))} for {flight?.airline} {flight?.flightNumber}. Can you approve?
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Faredown AI</p>
                </div>
              </div>

              {/* Beat 2: Airline - appears after 25% progress */}
              {bargainState.negotiationProgress > 25 && (
                <div className="flex items-start space-x-3 animate-in fade-in-50 slide-in-from-left-2">
                  <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Plane className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-white border shadow-sm p-3 rounded-lg max-w-[280px]">
                      <p className="text-sm">
                        Listed at {formatPrice(flight?.price?.amount || 0)}. Checking now…
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{flight?.airline}</p>
                  </div>
                </div>
              )}

              {/* Beat 3: Airline Response - appears after 60% progress */}
              {bargainState.negotiationProgress > 60 && (
                <div className="flex items-start space-x-3 animate-in fade-in-50 slide-in-from-left-2">
                  <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Plane className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-white border shadow-sm p-3 rounded-lg max-w-[280px]">
                      <p className="text-sm">
                        I can do {formatPrice(Math.round((flight?.price?.amount || 0) * 0.85))}.
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{flight?.airline}</p>
                  </div>
                </div>
              )}

              {/* Beat 4: AI to Customer - appears after 90% progress */}
              {bargainState.negotiationProgress > 90 && (
                <div className="flex items-start space-x-3 animate-in fade-in-50 slide-in-from-left-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">AI</span>
                  </div>
                  <div className="flex-1">
                    <div className="bg-blue-500 text-white p-3 rounded-lg max-w-[280px]">
                      <p className="text-sm">Let me check with you if you want it.</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Faredown AI</p>
                  </div>
                </div>
              )}
            </div>

            {/* Progress indicator (only visible during active negotiation) */}
            {bargainState.negotiationProgress < 100 && (
              <div className="bg-white rounded-lg p-3 border">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Negotiation Progress</span>
                  <span className="text-sm font-medium text-gray-700">{bargainState.negotiationProgress}%</span>
                </div>
                <Progress value={bargainState.negotiationProgress} className="h-2" />
              </div>
            )}
          </div>
        );

      case "counter_offer":
        const savings = flight.price.amount - (bargainState.currentCounterOffer || 0);
        return (
          <>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-[#003580] mb-2">
                AI Counter Offer!
              </h3>
              <p className="text-gray-600 mb-1 text-lg">
                The airline couldn't match your price, but here's their best offer!
              </p>
            </div>

            <div className="bg-white border-2 border-[#003580]/20 rounded-xl p-8 shadow-lg">
              <div className="text-4xl font-bold text-[#003580] mb-2">
                {formatPrice(bargainState.currentCounterOffer || 0)}
              </div>
              <div className="text-center">
                <span className="text-sm font-semibold text-[#003580] bg-[#003580]/10 px-4 py-2 rounded-full">
                  You save {formatPrice(savings)}!
                </span>
              </div>
            </div>

            <div className="bg-white border-2 border-[#febb02] rounded-xl p-4 shadow-lg">
              <div className="flex items-center justify-center space-x-3">
                <Clock className="w-5 h-5 text-[#febb02]" />
                <span className="font-bold text-[#003580] text-xl">
                  Offer expires in: {bargainState.timeRemaining}s
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <Button
                onClick={handleAcceptCounterOffer}
                disabled={bargainState.timeRemaining === 0}
                className="w-full bg-gradient-to-r from-[#003580] to-[#0071c2] hover:from-[#002d6b] hover:to-[#005a9f] active:from-[#002447] active:to-[#004687] text-white py-5 text-xl font-bold rounded-xl shadow-lg active:shadow-md transition-all touch-manipulation min-h-[52px]"
              >
                Accept Offer - {formatPrice(bargainState.currentCounterOffer || 0)}
              </Button>

              <Button
                onClick={() =>
                  setBargainState((prev) => ({ ...prev, phase: "initial" }))
                }
                variant="outline"
                className="w-full border-2 border-[#003580] text-[#003580] hover:bg-[#003580] hover:text-white py-4 text-lg font-semibold rounded-xl"
              >
                Try Different Price
              </Button>
            </div>
          </>
        );

      case "accepted":
        const finalPrice =
          bargainState.currentCounterOffer ||
          bargainState.userOffers[bargainState.userOffers.length - 1] ||
          0;
        return (
          <div className="text-center space-y-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <h3 className="text-2xl font-bold text-[#003580]">
                  Perfect Match!
                </h3>
                <div className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                  Negotiated in 8.2s
                </div>
              </div>
              <p className="text-gray-600 mb-1 text-lg">
                {bargainState.currentCounterOffer
                  ? "You accepted the airline's counter offer!"
                  : "The airline accepted your exact price!"}
              </p>
            </div>

            <div className="bg-white border-2 border-[#003580]/20 rounded-xl p-8 shadow-lg">
              <div className="text-4xl font-bold text-[#003580] mb-2">
                {formatPrice(finalPrice)}
              </div>
            </div>

            <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4 shadow-lg">
              <div className="flex items-center justify-center space-x-2">
                <Clock className="w-5 h-5 text-orange-600" />
                <span className="font-bold text-orange-600 text-lg">
                  Offer expires in: {bargainState.timeRemaining}s
                </span>
              </div>
            </div>

            <Button
              onClick={handleBookDeal}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-5 text-lg font-bold rounded-xl shadow-lg transition-all touch-manipulation min-h-[52px]"
            >
              Accept {formatPrice(finalPrice)} — 30s to book
            </Button>

            <Button
              onClick={() =>
                setBargainState({
                  phase: "initial",
                  userOffers: [],
                  timeRemaining: 30,
                  isTimerActive: false,
                  negotiationProgress: 0,
                })
              }
              variant="outline"
              className="w-full border-2 border-[#003580] text-[#003580] hover:bg-[#003580] hover:text-white py-4 text-lg font-semibold rounded-xl"
            >
              Try Different Price
            </Button>
          </div>
        );

      case "rejected":
        return (
          <div className="text-center space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Offer Not Accepted
              </h3>
              <p className="text-gray-600 text-sm">
                {bargainState.timeRemaining === 0
                  ? "Time expired! The offer is no longer available."
                  : "Your offer was too low. Try a higher amount."}
              </p>
            </div>

            {bargainState.timeRemaining === 0 && (
              <div className="bg-white border-2 border-[#003580]/20 rounded-xl p-4 shadow-lg">
                <p className="text-[#003580] font-medium">Offer has expired</p>
              </div>
            )}

            <div className="space-y-4">
              <Button
                onClick={() =>
                  setBargainState({
                    phase: "initial",
                    userOffers: [],
                    timeRemaining: 30,
                    isTimerActive: false,
                    negotiationProgress: 0,
                  })
                }
                className="w-full bg-gradient-to-r from-[#003580] to-[#0071c2] hover:from-[#002d6b] hover:to-[#005a9f] text-white py-4 text-lg font-semibold rounded-xl"
              >
                Start New Negotiation
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full h-full max-w-none m-0 rounded-none md:max-w-2xl md:h-auto md:rounded-lg bg-gradient-to-br from-blue-50 to-white overflow-y-auto">
        <DialogHeader className="border-b border-[#003580]/20 pb-4 bg-gradient-to-r from-[#003580] to-[#0071c2] text-white rounded-t-lg -m-6 mb-0 p-6">
          <DialogTitle className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">AI</span>
            </div>
            <span className="text-xl font-semibold">AI Price Negotiator</span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 md:space-y-6 p-3 md:p-6">
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
