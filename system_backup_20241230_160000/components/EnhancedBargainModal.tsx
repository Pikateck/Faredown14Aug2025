import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { scrollToTop } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  TrendingDown,
  Clock,
  Target,
  AlertCircle,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import {
  calculateTotalPrice,
  formatPriceWithSymbol,
  PriceCalculation,
} from "@/lib/pricing";
import { formatPriceInWords, numberToWords } from "@/lib/numberToWords";

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
}

interface EnhancedBargainModalProps {
  roomType: RoomType | null;
  hotel: Hotel | null;
  isOpen: boolean;
  onClose: () => void;
  checkInDate: Date;
  checkOutDate: Date;
  roomsCount: number;
  onBookingSuccess?: (finalPrice: number) => void;
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

export function EnhancedBargainModal({
  roomType,
  hotel,
  isOpen,
  onClose,
  checkInDate,
  checkOutDate,
  roomsCount,
  onBookingSuccess,
}: EnhancedBargainModalProps) {
  const { selectedCurrency } = useCurrency();
  const navigate = useNavigate();
  const [bargainPrice, setBargainPrice] = useState("");
  const [bargainState, setBargainState] = useState<BargainState>({
    phase: "initial",
    userOffers: [],
    timeRemaining: 30,
    isTimerActive: false,
  });

  const [priceCalculation, setPriceCalculation] =
    useState<PriceCalculation | null>(null);

  // Calculate pricing when modal opens or currency changes
  useEffect(() => {
    if (roomType && checkInDate && checkOutDate) {
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
  }, [roomType, checkInDate, checkOutDate, roomsCount, selectedCurrency]);

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
      // Timer expired - automatically reject the offer
      setBargainState((prev) => ({
        ...prev,
        phase: "rejected",
        isTimerActive: false,
      }));
    }
  }, [bargainState.isTimerActive, bargainState.timeRemaining]);

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
    }
  }, [isOpen]);

  const handleSubmitOffer = async () => {
    if (!bargainPrice || !priceCalculation) return;

    const proposedPrice = parseFloat(bargainPrice);

    // Check if user is trying to submit the same price again
    if (bargainState.userOffers.includes(proposedPrice)) {
      alert(
        "You cannot submit the same price twice. Please try a different amount.",
      );
      return;
    }

    setBargainState((prev) => ({
      ...prev,
      phase: "negotiating",
      userOffers: [...prev.userOffers, proposedPrice],
    }));

    // Simulate negotiation delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Negotiation logic
    const originalTotalPrice = priceCalculation.total;
    const minAcceptablePrice = originalTotalPrice * 0.75; // 25% max discount
    const goodPrice = originalTotalPrice * 0.85; // 15% discount is good
    const discountPercentage =
      ((originalTotalPrice - proposedPrice) / originalTotalPrice) * 100;

    if (proposedPrice >= goodPrice) {
      // Accept the offer
      setBargainState((prev) => ({
        ...prev,
        phase: "accepted",
        isTimerActive: false,
      }));
    } else if (proposedPrice >= minAcceptablePrice) {
      // Make counter offer
      const counterOffer = Math.round(
        originalTotalPrice * (0.8 + Math.random() * 0.1),
      );
      setBargainState((prev) => ({
        ...prev,
        phase: "counter_offer",
        currentCounterOffer: counterOffer,
        timeRemaining: 30,
        isTimerActive: true,
      }));
    } else {
      // Reject the offer
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
      isTimerActive: false,
    }));
  };

  const handleRejectCounterOffer = () => {
    setBargainState((prev) => ({
      ...prev,
      phase: "initial",
      timeRemaining: 30,
      isTimerActive: false,
    }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!roomType || !hotel || !priceCalculation) return null;

  const renderContent = () => {
    switch (bargainState.phase) {
      case "initial":
        return (
          <div className="space-y-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-lg">{hotel.name}</h3>
              <div className="text-sm text-gray-600 mt-1">{hotel.location}</div>
              <div className="text-sm font-medium text-blue-600 mt-2">
                {roomType.name}
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Price per night:</span>
                  <span className="font-medium">
                    {formatPriceWithSymbol(
                      priceCalculation.perNightPrice,
                      selectedCurrency.code,
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Number of nights:</span>
                  <span className="font-medium">
                    {priceCalculation.totalNights}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Number of rooms:</span>
                  <span className="font-medium">
                    {priceCalculation.roomsCount}
                  </span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>
                      {formatPriceWithSymbol(
                        priceCalculation.subtotal,
                        selectedCurrency.code,
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Taxes & fees:</span>
                    <span>
                      {formatPriceWithSymbol(
                        priceCalculation.taxes + priceCalculation.fees,
                        selectedCurrency.code,
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                    <span>Total Price:</span>
                    <span className="text-[#003580]">
                      {formatPriceWithSymbol(
                        priceCalculation.total,
                        selectedCurrency.code,
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="bargain-price" className="text-sm font-medium">
                Your Bargain Price (Total)
              </Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                  {selectedCurrency.symbol}
                </span>
                <Input
                  id="bargain-price"
                  type="text"
                  placeholder="Enter the total price you want to pay for your stay"
                  value={
                    bargainPrice
                      ? parseInt(bargainPrice).toLocaleString("en-IN")
                      : ""
                  }
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    setBargainPrice(value);
                  }}
                  className="pl-8"
                />
              </div>
              {bargainPrice && parseInt(bargainPrice) > 0 && (
                <div className="text-xs text-blue-600 mt-1 font-medium">
                  {numberToWords(parseInt(bargainPrice))}{" "}
                  {getCurrencyWordForm(selectedCurrency.code)}
                </div>
              )}
            </div>

            {bargainState.userOffers.length > 0 && (
              <div className="bg-yellow-50 p-3 rounded-lg">
                <div className="text-sm font-medium text-yellow-800 mb-1">
                  Previous Offers:
                </div>
                <div className="text-sm text-yellow-700">
                  {bargainState.userOffers
                    .map(
                      (offer) =>
                        `${selectedCurrency.symbol}${offer.toLocaleString()}`,
                    )
                    .join(", ")}
                </div>
              </div>
            )}

            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2 flex items-center">
                <Target className="w-4 h-4 mr-2" />
                How Bargaining Works:
              </h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Submit your best final price offer (all-inclusive)</li>
                <li>• Price includes ALL taxes, service charges & fees</li>
                <li>• We'll negotiate instantly with the hotel</li>
                <li>• You cannot submit the same price twice</li>
                <li>• Counter-offers expire in 30 seconds</li>
                <li>• Save up to 25% off regular rates</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 touch-manipulation py-3"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitOffer}
                className="flex-1 bg-[#febb02] hover:bg-[#e6a602] active:bg-[#d19900] text-black touch-manipulation py-3"
                disabled={!bargainPrice}
              >
                Submit Offer
              </Button>
            </div>
          </div>
        );

      case "negotiating":
        return (
          <div className="space-y-4 text-center">
            <div className="flex flex-col items-center">
              <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mb-3" />
              <h3 className="font-semibold text-lg">
                Negotiating with Hotel...
              </h3>
              <p className="text-gray-600 text-sm">
                Please wait while we process your offer
              </p>
            </div>
          </div>
        );

      case "counter_offer":
        const savings =
          priceCalculation.total - (bargainState.currentCounterOffer || 0);
        return (
          <div className="space-y-4">
            <div className="text-center">
              <Target className="w-12 h-12 text-blue-500 mx-auto mb-3" />
              <h3 className="font-semibold text-lg text-blue-600">
                🎯 AI Counter Offer!
              </h3>
              <p className="text-gray-600 text-sm">
                The hotel system found your price, but here's their best offer!
              </p>
            </div>

            <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Clock className="w-5 h-5 text-orange-600 mr-2" />
                <span className="text-orange-600 font-medium">
                  ⚡ Offer expires in {formatTime(bargainState.timeRemaining)}
                </span>
              </div>
              <Progress
                value={(bargainState.timeRemaining / 30) * 100}
                className="h-2 mb-3"
              />
              <div className="text-center text-sm text-orange-700">
                This special price is only valid for a limited time!
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-sm text-gray-600 mb-1">Your Offer</div>
              <div className="text-lg text-gray-900 mb-3">
                {selectedCurrency.symbol}
                {(
                  bargainState.userOffers[bargainState.userOffers.length - 1] ||
                  0
                ).toLocaleString()}
              </div>

              <div className="text-sm font-medium text-blue-600 mb-2">
                AI Negotiated Price
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {selectedCurrency.symbol}
                {(bargainState.currentCounterOffer || 0).toLocaleString()}
              </div>
              <div className="text-sm text-green-600 font-medium">
                You save {selectedCurrency.symbol}
                {savings.toLocaleString()}!
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={handleRejectCounterOffer}
                className="flex-1"
                disabled={bargainState.timeRemaining === 0}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Different Price
              </Button>
              <Button
                onClick={handleAcceptCounterOffer}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                disabled={bargainState.timeRemaining === 0}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Book This Deal -{" "}
                {formatPriceWithSymbol(
                  bargainState.currentCounterOffer || 0,
                  selectedCurrency.code,
                )}
              </Button>
            </div>
          </div>
        );

      case "accepted":
        const finalPrice =
          bargainState.currentCounterOffer ||
          bargainState.userOffers[bargainState.userOffers.length - 1] ||
          0;
        const finalSavings = Math.max(0, priceCalculation.total - finalPrice);
        const savingsPercentage =
          priceCalculation.total > 0
            ? Math.round((finalSavings / priceCalculation.total) * 100)
            : 0;

        return (
          <div className="space-y-4 text-center">
            <div className="flex flex-col items-center">
              <CheckCircle className="w-16 h-16 text-green-500 mb-3" />
              <h3 className="font-semibold text-xl text-green-600">
                🎉 Congratulations!
              </h3>
              <p className="text-gray-600">Your bargain has been accepted!</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-2">
                Final Price:{" "}
                {finalPrice > 0
                  ? `${selectedCurrency.symbol}${finalPrice.toLocaleString()}`
                  : `${selectedCurrency.symbol}0`}
              </div>
              <div className="text-xs text-green-600 mb-2 font-medium">
                ✅ All-inclusive (taxes & charges included)
              </div>
              <div className="text-green-700">
                You saved{" "}
                {finalSavings > 0
                  ? `${selectedCurrency.symbol}${finalSavings.toLocaleString()}`
                  : `${selectedCurrency.symbol}0`}{" "}
                ({savingsPercentage}% off)
              </div>
            </div>

            <Button
              onClick={() => {
                // Use callback if provided, otherwise navigate directly
                if (onBookingSuccess) {
                  onBookingSuccess(finalPrice);
                } else {
                  // Fallback to direct navigation
                  onClose();
                  const searchParams = new URLSearchParams({
                    hotelId: hotel?.id.toString() || "",
                    roomId: roomType?.id || "",
                    checkIn: checkInDate.toISOString().split("T")[0],
                    checkOut: checkOutDate.toISOString().split("T")[0],
                    rooms: roomsCount.toString(),
                    price: finalPrice.toString(),
                    currency: selectedCurrency.code,
                    bargained: "true",
                  });
                  navigate(`/reserve?${searchParams.toString()}`);
                  scrollToTop();
                }
              }}
              className="w-full bg-green-500 hover:bg-green-600 text-white"
            >
              Proceed to Booking
            </Button>
          </div>
        );

      case "rejected":
        return (
          <div className="space-y-4 text-center">
            <div className="flex flex-col items-center">
              <AlertCircle className="w-16 h-16 text-red-500 mb-3" />
              <h3 className="font-semibold text-xl text-red-600">
                Offer Not Accepted
              </h3>
              <p className="text-gray-600">
                {bargainState.timeRemaining === 0
                  ? "Time expired! The offer is no longer available."
                  : "Your offer was too low. Try a higher amount."}
              </p>
            </div>

            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-sm text-red-700">
                Suggested minimum:{" "}
                {formatPriceWithSymbol(
                  Math.round(priceCalculation.total * 0.75),
                  selectedCurrency.code,
                )}
              </div>
            </div>

            <div className="flex space-x-3">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Close
              </Button>
              <Button
                onClick={() =>
                  setBargainState({
                    phase: "initial",
                    userOffers: bargainState.userOffers,
                    timeRemaining: 30,
                    isTimerActive: false,
                  })
                }
                className="flex-1 bg-[#febb02] hover:bg-[#e6a602] active:bg-[#d19900] text-black"
              >
                Try Again
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
      <DialogContent className="max-w-md mx-2 sm:mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <TrendingDown className="w-5 h-5 text-yellow-500" />
            <span>Bargain for {roomType.name}</span>
          </DialogTitle>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
