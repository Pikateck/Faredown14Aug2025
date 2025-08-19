import React, { useState, useEffect } from "react";
import {
  Link,
  useSearchParams,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  CheckCircle,
  User,
  ChevronDown,
  X,
  ArrowLeft,
  Menu,
  BookOpen,
  Award,
  Heart,
  LogOut,
  Settings,
  CreditCard,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function BookingFlow() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showTravellerDetails, setShowTravellerDetails] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  // User state
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [userName, setUserName] = useState("Zubin Aibara");

  // Currency state
  const [selectedCurrency, setSelectedCurrency] = useState({
    code: "INR",
    symbol: "₹",
    name: "Indian Rupee",
  });

  // Multiple travellers state (2 Adults, 1 Child as per screenshot)
  const [travellers, setTravellers] = useState([
    {
      id: 1,
      type: "Adult",
      title: "",
      firstName: "",
      middleName: "",
      lastName: "",
      gender: "",
    },
    {
      id: 2,
      type: "Adult",
      title: "",
      firstName: "",
      middleName: "",
      lastName: "",
      gender: "",
    },
    {
      id: 3,
      type: "Child",
      title: "",
      firstName: "",
      middleName: "",
      lastName: "",
      gender: "",
      age: "",
    },
  ]);

  const [selectedTraveller, setSelectedTraveller] = useState<number | null>(
    null,
  );

  const [contactDetails, setContactDetails] = useState({
    email: "",
    phone: "",
    countryCode: "",
  });

  const countries = [
    { name: "Guernsey", code: "+44" },
    { name: "Guinea", code: "+224" },
    { name: "Guinea-Bissau", code: "+245" },
    { name: "Guyana", code: "+592" },
    { name: "Haiti", code: "+509" },
    { name: "Honduras", code: "+504" },
    { name: "Hong Kong", code: "+852" },
    { name: "Hungary", code: "+36" },
    { name: "Iceland", code: "+354" },
    { name: "India", code: "+91" },
    { name: "Indonesia", code: "+62" },
    { name: "Iran", code: "+98" },
    { name: "Iraq", code: "+964" },
    { name: "Ireland", code: "+353" },
    { name: "Isle of Man", code: "+44" },
    { name: "Israel", code: "+972" },
    { name: "Italy", code: "+39" },
    { name: "Ivory Coast", code: "+225" },
    { name: "Jamaica", code: "+1" },
    { name: "Japan", code: "+81" },
  ];

  const [showAdultFare, setShowAdultFare] = useState(true);
  const [showChildFare, setShowChildFare] = useState(true);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  const steps = [
    { id: 1, label: "Travellers", icon: "1", active: true, completed: false },
    { id: 2, label: "Extras", icon: "2", active: false, completed: false },
    { id: 3, label: "Seats", icon: "3", active: false, completed: false },
    { id: 4, label: "Payment", icon: "4", active: false, completed: false },
  ];

  const handleTravellerSubmit = () => {
    setShowTravellerDetails(false);
    // Handle form submission logic here
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Faredown Header */}
      <header className="bg-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight">
                faredown.com
              </span>
            </Link>
            <div className="flex items-center space-x-2 md:space-x-6">
              {/* Mobile menu button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden text-white p-2"
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
                <Link
                  to="/transfers"
                  className="text-white hover:text-blue-200 cursor-pointer flex items-center py-4"
                >
                  <span>Transfers</span>
                </Link>
                <Link
                  to="/sightseeing"
                  className="text-white hover:text-blue-200 cursor-pointer flex items-center py-4"
                >
                  <span>Sightseeing</span>
                </Link>
                <Link
                  to="/sports"
                  className="text-white hover:text-blue-200 cursor-pointer py-4 flex items-center"
                >
                  <span>Sports & Events</span>
                </Link>
              </nav>

              {/* Language and Currency */}
              <div className="hidden md:flex items-center space-x-4 text-sm">
                <button className="text-white hover:text-blue-200 cursor-pointer flex items-center space-x-1">
                  <span>🌐</span>
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
                        Rewards (Level 1)
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Heart className="w-4 h-4 mr-2" />
                        Saved
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Payment methods
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="w-4 h-4 mr-2" />
                        Account settings
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setIsLoggedIn(false);
                          setUserName("");
                        }}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      onClick={() => setShowRegister(true)}
                      className="text-white hover:text-blue-200 hover:bg-blue-600"
                    >
                      Register
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setShowSignIn(true)}
                      className="text-white hover:text-blue-200 hover:bg-blue-600"
                    >
                      Sign in
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step.completed
                        ? "bg-green-600 text-white"
                        : step.active
                          ? "bg-[#003B95] text-white"
                          : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {step.completed ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      step.icon
                    )}
                  </div>
                  <span
                    className={`ml-2 text-sm font-medium ${
                      step.active ? "text-[#003B95]" : "text-gray-600"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className="w-8 h-px bg-gray-300 mx-4"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Trip Info */}
            <div>
              <div className="text-sm text-gray-600 mb-1">
                One way • 3 travellers • Sat, Aug 3
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-6">
                Mumbai to Dubai
              </h1>
            </div>

            {/* Enter your details */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Enter your details
              </h2>
              <p className="text-gray-600 text-sm mb-6">
                Add traveller details and review baggage options
              </p>

              {/* Travellers Grid - Responsive */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Adult 1 */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="mb-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        {travellers[0]?.firstName ? (
                          <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                            <svg
                              className="w-3 h-3 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                        ) : (
                          <User className="w-4 h-4 text-gray-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        {travellers[0]?.firstName ? (
                          <div>
                            <div className="font-semibold text-gray-900">
                              {`${travellers[0].firstName} ${travellers[0].lastName}`.trim()}
                            </div>
                            {travellers[0]?.gender && (
                              <div className="text-sm text-gray-600 capitalize">
                                {travellers[0].gender}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-600">Adult 1</span>
                        )}
                        {!travellers[0]?.firstName && (
                          <span className="text-sm text-gray-600">Adult 1</span>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        setSelectedTraveller(1);
                        setShowTravellerDetails(true);
                      }}
                      variant="outline"
                      className="text-blue-600 border-blue-600 hover:bg-blue-50 text-sm w-full"
                    >
                      {travellers[0]?.firstName
                        ? "Edit this traveller's details"
                        : "Add this traveller's details"}
                    </Button>
                  </div>

                  {/* Baggage for Adult 1 */}
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start space-x-3">
                      <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-green-600 text-xs">✓</span>
                      </div>
                      <div>
                        <div className="font-medium">
                          Personal items won't available for this booking
                        </div>
                        <div className="text-gray-600">Nothing</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-green-600 text-xs">✓</span>
                      </div>
                      <div>
                        <div className="font-medium">1 carry-on bag</div>
                        <div className="text-gray-600">
                          22 x 56 x 36 cm • 7 kg
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-green-600 text-xs">✓</span>
                      </div>
                      <div>
                        <div className="font-medium">1 checked bag</div>
                        <div className="text-gray-600">23 kg</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Adult 2 */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="mb-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        {travellers[1]?.firstName ? (
                          <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                            <svg
                              className="w-3 h-3 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                        ) : (
                          <User className="w-4 h-4 text-gray-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        {travellers[1]?.firstName ? (
                          <div>
                            <div className="font-semibold text-gray-900">
                              {`${travellers[1].firstName} ${travellers[1].lastName}`.trim()}
                            </div>
                            {travellers[1]?.gender && (
                              <div className="text-sm text-gray-600 capitalize">
                                {travellers[1].gender}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-600">Adult 2</span>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        setSelectedTraveller(2);
                        setShowTravellerDetails(true);
                      }}
                      variant="outline"
                      className="text-blue-600 border-blue-600 hover:bg-blue-50 text-sm w-full"
                    >
                      {travellers[1]?.firstName
                        ? "Edit this traveller's details"
                        : "Add this traveller's details"}
                    </Button>
                  </div>

                  {/* Baggage for Adult 2 */}
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start space-x-3">
                      <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-green-600 text-xs">✓</span>
                      </div>
                      <div>
                        <div className="font-medium">
                          Personal items won't available for this booking
                        </div>
                        <div className="text-gray-600">Nothing</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-green-600 text-xs">✓</span>
                      </div>
                      <div>
                        <div className="font-medium">1 carry-on bag</div>
                        <div className="text-gray-600">
                          22 x 56 x 36 cm • 7 kg
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-green-600 text-xs">✓</span>
                      </div>
                      <div>
                        <div className="font-medium">1 checked bag</div>
                        <div className="text-gray-600">23 kg</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Child 1 - Full width */}
              <div className="border border-gray-200 rounded-lg p-4 mb-8">
                <div className="mb-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      {travellers[2]?.firstName ? (
                        <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      ) : (
                        <User className="w-4 h-4 text-gray-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      {travellers[2]?.firstName ? (
                        <div>
                          <div className="font-semibold text-gray-900">
                            {`${travellers[2].firstName} ${travellers[2].lastName}`.trim()}
                          </div>
                          {travellers[2]?.gender && (
                            <div className="text-sm text-gray-600 capitalize">
                              {travellers[2].gender}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-600">Child 1</span>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      setSelectedTraveller(3);
                      setShowTravellerDetails(true);
                    }}
                    variant="outline"
                    className="text-blue-600 border-blue-600 hover:bg-blue-50 text-sm w-full"
                  >
                    {travellers[2]?.firstName
                      ? "Edit this traveller's details"
                      : "Add this traveller's details"}
                  </Button>
                </div>

                {/* Baggage for Child */}
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-3">
                    <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-green-600 text-xs">✓</span>
                    </div>
                    <div>
                      <div className="font-medium">
                        Personal items won't available for this booking
                      </div>
                      <div className="text-gray-600">Nothing</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-green-600 text-xs">✓</span>
                    </div>
                    <div>
                      <div className="font-medium">1 carry-on bag</div>
                      <div className="text-gray-600">
                        22 x 56 x 36 cm • 7 kg
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-green-600 text-xs">✓</span>
                    </div>
                    <div>
                      <div className="font-medium">1 checked bag</div>
                      <div className="text-gray-600">23 kg</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Details */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Contact details
                </h3>
                <p className="text-sm text-gray-600 mb-4">* Required</p>

                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact email *
                    </label>
                    <Input
                      type="email"
                      value={contactDetails.email}
                      onChange={(e) =>
                        setContactDetails({
                          ...contactDetails,
                          email: e.target.value,
                        })
                      }
                      placeholder="zubin@faredown.com"
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      We'll send your flight confirmation here
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone number *
                    </label>
                    <div className="flex space-x-2">
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                          className="w-32 px-3 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {contactDetails.countryCode ? (
                            <span className="block truncate">
                              {countries.find(c => c.code === contactDetails.countryCode)?.name} ({contactDetails.countryCode})
                            </span>
                          ) : (
                            <span className="block truncate text-gray-500"></span>
                          )}
                          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </button>

                        {showCountryDropdown && (
                          <div className="absolute z-50 w-80 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                            {countries.map((country) => (
                              <button
                                key={country.code}
                                type="button"
                                onClick={() => {
                                  setContactDetails({
                                    ...contactDetails,
                                    countryCode: country.code,
                                  });
                                  setShowCountryDropdown(false);
                                }}
                                className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                                  contactDetails.countryCode === country.code ? 'bg-blue-600 text-white' : 'text-gray-900'
                                }`}
                              >
                                {country.name} ({country.code})
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                          <SelectItem value="+91">🇮🇳 IN +91</SelectItem>
                          <SelectItem value="+93">🇦🇫 AF +93</SelectItem>
                          <SelectItem value="+355">🇦🇱 +355</SelectItem>
                          <SelectItem value="+213">🇩🇿 +213</SelectItem>
                          <SelectItem value="+1">🇺🇸 +1</SelectItem>
                          <SelectItem value="+376">🇦🇩 +376</SelectItem>
                          <SelectItem value="+244">🇦🇴 +244</SelectItem>
                          <SelectItem value="+54">🇦🇷 +54</SelectItem>
                          <SelectItem value="+374">🇦🇲 +374</SelectItem>
                          <SelectItem value="+61">🇦🇺 +61</SelectItem>
                          <SelectItem value="+43">🇦🇹 +43</SelectItem>
                          <SelectItem value="+994">🇦🇿 +994</SelectItem>
                          <SelectItem value="+973">🇧🇭 +973</SelectItem>
                                                    <SelectItem value="+880">🇧🇩 +880</SelectItem>
                          <SelectItem value="+32">🇧🇪 +32</SelectItem>
                          <SelectItem value="+55">🇧🇷 +55</SelectItem>
                          <SelectItem value="+1">🇨🇦 +1</SelectItem>
                          <SelectItem value="+86">🇨🇳 +86</SelectItem>
                          <SelectItem value="+45">🇩🇰 +45</SelectItem>
                          <SelectItem value="+20">🇪🇬 +20</SelectItem>
                          <SelectItem value="+33">🇫🇷 +33</SelectItem>
                          <SelectItem value="+49">🇩🇪 +49</SelectItem>
                          <SelectItem value="+30">🇬🇷 +30</SelectItem>
                          <SelectItem value="+91">🇮🇳 +91</SelectItem>
                          <SelectItem value="+62">🇮🇩 +62</SelectItem>
                          <SelectItem value="+98">🇮🇷 +98</SelectItem>
                          <SelectItem value="+964">🇮🇶 +964</SelectItem>
                          <SelectItem value="+353">🇮🇪 +353</SelectItem>
                          <SelectItem value="+972">🇮🇱 +972</SelectItem>
                          <SelectItem value="+39">🇮🇹 +39</SelectItem>
                          <SelectItem value="+81">🇯🇵 +81</SelectItem>
                          <SelectItem value="+962">🇯🇴 +962</SelectItem>
                          <SelectItem value="+965">🇰🇼 +965</SelectItem>
                          <SelectItem value="+961">🇱🇧 +961</SelectItem>
                          <SelectItem value="+60">🇲🇾 +60</SelectItem>
                          <SelectItem value="+52">🇲🇽 +52</SelectItem>
                          <SelectItem value="+31">🇳🇱 +31</SelectItem>
                          <SelectItem value="+64">🇳🇿 +64</SelectItem>
                          <SelectItem value="+47">🇳🇴 +47</SelectItem>
                          <SelectItem value="+968">🇴🇲 +968</SelectItem>
                          <SelectItem value="+92">🇵🇰 +92</SelectItem>
                          <SelectItem value="+351">🇵🇹 +351</SelectItem>
                          <SelectItem value="+974">🇶🇦 +974</SelectItem>
                          <SelectItem value="+7">🇷🇺 +7</SelectItem>
                          <SelectItem value="+966">🇸🇦 +966</SelectItem>
                          <SelectItem value="+65">🇸🇬 +65</SelectItem>
                          <SelectItem value="+27">🇿🇦 +27</SelectItem>
                          <SelectItem value="+82">🇰🇷 +82</SelectItem>
                          <SelectItem value="+34">🇪🇸 +34</SelectItem>
                          <SelectItem value="+94">🇱🇰 +94</SelectItem>
                          <SelectItem value="+46">🇸🇪 +46</SelectItem>
                          <SelectItem value="+41">🇨🇭 +41</SelectItem>
                          <SelectItem value="+66">🇹🇭 +66</SelectItem>
                          <SelectItem value="+90">🇹🇷 +90</SelectItem>
                          <SelectItem value="+971">🇦🇪 +971</SelectItem>
                          <SelectItem value="+44">🇬🇧 +44</SelectItem>
                          <SelectItem value="+84">🇻🇳 +84</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        type="tel"
                        value={contactDetails.phone}
                        onChange={(e) =>
                          setContactDetails({
                            ...contactDetails,
                            phone: e.target.value,
                          })
                        }
                        placeholder="+44"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => navigate("/flights")}
                className="flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button className="bg-[#003B95] hover:bg-blue-800 text-white px-8">
                Next
              </Button>
            </div>
          </div>

          {/* Right Sidebar - Price Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Price details
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-medium">Flight (3 travellers)</span>
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  </div>

                  {/* Adults Section - Collapsible */}
                  <div className="space-y-2 text-sm mb-3">
                    <div className="flex justify-between items-center text-gray-900">
                      <button
                        onClick={() => setShowAdultFare(!showAdultFare)}
                        className="flex items-center space-x-1"
                      >
                        <span>Adults (2)</span>
                        <ChevronDown
                          className={`w-3 h-3 transition-transform ${showAdultFare ? "rotate-180" : ""}`}
                        />
                      </button>
                      <span>INR57,825</span>
                    </div>
                    {showAdultFare && (
                      <div className="ml-4 space-y-1">
                        <div className="flex justify-between text-gray-600">
                          <span>Flight fare</span>
                          <span>INR51,820</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>Airline taxes and fees</span>
                          <span>INR6,005</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Child Section - Collapsible */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center text-gray-900">
                      <button
                        onClick={() => setShowChildFare(!showChildFare)}
                        className="flex items-center space-x-1"
                      >
                        <span>Child (1)</span>
                        <ChevronDown
                          className={`w-3 h-3 transition-transform ${showChildFare ? "rotate-180" : ""}`}
                        />
                      </button>
                      <span>INR34,503</span>
                    </div>
                    {showChildFare && (
                      <div className="ml-4 space-y-1">
                        <div className="flex justify-between text-gray-600">
                          <span>Flight fare</span>
                          <span>INR31,212</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>Airline taxes and fees</span>
                          <span>INR3,291</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center font-semibold text-lg">
                    <span>Total</span>
                    <span>INR92,328</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">taxes and fees</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    ✓ No hidden fees – track your price at every step
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Traveller Details Modal */}
      <Dialog
        open={showTravellerDetails}
        onOpenChange={setShowTravellerDetails}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {selectedTraveller
                ? `${travellers.find((t) => t.id === selectedTraveller)?.type} ${selectedTraveller}`
                : "Traveller Details"}
            </DialogTitle>
            <p className="text-sm text-gray-600">Required</p>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First name *
              </label>
              <Input
                value={
                  selectedTraveller
                    ? travellers.find((t) => t.id === selectedTraveller)
                        ?.firstName || ""
                    : ""
                }
                onChange={(e) => {
                  if (selectedTraveller) {
                    setTravellers((prev) =>
                      prev.map((t) =>
                        t.id === selectedTraveller
                          ? { ...t, firstName: e.target.value }
                          : t,
                      ),
                    );
                  }
                }}
                placeholder="First name"
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                First name(s) must written as they appear on the traveller's
                travel document
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Middle name
              </label>
              <Input
                value={
                  selectedTraveller
                    ? travellers.find((t) => t.id === selectedTraveller)
                        ?.middleName || ""
                    : ""
                }
                onChange={(e) => {
                  if (selectedTraveller) {
                    setTravellers((prev) =>
                      prev.map((t) =>
                        t.id === selectedTraveller
                          ? { ...t, middleName: e.target.value }
                          : t,
                      ),
                    );
                  }
                }}
                placeholder="Middle name"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last name *
              </label>
              <Input
                value={
                  selectedTraveller
                    ? travellers.find((t) => t.id === selectedTraveller)
                        ?.lastName || ""
                    : ""
                }
                onChange={(e) => {
                  if (selectedTraveller) {
                    setTravellers((prev) =>
                      prev.map((t) =>
                        t.id === selectedTraveller
                          ? { ...t, lastName: e.target.value }
                          : t,
                      ),
                    );
                  }
                }}
                placeholder="Last name"
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Last name(s) must written as they appear on the traveller's
                travel document
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender specified on your travel document *
              </label>
              <Select
                value={
                  selectedTraveller
                    ? travellers.find((t) => t.id === selectedTraveller)
                        ?.gender || ""
                    : ""
                }
                onValueChange={(value) => {
                  if (selectedTraveller) {
                    setTravellers((prev) =>
                      prev.map((t) =>
                        t.id === selectedTraveller
                          ? { ...t, gender: value }
                          : t,
                      ),
                    );
                  }
                }}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select your gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                We only collect required by airlines and providers to book for
                this traveller
              </p>
            </div>

            {selectedTraveller &&
              travellers.find((t) => t.id === selectedTraveller)?.type ===
                "Child" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age *
                  </label>
                  <Select
                    value={
                      selectedTraveller
                        ? travellers.find((t) => t.id === selectedTraveller)
                            ?.age || ""
                        : ""
                    }
                    onValueChange={(value) => {
                      if (selectedTraveller) {
                        setTravellers((prev) =>
                          prev.map((t) =>
                            t.id === selectedTraveller
                              ? { ...t, age: value }
                              : t,
                          ),
                        );
                      }
                    }}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Select age" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => i + 2).map(
                        (age) => (
                          <SelectItem key={age} value={age.toString()}>
                            {age} years old
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowTravellerDetails(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleTravellerSubmit}
                className="bg-[#003B95] hover:bg-blue-800"
              >
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}