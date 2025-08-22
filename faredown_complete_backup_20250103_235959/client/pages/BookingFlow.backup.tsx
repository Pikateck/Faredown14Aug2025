import React, { useState, useEffect } from "react";
import {
  Link,
  useSearchParams,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle,
  Plane,
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  CreditCard,
  Shield,
  ArrowLeft,
  Gift,
  FileText,
  Building,
  Users,
  ChevronDown,
  Search,
  MapPin,
  Menu,
  X,
  Check,
  Info,
  Utensils,
  Luggage,
  Star,
  AlertCircle,
  Plus,
  Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Booking flow steps
const BOOKING_STEPS = [
  { id: "details", label: "Enter your details", icon: "1" },
  { id: "meals", label: "Meals", icon: "2" },
  { id: "seats", label: "Seats", icon: "3" },
  { id: "extras", label: "Extras", icon: "4" },
  { id: "review", label: "Review", icon: "5" },
  { id: "payment", label: "Payment", icon: "6" },
];

export default function BookingFlow() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState("details");
  const [selectedFlight, setSelectedFlight] = useState(
    location.state?.selectedFlight,
  );
  const [selectedFareType, setSelectedFareType] = useState(
    location.state?.selectedFareType,
  );
  const [negotiatedPrice, setNegotiatedPrice] = useState(
    location.state?.negotiatedPrice || selectedFareType?.price,
  );

  // Passenger details
  const [passengers, setPassengers] = useState([
    {
      id: 1,
      type: "adult",
      title: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      nationality: "",
      passportNumber: "",
      passportExpiry: "",
    },
  ]);

  // Contact details
  const [contactDetails, setContactDetails] = useState({
    email: "",
    phone: "",
    countryCode: "+91",
  });

  // Company GST details
  const [companyDetails, setCompanyDetails] = useState({
    companyName: "",
    gstNumber: "",
    address: "",
  });

  // Meal selections
  const [selectedMeals, setSelectedMeals] = useState({});
  const mealOptions = [
    {
      id: "none",
      name: "No preference",
      price: 0,
      description: "Standard meal service",
    },
    {
      id: "vegetarian",
      name: "Vegetarian",
      price: 15,
      description: "Fresh vegetarian meal",
    },
    { id: "vegan", name: "Vegan", price: 15, description: "Plant-based meal" },
    {
      id: "lactose-free",
      name: "Lactose-free",
      price: 20,
      description: "Dairy-free meal",
    },
    {
      id: "gluten-free",
      name: "Gluten-free",
      price: 20,
      description: "Gluten-free meal",
    },
    {
      id: "kosher",
      name: "Kosher",
      price: 25,
      description: "Kosher certified meal",
    },
    {
      id: "halal",
      name: "Halal",
      price: 25,
      description: "Halal certified meal",
    },
  ];

  // Seat selections
  const [selectedSeats, setSelectedSeats] = useState({});
  const [seatPrices, setSeatPrices] = useState({});

  // Generate seat map
  const generateSeatMap = (rows, seatsPerRow) => {
    const seatMap = [];
    const cols = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K"];

    for (let row = 1; row <= rows; row++) {
      const rowSeats = [];
      for (let col = 0; col < seatsPerRow; col++) {
        const seatNumber = `${row}${cols[col]}`;
        const isOccupied = Math.random() < 0.3; // 30% occupied
        const isExtra = col <= 1 || col >= seatsPerRow - 2; // Window and aisle
        const isPremium = row <= 5; // First 5 rows are premium

        rowSeats.push({
          number: seatNumber,
          available: !isOccupied,
          type: isPremium ? "premium" : isExtra ? "extra" : "standard",
          price: isPremium ? 50 : isExtra ? 25 : 0,
        });
      }
      seatMap.push(rowSeats);
    }
    return seatMap;
  };

  const [outboundSeats] = useState(generateSeatMap(30, 6));
  const [returnSeats] = useState(generateSeatMap(30, 6));

  // Baggage selections
  const [selectedBaggage, setSelectedBaggage] = useState({});
  const baggageOptions = [
    {
      id: "none",
      name: "No extra baggage",
      weight: "7kg carry-on included",
      price: 0,
    },
    { id: "checked-20", name: "20kg checked bag", weight: "20kg", price: 45 },
    { id: "checked-30", name: "30kg checked bag", weight: "30kg", price: 65 },
    {
      id: "extra-carry",
      name: "Extra carry-on",
      weight: "Additional 7kg carry-on",
      price: 25,
    },
  ];

  // Extras
  const [selectedExtras, setSelectedExtras] = useState({
    fastTrack: false,
    lounge: false,
    insurance: false,
    refundProtect: false,
    flexibleTicket: false,
  });

  const extrasOptions = [
    {
      id: "fastTrack",
      name: "Fast Track Security",
      description: "Skip the queues at airport security",
      price: 15,
      icon: "⚡",
    },
    {
      id: "lounge",
      name: "Airport Lounge Access",
      description: "Access to premium lounges with food and drinks",
      price: 45,
      icon: "🛋️",
    },
    {
      id: "insurance",
      name: "Travel Insurance",
      description: "Comprehensive travel protection",
      price: 25,
      icon: "🛡️",
    },
    {
      id: "refundProtect",
      name: "Refund Protection",
      description: "Get refund for any reason up to 24 hours before departure",
      price: 35,
      icon: "💰",
    },
    {
      id: "flexibleTicket",
      name: "Flexible Ticket",
      description: "Change your flight dates without fees",
      price: 55,
      icon: "📅",
    },
  ];

  // Currency conversion (same as FlightResults)
  const [selectedCurrency, setSelectedCurrency] = useState({
    code: "INR",
    symbol: "₹",
    name: "Indian Rupee",
  });

  const exchangeRates = {
    USD: 0.012,
    EUR: 0.011,
    GBP: 0.0095,
    INR: 1,
    AED: 0.044,
    SAR: 0.045,
    JPY: 1.8,
    CNY: 0.087,
    KRW: 16.2,
    SGD: 0.016,
    AUD: 0.018,
    CAD: 0.017,
    CHF: 0.011,
    THB: 0.42,
    MYR: 0.056,
  };

  const convertPrice = (priceInINR) => {
    const rate = exchangeRates[selectedCurrency.code] || 1;
    return Math.round(priceInINR * rate);
  };

  const formatPrice = (priceInINR) => {
    const convertedPrice = convertPrice(priceInINR);
    return `${selectedCurrency.symbol}${convertedPrice.toLocaleString()}`;
  };

  // Calculate total price
  const calculateTotal = () => {
    let total = negotiatedPrice || selectedFareType?.price || 32168;

    // Add meal costs
    Object.values(selectedMeals).forEach((mealId) => {
      const meal = mealOptions.find((m) => m.id === mealId);
      if (meal) total += meal.price;
    });

    // Add seat costs
    Object.values(seatPrices).forEach((price) => {
      total += price;
    });

    // Add baggage costs
    Object.values(selectedBaggage).forEach((baggageId) => {
      const baggage = baggageOptions.find((b) => b.id === baggageId);
      if (baggage) total += baggage.price;
    });

    // Add extras costs
    Object.entries(selectedExtras).forEach(([key, selected]) => {
      if (selected) {
        const extra = extrasOptions.find((e) => e.id === key);
        if (extra) total += extra.price;
      }
    });

    return total;
  };

  const handleSeatSelect = (flight, seatNumber, price) => {
    setSelectedSeats((prev) => ({
      ...prev,
      [flight]: seatNumber,
    }));
    setSeatPrices((prev) => ({
      ...prev,
      [flight]: price,
    }));
  };

  const nextStep = () => {
    const currentIndex = BOOKING_STEPS.findIndex(
      (step) => step.id === currentStep,
    );
    if (currentIndex < BOOKING_STEPS.length - 1) {
      setCurrentStep(BOOKING_STEPS[currentIndex + 1].id);
    }
  };

  const prevStep = () => {
    const currentIndex = BOOKING_STEPS.findIndex(
      (step) => step.id === currentStep,
    );
    if (currentIndex > 0) {
      setCurrentStep(BOOKING_STEPS[currentIndex - 1].id);
    }
  };

  const renderStepIndicator = () => (
    <div className="bg-blue-600 text-white py-4">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between">
          {BOOKING_STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                  currentStep === step.id
                    ? "bg-white text-blue-600"
                    : BOOKING_STEPS.findIndex((s) => s.id === currentStep) >
                        index
                      ? "bg-green-500 text-white"
                      : "bg-blue-500 text-white border-2 border-white",
                )}
              >
                {BOOKING_STEPS.findIndex((s) => s.id === currentStep) >
                index ? (
                  <Check className="w-4 h-4" />
                ) : (
                  step.icon
                )}
              </div>
              <span className="ml-2 text-sm font-medium hidden md:block">
                {step.label}
              </span>
              {index < BOOKING_STEPS.length - 1 && (
                <div className="w-8 h-px bg-white/30 mx-4 hidden md:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPriceBreakdown = () => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 sticky top-4">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Price details</h3>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Flight</span>
          <span>
            {formatPrice(negotiatedPrice || selectedFareType?.price || 32168)}
          </span>
        </div>

        {Object.entries(selectedMeals).map(([passengerId, mealId]) => {
          const meal = mealOptions.find((m) => m.id === mealId);
          const passenger = passengers.find(
            (p) => p.id === parseInt(passengerId),
          );
          if (meal && meal.price > 0) {
            return (
              <div key={passengerId} className="flex justify-between">
                <span>
                  Meal - {passenger?.firstName || "Passenger"} ({meal.name})
                </span>
                <span>{formatPrice(meal.price)}</span>
              </div>
            );
          }
          return null;
        })}

        {Object.entries(selectedSeats).map(([flight, seat]) => {
          const price = seatPrices[flight] || 0;
          const flightLabel =
            flight === "outbound" ? "Mumbai → Dubai" : "Dubai → Mumbai";
          return (
            <div key={flight} className="flex justify-between">
              <span>
                Seat {seat} ({flightLabel})
              </span>
              <span>{price > 0 ? formatPrice(price) : "Free"}</span>
            </div>
          );
        })}

        {Object.entries(selectedBaggage).map(([passengerId, baggageId]) => {
          const baggage = baggageOptions.find((b) => b.id === baggageId);
          if (baggage && baggage.price > 0) {
            return (
              <div key={passengerId} className="flex justify-between">
                <span>{baggage.name}</span>
                <span>{formatPrice(baggage.price)}</span>
              </div>
            );
          }
          return null;
        })}

        {Object.entries(selectedExtras).map(([key, selected]) => {
          if (selected) {
            const extra = extrasOptions.find((e) => e.id === key);
            if (extra) {
              return (
                <div key={key} className="flex justify-between">
                  <span>{extra.name}</span>
                  <span>{formatPrice(extra.price)}</span>
                </div>
              );
            }
          }
          return null;
        })}

        <hr className="my-3" />
        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>{formatPrice(calculateTotal())}</span>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-2">Includes taxes and fees</p>
    </div>
  );

  const renderFlightDetails = () => (
    <Card className="p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Flight Details</h3>
        <div className="text-sm text-gray-600">Emirates Airlines</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Outbound Flight */}
        <div className="flex items-center space-x-4">
          <div className="bg-blue-100 p-3 rounded-lg">
            <Plane className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <div className="font-semibold text-gray-900">Mumbai → Dubai</div>
            <div className="text-sm text-gray-600">
              Sat, Aug 3 • 10:15 - 13:45
            </div>
            <div className="text-sm text-gray-500">
              EK 508 • 3h 30m • Direct
            </div>
          </div>
        </div>

        {/* Return Flight */}
        <div className="flex items-center space-x-4">
          <div className="bg-blue-100 p-3 rounded-lg">
            <Plane className="w-6 h-6 text-blue-600 transform rotate-180" />
          </div>
          <div>
            <div className="font-semibold text-gray-900">Dubai → Mumbai</div>
            <div className="text-sm text-gray-600">
              Sat, Aug 10 • 15:20 - 20:00
            </div>
            <div className="text-sm text-gray-500">
              EK 509 • 4h 40m • Direct
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center">
          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
          <span className="text-sm font-medium text-green-800">
            Flight Price Locked:{" "}
            {formatPrice(negotiatedPrice || selectedFareType?.price || 32168)}
          </span>
        </div>
      </div>
    </Card>
  );

  const renderDetails = () => (
    <div className="space-y-6">
      {/* Flight Details Section */}
      {renderFlightDetails()}

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Enter your details
        </h2>
        <p className="text-gray-600 mb-6">
          Add traveler details and review baggage options
        </p>
      </div>

      {passengers.map((passenger, index) => (
        <Card key={passenger.id} className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <User className="w-5 h-5 text-gray-600 mr-2" />
              <h4 className="text-lg font-semibold">Adult {index + 1}</h4>
              {passenger.firstName && passenger.lastName && (
                <CheckCircle className="w-5 h-5 text-green-600 ml-2" />
              )}
            </div>
            {passengers.length >= 2 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setPassengers((prev) =>
                    prev.filter((p) => p.id !== passenger.id),
                  );
                }}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Minus className="w-4 h-4 mr-1" />
                Remove
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First name *
              </label>
              <Input
                value={passenger.firstName}
                onChange={(e) =>
                  setPassengers((prev) =>
                    prev.map((p) =>
                      p.id === passenger.id
                        ? { ...p, firstName: e.target.value }
                        : p,
                    ),
                  )
                }
                placeholder="Zubin"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last name *
              </label>
              <Input
                value={passenger.lastName}
                onChange={(e) =>
                  setPassengers((prev) =>
                    prev.map((p) =>
                      p.id === passenger.id
                        ? { ...p, lastName: e.target.value }
                        : p,
                    ),
                  )
                }
                placeholder="Aibara"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <Select
                value={passenger.title}
                onValueChange={(value) =>
                  setPassengers((prev) =>
                    prev.map((p) =>
                      p.id === passenger.id ? { ...p, title: value } : p,
                    ),
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Passport Details */}
          <div className="mt-6">
            <h5 className="text-md font-semibold text-gray-900 mb-3">
              Passport Details
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Passport Number
                </label>
                <Input
                  value={passenger.passportNumber}
                  onChange={(e) =>
                    setPassengers((prev) =>
                      prev.map((p) =>
                        p.id === passenger.id
                          ? { ...p, passportNumber: e.target.value }
                          : p,
                      ),
                    )
                  }
                  placeholder="A1234567"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Passport Expiry Date
                </label>
                <Input
                  type="date"
                  value={passenger.passportExpiry}
                  onChange={(e) =>
                    setPassengers((prev) =>
                      prev.map((p) =>
                        p.id === passenger.id
                          ? { ...p, passportExpiry: e.target.value }
                          : p,
                      ),
                    )
                  }
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                <Input
                  type="date"
                  value={passenger.dateOfBirth}
                  onChange={(e) =>
                    setPassengers((prev) =>
                      prev.map((p) =>
                        p.id === passenger.id
                          ? { ...p, dateOfBirth: e.target.value }
                          : p,
                      ),
                    )
                  }
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nationality
                </label>
                <Select
                  value={passenger.nationality}
                  onValueChange={(value) =>
                    setPassengers((prev) =>
                      prev.map((p) =>
                        p.id === passenger.id
                          ? { ...p, nationality: value }
                          : p,
                      ),
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select nationality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="indian">Indian</SelectItem>
                    <SelectItem value="american">American</SelectItem>
                    <SelectItem value="british">British</SelectItem>
                    <SelectItem value="canadian">Canadian</SelectItem>
                    <SelectItem value="australian">Australian</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Luggage className="w-4 h-4" />
              <span>Personal item</span>
              <span className="text-gray-400">•</span>
              <span>1 carry-on bag</span>
              <span className="text-gray-400">•</span>
              <span>23 kg checked bag</span>
            </div>
          </div>
        </Card>
      ))}

      {/* Add Traveller Button */}
      <div className="flex justify-center">
        <Button
          onClick={() => {
            const newPassenger = {
              id: passengers.length + 1,
              type: "adult",
              title: "",
              firstName: "",
              lastName: "",
              email: "",
              phone: "",
              dateOfBirth: "",
              nationality: "",
              passportNumber: "",
              passportExpiry: "",
            };
            setPassengers((prev) => [...prev, newPassenger]);
          }}
          variant="outline"
          className="text-blue-600 border-blue-600 hover:bg-blue-50"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add a traveller
        </Button>
      </div>

      {/* Company GST Details */}
      <Card className="p-6">
        <h4 className="text-lg font-semibold mb-4">
          Company GST Details (Optional)
        </h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name
            </label>
            <Input
              value={companyDetails.companyName}
              onChange={(e) =>
                setCompanyDetails((prev) => ({
                  ...prev,
                  companyName: e.target.value,
                }))
              }
              placeholder="Enter company name"
              className="w-full"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GST Number
              </label>
              <Input
                value={companyDetails.gstNumber}
                onChange={(e) =>
                  setCompanyDetails((prev) => ({
                    ...prev,
                    gstNumber: e.target.value,
                  }))
                }
                placeholder="22AAAAA0000A1Z5"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Address
              </label>
              <Input
                value={companyDetails.address}
                onChange={(e) =>
                  setCompanyDetails((prev) => ({
                    ...prev,
                    address: e.target.value,
                  }))
                }
                placeholder="Enter company address"
                className="w-full"
              />
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h4 className="text-lg font-semibold mb-4">Contact details</h4>
        <p className="text-sm text-gray-600 mb-4">* Required</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact email *
            </label>
            <Input
              type="email"
              value={contactDetails.email}
              onChange={(e) =>
                setContactDetails((prev) => ({
                  ...prev,
                  email: e.target.value,
                }))
              }
              placeholder="zubin@faredown.com"
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              We'll send your flight confirmation here
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone number *
            </label>
            <div className="flex">
              <Select
                value={contactDetails.countryCode}
                onValueChange={(value) =>
                  setContactDetails((prev) => ({
                    ...prev,
                    countryCode: value,
                  }))
                }
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="+91">+91</SelectItem>
                  <SelectItem value="+1">+1</SelectItem>
                  <SelectItem value="+971">+971</SelectItem>
                </SelectContent>
              </Select>
              <Input
                value={contactDetails.phone}
                onChange={(e) =>
                  setContactDetails((prev) => ({
                    ...prev,
                    phone: e.target.value,
                  }))
                }
                placeholder="9999443311"
                className="flex-1 ml-2"
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderMeals = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Meal choice</h2>
        <p className="text-gray-600 mb-6">Request dietary preferences</p>
      </div>

      {passengers.map((passenger, index) => (
        <Card key={passenger.id} className="p-6">
          <h4 className="text-lg font-semibold mb-4">
            {passenger.firstName || `Adult ${index + 1}`}
          </h4>

          <Select
            value={selectedMeals[passenger.id] || "none"}
            onValueChange={(value) =>
              setSelectedMeals((prev) => ({
                ...prev,
                [passenger.id]: value,
              }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {mealOptions.map((meal) => (
                <SelectItem key={meal.id} value={meal.id}>
                  <div className="flex justify-between items-center w-full">
                    <div>
                      <div className="font-medium">{meal.name}</div>
                      <div className="text-sm text-gray-500">
                        {meal.description}
                      </div>
                    </div>
                    {meal.price > 0 && (
                      <span className="ml-4 font-medium">
                        {formatPrice(meal.price)}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Card>
      ))}
    </div>
  );

  const renderSeats = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Seats</h2>
      </div>

      {/* Outbound Flight */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-lg font-semibold">Mumbai - Dubai</h4>
            <p className="text-sm text-gray-600">3h 30m • Emirates Airlines</p>
          </div>
          <Info className="w-5 h-5 text-gray-400" />
        </div>

        {passengers.map((passenger, index) => (
          <div key={passenger.id} className="mb-6">
            <h5 className="font-medium mb-3">
              {passenger.firstName || `Adult ${index + 1}`}
              {selectedSeats.outbound && (
                <span className="ml-2 text-sm text-blue-600">
                  Seat {selectedSeats.outbound} selected
                </span>
              )}
            </h5>

            {/* Seat Legend */}
            <div className="flex items-center space-x-6 mb-4 text-sm">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-600 rounded mr-2"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gray-300 rounded mr-2"></div>
                <span>Premium seat (+{formatPrice(50)})</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-400 rounded mr-2"></div>
                <span>Extra legroom (+{formatPrice(25)})</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-400 rounded mr-2"></div>
                <span>Selected</span>
              </div>
              <div className="flex items-center">
                <X className="w-4 h-4 text-gray-400 mr-2" />
                <span>Unavailable</span>
              </div>
            </div>

            {/* Seat Map */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div
                className="grid gap-1"
                style={{ gridTemplateColumns: "repeat(8, 1fr)" }}
              >
                {/* Header row */}
                <div></div>
                {["A", "B", "C", "", "D", "E", "F"].map((letter, i) => (
                  <div
                    key={i}
                    className="text-center text-sm font-medium text-gray-600 py-2"
                  >
                    {letter}
                  </div>
                ))}

                {outboundSeats.slice(0, 20).map((row, rowIndex) => (
                  <React.Fragment key={rowIndex}>
                    <div className="text-center text-sm font-medium text-gray-600 py-2">
                      {rowIndex + 1}
                    </div>
                    {row.slice(0, 6).map((seat, seatIndex) => {
                      if (seatIndex === 3) {
                        return (
                          <React.Fragment key={`${seat.number}-gap`}>
                            <button
                              key={seat.number}
                              onClick={() =>
                                seat.available
                                  ? handleSeatSelect(
                                      "outbound",
                                      seat.number,
                                      seat.price,
                                    )
                                  : null
                              }
                              className={cn(
                                "w-8 h-8 rounded text-xs font-medium border",
                                selectedSeats.outbound === seat.number
                                  ? "bg-red-400 text-white border-red-500"
                                  : !seat.available
                                    ? "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed"
                                    : seat.type === "premium"
                                      ? "bg-gray-300 text-gray-700 border-gray-400 hover:bg-gray-400"
                                      : seat.type === "extra"
                                        ? "bg-yellow-400 text-gray-700 border-yellow-500 hover:bg-yellow-500"
                                        : "bg-blue-600 text-white border-blue-700 hover:bg-blue-700",
                              )}
                              disabled={!seat.available}
                            >
                              {seat.available ? (
                                seat.price > 0 ? (
                                  seat.price
                                ) : (
                                  ""
                                )
                              ) : (
                                <X className="w-3 h-3" />
                              )}
                            </button>
                            <div></div>
                          </React.Fragment>
                        );
                      }
                      return (
                        <button
                          key={seat.number}
                          onClick={() =>
                            seat.available
                              ? handleSeatSelect(
                                  "outbound",
                                  seat.number,
                                  seat.price,
                                )
                              : null
                          }
                          className={cn(
                            "w-8 h-8 rounded text-xs font-medium border",
                            selectedSeats.outbound === seat.number
                              ? "bg-red-400 text-white border-red-500"
                              : !seat.available
                                ? "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed"
                                : seat.type === "premium"
                                  ? "bg-gray-300 text-gray-700 border-gray-400 hover:bg-gray-400"
                                  : seat.type === "extra"
                                    ? "bg-yellow-400 text-gray-700 border-yellow-500 hover:bg-yellow-500"
                                    : "bg-blue-600 text-white border-blue-700 hover:bg-blue-700",
                          )}
                          disabled={!seat.available}
                        >
                          {seat.available ? (
                            seat.price > 0 ? (
                              seat.price
                            ) : (
                              ""
                            )
                          ) : (
                            <X className="w-3 h-3" />
                          )}
                        </button>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        ))}
      </Card>

      {/* Return Flight */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-lg font-semibold">Dubai - Mumbai</h4>
            <p className="text-sm text-gray-600">4h 40m • Emirates Airlines</p>
          </div>
          <Info className="w-5 h-5 text-gray-400" />
        </div>

        {passengers.map((passenger, index) => (
          <div key={passenger.id} className="mb-6">
            <h5 className="font-medium mb-3">
              {passenger.firstName || `Adult ${index + 1}`}
              {selectedSeats.return && (
                <span className="ml-2 text-sm text-blue-600">
                  Seat {selectedSeats.return} selected
                </span>
              )}
            </h5>

            {/* Seat Legend */}
            <div className="flex items-center space-x-6 mb-4 text-sm">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-600 rounded mr-2"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gray-300 rounded mr-2"></div>
                <span>Premium seat (+{formatPrice(50)})</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-400 rounded mr-2"></div>
                <span>Extra legroom (+{formatPrice(25)})</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-400 rounded mr-2"></div>
                <span>Selected</span>
              </div>
              <div className="flex items-center">
                <X className="w-4 h-4 text-gray-400 mr-2" />
                <span>Unavailable</span>
              </div>
            </div>

            {/* Seat Map */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div
                className="grid gap-1"
                style={{ gridTemplateColumns: "repeat(8, 1fr)" }}
              >
                {/* Header row */}
                <div></div>
                {["A", "B", "C", "", "D", "E", "F"].map((letter, i) => (
                  <div
                    key={i}
                    className="text-center text-sm font-medium text-gray-600 py-2"
                  >
                    {letter}
                  </div>
                ))}

                {returnSeats.slice(0, 20).map((row, rowIndex) => (
                  <React.Fragment key={rowIndex}>
                    <div className="text-center text-sm font-medium text-gray-600 py-2">
                      {rowIndex + 1}
                    </div>
                    {row.slice(0, 6).map((seat, seatIndex) => {
                      if (seatIndex === 3) {
                        return (
                          <React.Fragment key={`${seat.number}-gap`}>
                            <button
                              key={seat.number}
                              onClick={() =>
                                seat.available
                                  ? handleSeatSelect(
                                      "return",
                                      seat.number,
                                      seat.price,
                                    )
                                  : null
                              }
                              className={cn(
                                "w-8 h-8 rounded text-xs font-medium border",
                                selectedSeats.return === seat.number
                                  ? "bg-red-400 text-white border-red-500"
                                  : !seat.available
                                    ? "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed"
                                    : seat.type === "premium"
                                      ? "bg-gray-300 text-gray-700 border-gray-400 hover:bg-gray-400"
                                      : seat.type === "extra"
                                        ? "bg-yellow-400 text-gray-700 border-yellow-500 hover:bg-yellow-500"
                                        : "bg-blue-600 text-white border-blue-700 hover:bg-blue-700",
                              )}
                              disabled={!seat.available}
                            >
                              {seat.available ? (
                                seat.price > 0 ? (
                                  seat.price
                                ) : (
                                  ""
                                )
                              ) : (
                                <X className="w-3 h-3" />
                              )}
                            </button>
                            <div></div>
                          </React.Fragment>
                        );
                      }
                      return (
                        <button
                          key={seat.number}
                          onClick={() =>
                            seat.available
                              ? handleSeatSelect(
                                  "return",
                                  seat.number,
                                  seat.price,
                                )
                              : null
                          }
                          className={cn(
                            "w-8 h-8 rounded text-xs font-medium border",
                            selectedSeats.return === seat.number
                              ? "bg-red-400 text-white border-red-500"
                              : !seat.available
                                ? "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed"
                                : seat.type === "premium"
                                  ? "bg-gray-300 text-gray-700 border-gray-400 hover:bg-gray-400"
                                  : seat.type === "extra"
                                    ? "bg-yellow-400 text-gray-700 border-yellow-500 hover:bg-yellow-500"
                                    : "bg-blue-600 text-white border-blue-700 hover:bg-blue-700",
                          )}
                          disabled={!seat.available}
                        >
                          {seat.available ? (
                            seat.price > 0 ? (
                              seat.price
                            ) : (
                              ""
                            )
                          ) : (
                            <X className="w-3 h-3" />
                          )}
                        </button>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );

  const renderExtras = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Extras</h2>
      </div>

      {/* Baggage */}
      <Card className="p-6">
        <h4 className="text-lg font-semibold mb-4">Baggage</h4>
        {passengers.map((passenger, index) => (
          <div key={passenger.id} className="mb-6">
            <h5 className="font-medium mb-3">
              {passenger.firstName || `Adult ${index + 1}`}
            </h5>
            <div className="space-y-3">
              {baggageOptions.map((option) => (
                <label
                  key={option.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name={`baggage-${passenger.id}`}
                      value={option.id}
                      checked={selectedBaggage[passenger.id] === option.id}
                      onChange={(e) =>
                        setSelectedBaggage((prev) => ({
                          ...prev,
                          [passenger.id]: e.target.value,
                        }))
                      }
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium">{option.name}</div>
                      <div className="text-sm text-gray-500">
                        {option.weight}
                      </div>
                    </div>
                  </div>
                  {option.price > 0 && (
                    <span className="font-medium">
                      {formatPrice(option.price)}
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>
        ))}
      </Card>

      {/* Travel Extras */}
      <Card className="p-6">
        <h4 className="text-lg font-semibold mb-4">Travel Extras</h4>
        <div className="space-y-4">
          {extrasOptions.map((extra) => (
            <label
              key={extra.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
            >
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedExtras[extra.id]}
                  onChange={(e) =>
                    setSelectedExtras((prev) => ({
                      ...prev,
                      [extra.id]: e.target.checked,
                    }))
                  }
                  className="mr-4"
                />
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{extra.icon}</span>
                  <div>
                    <div className="font-medium">{extra.name}</div>
                    <div className="text-sm text-gray-500">
                      {extra.description}
                    </div>
                  </div>
                </div>
              </div>
              <span className="font-medium">{formatPrice(extra.price)}</span>
            </label>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderReview = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Review your booking
        </h2>
        <p className="text-gray-600 mb-6">
          Please review all details before proceeding to payment
        </p>
      </div>

      {/* Flight Details Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Flight Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Plane className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">Mumbai → Dubai</div>
              <div className="text-sm text-gray-600">
                Sat, Aug 3 • 10:15 - 13:45
              </div>
              <div className="text-sm text-gray-500">
                EK 508 • 3h 30m • Direct
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Plane className="w-6 h-6 text-blue-600 transform rotate-180" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">Dubai → Mumbai</div>
              <div className="text-sm text-gray-600">
                Sat, Aug 10 • 15:20 - 20:00
              </div>
              <div className="text-sm text-gray-500">
                EK 509 • 4h 40m • Direct
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
              <span className="text-sm font-medium text-green-800">
                Flight Price Locked
              </span>
            </div>
            <span className="font-semibold text-green-800">
              {formatPrice(negotiatedPrice || selectedFareType?.price || 32168)}
            </span>
          </div>
        </div>
      </Card>

      {/* Passenger Details Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Passenger Details
        </h3>
        <div className="space-y-4">
          {passengers.map((passenger, index) => (
            <div
              key={passenger.id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-center mb-3">
                <User className="w-5 h-5 text-gray-600 mr-2" />
                <h4 className="font-semibold">Adult {index + 1}</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <div className="font-medium">
                    {passenger.firstName} {passenger.lastName} (
                    {passenger.title})
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Date of Birth:</span>
                  <div className="font-medium">
                    {passenger.dateOfBirth || "Not provided"}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Nationality:</span>
                  <div className="font-medium capitalize">
                    {passenger.nationality || "Not provided"}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Passport Number:</span>
                  <div className="font-medium">
                    {passenger.passportNumber || "Not provided"}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Passport Expiry:</span>
                  <div className="font-medium">
                    {passenger.passportExpiry || "Not provided"}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Contact Details Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Contact Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <Mail className="w-5 h-5 text-gray-600" />
            <div>
              <span className="text-gray-600 text-sm">Email:</span>
              <div className="font-medium">
                {contactDetails.email || "Not provided"}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Phone className="w-5 h-5 text-gray-600" />
            <div>
              <span className="text-gray-600 text-sm">Phone:</span>
              <div className="font-medium">
                {contactDetails.phone
                  ? `${contactDetails.countryCode} ${contactDetails.phone}`
                  : "Not provided"}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Company GST Details Summary */}
      {(companyDetails.companyName ||
        companyDetails.gstNumber ||
        companyDetails.address) && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Company GST Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Company Name:</span>
              <div className="font-medium">
                {companyDetails.companyName || "Not provided"}
              </div>
            </div>
            <div>
              <span className="text-gray-600">GST Number:</span>
              <div className="font-medium">
                {companyDetails.gstNumber || "Not provided"}
              </div>
            </div>
            <div className="md:col-span-2">
              <span className="text-gray-600">Address:</span>
              <div className="font-medium">
                {companyDetails.address || "Not provided"}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Meal Selection Summary */}
      {Object.keys(selectedMeals).length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Meal Preferences
          </h3>
          <div className="space-y-3">
            {passengers.map((passenger, index) => {
              const mealId = selectedMeals[passenger.id];
              const meal = mealOptions.find((m) => m.id === mealId);
              if (meal) {
                return (
                  <div
                    key={passenger.id}
                    className="flex items-center justify-between border border-gray-200 rounded-lg p-3"
                  >
                    <div className="flex items-center space-x-3">
                      <Utensils className="w-4 h-4 text-gray-600" />
                      <div>
                        <div className="font-medium">
                          {passenger.firstName || `Adult ${index + 1}`}
                        </div>
                        <div className="text-sm text-gray-600">
                          {meal.name} - {meal.description}
                        </div>
                      </div>
                    </div>
                    {meal.price > 0 && (
                      <span className="font-medium">
                        {formatPrice(meal.price)}
                      </span>
                    )}
                  </div>
                );
              }
              return null;
            })}
          </div>
        </Card>
      )}

      {/* Seat Selection Summary */}
      {Object.keys(selectedSeats).length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Seat Selection
          </h3>
          <div className="space-y-3">
            {Object.entries(selectedSeats).map(([flight, seat]) => {
              const price = seatPrices[flight] || 0;
              return (
                <div
                  key={flight}
                  className="flex items-center justify-between border border-gray-200 rounded-lg p-3"
                >
                  <div className="flex items-center space-x-3">
                    <svg
                      className="w-4 h-4 text-gray-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                    </svg>
                    <div>
                      <div className="font-medium">
                        {flight === "outbound"
                          ? "Mumbai → Dubai"
                          : "Dubai → Mumbai"}
                      </div>
                      <div className="text-sm text-gray-600">Seat {seat}</div>
                    </div>
                  </div>
                  {price > 0 && (
                    <span className="font-medium">{formatPrice(price)}</span>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Baggage Selection Summary */}
      {Object.keys(selectedBaggage).length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Baggage Selection
          </h3>
          <div className="space-y-3">
            {passengers.map((passenger, index) => {
              const baggageId = selectedBaggage[passenger.id];
              const baggage = baggageOptions.find((b) => b.id === baggageId);
              if (baggage) {
                return (
                  <div
                    key={passenger.id}
                    className="flex items-center justify-between border border-gray-200 rounded-lg p-3"
                  >
                    <div className="flex items-center space-x-3">
                      <Luggage className="w-4 h-4 text-gray-600" />
                      <div>
                        <div className="font-medium">
                          {passenger.firstName || `Adult ${index + 1}`}
                        </div>
                        <div className="text-sm text-gray-600">
                          {baggage.name} - {baggage.weight}
                        </div>
                      </div>
                    </div>
                    {baggage.price > 0 && (
                      <span className="font-medium">
                        {formatPrice(baggage.price)}
                      </span>
                    )}
                  </div>
                );
              }
              return null;
            })}
          </div>
        </Card>
      )}

      {/* Extras Summary */}
      {Object.entries(selectedExtras).some(([key, selected]) => selected) && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Travel Extras
          </h3>
          <div className="space-y-3">
            {Object.entries(selectedExtras).map(([key, selected]) => {
              if (selected) {
                const extra = extrasOptions.find((e) => e.id === key);
                if (extra) {
                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between border border-gray-200 rounded-lg p-3"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{extra.icon}</span>
                        <div>
                          <div className="font-medium">{extra.name}</div>
                          <div className="text-sm text-gray-600">
                            {extra.description}
                          </div>
                        </div>
                      </div>
                      <span className="font-medium">
                        {formatPrice(extra.price)}
                      </span>
                    </div>
                  );
                }
              }
              return null;
            })}
          </div>
        </Card>
      )}

      {/* Total Summary */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Total Amount
            </h3>
            <p className="text-sm text-gray-600">Includes taxes and fees</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {formatPrice(calculateTotal())}
            </div>
          </div>
        </div>
      </Card>

      {/* Terms and Conditions */}
      <Card className="p-6">
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="terms"
            className="mt-1"
            defaultChecked={false}
          />
          <label htmlFor="terms" className="text-sm text-gray-600">
            I have read and agree to the{" "}
            <button className="text-blue-600 underline">
              Terms and Conditions
            </button>
            ,{" "}
            <button className="text-blue-600 underline">Privacy Policy</button>,
            and{" "}
            <button className="text-blue-600 underline">
              Cancellation Policy
            </button>
            . I understand that this booking is subject to availability and
            confirmation.
          </label>
        </div>
      </Card>
    </div>
  );

  const renderPayment = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment</h2>
      </div>

      <Card className="p-6">
        <h4 className="text-lg font-semibold mb-4">Payment Method</h4>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <button className="p-4 border-2 border-blue-600 rounded-lg bg-blue-50">
            <CreditCard className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <span className="text-sm font-medium">Card</span>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <Building className="w-8 h-8 mx-auto mb-2 text-gray-600" />
            <span className="text-sm font-medium">Banking</span>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <Phone className="w-8 h-8 mx-auto mb-2 text-gray-600" />
            <span className="text-sm font-medium">Digital Wallet</span>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <Gift className="w-8 h-8 mx-auto mb-2 text-gray-600" />
            <span className="text-sm font-medium">Gift Card</span>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Card number
            </label>
            <Input placeholder="1234 5678 9012 3456" className="w-full" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiry date
              </label>
              <Input placeholder="MM/YY" className="w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CVV
              </label>
              <Input placeholder="123" className="w-full" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cardholder name
            </label>
            <Input placeholder="Zubin Aibara" className="w-full" />
          </div>
        </div>

        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <Shield className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-sm font-medium text-green-800">
              Secure Booking
            </span>
          </div>
          <p className="text-sm text-green-700 mt-1">
            Your payment information is encrypted and secure. This booking is
            protected by Faredown's secure booking guarantee.
          </p>
        </div>
      </Card>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "details":
        return renderDetails();
      case "meals":
        return renderMeals();
      case "seats":
        return renderSeats();
      case "extras":
        return renderExtras();
      case "review":
        return renderReview();
      case "payment":
        return renderPayment();
      default:
        return renderDetails();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header Container */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link
                to="/flights"
                className="flex items-center text-blue-600 hover:text-blue-700"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                <div className="w-6 h-6 bg-[#febb02] rounded-lg flex items-center justify-center mr-1">
                  <Plane className="w-3 h-3 text-[#003580]" />
                </div>
                <span className="font-medium">faredown.com</span>
              </Link>
              <div className="text-sm text-gray-600">
                Booking • 1 traveler • Sat, Aug 3 - Sat, Aug 10
              </div>
            </div>
          </div>
        </div>

        {/* Step Indicator */}
        {renderStepIndicator()}
      </div>

      {/* Spacer to account for fixed header */}
      <div className="h-32"></div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">{renderCurrentStep()}</div>

          {/* Price Breakdown */}
          <div className="lg:col-span-1">{renderPriceBreakdown()}</div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === "details"}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="flex space-x-3">
            {currentStep !== "details" &&
              currentStep !== "review" &&
              currentStep !== "payment" && (
                <Button
                  variant="outline"
                  onClick={nextStep}
                  className="text-gray-600 border-gray-300 hover:bg-gray-50"
                >
                  Skip
                </Button>
              )}

            {currentStep === "payment" ? (
              <Button
                className="bg-green-600 hover:bg-green-700 text-white px-8"
                onClick={() => alert("Booking completed!")}
              >
                Complete Booking - {formatPrice(calculateTotal())}
              </Button>
            ) : currentStep === "review" ? (
              <Button
                onClick={nextStep}
                className="bg-green-600 hover:bg-green-700 text-white px-8"
              >
                Proceed to Payment
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
