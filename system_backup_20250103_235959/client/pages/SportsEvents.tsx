import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  formatDateToDDMMMYYYY,
  formatDateToDisplayString,
} from "@/lib/dateUtils";
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
  User,
  LogOut,
  Heart,
  Trophy,
  Music,
  Ticket,
  ChevronDown,
} from "lucide-react";

export default function SportsEvents() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [location, setLocation] = useState("Mumbai");
  const [eventDate, setEventDate] = useState("Dec 15");
  const [eventType, setEventType] = useState("All Events");

  const handleSignOut = () => {
    setIsLoggedIn(false);
    setUserName("");
  };

  const eventOptions = [
    {
      id: 1,
      title: "IPL Cricket Match - Mumbai Indians vs Chennai",
      venue: "Wankhede Stadium, Mumbai",
      date: "20-Dec-2024",
      time: "19:30",
      price: 1500,
      originalPrice: 2000,
      rating: 4.8,
      attendees: "45,000 capacity",
      image: "/api/placeholder/300/200",
      category: "Sports",
      type: "Cricket",
      duration: "4 hours",
      highlights: ["T20 Match", "Star Players", "Live Commentary"],
    },
    {
      id: 2,
      title: "Sunburn Music Festival",
      venue: "D.Y. Patil Stadium, Mumbai",
      date: "25-Dec-2024 to 27-Dec-2024",
      time: "18:00",
      price: 3500,
      originalPrice: 4500,
      rating: 4.9,
      attendees: "50,000+ expected",
      image: "/api/placeholder/300/200",
      category: "Music",
      type: "Festival",
      duration: "3 days",
      highlights: ["International DJs", "Multiple Stages", "Food Courts"],
    },
    {
      id: 3,
      title: "Mumbai Marathon",
      venue: "Starting from Chhatrapati Shivaji Terminus",
      date: "15-Jan-2025",
      time: "05:30",
      price: 800,
      originalPrice: 1200,
      rating: 4.6,
      attendees: "25,000 runners",
      image: "/api/placeholder/300/200",
      category: "Sports",
      type: "Marathon",
      duration: "6 hours",
      highlights: ["42.2 KM Race", "Medal & Certificate", "Refreshments"],
    },
    {
      id: 4,
      title: "Stand-up Comedy Night",
      venue: "NCPA, Mumbai",
      date: "18-Dec-2024",
      time: "20:00",
      price: 1200,
      originalPrice: 1500,
      rating: 4.7,
      attendees: "500 seats",
      image: "/api/placeholder/300/200",
      category: "Entertainment",
      type: "Comedy",
      duration: "2 hours",
      highlights: ["Famous Comedians", "Live Performance", "VIP Seating"],
    },
    {
      id: 5,
      title: "Classical Music Concert",
      venue: "Tata Theatre, Mumbai",
      date: "22-Dec-2024",
      time: "19:00",
      price: 2000,
      originalPrice: 2500,
      rating: 4.9,
      attendees: "1,200 capacity",
      image: "/api/placeholder/300/200",
      category: "Music",
      type: "Classical",
      duration: "3 hours",
      highlights: ["Renowned Artists", "Traditional Music", "Premium Venue"],
    },
    {
      id: 6,
      title: "Food & Wine Festival",
      venue: "Mahalaxmi Racecourse, Mumbai",
      date: "28-Dec-2024 to 30-Dec-2024",
      time: "12:00",
      price: 2500,
      originalPrice: 3200,
      rating: 4.5,
      attendees: "Open for all",
      image: "/api/placeholder/300/200",
      category: "Food",
      type: "Festival",
      duration: "3 days",
      highlights: ["Celebrity Chefs", "Wine Tasting", "Live Cooking"],
    },
  ];

  const categories = ["All Events", "Sports", "Music", "Entertainment", "Food"];

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
            <div className="bg-orange-400 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Book tickets for sports and entertainment events
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <label className="absolute -top-2 left-3 bg-orange-400 px-1 text-xs text-gray-700 font-medium">
                    Location
                  </label>
                  <div className="flex items-center bg-white rounded border border-gray-300 px-3 py-3 h-12">
                    <MapPin className="w-4 h-4 text-gray-500 mr-2" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="flex-1 outline-none text-sm font-medium"
                      placeholder="Which city?"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="absolute -top-2 left-3 bg-orange-400 px-1 text-xs text-gray-700 font-medium">
                    Date
                  </label>
                  <div className="flex items-center bg-white rounded border border-gray-300 px-3 py-3 h-12">
                    <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-sm font-medium">{eventDate}</span>
                  </div>
                </div>

                <div className="relative">
                  <label className="absolute -top-2 left-3 bg-orange-400 px-1 text-xs text-gray-700 font-medium">
                    Event Type
                  </label>
                  <div className="flex items-center bg-white rounded border border-gray-300 px-3 py-3 h-12">
                    <Ticket className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-sm font-medium">{eventType}</span>
                  </div>
                </div>
              </div>

              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 mt-4 font-medium">
                Search Events
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Sports & Events in {location}
          </h1>
          <p className="text-gray-600">
            {eventOptions.length} events available
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex space-x-4 mb-8 overflow-x-auto">
          {categories.map((category) => (
            <Button
              key={category}
              variant={category === "All Events" ? "default" : "outline"}
              className={`whitespace-nowrap ${
                category === "All Events"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Event Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {eventOptions.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-orange-600 text-white">
                    {event.category}
                  </Badge>
                </div>
                <button className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:bg-gray-50">
                  <Heart className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              <div className="p-6">
                <div className="mb-3">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {event.title}
                  </h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{event.venue}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>
                        {event.time} • {event.duration}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      <span>{event.attendees}</span>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Highlights:
                  </h4>
                  <div className="space-y-1">
                    {event.highlights.map((highlight, index) => (
                      <div
                        key={index}
                        className="flex items-center text-xs text-gray-600"
                      >
                        <span className="w-1 h-1 bg-orange-600 rounded-full mr-2"></span>
                        {highlight}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    {event.originalPrice > event.price && (
                      <p className="text-sm text-gray-500 line-through">
                        ₹{event.originalPrice}
                      </p>
                    )}
                    <p className="text-xl font-bold text-gray-900">
                      ₹{event.price}
                    </p>
                    <p className="text-xs text-gray-500">per ticket</p>
                  </div>

                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="text-blue-600 border-blue-600 hover:bg-blue-50 text-sm"
                    >
                      View Details
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full text-sm">
                      Book Tickets
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-orange-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Why book with Faredown Events?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3">
              <Trophy className="w-6 h-6 text-orange-600 mt-1" />
              <div>
                <h4 className="font-medium text-gray-900">Premium Events</h4>
                <p className="text-sm text-gray-600">
                  Access to exclusive sports and entertainment events
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Ticket className="w-6 h-6 text-orange-600 mt-1" />
              <div>
                <h4 className="font-medium text-gray-900">Secure Booking</h4>
                <p className="text-sm text-gray-600">
                  Guaranteed authentic tickets with secure payment
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Music className="w-6 h-6 text-orange-600 mt-1" />
              <div>
                <h4 className="font-medium text-gray-900">Best Experience</h4>
                <p className="text-sm text-gray-600">
                  Premium seating options and VIP packages available
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
