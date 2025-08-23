import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Download,
  Printer,
  Share2,
  Calendar,
  MapPin,
  Users,
  Clock,
  Mail,
  Phone,
  Star,
  CheckCircle,
  Hotel,
  Plane,
  Car,
  QrCode,
  Wifi,
  Coffee,
  Utensils,
  Dumbbell,
  Shield,
} from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatPriceWithSymbol } from "@/lib/pricing";

export default function BookingVoucher() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { selectedCurrency } = useCurrency();
  const [isLoading, setIsLoading] = useState(false);

  const bookingId = searchParams.get("bookingId") || "HTL" + Date.now();

  // Mock voucher data (would be fetched from API)
  const voucherData = {
    id: bookingId,
    confirmationCode:
      "CONF-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
    status: "Confirmed",
    issueDate: new Date().toISOString(),
    validUntil: "2024-12-31",

    hotel: {
      name: "Grand Plaza Hotel",
      address: "123 Sheikh Zayed Road, Downtown Dubai, Dubai, UAE",
      location: "Downtown Dubai, United Arab Emirates",
      phone: "+971 4 123 4567",
      email: "reservations@grandplazadubai.com",
      website: "www.grandplazadubai.com",
      image:
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600",
      rating: 4.8,
      reviews: 1234,
      license: "DTCM License: 123456789",
      amenities: [
        { icon: Wifi, name: "Free WiFi" },
        { icon: Coffee, name: "Coffee/Tea" },
        { icon: Utensils, name: "Restaurant" },
        { icon: Dumbbell, name: "Fitness Center" },
        { icon: Car, name: "Parking" },
        { icon: Shield, name: "24/7 Security" },
      ],
    },

    guest: {
      title: "Mr.",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "+1 234 567 8900",
      nationality: "United States",
    },

    reservation: {
      checkIn: "2024-07-25",
      checkOut: "2024-07-28",
      checkInTime: "15:00",
      checkOutTime: "12:00",
      nights: 3,
      adults: 2,
      children: 0,
      rooms: 1,
      roomType: "Deluxe Suite",
      bedType: "King Bed",
      smokingPreference: "Non-Smoking",
      viewType: "City View",
      floor: "High Floor Preferred",
    },

    pricing: {
      roomRate: 259,
      totalRoomCharges: 777,
      taxes: 93,
      serviceFees: 50,
      cityTax: 15,
      total: 935,
      currency: "USD",
      paymentStatus: "Paid",
      paymentMethod: "Credit Card (**** 1234)",
      paymentDate: new Date().toISOString(),
    },

    policies: {
      cancellation: "Free cancellation until 24 hours before check-in",
      checkIn: "Check-in time: 3:00 PM - 12:00 AM",
      checkOut: "Check-out time: 6:00 AM - 12:00 PM",
      pets: "Pets not allowed",
      smoking: "Smoking is not permitted",
      children: "Children of all ages are welcome",
      extraBed: "Extra beds available upon request (charges may apply)",
      internet: "Free WiFi available throughout the property",
    },

    specialRequests:
      "High floor room with city view preferred. Late check-out if possible.",

    emergencyContacts: {
      hotel: "+971 4 123 4567",
      police: "999",
      ambulance: "998",
      fire: "997",
    },

    qrCode:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", // Placeholder QR code
  };

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      // Simulate download process
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Create a downloadable PDF (in production, this would generate actual PDF)
      const element = document.getElementById("voucher-content");
      if (element) {
        // Generate a simple text-based voucher for download
        const voucherContent = `
HOTEL BOOKING VOUCHER
faredown.com

Booking ID: HV${Date.now()}
Date: ${new Date().toLocaleDateString()}

Hotel Details:
- Name: Grand Hyatt Dubai
- Location: Dubai, United Arab Emirates
- Check-in: ${new Date().toLocaleDateString()}
- Check-out: ${new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()}
- Guests: 2 Adults
- Room: Superior King Room

This voucher confirms your hotel booking.
Please present this at the hotel during check-in.
        `;

        // Create and download the file
        const blob = new Blob([voucherContent], { type: "text/plain" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `hotel-voucher-${Date.now()}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Download failed:", error);
      alert("Download failed. Please try again or use the print option.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Hotel Booking Voucher",
          text: `Booking voucher for ${voucherData.hotel.name}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      // Fallback: copy URL to clipboard
      await navigator.clipboard.writeText(window.location.href);
      alert("Voucher link copied to clipboard!");
    }
  };

  useEffect(() => {
    // Add print styles
    const style = document.createElement("style");
    style.textContent = `
      @media print {
        .no-print { display: none !important; }
        .print-full-width { width: 100% !important; max-width: none !important; }
        body { font-size: 12px; }
        .voucher-container { box-shadow: none !important; border: 1px solid #000 !important; }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="no-print">
        <Header />
      </div>

      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-6 print-full-width">
        {/* Action Buttons */}
        <div className="no-print mb-6 flex flex-wrap gap-3 justify-center">
          <Button
            onClick={handleDownload}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Download PDF
          </Button>
          <Button onClick={handlePrint} variant="outline">
            <Printer className="w-4 h-4 mr-2" />
            Print Voucher
          </Button>
          <Button onClick={handleShare} variant="outline">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>

        {/* Voucher Content */}
        <Card
          id="voucher-content"
          className="voucher-container bg-white shadow-lg"
        >
          <CardContent className="p-8">
            {/* Header */}
            <div className="border-b-2 border-blue-600 pb-6 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-blue-600 mb-2">
                    HOTEL BOOKING VOUCHER
                  </h1>
                  <p className="text-gray-600">
                    Please present this voucher at the hotel reception
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Issue Date</div>
                  <div className="font-semibold">
                    {new Date(voucherData.issueDate).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-600 mt-2">Valid Until</div>
                  <div className="font-semibold">{voucherData.validUntil}</div>
                </div>
              </div>
            </div>

            {/* Confirmation Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Booking Reference
                </h3>
                <div className="text-2xl font-bold text-blue-600 tracking-wider">
                  {voucherData.confirmationCode}
                </div>
                <div className="text-sm text-blue-700 mt-1">
                  Booking ID: {voucherData.id}
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">Status</h3>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-green-600 font-semibold">
                    {voucherData.status}
                  </span>
                </div>
                <div className="text-sm text-green-700 mt-1">
                  Payment: {voucherData.pricing.paymentStatus}
                </div>
              </div>
            </div>

            {/* Hotel Information */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <Hotel className="w-5 h-5 mr-2" />
                Hotel Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {voucherData.hotel.name}
                  </h3>
                  <div className="space-y-2 text-gray-700">
                    <div className="flex items-start">
                      <MapPin className="w-4 h-4 mr-2 mt-1 text-gray-500" />
                      <span>{voucherData.hotel.address}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-gray-500" />
                      <span>{voucherData.hotel.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-gray-500" />
                      <span>{voucherData.hotel.email}</span>
                    </div>
                  </div>
                  <div className="flex items-center mt-3">
                    <div className="flex items-center">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(voucherData.hotel.rating)
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 font-medium">
                      {voucherData.hotel.rating}
                    </span>
                    <span className="ml-1 text-gray-600">
                      ({voucherData.hotel.reviews} reviews)
                    </span>
                  </div>
                </div>
                <div className="flex justify-center items-center">
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <QrCode className="w-24 h-24 text-gray-600" />
                    <div className="text-xs text-center text-gray-600 mt-2">
                      Scan for quick check-in
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Guest Information */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Guest Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Primary Guest
                  </h3>
                  <div className="space-y-1 text-gray-700">
                    <div className="text-lg font-medium">
                      {voucherData.guest.title} {voucherData.guest.firstName}{" "}
                      {voucherData.guest.lastName}
                    </div>
                    <div>{voucherData.guest.email}</div>
                    <div>{voucherData.guest.phone}</div>
                    <div>Nationality: {voucherData.guest.nationality}</div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Occupancy
                  </h3>
                  <div className="space-y-1 text-gray-700">
                    <div>Adults: {voucherData.reservation.adults}</div>
                    <div>Children: {voucherData.reservation.children}</div>
                    <div>
                      Total Guests:{" "}
                      {voucherData.reservation.adults +
                        voucherData.reservation.children}
                    </div>
                    <div>Rooms: {voucherData.reservation.rooms}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reservation Details */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Reservation Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <h4 className="font-semibold text-blue-900 mb-2">Check-in</h4>
                  <div className="text-lg font-bold">
                    {new Date(
                      voucherData.reservation.checkIn,
                    ).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-blue-700">
                    After {voucherData.reservation.checkInTime}
                  </div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg text-center">
                  <h4 className="font-semibold text-red-900 mb-2">Check-out</h4>
                  <div className="text-lg font-bold">
                    {new Date(
                      voucherData.reservation.checkOut,
                    ).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-red-700">
                    Before {voucherData.reservation.checkOutTime}
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <h4 className="font-semibold text-green-900 mb-2">
                    Duration
                  </h4>
                  <div className="text-2xl font-bold text-green-600">
                    {voucherData.reservation.nights}
                  </div>
                  <div className="text-sm text-green-700">
                    {voucherData.reservation.nights === 1 ? "Night" : "Nights"}
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <h4 className="font-semibold text-purple-900 mb-2">
                    Room Type
                  </h4>
                  <div className="text-sm font-bold text-purple-600">
                    {voucherData.reservation.roomType}
                  </div>
                  <div className="text-xs text-purple-700">
                    {voucherData.reservation.bedType}
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Room Preferences</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• {voucherData.reservation.smokingPreference}</li>
                    <li>• {voucherData.reservation.viewType}</li>
                    <li>• {voucherData.reservation.floor}</li>
                  </ul>
                </div>
                {voucherData.specialRequests && (
                  <div>
                    <h4 className="font-semibold mb-2">Special Requests</h4>
                    <p className="text-sm text-gray-700">
                      {voucherData.specialRequests}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Pricing Information */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">Pricing Information</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>
                      Room Rate ({voucherData.reservation.nights} nights)
                    </span>
                    <span>
                      {formatPriceWithSymbol(
                        voucherData.pricing.totalRoomCharges,
                        selectedCurrency.code,
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxes</span>
                    <span>
                      {formatPriceWithSymbol(
                        voucherData.pricing.taxes,
                        selectedCurrency.code,
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service Fees</span>
                    <span>
                      {formatPriceWithSymbol(
                        voucherData.pricing.serviceFees,
                        selectedCurrency.code,
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>City Tax</span>
                    <span>
                      {formatPriceWithSymbol(
                        voucherData.pricing.cityTax,
                        selectedCurrency.code,
                      )}
                    </span>
                  </div>
                  <div className="border-t border-gray-300 pt-2 flex justify-between font-bold text-lg">
                    <span>Total Amount</span>
                    <span className="text-green-600">
                      {formatPriceWithSymbol(
                        voucherData.pricing.total,
                        selectedCurrency.code,
                      )}
                    </span>
                  </div>
                </div>
                <div className="mt-3 text-sm text-gray-600">
                  Payment Status: {voucherData.pricing.paymentStatus} via{" "}
                  {voucherData.pricing.paymentMethod}
                </div>
              </div>
            </div>

            {/* Hotel Amenities */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">Hotel Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {voucherData.hotel.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <amenity.icon className="w-4 h-4 mr-2 text-gray-600" />
                    <span>{amenity.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Important Policies */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">Important Policies</h2>
              <div className="space-y-3 text-sm">
                <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                  <strong>Cancellation Policy:</strong>{" "}
                  {voucherData.policies.cancellation}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <strong>Check-in:</strong> {voucherData.policies.checkIn}
                  </div>
                  <div>
                    <strong>Check-out:</strong> {voucherData.policies.checkOut}
                  </div>
                  <div>
                    <strong>Pets:</strong> {voucherData.policies.pets}
                  </div>
                  <div>
                    <strong>Smoking:</strong> {voucherData.policies.smoking}
                  </div>
                  <div>
                    <strong>Children:</strong> {voucherData.policies.children}
                  </div>
                  <div>
                    <strong>Internet:</strong> {voucherData.policies.internet}
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Contacts */}
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-4">Emergency Contacts</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <strong>Hotel:</strong>
                  <br />
                  {voucherData.emergencyContacts.hotel}
                </div>
                <div>
                  <strong>Police:</strong>
                  <br />
                  {voucherData.emergencyContacts.police}
                </div>
                <div>
                  <strong>Ambulance:</strong>
                  <br />
                  {voucherData.emergencyContacts.ambulance}
                </div>
                <div>
                  <strong>Fire Department:</strong>
                  <br />
                  {voucherData.emergencyContacts.fire}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t-2 border-gray-300 pt-4 text-center text-xs text-gray-600">
              <p className="mb-2">
                This voucher is electronically generated and is valid without
                signature.
              </p>
              <p className="mb-2">
                Please ensure to carry a valid photo ID for verification at the
                hotel.
              </p>
              <p>
                For any queries, please contact our support team or the hotel
                directly.
              </p>
              <div className="mt-4 text-xs">
                <p>{voucherData.hotel.license}</p>
                <p>Generated on: {new Date().toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back Navigation */}
        <div className="no-print mt-6 text-center">
          <Button
            onClick={() => navigate("/hotels")}
            variant="outline"
            className="mr-4"
          >
            Book Another Hotel
          </Button>
          <Button onClick={() => navigate("/account/bookings")}>
            View All Bookings
          </Button>
        </div>
      </div>
    </div>
  );
}
