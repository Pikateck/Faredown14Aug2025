import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Filter,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Clock,
  Plane,
  Star,
  Zap,
} from "lucide-react";

const MobileSearch = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchData = location.state?.searchData;
  const bargainEnabled = location.state?.bargainEnabled;

  const [showFilters, setShowFilters] = useState(false);
  const [expandedFilter, setExpandedFilter] = useState(null);
  const [sortBy, setSortBy] = useState("price");
  const [showBargainModal, setShowBargainModal] = useState(false);
  const [bargainTimer, setBargainTimer] = useState(30);
  const [filters, setFilters] = useState({
    priceRange: [0, 50000],
    airlines: [],
    departure: { min: 0, max: 24 },
    arrival: { min: 0, max: 24 },
    stops: "any",
    duration: [0, 12],
  });

  // Mock flight data
  const [flights] = useState([
    {
      id: 1,
      airline: "Indigo",
      logo: "🛩️",
      from: "BOM",
      to: "DXB",
      departure: "06:30",
      arrival: "08:45",
      duration: "3h 15m",
      stops: "Non-stop",
      price: 25890,
      originalPrice: 32168,
      savings: 6278,
      class: "Economy",
      baggage: "7kg + 15kg",
      rating: 4.2,
      bargainAvailable: true,
    },
    {
      id: 2,
      airline: "Emirates",
      logo: "✈️",
      from: "BOM",
      to: "DXB",
      departure: "14:20",
      arrival: "16:35",
      duration: "3h 15m",
      stops: "Non-stop",
      price: 28900,
      originalPrice: 35000,
      savings: 6100,
      class: "Economy",
      baggage: "7kg + 20kg",
      rating: 4.5,
      bargainAvailable: true,
    },
    {
      id: 3,
      airline: "Air India",
      logo: "🇮🇳",
      from: "BOM",
      to: "DXB",
      departure: "22:10",
      arrival: "00:25+1",
      duration: "3h 15m",
      stops: "Non-stop",
      price: 24500,
      originalPrice: 29000,
      savings: 4500,
      class: "Economy",
      baggage: "7kg + 15kg",
      rating: 4.0,
      bargainAvailable: false,
    },
  ]);

  useEffect(() => {
    if (bargainEnabled) {
      setShowBargainModal(true);
      const timer = setInterval(() => {
        setBargainTimer((prev) => {
          if (prev <= 1) {
            setShowBargainModal(false);
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [bargainEnabled]);

  const toggleFilter = (filterName) => {
    setExpandedFilter(expandedFilter === filterName ? null : filterName);
  };

  const handleFlightSelect = (flight) => {
    navigate("/mobile-booking", {
      state: {
        selectedFlight: flight,
        searchData,
      },
    });
  };

  const handleBargain = (flight) => {
    // Implement bargain logic
    setShowBargainModal(true);
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const formatTime = (time) => {
    return time;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-white shadow-sm px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-lg hover:bg-gray-100"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>

        <div className="flex-1 text-center">
          <div className="font-semibold text-gray-800">
            {searchData?.from} → {searchData?.to}
          </div>
          <div className="text-xs text-gray-500">
            {searchData?.departure} • {flights.length} flights
          </div>
        </div>

        <button
          onClick={() => setShowFilters(true)}
          className="p-2 rounded-lg hover:bg-gray-100 relative"
        >
          <Filter className="w-6 h-6 text-gray-700" />
        </button>
      </div>

      {/* Sort Bar */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex space-x-2 overflow-x-auto">
          {[
            { key: "price", label: "Cheapest" },
            { key: "duration", label: "Fastest" },
            { key: "departure", label: "Departure" },
            { key: "rating", label: "Best" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSortBy(key)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                sortBy === key
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Flight Results */}
      <div className="p-4 space-y-4">
        {flights.map((flight) => (
          <div
            key={flight.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          >
            {/* Flight Header */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{flight.logo}</div>
                  <div>
                    <div className="font-semibold text-gray-800">
                      {flight.airline}
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>{flight.class}</span>
                      <span>•</span>
                      <div className="flex items-center">
                        <Star className="w-3 h-3 text-yellow-400 mr-1" />
                        {flight.rating}
                      </div>
                    </div>
                  </div>
                </div>
                {flight.bargainAvailable && (
                  <div className="bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                    <Zap className="w-3 h-3 inline mr-1" />
                    Bargain
                  </div>
                )}
              </div>

              {/* Flight Times */}
              <div className="flex items-center justify-between mb-3">
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-800">
                    {flight.departure}
                  </div>
                  <div className="text-sm text-gray-500">{flight.from}</div>
                </div>

                <div className="flex-1 mx-4">
                  <div className="relative">
                    <div className="h-px bg-gray-300 w-full"></div>
                    <Plane className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 bg-white" />
                  </div>
                  <div className="text-center text-xs text-gray-500 mt-1">
                    {flight.duration} • {flight.stops}
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-xl font-bold text-gray-800">
                    {flight.arrival}
                  </div>
                  <div className="text-sm text-gray-500">{flight.to}</div>
                </div>
              </div>

              {/* Baggage */}
              <div className="text-xs text-gray-500 mb-3">
                🎒 {flight.baggage}
              </div>
            </div>

            {/* Price and Actions */}
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-gray-800">
                      {formatCurrency(flight.price)}
                    </span>
                    {flight.originalPrice > flight.price && (
                      <span className="text-sm text-gray-500 line-through">
                        {formatCurrency(flight.originalPrice)}
                      </span>
                    )}
                  </div>
                  {flight.savings > 0 && (
                    <div className="text-sm text-green-600 font-medium">
                      You save {formatCurrency(flight.savings)}
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  {flight.bargainAvailable && (
                    <button
                      onClick={() => handleBargain(flight)}
                      className="bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:shadow-lg transition-all"
                    >
                      Bargain
                    </button>
                  )}
                  <button
                    onClick={() => handleFlightSelect(flight)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium text-sm hover:shadow-lg transition-all"
                  >
                    Select
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Modal */}
      {showFilters && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col">
          {/* Filter Header */}
          <div className="bg-white shadow-sm px-4 py-3 flex items-center justify-between border-b">
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-600 hover:text-gray-800"
            >
              ✕
            </button>
            <h2 className="font-semibold text-lg">Filters</h2>
            <button className="text-blue-600 font-medium text-sm">
              Reset All
            </button>
          </div>

          {/* Filter Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Price Range */}
            <div className="border-b">
              <button
                onClick={() => toggleFilter("price")}
                className="w-full px-4 py-4 flex items-center justify-between"
              >
                <span className="font-medium">Price Range</span>
                {expandedFilter === "price" ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>
              {expandedFilter === "price" && (
                <div className="px-4 pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-600">₹0</span>
                    <span className="text-sm text-gray-600">₹50,000+</span>
                  </div>
                  <input type="range" min="0" max="50000" className="w-full" />
                </div>
              )}
            </div>

            {/* Airlines */}
            <div className="border-b">
              <button
                onClick={() => toggleFilter("airlines")}
                className="w-full px-4 py-4 flex items-center justify-between"
              >
                <span className="font-medium">Airlines</span>
                {expandedFilter === "airlines" ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>
              {expandedFilter === "airlines" && (
                <div className="px-4 pb-4 space-y-3">
                  {["Indigo", "Emirates", "Air India", "SpiceJet"].map(
                    (airline) => (
                      <label
                        key={airline}
                        className="flex items-center space-x-3"
                      >
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">{airline}</span>
                      </label>
                    ),
                  )}
                </div>
              )}
            </div>

            {/* Departure Time */}
            <div className="border-b">
              <button
                onClick={() => toggleFilter("departure")}
                className="w-full px-4 py-4 flex items-center justify-between"
              >
                <span className="font-medium">Departure Time</span>
                {expandedFilter === "departure" ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>
              {expandedFilter === "departure" && (
                <div className="px-4 pb-4 space-y-3">
                  {[
                    { label: "Early Morning", time: "6AM - 12PM", icon: "🌅" },
                    { label: "Afternoon", time: "12PM - 6PM", icon: "☀️" },
                    { label: "Evening", time: "6PM - 12AM", icon: "🌆" },
                    { label: "Night", time: "12AM - 6AM", icon: "🌙" },
                  ].map((slot) => (
                    <label
                      key={slot.label}
                      className="flex items-center space-x-3"
                    >
                      <input type="checkbox" className="rounded" />
                      <span className="text-xl">{slot.icon}</span>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{slot.label}</div>
                        <div className="text-xs text-gray-500">{slot.time}</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Stops */}
            <div className="border-b">
              <button
                onClick={() => toggleFilter("stops")}
                className="w-full px-4 py-4 flex items-center justify-between"
              >
                <span className="font-medium">Stops</span>
                {expandedFilter === "stops" ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>
              {expandedFilter === "stops" && (
                <div className="px-4 pb-4 space-y-3">
                  {["Non-stop", "1 Stop", "2+ Stops"].map((stopType) => (
                    <label
                      key={stopType}
                      className="flex items-center space-x-3"
                    >
                      <input type="radio" name="stops" className="rounded" />
                      <span className="text-sm">{stopType}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Apply Filters Button */}
          <div className="p-4 border-t bg-white">
            <button
              onClick={() => setShowFilters(false)}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Bargain Modal */}
      {showBargainModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm text-center">
            <div className="text-4xl mb-4">🔥</div>
            <h3 className="text-xl font-bold mb-2">Special Bargain Offer!</h3>
            <p className="text-gray-600 mb-4">
              Limited time offer expires in {bargainTimer} seconds
            </p>
            <div className="bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white p-4 rounded-lg mb-4">
              <div className="text-2xl font-bold">₹2,500 OFF</div>
              <div className="text-sm">on your booking</div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowBargainModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg"
              >
                Maybe Later
              </button>
              <button
                onClick={() => setShowBargainModal(false)}
                className="flex-1 bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white py-3 rounded-lg font-semibold"
              >
                Accept Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileSearch;
