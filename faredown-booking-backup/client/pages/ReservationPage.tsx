import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CreditCard,
  Shield,
  CheckCircle,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Users,
  Star,
  Clock,
  Wifi,
  Car,
  Coffee,
  Utensils,
  ChevronRight,
  ArrowLeft,
  Lock,
} from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import {
  formatPriceWithSymbol,
  formatLocalPrice,
  calculateTotalPrice,
} from "@/lib/pricing";

// Simple INR formatter that doesn't do currency conversion (prices are already in INR)
const formatINR = (amount: number): string => {
  return `₹${amount.toLocaleString()}`;
};

export default function ReservationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { selectedCurrency } = useCurrency();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [guestDetails, setGuestDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "",
    address: "",
    city: "",
    zipCode: "",
    specialRequests: "",
  });

  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: "4111 1111 1111 1111",
    expiryMonth: "12",
    expiryYear: "2030",
    cvv: "123",
    cardholderName: "Test User",
    billingAddress: "123 Test Street",
    billingCity: "Test City",
    billingZip: "12345",
    paymentMethod: "card", // "card" or "pay_at_hotel"
  });

  const [preferences, setPreferences] = useState({
    bedType: "king",
    smokingPreference: "non-smoking",
    floorPreference: "high",
    earlyCheckin: false,
    lateCheckout: false,
    airportTransfer: false,
    extraTowels: false,
    dailyHousekeeping: true,
  });

  // Hotel data (fetched from booking state or API)
  const hotelData = {
    id: searchParams.get("hotelId") || "1",
    name:
      searchParams.get("hotelName") ||
      (searchParams.get("roomName") &&
        decodeURIComponent(searchParams.get("roomName")!)) ||
      "Grand Hyatt Dubai",
    location:
      (searchParams.get("location") &&
        decodeURIComponent(searchParams.get("location")!)) ||
      "Dubai, United Arab Emirates",
    image:
      searchParams.get("image") ||
      "https://cdn.builder.io/api/v1/image/assets%2F4235b10530ff469795aa00c0333d773c%2F4e78c7022f0345f4909bc6063cdeffd6",
    rating: parseFloat(searchParams.get("rating") || "4.8"),
    reviews: parseInt(searchParams.get("reviews") || "1247"),
    roomType:
      (searchParams.get("roomType") &&
        decodeURIComponent(searchParams.get("roomType")!)) ||
      "1 X King Classic",
    pricePerNight: parseInt(searchParams.get("pricePerNight") || "9340"),
    totalPrice: parseInt(searchParams.get("totalPrice") || "0"), // Will be calculated if 0
    amenities: searchParams.get("amenities")?.split(",") || [
      "Free WiFi",
      "Pool",
      "Gym",
      "Spa",
      "Restaurant",
      "Parking",
    ],
    isBargained: searchParams.get("bargained") === "true",
    originalPrice: searchParams.get("originalPrice")
      ? parseInt(searchParams.get("originalPrice"))
      : null,
  };

  // Booking details - Use actual values from search/booking flow
  const checkIn = searchParams.get("checkIn") || "2025-07-16";
  const checkOut = searchParams.get("checkOut") || "2025-07-19";
  const guests = parseInt(searchParams.get("guests") || "2");
  const rooms = parseInt(searchParams.get("rooms") || "1");

  // Calculate pricing
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const nights = Math.ceil(
    (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  // Use consistent pricing calculation from lib/pricing.ts
  const priceBreakdown = calculateTotalPrice(
    hotelData.pricePerNight,
    nights,
    rooms,
  );

  // Use the total price passed from bargain modal if available, otherwise use calculated total
  const finalTotal =
    hotelData.isBargained && hotelData.totalPrice && hotelData.totalPrice > 0
      ? hotelData.totalPrice // Use the exact bargained price
      : priceBreakdown.total; // Use calculated price for non-bargained bookings

  const pricing = {
    basePrice: priceBreakdown.basePrice,
    taxes: priceBreakdown.taxes,
    fees: priceBreakdown.fees,
    total: finalTotal,
    perNightPrice: hotelData.pricePerNight,
  };

  // Date formatting function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Add-on services pricing
  const addOnPricing = {
    earlyCheckin: 50,
    lateCheckout: 30,
    airportTransfer: 75,
    extraTowels: 15,
  };

  const calculateAddOns = () => {
    let total = 0;
    if (preferences.earlyCheckin) total += addOnPricing.earlyCheckin;
    if (preferences.lateCheckout) total += addOnPricing.lateCheckout;
    if (preferences.airportTransfer) total += addOnPricing.airportTransfer;
    if (preferences.extraTowels) total += addOnPricing.extraTowels;
    return total;
  };

  const grandTotal = pricing.total + calculateAddOns();

  const steps = [
    { number: 1, title: "Guest Details", description: "Personal information" },
    {
      number: 2,
      title: "Preferences",
      description: "Room and service preferences",
    },
    { number: 3, title: "Payment", description: "Secure payment processing" },
    { number: 4, title: "Confirmation", description: "Booking confirmation" },
  ];

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePayment = async () => {
    setIsLoading(true);
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);

    // Save booking data to localStorage
    const bookingData = {
      id: `HTL${Date.now()}`,
      bookingDate: new Date().toISOString(),
      hotel: {
        id: hotelData.id,
        name: hotelData.name,
        location: hotelData.location,
        image: hotelData.image,
        rating: hotelData.rating,
        reviews: hotelData.reviews,
      },
      room: {
        name: hotelData.roomType,
        details: hotelData.roomType,
        pricePerNight: hotelData.pricePerNight,
      },
      guest: guestDetails,
      checkIn: checkIn,
      checkOut: checkOut,
      nights: nights,
      guests: guests,
      rooms: rooms,
      total: grandTotal,
      paymentMethod:
        paymentDetails.paymentMethod === "card"
          ? "Credit Card"
          : "Pay at Hotel",
      paymentStatus: "Confirmed",
      bargained: hotelData.isBargained,
      originalPrice: hotelData.originalPrice,
      specialRequests: guestDetails.specialRequests,
      cancellation: "Free cancellation until 24 hours before check-in",
    };

    localStorage.setItem("latestHotelBooking", JSON.stringify(bookingData));

    // Navigate to confirmation page
    navigate(
      `/booking-confirmation?bookingId=HTL${Date.now()}&hotelId=${hotelData.id}`,
    );
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return (
          guestDetails.firstName &&
          guestDetails.lastName &&
          guestDetails.email &&
          guestDetails.phone
        );
      case 2:
        return true; // Preferences are optional
      case 3:
        if (paymentDetails.paymentMethod === "pay_at_hotel") {
          return true; // No card details required for pay at hotel
        }
        return (
          paymentDetails.cardNumber &&
          paymentDetails.expiryMonth &&
          paymentDetails.cvv &&
          paymentDetails.cardholderName
        );
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-6">
        {/* Breadcrumb */}
        <div className="flex items-center text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6 overflow-x-auto">
          <button
            onClick={() => navigate("/hotels/results")}
            className="hover:text-blue-600 whitespace-nowrap"
          >
            Hotels
          </button>
          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 mx-1 sm:mx-2 flex-shrink-0" />
          <button
            onClick={() => navigate(`/hotels/${hotelData.id}`)}
            className="hover:text-blue-600 truncate"
          >
            {hotelData.name}
          </button>
          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 mx-1 sm:mx-2 flex-shrink-0" />
          <span className="text-gray-900 font-medium whitespace-nowrap">
            Reservation
          </span>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6 mb-4 sm:mb-6">
          <div className="flex items-center justify-between overflow-x-auto">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className="flex items-center flex-shrink-0"
              >
                <div
                  className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full ${
                    currentStep >= step.number
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {currentStep > step.number ? (
                    <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6" />
                  ) : (
                    <span className="font-semibold text-xs sm:text-sm">
                      {step.number}
                    </span>
                  )}
                </div>
                <div className="ml-2 sm:ml-3 hidden md:block">
                  <div className="font-medium text-xs sm:text-sm">
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-500 hidden lg:block">
                    {step.description}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-8 sm:w-12 lg:w-20 h-1 mx-2 sm:mx-4 lg:mx-6 ${
                      currentStep > step.number ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          {/* Mobile step info */}
          <div className="md:hidden mt-3 text-center">
            <div className="font-medium text-sm">
              {steps[currentStep - 1]?.title}
            </div>
            <div className="text-xs text-gray-500">
              {steps[currentStep - 1]?.description}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  {currentStep === 1 && <User className="w-5 h-5 mr-2" />}
                  {currentStep === 2 && (
                    <CheckCircle className="w-5 h-5 mr-2" />
                  )}
                  {currentStep === 3 && <CreditCard className="w-5 h-5 mr-2" />}
                  {steps.find((s) => s.number === currentStep)?.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Step 1: Guest Details */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          value={guestDetails.firstName}
                          onChange={(e) =>
                            setGuestDetails((prev) => ({
                              ...prev,
                              firstName: e.target.value,
                            }))
                          }
                          placeholder="John"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          value={guestDetails.lastName}
                          onChange={(e) =>
                            setGuestDetails((prev) => ({
                              ...prev,
                              lastName: e.target.value,
                            }))
                          }
                          placeholder="Smith"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={guestDetails.email}
                        onChange={(e) =>
                          setGuestDetails((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        placeholder="john.smith@email.com"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        value={guestDetails.phone}
                        onChange={(e) =>
                          setGuestDetails((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        placeholder="+971 50 123 4567"
                      />
                    </div>

                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Select
                        value={guestDetails.country}
                        onValueChange={(value) =>
                          setGuestDetails((prev) => ({
                            ...prev,
                            country: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ae">
                            United Arab Emirates
                          </SelectItem>
                          <SelectItem value="us">United States</SelectItem>
                          <SelectItem value="in">India</SelectItem>
                          <SelectItem value="gb">United Kingdom</SelectItem>
                          <SelectItem value="ca">Canada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={guestDetails.address}
                        onChange={(e) =>
                          setGuestDetails((prev) => ({
                            ...prev,
                            address: e.target.value,
                          }))
                        }
                        placeholder="123 Sheikh Zayed Road"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={guestDetails.city}
                          onChange={(e) =>
                            setGuestDetails((prev) => ({
                              ...prev,
                              city: e.target.value,
                            }))
                          }
                          placeholder="Dubai"
                        />
                      </div>
                      <div>
                        <Label htmlFor="zipCode">ZIP Code</Label>
                        <Input
                          id="zipCode"
                          value={guestDetails.zipCode}
                          onChange={(e) =>
                            setGuestDetails((prev) => ({
                              ...prev,
                              zipCode: e.target.value,
                            }))
                          }
                          placeholder="12345"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="specialRequests">Special Requests</Label>
                      <textarea
                        id="specialRequests"
                        className="w-full p-3 border border-gray-300 rounded-md resize-none h-24"
                        value={guestDetails.specialRequests}
                        onChange={(e) =>
                          setGuestDetails((prev) => ({
                            ...prev,
                            specialRequests: e.target.value,
                          }))
                        }
                        placeholder="e.g., High floor room, late check-in, anniversary celebration setup..."
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Preferences */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        Room Preferences
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Bed Type</Label>
                          <Select
                            value={preferences.bedType}
                            onValueChange={(value) =>
                              setPreferences((prev) => ({
                                ...prev,
                                bedType: value,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="king">King Bed</SelectItem>
                              <SelectItem value="queen">Queen Bed</SelectItem>
                              <SelectItem value="twin">Twin Beds</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Smoking Preference</Label>
                          <Select
                            value={preferences.smokingPreference}
                            onValueChange={(value) =>
                              setPreferences((prev) => ({
                                ...prev,
                                smokingPreference: value,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="non-smoking">
                                Non-Smoking
                              </SelectItem>
                              <SelectItem value="smoking">Smoking</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        Additional Services
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              checked={preferences.earlyCheckin}
                              onCheckedChange={(checked) =>
                                setPreferences((prev) => ({
                                  ...prev,
                                  earlyCheckin: checked,
                                }))
                              }
                            />
                            <div>
                              <div className="font-medium">Early Check-in</div>
                              <div className="text-sm text-gray-600">
                                Check-in before 3:00 PM
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">
                              {formatINR(addOnPricing.earlyCheckin)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              checked={preferences.lateCheckout}
                              onCheckedChange={(checked) =>
                                setPreferences((prev) => ({
                                  ...prev,
                                  lateCheckout: checked,
                                }))
                              }
                            />
                            <div>
                              <div className="font-medium">Late Check-out</div>
                              <div className="text-sm text-gray-600">
                                Check-out after 12:00 PM
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">
                              {formatINR(addOnPricing.lateCheckout)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              checked={preferences.airportTransfer}
                              onCheckedChange={(checked) =>
                                setPreferences((prev) => ({
                                  ...prev,
                                  airportTransfer: checked,
                                }))
                              }
                            />
                            <div>
                              <div className="font-medium">
                                Airport Transfer
                              </div>
                              <div className="text-sm text-gray-600">
                                One-way airport pickup
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">
                              {formatINR(addOnPricing.airportTransfer)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Payment */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-center">
                        <Shield className="w-5 h-5 text-blue-600 mr-2" />
                        <span className="text-blue-800 font-medium">
                          Secure Payment
                        </span>
                      </div>
                      <p className="text-blue-700 text-sm mt-1">
                        Your payment information is protected with 256-bit SSL
                        encryption
                      </p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-3 block">
                        Payment Method
                      </Label>
                      <div className="space-y-3">
                        <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="card"
                            checked={paymentDetails.paymentMethod === "card"}
                            onChange={(e) =>
                              setPaymentDetails((prev) => ({
                                ...prev,
                                paymentMethod: e.target.value,
                              }))
                            }
                            className="mr-3"
                          />
                          <div className="flex items-center">
                            <CreditCard className="w-5 h-5 mr-2 text-gray-600" />
                            <span>Pay Now with Card</span>
                          </div>
                        </label>

                        <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="pay_at_hotel"
                            checked={
                              paymentDetails.paymentMethod === "pay_at_hotel"
                            }
                            onChange={(e) =>
                              setPaymentDetails((prev) => ({
                                ...prev,
                                paymentMethod: e.target.value,
                              }))
                            }
                            className="mr-3"
                          />
                          <div className="flex items-center">
                            <div>
                              <div>Pay at Hotel</div>
                              <div className="text-xs text-gray-500">
                                Pay during check-in
                              </div>
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>

                    {paymentDetails.paymentMethod === "card" && (
                      <>
                        <div>
                          <Label htmlFor="cardNumber">Card Number *</Label>
                          <Input
                            id="cardNumber"
                            value={paymentDetails.cardNumber}
                            onChange={(e) =>
                              setPaymentDetails((prev) => ({
                                ...prev,
                                cardNumber: e.target.value,
                              }))
                            }
                            placeholder="1234 5678 9012 3456"
                            maxLength={19}
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label>Expiry Month *</Label>
                            <Select
                              value={paymentDetails.expiryMonth}
                              onValueChange={(value) =>
                                setPaymentDetails((prev) => ({
                                  ...prev,
                                  expiryMonth: value,
                                }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="MM" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 12 }, (_, i) => (
                                  <SelectItem
                                    key={i + 1}
                                    value={String(i + 1).padStart(2, "0")}
                                  >
                                    {String(i + 1).padStart(2, "0")}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Expiry Year *</Label>
                            <Select
                              value={paymentDetails.expiryYear}
                              onValueChange={(value) =>
                                setPaymentDetails((prev) => ({
                                  ...prev,
                                  expiryYear: value,
                                }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="YYYY" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 10 }, (_, i) => (
                                  <SelectItem
                                    key={i}
                                    value={String(new Date().getFullYear() + i)}
                                  >
                                    {new Date().getFullYear() + i}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="cvv">CVV *</Label>
                            <Input
                              id="cvv"
                              value={paymentDetails.cvv}
                              onChange={(e) =>
                                setPaymentDetails((prev) => ({
                                  ...prev,
                                  cvv: e.target.value,
                                }))
                              }
                              placeholder="123"
                              maxLength={4}
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="cardholderName">
                            Cardholder Name *
                          </Label>
                          <Input
                            id="cardholderName"
                            value={paymentDetails.cardholderName}
                            onChange={(e) =>
                              setPaymentDetails((prev) => ({
                                ...prev,
                                cardholderName: e.target.value,
                              }))
                            }
                            placeholder="Name as it appears on card"
                          />
                        </div>
                      </>
                    )}

                    {paymentDetails.paymentMethod === "pay_at_hotel" && (
                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <div className="flex items-center">
                          <span className="text-yellow-800 font-medium">
                            Pay at Hotel
                          </span>
                        </div>
                        <p className="text-yellow-700 text-sm mt-1">
                          You can pay directly at the hotel during check-in.
                          Accepted payment methods: Cash, Credit Card, Debit
                          Card.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6 border-t border-gray-200">
                  {currentStep > 1 ? (
                    <Button variant="outline" onClick={handlePrevStep}>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Previous
                    </Button>
                  ) : (
                    <div />
                  )}

                  {currentStep < 3 ? (
                    <Button onClick={handleNextStep} disabled={!isStepValid()}>
                      Continue
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handlePayment}
                      disabled={!isStepValid() || isLoading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          {paymentDetails.paymentMethod === "pay_at_hotel"
                            ? "Confirm Booking"
                            : "Complete Payment"}
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-3">
                  <img
                    src={hotelData.image}
                    alt={hotelData.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">{hotelData.name}</h3>
                    <div className="flex items-center text-xs text-gray-600 mt-1">
                      <MapPin className="w-3 h-3 mr-1" />
                      {hotelData.location}
                    </div>
                    <div className="flex items-center mt-1">
                      <div className="flex items-center">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < Math.floor(hotelData.rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-600 ml-1">
                        {hotelData.rating} ({hotelData.reviews})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Room Type:</span>
                    <span className="font-medium">{hotelData.roomType}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Check-in:</span>
                    <span>{formatDate(checkIn)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Check-out:</span>
                    <span>{formatDate(checkOut)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Nights:</span>
                    <span>{nights}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Guests:</span>
                    <span>{guests}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Rooms:</span>
                    <span>{rooms}</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>
                      Room Rate ({nights} nights × {rooms} room
                      {rooms > 1 ? "s" : ""})
                    </span>
                    <span>{formatINR(pricing.basePrice)}</span>
                  </div>
                  <div className="text-xs text-gray-500 text-right">
                    {formatINR(pricing.perNightPrice)} × {nights} nights ×{" "}
                    {rooms} room{rooms > 1 ? "s" : ""} ={" "}
                    {formatINR(pricing.total)} (incl. taxes & fees)
                  </div>
                  {calculateAddOns() > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Add-on Services</span>
                      <span>{formatINR(calculateAddOns())}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-xl font-bold text-blue-600">
                      {formatINR(grandTotal)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 text-right mt-1">
                    All taxes, fees & charges included
                  </div>
                  {hotelData.isBargained && (
                    <div className="bg-green-50 p-2 rounded mt-2">
                      <div className="text-xs text-green-700 font-medium">
                        <CheckCircle className="w-4 h-4 inline mr-1" />
                        Bargained Price Applied!
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <div className="flex items-center text-green-800 text-sm">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Free cancellation until 24 hours before check-in
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
