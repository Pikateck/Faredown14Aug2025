import React, { useState, useEffect } from "react";
import {
  Link,
  useNavigate,
  useLocation,
  useSearchParams,
} from "react-router-dom";
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
  ChevronDown,
  ArrowLeft,
  User,
  LogOut,
  CreditCard,
  CheckCircle,
  Info,
  X,
  Clock,
  Car,
  Plane,
  Hotel,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Header } from "@/components/Header";

export default function TransferBooking() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Extract parameters from URL
  const transferId = searchParams.get("transferId");
  const rateKey = searchParams.get("rateKey");
  const vehicleCode = searchParams.get("vehicleCode");
  const price = searchParams.get("price");
  const bargainApplied = searchParams.get("bargainApplied");
  const pickupLocation =
    searchParams.get("pickupLocation") || "Mumbai Airport (BOM)";
  const dropoffLocation =
    searchParams.get("dropoffLocation") || "Hotel Taj Mahal Palace";
  const vehicleName = searchParams.get("vehicleName") || "Sedan - Economy";
  const pickupDate =
    searchParams.get("pickupDate") || new Date().toISOString().split("T")[0];
  const pickupTime = searchParams.get("pickupTime") || "10:00";
  const isRoundTrip = searchParams.get("returnDate") !== null;
  const returnDate = searchParams.get("returnDate");
  const returnTime = searchParams.get("returnTime");
  const adults = parseInt(searchParams.get("adults") || "2");
  const children = parseInt(searchParams.get("children") || "0");
  const infants = parseInt(searchParams.get("infants") || "0");
  const totalPassengers = adults + children + infants;

  // States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("outbound");
  const [formData, setFormData] = useState({
    primaryGuest: {
      title: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      countryCode: "+91",
    },
    flightDetails: {
      flightNumber: "",
      arrivalTime: "",
      airline: "",
    },
    specialRequests: "",
  });

  // Transfer data based on URL parameters (matches selected transfer from results)
  const transferData = {
    id: transferId || "hotelbeds_1",
    type: "Economy",
    vehicle: "Sedan",
    vehicleName: vehicleName,
    provider: "Mumbai Transfers Ltd",
    rating: 4.3,
    maxPassengers: totalPassengers || 3,
    duration: "45 minutes",
    distance: "25 km",
    features: ["Professional Driver", "Meet & Greet", "Free Waiting"],
    image: "/api/placeholder/120/80",
    basePrice: parseInt(price) || 1200,
    finalPrice: bargainApplied ? parseInt(price) : parseInt(price) || 1380,
    outbound: {
      from: pickupLocation,
      to: dropoffLocation,
      pickupDate: pickupDate
        ? new Date(pickupDate).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "Date TBD",
      pickupTime: pickupTime || "10:00",
      price: bargainApplied ? parseInt(price) : parseInt(price) || 1380,
      originalPrice: 1500,
    },
    return:
      isRoundTrip && returnDate
        ? {
            from: dropoffLocation,
            to: pickupLocation,
            pickupDate: returnDate
              ? new Date(returnDate).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "Return Date TBD",
            pickupTime: returnTime || "14:00",
            price: bargainApplied ? parseInt(price) : parseInt(price) || 1380,
            originalPrice: 1500,
          }
        : null,
    isRoundTrip,
  };

  const currentTransfer =
    activeTab === "outbound"
      ? transferData.outbound
      : transferData.return || transferData.outbound;
  const totalPrice =
    isRoundTrip && transferData.return
      ? transferData.outbound.price + transferData.return.price
      : transferData.outbound.price;

  // Reset to outbound tab if return tab is active but no return data
  useEffect(() => {
    if (activeTab === "return" && !transferData.return) {
      setActiveTab("outbound");
    }
  }, [activeTab, transferData.return]);

  const handleSignOut = () => {
    setIsLoggedIn(false);
    setUserName("");
  };

  const handleInputChange = (section: string, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value,
      },
    }));
  };

  const handleBookTransfer = async () => {
    setIsProcessing(true);

    try {
      // Simulate booking API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Navigate to confirmation page
      navigate("/transfer-confirmation", {
        state: {
          transfer: {
            ...transferData,
            pickupLocation,
            dropoffLocation,
            pickupDate,
            pickupTime,
            returnDate,
            returnTime,
            adults,
            children,
            infants,
            totalPassengers,
            isRoundTrip,
          },
          bookingData: formData,
          bookingRef: `TR${Date.now()}`,
          totalPrice,
        },
      });
    } catch (error) {
      console.error("Booking failed:", error);
      alert("Booking failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/transfer-results")}
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">
            Complete Your Transfer Booking
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Transfer Summary */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Your journey
                </h2>
              </div>

              <div className="flex items-center space-x-4 mb-4">
                <div className="w-20 h-16 rounded-lg overflow-hidden">
                  <img
                    src={transferData.image}
                    alt={transferData.vehicle}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-semibold text-gray-900">
                      {transferData.vehicleName ||
                        `${transferData.type} - ${transferData.vehicle}`}
                    </h3>
                    <Badge className="bg-blue-100 text-blue-800">
                      {transferData.type}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>
                        {(() => {
                          const parts = [];
                          if (adults > 0)
                            parts.push(
                              `${adults} adult${adults > 1 ? "s" : ""}`,
                            );
                          if (children > 0)
                            parts.push(
                              `${children} child${children > 1 ? "ren" : ""}`,
                            );
                          if (infants > 0)
                            parts.push(
                              `${infants} infant${infants > 1 ? "s" : ""}`,
                            );
                          return parts.length > 0
                            ? parts.join(" • ")
                            : `${totalPassengers} passenger${totalPassengers !== 1 ? "s" : ""}`;
                        })()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>{transferData.duration}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>{transferData.distance}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 space-y-3">
                {isRoundTrip && transferData.return && (
                  <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
                    <button
                      onClick={() => setActiveTab("outbound")}
                      className={cn(
                        "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                        activeTab === "outbound"
                          ? "bg-white text-blue-600 shadow-sm"
                          : "text-gray-500 hover:text-gray-700",
                      )}
                    >
                      Outbound
                    </button>
                    <button
                      onClick={() => setActiveTab("return")}
                      className={cn(
                        "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                        activeTab === "return"
                          ? "bg-white text-blue-600 shadow-sm"
                          : "text-gray-500 hover:text-gray-700",
                      )}
                    >
                      Return
                    </button>
                  </div>
                )}
                <div className="text-sm">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="font-medium">{transferData.duration}</span>
                  </div>
                  <div className="ml-5 space-y-1">
                    <div className="text-gray-900 font-medium">
                      {currentTransfer.pickupDate} at{" "}
                      {currentTransfer.pickupTime}
                    </div>
                    <div className="text-gray-600">{currentTransfer.from}</div>
                  </div>
                </div>

                <div className="text-sm">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  </div>
                  <div className="ml-5 space-y-1">
                    <div className="text-gray-900 font-medium">Drop-off</div>
                    <div className="text-gray-600">{currentTransfer.to}</div>
                  </div>
                </div>

                <div className="border-t pt-3 mt-3">
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">Vehicle</div>
                    <div className="text-gray-600">
                      {transferData.vehicleName}, {transferData.maxPassengers}{" "}
                      passengers
                    </div>
                    <div className="text-gray-500 text-xs">
                      By {transferData.provider}
                    </div>
                  </div>
                </div>

                <div className="border-t pt-3 mt-3">
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">Features</div>
                    <div className="text-gray-600">
                      {transferData.features.join(", ")}
                    </div>
                    <div className="text-gray-500 text-xs">
                      Professional service with meet & greet
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Guest Details Form */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Primary Guest Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <Select
                    value={formData.primaryGuest.title}
                    onValueChange={(value) =>
                      handleInputChange("primaryGuest", "title", value)
                    }
                  >
                    <SelectTrigger className="border-2 border-[#003580] focus-visible:ring-2 focus-visible:ring-[#003580] focus-visible:ring-offset-2">
                      <SelectValue placeholder="Select title" />
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <Input
                    value={formData.primaryGuest.firstName}
                    onChange={(e) =>
                      handleInputChange(
                        "primaryGuest",
                        "firstName",
                        e.target.value,
                      )
                    }
                    placeholder="Enter first name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <Input
                    value={formData.primaryGuest.lastName}
                    onChange={(e) =>
                      handleInputChange(
                        "primaryGuest",
                        "lastName",
                        e.target.value,
                      )
                    }
                    placeholder="Enter last name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <Input
                    type="email"
                    value={formData.primaryGuest.email}
                    onChange={(e) =>
                      handleInputChange("primaryGuest", "email", e.target.value)
                    }
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <div className="flex">
                    <Select
                      value={formData.primaryGuest.countryCode}
                      onValueChange={(value) =>
                        handleInputChange("primaryGuest", "countryCode", value)
                      }
                    >
                      <SelectTrigger className="w-32 border-2 border-[#003580] focus-visible:ring-2 focus-visible:ring-[#003580] focus-visible:ring-offset-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="+91">+91</SelectItem>
                        <SelectItem value="+1">+1</SelectItem>
                        <SelectItem value="+44">+44</SelectItem>
                        <SelectItem value="+971">+971</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      value={formData.primaryGuest.phone}
                      onChange={(e) =>
                        handleInputChange(
                          "primaryGuest",
                          "phone",
                          e.target.value,
                        )
                      }
                      placeholder="Enter phone number"
                      className="flex-1 ml-2"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Flight Details (Optional) */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Flight Details (Optional)
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Flight Number
                  </label>
                  <Input
                    value={formData.flightDetails.flightNumber}
                    onChange={(e) =>
                      handleInputChange(
                        "flightDetails",
                        "flightNumber",
                        e.target.value,
                      )
                    }
                    placeholder="e.g., AI101"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Arrival Time
                  </label>
                  <Input
                    type="time"
                    value={formData.flightDetails.arrivalTime}
                    onChange={(e) =>
                      handleInputChange(
                        "flightDetails",
                        "arrivalTime",
                        e.target.value,
                      )
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Airline
                  </label>
                  <Input
                    value={formData.flightDetails.airline}
                    onChange={(e) =>
                      handleInputChange(
                        "flightDetails",
                        "airline",
                        e.target.value,
                      )
                    }
                    placeholder="e.g., Air India"
                  />
                </div>
              </div>
            </div>

            {/* Special Requests */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Special Requests
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Information
                </label>
                <textarea
                  value={formData.specialRequests}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      specialRequests: e.target.value,
                    }))
                  }
                  placeholder="Any special requirements, child seats, wheelchair access, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                />
              </div>
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Booking Summary
              </h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Transfer Fare</span>
                  <span>₹{transferData.outbound.originalPrice}</span>
                </div>

                {bargainApplied && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount Applied</span>
                    <span>
                      -₹
                      {transferData.outbound.originalPrice -
                        transferData.outbound.price}
                    </span>
                  </div>
                )}

                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">
                      Total Amount
                    </span>
                    <span className="font-bold text-xl text-gray-900">
                      ₹{totalPrice}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">per transfer</div>
                </div>
              </div>

              {/* Book Now Button */}
              <Button
                onClick={handleBookTransfer}
                disabled={
                  isProcessing ||
                  !formData.primaryGuest.firstName ||
                  !formData.primaryGuest.lastName ||
                  !formData.primaryGuest.email ||
                  !formData.primaryGuest.phone
                }
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
              >
                {isProcessing ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Book Now - ��{totalPrice}
                  </>
                )}
              </Button>

              <p className="text-xs text-gray-500 mt-3 text-center">
                By booking, you agree to our Terms & Conditions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
