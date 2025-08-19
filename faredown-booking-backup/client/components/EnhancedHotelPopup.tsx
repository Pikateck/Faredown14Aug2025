import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Star,
  MapPin,
  Users,
  Calendar,
  Wifi,
  Car,
  Coffee,
  Dumbbell,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  X,
  ExternalLink,
  Phone,
  Mail,
  Clock,
  Check,
  TrendingDown,
} from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatPriceWithSymbol, calculateTotalPrice } from "@/lib/pricing";

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
  roomTypes?: Array<{
    name: string;
    price: number;
    features: string[];
  }>;
}

interface EnhancedHotelPopupProps {
  hotel: Hotel;
  children: React.ReactNode;
  checkInDate?: Date;
  checkOutDate?: Date;
  roomsCount?: number;
}

const getAmenityIcon = (amenity: string) => {
  const icons: { [key: string]: React.ComponentType<any> } = {
    wifi: Wifi,
    parking: Car,
    restaurant: Coffee,
    gym: Dumbbell,
    pool: Coffee, // Using Coffee as placeholder
    spa: Coffee,
    "room service": Coffee,
    concierge: Coffee,
    laundry: Coffee,
  };

  const IconComponent = icons[amenity.toLowerCase()] || Check;
  return <IconComponent className="w-4 h-4" />;
};

export function EnhancedHotelPopup({
  hotel,
  children,
  checkInDate = new Date(),
  checkOutDate = new Date(Date.now() + 24 * 60 * 60 * 1000),
  roomsCount = 1,
}: EnhancedHotelPopupProps) {
  const navigate = useNavigate();
  const { selectedCurrency } = useCurrency();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const nights = Math.ceil(
    (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % hotel.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + hotel.images.length) % hotel.images.length,
    );
  };

  const handleViewDetails = () => {
    navigate(`/hotels/${hotel.id}`);
  };

  const handleBookNow = () => {
    const params = new URLSearchParams({
      hotelId: hotel.id.toString(),
      checkIn: checkInDate.toISOString().split("T")[0],
      checkOut: checkOutDate.toISOString().split("T")[0],
      rooms: roomsCount.toString(),
      price: hotel.currentPrice.toString(),
    });
    navigate(`/reserve?${params.toString()}`);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: hotel.name,
          text: `Check out ${hotel.name} in ${hotel.location}`,
          url: `${window.location.origin}/hotels/${hotel.id}`,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      await navigator.clipboard.writeText(
        `${window.location.origin}/hotels/${hotel.id}`,
      );
    }
  };

  const pricing = calculateTotalPrice(hotel.currentPrice, nights, roomsCount);
  const originalPricing = calculateTotalPrice(
    hotel.originalPrice,
    nights,
    roomsCount,
  );

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "amenities", label: "Amenities" },
    { id: "rooms", label: "Rooms" },
    { id: "location", label: "Location" },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <div className="relative">
          {/* Header with close button */}
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="sr-only">{hotel.name}</DialogTitle>
          </DialogHeader>

          {/* Image Gallery */}
          <div className="relative mb-6">
            <img
              src={hotel.images[currentImageIndex]}
              alt={hotel.name}
              className="w-full h-64 object-cover"
            />
            {hotel.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1">
                  {hotel.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full ${
                        index === currentImageIndex
                          ? "bg-white"
                          : "bg-white bg-opacity-50"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="px-6">
            {/* Hotel Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {hotel.name}
                </h2>
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="text-sm">{hotel.location}</span>
                </div>
                <div className="flex items-center mb-3">
                  <div className="flex items-center">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(hotel.rating)
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-sm font-medium">
                    {hotel.rating}
                  </span>
                  <span className="ml-1 text-sm text-gray-600">
                    ({hotel.reviews} reviews)
                  </span>
                </div>
              </div>
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={`p-2 rounded-full ${
                    isLiked
                      ? "bg-red-100 text-red-600"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <Heart className="w-4 h-4" />
                </button>
                <button
                  onClick={handleShare}
                  className="p-2 rounded-full bg-gray-100 text-gray-600"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold text-blue-600">
                    {formatPriceWithSymbol(
                      pricing.total,
                      selectedCurrency.code,
                    )}
                  </span>
                  <span className="text-sm text-gray-600 ml-2">
                    for {nights} {nights === 1 ? "night" : "nights"}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Includes taxes and fees
              </p>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200 mb-4">
              <nav className="flex space-x-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="mb-6">
              {/* Overview Tab */}
              {activeTab === "overview" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">About this hotel</h3>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {hotel.description}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Top amenities</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {hotel.amenities.slice(0, 6).map((amenity, index) => (
                        <div key={index} className="flex items-center text-sm">
                          {getAmenityIcon(amenity)}
                          <span className="ml-2">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Amenities Tab */}
              {activeTab === "amenities" && (
                <div>
                  <h3 className="font-semibold mb-3">All Amenities</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {hotel.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center text-sm">
                        {getAmenityIcon(amenity)}
                        <span className="ml-2">{amenity}</span>
                      </div>
                    ))}
                  </div>
                  {hotel.features && hotel.features.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Special Features</h4>
                      <div className="flex flex-wrap gap-2">
                        {hotel.features.map((feature, index) => (
                          <Badge key={index} variant="secondary">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Rooms Tab */}
              {activeTab === "rooms" && (
                <div>
                  <h3 className="font-semibold mb-3">Room Types</h3>
                  {hotel.roomTypes && hotel.roomTypes.length > 0 ? (
                    <div className="space-y-3">
                      {hotel.roomTypes.map((room, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg p-3"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{room.name}</h4>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {room.features.map((feature, idx) => (
                                  <Badge
                                    key={idx}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {feature}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-blue-600">
                                {formatPriceWithSymbol(
                                  room.price,
                                  selectedCurrency.code,
                                )}
                              </div>
                              <div className="text-xs text-gray-600">
                                per night
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <p>Room details available upon booking</p>
                    </div>
                  )}
                </div>
              )}

              {/* Location Tab */}
              {activeTab === "location" && (
                <div>
                  <h3 className="font-semibold mb-3">Location</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-sm">{hotel.location}</span>
                    </div>
                    <div className="bg-gray-100 h-32 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500 text-sm">
                        Interactive map would be displayed here
                      </span>
                    </div>
                    <div className="text-xs text-gray-600">
                      <p>• Walking distance to major attractions</p>
                      <p>• Close to public transportation</p>
                      <p>• Easy airport access</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pb-6">
              <Button
                onClick={handleViewDetails}
                variant="outline"
                className="flex-1"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Details
              </Button>
              <Button
                onClick={() => {
                  // Simple bargain trigger - in a real app, this would open the bargain modal
                  const params = new URLSearchParams({
                    hotelId: hotel.id.toString(),
                    checkIn: checkInDate.toISOString().split("T")[0],
                    checkOut: checkOutDate.toISOString().split("T")[0],
                    rooms: roomsCount.toString(),
                    price: hotel.currentPrice.toString(),
                    bargain: "true",
                  });
                  navigate(`/reserve?${params.toString()}`);
                }}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
              >
                <TrendingDown className="w-4 h-4 mr-2" />
                Bargain
              </Button>
              <Button onClick={handleBookNow} className="flex-1">
                Book Now
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
