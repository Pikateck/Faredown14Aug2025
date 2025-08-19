import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
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
  formatDateToDDMMMYYYY,
  formatDateToDisplayString,
  convertToInputDate,
} from "@/lib/dateUtils";
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
  Award,
  Settings,
  Heart,
  LogOut,
  BookOpen,
  X,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Flight data matching FlightResults.tsx
const flightData = [
  {
    id: 1,
    departureTime: "10:15",
    arrivalTime: "11:45",
    departureCode: "BOM",
    arrivalCode: "DXB",
    duration: "3h 30m",
    date: "09-Aug-2024",
    returnDepartureTime: "13:00",
    returnArrivalTime: "17:40",
    returnDate: "16-Aug-2024",
    returnDuration: "4h 10m",
    airline: "Emirates Airlines",
    logo: "EK",
    aircraft: "Boeing 777",
    flightType: "Direct",
    amenities: ["WiFi", "Meals", "Entertainment", "Extra Legroom"],
    fareTypes: [
      {
        name: "Eco Saver",
        price: 32189,
        baggage: "7kg",
        features: ["Seat selection for fee"],
      },
      {
        name: "Eco Flex",
        price: 35690,
        baggage: "23kg",
        features: ["Free seat selection", "Free changes"],
      },
      {
        name: "Eco Regular",
        price: 38200,
        baggage: "30kg",
        features: ["Premium seat selection", "Priority boarding"],
      },
    ],
  },
  {
    id: 2,
    departureTime: "03:00",
    arrivalTime: "06:00",
    departureCode: "BOM",
    arrivalCode: "DXB",
    duration: "3h 30m",
    date: "09-Aug-2024",
    returnDepartureTime: "14:25",
    returnArrivalTime: "18:45",
    returnDate: "16-Aug-2024",
    returnDuration: "4h 50m",
    airline: "Emirates Airlines",
    logo: "EK",
    aircraft: "Airbus A380",
    flightType: "Direct",
    amenities: ["WiFi", "Meals", "Entertainment", "Extra Legroom"],
    fareTypes: [
      {
        name: "Eco Saver",
        price: 32189,
        baggage: "7kg",
        features: ["Seat selection for fee"],
      },
      {
        name: "Eco Flex",
        price: 35690,
        baggage: "23kg",
        features: ["Free seat selection", "Free changes"],
      },
      {
        name: "Eco Regular",
        price: 38200,
        baggage: "30kg",
        features: ["Premium seat selection", "Priority boarding"],
      },
    ],
  },
];

// Sample travelers data (from OtherTravelers page)
const savedTravelers = [
  {
    id: 1,
    firstName: "Zubin",
    lastName: "Aibara",
    email: "zubin@faredown.com",
    phone: "+91 98765 43210",
    dateOfBirth: "15-May-1990",
    passportNumber: "A1234567",
    passportExpiry: "31-Dec-2030",
    passportCountry: "India",
    nationality: "Indian",
  },
  {
    id: 2,
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.j@email.com",
    phone: "+91 87654 32109",
    dateOfBirth: "22-Aug-1985",
    passportNumber: "B9876543",
    passportExpiry: "15-Jun-2029",
    passportCountry: "USA",
    nationality: "American",
  },
  {
    id: 3,
    firstName: "Raj",
    lastName: "Patel",
    email: "raj.patel@email.com",
    phone: "+91 76543 21098",
    dateOfBirth: "03-Dec-1992",
    passportNumber: "C5566778",
    passportExpiry: "20-Mar-2031",
    passportCountry: "India",
    nationality: "Indian",
  },
];

export default function Booking() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedTraveler, setSelectedTraveler] = useState("");
  const [isBusinessTravel, setIsBusinessTravel] = useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);

  // Header states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("Zubin Aibara");
  const [showSignIn, setShowSignIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [authError, setAuthError] = useState("");
  const [tripType, setTripType] = useState<
    "round-trip" | "one-way" | "multi-city"
  >("round-trip");
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTravelers, setShowTravelers] = useState(false);
  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const [showFromCities, setShowFromCities] = useState(false);
  const [showToCities, setShowToCities] = useState(false);
  const [selectedFromCity, setSelectedFromCity] = useState("Mumbai");
  const [selectedToCity, setSelectedToCity] = useState("Dubai");
  const [selectedClass, setSelectedClass] = useState("Economy");
  const [selectedDepartureDate, setSelectedDepartureDate] =
    useState("09-Dec-2024");
  const [selectedReturnDate, setSelectedReturnDate] = useState("16-Dec-2024");
  const [selectingDeparture, setSelectingDeparture] = useState(true);
  const [travelers, setTravelers] = useState({ adults: 1, children: 0 });
  const [passengerDetails, setPassengerDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    passportNumber: "",
    passportExpiry: "",
    passportCountry: "",
    nationality: "",
  });
  const [gstDetails, setGstDetails] = useState({
    companyName: "",
    gstNumber: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  // Get URL parameters first
  const flightId = parseInt(searchParams.get("flight") || "1");
  const bargainPrice = parseInt(searchParams.get("price") || "0");
  const bonus = parseInt(searchParams.get("bonus") || "0");
  const fareType = searchParams.get("fare") || "Eco Saver";

  // Additional services (from flight selection)
  const [additionalServices] = useState({
    seatSelection: {
      selected: true,
      price: 1500,
      details: "Extra Legroom Seat 12A",
    },
    mealPreference: { selected: true, price: 800, details: "Vegetarian Meal" },
    extraBaggage: { selected: true, price: 2000, details: "Additional 15kg" },
  });

  // Detailed pricing breakdown
  const baseFare = bargainPrice > 2000 ? bargainPrice - 2000 : 25000; // Separating base fare from total with fallback
  const airportTax = 1850;
  const fuelSurcharge = 3200;
  const serviceTax = Math.round(baseFare * 0.05); // 5% service tax
  const gstTax = Math.round((baseFare + serviceTax) * 0.18); // 18% GST
  const faredownServiceCharge = 299;

  const additionalServicesTotal = Object.values(additionalServices)
    .filter((service) => service.selected)
    .reduce((total, service) => total + service.price, 0);

  const subtotal = baseFare + airportTax + fuelSurcharge + serviceTax;
  const totalBeforeGST =
    subtotal + additionalServicesTotal + faredownServiceCharge;
  const finalAmount = totalBeforeGST + gstTax;

  const flight = flightData.find((f) => f.id === flightId) || flightData[0];
  const originalPrice =
    flight.fareTypes.find((f) => f.name === fareType)?.price ||
    flight.fareTypes[0].price;
  const totalSavings = originalPrice - bargainPrice + bonus;

  useEffect(() => {
    // Auto-scroll to top when component mounts
    window.scrollTo(0, 0);

    // Load Razorpay script
    if (
      !document.querySelector(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
      )
    ) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setPassengerDetails((prev) => ({ ...prev, [field]: value }));
  };

  const validateDateFormat = (dateString: string): boolean => {
    const dateRegex = /^\d{2}-[A-Za-z]{3}-\d{4}$/;
    return dateRegex.test(dateString);
  };

  const formatDateInput = (value: string): string => {
    // Remove any non-alphanumeric characters except hyphens
    let cleaned = value.replace(/[^0-9a-zA-Z-]/g, "");

    // Auto-add hyphens at appropriate positions
    if (cleaned.length >= 2 && cleaned.charAt(2) !== "-") {
      cleaned = cleaned.slice(0, 2) + "-" + cleaned.slice(2);
    }
    if (cleaned.length >= 6 && cleaned.charAt(6) !== "-") {
      cleaned = cleaned.slice(0, 6) + "-" + cleaned.slice(6);
    }

    // Limit to DD-MMM-YYYY format length
    if (cleaned.length > 11) {
      cleaned = cleaned.slice(0, 11);
    }

    return cleaned;
  };

  const handleGstInputChange = (field: string, value: string) => {
    setGstDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handleTravelerSelect = (travelerId: string) => {
    setSelectedTraveler(travelerId);
    if (travelerId === "new") {
      // Clear form for new traveler
      setPassengerDetails({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        passportNumber: "",
        passportExpiry: "",
        passportCountry: "",
        nationality: "",
      });
    } else {
      // Populate form with selected traveler's data
      const traveler = savedTravelers.find(
        (t) => t.id.toString() === travelerId,
      );
      if (traveler) {
        setPassengerDetails({
          firstName: traveler.firstName,
          lastName: traveler.lastName,
          email: traveler.email,
          phone: traveler.phone,
          dateOfBirth: traveler.dateOfBirth,
          passportNumber: traveler.passportNumber,
          passportExpiry: traveler.passportExpiry,
          passportCountry: traveler.passportCountry,
          nationality: traveler.nationality,
        });
      }
    }
  };

  const handleRazorpayPayment = () => {
    // Razorpay payment configuration
    const options = {
      key: "rzp_test_9WdWzFXN4pL6tL", // Replace with your actual Razorpay key
      amount: finalAmount * 100, // Amount in paise
      currency: "INR",
      name: "Faredown",
      description: `Flight Booking - ${flight.departureCode} to ${flight.arrivalCode}`,
      image: "/favicon.ico",
      order_id: "", // Generate order_id from backend
      prefill: {
        name: `${passengerDetails.firstName} ${passengerDetails.lastName}`,
        email: passengerDetails.email,
        contact: passengerDetails.phone,
      },
      notes: {
        flight_id: flight.id,
        departure: flight.departureCode,
        arrival: flight.arrivalCode,
        fare_type: fareType,
      },
      theme: {
        color: "#2563eb",
      },
      modal: {
        ondismiss: function () {
          console.log("Payment modal closed");
        },
      },
      handler: function (response: any) {
        console.log("Payment successful:", response);
        // Handle successful payment
        setShowPaymentSuccess(true);
        // Store payment details for booking confirmation
        localStorage.setItem(
          "bookingDetails",
          JSON.stringify({
            paymentId: response.razorpay_payment_id,
            amount: finalAmount,
            flightDetails: flight,
            passengerDetails: passengerDetails,
          }),
        );
      },
      error: function (error: any) {
        console.error("Payment failed:", error);
        alert("Payment failed. Please try again.");
      },
    };

    // Check if Razorpay is loaded
    if (typeof window !== "undefined" && (window as any).Razorpay) {
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } else {
      // Fallback to load Razorpay script dynamically
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      };
      script.onerror = () => {
        alert("Failed to load payment gateway. Please try again.");
      };
      document.body.appendChild(script);
    }
  };

  // Header handler functions
  const handleSignOut = () => {
    setIsLoggedIn(false);
    setUserName("");
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    // Simulate authentication
    const email = (e.target as any).email.value;
    const password = (e.target as any).password.value;

    if (email === "test@faredown.com" && password === "password123") {
      setIsLoggedIn(true);
      setUserName("Zubin Aibara");
      setShowSignIn(false);
    } else {
      setAuthError("Invalid email or password");
    }
  };

  const cityData = {
    Mumbai: {
      code: "BOM",
      country: "India",
      fullName: "Chhatrapati Shivaji International Airport",
    },
    Dubai: {
      code: "DXB",
      country: "UAE",
      fullName: "Dubai International Airport",
    },
    Delhi: {
      code: "DEL",
      country: "India",
      fullName: "Indira Gandhi International Airport",
    },
    Bangalore: {
      code: "BLR",
      country: "India",
      fullName: "Kempegowda International Airport",
    },
    London: {
      code: "LHR",
      country: "UK",
      fullName: "Heathrow Airport",
    },
    "New York": {
      code: "JFK",
      country: "USA",
      fullName: "John F. Kennedy International Airport",
    },
  };

  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{
        fontFamily:
          'BlinkMacSystemFont, -apple-system, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
      }}
    >
      {/* Header */}
      <header className="bg-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight">
                faredown.com
              </span>
            </Link>
            <div className="flex items-center space-x-6">
              <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
                <Link
                  to="/flights"
                  className="text-white hover:text-blue-200 cursor-pointer flex items-center py-4"
                >
                  Flights
                </Link>
                <span className="text-white hover:text-blue-200 cursor-pointer flex items-center py-4">
                  Hotels
                </span>
              </nav>

              {/* Language and Currency */}
              <div className="hidden md:flex items-center space-x-4 text-sm">
                <button className="text-white hover:text-blue-200 cursor-pointer flex items-center space-x-1">
                  <span>🌐</span>
                  <span>English (UK)</span>
                </button>
                <button className="text-white hover:text-blue-200 cursor-pointer">
                  INR
                </button>
              </div>
              <div className="flex items-center space-x-3">
                {isLoggedIn ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center space-x-2 bg-blue-600 rounded-full px-3 py-2 hover:bg-blue-800">
                      <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-black">
                          {userName.charAt(0)}
                        </span>
                      </div>
                      <span className="text-sm text-white">{userName}</span>
                      <span className="text-xs text-yellow-300">
                        Loyalty Level 1
                      </span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem>
                        <User className="w-4 h-4 mr-2" />
                        My account
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <BookOpen className="w-4 h-4 mr-2" />
                        Bookings & Trips
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Award className="w-4 h-4 mr-2" />
                        Loyalty program
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Rewards & Wallet
                      </DropdownMenuItem>

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
                      className="bg-white text-blue-700 border-white hover:bg-gray-100 rounded text-sm font-medium px-4 py-1.5"
                      onClick={() => setShowRegister(true)}
                    >
                      Register
                    </Button>
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-800 text-white rounded text-sm font-medium px-4 py-1.5"
                      onClick={() => setShowSignIn(true)}
                    >
                      Sign in
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Search Panel */}
        <div className="bg-white border-b border-gray-200 overflow-visible">
          <div className="max-w-7xl mx-auto px-4 py-3 overflow-visible">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex items-center bg-white rounded-lg p-3 flex-1 w-full lg:mr-4">
                <div className="flex flex-wrap items-center gap-3 md:gap-6">
                  <button
                    onClick={() => setTripType("round-trip")}
                    className="flex items-center space-x-2"
                  >
                    <div
                      className={cn(
                        "w-3 h-3 rounded-full border-2",
                        tripType === "round-trip"
                          ? "bg-blue-600 border-white ring-1 ring-blue-600"
                          : "border-gray-300",
                      )}
                    ></div>
                    <span
                      className={cn(
                        "text-sm",
                        tripType === "round-trip"
                          ? "font-medium text-gray-900"
                          : "text-gray-500",
                      )}
                    >
                      Round trip
                    </span>
                  </button>
                  <button
                    onClick={() => setTripType("one-way")}
                    className="flex items-center space-x-2"
                  >
                    <div
                      className={cn(
                        "w-3 h-3 rounded-full border-2",
                        tripType === "one-way"
                          ? "bg-blue-600 border-white ring-1 ring-blue-600"
                          : "border-gray-300",
                      )}
                    ></div>
                    <span
                      className={cn(
                        "text-sm",
                        tripType === "one-way"
                          ? "font-medium text-gray-900"
                          : "text-gray-500",
                      )}
                    >
                      One way
                    </span>
                  </button>
                  <button
                    onClick={() => setTripType("multi-city")}
                    className="flex items-center space-x-2"
                  >
                    <div
                      className={cn(
                        "w-3 h-3 rounded-full border-2",
                        tripType === "multi-city"
                          ? "bg-blue-600 border-white ring-1 ring-blue-600"
                          : "border-gray-300",
                      )}
                    ></div>
                    <span
                      className={cn(
                        "text-sm",
                        tripType === "multi-city"
                          ? "font-medium text-gray-900"
                          : "text-gray-500",
                      )}
                    >
                      Multi-city
                    </span>
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => setShowClassDropdown(!showClassDropdown)}
                      className="flex items-center space-x-2"
                    >
                      <div className="w-3 h-3 border-2 border-gray-300 rounded-full"></div>
                      <span className="text-sm text-gray-500">
                        {selectedClass}
                      </span>
                      <ChevronDown className="w-3 h-3 text-gray-500" />
                    </button>
                    {showClassDropdown && (
                      <div className="absolute top-8 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-50 w-48">
                        {[
                          "Economy",
                          "Premium Economy",
                          "Business",
                          "First Class",
                        ].map((classType) => (
                          <button
                            key={classType}
                            onClick={() => {
                              setSelectedClass(classType);
                              setShowClassDropdown(false);
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm"
                          >
                            {classType}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Search inputs */}
            <div className="flex flex-col lg:flex-row items-center gap-2 lg:gap-2 mt-2 w-full overflow-visible">
              <div className="relative flex-1">
                <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-600 font-medium">
                  Leaving from
                </label>
                <button
                  onClick={() => setShowFromCities(!showFromCities)}
                  className="flex items-center bg-white rounded border-2 border-blue-500 px-3 py-2 h-full w-full hover:border-blue-600"
                >
                  <Plane className="w-4 h-4 text-gray-500 mr-2" />
                  <div className="flex items-center space-x-2">
                    <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">
                      {cityData[selectedFromCity]?.code || "BOM"}
                    </div>
                    <span className="text-sm text-gray-700 font-medium">
                      {cityData[selectedFromCity]?.airport ||
                        "Chhatrapati Shivaji International"}
                      ...
                    </span>
                  </div>
                </button>

                {showFromCities && (
                  <div className="absolute top-14 left-0 bg-white border border-gray-200 rounded-lg shadow-xl p-4 z-50 w-96 max-h-80 overflow-y-auto">
                    <div className="mb-3">
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">
                        Airport, city or country
                      </h3>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Mumbai"
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      {Object.entries(cityData).map(([city, data]) => (
                        <button
                          key={city}
                          onClick={() => {
                            setSelectedFromCity(city);
                            setShowFromCities(false);
                          }}
                          className="w-full text-left px-3 py-3 hover:bg-gray-100 rounded"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-gray-600">
                                ✈
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {city} • {data.airport}
                              </div>
                              <div className="text-xs text-gray-500">
                                {data.fullName}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative flex-1">
                <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-600 font-medium">
                  Going to
                </label>
                <button
                  onClick={() => setShowToCities(!showToCities)}
                  className="flex items-center bg-white rounded border border-gray-300 px-3 py-2 h-full w-full hover:border-blue-500"
                >
                  <Plane className="w-4 h-4 text-gray-500 mr-2" />
                  <div className="flex items-center space-x-2">
                    <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">
                      {cityData[selectedToCity]?.code || "DXB"}
                    </div>
                    <span className="text-sm text-gray-700 font-medium">
                      {cityData[selectedToCity]?.airport ||
                        "Dubai International Airport"}
                    </span>
                  </div>
                </button>

                {showToCities && (
                  <div className="absolute top-14 left-0 bg-white border border-gray-200 rounded-lg shadow-xl p-4 z-50 w-96 max-h-80 overflow-y-auto">
                    <div className="mb-3">
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">
                        Airport, city or country
                      </h3>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Dubai"
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      {Object.entries(cityData).map(([city, data]) => (
                        <button
                          key={city}
                          onClick={() => {
                            setSelectedToCity(city);
                            setShowToCities(false);
                          }}
                          className="w-full text-left px-3 py-3 hover:bg-gray-100 rounded"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-gray-600">
                                ✈
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {city} • {data.airport}
                              </div>
                              <div className="text-xs text-gray-500">
                                {data.fullName}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative overflow-visible">
                <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-600 font-medium">
                  Travel dates
                </label>
                <button
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="flex items-center bg-white rounded border border-gray-300 px-3 py-2 h-12 min-w-[180px] hover:border-blue-500"
                >
                  <svg
                    className="w-4 h-4 text-gray-500 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-sm text-gray-700 font-medium">
                    {tripType === "one-way"
                      ? selectedDepartureDate
                      : `${selectedDepartureDate} - ${selectedReturnDate}`}
                  </span>
                </button>

                {showCalendar && (
                  <div className="absolute top-14 left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 rounded-lg shadow-2xl z-[9999] w-[650px] overflow-hidden">
                    <div className="flex justify-between items-center p-4 bg-white border-b border-gray-200">
                      <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ChevronLeft className="w-4 h-4 text-gray-600" />
                      </button>
                      <div className="flex space-x-16">
                        <div className="text-center">
                          <div className="font-medium text-gray-900">
                            December 2024
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-gray-900">
                            January 2025
                          </div>
                        </div>
                      </div>
                      <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ChevronDown className="w-4 h-4 text-gray-600 rotate-90" />
                      </button>
                    </div>

                    <div className="flex">
                      {/* December 2024 */}
                      <div className="flex-1 p-4">
                        <div className="grid grid-cols-7 gap-1 mb-3">
                          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(
                            (day) => (
                              <div
                                key={day}
                                className="text-center text-sm font-medium text-gray-500 py-2"
                              >
                                {day}
                              </div>
                            ),
                          )}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                          {Array.from({ length: 31 }, (_, i) => i + 1).map(
                            (date) => (
                              <button
                                key={date}
                                onClick={() => {
                                  setSelectedDepartureDate(
                                    `${String(date).padStart(2, "0")}-Dec-2024`,
                                  );
                                  if (tripType === "one-way")
                                    setShowCalendar(false);
                                }}
                                className="p-2 text-sm hover:bg-blue-50 hover:text-blue-600 rounded"
                              >
                                {date}
                              </button>
                            ),
                          )}
                        </div>
                      </div>

                      {/* January 2025 */}
                      <div className="flex-1 p-4 border-l border-gray-200">
                        <div className="grid grid-cols-7 gap-1 mb-3">
                          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(
                            (day) => (
                              <div
                                key={day}
                                className="text-center text-sm font-medium text-gray-500 py-2"
                              >
                                {day}
                              </div>
                            ),
                          )}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                          {Array.from({ length: 31 }, (_, i) => i + 1).map(
                            (date) => (
                              <button
                                key={date}
                                onClick={() => {
                                  setSelectedReturnDate(
                                    `${String(date).padStart(2, "0")}-Jan-2025`,
                                  );
                                  setShowCalendar(false);
                                }}
                                className="p-2 text-sm hover:bg-blue-50 hover:text-blue-600 rounded"
                              >
                                {date}
                              </button>
                            ),
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end space-x-3 p-4 border-t border-gray-200">
                      <Button
                        variant="outline"
                        onClick={() => setShowCalendar(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={() => setShowCalendar(false)}>
                        Done
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-600 font-medium">
                  Travelers
                </label>
                <button
                  onClick={() => setShowTravelers(!showTravelers)}
                  className="flex items-center bg-white rounded border border-gray-300 px-3 py-2 h-12 min-w-[120px] hover:border-blue-500"
                >
                  <Users className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-700 font-medium">
                    {travelers.adults + travelers.children} adult
                    {travelers.adults + travelers.children !== 1 ? "s" : ""}
                  </span>
                </button>

                {showTravelers && (
                  <div className="absolute top-14 left-0 bg-white border border-gray-200 rounded-lg shadow-xl p-4 z-50 w-80">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">
                            Adults
                          </div>
                          <div className="text-sm text-gray-500">Age 18+</div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() =>
                              setTravelers({
                                ...travelers,
                                adults: Math.max(1, travelers.adults - 1),
                              })
                            }
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-blue-500"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-medium">
                            {travelers.adults}
                          </span>
                          <button
                            onClick={() =>
                              setTravelers({
                                ...travelers,
                                adults: travelers.adults + 1,
                              })
                            }
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-blue-500"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">
                            Children
                          </div>
                          <div className="text-sm text-gray-500">Age 2-17</div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() =>
                              setTravelers({
                                ...travelers,
                                children: Math.max(0, travelers.children - 1),
                              })
                            }
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-blue-500"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-medium">
                            {travelers.children}
                          </span>
                          <button
                            onClick={() =>
                              setTravelers({
                                ...travelers,
                                children: travelers.children + 1,
                              })
                            }
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-blue-500"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-gray-200 mt-4">
                      <Button
                        onClick={() => setShowTravelers(false)}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        Done
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center">
                <Button
                  onClick={() => navigate("/flights")}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium text-sm h-12"
                >
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Calendar Modal */}
      {showCalendar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Select dates
                </h3>
                <button
                  onClick={() => setShowCalendar(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-6">
                {/* December 2024 */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900">
                      December 2024
                    </h4>
                  </div>
                  <div className="grid grid-cols-7 gap-1 mb-3">
                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                      <div
                        key={day}
                        className="text-center text-sm font-medium text-gray-500 py-2"
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => (
                      <button
                        key={date}
                        onClick={() => {
                          setDepartDate(new Date(2024, 11, date));
                          if (tripType === "one-way") setShowCalendar(false);
                        }}
                        className="p-2 text-sm hover:bg-blue-50 hover:text-blue-600 rounded"
                      >
                        {date}
                      </button>
                    ))}
                  </div>
                </div>

                {/* January 2025 */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900">
                      January 2025
                    </h4>
                  </div>
                  <div className="grid grid-cols-7 gap-1 mb-3">
                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                      <div
                        key={day}
                        className="text-center text-sm font-medium text-gray-500 py-2"
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => (
                      <button
                        key={date}
                        onClick={() => {
                          setReturnDate(new Date(2025, 0, date));
                          setShowCalendar(false);
                        }}
                        className="p-2 text-sm hover:bg-blue-50 hover:text-blue-600 rounded"
                      >
                        {date}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => setShowCalendar(false)}
                >
                  Cancel
                </Button>
                <Button onClick={() => setShowCalendar(false)}>Done</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Travelers Modal */}
      {showTravelers && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Travelers
                </h3>
                <button
                  onClick={() => setShowTravelers(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Adults</div>
                  <div className="text-sm text-gray-500">12+ years</div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setAdults(Math.max(1, adults - 1))}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-blue-500"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-medium">{adults}</span>
                  <button
                    onClick={() => setAdults(adults + 1)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-blue-500"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Children</div>
                  <div className="text-sm text-gray-500">2-11 years</div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setChildren(Math.max(0, children - 1))}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-blue-500"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-medium">
                    {children}
                  </span>
                  <button
                    onClick={() => setChildren(children + 1)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-blue-500"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200">
              <Button
                onClick={() => setShowTravelers(false)}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Content */}
      <div className="max-w-6xl mx-auto px-4 py-4 md:py-8">
        {/* Success Banner */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 md:p-6 mb-6 md:mb-8">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-green-600" />
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-green-800">
                Congratulations!
              </h2>
              <p className="text-green-700 text-sm md:text-base">
                Your bargain was successful! Complete your booking below.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Passenger Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Passenger Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Traveler Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Traveler
                  </label>
                  <Select
                    value={selectedTraveler}
                    onValueChange={handleTravelerSelect}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select from saved travelers or add new" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4" />
                          <span>Add New Traveler</span>
                        </div>
                      </SelectItem>
                      {savedTravelers.map((traveler) => (
                        <SelectItem
                          key={traveler.id}
                          value={traveler.id.toString()}
                        >
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4" />
                            <span>
                              {traveler.firstName} {traveler.lastName}
                            </span>
                            <span className="text-xs text-gray-500">
                              ({traveler.email})
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Personal Information */}
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-4">
                    Personal Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name *
                      </label>
                      <Input
                        value={passengerDetails.firstName}
                        onChange={(e) =>
                          handleInputChange("firstName", e.target.value)
                        }
                        placeholder="John"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name *
                      </label>
                      <Input
                        value={passengerDetails.lastName}
                        onChange={(e) =>
                          handleInputChange("lastName", e.target.value)
                        }
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <Input
                        type="email"
                        value={passengerDetails.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        placeholder="john.doe@example.com"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <Input
                        type="tel"
                        value={passengerDetails.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        placeholder="+91 98765 43210"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Birth *
                      </label>
                      <Input
                        type="text"
                        value={passengerDetails.dateOfBirth}
                        onChange={(e) => {
                          const formattedValue = formatDateInput(
                            e.target.value,
                          );
                          handleInputChange("dateOfBirth", formattedValue);
                        }}
                        placeholder="DD-MMM-YYYY (e.g., 04-May-1978)"
                        className={
                          !validateDateFormat(passengerDetails.dateOfBirth) &&
                          passengerDetails.dateOfBirth.length > 0
                            ? "border-red-300 focus:border-red-500"
                            : ""
                        }
                        required
                      />
                      {passengerDetails.dateOfBirth.length > 0 &&
                        !validateDateFormat(passengerDetails.dateOfBirth) && (
                          <p className="text-xs text-red-600 mt-1">
                            Please use DD-MMM-YYYY format (e.g., 04-May-1978)
                          </p>
                        )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nationality *
                      </label>
                      <Input
                        value={passengerDetails.nationality}
                        onChange={(e) =>
                          handleInputChange("nationality", e.target.value)
                        }
                        placeholder="Indian"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Passport Information */}
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-4 flex items-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <span>Passport Information</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Passport Number *
                      </label>
                      <Input
                        value={passengerDetails.passportNumber}
                        onChange={(e) =>
                          handleInputChange("passportNumber", e.target.value)
                        }
                        placeholder="A1234567"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Passport Expiry Date *
                      </label>
                      <Input
                        type="text"
                        value={passengerDetails.passportExpiry}
                        onChange={(e) => {
                          const formattedValue = formatDateInput(
                            e.target.value,
                          );
                          handleInputChange("passportExpiry", formattedValue);
                        }}
                        placeholder="DD-MMM-YYYY (e.g., 31-Dec-2030)"
                        className={
                          !validateDateFormat(
                            passengerDetails.passportExpiry,
                          ) && passengerDetails.passportExpiry.length > 0
                            ? "border-red-300 focus:border-red-500"
                            : ""
                        }
                        required
                      />
                      {passengerDetails.passportExpiry.length > 0 &&
                        !validateDateFormat(
                          passengerDetails.passportExpiry,
                        ) && (
                          <p className="text-xs text-red-600 mt-1">
                            Please use DD-MMM-YYYY format (e.g., 31-Dec-2030)
                          </p>
                        )}
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Passport Issuing Country *
                    </label>
                    <Input
                      value={passengerDetails.passportCountry}
                      onChange={(e) =>
                        handleInputChange("passportCountry", e.target.value)
                      }
                      placeholder="India"
                      required
                    />
                  </div>
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Important:</strong> Please ensure your passport is
                      valid for at least 6 months from your travel date.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business Travel & GST Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Building className="w-5 h-5" />
                    <span>Business Travel & GST Details</span>
                  </div>
                  <Switch
                    checked={isBusinessTravel}
                    onCheckedChange={setIsBusinessTravel}
                  />
                </CardTitle>
              </CardHeader>
              {isBusinessTravel && (
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company Name *
                      </label>
                      <Input
                        value={gstDetails.companyName}
                        onChange={(e) =>
                          handleGstInputChange("companyName", e.target.value)
                        }
                        placeholder="Faredown Technologies Pvt Ltd"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        GST Number *
                      </label>
                      <Input
                        value={gstDetails.gstNumber}
                        onChange={(e) =>
                          handleGstInputChange("gstNumber", e.target.value)
                        }
                        placeholder="27AABCS1234E1ZX"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Address *
                    </label>
                    <Input
                      value={gstDetails.address}
                      onChange={(e) =>
                        handleGstInputChange("address", e.target.value)
                      }
                      placeholder="123 Business Park, Tech City"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <Input
                        value={gstDetails.city}
                        onChange={(e) =>
                          handleGstInputChange("city", e.target.value)
                        }
                        placeholder="Mumbai"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State *
                      </label>
                      <Input
                        value={gstDetails.state}
                        onChange={(e) =>
                          handleGstInputChange("state", e.target.value)
                        }
                        placeholder="Maharashtra"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pincode *
                      </label>
                      <Input
                        value={gstDetails.pincode}
                        onChange={(e) =>
                          handleGstInputChange("pincode", e.target.value)
                        }
                        placeholder="400001"
                        required
                      />
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>GST Invoice:</strong> A GST invoice will be
                      generated and sent to your email after successful booking.
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Payment Method Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5" />
                  <span>Payment Method</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-4">
                    <img
                      src="https://razorpay.com/assets/razorpay-logo.svg"
                      alt="Razorpay"
                      className="h-8"
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      Secure Payment Gateway
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Pay securely using Credit Card, Debit Card, Net Banking,
                    UPI, or Wallets
                  </p>

                  {/* Payment Options */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <div className="border rounded-lg p-3 flex flex-col items-center">
                      <CreditCard className="w-6 h-6 text-blue-600 mb-1" />
                      <span className="text-xs">Cards</span>
                    </div>
                    <div className="border rounded-lg p-3 flex flex-col items-center">
                      <Building className="w-6 h-6 text-green-600 mb-1" />
                      <span className="text-xs">Net Banking</span>
                    </div>
                    <div className="border rounded-lg p-3 flex flex-col items-center">
                      <Phone className="w-6 h-6 text-purple-600 mb-1" />
                      <span className="text-xs">UPI</span>
                    </div>
                    <div className="border rounded-lg p-3 flex flex-col items-center">
                      <Shield className="w-6 h-6 text-orange-600 mb-1" />
                      <span className="text-xs">Wallets</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                    <span>🔒 SSL Secured</span>
                    <span>•</span>
                    <span>💳 PCI Compliant</span>
                    <span>•</span>
                    <span>🛡️ Safe & Secure</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Summary */}
          <div className="space-y-6">
            {/* Flight Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plane className="w-5 h-5" />
                  <span>Flight Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Outbound Flight */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold text-gray-900">Outbound</div>
                    <Badge variant="secondary">{flight.flightType}</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Departure</span>
                      <span className="font-medium">
                        {flight.departureTime} {flight.departureCode}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Arrival</span>
                      <span className="font-medium">
                        {flight.arrivalTime} {flight.arrivalCode}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Duration</span>
                      <span className="font-medium">{flight.duration}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Date</span>
                      <span className="font-medium">{flight.date}</span>
                    </div>
                  </div>
                </div>

                {/* Return Flight */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold text-gray-900">Return</div>
                    <Badge variant="secondary">{flight.flightType}</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Departure</span>
                      <span className="font-medium">
                        {flight.returnDepartureTime} {flight.arrivalCode}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Arrival</span>
                      <span className="font-medium">
                        {flight.returnArrivalTime} {flight.departureCode}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Duration</span>
                      <span className="font-medium">
                        {flight.returnDuration}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Date</span>
                      <span className="font-medium">{flight.returnDate}</span>
                    </div>
                  </div>
                </div>

                <div className="text-center text-sm text-gray-600">
                  <div className="font-semibold">{flight.airline}</div>
                  <div>{flight.aircraft}</div>
                  <div>Fare: {fareType}</div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Price Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Price Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Base Fare */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    Flight Fare
                  </h4>
                  <div className="space-y-2 pl-4 border-l-2 border-blue-200">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Base Fare (1 Adult)</span>
                      <span>₹{baseFare.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Airport Tax</span>
                      <span>₹{airportTax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fuel Surcharge</span>
                      <span>₹{fuelSurcharge.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Service Tax</span>
                      <span>₹{serviceTax.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Additional Services */}
                <div className="border-t pt-3">
                  <h4 className="font-medium text-gray-900 mb-3">
                    Additional Services
                  </h4>
                  <div className="space-y-2 pl-4 border-l-2 border-green-200">
                    {additionalServices.seatSelection.selected && (
                      <div className="flex justify-between">
                        <div>
                          <span className="text-gray-600">Seat Selection</span>
                          <div className="text-xs text-gray-500">
                            {additionalServices.seatSelection.details}
                          </div>
                        </div>
                        <span>
                          ₹
                          {additionalServices.seatSelection.price.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {additionalServices.mealPreference.selected && (
                      <div className="flex justify-between">
                        <div>
                          <span className="text-gray-600">Meal Preference</span>
                          <div className="text-xs text-gray-500">
                            {additionalServices.mealPreference.details}
                          </div>
                        </div>
                        <span>
                          ₹
                          {additionalServices.mealPreference.price.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {additionalServices.extraBaggage.selected && (
                      <div className="flex justify-between">
                        <div>
                          <span className="text-gray-600">Extra Baggage</span>
                          <div className="text-xs text-gray-500">
                            {additionalServices.extraBaggage.details}
                          </div>
                        </div>
                        <span>
                          ₹
                          {additionalServices.extraBaggage.price.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Service Charges */}
                <div className="border-t pt-3">
                  <h4 className="font-medium text-gray-900 mb-3">
                    Service Charges
                  </h4>
                  <div className="space-y-2 pl-4 border-l-2 border-orange-200">
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Faredown Service Charge
                      </span>
                      <span>₹{faredownServiceCharge.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Taxes */}
                <div className="border-t pt-3">
                  <h4 className="font-medium text-gray-900 mb-3">Taxes</h4>
                  <div className="space-y-2 pl-4 border-l-2 border-red-200">
                    <div className="flex justify-between">
                      <span className="text-gray-600">GST (18%)</span>
                      <span>₹{gstTax.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Savings Summary */}
                <div className="bg-green-50 p-4 rounded-lg border-t border-green-200">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Original Price</span>
                      <span className="line-through text-gray-500">
                        ₹{originalPrice.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>Faredown Bargain Savings</span>
                      <span>
                        -₹{(originalPrice - bargainPrice).toLocaleString()}
                      </span>
                    </div>
                    {bonus > 0 && (
                      <div className="flex justify-between text-orange-600">
                        <span className="flex items-center space-x-1">
                          <Gift className="w-4 h-4" />
                          <span>Bonus Reward</span>
                        </span>
                        <span>-₹{bonus.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Total Amount */}
                <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-bold text-xl text-blue-900">
                        Total Amount
                      </span>
                      <div className="text-sm text-blue-700">
                        Including all taxes & fees
                      </div>
                    </div>
                    <span className="font-bold text-2xl text-blue-900">
                      ₹{finalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Razorpay Payment Button */}
                <div className="pt-4 space-y-3">
                  <Button
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 text-lg"
                    onClick={() => navigate("/ancillaries")}
                  >
                    ✈️ Continue to Extras
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold py-4 text-lg"
                    onClick={() => handleRazorpayPayment()}
                  >
                    💳 Skip & Pay ₹{finalAmount.toLocaleString()} Now
                  </Button>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                      <Shield className="w-3 h-3" />
                      <span>100% Secure Payment</span>
                      <span>•</span>
                      <span>No hidden charges</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-800">
                  Secure Booking
                </span>
              </div>
              <p className="text-sm text-blue-700">
                Your payment information is encrypted and secure. This booking
                is protected by Faredown's guarantee.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sign In Modal */}
      <Dialog open={showSignIn} onOpenChange={setShowSignIn}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">
              Sign in to your account
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSignInSubmit} className="space-y-4 p-4">
            {authError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{authError}</p>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Test Login:</strong> test@faredown.com / password123
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <Input
                name="email"
                type="email"
                placeholder="Enter your email address"
                required
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <Input
                name="password"
                type="password"
                placeholder="Enter your password"
                required
                className="w-full"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Sign in
            </Button>

            <div className="text-center">
              <a href="#" className="text-sm text-blue-600 hover:underline">
                Forgot your password?
              </a>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Button
                type="button"
                variant="outline"
                className="w-full py-3 flex items-center justify-center space-x-2"
              >
                <span>🇬</span>
                <span>Google</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full py-3 flex items-center justify-center space-x-2"
              >
                <span>🍏</span>
                <span>Apple</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full py-3 flex items-center justify-center space-x-2"
              >
                <span>📘</span>
                <span>Facebook</span>
              </Button>
            </div>

            <div className="text-xs text-gray-500 text-center">
              By signing in or creating an account, you agree with our{" "}
              <a href="#" className="text-blue-600 hover:underline">
                Terms & conditions
              </a>{" "}
              and{" "}
              <a href="#" className="text-blue-600 hover:underline">
                Privacy statement
              </a>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setShowSignIn(false);
                  setShowRegister(true);
                }}
                className="text-blue-600 hover:underline text-sm"
              >
                Create account
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Register Modal */}
      <Dialog open={showRegister} onOpenChange={setShowRegister}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">
              Create your account
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 p-4">
            {authError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{authError}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <Input
                type="email"
                placeholder="Enter your email address"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <Input
                type="password"
                placeholder="Create a password"
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Must be at least 8 characters
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First name
                </label>
                <Input placeholder="First name" className="w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last name
                </label>
                <Input placeholder="Last name" className="w-full" />
              </div>
            </div>

            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              Create account
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or sign up with
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full py-3 flex items-center justify-center space-x-2"
              >
                <span>🇬</span>
                <span>Continue with Google</span>
              </Button>

              <Button
                variant="outline"
                className="w-full py-3 flex items-center justify-center space-x-2"
              >
                <span>📧</span>
                <span>Continue with Apple</span>
              </Button>

              <Button
                variant="outline"
                className="w-full py-3 flex items-center justify-center space-x-2"
              >
                <span>📘</span>
                <span>Continue with Facebook</span>
              </Button>
            </div>

            <div className="text-xs text-gray-500 text-center">
              By signing in or creating an account, you agree with our{" "}
              <a href="#" className="text-blue-600 hover:underline">
                Terms & conditions
              </a>{" "}
              and{" "}
              <a href="#" className="text-blue-600 hover:underline">
                Privacy statement
              </a>
            </div>

            <div className="text-center">
              <button
                onClick={() => {
                  setShowRegister(false);
                  setShowSignIn(true);
                }}
                className="text-blue-600 hover:underline text-sm"
              >
                Already have an account? Sign in
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
