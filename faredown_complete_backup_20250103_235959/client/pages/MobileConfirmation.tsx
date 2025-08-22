import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Check,
  Download,
  Share,
  Calendar,
  MapPin,
  Clock,
  User,
  Mail,
  Phone,
  Plane,
} from "lucide-react";

const MobileConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedFlight, travellers, addOns, total } = location.state || {};

  const bookingRef = `FD${Date.now().toString().slice(-6)}`;

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const handleDownload = () => {
    // Implement download functionality
    alert("Downloading booking confirmation...");
  };

  const handleShare = () => {
    // Implement share functionality
    if (navigator.share) {
      navigator.share({
        title: "Flight Booking Confirmation",
        text: `Flight booked! Booking reference: ${bookingRef}`,
        url: window.location.href,
      });
    } else {
      alert("Sharing booking details...");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Success Header */}
      <div className="text-center pt-8 pb-6 px-4">
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Check className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Booking Confirmed!
        </h1>
        <p className="text-gray-600">
          Your flight has been successfully booked
        </p>
      </div>

      {/* Booking Reference */}
      <div className="mx-4 mb-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
          <div className="text-sm text-gray-500 mb-1">Booking Reference</div>
          <div className="text-2xl font-bold text-blue-600 tracking-wider">
            {bookingRef}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Save this reference for future use
          </div>
        </div>
      </div>

      {/* Flight Details */}
      <div className="mx-4 mb-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
            <Plane className="w-5 h-5 mr-2 text-blue-600" />
            Flight Details
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{selectedFlight?.logo}</div>
                <div>
                  <div className="font-medium">{selectedFlight?.airline}</div>
                  <div className="text-sm text-gray-500">
                    {selectedFlight?.class}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">
                  {formatCurrency(selectedFlight?.price || 0)}
                </div>
                <div className="text-xs text-gray-500">per person</div>
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-t border-gray-100">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-800">
                  {selectedFlight?.departure}
                </div>
                <div className="text-sm text-gray-500">
                  {selectedFlight?.from}
                </div>
                <div className="text-xs text-gray-400">Departure</div>
              </div>

              <div className="flex-1 mx-4 text-center">
                <div className="relative">
                  <div className="h-px bg-gray-300 w-full"></div>
                  <Plane className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 bg-white" />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {selectedFlight?.duration}
                </div>
              </div>

              <div className="text-center">
                <div className="text-lg font-bold text-gray-800">
                  {selectedFlight?.arrival}
                </div>
                <div className="text-sm text-gray-500">
                  {selectedFlight?.to}
                </div>
                <div className="text-xs text-gray-400">Arrival</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Passenger Details */}
      <div className="mx-4 mb-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2 text-blue-600" />
            Passenger Details
          </h3>

          <div className="space-y-3">
            {travellers?.map((traveller, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
              >
                <div>
                  <div className="font-medium">
                    {traveller.title} {traveller.firstName} {traveller.lastName}
                  </div>
                  <div className="text-sm text-gray-500">{traveller.type}</div>
                </div>
                {index === 0 && (
                  <div className="text-right text-xs text-gray-500">
                    <div className="flex items-center">
                      <Mail className="w-3 h-3 mr-1" />
                      {traveller.email}
                    </div>
                    <div className="flex items-center mt-1">
                      <Phone className="w-3 h-3 mr-1" />
                      {traveller.phone}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add-ons */}
      {Object.values(addOns || {}).some((addon) => addon.selected) && (
        <div className="mx-4 mb-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-800 mb-4">
              Selected Add-ons
            </h3>

            <div className="space-y-2">
              {addOns &&
                Object.entries(addOns).map(([key, addon]) => {
                  if (!addon.selected) return null;

                  const addonNames = {
                    meals: "🍽️ Meals",
                    baggage: "🧳 Extra Baggage",
                    insurance: "🛡️ Travel Insurance",
                    priorityBoarding: "🚀 Priority Boarding",
                  };

                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between py-2"
                    >
                      <span className="text-sm">{addonNames[key]}</span>
                      <span className="text-sm font-medium text-blue-600">
                        {formatCurrency(addon.price)}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* Total Amount */}
      <div className="mx-4 mb-4">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-gray-800">
              Total Paid
            </span>
            <span className="text-2xl font-bold text-blue-600">
              {formatCurrency(total || 0)}
            </span>
          </div>
          <div className="text-sm text-gray-500 mt-1">
            Payment successful via your selected method
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mx-4 space-y-3 pb-6">
        <button
          onClick={handleDownload}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 hover:shadow-lg transition-all"
        >
          <Download className="w-5 h-5" />
          <span>Download Ticket</span>
        </button>

        <button
          onClick={handleShare}
          className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 hover:bg-gray-200 transition-all"
        >
          <Share className="w-5 h-5" />
          <span>Share Booking</span>
        </button>
      </div>

      {/* Important Information */}
      <div className="mx-4 mb-8">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h4 className="font-semibold text-amber-800 mb-2">
            Important Information
          </h4>
          <ul className="text-sm text-amber-700 space-y-1">
            <li>• Arrive at airport 2 hours before domestic flights</li>
            <li>• Carry valid ID proof and printed/digital ticket</li>
            <li>• Web check-in opens 24 hours before departure</li>
            <li>• Contact airline for any changes or cancellations</li>
          </ul>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate("/mobile-home")}
            className="bg-gray-100 text-gray-700 py-3 rounded-lg font-medium"
          >
            Book Another
          </button>
          <button
            onClick={() => navigate("/mobile-trips")}
            className="bg-blue-600 text-white py-3 rounded-lg font-medium"
          >
            My Bookings
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileConfirmation;
