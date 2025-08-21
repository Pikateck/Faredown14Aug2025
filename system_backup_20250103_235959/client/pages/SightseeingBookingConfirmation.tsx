import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/contexts/CurrencyContext";
import {
  MapPin,
  Star,
  Clock,
  Users,
  Calendar,
  CheckCircle,
  Download,
  Mail,
  Smartphone,
  QrCode,
  Building2,
  Camera,
  Ticket,
  Mountain,
  Utensils,
  Music,
  Home,
  Share2,
  FileText,
  Info,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SightseeingAttraction {
  id: string;
  name: string;
  location: string;
  images: string[];
  rating: number;
  reviews: number;
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

export default function SightseeingBookingConfirmation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  const [attraction, setAttraction] = useState<SightseeingAttraction | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  // Extract booking parameters
  const bookingRef = searchParams.get("bookingRef") || `FD-${Date.now()}`; // Generate if not provided
  const attractionId =
    searchParams.get("attractionId") || searchParams.get("item") || ""; // Support both params
  const ticketTypeIndex = parseInt(searchParams.get("ticketType") || "0");
  const visitDate = searchParams.get("visitDate") || new Date().toISOString(); // Default to today
  const selectedTime = searchParams.get("selectedTime") || "";
  const adults = parseInt(searchParams.get("adults") || "2");
  const children = parseInt(searchParams.get("children") || "0");
  const firstName = searchParams.get("firstName") || "Guest";
  const lastName = searchParams.get("lastName") || "User";
  const email = searchParams.get("email") || "guest@example.com";

  // Load attraction data
  useEffect(() => {
    const loadAttraction = async () => {
      setLoading(true);

      try {
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Sample attraction data (same as in other components)
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
        // If no specific attraction found but we have a valid ID, try first available
        if (!attractionData && attractionId) {
          console.warn(`Attraction ${attractionId} not found`);
          setAttraction(null);
        } else if (!attractionData && !attractionId) {
          // If no ID provided, default to first attraction for demo
          setAttraction(sampleAttractions["burj-khalifa"]);
        } else {
          setAttraction(attractionData);
        }
      } catch (err) {
        console.error("Error loading attraction:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAttraction();
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

  // Navigation handlers
  const handleGoHome = () => {
    navigate("/");
  };

  const handleViewMyBookings = () => {
    navigate("/bookings?tab=sightseeing");
  };

  const handleDownloadTicket = () => {
    // Generate ticket data
    const ticketData = {
      bookingRef,
      attractionName: attraction?.name || "",
      location: attraction?.location || "",
      visitDate: formattedVisitDate,
      selectedTime,
      guestName: `${firstName} ${lastName}`,
      email,
      adults,
      children,
      ticketType: attraction?.ticketTypes[ticketTypeIndex]?.name || "",
      totalPrice,
    };

    // Create and download ticket as JSON/text file
    const ticketContent = `FAREDOWN SIGHTSEEING TICKET
==========================

Booking Reference: ${ticketData.bookingRef}
Attraction: ${ticketData.attractionName}
Location: ${ticketData.location}
Date: ${ticketData.visitDate}
Time: ${ticketData.selectedTime}
Guest: ${ticketData.guestName}
Email: ${ticketData.email}
Adults: ${ticketData.adults}
Children: ${ticketData.children}
Ticket Type: ${ticketData.ticketType}
Total Paid: ${formatPrice(ticketData.totalPrice)}

==========================
Please present this ticket at the venue.
For support: support@faredown.com`;

    const blob = new Blob([ticketContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `faredown-ticket-${bookingRef}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Show success message
    alert("Ticket downloaded successfully! Please present this at the venue.");
  };

  const handleShareBooking = () => {
    const shareText = `🎉 Just booked ${attraction?.name}!

📅 Date: ${formattedVisitDate}
⏰ Time: ${selectedTime}
📍 Location: ${attraction?.location}
🎫 Booking Ref: ${bookingRef}

Booked through Faredown.com 🌟`;

    const shareUrl = window.location.href;

    if (navigator.share) {
      // Use native sharing on mobile devices
      navigator
        .share({
          title: `My ${attraction?.name} Booking - Faredown`,
          text: shareText,
          url: shareUrl,
        })
        .catch((error) => {
          console.log("Error sharing:", error);
          // Fallback to clipboard
          fallbackShare();
        });
    } else {
      // Fallback for desktop or unsupported devices
      fallbackShare();
    }

    function fallbackShare() {
      const fullShareText = `${shareText}\n\nView booking: ${shareUrl}`;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
          .writeText(fullShareText)
          .then(() => {
            alert(
              "Booking details copied to clipboard! You can now paste and share.",
            );
          })
          .catch(() => {
            // Final fallback - show text in a prompt for manual copy
            prompt("Copy this text to share your booking:", fullShareText);
          });
      } else {
        // Final fallback - show text in a prompt for manual copy
        prompt("Copy this text to share your booking:", fullShareText);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading confirmation details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!attraction) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="text-red-500 mb-4">
              <Info className="w-16 h-16 mx-auto" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Booking Not Found
            </h1>
            <p className="text-gray-600 mb-6">
              We couldn't find the booking details. Please check your
              confirmation email or contact support.
            </p>
            <Button
              onClick={handleGoHome}
              className="bg-[#003580] hover:bg-[#002a66] text-white"
            >
              Go to Homepage
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const categoryInfo = getCategoryInfo(attraction.category);
  const selectedTicket =
    attraction.ticketTypes[ticketTypeIndex] || attraction.ticketTypes[0];
  const totalPrice = selectedTicket.price * adults;
  const formattedVisitDate = new Date(visitDate).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-lg text-gray-600">
            Your {attraction.name} experience has been successfully booked.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Reference */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Booking Reference
              </h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-2xl font-mono font-bold text-[#003580] mb-2">
                    {bookingRef}
                  </div>
                  <p className="text-sm text-gray-600">
                    Keep this reference number for your records
                  </p>
                </div>
              </div>
            </div>

            {/* Experience Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Experience Details
              </h2>

              <div className="flex gap-4 mb-4">
                <img
                  src={attraction.images[0]}
                  alt={attraction.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <Badge className={cn(categoryInfo.color, "mb-2")}>
                    <categoryInfo.IconComponent className="w-3 h-3 mr-1" />
                    {categoryInfo.label}
                  </Badge>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {attraction.name}
                  </h3>
                  <div className="flex items-center text-sm text-gray-600 mb-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    {attraction.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                    {attraction.rating} ({attraction.reviews.toLocaleString()}{" "}
                    reviews)
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

            {/* Guest Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Guest Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Guest Name</label>
                  <p className="font-medium">
                    {firstName} {lastName}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Email</label>
                  <p className="font-medium">{email}</p>
                </div>
              </div>
            </div>

            {/* Important Information */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <h3 className="font-semibold text-amber-800 mb-3 flex items-center">
                <Info className="w-5 h-5 mr-2" />
                Important Information
              </h3>
              <ul className="space-y-2 text-sm text-amber-700">
                <li>• Please arrive 30 minutes before your scheduled time</li>
                <li>• Bring a valid government-issued photo ID</li>
                <li>
                  • Mobile tickets will be sent to your email within 24 hours
                </li>
                <li>• Free cancellation up to 24 hours before your visit</li>
                <li>
                  • Contact customer service for any changes to your booking
                </li>
              </ul>
            </div>
          </div>

          {/* Action Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
              {/* Price Summary */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Payment Summary
                </h3>
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
                        Children × {children}
                      </span>
                      <span>Free</span>
                    </div>
                  )}
                </div>

                <div className="border-t pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">
                      Total Paid
                    </span>
                    <span className="text-xl font-bold text-green-600">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleDownloadTicket}
                  className="w-full bg-[#003580] hover:bg-[#002a66] text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Ticket
                </Button>

                <Button
                  onClick={handleShareBooking}
                  variant="outline"
                  className="w-full"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Booking
                </Button>

                <Button
                  onClick={handleViewMyBookings}
                  variant="outline"
                  className="w-full"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View My Bookings
                </Button>

                <Button
                  onClick={handleGoHome}
                  variant="ghost"
                  className="w-full"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Back to Homepage
                </Button>
              </div>

              {/* Contact Info */}
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-medium text-gray-900 mb-3">Need Help?</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    support@faredown.com
                  </div>
                  <div className="flex items-center">
                    <Smartphone className="w-4 h-4 mr-2" />
                    +971 4 123 4567
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-3">What's Next?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                1
              </div>
              <div>
                <h4 className="font-medium text-blue-900 mb-1">
                  Check Your Email
                </h4>
                <p className="text-sm text-blue-700">
                  You'll receive a confirmation email with your mobile ticket
                  within 24 hours.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                2
              </div>
              <div>
                <h4 className="font-medium text-blue-900 mb-1">
                  Prepare for Your Visit
                </h4>
                <p className="text-sm text-blue-700">
                  Review the important information and arrive 30 minutes early.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                3
              </div>
              <div>
                <h4 className="font-medium text-blue-900 mb-1">
                  Enjoy Your Experience
                </h4>
                <p className="text-sm text-blue-700">
                  Show your mobile ticket at the entrance and enjoy your visit!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
