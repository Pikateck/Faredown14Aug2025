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

    // Check if price was already used
    if (usedPrices.has(priceKey)) {
      setDuplicatePriceError(true);
      return;
    }

    // Check if price is too high
    if (proposedPrice >= flight.price.amount) {
      setDuplicatePriceError(true);
      return;
    }

    // Add to used prices
    setUsedPrices((prev) => new Set([...prev, priceKey]));

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
          <div className="text-center space-y-6 py-8">
            <div className="relative">
              <div className="w-24 h-24 mx-auto bg-gradient-to-r from-[#003580] to-[#0071c2] rounded-full flex items-center justify-center animate-pulse shadow-lg">
                <RefreshCw className="w-12 h-12 text-white animate-spin" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                AI Negotiating with {flight.airline}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Analyzing market rates and finding the best deal for you...
              </p>
              <Progress
                value={bargainState.negotiationProgress}
                className="w-full h-4 bg-gray-200"
              />
              <p className="text-sm text-[#003580] font-semibold mt-2">
                {bargainState.negotiationProgress}% Complete
              </p>
            </div>
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
              <h3 className="text-2xl font-bold text-[#003580] mb-2">
                Perfect Match!
              </h3>
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

            <div className="bg-white border-2 border-[#febb02] rounded-xl p-4 shadow-lg">
              <div className="flex items-center justify-center space-x-3">
                <Clock className="w-5 h-5 text-[#febb02]" />
                <span className="font-bold text-[#003580] text-xl">
                  Offer expires in: {bargainState.timeRemaining}s
                </span>
              </div>
            </div>

            <Button
              onClick={handleBookDeal}
              className="w-full bg-gradient-to-r from-[#003580] to-[#0071c2] hover:from-[#002d6b] hover:to-[#005a9f] active:from-[#002447] active:to-[#004687] text-white py-5 text-xl font-bold rounded-xl shadow-lg active:shadow-md transition-all touch-manipulation min-h-[52px]"
            >
              Book This Deal - {formatPrice(finalPrice)}
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
