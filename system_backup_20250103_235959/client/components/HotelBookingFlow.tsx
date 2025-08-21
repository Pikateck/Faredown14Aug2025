import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Shield,
  Calendar,
  Users,
  MapPin,
  Star,
  CheckCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { bookingService, PreBookingRequest } from "@/services/bookingService";
import { paymentService } from "@/services/paymentService";

interface Hotel {
  id: string;
  name: string;
  address: string;
  starRating: number;
  images: Array<{ url: string; caption: string }>;
}

interface Room {
  id: string;
  name: string;
  category: string;
  bedType: string;
  maxOccupancy: number;
  rates: Array<{
    rateKey: string;
    total: number;
    currency: string;
  }>;
}

interface BookingFlowProps {
  hotel: Hotel;
  room: Room;
  selectedRate: any;
  searchParams: {
    checkIn: string;
    checkOut: string;
    rooms: number;
    adults: number;
    children: number;
  };
  onClose?: () => void;
}

export default function HotelBookingFlow({
  hotel,
  room,
  selectedRate,
  searchParams,
  onClose,
}: BookingFlowProps) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [guestDetails, setGuestDetails] = useState({
    primaryGuest: {
      title: "Mr",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    },
    additionalGuests: [],
  });

  const [contactInfo, setContactInfo] = useState({
    email: "",
    phone: "",
  });

  const [specialRequests, setSpecialRequests] = useState("");
  const [tempBookingRef, setTempBookingRef] = useState<string | null>(null);

  const calculateNights = () => {
    const checkIn = new Date(searchParams.checkIn);
    const checkOut = new Date(searchParams.checkOut);
    return Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24),
    );
  };

  const totalAmount =
    selectedRate.total * calculateNights() * searchParams.rooms;

  const handleGuestDetailChange = (field: string, value: string) => {
    setGuestDetails((prev) => ({
      ...prev,
      primaryGuest: {
        ...prev.primaryGuest,
        [field]: value,
      },
    }));
  };

  const handleContactChange = (field: string, value: string) => {
    setContactInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateStep1 = () => {
    const { primaryGuest } = guestDetails;
    const errors = [];

    if (!primaryGuest.firstName) errors.push("First name is required");
    if (!primaryGuest.lastName) errors.push("Last name is required");
    if (!contactInfo.email) errors.push("Email is required");
    if (!contactInfo.phone) errors.push("Phone number is required");

    if (errors.length > 0) {
      setError(errors.join(", "));
      return false;
    }

    setError(null);
    return true;
  };

  const handleContinueToPayment = async () => {
    if (!validateStep1()) return;

    setLoading(true);
    setError(null);

    try {
      // Create pre-booking
      const bookingData: PreBookingRequest = {
        hotelCode: hotel.id,
        roomCode: room.id,
        rateKey: selectedRate.rateKey,
        checkIn: searchParams.checkIn,
        checkOut: searchParams.checkOut,
        rooms: [
          {
            adults: searchParams.adults,
            children: searchParams.children,
          },
        ],
        guestDetails: {
          primaryGuest: guestDetails.primaryGuest,
          additionalGuests: guestDetails.additionalGuests,
        },
        contactInfo,
        specialRequests,
        totalAmount,
        currency: selectedRate.currency || "INR",
      };

      const preBookingResult =
        await bookingService.createPreBooking(bookingData);
      setTempBookingRef(preBookingResult.tempBookingRef);
      setCurrentStep(2);
    } catch (error) {
      console.error("Pre-booking error:", error);
      setError(
        error instanceof Error ? error.message : "Failed to create booking",
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!tempBookingRef) return;

    setLoading(true);
    setError(null);

    try {
      await paymentService.processHotelBookingPayment(
        {
          tempBookingRef,
          amount: totalAmount,
          currency: selectedRate.currency || "INR",
          customerDetails: {
            firstName: guestDetails.primaryGuest.firstName,
            lastName: guestDetails.primaryGuest.lastName,
            email: contactInfo.email,
            phone: contactInfo.phone,
          },
          hotelDetails: {
            hotelCode: hotel.id,
            hotelName: hotel.name,
          },
        },
        (bookingRef: string) => {
          // Payment successful - redirect to confirmation
          navigate(`/booking/confirmation/${bookingRef}`);
        },
        (error: string) => {
          setError(error);
          setLoading(false);
        },
        (isLoading: boolean) => {
          setLoading(isLoading);
        },
      );
    } catch (error) {
      console.error("Payment error:", error);
      setError(error instanceof Error ? error.message : "Payment failed");
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Guest Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Select
              value={guestDetails.primaryGuest.title}
              onValueChange={(value) => handleGuestDetailChange("title", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Mr">Mr</SelectItem>
                <SelectItem value="Mrs">Mrs</SelectItem>
                <SelectItem value="Ms">Ms</SelectItem>
                <SelectItem value="Dr">Dr</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              value={guestDetails.primaryGuest.firstName}
              onChange={(e) =>
                handleGuestDetailChange("firstName", e.target.value)
              }
              placeholder="Enter first name"
              required
            />
          </div>

          <div>
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              value={guestDetails.primaryGuest.lastName}
              onChange={(e) =>
                handleGuestDetailChange("lastName", e.target.value)
              }
              placeholder="Enter last name"
              required
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Contact Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={contactInfo.email}
              onChange={(e) => handleContactChange("email", e.target.value)}
              placeholder="Enter email address"
              required
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              value={contactInfo.phone}
              onChange={(e) => handleContactChange("phone", e.target.value)}
              placeholder="Enter phone number"
              required
            />
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
        <Textarea
          id="specialRequests"
          value={specialRequests}
          onChange={(e) => setSpecialRequests(e.target.value)}
          placeholder="Any special requests or preferences..."
          rows={3}
        />
      </div>

      {error && (
        <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      )}

      <Button
        onClick={handleContinueToPayment}
        disabled={loading}
        className="w-full bg-[#003580] hover:bg-[#002a66]"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...
          </>
        ) : (
          <>Continue to Payment</>
        )}
      </Button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
          <span className="text-green-800 font-medium">Booking Reserved</span>
        </div>
        <p className="text-green-700 text-sm mt-1">
          Your booking has been temporarily reserved. Complete payment to
          confirm.
        </p>
        {tempBookingRef && (
          <p className="text-green-700 text-sm mt-1">
            Reference: <strong>{tempBookingRef}</strong>
          </p>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Payment Details
        </h3>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-blue-900 font-medium">Total Amount</span>
            <span className="text-xl font-bold text-blue-900">
              {selectedRate.currency === "INR" ? "₹" : selectedRate.currency}{" "}
              {totalAmount.toLocaleString()}
            </span>
          </div>
          <p className="text-blue-700 text-sm mt-1">
            {calculateNights()} night{calculateNights() !== 1 ? "s" : ""} ×{" "}
            {searchParams.rooms} room{searchParams.rooms !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center text-sm text-gray-600">
            <Shield className="w-4 h-4 mr-2" />
            Secure payment powered by Razorpay
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <CreditCard className="w-4 h-4 mr-2" />
            All major cards, UPI, Net Banking supported
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      )}

      <div className="flex space-x-4">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(1)}
          disabled={loading}
          className="flex-1"
        >
          Back
        </Button>
        <Button
          onClick={handlePayment}
          disabled={loading}
          className="flex-1 bg-[#003580] hover:bg-[#002a66]"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...
            </>
          ) : (
            <>Pay Now</>
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      {/* Booking Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Booking Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-start justify-between">
                <h4 className="font-semibold text-gray-900">{hotel.name}</h4>
                <div className="flex">
                  {Array.from({ length: hotel.starRating }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-600">{hotel.address}</p>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Check-in:</span>
                <p className="font-medium">
                  {new Date(searchParams.checkIn).toLocaleDateString("en-GB")}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Check-out:</span>
                <p className="font-medium">
                  {new Date(searchParams.checkOut).toLocaleDateString("en-GB")}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Room:</span>
                <p className="font-medium">{room.name}</p>
              </div>
              <div>
                <span className="text-gray-600">Guests:</span>
                <p className="font-medium">
                  {searchParams.adults + searchParams.children} guests
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Booking Form */}
      <Card>
        <CardHeader>
          <CardTitle>
            {currentStep === 1 ? "Guest Information" : "Payment"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentStep === 1 ? renderStep1() : renderStep2()}
        </CardContent>
      </Card>
    </div>
  );
}
