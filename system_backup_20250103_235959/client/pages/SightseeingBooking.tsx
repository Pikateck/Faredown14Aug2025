import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ErrorBanner } from "@/components/ErrorBanner";
import { useCurrency } from "@/contexts/CurrencyContext";
import { sightseeingService } from "@/services/sightseeingService";
import {
  MapPin,
  Star,
  Clock,
  Users,
  Calendar,
  CreditCard,
  ArrowLeft,
  CheckCircle,
  Building2,
  Camera,
  Ticket,
  Mountain,
  Utensils,
  Music,
  Phone,
  Mail,
  User,
  Shield,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BookingFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialRequests: string;
  agreeToTerms: boolean;
  subscribeNewsletter: boolean;
}

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
  ticketTypes: {
    name: string;
    price: number;
    features: string[];
  }[];
}

export default function SightseeingBooking() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  const [attraction, setAttraction] = useState<SightseeingAttraction | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  // Extract booking parameters
  const attractionId = searchParams.get("attractionId") || "";
  const ticketTypeIndex = parseInt(searchParams.get("ticketType") || "0");
  const visitDate = searchParams.get("visitDate") || "";
  const selectedTime = searchParams.get("selectedTime") || "";
  const adults = parseInt(searchParams.get("adults") || "2");
  const children = parseInt(searchParams.get("children") || "0");

  // Form state
  const [formData, setFormData] = useState<BookingFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialRequests: "",
    agreeToTerms: false,
    subscribeNewsletter: false,
  });

  // Load attraction data
  useEffect(() => {
    const loadAttraction = async () => {
      setLoading(true);
      setError("");

      try {
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Sample attraction data (same as in SightseeingDetails)
        const sampleAttractions: Record<string, SightseeingAttraction> = {
          "burj-khalifa": {
            id: "burj-khalifa",
            name: "Burj Khalifa: Floors 124 and 125",
            location: "Dubai, UAE",
            images: [
              "https://cdn.builder.io/api/v1/image/assets%2F4235b10530ff469795aa00c0333d773c%2F31c1e4a8ae8d4a1ab766aa8a4417f49e?format=webp&width=800",
            ],
            rating: 4.6,
            reviews: 45879,
            originalPrice: 189,
            currentPrice: 149,
            description:
              "Skip the line and enjoy breathtaking views from the world's tallest building",
            category: "landmark",
            duration: "1-2 hours",
            ticketTypes: [
              {
                name: "Standard Admission",
                price: 149,
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
                features: [
                  "Floors 124 & 125",
                  "Skip-the-line access",
                  "Prime viewing times",
                  "Premium refreshments",
                ],
              },
              {
                name: "VIP Experience",
                price: 299,
                features: [
                  "Floors 124, 125 & 148",
                  "Private elevator",
                  "VIP lounge access",
                  "Premium refreshments",
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
            ],
            rating: 4.4,
            reviews: 23156,
            originalPrice: 120,
            currentPrice: 89,
            description:
              "Explore one of the world's largest suspended aquariums with over 140 species",
            category: "museum",
            duration: "2-3 hours",
            ticketTypes: [
              {
                name: "Aquarium + Zoo",
                price: 89,
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
                features: [
                  "All standard features",
                  "Behind-the-scenes tour",
                  "Feeding experience",
                ],
              },
            ],
          },
        };

        const attractionData = sampleAttractions[attractionId];

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

  // Handle form input changes
  const handleInputChange = (
    field: keyof BookingFormData,
    value: string | boolean,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle form submission
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.agreeToTerms) {
      setError("Please agree to the terms and conditions");
      return;
    }

    setBookingLoading(true);

    try {
      // Simulate booking API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Generate booking reference
      const bookingRef = `SG${Date.now()}`;

      // Navigate to confirmation page
      const confirmationParams = new URLSearchParams({
        bookingRef,
        attractionId,
        ticketType: ticketTypeIndex.toString(),
        visitDate,
        selectedTime,
        adults: adults.toString(),
        children: children.toString(),
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
      });

      navigate(
        `/sightseeing/booking/confirmation?${confirmationParams.toString()}`,
      );
    } catch (err) {
      setError("Booking failed. Please try again.");
      setBookingLoading(false);
    }
  };

  // Navigation handlers
  const handleBackToDetails = () => {
    const params = new URLSearchParams(searchParams);
    navigate(`/sightseeing/${attractionId}?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading booking details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !attraction) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Button
            onClick={handleBackToDetails}
            variant="outline"
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Details
          </Button>
          <ErrorBanner message={error} onClose={() => setError("")} />
        </div>
      </div>
    );
  }

  if (!attraction) return null;

  const categoryInfo = getCategoryInfo(attraction.category);
  const selectedTicket =
    attraction.ticketTypes[ticketTypeIndex] || attraction.ticketTypes[0];

  // Calculate price using SightseeingService for consistency
  const infants = parseInt(searchParams.get("infants") || "0");
  const priceCalc = sightseeingService.calculatePrice(
    selectedTicket.price,
    adults,
    children,
    infants,
  );
  const basePrice = priceCalc.basePrice;
  const totalPrice = priceCalc.totalPrice;
  const formattedVisitDate = new Date(visitDate).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Back Button */}
        <Button
          onClick={handleBackToDetails}
          variant="outline"
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Details
        </Button>

        {error && (
          <ErrorBanner
            message={error}
            onClose={() => setError("")}
            className="mb-6"
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">
                Complete Your Booking
              </h1>

              <form onSubmit={handleBookingSubmit} className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Personal Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={(e) =>
                          handleInputChange("firstName", e.target.value)
                        }
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={(e) =>
                          handleInputChange("lastName", e.target.value)
                        }
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Mail className="w-5 h-5 mr-2" />
                    Contact Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Special Requests */}
                <div>
                  <Label htmlFor="specialRequests">
                    Special Requests (Optional)
                  </Label>
                  <textarea
                    id="specialRequests"
                    value={formData.specialRequests}
                    onChange={(e) =>
                      handleInputChange("specialRequests", e.target.value)
                    }
                    rows={3}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Any special requirements or requests..."
                  />
                </div>

                {/* Terms and Newsletter */}
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onCheckedChange={(checked) =>
                        handleInputChange("agreeToTerms", !!checked)
                      }
                    />
                    <Label
                      htmlFor="agreeToTerms"
                      className="text-sm text-gray-600"
                    >
                      I agree to the{" "}
                      <span className="text-blue-600 hover:underline cursor-pointer">
                        Terms and Conditions
                      </span>{" "}
                      and{" "}
                      <span className="text-blue-600 hover:underline cursor-pointer">
                        Privacy Policy
                      </span>{" "}
                      *
                    </Label>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="subscribeNewsletter"
                      checked={formData.subscribeNewsletter}
                      onCheckedChange={(checked) =>
                        handleInputChange("subscribeNewsletter", !!checked)
                      }
                    />
                    <Label
                      htmlFor="subscribeNewsletter"
                      className="text-sm text-gray-600"
                    >
                      Subscribe to our newsletter for exclusive deals and
                      updates
                    </Label>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={bookingLoading || !formData.agreeToTerms}
                  className="w-full py-4 text-lg bg-[#003580] hover:bg-[#002a66] text-white disabled:opacity-50"
                >
                  {bookingLoading ? (
                    <div className="flex items-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing Booking...
                    </div>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 mr-2" />
                      Complete Booking
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Booking Summary
              </h2>

              {/* Attraction Info */}
              <div className="mb-6">
                <img
                  src={attraction.images[0]}
                  alt={attraction.name}
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
                <div className="mb-2">
                  <Badge className={categoryInfo.color}>
                    <categoryInfo.IconComponent className="w-3 h-3 mr-1" />
                    {categoryInfo.label}
                  </Badge>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {attraction.name}
                </h3>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  {attraction.location}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                  {attraction.rating} ({attraction.reviews.toLocaleString()}{" "}
                  reviews)
                </div>
              </div>

              {/* Booking Details */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm">
                  <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="text-gray-600">Visit Date:</span>
                  <span className="ml-auto font-medium">
                    {formattedVisitDate}
                  </span>
                </div>
                {selectedTime && (
                  <div className="flex items-center text-sm">
                    <Clock className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-gray-600">Time:</span>
                    <span className="ml-auto font-medium">{selectedTime}</span>
                  </div>
                )}
                <div className="flex items-center text-sm">
                  <Users className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="text-gray-600">Guests:</span>
                  <span className="ml-auto font-medium">
                    {adults} adult{adults > 1 ? "s" : ""}
                    {children > 0
                      ? `, ${children} child${children > 1 ? "ren" : ""}`
                      : ""}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="text-gray-600">Duration:</span>
                  <span className="ml-auto font-medium">
                    {attraction.duration}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <Ticket className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="text-gray-600">Ticket:</span>
                  <span className="ml-auto font-medium">
                    {selectedTicket.name}
                  </span>
                </div>
              </div>

              {/* Ticket Features */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-2">Included:</h4>
                <div className="space-y-1">
                  {selectedTicket.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center text-sm text-gray-600"
                    >
                      <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="border-t pt-4">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {selectedTicket.name} × {adults}
                    </span>
                    <span>{formatPrice(selectedTicket.price * adults)}</span>
                  </div>
                  {children > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        Children × {children} (50% off)
                      </span>
                      <span>
                        {formatPrice(selectedTicket.price * 0.5 * children)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span>{formatPrice(basePrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Taxes & Fees (18%)</span>
                    <span>{formatPrice(priceCalc.taxAmount)}</span>
                  </div>
                </div>

                <div className="border-t pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">
                      Total Amount
                    </span>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-blue-600">
                        {formatPrice(totalPrice)}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        includes taxes and fees
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Note */}
              <div className="mt-6 p-3 bg-green-50 rounded-lg">
                <div className="flex items-center text-sm text-green-700">
                  <Shield className="w-4 h-4 mr-2" />
                  <span>Secure payment & instant confirmation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
