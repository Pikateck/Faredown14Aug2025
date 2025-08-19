import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  Car,
  Star,
  User,
  LogOut,
  Shield,
  Wifi,
  Snowflake,
  ChevronDown,
} from "lucide-react";

export default function Transfers() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [fromLocation, setFromLocation] = useState("Mumbai Airport (BOM)");
  const [toLocation, setToLocation] = useState("Hotel Taj Mahal Palace");
  const [transferDate, setTransferDate] = useState("Dec 15");
  const [transferTime, setTransferTime] = useState("10:30");
  const [passengers, setPassengers] = useState("2 passengers");

  const handleSignOut = () => {
    setIsLoggedIn(false);
    setUserName("");
  };

  const transferOptions = [
    {
      id: 1,
      type: "Economy",
      vehicle: "Sedan",
      capacity: "Up to 3 passengers",
      duration: "45 minutes",
      price: 1200,
      originalPrice: 1500,
      rating: 4.6,
      features: ["Professional Driver", "Meet & Greet", "Free Waiting"],
      image: "/api/placeholder/120/80",
    },
    {
      id: 2,
      type: "Premium",
      vehicle: "SUV",
      capacity: "Up to 6 passengers",
      duration: "45 minutes",
      price: 2100,
      originalPrice: 2800,
      rating: 4.8,
      features: [
        "Luxury Vehicle",
        "English Speaking Driver",
        "Free WiFi",
        "Water Bottles",
      ],
      image: "/api/placeholder/120/80",
    },
    {
      id: 3,
      type: "Business",
      vehicle: "Mercedes E-Class",
      capacity: "Up to 3 passengers",
      duration: "40 minutes",
      price: 3500,
      originalPrice: 4200,
      rating: 4.9,
      features: [
        "Premium Vehicle",
        "VIP Service",
        "Flight Monitoring",
        "Complimentary Refreshments",
      ],
      image: "/api/placeholder/120/80",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-xl font-bold">
              faredown.com
            </Link>

            {/* Navigation Tabs */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/flights"
                className="flex items-center space-x-1 hover:text-blue-200 transition-colors"
              >
                <span>✈️</span>
                <span>Flights</span>
              </Link>
              <Link
                to="/hotels"
                className="flex items-center space-x-1 hover:text-blue-200 transition-colors"
              >
                <span>🏨</span>
                <span>Hotels</span>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center space-x-1 text-sm hover:text-blue-200">
                  <span>🌐</span>
                  <span>English (UK)</span>
                  <ChevronDown className="w-3 h-3" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>🇬🇧 English (UK)</DropdownMenuItem>
                  <DropdownMenuItem>🇺🇸 English (US)</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center space-x-1 text-sm hover:text-blue-200">
                  <span>INR</span>
                  <ChevronDown className="w-3 h-3" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="max-h-64 overflow-y-auto">
                  <DropdownMenuItem>₹ INR - Indian Rupee</DropdownMenuItem>
                  <DropdownMenuItem>$ USD - US Dollar</DropdownMenuItem>
                  <DropdownMenuItem>€ EUR - Euro</DropdownMenuItem>
                  <DropdownMenuItem>£ GBP - British Pound</DropdownMenuItem>
                  <DropdownMenuItem>¥ JPY - Japanese Yen</DropdownMenuItem>
                  <DropdownMenuItem>C$ CAD - Canadian Dollar</DropdownMenuItem>
                  <DropdownMenuItem>
                    A$ AUD - Australian Dollar
                  </DropdownMenuItem>
                  <DropdownMenuItem>CHF - Swiss Franc</DropdownMenuItem>
                  <DropdownMenuItem>¥ CNY - Chinese Yuan</DropdownMenuItem>
                  <DropdownMenuItem>kr SEK - Swedish Krona</DropdownMenuItem>
                  <DropdownMenuItem>kr NOK - Norwegian Krone</DropdownMenuItem>
                  <DropdownMenuItem>kr DKK - Danish Krone</DropdownMenuItem>
                  <DropdownMenuItem>₩ KRW - South Korean Won</DropdownMenuItem>
                  <DropdownMenuItem>S$ SGD - Singapore Dollar</DropdownMenuItem>
                  <DropdownMenuItem>
                    HK$ HKD - Hong Kong Dollar
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    NZ$ NZD - New Zealand Dollar
                  </DropdownMenuItem>
                  <DropdownMenuItem>₽ RUB - Russian Ruble</DropdownMenuItem>
                  <DropdownMenuItem>
                    R ZAR - South African Rand
                  </DropdownMenuItem>
                  <DropdownMenuItem>₺ TRY - Turkish Lira</DropdownMenuItem>
                  <DropdownMenuItem>R$ BRL - Brazilian Real</DropdownMenuItem>
                  <DropdownMenuItem>Mex$ MXN - Mexican Peso</DropdownMenuItem>
                  <DropdownMenuItem>₪ ILS - Israeli Shekel</DropdownMenuItem>
                  <DropdownMenuItem>₦ NGN - Nigerian Naira</DropdownMenuItem>
                  <DropdownMenuItem>EGP - Egyptian Pound</DropdownMenuItem>
                  <DropdownMenuItem>₨ PKR - Pakistani Rupee</DropdownMenuItem>
                  <DropdownMenuItem>৳ BDT - Bangladeshi Taka</DropdownMenuItem>
                  <DropdownMenuItem>₨ LKR - Sri Lankan Rupee</DropdownMenuItem>
                  <DropdownMenuItem>
                    Rp IDR - Indonesian Rupiah
                  </DropdownMenuItem>
                  <DropdownMenuItem>₱ PHP - Philippine Peso</DropdownMenuItem>
                  <DropdownMenuItem>₫ VND - Vietnamese Dong</DropdownMenuItem>
                  <DropdownMenuItem>฿ THB - Thai Baht</DropdownMenuItem>
                  <DropdownMenuItem>
                    RM MYR - Malaysian Ringgit
                  </DropdownMenuItem>
                  <DropdownMenuItem>AED - UAE Dirham</DropdownMenuItem>
                  <DropdownMenuItem>SAR - Saudi Riyal</DropdownMenuItem>
                  <DropdownMenuItem>QAR - Qatari Riyal</DropdownMenuItem>
                  <DropdownMenuItem>KWD - Kuwaiti Dinar</DropdownMenuItem>
                  <DropdownMenuItem>BHD - Bahraini Dinar</DropdownMenuItem>
                  <DropdownMenuItem>OMR - Omani Rial</DropdownMenuItem>
                  <DropdownMenuItem>zł PLN - Polish Zloty</DropdownMenuItem>
                  <DropdownMenuItem>Kč CZK - Czech Koruna</DropdownMenuItem>
                  <DropdownMenuItem>Ft HUF - Hungarian Forint</DropdownMenuItem>
                  <DropdownMenuItem>RON - Romanian Leu</DropdownMenuItem>
                  <DropdownMenuItem>BGN - Bulgarian Lev</DropdownMenuItem>
                  <DropdownMenuItem>kn HRK - Croatian Kuna</DropdownMenuItem>
                  <DropdownMenuItem>₴ UAH - Ukrainian Hryvnia</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <span className="text-sm">?</span>

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
                    >
                      Register
                    </Button>
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-800 text-white rounded text-sm font-medium px-4 py-1.5"
                    >
                      Sign in
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-blue-700 py-6">
          <div className="max-w-7xl mx-auto px-4">
            <div className="bg-green-400 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Book reliable airport transfers
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="relative">
                  <label className="absolute -top-2 left-3 bg-green-400 px-1 text-xs text-gray-700 font-medium">
                    From
                  </label>
                  <div className="flex items-center bg-white rounded border border-gray-300 px-3 py-3 h-12">
                    <MapPin className="w-4 h-4 text-gray-500 mr-2" />
                    <input
                      type="text"
                      value={fromLocation}
                      onChange={(e) => setFromLocation(e.target.value)}
                      className="flex-1 outline-none text-sm font-medium"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="absolute -top-2 left-3 bg-green-400 px-1 text-xs text-gray-700 font-medium">
                    To
                  </label>
                  <div className="flex items-center bg-white rounded border border-gray-300 px-3 py-3 h-12">
                    <MapPin className="w-4 h-4 text-gray-500 mr-2" />
                    <input
                      type="text"
                      value={toLocation}
                      onChange={(e) => setToLocation(e.target.value)}
                      className="flex-1 outline-none text-sm font-medium"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="absolute -top-2 left-3 bg-green-400 px-1 text-xs text-gray-700 font-medium">
                    Date
                  </label>
                  <div className="flex items-center bg-white rounded border border-gray-300 px-3 py-3 h-12">
                    <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-sm font-medium">{transferDate}</span>
                  </div>
                </div>

                <div className="relative">
                  <label className="absolute -top-2 left-3 bg-green-400 px-1 text-xs text-gray-700 font-medium">
                    Time
                  </label>
                  <div className="flex items-center bg-white rounded border border-gray-300 px-3 py-3 h-12">
                    <Clock className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-sm font-medium">{transferTime}</span>
                  </div>
                </div>

                <div className="relative">
                  <label className="absolute -top-2 left-3 bg-green-400 px-1 text-xs text-gray-700 font-medium">
                    Passengers
                  </label>
                  <div className="flex items-center bg-white rounded border border-gray-300 px-3 py-3 h-12">
                    <Users className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-sm font-medium">{passengers}</span>
                  </div>
                </div>
              </div>

              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 mt-4 font-medium">
                Search Transfers
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Airport Transfer Options
          </h1>
          <p className="text-gray-600">
            {transferOptions.length} options available
          </p>
        </div>

        {/* Transfer Options */}
        <div className="space-y-4">
          {transferOptions.map((transfer) => (
            <div
              key={transfer.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-24 h-16 rounded-lg overflow-hidden">
                    <img
                      src={transfer.image}
                      alt={transfer.vehicle}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        {transfer.type} - {transfer.vehicle}
                      </h3>
                      <Badge className="bg-blue-100 text-blue-800">
                        {transfer.type}
                      </Badge>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{transfer.capacity}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{transfer.duration}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span>{transfer.rating}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {transfer.features.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded"
                        >
                          {feature.includes("Driver") && (
                            <User className="w-3 h-3" />
                          )}
                          {feature.includes("WiFi") && (
                            <Wifi className="w-3 h-3" />
                          )}
                          {feature.includes("VIP") && (
                            <Shield className="w-3 h-3" />
                          )}
                          {feature.includes("Water") && <span>💧</span>}
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  {transfer.originalPrice > transfer.price && (
                    <p className="text-sm text-gray-500 line-through">
                      ₹{transfer.originalPrice}
                    </p>
                  )}
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{transfer.price}
                  </p>
                  <p className="text-xs text-gray-500 mb-3">per transfer</p>

                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="text-blue-600 border-blue-600 hover:bg-blue-50 w-full"
                    >
                      View Details
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full">
                      Book Transfer
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Why book with Faredown Transfers?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3">
              <Shield className="w-6 h-6 text-blue-600 mt-1" />
              <div>
                <h4 className="font-medium text-gray-900">Reliable Service</h4>
                <p className="text-sm text-gray-600">
                  Professional drivers and well-maintained vehicles
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Clock className="w-6 h-6 text-blue-600 mt-1" />
              <div>
                <h4 className="font-medium text-gray-900">On-Time Guarantee</h4>
                <p className="text-sm text-gray-600">
                  Flight monitoring and punctual pickup service
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Star className="w-6 h-6 text-blue-600 mt-1" />
              <div>
                <h4 className="font-medium text-gray-900">Best Prices</h4>
                <p className="text-sm text-gray-600">
                  Competitive rates with no hidden fees
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
