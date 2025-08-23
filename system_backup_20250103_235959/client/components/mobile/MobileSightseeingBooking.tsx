import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Users,
  Star,
  TrendingDown,
  CheckCircle,
  Minus,
  Plus,
  ArrowLeft,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/contexts/CurrencyContext";

interface MobileSightseeingBookingProps {
  attraction: {
    id: string;
    name: string;
    location: string;
    rating: number;
    reviews: number;
    images: string[];
    availableSlots: Array<{
      date: string;
      times: string[];
    }>;
    ticketTypes: Array<{
      name: string;
      price: number;
      features: string[];
      refundable: boolean;
      cancellationPolicy: string;
    }>;
  };
  onBargain: (ticketIndex: number) => void;
  onBookNow: (ticketIndex: number) => void;
  onBack?: () => void;
  initialTime?: string;
  initialTicketType?: number;
  initialPassengers?: {
    adults: number;
    children: number;
    infants: number;
  };
  onTimeChange?: (time: string) => void;
  onTicketTypeChange?: (index: number) => void;
  onPassengersChange?: (passengers: {
    adults: number;
    children: number;
    infants: number;
  }) => void;
}

export const MobileSightseeingBooking: React.FC<
  MobileSightseeingBookingProps
> = ({
  attraction,
  onBargain,
  onBookNow,
  onBack,
  initialTime = "",
  initialTicketType = 0,
  initialPassengers = { adults: 1, children: 0, infants: 0 },
  onTimeChange,
  onTicketTypeChange,
  onPassengersChange,
}) => {
  const { formatPrice } = useCurrency();

  // State management - use parent state if provided
  const [selectedTime, setSelectedTime] = useState<string>(initialTime);
  const [selectedTicketType, setSelectedTicketType] =
    useState<number>(initialTicketType);
  const [passengerQuantities, setPassengerQuantities] =
    useState(initialPassengers);

  // Helper functions
  const updatePassengerQuantity = (
    type: keyof typeof passengerQuantities,
    change: number,
  ) => {
    const newQuantities = {
      ...passengerQuantities,
      [type]: Math.max(
        type === "adults" ? 1 : 0,
        passengerQuantities[type] + change,
      ),
    };
    setPassengerQuantities(newQuantities);
    onPassengersChange?.(newQuantities);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    onTimeChange?.(time);
  };

  const handleTicketTypeSelect = (index: number) => {
    setSelectedTicketType(index);
    onTicketTypeChange?.(index);
  };

  const getTotalPassengers = () =>
    passengerQuantities.adults +
    passengerQuantities.children +
    passengerQuantities.infants;

  const calculateTotalPrice = () => {
    const ticket = attraction.ticketTypes[selectedTicketType];
    if (!ticket) return 0;

    const adultPrice = ticket.price * passengerQuantities.adults;
    const childPrice = ticket.price * 0.5 * passengerQuantities.children; // 50% for children
    const infantPrice = 0; // Free for infants

    return adultPrice + childPrice + infantPrice;
  };

  const isBookingValid = () => {
    return selectedTime && getTotalPassengers() > 0;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="flex items-center p-4">
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="mr-3 p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-gray-900 truncate">
              {attraction.name}
            </h1>
            <div className="flex items-center mt-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm text-gray-600 ml-1">
                {attraction.rating} ({attraction.reviews} reviews)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-32">
        {/* Hero Image */}
        <div className="relative h-64">
          <img
            src={attraction.images[0]}
            alt={attraction.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 text-white">
            <h2 className="text-xl font-bold">{attraction.name}</h2>
            <p className="text-sm opacity-90">{attraction.location}</p>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Time Selection */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center mb-4">
              <Clock className="w-5 h-5 text-[#003580] mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">
                Select Time
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {attraction.availableSlots[0]?.times.map((time, index) => (
                <Button
                  key={index}
                  variant={selectedTime === time ? "default" : "outline"}
                  onClick={() => handleTimeSelect(time)}
                  className={cn(
                    "h-12 text-base font-medium rounded-xl",
                    selectedTime === time
                      ? "bg-[#003580] text-white hover:bg-[#002a66] shadow-lg"
                      : "border-gray-200 hover:border-[#003580] hover:bg-blue-50",
                  )}
                >
                  {time}
                </Button>
              ))}
            </div>
            {selectedTime && (
              <div className="mt-3 text-sm text-green-600 font-medium bg-green-50 p-2 rounded-lg">
                ✓ Selected: {selectedTime}
              </div>
            )}
          </div>

          {/* Ticket Selection */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center mb-4">
              <Users className="w-5 h-5 text-[#003580] mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">
                How Many Tickets?
              </h3>
            </div>

            {/* Adults */}
            <div className="flex items-center justify-between py-4 border-b border-gray-100">
              <div>
                <div className="font-medium text-gray-900">Adult (13+)</div>
                <div className="text-sm text-gray-500">Full price</div>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updatePassengerQuantity("adults", -1)}
                  disabled={passengerQuantities.adults <= 1} // At least 1 adult required
                  className="w-10 h-10 rounded-full p-0"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-8 text-center font-semibold text-lg">
                  {passengerQuantities.adults}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updatePassengerQuantity("adults", 1)}
                  className="w-10 h-10 rounded-full p-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Children */}
            <div className="flex items-center justify-between py-4 border-b border-gray-100">
              <div>
                <div className="font-medium text-gray-900">Child (4-12)</div>
                <div className="text-sm text-gray-500">50% price</div>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updatePassengerQuantity("children", -1)}
                  disabled={passengerQuantities.children <= 0}
                  className="w-10 h-10 rounded-full p-0"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-8 text-center font-semibold text-lg">
                  {passengerQuantities.children}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updatePassengerQuantity("children", 1)}
                  className="w-10 h-10 rounded-full p-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Infants */}
            <div className="flex items-center justify-between py-4">
              <div>
                <div className="font-medium text-gray-900">Infant (0-3)</div>
                <div className="text-sm text-gray-500">Free</div>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updatePassengerQuantity("infants", -1)}
                  disabled={passengerQuantities.infants <= 0}
                  className="w-10 h-10 rounded-full p-0"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-8 text-center font-semibold text-lg">
                  {passengerQuantities.infants}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updatePassengerQuantity("infants", 1)}
                  className="w-10 h-10 rounded-full p-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Ticket Type Selection */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Choose Ticket Type
            </h3>
            <div className="space-y-3">
              {attraction.ticketTypes.map((ticket, index) => (
                <div
                  key={index}
                  onClick={() => handleTicketTypeSelect(index)}
                  className={cn(
                    "border-2 rounded-xl p-4 cursor-pointer transition-all",
                    selectedTicketType === index
                      ? "border-[#003580] bg-blue-50"
                      : "border-gray-200 hover:border-gray-300",
                  )}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">
                          {ticket.name}
                        </h4>
                        <Badge
                          variant="secondary"
                          className="text-xs whitespace-nowrap"
                        >
                          {ticket.refundable ? "Refundable" : "Non-refundable"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {formatPrice(ticket.price)} per person
                      </p>
                    </div>
                    <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center">
                      {selectedTicketType === index && (
                        <div className="w-3 h-3 bg-[#003580] rounded-full" />
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="grid grid-cols-1 gap-1">
                    {ticket.features.slice(0, 3).map((feature, idx) => (
                      <div
                        key={idx}
                        className="flex items-center text-xs text-gray-600"
                      >
                        <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </div>
                    ))}
                    {ticket.features.length > 3 && (
                      <div className="text-xs text-[#003580] mt-1">
                        +{ticket.features.length - 3} more features
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar - Fixed */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl">
        <div className="p-4">
          {/* Price Summary */}
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="text-sm text-gray-600">
                Total for {getTotalPassengers()} guest
                {getTotalPassengers() > 1 ? "s" : ""}
              </div>
              <div className="text-xs text-gray-500">
                {passengerQuantities.adults} Adults
                {passengerQuantities.children > 0 &&
                  `, ${passengerQuantities.children} Children`}
                {passengerQuantities.infants > 0 &&
                  `, ${passengerQuantities.infants} Infants`}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-[#003580]">
                {formatPrice(calculateTotalPrice())}
              </div>
              <div className="text-xs text-gray-500">includes taxes</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={() => onBargain(selectedTicketType)}
              disabled={!isBookingValid()}
              className="flex-1 bg-[#febb02] hover:bg-[#e5a700] text-[#003580] font-bold py-4 rounded-xl text-base shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <TrendingDown className="w-5 h-5 mr-2" />
              Bargain
            </Button>
            <Button
              onClick={() => onBookNow(selectedTicketType)}
              disabled={!isBookingValid()}
              className="flex-1 bg-[#003580] hover:bg-[#002a66] text-white font-bold py-4 rounded-xl text-base shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Book Now
            </Button>
          </div>

          {/* Booking Validation Message */}
          {!isBookingValid() && (
            <div className="flex items-center justify-center mt-3 text-sm text-amber-600 bg-amber-50 p-2 rounded-lg">
              <Info className="w-4 h-4 mr-2" />
              {!selectedTime
                ? "Please select a time"
                : "Please select at least 1 guest"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
