import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/contexts/CurrencyContext";
import { sightseeingService } from "@/services/sightseeingService";
import {
  MapPin,
  Star,
  Clock,
  Heart,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle,
  Building2,
  Mountain,
  Utensils,
  Music,
  Camera,
  Ticket,
  Calendar,
  Shield,
  Eye,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SightseeingAttraction {
  id: string;
  name: string;
  location: string;
  images: string[];
  rating: number;
  reviews: number;
  originalPrice: number;
  currentPrice: number;
  description: string;
  category:
    | "museum"
    | "landmark"
    | "tour"
    | "activity"
    | "food"
    | "culture"
    | "adventure";
  duration: string;
  highlights: string[];
  includes: string[];
  availableSlots: {
    date: string;
    times: string[];
  }[];
  features: string[];
  ticketTypes: {
    name: string;
    price: number;
    features: string[];
  }[];
}

interface SightseeingCardProps {
  attraction: SightseeingAttraction;
  onBargainClick: () => void;
  searchParams: URLSearchParams;
  className?: string;
  isSelected?: boolean;
  onSelect?: (attraction: SightseeingAttraction) => void;
}

export function SightseeingCard({
  attraction,
  onBargainClick,
  searchParams,
  className,
  isSelected = false,
  onSelect,
}: SightseeingCardProps) {
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Get adults count from search params
  const adults = parseInt(searchParams.get("adults") || "2");
  const children = parseInt(searchParams.get("children") || "0");
  const infants = parseInt(searchParams.get("infants") || "0");

  // Calculate price using SightseeingService for consistency
  const priceCalc = sightseeingService.calculatePrice(
    attraction.currentPrice,
    adults,
    children,
    infants,
  );
  const totalPrice = priceCalc.totalPrice;
  const pricePerPerson = sightseeingService.calculatePrice(
    attraction.currentPrice,
    1,
    0,
    0,
  ).totalPrice;

  // Handle star/reviews click to navigate to details with reviews tab
  const handleReviewsClick = () => {
    navigate(`/sightseeing/${attraction.id}?tab=reviews`);
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "landmark":
        return Building2;
      case "museum":
        return Camera;
      case "tour":
        return Ticket;
      case "adventure":
        return Mountain;
      case "food":
        return Utensils;
      case "culture":
        return Music;
      default:
        return Camera;
    }
  };

  const CategoryIcon = getCategoryIcon(attraction.category);

  // Navigation handlers
  const handleViewDetails = () => {
    const params = new URLSearchParams(searchParams);
    navigate(`/sightseeing/${attraction.id}?${params.toString()}`);
  };

  // Selection handler
  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(attraction);
    }
  };

  // Image navigation
  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev === attraction.images.length - 1 ? 0 : prev + 1,
    );
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev === 0 ? attraction.images.length - 1 : prev - 1,
    );
  };

  // Wishlist toggle
  const toggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  return (
    <>
      <div
        className={cn(
          "bg-white rounded-lg border-2 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group mb-4",
          isSelected
            ? "border-[#ff6b00] shadow-lg ring-2 ring-[#ff6b00] ring-opacity-30"
            : "border-gray-200 hover:border-[#003580]",
          className,
        )}
        onClick={handleViewDetails}
      >
        {/* Mobile Layout - Native App Style */}
        <div className="md:hidden">
          {/* Mobile Image */}
          <div className="relative h-48 overflow-hidden">
            <img
              src={attraction.images[currentImageIndex]}
              alt={attraction.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />

            {/* Category Badge */}
            <div className="absolute top-3 left-3">
              <Badge className="bg-black bg-opacity-70 text-white shadow-lg border-0">
                <CategoryIcon className="w-3 h-3 mr-1" />
                {attraction.category.charAt(0).toUpperCase() +
                  attraction.category.slice(1)}
              </Badge>
            </div>

            {/* Selection Indicator - Bottom Right */}
            <div className="absolute bottom-3 right-3">
              <div className="w-8 h-8 bg-[#ff6b00] rounded-full flex items-center justify-center shadow-lg">
                <Eye className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          {/* Mobile Content */}
          <div className="p-4">
            {/* Header Section */}
            <div className="mb-3">
              <h3 className="font-bold text-gray-900 text-lg leading-tight mb-2">
                {attraction.name}
              </h3>
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                <span className="flex-1">{attraction.location}</span>
              </div>
            </div>

            {/* Rating and Duration Row */}
            <div className="flex items-center justify-between mb-3">
              <div
                className="flex items-center cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleReviewsClick();
                }}
              >
                <div className="flex items-center bg-[#003580] text-white px-2 py-1 rounded-md text-sm font-medium">
                  <Star className="w-3 h-3 mr-1 fill-current" />
                  {attraction.rating}
                </div>
                <span className="text-sm text-[#003580] ml-2 font-medium">
                  {attraction.reviews.toLocaleString()} reviews
                </span>
              </div>
              <div className="flex items-center text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                <Clock className="w-4 h-4 mr-1" />
                {attraction.duration}
              </div>
            </div>

            {/* Price Section - Above SELECT */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatPrice(totalPrice)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatPrice(pricePerPerson)} per person
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500 mb-1">
                    For {searchParams.get("adults") || "2"} adult
                    {parseInt(searchParams.get("adults") || "2") > 1 ? "s" : ""}
                    {parseInt(searchParams.get("children") || "0") > 0 &&
                      `, ${searchParams.get("children")} children`}
                  </div>
                  <div className="text-xs text-green-600 font-medium">
                    • Free cancellation
                  </div>
                </div>
              </div>
            </div>

            {/* Features - Compact List */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span className="flex-1">{attraction.highlights[0]}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <span>Reserve now, pay later</span>
              </div>
            </div>

            {/* SELECT Button - Native App Style */}
            <div className="pt-2">
              <button
                onClick={handleSelect}
                className={cn(
                  "w-full py-3 px-4 rounded-full font-semibold text-sm transition-all duration-200 shadow-sm active:scale-95 flex items-center justify-center gap-2 border",
                  isSelected
                    ? "bg-[#003580] text-white border-[#003580] hover:bg-[#002a66] shadow-md"
                    : "bg-white border-[#003580] text-[#003580] hover:bg-[#f0f4ff] hover:shadow-md",
                )}
              >
                {isSelected ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">SELECTED</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    <span className="text-sm">SELECT</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex h-72">
          {/* Desktop Image */}
          <div className="relative w-64 h-full overflow-hidden flex-shrink-0">
            <img
              src={attraction.images[currentImageIndex]}
              alt={attraction.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />

            {/* Category Badge */}
            <div className="absolute top-3 left-3">
              <Badge className="bg-white text-gray-800 shadow-sm">
                <CategoryIcon className="w-3 h-3 mr-1" />
                {attraction.category.charAt(0).toUpperCase() +
                  attraction.category.slice(1)}
              </Badge>
            </div>

            {/* Wishlist */}
            <button
              onClick={toggleWishlist}
              className="absolute top-3 right-3 w-8 h-8 bg-white bg-opacity-90 rounded-full flex items-center justify-center shadow-sm"
            >
              <Heart
                className={cn(
                  "w-4 h-4",
                  isWishlisted ? "text-red-500 fill-current" : "text-gray-600",
                )}
              />
            </button>
          </div>

          {/* Desktop Content */}
          <div className="flex-1 flex">
            {/* Left Content */}
            <div className="flex-1 p-4">
              <h3 className="font-semibold text-gray-900 text-xl line-clamp-1 mb-2">
                {attraction.name}
              </h3>

              <div className="flex items-center text-sm text-gray-600 mb-2">
                <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                <span className="truncate">{attraction.location}</span>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div
                  className="flex items-center cursor-pointer hover:bg-gray-50 px-2 py-1 rounded-md transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReviewsClick();
                  }}
                  title="Click to view reviews"
                >
                  <div className="flex items-center bg-blue-600 text-white px-2 py-1 rounded text-sm font-medium">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    {attraction.rating}
                  </div>
                  <span className="text-sm text-blue-600 ml-2 font-medium underline decoration-1 underline-offset-2">
                    {attraction.reviews.toLocaleString()} reviews
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-1" />
                  {attraction.duration}
                </div>
              </div>

              {/* Highlights and Features */}
              <div className="space-y-2 mb-4">
                {attraction.highlights.slice(0, 2).map((highlight, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-sm text-gray-600"
                  >
                    <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                    <span className="truncate">{highlight}</span>
                  </div>
                ))}
              </div>

              {/* Features - Moved to Left Side */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Free cancellation</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <span>Reserve now, pay later</span>
                </div>
              </div>
            </div>

            {/* Right Content - Pricing & Actions */}
            <div className="w-64 border-l border-gray-200 bg-gray-50 p-6 flex flex-col justify-between">
              <div>
                <div className="text-right mb-6">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {formatPrice(totalPrice)}
                  </div>
                  <div className="text-sm text-gray-600 mb-4">
                    {formatPrice(pricePerPerson)} per person
                  </div>
                </div>
              </div>

              {/* DESKTOP BUTTONS - GUARANTEED VISIBLE */}
              <div
                style={{
                  paddingTop: "16px",
                  borderTop: "1px solid #e5e7eb",
                  marginTop: "16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onBargainClick();
                    }}
                    style={{
                      backgroundColor: "#febb02",
                      color: "#000000",
                      border: "none",
                      borderRadius: "6px",
                      padding: "14px 18px",
                      fontWeight: "600",
                      fontSize: "14px",
                      minHeight: "44px",
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      cursor: "pointer",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    }}
                  >
                    <TrendingDown size={14} />
                    Bargain Now
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetails();
                    }}
                    style={{
                      backgroundColor: "#003580",
                      color: "#ffffff",
                      border: "1px solid #003580",
                      borderRadius: "6px",
                      padding: "10px 16px",
                      fontWeight: "600",
                      fontSize: "13px",
                      minHeight: "40px",
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      cursor: "pointer",
                      boxShadow: "0 1px 3px rgba(0,53,128,0.15)",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#002a66";
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow =
                        "0 2px 8px rgba(0,53,128,0.25)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#003580";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 1px 3px rgba(0,53,128,0.15)";
                    }}
                  >
                    <Eye size={14} />
                    SELECT
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Gallery Modal */}
      {showImageGallery && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setShowImageGallery(false)}
              className="absolute top-4 right-4 w-10 h-10 bg-white bg-opacity-20 text-white rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all z-10"
            >
              <X className="w-6 h-6" />
            </button>

            <img
              src={attraction.images[currentImageIndex]}
              alt={attraction.name}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}
