import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MobileFilters } from "@/components/MobileFilters";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
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
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowRightLeft,
  X,
  Shield,
  Users,
  User,
  BookOpen,
  Award,
  Heart,
  LogOut,
  Settings,
  CreditCard,
  Luggage,
  Info,
  Target,
  CheckCircle,
  XCircle,
  RefreshCw,
  Menu,
  Star,
} from "lucide-react";

// Flight data with fare types
const flightData = [
  {
    id: 1,
    departureTime: "10:15",
    arrivalTime: "11:45",
    departureCode: "BOM",
    arrivalCode: "DXB",
    duration: "3h 30m",
    returnDepartureTime: "13:00",
    returnArrivalTime: "17:40",
    returnDuration: "4h 40m",
    airline: "Emirates",
    logo: "https://cdn.builder.io/api/v1/image/assets%2F4235b10530ff469795aa00c0333d773c%2F64e4a8449d984f8fb3cfc5224927fe3c?format=webp&width=800",
    aircraft: "Boeing 777",
    flightType: "Direct",
    stops: 0,
    fareTypes: [
      {
        name: "Eco Saver",
        price: 32168,
        features: ["Carry-on included"],
        baggage: "23kg",
      },
      {
        name: "Eco Flex",
        price: 35253,
        features: ["Carry-on + checked bag", "Free cancellation"],
        baggage: "23kg",
      },
      {
        name: "Eco Flexplus",
        price: 37506,
        features: ["Priority boarding", "Extra legroom"],
        baggage: "23kg",
      },
    ],
  },
  {
    id: 2,
    departureTime: "04:25",
    arrivalTime: "06:00",
    departureCode: "BOM",
    arrivalCode: "DXB",
    duration: "3h 35m",
    returnDepartureTime: "13:00",
    returnArrivalTime: "17:40",
    returnDuration: "4h 40m",
    airline: "Emirates",
    logo: "https://cdn.builder.io/api/v1/image/assets%2F4235b10530ff469795aa00c0333d773c%2F64e4a8449d984f8fb3cfc5224927fe3c?format=webp&width=800",
    aircraft: "Boeing 777",
    flightType: "Direct",
    stops: 0,
    fareTypes: [
      {
        name: "Eco Saver",
        price: 32168,
        features: ["Carry-on included"],
        baggage: "23kg",
      },
      {
        name: "Eco Flex",
        price: 35253,
        features: ["Carry-on + checked bag", "Free cancellation"],
        baggage: "23kg",
      },
      {
        name: "Eco Flexplus",
        price: 37506,
        features: ["Priority boarding", "Extra legroom"],
        baggage: "23kg",
      },
    ],
  },
  {
    id: 3,
    departureTime: "14:20",
    arrivalTime: "16:05",
    departureCode: "BOM",
    arrivalCode: "DXB",
    duration: "3h 45m",
    returnDepartureTime: "18:30",
    returnArrivalTime: "23:15",
    returnDuration: "4h 45m",
    airline: "Air India",
    logo: "https://cdn.builder.io/api/v1/image/assets%2F4235b10530ff469795aa00c0333d773c%2F5ced42d744ea46f9b9a1e71f3ee70d15?format=webp&width=800",
    aircraft: "Airbus A320",
    flightType: "Direct",
    stops: 0,
    fareTypes: [
      {
        name: "Economy",
        price: 28450,
        features: ["Carry-on included"],
        baggage: "20kg",
      },
      {
        name: "Premium Economy",
        price: 31200,
        features: ["Carry-on + checked bag", "Priority boarding"],
        baggage: "25kg",
      },
    ],
  },
  {
    id: 4,
    departureTime: "08:15",
    arrivalTime: "12:30",
    departureCode: "BOM",
    arrivalCode: "DXB",
    duration: "4h 15m",
    returnDepartureTime: "14:00",
    returnArrivalTime: "19:30",
    returnDuration: "5h 30m",
    airline: "Indigo",
    logo: "https://cdn.builder.io/api/v1/image/assets%2F4235b10530ff469795aa00c0333d773c%2Fde5fb672c9d04b3f8118cb8a0874235a?format=webp&width=800",
    aircraft: "Airbus A321",
    flightType: "1 Stop",
    stops: 1,
    fareTypes: [
      {
        name: "Saver",
        price: 25890,
        features: ["Carry-on included"],
        baggage: "15kg",
      },
      {
        name: "Flexi",
        price: 29100,
        features: ["Carry-on + checked bag", "Free cancellation"],
        baggage: "20kg",
      },
    ],
  },
];

export default function FlightResults() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get passenger data from URL params
  const adults = parseInt(searchParams.get("adults") || "1");
  const children = parseInt(searchParams.get("children") || "0");
  const [selectedFlight, setSelectedFlight] = useState<
    (typeof flightData)[0] | null
  >(null);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Mobile UI states
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [showSearchEdit, setShowSearchEdit] = useState(false);

  // Search panel states
  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const [selectedClass, setSelectedClass] = useState("Economy");
  const [tripType, setTripType] = useState("round-trip");
  const [showFromCities, setShowFromCities] = useState(false);
  const [showToCities, setShowToCities] = useState(false);
  const [selectedFromCity, setSelectedFromCity] = useState("Mumbai");
  const [selectedToCity, setSelectedToCity] = useState("Dubai");
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTravelers, setShowTravelers] = useState(false);
  const [travelers, setTravelers] = useState({ adults: 1, children: 0 });
  const [selectedDepartureDate, setSelectedDepartureDate] =
    useState("09-Dec-2024");
  const [selectedReturnDate, setSelectedReturnDate] = useState("16-Dec-2024");
  const [selectingDeparture, setSelectingDeparture] = useState(true);
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(0); // 0 = Dec 2024, 1 = Jan 2025, etc.

  // Calendar month data
  const getCalendarMonths = () => {
    const baseDate = new Date(2024, 11, 1); // December 2024
    const months = [];
    for (let i = 0; i < 12; i++) {
      const date = new Date(baseDate.getFullYear(), baseDate.getMonth() + i, 1);
      months.push({
        name: date.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
        year: date.getFullYear(),
        month: date.getMonth(),
        daysInMonth: new Date(
          date.getFullYear(),
          date.getMonth() + 1,
          0,
        ).getDate(),
        firstDayOfWeek: date.getDay(),
      });
    }
    return months;
  };

  const calendarMonths = getCalendarMonths();

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showCalendar && !target.closest(".calendar-container")) {
        setShowCalendar(false);
      }
    };

    if (showCalendar) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCalendar]);

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

  // Auth form states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerFirstName, setRegisterFirstName] = useState("");
  const [registerLastName, setRegisterLastName] = useState("");
  const [authError, setAuthError] = useState("");

  // Bargain states
  const [showBargainModal, setShowBargainModal] = useState(false);
  const [bargainFlight, setBargainFlight] = useState<
    (typeof flightData)[0] | null
  >(null);
  const [bargainFareType, setBargainFareType] = useState<any>(null);
  const [bargainStep, setBargainStep] = useState<
    "input" | "progress" | "result"
  >("input");
  const [bargainPrice, setBargainPrice] = useState("");
  const [bargainProgress, setBargainProgress] = useState(0);
  const [bargainResult, setBargainResult] = useState<
    "accepted" | "rejected" | "counter" | null
  >(null);
  const [finalPrice, setFinalPrice] = useState(0);
  const [bargainTimer, setBargainTimer] = useState(0);
  const [faredownBonus, setFaredownBonus] = useState(0);

  // Flight details modal states
  const [showFlightDetails, setShowFlightDetails] = useState(false);
  const [selectedFlightForDetails, setSelectedFlightForDetails] = useState<
    (typeof flightData)[0] | null
  >(null);
  const [sortBy, setSortBy] = useState<"cheapest" | "fastest">("cheapest");
  const [expandedTicketOptions, setExpandedTicketOptions] = useState<
    number | null
  >(null);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState({
    code: "INR",
    symbol: "₹",
    name: "Indian Rupee",
  });
  const [usedPrices, setUsedPrices] = useState<Set<string>>(new Set());
  const [aiOfferPrice, setAiOfferPrice] = useState<number | null>(null);
  const [isOfferValid, setIsOfferValid] = useState(false);
  const [offerExpiryTime, setOfferExpiryTime] = useState(0);

  // Format number with commas
  const formatNumberWithCommas = (num: string) => {
    if (!num) return "";
    return parseInt(num).toLocaleString("en-IN");
  };

  // Convert number to words (Indian numbering system)
  const numberToWords = (num: string): string => {
    if (!num || parseInt(num) <= 0) return "";

    const n = parseInt(num);
    const ones = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
    ];
    const teens = [
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];

    const convertHundreds = (num: number): string => {
      let result = "";

      if (num >= 100) {
        result += ones[Math.floor(num / 100)] + " Hundred ";
        num %= 100;
      }

      if (num >= 20) {
        result += tens[Math.floor(num / 10)] + " ";
        num %= 10;
      } else if (num >= 10) {
        result += teens[num - 10] + " ";
        return result;
      }

      if (num > 0) {
        result += ones[num] + " ";
      }

      return result;
    };

    if (n === 0) return "Zero";

    let result = "";

    // Handle crores (10,000,000s)
    if (n >= 10000000) {
      result += convertHundreds(Math.floor(n / 10000000)) + "Crore ";
    }

    // Handle lakhs (100,000s)
    if (n >= 100000) {
      const lakhs = Math.floor((n % 10000000) / 100000);
      if (lakhs > 0) {
        result += convertHundreds(lakhs) + "Lakh ";
      }
    }

    // Handle thousands
    if (n >= 1000) {
      const thousands = Math.floor((n % 100000) / 1000);
      if (thousands > 0) {
        result += convertHundreds(thousands) + "Thousand ";
      }
    }

    // Handle hundreds
    const remainder = n % 1000;
    if (remainder > 0) {
      result += convertHundreds(remainder);
    }

    return result.trim() + " Rupees Only";
  };

  // Airlines filter state - Initialize with all airlines selected to show all flights by default
  const [selectedAirlines, setSelectedAirlines] = useState<Set<string>>(
    new Set([
      "Emirates",
      "Air India",
      "Fly Dubai",
      "Air Arabia",
      "Spice Air",
      "Gopal Air",
      "Spicejet",
      "Indigo",
    ]),
  );

  // Comprehensive airline list with flight counts
  const airlinesData = [
    {
      id: "EK-emirates",
      name: "Emirates",
      code: "EK",
      flights: 424,
      selected: true,
    },
    {
      id: "AI-airindia",
      name: "Air India",
      code: "AI",
      flights: 25,
      selected: false,
    },
    {
      id: "FZ-flydubai",
      name: "Fly Dubai",
      code: "FZ",
      flights: 61,
      selected: false,
    },
    {
      id: "G9-airarabia",
      name: "Air Arabia",
      code: "G9",
      flights: 77,
      selected: false,
    },
    {
      id: "SG-spiceair",
      name: "Spice Air",
      code: "SG",
      flights: 31,
      selected: false,
    },
    {
      id: "GA-gopalair",
      name: "Gopal Air",
      code: "GA",
      flights: 26,
      selected: false,
    },
    {
      id: "SJ-spicejet",
      name: "Spicejet",
      code: "SJ",
      flights: 24,
      selected: false,
    },
    {
      id: "6E-indigo",
      name: "Indigo",
      code: "6E",
      flights: 20,
      selected: false,
    },
    {
      id: "HT-harbour",
      name: "Harbour Technologies",
      code: "HT",
      flights: 15,
      selected: false,
    },
    {
      id: "KU-kuwait",
      name: "Kuwait Airways Corp",
      code: "KU",
      flights: 12,
      selected: false,
    },
    {
      id: "QR-qatar",
      name: "Qatar Air",
      code: "QR",
      flights: 10,
      selected: false,
    },
    {
      id: "GF-gulf",
      name: "Gulf Air",
      code: "GF",
      flights: 9,
      selected: false,
    },
    {
      id: "TK-turkish",
      name: "Turkish Airlines",
      code: "TK",
      flights: 9,
      selected: false,
    },
    {
      id: "SV-saudi",
      name: "Saudi Arabian Airlines",
      code: "SV",
      flights: 6,
      selected: false,
    },
    {
      id: "BA-british",
      name: "British Airways",
      code: "BA",
      flights: 5,
      selected: false,
    },
    {
      id: "ET-ethiopian",
      name: "Ethiopian Airlines",
      code: "ET",
      flights: 3,
      selected: false,
    },
    {
      id: "PC-pegasus",
      name: "Pegasus",
      code: "PC",
      flights: 2,
      selected: false,
    },
    {
      id: "LH-lufthansa",
      name: "Lufthansa",
      code: "LH",
      flights: 2,
      selected: false,
    },
    { id: "TW-tway", name: "Tway", code: "TW", flights: 2, selected: false },
    {
      id: "KC-astana",
      name: "Air Astana",
      code: "KC",
      flights: 1,
      selected: false,
    },
    {
      id: "SQ-singapore",
      name: "Singapore Airlines",
      code: "SQ",
      flights: 1,
      selected: false,
    },
    {
      id: "KQ-kenya",
      name: "Kenya Airways",
      code: "KQ",
      flights: 1,
      selected: false,
    },
    {
      id: "F9-frontier",
      name: "Frontier",
      code: "F9",
      flights: 1,
      selected: false,
    },
    {
      id: "3S-aerologic",
      name: "AeroLogic Airlines",
      code: "3S",
      flights: 1,
      selected: false,
    },
    {
      id: "IG-airitaly",
      name: "Air Italy Airlines",
      code: "IG",
      flights: 1,
      selected: false,
    },
  ];

  // Exchange rates relative to INR (base currency)
  const exchangeRates = {
    USD: 0.012, // 1 INR = 0.012 USD
    EUR: 0.011, // 1 INR = 0.011 EUR
    GBP: 0.0095, // 1 INR = 0.0095 GBP
    INR: 1, // Base currency
    AED: 0.044, // 1 INR = 0.044 AED
    SAR: 0.045, // 1 INR = 0.045 SAR
    JPY: 1.8, // 1 INR = 1.8 JPY
    CNY: 0.087, // 1 INR = 0.087 CNY
    KRW: 16.2, // 1 INR = 16.2 KRW
    SGD: 0.016, // 1 INR = 0.016 SGD
    AUD: 0.018, // 1 INR = 0.018 AUD
    CAD: 0.017, // 1 INR = 0.017 CAD
    CHF: 0.011, // 1 INR = 0.011 CHF
    THB: 0.42, // 1 INR = 0.42 THB
    MYR: 0.056, // 1 INR = 0.056 MYR
  };

  // Convert price from INR to selected currency
  const convertPrice = (priceInINR: number): number => {
    const rate =
      exchangeRates[selectedCurrency.code as keyof typeof exchangeRates] || 1;
    return Math.round(priceInINR * rate);
  };

  // Format price with currency symbol
  const formatPrice = (priceInINR: number): string => {
    if (!priceInINR || isNaN(priceInINR)) {
      return `${selectedCurrency.symbol}0`;
    }
    const convertedPrice = convertPrice(priceInINR);
    return `${selectedCurrency.symbol}${Math.round(convertedPrice).toLocaleString()}`;
  };

  // Handle airline filter selection
  const handleAirlineFilter = (airlineName: string, isChecked: boolean) => {
    setSelectedAirlines((prev) => {
      const newSelected = new Set(prev);
      if (isChecked) {
        newSelected.add(airlineName);
      } else {
        newSelected.delete(airlineName);
      }
      return newSelected;
    });
  };

  // Filter flights based on selected airlines with sorting and pricing logic
  const filteredFlights = (
    selectedAirlines.size === 0
      ? flightData
      : flightData.filter((flight) => selectedAirlines.has(flight.airline))
  )
    .map((flight) => ({
      ...flight,
      // Adjust prices based on trip type
      fareTypes: flight.fareTypes.map((fareType) => ({
        ...fareType,
        price:
          tripType === "one-way" && fareType.price
            ? Math.round(fareType.price * 0.6) // One-way is roughly 60% of round-trip
            : fareType.price || 0, // Fallback to 0 if price is undefined
      })),
      // Add duration in minutes for sorting (safer parsing)
      durationMinutes: (() => {
        try {
          const duration = flight.duration || "0h 0m";
          const hours = parseInt(duration.split("h")[0]) || 0;
          const minutes =
            parseInt(duration.split("h ")[1]?.split("m")[0] || "0") || 0;
          return hours * 60 + minutes;
        } catch {
          return 0; // Fallback for parsing errors
        }
      })(),
    }))
    .sort((a, b) => {
      if (sortBy === "cheapest") {
        const priceA = a.fareTypes[0]?.price || 0;
        const priceB = b.fareTypes[0]?.price || 0;
        return priceA - priceB;
      } else if (sortBy === "fastest") {
        return a.durationMinutes - b.durationMinutes;
      }
      return 0;
    });

  // Test credentials
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

  const handleBooking = (flight: (typeof flightData)[0], fareType: any) => {
    navigate("/booking-flow", {
      state: {
        selectedFlight: flight,
        selectedFareType: fareType,
        negotiatedPrice: fareType.price, // Use the negotiated price from bargain
        passengers: { adults, children },
      },
    });
  };

  // Bargain functions
  const handleBargain = (flight: (typeof flightData)[0], fareType: any) => {
    setBargainFlight(flight);
    setBargainFareType(fareType);
    setShowBargainModal(true);
    setBargainStep("input");
    setBargainPrice("");
    setBargainProgress(0);
    setBargainResult(null);
    setFinalPrice(0);
    setFaredownBonus(0);
  };

  const getMinBargainPrice = (fareType: any) => {
    return Math.round(fareType.price * 0.7);
  };

  const generateFaredownBonus = () => {
    const bonus = Math.floor(Math.random() * 1500) + 500;
    setFaredownBonus(bonus);
  };

  // Flight details functions
  const showFlightDetailsModal = (flight: (typeof flightData)[0]) => {
    setSelectedFlightForDetails(flight);
    setShowFlightDetails(true);
  };

  const startTimer = () => {
    setBargainTimer(30);

    const timerInterval = setInterval(() => {
      setBargainTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerInterval);
          setShowBargainModal(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const generateAICounterOffer = (userPrice: number, originalPrice: number) => {
    const discountRequested = (originalPrice - userPrice) / originalPrice;

    // AI logic: if user's price is reasonable (20-40% off), try to match or get closer
    if (discountRequested <= 0.3) {
      // High chance of matching user's price
      return Math.random() < 0.8 ? userPrice : Math.round(userPrice * 1.05);
    } else if (discountRequested <= 0.5) {
      // Medium chance, offer something between user price and 30% off
      const minOffer = Math.round(originalPrice * 0.7);
      const maxOffer = Math.round(originalPrice * 0.8);
      return Math.max(
        userPrice,
        Math.min(maxOffer, Math.round(userPrice * 1.1)),
      );
    } else {
      // Low chance, offer max 30% off
      return Math.round(originalPrice * 0.7);
    }
  };

  const startBargaining = () => {
    console.log("startBargaining called", { bargainFareType, bargainPrice });

    if (!bargainFareType || !bargainPrice) {
      console.log("Missing fare type or price", {
        bargainFareType,
        bargainPrice,
      });
      return;
    }

    // Convert user input back to INR for internal calculations
    const targetPriceInSelectedCurrency = parseInt(bargainPrice);
    const targetPriceInINR = Math.round(
      targetPriceInSelectedCurrency /
        (exchangeRates[selectedCurrency.code as keyof typeof exchangeRates] ||
          1),
    );
    const currentPriceInINR = bargainFareType.price;
    const priceKey = `${bargainFareType.name}-${targetPriceInSelectedCurrency}`;

    console.log("Validation", {
      targetPriceInSelectedCurrency,
      targetPriceInINR,
      currentPriceInINR,
      priceKey,
    });

    // Check if price was already used
    if (usedPrices.has(priceKey)) {
      alert(
        "You've already tried this price! Please enter a different amount.",
      );
      return;
    }

    if (targetPriceInINR >= currentPriceInINR) {
      alert("Please enter a price lower than the current price!");
      return;
    }

    console.log("Starting bargain process...");

    // Add to used prices
    setUsedPrices((prev) => new Set([...prev, priceKey]));

    setBargainStep("progress");
    setBargainProgress(0);

    const progressInterval = setInterval(() => {
      setBargainProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);

          // Generate AI counter offer (in INR)
          const aiOfferInINR = generateAICounterOffer(
            targetPriceInINR,
            currentPriceInINR,
          );
          setAiOfferPrice(aiOfferInINR);

          // Determine if exact match or counter offer
          const isExactMatch = aiOfferInINR === targetPriceInINR;
          setBargainResult(isExactMatch ? "accepted" : "counter");
          setBargainStep("result");

          // Start 30-second timer
          setIsOfferValid(true);
          setOfferExpiryTime(30);

          const timerInterval = setInterval(() => {
            setOfferExpiryTime((prev) => {
              if (prev <= 1) {
                clearInterval(timerInterval);
                setIsOfferValid(false);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);

          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  return (
    <div
      className="min-h-screen bg-white"
      style={{
        fontFamily:
          'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
      }}
    >
      {/* Header - Enhanced for mobile */}
      <header className="bg-blue-700 text-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link to="/" className="flex items-center space-x-2">
                <span className="text-base sm:text-xl font-bold tracking-tight">
                  faredown.com
                </span>
              </Link>
              <div className="text-xs sm:text-sm text-blue-200 hidden sm:block">
                / Flight Results
              </div>
            </div>
            <div className="flex items-center space-x-2 md:space-x-6">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden text-white p-2 touch-manipulation"
              >
                <Menu className="w-6 h-6" />
              </button>

              <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
                <Link
                  to="/flights"
                  className="text-white hover:text-blue-200 cursor-pointer flex items-center font-semibold border-b-2 border-white py-4"
                >
                  <span>Flights</span>
                </Link>
                <Link
                  to="/hotels"
                  className="text-white hover:text-blue-200 cursor-pointer flex items-center py-4"
                >
                  <span>Hotels</span>
                </Link>
              </nav>

              {/* Language and Currency */}
              <div className="hidden md:flex items-center space-x-4 text-sm">
                <button className="text-white hover:text-blue-200 cursor-pointer flex items-center space-x-1">
                  <span>English (UK)</span>
                </button>
                <div className="relative">
                  <button
                    onClick={() =>
                      setShowCurrencyDropdown(!showCurrencyDropdown)
                    }
                    className="text-white hover:text-blue-200 cursor-pointer flex items-center space-x-1"
                  >
                    <span>
                      {selectedCurrency.symbol} {selectedCurrency.code}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {showCurrencyDropdown && (
                    <div className="absolute top-8 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-50 w-48 max-h-60 overflow-y-auto">
                      {[
                        { code: "USD", symbol: "$", name: "US Dollar" },
                        { code: "EUR", symbol: "€", name: "Euro" },
                        { code: "GBP", symbol: "£", name: "British Pound" },
                        { code: "INR", symbol: "₹", name: "Indian Rupee" },
                        { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
                        { code: "SAR", symbol: "﷼", name: "Saudi Riyal" },
                        { code: "JPY", symbol: "¥", name: "Japanese Yen" },
                        { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
                        { code: "KRW", symbol: "₩", name: "South Korean Won" },
                        { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
                        {
                          code: "AUD",
                          symbol: "A$",
                          name: "Australian Dollar",
                        },
                        { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
                        { code: "CHF", symbol: "CHF", name: "Swiss Franc" },
                        { code: "THB", symbol: "฿", name: "Thai Baht" },
                        {
                          code: "MYR",
                          symbol: "RM",
                          name: "Malaysian Ringgit",
                        },
                      ].map((currency) => (
                        <button
                          key={currency.code}
                          onClick={() => {
                            setSelectedCurrency(currency);
                            setShowCurrencyDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm text-gray-900 flex items-center justify-between"
                        >
                          <span>{currency.name}</span>
                          <span className="font-medium">
                            {currency.symbol} {currency.code}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {isLoggedIn ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center space-x-2 bg-blue-600 rounded-full px-2 md:px-3 py-2 hover:bg-blue-800">
                      <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-black">
                          {userName.charAt(0)}
                        </span>
                      </div>
                      <span className="text-sm text-white hidden sm:inline">
                        {userName}
                      </span>
                      <span className="text-xs text-yellow-300 hidden md:inline">
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
                      className="bg-white text-blue-700 border-white hover:bg-gray-100 rounded text-xs md:text-sm font-medium px-2 md:px-4 py-1.5"
                      onClick={() => setShowRegister(true)}
                    >
                      Register
                    </Button>
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-800 text-white rounded text-xs md:text-sm font-medium px-2 md:px-4 py-1.5"
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
      </header>

      {/* Search Form - Mobile sticky, Desktop inline */}
      <div className="bg-blue-700 py-2 sm:py-4">
        <div className="hidden sm:block bg-white border-b border-gray-200 overflow-visible">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 overflow-visible">
            <div className="flex flex-col gap-4">
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
                      className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded transition-colors"
                    >
                      <div className="w-3 h-3 border-2 border-gray-300 rounded-full"></div>
                      <span className="text-sm text-gray-500">
                        {selectedClass}
                      </span>
                      <ChevronDown className="w-3 h-3 text-gray-500" />
                    </button>
                    {showClassDropdown && (
                      <div className="absolute top-8 left-0 bg-white border border-gray-200 rounded-lg shadow-xl p-2 z-[9999] w-48">
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
            <div className="flex flex-col lg:flex-row items-center gap-2 lg:gap-2 mt-2 max-w-5xl overflow-visible">
              <div className="relative lg:flex-1 lg:max-w-xs w-full lg:w-auto">
                <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-600 font-medium">
                  Leaving from
                </label>
                <button
                  onClick={() => setShowFromCities(!showFromCities)}
                  className="flex items-center bg-white rounded border-2 border-blue-500 px-3 py-2 h-12 w-full hover:border-blue-600"
                >
                  <Plane className="w-4 h-4 text-gray-500 mr-2" />
                  <div className="flex items-center space-x-2">
                    <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">
                      {cityData[selectedFromCity]?.code || "BOM"}
                    </div>
                    <span className="text-sm text-gray-700 font-medium truncate">
                      {cityData[selectedFromCity]?.name || "Mumbai"}
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

              <div className="relative lg:flex-1 lg:max-w-xs w-full lg:w-auto">
                <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-600 font-medium">
                  Going to
                </label>
                <button
                  onClick={() => setShowToCities(!showToCities)}
                  className="flex items-center bg-white rounded border border-gray-300 px-3 py-2 h-12 w-full hover:border-blue-500"
                >
                  <Plane className="w-4 h-4 text-gray-500 mr-2" />
                  <div className="flex items-center space-x-2">
                    <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">
                      {cityData[selectedToCity]?.code || "DXB"}
                    </div>
                    <span className="text-sm text-gray-700 font-medium truncate">
                      {cityData[selectedToCity]?.name || "Dubai"}
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

              <div className="relative overflow-visible lg:max-w-[280px] w-full lg:w-auto">
                <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-600 font-medium">
                  Travel dates
                </label>
                <button
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="flex items-center bg-white rounded border border-gray-300 px-3 py-2 h-12 w-full min-w-[250px] hover:border-blue-500"
                >
                  <svg
                    className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0"
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
                  <span className="text-sm text-gray-700 font-medium truncate">
                    {tripType === "one-way"
                      ? selectedDepartureDate
                      : `${selectedDepartureDate} - ${selectedReturnDate}`}
                  </span>
                </button>

                {showCalendar && (
                  <div className="calendar-container absolute top-14 left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 rounded-lg shadow-2xl z-[9999] w-[650px] overflow-hidden">
                    <div className="flex justify-between items-center p-4 bg-white border-b border-gray-200">
                      <button
                        onClick={() =>
                          setCurrentCalendarMonth(
                            Math.max(0, currentCalendarMonth - 1),
                          )
                        }
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        disabled={currentCalendarMonth === 0}
                      >
                        <ChevronLeft
                          className={`w-4 h-4 ${currentCalendarMonth === 0 ? "text-gray-300" : "text-gray-600"}`}
                        />
                      </button>
                      <div className="flex space-x-16">
                        <div className="text-center">
                          <div className="font-medium text-gray-900">
                            {calendarMonths[currentCalendarMonth]?.name}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-gray-900">
                            {calendarMonths[currentCalendarMonth + 1]?.name}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          setCurrentCalendarMonth(
                            Math.min(10, currentCalendarMonth + 1),
                          )
                        }
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        disabled={currentCalendarMonth >= 10}
                      >
                        <ChevronRight
                          className={`w-4 h-4 ${currentCalendarMonth >= 10 ? "text-gray-300" : "text-gray-600"}`}
                        />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 divide-x divide-gray-200">
                      {/* First Month Calendar */}
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
                            const currentMonth =
                              calendarMonths[currentCalendarMonth];
                            if (!currentMonth)
                              return <div key={i} className="h-10"></div>;

                            const day = i - currentMonth.firstDayOfWeek + 1;
                            const isValidDay =
                              day >= 1 && day <= currentMonth.daysInMonth;

                            if (!isValidDay) {
                              return <div key={i} className="h-10"></div>;
                            }

                            const dateStr = `${day.toString().padStart(2, "0")}-${currentMonth.name.split(" ")[0].slice(0, 3)}-${currentMonth.year}`;
                            const isDeparture =
                              selectedDepartureDate === dateStr;
                            const isReturn = selectedReturnDate === dateStr;

                            return (
                              <button
                                key={i}
                                onClick={() => {
                                  if (tripType === "one-way") {
                                    setSelectedDepartureDate(dateStr);
                                    setShowCalendar(false);
                                  } else {
                                    if (selectingDeparture) {
                                      setSelectedDepartureDate(dateStr);
                                      setSelectingDeparture(false);
                                    } else {
                                      setSelectedReturnDate(dateStr);
                                      setSelectingDeparture(true);
                                      setShowCalendar(false);
                                    }
                                  }
                                }}
                                className={cn(
                                  "h-10 w-10 text-sm font-medium flex items-center justify-center hover:bg-blue-50 transition-colors rounded text-gray-900",
                                  (isDeparture || isReturn) &&
                                    "bg-blue-600 text-white hover:bg-blue-700",
                                )}
                              >
                                {day}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Second Month Calendar */}
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
                            const currentMonth =
                              calendarMonths[currentCalendarMonth + 1];
                            if (!currentMonth)
                              return <div key={i} className="h-10"></div>;

                            const day = i - currentMonth.firstDayOfWeek + 1;
                            const isValidDay =
                              day >= 1 && day <= currentMonth.daysInMonth;

                            if (!isValidDay) {
                              return <div key={i} className="h-10"></div>;
                            }

                            const dateStr = `${day.toString().padStart(2, "0")}-${currentMonth.name.split(" ")[0].slice(0, 3)}-${currentMonth.year}`;
                            const isDeparture =
                              selectedDepartureDate === dateStr;
                            const isReturn = selectedReturnDate === dateStr;

                            return (
                              <button
                                key={i}
                                onClick={() => {
                                  if (tripType === "one-way") {
                                    setSelectedDepartureDate(dateStr);
                                    setShowCalendar(false);
                                  } else {
                                    if (selectingDeparture) {
                                      setSelectedDepartureDate(dateStr);
                                      setSelectingDeparture(false);
                                    } else {
                                      setSelectedReturnDate(dateStr);
                                      setSelectingDeparture(true);
                                      setShowCalendar(false);
                                    }
                                  }
                                }}
                                className={cn(
                                  "h-10 w-10 text-sm font-medium flex items-center justify-center hover:bg-blue-50 transition-colors rounded text-gray-900",
                                  (isDeparture || isReturn) &&
                                    "bg-blue-600 text-white hover:bg-blue-700",
                                )}
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

              <div className="relative lg:max-w-[150px] w-full lg:w-auto">
                <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-600 font-medium">
                  Travelers
                </label>
                <button
                  onClick={() => setShowTravelers(!showTravelers)}
                  className="flex items-center bg-white rounded border border-gray-300 px-3 py-2 h-12 w-full min-w-[120px] hover:border-blue-500"
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
                    {travelers.adults} adult
                    {travelers.adults > 1 ? "s" : ""}
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

              <div className="lg:max-w-[100px] w-full lg:w-auto">
                <Link to="/flights">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded h-12 font-medium text-sm w-full">
                    Search
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Search Summary */}
        <div className="sm:hidden bg-white mx-3 rounded-lg shadow-sm border">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-sm text-gray-600">BOM → DXB</div>
                <div className="text-sm text-gray-600">•</div>
                <div className="text-sm text-gray-600">Dec 9-16</div>
                <div className="text-sm text-gray-600">1 adult</div>
                <div className="text-sm text-gray-600">
                  {travelers.adults + travelers.children} travelers
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-600 px-2 py-1 h-auto text-xs"
                onClick={() => setShowSearchEdit(!showSearchEdit)}
              >
                Edit
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-6">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Mobile Filter Toggle */}
          <div className="sm:hidden mb-4">
            <Button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              variant="outline"
              className="w-full flex items-center justify-center space-x-2 py-3 border-2 touch-manipulation"
            >
              <Settings className="w-4 h-4" />
              <span>Filters & Sort</span>
              <Badge className="bg-blue-100 text-blue-800 ml-2">3 active</Badge>
            </Button>
          </div>

          {/* Desktop Sidebar - Filters */}
          <div className="hidden lg:block w-64 flex-shrink-0 space-y-4">
            {/* Filter by Results */}
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">
                  Filter your results
                </h3>
                <button className="text-blue-600 text-sm hover:underline">
                  Reset
                </button>
              </div>

              {/* Stops */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">Stops</h4>
                </div>
                <div>
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="stops"
                        className="mr-3 text-blue-600"
                        defaultChecked
                      />
                      <span className="text-sm">Any</span>
                    </div>
                    <span className="text-sm text-gray-500">635</span>
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="stops"
                        className="mr-3 text-blue-600"
                      />
                      <span className="text-sm">Direct only</span>
                    </div>
                    <span className="text-sm text-gray-500">29</span>
                  </label>
                </div>
              </div>

              {/* Airlines */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">Airlines</h4>
                  <div className="flex space-x-2">
                    <button
                      onClick={() =>
                        setSelectedAirlines(
                          new Set(airlinesData.map((a) => a.name)),
                        )
                      }
                      className="text-blue-600 text-xs hover:underline"
                    >
                      Select all
                    </button>
                    <span className="text-gray-400 text-xs">•</span>
                    <button
                      onClick={() => setSelectedAirlines(new Set())}
                      className="text-blue-600 text-xs hover:underline"
                    >
                      Clear all
                    </button>
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {airlinesData.map((airline) => (
                    <label
                      key={airline.id}
                      className="flex items-center justify-between cursor-pointer group"
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          className="mr-3 text-blue-600"
                          checked={selectedAirlines.has(airline.name)}
                          onChange={(e) =>
                            handleAirlineFilter(airline.name, e.target.checked)
                          }
                        />
                        <span className="text-sm relative">
                          {airline.name}
                          <div className="absolute left-0 top-full mt-1 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            {selectedAirlines.has(airline.name)
                              ? "Remove filter"
                              : "Only this airline"}
                          </div>
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {airline.flights}
                      </span>
                    </label>
                  ))}
                </div>
                {selectedAirlines.size > 0 && (
                  <div className="mt-2 text-xs text-gray-600">
                    {selectedAirlines.size} airline
                    {selectedAirlines.size > 1 ? "s" : ""} selected
                  </div>
                )}
              </div>

              {/* Flight times */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">Flight times</h4>
                  <div className="flex space-x-2">
                    <button className="text-blue-600 text-xs hover:underline">
                      Select all
                    </button>
                    <span className="text-gray-400 text-xs">•</span>
                    <button className="text-blue-600 text-xs hover:underline">
                      Clear all
                    </button>
                  </div>
                </div>
                <div>
                  <div>
                    <div className="text-sm font-medium">Departing flight</div>
                    {tripType === "round-trip" && (
                      <div className="text-sm text-gray-600">Return flight</div>
                    )}
                  </div>
                  <div>
                    <label className="flex items-center justify-between cursor-pointer py-1.5">
                      <div className="flex items-center">
                        <input type="checkbox" className="mr-3 text-blue-600" />
                        <span className="text-sm">00:00-05:59</span>
                      </div>
                      <span className="text-sm text-gray-500">5</span>
                    </label>
                    <label className="flex items-center justify-between cursor-pointer py-1.5">
                      <div className="flex items-center">
                        <input type="checkbox" className="mr-3 text-blue-600" />
                        <span className="text-sm">06:00-11:59</span>
                      </div>
                      <span className="text-sm text-gray-500">9</span>
                    </label>
                    <label className="flex items-center justify-between cursor-pointer py-1.5">
                      <div className="flex items-center">
                        <input type="checkbox" className="mr-3 text-blue-600" />
                        <span className="text-sm">12:00-17:59</span>
                      </div>
                      <span className="text-sm text-gray-500">18</span>
                    </label>
                    <label className="flex items-center justify-between cursor-pointer py-1.5">
                      <div className="flex items-center">
                        <input type="checkbox" className="mr-3 text-blue-600" />
                        <span className="text-sm">18:00-23:59</span>
                      </div>
                      <span className="text-sm text-gray-500">6</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Arrival times */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Arrival to Dubai
                </h3>
                <div>
                  <label className="flex items-center justify-between cursor-pointer py-1.5">
                    <div className="flex items-center">
                      <input type="checkbox" className="mr-3 text-blue-600" />
                      <span className="text-sm">00:00-05:59</span>
                    </div>
                    <span className="text-sm text-gray-500">5</span>
                  </label>
                  <label className="flex items-center justify-between cursor-pointer py-1.5">
                    <div className="flex items-center">
                      <input type="checkbox" className="mr-3 text-blue-600" />
                      <span className="text-sm">06:00-11:59</span>
                    </div>
                    <span className="text-sm text-gray-500">9</span>
                  </label>
                  <label className="flex items-center justify-between cursor-pointer py-1.5">
                    <div className="flex items-center">
                      <input type="checkbox" className="mr-3 text-blue-600" />
                      <span className="text-sm">12:00-17:59</span>
                    </div>
                    <span className="text-sm text-gray-500">1</span>
                  </label>
                  <label className="flex items-center justify-between cursor-pointer py-1.5">
                    <div className="flex items-center">
                      <input type="checkbox" className="mr-3 text-blue-600" />
                      <span className="text-sm">18:00-23:59</span>
                    </div>
                    <span className="text-sm text-gray-500">6</span>
                  </label>
                </div>
              </div>

              {/* Refundable */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">Refundable</h4>
                </div>
                <div>
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="refundable"
                        className="mr-3 text-blue-600"
                        defaultChecked
                      />
                      <span className="text-sm">Any</span>
                    </div>
                    <span className="text-sm text-gray-500">635</span>
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="refundable"
                        className="mr-3 text-blue-600"
                      />
                      <span className="text-sm">Refundable</span>
                    </div>
                    <span className="text-sm text-gray-500">124</span>
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="refundable"
                        className="mr-3 text-blue-600"
                      />
                      <span className="text-sm">Non-refundable</span>
                    </div>
                    <span className="text-sm text-gray-500">511</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Flight Results */}
          <div className="flex-1">
            {/* Sort Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <span className="font-medium">Sort</span>
                <span className="text-sm text-gray-600">
                  Flexible travel upgrade available
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => setSortBy("cheapest")}
                  variant="outline"
                  size="sm"
                  className={
                    sortBy === "cheapest"
                      ? "text-blue-600 border-blue-600 bg-blue-50"
                      : "text-gray-600"
                  }
                >
                  Cheapest
                </Button>
                <Button
                  onClick={() => setSortBy("fastest")}
                  variant="outline"
                  size="sm"
                  className={
                    sortBy === "fastest"
                      ? "text-blue-600 border-blue-600 bg-blue-50"
                      : "text-gray-600"
                  }
                >
                  Fastest
                </Button>
              </div>
            </div>

            {/* Flight Results */}
            <div className="space-y-4">
              {filteredFlights.map((flight) => (
                <div key={flight.id}>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    {/* Green Header */}
                    <div className="bg-green-50 px-3 sm:px-4 py-2 border-b border-green-200">
                      <span className="text-green-700 text-xs sm:text-sm font-medium">
                        Flexible ticket upgrade available
                      </span>
                    </div>

                    {/* Flight Content */}
                    <div className="p-3 sm:p-4">
                      {/* Mobile Layout */}
                      <div className="block sm:hidden">
                        {/* Mobile Header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <img
                              src={flight.logo}
                              alt={flight.airline}
                              className="w-8 h-8 object-contain rounded"
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {flight.airline}
                              </div>
                              <div className="text-xs text-gray-500">
                                {flight.aircraft}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">
                              ₹
                              {flight.fareTypes[0].price.toLocaleString(
                                "en-IN",
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              per person
                            </div>
                          </div>
                        </div>

                        {/* Mobile Flight Times */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-center">
                            <div className="text-lg font-bold text-gray-900">
                              {flight.departureTime}
                            </div>
                            <div className="text-xs text-gray-500">
                              {flight.departureCode}
                            </div>
                          </div>
                          <div className="flex-1 mx-4">
                            <div className="text-center">
                              <div className="text-xs text-gray-500 mb-1">
                                {flight.duration}
                              </div>
                              <div className="h-0.5 bg-gray-300 relative">
                                <div className="absolute right-0 top-0 w-2 h-2 bg-gray-400 rounded-full transform translate-x-1 -translate-y-0.5"></div>
                              </div>
                              <div className="text-xs text-green-600 mt-1">
                                {flight.flightType}
                              </div>
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-gray-900">
                              {flight.arrivalTime}
                            </div>
                            <div className="text-xs text-gray-500">
                              {flight.arrivalCode}
                            </div>
                          </div>
                        </div>

                        {/* Mobile Action Buttons */}
                        <div className="grid grid-cols-2 gap-3">
                          <Button
                            onClick={() =>
                              handleBargain(flight, flight.fareTypes[0])
                            }
                            variant="outline"
                            className="bg-white border-2 border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white hover:border-orange-500 font-medium py-3 touch-manipulation transition-all duration-200 shadow-sm hover:shadow-md"
                          >
                            Bargain
                          </Button>
                          <Button
                            onClick={() =>
                              handleBooking(flight, flight.fareTypes[0])
                            }
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 touch-manipulation"
                          >
                            Book This Flight
                          </Button>
                        </div>
                      </div>

                      {/* Desktop Layout */}
                      <div className="hidden sm:flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        {/* Left Side - Flight Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 lg:space-x-6">
                            {/* Airline Logos Column */}
                            <div className="flex flex-row sm:flex-col space-x-3 sm:space-x-0 sm:space-y-6">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded flex items-center justify-center border border-gray-200">
                                <img
                                  src={flight.logo}
                                  alt={flight.airline}
                                  className="w-8 h-6 object-contain"
                                />
                              </div>
                              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded flex items-center justify-center border border-gray-200">
                                <img
                                  src={flight.logo}
                                  alt={flight.airline}
                                  className="w-8 h-6 object-contain"
                                />
                              </div>
                            </div>

                            {/* Flight Times and Routes */}
                            <div className="space-y-6">
                              {/* Outbound Flight */}
                              <div className="flex items-center space-x-12">
                                <div className="text-center">
                                  <div className="text-xl font-bold text-gray-900">
                                    {flight.departureTime}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {flight.departureCode} • Aug 9
                                  </div>
                                </div>

                                <div className="flex flex-col items-center">
                                  <div className="relative flex items-center">
                                    <div className="w-3 h-3 bg-white border-2 border-gray-400 rounded-full"></div>
                                    <div className="w-16 h-px bg-gray-300 mx-2"></div>
                                    <div className="bg-green-600 text-white text-xs px-2 py-1 rounded font-medium">
                                      {flight.flightType}
                                    </div>
                                    <div className="w-16 h-px bg-gray-300 mx-2"></div>
                                    <div className="w-3 h-3 bg-white border-2 border-gray-400 rounded-full"></div>
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {flight.duration}
                                  </div>
                                </div>

                                <div className="text-center">
                                  <div className="text-xl font-bold text-gray-900">
                                    {flight.arrivalTime}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {flight.arrivalCode} • Aug 9
                                  </div>
                                </div>
                              </div>

                              {/* Return Flight - Only show for round-trip */}
                              {tripType === "round-trip" && (
                                <div className="flex items-center space-x-12">
                                  <div className="text-center">
                                    <div className="text-xl font-bold text-gray-900">
                                      {flight.returnDepartureTime}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      {flight.arrivalCode} • Aug 16
                                    </div>
                                  </div>

                                  <div className="flex flex-col items-center">
                                    <div className="relative flex items-center">
                                      <div className="w-3 h-3 bg-white border-2 border-gray-400 rounded-full"></div>
                                      <div className="w-16 h-px bg-gray-300 mx-2"></div>
                                      <div className="bg-green-600 text-white text-xs px-2 py-1 rounded font-medium">
                                        {flight.flightType}
                                      </div>
                                      <div className="w-16 h-px bg-gray-300 mx-2"></div>
                                      <div className="w-3 h-3 bg-white border-2 border-gray-400 rounded-full"></div>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      {flight.returnDuration}
                                    </div>
                                  </div>

                                  <div className="text-center">
                                    <div className="text-xl font-bold text-gray-900">
                                      {flight.returnArrivalTime}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      {flight.departureCode} • Aug 17
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Airline Label */}
                          <div className="mt-4">
                            <span className="text-sm text-gray-600">
                              {flight.airline}
                            </span>
                          </div>
                        </div>

                        {/* Right Side - Fare Information */}
                        <div className="text-center ml-8">
                          <div className="mb-2 relative group">
                            <div className="flex items-center justify-center space-x-1">
                              <span className="text-sm font-medium text-gray-900">
                                {flight.fareTypes[0].name}
                              </span>
                              <Info className="w-3 h-3 text-gray-400 cursor-help" />
                            </div>
                            <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-1 bg-white border border-gray-200 shadow-lg rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity z-10 min-w-[200px] pointer-events-none">
                              <div className="text-sm font-medium text-gray-900 mb-2">
                                Included in this fare:
                              </div>
                              <div className="space-y-1 text-xs text-gray-700">
                                <div className="flex items-center space-x-2">
                                  <Luggage className="w-3 h-3 text-gray-500" />
                                  <span>1 carry-on bag (7 kg)</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Luggage className="w-3 h-3 text-gray-500" />
                                  <span>1 checked bag (23 kg)</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RefreshCw className="w-3 h-3 text-gray-500" />
                                  <span>Flight change allowed</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <X className="w-3 h-3 text-red-500" />
                                  <span>Refund if you cancel</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-center space-x-1 mb-3">
                            <Luggage className="w-4 h-4 text-green-600" />
                            <Shield className="w-4 h-4 text-green-600" />
                          </div>
                          <div className="text-xl font-bold text-gray-900 mb-1">
                            {formatPrice(flight.fareTypes[0].price)}
                          </div>
                          <div className="text-xs text-gray-600 mb-4">
                            All-inclusive price
                          </div>
                          <div className="space-y-2 w-32">
                            <Button
                              onClick={() =>
                                handleBargain(flight, flight.fareTypes[0])
                              }
                              variant="outline"
                              className="w-full border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 text-sm py-2 font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                              Bargain
                            </Button>
                            <Button
                              onClick={() => showFlightDetailsModal(flight)}
                              variant="outline"
                              className="w-full border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 text-sm py-2 font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                              View details
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Explore Ticket Options - Centered Below */}
                      <div className="border-t border-gray-200 bg-gray-50 py-3">
                        <div className="flex justify-center">
                          <button
                            onClick={() =>
                              setExpandedTicketOptions(
                                expandedTicketOptions === flight.id
                                  ? null
                                  : flight.id,
                              )
                            }
                            className="text-blue-600 text-sm font-bold hover:underline flex items-center justify-center px-4 py-1"
                          >
                            Explore ticket options
                            <ChevronDown
                              className={`w-4 h-4 ml-1 transition-transform ${expandedTicketOptions === flight.id ? "rotate-180" : ""}`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Ticket Options */}
                    {expandedTicketOptions === flight.id && (
                      <div className="border-t border-gray-200 bg-gray-50">
                        <div
                          className={`grid ${flight.fareTypes.length === 2 ? "grid-cols-2" : "grid-cols-3"} divide-x divide-gray-200`}
                        >
                          {flight.fareTypes.map((fareType, index) => (
                            <div key={index} className="p-4 text-center">
                              <div className="mb-2 relative group">
                                <div className="flex items-center justify-center space-x-1">
                                  <h4 className="font-medium text-sm text-gray-900 mb-1">
                                    {fareType.name}
                                  </h4>
                                  <Info className="w-3 h-3 text-gray-400 cursor-help" />
                                </div>
                                <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-1 bg-white border border-gray-200 shadow-lg rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity z-10 min-w-[200px] pointer-events-none">
                                  <div className="text-sm font-medium text-gray-900 mb-2">
                                    Included in this fare:
                                  </div>
                                  <div className="space-y-1 text-xs text-gray-700">
                                    <div className="flex items-center space-x-2">
                                      <Luggage className="w-3 h-3 text-gray-500" />
                                      <span>1 carry-on bag (7 kg)</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Luggage className="w-3 h-3 text-gray-500" />
                                      <span>
                                        1 checked bag ({fareType.baggage})
                                      </span>
                                    </div>
                                    {fareType.features.includes(
                                      "Free cancellation",
                                    ) ? (
                                      <div className="flex items-center space-x-2">
                                        <CheckCircle className="w-3 h-3 text-green-500" />
                                        <span>Refund if you cancel</span>
                                      </div>
                                    ) : (
                                      <div className="flex items-center space-x-2">
                                        <X className="w-3 h-3 text-red-500" />
                                        <span>Refund if you cancel</span>
                                      </div>
                                    )}
                                    <div className="flex items-center space-x-2">
                                      <RefreshCw className="w-3 h-3 text-gray-500" />
                                      <span>Flight change allowed</span>
                                    </div>
                                    {fareType.features.includes(
                                      "Priority boarding",
                                    ) && (
                                      <div className="flex items-center space-x-2">
                                        <Star className="w-3 h-3 text-yellow-500" />
                                        <span>Priority boarding</span>
                                      </div>
                                    )}
                                    {fareType.features.includes(
                                      "Extra legroom",
                                    ) && (
                                      <div className="flex items-center space-x-2">
                                        <Users className="w-3 h-3 text-blue-500" />
                                        <span>Extra legroom</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center justify-center space-x-1 mb-2">
                                <Luggage className="w-4 h-4 text-green-600" />
                                <Shield className="w-4 h-4 text-green-600" />
                                <Users className="w-4 h-4 text-green-600" />
                              </div>
                              <div className="text-lg font-bold text-gray-900 mb-1">
                                {formatPrice(fareType.price)}
                              </div>
                              <div className="text-xs text-gray-600 mb-3">
                                All-inclusive
                              </div>
                              <div className="space-y-2">
                                <Button
                                  onClick={() =>
                                    handleBargain(flight, fareType)
                                  }
                                  variant="outline"
                                  className="w-full border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 text-xs py-1.5 transition-all duration-200 shadow-sm hover:shadow-md"
                                >
                                  Bargain
                                </Button>
                                <Button
                                  onClick={() => showFlightDetailsModal(flight)}
                                  variant="outline"
                                  className="w-full border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 text-xs py-1.5 transition-all duration-200 shadow-sm hover:shadow-md"
                                >
                                  View details
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="p-4 border-t border-gray-200">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span>1 personal bag 7 kg</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span>Flight change allowed</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <X className="w-4 h-4 text-red-600" />
                              <span>Refund if you cancel</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* You're Lucky Message */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6 flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">🍀</span>
              </div>
              <div>
                <p className="font-medium">
                  You're lucky! There are no better prices on nearby dates.
                </p>
                <p className="text-sm text-gray-600">
                  Latest prices found for your search.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Bargain Modal */}
      <Dialog open={showBargainModal} onOpenChange={setShowBargainModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">AI</span>
              </div>
              <span>AI Price Negotiator</span>
            </DialogTitle>
          </DialogHeader>

          {bargainFlight && bargainFareType && (
            <div className="space-y-6">
              {bargainStep === "input" && (
                <>
                  {/* Flight Info */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">
                          {bargainFlight.airline}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {bargainFareType.name} • {bargainFlight.airline}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          Current All-Inclusive Price
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatPrice(bargainFareType.price)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Taxes, fees & gateway charges included
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-600">
                      <Luggage className="w-3 h-3" />
                      <span>Baggage included</span>
                      <span>•</span>
                      <Shield className="w-3 h-3" />
                      <span>Flexible booking</span>
                    </div>
                  </div>

                  {/* AI Negotiation Interface */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">AI</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          AI Assistant
                        </p>
                        <p className="text-xs text-gray-600">
                          Tell me your target price and I'll negotiate with the
                          airline!
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-3 text-gray-900">
                        What price would you like to pay? (
                        {selectedCurrency.symbol})
                      </label>
                      <div className="relative">
                        <Input
                          type="text"
                          value={
                            bargainPrice
                              ? formatNumberWithCommas(bargainPrice)
                              : ""
                          }
                          onChange={(e) => {
                            // Remove commas and non-numeric characters
                            const numericValue = e.target.value.replace(
                              /[^0-9]/g,
                              "",
                            );
                            setBargainPrice(numericValue);
                          }}
                          placeholder="Input your bargain price here"
                          className="text-xl font-bold text-center py-6 border-2 border-purple-200 focus:border-purple-500 placeholder:text-gray-400 placeholder:font-normal"
                        />
                        <div className="absolute inset-y-0 left-3 flex items-center">
                          <span className="text-gray-500 text-xl">
                            {selectedCurrency.symbol}
                          </span>
                        </div>
                      </div>
                      {bargainPrice && parseInt(bargainPrice) > 0 && (
                        <div className="mt-3">
                          {/* Price in words */}
                          <div className="text-xs text-gray-600 text-center mb-3">
                            {numberToWords(bargainPrice)}
                          </div>

                          {/* Validation popup */}
                          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-4 shadow-sm">
                            <div className="flex items-center justify-center space-x-2 mb-2">
                              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-bold">
                                  ✓
                                </span>
                              </div>
                              <span className="text-green-700 font-semibold">
                                Price Ready!
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 text-center">
                              Your offer of{" "}
                              <span className="font-bold text-green-600">
                                {selectedCurrency.symbol}
                                {formatNumberWithCommas(bargainPrice)}
                              </span>{" "}
                              is ready for AI negotiation.
                            </p>
                            {parseInt(bargainPrice) <
                              bargainFareType.price * 0.7 && (
                              <p className="text-xs text-amber-600 text-center mt-2">
                                Very aggressive pricing - success rate may be
                                lower
                              </p>
                            )}
                            {parseInt(bargainPrice) >=
                              bargainFareType.price * 0.7 &&
                              parseInt(bargainPrice) <=
                                bargainFareType.price * 0.9 && (
                                <p className="text-xs text-green-600 text-center mt-2">
                                  Good negotiation range - higher success
                                  probability
                                </p>
                              )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Used Prices Warning */}
                    {usedPrices.size > 0 && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <Info className="w-4 h-4 text-amber-600" />
                          <span className="text-sm font-medium text-amber-800">
                            Already tried:{" "}
                            {Array.from(usedPrices)
                              .map((p) => p.split("-")[1])
                              .join(", ")}
                          </span>
                        </div>
                        <p className="text-xs text-amber-700 mt-1">
                          Choose a different price to negotiate again
                        </p>
                      </div>
                    )}

                    {/* AI Tips */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs">i</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-blue-900 mb-1">
                            AI Tip
                          </p>
                          <p className="text-xs text-blue-700">
                            Prices 20-30% below original have higher success
                            rates. All prices are completely inclusive (taxes,
                            fees & payment charges). The AI will try to match
                            your price or offer something closer!
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => {
                        console.log(
                          "Button clicked, bargainPrice:",
                          bargainPrice,
                        );
                        startBargaining();
                      }}
                      disabled={!bargainPrice || parseInt(bargainPrice) <= 0}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-6 text-lg font-semibold rounded-xl disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      Start AI Negotiation
                    </Button>
                  </div>
                </>
              )}

              {bargainStep === "progress" && (
                <div className="text-center space-y-6 py-8">
                  <div className="relative">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center animate-pulse">
                      <RefreshCw className="w-10 h-10 text-white animate-spin" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      AI Negotiating with {bargainFlight.airline}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Analyzing market rates and finding the best deal for
                      you...
                    </p>
                    <Progress value={bargainProgress} className="w-full h-3" />
                    <p className="text-xs text-gray-500 mt-2">
                      {bargainProgress}% Complete
                    </p>
                  </div>
                </div>
              )}

              {bargainStep === "result" && (
                <div className="text-center space-y-6">
                  {bargainResult === "accepted" ? (
                    <>
                      {/* Exact Match */}
                      <div className="text-center">
                        <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                          <CheckCircle className="w-12 h-12 text-green-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-green-600 mb-2">
                          Perfect Match!
                        </h3>
                        <p className="text-gray-600 mb-1">
                          The airline accepted your exact price!
                        </p>
                        <p className="text-sm text-green-700 font-medium">
                          This is your{" "}
                          <span className="font-bold">
                            final all-inclusive price
                          </span>{" "}
                          - includes all taxes, fees & payment gateway charges.
                          Only extras will be additional.
                        </p>
                      </div>

                      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                              Your Offer:
                            </span>
                            <span className="text-lg font-bold text-green-700">
                              {selectedCurrency.symbol}
                              {parseInt(bargainPrice).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                              Original Price:
                            </span>
                            <span className="text-lg line-through text-gray-500">
                              {formatPrice(bargainFareType.price)}
                            </span>
                          </div>
                          <div className="border-t border-green-200 pt-3 flex justify-between items-center">
                            <span className="font-medium text-green-900">
                              Final Price:
                            </span>
                            <span className="text-2xl font-bold text-green-700">
                              {selectedCurrency.symbol}
                              {parseInt(bargainPrice).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : bargainResult === "counter" ? (
                    <>
                      {/* AI Counter Offer */}
                      <div className="text-center">
                        <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                          <Target className="w-12 h-12 text-blue-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-blue-600 mb-2">
                          AI Counter Offer!
                        </h3>
                        <p className="text-gray-600 mb-1">
                          The airline couldn't match your price, but here's
                          their best offer!
                        </p>
                        <p className="text-sm text-blue-700 font-medium">
                          This is the{" "}
                          <span className="font-bold">
                            final all-inclusive price
                          </span>{" "}
                          - includes all taxes, fees & payment gateway charges.
                          Only extras will be additional.
                        </p>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                              Your Offer:
                            </span>
                            <span className="text-lg text-gray-700">
                              {selectedCurrency.symbol}
                              {parseInt(bargainPrice).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                              Original Price:
                            </span>
                            <span className="text-lg line-through text-gray-500">
                              {formatPrice(bargainFareType.price)}
                            </span>
                          </div>
                          <div className="border-t border-blue-200 pt-3 flex justify-between items-center">
                            <span className="font-medium text-blue-900">
                              AI Negotiated Price:
                            </span>
                            <span className="text-2xl font-bold text-blue-700">
                              {selectedCurrency.symbol}
                              {aiOfferPrice
                                ? convertPrice(aiOfferPrice).toLocaleString()
                                : "0"}
                            </span>
                          </div>
                          <div className="text-center pt-2">
                            <span className="text-sm font-medium text-green-600 bg-green-100 px-3 py-1 rounded-full">
                              You save {selectedCurrency.symbol}
                              {convertPrice(
                                bargainFareType.price - (aiOfferPrice || 0),
                              ).toLocaleString()}
                              !
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : null}

                  {/* Timer and Actions */}
                  {isOfferValid && (
                    <>
                      <div className="bg-orange-100 border border-orange-200 rounded-lg p-4">
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center animate-pulse">
                            <span className="text-white text-xs">⏰</span>
                          </div>
                          <span className="font-bold text-orange-800 text-lg">
                            Offer expires in: {offerExpiryTime}s
                          </span>
                        </div>
                        <p className="text-xs text-orange-700 text-center mt-1">
                          This special price is only valid for a limited time!
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                          <p className="text-xs text-blue-700 text-center">
                            ���� <strong>Next:</strong> Choose your seat, meals
                            & extras before final payment
                          </p>
                        </div>
                        <Button
                          onClick={() => {
                            setShowBargainModal(false);
                            handleBooking(bargainFlight, {
                              ...bargainFareType,
                              price: aiOfferPrice || parseInt(bargainPrice),
                            });
                          }}
                          disabled={!isOfferValid}
                          className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-4 text-lg font-bold rounded-xl"
                        >
                          Book This Deal - {selectedCurrency.symbol}
                          {bargainResult === "accepted"
                            ? parseInt(bargainPrice).toLocaleString()
                            : aiOfferPrice
                              ? convertPrice(aiOfferPrice).toLocaleString()
                              : parseInt(bargainPrice).toLocaleString()}
                        </Button>

                        <Button
                          onClick={() => setBargainStep("input")}
                          variant="outline"
                          className="w-full border-2 border-gray-300 hover:border-purple-400 py-3 rounded-xl"
                        >
                          Try Different Price
                        </Button>
                      </div>
                    </>
                  )}

                  {!isOfferValid && offerExpiryTime === 0 && (
                    <div className="space-y-4">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-700 font-medium">
                          ⏰ Offer Expired!
                        </p>
                        <p className="text-sm text-red-600">
                          The special price has expired. Try negotiating again!
                        </p>
                      </div>
                      <div className="flex space-x-3">
                        <Button
                          onClick={() => setBargainStep("input")}
                          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
                        >
                          Negotiate Again
                        </Button>
                        <Button
                          onClick={() => setShowBargainModal(false)}
                          variant="outline"
                          className="flex-1 rounded-xl"
                        >
                          Book Original
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Flight Details Modal */}
      <Dialog open={showFlightDetails} onOpenChange={setShowFlightDetails}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Flight Details - {selectedFlightForDetails?.airline}
            </DialogTitle>
          </DialogHeader>

          {selectedFlightForDetails && (
            <div className="space-y-6 p-4">
              {/* Flight Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg">
                      {selectedFlightForDetails.airline}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Flight {selectedFlightForDetails.flightNumber} • Boeing
                      777-300ER
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      ₹
                      {(
                        selectedFlightForDetails.fareTypes[0]?.price || 0
                      ).toLocaleString()}
                    </div>
                    <p className="text-sm text-gray-500">
                      per person (all-inclusive)
                    </p>
                  </div>
                </div>
              </div>

              {/* Flight Route */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold mb-4">Flight Route</h4>

                {/* Outbound Flight */}
                <div className="mb-6">
                  <h5 className="text-sm font-medium text-gray-700 mb-3">
                    Outbound Flight - Aug 9
                  </h5>
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {selectedFlightForDetails.departureCode}
                      </div>
                      <div className="text-sm text-gray-600">Mumbai</div>
                      <div className="text-lg font-semibold mt-2">
                        {selectedFlightForDetails.departureTime}
                      </div>
                      <div className="text-sm text-gray-500">Sat, Aug 9</div>
                    </div>
                    <div className="flex-1 px-4">
                      <div className="flex items-center justify-center relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t-2 border-dashed border-gray-300"></div>
                        </div>
                        <div className="relative bg-green-600 text-white px-3 py-1 rounded-full">
                          <span className="text-xs font-medium">
                            {selectedFlightForDetails.duration}{" "}
                            {selectedFlightForDetails.flightType}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {selectedFlightForDetails.arrivalCode}
                      </div>
                      <div className="text-sm text-gray-600">Dubai</div>
                      <div className="text-lg font-semibold mt-2">
                        {selectedFlightForDetails.arrivalTime}
                      </div>
                      <div className="text-sm text-gray-500">Sat, Aug 9</div>
                    </div>
                  </div>
                </div>

                {/* Return Flight */}
                <div className="border-t border-gray-200 pt-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-3">
                    Return Flight - Aug 16
                  </h5>
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {selectedFlightForDetails.arrivalCode}
                      </div>
                      <div className="text-sm text-gray-600">Dubai</div>
                      <div className="text-lg font-semibold mt-2">
                        {selectedFlightForDetails.returnDepartureTime}
                      </div>
                      <div className="text-sm text-gray-500">Fri, Aug 16</div>
                    </div>
                    <div className="flex-1 px-4">
                      <div className="flex items-center justify-center relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t-2 border-dashed border-gray-300"></div>
                        </div>
                        <div className="relative bg-green-600 text-white px-3 py-1 rounded-full">
                          <span className="text-xs font-medium">
                            {selectedFlightForDetails.returnDuration}{" "}
                            {selectedFlightForDetails.flightType}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {selectedFlightForDetails.departureCode}
                      </div>
                      <div className="text-sm text-gray-600">Mumbai</div>
                      <div className="text-lg font-semibold mt-2">
                        {selectedFlightForDetails.returnArrivalTime}
                      </div>
                      <div className="text-sm text-gray-500">Fri, Aug 16</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Aircraft Information */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold mb-3">Aircraft Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Aircraft:</span>
                    <span className="font-medium ml-2">Boeing 777-300ER</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Operated by:</span>
                    <span className="font-medium ml-2">
                      {selectedFlightForDetails.airline}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Flight Number:</span>
                    <span className="font-medium ml-2">
                      {selectedFlightForDetails.flightNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Flight Time:</span>
                    <span className="font-medium ml-2">2h 25m</span>
                  </div>
                </div>
              </div>

              {/* Included Services */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold mb-3">What's Included</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-xs">✓</span>
                    </div>
                    <span className="text-sm">1 carry-on bag (7 kg)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-xs">✓</span>
                    </div>
                    <span className="text-sm">1 checked bag (23 kg)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-xs">✓</span>
                    </div>
                    <span className="text-sm">Meals included</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-xs">✓</span>
                    </div>
                    <span className="text-sm">In-flight entertainment</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-xs">✓</span>
                    </div>
                    <span className="text-sm">Seat selection</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-xs">✓</span>
                    </div>
                    <span className="text-sm">WiFi available</span>
                  </div>
                </div>
              </div>

              {/* Baggage Policy */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold mb-3">Baggage Policy</h4>
                <div className="space-y-3">
                  <div>
                    <h5 className="font-medium text-sm">Carry-on Baggage</h5>
                    <p className="text-sm text-gray-600">
                      1 piece, max 7 kg, dimensions: 55x40x20 cm
                    </p>
                  </div>
                  <div>
                    <h5 className="font-medium text-sm">Checked Baggage</h5>
                    <p className="text-sm text-gray-600">
                      1 piece, max 23 kg, dimensions: 158 cm total
                    </p>
                  </div>
                  <div>
                    <h5 className="font-medium text-sm">Additional Baggage</h5>
                    <p className="text-sm text-gray-600">
                      Available for purchase during booking or online check-in
                    </p>
                  </div>
                </div>
              </div>

              {/* Important Information */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold mb-3 text-yellow-800">
                  Important Information
                </h4>
                <div className="space-y-2 text-sm text-yellow-700">
                  <div>• Check-in opens 24 hours before departure</div>
                  <div>
                    • Arrive at airport 3 hours before international departure
                  </div>
                  <div>
                    • Valid passport required (minimum 6 months validity)
                  </div>
                  <div>• Visa may be required depending on nationality</div>
                  <div>• Meal preferences can be selected during booking</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={() => {
                    setShowFlightDetails(false);
                    handleBargain(
                      selectedFlightForDetails,
                      selectedFlightForDetails.fareTypes[0],
                    );
                  }}
                  variant="outline"
                  className="flex-1 border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white hover:border-orange-600 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Bargain This Flight
                </Button>
                <Button
                  onClick={() => {
                    setShowFlightDetails(false);
                    handleBooking(
                      selectedFlightForDetails,
                      selectedFlightForDetails.fareTypes[0],
                    );
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Book This Flight
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Sign In Modal - Same as landing page */}
      <Dialog open={showSignIn} onOpenChange={setShowSignIn}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">
              Sign in or create an account
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 p-4">
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
                <span>Continue with Google</span>
              </Button>
              <Button
                variant="outline"
                className="w-full py-3 flex items-center justify-center space-x-2"
              >
                <span>Continue with Apple</span>
              </Button>
              <Button
                variant="outline"
                className="w-full py-3 flex items-center justify-center space-x-2"
              >
                <span>Continue with Facebook</span>
              </Button>
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

      {/* Register Modal - Same as landing page */}
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
                Use at least 8 characters
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
                <span>Sign up with Google</span>
              </Button>
              <Button
                variant="outline"
                className="w-full py-3 flex items-center justify-center space-x-2"
              >
                <span>Sign up with Apple</span>
              </Button>
              <Button
                variant="outline"
                className="w-full py-3 flex items-center justify-center space-x-2"
              >
                <span>Sign up with Facebook</span>
              </Button>
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

      {/* Mobile Filters Modal */}
      <MobileFilters
        isOpen={showMobileFilters}
        onClose={() => setShowMobileFilters(false)}
      />
    </div>
  );
}
