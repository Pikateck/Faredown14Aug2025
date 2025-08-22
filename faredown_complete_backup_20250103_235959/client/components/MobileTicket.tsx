import React from "react";
import {
  Plane,
  Calendar,
  Clock,
  User,
  MapPin,
  Luggage,
  QrCode,
  Shield,
  Utensils,
  Wifi,
  Download,
  Share,
  Star,
  Gift,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface MobileTicketProps {
  bookingData: any;
}

export const MobileTicket: React.FC<MobileTicketProps> = ({ bookingData }) => {
  const { bookingDetails } = bookingData;

  const handleDownload = () => {
    // Mobile PDF generation
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Flight Ticket",
        text: `Flight Booking Confirmed - ${bookingDetails.bookingRef}`,
        url: window.location.href,
      });
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden print:shadow-none print:max-w-full">
      {/* Header with Gradient */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-white bg-opacity-10 rounded-full transform translate-x-12 -translate-y-12"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-white bg-opacity-10 rounded-full transform -translate-x-8 translate-y-8"></div>

        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold">faredown</h1>
              <p className="text-blue-100 text-sm">
                Don't Just Book It. Bargain It.™
              </p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3 backdrop-blur-sm">
              <div className="text-xs text-blue-100">E-Ticket</div>
              <div className="font-bold text-sm">
                {bookingDetails.bookingRef}
              </div>
            </div>
          </div>

          {bookingDetails.bargainSuccess && (
            <div className="bg-orange-500 bg-opacity-90 rounded-lg p-3 mb-4">
              <div className="flex items-center space-x-2">
                <Gift className="w-4 h-4" />
                <span className="font-semibold text-sm">Bargain Success!</span>
              </div>
              <p className="text-xs mt-1">
                You saved ₹
                {(25000 - bookingDetails.totalAmount).toLocaleString()} with AI
                negotiation
              </p>
            </div>
          )}

          <div className="text-center">
            <div className="text-lg font-bold">Emirates Airlines</div>
            <div className="text-blue-100">EK 508 • Economy Class</div>
          </div>
        </div>
      </div>

      {/* Flight Route */}
      <div className="p-6 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">BOM</div>
            <div className="text-xs text-gray-600 mb-1">Mumbai</div>
            <div className="text-lg font-semibold">10:15</div>
            <div className="text-xs text-gray-500">Aug 16</div>
          </div>

          <div className="flex-1 px-4">
            <div className="flex items-center justify-center relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-dashed border-gray-300"></div>
              </div>
              <div className="relative bg-blue-600 text-white px-3 py-1 rounded-full flex items-center">
                <Plane className="w-3 h-3 mr-1" />
                <span className="text-xs font-medium">2h 25m</span>
              </div>
            </div>
            <div className="text-center mt-1">
              <div className="text-xs font-medium text-green-600">Direct</div>
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">DXB</div>
            <div className="text-xs text-gray-600 mb-1">Dubai</div>
            <div className="text-lg font-semibold">11:45</div>
            <div className="text-xs text-gray-500">Aug 16</div>
          </div>
        </div>
      </div>

      {/* Passenger Details */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
          <User className="w-4 h-4 mr-2 text-blue-600" />
          Passenger
        </h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="font-semibold text-gray-900">
            {bookingDetails.passengers[0]?.title}{" "}
            {bookingDetails.passengers[0]?.firstName}{" "}
            {bookingDetails.passengers[0]?.lastName}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            Seat: 14A • Economy Class
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
          <Shield className="w-4 h-4 mr-2 text-blue-600" />
          Included Services
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
            <Luggage className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <div className="text-xs font-medium text-green-800">
              23kg Baggage
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
            <Utensils className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <div className="text-xs font-medium text-green-800">Meals</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
            <Wifi className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <div className="text-xs font-medium text-green-800">WiFi</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
            <Star className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <div className="text-xs font-medium text-green-800">Priority</div>
          </div>
        </div>
      </div>

      {/* QR Code and Barcode */}
      <div className="p-6 border-b border-gray-200 text-center">
        <div className="bg-gray-100 rounded-lg p-6 inline-block">
          <QrCode className="w-20 h-20 text-gray-400 mx-auto mb-3" />
          <div className="text-sm font-medium text-gray-700">
            Mobile Boarding Pass
          </div>
          <div className="text-xs text-gray-500 mt-1">Show at airport</div>
        </div>
      </div>

      {/* Important Info */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
          <Calendar className="w-4 h-4 mr-2 text-blue-600" />
          Important Information
        </h3>
        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
            <span>Web check-in opens 24 hours before departure</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
            <span>Arrive 3 hours early for international flights</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
            <span>Carry valid passport and visa documents</span>
          </div>
        </div>
      </div>

      {/* Payment Summary */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">Payment Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Base Fare:</span>
            <span>₹{(bookingDetails.totalAmount - 2000).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Taxes & Fees:</span>
            <span>₹2,000</span>
          </div>
          {bookingDetails.bargainSuccess && (
            <div className="flex justify-between text-green-600">
              <span>Faredown Savings:</span>
              <span>
                -₹{(25000 - bookingDetails.totalAmount).toLocaleString()}
              </span>
            </div>
          )}
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between font-semibold">
              <span>Total Paid:</span>
              <span className="text-green-600">
                ₹{bookingDetails.totalAmount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Button
            onClick={handleDownload}
            variant="outline"
            className="flex items-center justify-center py-3"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button
            onClick={handleShare}
            variant="outline"
            className="flex items-center justify-center py-3"
          >
            <Share className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>

        <div className="text-center">
          <div className="text-lg font-bold text-gray-900 mb-1">
            Thank you for choosing Faredown!
          </div>
          <div className="text-sm text-gray-600">
            Safe travels and enjoy your journey
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white p-4 text-center">
        <div className="text-xs">
          © 2024 Faredown Technologies • The World's First Online Travel
          Bargain Portal™
        </div>
      </div>
    </div>
  );
};

export default MobileTicket;
