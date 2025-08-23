import React, { useEffect } from "react";
import {
  QrCode,
  Building2,
  Calendar,
  Users,
  MapPin,
  Bed,
  Star,
  Clock,
  Wifi,
  Car,
  Coffee,
  Utensils,
} from "lucide-react";
import { preparePrintDocument } from "@/utils/printUtils";

interface HotelVoucherProps {
  booking: {
    id: string;
    name: string;
    location: string;
    checkIn: string;
    checkOut: string;
    roomType: string;
    bookingRef: string;
    guests: number;
    totalAmount: string;
    guestName?: string;
    phone?: string;
    email?: string;
    nights?: number;
    rating?: number;
  };
  onPrint?: () => void;
}

export const HotelVoucher: React.FC<HotelVoucherProps> = ({
  booking,
  onPrint,
}) => {
  const amenities = [
    { icon: Wifi, label: "Free WiFi" },
    { icon: Car, label: "Parking" },
    { icon: Coffee, label: "Breakfast" },
    { icon: Utensils, label: "Restaurant" },
  ];

  useEffect(() => {
    const cleanup = preparePrintDocument("voucher");
    return cleanup;
  }, []);

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
            <p className="text-blue-100 text-sm">Travel Booking Platform</p>
          </div>
          <div className="text-right">
            <div className="bg-white/20 rounded-lg p-3">
              <QrCode className="w-16 h-16 text-white mx-auto mb-2" />
              <p className="text-xs">Hotel Voucher</p>
              <p className="font-mono font-bold">{booking.bookingRef}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hotel Information */}
      <div className="p-6 border-b-2 border-dashed border-gray-300">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-[#003580] rounded-lg flex items-center justify-center">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {booking.name}
              </h2>
              <div className="flex items-center mb-2">
                <MapPin className="w-4 h-4 text-gray-600 mr-2" />
                <p className="text-gray-700">{booking.location}</p>
              </div>
              {booking.rating && (
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < booking.rating!
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    {booking.rating} Star Hotel
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Hotel Voucher</p>
            <p className="text-xl font-bold text-[#003580]">#{booking.id}</p>
          </div>
        </div>

        {/* Booking Summary */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-[#003580] mb-3">
            Booking Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Calendar className="w-4 h-4 text-gray-600 mb-1" />
              <p className="text-xs text-gray-600 uppercase tracking-wide">
                Check-in
              </p>
              <p className="font-semibold text-gray-900">{booking.checkIn}</p>
            </div>
            <div>
              <Calendar className="w-4 h-4 text-gray-600 mb-1" />
              <p className="text-xs text-gray-600 uppercase tracking-wide">
                Check-out
              </p>
              <p className="font-semibold text-gray-900">{booking.checkOut}</p>
            </div>
            <div>
              <Bed className="w-4 h-4 text-gray-600 mb-1" />
              <p className="text-xs text-gray-600 uppercase tracking-wide">
                Room Type
              </p>
              <p className="font-semibold text-gray-900">{booking.roomType}</p>
            </div>
            <div>
              <Users className="w-4 h-4 text-gray-600 mb-1" />
              <p className="text-xs text-gray-600 uppercase tracking-wide">
                Guests
              </p>
              <p className="font-semibold text-gray-900">{booking.guests}</p>
            </div>
          </div>
        </div>

        {/* Duration and Total */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <Clock className="w-5 h-5 text-gray-600 mb-2" />
            <p className="text-sm text-gray-600">Duration</p>
            <p className="text-xl font-bold text-gray-900">
              {booking.nights || 1} Night{(booking.nights || 1) > 1 ? "s" : ""}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <p className="text-sm text-green-600">Total Amount Paid</p>
            <p className="text-2xl font-bold text-green-700">
              {booking.totalAmount}
            </p>
          </div>
        </div>
      </div>

      {/* Guest Information */}
      <div className="p-6 border-b-2 border-dashed border-gray-300">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Guest Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600">Primary Guest</p>
            <p className="font-semibold text-gray-900">
              {booking.guestName || "John Doe"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Contact Number</p>
            <p className="font-semibold text-gray-900">
              {booking.phone || "+971 50 123 4567"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Email Address</p>
            <p className="font-semibold text-gray-900">
              {booking.email || "guest@example.com"}
            </p>
          </div>
        </div>
      </div>

      {/* Hotel Amenities */}
      <div className="p-6 border-b-2 border-dashed border-gray-300">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Hotel Amenities
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {amenities.map((amenity, index) => (
            <div
              key={index}
              className="flex items-center space-x-2 text-gray-700"
            >
              <amenity.icon className="w-4 h-4 text-[#003580]" />
              <span className="text-sm">{amenity.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Check-in Instructions */}
      <div className="p-6 bg-blue-50 border-l-4 border-[#003580]">
        <h3 className="text-lg font-semibold text-[#003580] mb-3">
          Check-in Instructions
        </h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start">
            <span className="w-2 h-2 bg-[#003580] rounded-full mt-2 mr-3 flex-shrink-0"></span>
            Check-in time: 3:00 PM onwards | Check-out time: 12:00 PM
          </li>
          <li className="flex items-start">
            <span className="w-2 h-2 bg-[#003580] rounded-full mt-2 mr-3 flex-shrink-0"></span>
            Present this voucher and a valid government-issued photo ID at the
            front desk
          </li>
          <li className="flex items-start">
            <span className="w-2 h-2 bg-[#003580] rounded-full mt-2 mr-3 flex-shrink-0"></span>
            Credit card may be required for incidental charges and security
            deposit
          </li>
          <li className="flex items-start">
            <span className="w-2 h-2 bg-[#003580] rounded-full mt-2 mr-3 flex-shrink-0"></span>
            Early check-in and late check-out subject to availability and
            additional charges
          </li>
        </ul>
      </div>

      {/* Hotel Policies */}
      <div className="p-6 bg-amber-50 border-l-4 border-amber-400">
        <h3 className="text-lg font-semibold text-amber-800 mb-3">
          Hotel Policies
        </h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex items-start">
            <span className="w-2 h-2 bg-amber-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            Cancellation: Free cancellation up to 24 hours before check-in
          </li>
          <li className="flex items-start">
            <span className="w-2 h-2 bg-amber-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            No-show policy: Full charge for first night will apply
          </li>
          <li className="flex items-start">
            <span className="w-2 h-2 bg-amber-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            Pets: Contact hotel directly for pet policy
          </li>
          <li className="flex items-start">
            <span className="w-2 h-2 bg-amber-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            Additional guests: Extra charges may apply
          </li>
        </ul>
      </div>

      {/* Footer */}
      <div className="p-6 bg-gray-50 text-center">
        <p className="text-sm text-gray-600 mb-2">
          Thank you for choosing Faredown!
        </p>
        <p className="text-xs text-gray-500">
          For support, contact us at support@faredown.com | +971 4 123 4567
        </p>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-400">
            This is a computer-generated voucher and does not require a
            signature.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Valid only for the dates and guest mentioned above.
          </p>
        </div>
      </div>
    </div>
  );
};
