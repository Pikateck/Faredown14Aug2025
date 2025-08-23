import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BookingSearchForm } from "@/components/BookingSearchForm";
import {
  ArrowLeft,
  Filter,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Star,
  Wifi,
  Car,
  Coffee,
  Dumbbell,
  Heart,
  Share,
  MapPin,
  Users,
  Calendar,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const MobileHotelResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [expandedFilter, setExpandedFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("recommended");
  const [expandedHotel, setExpandedHotel] = useState<string | null>(null);
  const [showBargainDrawer, setShowBargainDrawer] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<any>(null);

  // Mock hotel data (would come from search results)
  const [hotels] = useState([
    {
      id: "1",
      name: "Burj Al Arab Jumeirah",
      rating: 5,
      reviewScore: 9.2,
      reviewCount: 1543,
      location: "Jumeirah Beach",
      distance: "2.1 km from city center",
      price: 45000,
      originalPrice: 55000,
      currency: "INR",
      images: ["hotel1.jpg"],
      amenities: ["wifi", "parking", "pool", "gym", "spa"],
      description: "Iconic sail-shaped luxury hotel with world-class amenities",
      rooms: [
        { type: "Deluxe Room", price: 45000, available: 3 },
        { type: "Suite", price: 75000, available: 2 },
        { type: "Presidential Suite", price: 150000, available: 1 },
      ],
      isBargainAvailable: true,
      bargainDiscount: 15,
    },
    {
      id: "2",
      name: "Atlantis, The Palm",
      rating: 5,
      reviewScore: 8.8,
      reviewCount: 2156,
      location: "Palm Jumeirah",
      distance: "5.2 km from city center",
      price: 32000,
      originalPrice: 38000,
      currency: "INR",
      images: ["hotel2.jpg"],
      amenities: ["wifi", "parking", "pool", "restaurant"],
      description: "Luxury resort with underwater suites and aquarium",
      rooms: [
        { type: "Ocean Room", price: 32000, available: 5 },
        { type: "Neptune Suite", price: 65000, available: 2 },
      ],
      isBargainAvailable: true,
      bargainDiscount: 20,
    },
    {
      id: "3",
      name: "Four Seasons Resort Dubai",
      rating: 5,
      reviewScore: 9.0,
      reviewCount: 987,
      location: "Jumeirah Beach Road",
      distance: "1.8 km from city center",
      price: 28000,
      originalPrice: 33000,
      currency: "INR",
      images: ["hotel3.jpg"],
      amenities: ["wifi", "parking", "pool", "gym", "spa", "restaurant"],
      description: "Beachfront luxury with stunning views and premium service",
      rooms: [
        { type: "Premium Room", price: 28000, available: 4 },
        { type: "Royal Suite", price: 85000, available: 1 },
      ],
      isBargainAvailable: false,
      bargainDiscount: 0,
    },
  ]);

  const amenityIcons = {
    wifi: <Wifi className="w-4 h-4" />,
    parking: <Car className="w-4 h-4" />,
    pool: <span className="text-sm">🏊</span>,
    gym: <Dumbbell className="w-4 h-4" />,
    spa: <span className="text-sm">🧘</span>,
    restaurant: <Coffee className="w-4 h-4" />,
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const toggleFilter = (filterName: string) => {
    setExpandedFilter(expandedFilter === filterName ? null : filterName);
  };

  const handleBargainClick = (hotel: any) => {
    setSelectedHotel(hotel);
    setShowBargainDrawer(true);
  };

  const toggleHotelDetails = (hotelId: string) => {
    setExpandedHotel(expandedHotel === hotelId ? null : hotelId);
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
          <div className="font-semibold text-gray-800">Dubai Hotels</div>
          <div className="text-xs text-gray-500">
            Jan 15-18 • 2 guests • {hotels.length} properties
          </div>
        </div>

        <button
          onClick={() => setShowFilters(true)}
          className="p-2 rounded-lg hover:bg-gray-100 relative"
        >
          <Filter className="w-6 h-6 text-gray-700" />
        </button>
      </div>

      {/* Condensed Search Bar */}
      <div className="bg-white border-b px-4 py-2">
        <div className="flex items-center space-x-2 text-sm">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">Dubai</span>
          <span className="text-gray-400">•</span>
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">Jan 15-18</span>
          <span className="text-gray-400">•</span>
          <Users className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">2 guests</span>
          <button className="ml-auto text-blue-600 text-sm font-medium">
            Edit
          </button>
        </div>
      </div>

      {/* Sort Bar */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex space-x-2 overflow-x-auto">
          {[
            { key: "recommended", label: "Recommended" },
            { key: "price_low", label: "Price: Low to High" },
            { key: "price_high", label: "Price: High to Low" },
            { key: "rating", label: "Guest Rating" },
            { key: "distance", label: "Distance" },
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

      {/* Hotel Results */}
      <div className="p-4 space-y-4">
        {hotels.map((hotel) => (
          <div
            key={hotel.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          >
            {/* Hotel Image */}
            <div className="aspect-video bg-gradient-to-br from-blue-400 to-purple-500 relative">
              <div className="absolute inset-0 flex items-center justify-center text-6xl">
                🏨
              </div>
              <div className="absolute top-3 right-3 flex space-x-2">
                <button className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center">
                  <Heart className="w-4 h-4 text-gray-600" />
                </button>
                <button className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center">
                  <Share className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              {hotel.isBargainAvailable && (
                <div className="absolute top-3 left-3 bg-fuchsia-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                  🔥 {hotel.bargainDiscount}% OFF
                </div>
              )}
            </div>

            {/* Hotel Info */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 text-lg leading-tight">
                    {hotel.name}
                  </h3>
                  <div className="flex items-center mt-1">
                    {[...Array(hotel.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className="flex items-center space-x-1">
                    <span className="text-lg font-bold text-blue-600">
                      {hotel.reviewScore}
                    </span>
                    <div className="text-xs text-gray-500">
                      <div>Excellent</div>
                      <div>{hotel.reviewCount} reviews</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-600 mb-3">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {hotel.location} • {hotel.distance}
                </div>
              </div>

              {/* Amenities */}
              <div className="flex items-center space-x-3 mb-4">
                {hotel.amenities.slice(0, 4).map((amenity, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-1 text-gray-500"
                  >
                    {amenityIcons[amenity]}
                    <span className="text-xs capitalize">{amenity}</span>
                  </div>
                ))}
                {hotel.amenities.length > 4 && (
                  <span className="text-xs text-blue-600">
                    +{hotel.amenities.length - 4} more
                  </span>
                )}
              </div>

              {/* Price and Actions */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-gray-800">
                      {formatCurrency(hotel.price)}
                    </span>
                    {hotel.originalPrice > hotel.price && (
                      <span className="text-sm text-gray-500 line-through">
                        {formatCurrency(hotel.originalPrice)}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">per night</div>
                  {hotel.originalPrice > hotel.price && (
                    <div className="text-sm text-green-600 font-medium">
                      You save{" "}
                      {formatCurrency(hotel.originalPrice - hotel.price)}
                    </div>
                  )}
                </div>

                <div className="flex flex-col space-y-2">
                  {hotel.isBargainAvailable && (
                    <button
                      onClick={() => handleBargainClick(hotel)}
                      className="bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:shadow-lg transition-all"
                    >
                      Bargain This Room
                    </button>
                  )}
                  <button
                    onClick={() =>
                      navigate(`/mobile-hotel-details/${hotel.id}`)
                    }
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium text-sm hover:shadow-lg transition-all"
                  >
                    Reserve
                  </button>
                </div>
              </div>

              {/* Room Details Toggle */}
              <button
                onClick={() => toggleHotelDetails(hotel.id)}
                className="w-full mt-4 pt-4 border-t border-gray-100 flex items-center justify-center text-blue-600 text-sm font-medium"
              >
                {expandedHotel === hotel.id ? "Hide" : "Show"} Room Details
                {expandedHotel === hotel.id ? (
                  <ChevronUp className="w-4 h-4 ml-1" />
                ) : (
                  <ChevronDown className="w-4 h-4 ml-1" />
                )}
              </button>

              {/* Expandable Room Details */}
              {expandedHotel === hotel.id && (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                  <p className="text-sm text-gray-600">{hotel.description}</p>
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-800">
                      Available Rooms:
                    </h4>
                    {hotel.rooms.map((room, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <div className="font-medium text-sm">{room.type}</div>
                          <div className="text-xs text-gray-500">
                            {room.available} left
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-blue-600">
                            {formatCurrency(room.price)}
                          </div>
                          <button className="text-xs text-blue-600 hover:underline">
                            Select
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Filters Modal */}
      {showFilters && (
        <div className="fixed inset-0 bg-black/50 z-50">
          <div className="bg-white h-full flex flex-col">
            {/* Filter Header */}
            <div className="bg-white shadow-sm px-4 py-3 flex items-center justify-between border-b">
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                <X className="w-6 h-6" />
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
                  <span className="font-medium">Price Range (per night)</span>
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
                      <span className="text-sm text-gray-600">₹100,000+</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100000"
                      className="w-full accent-blue-600"
                    />
                  </div>
                )}
              </div>

              {/* Star Rating */}
              <div className="border-b">
                <button
                  onClick={() => toggleFilter("rating")}
                  className="w-full px-4 py-4 flex items-center justify-between"
                >
                  <span className="font-medium">Star Rating</span>
                  {expandedFilter === "rating" ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
                {expandedFilter === "rating" && (
                  <div className="px-4 pb-4 space-y-3">
                    {[5, 4, 3, 2, 1].map((stars) => (
                      <label
                        key={stars}
                        className="flex items-center space-x-3"
                      >
                        <input type="checkbox" className="rounded" />
                        <div className="flex items-center space-x-1">
                          {[...Array(stars)].map((_, i) => (
                            <Star
                              key={i}
                              className="w-4 h-4 text-yellow-400 fill-current"
                            />
                          ))}
                          <span className="text-sm ml-2">
                            {stars} star{stars !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Amenities */}
              <div className="border-b">
                <button
                  onClick={() => toggleFilter("amenities")}
                  className="w-full px-4 py-4 flex items-center justify-between"
                >
                  <span className="font-medium">Amenities</span>
                  {expandedFilter === "amenities" ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
                {expandedFilter === "amenities" && (
                  <div className="px-4 pb-4 space-y-3">
                    {[
                      "Free WiFi",
                      "Pool",
                      "Gym",
                      "Spa",
                      "Restaurant",
                      "Free Parking",
                    ].map((amenity) => (
                      <label
                        key={amenity}
                        className="flex items-center space-x-3"
                      >
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">{amenity}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Apply Filters Button */}
            <div className="p-4 border-t bg-white">
              <Button
                onClick={() => setShowFilters(false)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Show {hotels.length} Properties
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bargain Bottom Drawer */}
      {showBargainDrawer && selectedHotel && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-xl max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Bargain for Better Price
                </h3>
                <button
                  onClick={() => setShowBargainDrawer(false)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4">
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">🔥</div>
                <h4 className="text-xl font-bold text-gray-800">
                  {selectedHotel.name}
                </h4>
                <p className="text-gray-600">
                  Get instant discount on your booking!
                </p>
              </div>

              <div className="bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white p-4 rounded-lg mb-6 text-center">
                <div className="text-2xl font-bold">
                  {selectedHotel.bargainDiscount}% OFF
                </div>
                <div className="text-sm opacity-90">Limited time offer</div>
                <div className="text-lg font-semibold mt-2">
                  Save{" "}
                  {formatCurrency(
                    selectedHotel.originalPrice - selectedHotel.price,
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  className="w-full bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-600 hover:to-purple-700 text-white"
                  onClick={() => {
                    setShowBargainDrawer(false);
                    navigate(`/mobile-hotel-details/${selectedHotel.id}`, {
                      state: {
                        bargainApplied: true,
                        discount: selectedHotel.bargainDiscount,
                      },
                    });
                  }}
                >
                  Accept Bargain & Book Now
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowBargainDrawer(false)}
                >
                  Maybe Later
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileHotelResults;
