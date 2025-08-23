import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ErrorBanner } from "@/components/ErrorBanner";
import { FlightStyleBargainModal } from "@/components/FlightStyleBargainModal";
import { MobileSightseeingBooking } from "@/components/mobile/MobileSightseeingBooking";
import { MobileBargainModal } from "@/components/mobile/MobileBargainModal";
import { sightseeingService } from "@/services/sightseeingService";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCurrency } from "@/contexts/CurrencyContext";
import {
  MapPin,
  Star,
  Clock,
  Users,
  Camera,
  Heart,
  Share2,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle,
  Calendar,
  Building2,
  Mountain,
  Utensils,
  Music,
  Ticket,
  ArrowLeft,
  MessageSquare,
  Info,
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
    refundable: boolean;
    cancellationPolicy?: string;
  }[];
}

export default function SightseeingDetails() {
  const { attractionId } = useParams<{ attractionId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  const [attraction, setAttraction] = useState<SightseeingAttraction | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedTicketType, setSelectedTicketType] = useState(0);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [showTimeAlert, setShowTimeAlert] = useState(false);
  const [isBargainModalOpen, setIsBargainModalOpen] = useState(false);
  const [bargainTicketType, setBargainTicketType] = useState<number>(0);
  const [isMobile, setIsMobile] = useState(false);

  // Unified passenger quantities for all ticket types
  const [passengerQuantities, setPassengerQuantities] = useState({
    adults: 1, // Default to 1 adult
    children: 0,
    infants: 0,
  });
  const [activeTab, setActiveTab] = useState(() => {
    // Check if tab parameter is provided in URL
    const tabParam = searchParams.get("tab");
    return tabParam || "overview";
  });

  // Get adults count from search params
  const adults = parseInt(searchParams.get("adults") || "2");

  // Load attraction data
  useEffect(() => {
    const loadAttraction = async () => {
      setLoading(true);
      setError("");

      try {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Sample attraction data (in real app, this would come from API)
        const sampleAttractions: Record<string, SightseeingAttraction> = {
          "burj-khalifa": {
            id: "burj-khalifa",
            name: "Burj Khalifa: Floors 124 and 125",
            location: "Dubai, UAE",
            images: [
              "https://cdn.builder.io/api/v1/image/assets%2F4235b10530ff469795aa00c0333d773c%2F31c1e4a8ae8d4a1ab766aa8a4417f49e?format=webp&width=800",
              "https://cdn.builder.io/api/v1/image/assets%2F4235b10530ff469795aa00c0333d773c%2F31c1e4a8ae8d4a1ab766aa8a4417f49e?format=webp&width=800",
              "https://cdn.builder.io/api/v1/image/assets%2F4235b10530ff469795aa00c0333d773c%2F31c1e4a8ae8d4a1ab766aa8a4417f49e?format=webp&width=800",
            ],
            rating: 4.6,
            reviews: 45879,
            originalPrice: 189,
            currentPrice: 149,
            description:
              "Skip the line and enjoy breathtaking views from the world's tallest building. Experience Dubai from the clouds with stunning 360-degree panoramic views of the city's iconic skyline, desert, and ocean.",
            category: "landmark",
            duration: "1-2 hours",
            highlights: [
              "360-degree views of Dubai",
              "High-speed elevator experience",
              "Outdoor observation deck",
              "Interactive displays",
              "World's tallest building",
              "Skip-the-line access",
              "Professional photography opportunities",
              "Gift shop access",
            ],
            includes: [
              "Skip-the-line access",
              "Access to floors 124 & 125",
              "Outdoor observation deck",
              "Welcome refreshment",
              "High-speed elevator ride",
              "Interactive displays",
              "Professional guide (optional)",
              "Photography assistance",
            ],
            features: [
              "Skip the line",
              "Audio guide",
              "Mobile ticket",
              "Instant confirmation",
            ],
            availableSlots: [
              {
                date: new Date().toISOString(),
                times: [
                  "09:00",
                  "10:30",
                  "12:00",
                  "13:30",
                  "15:00",
                  "16:30",
                  "18:00",
                  "19:30",
                ],
              },
            ],
            ticketTypes: [
              {
                name: "Standard Admission",
                price: 149,
                refundable: false,
                cancellationPolicy: "Non-refundable",
                features: [
                  "Floors 124 & 125",
                  "Skip-the-line access",
                  "Outdoor deck",
                  "Welcome drink",
                ],
              },
              {
                name: "Prime Time",
                price: 199,
                refundable: true,
                cancellationPolicy:
                  "Free cancellation up to 24 hours before visit",
                features: [
                  "Floors 124 & 125",
                  "Skip-the-line access",
                  "Prime viewing times",
                  "Premium refreshments",
                  "Priority elevator",
                ],
              },
              {
                name: "VIP Experience",
                price: 299,
                refundable: true,
                cancellationPolicy:
                  "Free cancellation up to 48 hours before visit",
                features: [
                  "Floors 124, 125 & 148",
                  "Private elevator",
                  "VIP lounge access",
                  "Premium refreshments",
                  "Personal guide",
                  "Professional photos",
                ],
              },
            ],
          },
          "dubai-aquarium": {
            id: "dubai-aquarium",
            name: "Dubai Aquarium & Underwater Zoo",
            location: "Dubai, UAE",
            images: [
              "https://cdn.builder.io/api/v1/image/assets%2F4235b10530ff469795aa00c0333d773c%2F0e24b4a5623f4ee6ae7ed5c2b64e2e73?format=webp&width=800",
              "https://cdn.builder.io/api/v1/image/assets%2F4235b10530ff469795aa00c0333d773c%2F0e24b4a5623f4ee6ae7ed5c2b64e2e73?format=webp&width=800",
              "https://cdn.builder.io/api/v1/image/assets%2F4235b10530ff469795aa00c0333d773c%2F0e24b4a5623f4ee6ae7ed5c2b64e2e73?format=webp&width=800",
            ],
            rating: 4.4,
            reviews: 23156,
            originalPrice: 120,
            currentPrice: 89,
            description:
              "Explore one of the world's largest suspended aquariums with over 140 species",
            category: "museum",
            duration: "2-3 hours",
            highlights: [
              "48-meter aquarium tunnel",
              "King Crocodile encounter",
              "Underwater zoo experience",
              "Interactive touch tanks",
              "Shark feeding shows",
              "Educational presentations",
            ],
            includes: [
              "Aquarium tunnel access",
              "Underwater zoo entry",
              "King Crocodile viewing",
              "Touch tank experience",
              "Educational talks",
              "Mobile app guide",
            ],
            features: [
              "Mobile ticket",
              "Audio guide",
              "Photo opportunities",
              "Interactive experience",
            ],
            availableSlots: [
              {
                date: new Date().toISOString(),
                times: [
                  "10:00",
                  "11:00",
                  "12:00",
                  "14:00",
                  "15:00",
                  "16:00",
                  "17:00",
                ],
              },
            ],
            ticketTypes: [
              {
                name: "Aquarium + Zoo",
                price: 89,
                refundable: false,
                cancellationPolicy: "Non-refundable",
                features: [
                  "Aquarium access",
                  "Underwater zoo",
                  "Touch tanks",
                  "Educational talks",
                ],
              },
              {
                name: "Explorer Experience",
                price: 129,
                refundable: true,
                cancellationPolicy:
                  "Free cancellation up to 24 hours before visit",
                features: [
                  "All standard features",
                  "Behind-the-scenes tour",
                  "Feeding experience",
                  "VIP guide",
                ],
              },
            ],
          },
        };

        const attractionData = sampleAttractions[attractionId || ""];

        if (!attractionData) {
          setError("Attraction not found");
          return;
        }

        setAttraction(attractionData);
      } catch (err) {
        console.error("Error loading attraction:", err);
        setError("Failed to load attraction details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (attractionId) {
      loadAttraction();
    }
  }, [attractionId]);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Get category display info
  const getCategoryInfo = (category: string) => {
    switch (category) {
      case "landmark":
        return {
          label: "Landmarks & Attractions",
          color: "bg-blue-100 text-blue-800",
          IconComponent: Building2,
        };
      case "museum":
        return {
          label: "Museums & Culture",
          color: "bg-purple-100 text-purple-800",
          IconComponent: Camera,
        };
      case "tour":
        return {
          label: "Tours & Sightseeing",
          color: "bg-green-100 text-green-800",
          IconComponent: Ticket,
        };
      case "adventure":
        return {
          label: "Adventure & Sports",
          color: "bg-yellow-100 text-yellow-800",
          IconComponent: Mountain,
        };
      case "food":
        return {
          label: "Food & Dining",
          color: "bg-red-100 text-red-800",
          IconComponent: Utensils,
        };
      case "culture":
        return {
          label: "Cultural Experiences",
          color: "bg-indigo-100 text-indigo-800",
          IconComponent: Music,
        };
      default:
        return {
          label: "Experience",
          color: "bg-gray-100 text-gray-800",
          IconComponent: Camera,
        };
    }
  };

  // Navigation handlers
  const handleBookNow = (ticketIndex?: number) => {
    const ticketToBook =
      ticketIndex !== undefined ? ticketIndex : selectedTicketType;

    console.log("🎫 Book Now clicked!", {
      selectedTime,
      ticketIndex: ticketToBook,
      attractionId: attraction?.id,
      quantities: passengerQuantities,
    });

    if (!selectedTime) {
      console.log("❌ No time selected");
      setShowTimeAlert(true);
      return;
    }

    const params = new URLSearchParams(searchParams);
    params.set("attractionId", attraction?.id || "");
    params.set("ticketType", ticketToBook.toString());
    params.set("selectedTime", selectedTime);
    params.set("adults", passengerQuantities.adults.toString());
    params.set("children", passengerQuantities.children.toString());
    params.set("infants", passengerQuantities.infants.toString());

    // Add visitDate - use the current date if not already set
    if (!params.get("visitDate")) {
      params.set("visitDate", new Date().toISOString().split("T")[0]);
    }

    const bookingUrl = `/sightseeing/booking?${params.toString()}`;
    console.log("🚀 Navigating to:", bookingUrl);

    try {
      navigate(bookingUrl);
      console.log("✅ Navigation successful");
    } catch (error) {
      console.error("❌ Navigation failed:", error);
      alert("Navigation failed. Please try again.");
    }
  };

  const handleBackToResults = () => {
    const params = new URLSearchParams(searchParams);
    navigate(`/sightseeing/results?${params.toString()}`);
  };

  // Bargain functionality
  const handleBargainClick = (ticketIndex: number) => {
    console.log("🎯 handleBargainClick called!", {
      ticketIndex,
      currentModalState: isBargainModalOpen,
      attraction: attraction?.name,
    });

    setBargainTicketType(ticketIndex);
    setIsBargainModalOpen(true);
  };

  const handleBargainSuccess = (finalPrice: number) => {
    setIsBargainModalOpen(false);

    // Navigate to booking page with bargain price
    const params = new URLSearchParams(searchParams);
    params.set("attractionId", attraction?.id || "");
    params.set("ticketType", bargainTicketType.toString());
    params.set("selectedTime", selectedTime || "10:30");
    params.set("adults", passengerQuantities.adults.toString());
    params.set("children", passengerQuantities.children.toString());
    params.set("infants", passengerQuantities.infants.toString());
    params.set("bargainApplied", "true");
    params.set("bargainPrice", finalPrice.toString());

    // Add visitDate if not already set
    if (!params.get("visitDate")) {
      params.set("visitDate", new Date().toISOString().split("T")[0]);
    }

    navigate(`/sightseeing/booking?${params.toString()}`);
  };

  // Passenger quantity management
  const updatePassengerQuantity = (
    type: "adults" | "children" | "infants",
    change: number,
  ) => {
    setPassengerQuantities((prev) => {
      const newQuantity = Math.max(0, prev[type] + change);

      return {
        ...prev,
        [type]: newQuantity,
      };
    });
  };

  // Calculate total passengers
  const getTotalPassengers = () => {
    return (
      passengerQuantities.adults +
      passengerQuantities.children +
      passengerQuantities.infants
    );
  };

  // Calculate total price for a ticket type (including taxes)
  const getTicketTotalPrice = (ticketIndex: number) => {
    const ticket = attraction?.ticketTypes[ticketIndex];

    if (!ticket) return 0;

    const priceCalc = sightseeingService.calculatePrice(
      ticket.price,
      passengerQuantities.adults,
      passengerQuantities.children,
      passengerQuantities.infants,
    );

    return priceCalc.totalPrice;
  };

  // Image navigation
  const nextImage = () => {
    if (attraction) {
      setCurrentImageIndex((prev) =>
        prev === attraction.images.length - 1 ? 0 : prev + 1,
      );
    }
  };

  const prevImage = () => {
    if (attraction) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? attraction.images.length - 1 : prev - 1,
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading attraction details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !attraction) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Button
            onClick={handleBackToResults}
            variant="outline"
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Results
          </Button>
          <ErrorBanner
            message={error || "Attraction not found"}
            onClose={() => setError("")}
          />
        </div>
      </div>
    );
  }

  const categoryInfo = getCategoryInfo(attraction.category);
  const savings = attraction.originalPrice - attraction.currentPrice;
  const selectedTicket = attraction.ticketTypes[selectedTicketType];
  const totalPrice = selectedTicket.price * adults;
  const originalTotalPrice = attraction.originalPrice * adults;

  // Mobile view
  if (isMobile) {
    return (
      <>
        <MobileSightseeingBooking
          attraction={attraction}
          onBargain={handleBargainClick}
          onBookNow={handleBookNow}
          onBack={handleBackToResults}
          initialTime={selectedTime}
          initialTicketType={selectedTicketType}
          initialPassengers={passengerQuantities}
          onTimeChange={setSelectedTime}
          onTicketTypeChange={setSelectedTicketType}
          onPassengersChange={setPassengerQuantities}
        />

        {/* Time Selection Alert for Mobile */}
        <AlertDialog open={showTimeAlert} onOpenChange={setShowTimeAlert}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Select a time</AlertDialogTitle>
              <AlertDialogDescription>
                Please select a time slot for your visit before proceeding.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setShowTimeAlert(false)}>
                OK
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Sightseeing Bargain Modal for Mobile */}
        {attraction && (
          <MobileBargainModal
            isOpen={isBargainModalOpen}
            onClose={() => setIsBargainModalOpen(false)}
            onBargainSuccess={handleBargainSuccess}
            ticketName={
              attraction.ticketTypes[bargainTicketType]?.name ||
              "Standard Admission"
            }
            originalPrice={
              getTicketTotalPrice(bargainTicketType) ||
              attraction.ticketTypes[bargainTicketType]?.price ||
              149
            }
            venueName={attraction.name}
            ticketFeatures={
              attraction.ticketTypes[bargainTicketType]?.features || []
            }
          />
        )}
      </>
    );
  }

  // Desktop view
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Back Button */}
        <Button
          onClick={handleBackToResults}
          variant="outline"
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Results
        </Button>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Image Gallery */}
          <div className="relative h-96 overflow-hidden">
            <img
              src={attraction.images[currentImageIndex]}
              alt={attraction.name}
              className="w-full h-full object-cover"
            />

            {attraction.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-opacity"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-opacity"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                <div className="absolute bottom-4 right-4 bg-black bg-opacity-60 text-white text-sm px-3 py-1 rounded">
                  {currentImageIndex + 1} / {attraction.images.length}
                </div>
              </>
            )}

            {/* Overlays */}
            <div className="absolute top-4 left-4">
              <Badge className={categoryInfo.color}>
                <categoryInfo.IconComponent className="w-4 h-4 mr-2" />
                {categoryInfo.label}
              </Badge>
            </div>

            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className="w-10 h-10 bg-white bg-opacity-90 rounded-full flex items-center justify-center shadow-sm hover:bg-opacity-100 transition-all"
              >
                <Heart
                  className={cn(
                    "w-5 h-5 transition-colors",
                    isWishlisted
                      ? "text-red-500 fill-current"
                      : "text-gray-600",
                  )}
                />
              </button>
              <button className="w-10 h-10 bg-white bg-opacity-90 rounded-full flex items-center justify-center shadow-sm hover:bg-opacity-100 transition-all">
                <Share2 className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
              {/* Left Column - Details */}
              <div className="xl:col-span-3 space-y-6">
                {/* Header */}
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                    {attraction.name}
                  </h1>

                  <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      <span>{attraction.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      <span>{attraction.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      <span className="font-medium text-gray-900">
                        {attraction.rating}
                      </span>
                      <span className="text-sm">
                        ({attraction.reviews.toLocaleString()} reviews)
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-base sm:text-lg leading-relaxed font-normal">
                    {attraction.description}
                  </p>
                </div>

                {/* Tab Navigation */}
                <div className="border-b border-gray-200">
                  <nav className="flex space-x-8">
                    <button
                      onClick={() => setActiveTab("overview")}
                      className={cn(
                        "py-2 px-1 border-b-2 font-medium text-sm",
                        activeTab === "overview"
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700",
                      )}
                    >
                      Overview
                    </button>
                    <button
                      onClick={() => setActiveTab("reviews")}
                      className={cn(
                        "py-2 px-1 border-b-2 font-medium text-sm",
                        activeTab === "reviews"
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700",
                      )}
                    >
                      Reviews ({attraction.reviews.toLocaleString()})
                    </button>
                  </nav>
                </div>

                {/* Tab Content */}
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    {/* Highlights */}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">
                        Highlights
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {attraction.highlights.map((highlight, index) => (
                          <div
                            key={index}
                            className="flex items-center text-gray-600"
                          >
                            <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                            <span>{highlight}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* What's Included */}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">
                        What's Included
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {attraction.includes.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center text-gray-600"
                          >
                            <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Features */}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">
                        Features
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {attraction.features.map((feature, index) => (
                          <Badge key={index} variant="secondary">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "reviews" && (
                  <div id="reviews-section" className="bg-white rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-bold text-gray-900">
                        Visitor Reviews
                      </h2>
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg min-h-[44px] active:scale-95 transition-all duration-200 touch-manipulation">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Write Review
                      </Button>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 text-center mb-4">
                      <div className="text-2xl font-bold text-gray-900">
                        {attraction.rating}
                      </div>
                      <div className="text-sm text-gray-600">
                        Based on {attraction.reviews.toLocaleString()} reviews
                      </div>
                      <div className="flex justify-center mt-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(attraction.rating)
                                ? "text-blue-600 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Recent Reviews */}
                    <div className="space-y-3">
                      {[
                        {
                          name: "Sarah M.",
                          date: "2 days ago",
                          rating: 5,
                          comment:
                            "Incredible experience! The views were breathtaking and the staff was amazing.",
                        },
                        {
                          name: "John D.",
                          date: "1 week ago",
                          rating: 4,
                          comment:
                            "Great attraction, well organized and worth every penny. Highly recommend!",
                        },
                        {
                          name: "Emily R.",
                          date: "2 weeks ago",
                          rating: 5,
                          comment:
                            "Perfect for families. Kids loved it and we got some amazing photos.",
                        },
                        {
                          name: "Michael K.",
                          date: "3 weeks ago",
                          rating: 4,
                          comment:
                            "Skip-the-line tickets were worth it. Saved us hours of waiting.",
                        },
                      ].map((review, idx) => (
                        <div
                          key={idx}
                          className="border-b border-gray-100 pb-3 last:border-b-0"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm text-gray-900">
                              {review.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {review.date}
                            </span>
                          </div>
                          <div className="flex items-center mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < review.rating
                                    ? "text-blue-600 fill-current"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-sm text-gray-700">
                            {review.comment}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Write Another Review Button */}
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <Button
                        variant="outline"
                        className="w-full text-blue-600 border-blue-600 hover:bg-blue-50 font-medium py-3 min-h-[48px] active:scale-95 transition-all duration-200 touch-manipulation"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Share Your Experience
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Booking */}
              <div className="xl:col-span-2">
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm sticky top-6">
                  {/* Header */}
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Tickets and prices
                    </h3>
                  </div>

                  {/* Available Times */}
                  <div className="p-4 border-b border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-3">
                      Select times
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {attraction.availableSlots[0]?.times.map(
                        (time, index) => (
                          <Button
                            key={index}
                            variant={
                              selectedTime === time ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => {
                              console.log("⏰ Time selected:", time);
                              setSelectedTime(time);
                            }}
                            className={cn(
                              "text-sm border-2",
                              selectedTime === time
                                ? "bg-[#003580] text-white hover:bg-[#002a66] border-[#003580]"
                                : "border-gray-300 hover:border-[#003580] text-black bg-white",
                            )}
                          >
                            {time}
                          </Button>
                        ),
                      )}
                    </div>
                    {selectedTime && (
                      <div className="mt-2 text-sm text-green-600 font-medium">
                        ✓ Selected: {selectedTime}
                      </div>
                    )}
                  </div>

                  {/* Unified Passenger Selection */}
                  <div className="p-4 border-b border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-4">
                      How many tickets?
                    </h4>

                    {/* Adults */}
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="font-medium text-gray-900">
                          Adult (age 13+)
                        </div>
                        <div className="text-sm text-gray-500">Full price</div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updatePassengerQuantity("adults", -1)}
                          disabled={passengerQuantities.adults <= 0}
                          className="w-8 h-8 p-0"
                        >
                          -
                        </Button>
                        <span className="w-8 text-center font-medium">
                          {passengerQuantities.adults}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updatePassengerQuantity("adults", 1)}
                          className="w-8 h-8 p-0"
                        >
                          +
                        </Button>
                      </div>
                    </div>

                    {/* Children */}
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="font-medium text-gray-900">
                          Child (age 4-12)
                        </div>
                        <div className="text-sm text-gray-500">50% price</div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updatePassengerQuantity("children", -1)
                          }
                          disabled={passengerQuantities.children <= 0}
                          className="w-8 h-8 p-0"
                        >
                          -
                        </Button>
                        <span className="w-8 text-center font-medium">
                          {passengerQuantities.children}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updatePassengerQuantity("children", 1)}
                          className="w-8 h-8 p-0"
                        >
                          +
                        </Button>
                      </div>
                    </div>

                    {/* Infants */}
                    <div className="flex items-center justify-between mb-0">
                      <div>
                        <div className="font-medium text-gray-900">
                          Infant (age 0-3)
                        </div>
                        <div className="text-sm text-gray-500">Free</div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updatePassengerQuantity("infants", -1)}
                          disabled={passengerQuantities.infants <= 0}
                          className="w-8 h-8 p-0"
                        >
                          -
                        </Button>
                        <span className="w-8 text-center font-medium">
                          {passengerQuantities.infants}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updatePassengerQuantity("infants", 1)}
                          className="w-8 h-8 p-0"
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Ticket Types */}
                  <div className="p-4 md:p-6 space-y-4">
                    {attraction.ticketTypes.map((ticket, index) => {
                      const totalPrice = getTicketTotalPrice(index);

                      return (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg overflow-hidden"
                        >
                          {/* Ticket Header */}
                          <div className="p-4 bg-gray-50">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center gap-3 mb-1">
                                  <h4 className="font-semibold text-gray-900 text-base sm:text-lg">
                                    {ticket.name}
                                  </h4>
                                  <div
                                    className={cn(
                                      "inline-flex items-center px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap",
                                      ticket.refundable
                                        ? "bg-green-100 text-green-700 border border-green-200"
                                        : "bg-red-50 text-red-600 border border-red-200",
                                    )}
                                  >
                                    {ticket.refundable
                                      ? "Refundable"
                                      : "Non-refundable"}
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600 mt-1 font-normal">
                                  {formatPrice(ticket.price)} per person
                                </p>
                                <p className="text-xs text-gray-500 mt-1 font-normal">
                                  {ticket.cancellationPolicy}
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="text-xl sm:text-2xl font-bold text-[#003580]">
                                  {formatPrice(totalPrice)}
                                </div>
                                <div className="text-xs sm:text-sm text-gray-500 font-normal">
                                  includes taxes and fees
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Features */}
                          <div className="px-4 py-3 border-b border-gray-200">
                            <div className="grid grid-cols-2 gap-2">
                              {ticket.features
                                .slice(0, 4)
                                .map((feature, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center text-sm text-gray-600"
                                  >
                                    <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                                    {feature}
                                  </div>
                                ))}
                            </div>
                            {ticket.features.length > 4 && (
                              <button className="text-sm text-[#003580] hover:underline mt-2">
                                + {ticket.features.length - 4} more
                              </button>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="p-4 md:p-6">
                            <div className="flex flex-col sm:flex-row gap-3">
                              <Button
                                onClick={() => handleBargainClick(index)}
                                className="flex-1 bg-[#febb02] hover:bg-[#e5a700] text-[#003580] font-semibold py-3 px-4 text-sm sm:text-base rounded-lg shadow-sm border border-[#d19900] transition-all duration-200 min-h-[48px] flex items-center justify-center"
                              >
                                <TrendingDown className="w-4 h-4 mr-2 flex-shrink-0" />
                                <span className="truncate">
                                  Bargain This Price
                                </span>
                              </Button>
                              <Button
                                onClick={() => handleBookNow(index)}
                                className="flex-1 bg-[#003580] hover:bg-[#002a66] text-white font-bold py-3 px-4 text-sm sm:text-base rounded-lg shadow-lg transition-all duration-200 min-h-[48px] flex items-center justify-center"
                              >
                                <span className="truncate">Book Now</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Total Summary with Tax Breakdown */}
                  <div className="p-4 border-t border-gray-200 bg-blue-50">
                    <div className="space-y-3">
                      <div className="text-center">
                        <div className="text-sm font-medium text-gray-700 mb-1">
                          Total for {getTotalPassengers()} guest
                          {getTotalPassengers() > 1 ? "s" : ""}
                        </div>
                        <div className="text-xs text-gray-500 mb-2">
                          {passengerQuantities.adults} Adults
                          {passengerQuantities.children > 0
                            ? `, ${passengerQuantities.children} Children`
                            : ""}
                          {passengerQuantities.infants > 0
                            ? `, ${passengerQuantities.infants} Infants`
                            : ""}
                        </div>
                      </div>

                      {/* Price Breakdown */}
                      {getTotalPassengers() > 0 &&
                        attraction.ticketTypes[selectedTicketType] && (
                          <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <div className="space-y-2 text-sm">
                              {(() => {
                                const ticket =
                                  attraction.ticketTypes[selectedTicketType];
                                const priceCalc =
                                  sightseeingService.calculatePrice(
                                    ticket.price,
                                    passengerQuantities.adults,
                                    passengerQuantities.children,
                                    passengerQuantities.infants,
                                  );

                                return (
                                  <>
                                    {priceCalc.breakdown.adults.count > 0 && (
                                      <div className="flex justify-between items-center">
                                        <span className="text-gray-600">
                                          {priceCalc.breakdown.adults.count} ×
                                          Adult (
                                          {formatPrice(
                                            priceCalc.breakdown.adults.price,
                                          )}
                                          )
                                        </span>
                                        <span className="font-medium text-gray-900">
                                          {formatPrice(
                                            priceCalc.breakdown.adults.total,
                                          )}
                                        </span>
                                      </div>
                                    )}
                                    {priceCalc.breakdown.children.count > 0 && (
                                      <div className="flex justify-between items-center">
                                        <span className="text-gray-600">
                                          {priceCalc.breakdown.children.count} ×
                                          Child (
                                          {formatPrice(
                                            priceCalc.breakdown.children.price,
                                          )}
                                          )
                                        </span>
                                        <span className="font-medium text-gray-900">
                                          {formatPrice(
                                            priceCalc.breakdown.children.total,
                                          )}
                                        </span>
                                      </div>
                                    )}
                                    {priceCalc.breakdown.infants.count > 0 && (
                                      <div className="flex justify-between items-center">
                                        <span className="text-gray-600">
                                          {priceCalc.breakdown.infants.count} ×
                                          Infant (Free)
                                        </span>
                                        <span className="font-medium text-gray-900">
                                          {formatPrice(0)}
                                        </span>
                                      </div>
                                    )}

                                    <hr className="border-gray-200" />

                                    <div className="flex justify-between items-center">
                                      <span className="text-gray-600">
                                        Subtotal
                                      </span>
                                      <span className="font-medium text-gray-900">
                                        {formatPrice(priceCalc.basePrice)}
                                      </span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                      <span className="text-gray-600">
                                        Taxes & Fees (18%)
                                      </span>
                                      <span className="font-medium text-gray-900">
                                        {formatPrice(priceCalc.taxAmount)}
                                      </span>
                                    </div>

                                    <hr className="border-gray-300" />

                                    <div className="flex justify-between items-center text-lg font-bold">
                                      <span className="text-gray-900">
                                        Total Amount
                                      </span>
                                      <span className="text-[#003580]">
                                        {formatPrice(priceCalc.totalPrice)}
                                      </span>
                                    </div>
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                        )}

                      {getTotalPassengers() === 0 && (
                        <div className="text-center py-4">
                          <div className="text-2xl font-bold text-gray-400 mb-1">
                            {formatPrice(0)}
                          </div>
                          <div className="text-sm text-gray-500">
                            Select tickets to see total
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Time Selection Alert Dialog */}
      <AlertDialog open={showTimeAlert} onOpenChange={setShowTimeAlert}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-amber-600">
              <Clock className="w-5 h-5" />
              Time Selection Required
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              <div className="space-y-3">
                <p className="font-medium">
                  Please select your preferred visit time to continue with the
                  booking.
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-amber-800">
                      <p className="font-medium mb-1">
                        Why is time selection important?
                      </p>
                      <ul className="space-y-1 text-xs">
                        <li>• Ensures availability for your preferred slot</li>
                        <li>• Helps us prepare for your visit</li>
                        <li>• Avoids waiting times and disappointment</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  You can select from the available time slots shown on the
                  right.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => setShowTimeAlert(false)}
              className="bg-[#003580] hover:bg-[#002a66] text-white"
            >
              Got It, I'll Select a Time
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Sightseeing Bargain Modal */}
      {attraction && (
        <FlightStyleBargainModal
          type="sightseeing"
          roomType={{
            id: attraction.ticketTypes[bargainTicketType]?.name || "standard",
            name:
              attraction.ticketTypes[bargainTicketType]?.name ||
              "Standard Admission",
            description: `${attraction.name} - ${attraction.ticketTypes[bargainTicketType]?.name || "Standard Admission"}`,
            image: attraction.images[0],
            marketPrice:
              getTicketTotalPrice(bargainTicketType) ||
              attraction.ticketTypes[bargainTicketType]?.price ||
              149,
            totalPrice:
              getTicketTotalPrice(bargainTicketType) ||
              attraction.ticketTypes[bargainTicketType]?.price ||
              149,
            features: attraction.ticketTypes[bargainTicketType]?.features || [],
            maxOccupancy: adults,
            bedType: attraction.duration,
            size: attraction.category,
            cancellation: "Free cancellation up to 24 hours before visit date",
          }}
          hotel={{
            id: attraction.id,
            name: attraction.name,
            location: attraction.location,
            checkIn: new Date().toISOString().split("T")[0],
            checkOut: new Date().toISOString().split("T")[0],
          }}
          isOpen={isBargainModalOpen}
          onClose={() => setIsBargainModalOpen(false)}
          checkInDate={new Date()}
          checkOutDate={new Date()}
          roomsCount={1}
          onBookingSuccess={handleBargainSuccess}
        />
      )}
    </div>
  );
}
