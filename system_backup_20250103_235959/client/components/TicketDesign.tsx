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
  Zap,
} from "lucide-react";

interface TicketDesignProps {
  bookingData: any;
}

export const TicketDesign: React.FC<TicketDesignProps> = ({ bookingData }) => {
  const { bookingDetails } = bookingData;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden print:shadow-none">
      {/* Header with Faredown Branding */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="relative p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">faredown.com</h1>
              <p className="text-blue-100 text-lg">
                Don't Just Book It. Bargain It.™
              </p>
            </div>
            <div className="text-right">
              <div className="bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-sm text-blue-100 mb-1">E-Ticket</div>
                <div className="text-xl font-bold">
                  {bookingDetails.bookingRef}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold">Emirates Airlines</div>
              <div className="text-blue-100">EK 508 • Boeing 777</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-blue-100">
                CONFIRMED
              </div>
              <div className="text-sm text-blue-200">Booking Status</div>
            </div>
            <div>
              <div className="text-lg font-semibold">Economy Class</div>
              <div className="text-blue-100">Eco Saver Fare</div>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-5 rounded-full transform translate-x-16 -translate-y-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-5 rounded-full transform -translate-x-12 translate-y-12"></div>
      </div>

      {/* Flight Route Section */}
      <div className="p-8 border-b border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="text-center flex-1">
            <div className="text-3xl font-bold text-gray-900 mb-1">BOM</div>
            <div className="text-sm text-gray-600 mb-2">Mumbai, India</div>
            <div className="text-lg font-semibold">10:15</div>
            <div className="text-sm text-gray-500">Aug 16, 2024</div>
          </div>

          <div className="flex-1 flex items-center justify-center relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-dashed border-gray-300"></div>
            </div>
            <div className="relative bg-blue-600 text-white px-4 py-2 rounded-full flex items-center">
              <Plane className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">2h 25m Direct</span>
            </div>
          </div>

          <div className="text-center flex-1">
            <div className="text-3xl font-bold text-gray-900 mb-1">DXB</div>
            <div className="text-sm text-gray-600 mb-2">Dubai, UAE</div>
            <div className="text-lg font-semibold">11:45</div>
            <div className="text-sm text-gray-500">Aug 16, 2024</div>
          </div>
        </div>
      </div>

      {/* Passenger and Flight Details */}
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column - Passenger Info */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                Passenger Details
              </h3>
              <div className="space-y-3">
                {bookingDetails.passengers.map(
                  (passenger: any, index: number) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="font-semibold text-gray-900">
                        {passenger.title} {passenger.firstName}{" "}
                        {passenger.lastName}
                      </div>
                      <div className="text-sm text-gray-600">
                        Seat: {passenger.seatNumber || "TBA"} •{" "}
                        {passenger.fareType || "Economy"}
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                Contact Information
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="text-sm">
                  <span className="text-gray-600">Email:</span>{" "}
                  {bookingDetails.contactDetails.email}
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Phone:</span>{" "}
                  {bookingDetails.contactDetails.phone}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Services & QR */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-blue-600" />
                Included Services
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                  <Luggage className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <div className="text-xs font-medium text-green-800">
                    23kg Baggage
                  </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                  <Utensils className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <div className="text-xs font-medium text-green-800">
                    Meals Included
                  </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                  <Wifi className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <div className="text-xs font-medium text-green-800">
                    WiFi Available
                  </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                  <Zap className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <div className="text-xs font-medium text-green-800">
                    Fast Check-in
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-gray-100 rounded-lg p-6 inline-block">
                <QrCode className="w-24 h-24 text-gray-400 mx-auto mb-3" />
                <div className="text-sm font-medium text-gray-700">
                  Mobile Boarding Pass
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Scan at airport
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Important Information */}
        <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-3 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Important Travel Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-yellow-700">
            <div>
              <div className="font-medium mb-1">Before Departure:</div>
              <ul className="space-y-1">
                <li>• Web check-in opens 24 hours before</li>
                <li>• Arrive 3 hours early for international flights</li>
                <li>• Carry valid passport and visa documents</li>
              </ul>
            </div>
            <div>
              <div className="font-medium mb-1">Support:</div>
              <ul className="space-y-1">
                <li>• Email: support@faredown.com</li>
                <li>• Phone: +91-1234567890</li>
                <li>• 24/7 Customer Support Available</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-3">Payment Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-blue-700">Base Fare:</span>
              <span className="text-blue-700">
                {bookingDetails.currency.symbol}
                {(bookingDetails.totalAmount - 2000).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Taxes & Fees:</span>
              <span className="text-blue-700">
                {bookingDetails.currency.symbol}2,000
              </span>
            </div>
            {bookingDetails.faredownBonus && (
              <div className="flex justify-between text-green-700">
                <span>Faredown Bargain Savings:</span>
                <span>
                  -{bookingDetails.currency.symbol}
                  {bookingDetails.faredownBonus.toLocaleString()}
                </span>
              </div>
            )}
            <div className="border-t border-blue-300 pt-2 mt-2">
              <div className="flex justify-between font-semibold text-blue-900">
                <span>Total Paid:</span>
                <span>
                  {bookingDetails.currency.symbol}
                  {bookingDetails.totalAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white p-6 text-center">
        <div className="text-lg font-bold mb-2">
          Thank you for choosing Faredown!
        </div>
        <div className="text-gray-400 text-sm">
          © 2024 Faredown Technologies. All rights reserved. |
          <span className="ml-2">
            The World's First Online Travel Bargain Portal™
          </span>
        </div>
      </div>
    </div>
  );
};

export default TicketDesign;
