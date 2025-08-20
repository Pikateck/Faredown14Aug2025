import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { scrollToTop } from "@/lib/utils";
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
  MapPin,
  Calendar,
  Users,
  Bed,
  Clock,
  Shield,
  CheckCircle,
  AlertCircle,
  Camera,
} from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import {
  calculateTotalPrice,
  formatLocalPrice,
  PriceCalculation,
} from "@/lib/pricing";
import { numberToWords, formatPriceInWords } from "@/lib/numberToWords";

interface RoomType {
  id: string;
  name: string;
  description: string;
  image: string;
  marketPrice: number;
  totalPrice: number;
  features: string[];
  maxOccupancy: number;
  bedType: string;
  size: string;
  cancellation: string;
}

interface Hotel {
  id: number;
  name: string;
  location: string;
  checkIn: string;
  checkOut: string;
}

interface BargainState {
  phase: "initial" | "negotiating" | "counter_offer" | "accepted" | "rejected";
  userOffers: number[];
  currentCounterOffer?: number;
  timeRemaining: number;
  isTimerActive: boolean;
  negotiationProgress: number;
  sessionId?: string;
  aiMessage?: string;
}

interface FlightStyleBargainModalProps {
  roomType: RoomType | null;
  hotel: Hotel | null;
  isOpen: boolean;
  onClose: () => void;
  checkInDate: Date;
  checkOutDate: Date;
  roomsCount: number;
  onBookingSuccess?: (finalPrice: number) => void;
  type?: "hotel" | "sightseeing" | "transfer";
}

// Helper function to get currency word form
const getCurrencyWordForm = (currencyCode: string): string => {
  switch (currencyCode) {
    case "INR":
      return "rupees";
    case "USD":
      return "dollars";
    case "EUR":
      return "euros";
    case "GBP":
      return "pounds";
    case "CAD":
      return "canadian dollars";
    case "AUD":
      return "australian dollars";
    default:
      return "units";
  }
};

// Format number with commas
const formatNumberWithCommas = (num: string | number): string => {
  const numStr = typeof num === "string" ? num : num.toString();
  return parseInt(numStr).toLocaleString("en-IN");
};

export function FlightStyleBargainModal({
  roomType,
  hotel,
  isOpen,
  onClose,
  checkInDate,
  checkOutDate,
  roomsCount,
  onBookingSuccess,
  type = "hotel",
}: FlightStyleBargainModalProps) {
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

  const [priceCalculation, setPriceCalculation] =
    useState<PriceCalculation | null>(null);

  // Calculate pricing when modal opens or currency changes
  useEffect(() => {
    if (roomType && checkInDate && checkOutDate) {
      if (type === "sightseeing") {
        // For sightseeing, totalPrice already includes all taxes and fees
        const calculation: PriceCalculation = {
          perNightPrice: roomType.totalPrice,
          totalNights: 1,
          roomsCount: 1,
          subtotal: roomType.totalPrice / 1.18, // Remove tax to show breakdown
          taxes: roomType.totalPrice - roomType.totalPrice / 1.18,
          fees: 0,
          total: roomType.totalPrice, // Use the already calculated total
        };
        setPriceCalculation(calculation);
      } else if (type === "transfer") {
        // For transfers, use simple pricing structure
        const totalPrice = roomType.totalPrice || roomType.marketPrice || 1200;
        const calculation: PriceCalculation = {
          perNightPrice: totalPrice,
          totalNights: 1,
          roomsCount: 1,
          subtotal: totalPrice / 1.18, // Remove tax to show breakdown
          taxes: totalPrice - totalPrice / 1.18,
          fees: 0,
          total: totalPrice,
        };
        setPriceCalculation(calculation);
      } else {
        // For hotels, use the existing calculation
        const nights = Math.max(
          1,
          Math.ceil(
            (checkOutDate.getTime() - checkInDate.getTime()) /
              (1000 * 60 * 60 * 24),
          ),
        );
        const basePricePerNight =
          roomType.totalPrice || roomType.marketPrice || 129;
        const rooms = roomsCount || 1;
        const breakdown = calculateTotalPrice(basePricePerNight, nights, rooms);

        const calculation: PriceCalculation = {
          perNightPrice: basePricePerNight,
          totalNights: nights,
          roomsCount: rooms,
          subtotal: breakdown.basePrice,
          taxes: breakdown.taxes,
          fees: breakdown.fees,
          total: breakdown.total,
        };
        setPriceCalculation(calculation);
      }
    }
  }, [roomType, checkInDate, checkOutDate, roomsCount, selectedCurrency, type]);

  // Timer effect
  useEffect(() => {
    if (bargainState.isTimerActive && bargainState.timeRemaining > 0) {
      console.log("⏰ Timer tick:", bargainState.timeRemaining);
      const timer = setTimeout(() => {
        setBargainState((prev) => ({
          ...prev,
          timeRemaining: prev.timeRemaining - 1,
        }));
      }, 1000);
      return () => clearTimeout(timer);
    } else if (bargainState.isTimerActive && bargainState.timeRemaining === 0) {
      console.log("⏰ Timer expired");
      if (bargainState.phase === "counter_offer") {
        setBargainState((prev) => ({
          ...prev,
          phase: "rejected",
          isTimerActive: false,
        }));
      } else if (bargainState.phase === "accepted") {
        // In accepted phase, timer expiry just stops the timer but stays in accepted phase
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
      });
      setBargainPrice("");
      setUsedPrices(new Set());
    }
  }, [isOpen]);

  const startBargaining = async () => {
    if (!bargainPrice || !priceCalculation) return;

    const proposedPrice = parseInt(bargainPrice);
    const priceKey = `${priceCalculation.total}-${proposedPrice}`;

    // Allow same price to be entered multiple times for different AI responses
    // Remove duplicate price restriction as requested by user

    setBargainState((prev) => ({
      ...prev,
      phase: "negotiating",
      userOffers: [...prev.userOffers, proposedPrice],
      negotiationProgress: 0,
    }));

    // If this is a transfer, use the new transfers bargain API
    if (type === "transfer") {
      await handleTransfersBargain(proposedPrice);
      return;
    }

    // Simulate negotiation with progress animation for hotels/sightseeing
    const progressInterval = setInterval(() => {
      setBargainState((prev) => {
        const newProgress = prev.negotiationProgress + 10;
        if (newProgress >= 100) {
          clearInterval(progressInterval);
          return { ...prev, negotiationProgress: 100 };
        }
        return { ...prev, negotiationProgress: newProgress };
      });
    }, 300); // 300ms * 10 = 3000ms total

    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Negotiation logic for hotels/sightseeing
    const originalTotalPrice = priceCalculation.total;
    const minAcceptablePrice = originalTotalPrice * 0.65;
    const goodPrice = originalTotalPrice * 0.95;

    // Force counter offer for testing - 80% chance of counter offer
    const shouldCounter = Math.random() > 0.2;

    if (proposedPrice >= goodPrice && !shouldCounter) {
      setBargainState((prev) => ({
        ...prev,
        phase: "accepted",
        isTimerActive: false,
      }));
    } else if (proposedPrice >= minAcceptablePrice) {
      const counterOffer = Math.round(
        originalTotalPrice * (0.8 + Math.random() * 0.1),
      );
      console.log("🕒 TIMER STARTING - Counter offer phase triggered", {
        proposedPrice,
        originalTotalPrice,
        counterOffer,
        timeRemaining: 30,
        isTimerActive: true,
      });
      setBargainState((prev) => {
        const newState = {
          ...prev,
          phase: "counter_offer",
          currentCounterOffer: counterOffer,
          timeRemaining: 30,
          isTimerActive: true,
        };
        console.log("🔄 NEW BARGAIN STATE:", newState);
        return newState;
      });
    } else {
      setBargainState((prev) => ({
        ...prev,
        phase: "rejected",
        isTimerActive: false,
      }));
    }

    setBargainPrice("");
  };

  // Handle transfers bargain using intelligent fallback
  const handleTransfersBargain = async (proposedPrice: number) => {
    console.log("🚀 Starting transfers bargain process", {
      proposedPrice,
      type,
    });

    // Progress animation first
    const progressInterval = setInterval(() => {
      setBargainState((prev) => {
        const newProgress = prev.negotiationProgress + 10;
        if (newProgress >= 100) {
          clearInterval(progressInterval);
          return { ...prev, negotiationProgress: 100 };
        }
        return { ...prev, negotiationProgress: newProgress };
      });
    }, 200);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Try API first, but have intelligent fallback
    try {
      // Only try API if we're in development mode
      const isDevelopment = window.location.hostname === "localhost";

      if (isDevelopment) {
        console.log("🔧 Development mode: Attempting API call");

        // Start bargain session if first offer
        if (bargainState.userOffers.length === 0) {
          const startResponse = await fetch(
            "/api/transfers-bargain/session/start",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                transferData: {
                  id: roomType?.id,
                  vehicleType: roomType?.size,
                  vehicleClass:
                    roomType?.bedType?.split(" ")[0]?.toLowerCase() ||
                    "economy",
                  vehicleName: roomType?.name,
                  totalPrice: priceCalculation?.total,
                  maxPassengers: roomType?.maxOccupancy,
                  estimatedDuration: parseInt(
                    roomType?.bedType?.split(" ")[0] || "45",
                  ),
                  pricing: {
                    totalPrice: priceCalculation?.total,
                    basePrice: priceCalculation?.subtotal,
                  },
                },
                userProfile: { tier: "standard" },
                searchDetails: {
                  pickupLocation: hotel?.location?.split(" → ")[0],
                  dropoffLocation: hotel?.location?.split(" → ")[1],
                  pickupDate: checkInDate.toISOString().split("T")[0],
                },
              }),
            },
          );

          if (!startResponse.ok) throw new Error("API not available");
          const startData = await startResponse.json();

          // Store session ID for future offers
          setBargainState((prev) => ({
            ...prev,
            sessionId: startData.sessionId,
          }));
        }

        // Make offer to API
        const offerResponse = await fetch(
          "/api/transfers-bargain/session/offer",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId: bargainState.sessionId || "temp_session",
              userOffer: proposedPrice,
              message: `I'd like to pay ₹${proposedPrice} for this transfer.`,
            }),
          },
        );

        if (!offerResponse.ok) throw new Error("API offer failed");
        const offerData = await offerResponse.json();

        // Handle AI response
        if (offerData.aiResponse.decision === "accept") {
          setBargainState((prev) => ({
            ...prev,
            phase: "accepted",
            isTimerActive: false,
            sessionId: offerData.sessionId,
          }));
          setBargainPrice("");
          return;
        } else if (offerData.aiResponse.decision === "counter") {
          setBargainState((prev) => ({
            ...prev,
            phase: "counter_offer",
            currentCounterOffer: offerData.aiResponse.counterPrice,
            timeRemaining: 30,
            isTimerActive: true,
            sessionId: offerData.sessionId,
            aiMessage: offerData.aiResponse.message,
          }));
          setBargainPrice("");
          return;
        } else {
          // Even if API returns reject, convert to counter offer with suggested price
          const suggestedPrice =
            offerData.aiResponse.suggestedPrice ||
            Math.round(originalTotalPrice * 0.85);
          setBargainState((prev) => ({
            ...prev,
            phase: "counter_offer",
            currentCounterOffer: suggestedPrice,
            timeRemaining: 30,
            isTimerActive: true,
            aiMessage:
              offerData.aiResponse.message ||
              "This is our best possible price considering all factors.",
          }));
          setBargainPrice("");
          return;
        }
      } else {
        throw new Error("Production mode - using intelligent fallback");
      }
    } catch (error) {
      console.log(
        "🔄 API unavailable, using intelligent transfer bargain logic",
        error.message,
      );

      // Intelligent fallback using transfer-specific pricing logic
      const originalTotalPrice = priceCalculation?.total || 0;

      // Transfer-specific pricing rules
      const costPrice = originalTotalPrice * 0.7; // Assume 70% cost
      const minProfitMargin = 0.08; // 8% minimum profit
      const minSellingPrice = costPrice * (1 + minProfitMargin);
      const maxDiscount = originalTotalPrice * 0.2; // Max 20% discount

      console.log("💰 Transfer pricing analysis", {
        originalPrice: originalTotalPrice,
        costPrice,
        minSellingPrice,
        userOffer: proposedPrice,
        maxDiscount,
      });

      // Decision logic based on transfer economics
      if (
        proposedPrice >= minSellingPrice &&
        proposedPrice >= originalTotalPrice * 0.85
      ) {
        // Accept if price is profitable and reasonable
        setBargainState((prev) => ({
          ...prev,
          phase: "accepted",
          isTimerActive: false,
          aiMessage:
            "Great! Your offer has been accepted. This ensures we can maintain our service quality.",
        }));
      } else if (proposedPrice >= minSellingPrice) {
        // Counter offer if price is profitable but low
        const counterOffer = Math.round(
          originalTotalPrice * (0.88 + Math.random() * 0.07),
        ); // 88-95% of original
        setBargainState((prev) => ({
          ...prev,
          phase: "counter_offer",
          currentCounterOffer: counterOffer,
          timeRemaining: 30,
          isTimerActive: true,
          aiMessage:
            "We appreciate your offer! Considering current fuel costs and driver compensation, this is our best price.",
        }));
      } else {
        // Instead of rejecting, provide a final counter offer at minimum selling price
        const finalCounterOffer = Math.round(minSellingPrice * 1.05); // 5% above minimum for sustainability
        setBargainState((prev) => ({
          ...prev,
          phase: "counter_offer",
          currentCounterOffer: finalCounterOffer,
          timeRemaining: 30,
          isTimerActive: true,
          aiMessage: `This is our absolute final price. It covers all costs and ensures quality service with fair driver compensation.`,
        }));
      }
    }

    setBargainPrice("");
  };

  const handleAcceptCounterOffer = async () => {
    const finalPrice = bargainState.currentCounterOffer || 0;

    // If this is a transfer and we have a session ID, try to accept via API
    if (type === "transfer" && bargainState.sessionId) {
      try {
        const isDevelopment = window.location.hostname === "localhost";

        if (isDevelopment) {
          const acceptResponse = await fetch(
            "/api/transfers-bargain/session/accept",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                sessionId: bargainState.sessionId,
              }),
            },
          );

          if (acceptResponse.ok) {
            const acceptData = await acceptResponse.json();
            console.log("✅ Transfer bargain accepted via API:", acceptData);
          } else {
            console.log(
              "⚠️ API accept failed, proceeding with local acceptance",
            );
          }
        } else {
          console.log("🌐 Production mode: Local bargain acceptance");
        }
      } catch (error) {
        console.log(
          "🔄 API unavailable for accept, using local handling:",
          error.message,
        );
      }
    }

    // Always proceed with booking regardless of API status
    console.log("✅ Accepting transfer bargain", {
      finalPrice,
      originalPrice: priceCalculation?.total,
      savings: (priceCalculation?.total || 0) - finalPrice,
    });

    // Close modal immediately to prevent double-click issues
    onClose();

    if (onBookingSuccess) {
      // Call the booking success callback with final price
      onBookingSuccess(finalPrice);
    } else {
      // For hotels: navigate to reservation page
      setBargainState((prev) => ({
        ...prev,
        phase: "accepted",
        isTimerActive: true,
        timeRemaining: 28, // Reset timer for booking urgency
      }));
    }
  };

  const handleBookOriginal = () => {
    if (!priceCalculation || !roomType || !hotel) return;

    // Navigate to reservation page with original pricing
    const searchParams = new URLSearchParams({
      hotelId: hotel?.id.toString() || "",
      roomId: roomType?.id || "",
      checkIn: checkInDate.toISOString().split("T")[0],
      checkOut: checkOutDate.toISOString().split("T")[0],
      rooms: roomsCount.toString(),
      totalPrice: priceCalculation.total.toString(), // Use original calculated total
      pricePerNight: roomType?.totalPrice.toString() || "", // Original per-night price
      currency: selectedCurrency.code,
      bargained: "false", // This is original pricing, not bargained
      hotelName: encodeURIComponent(hotel?.name || ""),
      location: encodeURIComponent(hotel?.location || ""),
    });
    navigate(`/reserve?${searchParams.toString()}`);

    // Call the booking success callback if provided
    if (onBookingSuccess) {
      onBookingSuccess(priceCalculation.total);
    }

    // Close the modal
    onClose();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  if (!roomType || !hotel || !priceCalculation) return null;

  const renderContent = () => {
    switch (bargainState.phase) {
      case "initial":
        return (
          <>
            {/* Venue Info - Exact flight layout */}
            <div className="bg-white rounded-xl p-3 md:p-6 border border-[#003580]/10 shadow-sm">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-[#003580]/10 rounded-lg flex items-center justify-center">
                    {type === "sightseeing" ? (
                      <Camera className="w-6 h-6 text-[#003580]" />
                    ) : type === "transfer" ? (
                      <Clock className="w-6 h-6 text-[#003580]" />
                    ) : (
                      <Bed className="w-6 h-6 text-[#003580]" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">
                      {hotel.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {type === "sightseeing"
                        ? `${roomType.size} • ${roomType.bedType}`
                        : type === "transfer"
                          ? `${roomType.maxOccupancy} passengers • ${roomType.bedType}`
                          : `${roomType.name} • ${hotel.name}`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl md:text-3xl font-bold text-[#003580] mb-1">
                    {formatLocalPrice(
                      priceCalculation.total,
                      selectedCurrency.code,
                    )}
                  </p>
                  <p className="text-xs text-gray-500">(All Inclusive Price)</p>
                </div>
              </div>
            </div>

            {/* AI Interface - Exact flight layout */}
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
                    Tell me your target price and I'll negotiate with the{" "}
                    {type === "sightseeing"
                      ? "venue"
                      : type === "transfer"
                        ? "transfer provider"
                        : "hotel"}
                    !
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm md:text-base font-semibold mb-3 text-gray-900 text-center">
                  What price would you like to pay? ({selectedCurrency.symbol})
                </label>

                <div className="relative">
                  <Input
                    type="text"
                    value={
                      bargainPrice ? formatNumberWithCommas(bargainPrice) : ""
                    }
                    onChange={(e) => {
                      const numericValue = e.target.value.replace(
                        /[^0-9]/g,
                        "",
                      );
                      // Allow empty input or validate that price doesn't exceed total price
                      const totalPrice = priceCalculation?.total || 0;
                      const enteredPrice = parseInt(numericValue) || 0;

                      if (numericValue === "" || enteredPrice <= totalPrice) {
                        setBargainPrice(numericValue);
                      }
                    }}
                    placeholder="Enter your target price"
                    className="text-lg md:text-xl font-bold text-center py-4 md:py-6 border-2 focus:border-[#003580] placeholder:text-gray-400 placeholder:font-normal rounded-xl bg-white shadow-sm transition-colors border-[#003580]/20"
                  />
                  <div className="absolute inset-y-0 left-3 md:left-4 flex items-center">
                    <span className="text-[#003580] text-lg md:text-xl font-semibold">
                      {selectedCurrency.symbol}
                    </span>
                  </div>
                </div>
                {bargainPrice && (
                  <p className="text-center text-sm text-gray-600 mt-2 font-medium">
                    {formatPriceInWords(parseInt(bargainPrice))}
                  </p>
                )}
                <p className="text-center text-xs text-gray-500 mt-2">
                  Enter between {selectedCurrency.symbol}1 and{" "}
                  {selectedCurrency.symbol}
                  {formatNumberWithCommas(
                    priceCalculation?.total.toString() || "0",
                  )}
                </p>
              </div>

              <Button
                onClick={startBargaining}
                disabled={
                  !bargainPrice ||
                  parseInt(bargainPrice) <= 0 ||
                  parseInt(bargainPrice) > (priceCalculation?.total || 0)
                }
                className="w-full bg-gradient-to-r from-[#003580] to-[#0071c2] hover:from-[#002d6b] hover:to-[#005a9f] text-white py-4 md:py-6 text-base md:text-lg font-semibold rounded-xl disabled:bg-gray-400 shadow-lg touch-manipulation"
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
                {type === "hotel" ? `${hotel?.name} • ${hotel?.location}` :
                 type === "sightseeing" ? `${roomType?.name} • ${hotel?.location}` :
                 type === "transfer" ? `${roomType?.name} Transfer` : "Service"}
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
                      We have {formatLocalPrice(parseInt(bargainPrice || "0"), selectedCurrency.code)} for {
                        type === "hotel" ? `${roomType?.name} at ${hotel?.name}` :
                        type === "sightseeing" ? `${roomType?.name}` :
                        type === "transfer" ? `${roomType?.name} transfer` : "this service"
                      }. Can you approve?
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Faredown AI</p>
                </div>
              </div>

              {/* Beat 2: Supplier - appears after 25% progress */}
              {bargainState.negotiationProgress > 25 && (
                <div className="flex items-start space-x-3 animate-in fade-in-50 slide-in-from-left-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    type === "hotel" ? "bg-green-50 text-green-600" :
                    type === "sightseeing" ? "bg-purple-50 text-purple-600" :
                    type === "transfer" ? "bg-orange-50 text-orange-600" : "bg-gray-50 text-gray-600"
                  }`}>
                    <span className="text-sm">
                      {type === "hotel" ? "🏨" : type === "sightseeing" ? "📍" : type === "transfer" ? "🚗" : "🏢"}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="bg-white border shadow-sm p-3 rounded-lg max-w-[280px]">
                      <p className="text-sm">
                        Listed at {formatLocalPrice(priceCalculation?.total || 0, selectedCurrency.code)}. Checking now…
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {type === "hotel" ? "Hotel Partner" :
                       type === "sightseeing" ? "Tour Provider" :
                       type === "transfer" ? "Transfer Service" : "Supplier"}
                    </p>
                  </div>
                </div>
              )}

              {/* Beat 3: Supplier Response - appears after 60% progress */}
              {bargainState.negotiationProgress > 60 && (
                <div className="flex items-start space-x-3 animate-in fade-in-50 slide-in-from-left-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    type === "hotel" ? "bg-green-50 text-green-600" :
                    type === "sightseeing" ? "bg-purple-50 text-purple-600" :
                    type === "transfer" ? "bg-orange-50 text-orange-600" : "bg-gray-50 text-gray-600"
                  }`}>
                    <span className="text-sm">
                      {type === "hotel" ? "🏨" : type === "sightseeing" ? "📍" : type === "transfer" ? "🚗" : "🏢"}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="bg-white border shadow-sm p-3 rounded-lg max-w-[280px]">
                      <p className="text-sm">
                        I can do {formatLocalPrice(
                          Math.round((priceCalculation?.total || 0) * (0.8 + Math.random() * 0.1)),
                          selectedCurrency.code
                        )}.
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {type === "hotel" ? "Hotel Partner" :
                       type === "sightseeing" ? "Tour Provider" :
                       type === "transfer" ? "Transfer Service" : "Supplier"}
                    </p>
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
        console.log("🎯 RENDERING COUNTER OFFER PHASE WITH TIMER", {
          timeRemaining: bargainState.timeRemaining,
          isTimerActive: bargainState.isTimerActive,
          currentCounterOffer: bargainState.currentCounterOffer,
        });
        const savings =
          priceCalculation.total - (bargainState.currentCounterOffer || 0);
        return (
          <>
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <h3 className="text-2xl font-bold text-[#003580]">
                  AI Counter Offer!
                </h3>
                <div className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                  Negotiated in 8.2s
                </div>
              </div>
              <p className="text-gray-600 mb-1 text-lg">
                The{" "}
                {type === "sightseeing"
                  ? "venue"
                  : type === "transfer"
                    ? "transfer provider"
                    : "hotel"}{" "}
                couldn't match your price, but here's their best offer!
              </p>
            </div>

            <div className="bg-white border-2 border-[#003580]/20 rounded-xl p-8 shadow-lg">
              <div className="text-4xl font-bold text-[#003580] mb-2">
                {selectedCurrency.symbol}
                {(bargainState.currentCounterOffer || 0).toLocaleString()}
              </div>
              <p className="text-sm text-[#003580] font-medium mb-3">
                {formatPriceInWords(bargainState.currentCounterOffer || 0)}
              </p>
              <div className="text-center">
                <span className="text-sm font-semibold text-[#003580] bg-[#003580]/10 px-4 py-2 rounded-full">
                  You save {selectedCurrency.symbol}
                  {savings.toLocaleString()}!
                </span>
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

            <div className="space-y-4">
              <Button
                onClick={handleAcceptCounterOffer}
                disabled={bargainState.timeRemaining === 0}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-5 text-lg font-bold rounded-xl shadow-lg"
              >
                Accept {selectedCurrency.symbol}{(bargainState.currentCounterOffer || 0).toLocaleString()} — 30s to book
              </Button>

              <Button
                onClick={() =>
                  setBargainState((prev) => ({ ...prev, phase: "initial" }))
                }
                variant="outline"
                className="w-full border-2 border-[#003580] text-[#003580] hover:bg-[#003580] hover:text-white py-4 text-lg font-semibold rounded-xl"
              >
                Bargain Again
              </Button>

              <p className="text-xs text-gray-500 text-center mt-3">
                Most customers get the best deal early — demand is rising fast.
              </p>
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
                The{" "}
                {type === "sightseeing"
                  ? "venue"
                  : type === "transfer"
                    ? "transfer provider"
                    : "hotel"}{" "}
                accepted your exact price!
              </p>
            </div>

            <div className="bg-white border-2 border-[#003580]/20 rounded-xl p-8 shadow-lg">
              <div className="text-4xl font-bold text-[#003580] mb-2">
                {selectedCurrency.symbol}
                {finalPrice.toLocaleString()}
              </div>
              <p className="text-sm text-[#003580] font-medium">
                {formatPriceInWords(finalPrice)}
              </p>
            </div>

            <div className="bg-white border-2 border-[#febb02] rounded-xl p-4 shadow-lg">
              <div className="flex items-center justify-center space-x-3">
                <span className="font-bold text-[#003580] text-xl">
                  Offer expires in: {bargainState.timeRemaining}s
                </span>
              </div>
            </div>

            <Button
              onClick={() => {
                // Close modal immediately to prevent double-click issues
                onClose();

                if (onBookingSuccess) {
                  onBookingSuccess(finalPrice);
                } else {
                  const searchParams = new URLSearchParams({
                    hotelId: hotel?.id.toString() || "",
                    roomId: roomType?.id || "",
                    checkIn: checkInDate.toISOString().split("T")[0],
                    checkOut: checkOutDate.toISOString().split("T")[0],
                    rooms: roomsCount.toString(),
                    totalPrice: finalPrice.toString(),
                    pricePerNight: roomType?.totalPrice.toString() || "",
                    currency: selectedCurrency.code,
                    bargained: "true",
                    hotelName: encodeURIComponent(hotel?.name || ""),
                    location: encodeURIComponent(hotel?.location || ""),
                  });
                  navigate(`/reserve?${searchParams.toString()}`);
                  scrollToTop();
                }
              }}
              className="w-full bg-gradient-to-r from-[#003580] to-[#0071c2] hover:from-[#002d6b] hover:to-[#005a9f] text-white py-5 text-xl font-bold rounded-xl shadow-lg"
            >
              Book This Deal - {selectedCurrency.symbol}
              {finalPrice.toLocaleString()}
            </Button>

            <Button
              onClick={() =>
                setBargainState({
                  phase: "initial",
                  userOffers: [],
                  timeRemaining: 30,
                  isTimerActive: false,
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
        // Convert rejection to final counter offer - no more "Offer Not Accepted"
        const emergencyPrice = Math.round((priceCalculation?.total || 0) * 0.8); // 20% discount as emergency offer
        return (
          <div className="text-center space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-[#003580] mb-2">
                Final Counter Offer!
              </h3>
              <p className="text-gray-600 text-sm">
                {bargainState.aiMessage ||
                  "Here's our absolute best price - this is the lowest we can go while maintaining quality service."}
              </p>
            </div>

            <div className="bg-white border-2 border-[#003580]/20 rounded-xl p-6 shadow-lg">
              <div className="text-3xl font-bold text-[#003580] mb-2">
                {selectedCurrency.symbol}
                {emergencyPrice.toLocaleString()}
              </div>
              <p className="text-sm text-[#003580] font-medium mb-3">
                {formatPriceInWords(emergencyPrice)}
              </p>
              <div className="text-center">
                <span className="text-sm font-semibold text-[#003580] bg-[#003580]/10 px-4 py-2 rounded-full">
                  You save {selectedCurrency.symbol}
                  {(
                    (priceCalculation?.total || 0) - emergencyPrice
                  ).toLocaleString()}
                  !
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <Button
                onClick={() => {
                  onClose();
                  if (onBookingSuccess) {
                    onBookingSuccess(emergencyPrice);
                  }
                }}
                className="w-full bg-gradient-to-r from-[#003580] to-[#0071c2] hover:from-[#002d6b] hover:to-[#005a9f] text-white py-5 text-xl font-bold rounded-xl shadow-lg"
              >
                Book This Final Deal - {selectedCurrency.symbol}
                {emergencyPrice.toLocaleString()}
              </Button>

              <Button
                onClick={() =>
                  setBargainState({
                    phase: "initial",
                    userOffers: [],
                    timeRemaining: 30,
                    isTimerActive: false,
                  })
                }
                variant="outline"
                className="w-full border-2 border-[#003580] text-[#003580] hover:bg-[#003580] hover:text-white py-4 text-lg font-semibold rounded-xl"
              >
                Try Different Price
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
