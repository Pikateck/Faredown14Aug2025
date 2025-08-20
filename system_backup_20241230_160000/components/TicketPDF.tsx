import React from "react";
import { Plane, Calendar, Clock, User, MapPin } from "lucide-react";

interface TicketPDFProps {
  booking: {
    id: string;
    passengers: Array<{
      firstName: string;
      lastName: string;
      type: string;
    }>;
    flights: Array<{
      from: string;
      to: string;
      date: string;
      time: string;
      duration: string;
      airline: string;
      flightNumber: string;
    }>;
    seats: Array<{
      passenger: string;
      seat: string;
      price: number;
    }>;
    total: number;
  };
}

export const TicketPDF: React.FC<TicketPDFProps> = ({ booking }) => {
  return (
    <div
      className="bg-white p-8 max-w-4xl mx-auto"
      style={{ fontFamily: "Arial, sans-serif" }}
    >
      {/* Header */}
      <div className="bg-[#003580] text-white p-6 rounded-t-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">faredown.com</h1>
            <p className="text-blue-100 mt-1">Electronic Ticket</p>
          </div>
          <div className="text-right">
            <p className="text-blue-100">Booking Reference</p>
            <p className="text-2xl font-bold tracking-wider">{booking.id}</p>
          </div>
        </div>
      </div>

      {/* Flight Information */}
      {booking.flights.map((flight, index) => (
        <div key={index} className="border-x border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Plane className="w-6 h-6 text-[#003580] mr-2" />
            <h2 className="text-xl font-bold text-gray-800">
              Flight {index + 1}: {flight.from} → {flight.to}
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <Calendar className="w-4 h-4 text-[#003580] mr-2" />
                <span className="text-sm font-medium text-gray-600">Date</span>
              </div>
              <p className="font-bold text-gray-800">{flight.date}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <Clock className="w-4 h-4 text-[#003580] mr-2" />
                <span className="text-sm font-medium text-gray-600">Time</span>
              </div>
              <p className="font-bold text-gray-800">{flight.time}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <Plane className="w-4 h-4 text-[#003580] mr-2" />
                <span className="text-sm font-medium text-gray-600">
                  Flight
                </span>
              </div>
              <p className="font-bold text-gray-800">{flight.flightNumber}</p>
              <p className="text-sm text-gray-600">{flight.airline}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <Clock className="w-4 h-4 text-[#003580] mr-2" />
                <span className="text-sm font-medium text-gray-600">
                  Duration
                </span>
              </div>
              <p className="font-bold text-gray-800">{flight.duration}</p>
            </div>
          </div>

          {/* Route Visualization */}
          <div className="flex items-center justify-between mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="text-center">
              <div className="flex items-center mb-2">
                <MapPin className="w-4 h-4 text-[#003580] mr-1" />
                <span className="text-sm font-medium text-gray-600">
                  Departure
                </span>
              </div>
              <p className="text-2xl font-bold text-[#003580]">{flight.from}</p>
            </div>

            <div className="flex-1 mx-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-[#003580] rounded-full"></div>
                <div className="flex-1 h-0.5 bg-[#003580] relative">
                  <Plane className="w-5 h-5 text-[#003580] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-1" />
                </div>
                <div className="w-3 h-3 bg-[#003580] rounded-full"></div>
              </div>
              <p className="text-center text-sm text-gray-600 mt-2">
                {flight.duration}
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center mb-2">
                <MapPin className="w-4 h-4 text-[#003580] mr-1" />
                <span className="text-sm font-medium text-gray-600">
                  Arrival
                </span>
              </div>
              <p className="text-2xl font-bold text-[#003580]">{flight.to}</p>
            </div>
          </div>
        </div>
      ))}

      {/* Passenger Information */}
      <div className="border-x border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <User className="w-6 h-6 text-[#003580] mr-2" />
          <h2 className="text-xl font-bold text-gray-800">
            Passenger Information
          </h2>
        </div>

        <div className="grid gap-4">
          {booking.passengers.map((passenger, index) => (
            <div
              key={index}
              className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
            >
              <div>
                <p className="font-bold text-gray-800">
                  {passenger.firstName} {passenger.lastName}
                </p>
                <p className="text-sm text-gray-600">{passenger.type}</p>
              </div>
              {booking.seats[index] && (
                <div className="text-right">
                  <p className="font-bold text-[#003580]">
                    Seat {booking.seats[index].seat}
                  </p>
                  <p className="text-sm text-gray-600">
                    ₹ {booking.seats[index].price.toLocaleString("en-IN")}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Summary */}
      <div className="border-x border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Pricing Summary
        </h3>
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-gray-600">
            <span>Base Fare ({booking.passengers.length} passengers)</span>
            <span>₹ {(booking.total * 0.8).toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Taxes & Fees</span>
            <span>₹ {(booking.total * 0.15).toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Seat Selection</span>
            <span>₹ {(booking.total * 0.05).toLocaleString("en-IN")}</span>
          </div>
        </div>
        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold text-gray-800">
              Total Amount
            </span>
            <span className="text-2xl font-bold text-[#003580]">
              ₹ {booking.total.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-100 p-6 rounded-b-lg border border-gray-200">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-bold text-gray-800 mb-2">
              Check-in Information
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Online check-in opens 24 hours before departure</li>
              <li>• Airport check-in closes 45 minutes before departure</li>
              <li>• Arrive at airport 2 hours before domestic flights</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-800 mb-2">Important Notes</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Carry a valid photo ID for domestic travel</li>
              <li>• Check baggage allowance before travel</li>
              <li>• Contact support: +91-1234567890</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-300 text-center">
          <p className="text-sm text-gray-500">
            This is an electronic ticket. Please save this document for your
            records.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TicketPDF;
