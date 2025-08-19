import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import MobileLayout from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Filter,
  SlidersHorizontal,
  Plane,
  Clock,
  Zap,
  Star,
  Wifi,
  Utensils,
  Luggage,
  ChevronDown,
  ChevronUp,
  MapPin,
  Calendar,
  Users,
  ArrowUpDown,
} from "lucide-react";

const MobileSearch: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [expandedFlight, setExpandedFlight] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState("price");

  const [searchData, setSearchData] = useState({
    from: searchParams.get("from") || "Mumbai (BOM)",
    to: searchParams.get("to") || "Dubai (DXB)",
    date: searchParams.get("date") || "2024-08-16",
    passengers: Number(searchParams.get("passengers")) || 1,
  });

  const flights = [
    {
      id: 1,
      airline: "Emirates",
      logo: "🇦🇪",
      flightNumber: "EK 508",
      departure: "10:15",
      arrival: "11:45",
      duration: "2h 25m",
      price: 18500,
      originalPrice: 25000,
      savings: 6500,
      stops: "Direct",
      aircraft: "Boeing 777",
      features: ["WiFi", "Meals", "Entertainment"],
      rating: 4.8,
      class: "Economy",
      baggage: "23kg",
    },
    {
      id: 2,
      airline: "Air India",
      logo: "🇮🇳",
      flightNumber: "AI 131",
      departure: "14:30",
      arrival: "16:00",
      duration: "2h 30m",
      price: 16800,
      originalPrice: 22000,
      savings: 5200,
      stops: "Direct",
      aircraft: "Airbus A320",
      features: ["Meals", "Entertainment"],
      rating: 4.2,
      class: "Economy",
      baggage: "20kg",
    },
    {
      id: 3,
      airline: "Fly Dubai",
      logo: "🇦🇪",
      flightNumber: "FZ 2413",
      departure: "19:45",
      arrival: "21:20",
      duration: "2h 35m",
      price: 15200,
      originalPrice: 19500,
      savings: 4300,
      stops: "Direct",
      aircraft: "Boeing 737",
      features: ["WiFi", "Snacks"],
      rating: 4.5,
      class: "Economy",
      baggage: "20kg",
    },
  ];

  const filters = {
    airlines: ["Emirates", "Air India", "Fly Dubai", "SpiceJet"],
    departure: ["Morning (6-12)", "Afternoon (12-18)", "Evening (18-24)"],
    stops: ["Direct", "1 Stop", "2+ Stops"],
    price: { min: 10000, max: 50000 },
  };

  const handleFlightSelect = (flight: any) => {
    navigate("/mobile-booking", { state: { flight, searchData } });
  };

  const handleBargain = (flight: any) => {
    // Mobile bargaining modal would open here
    navigate("/mobile-bargain", { state: { flight, searchData } });
  };

  return (
    <MobileLayout
      showBack={true}
      onBack={() => navigate("/")}
      title="Flight Search"
    >
      <div className="space-y-4">
        {/* Search Summary */}
        <div className="bg-white p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="font-medium text-sm">{searchData.from}</span>
            </div>
            <ArrowUpDown className="w-4 h-4 text-gray-400" />
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <span className="font-medium text-sm">{searchData.to}</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{searchData.date}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>
                {searchData.passengers}{" "}
                {searchData.passengers === 1 ? "Passenger" : "Passengers"}
              </span>
            </div>
          </div>
        </div>

        {/* Filters and Sort */}
        <div className="flex items-center justify-between px-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </Button>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-2 py-1"
            >
              <option value="price">Price</option>
              <option value="duration">Duration</option>
              <option value="departure">Departure</option>
              <option value="rating">Rating</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="px-4">
          <p className="text-sm text-gray-600">
            Found {flights.length} flights • Best prices with bargaining
          </p>
        </div>

        {/* Flight Results */}
        <div className="px-4 space-y-3">
          {flights.map((flight) => (
            <Card
              key={flight.id}
              className="overflow-hidden hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-4">
                {/* Flight Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-lg">
                      {flight.logo}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">
                        {flight.airline}
                      </div>
                      <div className="text-xs text-gray-500">
                        {flight.flightNumber} • {flight.aircraft}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <span className="text-xs text-gray-600">
                      {flight.rating}
                    </span>
                  </div>
                </div>

                {/* Flight Times */}
                <div className="flex items-center justify-between mb-3">
                  <div className="text-center">
                    <div className="text-lg font-bold">{flight.departure}</div>
                    <div className="text-xs text-gray-500">BOM</div>
                  </div>
                  <div className="flex-1 px-4">
                    <div className="flex items-center justify-center">
                      <div className="flex-1 border-t border-gray-300"></div>
                      <div className="px-2">
                        <Plane className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="flex-1 border-t border-gray-300"></div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mt-1">
                        {flight.duration}
                      </div>
                      <div className="text-xs font-medium text-green-600">
                        {flight.stops}
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold">{flight.arrival}</div>
                    <div className="text-xs text-gray-500">DXB</div>
                  </div>
                </div>

                {/* Price and Actions */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-green-600">
                        ₹{flight.price.toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-500 line-through">
                        ₹{flight.originalPrice.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-xs text-green-600">
                      You saved ₹{flight.savings.toLocaleString()}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBargain(flight)}
                      className="text-orange-600 border-orange-600 hover:bg-orange-50"
                    >
                      <Zap className="w-3 h-3 mr-1" />
                      Bargain
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleFlightSelect(flight)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Book
                    </Button>
                  </div>
                </div>

                {/* Expandable Details */}
                {expandedFlight === flight.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                    {/* Included Services */}
                    <div>
                      <h4 className="text-sm font-semibold mb-2">
                        Included Services
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">
                          <Luggage className="w-3 h-3 mr-1" />
                          {flight.baggage} Baggage
                        </Badge>
                        {flight.features.includes("WiFi") && (
                          <Badge variant="outline" className="text-xs">
                            <Wifi className="w-3 h-3 mr-1" />
                            WiFi
                          </Badge>
                        )}
                        {flight.features.includes("Meals") && (
                          <Badge variant="outline" className="text-xs">
                            <Utensils className="w-3 h-3 mr-1" />
                            Meals
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Fare Options */}
                    <div>
                      <h4 className="text-sm font-semibold mb-2">
                        Fare Options
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <div>
                            <div className="text-sm font-medium">Eco Saver</div>
                            <div className="text-xs text-gray-500">
                              Basic fare with essentials
                            </div>
                          </div>
                          <div className="text-sm font-bold">
                            ₹{flight.price.toLocaleString()}
                          </div>
                        </div>
                        <div className="flex justify-between items-center p-2 border border-gray-200 rounded">
                          <div>
                            <div className="text-sm font-medium">Eco Flex</div>
                            <div className="text-xs text-gray-500">
                              Free changes + extra baggage
                            </div>
                          </div>
                          <div className="text-sm font-bold">
                            ₹{(flight.price + 2500).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Expand/Collapse Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setExpandedFlight(
                      expandedFlight === flight.id ? null : flight.id,
                    )
                  }
                  className="w-full mt-3 text-blue-600"
                >
                  {expandedFlight === flight.id ? (
                    <>
                      <ChevronUp className="w-4 h-4 mr-1" />
                      Less Details
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 mr-1" />
                      More Details
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="fixed inset-0 bg-white z-50">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Filters</h2>
                <Button
                  variant="ghost"
                  onClick={() => setShowFilters(false)}
                  size="sm"
                >
                  Done
                </Button>
              </div>
            </div>
            <div className="p-4 space-y-6">
              {/* Price Range */}
              <div>
                <h3 className="font-semibold mb-3">Price Range</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>₹{filters.price.min.toLocaleString()}</span>
                    <span>₹{filters.price.max.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min={filters.price.min}
                    max={filters.price.max}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Airlines */}
              <div>
                <h3 className="font-semibold mb-3">Airlines</h3>
                <div className="space-y-2">
                  {filters.airlines.map((airline) => (
                    <label
                      key={airline}
                      className="flex items-center space-x-2"
                    >
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">{airline}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Departure Time */}
              <div>
                <h3 className="font-semibold mb-3">Departure Time</h3>
                <div className="space-y-2">
                  {filters.departure.map((time) => (
                    <label key={time} className="flex items-center space-x-2">
                      <input type="checkbox" />
                      <span className="text-sm">{time}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Stops */}
              <div>
                <h3 className="font-semibold mb-3">Stops</h3>
                <div className="space-y-2">
                  {filters.stops.map((stop) => (
                    <label key={stop} className="flex items-center space-x-2">
                      <input type="checkbox" />
                      <span className="text-sm">{stop}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default MobileSearch;
