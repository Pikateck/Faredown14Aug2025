import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Download,
  Calendar,
  MapPin,
  Users,
  Clock,
  Mail,
  Phone,
  Star,
  Share2,
  Printer,
  CreditCard,
  Hotel,
  Plane,
  Car,
  Shield,
  Gift,
  MessageCircle,
} from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatPriceWithSymbol } from "@/lib/pricing";

export default function HotelBookingConfirmation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { selectedCurrency } = useCurrency();
  const [isLoading, setIsLoading] = useState(false);

  const bookingId = searchParams.get("bookingId") || "HTL" + Date.now();
  const hotelId = searchParams.get("hotelId") || "1";

  // Mock booking data (would be fetched from API)
  const bookingData = {
    id: bookingId,
    status: "Confirmed",
    createdAt: new Date().toISOString(),
    hotel: {
      id: hotelId,
      name: "Grand Plaza Hotel",
      location: "Downtown Dubai, United Arab Emirates",
      address: "123 Sheikh Zayed Road, Downtown Dubai, Dubai, UAE",
      image:
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600",
      rating: 4.8,
      reviews: 1234,
      phone: "+971 4 123 4567",
      email: "reservations@grandplazadubai.com",
      amenities: [
        "Free WiFi",
        "Swimming Pool",
        "Fitness Center",
        "Spa & Wellness",
        "Restaurant",
        "24/7 Room Service",
        "Business Center",
        "Parking",
      ],
    },
    guest: {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "+1 234 567 8900",
    },
    room: {
      type: "Deluxe Suite",
      bedType: "King Bed",
      smokingPreference: "Non-Smoking",
      features: ["City View", "Separate Living Area", "Minibar", "Balcony"],
      size: "55 sqm",
      maxGuests: 3,
    },
    stay: {
      checkIn: "2024-07-25",
      checkOut: "2024-07-28",
      nights: 3,
      guests: 2,
      rooms: 1,
    },
    pricing: {
      roomRate: 259,
      nights: 3,
      subtotal: 777,
      taxes: 93.24,
      fees: 50,
      addOns: 0,
      total: 920.24,
    },
    addOns: [],
    specialRequests: "High floor room with city view preferred",
    paymentMethod: "•••• •••• •••• 1234",
    confirmationCode:
      "CONF-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
  };

  const handleDownloadVoucher = () => {
    setIsLoading(true);
    // Simulate download
    setTimeout(() => {
      setIsLoading(false);
      navigate(`/booking-voucher?bookingId=${bookingId}`);
    }, 1000);
  };

  const handlePrintConfirmation = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Hotel Booking Confirmation",
        text: `Booking confirmed at ${bookingData.hotel.name}`,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const quickActions = [
    {
      icon: Download,
      label: "Download Voucher",
      action: handleDownloadVoucher,
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      icon: Printer,
      label: "Print Confirmation",
      action: handlePrintConfirmation,
      color: "bg-gray-600 hover:bg-gray-700",
    },
    {
      icon: Share2,
      label: "Share Booking",
      action: handleShare,
      color: "bg-green-600 hover:bg-green-700",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-6">
        {/* Success Header */}
        <div className="bg-gradient-to-br from-green-500 via-emerald-500 to-green-600 text-white p-8 rounded-lg mb-6 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-white bg-opacity-20 rounded-full p-3">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
              <p className="text-green-100 text-lg mb-4">
                Your reservation has been successfully confirmed
              </p>
              <div className="bg-white bg-opacity-20 rounded-lg p-4 inline-block">
                <div className="text-sm text-green-100 mb-1">
                  Booking Reference
                </div>
                <div className="text-2xl font-bold tracking-wider">
                  {bookingData.confirmationCode}
                </div>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full transform translate-x-16 -translate-y-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-10 rounded-full transform -translate-x-12 translate-y-12" />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              onClick={action.action}
              className={`${action.color} text-white p-4 h-auto flex flex-col items-center space-y-2`}
              disabled={action.label === "Download Voucher" && isLoading}
            >
              {action.label === "Download Voucher" && isLoading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
              ) : (
                <action.icon className="w-6 h-6" />
              )}
              <span className="text-sm font-medium">{action.label}</span>
            </Button>
          ))}
        </div>

        {/* Booking Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Booking Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hotel Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Hotel className="w-5 h-5 mr-2" />
                  Hotel Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4">
                  <img
                    src={bookingData.hotel.image}
                    alt={bookingData.hotel.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">
                      {bookingData.hotel.name}
                    </h3>
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="text-sm">
                        {bookingData.hotel.location}
                      </span>
                    </div>
                    <div className="flex items-center mb-3">
                      <div className="flex items-center">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(bookingData.hotel.rating)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-sm font-medium">
                        {bookingData.hotel.rating}
                      </span>
                      <span className="ml-1 text-sm text-gray-600">
                        ({bookingData.hotel.reviews} reviews)
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {bookingData.hotel.amenities
                        .slice(0, 4)
                        .map((amenity, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            {amenity}
                          </Badge>
                        ))}
                      {bookingData.hotel.amenities.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{bookingData.hotel.amenities.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-sm">{bookingData.hotel.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-sm">{bookingData.hotel.email}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stay Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Stay Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Check-in</h4>
                    <div className="space-y-2">
                      <div className="text-lg font-medium">
                        {new Date(bookingData.stay.checkIn).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-1" />
                        <span className="text-sm">After 3:00 PM</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Check-out</h4>
                    <div className="space-y-2">
                      <div className="text-lg font-medium">
                        {new Date(bookingData.stay.checkOut).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-1" />
                        <span className="text-sm">Before 12:00 PM</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200 grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {bookingData.stay.nights}
                    </div>
                    <div className="text-sm text-gray-600">
                      {bookingData.stay.nights === 1 ? "Night" : "Nights"}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {bookingData.stay.guests}
                    </div>
                    <div className="text-sm text-gray-600">
                      {bookingData.stay.guests === 1 ? "Guest" : "Guests"}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {bookingData.stay.rooms}
                    </div>
                    <div className="text-sm text-gray-600">
                      {bookingData.stay.rooms === 1 ? "Room" : "Rooms"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Room Details */}
            <Card>
              <CardHeader>
                <CardTitle>Room Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-lg">
                      {bookingData.room.type}
                    </h4>
                    <div className="text-gray-600 mt-1">
                      {bookingData.room.size} • {bookingData.room.bedType} •{" "}
                      {bookingData.room.smokingPreference}
                    </div>
                    <div className="text-gray-600">
                      Max occupancy: {bookingData.room.maxGuests} guests
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {bookingData.room.features.map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                  {bookingData.specialRequests && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <h5 className="font-medium text-blue-900 mb-1">
                        Special Requests
                      </h5>
                      <p className="text-blue-800 text-sm">
                        {bookingData.specialRequests}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Guest Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Guest Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="font-semibold">
                      {bookingData.guest.firstName} {bookingData.guest.lastName}
                    </div>
                    <div className="text-gray-600">Primary Guest</div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-sm">{bookingData.guest.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-sm">{bookingData.guest.phone}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Price Summary */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Price Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Room Rate ({bookingData.pricing.nights} nights)</span>
                  <span>
                    {formatPriceWithSymbol(
                      bookingData.pricing.subtotal,
                      selectedCurrency.code,
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Taxes & Fees</span>
                  <span>
                    {formatPriceWithSymbol(
                      bookingData.pricing.taxes + bookingData.pricing.fees,
                      selectedCurrency.code,
                    )}
                  </span>
                </div>
                {bookingData.pricing.addOns > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Add-on Services</span>
                    <span>
                      {formatPriceWithSymbol(
                        bookingData.pricing.addOns,
                        selectedCurrency.code,
                      )}
                    </span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Paid</span>
                    <span className="text-xl font-bold text-green-600">
                      {formatPriceWithSymbol(
                        bookingData.pricing.total,
                        selectedCurrency.code,
                      )}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-gray-600">
                  Paid with {bookingData.paymentMethod}
                </div>
              </CardContent>
            </Card>

            {/* Important Information */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Important Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <div className="flex items-center text-green-800 text-sm">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Free cancellation until 24 hours before check-in
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>• Valid photo ID required at check-in</div>
                  <div>• Credit card required for incidentals</div>
                  <div>• Non-smoking room as requested</div>
                  <div>• Complimentary WiFi included</div>
                </div>
              </CardContent>
            </Card>

            {/* Support */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Need Help?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Phone className="w-4 h-4 mr-2" />
                  Contact Hotel
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Support
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Live Chat
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Actions */}
        <div className="mt-8 text-center space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate("/hotels")}
              variant="outline"
              className="sm:w-auto"
            >
              Book Another Hotel
            </Button>
            <Button
              onClick={() => navigate("/account/bookings")}
              className="sm:w-auto"
            >
              View All Bookings
            </Button>
          </div>
          <p className="text-gray-600 text-sm">
            A confirmation email has been sent to {bookingData.guest.email}
          </p>
        </div>
      </div>
    </div>
  );
}
