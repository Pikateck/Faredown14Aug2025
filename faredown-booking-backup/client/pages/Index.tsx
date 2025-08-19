import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  MobileCityDropdown,
  MobileDatePicker,
  MobileTravelers,
} from "@/components/MobileDropdowns";
import {
  formatDateToDDMMMYYYY,
  formatDateToDisplayString,
} from "@/lib/dateUtils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { BookingCalendar } from "@/components/BookingCalendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Plane,
  Search,
  Shield,
  Clock,
  TrendingUp,
  Headphones,
  CheckCircle,
  MessageCircle,
  Settings,
  Smartphone,
  BarChart3,
  Bell,
  DollarSign,
  MapPin,
  Star,
  Users,
  Phone,
  ArrowRight,
  Play,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  User,
  BookOpen,
  Award,
  CreditCard,
  Heart,
  LogOut,
  Menu,
  Code,
} from "lucide-react";
import { downloadProjectInfo } from "@/lib/codeExport";

export default function Index() {
  const [departureDate, setDepartureDate] = useState<Date>();
  const [showSignIn, setShowSignIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [showMobileMenu, setShowMobileMenu] = useState(false);

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
  const [returnDate, setReturnDate] = useState<Date>();
  const [tripType, setTripType] = useState<
    "round-trip" | "one-way" | "multi-city"
  >("round-trip");
  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const [selectedClass, setSelectedClass] = useState("Economy");
  const [showFromCities, setShowFromCities] = useState(false);
  const [showToCities, setShowToCities] = useState(false);
  const [selectedFromCity, setSelectedFromCity] = useState("Mumbai");
  const [selectedToCity, setSelectedToCity] = useState("Dubai");
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTravelers, setShowTravelers] = useState(false);
  const [travelers, setTravelers] = useState({ adults: 1, children: 0 });

  // Live calendar states
  const today = new Date();
  const [selectedDepartureDate, setSelectedDepartureDate] =
    useState<Date | null>(null);
  const [selectedReturnDate, setSelectedReturnDate] = useState<Date | null>(
    null,
  );
  const [selectingDeparture, setSelectingDeparture] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);

  // Calendar helper functions
  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return date
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      .replace(/ /g, "-");
  };

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
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const handleDateClick = (day: number, month: number, year: number) => {
    const clickedDate = new Date(year, month, day);
    clickedDate.setHours(0, 0, 0, 0); // Normalize time

    if (tripType === "one-way") {
      setSelectedDepartureDate(clickedDate);
      setShowCalendar(false);
    } else {
      // For round-trip bookings (hotels)
      if (selectingDeparture || !selectedDepartureDate) {
        // Selecting check-in date - always start fresh
        setSelectedDepartureDate(clickedDate);
        setSelectedReturnDate(null); // Clear any existing return date
        setSelectingDeparture(false); // Now we'll select check-out date
      } else {
        // Selecting check-out date
        if (clickedDate <= selectedDepartureDate) {
          // If clicked date is before or same as check-in, start over with new check-in
          setSelectedDepartureDate(clickedDate);
          setSelectedReturnDate(null);
          setSelectingDeparture(false);
        } else {
          // Valid check-out date (after check-in)
          setSelectedReturnDate(clickedDate);
          setShowCalendar(false); // Close calendar after selecting both dates
        }
      }
    }
  };
  const [selectedCurrency, setSelectedCurrency] = useState({
    code: "INR",
    symbol: "₹",
    name: "Indian Rupee",
  });

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

  return (
    <div
      className="min-h-screen bg-white"
      style={{
        fontFamily:
          'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
      }}
    >
      {/* Header */}
      <header
        className="text-white sticky top-0 z-40"
        style={{ backgroundColor: "#003580" }}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-lg sm:text-xl font-bold tracking-tight">
                faredown.com
              </span>
            </Link>

            {/* Centered Navigation */}
            <nav className="hidden md:flex items-center space-x-6 lg:space-x-8 text-sm font-medium absolute left-1/2 transform -translate-x-1/2">
              <Link
                to="/flights"
                className="text-white hover:text-blue-200 cursor-pointer flex items-center font-semibold border-b-2 border-white py-3 lg:py-4"
              >
                <span>Flights</span>
              </Link>
              <Link
                to="/hotels"
                className="text-white hover:text-blue-200 cursor-pointer flex items-center py-3 lg:py-4"
              >
                <span>Hotels</span>
              </Link>
            </nav>

            <div className="flex items-center space-x-2 md:space-x-6">
              {/* Mobile menu button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden text-white p-2 touch-manipulation"
              >
                <Menu className="w-6 h-6" />
              </button>

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
                      <DropdownMenuItem
                        onClick={downloadProjectInfo}
                        className="border-t mt-1 pt-2"
                      >
                        <Code className="w-4 h-4 mr-2" />
                        Download Code Info
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

        {/* Mobile Menu Overlay */}
        {showMobileMenu && (
          <div className="md:hidden bg-blue-800 border-t border-blue-600 absolute w-full z-50">
            <div className="px-4 py-4 space-y-2">
              <Link
                to="/flights"
                className="flex items-center space-x-2 text-white py-3 px-2 rounded hover:bg-blue-700 border-b border-blue-600"
                onClick={() => setShowMobileMenu(false)}
              >
                <Plane className="w-4 h-4" />
                <span>Flights</span>
              </Link>
              <Link
                to="/hotels"
                className="flex items-center space-x-2 text-white py-3 px-2 rounded hover:bg-blue-700 border-b border-blue-600"
                onClick={() => setShowMobileMenu(false)}
              >
                <Hotel className="w-4 h-4" />
                <span>Hotels</span>
              </Link>
              {isLoggedIn && (
                <Link
                  to="/my-account"
                  className="flex items-center space-x-2 text-white py-3 px-2 rounded hover:bg-blue-700"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <User className="w-4 h-4" />
                  <span>My Account</span>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Hero Search Section */}
        <div
          className="py-3 sm:py-6 md:py-8 pb-24 sm:pb-8"
          style={{ backgroundColor: "#003580" }}
        >
          <div className="max-w-7xl mx-auto px-3 sm:px-4">
            <div className="text-center mb-4 sm:mb-6">
              <div className="mb-3 sm:mb-5">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
                  Upgrade. Bargain. Book.
                </h2>
              </div>
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-white mb-3 sm:mb-4 leading-tight px-2 opacity-95">
                Faredown is the world's first travel portal where you control
                the price — for flights and hotels.
              </h1>
              <p className="text-white text-sm sm:text-base md:text-lg opacity-80 mb-3 sm:mb-4 px-4">
                Don't Just Book It. <strong>Bargain It™.</strong>
              </p>
              <p className="text-white text-xs sm:text-sm opacity-70">
                Join 50M+ travelers who bargain for more.
              </p>
            </div>

            {/* Search Form - Hidden on mobile, shown in sticky bottom */}
            <div className="hidden sm:block bg-white border-b border-gray-200 overflow-visible rounded-t-lg">
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
                          onClick={() =>
                            setShowClassDropdown(!showClassDropdown)
                          }
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
                <div className="flex flex-col lg:flex-row items-center gap-2 lg:gap-2 mt-2 w-full max-w-5xl overflow-visible">
                  <div className="relative flex-1 lg:max-w-xs w-full lg:w-auto">
                    <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-600 font-medium z-10">
                      Leaving from
                    </label>
                    <button
                      onClick={() => setShowFromCities(!showFromCities)}
                      className="flex items-center bg-white rounded border-2 border-blue-500 px-3 py-2 h-12 w-full hover:border-blue-600 touch-manipulation"
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

                  <div className="relative flex-1 lg:max-w-xs w-full lg:w-auto">
                    <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-600 font-medium z-10">
                      Going to
                    </label>
                    <button
                      onClick={() => setShowToCities(!showToCities)}
                      className="flex items-center bg-white rounded border border-gray-300 px-3 py-2 h-12 w-full hover:border-blue-500 touch-manipulation"
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

                  <div className="relative overflow-visible lg:max-w-[200px] w-full lg:w-auto">
                    <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-600 font-medium z-10">
                      Travel dates
                    </label>
                    <button
                      onClick={() => {
                        if (!showCalendar) {
                          // Reset selection state when opening calendar
                          setSelectingDeparture(true);
                          // Ensure we start with a clean state
                          setCurrentMonth(new Date().getMonth());
                          setCurrentYear(new Date().getFullYear());
                        }
                        setShowCalendar(!showCalendar);
                      }}
                      className="flex items-center bg-white rounded border border-gray-300 px-3 py-2 h-12 w-full min-w-[180px] hover:border-blue-500 touch-manipulation"
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
                          ? formatDate(selectedDepartureDate) || "Select date"
                          : selectedDepartureDate
                            ? `${formatDate(selectedDepartureDate)} ${selectedReturnDate ? `- ${formatDate(selectedReturnDate)}` : "- Return"}`
                            : "Select dates"}
                      </span>
                    </button>

                    {showCalendar && (
                      <div className="absolute top-14 left-0 right-0 sm:left-1/2 sm:right-auto sm:transform sm:-translate-x-1/2 bg-white border border-gray-300 rounded-lg shadow-2xl z-[9999] w-full sm:w-[700px] max-w-[700px] overflow-hidden">
                        <div className="flex justify-between items-center p-4 bg-white border-b border-gray-200">
                          <button
                            onClick={() => navigateMonth("prev")}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                          >
                            <ChevronLeft className="w-4 h-4 text-gray-600" />
                          </button>
                          <div className="flex space-x-16">
                            <div className="text-center">
                              <div className="font-medium text-gray-900">
                                {getMonthName(currentMonth)} {currentYear}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium text-gray-900">
                                {getMonthName(
                                  currentMonth === 11 ? 0 : currentMonth + 1,
                                )}{" "}
                                {currentMonth === 11
                                  ? currentYear + 1
                                  : currentYear}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => navigateMonth("next")}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                          >
                            <ChevronRight className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 divide-x divide-gray-200">
                          {/* Current Month Calendar */}
                          <div className="p-4">
                            <div className="grid grid-cols-7 gap-1 mb-3">
                              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(
                                (day) => (
                                  <div
                                    key={day}
                                    className="text-center py-2 text-xs font-medium text-gray-500"
                                  >
                                    {day}
                                  </div>
                                ),
                              )}
                            </div>
                            <div className="grid grid-cols-7 gap-1">
                              {Array.from({ length: 42 }, (_, i) => {
                                const firstDay = getFirstDayOfMonth(
                                  currentMonth,
                                  currentYear,
                                );
                                const daysInMonth = getDaysInMonth(
                                  currentMonth,
                                  currentYear,
                                );
                                const day = i - firstDay + 1;
                                const isValidDay =
                                  day >= 1 && day <= daysInMonth;
                                const currentDate = isValidDay
                                  ? new Date(currentYear, currentMonth, day)
                                  : null;
                                const isPastDate =
                                  currentDate &&
                                  currentDate < today &&
                                  !isDateEqual(currentDate, today);

                                if (!isValidDay) {
                                  return <div key={i} className="h-10"></div>;
                                }

                                const isDeparture = isDateEqual(
                                  currentDate,
                                  selectedDepartureDate,
                                );
                                const isReturn = isDateEqual(
                                  currentDate,
                                  selectedReturnDate,
                                );
                                const isInRange =
                                  selectedDepartureDate &&
                                  selectedReturnDate &&
                                  currentDate &&
                                  isDateInRange(
                                    currentDate,
                                    selectedDepartureDate,
                                    selectedReturnDate,
                                  ) &&
                                  !isDeparture &&
                                  !isReturn;
                                const isToday = isDateEqual(currentDate, today);

                                return (
                                  <button
                                    key={i}
                                    disabled={isPastDate}
                                    onClick={() =>
                                      handleDateClick(
                                        day,
                                        currentMonth,
                                        currentYear,
                                      )
                                    }
                                    className={cn(
                                      "h-10 w-10 text-sm font-medium flex items-center justify-center hover:bg-gray-100 transition-colors rounded relative",
                                      isPastDate &&
                                        "text-gray-300 cursor-not-allowed hover:bg-transparent",
                                      isToday &&
                                        !isDeparture &&
                                        !isReturn &&
                                        "bg-gray-100 font-semibold",
                                      isDeparture &&
                                        "bg-gray-900 text-white hover:bg-gray-800",
                                      isReturn &&
                                        "bg-gray-900 text-white hover:bg-gray-800",
                                      isInRange && "bg-gray-100 text-gray-700",
                                      !isPastDate &&
                                        !isDeparture &&
                                        !isReturn &&
                                        !isInRange &&
                                        !isToday &&
                                        "text-gray-900",
                                    )}
                                  >
                                    {day}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Next Month Calendar */}
                          <div className="p-4">
                            <div className="grid grid-cols-7 gap-1 mb-3">
                              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(
                                (day) => (
                                  <div
                                    key={day}
                                    className="text-center py-2 text-xs font-medium text-gray-500"
                                  >
                                    {day}
                                  </div>
                                ),
                              )}
                            </div>
                            <div className="grid grid-cols-7 gap-1">
                              {Array.from({ length: 42 }, (_, i) => {
                                const nextMonth =
                                  currentMonth === 11 ? 0 : currentMonth + 1;
                                const nextYear =
                                  currentMonth === 11
                                    ? currentYear + 1
                                    : currentYear;
                                const firstDay = getFirstDayOfMonth(
                                  nextMonth,
                                  nextYear,
                                );
                                const daysInMonth = getDaysInMonth(
                                  nextMonth,
                                  nextYear,
                                );
                                const day = i - firstDay + 1;
                                const isValidDay =
                                  day >= 1 && day <= daysInMonth;
                                const currentDate = isValidDay
                                  ? new Date(nextYear, nextMonth, day)
                                  : null;
                                const isPastDate =
                                  currentDate &&
                                  currentDate < today &&
                                  !isDateEqual(currentDate, today);

                                if (!isValidDay) {
                                  return <div key={i} className="h-10"></div>;
                                }

                                const isDeparture = isDateEqual(
                                  currentDate,
                                  selectedDepartureDate,
                                );
                                const isReturn = isDateEqual(
                                  currentDate,
                                  selectedReturnDate,
                                );
                                const isInRange =
                                  selectedDepartureDate &&
                                  selectedReturnDate &&
                                  currentDate &&
                                  isDateInRange(
                                    currentDate,
                                    selectedDepartureDate,
                                    selectedReturnDate,
                                  ) &&
                                  !isDeparture &&
                                  !isReturn;
                                const isToday = isDateEqual(currentDate, today);

                                return (
                                  <button
                                    key={i}
                                    disabled={isPastDate}
                                    onClick={() =>
                                      handleDateClick(day, nextMonth, nextYear)
                                    }
                                    className={cn(
                                      "h-10 w-10 text-sm font-medium flex items-center justify-center hover:bg-gray-100 transition-colors rounded relative",
                                      isPastDate &&
                                        "text-gray-300 cursor-not-allowed hover:bg-transparent",
                                      isToday &&
                                        !isDeparture &&
                                        !isReturn &&
                                        "bg-gray-100 font-semibold",
                                      isDeparture &&
                                        "bg-gray-900 text-white hover:bg-gray-800",
                                      isReturn &&
                                        "bg-gray-900 text-white hover:bg-gray-800",
                                      isInRange && "bg-gray-100 text-gray-700",
                                      !isPastDate &&
                                        !isDeparture &&
                                        !isReturn &&
                                        !isInRange &&
                                        !isToday &&
                                        "text-gray-900",
                                    )}
                                  >
                                    {day}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Calendar Instructions */}
                        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                          <div className="flex items-center justify-between text-xs text-gray-600">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-1">
                                <div className="w-3 h-3 bg-gray-900 rounded"></div>
                                <span>Selected</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <div className="w-3 h-3 bg-gray-100 rounded"></div>
                                <span>Range</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <div className="w-3 h-3 bg-gray-100 border border-gray-400 rounded"></div>
                                <span>Today</span>
                              </div>
                              {(selectedDepartureDate ||
                                selectedReturnDate) && (
                                <button
                                  onClick={() => {
                                    setSelectedDepartureDate(null);
                                    setSelectedReturnDate(null);
                                    setSelectingDeparture(true);
                                  }}
                                  className="text-blue-600 hover:text-blue-800 font-medium text-xs"
                                >
                                  Clear dates
                                </button>
                              )}
                            </div>
                            {tripType === "round-trip" && (
                              <span>
                                {selectingDeparture
                                  ? "Select check-in date"
                                  : "Select check-out date"}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="relative lg:max-w-[150px] w-full lg:w-auto">
                    <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-600 font-medium z-10">
                      Travelers
                    </label>
                    <button
                      onClick={() => setShowTravelers(!showTravelers)}
                      className="flex items-center bg-white rounded border border-gray-300 px-3 py-2 h-12 w-full min-w-[120px] hover:border-blue-500 touch-manipulation"
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
                      <div className="absolute top-14 left-0 right-0 sm:right-0 sm:left-auto bg-white border border-gray-300 rounded-md shadow-xl p-4 z-50 w-full sm:w-72">
                        <div className="space-y-6">
                          <div className="flex items-center justify-between py-2">
                            <div>
                              <div className="font-medium text-gray-900">
                                Adults
                              </div>
                              <div className="text-sm text-gray-500">
                                Age 18+
                              </div>
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
                              <div className="text-sm text-gray-500">
                                Age 0-17
                              </div>
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
                    <Link
                      to={`/flights?adults=${travelers.adults}&children=${travelers.children}`}
                      className="w-full"
                    >
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded h-12 font-medium text-sm w-full touch-manipulation">
                        Search
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sticky Bottom Search Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="px-4 py-3">
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              onClick={() => setShowFromCities(!showFromCities)}
              className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-4 border touch-manipulation"
            >
              <div className="flex items-center space-x-2">
                <Plane className="w-4 h-4 text-gray-500" />
                <div className="text-left">
                  <div className="text-xs text-gray-500">From</div>
                  <div className="text-sm font-medium text-gray-900">
                    {cityData[selectedFromCity]?.code}
                  </div>
                </div>
              </div>
            </button>
            <button
              onClick={() => setShowToCities(!showToCities)}
              className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-4 border touch-manipulation"
            >
              <div className="flex items-center space-x-2">
                <Plane className="w-4 h-4 text-gray-500" />
                <div className="text-left">
                  <div className="text-xs text-gray-500">To</div>
                  <div className="text-sm font-medium text-gray-900">
                    {cityData[selectedToCity]?.code}
                  </div>
                </div>
              </div>
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              onClick={() => {
                if (!showCalendar) {
                  // Reset selection state when opening calendar
                  setSelectingDeparture(true);
                  // Ensure we start with a clean state
                  setCurrentMonth(new Date().getMonth());
                  setCurrentYear(new Date().getFullYear());
                }
                setShowCalendar(!showCalendar);
              }}
              className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-4 border touch-manipulation"
            >
              <div className="flex items-center space-x-2">
                <CalendarIcon className="w-4 h-4 text-gray-500" />
                <div className="text-left">
                  <div className="text-xs text-gray-500">Dates</div>
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {tripType === "one-way"
                      ? selectedDepartureDate
                        ? formatDate(selectedDepartureDate).split("-")[0]
                        : "Select"
                      : selectedDepartureDate
                        ? `${formatDate(selectedDepartureDate).split("-")[0]} ${selectedReturnDate ? `- ${formatDate(selectedReturnDate).split("-")[0]}` : "- Return"}`
                        : "Select dates"}
                  </div>
                </div>
              </div>
            </button>
            <button
              onClick={() => setShowTravelers(!showTravelers)}
              className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-4 border touch-manipulation"
            >
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-gray-500" />
                <div className="text-left">
                  <div className="text-xs text-gray-500">Travelers</div>
                  <div className="text-sm font-medium text-gray-900">
                    {travelers.adults + travelers.children}
                  </div>
                </div>
              </div>
            </button>
          </div>
          <Link
            to={`/flights?adults=${travelers.adults}&children=${travelers.children}`}
            className="w-full"
          >
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg font-semibold text-base touch-manipulation">
              Search Flights
            </Button>
          </Link>
        </div>
      </div>

      {/* Why Choose Faredown Section */}
      <section className="py-16 bg-white">
        <div className="max-w-[1280px] mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Faredown Is Reinventing Travel Booking
            </h2>
            <p className="text-gray-600 text-lg">
              The future of booking isn't fixed pricing — it's{" "}
              <strong>live bargaining.</strong>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#003580] rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Live Bargain Technology
              </h3>
              <p className="text-gray-600 text-sm">
                Negotiate upgrades instantly — from economy to business, from
                standard to suite.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#003580] rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Pay What You Feel Is Fair
              </h3>
              <p className="text-gray-600 text-sm">
                Set your price and let Faredown try to get it for you — no more
                overpaying.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#003580] rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Secure, Real-Time Bookings
              </h3>
              <p className="text-gray-600 text-sm">
                Your data is encrypted and bookings are confirmed instantly.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#003580] rounded-lg flex items-center justify-center mx-auto mb-4">
                <Headphones className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Smarter Than Any Travel Agent
              </h3>
              <p className="text-gray-600 text-sm">
                Skip the back and forth. Our AI works faster, 24/7.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Travelers Love Faredown */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-[1280px] mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-[#003580] mb-8">
                Why travelers
                <br />
                love Faredown
              </h2>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-[#003580] rounded-full flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">
                      Best Price Guarantee
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Find a better price elsewhere? We'll match it and give you
                      an extra 5% off your next booking.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-[#003580] rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">
                      Instant Confirmation
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Get instant booking confirmations and e-tickets delivered
                      to your inbox immediately.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-[#003580] rounded-full flex items-center justify-center flex-shrink-0">
                    <Settings className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">
                      Flexible Booking Options
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Change or cancel your bookings easily with our flexible
                      policies and get refunds quickly.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-[#003580] text-white p-8 rounded-lg">
                <div className="absolute top-4 right-4">
                  <div className="bg-white text-[#003580] px-3 py-1 rounded-full text-sm font-semibold">
                    4.8★
                  </div>
                </div>
                <div className="text-right mb-4 text-sm">24M+ reviews</div>
                <div className="aspect-video bg-gray-200 rounded-lg mb-4 relative overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=250&fit=crop"
                    alt="Customer support team"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Award-winning Customer Support */}
      <section className="py-16 bg-[#003580]">
        <div className="max-w-[1280px] mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="aspect-video bg-gray-200 rounded-lg relative overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=500&h=300&fit=crop"
                alt="Customer support representative"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-20"></div>
              <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-full text-sm font-semibold">
                Online 24/7
              </div>
            </div>

            <div className="text-white">
              <h2 className="text-3xl font-bold mb-4">
                Award-winning
                <br />
                Customer Support
              </h2>
              <p className="text-lg mb-8 opacity-90">
                Our travel experts are available 24/7 to help you with bookings,
                changes, and any travel-related questions. Experience support
                that truly cares.
              </p>

              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <div className="text-3xl font-bold mb-2">&lt; 2min</div>
                  <div className="text-sm opacity-75">
                    Average response time
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2">98%</div>
                  <div className="text-sm opacity-75">
                    Customer satisfaction
                  </div>
                </div>
              </div>

              <Button className="bg-white text-[#003580] hover:bg-gray-100">
                Chat with us
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Travel Protection */}
      <section className="py-16 bg-white">
        <div className="max-w-[1280px] mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="bg-[#003580] text-white px-4 py-2 rounded-full text-sm font-semibold inline-block mb-6">
                TRAVEL PROTECTION
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Comprehensive Travel
                <br />
                Insurance
              </h2>

              <p className="text-gray-600 text-lg mb-6">
                Starting from just $5.00
              </p>

              <p className="text-gray-600 mb-8">
                Protect your journey with our comprehensive travel insurance.
                Coverage includes baggage protection, flight delays, medical
                emergencies, and trip cancellations. If your luggage is lost for
                over 48 hours, we guarantee $300 compensation per person on
                every trip.
              </p>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm">Baggage Protection</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm">Flight Delay Coverage</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm">Trip Protection</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm">Money Back Guarantee</span>
                </div>
              </div>

              <div className="mt-8 bg-[#003580] text-white p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm opacity-75">
                      Protected travelers
                    </div>
                    <div className="text-2xl font-bold">5M+</div>
                  </div>
                  <ArrowRight className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-blue-100 to-orange-100 rounded-lg relative overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=500&h=500&fit=crop"
                  alt="Airplane wing view"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-blue-900 bg-opacity-20"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile App Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-[1280px] mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg relative overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=500&h=500&fit=crop"
                  alt="Mobile app interface"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-full text-sm font-semibold">
                  4.5M Updates
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Travel smarter with our
                <br />
                mobile app
              </h2>

              <p className="text-gray-600 text-lg mb-8">
                Get real-time flight updates, mobile check-in, digital boarding
                passes, and exclusive mobile-only deals. Your entire journey at
                your fingertips.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[#003580] rounded-full flex items-center justify-center">
                    <Bell className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-700">
                    Real-time flight notifications
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[#003580] rounded-full flex items-center justify-center">
                    <Smartphone className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-700">
                    Mobile check-in & boarding passes
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[#003580] rounded-full flex items-center justify-center">
                    <Star className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-700">Exclusive mobile deals</span>
                </div>
              </div>

              <div className="flex space-x-4">
                <img
                  src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                  alt="Download on App Store"
                  className="h-12"
                />
                <img
                  src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
                  alt="Get it on Google Play"
                  className="h-12"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhance Your Travel Experience */}
      <section className="py-16 bg-white">
        <div className="max-w-[1280px] mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Enhance your travel experience
            </h2>
            <p className="text-gray-600 text-lg">
              Add premium services to make your journey even more comfortable
              and worry-free
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <div className="w-16 h-16 bg-[#003580] rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Travel Insurance</h3>
              <p className="text-gray-600 text-sm">
                Comprehensive coverage for medical emergencies, trip
                cancellations and lost baggage
              </p>
            </div>

            <div className="text-center p-8 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
              <div className="w-16 h-16 bg-[#003580] rounded-lg flex items-center justify-center mx-auto mb-4">
                <Plane className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Airport Lounges</h3>
              <p className="text-gray-600 text-sm">
                Access premium lounges with complimentary food, drinks and
                comfortable seating
              </p>
            </div>

            <div className="text-center p-8 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
              <div className="w-16 h-16 bg-[#003580] rounded-lg flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Tours & Activities</h3>
              <p className="text-gray-600 text-sm">
                Discover amazing experiences and book guided tours at your
                destination
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg">
              <div className="w-16 h-16 bg-[#003580] rounded-lg flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Smart Notifications
              </h3>
              <p className="text-gray-600 text-sm">
                Get real-time updates about gate changes, delays, and boarding
                announcements
              </p>
            </div>

            <div className="text-center p-8 bg-gradient-to-br from-red-50 to-red-100 rounded-lg">
              <div className="w-16 h-16 bg-[#003580] rounded-lg flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Price Alerts</h3>
              <p className="text-gray-600 text-sm">
                Monitor flight prices and get notified when fares drop for your
                route
              </p>
            </div>

            <div className="text-center p-8 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg">
              <div className="w-16 h-16 bg-[#003580] rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Seat Selection</h3>
              <p className="text-gray-600 text-sm">
                Choose your preferred seats in advance for maximum comfort
                during your flight
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-[1280px] mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Where Will You Bargain First?
            </h2>
            <p className="text-gray-600 text-lg">
              Discover popular destinations where upgrades are just a bargain
              away.
            </p>
            <p className="text-gray-600 text-lg">
              Discover amazing places and book flights to your dream
              destinations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400&h=300&fit=crop"
                alt="Paris"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-xl font-bold mb-1">Paris</h3>
                <p className="text-sm opacity-90">From $320</p>
              </div>
            </div>

            <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop"
                alt="Sydney"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-xl font-bold mb-1">Sydney</h3>
                <p className="text-sm opacity-90">From $750</p>
              </div>
            </div>

            <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop"
                alt="Tokyo"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-xl font-bold mb-1">Tokyo</h3>
                <p className="text-sm opacity-90">From $590</p>
              </div>
            </div>

            <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=300&fit=crop"
                alt="London"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-xl font-bold mb-1">London</h3>
                <p className="text-sm opacity-90">From $280</p>
              </div>
            </div>

            <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=300&fit=crop"
                alt="New York"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-xl font-bold mb-1">New York</h3>
                <p className="text-sm opacity-90">From $180</p>
              </div>
            </div>

            <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=300&fit=crop"
                alt="Dubai"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-xl font-bold mb-1">Dubai</h3>
                <p className="text-sm opacity-90">From $450</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted by Millions */}
      <section className="py-16 bg-[#003580]">
        <div className="max-w-[1280px] mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Trusted by Millions Worldwide
            </h2>
            <p className="text-white text-lg opacity-90">
              Partnered with over 600 airlines and hotel chains to bring you{" "}
              <strong>live dynamic pricing</strong> across the globe.
            </p>
          </div>

          {/* Airline Partners */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-lg font-bold text-[#003580]">IndiGo</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-lg font-bold text-red-600">Emirates</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-lg font-bold text-blue-600">Lufthansa</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-lg font-bold text-yellow-600">ETIHAD</div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-lg font-bold text-red-600">AkasaAir</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-lg font-bold text-orange-600">SpiceJet</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-lg font-bold text-blue-600">Air India</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-lg font-bold text-purple-600">
                Qatar Airways
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-white">
            <div>
              <div className="text-4xl font-bold mb-2">600+</div>
              <div className="text-lg opacity-75">Airlines partnered</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50M+</div>
              <div className="text-lg opacity-75">Travelers served</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">4.8★</div>
              <div className="text-lg opacity-75">Customer rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Developer Section */}
      <section className="bg-gray-100 py-8 border-t">
        <div className="max-w-[1280px] mx-auto px-4 text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Developer Resources
          </h3>
          <p className="text-gray-600 mb-4">
            Download project information and technical documentation
          </p>
          <Button
            onClick={downloadProjectInfo}
            variant="outline"
            className="bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
          >
            <Code className="w-4 h-4 mr-2" />
            Download Project Info
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-[1280px] mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="relative">
                  <svg width="32" height="24" viewBox="0 0 32 24" fill="none">
                    <rect
                      x="0"
                      y="2"
                      width="20"
                      height="16"
                      rx="3"
                      fill="url(#blueGradient)"
                    />
                    <path
                      d="M10 8l5 2.5-1.5 0.8-3-1.5-2.5 2.5v1.5l-0.8-0.8v-1.5l2.5-2.5-3-1.5 1.5-0.8 5 2.5z"
                      fill="white"
                    />
                    <path
                      d="M16 11l3 1.5-0.8 0.8-2.5-1.2v1.2l-0.8-0.8z"
                      fill="url(#orangeGradient)"
                    />
                  </svg>
                </div>
                <span className="text-xl font-bold">FAREDOWN</span>
              </div>
              <p className="text-gray-400 text-sm mb-2">
                <strong>
                  Faredown – The World's First Online Travel Bargain Portal™
                </strong>
              </p>
              <p className="text-gray-300 text-sm italic">
                Don't Just Book It. Bargain It.™
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Travel</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Flights</li>
                <li>Hotels</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Help center</li>
                <li>Contact us</li>
                <li>Cancellation policy</li>
                <li>Refunds</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>About us</li>
                <li>Careers</li>
                <li>Press</li>
                <li>Investors</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                © 2024 Faredown. All rights reserved.
              </p>
              <div className="flex space-x-6 text-sm text-gray-400 mt-4 md:mt-0">
                <span>Privacy Policy</span>
                <span>Terms of Service</span>
                <span>Cookie Policy</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Dropdown Components */}
      <MobileCityDropdown
        isOpen={showFromCities}
        onClose={() => setShowFromCities(false)}
        title="Leaving from"
        cities={cityData}
        selectedCity={selectedFromCity}
        onSelectCity={setSelectedFromCity}
      />

      <MobileCityDropdown
        isOpen={showToCities}
        onClose={() => setShowToCities(false)}
        title="Going to"
        cities={cityData}
        selectedCity={selectedToCity}
        onSelectCity={setSelectedToCity}
      />

      <MobileDatePicker
        isOpen={showCalendar}
        onClose={() => setShowCalendar(false)}
        tripType={tripType}
        setTripType={setTripType}
        selectedDepartureDate={selectedDepartureDate}
        selectedReturnDate={selectedReturnDate}
        setSelectedDepartureDate={setSelectedDepartureDate}
        setSelectedReturnDate={setSelectedReturnDate}
        selectingDeparture={selectingDeparture}
        setSelectingDeparture={setSelectingDeparture}
      />

      <MobileTravelers
        isOpen={showTravelers}
        onClose={() => setShowTravelers(false)}
        travelers={travelers}
        setTravelers={setTravelers}
      />

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
