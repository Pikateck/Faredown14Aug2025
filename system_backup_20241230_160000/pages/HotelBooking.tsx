import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MapPin,
  Calendar,
  Users,
  Star,
  Wifi,
  Car,
  Coffee,
  Dumbbell,
  Waves,
  ChevronDown,
  ArrowLeft,
  Menu,
  User,
  BookOpen,
  Award,
  LogOut,
  CreditCard,
  CheckCircle,
  Info,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function HotelBooking() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get booking data from navigation state
  const selectedHotel = location.state?.selectedHotel;
  const checkIn = location.state?.checkIn || "2024-12-15";
  const checkOut = location.state?.checkOut || "2024-12-18";
  const guests = location.state?.guests || { adults: 2, children: 0, rooms: 1 };
  const negotiatedPrice =
    location.state?.negotiatedPrice || selectedHotel?.price;
  const nights = location.state?.nights || 3;

  // UI States
  const [currentStep, setCurrentStep] = useState(1);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");

  // Guest Details State
  const [guestDetails, setGuestDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "India",
    specialRequests: "",
  });

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardDetails, setCardDetails] = useState({
    number: "4111 1111 1111 1111",
    expiry: "12/30",
    cvv: "123",
    name: "Test User",
  });

  // Extras State
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);

  // Redirect if no hotel data
  useEffect(() => {
    if (!selectedHotel) {
      navigate("/hotels");
    }
  }, [selectedHotel, navigate]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  // Calculate dates
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Available extras
  const availableExtras = [
    {
      id: "early-checkin",
      name: "Early Check-in (12:00 PM)",
      price: 2000,
      description: "Check in 3 hours early",
    },
    {
      id: "late-checkout",
      name: "Late Check-out (3:00 PM)",
      price: 1500,
      description: "Check out 3 hours late",
    },
    {
      id: "airport-transfer",
      name: "Airport Transfer",
      price: 3500,
      description: "Round-trip airport pickup",
    },
    {
      id: "spa-access",
      name: "Spa Access",
      price: 5000,
      description: "Full day spa and wellness center access",
    },
    {
      id: "room-upgrade",
      name: "Room Upgrade",
      price: 8000,
      description: "Upgrade to next room category",
    },
  ];

  // Calculate extras total
  const calculateExtrasTotal = () => {
    return selectedExtras.reduce((total, extraId) => {
      const extra = availableExtras.find((e) => e.id === extraId);
      return total + (extra?.price || 0);
    }, 0);
  };

  // Calculate total price
  const calculateTotal = () => {
    const basePrice = negotiatedPrice * nights;
    const extrasTotal = calculateExtrasTotal();
    const taxes = Math.round((basePrice + extrasTotal) * 0.18); // 18% taxes
    return basePrice + extrasTotal + taxes;
  };

  // Handle extra selection
  const toggleExtra = (extraId: string) => {
    setSelectedExtras((prev) =>
      prev.includes(extraId)
        ? prev.filter((id) => id !== extraId)
        : [...prev, extraId],
    );
  };

  // Step validation
  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return (
          guestDetails.firstName &&
          guestDetails.lastName &&
          guestDetails.email &&
          guestDetails.phone
        );
      case 2:
        return true; // Extras are optional
      case 3:
        return paymentMethod === "card"
          ? cardDetails.number &&
              cardDetails.expiry &&
              cardDetails.cvv &&
              cardDetails.name
          : true;
      default:
        return false;
    }
  };

  // Navigation functions
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const previousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Handle booking completion
  const completeBooking = () => {
    // In a real app, this would submit to backend
    navigate("/hotels/confirmation", {
      state: {
        selectedHotel,
        checkIn,
        checkOut,
        guests,
        guestDetails,
        selectedExtras,
        finalPrice: calculateTotal(),
        bookingId: `HB${Date.now()}`,
      },
    });
  };

  const handleSignOut = () => {
    setIsLoggedIn(false);
    setUserName("");
  };

  // Don't render if no hotel data
  if (!selectedHotel) {
    return null;
  }

  const steps = [
    { id: 1, title: "Guest Details", icon: User },
    { id: 2, title: "Extras", icon: Star },
    { id: 3, title: "Payment", icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-700 text-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate(-1)}
                className="text-white hover:text-blue-200 p-1"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <Link to="/" className="flex items-center space-x-2">
                <span className="text-base sm:text-xl font-bold tracking-tight">
                  faredown.com
                </span>
              </Link>
              <div className="text-xs sm:text-sm text-blue-200 hidden sm:block">
                / Hotel Booking
              </div>
            </div>

            <div className="flex items-center space-x-2 md:space-x-6">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden text-white p-2 touch-manipulation"
              >
                <Menu className="w-6 h-6" />
              </button>

              <div className="flex items-center space-x-3">
                {isLoggedIn ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center space-x-2 bg-blue-600 rounded-full px-2 md:px-3 py-2 hover:bg-blue-800">
                      <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-black">
                          {userName.charAt(0)}
                        </span>
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={handleSignOut}>
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-white text-blue-700"
                    >
                      Sign in
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Progress Steps */}
            <div className="bg-white rounded-lg border p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                        currentStep >= step.id
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {currentStep > step.id ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <step.icon className="w-5 h-5" />
                      )}
                    </div>
                    <span
                      className={`ml-3 text-sm font-medium ${
                        currentStep >= step.id
                          ? "text-gray-900"
                          : "text-gray-500"
                      }`}
                    >
                      {step.title}
                    </span>
                    {index < steps.length - 1 && (
                      <div
                        className={`w-16 h-1 mx-4 ${
                          currentStep > step.id ? "bg-blue-600" : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step Content */}
            <div className="bg-white rounded-lg border p-6">
              {currentStep === 1 && (
                <div>
                  <h3 className="text-xl font-semibold mb-6">Guest Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <Input
                        value={guestDetails.firstName}
                        onChange={(e) =>
                          setGuestDetails((prev) => ({
                            ...prev,
                            firstName: e.target.value,
                          }))
                        }
                        placeholder="Enter first name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <Input
                        value={guestDetails.lastName}
                        onChange={(e) =>
                          setGuestDetails((prev) => ({
                            ...prev,
                            lastName: e.target.value,
                          }))
                        }
                        placeholder="Enter last name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <Input
                        type="email"
                        value={guestDetails.email}
                        onChange={(e) =>
                          setGuestDetails((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        placeholder="Enter email address"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <Input
                        type="tel"
                        value={guestDetails.phone}
                        onChange={(e) =>
                          setGuestDetails((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country
                      </label>
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
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="India">India</SelectItem>
                          <SelectItem value="UAE">UAE</SelectItem>
                          <SelectItem value="USA">USA</SelectItem>
                          <SelectItem value="UK">UK</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Special Requests (Optional)
                      </label>
                      <textarea
                        value={guestDetails.specialRequests}
                        onChange={(e) =>
                          setGuestDetails((prev) => ({
                            ...prev,
                            specialRequests: e.target.value,
                          }))
                        }
                        placeholder="Any special requests or preferences..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div>
                  <h3 className="text-xl font-semibold mb-6">
                    Enhance Your Stay
                  </h3>
                  <div className="space-y-4">
                    {availableExtras.map((extra) => (
                      <div
                        key={extra.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-start space-x-3">
                            <input
                              type="checkbox"
                              checked={selectedExtras.includes(extra.id)}
                              onChange={() => toggleExtra(extra.id)}
                              className="mt-1"
                            />
                            <div>
                              <div className="font-medium text-gray-900">
                                {extra.name}
                              </div>
                              <div className="text-sm text-gray-600">
                                {extra.description}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-gray-900">
                              {formatCurrency(extra.price)}
                            </div>
                            <div className="text-xs text-gray-500">
                              per stay
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div>
                  <h3 className="text-xl font-semibold mb-6">
                    Payment Details
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Payment Method
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="payment"
                            value="card"
                            checked={paymentMethod === "card"}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="mr-3"
                          />
                          <span>Credit/Debit Card</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="payment"
                            value="upi"
                            checked={paymentMethod === "upi"}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="mr-3"
                          />
                          <span>UPI</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="payment"
                            value="wallet"
                            checked={paymentMethod === "wallet"}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="mr-3"
                          />
                          <span>Digital Wallet</span>
                        </label>
                      </div>
                    </div>

                    {paymentMethod === "card" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Card Number
                          </label>
                          <Input
                            value={cardDetails.number}
                            onChange={(e) =>
                              setCardDetails((prev) => ({
                                ...prev,
                                number: e.target.value,
                              }))
                            }
                            placeholder="1234 5678 9012 3456"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Expiry Date
                          </label>
                          <Input
                            value={cardDetails.expiry}
                            onChange={(e) =>
                              setCardDetails((prev) => ({
                                ...prev,
                                expiry: e.target.value,
                              }))
                            }
                            placeholder="MM/YY"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            CVV
                          </label>
                          <Input
                            value={cardDetails.cvv}
                            onChange={(e) =>
                              setCardDetails((prev) => ({
                                ...prev,
                                cvv: e.target.value,
                              }))
                            }
                            placeholder="123"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cardholder Name
                          </label>
                          <Input
                            value={cardDetails.name}
                            onChange={(e) =>
                              setCardDetails((prev) => ({
                                ...prev,
                                name: e.target.value,
                              }))
                            }
                            placeholder="Enter cardholder name"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <Button
                  onClick={previousStep}
                  variant="outline"
                  disabled={currentStep === 1}
                >
                  Previous
                </Button>
                {currentStep < 3 ? (
                  <Button
                    onClick={nextStep}
                    disabled={!validateStep(currentStep)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={completeBooking}
                    disabled={!validateStep(currentStep)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Complete Booking
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border p-6 sticky top-24">
              <h3 className="text-lg font-semibold mb-4">Booking Summary</h3>

              {/* Hotel Details */}
              <div className="mb-6">
                <div className="flex items-start space-x-3">
                  <img
                    src={selectedHotel.image}
                    alt={selectedHotel.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {selectedHotel.name}
                    </h4>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <MapPin className="w-4 h-4 mr-1" />
                      {selectedHotel.location}
                    </div>
                    <div className="flex items-center mt-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(selectedHotel.rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="ml-1 text-sm text-gray-600">
                        {selectedHotel.rating}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stay Details */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Check-in</span>
                  <span className="font-medium">{formatDate(checkIn)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Check-out</span>
                  <span className="font-medium">{formatDate(checkOut)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Nights</span>
                  <span className="font-medium">{nights}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Guests</span>
                  <span className="font-medium">
                    {guests.adults + guests.children} guests, {guests.rooms}{" "}
                    room
                    {guests.rooms > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Room Type</span>
                  <span className="font-medium">{selectedHotel.roomType}</span>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Room ({nights} nights)</span>
                  <span>{formatCurrency(negotiatedPrice * nights)}</span>
                </div>
                {selectedExtras.length > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Extras</span>
                    <span>{formatCurrency(calculateExtrasTotal())}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>Taxes & Fees</span>
                  <span>
                    {formatCurrency(
                      Math.round(
                        (negotiatedPrice * nights + calculateExtrasTotal()) *
                          0.18,
                      ),
                    )}
                  </span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(calculateTotal())}</span>
                </div>
              </div>

              {/* Cancellation Policy */}
              <div className="mt-6 p-3 bg-green-50 rounded-lg">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium text-green-800">
                      {selectedHotel.cancellation}
                    </div>
                    <div className="text-green-700">
                      Cancel up to 24 hours before check-in
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
