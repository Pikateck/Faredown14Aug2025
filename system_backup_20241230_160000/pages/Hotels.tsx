import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDateContext } from "@/contexts/DateContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SimpleCalendar } from "@/components/SimpleCalendar";
import { MobileNavigation } from "@/components/mobile/MobileNavigation";
import { addDays } from "date-fns";
import {
  Plane,
  ChevronDown,
  ArrowRightLeft,
  MapPin,
  Calendar as CalendarIcon,
  Users,
  Settings,
  User,
  Hotel,
  Heart,
  TrendingUp,
  DollarSign,
  Shield,
  Headphones,
  ArrowRight,
  Search,
  X,
  Globe,
  Zap,
  Bell,
  Menu,
  LogOut,
  Code,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  BookOpen,
  Camera,
  Car,
} from "lucide-react";
import {
  MobileCityDropdown,
  MobileDatePicker,
  MobileTravelers,
} from "@/components/MobileDropdowns";
import { BookingSearchForm } from "@/components/BookingSearchForm";

export default function Hotels() {
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useAuth();
  const {
    departureDate,
    returnDate,
    setDepartureDate,
    setReturnDate,
    tripType,
    setTripType,
    formatDisplayDate,
  } = useDateContext();

  const { selectedCurrency, currencies, setCurrency } = useCurrency();

  // State for hotel search functionality
  const [activeTab, setActiveTab] = useState("hotels");
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [showFromCities, setShowFromCities] = useState(false);
  const [showToCities, setShowToCities] = useState(false);
  const [selectedFromCity, setSelectedFromCity] = useState("Mumbai");
  const [selectedToCity, setSelectedToCity] = useState("Dubai");
  const [showMobileCalendar, setShowMobileCalendar] = useState(false);
  const [showDesktopCalendar, setShowDesktopCalendar] = useState(false);
  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const [selectedClass, setSelectedClass] = useState("Economy");
  const [showTravelers, setShowTravelers] = useState(false);
  const [travelers, setTravelers] = useState({
    adults: 1,
    children: 0,
    childAges: [] as number[],
  });

  // Mobile dropdown states
  const [showMobileDestination, setShowMobileDestination] = useState(false);
  const [showMobileDates, setShowMobileDates] = useState(false);
  const [showMobileGuests, setShowMobileGuests] = useState(false);
  const [selectedDepartureDate, setSelectedDepartureDate] =
    useState<Date | null>(null);
  const [selectedReturnDate, setSelectedReturnDate] = useState<Date | null>(
    null,
  );
  const [selectingDeparture, setSelectingDeparture] = useState(true);

  // Mobile menu states to match flights page
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  // User state
  const userName = user?.name || "Zubin Aibara";

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Handle sign out
  const handleSignOut = () => {
    logout();
  };

  // City data for hotels
  const cityData = {
    Mumbai: {
      code: "BOM",
      name: "Mumbai",
      airport: "Mumbai, Maharashtra, India",
      fullName: "Mumbai, Maharashtra, India",
    },
    Delhi: {
      code: "DEL",
      name: "Delhi",
      airport: "New Delhi, Delhi, India",
      fullName: "New Delhi, Delhi, India",
    },
    Dubai: {
      code: "DXB",
      name: "Dubai",
      airport: "Dubai, United Arab Emirates",
      fullName: "Dubai, United Arab Emirates",
    },
    "Abu Dhabi": {
      code: "AUH",
      name: "Abu Dhabi",
      airport: "Abu Dhabi, United Arab Emirates",
      fullName: "Abu Dhabi, United Arab Emirates",
    },
    Singapore: {
      code: "SIN",
      name: "Singapore",
      airport: "Singapore, Singapore",
      fullName: "Singapore, Singapore",
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      {/* MOBILE-FIRST DESIGN: App-style layout for mobile, standard for desktop */}

      {/* Mobile Layout (≤768px) - Match Index.tsx exactly */}
      <div className="md:hidden">
        {/* Mobile Header */}
        <header className="bg-[#003580] text-white">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-[#febb02] rounded-lg flex items-center justify-center">
                  <Plane className="w-4 h-4 text-[#003580]" />
                </div>
                <span className="text-lg font-bold">faredown.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  className="p-2 relative hover:bg-white/10 active:bg-white/20 rounded-lg transition-colors touch-manipulation"
                  onClick={() => {
                    setShowLanguageMenu(!showLanguageMenu);
                    setShowNotifications(false);
                    setShowMobileMenu(false);
                  }}
                >
                  <Globe className="w-5 h-5" />
                </button>
                <button
                  className="p-2 relative hover:bg-white/10 active:bg-white/20 rounded-lg transition-colors touch-manipulation"
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowLanguageMenu(false);
                    setShowMobileMenu(false);
                  }}
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-lg"></span>
                </button>
                <button
                  onClick={() => {
                    setShowMobileMenu(!showMobileMenu);
                    setShowNotifications(false);
                    setShowLanguageMenu(false);
                  }}
                  className="p-2 hover:bg-white/10 active:bg-white/20 rounded-lg transition-colors touch-manipulation"
                >
                  <Menu className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Menu Overlay */}
        {showMobileMenu && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setShowMobileMenu(false)}
            />

            {/* Menu Panel */}
            <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-xl">
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
                  <span className="text-lg font-bold text-gray-900">Menu</span>
                  <button
                    onClick={() => setShowMobileMenu(false)}
                    className="p-2 text-gray-900 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Menu Items */}
                <div className="flex-1 py-4">
                  <nav className="space-y-1 px-4">
                    <Link
                      to="/"
                      className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <Plane className="w-5 h-5 text-[#003580]" />
                      <span className="font-medium">Flights</span>
                    </Link>

                    <Link
                      to="/hotels"
                      className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <Hotel className="w-5 h-5 text-[#003580]" />
                      <span className="font-medium">Hotels</span>
                    </Link>

                    <Link
                      to="/sightseeing"
                      className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <Camera className="w-5 h-5 text-[#003580]" />
                      <span className="font-medium">Sightseeing</span>
                    </Link>

                    <Link
                      to="/?tab=transfers"
                      className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <Car className="w-5 h-5 text-[#003580]" />
                      <span className="font-medium">Transfers</span>
                    </Link>

                    <Link
                      to="/bookings"
                      className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <BookOpen className="w-5 h-5 text-[#003580]" />
                      <span className="font-medium">My Bookings</span>
                    </Link>

                    {/* Currency Selection Tab */}
                    <div className="border-t border-gray-200 my-4"></div>
                    <div className="px-4 py-2">
                      <div className="text-xs font-semibold text-gray-700 px-0 py-1 mb-2 flex items-center">
                        <DollarSign className="w-4 h-4 mr-2 text-[#003580]" />
                        Currency
                      </div>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {currencies.map((currency) => (
                          <button
                            key={currency.code}
                            onClick={() => {
                              setCurrency(currency);
                            }}
                            className={`w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg text-sm flex items-center justify-between transition-colors ${
                              selectedCurrency.code === currency.code
                                ? "bg-blue-50 text-blue-600 border border-blue-200"
                                : "text-gray-700"
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <span className="text-base">{currency.flag}</span>
                              <span className="font-medium">
                                {currency.name}
                              </span>
                            </div>
                            <span className="font-semibold text-xs">
                              {currency.symbol} {currency.code}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-gray-200 my-4"></div>

                    <button
                      className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg w-full"
                      onClick={() => {
                        setShowMobileMenu(false);
                      }}
                    >
                      <Heart className="w-5 h-5 text-[#003580]" />
                      <span className="font-medium">Saved</span>
                    </button>

                    <button
                      className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg w-full"
                      onClick={() => {
                        setShowMobileMenu(false);
                      }}
                    >
                      <Headphones className="w-5 h-5 text-[#003580]" />
                      <span className="font-medium">Help & Support</span>
                    </button>

                    <button
                      className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg w-full"
                      onClick={() => {
                        setShowMobileMenu(false);
                      }}
                    >
                      <Settings className="w-5 h-5 text-[#003580]" />
                      <span className="font-medium">Settings</span>
                    </button>
                  </nav>

                  {/* User Section */}
                  {isLoggedIn ? (
                    <div className="mt-8 px-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 bg-[#003580] rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {userName.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {userName}
                            </div>
                            <div className="text-sm text-gray-600">
                              Loyalty Level 1
                            </div>
                          </div>
                        </div>
                        <button
                          className="flex items-center space-x-2 text-red-600 hover:text-red-700 w-full"
                          onClick={() => {
                            handleSignOut();
                            setShowMobileMenu(false);
                          }}
                        >
                          <LogOut className="w-4 h-4" />
                          <span className="text-sm font-medium">Sign Out</span>
                        </button>

                        {/* Admin Panel Access */}
                        <div className="border-t border-gray-200 pt-4 mt-4">
                          <button
                            className="flex items-center space-x-2 text-[#003580] hover:text-[#0071c2] w-full"
                            onClick={() => {
                              // Navigate to admin panel
                              window.open("/admin/login", "_blank");
                              setShowMobileMenu(false);
                            }}
                          >
                            <Shield className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              Admin Panel
                            </span>
                          </button>
                          <button
                            className="flex items-center space-x-2 text-[#003580] hover:text-[#0071c2] w-full"
                            onClick={() => {
                              // Navigate to live API
                              window.open("/admin/api", "_blank");
                              setShowMobileMenu(false);
                            }}
                          >
                            <Code className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              Live API
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-8 px-4 space-y-3">
                      <Button
                        className="w-full bg-[#003580] hover:bg-[#0071c2] text-white"
                        onClick={() => {
                          setShowSignIn(true);
                          setShowMobileMenu(false);
                        }}
                      >
                        Sign In
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full border-[#003580] text-[#003580] hover:bg-blue-50"
                        onClick={() => {
                          setShowRegister(true);
                          setShowMobileMenu(false);
                        }}
                      >
                        Register
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Search Section */}
        <div className="pb-8 pt-4 bg-white">
          <div className="px-4">
            {/* Upgrade Message */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold mb-2 text-gray-900">
                Upgrade. Bargain. Book.
              </h1>
              <p className="text-gray-600 text-sm mb-3">
                Control your price for flights & hotels — with live AI
                bargaining.
              </p>
            </div>

            {/* Hotel Search Form with Hotelbeds Test Destinations */}
            <div className="mx-auto">
              <BookingSearchForm />
            </div>
          </div>
        </div>

        {/* Why Faredown Section */}
        <div className="bg-gray-50 py-8">
          <div className="px-4">
            <h2 className="text-xl font-bold text-center mb-6 text-gray-900">
              Why Faredown?
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                <div className="w-12 h-12 bg-[#003580] rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-sm mb-1">Live Bargaining</h3>
                <p className="text-xs text-gray-600">
                  Negotiate real-time prices
                </p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                <div className="w-12 h-12 bg-[#003580] rounded-xl flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-sm mb-1">Best Prices</h3>
                <p className="text-xs text-gray-600">
                  Pay what you feel is fair
                </p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                <div className="w-12 h-12 bg-[#003580] rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-sm mb-1">Secure Booking</h3>
                <p className="text-xs text-gray-600">Instant confirmations</p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                <div className="w-12 h-12 bg-[#003580] rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Headphones className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-sm mb-1">24/7 Support</h3>
                <p className="text-xs text-gray-600">Always here to help</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="block md:hidden bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 z-50">
          <div className="grid grid-cols-5 h-16">
            <Link
              to="/"
              className="flex flex-col items-center justify-center space-y-1 touch-manipulation min-h-[48px] w-full"
              onClick={() =>
                console.log("Flights button clicked - navigating to /")
              }
            >
              <Plane className="w-5 h-5 text-gray-400" />
              <span className="text-xs text-gray-500">Flights</span>
            </Link>
            <Link
              to="/hotels"
              className="flex flex-col items-center justify-center space-y-1 touch-manipulation min-h-[48px] w-full"
              onClick={() =>
                console.log("Hotels button clicked - already on Hotels page")
              }
            >
              <Hotel className="w-5 h-5 text-[#003580]" />
              <span className="text-xs text-[#003580] font-medium">Hotels</span>
            </Link>
            <Link
              to="/sightseeing"
              className="flex flex-col items-center justify-center space-y-1 touch-manipulation min-h-[48px] w-full"
              onClick={() =>
                console.log(
                  "Sightseeing button clicked - navigating to /sightseeing",
                )
              }
            >
              <Camera className="w-5 h-5 text-gray-400" />
              <span className="text-xs text-gray-500">Sightseeing</span>
            </Link>
            <Link
              to="/saved"
              className="flex flex-col items-center justify-center space-y-1 touch-manipulation min-h-[48px] w-full"
              onClick={() =>
                console.log("Saved button clicked - navigating to /saved")
              }
            >
              <Heart className="w-5 h-5 text-gray-400" />
              <span className="text-xs text-gray-500">Saved</span>
            </Link>
            <Link
              to="/account"
              className="flex flex-col items-center justify-center space-y-1 touch-manipulation min-h-[48px] w-full"
              onClick={() =>
                console.log("Account button clicked - navigating to /account")
              }
            >
              <User className="w-5 h-5 text-gray-400" />
              <span className="text-xs text-gray-500">Account</span>
            </Link>
          </div>
        </div>
      </div>

      {/* DESKTOP LAYOUT (≥769px) - Enhanced Original Design */}
      <div className="hidden md:block">
        {/* Desktop Header */}
        <header className="text-white" style={{ backgroundColor: "#003580" }}>
          <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-[#febb02] rounded-lg flex items-center justify-center">
                  <Plane className="w-4 h-4 text-[#003580]" />
                </div>
                <span className="text-lg sm:text-xl font-bold tracking-tight">
                  faredown.com
                </span>
              </Link>

              {/* Centered Navigation */}
              <nav className="flex items-center space-x-6 lg:space-x-8 text-sm font-medium absolute left-1/2 transform -translate-x-1/2">
                <Link
                  to="/?tab=flights"
                  onClick={() =>
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }
                  className="text-white hover:text-blue-200 cursor-pointer flex items-center font-semibold py-3 lg:py-4"
                >
                  <span>Flights</span>
                </Link>
                <Link
                  to="/?tab=hotels"
                  onClick={() =>
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }
                  className="text-white hover:text-blue-200 cursor-pointer flex items-center font-semibold py-3 lg:py-4 border-b-2 border-white"
                >
                  <span>Hotels</span>
                </Link>
                <Link
                  to="/?tab=sightseeing"
                  onClick={() =>
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }
                  className="text-white hover:text-blue-200 cursor-pointer flex items-center font-semibold py-3 lg:py-4"
                >
                  <span>Sightseeing</span>
                </Link>
                <Link
                  to="/?tab=transfers"
                  onClick={() =>
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }
                  className="text-white hover:text-blue-200 cursor-pointer flex items-center font-semibold py-3 lg:py-4"
                >
                  <span>Transfers</span>
                </Link>
              </nav>

              <div className="flex items-center space-x-2 md:space-x-6">
                {/* Language and Currency */}
                <div className="flex items-center space-x-4 text-sm">
                  <div className="relative">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="text-white hover:text-blue-200 cursor-pointer flex items-center space-x-1">
                          <Globe className="w-4 h-4" />
                          <span>English</span>
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-48">
                        {[
                          { code: "en", name: "English", flag: "🇬🇧" },
                          { code: "es", name: "Español", flag: "🇪����" },
                          { code: "fr", name: "Français", flag: "🇫🇷" },
                          { code: "de", name: "Deutsch", flag: "🇩🇪" },
                          { code: "it", name: "Italiano", flag: "🇮🇹" },
                          { code: "pt", name: "Português", flag: "🇵🇹" },
                          { code: "ar", name: "الع��بية", flag: "🇸🇦" },
                          { code: "hi", name: "हि��्दी", flag: "🇮🇳" },
                          { code: "ja", name: "日��語", flag: "🇯🇵" },
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
                  </div>
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
                      <div className="absolute top-8 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-50 w-56 max-h-60 overflow-y-auto">
                        {currencies.map((currency) => (
                          <button
                            key={currency.code}
                            onClick={() => {
                              setCurrency(currency);
                              setShowCurrencyDropdown(false);
                            }}
                            className={`w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm flex items-center justify-between transition-colors ${
                              selectedCurrency.code === currency.code
                                ? "bg-blue-50 text-blue-600"
                                : "text-gray-900"
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <span>{currency.flag}</span>
                              <span>{currency.name}</span>
                            </div>
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
                      <DropdownMenuTrigger asChild>
                        <button className="flex items-center space-x-2 text-white hover:text-blue-200 px-3 py-2 rounded-lg transition-colors">
                          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                            <span className="text-[#003580] font-bold text-sm">
                              {userName.charAt(0)}
                            </span>
                          </div>
                          <span className="font-medium">{userName}</span>
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-48" align="end">
                        <DropdownMenuItem>
                          <Link to="/account" className="flex items-center">
                            <User className="w-4 h-4 mr-2" />
                            My account
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link
                            to="/account/trips"
                            className="flex items-center"
                          >
                            <Plane className="w-4 h-4 mr-2" />
                            Bookings & Trips
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link
                            to="/account/loyalty"
                            className="flex items-center"
                          >
                            <Heart className="w-4 h-4 mr-2" />
                            Loyalty program
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link
                            to="/account/payment"
                            className="flex items-center"
                          >
                            <DollarSign className="w-4 h-4 mr-2" />
                            Rewards & Wallet
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link to="/my-trips" className="flex items-center">
                            <Settings className="w-4 h-4 mr-2" />
                            Completed trips
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleSignOut}>
                          <LogOut className="w-4 h-4 mr-2" />
                          Sign out
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => window.open("/admin/login", "_blank")}
                          className="border-t mt-1 pt-2"
                        >
                          <Shield className="w-4 h-4 mr-2" />
                          Admin Panel
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => window.open("/admin/api", "_blank")}
                        >
                          <Code className="w-4 h-4 mr-2" />
                          Live API
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-transparent border-white text-white hover:bg-white hover:text-blue-600 transition-colors px-6 py-2 h-9 font-medium"
                      >
                        Register
                      </Button>
                      <Button
                        size="sm"
                        className="bg-blue-500 hover:bg-blue-400 text-white px-6 py-2 h-9 font-medium rounded-md"
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

        {/* Desktop Main Content */}
        <div
          className="py-3 sm:py-6 md:py-8 pb-24 sm:pb-8"
          style={{ backgroundColor: "#003580" }}
        >
          <div className="max-w-7xl mx-auto px-3 sm:px-4">
            <div className="text-center mb-2 sm:mb-3">
              <div className="mb-3 sm:mb-5">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
                  Find your perfect stay
                </h2>
              </div>
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-white mb-3 sm:mb-4 leading-tight px-2 opacity-95">
                Search hotels with live AI bargaining.
              </h1>
            </div>

            {/* Desktop Hotel Search Form with Hotelbeds Test Destinations */}
            <div className="max-w-7xl mx-auto">
              <BookingSearchForm />
            </div>
          </div>
        </div>

        {/* Why Choose Faredown Section */}
        <section className="py-16 bg-white">
          <div className="max-w-[1280px] mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Why Faredown Is Reinventing Hotel Booking
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
                  Negotiate room upgrades instantly — from standard to suite,
                  from basic to deluxe.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-[#003580] rounded-lg flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Pay What You Feel Is Fair
                </h3>
                <p className="text-gray-600 text-sm">
                  Set your price and let Faredown try to get it for you — no
                  more overpaying.
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

        {/* Trust & Social Proof Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-[1280px] mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Trusted by 50M+ Travelers
              </h2>
              <p className="text-gray-600 text-lg mb-6">
                Real reviews from verified travelers
              </p>
              <div className="flex items-center justify-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-400 text-2xl">
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-3xl font-bold text-gray-900">4.9</span>
                </div>
                <div className="text-gray-600">
                  <div className="font-medium">Excellent</div>
                  <div className="text-sm">
                    Based on 50,000+ reviews on Trustpilot
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Support Section */}
            <div className="text-center mb-12">
              <div className="bg-[#003580] text-white py-4 px-8 rounded-xl inline-block">
                <div className="flex items-center space-x-3">
                  <Headphones className="w-6 h-6" />
                  <span className="text-lg font-semibold">
                    24/7 Customer Support | Live Chat & Call Available
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Methods */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">👥</span>
                </div>
                <div className="text-sm font-medium text-gray-900">
                  Live Chat
                </div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">📞</span>
                </div>
                <div className="text-sm font-medium text-gray-900">
                  Phone Call
                </div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">✉️</span>
                </div>
                <div className="text-sm font-medium text-gray-900">Email</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🎅</span>
                </div>
                <div className="text-sm font-medium text-gray-900">
                  24/7 Support
                </div>
              </div>
              <div className="text-center md:col-span-1 col-span-2">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🔒</span>
                </div>
                <div className="text-sm font-medium text-gray-900">
                  Safe, Verified, and Instant Confirmations. Backed by real
                  humans.
                </div>
              </div>
            </div>

            {/* Customer Testimonials */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-[#003580] rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">P</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      Priya Sharma
                    </div>
                    <div className="text-sm text-gray-500">
                      Marketing Manager
                    </div>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-gray-700 text-sm">
                  "Saved ₹15,000 on my Dubai trip! The bargaining feature is
                  amazing. Got business class hotel using Bargain��. Faredown is
                  revolutionary! Customer service is excellent."
                </p>
                <div className="mt-4 text-xs text-gray-500">
                  Verified Purchase
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-[#003580] rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">R</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Rohit Kumar</div>
                    <div className="text-sm text-gray-500">
                      Software Engineer
                    </div>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-gray-700 text-sm">
                  "Got suite upgrade in Singapore hotel using Bargain™.
                  Faredown is revolutionary! Customer service is excellent."
                </p>
                <div className="mt-4 text-xs text-gray-500">
                  Verified Purchase
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-[#003580] rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">A</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      Anjali Patel
                    </div>
                    <div className="text-sm text-gray-500">
                      Product Designer
                    </div>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-gray-700 text-sm">
                  "Easy booking process and instant confirmations. Saved on both
                  hotels and hotels. Will use again!"
                </p>
                <div className="mt-4 text-xs text-gray-500">
                  Verified Purchase
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mobile App Section */}
        <section className="py-16 bg-[#003580] text-white">
          <div className="max-w-[1280px] mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Travel Smarter. Bargain Better. On the Go.
            </h2>
            <p className="text-lg mb-8 text-blue-200">
              Download the Faredown app for exclusive mobile-only deals and
              instant bargain alerts.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-8">
              <div className="flex items-center space-x-3 text-blue-200">
                <span className="text-xl">📱</span>
                <span>Instant notifications</span>
              </div>
              <div className="flex items-center space-x-3 text-blue-200">
                <span className="text-xl">⚡</span>
                <span>Mobile exclusive deals</span>
              </div>
              <div className="flex items-center space-x-3 text-blue-200">
                <span className="text-xl">🎯</span>
                <span>Offline support available</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button className="bg-black text-white px-6 py-3 rounded-lg flex items-center space-x-3 hover:bg-gray-800 transition-colors">
                <span className="text-2xl">🍎</span>
                <div className="text-left">
                  <div className="text-xs">Download on the</div>
                  <div className="text-lg font-semibold">App Store</div>
                </div>
              </button>
              <button className="bg-black text-white px-6 py-3 rounded-lg flex items-center space-x-3 hover:bg-gray-800 transition-colors">
                <span className="text-2xl">🤖</span>
                <div className="text-left">
                  <div className="text-xs">Get it on</div>
                  <div className="text-lg font-semibold">Google Play</div>
                </div>
              </button>
            </div>
          </div>
        </section>

        {/* Email Signup Section */}
        <section className="py-16 bg-white">
          <div className="max-w-[1280px] mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Stay ahead with secret travel bargains
            </h2>
            <p className="text-gray-600 text-lg mb-8">
              Enter your email address
            </p>

            <div className="flex flex-col sm:flex-row max-w-md mx-auto space-y-4 sm:space-y-0 sm:space-x-4">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#003580] text-gray-900"
              />
              <Button className="bg-[#003580] hover:bg-[#0071c2] text-white px-8 py-3 rounded-lg font-medium">
                Subscribe
              </Button>
            </div>

            <p className="text-xs text-gray-500 mt-4">No spam emails</p>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-[#1a1a2e] text-white py-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <h3 className="text-lg font-bold mb-3">Faredown</h3>
                <p className="text-gray-400 text-sm mb-4">
                  The world's first travel portal where you can negotiate and
                  bargain for better deals.
                </p>
                <div className="flex space-x-3">
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
                  >
                    <Twitter className="w-4 h-4" />
                  </a>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Quick Links</h4>
                <ul className="space-y-1 text-sm text-gray-400">
                  <li>
                    <Link to="/about" className="hover:text-white">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link to="/how-it-works" className="hover:text-white">
                      How It Works
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact" className="hover:text-white">
                      Contact
                    </Link>
                  </li>
                  <li>
                    <Link to="/help" className="hover:text-white">
                      Help Center
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Services</h4>
                <ul className="space-y-0.5 text-sm text-gray-400">
                  <li>
                    <Link
                      to="/?tab=flights"
                      onClick={() =>
                        window.scrollTo({ top: 0, behavior: "smooth" })
                      }
                      className="hover:text-white"
                    >
                      Flights
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/?tab=hotels"
                      onClick={() =>
                        window.scrollTo({ top: 0, behavior: "smooth" })
                      }
                      className="hover:text-white"
                    >
                      Hotels
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/?tab=sightseeing"
                      onClick={() =>
                        window.scrollTo({ top: 0, behavior: "smooth" })
                      }
                      className="hover:text-white"
                    >
                      Sightseeing
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/?tab=transfers"
                      onClick={() =>
                        window.scrollTo({ top: 0, behavior: "smooth" })
                      }
                      className="hover:text-white"
                    >
                      Transfers
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Legal</h4>
                <ul className="space-y-1 text-sm text-gray-400">
                  <li>
                    <Link to="/privacy" className="hover:text-white">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link to="/terms" className="hover:text-white">
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link to="/refund" className="hover:text-white">
                      Refund Policy
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-700 mt-6 pt-6">
              <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-3 text-xs text-gray-400">
                    <span className="font-semibold">Certified by:</span>
                    <div className="flex items-center space-x-4">
                      <div className="bg-white rounded px-2 py-1">
                        <span className="text-[#003580] font-bold text-xs">
                          TAAI
                        </span>
                      </div>
                      <div className="bg-white rounded px-2 py-1">
                        <span className="text-[#003580] font-bold text-xs">
                          TAAFI
                        </span>
                      </div>
                      <div className="bg-white rounded px-2 py-1">
                        <span className="text-[#003580] font-bold text-xs">
                          IATA
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-gray-400 text-sm">
                  © 2025 Faredown.com. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Mobile Dropdown Components for Hotels */}
      <MobileCityDropdown
        isOpen={showMobileDestination}
        onClose={() => setShowMobileDestination(false)}
        title="Select destination"
        cities={cityData}
        selectedCity={selectedFromCity}
        onSelectCity={setSelectedFromCity}
        context="hotels"
      />

      <MobileDatePicker
        isOpen={showMobileDates}
        onClose={() => setShowMobileDates(false)}
        tripType="round-trip"
        setTripType={() => {}} // Hotels always use round-trip (check-in/check-out)
        selectedDepartureDate={departureDate}
        selectedReturnDate={returnDate}
        setSelectedDepartureDate={setDepartureDate}
        setSelectedReturnDate={setReturnDate}
        selectingDeparture={selectingDeparture}
        setSelectingDeparture={setSelectingDeparture}
        bookingType="hotels"
      />

      <MobileTravelers
        isOpen={showMobileGuests}
        onClose={() => setShowMobileGuests(false)}
        travelers={travelers}
        setTravelers={setTravelers}
      />

      <MobileNavigation />
    </div>
  );
}
