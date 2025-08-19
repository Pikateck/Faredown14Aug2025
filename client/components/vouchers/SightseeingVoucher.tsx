import React, { useEffect } from "react";
import {
  QrCode,
  Camera,
  Calendar,
  Users,
  MapPin,
  Clock,
  Star,
  Ticket,
  Info,
  CheckCircle,
} from "lucide-react";
import { preparePrintDocument } from "@/utils/printUtils";

interface SightseeingVoucherProps {
  booking: {
    id: string;
    name: string;
    location: string;
    visitDate: string;
    visitTime: string;
    bookingRef: string;
    guests: number;
    totalAmount: string;
    guestName?: string;
    email?: string;
    ticketType: string;
    duration: string;
    rating?: number;
    category?: string;
  };
  onPrint?: () => void;
}

export const SightseeingVoucher: React.FC<SightseeingVoucherProps> = ({
  booking,
  onPrint,
}) => {
  const features = [
    "Skip-the-line access",
    "Professional guide",
    "Mobile ticket",
    "Instant confirmation",
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
              <p className="text-xs">Experience Ticket</p>
              <p className="font-mono font-bold">{booking.bookingRef}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Experience Information */}
      <div className="p-6 border-b-2 border-dashed border-gray-300">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-[#003580] rounded-lg flex items-center justify-center">
              <Camera className="w-8 h-8 text-white" />
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
                <div className="flex items-center mb-2">
                  <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                  <span className="text-sm text-gray-600">
                    {booking.rating} rating
                  </span>
                </div>
              )}
              {booking.category && (
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {booking.category}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Experience Ticket</p>
            <p className="text-xl font-bold text-[#003580]">#{booking.id}</p>
          </div>
        </div>

        {/* Visit Details */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-[#003580] mb-3">
            Visit Details
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Calendar className="w-4 h-4 text-gray-600 mb-1" />
              <p className="text-xs text-gray-600 uppercase tracking-wide">
                Visit Date
              </p>
              <p className="font-semibold text-gray-900">{booking.visitDate}</p>
            </div>
            <div>
              <Clock className="w-4 h-4 text-gray-600 mb-1" />
              <p className="text-xs text-gray-600 uppercase tracking-wide">
                Visit Time
              </p>
              <p className="font-semibold text-gray-900">{booking.visitTime}</p>
            </div>
            <div>
              <Ticket className="w-4 h-4 text-gray-600 mb-1" />
              <p className="text-xs text-gray-600 uppercase tracking-wide">
                Ticket Type
              </p>
              <p className="font-semibold text-gray-900">
                {booking.ticketType}
              </p>
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
              {booking.duration}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600">Primary Guest</p>
            <p className="font-semibold text-gray-900">
              {booking.guestName || "John Doe"}
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

      {/* What's Included */}
      <div className="p-6 border-b-2 border-dashed border-gray-300">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          What's Included
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-center space-x-2 text-gray-700"
            >
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Entry Instructions */}
      <div className="p-6 bg-blue-50 border-l-4 border-[#003580]">
        <h3 className="text-lg font-semibold text-[#003580] mb-3">
          Entry Instructions
        </h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start">
            <span className="w-2 h-2 bg-[#003580] rounded-full mt-2 mr-3 flex-shrink-0"></span>
            Please arrive 30 minutes before your scheduled time
          </li>
          <li className="flex items-start">
            <span className="w-2 h-2 bg-[#003580] rounded-full mt-2 mr-3 flex-shrink-0"></span>
            Present this voucher and a valid government-issued photo ID at the
            entrance
          </li>
          <li className="flex items-start">
            <span className="w-2 h-2 bg-[#003580] rounded-full mt-2 mr-3 flex-shrink-0"></span>
            Mobile tickets are accepted - you can show this on your phone
          </li>
          <li className="flex items-start">
            <span className="w-2 h-2 bg-[#003580] rounded-full mt-2 mr-3 flex-shrink-0"></span>
            Late arrivals may result in reduced experience time or forfeiture of
            ticket
          </li>
        </ul>
      </div>

      {/* Important Policies */}
      <div className="p-6 bg-amber-50 border-l-4 border-amber-400">
        <h3 className="text-lg font-semibold text-amber-800 mb-3">
          Important Policies
        </h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex items-start">
            <span className="w-2 h-2 bg-amber-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            Cancellation: Free cancellation up to 24 hours before visit date
          </li>
          <li className="flex items-start">
            <span className="w-2 h-2 bg-amber-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            Weather: Experience operates in most weather conditions
          </li>
          <li className="flex items-start">
            <span className="w-2 h-2 bg-amber-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            Age restrictions: Children under 12 must be accompanied by an adult
          </li>
          <li className="flex items-start">
            <span className="w-2 h-2 bg-amber-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            Photography: Personal photography allowed, commercial photography
            requires permission
          </li>
        </ul>
      </div>

      {/* Emergency Contact */}
      <div className="p-6 bg-red-50 border-l-4 border-red-400">
        <h3 className="text-lg font-semibold text-red-800 mb-3">
          Emergency Contact
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-red-700">
          <div>
            <p className="font-medium">Venue Contact</p>
            <p>+971 4 567 8901</p>
          </div>
          <div>
            <p className="font-medium">Faredown Support</p>
            <p>+971 4 123 4567</p>
          </div>
        </div>
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
            Valid only for the date, time, and guest mentioned above.
          </p>
        </div>
      </div>
    </div>
  );
};
