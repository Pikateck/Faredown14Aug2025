import React, { useEffect } from "react";
import {
  QrCode,
  Car,
  Calendar,
  Clock,
  Users,
  MapPin,
  Phone,
  Mail,
  User,
  Navigation,
  Shield,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { preparePrintDocument } from "@/utils/printUtils";

interface TransferVoucherProps {
  booking: {
    id: string;
    transferType: string;
    vehicleName: string;
    vehicleClass: string;
    pickupLocation: string;
    dropoffLocation: string;
    pickupDate: string;
    pickupTime: string;
    returnDate?: string;
    returnTime?: string;
    bookingRef: string;
    passengers: number;
    totalAmount: string;
    guestName?: string;
    phone?: string;
    email?: string;
    driverContact?: string;
    providerName?: string;
    duration?: string;
    distance?: string;
    isRoundTrip?: boolean;
    specialRequests?: string;
    flightNumber?: string;
  };
  onPrint?: () => void;
}

export const TransferVoucher: React.FC<TransferVoucherProps> = ({
  booking,
  onPrint,
}) => {
  const features = [
    { icon: Shield, label: "Professional Driver" },
    { icon: Phone, label: "24/7 Support" },
    { icon: CheckCircle, label: "Instant Confirmation" },
    { icon: Navigation, label: "GPS Tracking" },
  ];

  useEffect(() => {
    const cleanup = preparePrintDocument("voucher");
    return cleanup;
  }, []);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Date TBD";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white text-black print:shadow-none print:border-none">
      {/* Print Styles */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .print-break {
            page-break-before: always;
          }
          body {
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
        }
      `}</style>

      {/* Header */}
      <div className="bg-gradient-to-r from-[#003580] to-[#0071c2] text-white p-6 print:bg-[#003580]">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-1">FAREDOWN</h1>
            <p className="text-blue-100 text-sm">Transfer Booking Voucher</p>
          </div>
          <div className="text-right">
            <div className="bg-white/20 rounded-lg p-3">
              <QrCode className="w-16 h-16 text-white mx-auto mb-2" />
              <p className="text-xs text-center">Scan for details</p>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Reference */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 print:bg-orange-500">
        <div className="text-center">
          <p className="text-sm opacity-90">Booking Reference</p>
          <p className="text-2xl font-bold tracking-wider">
            {booking.bookingRef}
          </p>
        </div>
      </div>

      {/* Transfer Details */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Transfer Info */}
          <div>
            <div className="flex items-center mb-4">
              <Car className="w-8 h-8 text-[#003580] mr-3" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {booking.vehicleName}
                </h2>
                <p className="text-gray-600">
                  {booking.vehicleClass} • {booking.transferType}
                </p>
              </div>
            </div>

            {/* Route */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Pickup</span>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {booking.pickupLocation}
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Drop-off</span>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {booking.dropoffLocation}
                  </p>
                </div>
              </div>
            </div>

            {/* DateTime & Details */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-[#003580]" />
                <div>
                  <p className="text-sm text-gray-600">Pickup Date</p>
                  <p className="font-semibold">
                    {formatDate(booking.pickupDate)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-[#003580]" />
                <div>
                  <p className="text-sm text-gray-600">Pickup Time</p>
                  <p className="font-semibold">{booking.pickupTime || "TBD"}</p>
                </div>
              </div>
            </div>

            {/* Return Trip Details */}
            {booking.isRoundTrip && booking.returnDate && (
              <div className="border-t pt-4 mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Return Journey
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-[#003580]" />
                    <div>
                      <p className="text-sm text-gray-600">Return Date</p>
                      <p className="font-semibold">
                        {formatDate(booking.returnDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-[#003580]" />
                    <div>
                      <p className="text-sm text-gray-600">Return Time</p>
                      <p className="font-semibold">
                        {booking.returnTime || "TBD"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-gray-600" />
                <span>
                  {booking.passengers} passenger
                  {booking.passengers !== 1 ? "s" : ""}
                </span>
              </div>
              {booking.duration && (
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-600" />
                  <span>{booking.duration}</span>
                </div>
              )}
              {booking.distance && (
                <div className="flex items-center space-x-2">
                  <Navigation className="w-4 h-4 text-gray-600" />
                  <span>{booking.distance}</span>
                </div>
              )}
              {booking.flightNumber && (
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-600" />
                  <span>Flight: {booking.flightNumber}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Guest & Payment Info */}
          <div>
            {/* Guest Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Guest Information
              </h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-600" />
                  <span className="font-medium">
                    {booking.guestName || "Guest Name"}
                  </span>
                </div>
                {booking.email && (
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-600">
                      {booking.email}
                    </span>
                  </div>
                )}
                {booking.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-600">
                      {booking.phone}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Payment Summary
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Transfer Fare</span>
                  <span className="font-semibold">{booking.totalAmount}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Paid</span>
                    <span className="text-xl font-bold text-[#003580]">
                      {booking.totalAmount}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Provider Info */}
            {booking.providerName && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Service Provider
                </h3>
                <p className="text-gray-600">{booking.providerName}</p>
                {booking.driverContact && (
                  <p className="text-sm text-gray-500">
                    Driver: {booking.driverContact}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Special Requests */}
        {booking.specialRequests && (
          <div className="border-t pt-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Special Requests
            </h3>
            <p className="text-gray-600 bg-gray-50 p-3 rounded">
              {booking.specialRequests}
            </p>
          </div>
        )}

        {/* Features */}
        <div className="border-t pt-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Included Services
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm">
                <feature.icon className="w-4 h-4 text-green-600" />
                <span className="text-gray-700">{feature.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Important Information */}
        <div className="border-t pt-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Important Information
          </h3>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <ul className="space-y-1">
                  <li>
                    • Please be ready 15 minutes before your scheduled pickup
                    time
                  </li>
                  <li>
                    • Driver contact details will be sent 24 hours before pickup
                  </li>
                  <li>
                    • For any changes or cancellations, contact us at least 24
                    hours in advance
                  </li>
                  <li>
                    • Keep this voucher handy and present it to the driver
                  </li>
                  {booking.flightNumber && (
                    <li>• Driver will monitor your flight for any delays</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="border-t pt-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Need Help?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-[#003580]" />
              <div>
                <p className="font-medium">24/7 Support</p>
                <p className="text-gray-600">+91-1234567890</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-[#003580]" />
              <div>
                <p className="font-medium">Email Support</p>
                <p className="text-gray-600">support@faredown.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t pt-6 mt-6 text-center text-xs text-gray-500">
          <p>Thank you for choosing Faredown! Have a safe journey.</p>
          <p className="mt-1">
            Booking ID: {booking.id} | Generated on{" "}
            {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};
