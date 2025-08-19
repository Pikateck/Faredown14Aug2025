import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { HotelCard } from "@/components/HotelCard";
import { BookingSearchForm } from "@/components/BookingSearchForm";
import { FlightStyleBargainModal } from "@/components/FlightStyleBargainModal";
import { EnhancedFilters } from "@/components/EnhancedFilters";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  SlidersHorizontal,
  MapPin,
  CalendarIcon,
  Users,
  Star,
  Filter,
  TrendingDown,
  Grid,
  List,
} from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatPriceWithSymbol } from "@/lib/pricing";

interface Hotel {
  id: number;
  name: string;
  location: string;
  images: string[];
  rating: number;
  reviews: number;
  originalPrice: number;
  currentPrice: number;
  description: string;
  amenities: string[];
  features: string[];
  roomTypes: {
    name: string;
    price: number;
    features: string[];
  }[];
}

export default function HotelResults() {
  const [searchParams] = useSearchParams();
  const { selectedCurrency } = useCurrency();
  const [sortBy, setSortBy] = useState("recommended");
  const [priceRange, setPriceRange] = useState([0, 50000]); // Appropriate range for INR
  const [selectedRating, setSelectedRating] = useState<number[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [isBargainModalOpen, setIsBargainModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  // Get search parameters
  const destination = searchParams.get("destination") || "";
  const checkIn = searchParams.get("checkIn") || "";
  const checkOut = searchParams.get("checkOut") || "";
  const adults = searchParams.get("adults") || "2";
  const children = searchParams.get("children") || "0";
  const rooms = searchParams.get("rooms") || "1";

  // Handle search function
  const handleSearch = () => {
    // For now, just refresh the page with current parameters
    // In a real app, this would trigger a new search
    window.location.reload();
  };

  // Mock hotel data (prices in INR to avoid double currency conversion)
  const mockHotels: Hotel[] = [
    {
      id: 1,
      name: "Grand Plaza Hotel",
      location: `${destination || "New York, NY"}`,
      images: [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600",
        "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600",
        "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600",
      ],
      rating: 4.8,
      reviews: 1234,
      originalPrice: 24675, // ~₹299 USD equivalent in INR
      currentPrice: 14765, // ~₹179 USD equivalent in INR
      description:
        "Experience luxury in the heart of the city with stunning views, world-class amenities, and exceptional service.",
      amenities: ["WiFi", "Parking", "Restaurant", "Gym", "Pool", "Spa"],
      features: ["City View", "Business Center", "Concierge", "Room Service"],
      roomTypes: [
        {
          name: "Standard Room",
          price: 14765, // ~₹179 USD equivalent in INR
          features: ["King Bed", "City View", "Free WiFi"],
        },
        {
          name: "Deluxe Suite",
          price: 21370, // ~₹259 USD equivalent in INR
          features: ["Living Area", "Ocean View", "Mini Bar"],
        },
        {
          name: "Presidential Suite",
          price: 41170, // ~₹499 USD equivalent in INR
          features: ["2 Bedrooms", "Private Balcony", "Butler Service"],
        },
      ],
    },
    {
      id: 2,
      name: "Ocean View Resort",
      location: `${destination || "Miami, FL"}`,
      images: [
        "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600",
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600",
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600",
      ],
      rating: 4.6,
      reviews: 856,
      originalPrice: 37040, // ~₹449 USD equivalent in INR
      currentPrice: 22195, // ~₹269 USD equivalent in INR
      description:
        "Beachfront paradise with pristine white sand beaches, crystal clear waters, and tropical luxury.",
      amenities: ["Beach Access", "Spa", "Restaurant", "Bar", "WiFi", "Pool"],
      features: [
        "Beachfront",
        "All-Inclusive Available",
        "Water Sports",
        "Sunset Views",
      ],
      roomTypes: [
        {
          name: "Ocean View Room",
          price: 22195, // ~₹269 USD equivalent in INR
          features: ["Queen Bed", "Ocean View", "Balcony"],
        },
        {
          name: "Beach Villa",
          price: 32920, // ~₹399 USD equivalent in INR
          features: ["Private Beach Access", "Outdoor Shower", "Terrace"],
        },
      ],
    },
    {
      id: 3,
      name: "Mountain Lodge",
      location: `${destination || "Aspen, Colorado"}`,
      images: [
        "https://images.unsplash.com/photo-1549294413-26f195200c16?w=600",
        "https://images.unsplash.com/photo-1578645510447-e20b4311e3ce?w=600",
      ],
      rating: 4.9,
      reviews: 567,
      originalPrice: 16420, // ~₹199 USD equivalent in INR
      currentPrice: 10640, // ~₹129 USD equivalent in INR
      description:
        "Cozy mountain retreat with fireplace, ski-in/ski-out access, and breathtaking alpine views.",
      amenities: ["Ski Access", "Fireplace", "Spa", "Restaurant", "WiFi"],
      features: ["Ski-in/Ski-out", "Mountain Views", "Fireplace", "Hot Tub"],
      roomTypes: [
        {
          name: "Standard Room",
          price: 10640, // ~₹129 USD equivalent in INR
          features: ["Fireplace", "Mountain View", "Cozy Decor"],
        },
        {
          name: "Alpine Suite",
          price: 16420, // ~₹199 USD equivalent in INR
          features: ["Separate Living Area", "Hot Tub", "Ski Storage"],
        },
      ],
    },
  ];

  const handleBargainClick = (
    hotel: Hotel,
    currentSearchParams?: URLSearchParams,
  ) => {
    setSelectedHotel(hotel);
    setIsBargainModalOpen(true);
  };

  const handleClearFilters = () => {
    setPriceRange([0, 50000]); // Appropriate range for INR
    setSelectedRating([]);
    setSelectedAmenities([]);
    setSortBy("recommended");
  };

  const filteredHotels = mockHotels.filter((hotel) => {
    const withinPriceRange =
      hotel.currentPrice >= priceRange[0] &&
      hotel.currentPrice <= priceRange[1];
    const meetsRating =
      selectedRating.length === 0 ||
      selectedRating.some((rating) => hotel.rating >= rating);
    const hasAmenities =
      selectedAmenities.length === 0 ||
      selectedAmenities.every((amenity) => hotel.amenities.includes(amenity));

    return withinPriceRange && meetsRating && hasAmenities;
  });

  const sortedHotels = [...filteredHotels].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.currentPrice - b.currentPrice;
      case "price-high":
        return b.currentPrice - a.currentPrice;
      case "rating":
        return b.rating - a.rating;
      case "savings":
        return (
          b.originalPrice - b.currentPrice - (a.originalPrice - a.currentPrice)
        );
      default:
        return b.rating - a.rating;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hotel Search Bar - Booking.com style */}
      <div className="bg-[#003580] py-2 sm:py-4">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-8">
          <BookingSearchForm />
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-2">
          <div className="flex items-center text-sm text-gray-600">
            <span>United Arab Emirates</span>
            <span className="mx-2">›</span>
            <span>Dubai</span>
            <span className="mx-2">›</span>
            <span className="text-gray-900 font-medium">Search results</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
        <div className="flex gap-4 sm:gap-6">
          {/* Desktop Filters */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 sticky top-24">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Filter className="w-5 h-5 mr-2 text-[#003580]" />
                Filter by
              </h3>
              <EnhancedFilters
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                selectedAmenities={selectedAmenities}
                setSelectedAmenities={setSelectedAmenities}
                sortBy={sortBy}
                setSortBy={setSortBy}
                onClearFilters={handleClearFilters}
              />
            </div>
          </div>

          {/* Mobile Filter Button */}
          <div className="lg:hidden fixed bottom-4 left-4 z-50">
            <Sheet>
              <SheetTrigger asChild>
                <Button className="rounded-full w-12 h-12 sm:w-14 sm:h-14 shadow-lg touch-manipulation">
                  <SlidersHorizontal className="w-5 h-5 sm:w-6 sm:h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 sm:w-96">
                <SheetHeader>
                  <SheetTitle className="flex items-center text-sm sm:text-base">
                    <Filter className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-[#003580]" />
                    Filter by
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <EnhancedFilters
                    priceRange={priceRange}
                    setPriceRange={setPriceRange}
                    selectedAmenities={selectedAmenities}
                    setSelectedAmenities={setSelectedAmenities}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    onClearFilters={handleClearFilters}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Results */}
          <div className="flex-1">
            {/* Results Header with View Toggle and Sort */}
            <div className="mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-3 sm:gap-0">
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                    Dubai: {sortedHotels.length} properties found
                  </h1>
                  <p className="text-gray-600 mt-1 text-sm sm:text-base">
                    Search for great hotels, homes and much more...
                  </p>
                </div>

                {/* View Mode Toggle - Hidden on mobile, shown on tablet+ */}
                <div className="hidden md:flex items-center space-x-2 flex-shrink-0">
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="p-2 touch-manipulation"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="p-2 touch-manipulation"
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Sort Dropdown for Mobile/Tablet */}
              <div className="lg:hidden mb-3 sm:mb-4">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full h-10 sm:h-12 text-sm sm:text-base touch-manipulation">
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      value="recommended"
                      className="text-sm sm:text-base"
                    >
                      Our top picks
                    </SelectItem>
                    <SelectItem
                      value="price-low"
                      className="text-sm sm:text-base"
                    >
                      Price (lowest first)
                    </SelectItem>
                    <SelectItem
                      value="price-high"
                      className="text-sm sm:text-base"
                    >
                      Price (highest first)
                    </SelectItem>
                    <SelectItem value="rating" className="text-sm sm:text-base">
                      Best reviewed & lowest price
                    </SelectItem>
                    <SelectItem
                      value="stars-high"
                      className="text-sm sm:text-base"
                    >
                      Property rating (high to low)
                    </SelectItem>
                    <SelectItem
                      value="distance"
                      className="text-sm sm:text-base"
                    >
                      Distance from downtown
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6"
                  : "space-y-3 sm:space-y-6"
              }
            >
              {sortedHotels.map((hotel) => (
                <HotelCard
                  key={hotel.id}
                  hotel={hotel}
                  onBargainClick={handleBargainClick}
                  viewMode={viewMode}
                />
              ))}
            </div>

            {sortedHotels.length === 0 && (
              <div className="text-center py-8 sm:py-12 px-4">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                  No hotels found
                </h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  Try adjusting your filters or search criteria
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <FlightStyleBargainModal
        roomType={
          selectedHotel
            ? {
                id: "standard",
                name: "Standard Room",
                description: "Comfortable standard room",
                image: selectedHotel.images[0],
                marketPrice: selectedHotel.originalPrice,
                totalPrice: selectedHotel.currentPrice,
                features: selectedHotel.features || [],
                maxOccupancy: 2,
                bedType: "1 double bed",
                size: "6.7 km from downtown",
                cancellation: "Free cancellation",
              }
            : null
        }
        hotel={
          selectedHotel
            ? {
                id: selectedHotel.id,
                name: selectedHotel.name,
                location: selectedHotel.location,
                checkIn:
                  searchParams.get("checkIn") || new Date().toISOString(),
                checkOut:
                  searchParams.get("checkOut") ||
                  new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
              }
            : null
        }
        isOpen={isBargainModalOpen}
        onClose={() => {
          setIsBargainModalOpen(false);
          setSelectedHotel(null);
        }}
        checkInDate={
          searchParams.get("checkIn")
            ? new Date(searchParams.get("checkIn")!)
            : new Date()
        }
        checkOutDate={
          searchParams.get("checkOut")
            ? new Date(searchParams.get("checkOut")!)
            : new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
        roomsCount={parseInt(searchParams.get("rooms") || "1")}
      />
    </div>
  );
}
