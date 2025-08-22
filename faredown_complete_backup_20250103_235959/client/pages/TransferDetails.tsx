import React, { useState, useEffect } from "react";
import {
  useParams,
  useNavigate,
  Link,
  useSearchParams,
} from "react-router-dom";
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
  Clock,
  Users,
  Car,
  Star,
  User,
  LogOut,
  Shield,
  Wifi,
  ChevronDown,
} from "lucide-react";

export default function TransferDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");

  // Extract parameters from URL
  const price = searchParams.get("price") || "1200";
  const fromLocation = searchParams.get("from") || "Mumbai Airport (BOM)";
  const toLocation = searchParams.get("to") || "Hotel Taj Mahal Palace";
  const vehicleName = searchParams.get("vehicle") || "Sedan - Economy";
  const pickupDate =
    searchParams.get("pickupDate") || new Date().toISOString().split("T")[0];
  const pickupTime = searchParams.get("pickupTime") || "10:00";
  const returnDate = searchParams.get("returnDate");
  const returnTime = searchParams.get("returnTime") || "14:00";
  const adults = searchParams.get("adults") || "2";
  const children = searchParams.get("children") || "0";
  const infants = searchParams.get("infants") || "0";
  const tripType = searchParams.get("tripType") || "one-way";
  const isRoundTrip = tripType === "return" && returnDate;

  const handleSignOut = () => {
    setIsLoggedIn(false);
    setUserName("");
  };

  // Transfer data based on URL parameters
  const transfer = {
    id: id || "1",
    type: "Economy",
    vehicle: "Sedan",
    vehicleName: vehicleName,
    capacity: "Up to 3 passengers",
    duration: "45 minutes",
    price: parseInt(price),
    originalPrice: parseInt(price) + 300,
    rating: 4.3,
    features: ["Professional Driver", "Meet & Greet", "Free Waiting"],
    image: "/api/placeholder/120/80",
    from: fromLocation,
    to: toLocation,
    description: `Experience comfortable and reliable transport with our ${vehicleName}. Professional service with meet & greet, professional driver, free waiting.`,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Same as original Transfers page */}
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
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {transfer.vehicleName}
            </h1>
            <p className="text-gray-600 flex items-center space-x-2 mt-1">
              <MapPin className="w-4 h-4" />
              <span>
                {transfer.from} → {transfer.to}
              </span>
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate("/transfer-results")}
            className="text-blue-600 border-blue-600 hover:bg-blue-50"
          >
            ← Back to Results
          </Button>
        </div>

        {/* Transfer Details Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-32 h-20 rounded-lg overflow-hidden">
                <img
                  src={transfer.image}
                  alt={transfer.vehicle}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-xl font-bold text-gray-900">
                    {transfer.vehicleName}
                  </h3>
                  <Badge className="bg-blue-100 text-blue-800">
                    {transfer.type}
                  </Badge>
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
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
                      {feature.includes("WiFi") && <Wifi className="w-3 h-3" />}
                      {feature.includes("VIP") && (
                        <Shield className="w-3 h-3" />
                      )}
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-right">
              {transfer.originalPrice > transfer.price && (
                <p className="text-lg text-gray-500 line-through">
                  ₹{transfer.originalPrice}
                </p>
              )}
              <p className="text-3xl font-bold text-gray-900">
                ₹{transfer.price}
              </p>
              <p className="text-sm text-gray-500 mb-4">per transfer</p>

              <div className="space-y-2">
                <Button
                  onClick={() => {
                    const bookingParams = new URLSearchParams({
                      transferId: id || "hotelbeds_1",
                      rateKey: "sample_rate_1",
                      pickupLocation: transfer.from,
                      dropoffLocation: transfer.to,
                      pickupDate: new Date().toISOString().split("T")[0],
                      pickupTime: "10:00",
                      adults: "2",
                      children: "0",
                      infants: "0",
                      price: transfer.price.toString(),
                      vehicleName: transfer.vehicleName,
                    });
                    navigate(`/transfer-booking?${bookingParams.toString()}`);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white w-full px-6 py-3"
                >
                  Book This Transfer
                </Button>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">
              Description
            </h4>
            <p className="text-gray-600">{transfer.description}</p>
          </div>

          {/* Route Information */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">
              Route Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Pickup</p>
                <p className="text-gray-600">{transfer.from}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Drop-off</p>
                <p className="text-gray-600">{transfer.to}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Pickup Date & Time
                </p>
                <p className="text-gray-600">
                  {new Date(pickupDate).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  at {pickupTime}
                </p>
              </div>
              {isRoundTrip && returnDate && (
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Return Date & Time
                  </p>
                  <p className="text-gray-600">
                    {new Date(returnDate).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    at {returnTime}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-700">Passengers</p>
                <p className="text-gray-600">
                  {adults} Adult{parseInt(adults) > 1 ? "s" : ""}
                  {parseInt(children) > 0 &&
                    `, ${children} Child${parseInt(children) > 1 ? "ren" : ""}`}
                  {parseInt(infants) > 0 &&
                    `, ${infants} Infant${parseInt(infants) > 1 ? "s" : ""}`}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Distance</p>
                <p className="text-gray-600">
                  33 km • Duration: {transfer.duration}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
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
