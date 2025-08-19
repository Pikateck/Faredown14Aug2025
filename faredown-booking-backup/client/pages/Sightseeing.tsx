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
  Star,
  Camera,
  User,
  LogOut,
  Heart,
  Gift,
  ChevronDown,
} from "lucide-react";

export default function Sightseeing() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [destination, setDestination] = useState("Mumbai");
  const [tourDate, setTourDate] = useState("Dec 15");
  const [travelers, setTravelers] = useState("2 travelers");

  const handleSignOut = () => {
    setIsLoggedIn(false);
    setUserName("");
  };

  const tourOptions = [
    {
      id: 1,
      title: "Mumbai City Full Day Tour",
      location: "Mumbai, Maharashtra",
      duration: "8 hours",
      price: 2500,
      originalPrice: 3200,
      rating: 4.7,
      reviews: 1245,
      image: "/api/placeholder/300/200",
      highlights: [
        "Gateway of India",
        "Marine Drive",
        "Dhobi Ghat",
        "Bollywood Film City",
      ],
      includes: ["Transport", "Professional Guide", "Entry Fees", "Lunch"],
      category: "Cultural",
    },
    {
      id: 2,
      title: "Elephanta Caves Half Day Trip",
      location: "Elephanta Island, Mumbai",
      duration: "4 hours",
      price: 1800,
      originalPrice: 2400,
      rating: 4.5,
      reviews: 867,
      image: "/api/placeholder/300/200",
      highlights: [
        "Ancient Rock Caves",
        "UNESCO World Heritage Site",
        "Ferry Ride",
        "Historical Sculptures",
      ],
      includes: ["Ferry Tickets", "Guide", "Entry Fees"],
      category: "Historical",
    },
    {
      id: 3,
      title: "Street Food Walking Tour",
      location: "Mumbai, Maharashtra",
      duration: "3 hours",
      price: 1200,
      originalPrice: 1500,
      rating: 4.8,
      reviews: 2156,
      image: "/api/placeholder/300/200",
      highlights: ["Vada Pav", "Pav Bhaji", "Kulfi", "Local Markets"],
      includes: ["Food Tastings", "Local Guide", "Market Access"],
      category: "Culinary",
    },
    {
      id: 4,
      title: "Sunset Sailing Experience",
      location: "Mumbai Harbor",
      duration: "2.5 hours",
      price: 3200,
      originalPrice: 4000,
      rating: 4.9,
      reviews: 654,
      image: "/api/placeholder/300/200",
      highlights: [
        "Sailing on Arabian Sea",
        "Sunset Views",
        "Mumbai Skyline",
        "Photography",
      ],
      includes: ["Boat Ride", "Refreshments", "Photography Guide"],
      category: "Adventure",
    },
  ];

  const categories = ["All", "Cultural", "Historical", "Culinary", "Adventure"];

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
            <div className="bg-purple-400 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Discover amazing tours and activities
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <label className="absolute -top-2 left-3 bg-purple-400 px-1 text-xs text-gray-700 font-medium">
                    Destination
                  </label>
                  <div className="flex items-center bg-white rounded border border-gray-300 px-3 py-3 h-12">
                    <MapPin className="w-4 h-4 text-gray-500 mr-2" />
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="flex-1 outline-none text-sm font-medium"
                      placeholder="Where do you want to explore?"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="absolute -top-2 left-3 bg-purple-400 px-1 text-xs text-gray-700 font-medium">
                    Date
                  </label>
                  <div className="flex items-center bg-white rounded border border-gray-300 px-3 py-3 h-12">
                    <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-sm font-medium">{tourDate}</span>
                  </div>
                </div>

                <div className="relative">
                  <label className="absolute -top-2 left-3 bg-purple-400 px-1 text-xs text-gray-700 font-medium">
                    Travelers
                  </label>
                  <div className="flex items-center bg-white rounded border border-gray-300 px-3 py-3 h-12">
                    <Users className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-sm font-medium">{travelers}</span>
                  </div>
                </div>
              </div>

              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 mt-4 font-medium">
                Search Tours
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Tours & Activities in {destination}
          </h1>
          <p className="text-gray-600">
            {tourOptions.length} experiences available
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex space-x-4 mb-8 overflow-x-auto">
          {categories.map((category) => (
            <Button
              key={category}
              variant={category === "All" ? "default" : "outline"}
              className={`whitespace-nowrap ${
                category === "All"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Tour Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {tourOptions.map((tour) => (
            <div
              key={tour.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative">
                <img
                  src={tour.image}
                  alt={tour.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-blue-600 text-white">
                    {tour.category}
                  </Badge>
                </div>
                <button className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:bg-gray-50">
                  <Heart className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {tour.title}
                    </h3>
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="text-sm">{tour.location}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{tour.duration}</span>
                      </div>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                        <span>
                          {tour.rating} ({tour.reviews} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Highlights:
                  </h4>
                  <div className="grid grid-cols-2 gap-1">
                    {tour.highlights.map((highlight, index) => (
                      <div
                        key={index}
                        className="flex items-center text-xs text-gray-600"
                      >
                        <span className="w-1 h-1 bg-blue-600 rounded-full mr-2"></span>
                        {highlight}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Includes:
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {tour.includes.map((item, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs bg-green-100 text-green-800"
                      >
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    {tour.originalPrice > tour.price && (
                      <p className="text-sm text-gray-500 line-through">
                        ₹{tour.originalPrice}
                      </p>
                    )}
                    <p className="text-xl font-bold text-gray-900">
                      ₹{tour.price}
                    </p>
                    <p className="text-xs text-gray-500">per person</p>
                  </div>

                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="text-blue-600 border-blue-600 hover:bg-blue-50 text-sm"
                    >
                      View Details
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full text-sm">
                      Book Tour
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-purple-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Why choose Faredown Sightseeing?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3">
              <Camera className="w-6 h-6 text-purple-600 mt-1" />
              <div>
                <h4 className="font-medium text-gray-900">Expert Guides</h4>
                <p className="text-sm text-gray-600">
                  Professional local guides with deep knowledge
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Gift className="w-6 h-6 text-purple-600 mt-1" />
              <div>
                <h4 className="font-medium text-gray-900">Best Value</h4>
                <p className="text-sm text-gray-600">
                  Competitive prices with no hidden fees
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Heart className="w-6 h-6 text-purple-600 mt-1" />
              <div>
                <h4 className="font-medium text-gray-900">
                  Memorable Experiences
                </h4>
                <p className="text-sm text-gray-600">
                  Carefully curated tours for unforgettable memories
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
