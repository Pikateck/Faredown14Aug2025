import React, { useEffect } from "react";
import {
  QrCode,
  Plane,
  Calendar,
  Clock,
  Users,
  MapPin,
  Ticket,
} from "lucide-react";
import { preparePrintDocument } from "@/utils/printUtils";

interface FlightVoucherProps {
  booking: {
    id: string;
    airline: string;
    route: string;
    date: string;
    time: string;
    flightNumber: string;
    bookingRef: string;
    seat: string;
    terminal: string;
    gate: string;
    passengers: number;
    totalAmount: string;
    passengerName?: string;
  };
  onPrint?: () => void;
}

export const FlightVoucher: React.FC<FlightVoucherProps> = ({
  booking,
  onPrint,
}) => {
  const [fromCity, toCity] = booking.route.split(" → ");

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
              <p className="text-xs">Booking Reference</p>
              <p className="font-mono font-bold">{booking.bookingRef}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Flight Information */}
      <div className="p-6 border-b-2 border-dashed border-gray-300">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-[#003580] rounded-full flex items-center justify-center">
              <Plane className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {booking.airline}
              </h2>
              <p className="text-gray-600">Flight {booking.flightNumber}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Boarding Pass</p>
            <p className="text-2xl font-bold text-[#003580]">
              {booking.flightNumber}
            </p>
          </div>
        </div>

        {/* Route Information */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="bg-gray-50 rounded-lg p-4">
              <MapPin className="w-5 h-5 text-gray-600 mx-auto mb-2" />
              <p className="text-xs text-gray-600 uppercase tracking-wide">
                From
              </p>
              <p className="text-xl font-bold text-gray-900">{fromCity}</p>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="w-full border-t-2 border-dashed border-gray-300 relative">
              <Plane className="w-5 h-5 text-[#003580] absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white" />
            </div>
          </div>
          <div className="text-center">
            <div className="bg-gray-50 rounded-lg p-4">
              <MapPin className="w-5 h-5 text-gray-600 mx-auto mb-2" />
              <p className="text-xs text-gray-600 uppercase tracking-wide">
                To
              </p>
              <p className="text-xl font-bold text-gray-900">{toCity}</p>
            </div>
          </div>
        </div>

        {/* Flight Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <Calendar className="w-4 h-4 text-gray-600 mb-1" />
            <p className="text-xs text-gray-600 uppercase tracking-wide">
              Date
            </p>
            <p className="font-semibold text-gray-900">{booking.date}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <Clock className="w-4 h-4 text-gray-600 mb-1" />
            <p className="text-xs text-gray-600 uppercase tracking-wide">
              Time
            </p>
            <p className="font-semibold text-gray-900">{booking.time}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <Ticket className="w-4 h-4 text-gray-600 mb-1" />
            <p className="text-xs text-gray-600 uppercase tracking-wide">
              Seat
            </p>
            <p className="font-semibold text-gray-900">{booking.seat}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <Users className="w-4 h-4 text-gray-600 mb-1" />
            <p className="text-xs text-gray-600 uppercase tracking-wide">
              Passengers
            </p>
            <p className="font-semibold text-gray-900">{booking.passengers}</p>
          </div>
        </div>
      </div>

      {/* Passenger Information */}
      <div className="p-6 border-b-2 border-dashed border-gray-300">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Passenger Information
        </h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600">Passenger Name</p>
            <p className="font-semibold text-gray-900">
              {booking.passengerName || "John Doe"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Booking Reference</p>
            <p className="font-mono font-semibold text-gray-900">
              {booking.bookingRef}
            </p>
          </div>
        </div>
      </div>

      {/* Terminal Information */}
      <div className="p-6 border-b-2 border-dashed border-gray-300">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Terminal Information
        </h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600">Terminal</p>
            <p className="text-xl font-bold text-[#003580]">
              {booking.terminal}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Gate</p>
            <p className="text-xl font-bold text-[#003580]">{booking.gate}</p>
          </div>
        </div>
      </div>

      {/* Important Information */}
      <div className="p-6 bg-amber-50 border-l-4 border-amber-400">
        <h3 className="text-lg font-semibold text-amber-800 mb-3">
          Important Information
        </h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex items-start">
            <span className="w-2 h-2 bg-amber-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            Please arrive at the airport at least 2 hours before domestic
            flights and 3 hours before international flights
          </li>
          <li className="flex items-start">
            <span className="w-2 h-2 bg-amber-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            Carry a valid government-issued photo ID and this boarding pass
          </li>
          <li className="flex items-start">
            <span className="w-2 h-2 bg-amber-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            Check-in online or at the airport counter before proceeding to
            security
          </li>
          <li className="flex items-start">
            <span className="w-2 h-2 bg-amber-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            Gate assignments may change - check airport displays for updates
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
        </div>
      </div>
    </div>
  );
};
