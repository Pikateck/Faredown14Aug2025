import React, { useState, useEffect, useRef } from "react";

// Custom slider styles
const sliderStyles = `
  .slider {
    -webkit-appearance: none;
    appearance: none;
    background: transparent;
    cursor: pointer;
  }

  .slider::-webkit-slider-track {
    background: #e5e7eb;
    height: 8px;
    border-radius: 4px;
  }

  .slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    background: #2563eb;
    height: 20px;
    width: 20px;
    border-radius: 50%;
    cursor: pointer;
  }

  .slider::-moz-range-track {
    background: #e5e7eb;
    height: 8px;
    border-radius: 4px;
  }

  .slider::-moz-range-thumb {
    background: #2563eb;
    height: 20px;
    width: 20px;
    border-radius: 50%;
    cursor: pointer;
    border: none;
  }
`;
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FlightStyleBargainModal } from "@/components/FlightStyleBargainModal";
import { ComprehensiveFilters } from "@/components/ComprehensiveFilters";
import { calculateTotalPrice as calculatePriceBreakdown } from "@/lib/pricing";
import {
  Star,
  MapPin,
  Share2,
  ChevronDown,
  Bookmark,
  Search,
  Filter,
  Car,
  Utensils,
  Waves,
  Dumbbell,
  Building2,
  Sparkles,
  Baby,
  Shirt,
  Briefcase,
  Shield,
  Info,
  MessageSquare,
  Cigarette,
  Coffee,
  ChefHat,
  Wifi,
  Home,
  Accessibility,
  CreditCard,
  Key,
  Camera,
  Bell,
  Languages,
  Flame,
  Lock,
  ArrowUpDown,
  CheckCircle,
} from "lucide-react";

export default function HotelDetails() {
  const { hotelId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedRoomType, setSelectedRoomType] = useState<any>(null);
  const [isBargainModalOpen, setIsBargainModalOpen] = useState(false);
  const [expandedRooms, setExpandedRooms] = useState<Set<string>>(
    new Set(["twin-skyline"]),
  );
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isWriteReviewModalOpen, setIsWriteReviewModalOpen] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [showSaveDropdown, setShowSaveDropdown] = useState(false);
  const saveDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        saveDropdownRef.current &&
        !saveDropdownRef.current.contains(event.target as Node)
      ) {
        setShowSaveDropdown(false);
      }
    };

    if (showSaveDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSaveDropdown]);
  const [bargainingRoomId, setBargainingRoomId] = useState<string | null>(null);
  const [bargainedRooms, setBargainedRooms] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState(100);
  const [selectedFilters, setSelectedFilters] = useState({
    popularFilters: new Set<string>(),
    propertyTypes: new Set<string>(),
    facilities: new Set<string>(),
    mealOptions: new Set<string>(),
    starRatings: new Set<string>(),
  });

  // Format date to DD-MMM-YYYY
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${date.getDate().toString().padStart(2, "0")}-${months[date.getMonth()]}-${date.getFullYear()}`;
  };

  // Get booking parameters from URL or use defaults
  const checkInParam = searchParams.get("checkIn");
  const checkOutParam = searchParams.get("checkOut");
  const roomsParam = searchParams.get("rooms");
  const adultsParam = searchParams.get("adults");

  // Calculate dates and nights dynamically
  const checkInDate = checkInParam
    ? new Date(checkInParam)
    : new Date("2025-07-16");
  const checkOutDate = checkOutParam
    ? new Date(checkOutParam)
    : new Date("2025-07-19");
  const totalNights = Math.ceil(
    (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  // Note: pricing utility will be imported at top of file

  // Mock hotel data with dynamic dates
  const hotel = {
    id: parseInt(hotelId || "3"),
    name: "Grand Hyatt Dubai",
    location: "Near Sheikh Zayed Road & Mall Mall, Dubai, United Arab Emirates",
    image:
      "https://cdn.builder.io/api/v1/image/assets%2F4235b10530ff469795aa00c0333d773c%2F4e78c7022f0345f4909bc6063cdeffd6?format=webp&width=800",
    rating: 4.5,
    reviews: 1247,
    checkIn: checkInDate.toISOString().split("T")[0],
    checkOut: checkOutDate.toISOString().split("T")[0],
    totalNights: totalNights,
    rooms: parseInt(roomsParam || "1"),
    adults: parseInt(adultsParam || "2"),
  };

  const calculateTotalPrice = (roomPricePerNight: number) => {
    const rooms = parseInt(roomsParam || "1");
    const breakdown = calculatePriceBreakdown(
      roomPricePerNight,
      hotel.totalNights,
      rooms,
    );
    return breakdown.total;
  };

  const roomTypes = [
    {
      id: "twin-skyline",
      name: "Twin Room with Skyline View",
      type: "1 X Twin Classic",
      details: "Twin bed",
      pricePerNight: 8124,
      status: "Best Value - Start Here!",
      statusColor: "green",
      nonRefundable: true,
      image:
        "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=300",
      features: [
        "6.7 km from downtown",
        "Max 2 guests",
        "2 twin beds",
        "Free stay for your child",
        "Free cancellation",
        "No prepayment needed",
      ],
    },
    {
      id: "king-skyline",
      name: "King Room with Skyline View",
      type: "1 X King Classic",
      details: "1 king bed",
      pricePerNight: 9340,
      status: "Upgrade for +₹4,864",
      statusColor: "yellow",
      image:
        "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=300",
      features: [
        "6.7 km from downtown",
        "Max 2 guests",
        "1 king bed",
        "Free cancellation",
        "No prepayment needed",
      ],
    },
    {
      id: "superior-king",
      name: "Superior King Room",
      type: "1 X Superior King",
      pricePerNight: 9858,
      status: "Upgrade for +₹6,936",
      statusColor: "yellow",
    },
    {
      id: "superior-twin-club",
      name: "Superior Twin Room - Club Access",
      type: "2 X Twin Superior Club",
      pricePerNight: 13762,
      status: "Upgrade for +₹22,552",
      statusColor: "yellow",
    },
    {
      id: "grand-suite-garden",
      name: "One Bedroom Grand Suite with Garden View",
      type: "1 X Grand Suite",
      pricePerNight: 16038,
      status: "Upgrade for +₹31,656",
      statusColor: "yellow",
    },
  ];

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "gallery", label: "Gallery" },
    { id: "amenities", label: "Amenities" },
    { id: "reviews", label: "Reviews" },
    { id: "street-view", label: "Street View" },
    { id: "location", label: "Location" },
  ];

  const handleBargainClick = (roomType: any) => {
    console.log("Bargain clicked for room:", roomType.id);
    setSelectedRoomType(roomType);
    setBargainingRoomId(roomType.id);
    setIsBargainModalOpen(true);
  };

  const handleFilterChange = (category: string, filterName: string) => {
    setSelectedFilters((prev) => {
      const newFilters = { ...prev };
      const categoryFilters = new Set(
        newFilters[category as keyof typeof newFilters],
      );

      if (categoryFilters.has(filterName)) {
        categoryFilters.delete(filterName);
      } else {
        categoryFilters.add(filterName);
      }

      newFilters[category as keyof typeof newFilters] = categoryFilters;
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setPriceRange(100);
    setSelectedFilters({
      popularFilters: new Set(),
      propertyTypes: new Set(),
      facilities: new Set(),
      mealOptions: new Set(),
      starRatings: new Set(),
    });
  };

  const filterRooms = (rooms: any[]) => {
    return rooms.filter((room) => {
      // Search by name
      if (
        searchTerm &&
        !room.name.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      // Price range filter (only apply if price range is not at maximum)
      if (priceRange < 90) {
        const maxPrice = (priceRange / 100) * 15000; // Assuming max price of 15000
        if (room.pricePerNight > maxPrice) {
          return false;
        }
      }

      // Popular filters (only apply if filters are selected)
      if (selectedFilters.popularFilters.size > 0) {
        const roomFeatures = room.features || [];
        const hasSelectedFeature = Array.from(
          selectedFilters.popularFilters,
        ).some((filter) =>
          roomFeatures.some((feature: string) =>
            feature.toLowerCase().includes(filter.toLowerCase()),
          ),
        );
        if (!hasSelectedFeature) return false;
      }

      return true;
    });
  };

  const toggleRoomExpansion = (roomId: string) => {
    setExpandedRooms((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(roomId)) {
        newSet.delete(roomId);
      } else {
        newSet.add(roomId);
      }
      return newSet;
    });
  };

  const handleBooking = (roomType: any, bargainPrice?: number) => {
    let perNightPrice: number;
    let totalPrice: number;

    if (bargainPrice) {
      // bargainPrice from the modal is the total bargained price
      totalPrice = bargainPrice;
      perNightPrice = Math.round(bargainPrice / hotel.totalNights);
    } else {
      // Regular booking - calculate from per-night price
      perNightPrice = roomType.pricePerNight;
      totalPrice = calculateTotalPrice(perNightPrice);
    }
    // Preserve original search parameters and add booking specific ones
    const existingParams = searchParams.toString();
    const bookingParams = new URLSearchParams({
      hotelId: hotel.id.toString(),
      roomType: roomType.type,
      pricePerNight: perNightPrice.toString(),
      totalPrice: totalPrice.toString(),
      nights: hotel.totalNights.toString(),
      bargained: (!!bargainPrice).toString(),
      roomName: roomType.name,
      checkIn: hotel.checkIn,
      checkOut: hotel.checkOut,
      rooms: hotel.rooms.toString(),
      guests: hotel.adults.toString(),
      hotelName: hotel.name,
      location: hotel.location,
      rating: hotel.rating.toString(),
      reviews: hotel.reviews.toString(),
    });

    // Merge existing search params with booking params
    const mergedParams = new URLSearchParams(existingParams);
    bookingParams.forEach((value, key) => {
      mergedParams.set(key, value);
    });

    navigate(`/reserve?${mergedParams.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{sliderStyles}</style>
      <Header />

      {/* Mobile Filter Button */}
      <div className="lg:hidden bg-white border-b border-gray-200 p-4">
        <Button
          variant="outline"
          onClick={() => setIsMobileFilterOpen(true)}
          className="w-full flex items-center justify-center gap-2"
        >
          <Filter className="w-4 h-4" />
          <span>Filters</span>
        </Button>
      </div>

      {/* Main Container */}
      <div className="flex relative">
        {/* Left Sidebar - Filters */}
        <div
          className={`${
            isMobileFilterOpen ? "fixed inset-0 z-50 bg-white" : "hidden"
          } lg:block lg:relative lg:w-80 bg-white border-r border-gray-200 min-h-screen`}
        >
          <div className="overflow-y-auto h-full">
            {/* Filters Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Filter className="w-4 h-4 mr-2" />
                <span className="font-medium text-gray-700">Filters</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setIsMobileFilterOpen(false)}
              >
                ✕
              </Button>
            </div>

            {/* Search by Hotel Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search by Hotel Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter hotel name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range
              </label>
              <div className="text-sm text-gray-600 mb-2">
                ₹{Math.round((priceRange / 100) * 15000).toLocaleString()}+
              </div>
              <div className="px-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>

            {/* Popular Filters */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Popular Filters
              </label>
              <div className="space-y-2">
                {[
                  { name: "Free cancellation", count: 4106, popular: true },
                  { name: "No prepayment", count: 444, popular: true },
                  { name: "Downtown Dubai", count: 1844 },
                  { name: "Apartments", count: 5176 },
                  { name: "5 stars", count: 843 },
                  { name: "Resorts", count: 59 },
                  { name: "Breakfast & dinner included", count: 236 },
                  { name: "Breakfast included", count: 624 },
                ].map((filter, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <label className="flex items-center flex-1">
                      <input
                        type="checkbox"
                        checked={selectedFilters.popularFilters.has(
                          filter.name,
                        )}
                        onChange={() =>
                          handleFilterChange("popularFilters", filter.name)
                        }
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="ml-2 flex-1">
                        <span className="text-sm text-gray-700">
                          {filter.name}
                        </span>
                        {filter.popular && (
                          <span className="text-xs text-orange-600 ml-1 bg-orange-100 px-1 py-0.5 rounded">
                            Popular
                          </span>
                        )}
                      </div>
                    </label>
                    <span className="text-sm text-gray-500">
                      {filter.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Property Type */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Type
              </label>
              <div className="space-y-2">
                {[
                  { name: "Hotels", count: 2156 },
                  { name: "Apartments", count: 5176 },
                  { name: "Resorts", count: 89 },
                  { name: "Villas", count: 234 },
                  { name: "Guest Houses", count: 145 },
                ].map((filter, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <label className="flex items-center flex-1">
                      <input
                        type="checkbox"
                        checked={selectedFilters.propertyTypes.has(filter.name)}
                        onChange={() =>
                          handleFilterChange("propertyTypes", filter.name)
                        }
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {filter.name}
                      </span>
                    </label>
                    <span className="text-sm text-gray-500">
                      {filter.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Facilities */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Facilities
              </label>
              <div className="space-y-2">
                {[
                  { name: "Swimming Pool", count: 892 },
                  { name: "Free WiFi", count: 3421 },
                  { name: "Gym/Fitness Center", count: 567 },
                  { name: "Spa", count: 234 },
                  { name: "Business Center", count: 445 },
                  { name: "Pet Friendly", count: 123 },
                ].map((filter, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <label className="flex items-center flex-1">
                      <input
                        type="checkbox"
                        checked={selectedFilters.facilities.has(filter.name)}
                        onChange={() =>
                          handleFilterChange("facilities", filter.name)
                        }
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {filter.name}
                      </span>
                    </label>
                    <span className="text-sm text-gray-500">
                      {filter.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Meal Options */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meal Options
              </label>
              <div className="space-y-2">
                {[
                  { name: "Breakfast included", count: 624 },
                  { name: "Half Board", count: 156 },
                  { name: "Full Board", count: 89 },
                  { name: "All Inclusive", count: 234 },
                ].map((filter, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <label className="flex items-center flex-1">
                      <input
                        type="checkbox"
                        checked={selectedFilters.mealOptions.has(filter.name)}
                        onChange={() =>
                          handleFilterChange("mealOptions", filter.name)
                        }
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {filter.name}
                      </span>
                    </label>
                    <span className="text-sm text-gray-500">
                      {filter.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Star Rating */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Star rating
              </label>
              <div className="space-y-1">
                {[
                  { stars: "5 stars", count: 843 },
                  { stars: "4 stars", count: 3644 },
                  { stars: "3 stars", count: 424 },
                ].map((rating, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <label className="flex items-center flex-1">
                      <input
                        type="checkbox"
                        checked={selectedFilters.starRatings.has(rating.stars)}
                        onChange={() =>
                          handleFilterChange("starRatings", rating.stars)
                        }
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {rating.stars}
                      </span>
                    </label>
                    <span className="text-sm text-gray-500">
                      {rating.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Filter Actions */}
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full text-sm"
                onClick={clearAllFilters}
              >
                Clear All Filters
              </Button>
              <Button
                className="w-full text-sm lg:hidden bg-gray-900 hover:bg-gray-800 text-white"
                onClick={() => setIsMobileFilterOpen(false)}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1">
          {/* Tab Navigation */}
          <div className="bg-white border-b border-gray-200">
            <div className="flex overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 lg:px-6 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-blue-700 text-blue-700"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="p-2 sm:p-3 lg:p-4">
            {activeTab === "overview" && (
              <>
                {/* Hotel Header with Large Image */}
                <div className="bg-white rounded-lg border border-gray-200 mb-4">
                  {/* Hotel Image - Large and Prominent */}
                  <div className="relative">
                    <img
                      src={hotel.image}
                      alt={hotel.name}
                      className="w-full h-48 sm:h-56 md:h-64 lg:h-80 object-cover rounded-t-lg"
                    />
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      <div className="relative" ref={saveDropdownRef}>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`text-xs px-3 py-1 bg-white/90 backdrop-blur ${
                            isSaved
                              ? "bg-blue-100 text-blue-700 border-blue-300"
                              : ""
                          }`}
                          onClick={() => setShowSaveDropdown(!showSaveDropdown)}
                        >
                          <Bookmark
                            className={`w-3 h-3 mr-1 ${isSaved ? "fill-current" : ""}`}
                          />
                          Save
                        </Button>

                        {/* Save Dropdown Menu */}
                        {showSaveDropdown && (
                          <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                            <div className="p-3">
                              <h4 className="font-semibold text-sm text-gray-900 mb-3">
                                Save to list
                              </h4>
                              <div className="space-y-2">
                                <button
                                  onClick={() => {
                                    setIsSaved(true);
                                    setShowSaveDropdown(false);
                                  }}
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded flex items-center"
                                >
                                  <Bookmark className="w-4 h-4 mr-2 text-blue-600" />
                                  <span>My Saved Properties</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setShowSaveDropdown(false);
                                  }}
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded flex items-center"
                                >
                                  <div className="w-4 h-4 mr-2 text-green-600">
                                    +
                                  </div>
                                  <span>Create new list</span>
                                </button>
                                <hr className="my-2" />
                                <button
                                  onClick={() => {
                                    setShowSaveDropdown(false);
                                  }}
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded flex items-center"
                                >
                                  <Share2 className="w-4 h-4 mr-2 text-gray-600" />
                                  <span>Share this property</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs px-3 py-1 bg-white/90 backdrop-blur"
                        onClick={() => setIsShareModalOpen(true)}
                      >
                        <Share2 className="w-3 h-3 mr-1" />
                        Share
                      </Button>
                    </div>
                  </div>

                  {/* Hotel Info Section */}
                  <div className="p-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {/* Hotel Details */}
                      <div className="lg:col-span-2">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                          {hotel.name}
                        </h1>
                        <div className="flex items-center mb-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.floor(hotel.rating)
                                    ? "text-yellow-400 fill-current"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                            <span className="ml-1 font-semibold text-sm">
                              {hotel.rating}
                            </span>
                            <span className="ml-1 text-sm text-gray-600">
                              ({hotel.reviews} reviews)
                            </span>
                          </div>
                          <button
                            onClick={() => setIsWriteReviewModalOpen(true)}
                            className="ml-4 text-blue-600 text-sm hover:underline"
                          >
                            ��� Write a review
                          </button>
                        </div>
                        <div className="flex items-center text-gray-600 mb-4">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span className="text-sm">{hotel.location}</span>
                        </div>

                        {/* Booking Details */}
                        <div className="grid grid-cols-3 gap-3 mb-4">
                          <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <div className="text-xs text-gray-600">
                              Check-in
                            </div>
                            <div className="font-semibold text-sm">
                              {formatDate(hotel.checkIn)}
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <div className="text-xs text-gray-600">
                              Check-out
                            </div>
                            <div className="font-semibold text-sm">
                              {formatDate(hotel.checkOut)}
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <div className="text-xs text-gray-600">Total</div>
                            <div className="font-semibold text-sm">
                              {hotel.totalNights} nights
                            </div>
                            <div className="text-xs text-gray-600">
                              {hotel.rooms} room, {hotel.adults} adults
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Price Summary Box */}
                      <div className="lg:col-span-1">
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                          <div className="text-2xl font-bold text-gray-900 mb-1">
                            ₹
                            {calculateTotalPrice(
                              roomTypes[0].pricePerNight,
                            ).toLocaleString()}
                          </div>
                          <div className="text-sm font-semibold text-gray-900 mb-1">
                            Total Price
                          </div>
                          <div className="text-xs text-gray-600 mb-1">
                            Includes all taxes, fees & charges
                          </div>
                          <div className="text-xs text-gray-600 mb-3">
                            ₹
                            {Math.round(
                              roomTypes[0].pricePerNight,
                            ).toLocaleString()}{" "}
                            per night × {hotel.totalNights} nights + taxes &
                            fees = ₹
                            {calculateTotalPrice(
                              roomTypes[0].pricePerNight,
                            ).toLocaleString()}
                          </div>
                          <Button
                            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 px-4 rounded-md text-sm"
                            onClick={() => handleBargainClick(roomTypes[0])}
                          >
                            ⚡ Upgrade & Save with Bargaining for All Rooms
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* All-Inclusive Banner */}
                    <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-center justify-center gap-2 text-sm text-gray-700">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className="w-3 h-3 text-yellow-400 fill-current"
                            />
                          ))}
                          <span className="font-medium text-yellow-800">
                            All-Inclusive Pricing
                          </span>
                        </div>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-600">
                          All prices include taxes, service charges, government
                          fees & hotel charges. Final price - no hidden costs or
                          additional charges.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Available Rooms Section */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="bg-blue-700 text-white p-3">
                    <h2 className="text-base font-semibold">
                      Available Rooms - Starting from Cheapest
                    </h2>
                    <p className="text-sm opacity-90">
                      Start with our cheapest room, then upgrade to better
                      options for just a little more!
                    </p>
                  </div>

                  <div className="divide-y divide-gray-200">
                    {filterRooms(roomTypes).map((room, index) => (
                      <div
                        key={room.id}
                        className="border-b border-gray-200 last:border-b-0"
                      >
                        <div
                          className={`flex items-center justify-between cursor-pointer p-5 transition-all duration-200 ${
                            expandedRooms.has(room.id)
                              ? "bg-blue-50 border-l-4 border-blue-500 shadow-sm"
                              : "hover:bg-gray-50 hover:shadow-sm"
                          }`}
                          onClick={() => toggleRoomExpansion(room.id)}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-base text-gray-900">
                                {room.name}
                              </h3>
                              {room.status && (
                                <Badge
                                  className={`${
                                    room.statusColor === "green"
                                      ? "bg-green-500 text-white border border-green-600 shadow-sm"
                                      : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                                  } text-xs font-semibold px-3 py-1 ${
                                    room.statusColor === "green"
                                      ? "animate-pulse"
                                      : ""
                                  }`}
                                >
                                  {room.status}
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-600">
                              {room.type} • {room.details}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-lg font-bold text-gray-900">
                                ₹
                                {calculateTotalPrice(
                                  room.pricePerNight,
                                ).toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-500">
                                Total Price
                              </div>
                            </div>
                            <ChevronDown
                              className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                                expandedRooms.has(room.id) ? "rotate-180" : ""
                              }`}
                            />
                          </div>
                        </div>

                        {/* Expanded Room Details */}
                        {expandedRooms.has(room.id) && (
                          <div className="bg-white border-t border-gray-200 p-6 mt-2">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                              {/* Room Image */}
                              <div className="lg:col-span-3">
                                <img
                                  src={room.image}
                                  alt={room.name}
                                  className="w-full h-40 lg:h-32 object-cover rounded-lg"
                                />
                              </div>

                              {/* Room Details */}
                              <div className="lg:col-span-6">
                                <h4 className="font-semibold text-lg mb-2 text-gray-900">
                                  {room.type}
                                </h4>
                                <div className="text-sm text-gray-600 mb-3">
                                  {room.details}
                                </div>
                                {room.nonRefundable && (
                                  <Badge className="bg-red-100 text-red-800 text-xs mb-3 px-2 py-1">
                                    Non Refundable Rate
                                  </Badge>
                                )}
                                {bargainingRoomId === room.id && (
                                  <Badge className="bg-blue-100 text-blue-800 text-xs mb-3 px-2 py-1 animate-pulse">
                                    💰 Bargaining in Progress
                                  </Badge>
                                )}
                                <div className="space-y-2">
                                  <h5 className="font-medium text-sm text-gray-900 mb-2">
                                    Room features:
                                  </h5>
                                  <div className="grid grid-cols-1 gap-2 text-sm">
                                    {room.features &&
                                    room.features.length > 0 ? (
                                      room.features.map((feature, idx) => (
                                        <div
                                          key={idx}
                                          className="flex items-start"
                                        >
                                          <span className="text-green-600 mr-2 mt-0.5">
                                            ✓
                                          </span>
                                          <span className="text-gray-700">
                                            {feature}
                                          </span>
                                        </div>
                                      ))
                                    ) : (
                                      <div className="flex items-start">
                                        <span className="text-green-600 mr-2 mt-0.5">
                                          ✓
                                        </span>
                                        <span className="text-gray-700">
                                          Comfortable room with standard
                                          amenities
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Pricing and Actions */}
                              <div className="lg:col-span-3 mt-4 lg:mt-0">
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-4">
                                  <div className="text-2xl font-bold text-gray-900 mb-1">
                                    ₹
                                    {calculateTotalPrice(
                                      room.pricePerNight,
                                    ).toLocaleString()}
                                  </div>
                                  <div className="text-sm font-semibold text-gray-900 mb-1">
                                    Total Price
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    ₹
                                    {Math.round(
                                      room.pricePerNight,
                                    ).toLocaleString()}{" "}
                                    per night × {hotel.totalNights} nights +
                                    taxes & fees
                                  </div>
                                </div>

                                <div className="mb-3">
                                  <div
                                    className={`flex items-center text-sm font-medium ${
                                      room.statusColor === "green"
                                        ? "text-green-700"
                                        : "text-blue-700"
                                    }`}
                                  >
                                    <span
                                      className={`w-2 h-2 rounded-full mr-2 ${
                                        room.statusColor === "green"
                                          ? "bg-green-600"
                                          : "bg-blue-600"
                                      }`}
                                    ></span>
                                    {room.statusColor === "green"
                                      ? "Cheapest Option Available"
                                      : "Premium Upgrade Available"}
                                  </div>
                                </div>

                                <div className="space-y-3">
                                  <Button
                                    onClick={() => handleBooking(room)}
                                    variant="outline"
                                    className={`w-full font-semibold py-3 text-sm transition-all duration-200 ${
                                      room.statusColor === "green"
                                        ? "border-green-600 text-green-600 hover:bg-green-600 hover:text-white hover:shadow-md"
                                        : "border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white hover:shadow-md"
                                    }`}
                                  >
                                    Reserve Room
                                  </Button>
                                  <Button
                                    onClick={() => handleBargainClick(room)}
                                    variant="outline"
                                    className={`w-full font-semibold py-3 text-sm transition-all duration-200 ${
                                      bargainedRooms.has(room.id)
                                        ? "bg-green-500 border-green-600 text-white shadow-lg"
                                        : bargainingRoomId === room.id
                                          ? "bg-blue-500 border-blue-600 text-white shadow-lg animate-pulse"
                                          : "border-blue-600 text-blue-600 hover:bg-blue-500 hover:text-white hover:border-blue-500 hover:shadow-md"
                                    }`}
                                    style={{ display: "block" }}
                                  >
                                    {bargainedRooms.has(room.id) ? (
                                      <span className="flex items-center justify-center">
                                        Bargained
                                        <CheckCircle className="w-4 h-4 ml-2" />
                                      </span>
                                    ) : bargainingRoomId === room.id ? (
                                      "Bargaining..."
                                    ) : (
                                      "Bargain This Room"
                                    )}
                                  </Button>
                                </div>

                                <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                                  <div className="space-y-2">
                                    <div className="flex items-center text-xs text-green-700">
                                      <span className="font-medium">
                                        No prepayment needed
                                      </span>
                                    </div>
                                    <div className="flex items-center text-xs text-green-700">
                                      <span className="font-medium">
                                        Free cancellation
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === "gallery" && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h2 className="text-xl font-bold mb-4">Hotel Gallery</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    hotel.image,
                    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600",
                    "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600",
                    "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600",
                    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600",
                    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600",
                  ].map((image, index) => (
                    <div key={index} className="aspect-video">
                      <img
                        src={image}
                        alt={`${hotel.name} - Image ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "amenities" && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    Facilities of Grand Hyatt Dubai
                  </h2>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium">
                    See availability
                  </button>
                </div>
                {/* Most popular facilities */}
                <div className="mb-8">
                  <h3 className="font-semibold text-base mb-4">
                    Most popular facilities
                  </h3>
                  <div className="flex flex-wrap gap-6">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <span className="text-gray-700">2 swimming pools</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-orange-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                      </div>
                      <span className="text-gray-700">Fitness centre</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <Cigarette className="w-4 h-4 text-gray-600" />
                      </div>
                      <span className="text-gray-700">Non-smoking rooms</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                        <Utensils className="w-4 h-4 text-amber-600" />
                      </div>
                      <span className="text-gray-700">17 restaurants</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="text-gray-700">
                        Spa and wellness centre
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-gray-700">Room service</span>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-gray-600">
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="flex items-center gap-1">
                        <div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center">
                          <Coffee className="w-3 h-3 text-amber-600" />
                        </div>
                        <span>Tea/Coffee Maker on All Rooms</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                          <Car className="w-3 h-3 text-blue-600" />
                        </div>
                        <span>Car</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center">
                          <ChefHat className="w-3 h-3 text-orange-600" />
                        </div>
                        <span>Excellent Breakfast</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                          <Wifi className="w-3 h-3 text-green-600" />
                        </div>
                        <span>Free WiFi available on request</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Facilities Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {/* Great for your stay */}
                  <div>
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <Home className="w-4 h-4 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-base">
                        Great for your stay
                      </h3>
                    </div>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        17 restaurants
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Parking
                      </li>
                      <li className="flex items-center">
                        <span className="text-green-600 mr-2">₹</span> Air
                        conditioning
                      </li>
                      <li className="flex items-center">
                        <span className="text-green-600 mr-2">₹</span> Private
                        bathroom
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Free WiFi
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Spa and wellness centre
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Family rooms
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Non-smoking rooms
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Fitness centre
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Live music/performance
                      </li>
                    </ul>
                  </div>

                  {/* Parking */}
                  <div>
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <Car className="w-4 h-4 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-base">Parking</h3>
                    </div>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Free private parking is possible on site (reservation is
                        not needed)
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Valet parking
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Parking garage
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        Accessible parking
                      </li>
                    </ul>
                  </div>

                  {/* 2 swimming pools */}
                  <div>
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <Waves className="w-4 h-4 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-base">
                        2 swimming pools
                      </h3>
                    </div>
                    <div className="mb-3">
                      <h4 className="font-medium text-sm mb-1">
                        Pool 1 - Indoor Pool
                      </h4>
                      <ul className="space-y-1 text-sm text-gray-700">
                        <li className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                          Opening times
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                          Open all year
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                          All ages welcome
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-1">
                        Pool 2 - outdoor Pool
                      </h4>
                      <ul className="space-y-1 text-sm text-gray-700">
                        <li className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                          Opening times
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                          Open all year
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                          All ages welcome
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Reception services */}
                  <div>
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                        <Building2 className="w-4 h-4 text-indigo-600" />
                      </div>
                      <h3 className="font-semibold text-base">
                        Reception services
                      </h3>
                    </div>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Invoice provided
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Private check-in/out
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Concierge service
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        ATM/cash machine on site
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Currency exchange
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Tour desk
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Luggage storage
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Express check-in/out
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        24-hour front desk
                      </li>
                    </ul>
                  </div>

                  {/* Wellness */}
                  <div>
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <Sparkles className="w-4 h-4 text-green-600" />
                      </div>
                      <h3 className="font-semibold text-base">Wellness</h3>
                    </div>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Fitness/spa locker rooms
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Personal trainer
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Yoga classes
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Full body massage
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Hand massage
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Head massage
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Couples massage
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Foot massage
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Neck massage
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Back massage
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Beauty Services
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Spa lounge/relaxation area
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Steam room
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Spa facilities
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Sauna
                      </li>
                    </ul>
                  </div>

                  {/* Entertainment and family services */}
                  <div>
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                        <Baby className="w-4 h-4 text-purple-600" />
                      </div>
                      <h3 className="font-semibold text-base">
                        Entertainment and family services
                      </h3>
                    </div>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Babysitting/child services
                      </li>
                    </ul>
                  </div>

                  {/* Cleaning services */}
                  <div>
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center mr-3">
                        <Shirt className="w-4 h-4 text-teal-600" />
                      </div>
                      <h3 className="font-semibold text-base">
                        Cleaning services
                      </h3>
                    </div>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Daily housekeeping
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Trouser press
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Ironing service
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Dry cleaning
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Laundry
                      </li>
                    </ul>
                  </div>

                  {/* Business facilities */}
                  <div>
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center mr-3">
                        <Briefcase className="w-4 h-4 text-slate-600" />
                      </div>
                      <h3 className="font-semibold text-base">
                        Business facilities
                      </h3>
                    </div>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Fax/photocopying
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Business centre
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Meeting/banquet facilities
                      </li>
                    </ul>
                  </div>

                  {/* Safety & security */}
                  <div>
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                        <Shield className="w-4 h-4 text-red-600" />
                      </div>
                      <h3 className="font-semibold text-base">
                        Safety & security
                      </h3>
                    </div>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Fire extinguishers
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        CCTV outside property
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        CCTV in common areas
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Smoke alarms
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Security alarm
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Key card access
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        24-hour security
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Safety deposit box
                      </li>
                    </ul>
                  </div>

                  {/* General */}
                  <div>
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                        <Info className="w-4 h-4 text-gray-600" />
                      </div>
                      <h3 className="font-semibold text-base">General</h3>
                    </div>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Grocery deliveries
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Designated smoking area
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Air conditioning
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Wake-up service
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Car hire
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Lift
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Family rooms
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Barber/beauty shop
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Ironing facilities
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Facilities for disabled guests
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Non-smoking rooms
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Room service
                      </li>
                    </ul>
                  </div>

                  {/* Languages Spoken */}
                  <div>
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                        <Languages className="w-4 h-4 text-indigo-600" />
                      </div>
                      <h3 className="font-semibold text-base">
                        Languages Spoken
                      </h3>
                    </div>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Arabic
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        German
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        English
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Spanish
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        French
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Hindi
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Indonesian
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Italian
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Japanese
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Korean
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Russian
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />{" "}
                        Chinese
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-blue-600 font-bold text-sm">
                          E
                        </span>
                      </div>
                      <h3 className="font-semibold text-lg">Entertainment</h3>
                    </div>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li className="flex items-center">
                        <span className="mr-2">📺</span> TV Lounge
                      </li>
                      <li className="flex items-center">
                        <span className="mr-2">🏊</span> Outdoor Freshwater pool
                      </li>
                      <li className="flex items-center">
                        <span className="mr-2">🎵</span> Live music/performance
                      </li>
                      <li className="flex items-center">
                        <span className="mr-2">🎲</span> Kids' club
                      </li>
                      <li className="flex items-center">
                        <span className="mr-2">🎮</span> Nightclub/DJ
                      </li>
                      <li className="flex items-center">
                        <span className="mr-2">🎪</span> Children's playground
                      </li>
                      <li className="flex items-center">
                        <span className="mr-2">🏸</span> Tennis court
                      </li>
                      <li className="flex items-center">
                        <span className="mr-2">💳</span> Credit cards accepted
                      </li>
                    </ul>
                  </div>

                  <div>
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-blue-600 font-bold text-sm">
                          F
                        </span>
                      </div>
                      <h3 className="font-semibold text-lg">Facilities</h3>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-center">
                        <span className="mr-2">🏨</span> 674 Total rooms
                      </li>
                      <li className="flex items-center">
                        <span className="mr-2">🏢</span> 40-floor main building
                      </li>
                      <li className="flex items-center">
                        <span className="mr-2">🛎️</span> Concierge service
                      </li>
                      <li className="flex items-center">
                        <span className="mr-2">🧳</span> Luggage storage
                      </li>
                      <li className="flex items-center">
                        <span className="mr-2">💼</span> Business centre
                      </li>
                      <li className="flex items-center">
                        <span className="mr-2">🏢</span> Meeting rooms
                      </li>
                      <li className="flex items-center">
                        <span className="mr-2">🚗</span> Valet parking
                      </li>
                      <li className="flex items-center">
                        <span className="mr-2">🎯</span> Tour desk
                      </li>
                    </ul>
                  </div>

                  <div>
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-blue-600 font-bold text-sm">
                          L
                        </span>
                      </div>
                      <h3 className="font-semibold text-lg">Location</h3>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-center">
                        <span className="mr-2">🏙️</span> City centre location
                      </li>
                      <li className="flex items-center">
                        <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center mr-2">
                          <MapPin className="w-3 h-3 text-purple-600" />
                        </div>{" "}
                        Near shopping malls
                      </li>
                      <li className="flex items-center">
                        <span className="mr-2">🚇</span> Metro station nearby
                      </li>
                      <li className="flex items-center">
                        <span className="mr-2">✈️</span> Airport transfer
                        available
                      </li>
                      <li className="flex items-center">
                        <span className="mr-2">🏖️</span> Beach access
                      </li>
                      <li className="flex items-center">
                        <span className="mr-2">🌆</span> Skyline view
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="mt-8">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-bold text-sm">R</span>
                    </div>
                    <h3 className="font-semibold text-lg">
                      Room facilities (Standard room)
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-center">
                        <span className="mr-2">🛁</span> Private bathroom
                      </li>
                      <li className="flex items-center">
                        <span className="mr-2">📶</span> Free WiFi
                      </li>
                      <li className="flex items-center">
                        <span className="mr-2">☕</span> Tea & coffee facilities
                      </li>
                      <li className="flex items-center">
                        <span className="mr-2">��</span> Carpeted floors
                      </li>
                      <li className="flex items-center">
                        <span className="mr-2">❄️</span> Air conditioning
                      </li>
                      <li className="flex items-center">
                        <span className="mr-2">🛋️</span> Living room
                      </li>
                    </ul>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-center">
                        <span className="mr-2">🏡</span> Balcony
                      </li>
                      <li className="flex items-center">
                        <span className="mr-2">🚿</span> Shower
                      </li>
                      <li className="flex items-center">
                        <span className="mr-2">📺</span> Flat-screen TV
                      </li>
                      <li className="flex items-center">
                        <span className="mr-2">🔐</span> Safe
                      </li>
                      <li className="flex items-center">
                        <span className="mr-2">👕</span> Wardrobe
                      </li>
                      <li className="flex items-center">
                        <span className="mr-2">🪑</span> Desk
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Swimming Pools Section */}
                <div className="mt-8 bg-gradient-to-r from-blue-100 to-cyan-100 border border-blue-300 rounded-lg p-6">
                  <div className="flex items-center mb-6">
                    <span className="text-4xl mr-4">🏊‍♂️</span>
                    <div>
                      <h3 className="font-bold text-2xl text-blue-900">
                        2 Swimming Pools
                      </h3>
                      <p className="text-blue-700 text-sm">
                        Indoor and outdoor pools for year-round enjoyment
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg p-5 shadow-sm border border-blue-200">
                      <h4 className="font-bold mb-3 text-blue-800 text-lg">
                        ₹ Pool 1 - Indoor
                      </h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-center">
                          <span className="text-green-600 mr-2 font-bold">
                            ✓
                          </span>{" "}
                          Open all year
                        </li>
                        <li className="flex items-center">
                          <span className="text-green-600 mr-2 font-bold">
                            ✓
                          </span>{" "}
                          All ages welcome
                        </li>
                        <li className="flex items-center">
                          <span className="text-green-600 mr-2 font-bold">
                            ✓
                          </span>{" "}
                          Climate controlled
                        </li>
                        <li className="flex items-center">
                          <span className="text-green-600 mr-2 font-bold">
                            ✓
                          </span>{" "}
                          Pool towels provided
                        </li>
                      </ul>
                    </div>
                    <div className="bg-white rounded-lg p-5 shadow-sm border border-blue-200">
                      <h4 className="font-bold mb-3 text-blue-800 text-lg">
                        🌊 Pool 2 - Outdoor
                      </h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-center">
                          <span className="text-green-600 mr-2 font-bold">
                            ✓
                          </span>{" "}
                          Open all year
                        </li>
                        <li className="flex items-center">
                          <span className="text-green-600 mr-2 font-bold">
                            ✓
                          </span>{" "}
                          All ages welcome
                        </li>
                        <li className="flex items-center">
                          <span className="text-green-600 mr-2 font-bold">
                            ✓
                          </span>{" "}
                          Poolside service
                        </li>
                        <li className="flex items-center">
                          <span className="text-green-600 mr-2 font-bold">
                            ✓
                          </span>{" "}
                          Sun loungers
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Wellness & Spa Section */}
                <div className="mt-8 bg-gradient-to-r from-green-100 to-emerald-100 border border-green-300 rounded-lg p-6">
                  <div className="flex items-center mb-6">
                    <span className="text-4xl mr-4">��‍♀️</span>
                    <div>
                      <h3 className="font-bold text-2xl text-green-900">
                        Wellness & Spa
                      </h3>
                      <p className="text-green-700 text-sm">
                        Comprehensive wellness facilities for relaxation and
                        rejuvenation
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[
                      { icon: "🏋️", text: "Fitness centre" },
                      { icon: "🏋️", text: "Personal trainer" },
                      { icon: "🧘", text: "Yoga classes" },
                      { icon: "💆", text: "Full body massage" },
                      { icon: "💆‍♀️", text: "Head massage" },
                      { icon: "👐", text: "Hand massage" },
                      { icon: "💑", text: "Couples massage" },
                      { icon: "🦶", text: "Foot massage" },
                      { icon: "₹", text: "Back massage" },
                      { icon: "✨", text: "Beauty services" },
                      { icon: "🏖️", text: "Sun loungers" },
                      { icon: "🧖‍♀️", text: "Spa facilities" },
                      { icon: "💨", text: "Steam room" },
                      { icon: "🔥", text: "Sauna" },
                      { icon: "💅", text: "Manicure/Pedicure" },
                      { icon: "💇", text: "Hair salon" },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center bg-white rounded-lg p-3 shadow-sm border border-green-200 hover:bg-green-50 transition-colors"
                      >
                        <span className="text-lg mr-2">{item.icon}</span>
                        <span className="text-sm text-gray-700 font-medium">
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Amenities Grid */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Food & Drink */}
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-5">
                    <div className="flex items-center mb-4">
                      <span className="text-2xl mr-3">🍽️</span>
                      <h3 className="font-bold text-lg text-orange-900">
                        Food & Drink
                      </h3>
                    </div>
                    <ul className="space-y-2 text-sm">
                      {[
                        { icon: "🍽️", text: "17 restaurants" },
                        { icon: "☕", text: "Coffee house on site" },
                        { icon: "🍷", text: "Wine/champagne" },
                        { icon: "🥃", text: "Bar" },
                        { icon: "🏨", text: "Room service" },
                        { icon: '₹ text: "Fresh fruits' },
                        { icon: "🧒", text: "Kid-friendly buffet" },
                        { icon: "🥗", text: "Special diet menus" },
                      ].map((item, idx) => (
                        <li
                          key={idx}
                          className="flex items-center text-gray-700"
                        >
                          <span className="mr-3 text-lg">{item.icon}</span>
                          <span className="font-medium">{item.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Safety & Security */}
                  <div className="bg-red-50 border border-red-200 rounded-lg p-5">
                    <div className="flex items-center mb-4">
                      <span className="text-2xl mr-3">🔒</span>
                      <h3 className="font-bold text-lg text-red-900">
                        Safety & Security
                      </h3>
                    </div>
                    <ul className="space-y-2 text-sm">
                      {[
                        { icon: "🔥", text: "Fire extinguishers" },
                        { icon: "📹", text: "CCTV surveillance" },
                        { icon: "🚨", text: "Smoke alarms" },
                        { icon: "����", text: "Security alarm" },
                        { icon: "🔑", text: "Key card access" },
                        { icon: "🔐", text: "In-room safe" },
                        { icon: "👮", text: "24-hour security" },
                        { icon: "🚪", text: "Secure access" },
                      ].map((item, idx) => (
                        <li
                          key={idx}
                          className="flex items-center text-gray-700"
                        >
                          <span className="mr-3 text-lg">{item.icon}</span>
                          <span className="font-medium">{item.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Languages Spoken */}
                  <div className="bg-teal-50 border border-teal-200 rounded-lg p-5">
                    <div className="flex items-center mb-4">
                      <span className="text-2xl mr-3">🗣️</span>
                      <h3 className="font-bold text-lg text-teal-900">
                        Languages Spoken
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {[
                        { icon: "🇺🇸", text: "English" },
                        { icon: "🇦����", text: "Arabic" },
                        { icon: "🇩🇪", text: "German" },
                        { icon: "🇫🇷", text: "French" },
                        { icon: "🇪🇸", text: "Spanish" },
                        { icon: "🇮🇳", text: "Hindi" },
                        { icon: "🇮🇩", text: "Indonesian" },
                        { icon: "🇮🇹", text: "Italian" },
                        { icon: "🇯🇵", text: "Japanese" },
                        { icon: "🇰🇷", text: "Korean" },
                        { icon: "🇷🇺", text: "Russian" },
                        { icon: "🇨🇳", text: "Chinese" },
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center text-gray-700 mb-1"
                        >
                          <span className="mr-2 text-base">{item.icon}</span>
                          <span className="font-medium text-xs">
                            {item.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">
                    Guest reviews for {hotel.name}
                  </h2>
                  <Button
                    onClick={() => setIsWriteReviewModalOpen(true)}
                    className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded text-sm"
                  >
                    📝 Write a review
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <div>
                    <div className="flex items-center mb-4">
                      <div className="bg-blue-700 text-white px-3 py-1 rounded text-lg font-bold mr-3">
                        8.5
                      </div>
                      <div>
                        <div className="font-semibold">Excellent</div>
                        <div className="text-sm text-gray-600">
                          {hotel.reviews} reviews
                        </div>
                        <div className="text-xs text-gray-500">
                          We aim for 100% real reviews
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { category: "Staff", score: 9.6 },
                      { category: "Facilities", score: 9 },
                      { category: "Cleanliness", score: 9.2 },
                      { category: "Comfort", score: 9.1 },
                      { category: "Value for money", score: 8.5 },
                      { category: "Location", score: 8.8 },
                      { category: "Free WiFi", score: 8.6 },
                    ].map((item, index) => (
                      <div key={index} className="text-center">
                        <div className="text-sm text-gray-600 mb-1">
                          {item.category}
                        </div>
                        <div className="font-bold text-lg">{item.score}</div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${item.score * 10}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      name: "Mia",
                      location: "United Arab Emirates",
                      room: "Twin Room",
                      date: "August 2023",
                      type: "Family",
                      title: "We are happy",
                      review:
                        "It's my pleasure to be thankful for the polite service and see my birthday 🎂 Thanks for making it special for me",
                      helpful: 0,
                      avatar: "M",
                    },
                    {
                      name: "Rachelle",
                      location: "United Arab Emirates",
                      room: "King Room with Skyline View",
                      date: "July 2023",
                      type: "Family",
                      title: "Wonderful",
                      review:
                        "The hotel exceeded our expectations in every way. The staff was incredibly friendly and helpful, the room was spacious and clean, and the location was perfect for exploring the city.",
                      helpful: 3,
                      avatar: "R",
                    },
                  ].map((review, index) => (
                    <div key={index} className="border-b border-gray-200 pb-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-700 text-white rounded-full flex items-center justify-center font-bold">
                          {review.avatar}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{review.name}</span>
                            <span className="text-xs text-gray-500">
                              {review.location}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mb-2">
                            {review.room} • {review.date} • {review.type}
                          </div>
                          <h4 className="font-semibold mb-1">{review.title}</h4>
                          <p className="text-sm text-gray-700 mb-2">
                            {review.review}
                          </p>
                          <div className="flex items-center gap-4 text-xs">
                            <button className="text-blue-600 hover:underline">
                              👍 Helpful ({review.helpful})
                            </button>
                            <button className="text-gray-500 hover:underline">
                              Not helpful
                            </button>
                          </div>
                        </div>
                        <div className="bg-blue-700 text-white px-2 py-1 rounded text-xs font-bold">
                          {8 + index}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "street-view" && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h2 className="text-xl font-bold mb-4">Street View</h2>
                <p className="text-gray-600 mb-4">
                  Explore the area around Grand Hyatt Dubai with Google Street
                  View
                </p>

                <div className="mb-4">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm">
                    Street View
                  </Button>
                </div>

                <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets%2F4235b10530ff469795aa00c0333d773c%2Fa819714c5cc047bf850c81dad7db477e?format=webp&width=800"
                    alt="Street View of Grand Hyatt Dubai Entrance"
                    className="w-full h-full object-cover"
                  />

                  {/* Street View Label Overlay */}
                  <div className="absolute top-4 left-4">
                    <div className="bg-black bg-opacity-75 text-white px-3 py-1 rounded text-sm">
                      📍 Street View: Grand Hyatt Dubai
                    </div>
                  </div>

                  {/* Live Street View Indicator */}
                  <div className="absolute top-4 right-4">
                    <div className="bg-green-600 text-white px-3 py-1 rounded text-xs font-medium flex items-center gap-1">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      Live Street View
                    </div>
                  </div>

                  {/* Location Info Overlay */}
                  <div className="absolute bottom-4 left-4">
                    <div className="bg-black bg-opacity-75 text-white px-3 py-2 rounded">
                      <div className="text-sm font-medium">
                        Near Sheikh Zayed Road & Mall Mall, Dubai, United Arab
                        Emirates
                      </div>
                    </div>
                  </div>

                  {/* Street View Navigation Note */}
                  <div className="absolute bottom-4 right-4">
                    <div className="bg-white bg-opacity-90 text-gray-800 px-3 py-1 rounded text-xs">
                      Drag street view to look around
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>🗺️</span>
                    <span>
                      <strong>Interactive View</strong>
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        window.open(
                          `https://www.google.com/maps/@25.2048,55.2708,3a,75y,210h,90t/data=!3m6!1e1!3m4!1sAF1QipO8EibS-hL-yfA-v8sVtSxBJBn2J8bv1U_7UW-9!2e10!7i5760!8i2880`,
                          "_blank",
                        );
                      }}
                      className="ml-2"
                    >
                      Open in Google Maps
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Drag to explore around
                  </p>
                </div>
              </div>
            )}

            {activeTab === "location" && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h2 className="text-xl font-bold mb-4">Location & Map</h2>
                <p className="text-gray-600 mb-6">
                  See the exact location of {hotel.name} and nearby attractions
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <div className="flex gap-2 mb-4">
                      <Button className="bg-blue-700 text-white px-3 py-1 text-sm">
                        Map
                      </Button>
                      <Button variant="outline" className="px-3 py-1 text-sm">
                        Satellite
                      </Button>
                      <Button variant="outline" className="px-3 py-1 text-sm">
                        Terrain
                      </Button>
                    </div>
                    <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center relative">
                      <div className="text-center">
                        <div className="text-4xl mb-2">🗺️</div>
                        <div className="text-gray-600">Interactive Map</div>
                        <div className="text-sm text-gray-500">
                          Hotel location and nearby landmarks
                        </div>
                      </div>
                      <div className="absolute top-2 right-2 bg-white rounded px-2 py-1 text-xs shadow">
                        📍 {hotel.name}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Hotel Details</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Address:</span>
                        <div className="text-gray-600">{hotel.location}</div>
                      </div>
                    </div>

                    <h3 className="font-semibold mt-6 mb-3">
                      Nearby Landmarks
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Dubai International Airport</span>
                        <span className="text-gray-500">8.5 km</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Burj Khalifa</span>
                        <span className="text-gray-500">2.1 km</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Dubai Mall</span>
                        <span className="text-gray-500">1.8 km</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Business Bay Metro Station</span>
                        <span className="text-gray-500">0.5 km</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Share2 className="w-5 h-5 mr-2" />
              Share this hotel
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">{hotel.name} - faredown</h3>
              <p className="text-sm text-gray-600 mt-1">
                Check out this amazing hotel in {hotel.location}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Link copied to clipboard!");
                }}
              >
                🔗 Copy Link
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const text = `Check out ${hotel.name} in ${hotel.location}! ${window.location.href}`;
                  window.open(
                    `https://wa.me/?text=${encodeURIComponent(text)}`,
                    "_blank",
                  );
                }}
              >
                💬 WhatsApp
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const text = `Check out ${hotel.name} in ${hotel.location}!`;
                  window.open(
                    `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`,
                    "_blank",
                  );
                }}
              >
                🐦 Twitter
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.open(
                    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
                    "_blank",
                  );
                }}
              >
                📘 Facebook
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enhanced Bargain Modal */}
      {selectedRoomType && (
        <FlightStyleBargainModal
          roomType={{
            id: selectedRoomType.id,
            name: selectedRoomType.name,
            description:
              selectedRoomType.features?.join(", ") ||
              "Comfortable room with great amenities",
            image: selectedRoomType.image || hotel.image,
            marketPrice: selectedRoomType.pricePerNight * 1.2,
            totalPrice: selectedRoomType.pricePerNight,
            total: selectedRoomType.pricePerNight,
            features: selectedRoomType.features || ["City View", "Free WiFi"],
            maxOccupancy: 2,
            bedType: selectedRoomType.details || "Comfortable bed",
          }}
          hotel={{
            id: hotel.id,
            name: hotel.name,
            location: hotel.location,
            rating: hotel.rating,
            image: hotel.image,
          }}
          isOpen={isBargainModalOpen}
          onClose={() => {
            setIsBargainModalOpen(false);
            setSelectedRoomType(null);
            setBargainingRoomId(null);
          }}
          checkInDate={checkInDate}
          checkOutDate={checkOutDate}
          roomsCount={parseInt(roomsParam || "1")}
          onBookingSuccess={(finalPrice) => {
            setIsBargainModalOpen(false);
            handleBooking(selectedRoomType, finalPrice);
            // Mark room as successfully bargained
            if (selectedRoomType) {
              setBargainedRooms(
                (prev) => new Set([...prev, selectedRoomType.id]),
              );
            }
            setSelectedRoomType(null);
            setBargainingRoomId(null);
          }}
        />
      )}

      {/* Write Review Modal */}
      <Dialog
        open={isWriteReviewModalOpen}
        onOpenChange={setIsWriteReviewModalOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              📝 Write a review for {hotel.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Overall rating *
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="w-6 h-6 text-gray-300 hover:text-yellow-400 cursor-pointer"
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Rate your experience
                </label>
                <div className="space-y-3">
                  {["Staff", "Cleanliness", "Value for money", "Free WiFi"].map(
                    (category) => (
                      <div
                        key={category}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm">{category}</span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className="w-4 h-4 text-gray-300 hover:text-yellow-400 cursor-pointer"
                            />
                          ))}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
              <div>
                <div className="space-y-3">
                  {["Facilities", "Comfort", "Location"].map((category) => (
                    <div
                      key={category}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm">{category}</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className="w-4 h-4 text-gray-300 hover:text-yellow-400 cursor-pointer"
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Review title *
              </label>
              <input
                type="text"
                placeholder="Give your review a title"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Tell us about your experience *
              </label>
              <textarea
                placeholder="Share your experience to help other travelers"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Your name *
                </label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Country *
                </label>
                <input
                  type="text"
                  placeholder="Enter your country"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Room type
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option>Select room type</option>
                  <option>Twin Room with Skyline View</option>
                  <option>King Room with Skyline View</option>
                  <option>Superior King Room</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Date of stay
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Type of trip
              </label>
              <div className="flex gap-2">
                {["Leisure", "Business", "Family", "Couple", "Solo travel"].map(
                  (type) => (
                    <Button
                      key={type}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      {type}
                    </Button>
                  ),
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => setIsWriteReviewModalOpen(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setIsWriteReviewModalOpen(false);
                  // Handle review submission here
                }}
                className="flex-1 bg-blue-700 hover:bg-blue-800 text-white"
              >
                Submit Review
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
