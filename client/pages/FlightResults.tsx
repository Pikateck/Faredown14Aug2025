import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDateContext } from "@/contexts/DateContext";
import { flightsService, Flight } from "@/services/flightsService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MobileFilters } from "@/components/MobileFilters";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { MobileNavigation } from "@/components/mobile/MobileNavigation";
import BargainModalPhase1 from "@/components/BargainModalPhase1";
import {
  useBargainPhase1,
  createFlightBargainItem,
} from "@/hooks/useBargainPhase1";
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
import { BookingCalendar } from "@/components/BookingCalendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { addDays, format } from "date-fns";
import {
  Plane,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowRightLeft,
  ArrowRight,
  MapPin,
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
  Globe,
  Luggage,
  Info,
  Target,
  CheckCircle,
  XCircle,
  RefreshCw,
  FileText,
  Menu,
  Star,
  Filter,
  SlidersHorizontal,
  ArrowUpDown,
  Hotel,
  Clock,
  Wifi,
  Headphones,
  Calendar,
  TrendingUp,
  TrendingDown,
  Search,
  Camera,
  Navigation,
} from "lucide-react";
import {
  MobileCityDropdown,
  MobileDatePicker,
  MobileTravelers,
  MobileClassDropdown,
} from "@/components/MobileDropdowns";
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
    returnAirline: "Emirates",
    flightNumber: "EK 500",
    returnFlightNumber: "EK 501",
    logo: "https://cdn.builder.io/api/v1/image/assets%2F4235b10530ff469795aa00c0333d773c%2F64e4a8449d984f8fb3cfc5224927fe3c?format=webp&width=800",
    returnLogo:
      "https://cdn.builder.io/api/v1/image/assets%2F4235b10530ff469795aa00c0333d773c%2F64e4a8449d984f8fb3cfc5224927fe3c?format=webp&width=800",
    aircraft: "Boeing 777-300ER",
    returnAircraft: "Boeing 777-200LR",
    flightType: "Direct",
    stops: 0,
    refundability: "Refundable",
    fareTypes: [
      {
        name: "Eco Saver",
        price: 32168,
        features: ["Carry-on included"],
        baggage: "23kg",
        refundability: "Non-Refundable",
      },
      {
        name: "Eco Flex",
        price: 35253,
        features: ["Carry-on + checked bag", "Free cancellation"],
        baggage: "23kg",
        refundability: "Refundable",
      },
      {
        name: "Eco Flexplus",
        price: 37506,
        features: ["Priority boarding", "Extra legroom"],
        baggage: "23kg",
        refundability: "Refundable",
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
    returnAirline: "Indigo",
    flightNumber: "EK 502",
    returnFlightNumber: "6E 1407",
    logo: "https://cdn.builder.io/api/v1/image/assets%2F4235b10530ff469795aa00c0333d773c%2F64e4a8449d984f8fb3cfc5224927fe3c?format=webp&width=800",
    returnLogo:
      "https://cdn.builder.io/api/v1/image/assets%2F4235b10530ff469795aa00c0333d773c%2Fde5fb672c9d04b3f8118cb8a0874235a?format=webp&width=800",
    aircraft: "Airbus A380",
    returnAircraft: "Boeing 787 Dreamliner",
    flightType: "Direct",
    stops: 0,
    refundability: "Refundable",
    fareTypes: [
      {
        name: "Eco Saver",
        price: 32168,
        features: ["Carry-on included"],
        baggage: "23kg",
        refundability: "Non-Refundable",
      },
      {
        name: "Eco Flex",
        price: 35253,
        features: ["Carry-on + checked bag", "Free cancellation"],
        baggage: "23kg",
        refundability: "Refundable",
      },
      {
        name: "Eco Flexplus",
        price: 37506,
        features: ["Priority boarding", "Extra legroom"],
        baggage: "23kg",
        refundability: "Refundable",
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
    returnAirline: "Air India",
    flightNumber: "AI 131",
    returnFlightNumber: "AI 132",
    logo: "https://cdn.builder.io/api/v1/image/assets%2F4235b10530ff469795aa00c0333d773c%2F5ced42d744ea46f9b9a1e71f3ee70d15?format=webp&width=800",
    returnLogo:
      "https://cdn.builder.io/api/v1/image/assets%2F4235b10530ff469795aa00c0333d773c%2F5ced42d744ea46f9b9a1e71f3ee70d15?format=webp&width=800",
    aircraft: "Airbus A350-900",
    returnAircraft: "Boeing 737 MAX 8",
    flightType: "Direct",
    stops: 0,
    refundability: "Non-Refundable",
    fareTypes: [
      {
        name: "Economy",
        price: 28450,
        features: ["Carry-on included"],
        baggage: "20kg",
        refundability: "Non-Refundable",
      },
      {
        name: "Premium Economy",
        price: 31200,
        features: ["Carry-on + checked bag", "Priority boarding"],
        baggage: "25kg",
        refundability: "Refundable",
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
    returnAirline: "Indigo",
    flightNumber: "6E 1406",
    returnFlightNumber: "6E 1408",
    logo: "https://cdn.builder.io/api/v1/image/assets%2F4235b10530ff469795aa00c0333d773c%2Fde5fb672c9d04b3f8118cb8a0874235a?format=webp&width=800",
    returnLogo:
      "https://cdn.builder.io/api/v1/image/assets%2F4235b10530ff469795aa00c0333d773c%2Fde5fb672c9d04b3f8118cb8a0874235a?format=webp&width=800",
    aircraft: "Airbus A321neo",
    returnAircraft: "Embraer E190",
    flightType: "1 Stop",
    stops: 1,
    refundability: "Refundable",
    fareTypes: [
      {
        name: "Saver",
        price: 25890,
        features: ["Carry-on included"],
        baggage: "15kg",
        refundability: "Non-Refundable",
      },
      {
        name: "Flexi",
        price: 29100,
        features: ["Carry-on + checked bag", "Free cancellation"],
        baggage: "20kg",
        refundability: "Refundable",
      },
    ],
  },
  {
    id: 5,
    departureTime: "16:45",
    arrivalTime: "18:25",
    departureCode: "BOM",
    arrivalCode: "DXB",
    duration: "3h 40m",
    returnDepartureTime: "20:15",
    returnArrivalTime: "01:30",
    returnDuration: "5h 15m",
    airline: "Air India",
    returnAirline: "Indigo",
    flightNumber: "AI 995",
    returnFlightNumber: "6E 1205",
    logo: "https://cdn.builder.io/api/v1/image/assets%2F4235b10530ff469795aa00c0333d773c%2F5ced42d744ea46f9b9a1e71f3ee70d15?format=webp&width=800",
    returnLogo:
      "https://cdn.builder.io/api/v1/image/assets%2F4235b10530ff469795aa00c0333d773c%2Fde5fb672c9d04b3f8118cb8a0874235a?format=webp&width=800",
    aircraft: "Boeing 787-8 Dreamliner",
    returnAircraft: "Airbus A320neo",
    flightType: "Direct",
    stops: 0,
    refundability: "Refundable",
    fareTypes: [
      {
        name: "Economy",
        price: 26750,
        features: ["Carry-on included", "In-flight meal"],
        baggage: "23kg",
        refundability: "Non-Refundable",
      },
      {
        name: "Premium Economy",
        price: 30200,
        features: [
          "Carry-on + checked bag",
          "Priority boarding",
          "Extra legroom",
        ],
        baggage: "30kg",
        refundability: "Refundable",
      },
      {
        name: "Business",
        price: 42800,
        features: ["Lie-flat seats", "Premium dining", "Priority check-in"],
        baggage: "40kg",
        refundability: "Refundable",
      },
    ],
  },
];

export default function FlightResults() {
  useScrollToTop();
  const { isLoggedIn, user, login, logout } = useAuth();
  const {
    departureDate,
    returnDate,
    tripType,
    setDepartureDate,
    setReturnDate,
    setTripType,
    formatDisplayDate,
    loadDatesFromParams,
  } = useDateContext();
  const userName = user?.name || "";

  // Live flight data states - Initialize with basic demo flights
  const [flights, setFlights] = useState<Flight[]>([
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
      returnAirline: "Emirates",
      flightNumber: "EK 500",
      returnFlightNumber: "EK 501",
      logo: "https://cdn.builder.io/api/v1/image/assets%2F4235b10530ff469795aa00c0333d773c%2F64e4a8449d984f8fb3cfc5224927fe3c?format=webp&width=800",
      returnLogo:
        "https://cdn.builder.io/api/v1/image/assets%2F4235b10530ff469795aa00c0333d773c%2F64e4a8449d984f8fb3cfc5224927fe3c?format=webp&width=800",
      aircraft: "Boeing 777-300ER",
      returnAircraft: "Boeing 777-200LR",
      flightType: "Direct",
      stops: 0,
      refundability: "Refundable",
      price: {
        amount: 32168,
        currency: "INR",
        breakdown: {
          baseFare: 25000,
          taxes: 5168,
          fees: 2000,
          total: 32168,
        },
      },
      fareTypes: [
        {
          name: "Eco Saver",
          price: 32168,
          features: ["Carry-on included"],
          baggage: "23kg",
          refundability: "Non-Refundable",
        },
        {
          name: "Eco Flex",
          price: 35253,
          features: ["Carry-on + checked bag", "Free cancellation"],
          baggage: "23kg",
          refundability: "Refundable",
        },
      ],
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Load dates and city selections from URL parameters when component mounts
  useEffect(() => {
    loadDatesFromParams(searchParams);

    // Load city selections from URL parameters
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");

    // Find matching city names from codes
    if (fromParam) {
      const fromCity = Object.entries(cityData).find(
        ([city, data]) => data.code === fromParam,
      )?.[0];
      if (fromCity) {
        setSelectedFromCity(fromCity);
      }
    }

    if (toParam) {
      const toCity = Object.entries(cityData).find(
        ([city, data]) => data.code === toParam,
      )?.[0];
      if (toCity) {
        setSelectedToCity(toCity);
      }
    }
  }, [searchParams, loadDatesFromParams]);

  // Get passenger data from URL params
  const adults = parseInt(searchParams.get("adults") || "1");
  const children = parseInt(searchParams.get("children") || "0");
  const [selectedFlight, setSelectedFlight] = useState<
    (typeof flightData)[0] | null
  >(null);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Auth form states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [registerFirstName, setRegisterFirstName] = useState("");
  const [registerLastName, setRegisterLastName] = useState("");
  const [authError, setAuthError] = useState("");

  // Test credentials for demo
  const testCredentials = {
    email: "test@faredown.com",
    password: "password123",
    name: "Zubin Aibara",
  };

  // Mobile UI states
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [showSearchEdit, setShowSearchEdit] = useState(false);

  // Phase 1 Bargain Engine integration with live API
  const bargainHook = useBargainPhase1({
    useLiveAPI: true, // Enable live API integration
    onBookingConfirmed: (item, finalPrice) => {
      // Custom handling after bargain success
      console.log("✅ Live bargain successful!", { item, finalPrice });

      // Create flight object for booking flow
      const flightForBooking = flightData.find(
        (f) => f.id.toString() === item.itemId,
      );
      if (flightForBooking) {
        handleBooking(flightForBooking, {
          id: "bargained",
          name: item.class || "Economy",
          price: finalPrice,
          refundability: "Non-Refundable",
          features: ["AI Bargained Price"],
          baggage: "23kg",
        });
      }
    },
    redirectToBooking: true,
    deviceType: window.innerWidth <= 768 ? "mobile" : "desktop",
  });

  // Search panel states
  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const [selectedClass, setSelectedClass] = useState("Economy");
  // Trip type states
  const [editTripType, setEditTripType] = useState("round-trip");
  const [showFromCities, setShowFromCities] = useState(false);
  const [showToCities, setShowToCities] = useState(false);
  const [selectedFromCity, setSelectedFromCity] = useState("");
  const [selectedToCity, setSelectedToCity] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTravelers, setShowTravelers] = useState(false);
  const [travelers, setTravelers] = useState({ adults: 1, children: 0 });
  // Dates now managed by DateContext and loaded from URL params
  const [selectingDeparture, setSelectingDeparture] = useState(true);
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(0);

  // Fare rules states
  const [showFareRules, setShowFareRules] = useState<{
    [key: string]: boolean;
  }>({});
  const [fareRulesFlightId, setFareRulesFlightId] = useState<string | null>(
    null,
  );

  // Flight details modal states
  const [showFlightDetails, setShowFlightDetails] = useState(false);
  const [selectedFlightForDetails, setSelectedFlightForDetails] = useState<
    (typeof flightData)[0] | null
  >(null);

  // Tabbed flight details states
  const [expandedFlightDetails, setExpandedFlightDetails] = useState<{
    [key: string]: boolean;
  }>({});
  const [activeDetailTab, setActiveDetailTab] = useState<{
    [key: string]: "itinerary" | "fare-rules";
  }>({});

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
  const [duplicatePriceError, setDuplicatePriceError] = useState(false);

  // Load flights from Amadeus API
  useEffect(() => {
    const loadFlights = async () => {
      try {
        setIsLoading(true);
        setSearchError(null);

        // Get search parameters from URL or use defaults
        const origin = searchParams.get("from") || "BOM";
        const destination = searchParams.get("to") || "DXB";
        const departure =
          searchParams.get("departure") ||
          departureDate?.toISOString().split("T")[0] ||
          new Date().toISOString().split("T")[0];
        const adults = parseInt(searchParams.get("adults") || "1");
        const children = parseInt(searchParams.get("children") || "0");
        const cabinClass = searchParams.get("class") || "economy";
        const tripTypeParam = searchParams.get("tripType") || tripType;

        console.log("🎯 Trip type for search:", tripTypeParam);

        // Convert trip type to the correct format for API
        const apiTripType =
          tripTypeParam === "round-trip"
            ? "round_trip"
            : tripTypeParam === "one-way"
              ? "one_way"
              : "multi_city";

        // For multi-city, use one-way search for now (simplified implementation)
        const searchTripType =
          apiTripType === "multi_city" ? "one_way" : apiTripType;

        console.log("🔍 Searching flights:", {
          origin,
          destination,
          departure,
          adults,
          children,
          cabinClass,
          apiTripType,
        });

        const searchRequest = {
          departure: origin,
          arrival: destination,
          departureDate: departure,
          returnDate:
            searchTripType === "round_trip"
              ? returnDate?.toISOString().split("T")[0]
              : undefined,
          adults,
          children,
          cabinClass: cabinClass as any,
          tripType: searchTripType,
          promoCode: searchParams.get("promoCode") || undefined,
          userId: user?.id || undefined,
        };

        const flightResults = await flightsService.searchFlights(searchRequest);
        console.log("✅ Loaded flights:", flightResults.length);

        setFlights(flightResults);
      } catch (error) {
        console.error("❌ Flight search error:", error);
        console.log("📄 Using fallback flight data for demo");

        // Clear the error state and use fallback flights to ensure something displays
        setSearchError(null);

        // Use fallback flights to ensure something displays
        const fallbackFlights = [
          {
            id: "demo_flight_1",
            airline: "Emirates",
            airlineCode: "EK",
            flightNumber: "EK 500",
            departure: {
              code: "BOM",
              name: "Chhatrapati Shivaji Maharaj International Airport",
              city: "Mumbai",
              country: "India",
              terminal: "2",
            },
            arrival: {
              code: "DXB",
              name: "Dubai International Airport",
              city: "Dubai",
              country: "UAE",
              terminal: "3",
            },
            departureTime: "10:15",
            arrivalTime: "11:45",
            duration: "3h 30m",
            aircraft: "Boeing 777-300ER",
            stops: 0,
            price: {
              amount: 25890,
              currency: "INR",
              breakdown: {
                baseFare: 20712,
                taxes: 3890,
                fees: 1288,
                total: 25890,
              },
            },
            amenities: ["WiFi", "Entertainment System", "Premium Meals"],
            baggage: {
              carryOn: {
                weight: "7kg",
                dimensions: "55x40x20cm",
                included: true,
              },
              checked: {
                weight: "20kg",
                count: 1,
                fee: 0,
              },
            },
            fareClass: "ECONOMY",
          },
          {
            id: "demo_flight_2",
            airline: "Indigo",
            airlineCode: "6E",
            flightNumber: "6E 1407",
            departure: {
              code: "BOM",
              name: "Chhatrapati Shivaji Maharaj International Airport",
              city: "Mumbai",
              country: "India",
              terminal: "2",
            },
            arrival: {
              code: "DXB",
              name: "Dubai International Airport",
              city: "Dubai",
              country: "UAE",
              terminal: "2",
            },
            departureTime: "14:30",
            arrivalTime: "16:00",
            duration: "3h 30m",
            aircraft: "Airbus A320",
            stops: 0,
            price: {
              amount: 22650,
              currency: "INR",
              breakdown: {
                baseFare: 18120,
                taxes: 3400,
                fees: 1130,
                total: 22650,
              },
            },
            amenities: ["Seat Selection", "Onboard Refreshments"],
            baggage: {
              carryOn: {
                weight: "7kg",
                dimensions: "55x40x20cm",
                included: true,
              },
              checked: {
                weight: "15kg",
                count: 1,
                fee: 0,
              },
            },
            fareClass: "ECONOMY",
          },
        ];

        setFlights(fallbackFlights as Flight[]);
      } finally {
        setIsLoading(false);
      }
    };

    loadFlights();
  }, [searchParams, departureDate, returnDate, tripType]);

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

  // Expanded airlines list with more options
  const availableAirlines = [
    "Emirates",
    "Air India",
    "Indigo",
    "Fly Dubai",
    "Air Arabia",
    "Spicejet",
    "Vistara",
    "Air Asia",
    "GoAir",
    "Alliance Air",
    "Qatar Airways",
    "Etihad Airways",
    "Lufthansa",
    "British Airways",
    "Singapore Airlines",
    "Thai Airways",
    "Malaysia Airlines",
    "Kuwait Airways",
    "Oman Air",
    "Saudia",
    "Turkish Airlines",
    "Flydubai",
  ];

  // Aircraft types list with comprehensive options
  const availableAircraftTypes = [
    "Airbus A320",
    "Airbus A321",
    "Airbus A321neo",
    "Airbus A330",
    "Airbus A340",
    "Airbus A350-900",
    "Airbus A380",
    "Boeing 737",
    "Boeing 737-800",
    "Boeing 737 MAX 8",
    "Boeing 747",
    "Boeing 777",
    "Boeing 777-200LR",
    "Boeing 777-300ER",
    "Boeing 787",
    "Boeing 787 Dreamliner",
    "Embraer E190",
    "ATR 72",
    "Bombardier Q400",
  ];

  // Airlines filter state - Initialize with all airlines selected by default
  const [selectedAirlines, setSelectedAirlines] = useState<Set<string>>(
    new Set(availableAirlines),
  );

  // Aircraft types filter state - Initialize with all aircraft types selected by default
  const [selectedAircraftTypes, setSelectedAircraftTypes] = useState<
    Set<string>
  >(new Set(availableAircraftTypes));

  // Additional filter states (needed to prevent errors)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [selectedStops, setSelectedStops] = useState<string>("any");
  const [selectedFareType, setSelectedFareType] = useState<string>("all");
  const [departureTimeRange, setDepartureTimeRange] = useState<
    [number, number]
  >([0, 24]);
  const [arrivalTimeRange, setArrivalTimeRange] = useState<[number, number]>([
    0, 24,
  ]);
  const [maxDuration, setMaxDuration] = useState<number>(24);
  const [hoveredAirline, setHoveredAirline] = useState<string | null>(null);
  const [hoveredAircraftType, setHoveredAircraftType] = useState<string | null>(
    null,
  );

  // Exchange rates relative to INR (base currency)
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

  // Handle aircraft type filter selection
  const handleAircraftTypeFilter = (
    aircraftType: string,
    isChecked: boolean,
  ) => {
    setSelectedAircraftTypes((prev) => {
      const newSelected = new Set(prev);
      if (isChecked) {
        newSelected.add(aircraftType);
      } else {
        newSelected.delete(aircraftType);
      }
      return newSelected;
    });
  };

  // Reset filters function
  const resetAllFilters = () => {
    setSelectedAirlines(new Set(availableAirlines));
    setSelectedAircraftTypes(new Set(availableAircraftTypes));
    setPriceRange([0, 100000]);
    setSelectedStops("any");
    setSelectedFareType("all");
    setDepartureTimeRange([0, 24]);
    setArrivalTimeRange([0, 24]);
    setMaxDuration(24);
  };

  // Function to handle "Only this airline" selection
  const handleOnlyThisAirline = (airlineName: string) => {
    setSelectedAirlines(new Set([airlineName]));
  };

  // Function to reset airline selection (select all)
  const resetAirlineSelection = () => {
    setSelectedAirlines(new Set(availableAirlines));
  };

  // Function to handle "Only this aircraft type" selection
  const handleOnlyThisAircraftType = (aircraftType: string) => {
    setSelectedAircraftTypes(new Set([aircraftType]));
  };

  // Function to reset aircraft type selection (select all)
  const resetAircraftTypeSelection = () => {
    setSelectedAircraftTypes(new Set(availableAircraftTypes));
  };

  // Additional helper functions
  const handleStopsFilter = (stops: string) => {
    setSelectedStops(stops);
  };

  // Handle fare type filter
  const handleFareTypeFilter = (fareType: string) => {
    setSelectedFareType(fareType);
  };

  // Handle fare rules toggle
  const handleFareRulesToggle = (flightId: string, fareTypeId: string) => {
    const ruleKey = `${flightId}-${fareTypeId}`;
    setShowFareRules((prev) => ({
      ...prev,
      [ruleKey]: !prev[ruleKey],
    }));
  };

  // Handle flight details modal
  const handleViewFlightDetails = (flight: (typeof flightData)[0]) => {
    setSelectedFlightForDetails(flight);
    setShowFlightDetails(true);
  };

  // Handle tabbed flight details toggle
  const handleToggleFlightDetails = (flightId: string, fareTypeId: string) => {
    const detailKey = `${flightId}-${fareTypeId}`;
    setExpandedFlightDetails((prev) => ({
      ...prev,
      [detailKey]: !prev[detailKey],
    }));

    // Set default active tab to itinerary
    if (!expandedFlightDetails[detailKey]) {
      setActiveDetailTab((prev) => ({
        ...prev,
        [detailKey]: "itinerary",
      }));
    }
  };

  // Handle tab change
  const handleTabChange = (
    flightId: string,
    fareTypeId: string,
    tab: "itinerary" | "fare-rules",
  ) => {
    const detailKey = `${flightId}-${fareTypeId}`;
    setActiveDetailTab((prev) => ({
      ...prev,
      [detailKey]: tab,
    }));
  };

  // Calendar helper functions (restored)
  const getMonthName = (month: number) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return months[month];
  };

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const isDateInRange = (
    date: Date,
    startDate: Date | null,
    endDate: Date | null,
  ) => {
    if (!startDate || !endDate) return false;
    return date >= startDate && date <= endDate;
  };

  const isDateEqual = (date1: Date | null, date2: Date | null) => {
    if (!date1 || !date2) return false;
    return date1.toDateString() === date2.toDateString();
  };

  const navigateMonth = (direction: "prev" | "next") => {
    if (direction === "prev") {
      if (currentCalendarMonth === 0) {
        setCurrentCalendarMonth(11);
        setCurrentYear((prev) => prev - 1);
      } else {
        setCurrentCalendarMonth(currentCalendarMonth - 1);
      }
    } else {
      if (currentCalendarMonth === 11) {
        setCurrentCalendarMonth(0);
        setCurrentYear((prev) => prev + 1);
      } else {
        setCurrentCalendarMonth(currentCalendarMonth + 1);
      }
    }
  };

  const handleDateClick = (day: number, month: number, year: number) => {
    const clickedDate = new Date(year, month, day);
    clickedDate.setHours(0, 0, 0, 0);

    // Date handling is now managed by DateContext
    // This function can be simplified or removed in future updates
    setShowCalendar(false);
  };

  // Format date helper
  const formatDateHelper = (date: Date | string, compact = false) => {
    if (!date) return "";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (compact) {
      return dateObj.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
      });
    }
    return dateObj
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      .replace(/ /g, "-");
  };

  // Add calendar year state
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // City data mapping (from landing page)
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

  const airlineCounts = availableAirlines.reduce(
    (acc, airline) => {
      const count = flightData.filter(
        (flight) => flight.airline === airline,
      ).length;
      acc[airline] = count > 0 ? count : Math.floor(Math.random() * 15) + 1; // Random count for demo airlines
      return acc;
    },
    {} as Record<string, number>,
  );

  const aircraftTypeCounts = availableAircraftTypes.reduce(
    (acc, aircraftType) => {
      const count = flightData.filter(
        (flight) => flight.aircraft === aircraftType,
      ).length;
      acc[aircraftType] = count > 0 ? count : Math.floor(Math.random() * 8) + 1; // Random count for demo aircraft types
      return acc;
    },
    {} as Record<string, number>,
  );

  // Filter flights based on selected airlines, aircraft types and fare type with sorting and pricing logic
  const filteredFlights = flights
    .filter((flight) => {
      // Filter by airlines
      const airlineMatch =
        selectedAirlines.size === 0 ||
        selectedAirlines.size === availableAirlines.length ||
        selectedAirlines.has(flight.airline);

      // Filter by aircraft types
      const aircraftTypeMatch =
        selectedAircraftTypes.size === 0 ||
        selectedAircraftTypes.size === availableAircraftTypes.length ||
        selectedAircraftTypes.has(flight.aircraft);

      // Filter by fare type (assume non-refundable for new structure)
      const fareTypeMatch =
        selectedFareType === "all" ||
        (selectedFareType === "refundable" &&
          (flight.refundability === "Refundable" ||
            flight.fareClass === "BUSINESS" ||
            flight.fareClass === "FIRST")) ||
        (selectedFareType === "non-refundable" &&
          (flight.refundability === "Non-Refundable" || !flight.refundability));

      return airlineMatch && aircraftTypeMatch && fareTypeMatch;
    })
    .map((flight) => ({
      ...flight,
      // Add fareTypes for backward compatibility if it doesn't exist
      fareTypes: flight.fareTypes || [
        {
          id: "default",
          name: flight.fareClass || "Economy",
          price: flight.price?.amount || 0,
          refundability: "Non-Refundable",
        },
      ],
      durationMinutes: (() => {
        try {
          const duration = flight.duration || "0h 0m";
          const hours = parseInt(duration.split("h")[0]) || 0;
          const minutes =
            parseInt(duration.split("h ")[1]?.split("m")[0] || "0") || 0;
          return hours * 60 + minutes;
        } catch {
          return 0;
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

  // Authentication functions
  const handleSignIn = () => {
    setAuthError("");
    if (
      loginEmail === testCredentials.email &&
      loginPassword === testCredentials.password
    ) {
      login({
        id: "1",
        name: testCredentials.name,
        email: loginEmail,
        loyaltyLevel: 1,
      });
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
      registerConfirmPassword &&
      registerFirstName &&
      registerLastName
    ) {
      if (registerPassword.length < 8) {
        setAuthError("Password must be at least 8 characters long");
        return;
      }
      if (registerPassword !== registerConfirmPassword) {
        setAuthError("Passwords do not match");
        return;
      }
      login({
        id: "1",
        name: `${registerFirstName} ${registerLastName}`,
        email: registerEmail,
        loyaltyLevel: 1,
      });
      setShowRegister(false);
      setRegisterEmail("");
      setRegisterPassword("");
      setRegisterConfirmPassword("");
      setRegisterFirstName("");
      setRegisterLastName("");
    } else {
      setAuthError("Please fill in all fields");
    }
  };

  const handleBooking = (flight: (typeof flightData)[0], fareType: any) => {
    navigate("/booking-flow", {
      state: {
        selectedFlight: flight,
        selectedFareType: fareType,
        negotiatedPrice: fareType.price,
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
    setDuplicatePriceError(false);
  };

  const generateAICounterOffer = (userPrice: number, originalPrice: number) => {
    const discountRequested = (originalPrice - userPrice) / originalPrice;
    if (discountRequested <= 0.3) {
      return Math.random() < 0.8 ? userPrice : Math.round(userPrice * 1.05);
    } else if (discountRequested <= 0.5) {
      const minOffer = Math.round(originalPrice * 0.7);
      const maxOffer = Math.round(originalPrice * 0.8);
      return Math.max(
        userPrice,
        Math.min(maxOffer, Math.round(userPrice * 1.1)),
      );
    } else {
      return Math.round(originalPrice * 0.7);
    }
  };

  const startBargaining = () => {
    if (!bargainFlight || !bargainFareType || !bargainPrice) return;

    const targetPriceInSelectedCurrency = parseInt(bargainPrice);
    const targetPriceInINR = Math.round(
      targetPriceInSelectedCurrency /
        (exchangeRates[selectedCurrency.code as keyof typeof exchangeRates] ||
          1),
    );
    const currentPriceInINR = bargainFareType.price;
    const priceKey = `${bargainFlight.id}-${bargainFareType.name}-${targetPriceInSelectedCurrency}`;

    // Check if this exact price has been tried before
    if (usedPrices.has(priceKey)) {
      setDuplicatePriceError(true);
      setTimeout(() => setDuplicatePriceError(false), 5000); // Hide after 5 seconds
      return;
    }

    if (targetPriceInINR >= currentPriceInINR) {
      setDuplicatePriceError(true);
      setTimeout(() => setDuplicatePriceError(false), 5000);
      return;
    }

    // Clear any existing error and add price to used prices
    setDuplicatePriceError(false);
    setUsedPrices((prev) => new Set([...prev, priceKey]));
    setBargainStep("progress");
    setBargainProgress(0);

    const progressInterval = setInterval(() => {
      setBargainProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);

          const aiOfferInINR = generateAICounterOffer(
            targetPriceInINR,
            currentPriceInINR,
          );
          setAiOfferPrice(aiOfferInINR);

          const isExactMatch = aiOfferInINR === targetPriceInINR;
          setBargainResult(isExactMatch ? "accepted" : "counter");
          setBargainStep("result");

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
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      {/* MOBILE-FIRST DESIGN: App-style header for mobile, standard for desktop */}
      <header className="bg-white md:bg-[#003580] shadow-sm md:shadow-none sticky top-0 z-50">
        {/* Mobile Header (≤768px) - App Style */}
        <div className="block md:hidden">
          <div className="px-4 py-3 bg-[#003580]">
            <div className="flex items-center justify-between">
              <button onClick={() => navigate("/")} className="p-2 -ml-2">
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <div className="flex-1 text-center">
                <h1 className="text-white font-semibold text-lg">
                  Flight Results
                </h1>
                <p className="text-blue-200 text-xs">
                  {selectedFromCity && selectedToCity
                    ? `${cityData[selectedFromCity]?.code || ""} → ${cityData[selectedToCity]?.code || ""} • `
                    : "Search Results • "}
                  {tripType === "one-way"
                    ? "One way"
                    : tripType === "multi-city"
                      ? "Multi-city (showing one-way options)"
                      : "Round trip"}{" "}
                  • {adults} adult{adults > 1 ? "s" : ""}
                </p>
              </div>
              <button
                onClick={() => setShowMobileMenu(true)}
                className="p-2 -mr-2"
              >
                <Menu className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>

          {/* Enhanced Mobile Search Summary */}
          <div className="bg-white border-b border-gray-200 px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                    <Plane className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base font-semibold text-gray-900">
                        {selectedFromCity && selectedToCity
                          ? `${cityData[selectedFromCity]?.code || ""} → ${cityData[selectedToCity]?.code || ""}`
                          : "Flight Search"}
                      </span>
                      <div className="flex items-center gap-1">
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                          {adults} adult{adults > 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3 text-blue-600" />
                      <span className="text-sm text-gray-600 font-medium">
                        {departureDate
                          ? formatDisplayDate(departureDate, "MMM d")
                          : "Select date"}
                        {tripType === "round-trip" && returnDate
                          ? ` - ${formatDisplayDate(returnDate, "MMM d")}`
                          : tripType === "round-trip"
                            ? " - Return"
                            : ""}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:bg-blue-50 font-medium px-4 py-2 h-auto rounded-lg border border-blue-200 active:scale-95 transition-all duration-200 touch-manipulation"
                onClick={() => setShowSearchEdit(true)}
              >
                <Settings className="w-3 h-3 mr-1" />
                Edit
              </Button>
            </div>
          </div>

          {/* Mobile Filter & Sort Bar */}
          <div className="bg-white border-b border-gray-200 px-4 py-3">
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-10 border-gray-300"
                onClick={() => setShowMobileFilters(true)}
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
                {(() => {
                  let count = 0;
                  if (selectedStops !== "any") count++;
                  if (
                    selectedAirlines.size < availableAirlines.length &&
                    selectedAirlines.size > 0
                  )
                    count++;
                  if (
                    selectedAircraftTypes.size <
                      availableAircraftTypes.length &&
                    selectedAircraftTypes.size > 0
                  )
                    count++;
                  if (selectedFareType !== "all") count++;
                  if (priceRange[0] > 0 || priceRange[1] < 100000) count++;
                  return (
                    count > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {count}
                      </Badge>
                    )
                  );
                })()}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-10 border-gray-300"
                onClick={() => setShowSortOptions(true)}
              >
                <ArrowUpDown className="w-4 h-4 mr-2" />
                Sort:{" "}
                {sortBy === "cheapest"
                  ? "Price"
                  : sortBy === "fastest"
                    ? "Duration"
                    : "Default"}
              </Button>
            </div>
          </div>
        </div>

        {/* Desktop Header (≥769px) - Consistent Design */}
        <div className="hidden md:block">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between text-white">
              {/* Left: Logo */}
              <div className="flex items-center">
                <Link
                  to="/"
                  className="flex items-center space-x-2 text-white hover:text-blue-200 transition-colors"
                >
                  <div className="w-8 h-8 bg-[#febb02] rounded-lg flex items-center justify-center">
                    <Plane className="w-4 h-4 text-[#003580]" />
                  </div>
                  <span className="text-2xl font-bold">faredown.com</span>
                </Link>
              </div>

              {/* Center: Navigation */}
              <nav className="flex items-center space-x-8">
                <Link
                  to="/?tab=flights"
                  className="text-white font-medium px-4 py-2 rounded-md bg-blue-700 hover:bg-blue-600 transition-colors"
                >
                  Flights
                </Link>
                <Link
                  to="/hotels"
                  className="text-white font-medium px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                >
                  Hotels
                </Link>
                <Link
                  to="/?tab=sightseeing"
                  className="text-white font-medium px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                >
                  Sightseeing
                </Link>
                <Link
                  to="/?tab=transfers"
                  className="text-white font-medium px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                >
                  Transfers
                </Link>
              </nav>

              {/* Right: Currency + Auth */}
              <div className="flex items-center space-x-4">
                <DropdownMenu style={{ display: "none" }}>
                  <DropdownMenuContent className="w-56 max-h-60 overflow-y-auto">
                    {[
                      { code: "en", name: "English", flag: "🇬🇧" },
                      { code: "es", name: "Español", flag: "🇪🇸" },
                      { code: "fr", name: "Français", flag: "🇫����" },
                      { code: "de", name: "Deutsch", flag: "🇩🇪" },
                      { code: "it", name: "Italiano", flag: "🇮🇹" },
                      { code: "pt", name: "Portugu��s", flag: "🇵🇹" },
                      { code: "ar", name: "العربية", flag: "🇸🇦" },
                      { code: "hi", name: "हिन्दी", flag: "🇮����" },
                      { code: "ja", name: "日本語", flag: "🇯🇵" },
                      { code: "ko", name: "한국어", flag: "🇰🇷" },
                      { code: "zh", name: "中文", flag: "🇨🇳" },
                    ].map((language) => (
                      <DropdownMenuItem
                        key={language.code}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <span>{language.flag}</span>
                        <span>{language.name}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Currency Dropdown */}
                <DropdownMenu
                  open={showCurrencyDropdown}
                  onOpenChange={setShowCurrencyDropdown}
                >
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-blue-600 border border-blue-400 px-3 py-1 h-8 font-medium"
                    >
                      {selectedCurrency.code}
                      <ChevronDown className="w-3 h-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 max-h-60 overflow-y-auto">
                    {Object.entries({
                      USD: { symbol: "$", name: "US Dollar" },
                      EUR: { symbol: "€", name: "Euro" },
                      GBP: { symbol: "£", name: "British Pound" },
                      INR: { symbol: "₹", name: "Indian Rupee" },
                      AED: { symbol: "د.إ", name: "UAE Dirham" },
                      SAR: { symbol: "ر.س", name: "Saudi Riyal" },
                      JPY: { symbol: "¥", name: "Japanese Yen" },
                      CNY: { symbol: "¥", name: "Chinese Yuan" },
                      SGD: { symbol: "S$", name: "Singapore Dollar" },
                      AUD: { symbol: "A$", name: "Australian Dollar" },
                      CAD: { symbol: "C$", name: "Canadian Dollar" },
                    }).map(([code, currency]) => (
                      <DropdownMenuItem
                        key={code}
                        onClick={() => {
                          setSelectedCurrency({ code, ...currency });
                          setShowCurrencyDropdown(false);
                        }}
                        className="flex items-center justify-between cursor-pointer"
                      >
                        <span className="flex items-center space-x-2">
                          <span className="font-medium">{code}</span>
                          <span className="text-gray-600">
                            {currency.symbol}
                          </span>
                        </span>
                        <span className="text-sm text-gray-500">
                          {currency.name}
                        </span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Auth Section */}
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
                        <Link
                          to="/account?tab=loyalty"
                          className="flex items-center"
                        >
                          <Award className="w-4 h-4 mr-2" />
                          Loyalty program
                        </Link>
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
                        <Link to="/my-trips" className="flex items-center">
                          <BookOpen className="w-4 h-4 mr-2" />
                          Completed trips
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={logout}>
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-transparent border-white text-white hover:bg-white hover:text-blue-600 transition-colors px-6 py-2 h-9 font-medium"
                      onClick={() => setShowRegister(true)}
                    >
                      Register
                    </Button>
                    <Button
                      size="sm"
                      className="bg-blue-500 hover:bg-blue-400 text-white px-6 py-2 h-9 font-medium rounded-md"
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

      {/* Desktop Search Form Section - Exact Homepage Design */}
      <div className="hidden md:block bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 overflow-visible">
          <div className="flex flex-col gap-4">
            <div className="flex items-center bg-white rounded-lg p-2 sm:p-3 flex-1 w-full border sm:border-0">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-6 w-full sm:w-auto">
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
                    <div className="absolute top-8 left-0 bg-white border border-gray-200 rounded-lg shadow-xl p-2 z-[9999] w-48 min-w-[180px]">
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
                          className={`w-full text-left px-3 py-2 hover:bg-blue-50 rounded text-sm transition-colors ${
                            selectedClass === classType
                              ? "bg-blue-100 text-blue-700 font-medium"
                              : "text-gray-900"
                          }`}
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

          {/* Desktop Search inputs - Responsive Design */}
          <div className="flex flex-col lg:flex-row items-center gap-2 lg:gap-3 mt-2 w-full max-w-6xl overflow-visible">
            <div className="relative flex-1 lg:min-w-[280px] lg:max-w-[320px] w-full">
              <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-600 font-medium z-10">
                Leaving from
              </label>
              <div className="relative">
                <button
                  onClick={() => setShowFromCities(!showFromCities)}
                  className="flex items-center bg-white rounded border-2 border-blue-500 px-3 py-2 h-10 w-full hover:border-blue-600 touch-manipulation pr-10"
                >
                  <Plane className="w-4 h-4 text-gray-500 mr-2" />
                  <div className="flex items-center space-x-2 min-w-0">
                    {selectedFromCity ? (
                      <>
                        <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">
                          {cityData[selectedFromCity]?.code}
                        </div>
                        <span className="text-sm text-gray-700 font-medium truncate">
                          {cityData[selectedFromCity]?.airport}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm text-gray-500 font-medium">
                        Leaving from
                      </span>
                    )}
                  </div>
                </button>
                {selectedFromCity && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFromCity("");
                    }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                    title="Clear departure city"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>

              {showFromCities && (
                <div className="absolute top-14 left-0 right-0 sm:right-auto bg-white border border-gray-200 rounded-lg shadow-xl p-3 sm:p-4 z-50 w-full sm:w-96 max-h-80 overflow-y-auto">
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
                          <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                            <Plane className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              <span className="font-semibold">{data.code}</span>{" "}
                              • {city}
                            </div>
                            <div className="text-xs text-gray-500">
                              {data.airport}
                            </div>
                            <div className="text-xs text-gray-400">
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

            <div className="relative flex-1 lg:min-w-[280px] lg:max-w-[320px] w-full">
              <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-600 font-medium z-10">
                Going to
              </label>
              <div className="relative">
                <button
                  onClick={() => setShowToCities(!showToCities)}
                  className="flex items-center bg-white rounded border border-gray-300 px-3 py-2 h-10 w-full hover:border-blue-500 touch-manipulation pr-10"
                >
                  <Plane className="w-4 h-4 text-gray-500 mr-2" />
                  <div className="flex items-center space-x-2 min-w-0">
                    {selectedToCity ? (
                      <>
                        <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">
                          {cityData[selectedToCity]?.code}
                        </div>
                        <span className="text-sm text-gray-700 font-medium truncate">
                          {cityData[selectedToCity]?.airport}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm text-gray-500 font-medium">
                        Going to
                      </span>
                    )}
                  </div>
                </button>
                {selectedToCity && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedToCity("");
                    }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                    title="Clear destination city"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>

              {showToCities && (
                <div className="absolute top-14 left-0 right-0 sm:right-auto bg-white border border-gray-200 rounded-lg shadow-xl p-3 sm:p-4 z-50 w-full sm:w-96 max-h-80 overflow-y-auto">
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
                          <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                            <Plane className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              <span className="font-semibold">{data.code}</span>{" "}
                              • {city}
                            </div>
                            <div className="text-xs text-gray-500">
                              {data.airport}
                            </div>
                            <div className="text-xs text-gray-400">
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

            <div className="relative flex-1 lg:min-w-[320px] lg:max-w-[380px] w-full">
              <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-600 font-medium z-10">
                Travel dates
              </label>
              <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                <PopoverTrigger asChild>
                  <button className="flex items-center bg-white rounded border border-gray-300 px-3 py-2 h-10 w-full hover:border-blue-500 touch-manipulation">
                    <Calendar className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
                    <div className="flex items-center space-x-2 min-w-0">
                      <span className="text-sm text-gray-700 font-medium truncate">
                        {tripType === "one-way"
                          ? departureDate
                            ? formatDisplayDate(departureDate)
                            : "Select date"
                          : departureDate
                            ? `${formatDisplayDate(departureDate)}${returnDate ? ` - ${formatDisplayDate(returnDate)}` : " - Return"}`
                            : "Select dates"}
                      </span>
                    </div>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <BookingCalendar
                    bookingType="flight"
                    initialRange={{
                      startDate: departureDate || new Date(),
                      endDate:
                        returnDate || addDays(departureDate || new Date(), 7),
                    }}
                    onChange={(range) => {
                      console.log(
                        "Flight results calendar range selected:",
                        range,
                      );
                      // Note: DateContext will handle the date updates
                      // This is mainly for local display purposes
                    }}
                    onClose={() => setShowCalendar(false)}
                    className="w-full"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="relative flex-1 lg:min-w-[240px] lg:max-w-[280px] w-full">
              <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-600 font-medium z-10">
                Travelers
              </label>
              <button
                onClick={() => setShowTravelers(!showTravelers)}
                className="flex items-center bg-white rounded border border-gray-300 px-3 py-2 h-10 w-full hover:border-blue-500 touch-manipulation"
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span className="text-sm text-gray-700 font-medium truncate">
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
                        <div className="font-medium text-gray-900">Adults</div>
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
                          -
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

            <div className="w-full lg:w-auto lg:min-w-[120px]">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded h-10 font-medium text-sm w-full touch-manipulation">
                Search
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="flex flex-col md:flex-row max-w-7xl mx-auto">
        {/* Mobile CSS Override for appropriately sized checkboxes */}
        <style>
          {`
            @media (max-width: 1023px) {
              input[type="checkbox"], input[type="radio"] {
                width: 14px !important;
                height: 14px !important;
                min-width: 14px !important;
                min-height: 14px !important;
              }
            }

            @media (min-width: 1024px) {
              input[type="checkbox"], input[type="radio"] {
                width: 16px;
                height: 16px;
              }
            }
          `}
        </style>

        {/* Desktop Sidebar Filters (≥1024px) - Hotel Style Applied */}
        <div className="hidden lg:block w-80 flex-shrink-0 desktop-filter">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 sticky top-24">
            {/* Filter Header */}
            <div className="text-lg font-semibold mb-4 flex items-center">
              <Filter className="w-5 h-5 mr-2 text-[#003580]" />
              Filter by
            </div>

            {/* Clear Filters Button */}
            <div className="mt-3 pt-2 border-t border-gray-200">
              <button
                onClick={resetAllFilters}
                className="w-full text-blue-600 border border-blue-600 hover:bg-blue-50 text-sm h-8 rounded font-medium"
              >
                Clear all filters
              </button>
            </div>

            <div className="max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
              {/* Stops Filter */}
              <div className="space-y-1">
                <div className="border-b border-gray-200 pb-1">
                  <div className="text-sm font-semibold text-gray-900">
                    Stops
                  </div>
                </div>
                {[
                  { value: "any", label: "Any", count: flightData.length },
                  {
                    value: "direct",
                    label: "Direct only",
                    count: flightData.filter((f) => f.stops === 0).length,
                  },
                  {
                    value: "1-stop",
                    label: "1 stop",
                    count: flightData.filter((f) => f.stops === 1).length,
                  },
                  {
                    value: "2-plus",
                    label: "2+ stops",
                    count: flightData.filter((f) => f.stops >= 2).length,
                  },
                ].map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center justify-between py-0.5 min-h-[24px] pr-1"
                  >
                    <label className="text-sm text-gray-700 cursor-pointer flex-1 leading-tight flex items-center">
                      <div className="w-4 h-4 flex items-center justify-center mr-2">
                        <input
                          type="radio"
                          name="stops"
                          value={option.value}
                          checked={selectedStops === option.value}
                          onChange={() => handleStopsFilter(option.value)}
                          className={`w-3 h-3 sm:w-4 sm:h-4 ${selectedStops === option.value ? "bg-blue-600" : "bg-white border border-gray-400"}`}
                        />
                      </div>
                      {option.label}
                    </label>
                    <span className="text-xs text-gray-500 ml-2 mr-1">
                      {option.count}
                    </span>
                  </div>
                ))}
              </div>

              {/* Airlines Filter */}
              <div className="space-y-1 mt-4">
                <div className="border-b border-gray-200 pb-1 flex items-center justify-between">
                  <div className="text-sm font-semibold text-gray-900">
                    Airlines
                  </div>
                  <button
                    onClick={resetAirlineSelection}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Reset
                  </button>
                </div>
                {availableAirlines.map((airline) => (
                  <div
                    key={airline}
                    className="flex items-center justify-between py-0.5 min-h-[24px] group relative pr-1"
                    onMouseEnter={() => setHoveredAirline(airline)}
                    onMouseLeave={() => setHoveredAirline(null)}
                  >
                    <label className="text-sm text-gray-700 cursor-pointer flex-1 leading-tight flex items-center">
                      <div className="w-4 h-4 flex items-center justify-center mr-2">
                        <input
                          type="checkbox"
                          checked={selectedAirlines.has(airline)}
                          onChange={(e) =>
                            handleAirlineFilter(airline, e.target.checked)
                          }
                          className={`w-3 h-3 sm:w-4 sm:h-4 ${selectedAirlines.has(airline) ? "bg-blue-600" : "bg-white border border-gray-400"}`}
                        />
                      </div>
                      <span
                        className={`transition-colors ${hoveredAirline === airline ? "text-blue-600 font-medium" : "text-gray-700"}`}
                      >
                        {airline}
                      </span>
                    </label>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500 ml-2 mr-1">
                        {airlineCounts[airline]}
                      </span>
                      {hoveredAirline === airline && (
                        <button
                          onClick={() => handleOnlyThisAirline(airline)}
                          className="text-xs text-blue-600 font-medium whitespace-nowrap hover:text-blue-800 transition-colors"
                        >
                          Only this airline
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Aircraft Type Filter */}
              <div className="space-y-1 mt-4">
                <div className="border-b border-gray-200 pb-1 flex items-center justify-between">
                  <div className="text-sm font-semibold text-gray-900">
                    Aircraft Type
                  </div>
                  <button
                    onClick={resetAircraftTypeSelection}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Reset
                  </button>
                </div>
                {availableAircraftTypes.map((aircraftType) => (
                  <div
                    key={aircraftType}
                    className="flex items-center justify-between py-0.5 min-h-[24px] group relative pr-1"
                    onMouseEnter={() => setHoveredAircraftType(aircraftType)}
                    onMouseLeave={() => setHoveredAircraftType(null)}
                  >
                    <label className="text-sm text-gray-700 cursor-pointer flex-1 leading-tight flex items-center">
                      <div className="w-4 h-4 flex items-center justify-center mr-2">
                        <input
                          type="checkbox"
                          checked={selectedAircraftTypes.has(aircraftType)}
                          onChange={(e) =>
                            handleAircraftTypeFilter(
                              aircraftType,
                              e.target.checked,
                            )
                          }
                          className={`w-4 h-4 ${selectedAircraftTypes.has(aircraftType) ? "bg-blue-600" : "bg-white border border-gray-400"}`}
                        />
                      </div>
                      <span
                        className={`transition-colors ${hoveredAircraftType === aircraftType ? "text-blue-600 font-medium" : "text-gray-700"}`}
                      >
                        {aircraftType}
                      </span>
                    </label>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500 ml-2 mr-1">
                        {aircraftTypeCounts[aircraftType]}
                      </span>
                      {hoveredAircraftType === aircraftType && (
                        <button
                          onClick={() =>
                            handleOnlyThisAircraftType(aircraftType)
                          }
                          className="text-xs text-blue-600 font-medium whitespace-nowrap hover:text-blue-800 transition-colors"
                        >
                          Only this type
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Flight Times */}
              <div className="space-y-1 mt-4">
                <div className="border-b border-gray-200 pb-1">
                  <div className="text-sm font-semibold text-gray-900">
                    Flight times
                  </div>
                </div>

                {/* Departure times */}
                <div className="mt-1 space-y-0">
                  <div className="text-sm font-medium text-gray-700 mb-1">
                    Departing flight
                  </div>
                  {[
                    { label: "3:00 AM - 5:59 AM", range: [3, 6], count: 115 },
                    { label: "6:00 AM - 11:59 AM", range: [6, 12], count: 93 },
                    {
                      label: "12:00 PM - 5:59 PM",
                      range: [12, 18],
                      count: 290,
                    },
                    {
                      label: "6:00 PM - 11:59 PM",
                      range: [18, 24],
                      count: 145,
                    },
                  ].map((time, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-0.5 min-h-[24px] pr-1"
                    >
                      <label className="text-sm text-gray-700 cursor-pointer flex-1 leading-tight flex items-center">
                        <div className="w-4 h-4 flex items-center justify-center mr-2">
                          <input
                            type="checkbox"
                            className="w-4 h-4 bg-white border border-gray-400"
                          />
                        </div>
                        {time.label}
                      </label>
                      <span className="text-xs text-gray-500 ml-2 mr-1">
                        {time.count}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Return times */}
                <div className="mt-1 space-y-0">
                  <div className="text-sm font-medium text-gray-700 mb-1">
                    Return flight
                  </div>
                  {[
                    { label: "3:00 AM - 5:59 AM", range: [3, 6], count: 115 },
                    { label: "6:00 AM - 11:59 AM", range: [6, 12], count: 93 },
                    {
                      label: "12:00 PM - 5:59 PM",
                      range: [12, 18],
                      count: 290,
                    },
                    {
                      label: "6:00 PM - 11:59 PM",
                      range: [18, 24],
                      count: 145,
                    },
                  ].map((time, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-0.5 min-h-[24px] pr-1"
                    >
                      <label className="text-sm text-gray-700 cursor-pointer flex-1 leading-tight flex items-center">
                        <div className="w-4 h-4 flex items-center justify-center mr-2">
                          <input
                            type="checkbox"
                            className="w-4 h-4 bg-white border border-gray-400"
                          />
                        </div>
                        {time.label}
                      </label>
                      <span className="text-xs text-gray-500 ml-2 mr-1">
                        {time.count}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Fare Type Filter */}
                <div className="space-y-1 mt-4">
                  <div className="border-b border-gray-200 pb-1">
                    <div className="text-sm font-semibold text-gray-900">
                      Fare Type
                    </div>
                  </div>
                  {[
                    { value: "all", label: "All", count: flightData.length },
                    {
                      value: "refundable",
                      label: "Refundable",
                      count: flightData.filter(
                        (f) => f.refundability === "Refundable",
                      ).length,
                    },
                    {
                      value: "non-refundable",
                      label: "Non-Refundable",
                      count: flightData.filter(
                        (f) => f.refundability === "Non-Refundable",
                      ).length,
                    },
                  ].map((option) => (
                    <div
                      key={option.value}
                      className="flex items-center justify-between py-0.5 min-h-[24px] pr-1"
                    >
                      <label className="text-sm text-gray-700 cursor-pointer flex-1 leading-tight flex items-center">
                        <div className="w-4 h-4 flex items-center justify-center mr-2">
                          <input
                            type="radio"
                            name="fareType"
                            value={option.value}
                            checked={selectedFareType === option.value}
                            onChange={() => handleFareTypeFilter(option.value)}
                            className={`w-4 h-4 ${selectedFareType === option.value ? "bg-blue-600" : "bg-white border border-gray-400"}`}
                          />
                        </div>
                        {option.label}
                      </label>
                      <span className="text-xs text-gray-500 ml-2 mr-1">
                        {option.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Flight Results */}
        <div className="flex-1 p-0 md:p-4">
          {/* Desktop Sort Header */}
          <div className="hidden md:flex items-center justify-between mb-6 bg-white rounded-lg p-4">
            <div className="flex items-center space-x-4">
              <span className="font-medium">Sort by:</span>
              <div className="flex space-x-2">
                <Button
                  variant={sortBy === "cheapest" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy("cheapest")}
                  className={sortBy === "cheapest" ? "bg-blue-600" : ""}
                >
                  Cheapest
                </Button>
                <Button
                  variant={sortBy === "fastest" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy("fastest")}
                  className={sortBy === "fastest" ? "bg-blue-600" : ""}
                >
                  Fastest
                </Button>
              </div>
            </div>
          </div>

          {/* Flight Cards */}
          <div className="space-y-4">
            {/* Loading State */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Searching for Flights
                  </h3>
                  <p className="text-gray-600">
                    Finding the best deals from our airline partners...
                  </p>
                </div>
              </div>
            )}

            {/* Error State */}
            {searchError && !isLoading && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <XCircle className="w-8 h-8 text-red-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-red-900 mb-2">
                  Search Failed
                </h3>
                <p className="text-red-700 mb-4">{searchError}</p>
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Try Again
                </Button>
              </div>
            )}

            {/* No Results State */}
            {!isLoading && !searchError && filteredFlights.length === 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                <Plane className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Flights Found
                </h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search criteria or dates to find available
                  flights.
                </p>
                <Button
                  onClick={() => setShowSearchEdit(true)}
                  variant="outline"
                >
                  Modify Search
                </Button>
              </div>
            )}

            {/* Flight Results */}
            {!isLoading &&
              !searchError &&
              filteredFlights.map((flight, index) => (
                <div key={flight.id}>
                  {/* MOBILE CARD DESIGN (≤768px) - App Style */}
                  <div className="block md:hidden bg-white border border-gray-200 rounded-lg mb-4 shadow-sm relative">
                    <div className="p-4">
                      {/* Flight Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-white rounded-lg border shadow-sm flex items-center justify-center">
                            <img
                              src={
                                airlineLogos[flight.airline] ||
                                `https://pics.avs.io/60/60/${flight.airlineCode || "XX"}.png`
                              }
                              alt={flight.airline}
                              className="w-6 h-6 object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "https://via.placeholder.com/24x24/E5E7EB/6B7280?text=✈";
                              }}
                            />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 text-sm">
                              {flight.airline}
                            </div>
                            <div className="text-xs text-gray-500">
                              {flight.flightNumber} • {flight.aircraft}
                            </div>
                          </div>
                        </div>
                        <div className="text-right relative">
                          <div className="flex items-center justify-end space-x-1">
                            <div className="text-lg font-bold text-gray-900">
                              ₹{flight.price.amount.toLocaleString("en-IN")}
                            </div>
                            <div className="relative group">
                              <button className="text-gray-400 hover:text-gray-600 transition-colors cursor-help">
                                <Info className="w-3 h-3" />
                              </button>
                              {/* Mobile Fare Breakdown Tooltip - Shows on hover */}
                              <div className="absolute right-0 bottom-full mb-2 z-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                <div className="bg-white text-gray-800 text-sm rounded-xl p-4 shadow-xl border border-gray-100 min-w-[220px] backdrop-blur-sm">
                                  <div className="text-center font-semibold mb-3 text-gray-900 border-b border-gray-100 pb-2">
                                    Fare Breakdown
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                      <span className="text-gray-600">
                                        Base fare:
                                      </span>
                                      <span className="font-medium text-gray-900">
                                        ₹
                                        {flight.price.breakdown.baseFare.toLocaleString(
                                          "en-IN",
                                        )}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-gray-600">
                                        Taxes & fees:
                                      </span>
                                      <span className="font-medium text-gray-900">
                                        ₹
                                        {(
                                          flight.price.breakdown.taxes +
                                          flight.price.breakdown.fees
                                        ).toLocaleString("en-IN")}
                                      </span>
                                    </div>
                                    <div className="border-t border-gray-200 pt-2">
                                      <div className="flex justify-between items-center font-semibold">
                                        <span className="text-gray-900">
                                          Total:
                                        </span>
                                        <span className="text-blue-600">
                                          ₹
                                          {flight.price.breakdown.total.toLocaleString(
                                            "en-IN",
                                          )}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <p className="text-xs text-gray-500 text-center">
                                    All taxes and fees included
                                  </p>
                                  {/* Tooltip arrow pointing upward */}
                                  <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">
                            per person
                          </div>
                          <div className="text-xs font-medium text-blue-600">
                            {flight.fareClass || "Economy"}
                          </div>
                        </div>
                      </div>

                      {/* Flight Route - Mobile */}
                      <div className="space-y-4 mb-4">
                        {/* Outbound Flight */}
                        <div>
                          <div className="text-xs text-gray-500 mb-2 font-medium">
                            {tripType === "round-trip"
                              ? "Outbound Flight"
                              : "Flight"}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-center">
                              <div className="text-xl font-bold text-gray-900">
                                {flight.departureTime}
                              </div>
                              <div className="text-sm text-gray-600 font-medium">
                                {flight.departureCode || "BOM"}
                              </div>
                              <div className="text-xs text-gray-500">
                                {flight.departure?.city || "Mumbai"}
                              </div>
                            </div>
                            <div className="flex-1 mx-4">
                              <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                  <div className="w-full border-t-2 border-dashed border-gray-300"></div>
                                </div>
                                <div className="relative flex justify-center">
                                  <div className="bg-white px-2">
                                    <div className="flex flex-col items-center">
                                      <div className="text-xs text-gray-500 mb-1">
                                        {flight.duration}
                                      </div>
                                      <div className="w-3 h-3 bg-[#003580] rounded-full"></div>
                                      <div className="text-xs text-green-600 mt-1">
                                        {flight.stops === 0
                                          ? "Direct"
                                          : `${flight.stops} Stop${flight.stops > 1 ? "s" : ""}`}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-xl font-bold text-gray-900">
                                {flight.arrivalTime}
                              </div>
                              <div className="text-sm text-gray-600 font-medium">
                                {flight.arrivalCode || "DXB"}
                              </div>
                              <div className="text-xs text-gray-500">
                                {flight.arrival?.city || "Dubai"}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Return Flight - Show for round-trip flights */}
                        {tripType === "round-trip" && (
                          <div>
                            <div className="text-xs text-gray-500 mb-2 font-medium">
                              Return Flight
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="text-center">
                                <div className="text-xl font-bold text-gray-900">
                                  {flight.returnDepartureTime}
                                </div>
                                <div className="text-sm text-gray-600 font-medium">
                                  {flight.arrivalCode || "DXB"}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {flight.arrival?.city || "Dubai"}
                                </div>
                              </div>
                              <div className="flex-1 mx-4">
                                <div className="relative">
                                  <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t-2 border-dashed border-gray-300"></div>
                                  </div>
                                  <div className="relative flex justify-center">
                                    <div className="bg-white px-2">
                                      <div className="flex flex-col items-center">
                                        <div className="text-xs text-gray-500 mb-1">
                                          {flight.returnDuration}
                                        </div>
                                        <div className="w-3 h-3 bg-[#003580] rounded-full"></div>
                                        <div className="text-xs text-green-600 mt-1">
                                          {flight.flightType}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-xl font-bold text-gray-900">
                                  {flight.returnArrivalTime}
                                </div>
                                <div className="text-sm text-gray-600 font-medium">
                                  {flight.departureCode || "BOM"}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {flight.departure?.city || "Mumbai"}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Flight Features - Mobile */}
                      <div className="flex items-center justify-center space-x-4 mb-4 py-2 bg-gray-50 rounded-lg">
                        <div className="relative group flex items-center space-x-1">
                          <Luggage className="w-4 h-4 text-green-600 cursor-help" />
                          <Info className="w-3 h-3 text-gray-400 animate-pulse cursor-help" />
                          <span className="text-xs text-gray-700">Baggage</span>
                          {/* Mobile Baggage Tooltip */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                            <div className="bg-white text-gray-800 text-xs rounded-lg p-3 shadow-lg border border-gray-200 min-w-[180px]">
                              <div className="font-semibold mb-2 text-gray-900">
                                Baggage Allowance
                              </div>
                              <div className="space-y-1">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">
                                    Check-in:
                                  </span>
                                  <span className="font-medium">
                                    {flight.baggage?.checked?.weight || "20kg"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Cabin:</span>
                                  <span className="font-medium">
                                    {flight.baggage?.carryOn?.weight || "7kg"}
                                  </span>
                                </div>
                              </div>
                              {/* Tooltip arrow */}
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Shield className="w-4 h-4 text-green-600" />
                          <span className="text-xs text-gray-700">
                            Flexible
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Wifi className="w-4 h-4 text-green-600" />
                          <span className="text-xs text-gray-700">Wi-Fi</span>
                        </div>
                      </div>

                      {/* Action Buttons - Hotel Section Style Mobile */}
                      <div className="grid grid-cols-2 gap-2 mt-3 relative z-50 pointer-events-auto">
                        <Button
                          variant="outline"
                          className="min-h-[44px] px-6 py-3 font-semibold text-sm touch-manipulation flex items-center justify-center relative z-50"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log(
                              "View Details clicked for flight:",
                              flight.id,
                            );
                            navigate(`/flight-details/${flight.id}`, {
                              state: { flight },
                            });
                          }}
                          onTouchStart={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          View Details
                        </Button>
                        <Button
                          className="min-h-[44px] px-6 py-3 bg-[#febb02] hover:bg-[#e6a602] text-black font-semibold text-sm touch-manipulation flex items-center justify-center gap-2"
                          onClick={() => {
                            setBargainFlight(flight);
                            setBargainFareType({
                              id: "default",
                              name: flight.fareClass || "Economy",
                              price: flight.price.amount,
                              refundability: "Non-Refundable",
                            });
                            setShowBargainModal(true);
                            setBargainStep("input");
                          }}
                        >
                          <TrendingDown className="w-4 h-4" />
                          Bargain Now
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* DESKTOP CARD DESIGN (≥769px) - Original Enhanced */}
                  <div className="hidden md:block bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        {/* Left Side - Flight Details */}
                        <div className="flex-1">
                          <div className="flex items-center space-x-8">
                            {/* Airline Logo */}
                            <div className="flex flex-col space-y-4">
                              <div className="w-12 h-12 bg-white rounded border border-gray-200 flex items-center justify-center">
                                <img
                                  src={
                                    airlineLogos[flight.airline] ||
                                    `https://pics.avs.io/120/120/${flight.airlineCode || "XX"}.png`
                                  }
                                  alt={flight.airline}
                                  className="w-8 h-6 object-contain"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      "https://via.placeholder.com/32x24/E5E7EB/6B7280?text=✈";
                                  }}
                                />
                              </div>
                              <div className="w-12 h-12 bg-white rounded border border-gray-200 flex items-center justify-center">
                                <img
                                  src={
                                    airlineLogos[
                                      flight.returnAirline || flight.airline
                                    ] ||
                                    `https://pics.avs.io/120/120/${flight.airlineCode || "XX"}.png`
                                  }
                                  alt={flight.returnAirline || flight.airline}
                                  className="w-8 h-6 object-contain"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      "https://via.placeholder.com/32x24/E5E7EB/6B7280?text=✈";
                                  }}
                                />
                              </div>
                            </div>

                            {/* Flight Route */}
                            <div className="space-y-6">
                              {/* Outbound */}
                              <div className="flex items-center space-x-12">
                                <div className="text-center">
                                  <div className="text-xl font-bold text-gray-900">
                                    {flight.departureTime}
                                  </div>
                                  <div className="text-sm text-gray-600 font-medium">
                                    {flight.departureCode} •{" "}
                                    {departureDate
                                      ? formatDisplayDate(
                                          departureDate,
                                          "MMM d",
                                        )
                                      : "Select date"}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {flight.departure?.city || "Mumbai"}
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
                                    {flight.arrivalCode} •{" "}
                                    {departureDate
                                      ? formatDisplayDate(
                                          departureDate,
                                          "MMM d",
                                        )
                                      : "Select date"}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {flight.arrival?.city || "Dubai"}
                                  </div>
                                </div>
                              </div>

                              {/* Return Flight */}
                              {tripType === "round-trip" && (
                                <div className="flex items-center space-x-12">
                                  <div className="text-center">
                                    <div className="text-xl font-bold text-gray-900">
                                      {flight.returnDepartureTime}
                                    </div>
                                    <div className="text-sm text-gray-600 font-medium">
                                      {flight.arrivalCode} •{" "}
                                      {returnDate
                                        ? formatDisplayDate(returnDate, "MMM d")
                                        : "Select return date"}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {flight.arrival?.city || "Dubai"}
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
                                    <div className="text-sm text-gray-600 font-medium">
                                      {flight.departureCode} •{" "}
                                      {returnDate
                                        ? formatDisplayDate(returnDate, "MMM d")
                                        : "Select return date"}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {flight.departure?.city || "Mumbai"}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="mt-4 text-sm text-gray-600">
                            {flight.returnAirline &&
                            flight.returnAirline !== flight.airline
                              ? `${flight.airline}, ${flight.returnAirline}`
                              : flight.airline}
                          </div>
                        </div>

                        {/* Right Side - Pricing - Compact Layout */}
                        <div className="text-center ml-8">
                          {/* Fare Type and Price with Info Button */}
                          <div className="mb-1 relative">
                            <span className="text-sm font-medium text-gray-900">
                              {flight.fareTypes[0].name}
                            </span>
                            <div className="flex items-center justify-center space-x-2 mt-1">
                              <div className="text-xl font-bold text-gray-900">
                                {formatPrice(flight.fareTypes[0].price)}
                              </div>
                              <div className="relative group">
                                <button className="text-gray-400 hover:text-gray-600 transition-colors cursor-help">
                                  <Info className="w-4 h-4" />
                                </button>

                                {/* Fare Breakdown Tooltip - Shows on hover */}
                                <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 z-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                  <div className="bg-white text-gray-800 text-sm rounded-xl p-4 shadow-xl border border-gray-100 min-w-[220px] backdrop-blur-sm">
                                    <div className="text-center font-semibold mb-3 text-gray-900 border-b border-gray-100 pb-2">
                                      Fare Breakdown
                                    </div>
                                    <div className="space-y-2">
                                      <div className="flex justify-between items-center">
                                        <span className="text-gray-600">
                                          Base fare:
                                        </span>
                                        <span className="font-medium text-gray-900">
                                          {formatPrice(
                                            Math.round(
                                              flight.fareTypes[0].price * 0.75,
                                            ),
                                          )}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <span className="text-gray-600">
                                          Taxes & fees:
                                        </span>
                                        <span className="font-medium text-gray-900">
                                          {formatPrice(
                                            Math.round(
                                              flight.fareTypes[0].price * 0.25,
                                            ),
                                          )}
                                        </span>
                                      </div>
                                      <div className="border-t border-gray-200 pt-2 mt-2">
                                        <div className="flex justify-between items-center">
                                          <span className="font-semibold text-gray-900">
                                            Total:
                                          </span>
                                          <span className="font-bold text-lg text-blue-600">
                                            {formatPrice(
                                              flight.fareTypes[0].price,
                                            )}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="mt-3 pt-2 border-t border-gray-100">
                                      <p className="text-xs text-gray-500 text-center">
                                        All taxes and fees included
                                      </p>
                                    </div>
                                    {/* Tooltip arrow pointing to info icon */}
                                    <div className="absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-white"></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Baggage Info with Hover Indicator */}
                          <div className="flex items-center justify-center mb-2">
                            <div className="relative group flex items-center space-x-1">
                              <Luggage className="w-5 h-5 text-green-600 cursor-help" />
                              <Info className="w-3 h-3 text-gray-400 animate-pulse cursor-help" />
                              {/* Baggage Tooltip */}
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                                <div className="bg-white text-gray-800 text-xs rounded-lg p-3 shadow-lg border border-gray-200 min-w-[180px]">
                                  <div className="font-semibold mb-2 text-gray-900">
                                    Baggage Allowance
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">
                                        Check-in:
                                      </span>
                                      <span className="font-medium">23kg</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">
                                        Cabin:
                                      </span>
                                      <span className="font-medium">7kg</span>
                                    </div>
                                  </div>
                                  {/* Tooltip arrow */}
                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Compact text info */}
                          <div className="text-xs text-gray-600 mb-1">
                            All-inclusive price
                          </div>
                          <div
                            className={`text-xs mb-2 font-medium ${
                              flight.fareTypes[0].refundability === "Refundable"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {flight.fareTypes[0].refundability}
                          </div>

                          {/* Side-by-side buttons - Hotel Section Style */}
                          <div className="grid grid-cols-2 gap-2 mt-3 relative z-50 pointer-events-auto">
                            <Button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log(
                                  "Desktop View Details clicked for flight:",
                                  flight.id,
                                );
                                navigate(`/flight-details/${flight.id}`, {
                                  state: { flight },
                                });
                              }}
                              variant="outline"
                              className="min-h-[44px] px-6 py-3 font-semibold text-sm touch-manipulation flex items-center justify-center relative z-50"
                              onTouchStart={(e) => {
                                e.stopPropagation();
                              }}
                            >
                              View Details
                            </Button>
                            <Button
                              onClick={() =>
                                handleBargain(flight, flight.fareTypes[0])
                              }
                              className="min-h-[44px] px-6 py-3 bg-[#febb02] hover:bg-[#e6a602] text-black font-semibold text-sm touch-manipulation flex items-center justify-center gap-2"
                            >
                              <TrendingDown className="w-4 h-4" />
                              Bargain Now
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tabbed Flight Details Section - Appears when View Details is clicked */}
                  {Object.keys(expandedFlightDetails).some(
                    (key) =>
                      key.startsWith(flight.id) && expandedFlightDetails[key],
                  ) && (
                    <div className="mt-4 mx-4 md:mx-0">
                      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        {/* Tabs Header */}
                        <div className="border-b border-gray-200">
                          <div className="flex">
                            {Object.keys(expandedFlightDetails)
                              .filter(
                                (key) =>
                                  key.startsWith(flight.id) &&
                                  expandedFlightDetails[key],
                              )
                              .map((detailKey) => {
                                const currentTab =
                                  activeDetailTab[detailKey] || "itinerary";
                                return (
                                  <React.Fragment key={detailKey}>
                                    <button
                                      onClick={() => {
                                        const [flightId, fareTypeId] =
                                          detailKey.split("-");
                                        handleTabChange(
                                          flightId,
                                          fareTypeId,
                                          "itinerary",
                                        );
                                      }}
                                      className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                                        currentTab === "itinerary"
                                          ? "border-gray-800 text-gray-800 bg-gray-50"
                                          : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                      }`}
                                    >
                                      Itinerary
                                    </button>
                                    <button
                                      onClick={() => {
                                        const [flightId, fareTypeId] =
                                          detailKey.split("-");
                                        handleTabChange(
                                          flightId,
                                          fareTypeId,
                                          "fare-rules",
                                        );
                                      }}
                                      className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                                        currentTab === "fare-rules"
                                          ? "border-gray-800 text-gray-800 bg-gray-50"
                                          : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                      }`}
                                    >
                                      Fare Rules
                                    </button>
                                  </React.Fragment>
                                );
                              })}
                          </div>
                        </div>

                        {/* Tab Content */}
                        <div className="p-6">
                          {Object.keys(expandedFlightDetails)
                            .filter(
                              (key) =>
                                key.startsWith(flight.id) &&
                                expandedFlightDetails[key],
                            )
                            .map((detailKey) => {
                              const currentTab =
                                activeDetailTab[detailKey] || "itinerary";

                              return (
                                <div key={detailKey}>
                                  {/* Itinerary Tab Content */}
                                  {currentTab === "itinerary" && (
                                    <div className="space-y-8">
                                      {/* Outbound Flight */}
                                      <div>
                                        {/* Header */}
                                        <div className="flex items-center mb-6">
                                          <Plane className="w-5 h-5 mr-2 text-gray-700" />
                                          <h4 className="text-lg font-semibold text-gray-900">
                                            Outbound •{" "}
                                            {departureDate
                                              ? formatDisplayDate(
                                                  departureDate,
                                                  "eee, MMM d",
                                                )
                                              : "Tue, Jul 29"}
                                          </h4>
                                        </div>

                                        {/* Flight Card */}
                                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                                          {/* Airline Info */}
                                          <div className="flex items-center mb-6">
                                            <img
                                              src={flight.logo}
                                              alt={flight.airline}
                                              className="w-10 h-8 object-contain mr-3"
                                            />
                                            <div>
                                              <p className="font-semibold text-gray-900 text-base">
                                                {flight.airline}
                                              </p>
                                              <p className="text-sm text-gray-600">
                                                {flight.flightNumber}
                                              </p>
                                            </div>
                                          </div>

                                          {/* Flight Timeline */}
                                          <div className="flex items-center justify-between mb-6">
                                            {/* Departure */}
                                            <div className="text-center">
                                              <div className="text-3xl font-bold text-gray-900 mb-1">
                                                {flight.departureTime}
                                              </div>
                                              <div className="text-sm font-semibold text-gray-700 mb-1">
                                                {flight.departureCode}
                                              </div>
                                              <div className="text-xs text-gray-500">
                                                {flight.departureCity}
                                              </div>
                                            </div>

                                            {/* Connection Line */}
                                            <div className="flex-1 flex items-center mx-8">
                                              <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                                              <div className="flex-1 h-0.5 bg-gray-300 mx-2 relative">
                                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                                  <div className="bg-gray-600 text-white text-xs px-2 py-1 rounded font-medium">
                                                    Stop
                                                  </div>
                                                </div>
                                              </div>
                                              <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                                            </div>

                                            {/* Arrival */}
                                            <div className="text-center">
                                              <div className="text-3xl font-bold text-gray-900 mb-1">
                                                {flight.arrivalTime}
                                              </div>
                                              <div className="text-sm font-semibold text-gray-700 mb-1">
                                                {flight.arrivalCode}
                                              </div>
                                              <div className="text-xs text-gray-500">
                                                {flight.arrivalCity}
                                              </div>
                                            </div>
                                          </div>

                                          {/* Flight Details Grid */}
                                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm border-t border-gray-100 pt-4">
                                            <div>
                                              <p className="text-gray-500 mb-1">
                                                Aircraft
                                              </p>
                                              <p className="font-medium text-gray-900">
                                                {flight.aircraft}
                                              </p>
                                            </div>
                                            <div>
                                              <p className="text-gray-500 mb-1">
                                                Layover
                                              </p>
                                              <p className="font-medium text-gray-900">
                                                2h 5m
                                              </p>
                                            </div>
                                            <div>
                                              <p className="text-gray-500 mb-1">
                                                Flight time
                                              </p>
                                              <p className="font-medium text-gray-900">
                                                {flight.duration}
                                              </p>
                                            </div>
                                            <div>
                                              <p className="text-gray-500 mb-1">
                                                Operated by
                                              </p>
                                              <p className="font-medium text-gray-900">
                                                {flight.airline}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Return Flight (if round trip) */}
                                      {tripType === "round-trip" && (
                                        <div>
                                          {/* Header */}
                                          <div className="flex items-center mb-6">
                                            <Plane className="w-5 h-5 mr-2 text-gray-700 rotate-180" />
                                            <h4 className="text-lg font-semibold text-gray-900">
                                              Return •{" "}
                                              {returnDate
                                                ? formatDisplayDate(
                                                    returnDate,
                                                    "eee, MMM d",
                                                  )
                                                : "Fri, Aug 1"}
                                            </h4>
                                          </div>

                                          {/* Flight Card */}
                                          <div className="bg-white border border-gray-200 rounded-lg p-6">
                                            {/* Airline Info */}
                                            <div className="flex items-center mb-6">
                                              <img
                                                src={
                                                  flight.returnLogo ||
                                                  flight.logo
                                                }
                                                alt={
                                                  flight.returnAirline ||
                                                  flight.airline
                                                }
                                                className="w-10 h-8 object-contain mr-3"
                                              />
                                              <div>
                                                <p className="font-semibold text-gray-900 text-base">
                                                  {flight.returnAirline ||
                                                    flight.airline}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                  {flight.returnFlightNumber ||
                                                    "6E 1366"}
                                                </p>
                                              </div>
                                            </div>

                                            {/* Flight Timeline */}
                                            <div className="flex items-center justify-between mb-6">
                                              {/* Departure */}
                                              <div className="text-center">
                                                <div className="text-3xl font-bold text-gray-900 mb-1">
                                                  {flight.returnDepartureTime ||
                                                    "14:00"}
                                                </div>
                                                <div className="text-sm font-semibold text-gray-700 mb-1">
                                                  {flight.arrivalCode}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                  {flight.arrivalCity}
                                                </div>
                                              </div>

                                              {/* Connection Line */}
                                              <div className="flex-1 flex items-center mx-8">
                                                <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                                                <div className="flex-1 h-0.5 bg-gray-300 mx-2 relative">
                                                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                                    <div className="bg-gray-600 text-white text-xs px-2 py-1 rounded font-medium">
                                                      Stop
                                                    </div>
                                                  </div>
                                                </div>
                                                <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                                              </div>

                                              {/* Arrival */}
                                              <div className="text-center">
                                                <div className="text-3xl font-bold text-gray-900 mb-1">
                                                  {flight.returnArrivalTime ||
                                                    "19:30"}
                                                </div>
                                                <div className="text-sm font-semibold text-gray-700 mb-1">
                                                  {flight.departureCode}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                  {flight.departureCity}
                                                </div>
                                              </div>
                                            </div>

                                            {/* Flight Details Grid */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm border-t border-gray-100 pt-4">
                                              <div>
                                                <p className="text-gray-500 mb-1">
                                                  Aircraft
                                                </p>
                                                <p className="font-medium text-gray-900">
                                                  {flight.returnAircraft ||
                                                    flight.aircraft}
                                                </p>
                                              </div>
                                              <div>
                                                <p className="text-gray-500 mb-1">
                                                  Layover
                                                </p>
                                                <p className="font-medium text-gray-900">
                                                  2h 5m
                                                </p>
                                              </div>
                                              <div>
                                                <p className="text-gray-500 mb-1">
                                                  Flight time
                                                </p>
                                                <p className="font-medium text-gray-900">
                                                  {flight.returnDuration ||
                                                    "5h 30m"}
                                                </p>
                                              </div>
                                              <div>
                                                <p className="text-gray-500 mb-1">
                                                  Operated by
                                                </p>
                                                <p className="font-medium text-gray-900">
                                                  {flight.returnAirline ||
                                                    flight.airline}
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      )}

                                      {/* Book Now & Start Bargain Buttons */}
                                      <div className="border-t border-gray-200 pt-4 mt-6 space-y-3">
                                        {/* Start Bargain Button - Phase 1 */}
                                        <Button
                                          onClick={() => {
                                            const [flightId, fareTypeId] =
                                              detailKey.split("-");
                                            const fareType =
                                              flight.fareTypes.find(
                                                (ft) => ft.id === fareTypeId,
                                              ) || flight.fareTypes[0];

                                            const bargainItem =
                                              createFlightBargainItem({
                                                id: flight.id.toString(),
                                                airline: flight.airline,
                                                route: {
                                                  from:
                                                    selectedFromCity ||
                                                    flight.origin,
                                                  to:
                                                    selectedToCity ||
                                                    flight.destination,
                                                },
                                                class: selectedClass,
                                                price:
                                                  fareType.price ||
                                                  flight.price?.amount ||
                                                  0,
                                              });

                                            console.log(
                                              "🚀 Starting live API bargain (desktop):",
                                              bargainItem,
                                            );

                                            bargainHook.startBargain(
                                              bargainItem,
                                            );
                                          }}
                                          className="w-full bg-[#febb02] hover:bg-[#e6a602] active:bg-[#d19900] text-black py-3 text-lg font-semibold rounded-lg shadow-md transition-all duration-200 transform hover:scale-[1.01] flex items-center justify-center gap-2"
                                        >
                                          <TrendingDown className="w-4 h-4" />
                                          Bargain Now
                                        </Button>

                                        {/* Book Now Button */}
                                        <Button
                                          onClick={() => {
                                            // Find the fare type for this detail key
                                            const [flightId, fareTypeId] =
                                              detailKey.split("-");
                                            const fareType =
                                              flight.fareTypes.find(
                                                (ft) => ft.id === fareTypeId,
                                              ) || flight.fareTypes[0];
                                            handleBooking(flight, fareType);
                                          }}
                                          className="w-full bg-[#00c851] hover:bg-[#00a142] text-white py-4 text-lg font-bold rounded-lg shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
                                        >
                                          Book Now •{" "}
                                          {formatPrice(
                                            flight.fareTypes[0]?.price || 0,
                                          )}
                                        </Button>
                                      </div>
                                    </div>
                                  )}

                                  {/* Fare Rules Tab Content */}
                                  {currentTab === "fare-rules" && (
                                    <div className="space-y-6">
                                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <FileText className="w-5 h-5 mr-2 text-gray-700" />
                                        Standard fare (Price per traveller)
                                      </h4>

                                      {/* Sector-Specific Fare Rules */}
                                      <div className="space-y-6">
                                        {/* First Sector Rules - Outbound */}
                                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                          <h5 className="font-semibold text-gray-900 mb-4 flex items-center border-b border-gray-100 pb-3">
                                            <Plane className="w-5 h-5 mr-3 text-gray-600" />
                                            {flight.airline || "Emirates"} |{" "}
                                            {flight.departureCode || "BOM"} -{" "}
                                            {flight.arrivalCode || "DXB"}
                                          </h5>
                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-sm">
                                            <div className="space-y-3">
                                              <p className="font-semibold text-gray-800 mb-2">
                                                Cancellation fee
                                              </p>
                                              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                                                <div className="flex justify-between">
                                                  <span className="text-gray-600">
                                                    Airline fee:
                                                  </span>
                                                  <span className="text-gray-900 font-medium">
                                                    ��0
                                                  </span>
                                                </div>
                                                <div className="flex justify-between">
                                                  <span className="text-gray-600">
                                                    Faredown Fee:
                                                  </span>
                                                  <span className="text-gray-900 font-medium">
                                                    ₹500
                                                  </span>
                                                </div>
                                              </div>
                                              <p className="text-xs text-gray-500 leading-relaxed">
                                                Cancellation/Flight change
                                                charges are indicated per
                                                traveller. Clearing will stop
                                                accepting cancellation/change
                                                request if 72 hours before
                                                departure of the flight,
                                                depending on the airline.
                                              </p>
                                            </div>
                                            <div className="space-y-3">
                                              <p className="font-semibold text-gray-800 mb-2">
                                                Date change fee
                                              </p>
                                              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                                                <div className="flex justify-between">
                                                  <span className="text-gray-600">
                                                    Airline fee:
                                                  </span>
                                                  <span className="text-gray-900 font-medium">
                                                    ₹0
                                                  </span>
                                                </div>
                                                <div className="flex justify-between">
                                                  <span className="text-gray-600">
                                                    Faredown Fee:
                                                  </span>
                                                  <span className="text-gray-900 font-medium">
                                                    ₹500
                                                  </span>
                                                </div>
                                              </div>
                                              <p className="text-xs text-gray-500 leading-relaxed">
                                                Cancellation/Flight change
                                                charges are indicated per
                                                traveller. Clearing will stop
                                                accepting cancellation/change
                                                request if 72 hours before
                                                departure of the flight,
                                                depending on the airline.
                                              </p>
                                            </div>
                                            <div className="space-y-3">
                                              <p className="font-semibold text-gray-800 mb-2">
                                                Baggage Information:
                                              </p>
                                              <div className="bg-gray-50 rounded-lg p-3">
                                                <p className="text-gray-900 font-medium">
                                                  Check-in: 1 x 25 kg / Adult -
                                                  Cabin: 1 x 7 kg / Adult
                                                </p>
                                              </div>
                                            </div>
                                            <div className="space-y-3">
                                              <p className="font-semibold text-gray-800 mb-2">
                                                Important:
                                              </p>
                                              <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 space-y-2 leading-relaxed">
                                                <p>
                                                  • Direct flights are usually
                                                  cheaper than refundable
                                                  flights. However, you may have
                                                  to pay a large fee to cancel
                                                  or change your flight.
                                                </p>
                                                <p>
                                                  �� Cancellation/Flight change
                                                  charges are indicated per
                                                  traveller. Clearing will stop
                                                  accepting cancellation/change
                                                  request if 72 hours before
                                                  departure of the flight,
                                                  depending on the airline.
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Second Sector Rules - Return */}
                                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                          <h5 className="font-semibold text-gray-900 mb-4 flex items-center border-b border-gray-100 pb-3">
                                            <Plane className="w-5 h-5 mr-3 text-gray-600" />
                                            {flight.returnAirline || "Indigo"} |{" "}
                                            {flight.arrivalCode || "DXB"} -{" "}
                                            {flight.departureCode || "BOM"}
                                          </h5>
                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-sm">
                                            <div className="space-y-3">
                                              <p className="font-semibold text-gray-800 mb-2">
                                                Cancellation fee
                                              </p>
                                              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                                                <div className="flex justify-between">
                                                  <span className="text-gray-600">
                                                    Airline fee:
                                                  </span>
                                                  <span className="text-gray-900 font-medium">
                                                    ₹0
                                                  </span>
                                                </div>
                                                <div className="flex justify-between">
                                                  <span className="text-gray-600">
                                                    Faredown Fee:
                                                  </span>
                                                  <span className="text-gray-900 font-medium">
                                                    ��500
                                                  </span>
                                                </div>
                                              </div>
                                              <p className="text-xs text-gray-500 leading-relaxed">
                                                Cancellation/Flight change
                                                charges are indicated per
                                                traveller. Clearing will stop
                                                accepting cancellation/change
                                                request if 72 hours before
                                                departure of the flight,
                                                depending on the airline.
                                              </p>
                                            </div>
                                            <div className="space-y-3">
                                              <p className="font-semibold text-gray-800 mb-2">
                                                Date change fee
                                              </p>
                                              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                                                <div className="flex justify-between">
                                                  <span className="text-gray-600">
                                                    Airline fee:
                                                  </span>
                                                  <span className="text-gray-900 font-medium">
                                                    ₹0
                                                  </span>
                                                </div>
                                                <div className="flex justify-between">
                                                  <span className="text-gray-600">
                                                    Faredown Fee:
                                                  </span>
                                                  <span className="text-gray-900 font-medium">
                                                    ₹500
                                                  </span>
                                                </div>
                                              </div>
                                              <p className="text-xs text-gray-500 leading-relaxed">
                                                Cancellation/Flight change
                                                charges are indicated per
                                                traveller. Clearing will stop
                                                accepting cancellation/change
                                                request if 72 hours before
                                                departure of the flight,
                                                depending on the airline.
                                              </p>
                                            </div>
                                            <div className="space-y-3">
                                              <p className="font-semibold text-gray-800 mb-2">
                                                Baggage Information:
                                              </p>
                                              <div className="bg-gray-50 rounded-lg p-3">
                                                <p className="text-gray-900 font-medium">
                                                  Check-in: 1 x 15 kg / Adult -
                                                  Cabin: 1 x 7 kg / Adult
                                                </p>
                                              </div>
                                            </div>
                                            <div className="space-y-3">
                                              <p className="font-semibold text-gray-800 mb-2">
                                                Important:
                                              </p>
                                              <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 space-y-2 leading-relaxed">
                                                <p>
                                                  • Direct flights are usually
                                                  cheaper than refundable
                                                  flights. However, you may have
                                                  to pay a large fee to cancel
                                                  or change your flight.
                                                </p>
                                                <p>
                                                  • Cancellation/Flight change
                                                  charges are indicated per
                                                  traveller. Clearing will stop
                                                  accepting cancellation/change
                                                  request if 72 hours before
                                                  departure of the flight,
                                                  depending on the airline.
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Book Now & Start Bargain Buttons - Mobile */}
                                      <div className="border-t border-gray-200 pt-4 mt-4 space-y-3">
                                        {/* Start Bargain Button - Phase 1 Mobile */}
                                        <Button
                                          onClick={() => {
                                            const [flightId, fareTypeId] =
                                              detailKey.split("-");
                                            const fareType =
                                              flight.fareTypes.find(
                                                (ft) => ft.id === fareTypeId,
                                              ) || flight.fareTypes[0];

                                            const bargainItem =
                                              createFlightBargainItem({
                                                id: flight.id.toString(),
                                                airline: flight.airline,
                                                route: {
                                                  from:
                                                    selectedFromCity ||
                                                    flight.origin,
                                                  to:
                                                    selectedToCity ||
                                                    flight.destination,
                                                },
                                                class: selectedClass,
                                                price:
                                                  fareType.price ||
                                                  flight.price?.amount ||
                                                  0,
                                              });

                                            console.log(
                                              "📱 Starting live API bargain (mobile):",
                                              bargainItem,
                                            );

                                            bargainHook.startBargain(
                                              bargainItem,
                                            );
                                          }}
                                          className="w-full bg-[#febb02] hover:bg-[#e6a602] active:bg-[#d19900] text-black py-3 text-base font-semibold rounded-lg shadow-md transition-all duration-200 flex items-center justify-center gap-2"
                                        >
                                          <TrendingDown className="w-4 h-4" />
                                          Bargain Now
                                        </Button>

                                        {/* Book Now Button Mobile */}
                                        <Button
                                          onClick={() => {
                                            // Find the fare type for this detail key
                                            const [flightId, fareTypeId] =
                                              detailKey.split("-");
                                            const fareType =
                                              flight.fareTypes.find(
                                                (ft) => ft.id === fareTypeId,
                                              ) || flight.fareTypes[0];
                                            handleBooking(flight, fareType);
                                          }}
                                          className="w-full bg-[#00c851] hover:bg-[#00a142] text-white py-4 text-lg font-bold rounded-lg shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
                                        >
                                          Book Now •{" "}
                                          {formatPrice(
                                            flight.fareTypes[0]?.price || 0,
                                          )}
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Fare Rules Section - Appears when View Fare Rules is clicked */}
                  {Object.keys(showFareRules).some(
                    (key) => key.startsWith(flight.id) && showFareRules[key],
                  ) && (
                    <div className="mt-4 mx-4 md:mx-0">
                      <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-gray-900 flex items-center">
                            <Info className="w-5 h-5 mr-2 text-[#003580]" />
                            Fare Rules -{" "}
                            {flight.returnAirline &&
                            flight.returnAirline !== flight.airline
                              ? `${flight.airline} & ${flight.returnAirline}`
                              : flight.airline}{" "}
                            Flight
                          </h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const keysToClose = Object.keys(
                                showFareRules,
                              ).filter((key) => key.startsWith(flight.id));
                              setShowFareRules((prev) => {
                                const newState = { ...prev };
                                keysToClose.forEach((key) => {
                                  newState[key] = false;
                                });
                                return newState;
                              });
                            }}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="space-y-6">
                          {/* Force mixed airline display for debugging */}
                          {true ? (
                            <>
                              {/* First Sector Rules - Outbound */}
                              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                <h5 className="font-semibold text-gray-900 mb-4 flex items-center border-b border-gray-100 pb-3">
                                  <Plane className="w-5 h-5 mr-3 text-gray-600" />
                                  {flight.airline || "Emirates"} |{" "}
                                  {flight.departureCode || "BOM"} -{" "}
                                  {flight.arrivalCode || "DXB"}
                                </h5>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-sm">
                                  <div className="space-y-3">
                                    <p className="font-semibold text-gray-800 mb-2">
                                      Cancellation fee
                                    </p>
                                    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">
                                          Airline fee:
                                        </span>
                                        <span className="text-gray-900 font-medium">
                                          ₹0
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">
                                          Faredown Fee:
                                        </span>
                                        <span className="text-gray-900 font-medium">
                                          ₹500
                                        </span>
                                      </div>
                                    </div>
                                    <p className="text-xs text-gray-500 leading-relaxed">
                                      Cancellation/Flight change charges are
                                      indicated per traveller. Clearing will
                                      stop accepting cancellation/change request
                                      if 72 hours before departure of the
                                      flight, depending on the airline.
                                    </p>
                                  </div>
                                  <div className="space-y-3">
                                    <p className="font-semibold text-gray-800 mb-2">
                                      Date change fee
                                    </p>
                                    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">
                                          Airline fee:
                                        </span>
                                        <span className="text-gray-900 font-medium">
                                          ₹0
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">
                                          Faredown Fee:
                                        </span>
                                        <span className="text-gray-900 font-medium">
                                          ₹500
                                        </span>
                                      </div>
                                    </div>
                                    <p className="text-xs text-gray-500 leading-relaxed">
                                      Cancellation/Flight change charges are
                                      indicated per traveller. Clearing will
                                      stop accepting cancellation/change request
                                      if 72 hours before departure of the
                                      flight, depending on the airline.
                                    </p>
                                  </div>
                                  <div className="space-y-3">
                                    <p className="font-semibold text-gray-800 mb-2">
                                      Baggage Information:
                                    </p>
                                    <div className="bg-gray-50 rounded-lg p-3">
                                      <p className="text-gray-900 font-medium">
                                        Check-in: 1 x 25 kg / Adult - Cabin: 1 x
                                        7 kg / Adult
                                      </p>
                                    </div>
                                  </div>
                                  <div className="space-y-3">
                                    <p className="font-semibold text-gray-800 mb-2">
                                      Important:
                                    </p>
                                    <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 space-y-2 leading-relaxed">
                                      <p>
                                        • Direct flights are usually cheaper
                                        than refundable flights. However, you
                                        may have to pay a large fee to cancel or
                                        change your flight.
                                      </p>
                                      <p>
                                        • Cancellation/Flight change charges are
                                        indicated per traveller. Clearing will
                                        stop accepting cancellation/change
                                        request if 72 hours before departure of
                                        the flight, depending on the airline.
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Second Sector Rules - Return */}
                              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                <h5 className="font-semibold text-gray-900 mb-4 flex items-center border-b border-gray-100 pb-3">
                                  <Plane className="w-5 h-5 mr-3 text-gray-600" />
                                  {flight.returnAirline || "Indigo"} |{" "}
                                  {flight.arrivalCode || "DXB"} -{" "}
                                  {flight.departureCode || "BOM"}
                                </h5>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-sm">
                                  <div className="space-y-3">
                                    <p className="font-semibold text-gray-800 mb-2">
                                      Cancellation fee
                                    </p>
                                    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">
                                          Airline fee:
                                        </span>
                                        <span className="text-gray-900 font-medium">
                                          ₹0
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">
                                          Faredown Fee:
                                        </span>
                                        <span className="text-gray-900 font-medium">
                                          ₹500
                                        </span>
                                      </div>
                                    </div>
                                    <p className="text-xs text-gray-500 leading-relaxed">
                                      Cancellation/Flight change charges are
                                      indicated per traveller. Clearing will
                                      stop accepting cancellation/change request
                                      if 72 hours before departure of the
                                      flight, depending on the airline.
                                    </p>
                                  </div>
                                  <div className="space-y-3">
                                    <p className="font-semibold text-gray-800 mb-2">
                                      Date change fee
                                    </p>
                                    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">
                                          Airline fee:
                                        </span>
                                        <span className="text-gray-900 font-medium">
                                          ₹0
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">
                                          Faredown Fee:
                                        </span>
                                        <span className="text-gray-900 font-medium">
                                          ₹500
                                        </span>
                                      </div>
                                    </div>
                                    <p className="text-xs text-gray-500 leading-relaxed">
                                      Cancellation/Flight change charges are
                                      indicated per traveller. Clearing will
                                      stop accepting cancellation/change request
                                      if 72 hours before departure of the
                                      flight, depending on the airline.
                                    </p>
                                  </div>
                                  <div className="space-y-3">
                                    <p className="font-semibold text-gray-800 mb-2">
                                      Baggage Information:
                                    </p>
                                    <div className="bg-gray-50 rounded-lg p-3">
                                      <p className="text-gray-900 font-medium">
                                        Check-in: 1 x 15 kg / Adult - Cabin: 1 x
                                        7 kg / Adult
                                      </p>
                                    </div>
                                  </div>
                                  <div className="space-y-3">
                                    <p className="font-semibold text-gray-800 mb-2">
                                      Important:
                                    </p>
                                    <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 space-y-2 leading-relaxed">
                                      <p>
                                        • Direct flights are usually cheaper
                                        than refundable flights. However, you
                                        may have to pay a large fee to cancel or
                                        change your flight.
                                      </p>
                                      <p>
                                        • Cancellation/Flight change charges are
                                        indicated per traveller. Clearing will
                                        stop accepting cancellation/change
                                        request if 72 hours before departure of
                                        the flight, depending on the airline.
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              {/* Single Airline Outbound Sector */}
                              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                <h5 className="font-medium text-blue-900 mb-3 flex items-center">
                                  <Plane className="w-4 h-4 mr-2" />
                                  {flight.airline} | {flight.departureCode} -{" "}
                                  {flight.arrivalCode}
                                </h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p className="font-medium text-blue-700 mb-1">
                                      Cancellation fee
                                    </p>
                                    <div className="space-y-1">
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">
                                          Airline fee:
                                        </span>
                                        <span className="text-gray-900 font-medium">
                                          ��0
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">
                                          Faredown Fee:
                                        </span>
                                        <span className="text-gray-900 font-medium">
                                          ₹500
                                        </span>
                                      </div>
                                    </div>
                                    <p className="text-xs text-blue-600 mt-2">
                                      Cancellation/Flight change charges are
                                      indicated per traveller. Clearing will
                                      stop accepting cancellation/change request
                                      if 72 hours before departure of the
                                      flight, depending on the airline.
                                    </p>
                                  </div>
                                  <div>
                                    <p className="font-medium text-blue-700 mb-1">
                                      Date change fee
                                    </p>
                                    <div className="space-y-1">
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">
                                          Airline fee:
                                        </span>
                                        <span className="text-gray-900 font-medium">
                                          ₹0
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">
                                          Faredown Fee:
                                        </span>
                                        <span className="text-gray-900 font-medium">
                                          ₹500
                                        </span>
                                      </div>
                                    </div>
                                    <p className="text-xs text-blue-600 mt-2">
                                      Cancellation/Flight change charges are
                                      indicated per traveller. Clearing will
                                      stop accepting cancellation/change request
                                      if 72 hours before departure of the
                                      flight, depending on the airline.
                                    </p>
                                  </div>
                                  <div>
                                    <p className="font-medium text-blue-700 mb-1">
                                      Baggage Information:
                                    </p>
                                    <div className="space-y-1">
                                      <p className="text-gray-900">
                                        Check-in: 1 x 25 kg / Adult - Cabin: 1 x
                                        7 kg / Adult
                                      </p>
                                    </div>
                                  </div>
                                  <div>
                                    <p className="font-medium text-blue-700 mb-1">
                                      Important:
                                    </p>
                                    <div className="text-xs text-gray-700 space-y-1">
                                      <p>
                                        • Direct flights are usually cheaper
                                        than refundable flights. However, you
                                        may have to pay a large fee to cancel or
                                        change your flight.
                                      </p>
                                      <p>
                                        • Cancellation/Flight change charges are
                                        indicated per traveller. Clearing will
                                        stop accepting cancellation/change
                                        request if 72 hours before departure of
                                        the flight, depending on the airline.
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Single Airline Return Sector (if round trip) */}
                              {tripType === "round-trip" && (
                                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mt-4">
                                  <h5 className="font-medium text-blue-900 mb-3 flex items-center">
                                    <Plane className="w-4 h-4 mr-2" />
                                    {flight.airline} | {flight.arrivalCode} -{" "}
                                    {flight.departureCode}
                                  </h5>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <p className="font-medium text-blue-700 mb-1">
                                        Cancellation fee
                                      </p>
                                      <div className="space-y-1">
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">
                                            Airline fee:
                                          </span>
                                          <span className="text-gray-900 font-medium">
                                            ₹0
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">
                                            Faredown Fee:
                                          </span>
                                          <span className="text-gray-900 font-medium">
                                            ₹500
                                          </span>
                                        </div>
                                      </div>
                                      <p className="text-xs text-blue-600 mt-2">
                                        Cancellation/Flight change charges are
                                        indicated per traveller. Clearing will
                                        stop accepting cancellation/change
                                        request if 72 hours before departure of
                                        the flight, depending on the airline.
                                      </p>
                                    </div>
                                    <div>
                                      <p className="font-medium text-blue-700 mb-1">
                                        Date change fee
                                      </p>
                                      <div className="space-y-1">
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">
                                            Airline fee:
                                          </span>
                                          <span className="text-gray-900 font-medium">
                                            ₹0
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">
                                            Faredown Fee:
                                          </span>
                                          <span className="text-gray-900 font-medium">
                                            ₹500
                                          </span>
                                        </div>
                                      </div>
                                      <p className="text-xs text-blue-600 mt-2">
                                        Cancellation/Flight change charges are
                                        indicated per traveller. Clearing will
                                        stop accepting cancellation/change
                                        request if 72 hours before departure of
                                        the flight, depending on the airline.
                                      </p>
                                    </div>
                                    <div>
                                      <p className="font-medium text-blue-700 mb-1">
                                        Baggage Information:
                                      </p>
                                      <div className="space-y-1">
                                        <p className="text-gray-900">
                                          Check-in: 1 x 25 kg / Adult - Cabin: 1
                                          x 7 kg / Adult
                                        </p>
                                      </div>
                                    </div>
                                    <div>
                                      <p className="font-medium text-blue-700 mb-1">
                                        Important:
                                      </p>
                                      <div className="text-xs text-gray-700 space-y-1">
                                        <p>
                                          �� Direct flights are usually cheaper
                                          than refundable flights. However, you
                                          may have to pay a large fee to cancel
                                          or change your flight.
                                        </p>
                                        <p>
                                          • Cancellation/Flight change charges
                                          are indicated per traveller. Clearing
                                          will stop accepting
                                          cancellation/change request if 72
                                          hours before departure of the flight,
                                          depending on the airline.
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </>
                          )}

                          {/* Important Terms */}
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-start">
                              <Info className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
                              <div>
                                <h6 className="font-medium text-yellow-800 mb-2">
                                  Important Terms
                                </h6>
                                <ul className="text-sm text-yellow-700 space-y-1">
                                  <li>
                                    • All cancellation and change fees are per
                                    passenger
                                  </li>
                                  <li>
                                    • Name changes not allowed after booking
                                  </li>
                                  <li>• Infant fares have different rules</li>
                                  <li>
                                    • Group bookings may have different terms
                                  </li>
                                  <li>
                                    �� Check-in required 2 hours before
                                    departure
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>

          {/* Lucky Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6 mx-4 md:mx-0 flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#003580] rounded-full flex items-center justify-center">
              <span className="text-white text-sm"></span>
            </div>
            <div>
              <p className="font-medium text-[#003580]">
                You're lucky! There are no better prices on nearby dates.
              </p>
              <p className="text-sm text-gray-600">
                Latest prices found for your search.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Padding */}
      <div className="h-20 md:h-0"></div>

      {/* Mobile Navigation Bottom Bar (<768px) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-40">
        <div className="grid grid-cols-5 h-16">
          <Link
            to="/"
            className="flex flex-col items-center justify-center space-y-1 touch-manipulation min-h-[48px] w-full"
          >
            <Plane className="w-5 h-5 text-[#003580]" />
            <span className="text-xs text-[#003580] font-medium">Flights</span>
          </Link>
          <Link
            to="/hotels"
            className="flex flex-col items-center justify-center space-y-1 touch-manipulation min-h-[48px] w-full"
          >
            <Hotel className="w-5 h-5 text-gray-400" />
            <span className="text-xs text-gray-500">Hotels</span>
          </Link>
          <Link
            to="/sightseeing"
            className="flex flex-col items-center justify-center space-y-1 touch-manipulation min-h-[48px] w-full"
          >
            <Camera className="w-5 h-5 text-gray-400" />
            <span className="text-xs text-gray-500">Sightseeing</span>
          </Link>
          <Link
            to="/saved"
            className="flex flex-col items-center justify-center space-y-1 touch-manipulation min-h-[48px] w-full"
          >
            <Heart className="w-5 h-5 text-gray-400" />
            <span className="text-xs text-gray-500">Saved</span>
          </Link>
          <Link
            to="/account"
            className="flex flex-col items-center justify-center space-y-1 touch-manipulation min-h-[48px] w-full"
          >
            <User className="w-5 h-5 text-gray-400" />
            <span className="text-xs text-gray-500">Account</span>
          </Link>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      <Dialog open={showMobileFilters} onOpenChange={setShowMobileFilters}>
        <DialogContent className="w-full h-full max-w-none m-0 rounded-none md:max-w-lg md:h-auto md:rounded-lg flex flex-col">
          <DialogHeader className="border-b border-gray-200 pb-3 px-4 pt-4 bg-white sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Filters & Sort
              </DialogTitle>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-4 p-4 pb-4">
              {/* Sort Options */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Sort by
                </h3>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="sort"
                      checked={sortBy === "cheapest"}
                      onChange={() => setSortBy("cheapest")}
                      className="w-3 h-3 text-[#003580] focus:ring-[#003580] focus:ring-1"
                    />
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">
                        Cheapest first
                      </div>
                      <div className="text-xs text-gray-500">Lowest price</div>
                    </div>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="sort"
                      checked={sortBy === "fastest"}
                      onChange={() => setSortBy("fastest")}
                      className="w-3 h-3 text-[#003580] focus:ring-[#003580] focus:ring-1"
                    />
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">
                        Fastest first
                      </div>
                      <div className="text-xs text-gray-500">
                        Shortest duration
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Price Range Filter */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Price range (per person)
                </h3>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    placeholder="0"
                    value={priceRange[0]}
                    onChange={(e) =>
                      setPriceRange([Number(e.target.value), priceRange[1]])
                    }
                    className="flex-1 h-8 text-sm"
                  />
                  <span className="text-gray-400 text-sm">-</span>
                  <Input
                    type="number"
                    placeholder="100000"
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([priceRange[0], Number(e.target.value)])
                    }
                    className="flex-1 h-8 text-sm"
                  />
                </div>
              </div>

              {/* Stops Filter */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Stops
                </h3>
                <div className="space-y-1">
                  {[
                    { value: "any", label: "Any", count: flightData.length },
                    {
                      value: "direct",
                      label: "Direct only",
                      count: flightData.filter((f) => f.stops === 0).length,
                    },
                    {
                      value: "1-stop",
                      label: "1 stop",
                      count: flightData.filter((f) => f.stops === 1).length,
                    },
                    {
                      value: "2-plus",
                      label: "2+ stops",
                      count: flightData.filter((f) => f.stops >= 2).length,
                    },
                  ].map((option) => (
                    <div
                      key={option.value}
                      className="flex items-center justify-between py-1"
                    >
                      <label className="flex items-center space-x-2 cursor-pointer flex-1">
                        <input
                          type="radio"
                          name="mobile-stops"
                          value={option.value}
                          checked={selectedStops === option.value}
                          onChange={() => handleStopsFilter(option.value)}
                          className="w-3 h-3 text-[#003580] focus:ring-[#003580] focus:ring-1"
                        />
                        <span className="text-sm text-gray-900">
                          {option.label}
                        </span>
                      </label>
                      <span className="text-xs text-gray-500 ml-2">
                        {option.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Airlines Filter */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Airlines
                </h3>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {availableAirlines.map((airline) => (
                    <div
                      key={airline}
                      className="flex items-center justify-between py-1"
                    >
                      <label className="flex items-center space-x-2 cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          checked={selectedAirlines.has(airline)}
                          onChange={(e) =>
                            handleAirlineFilter(airline, e.target.checked)
                          }
                          className="w-3 h-3 text-[#003580] rounded focus:ring-[#003580] focus:ring-1"
                        />
                        <span className="text-sm text-gray-900">{airline}</span>
                      </label>
                      <span className="text-xs text-gray-500 ml-2">
                        {airlineCounts[airline]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Aircraft Type Filter */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Aircraft Type
                </h3>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {availableAircraftTypes.map((aircraftType) => (
                    <div
                      key={aircraftType}
                      className="flex items-center justify-between py-1"
                    >
                      <label className="flex items-center space-x-2 cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          checked={selectedAircraftTypes.has(aircraftType)}
                          onChange={(e) =>
                            handleAircraftTypeFilter(
                              aircraftType,
                              e.target.checked,
                            )
                          }
                          className="w-3 h-3 text-[#003580] rounded focus:ring-[#003580] focus:ring-1"
                        />
                        <span className="text-sm text-gray-900">
                          {aircraftType}
                        </span>
                      </label>
                      <span className="text-xs text-gray-500 ml-2">
                        {aircraftTypeCounts[aircraftType]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fare Type Filter */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Fare Type
                </h3>
                <div className="space-y-1">
                  {[
                    { value: "all", label: "All", count: flightData.length },
                    {
                      value: "refundable",
                      label: "Refundable",
                      count: flightData.filter(
                        (f) => f.refundability === "Refundable",
                      ).length,
                    },
                    {
                      value: "non-refundable",
                      label: "Non-Refundable",
                      count: flightData.filter(
                        (f) => f.refundability === "Non-Refundable",
                      ).length,
                    },
                  ].map((option) => (
                    <div
                      key={option.value}
                      className="flex items-center justify-between py-1"
                    >
                      <label className="flex items-center space-x-2 cursor-pointer flex-1">
                        <input
                          type="radio"
                          name="mobile-fareType"
                          value={option.value}
                          checked={selectedFareType === option.value}
                          onChange={() => handleFareTypeFilter(option.value)}
                          className="w-3 h-3 text-[#003580] focus:ring-[#003580] focus:ring-1"
                        />
                        <span className="text-sm text-gray-900">
                          {option.label}
                        </span>
                      </label>
                      <span className="text-xs text-gray-500 ml-2">
                        {option.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Departure Times */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Departure time
                </h3>

                {/* Quick Time Slots */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {[
                    { label: "Morning", range: [6, 12], icon: "☀️" },
                    { label: "Afternoon", range: [12, 18], icon: "���️" },
                    { label: "Evening", range: [18, 24], icon: "🌙" },
                    { label: "Night", range: [0, 6], icon: "🌅" },
                  ].map((timeSlot) => (
                    <button
                      key={timeSlot.label}
                      onClick={() =>
                        setDepartureTimeRange(
                          timeSlot.range as [number, number],
                        )
                      }
                      className={`py-2 px-3 rounded-lg text-center transition-colors ${
                        departureTimeRange[0] === timeSlot.range[0] &&
                        departureTimeRange[1] === timeSlot.range[1]
                          ? "bg-[#003580] text-white"
                          : "bg-gray-50 text-gray-700 active:bg-gray-100"
                      }`}
                    >
                      <div className="text-sm mb-1">{timeSlot.icon}</div>
                      <div className="text-xs font-medium">
                        {timeSlot.label}
                      </div>
                      <div className="text-xs opacity-75">
                        {timeSlot.range[0]}:00-{timeSlot.range[1]}:00
                      </div>
                    </button>
                  ))}
                </div>

                {/* Detailed Time Options */}
                <div className="space-y-1">
                  {[
                    {
                      label: "Early morning (3:00-5:59 AM)",
                      range: [3, 6],
                      count: 115,
                    },
                    {
                      label: "Morning (6:00-11:59 AM)",
                      range: [6, 12],
                      count: 93,
                    },
                    {
                      label: "Afternoon (12:00-5:59 PM)",
                      range: [12, 18],
                      count: 290,
                    },
                    {
                      label: "Evening (6:00-11:59 PM)",
                      range: [18, 24],
                      count: 145,
                    },
                  ].map((time) => (
                    <label
                      key={time.label}
                      className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 active:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-[#003580] rounded"
                        />
                        <span className="text-sm font-medium text-gray-900">
                          {time.label}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                        {time.count}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Return Flight Times */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Return time
                </h3>
                <div className="space-y-1">
                  {[
                    {
                      label: "Early morning (3:00-5:59 AM)",
                      range: [3, 6],
                      count: 115,
                    },
                    {
                      label: "Morning (6:00-11:59 AM)",
                      range: [6, 12],
                      count: 93,
                    },
                    {
                      label: "Afternoon (12:00-5:59 PM)",
                      range: [12, 18],
                      count: 290,
                    },
                    {
                      label: "Evening (6:00-11:59 PM)",
                      range: [18, 24],
                      count: 145,
                    },
                  ].map((time) => (
                    <label
                      key={time.label}
                      className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 active:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-[#003580] rounded"
                        />
                        <span className="text-sm font-medium text-gray-900">
                          {time.label}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                        {time.count}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Duration Filter */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Flight duration
                </h3>
                <div className="space-y-1">
                  {[
                    { label: "Under 6 hours", count: 45 },
                    { label: "6-12 hours", count: 120 },
                    { label: "12-18 hours", count: 89 },
                    { label: "Over 18 hours", count: 34 },
                  ].map((duration) => (
                    <label
                      key={duration.label}
                      className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 active:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-[#003580] rounded"
                        />
                        <span className="text-sm font-medium text-gray-900">
                          {duration.label}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                        {duration.count}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Baggage Allowance */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Baggage
                </h3>
                <div className="space-y-1">
                  {[
                    { label: "Cabin bag only", count: 78 },
                    { label: "Cabin + Check-in bag", count: 210 },
                    { label: "Extra baggage", count: 45 },
                  ].map((baggage) => (
                    <label
                      key={baggage.label}
                      className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 active:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-[#003580] rounded"
                        />
                        <span className="text-sm font-medium text-gray-900">
                          {baggage.label}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                        {baggage.count}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* Fixed Footer Buttons */}
          <div className="border-t border-gray-200 p-4 bg-white">
            <div className="flex space-x-3">
              <Button
                variant="outline"
                className="flex-1 h-10 font-medium border-gray-300 text-gray-700 text-sm"
                onClick={() => {
                  resetAllFilters();
                  setShowMobileFilters(false);
                }}
              >
                Clear all
              </Button>
              <Button
                className="flex-1 h-10 bg-[#003580] hover:bg-[#0071c2] font-medium text-white text-sm"
                onClick={() => setShowMobileFilters(false)}
              >
                Show {filteredFlights.length} results
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sort Options Modal */}
      <Dialog open={showSortOptions} onOpenChange={setShowSortOptions}>
        <DialogContent className="w-full h-auto max-w-none m-0 rounded-t-2xl rounded-b-none md:max-w-lg md:h-auto md:rounded-lg fixed bottom-0 md:relative">
          <DialogHeader className="border-b border-gray-200 pb-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-semibold">
                Sort by
              </DialogTitle>
              <button
                onClick={() => setShowSortOptions(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </DialogHeader>
          <div className="p-4 space-y-3">
            <div className="flex items-center py-2">
              <label className="flex items-center space-x-2 cursor-pointer flex-1">
                <input
                  type="radio"
                  name="mobile-sort"
                  checked={sortBy === "cheapest"}
                  onChange={() => {
                    setSortBy("cheapest");
                    setShowSortOptions(false);
                  }}
                  className="w-3 h-3 text-[#003580] focus:ring-[#003580] focus:ring-1"
                />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    Cheapest first
                  </div>
                  <div className="text-xs text-gray-500">Lowest price</div>
                </div>
              </label>
            </div>
            <div className="flex items-center py-2">
              <label className="flex items-center space-x-2 cursor-pointer flex-1">
                <input
                  type="radio"
                  name="mobile-sort"
                  checked={sortBy === "fastest"}
                  onChange={() => {
                    setSortBy("fastest");
                    setShowSortOptions(false);
                  }}
                  className="w-3 h-3 text-[#003580] focus:ring-[#003580] focus:ring-1"
                />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    Fastest first
                  </div>
                  <div className="text-xs text-gray-500">Shortest duration</div>
                </div>
              </label>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Search Edit Modal - Exact Functional Specifications */}
      {showSearchEdit && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowSearchEdit(false)}
          />

          {/* Modal Container - Exact Specs */}
          <div className="fixed inset-4 z-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
              {/* HEADER SECTION - Exact Match */}
              <div className="bg-[#003580] text-white p-6 relative">
                <button
                  onClick={() => setShowSearchEdit(false)}
                  className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Logo & Branding - 32x32px yellow circle */}
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-8 h-8 bg-[#febb02] rounded-lg flex items-center justify-center">
                    <Plane className="w-4 h-4 text-[#003580]" />
                  </div>
                  <span className="text-lg font-bold">faredown.com</span>
                </div>

                {/* Title & Subtitle */}
                <h2 className="text-xl font-bold mb-1">
                  Upgrade. Bargain. Book.
                </h2>
                <p className="text-blue-200 text-sm mb-4">
                  Control your price for flights & hotels — with live AI
                  bargaining.
                </p>

                {/* TRIP TYPE TOGGLE - White with 10% opacity, 8px border-radius */}
                <div className="bg-white/10 rounded-lg p-1 flex">
                  <button
                    onClick={() => {
                      setEditTripType("round-trip");
                      setTripType("round-trip");
                    }}
                    className={cn(
                      "flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors",
                      editTripType === "round-trip"
                        ? "bg-white text-[#003580] shadow"
                        : "text-white hover:bg-white/20",
                    )}
                  >
                    Round trip
                  </button>
                  <button
                    onClick={() => {
                      setEditTripType("one-way");
                      setTripType("one-way");
                      setReturnDate(null);
                    }}
                    className={cn(
                      "flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors",
                      editTripType === "one-way"
                        ? "bg-white text-[#003580] shadow"
                        : "text-white hover:bg-white/20",
                    )}
                  >
                    One way
                  </button>
                  <button
                    onClick={() => {
                      setEditTripType("multi-city");
                      setTripType("multi-city");
                    }}
                    className={cn(
                      "flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors",
                      editTripType === "multi-city"
                        ? "bg-white text-[#003580] shadow"
                        : "text-white hover:bg-white/20",
                    )}
                  >
                    Multi-city
                  </button>
                </div>
              </div>

              {/* Form Content - Exact Card Specifications */}
              <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
                {/* FROM/TO CITIES CARD - Pure white, 12px border-radius, small shadow */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center space-x-3">
                    {/* From Section */}
                    <div className="flex-1">
                      <button
                        onClick={() => setShowFromCities(true)}
                        className="w-full text-left"
                      >
                        <div className="text-xs text-gray-500 mb-1">From</div>
                        <div className="flex items-center space-x-2">
                          {/* Icon Container - 32x32px blue-50 background, 8px rounded */}
                          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                            <Plane className="w-4 h-4 text-[#003580]" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              BOM
                            </div>
                            <div className="text-xs text-gray-500">Mumbai</div>
                          </div>
                        </div>
                      </button>
                    </div>

                    {/* Swap Button - 32x32px gray-100 circle */}
                    <button
                      onClick={() => {
                        const temp = selectedFromCity;
                        setSelectedFromCity(selectedToCity);
                        setSelectedToCity(temp);
                      }}
                      className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                    >
                      <ArrowRight className="w-4 h-4 text-gray-500" />
                    </button>

                    {/* To Section */}
                    <div className="flex-1">
                      <button
                        onClick={() => setShowToCities(true)}
                        className="w-full text-left"
                      >
                        <div className="text-xs text-gray-500 mb-1">To</div>
                        <div className="flex items-center space-x-2">
                          {/* Icon Container - 32x32px blue-50 background, 8px rounded */}
                          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                            <MapPin className="w-4 h-4 text-[#003580]" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              DXB
                            </div>
                            <div className="text-xs text-gray-500">Dubai</div>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* DATES CARD - Pure white, 12px border-radius, small shadow */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <button
                    onClick={() => setShowCalendar(true)}
                    className="w-full text-left"
                  >
                    <div className="text-xs text-gray-500 mb-1">Dates</div>
                    <div className="flex items-center space-x-2">
                      {/* Blue calendar icon - 20x20px */}
                      <Calendar className="w-5 h-5 text-[#003580]" />
                      <div>
                        <div className="font-semibold text-gray-900">
                          {departureDate &&
                          returnDate &&
                          tripType === "round-trip"
                            ? `${formatDisplayDate(departureDate, "d MMM")} - ${formatDisplayDate(returnDate, "d MMM")}`
                            : departureDate
                              ? formatDisplayDate(departureDate, "d MMM") +
                                (tripType === "one-way"
                                  ? ""
                                  : " - Select return")
                              : "Select dates"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {tripType === "one-way"
                            ? "One-way trip"
                            : "Choose departure & return"}
                        </div>
                      </div>
                    </div>
                  </button>
                </div>

                {/* TRAVELERS & CLASS GRID - 2-column grid with 12px gap */}
                <div className="grid grid-cols-2 gap-3">
                  {/* TRAVELERS CARD */}
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <button
                      onClick={() => setShowTravelers(true)}
                      className="w-full text-left"
                    >
                      <div className="text-xs text-gray-500 mb-1">
                        Travelers
                      </div>
                      <div className="flex items-center space-x-2">
                        {/* Blue users icon - 20x20px */}
                        <Users className="w-5 h-5 text-[#003580]" />
                        <div>
                          <div className="font-semibold text-gray-900">1</div>
                          <div className="text-xs text-gray-500">1 adult</div>
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* CLASS CARD */}
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <button
                      onClick={() => setShowClassDropdown(true)}
                      className="w-full text-left"
                    >
                      <div className="text-xs text-gray-500 mb-1">Class</div>
                      <div className="flex items-center space-x-2">
                        {/* Blue settings icon - 20x20px */}
                        <Settings className="w-5 h-5 text-[#003580]" />
                        <div>
                          <div className="font-semibold text-gray-900">
                            Economy
                          </div>
                          <div className="text-xs text-gray-500">
                            Travel class
                          </div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* SEARCH BUTTON - Full width, blue background, 12px border-radius */}
                <Button
                  className="w-full bg-[#003580] hover:bg-[#0071c2] text-white py-4 text-lg font-semibold rounded-xl shadow-lg mt-4"
                  onClick={() => setShowSearchEdit(false)}
                >
                  <Search className="w-5 h-5 mr-2" />
                  Search Flights
                </Button>
              </div>

              {/* SAMPLE PRICES SECTION - Blue background, 24px horizontal padding */}
              <div className="bg-[#003580] text-white p-6">
                <h3 className="text-lg font-semibold mb-3 text-center">
                  Sample Flight Prices in Indian Rupee
                </h3>
                <div className="space-y-2">
                  {/* Price Card 1 */}
                  <div className="bg-white/10 rounded-xl p-4 flex justify-between items-center">
                    <div>
                      <div className="text-sm font-medium">Mumbai → Dubai</div>
                      <div className="text-xs text-blue-200">
                        Emirates • Non-stop • 3h 30m
                      </div>
                    </div>
                    <div className="text-lg font-bold">₹15500</div>
                  </div>
                  {/* Price Card 2 */}
                  <div className="bg-white/10 rounded-xl p-4 flex justify-between items-center">
                    <div>
                      <div className="text-sm font-medium">
                        Delhi → Singapore
                      </div>
                      <div className="text-xs text-blue-200">
                        Air India • 1 stop • 8h 45m
                      </div>
                    </div>
                    <div className="text-lg font-bold">₹22800</div>
                  </div>
                  {/* Price Card 3 */}
                  <div className="bg-white/10 rounded-xl p-4 flex justify-between items-center">
                    <div>
                      <div className="text-sm font-medium">Mumbai → London</div>
                      <div className="text-xs text-blue-200">
                        British Airways • Non-stop • 9h 25m
                      </div>
                    </div>
                    <div className="text-lg font-bold">₹45200</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Enhanced AI Bargain Modal */}
      <Dialog open={showBargainModal} onOpenChange={setShowBargainModal}>
        <DialogContent className="w-full h-full max-w-none m-0 rounded-none md:max-w-2xl md:h-auto md:rounded-lg bg-gradient-to-br from-blue-50 to-white overflow-y-auto">
          <DialogHeader className="border-b border-[#003580]/20 pb-4 bg-gradient-to-r from-[#003580] to-[#0071c2] text-white rounded-t-lg -m-6 mb-0 p-6">
            <DialogTitle className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">AI</span>
              </div>
              <span className="text-xl font-semibold">AI Price Negotiator</span>
            </DialogTitle>
          </DialogHeader>

          {bargainFlight && bargainFareType && (
            <div className="space-y-4 md:space-y-6 p-3 md:p-6">
              {bargainStep === "input" && (
                <>
                  {/* Flight Info */}
                  <div className="bg-white rounded-xl p-3 md:p-6 border border-[#003580]/10 shadow-sm">
                    <div className="flex items-center justify-between mb-3 md:mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-[#003580]/10 rounded-lg flex items-center justify-center">
                          <Plane className="w-6 h-6 text-[#003580]" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">
                            {bargainFlight.airline}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {bargainFareType.name} •{" "}
                            {bargainFlight.flightNumber}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl md:text-3xl font-bold text-[#003580] mb-1">
                          {formatPrice(bargainFareType.price)}
                        </p>
                        <p className="text-xs text-gray-500">
                          (All Inclusive Price)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* AI Interface */}
                  <div className="space-y-3 md:space-y-4">
                    <div className="flex items-center space-x-3 md:space-x-4 p-3 md:p-4 bg-gradient-to-r from-[#003580]/5 to-[#0071c2]/5 rounded-xl border border-[#003580]/10">
                      <div className="w-12 h-12 bg-gradient-to-r from-[#003580] to-[#0071c2] rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">AI</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">
                          AI Assistant
                        </p>
                        <p className="text-sm text-gray-600">
                          Tell me your target price and I'll negotiate with the
                          airline!
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm md:text-base font-semibold mb-3 text-gray-900 text-center">
                        What price would you like to pay? (
                        {selectedCurrency.symbol})
                      </label>

                      {/* Error Message Box */}
                      {duplicatePriceError && (
                        <div className="mb-4 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-4 shadow-lg animate-pulse">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                              <XCircle className="w-6 h-6 text-red-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-red-800 font-bold text-lg mb-1">
                                Oops! Price Already Used
                              </h4>
                              <p className="text-red-700 text-sm font-medium">
                                {usedPrices.has(
                                  `${bargainFlight?.id}-${bargainFareType?.name}-${parseInt(bargainPrice)}`,
                                )
                                  ? "You've already tried this exact price! Please enter a different amount to negotiate."
                                  : "Please enter a price lower than the current price to start negotiation!"}
                              </p>
                            </div>
                            <button
                              onClick={() => setDuplicatePriceError(false)}
                              className="text-red-400 hover:text-red-600 transition-colors"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="relative">
                        <Input
                          type="text"
                          value={
                            bargainPrice
                              ? formatNumberWithCommas(bargainPrice)
                              : ""
                          }
                          onChange={(e) => {
                            const numericValue = e.target.value.replace(
                              /[^0-9]/g,
                              "",
                            );
                            setBargainPrice(numericValue);
                            // Clear error when user starts typing
                            if (duplicatePriceError) {
                              setDuplicatePriceError(false);
                            }
                          }}
                          placeholder="Enter your target price"
                          className={`text-lg md:text-xl font-bold text-center py-4 md:py-6 border-2 focus:border-[#003580] placeholder:text-gray-400 placeholder:font-normal rounded-xl bg-white shadow-sm transition-colors ${
                            duplicatePriceError
                              ? "border-red-300 focus:border-red-500"
                              : "border-[#003580]/20"
                          }`}
                        />
                        <div className="absolute inset-y-0 left-3 md:left-4 flex items-center">
                          <span className="text-[#003580] text-lg md:text-xl font-semibold">
                            {selectedCurrency.symbol}
                          </span>
                        </div>
                      </div>
                      {bargainPrice && (
                        <p className="text-center text-sm text-gray-600 mt-2 font-medium">
                          {numberToWords(bargainPrice)}
                        </p>
                      )}
                    </div>

                    <Button
                      onClick={startBargaining}
                      disabled={!bargainPrice || parseInt(bargainPrice) <= 0}
                      className="w-full bg-gradient-to-r from-[#003580] to-[#0071c2] hover:from-[#002d6b] hover:to-[#005a9f] text-white py-4 md:py-6 text-base md:text-lg font-semibold rounded-xl disabled:bg-gray-400 shadow-lg touch-manipulation"
                    >
                      Start AI Negotiation
                    </Button>
                  </div>
                </>
              )}

              {bargainStep === "progress" && (
                <div className="text-center space-y-6 py-8">
                  <div className="relative">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-r from-[#003580] to-[#0071c2] rounded-full flex items-center justify-center animate-pulse shadow-lg">
                      <RefreshCw className="w-12 h-12 text-white animate-spin" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      AI Negotiating with {bargainFlight.airline}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Analyzing market rates and finding the best deal for
                      you...
                    </p>
                    <Progress
                      value={bargainProgress}
                      className="w-full h-4 bg-gray-200"
                    />
                    <p className="text-sm text-[#003580] font-semibold mt-2">
                      {bargainProgress}% Complete
                    </p>
                  </div>
                </div>
              )}

              {bargainStep === "result" && (
                <div className="text-center space-y-6">
                  {bargainResult === "accepted" ? (
                    <>
                      <div className="text-center">
                        <h3 className="text-2xl font-bold text-[#003580] mb-2">
                          Perfect Match!
                        </h3>
                        <p className="text-gray-600 mb-1 text-lg">
                          The airline accepted your exact price!
                        </p>
                      </div>

                      <div className="bg-white border-2 border-[#003580]/20 rounded-xl p-8 shadow-lg">
                        <div className="text-4xl font-bold text-[#003580] mb-2">
                          {selectedCurrency.symbol}
                          {parseInt(bargainPrice).toLocaleString()}
                        </div>
                        <p className="text-sm text-[#003580] font-medium">
                          {numberToWords(bargainPrice)}
                        </p>
                      </div>
                    </>
                  ) : bargainResult === "counter" ? (
                    <>
                      <div className="text-center">
                        <h3 className="text-2xl font-bold text-[#003580] mb-2">
                          AI Counter Offer!
                        </h3>
                        <p className="text-gray-600 mb-1 text-lg">
                          The airline couldn't match your price, but here's
                          their best offer!
                        </p>
                      </div>

                      <div className="bg-white border-2 border-[#003580]/20 rounded-xl p-8 shadow-lg">
                        <div className="text-4xl font-bold text-[#003580] mb-2">
                          {selectedCurrency.symbol}
                          {aiOfferPrice
                            ? convertPrice(aiOfferPrice).toLocaleString()
                            : "0"}
                        </div>
                        <p className="text-sm text-[#003580] font-medium mb-3">
                          {aiOfferPrice
                            ? numberToWords(
                                (
                                  convertPrice(aiOfferPrice) *
                                  (exchangeRates[
                                    selectedCurrency.code as keyof typeof exchangeRates
                                  ] || 1)
                                ).toString(),
                              )
                            : ""}
                        </p>
                        <div className="text-center">
                          <span className="text-sm font-semibold text-[#003580] bg-[#003580]/10 px-4 py-2 rounded-full">
                            You save {selectedCurrency.symbol}
                            {convertPrice(
                              bargainFareType.price - (aiOfferPrice || 0),
                            ).toLocaleString()}
                            !
                          </span>
                        </div>
                      </div>
                    </>
                  ) : null}

                  {isOfferValid ? (
                    <>
                      <div className="bg-white border-2 border-[#febb02] rounded-xl p-4 shadow-lg">
                        <div className="flex items-center justify-center space-x-3">
                          <span className="font-bold text-[#003580] text-xl">
                            Offer expires in: {offerExpiryTime}s
                          </span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Button
                          onClick={() => {
                            setShowBargainModal(false);
                            handleBooking(bargainFlight, {
                              ...bargainFareType,
                              price: aiOfferPrice || parseInt(bargainPrice),
                            });
                          }}
                          disabled={!isOfferValid}
                          className="w-full bg-gradient-to-r from-[#003580] to-[#0071c2] hover:from-[#002d6b] hover:to-[#005a9f] text-white py-5 text-xl font-bold rounded-xl shadow-lg"
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
                          className="w-full border-2 border-[#003580] text-[#003580] hover:bg-[#003580] hover:text-white py-4 text-lg font-semibold rounded-xl"
                        >
                          Try Different Price
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-white border-2 border-[#003580]/20 rounded-xl p-4 shadow-lg">
                        <p className="text-[#003580] font-medium">
                          Offer has expired
                        </p>
                      </div>
                      <Button
                        onClick={() => {
                          setBargainStep("input");
                          setBargainPrice("");
                          setBargainResult(null);
                          setIsOfferValid(false);
                          setOfferExpiryTime(0);
                        }}
                        className="w-full bg-gradient-to-r from-[#003580] to-[#0071c2] hover:from-[#002d6b] hover:to-[#005a9f] text-white py-4 text-lg font-semibold rounded-xl"
                      >
                        Start New Negotiation
                      </Button>
                    </div>
                  )}
                </div>
              )}
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
              <Button
                variant="link"
                onClick={() => {
                  setShowSignIn(false);
                  setShowRegister(true);
                }}
                className="text-blue-600 hover:text-blue-700"
              >
                Don't have an account? Register here
              </Button>
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
          </DialogHeader>

          <div className="space-y-4 p-4">
            {authError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{authError}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First name
                </label>
                <Input
                  type="text"
                  placeholder="First name"
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
                  placeholder="Last name"
                  value={registerLastName}
                  onChange={(e) => setRegisterLastName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <Input
                type="email"
                placeholder="Enter your email address"
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
                placeholder="Create a password (8+ characters)"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm password
              </label>
              <Input
                type="password"
                placeholder="Confirm your password"
                value={registerConfirmPassword}
                onChange={(e) => setRegisterConfirmPassword(e.target.value)}
              />
            </div>

            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
              onClick={handleRegister}
            >
              Create account
            </Button>

            <div className="text-center">
              <Button
                variant="link"
                onClick={() => {
                  setShowRegister(false);
                  setShowSignIn(true);
                }}
                className="text-blue-600 hover:text-blue-700"
              >
                Already have an account? Sign in here
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Flight Details Modal */}
      <Dialog open={showFlightDetails} onOpenChange={setShowFlightDetails}>
        <DialogContent className="w-full h-full max-w-none m-0 rounded-none md:max-w-4xl md:h-auto md:rounded-lg">
          <DialogHeader className="border-b border-gray-200 pb-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center">
                <Plane className="w-6 h-6 mr-2 text-[#003580]" />
                Flight Details & Fare Rules
              </DialogTitle>
              <button
                onClick={() => setShowFlightDetails(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </DialogHeader>

          {selectedFlightForDetails && (
            <div className="max-h-[80vh] overflow-y-auto">
              <div className="space-y-6 p-6">
                {/* Flight Overview */}
                <div className="bg-[#003580] text-white rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                        <img
                          src={selectedFlightForDetails.logo}
                          alt={selectedFlightForDetails.airline}
                          className="w-8 h-6 object-contain"
                        />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">
                          {selectedFlightForDetails.airline}
                        </h3>
                        <p className="text-blue-100">
                          {selectedFlightForDetails.flightNumber}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-blue-100 text-sm">Starting from</p>
                      <p className="text-2xl font-bold">
                        {formatPrice(
                          selectedFlightForDetails.fareTypes[0]?.price || 0,
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Flight Itinerary */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-[#003580]" />
                    Flight Itinerary
                  </h4>

                  {/* Outbound Flight */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="font-medium text-gray-900">
                        Outbound •{" "}
                        {departureDate
                          ? formatDisplayDate(departureDate, "eee, MMM d")
                          : "Select date"}
                      </h5>
                      <span className="text-sm px-2 py-1 bg-green-100 text-green-800 rounded">
                        {selectedFlightForDetails.flightType}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">
                          {selectedFlightForDetails.departureTime}
                        </div>
                        <div className="text-sm text-gray-600">
                          {selectedFlightForDetails.departureCode}
                        </div>
                        <div className="text-xs text-gray-500">
                          {selectedFlightForDetails.departureCity}
                        </div>
                        <div className="text-xs text-gray-500">
                          Terminal{" "}
                          {selectedFlightForDetails.departureTerminal || "1"}
                        </div>
                      </div>

                      <div className="flex flex-col items-center justify-center">
                        <div className="w-full flex items-center">
                          <div className="w-2 h-2 bg-[#003580] rounded-full"></div>
                          <div className="flex-1 h-px bg-gray-300 mx-2"></div>
                          <Plane className="w-4 h-4 text-[#003580]" />
                          <div className="flex-1 h-px bg-gray-300 mx-2"></div>
                          <div className="w-2 h-2 bg-[#003580] rounded-full"></div>
                        </div>
                        <div className="text-sm text-gray-600 mt-2">
                          {selectedFlightForDetails.duration}
                        </div>
                        <div className="text-xs text-gray-500">
                          {selectedFlightForDetails.stops} stops
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">
                          {selectedFlightForDetails.arrivalTime}
                        </div>
                        <div className="text-sm text-gray-600">
                          {selectedFlightForDetails.arrivalCode}
                        </div>
                        <div className="text-xs text-gray-500">
                          {selectedFlightForDetails.arrivalCity}
                        </div>
                        <div className="text-xs text-gray-500">
                          Terminal{" "}
                          {selectedFlightForDetails.arrivalTerminal || "3"}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Aircraft:</span>
                          <p className="font-medium">
                            {selectedFlightForDetails.aircraft ||
                              "Boeing 777-300ER"}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Flight Time:</span>
                          <p className="font-medium">
                            {selectedFlightForDetails.duration}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Distance:</span>
                          <p className="font-medium">
                            {selectedFlightForDetails.distance || "1,940 km"}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Operated by:</span>
                          <p className="font-medium">
                            {selectedFlightForDetails.airline}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Return Flight (if round trip) */}
                  {tripType === "round-trip" && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="font-medium text-gray-900">
                          Return •{" "}
                          {returnDate
                            ? formatDisplayDate(returnDate, "eee, MMM d")
                            : "Select date"}
                        </h5>
                        <span className="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded">
                          {selectedFlightForDetails.flightType}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">
                            {selectedFlightForDetails.returnDepartureTime ||
                              "08:45"}
                          </div>
                          <div className="text-sm text-gray-600">
                            {selectedFlightForDetails.arrivalCode}
                          </div>
                          <div className="text-xs text-gray-500">
                            {selectedFlightForDetails.arrivalCity}
                          </div>
                          <div className="text-xs text-gray-500">
                            Terminal{" "}
                            {selectedFlightForDetails.returnDepartureTerminal ||
                              "3"}
                          </div>
                        </div>

                        <div className="flex flex-col items-center justify-center">
                          <div className="w-full flex items-center">
                            <div className="w-2 h-2 bg-[#003580] rounded-full"></div>
                            <div className="flex-1 h-px bg-gray-300 mx-2"></div>
                            <Plane className="w-4 h-4 text-[#003580] rotate-180" />
                            <div className="flex-1 h-px bg-gray-300 mx-2"></div>
                            <div className="w-2 h-2 bg-[#003580] rounded-full"></div>
                          </div>
                          <div className="text-sm text-gray-600 mt-2">
                            {selectedFlightForDetails.returnDuration ||
                              "3h 20m"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {selectedFlightForDetails.returnStops || "Non-stop"}
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">
                            {selectedFlightForDetails.returnArrivalTime ||
                              "14:05"}
                          </div>
                          <div className="text-sm text-gray-600">
                            {selectedFlightForDetails.departureCode}
                          </div>
                          <div className="text-xs text-gray-500">
                            {selectedFlightForDetails.departureCity}
                          </div>
                          <div className="text-xs text-gray-500">
                            Terminal{" "}
                            {selectedFlightForDetails.returnArrivalTerminal ||
                              "2"}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Comprehensive Fare Rules */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-[#003580]" />
                    Fare Rules & Policies
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Baggage Information */}
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h5 className="font-semibold text-blue-800 mb-3 flex items-center">
                        <Luggage className="w-4 h-4 mr-2" />
                        Baggage Information
                      </h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-blue-700">Check-in:</span>
                          <span className="font-medium">1 × 23 kg / Adult</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700">Cabin:</span>
                          <span className="font-medium">1 × 7 kg / Adult</span>
                        </div>
                        <p className="text-xs text-blue-600 mt-2">
                          Additional baggage charges apply for excess weight
                        </p>
                      </div>
                    </div>

                    {/* Cancellation Policy */}
                    <div className="bg-red-50 rounded-lg p-4">
                      <h5 className="font-semibold text-red-800 mb-3 flex items-center">
                        <XCircle className="w-4 h-4 mr-2" />
                        Cancellation Policy
                      </h5>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-red-700 font-medium">
                            Airline fee:
                          </span>
                          <p className="text-red-600">��3,500 per passenger</p>
                        </div>
                        <div>
                          <span className="text-red-700 font-medium">
                            Faredown Fee:
                          </span>
                          <p className="text-red-600">₹500 per passenger</p>
                        </div>
                        <p className="text-xs text-red-600 mt-2">
                          Cancellation charges are indicated per traveller. 24
                          hours before departure of the flight.
                        </p>
                      </div>
                    </div>

                    {/* Date Change Policy */}
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <h5 className="font-semibold text-yellow-800 mb-3 flex items-center">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Date Change Policy
                      </h5>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-yellow-700 font-medium">
                            Airline fee:
                          </span>
                          <p className="text-yellow-600">
                            ₹2,314 per passenger
                          </p>
                        </div>
                        <div>
                          <span className="text-yellow-700 font-medium">
                            Faredown Fee:
                          </span>
                          <p className="text-yellow-600">₹500 per passenger</p>
                        </div>
                        <p className="text-xs text-yellow-600 mt-2">
                          Date change charges are indicated per traveller.
                          Subject to seat availability.
                        </p>
                      </div>
                    </div>

                    {/* Refund Policy */}
                    <div className="bg-green-50 rounded-lg p-4">
                      <h5 className="font-semibold text-green-800 mb-3 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Refund Policy
                      </h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-green-700">Status:</span>
                          <span
                            className={`font-medium ${selectedFlightForDetails.refundability === "Refundable" ? "text-green-600" : "text-red-600"}`}
                          >
                            {selectedFlightForDetails.refundability}
                          </span>
                        </div>
                        {selectedFlightForDetails.refundability ===
                        "Refundable" ? (
                          <p className="text-xs text-green-600">
                            Full refund available minus airline and service
                            charges
                          </p>
                        ) : (
                          <p className="text-xs text-red-600">
                            Only taxes and fees are refundable as per airline
                            policy
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Important Terms */}
                  <div className="mt-6 bg-gray-50 rounded-lg p-4">
                    <h5 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <Info className="w-4 h-4 mr-2" />
                      Important Terms & Conditions
                    </h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>
                        �� Passenger names cannot be changed after booking
                      </li>
                      <li>
                        �� Check-in must be completed 2 hours before departure
                      </li>
                      <li>• Valid government-issued photo ID required</li>
                      <li>
                        • All fees are per passenger and include applicable
                        taxes
                      </li>
                      <li>
                        • No-show will result in forfeiture of entire ticket
                        value
                      </li>
                      <li>
                        • Infant fares (below 2 years) have separate terms
                      </li>
                      <li>
                        • Group bookings may have different cancellation terms
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Mobile Dropdown Components for Edit Search */}
      <MobileCityDropdown
        isOpen={showFromCities}
        onClose={() => setShowFromCities(false)}
        title="Select departure city"
        cities={{
          Mumbai: {
            code: "BOM",
            name: "Mumbai",
            airport: "Chhatrapati Shivaji International",
            fullName: "Mumbai, India",
          },
          Delhi: {
            code: "DEL",
            name: "Delhi",
            airport: "Indira Gandhi International",
            fullName: "Delhi, India",
          },
          Bangalore: {
            code: "BLR",
            name: "Bangalore",
            airport: "Kempegowda International",
            fullName: "Bangalore, India",
          },
          Chennai: {
            code: "MAA",
            name: "Chennai",
            airport: "Chennai International",
            fullName: "Chennai, India",
          },
          Kolkata: {
            code: "CCU",
            name: "Kolkata",
            airport: "Netaji Subhas Chandra Bose",
            fullName: "Kolkata, India",
          },
        }}
        selectedCity={selectedFromCity}
        onSelectCity={setSelectedFromCity}
      />

      <MobileCityDropdown
        isOpen={showToCities}
        onClose={() => setShowToCities(false)}
        title="Select destination city"
        cities={{
          Dubai: {
            code: "DXB",
            name: "Dubai",
            airport: "Dubai International",
            fullName: "Dubai, UAE",
          },
          London: {
            code: "LHR",
            name: "London",
            airport: "Heathrow Airport",
            fullName: "London, UK",
          },
          "New York": {
            code: "JFK",
            name: "New York",
            airport: "John F. Kennedy International",
            fullName: "New York, USA",
          },
          Singapore: {
            code: "SIN",
            name: "Singapore",
            airport: "Changi Airport",
            fullName: "Singapore",
          },
          Tokyo: {
            code: "NRT",
            name: "Tokyo",
            airport: "Narita International",
            fullName: "Tokyo, Japan",
          },
        }}
        selectedCity={selectedToCity}
        onSelectCity={setSelectedToCity}
      />

      <MobileDatePicker
        isOpen={showCalendar}
        onClose={() => setShowCalendar(false)}
        tripType={editTripType}
        setTripType={setEditTripType}
        selectedDepartureDate={departureDate ? new Date(departureDate) : null}
        selectedReturnDate={returnDate ? new Date(returnDate) : null}
        setSelectedDepartureDate={(date) =>
          setDepartureDate(date ? date.toISOString().split("T")[0] : null)
        }
        setSelectedReturnDate={(date) =>
          setReturnDate(date ? date.toISOString().split("T")[0] : null)
        }
        selectingDeparture={selectingDeparture}
        setSelectingDeparture={setSelectingDeparture}
      />

      <MobileTravelers
        isOpen={showTravelers}
        onClose={() => setShowTravelers(false)}
        travelers={travelers}
        setTravelers={setTravelers}
      />

      <MobileClassDropdown
        isOpen={showClassDropdown}
        onClose={() => setShowClassDropdown(false)}
        selectedClass={selectedClass}
        onSelectClass={setSelectedClass}
      />

      <MobileNavigation />

      {/* Phase 1 Bargain Modal */}
      <BargainModalPhase1 {...bargainHook.getBargainModalProps()} />
    </div>
  );
}
