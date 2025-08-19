import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  formatDateToDDMMMYYYY,
  formatDateToDisplayString,
} from "@/lib/dateUtils";
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
import { cn } from "@/lib/utils";
import {
  Plane,
  Target,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Luggage,
  Wifi,
  Coffee,
  Tv,
  ArrowRightLeft,
  X,
  Info,
  Shield,
  ShieldCheck,
  CreditCard,
  Users,
  RefreshCw,
  Utensils,
} from "lucide-react";

// Flight data matching Booking.com exactly
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
    logo: "https://cdn.builder.io/api/v1/image/assets%2F4235b10530ff469795aa00c0333d773c%2F215eedd64de04ad0ab3a8edccfc2f2c5?format=webp&width=800",
    aircraft: "Boeing 777",
    flightType: "Direct",
    fareTypes: [
      {
        name: "Eco Saver",
        price: 32189,
        features: ["1 carry-on bag included"],
        baggage: "23kg",
        refund: "No refund",
        change: "Fee applies",
      },
      {
        name: "Eco Flex",
        price: 37217,
        features: ["1 carry-on + 1 checked bag", "Free cancellation"],
        baggage: "23kg",
        refund: "Free cancellation",
        change: "Fee applies",
      },
      {
        name: "Eco Regular",
        price: 41203,
        features: ["Priority boarding", "Extra legroom"],
        baggage: "23kg",
        refund: "Free cancellation",
        change: "No fee",
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
    returnDepartureTime: "09:40",
    returnArrivalTime: "14:25",
    returnDate: "16-Aug-2024",
    returnDuration: "4h 15m",
    airline: "Emirates Airlines",
    logo: "https://cdn.builder.io/api/v1/image/assets%2F4235b10530ff469795aa00c0333d773c%2F215eedd64de04ad0ab3a8edccfc2f2c5?format=webp&width=800",
    aircraft: "Airbus A380",
    flightType: "Direct",
    fareTypes: [
      {
        name: "Eco Saver",
        price: 32189,
        features: ["1 carry-on bag included"],
        baggage: "23kg",
        refund: "No refund",
        change: "Fee applies",
      },
      {
        name: "Eco Flex",
        price: 37217,
        features: ["1 carry-on + 1 checked bag", "Free cancellation"],
        baggage: "23kg",
        refund: "Free cancellation",
        change: "Fee applies",
      },
      {
        name: "Eco Regular",
        price: 41203,
        features: ["Priority boarding", "Extra legroom"],
        baggage: "23kg",
        refund: "Free cancellation",
        change: "No fee",
      },
    ],
  },
  {
    id: 3,
    departureTime: "14:50",
    arrivalTime: "03:10",
    departureCode: "BOM",
    arrivalCode: "DXB",
    duration: "9h 50m",
    date: "09-Aug-2024",
    returnDepartureTime: "22:45",
    returnArrivalTime: "06:40",
    returnDate: "16-Aug-2024",
    returnDuration: "5h 25m",
    airline: "Qatar Airways",
    logo: "https://logos-world.net/wp-content/uploads/2020/03/Qatar-Airways-Logo.png",
    aircraft: "Boeing 787",
    flightType: "1 stop",
    stopInfo: "1h 30m • DOH",
    fareTypes: [
      {
        name: "Eco Saver",
        price: 28950,
        features: ["1 carry-on bag included"],
        baggage: "20kg",
        refund: "No refund",
        change: "Fee applies",
      },
      {
        name: "Eco Flex",
        price: 33180,
        features: ["1 carry-on + 1 checked bag", "Free cancellation"],
        baggage: "25kg",
        refund: "Free cancellation",
        change: "Fee applies",
      },
    ],
  },
  {
    id: 4,
    departureTime: "10:05",
    arrivalTime: "21:25",
    departureCode: "BOM",
    arrivalCode: "DXB",
    duration: "8h 50m",
    date: "09-Aug-2024",
    returnDepartureTime: "06:00",
    returnArrivalTime: "13:40",
    returnDate: "16-Aug-2024",
    returnDuration: "5h 10m",
    airline: "Air India",
    logo: "https://logos-world.net/wp-content/uploads/2021/02/Air-India-Logo.png",
    aircraft: "Airbus A320",
    flightType: "1 stop",
    stopInfo: "2h 15m • DEL",
    fareTypes: [
      {
        name: "Eco Saver",
        price: 25680,
        features: ["1 carry-on bag included"],
        baggage: "15kg",
        refund: "No refund",
        change: "Fee applies",
      },
      {
        name: "Eco Regular",
        price: 29420,
        features: ["1 carry-on + 1 checked bag"],
        baggage: "20kg",
        refund: "Partial refund",
        change: "Fee applies",
      },
    ],
  },
  {
    id: 5,
    departureTime: "16:20",
    arrivalTime: "03:10",
    departureCode: "BOM",
    arrivalCode: "DXB",
    duration: "8h 20m",
    date: "09-Aug-2024",
    returnDepartureTime: "22:45",
    returnArrivalTime: "06:40",
    returnDate: "16-Aug-2024",
    returnDuration: "5h 25m",
    airline: "IndiGo",
    logo: "https://logos-world.net/wp-content/uploads/2021/02/IndiGo-Logo.png",
    aircraft: "Airbus A320neo",
    flightType: "1 stop",
    stopInfo: "1h 45m • HYD",
    fareTypes: [
      {
        name: "6E Saver",
        price: 24150,
        features: ["1 carry-on bag included"],
        baggage: "15kg",
        refund: "No refund",
        change: "Fee applies",
      },
      {
        name: "6E Flex",
        price: 27890,
        features: ["1 carry-on + 1 checked bag", "Date change allowed"],
        baggage: "20kg",
        refund: "Partial refund",
        change: "No fee",
      },
    ],
  },
];

// Amenity icon component
const getAmenityIcon = (amenity: string) => {
  switch (amenity) {
    case "luggage":
      return <Luggage className="w-4 h-4" />;
    case "wifi":
      return <Wifi className="w-4 h-4" />;
    case "meals":
      return <Coffee className="w-4 h-4" />;
    case "entertainment":
      return <Tv className="w-4 h-4" />;
    default:
      return <Luggage className="w-4 h-4" />;
  }
};

export default function FlightResults() {
  const [selectedFlight, setSelectedFlight] = useState<
    (typeof flightData)[0] | null
  >(null);
  const [showBargainModal, setShowBargainModal] = useState(false);
  const [bargainStep, setBargainStep] = useState<
    "input" | "progress" | "result"
  >("input");
  const [bargainPrice, setBargainPrice] = useState("");
  const [bargainProgress, setBargainProgress] = useState(0);
  const [bargainResult, setBargainResult] = useState<
    "accepted" | "rejected" | null
  >(null);
  const [finalPrice, setFinalPrice] = useState(0);
  const [expandedFlights, setExpandedFlights] = useState<Set<number>>(
    new Set(),
  );
  const [sortType, setSortType] = useState<"best" | "cheapest" | "fastest">(
    "best",
  );
  const [selectedFareType, setSelectedFareType] = useState<{
    [key: number]: number;
  }>({});
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTravelers, setShowTravelers] = useState(false);
  const [travelers, setTravelers] = useState({ adults: 1, children: 0 });
  const [selectedDepartureDate, setSelectedDepartureDate] =
    useState("09-Dec-2024");
  const [selectedReturnDate, setSelectedReturnDate] = useState("16-Dec-2024");
  const [selectingDeparture, setSelectingDeparture] = useState(true);
  const [tripType, setTripType] = useState<
    "round-trip" | "one-way" | "multi-city"
  >("round-trip");
  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const [selectedClass, setSelectedClass] = useState("Economy");
  const [showFromCities, setShowFromCities] = useState(false);
  const [showToCities, setShowToCities] = useState(false);
  const [selectedFromCity, setSelectedFromCity] = useState("Mumbai");
  const [selectedToCity, setSelectedToCity] = useState("Dubai");
  const [showFlightDetails, setShowFlightDetails] = useState(false);
  const [selectedFlightForDetails, setSelectedFlightForDetails] = useState<
    (typeof flightData)[0] | null
  >(null);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");

  // Auth form states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerFirstName, setRegisterFirstName] = useState("");
  const [registerLastName, setRegisterLastName] = useState("");
  const [authError, setAuthError] = useState("");

  // Test credentials - hardcoded for demo
  const testCredentials = {
    email: "test@faredown.com",
    password: "password123",
    name: "Zubin Aibara",
  };

  // Authentication functions
  const handleSignIn = () => {
    setAuthError("");
    if (
      loginEmail === testCredentials.email &&
      loginPassword === testCredentials.password
    ) {
      setIsLoggedIn(true);
      setUserName(testCredentials.name);
      setShowSignIn(false);
      setLoginEmail("");
      setLoginPassword("");
    } else {
      setAuthError("Invalid email or password");
    }
  };

  const handleRegister = () => {
    setAuthError("");
    if (
      registerEmail &&
      registerPassword &&
      registerFirstName &&
      registerLastName
    ) {
      if (registerPassword.length < 8) {
        setAuthError("Password must be at least 8 characters long");
        return;
      }
      setIsLoggedIn(true);
      setUserName(`${registerFirstName} ${registerLastName}`);
      setShowRegister(false);
      setRegisterEmail("");
      setRegisterPassword("");
      setRegisterFirstName("");
      setRegisterLastName("");
    } else {
      setAuthError("Please fill in all fields");
    }
  };

  const handleSignOut = () => {
    setIsLoggedIn(false);
    setUserName("");
  };

  // City data mapping
  const cityData = {
    Mumbai: {
      code: "BOM",
      name: "Mumbai",
      airport: "Rajiv Gandhi Shivaji International",
      fullName: "Mumbai, Maharashtra, India",
    },
    Delhi: {
      code: "DEL",
      name: "Delhi",
      airport: "Indira Gandhi International",
      fullName: "New Delhi, Delhi, India",
    },
    Dubai: {
      code: "DXB",
      name: "Dubai",
      airport: "Dubai International Airport",
      fullName: "Dubai, United Arab Emirates",
    },
    "Abu Dhabi": {
      code: "AUH",
      name: "Abu Dhabi",
      airport: "Zayed International",
      fullName: "Abu Dhabi, United Arab Emirates",
    },
    Singapore: {
      code: "SIN",
      name: "Singapore",
      airport: "Changi Airport",
      fullName: "Singapore, Singapore",
    },
  };
  const [bargainTimer, setBargainTimer] = useState(0);
  const [usedPrices, setUsedPrices] = useState<{ [key: number]: number[] }>({});
  const [faredownBonus, setFaredownBonus] = useState(0);
  const [marketSuggestions, setMarketSuggestions] = useState<number[]>([]);
  const [isTimerActive, setIsTimerActive] = useState(false);

  const handleBargain = (flight: (typeof flightData)[0]) => {
    setSelectedFlight(flight);
    setShowBargainModal(true);
    setBargainStep("input");
    setBargainPrice("");
    setBargainProgress(0);
    setBargainResult(null);
    setFinalPrice(0);
  };

  const getSelectedFare = (flight: (typeof flightData)[0]) => {
    const selectedIndex = selectedFareType[flight.id] ?? 0;
    return flight.fareTypes[selectedIndex];
  };

  const getMinBargainPrice = (flight: (typeof flightData)[0]) => {
    const selectedFare = getSelectedFare(flight);
    return Math.round(selectedFare.price * 0.9);
  };

  const getMaxBargainPrice = (flight: (typeof flightData)[0]) => {
    const selectedFare = getSelectedFare(flight);
    return selectedFare.price - 1000;
  };

  const isValidBargainPrice = (
    price: string,
    flight: (typeof flightData)[0],
  ) => {
    const numPrice = parseInt(price);
    if (isNaN(numPrice)) return false;
    return (
      numPrice >= getMinBargainPrice(flight) &&
      numPrice <= getMaxBargainPrice(flight)
    );
  };

  const toggleExpandedOptions = (flightId: number) => {
    const newExpanded = new Set(expandedFlights);
    if (newExpanded.has(flightId)) {
      newExpanded.delete(flightId);
    } else {
      newExpanded.add(flightId);
    }
    setExpandedFlights(newExpanded);
  };

  const generateMarketSuggestions = (currentPrice: number) => {
    const suggestions = [
      Math.round(currentPrice * 0.92), // 8% off
      Math.round(currentPrice * 0.88), // 12% off
      Math.round(currentPrice * 0.85), // 15% off
    ];
    setMarketSuggestions(suggestions);
  };

  const generateFaredownBonus = () => {
    // Random bonus between 500-2000
    const bonus = Math.floor(Math.random() * 1500) + 500;
    setFaredownBonus(bonus);
  };

  const startTimer = () => {
    setBargainTimer(30);
    setIsTimerActive(true);

    const timerInterval = setInterval(() => {
      setBargainTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerInterval);
          setIsTimerActive(false);
          setBargainStep("input");
          setBargainPrice("");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const isPriceUsed = (price: number, flightId: number) => {
    return usedPrices[flightId]?.includes(price) || false;
  };

  const startBargaining = () => {
    if (!selectedFlight || !bargainPrice) return;

    const targetPrice = parseInt(bargainPrice);

    // Check if price was already used
    if (isPriceUsed(targetPrice, selectedFlight.id)) {
      alert(
        "🚫 You've already tried this price! Enter a different amount to get a fresh deal.",
      );
      return;
    }

    // Add price to used prices
    setUsedPrices((prev) => ({
      ...prev,
      [selectedFlight.id]: [...(prev[selectedFlight.id] || []), targetPrice],
    }));

    setBargainStep("progress");
    setBargainProgress(0);
    generateFaredownBonus();

    const progressInterval = setInterval(() => {
      setBargainProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          const selectedFare = getSelectedFare(selectedFlight);
          const currentPrice = selectedFare.price;
          const discountRequested = (currentPrice - targetPrice) / currentPrice;

          const successProbability = Math.max(
            0.3,
            0.85 - discountRequested * 1.2,
          );
          const isAccepted = Math.random() < successProbability;

          setBargainResult(isAccepted ? "accepted" : "rejected");
          setBargainStep("result");

          if (isAccepted) {
            setFinalPrice(targetPrice - faredownBonus);
            startTimer();
          }

          return 100;
        }
        return prev + 10;
      });
    }, 200);
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
                <span className="text-white hover:text-blue-200 cursor-pointer flex items-center font-semibold border-b-2 border-white py-4">
                  Flights
                </span>
                <span className="text-white hover:text-blue-200 cursor-pointer flex items-center py-4">
                  Hotels
                </span>
                <span className="text-white hover:text-blue-200 cursor-pointer flex items-center py-4">
                  Transfers
                </span>
                <span className="text-white hover:text-blue-200 cursor-pointer flex items-center py-4">
                  Sightseeing
                </span>
                <span className="text-white hover:text-blue-200 cursor-pointer py-4">
                  Sports & Events
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
                        <Link to="/account" className="flex items-center">
                          <User className="w-4 h-4 mr-2" />
                          My account
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link to="/account/trips" className="flex items-center">
                          <BookOpen className="w-4 h-4 mr-2" />
                          Bookings & Trips
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Award className="w-4 h-4 mr-2" />
                        Loyalty program
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link
                          to="/account/payment"
                          className="flex items-center"
                        >
                          <CreditCard className="w-4 h-4 mr-2" />
                          Rewards & Wallet
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="w-4 h-4 mr-2" />
                        Reviews
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Heart className="w-4 h-4 mr-2" />
                        Saved
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

        {/* Search bar */}
        <div className="bg-white border-b border-gray-200 overflow-visible">
          <div className="max-w-7xl mx-auto px-4 py-3 overflow-visible">
            <div className="flex items-center justify-between">
              <div className="flex items-center bg-white rounded-lg p-3 flex-1 mr-4">
                <div className="flex items-center space-x-6">
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
            <div className="flex items-center space-x-2 mt-2 h-12 overflow-visible">
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
                      <button
                        onClick={() => {
                          setSelectedFromCity("Mumbai");
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
                              Mumbai • Rajiv Gandhi Shivaji International
                            </div>
                            <div className="text-xs text-gray-500">
                              Mumbai, Maharashtra, India
                            </div>
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedFromCity("Delhi");
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
                              Delhi �� Indira Gandhi International
                            </div>
                            <div className="text-xs text-gray-500">
                              New Delhi, Delhi, India
                            </div>
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedFromCity("Bangalore");
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
                              Bangalore • Kempegowda International
                            </div>
                            <div className="text-xs text-gray-500">
                              Bangalore, Karnataka, India
                            </div>
                          </div>
                        </div>
                      </button>
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
                      <button
                        onClick={() => {
                          setSelectedToCity("Dubai");
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
                              Dubai • Dubai International
                            </div>
                            <div className="text-xs text-gray-500">
                              Dubai, United Arab Emirates
                            </div>
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedToCity("Abu Dhabi");
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
                              Abu Dhabi • Zayed International
                            </div>
                            <div className="text-xs text-gray-500">
                              Abu Dhabi, United Arab Emirates
                            </div>
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedToCity("Singapore");
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
                              Singapore • Changi Airport
                            </div>
                            <div className="text-xs text-gray-500">
                              Singapore, Singapore
                            </div>
                          </div>
                        </div>
                      </button>
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
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
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
                        <ChevronRight className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 divide-x divide-gray-200">
                      {/* August Calendar */}
                      <div className="p-4">
                        <div className="grid grid-cols-7 gap-1 mb-3">
                          <div className="text-center py-2 text-xs font-medium text-gray-500">
                            Su
                          </div>
                          <div className="text-center py-2 text-xs font-medium text-gray-500">
                            Mo
                          </div>
                          <div className="text-center py-2 text-xs font-medium text-gray-500">
                            Tu
                          </div>
                          <div className="text-center py-2 text-xs font-medium text-gray-500">
                            We
                          </div>
                          <div className="text-center py-2 text-xs font-medium text-gray-500">
                            Th
                          </div>
                          <div className="text-center py-2 text-xs font-medium text-gray-500">
                            Fr
                          </div>
                          <div className="text-center py-2 text-xs font-medium text-gray-500">
                            Sa
                          </div>
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                          {Array.from({ length: 42 }, (_, i) => {
                            const day = i - 6; // December 2024 starts on Sunday
                            const isValidDay = day >= 1 && day <= 31;
                            const isDeparture = isValidDay && day === 9;
                            const isReturn = isValidDay && day === 16;
                            const isInRange = isValidDay && day > 9 && day < 16;

                            if (!isValidDay) {
                              return <div key={i} className="h-10"></div>;
                            }

                            return (
                              <button
                                key={i}
                                onClick={() => {
                                  if (tripType === "one-way") {
                                    setSelectedDepartureDate(
                                      `${day.toString().padStart(2, "0")}-Dec-2024`,
                                    );
                                  } else {
                                    if (selectingDeparture) {
                                      setSelectedDepartureDate(
                                        `${day.toString().padStart(2, "0")}-Dec-2024`,
                                      );
                                      setSelectingDeparture(false);
                                    } else {
                                      setSelectedReturnDate(
                                        `${day.toString().padStart(2, "0")}-Dec-2024`,
                                      );
                                      setSelectingDeparture(true);
                                    }
                                  }
                                }}
                                className={cn(
                                  "h-10 w-10 text-sm font-medium flex items-center justify-center hover:bg-blue-50 transition-colors rounded text-gray-900",
                                  tripType === "one-way"
                                    ? isDeparture &&
                                        "bg-blue-600 text-white hover:bg-blue-700"
                                    : (isDeparture &&
                                        "bg-blue-600 text-white hover:bg-blue-700") ||
                                        (isReturn &&
                                          "bg-blue-600 text-white hover:bg-blue-700") ||
                                        (isInRange &&
                                          "bg-blue-100 text-blue-900"),
                                )}
                              >
                                {day}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* January Calendar */}
                      <div className="p-4">
                        <div className="grid grid-cols-7 gap-1 mb-3">
                          <div className="text-center py-2 text-xs font-medium text-gray-500">
                            Su
                          </div>
                          <div className="text-center py-2 text-xs font-medium text-gray-500">
                            Mo
                          </div>
                          <div className="text-center py-2 text-xs font-medium text-gray-500">
                            Tu
                          </div>
                          <div className="text-center py-2 text-xs font-medium text-gray-500">
                            We
                          </div>
                          <div className="text-center py-2 text-xs font-medium text-gray-500">
                            Th
                          </div>
                          <div className="text-center py-2 text-xs font-medium text-gray-500">
                            Fr
                          </div>
                          <div className="text-center py-2 text-xs font-medium text-gray-500">
                            Sa
                          </div>
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                          {Array.from({ length: 42 }, (_, i) => {
                            const day = i - 2; // January 2025 starts on Wednesday
                            const isValidDay = day >= 1 && day <= 31;

                            if (!isValidDay) {
                              return <div key={i} className="h-10"></div>;
                            }

                            return (
                              <button
                                key={i}
                                onClick={() => {
                                  if (tripType === "one-way") {
                                    setSelectedDepartureDate(
                                      `${day.toString().padStart(2, "0")}-Jan-2025`,
                                    );
                                  } else {
                                    if (selectingDeparture) {
                                      setSelectedDepartureDate(
                                        `${day.toString().padStart(2, "0")}-Jan-2025`,
                                      );
                                      setSelectingDeparture(false);
                                    } else {
                                      setSelectedReturnDate(
                                        `${day.toString().padStart(2, "0")}-Jan-2025`,
                                      );
                                      setSelectingDeparture(true);
                                    }
                                  }
                                }}
                                className="h-10 w-10 text-sm font-medium flex items-center justify-center hover:bg-blue-50 transition-colors rounded text-gray-900"
                              >
                                {day}
                              </button>
                            );
                          })}
                        </div>
                      </div>
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
                  className="flex items-center bg-white rounded border border-gray-300 px-3 py-2 h-12 min-w-[100px] hover:border-blue-500"
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span className="text-sm text-gray-700 font-medium">
                    {travelers.adults} adult{travelers.adults > 1 ? "s" : ""}
                    {travelers.children > 0
                      ? `, ${travelers.children} child${travelers.children > 1 ? "ren" : ""}`
                      : ""}
                  </span>
                </button>

                {showTravelers && (
                  <div className="absolute top-14 right-0 bg-white border border-gray-300 rounded-md shadow-xl p-4 z-50 w-72">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between py-2">
                        <div>
                          <div className="font-medium text-gray-900">
                            Adults
                          </div>
                          <div className="text-sm text-gray-500">Age 18+</div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() =>
                              setTravelers((prev) => ({
                                ...prev,
                                adults: Math.max(1, prev.adults - 1),
                              }))
                            }
                            disabled={travelers.adults <= 1}
                            className="w-8 h-8 rounded-full border-2 border-blue-600 flex items-center justify-center hover:bg-blue-50 disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed text-blue-600 font-bold"
                          >
                            −
                          </button>
                          <span className="w-8 text-center font-medium text-gray-900">
                            {travelers.adults}
                          </span>
                          <button
                            onClick={() =>
                              setTravelers((prev) => ({
                                ...prev,
                                adults: prev.adults + 1,
                              }))
                            }
                            className="w-8 h-8 rounded-full border-2 border-blue-600 flex items-center justify-center hover:bg-blue-50 text-blue-600 font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between py-2">
                        <div>
                          <div className="font-medium text-gray-900">
                            Children
                          </div>
                          <div className="text-sm text-gray-500">Age 0-17</div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() =>
                              setTravelers((prev) => ({
                                ...prev,
                                children: Math.max(0, prev.children - 1),
                              }))
                            }
                            disabled={travelers.children <= 0}
                            className="w-8 h-8 rounded-full border-2 border-blue-600 flex items-center justify-center hover:bg-blue-50 disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed text-blue-600 font-bold"
                          >
                            −
                          </button>
                          <span className="w-8 text-center font-medium text-gray-900">
                            {travelers.children}
                          </span>
                          <button
                            onClick={() =>
                              setTravelers((prev) => ({
                                ...prev,
                                children: prev.children + 1,
                              }))
                            }
                            className="w-8 h-8 rounded-full border-2 border-blue-600 flex items-center justify-center hover:bg-blue-50 text-blue-600 font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="pt-2">
                        <Button
                          onClick={() => setShowTravelers(false)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3"
                        >
                          Done
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded h-12 font-medium text-sm">
                Search
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex gap-6">
            {/* Filters Sidebar */}
            <div className="w-80 flex-shrink-0">
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Filter your results
                    </h3>
                    <button className="text-sm text-blue-600 hover:text-blue-700">
                      Reset
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Showing 6 of 7 flights
                  </p>
                </div>

                <div className="p-4 space-y-6">
                  {/* Stops Filter */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Stops</h4>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between cursor-pointer">
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="stops"
                            className="w-4 h-4 text-blue-600"
                            defaultChecked
                          />
                          <span className="text-sm text-gray-700">Any</span>
                        </div>
                        <span className="text-sm text-gray-500">669</span>
                      </label>
                      <label className="flex items-center justify-between cursor-pointer">
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="stops"
                            className="w-4 h-4 text-blue-600"
                          />
                          <div>
                            <div className="text-sm text-gray-700">
                              Direct only
                            </div>
                            <div className="text-xs text-gray-500">
                              From ₹32,189.42
                            </div>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">36</span>
                      </label>
                      <label className="flex items-center justify-between cursor-pointer">
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="stops"
                            className="w-4 h-4 text-blue-600"
                          />
                          <div>
                            <div className="text-sm text-gray-700">
                              1 stop max
                            </div>
                            <div className="text-xs text-gray-500">
                              From ₹28,432.00
                            </div>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">131</span>
                      </label>
                    </div>
                  </div>

                  <hr className="border-gray-200" />

                  {/* Airlines Filter */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">Airlines</h4>
                      <button className="text-sm text-blue-600 hover:text-blue-700">
                        Reset
                      </button>
                    </div>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between cursor-pointer group">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-blue-600"
                            defaultChecked
                          />
                          <span className="text-sm text-gray-700 relative">
                            Emirates Airlines
                            <div className="absolute left-0 top-6 bg-blue-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                              Only this airline
                            </div>
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">432</span>
                      </label>
                      <label className="flex items-center justify-between cursor-pointer">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="text-sm text-gray-700">
                            Air India
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">154</span>
                      </label>
                      <label className="flex items-center justify-between cursor-pointer">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="text-sm text-gray-700">
                            Fly Dubai
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">67</span>
                      </label>
                      <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center">
                        Show all <ChevronDown className="w-3 h-3 ml-1" />
                      </button>
                    </div>
                  </div>

                  <hr className="border-gray-200" />

                  {/* Flight times */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">
                        Flight times
                      </h4>
                      <button className="text-sm text-blue-600 hover:text-blue-700">
                        Show all ▼
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 mb-3">
                          Depart Chhatrapati Shivaji International Airport
                          Mumbai
                        </div>
                        <div className="space-y-2">
                          <label className="flex items-center justify-between cursor-pointer">
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                className="w-4 h-4 text-blue-600"
                              />
                              <span className="text-sm text-gray-700">
                                3:00 AM-6:59 AM
                              </span>
                            </div>
                            <span className="text-sm text-gray-500">12</span>
                          </label>
                          <label className="flex items-center justify-between cursor-pointer">
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                className="w-4 h-4 text-blue-600"
                              />
                              <span className="text-sm text-gray-700">
                                6:00 AM-11:59 AM
                              </span>
                            </div>
                            <span className="text-sm text-gray-500">8</span>
                          </label>
                          <label className="flex items-center justify-between cursor-pointer">
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                className="w-4 h-4 text-blue-600"
                              />
                              <span className="text-sm text-gray-700">
                                12:00 PM-5:59 PM
                              </span>
                            </div>
                            <span className="text-sm text-gray-500">6</span>
                          </label>
                          <label className="flex items-center justify-between cursor-pointer">
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                className="w-4 h-4 text-blue-600"
                              />
                              <span className="text-sm text-gray-700">
                                6:00 PM-11:59 PM
                              </span>
                            </div>
                            <span className="text-sm text-gray-500">10</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-medium text-gray-900 mb-3">
                          Arrives to Dubai
                        </div>
                        <div className="space-y-2">
                          <label className="flex items-center justify-between cursor-pointer">
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                className="w-4 h-4 text-blue-600"
                              />
                              <span className="text-sm text-gray-700">
                                12:00 AM-5:59 AM
                              </span>
                            </div>
                            <span className="text-sm text-gray-500">6</span>
                          </label>
                          <label className="flex items-center justify-between cursor-pointer">
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                className="w-4 h-4 text-blue-600"
                              />
                              <span className="text-sm text-gray-700">
                                6:00 AM-11:59 AM
                              </span>
                            </div>
                            <span className="text-sm text-gray-500">8</span>
                          </label>
                          <label className="flex items-center justify-between cursor-pointer">
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                className="w-4 h-4 text-blue-600"
                              />
                              <span className="text-sm text-gray-700">
                                12:00 PM-5:59 PM
                              </span>
                            </div>
                            <span className="text-sm text-gray-500">8</span>
                          </label>
                          <label className="flex items-center justify-between cursor-pointer">
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                className="w-4 h-4 text-blue-600"
                              />
                              <span className="text-sm text-gray-700">
                                6:00 PM-11:59 PM
                              </span>
                            </div>
                            <span className="text-sm text-gray-500">14</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="flex-1">
              {/* Lucky Banner */}
              <div className="bg-blue-50 border-l-4 border-l-blue-600 rounded-r-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-900 mb-1 text-sm">
                      You're lucky! There are no better prices on nearby dates.
                    </h3>
                    <p className="text-xs text-blue-700">
                      Latest prices found for your search – actual prices shown
                      in next step.
                    </p>
                  </div>
                </div>
              </div>

              {/* Flight Cards */}
              <div className="space-y-4">
                {flightData.map((flight) => (
                  <div
                    key={flight.id}
                    className="border border-gray-200 bg-white rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        {/* Left section - Flight details */}
                        <div className="flex-1">
                          <div className="flex items-start">
                            <div className="w-12 h-12 mr-4 flex-shrink-0">
                              <div className="w-12 h-12 rounded border border-gray-200 flex items-center justify-center bg-white">
                                <img
                                  src={flight.logo}
                                  alt={flight.airline}
                                  className="w-10 h-10 object-contain"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                    e.currentTarget.nextElementSibling.style.display =
                                      "flex";
                                  }}
                                />
                                <div
                                  className="w-10 h-10 bg-red-600 rounded flex items-center justify-center text-white text-xs font-bold"
                                  style={{ display: "none" }}
                                >
                                  EK
                                </div>
                              </div>
                            </div>

                            <div className="flex-1">
                              {/* Outbound Flight */}
                              <div className="mb-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-8">
                                    <div className="text-center">
                                      <div className="text-lg font-bold text-gray-900">
                                        {flight.departureTime}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        {flight.departureCode} • {flight.date}
                                      </div>
                                    </div>

                                    <div className="flex flex-col items-center justify-center">
                                      <div className="flex items-center justify-center">
                                        <div
                                          className={`w-2 h-2 rounded-full ${flight.flightType === "Direct" ? "bg-blue-600" : "bg-gray-400"}`}
                                        ></div>
                                        <div className="h-px bg-gray-300 w-16 mx-2"></div>
                                        <div
                                          className={`text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap ${flight.flightType === "Direct" ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-gray-50 text-gray-700 border border-gray-200"}`}
                                        >
                                          {flight.flightType}
                                        </div>
                                        <div className="h-px bg-gray-300 w-16 mx-2"></div>
                                        <div
                                          className={`w-2 h-2 rounded-full ${flight.flightType === "Direct" ? "bg-blue-600" : "bg-gray-400"}`}
                                        ></div>
                                      </div>
                                      <div className="text-xs text-gray-500 mt-2 font-medium text-center">
                                        {flight.duration}
                                      </div>
                                      {flight.stopInfo && (
                                        <div className="text-xs text-gray-400 mt-1 text-center">
                                          {flight.stopInfo}
                                        </div>
                                      )}
                                    </div>

                                    <div className="text-center">
                                      <div className="text-lg font-bold text-gray-900">
                                        {flight.arrivalTime}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        {flight.arrivalCode} • {flight.date}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Return Flight - Only show for round-trip */}
                              {tripType === "round-trip" && (
                                <div className="mb-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-8">
                                      <div className="text-center">
                                        <div className="text-lg font-bold text-gray-900">
                                          {flight.returnDepartureTime}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                          {flight.arrivalCode} •{" "}
                                          {flight.returnDate}
                                        </div>
                                      </div>

                                      <div className="flex flex-col items-center justify-center">
                                        <div className="flex items-center justify-center">
                                          <div
                                            className={`w-2 h-2 rounded-full ${flight.flightType === "Direct" ? "bg-blue-600" : "bg-gray-400"}`}
                                          ></div>
                                          <div className="h-px bg-gray-300 w-16 mx-2"></div>
                                          <div
                                            className={`text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap ${flight.flightType === "Direct" ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-gray-50 text-gray-700 border border-gray-200"}`}
                                          >
                                            {flight.flightType}
                                          </div>
                                          <div className="h-px bg-gray-300 w-16 mx-2"></div>
                                          <div
                                            className={`w-2 h-2 rounded-full ${flight.flightType === "Direct" ? "bg-blue-600" : "bg-gray-400"}`}
                                          ></div>
                                        </div>
                                        <div className="text-xs text-gray-500 mt-2 font-medium text-center">
                                          {flight.returnDuration}
                                        </div>
                                      </div>

                                      <div className="text-center">
                                        <div className="text-lg font-bold text-gray-900">
                                          {flight.returnArrivalTime}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                          {flight.departureCode} ��{" "}
                                          {flight.returnDate}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Airline name positioned more to the left */}
                              <div className="text-sm text-gray-600 font-medium -ml-16 mt-2">
                                {flight.airline}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right section - Price and buttons */}
                        <div className="ml-6 text-center min-w-[120px]">
                          <div className="text-sm font-semibold text-gray-700 mb-2">
                            {getSelectedFare(flight).name}
                          </div>
                          <div className="flex items-center justify-center space-x-2 mb-3">
                            <div className="p-1 bg-gray-50 rounded-full">
                              <Luggage className="w-3 h-3 text-gray-600" />
                            </div>
                            <div className="p-1 bg-gray-50 rounded-full">
                              <Wifi className="w-3 h-3 text-gray-600" />
                            </div>
                            <div className="p-1 bg-gray-50 rounded-full">
                              <Coffee className="w-3 h-3 text-gray-600" />
                            </div>
                          </div>
                          <div className="text-lg font-bold text-gray-900 mb-1 relative group cursor-help">
                            ₹{getSelectedFare(flight).price.toLocaleString()}
                            <Info className="w-4 h-4 text-gray-400 hover:text-blue-600 inline ml-1 transition-colors" />
                          </div>
                          <div className="text-xs text-gray-500 mb-3">
                            Includes all taxes & service charges
                          </div>

                          {/* Hover tooltip */}
                          <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                              <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-600">
                                    {getSelectedFare(flight).name}
                                  </span>
                                  <span className="text-gray-900">
                                    ���
                                    {getSelectedFare(
                                      flight,
                                    ).price.toLocaleString()}
                                  </span>
                                </div>
                                <div className="border-l-2 border-gray-200 pl-3 space-y-2">
                                  <div className="flex items-center space-x-2 text-xs text-gray-600">
                                    <Luggage className="w-3 h-3" />
                                    <span>1 cabin bag (7 kg)</span>
                                  </div>
                                  <div className="flex items-center space-x-2 text-xs text-gray-600">
                                    <Luggage className="w-3 h-3" />
                                    <span>
                                      1 checked bag (
                                      {flight.fareTypes[0].baggage})
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-2 text-xs text-gray-600">
                                    <Utensils className="w-3 h-3" />
                                    <span>Complimentary food & beverage</span>
                                  </div>
                                  <div className="flex items-center space-x-2 text-xs text-gray-600">
                                    <RefreshCw className="w-3 h-3" />
                                    <span>
                                      {getSelectedFare(flight).refund}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-xs text-gray-500">
                                  {getSelectedFare(flight).features.join(", ")}
                                </div>
                              </div>
                              {/* Arrow pointing up */}
                              <div className="absolute bottom-full right-4 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-white"></div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <button
                              className="text-sm text-blue-700 hover:text-blue-800 border border-blue-200 hover:border-blue-300 bg-blue-50 hover:bg-blue-100 px-4 py-2 block w-full text-center font-medium rounded-lg transition-colors"
                              onClick={() => handleBargain(flight)}
                            >
                              Bargain Price
                            </button>
                            <Button
                              variant="outline"
                              className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 px-6 py-2 w-full font-medium text-sm rounded-lg transition-colors"
                              onClick={() => {
                                setSelectedFlightForDetails(flight);
                                setShowFlightDetails(true);
                              }}
                            >
                              View details
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Explore ticket options footer */}
                    <div className="bg-gray-50 border-t border-gray-200">
                      <button
                        className="w-full px-4 py-3 text-sm text-blue-600 hover:text-blue-700 flex items-center justify-center hover:bg-gray-100 transition-colors"
                        onClick={() => toggleExpandedOptions(flight.id)}
                      >
                        <span className="font-medium">
                          Explore ticket options
                        </span>
                        <ChevronDown
                          className={cn(
                            "w-4 h-4 ml-2 transition-transform",
                            expandedFlights.has(flight.id) && "rotate-180",
                          )}
                        />
                      </button>

                      {expandedFlights.has(flight.id) && (
                        <div className="px-4 pb-4 border-t border-gray-200 bg-white">
                          <div className="space-y-3 pt-3">
                            {flight.fareTypes.map((fare, fareIndex) => (
                              <label
                                key={fareIndex}
                                className="flex justify-between items-center p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-200 hover:bg-blue-50 cursor-pointer transition-colors"
                              >
                                <div className="flex items-center space-x-3">
                                  <input
                                    type="radio"
                                    name={`flight-${flight.id}-fare`}
                                    className="w-4 h-4 text-blue-600"
                                    checked={
                                      (selectedFareType[flight.id] ?? 0) ===
                                      fareIndex
                                    }
                                    onChange={() => {
                                      setSelectedFareType((prev) => ({
                                        ...prev,
                                        [flight.id]: fareIndex,
                                      }));
                                    }}
                                  />
                                  <div>
                                    <div className="font-medium text-gray-900 text-sm">
                                      {fare.name}
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      {fare.features.join(", ")}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right relative group cursor-help">
                                  <div className="font-bold text-gray-900 flex items-center">
                                    ₹{fare.price.toLocaleString()}
                                    <Info className="w-3 h-3 text-gray-400 hover:text-blue-600 ml-1 transition-colors" />
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    + taxes
                                  </div>

                                  {/* Hover tooltip for expanded fare */}
                                  <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">
                                          {fare.name}
                                        </span>
                                        <span className="text-gray-900">
                                          ₹{fare.price.toLocaleString()}
                                        </span>
                                      </div>
                                      <div className="border-l-2 border-gray-200 pl-3 space-y-1">
                                        <div className="flex items-center space-x-2 text-xs text-gray-600">
                                          <Luggage className="w-3 h-3" />
                                          <span>1 cabin bag (7 kg)</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-xs text-gray-600">
                                          <Luggage className="w-3 h-3" />
                                          <span>
                                            1 checked bag ({fare.baggage})
                                          </span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-xs text-gray-600">
                                          <Utensils className="w-3 h-3" />
                                          <span>
                                            Complimentary food & beverage
                                          </span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-xs text-gray-600">
                                          <RefreshCw className="w-3 h-3" />
                                          <span>{fare.refund}</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-xs text-gray-600">
                                          <Info className="w-3 h-3" />
                                          <span>Change: {fare.change}</span>
                                        </div>
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {fare.features.join(", ")}
                                      </div>
                                    </div>
                                    {/* Arrow pointing up */}
                                    <div className="absolute bottom-full right-4 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-white"></div>
                                  </div>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bargain Modal */}
      <Dialog open={showBargainModal} onOpenChange={setShowBargainModal}>
        <DialogContent className="max-w-lg rounded-xl border-0 shadow-2xl">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-center text-2xl font-semibold text-slate-800">
              <span>
                {bargainStep === "input" && "Price Negotiation"}
                {bargainStep === "progress" && "Negotiating Your Price"}
                {bargainStep === "result" &&
                  (bargainResult === "accepted"
                    ? "Negotiation Complete"
                    : "Price Not Accepted")}
              </span>
            </DialogTitle>
            {selectedFlight && (
              <div className="text-center">
                <p className="text-slate-600 font-medium">
                  {selectedFlight.airline}
                </p>
                <p className="text-sm text-slate-500">
                  {selectedFlight.departureCode} → {selectedFlight.arrivalCode}
                </p>
              </div>
            )}
          </DialogHeader>

          {selectedFlight && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-lg font-semibold">
                  {selectedFlight.airline}
                </div>
                <div className="text-sm text-gray-600">
                  {selectedFlight.departureTime} - {selectedFlight.arrivalTime}
                </div>
              </div>

              {bargainStep === "input" && (
                <>
                  <div className="space-y-4">
                    <div className="bg-slate-50 rounded-lg p-4 text-center">
                      <p className="text-sm text-slate-600 mb-2">
                        Current Price ({getSelectedFare(selectedFlight).name})
                      </p>
                      <p className="text-2xl font-bold text-slate-800">
                        ₹
                        {getSelectedFare(selectedFlight).price.toLocaleString()}
                      </p>
                    </div>

                    {/* FOMO Market Demand Indicator */}
                    <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-semibold text-red-700">
                          HIGH DEMAND
                        </span>
                      </div>
                      <p className="text-xs text-red-600 mt-1">
                        �� 47 people viewing • Only 3 seats left at this price!
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* AI Market Suggestions */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        💡 AI Market Suggestions
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() =>
                            setBargainPrice(
                              String(
                                Math.round(
                                  getSelectedFare(selectedFlight).price * 0.92,
                                ),
                              ),
                            )
                          }
                          className="p-2 text-xs bg-green-50 border border-green-200 rounded hover:bg-green-100 transition-colors"
                        >
                          <div className="font-medium text-green-700">
                            Safe Bet
                          </div>
                          <div className="text-green-600">
                            ₹
                            {Math.round(
                              getSelectedFare(selectedFlight).price * 0.92,
                            ).toLocaleString()}
                          </div>
                          <div className="text-xs text-green-500">
                            85% success
                          </div>
                        </button>
                        <button
                          onClick={() =>
                            setBargainPrice(
                              String(
                                Math.round(
                                  getSelectedFare(selectedFlight).price * 0.88,
                                ),
                              ),
                            )
                          }
                          className="p-2 text-xs bg-yellow-50 border border-yellow-200 rounded hover:bg-yellow-100 transition-colors"
                        >
                          <div className="font-medium text-yellow-700">
                            Risky 🎯
                          </div>
                          <div className="text-yellow-600">
                            ₹
                            {Math.round(
                              getSelectedFare(selectedFlight).price * 0.88,
                            ).toLocaleString()}
                          </div>
                          <div className="text-xs text-yellow-500">
                            60% success
                          </div>
                        </button>
                        <button
                          onClick={() =>
                            setBargainPrice(
                              String(
                                Math.round(
                                  getSelectedFare(selectedFlight).price * 0.85,
                                ),
                              ),
                            )
                          }
                          className="p-2 text-xs bg-red-50 border border-red-200 rounded hover:bg-red-100 transition-colors"
                        >
                          <div className="font-medium text-red-700">
                            Bold 🚀
                          </div>
                          <div className="text-red-600">
                            ₹
                            {Math.round(
                              getSelectedFare(selectedFlight).price * 0.85,
                            ).toLocaleString()}
                          </div>
                          <div className="text-xs text-red-500">
                            35% success
                          </div>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="bargain-price"
                        className="block text-sm font-medium mb-2"
                      >
                        🎯 Your Custom Price (No Limits!)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-sm text-gray-400">
                          ₹
                        </span>
                        <Input
                          id="bargain-price"
                          type="number"
                          placeholder="Enter any price you want"
                          value={bargainPrice}
                          onChange={(e) => setBargainPrice(e.target.value)}
                          className="pl-12 text-lg font-bold"
                        />
                      </div>
                    </div>

                    {/* Used Prices Warning */}
                    {usedPrices[selectedFlight.id]?.length > 0 && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="text-sm text-amber-800">
                          ��� Already tried:{" "}
                          {usedPrices[selectedFlight.id]
                            .map((p) => `₹${p.toLocaleString()}`)
                            .join(", ")}
                        </div>
                        <div className="text-xs text-amber-600 mt-1">
                          Enter a different price for a fresh negotiation!
                        </div>
                      </div>
                    )}

                    {/* Market Analysis Info */}
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm text-blue-700">
                        📊 Market Analysis: Flexible pricing based on demand
                      </div>
                      <div className="text-xs text-blue-600 mt-1">
                        Our AI considers 50+ factors including competitor prices
                        & booking patterns
                      </div>
                    </div>

                    <Button
                      onClick={() => {
                        generateMarketSuggestions(
                          getSelectedFare(selectedFlight).price,
                        );
                        startBargaining();
                      }}
                      disabled={!bargainPrice}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-sm"
                    >
                      Start Negotiation
                    </Button>
                  </div>
                </>
              )}

              {bargainStep === "progress" && (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>
                        Current Price ({getSelectedFare(selectedFlight).name}):
                      </span>
                      <span className="font-medium">
                        ���
                        {getSelectedFare(selectedFlight).price.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Your Offer:</span>
                      <span className="font-medium text-orange-600">
                        ₹{parseInt(bargainPrice).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>AI Negotiation Progress</span>
                      <span>{bargainProgress}%</span>
                    </div>
                    <Progress value={bargainProgress} className="h-2" />
                  </div>

                  <div className="text-center text-sm text-gray-600">
                    <ArrowRightLeft className="w-4 h-4 inline mr-1" />
                    Our AI is negotiating with {selectedFlight.airline}...
                  </div>
                </>
              )}

              {bargainStep === "result" && (
                <div className="space-y-3">
                  {bargainResult === "accepted" ? (
                    <>
                      <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                        <CheckCircle className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                        <div className="text-slate-800 font-semibold text-xl mb-4">
                          Negotiation Successful
                        </div>

                        {/* Price Breakdown */}
                        <div className="space-y-2 mb-4 bg-white rounded-lg p-3">
                          <div className="text-lg line-through text-gray-500">
                            Original: ₹
                            {getSelectedFare(
                              selectedFlight,
                            ).price.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600">
                            Your Bargain: ₹
                            {parseInt(bargainPrice).toLocaleString()}
                          </div>
                          <div className="text-sm text-orange-600 font-semibold bg-orange-50 rounded px-2 py-1">
                            ��� Faredown Bonus: -₹
                            {faredownBonus.toLocaleString()}
                          </div>
                          <div className="border-t pt-2">
                            <div className="text-3xl font-bold text-green-700">
                              ₹{finalPrice.toLocaleString()}
                            </div>
                            <div className="text-sm text-green-600">
                              Total Savings: ₹
                              {(
                                getSelectedFare(selectedFlight).price -
                                finalPrice
                              ).toLocaleString()}{" "}
                              🚀
                            </div>
                          </div>
                        </div>

                        {/* Timer */}
                        {isTimerActive && (
                          <div className="bg-gradient-to-r from-red-100 to-orange-100 border border-red-300 rounded-lg p-3 mb-3">
                            <div className="text-blue-700 font-bold text-2xl">
                              {bargainTimer}s
                            </div>
                            <div className="text-blue-600 text-sm font-medium">
                              This exclusive price expires in {bargainTimer}{" "}
                              seconds
                            </div>
                            <div className="text-xs text-blue-500 mt-1">
                              Secure this rate now to complete your booking
                            </div>
                          </div>
                        )}
                      </div>

                      {isTimerActive ? (
                        <Link
                          to={`/ancillaries?flight=${selectedFlight.id}&price=${finalPrice}&bonus=${faredownBonus}&fare=${getSelectedFare(selectedFlight).name}`}
                          className="block w-full"
                        >
                          <Button className="w-full text-lg py-6 font-semibold transition-all shadow-lg bg-slate-900 hover:bg-slate-800 text-white rounded-lg">
                            SECURE THIS DEAL NOW - ₹{finalPrice.toLocaleString()}
                          </Button>
                        </Link>
                      ) : (
                        <Button
                          className="w-full text-lg py-6 font-bold transform transition-all shadow-lg bg-gray-500 cursor-not-allowed"
                          disabled={true}
                        >
                          ⏰ Deal Expired - ₹{finalPrice.toLocaleString()}
                        </Button>
                      )}

                      {!isTimerActive && (
                        <div className="text-center text-sm text-gray-500 mt-2">
                          Don't worry! You can try bargaining again with a
                          different price.
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
                        <div className="text-red-700 font-semibold text-lg mb-1">
                          Sorry, Bargain Declined
                        </div>
                        <div className="text-sm text-red-600 mb-2">
                          {selectedFlight.airline} couldn't match your offer of
                          ₹{parseInt(bargainPrice).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-600">
                          Try a higher amount or book at the current price
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setBargainStep("input");
                            setBargainPrice("");
                          }}
                          className="border-orange-500 text-orange-600 hover:bg-orange-50"
                        >
                          Try Again
                        </Button>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          Book at ₹
                          {getSelectedFare(
                            selectedFlight,
                          ).price.toLocaleString()}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Flight Details Modal */}
      <Dialog open={showFlightDetails} onOpenChange={setShowFlightDetails}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
          {selectedFlightForDetails && (
            <div className="space-y-6">
              <DialogHeader className="pb-4">
                <DialogTitle className="text-xl font-semibold text-gray-900 pr-8">
                  Your flight to Dubai
                </DialogTitle>
                <button
                  onClick={() => setShowFlightDetails(false)}
                  className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
                <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1 mt-2">
                  <span>Share this flight</span>
                </button>
              </DialogHeader>

              {/* Flight to Dubai */}
              <div className="space-y-4">
                <div className="text-base font-semibold text-gray-900">
                  Flight to Dubai
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-xs">✈</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Tue, 1 • 10:15 AM
                    </div>
                  </div>

                  <div className="ml-9 space-y-3">
                    <div>
                      <div className="font-medium text-gray-900">
                        BOM • Chhatrapati Shivaji International Airport Mumbai
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Terminal 2, Gate B3 • Boeing 777 •{" "}
                        <span className="text-orange-600">Economy</span> •
                        Flight time 3h 30m
                      </div>
                    </div>

                    <div>
                      <div className="font-medium text-gray-900">
                        DXB • Dubai International Airport
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Flight to Mumbai */}
              <div className="space-y-4">
                <div className="text-base font-semibold text-gray-900">
                  Flight to Mumbai
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-xs">✈</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Tue, 1 • 1:00 PM
                    </div>
                  </div>

                  <div className="ml-9 space-y-3">
                    <div>
                      <div className="font-medium text-gray-900">
                        DXB • Dubai International Airport
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Terminal 1, Gate A8 • Boeing 777 •{" "}
                        <span className="text-orange-600">Economy</span> ��
                        Flight time 4h 10m
                      </div>
                    </div>

                    <div>
                      <div className="font-medium text-gray-900">
                        BOM • Chhatrapati Shivaji International Airport Mumbai
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Baggage */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Luggage className="w-5 h-5 text-gray-600" />
                  <span className="text-base font-semibold text-gray-900">
                    Baggage
                  </span>
                </div>

                <div className="space-y-4 ml-8">
                  <div className="flex items-center space-x-3">
                    <Luggage className="w-4 h-4 text-blue-600" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">
                          1 carry-on bag
                        </span>
                        <span className="text-blue-600 text-sm font-medium">
                          Included
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Max size 56 x 36 x 23 cm • Max weight 7 kg
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Luggage className="w-4 h-4 text-blue-600" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">
                          1 checked bag
                        </span>
                        <span className="text-blue-600 text-sm font-medium">
                          Included
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Max weight 23 kg
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fare rules */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Info className="w-5 h-5 text-gray-600" />
                  <span className="text-base font-semibold text-gray-900">
                    Fare rules
                  </span>
                </div>
                <div className="ml-8 space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <span>•</span>
                    <span>You're allowed to change this flight for a fee</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>•</span>
                    <span>You're allowed to cancel this flight for a fee</span>
                  </div>
                </div>
              </div>

              {/* Extras you might like */}
              <div className="space-y-4">
                <div className="text-base font-semibold text-gray-900">
                  Extras you might like
                </div>
                <div className="text-sm text-gray-600">
                  Available in the next step (for an extra fee)
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        Flexible ticket
                      </div>
                      <div className="text-sm text-gray-600">
                        Date change possible
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price and Select */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      ₹
                      {getSelectedFare(
                        selectedFlightForDetails,
                      ).price.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      +₹3,840 total
                    </div>
                  </div>
                  <Link
                    to={`/booking?flight=${selectedFlightForDetails.id}&price=${getSelectedFare(selectedFlightForDetails).price}&bonus=0&fare=${getSelectedFare(selectedFlightForDetails).name}`}
                  >
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-base font-semibold">
                      Select
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Sign In Modal */}
      <Dialog open={showSignIn} onOpenChange={setShowSignIn}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">
              Sign in or create an account
            </DialogTitle>
            <button
              onClick={() => setShowSignIn(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </DialogHeader>

          <div className="space-y-4 p-4">
            {/* Test Credentials Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm font-medium text-blue-900 mb-1">
                Test Credentials:
              </p>
              <p className="text-xs text-blue-700">Email: test@faredown.com</p>
              <p className="text-xs text-blue-700">Password: password123</p>
            </div>

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
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <Input
                type="password"
                placeholder="Enter your password"
                className="w-full"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
            </div>

            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
              onClick={handleSignIn}
            >
              Sign in
            </Button>

            <div className="text-center">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
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
                  setShowSignIn(false);
                  setShowRegister(true);
                }}
                className="text-blue-600 hover:underline text-sm"
              >
                Create account
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Register Modal */}
      <Dialog open={showRegister} onOpenChange={setShowRegister}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">
              Create your account
            </DialogTitle>
            <button
              onClick={() => setShowRegister(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
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
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
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
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Use at least 8 characters with a mix of letters, numbers &
                symbols
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First name
              </label>
              <Input
                type="text"
                placeholder="Enter your first name"
                className="w-full"
                value={registerFirstName}
                onChange={(e) => setRegisterFirstName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last name
              </label>
              <Input
                type="text"
                placeholder="Enter your last name"
                className="w-full"
                value={registerLastName}
                onChange={(e) => setRegisterLastName(e.target.value)}
              />
            </div>

            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
              onClick={handleRegister}
            >
              Create account
            </Button>

            <div className="text-center">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full py-3 flex items-center justify-center space-x-2"
              >
                <span>🇬</span>
                <span>Sign up with Google</span>
              </Button>

              <Button
                variant="outline"
                className="w-full py-3 flex items-center justify-center space-x-2"
              >
                <span>📧</span>
                <span>Sign up with Apple</span>
              </Button>

              <Button
                variant="outline"
                className="w-full py-3 flex items-center justify-center space-x-2"
              >
                <span>📘</span>
                <span>Sign up with Facebook</span>
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