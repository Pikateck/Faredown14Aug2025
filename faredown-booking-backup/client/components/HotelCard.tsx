import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  MapPin,
  Wifi,
  Car,
  Coffee,
  Dumbbell,
  Heart,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  Calendar,
  Users,
} from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import {
  calculateTotalPrice,
  formatPriceWithSymbol,
  formatLocalPrice,
  calculateNights,
} from "@/lib/pricing";

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

interface HotelCardProps {
  hotel: Hotel;
  onBargainClick: (hotel: Hotel, searchParams?: URLSearchParams) => void;
  viewMode?: "grid" | "list";
}

const getAmenityIcon = (amenity: string) => {
  const icons: Record<string, React.ReactNode> = {
    wifi: <Wifi className="w-4 h-4" />,
    parking: <Car className="w-4 h-4" />,
    restaurant: <Coffee className="w-4 h-4" />,
    gym: <Dumbbell className="w-4 h-4" />,
  };

  return icons[amenity.toLowerCase()] || <Coffee className="w-4 h-4" />;
};

export function HotelCard({
  hotel,
  onBargainClick,
  viewMode = "list",
}: HotelCardProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { selectedCurrency } = useCurrency();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  // Get search parameters for price calculation
  const checkInDate = searchParams.get("checkIn")
    ? new Date(searchParams.get("checkIn")!)
    : new Date();
  const checkOutDate = searchParams.get("checkOut")
    ? new Date(searchParams.get("checkOut")!)
    : new Date(Date.now() + 24 * 60 * 60 * 1000);
  const roomsCount = parseInt(searchParams.get("rooms") || "1");
  const totalNights = calculateNights(checkInDate, checkOutDate);

  // Calculate total pricing
  const priceCalculation = calculateTotalPrice(
    hotel.currentPrice,
    totalNights,
    roomsCount,
  );

  // Removed discount calculation since we're not showing original prices

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === hotel.images.length - 1 ? 0 : prev + 1,
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? hotel.images.length - 1 : prev - 1,
    );
  };

  if (viewMode === "grid") {
    return (
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-lg group touch-manipulation">
        {/* Grid View - Vertical Layout */}
        <div className="flex flex-col">
          {/* Image Gallery */}
          <div className="relative w-full h-40 sm:h-48 md:h-56 flex-shrink-0">
            <img
              src={hotel.images[currentImageIndex]}
              alt={hotel.name}
              className="w-full h-full object-cover"
            />

            {/* Image Navigation */}
            {hotel.images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-700 w-8 h-8 p-0 touch-manipulation"
                  onClick={prevImage}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-700 w-8 h-8 p-0 touch-manipulation"
                  onClick={nextImage}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>

                {/* Image Dots */}
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                  {hotel.images.map((_, index) => (
                    <button
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors touch-manipulation ${
                        index === currentImageIndex ? "bg-white" : "bg-white/50"
                      }`}
                      onClick={() => setCurrentImageIndex(index)}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Like Button */}
            <Button
              variant="ghost"
              size="sm"
              className={`absolute top-3 right-3 w-8 h-8 p-0 touch-manipulation ${
                isLiked
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-white/80 hover:bg-white text-gray-700"
              }`}
              onClick={() => setIsLiked(!isLiked)}
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
            </Button>

            {/* Rating Badge */}
            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{hotel.rating}</span>
              <span className="text-xs text-gray-600">({hotel.reviews})</span>
            </div>
          </div>

          {/* Hotel Details */}
          <CardContent className="p-4 flex-1 flex flex-col">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#003580] transition-colors line-clamp-2">
                {hotel.name}
              </h3>

              <div className="flex items-center text-gray-600 mb-3">
                <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                <span className="text-sm truncate">{hotel.location}</span>
              </div>

              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {hotel.description}
              </p>

              {/* Features */}
              <div className="flex flex-wrap gap-1 mb-3">
                {hotel.features.slice(0, 2).map((feature) => (
                  <Badge key={feature} variant="secondary" className="text-xs">
                    {feature}
                  </Badge>
                ))}
                {hotel.features.length > 2 && (
                  <Badge variant="secondary" className="text-xs">
                    +{hotel.features.length - 2} more
                  </Badge>
                )}
              </div>

              {/* Amenities */}
              <div className="flex items-center space-x-3 mb-4 overflow-x-auto">
                {hotel.amenities.slice(0, 3).map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center space-x-1 text-gray-600 flex-shrink-0"
                    title={amenity}
                  >
                    {getAmenityIcon(amenity)}
                    <span className="text-xs whitespace-nowrap">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing and Actions */}
            <div className="mt-auto">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-bold text-[#003580]">
                      {formatLocalPrice(
                        priceCalculation.total,
                        selectedCurrency.code,
                      )}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    per night (incl. taxes)
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  className="flex-1 touch-manipulation text-sm"
                  onClick={() => {
                    const searchParamsString = searchParams.toString();
                    navigate(
                      `/hotels/${hotel.id}${searchParamsString ? `?${searchParamsString}` : ""}`,
                    );
                  }}
                >
                  View Details
                </Button>
                <Button
                  onClick={() => onBargainClick(hotel, searchParams)}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold touch-manipulation text-sm"
                >
                  <TrendingDown className="w-4 h-4 mr-1" />
                  Bargain
                </Button>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  // List View - Horizontal Layout (existing design)
  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-lg group touch-manipulation">
      <div className="flex flex-col sm:flex-row">
        {/* Image Gallery */}
        <div className="relative sm:w-64 md:w-80 h-48 sm:h-64 md:h-80 flex-shrink-0">
          <img
            src={hotel.images[currentImageIndex]}
            alt={hotel.name}
            className="w-full h-full object-cover"
          />

          {/* Image Navigation */}
          {hotel.images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="absolute left-1 sm:left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-700 w-7 h-7 sm:w-8 sm:h-8 p-0 touch-manipulation"
                onClick={prevImage}
              >
                <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-700 w-7 h-7 sm:w-8 sm:h-8 p-0 touch-manipulation"
                onClick={nextImage}
              >
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>

              {/* Image Dots */}
              <div className="absolute bottom-1 sm:bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                {hotel.images.map((_, index) => (
                  <button
                    key={index}
                    className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-colors touch-manipulation ${
                      index === currentImageIndex ? "bg-white" : "bg-white/50"
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                ))}
              </div>
            </>
          )}

          {/* Like Button */}
          <Button
            variant="ghost"
            size="sm"
            className={`absolute top-2 sm:top-4 right-2 sm:right-4 w-7 h-7 sm:w-8 sm:h-8 p-0 touch-manipulation ${
              isLiked
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-white/80 hover:bg-white text-gray-700"
            }`}
            onClick={() => setIsLiked(!isLiked)}
          >
            <Heart
              className={`w-3 h-3 sm:w-4 sm:h-4 ${isLiked ? "fill-current" : ""}`}
            />
          </Button>

          {/* Rating Badge */}
          <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 bg-white/90 backdrop-blur-sm rounded-full px-2 sm:px-3 py-1 flex items-center space-x-1">
            <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-xs sm:text-sm font-medium">
              {hotel.rating}
            </span>
            <span className="text-xs text-gray-600 hidden sm:inline">
              ({hotel.reviews})
            </span>
          </div>
        </div>

        {/* Hotel Details */}
        <CardContent className="flex-1 p-3 sm:p-4 md:p-6">
          <div className="flex justify-between items-start mb-3 sm:mb-4">
            <div className="min-w-0 flex-1">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2 group-hover:text-[#003580] transition-colors line-clamp-2">
                {hotel.name}
              </h3>
              <div className="flex items-center text-gray-600 mb-2 sm:mb-4">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                <span className="text-xs sm:text-sm truncate">
                  {hotel.location}
                </span>
              </div>
            </div>
          </div>

          <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3">
            {hotel.description}
          </p>

          {/* Features */}
          <div className="flex flex-wrap gap-1 mb-3 sm:mb-4">
            {hotel.features.slice(0, 3).map((feature) => (
              <Badge key={feature} variant="secondary" className="text-xs">
                {feature}
              </Badge>
            ))}
            {hotel.features.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{hotel.features.length - 3} more
              </Badge>
            )}
          </div>

          {/* Amenities */}
          <div className="flex items-center space-x-2 sm:space-x-4 mb-4 sm:mb-6 overflow-x-auto">
            {hotel.amenities.slice(0, 4).map((amenity) => (
              <div
                key={amenity}
                className="flex items-center space-x-1 text-gray-600 flex-shrink-0"
                title={amenity}
              >
                {getAmenityIcon(amenity)}
                <span className="text-xs hidden sm:inline whitespace-nowrap">
                  {amenity}
                </span>
              </div>
            ))}
          </div>

          {/* Pricing and Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
            <div className="min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-lg sm:text-2xl font-bold text-[#003580]">
                  {formatLocalPrice(
                    priceCalculation.total,
                    selectedCurrency.code,
                  )}
                </span>
              </div>
              <div className="text-xs sm:text-sm text-gray-600">
                per night (incl. taxes)
              </div>
            </div>

            <div className="flex space-x-2 flex-shrink-0">
              <Button
                variant="outline"
                className="hidden md:flex touch-manipulation"
                onClick={() => {
                  const searchParamsString = searchParams.toString();
                  navigate(
                    `/hotels/${hotel.id}${searchParamsString ? `?${searchParamsString}` : ""}`,
                  );
                }}
              >
                View Details
              </Button>

              <Button
                onClick={() => onBargainClick(hotel, searchParams)}
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold flex-1 sm:flex-none touch-manipulation text-sm sm:text-base"
              >
                <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Bargain
              </Button>

              <Button
                variant="outline"
                className="md:hidden touch-manipulation text-sm"
                onClick={() => {
                  const searchParamsString = searchParams.toString();
                  navigate(
                    `/hotels/${hotel.id}${searchParamsString ? `?${searchParamsString}` : ""}`,
                  );
                }}
              >
                Details
              </Button>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
