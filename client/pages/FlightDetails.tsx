import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  Plane,
  ArrowLeft,
  Users,
  Wifi,
  CoffeeIcon as Coffee,
  Zap,
  CheckCircle,
  MapPin,
  Calendar,
  Info,
  TrendingDown,
  CreditCard,
  X,
  Share2,
  Heart,
  Luggage,
  ShoppingBag,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { flightsService, Flight } from "@/services/flightsService";
import { useCurrency } from "@/contexts/CurrencyContext";
import { FlightBargainModal } from "@/components/FlightBargainModal";

import { useScrollToTop } from "@/hooks/useScrollToTop";

// Airline Logo Mapping - Professional Logos
const airlineLogos = {
  Emirates:
    "https://cdn.builder.io/api/v1/image/assets%2F4235b10530ff469795aa00c0333d773c%2F3bd351e27a7d4538ad90ba788b3dc40c?format=webp&width=800",
  "Air India":
    "https://cdn.builder.io/api/v1/image/assets%2F4235b10530ff469795aa00c0333d773c%2F038ea94811c34637a2fa8500bcc79624?format=webp&width=800",
  Indigo:
    "https://cdn.builder.io/api/v1/image/assets%2F4235b10530ff469795aa00c0333d773c%2F840806a2a1814c7494eef5c3d8626229?format=webp&width=800",
  IndiGo:
    "https://cdn.builder.io/api/v1/image/assets%2F4235b10530ff469795aa00c0333d773c%2F840806a2a1814c7494eef5c3d8626229?format=webp&width=800",
};

interface FlightDetailsProps {
  flightId?: string;
  flight?: Flight;
  onBook?: (flight: Flight) => void;
  onBargain?: (flight: Flight) => void;
}

export default function FlightDetails({
  flightId,
  flight: providedFlight,
  onBook,
  onBargain,
}: FlightDetailsProps) {
  useScrollToTop();
  const params = useParams();
  const navigate = useNavigate();
  const { selectedCurrency } = useCurrency();
  // Immediately use fallback data to prevent loading delays
  const fallbackFlight = {
    id: "fallback",
    flightNumber: "6E 1407",
    airline: "IndiGo",
    airlineCode: "6E",
    departure: {
      code: "BOM",
      city: "Mumbai",
      name: "Chhatrapati Shivaji Maharaj International Airport",
      terminal: "2",
    },
    arrival: {
      code: "DXB",
      city: "Dubai",
      name: "Dubai International Airport",
      terminal: "2",
    },
    departureTime: "14:30",
    arrivalTime: "16:00",
    duration: "3h 30m",
    stops: 0,
    aircraft: "Airbus A320",
    fareClass: "Economy",
    price: {
      amount: 22650,
      breakdown: {
        baseFare: 18120,
        taxes: 3030,
        fees: 1500,
        total: 22650,
      },
    },
  };

  const [flight, setFlight] = useState<Flight | null>(
    providedFlight || fallbackFlight,
  );
  const [isLoading, setIsLoading] = useState(false); // Start with false for immediate render
  const [error, setError] = useState<string | null>(null);
  const [showBargainModal, setShowBargainModal] = useState(false);
  const [expandedRules, setExpandedRules] = useState<Record<string, boolean>>(
    {},
  );

  const finalFlightId = flightId || params.flightId;

  useEffect(() => {
    // Only load if we have a specific flight ID and no provided flight
    if (!providedFlight && finalFlightId && finalFlightId !== "fallback") {
      loadFlightDetails();
    }
  }, [finalFlightId, providedFlight]);

  const loadFlightDetails = async () => {
    if (!finalFlightId) return;

    try {
      setIsLoading(true);
      setError(null);
      const flightDetails =
        await flightsService.getFlightDetails(finalFlightId);
      setFlight(flightDetails);
    } catch (err) {
      console.error("Failed to load flight details:", err);
      // Keep fallback data instead of showing error
      console.log("Using fallback flight data");
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (time: string) => {
    return new Date(`2024-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatPrice = (amount: number) => {
    return `${selectedCurrency.symbol}${amount.toLocaleString("en-IN")}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Plane className="w-8 h-8 mx-auto text-blue-600 animate-bounce" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Loading Flight Details
            </h3>
            <p className="text-gray-600">
              Please wait while we fetch the details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Flight should always be available now due to immediate fallback
  const displayFlight = flight;

  // We now always have flight data, so no need for error state
  if (!displayFlight) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Plane className="w-8 h-8 mx-auto text-blue-600 animate-bounce" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Loading Flight Details
            </h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Native Header */}
      <div className="bg-[#003580] text-white">
        <div className="flex items-center justify-between px-4 py-3 min-h-[56px]">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              className="text-white hover:bg-white/10 active:bg-white/20 p-3 min-w-[44px] min-h-[44px] rounded-full transition-colors"
              onClick={() => navigate("/flights")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">Your flight to Dubai</h1>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              className="text-white hover:bg-white/10 active:bg-white/20 p-3 min-w-[44px] min-h-[44px] rounded-full transition-colors"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: "Flight Details",
                    text: `${displayFlight.airline} flight from ${displayFlight.departure.city} to ${displayFlight.arrival.city}`,
                    url: window.location.href,
                  });
                }
              }}
            >
              <Share2 className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              className="text-white hover:bg-white/10 active:bg-white/20 p-3 min-w-[44px] min-h-[44px] rounded-full transition-colors"
            >
              <Heart className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 min-h-screen pb-32">
        <div className="max-w-md mx-auto bg-white">
          {/* Flight to Dubai */}
          <div className="p-3">
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              Flight to Dubai
            </h2>
            <p className="text-gray-600 text-sm mb-3">Direct • 3h • Economy</p>

            {/* Outbound Flight Timeline */}
            <div className="relative mb-4">
              {/* Departure */}
              <div className="flex items-start space-x-4 mb-3">
                <div className="w-3 h-3 border-2 border-gray-900 rounded-full bg-white mt-2"></div>
                <div className="flex-1">
                  <div className="text-lg font-semibold text-gray-900 mb-1">
                    Sat, Sep 6 • {displayFlight.departureTime}
                  </div>
                  <div className="font-bold text-gray-900 text-lg mb-1">
                    {displayFlight.departure.code} •{" "}
                    {displayFlight.departure.name}
                  </div>

                  {/* Airline Info */}
                  <div className="flex items-center space-x-3 mt-2 mb-2">
                    <img
                      src={
                        airlineLogos[displayFlight.airline] ||
                        `https://pics.avs.io/120/120/${displayFlight.airlineCode}.png`
                      }
                      alt={displayFlight.airline}
                      className="w-8 h-8 object-contain"
                    />
                    <div>
                      <div className="font-medium text-gray-900">
                        {displayFlight.airline}
                      </div>
                      <div className="text-sm text-gray-600">
                        Flight {displayFlight.flightNumber}
                      </div>
                      <div className="text-sm text-gray-600">
                        Flight time {displayFlight.duration}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Connecting Line */}
              <div className="absolute left-[5px] top-8 w-0.5 bg-gray-300 h-16"></div>

              {/* Arrival */}
              <div className="flex items-start space-x-4 mb-8">
                <div className="w-3 h-3 border-2 border-gray-900 rounded-full bg-white mt-2"></div>
                <div className="flex-1">
                  <div className="text-lg font-semibold text-gray-900 mb-1">
                    Sat, Sep 6 • {displayFlight.arrivalTime}
                  </div>
                  <div className="font-bold text-gray-900 text-lg">
                    {displayFlight.arrival.code} • {displayFlight.arrival.name}
                  </div>
                </div>
              </div>
            </div>

            {/* Flight to Mumbai */}
            <h2 className="text-lg font-bold text-gray-900 mb-1 mt-4">
              Flight to Mumbai
            </h2>
            <p className="text-gray-600 text-sm mb-3">
              Direct • 3h 15m • Economy
            </p>

            {/* Return Flight Timeline */}
            <div className="relative mb-4">
              {/* Departure */}
              <div className="flex items-start space-x-4 mb-6">
                <div className="w-3 h-3 border-2 border-gray-900 rounded-full bg-white mt-2"></div>
                <div className="flex-1">
                  <div className="text-lg font-semibold text-gray-900 mb-1">
                    Sat, Sep 13 • 20:50
                  </div>
                  <div className="font-bold text-gray-900 text-lg mb-1">
                    {displayFlight.arrival.code} • {displayFlight.arrival.name}
                  </div>

                  {/* Airline Info */}
                  <div className="flex items-center space-x-3 mt-4 mb-4">
                    <img
                      src={
                        airlineLogos[displayFlight.airline] ||
                        `https://pics.avs.io/120/120/${displayFlight.airlineCode}.png`
                      }
                      alt={displayFlight.airline}
                      className="w-8 h-8 object-contain"
                    />
                    <div>
                      <div className="font-medium text-gray-900">
                        {displayFlight.airline}
                      </div>
                      <div className="text-sm text-gray-600">Flight 6E1456</div>
                      <div className="text-sm text-gray-600">
                        Flight time 3h 15m
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Connecting Line */}
              <div className="absolute left-[5px] top-8 w-0.5 bg-gray-300 h-16"></div>

              {/* Arrival */}
              <div className="flex items-start space-x-4 mb-8">
                <div className="w-3 h-3 border-2 border-gray-900 rounded-full bg-white mt-2"></div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-lg font-semibold text-gray-900">
                      Sun, Sep 14 • 01:35
                    </span>
                    <div className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded">
                      <Info className="w-3 h-3 text-gray-600" />
                      <span className="text-xs text-gray-600">
                        Arrive on a different day
                      </span>
                    </div>
                  </div>
                  <div className="font-bold text-gray-900 text-lg">
                    {displayFlight.departure.code} •{" "}
                    {displayFlight.departure.name}
                  </div>
                </div>
              </div>
            </div>

            {/* Included Baggage */}
            <div className="border-t pt-3 mt-3">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Included baggage
              </h3>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-gray-50 rounded-lg p-2">
                  <ShoppingBag className="w-4 h-4 text-gray-700 mx-auto mb-1" />
                  <div className="text-xs font-medium text-gray-900">
                    Personal item
                  </div>
                  <div className="text-xs text-green-600">Included</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <Luggage className="w-4 h-4 text-gray-700 mx-auto mb-1" />
                  <div className="text-xs font-medium text-gray-900">
                    Carry-on 7kg
                  </div>
                  <div className="text-xs text-green-600">Included</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <Luggage className="w-4 h-4 text-gray-700 mx-auto mb-1" />
                  <div className="text-xs font-medium text-gray-900">
                    Checked 15kg
                  </div>
                  <div className="text-xs text-green-600">Included</div>
                </div>
              </div>
            </div>

            {/* Ticket Fare Rules - Cleartrip Style */}
            <div className="border-t pt-3 mt-3">
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Ticket fare rules
              </h3>

              {/* Standard Fare Summary - Plain Design */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 mb-3">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Standard fare (Price per traveler)
                </h4>

                <div className="space-y-2">
                  {/* Airline Fee */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Airline fee</span>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        ₹{" "}
                        {displayFlight.price.breakdown.baseFare.toLocaleString(
                          "en-IN",
                        )}
                      </div>
                      <div className="text-xs text-gray-500">Base fare</div>
                    </div>
                  </div>

                  {/* Taxes */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Taxes</span>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        ₹{" "}
                        {displayFlight.price.breakdown.taxes.toLocaleString(
                          "en-IN",
                        )}
                      </div>
                      <div className="text-xs text-gray-500">Govt. taxes</div>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <span className="text-sm font-semibold text-gray-900">
                      Total
                    </span>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        ₹{" "}
                        {displayFlight.price.breakdown.total.toLocaleString(
                          "en-IN",
                        )}
                      </div>
                      <div className="text-xs text-gray-500">All inclusive</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Price Footer with Book Now and Bargain Now */}
          <div className="border-t bg-white p-4 pb-6 fixed bottom-0 left-0 right-0 z-40 safe-area-inset-bottom">
            <div className="max-w-md mx-auto">
              {/* Price Display */}
              <div className="flex items-center justify-center space-x-2 mb-3">
                <span className="text-2xl font-bold text-gray-900">
                  ₹ {displayFlight.price.amount.toLocaleString("en-IN")}
                </span>
                <div className="relative group">
                  <Info className="w-4 h-4 text-gray-500 cursor-help" />
                  {/* Price Breakdown Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="bg-white text-gray-800 text-sm rounded-xl p-4 shadow-xl border border-gray-100 min-w-[220px] backdrop-blur-sm">
                      <div className="text-center font-semibold mb-3 text-gray-900 border-b border-gray-100 pb-2">
                        Fare Breakdown
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Base fare:</span>
                          <span className="font-medium text-gray-900">
                            ₹{" "}
                            {displayFlight.price.breakdown.baseFare.toLocaleString(
                              "en-IN",
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Taxes & fees:</span>
                          <span className="font-medium text-gray-900">
                            ₹{" "}
                            {(
                              displayFlight.price.breakdown.taxes +
                              displayFlight.price.breakdown.fees
                            ).toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div className="border-t border-gray-200 pt-2">
                          <div className="flex justify-between items-center font-semibold">
                            <span className="text-gray-900">Total:</span>
                            <span className="text-blue-600">
                              ₹{" "}
                              {displayFlight.price.breakdown.total.toLocaleString(
                                "en-IN",
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 text-center mt-3">
                        All taxes and fees included
                      </p>
                      {/* Tooltip arrow pointing downward */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                    </div>
                  </div>
                </div>
                <span className="text-sm text-gray-600">per person</span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  className="min-h-[52px] px-6 py-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm flex items-center justify-center gap-2 rounded-xl shadow-lg active:shadow-md transition-all touch-manipulation"
                  onClick={() => {
                    if (onBook) {
                      onBook(displayFlight);
                    } else {
                      // Navigate to booking flow with flight data
                      navigate("/booking-flow", {
                        state: {
                          selectedFlight: displayFlight,
                          selectedFareType: {
                            id: "default",
                            name: displayFlight.fareClass || "Economy",
                            price: displayFlight.price.amount,
                            refundability: "Non-Refundable",
                          },
                          negotiatedPrice: displayFlight.price.amount,
                          passengers: { adults: 1, children: 0 },
                        },
                      });
                    }
                  }}
                >
                  <CreditCard className="w-4 h-4" />
                  Book Now
                </Button>

                <Button
                  className="min-h-[52px] px-6 py-4 bg-[#febb02] hover:bg-[#e6a602] active:bg-[#d4950b] text-black font-semibold text-sm flex items-center justify-center gap-2 rounded-xl shadow-lg active:shadow-md transition-all touch-manipulation"
                  onClick={() => {
                    if (onBargain) {
                      onBargain(displayFlight);
                    } else {
                      setShowBargainModal(true);
                    }
                  }}
                >
                  <TrendingDown className="w-4 h-4" />
                  Bargain Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Flight Bargain Modal */}
      <FlightBargainModal
        flight={displayFlight}
        isOpen={showBargainModal}
        onClose={() => setShowBargainModal(false)}
        onBookingSuccess={(finalPrice) => {
          console.log("Bargain booking success with price:", finalPrice);
          setShowBargainModal(false);
        }}
      />
    </div>
  );
}
