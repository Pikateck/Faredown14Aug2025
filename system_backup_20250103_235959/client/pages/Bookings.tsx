import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FlightVoucher } from "@/components/vouchers/FlightVoucher";
import { HotelVoucher } from "@/components/vouchers/HotelVoucher";
import { SightseeingVoucher } from "@/components/vouchers/SightseeingVoucher";
import { TransferVoucher } from "@/components/vouchers/TransferVoucher";
import { FaredownInvoice } from "@/components/invoices/FaredownInvoice";

const Bookings: React.FC = () => {
  const [searchParams] = useSearchParams();

  // Initialize tab from URL parameter
  const getInitialTab = ():
    | "all"
    | "flights"
    | "hotels"
    | "sightseeing"
    | "transfers" => {
    const tabParam = searchParams.get("tab");
    if (
      tabParam &&
      ["all", "flights", "hotels", "sightseeing", "transfers"].includes(
        tabParam,
      )
    ) {
      return tabParam as
        | "all"
        | "flights"
        | "hotels"
        | "sightseeing"
        | "transfers";
    }
    return "all";
  };

  const [activeTab, setActiveTab] = useState<
    "all" | "flights" | "hotels" | "sightseeing" | "transfers"
  >(getInitialTab());
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [viewDetailsModal, setViewDetailsModal] = useState(false);
  const [manageBookingModal, setManageBookingModal] = useState(false);
  const [cancelBookingModal, setCancelBookingModal] = useState(false);
  const [ticketModal, setTicketModal] = useState(false);
  const [invoiceModal, setInvoiceModal] = useState(false);
  const [refundModal, setRefundModal] = useState(false);

  // Watch for URL parameter changes
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (
      tabParam &&
      ["all", "flights", "hotels", "sightseeing", "transfers"].includes(
        tabParam,
      )
    ) {
      setActiveTab(
        tabParam as "all" | "flights" | "hotels" | "sightseeing" | "transfers",
      );
    }
  }, [searchParams]);

  const flightBookings = [
    {
      id: "FL001",
      type: "flight",
      airline: "Emirates",
      route: "DXB → LHR",
      date: "2025-08-15",
      time: "14:30",
      status: "Confirmed",
      passengers: 2,
      totalAmount: "₹1,53,750",
      bookingRef: "EM123456",
      flightNumber: "EK001",
      seat: "12A, 12B",
      terminal: "Terminal 3",
      gate: "A15",
      bookingDate: "2025-08-05",
      cancellable: true,
      refundAmount: "₹1,38,375",
      refundStatus: null,
    },
    {
      id: "FL002",
      type: "flight",
      airline: "British Airways",
      route: "LHR → JFK",
      date: "2025-08-20",
      time: "10:15",
      status: "Pending",
      passengers: 1,
      totalAmount: "₹76,360",
      bookingRef: "BA789012",
      flightNumber: "BA177",
      seat: "24C",
      terminal: "Terminal 5",
      gate: "B12",
      bookingDate: "2025-08-06",
      cancellable: true,
      refundAmount: "₹68,724",
      refundStatus: null,
    },
  ];

  const hotelBookings = [
    {
      id: "HT001",
      type: "hotel",
      name: "Grand Hyatt Dubai",
      location: "Dubai, UAE",
      checkIn: "2025-08-15",
      checkOut: "2025-08-18",
      guests: 2,
      rooms: 1,
      status: "Confirmed",
      totalAmount: "₹62,250",
      bookingRef: "GH456789",
      roomType: "Deluxe Room",
      bedType: "King Bed",
      address: "Sheikh Zayed Road, Dubai",
      phone: "+971 4 317 1234",
      bookingDate: "2025-08-05",
      cancellable: true,
      refundAmount: "₹56,025",
      refundStatus: null,
    },
    {
      id: "HT002",
      type: "hotel",
      name: "The Langham London",
      location: "London, UK",
      checkIn: "2025-08-20",
      checkOut: "2025-08-23",
      guests: 1,
      rooms: 1,
      status: "Confirmed",
      totalAmount: "₹39,840",
      bookingRef: "TL234567",
      roomType: "Superior Room",
      bedType: "Queen Bed",
      address: "1C Portland Place, London",
      phone: "+44 20 7636 1000",
      bookingDate: "2025-08-06",
      cancellable: true,
      refundAmount: "₹35,856",
      refundStatus: null,
    },
  ];

  const sightseeingBookings = [
    {
      id: "SG001",
      type: "sightseeing",
      name: "Burj Khalifa: Floors 124 and 125",
      location: "Dubai, UAE",
      visitDate: "2025-08-16",
      time: "14:30",
      duration: "1-2 hours",
      guests: 2,
      status: "Confirmed",
      totalAmount: "₹29,800",
      bookingRef: "SG174640632414",
      ticketType: "Standard Admission",
      category: "landmark",
      bookingDate: "2025-08-05",
      cancellable: true,
      refundAmount: "₹26,820",
      refundStatus: null,
    },
    {
      id: "SG002",
      type: "sightseeing",
      name: "Dubai Aquarium & Underwater Zoo",
      location: "Dubai, UAE",
      visitDate: "2025-08-17",
      time: "11:00",
      duration: "2-3 hours",
      guests: 2,
      status: "Confirmed",
      totalAmount: "₹17,800",
      bookingRef: "SG174640733515",
      ticketType: "Aquarium + Zoo",
      category: "museum",
      bookingDate: "2025-08-05",
      cancellable: true,
      refundAmount: "₹16,020",
      refundStatus: null,
    },
  ];

  const transferBookings = [
    {
      id: "TR001",
      type: "transfer",
      service: "Airport Transfer",
      route: "DXB Airport → Downtown Dubai",
      pickupDate: "2025-08-15",
      pickupTime: "12:30",
      vehicle: "Sedan - Economy",
      passengers: 2,
      status: "Confirmed",
      totalAmount: "₹4,250",
      bookingRef: "TR456789123",
      driverName: "Ahmed Mohammed",
      driverPhone: "+971 50 123 4567",
      vehicleInfo: "Toyota Camry - Plate: DXB-1234",
      pickupLocation: "Dubai International Airport Terminal 3",
      dropoffLocation: "Grand Hyatt Dubai",
      bookingDate: "2025-08-05",
      cancellable: true,
      refundAmount: "₹3,825",
      refundStatus: null,
    },
    {
      id: "TR002",
      type: "transfer",
      service: "Return Transfer",
      route: "Downtown Dubai → DXB Airport",
      pickupDate: "2025-08-18",
      pickupTime: "08:00",
      vehicle: "Sedan - Economy",
      passengers: 2,
      status: "Confirmed",
      totalAmount: "₹4,250",
      bookingRef: "TR456789124",
      driverName: "Hassan Ali",
      driverPhone: "+971 50 987 6543",
      vehicleInfo: "Honda Accord - Plate: DXB-5678",
      pickupLocation: "Grand Hyatt Dubai",
      dropoffLocation: "Dubai International Airport Terminal 3",
      bookingDate: "2025-08-05",
      cancellable: true,
      refundAmount: "₹3,825",
      refundStatus: null,
    },
  ];

  const allBookings = [
    ...flightBookings,
    ...hotelBookings,
    ...sightseeingBookings,
    ...transferBookings,
  ].sort((a, b) => {
    let dateA: string;
    let dateB: string;

    if (a.type === "flight") {
      dateA = a.date;
    } else if (a.type === "hotel") {
      dateA = a.checkIn;
    } else if (a.type === "transfer") {
      dateA = a.pickupDate;
    } else {
      dateA = a.visitDate;
    }

    if (b.type === "flight") {
      dateB = b.date;
    } else if (b.type === "hotel") {
      dateB = b.checkIn;
    } else if (b.type === "transfer") {
      dateB = b.pickupDate;
    } else {
      dateB = b.visitDate;
    }

    return new Date(dateA).getTime() - new Date(dateB).getTime();
  });

  const getFilteredBookings = () => {
    switch (activeTab) {
      case "flights":
        return flightBookings;
      case "hotels":
        return hotelBookings;
      case "sightseeing":
        return sightseeingBookings;
      case "transfers":
        return transferBookings;
      default:
        return allBookings;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        <div className="mb-8">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </button>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">
            Manage your flights, hotels, and sightseeing reservations
          </p>
        </div>

        {/* Mobile-Optimized Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto">
              <button
                onClick={() => setActiveTab("all")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "all"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                All Bookings ({allBookings.length})
              </button>
              <button
                onClick={() => setActiveTab("flights")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "flights"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                  </div>
                  <span>Flights ({flightBookings.length})</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab("hotels")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "hotels"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-amber-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <span>Hotels ({hotelBookings.length})</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab("sightseeing")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "sightseeing"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <span>Sightseeing ({sightseeingBookings.length})</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab("transfers")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "transfers"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-emerald-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                      />
                    </svg>
                  </div>
                  <span>Transfers ({transferBookings.length})</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Mobile-First Responsive Bookings List */}
        <div className="space-y-4">
          {getFilteredBookings().map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Mobile Header */}
              <div className="p-4">
                {/* Top Row - Icon, Title and Status */}
                <div className="flex items-start justify-between mb-3 gap-3">
                  <div className="flex items-start space-x-3 flex-1 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        booking.type === "flight"
                          ? "bg-blue-100"
                          : booking.type === "hotel"
                            ? "bg-amber-100"
                            : booking.type === "transfer"
                              ? "bg-emerald-100"
                              : "bg-purple-100"
                      }`}
                    >
                      {booking.type === "flight" ? (
                        <svg
                          className="w-5 h-5 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                          />
                        </svg>
                      ) : booking.type === "hotel" ? (
                        <svg
                          className="w-5 h-5 text-amber-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                      ) : booking.type === "transfer" ? (
                        <svg
                          className="w-5 h-5 text-emerald-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5 text-purple-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 pr-2">
                      <h3 className="font-semibold text-gray-900 text-base leading-tight truncate">
                        {booking.type === "flight"
                          ? `${booking.airline} - ${booking.route}`
                          : booking.type === "transfer"
                            ? `${booking.service} - ${booking.route}`
                            : booking.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1 truncate">
                        {booking.bookingRef}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2 flex-shrink-0 min-w-fit">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(booking.status)}`}
                    >
                      {booking.status}
                    </span>
                    <span className="text-base font-bold text-blue-600 whitespace-nowrap">
                      {booking.totalAmount}
                    </span>
                  </div>
                </div>

                {/* Mobile Details Grid */}
                {booking.type === "flight" ? (
                  <div className="space-y-3 mb-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500 block">Date & Time</span>
                        <p className="font-medium text-gray-900">
                          {booking.date}
                        </p>
                        <p className="font-medium text-gray-900">
                          {booking.time}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Passengers</span>
                        <p className="font-medium text-gray-900">
                          {booking.passengers}
                        </p>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm block">Route</span>
                      <p className="font-medium text-gray-900">
                        {booking.route}
                      </p>
                    </div>
                  </div>
                ) : booking.type === "hotel" ? (
                  <div className="space-y-3 mb-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500 block">Check-in</span>
                        <p className="font-medium text-gray-900">
                          {booking.checkIn}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Check-out</span>
                        <p className="font-medium text-gray-900">
                          {booking.checkOut}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Guests</span>
                        <p className="font-medium text-gray-900">
                          {booking.guests}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Rooms</span>
                        <p className="font-medium text-gray-900">
                          {booking.rooms}
                        </p>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm block">
                        Location
                      </span>
                      <p className="font-medium text-gray-900">
                        {booking.location}
                      </p>
                    </div>
                  </div>
                ) : booking.type === "transfer" ? (
                  <div className="space-y-3 mb-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500 block">Pickup Date</span>
                        <p className="font-medium text-gray-900">
                          {booking.pickupDate}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Pickup Time</span>
                        <p className="font-medium text-gray-900">
                          {booking.pickupTime}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Vehicle</span>
                        <p className="font-medium text-gray-900">
                          {booking.vehicle}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Passengers</span>
                        <p className="font-medium text-gray-900">
                          {booking.passengers}
                        </p>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm block">Route</span>
                      <p className="font-medium text-gray-900">
                        {booking.route}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 mb-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500 block">Visit Date</span>
                        <p className="font-medium text-gray-900">
                          {booking.visitDate}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Time</span>
                        <p className="font-medium text-gray-900">
                          {booking.time}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Duration</span>
                        <p className="font-medium text-gray-900">
                          {booking.duration}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Guests</span>
                        <p className="font-medium text-gray-900">
                          {booking.guests}
                        </p>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm block">
                        Location & Type
                      </span>
                      <p className="font-medium text-gray-900">
                        {booking.location} • {booking.ticketType}
                      </p>
                    </div>
                  </div>
                )}

                {/* Mobile Action Buttons */}
                <div className="flex gap-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setSelectedBooking(booking);
                      setViewDetailsModal(true);
                    }}
                    className="flex-1 bg-blue-600 text-white font-semibold py-3 rounded-lg text-sm"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => {
                      setSelectedBooking(booking);
                      setManageBookingModal(true);
                    }}
                    className="flex-1 bg-[#febb02] hover:bg-[#e6a602] text-black font-semibold py-3 rounded-lg text-sm flex items-center justify-center gap-2 min-h-[44px]"
                  >
                    Manage
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {getFilteredBookings().length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No bookings found
            </h3>
            <p className="text-gray-600">
              You don't have any bookings in this category yet.
            </p>
          </div>
        )}
      </div>

      {/* View Details Modal */}
      <Dialog open={viewDetailsModal} onOpenChange={setViewDetailsModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <div className="text-3xl">
                  {selectedBooking.type === "flight" ? "✈��" : "🏨"}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">
                    {selectedBooking.type === "flight"
                      ? `${selectedBooking.airline} - ${selectedBooking.route}`
                      : selectedBooking.name}
                  </h3>
                  <p className="text-gray-600">
                    Booking Reference: {selectedBooking.bookingRef}
                  </p>
                </div>
              </div>

              {selectedBooking.type === "flight" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Flight Information</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">Flight:</span>{" "}
                        {selectedBooking.flightNumber}
                      </div>
                      <div>
                        <span className="text-gray-600">Date:</span>{" "}
                        {selectedBooking.date}
                      </div>
                      <div>
                        <span className="text-gray-600">Time:</span>{" "}
                        {selectedBooking.time}
                      </div>
                      <div>
                        <span className="text-gray-600">Route:</span>{" "}
                        {selectedBooking.route}
                      </div>
                      <div>
                        <span className="text-gray-600">Terminal:</span>{" "}
                        {selectedBooking.terminal}
                      </div>
                      <div>
                        <span className="text-gray-600">Gate:</span>{" "}
                        {selectedBooking.gate}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">Passenger Information</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">Passengers:</span>{" "}
                        {selectedBooking.passengers}
                      </div>
                      <div>
                        <span className="text-gray-600">Seats:</span>{" "}
                        {selectedBooking.seat}
                      </div>
                      <div>
                        <span className="text-gray-600">Status:</span>
                        <span
                          className={`ml-1 px-2 py-1 rounded-full text-xs ${getStatusColor(selectedBooking.status)}`}
                        >
                          {selectedBooking.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : selectedBooking.type === "hotel" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Hotel Information</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">Hotel:</span>{" "}
                        {selectedBooking.name}
                      </div>
                      <div>
                        <span className="text-gray-600">Location:</span>{" "}
                        {selectedBooking.location || "Dubai, UAE"}
                      </div>
                      <div>
                        <span className="text-gray-600">Address:</span>{" "}
                        {selectedBooking.address || "Downtown Dubai"}
                      </div>
                      <div>
                        <span className="text-gray-600">Phone:</span>{" "}
                        {selectedBooking.phone || "+971 4 888 3888"}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">Reservation Details</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">Check-in:</span>{" "}
                        {selectedBooking.checkIn || "2024-08-16"}
                      </div>
                      <div>
                        <span className="text-gray-600">Check-out:</span>{" "}
                        {selectedBooking.checkOut || "2024-08-18"}
                      </div>
                      <div>
                        <span className="text-gray-600">Room Type:</span>{" "}
                        {selectedBooking.roomType || "Deluxe Room"}
                      </div>
                      <div>
                        <span className="text-gray-600">Bed Type:</span>{" "}
                        {selectedBooking.bedType || "King Size"}
                      </div>
                      <div>
                        <span className="text-gray-600">Guests:</span>{" "}
                        {selectedBooking.guests || "2 Adults"}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Experience Information</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">Experience:</span>{" "}
                        {selectedBooking.name ||
                          "Burj Khalifa: Floors 124 and 125"}
                      </div>
                      <div>
                        <span className="text-gray-600">Location:</span>{" "}
                        {selectedBooking.location || "Downtown Dubai, UAE"}
                      </div>
                      <div>
                        <span className="text-gray-600">Duration:</span>{" "}
                        {selectedBooking.duration || "1-2 Hours"}
                      </div>
                      <div>
                        <span className="text-gray-600">Category:</span>{" "}
                        {selectedBooking.category || "Landmark & Attractions"}
                      </div>
                      <div>
                        <span className="text-gray-600">Ticket Type:</span>{" "}
                        {selectedBooking.ticketType || "Standard Admission"}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">Visit Details</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">Visit Date:</span>{" "}
                        {selectedBooking.visitDate || "2024-08-16"}
                      </div>
                      <div>
                        <span className="text-gray-600">Time Slot:</span>{" "}
                        {selectedBooking.time || "2:00 PM"}
                      </div>
                      <div>
                        <span className="text-gray-600">Guests:</span>{" "}
                        {selectedBooking.guests || "2 Adults"}
                      </div>
                      <div>
                        <span className="text-gray-600">Status:</span>
                        <span
                          className={`ml-1 px-2 py-1 rounded-full text-xs ${getStatusColor(selectedBooking.status)}`}
                        >
                          {selectedBooking.status}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Confirmation:</span>{" "}
                        <span className="text-green-600 font-medium">
                          Confirmed
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="text-xl font-bold text-blue-600 ml-2">
                      {selectedBooking.totalAmount}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Booked on: {selectedBooking.bookingDate}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Manage Booking Modal */}
      <Dialog open={manageBookingModal} onOpenChange={setManageBookingModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Booking</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div
                  className={`w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center ${
                    selectedBooking.type === "flight"
                      ? "bg-blue-100"
                      : selectedBooking.type === "hotel"
                        ? "bg-amber-100"
                        : "bg-purple-100"
                  }`}
                >
                  {selectedBooking.type === "flight" ? (
                    <svg
                      className="w-8 h-8 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                  ) : selectedBooking.type === "hotel" ? (
                    <svg
                      className="w-8 h-8 text-amber-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-8 h-8 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                </div>
                <h4 className="font-medium">
                  {selectedBooking.type === "flight"
                    ? `${selectedBooking.airline || "Air India"} ${selectedBooking.flightNumber || "AI 131"}`
                    : selectedBooking.name}
                </h4>
                <p className="text-sm text-gray-600">
                  {selectedBooking.bookingRef}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <Button
                  onClick={() => {
                    setManageBookingModal(false);
                    setTicketModal(true);
                  }}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                        />
                      </svg>
                    </div>
                    <span>
                      View{" "}
                      {selectedBooking.type === "flight"
                        ? "Boarding Pass"
                        : "Voucher"}
                    </span>
                  </div>
                </Button>

                <Button
                  onClick={() => {
                    setManageBookingModal(false);
                    setInvoiceModal(true);
                  }}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <span>Download Invoice</span>
                  </div>
                </Button>

                {selectedBooking.cancellable && (
                  <Button
                    onClick={() => {
                      setManageBookingModal(false);
                      setCancelBookingModal(true);
                    }}
                    variant="outline"
                    className="w-full justify-start text-red-600 border-red-600 hover:bg-red-50"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-red-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </div>
                      <span>Cancel Booking</span>
                    </div>
                  </Button>
                )}

                <Button
                  onClick={() => {
                    setManageBookingModal(false);
                    setRefundModal(true);
                  }}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-emerald-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                        />
                      </svg>
                    </div>
                    <span>Check Refund Status</span>
                  </div>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Ticket/Voucher Modal */}
      <Dialog open={ticketModal} onOpenChange={setTicketModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>
              {selectedBooking?.type === "flight"
                ? "Boarding Pass"
                : selectedBooking?.type === "hotel"
                  ? "Hotel Voucher"
                  : "Experience Voucher"}
            </DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <>
              {selectedBooking.type === "flight" && (
                <FlightVoucher
                  booking={{
                    id: selectedBooking.id,
                    airline: selectedBooking.airline,
                    route: selectedBooking.route,
                    date: selectedBooking.date,
                    time: selectedBooking.time,
                    flightNumber: selectedBooking.flightNumber,
                    bookingRef: selectedBooking.bookingRef,
                    seat: selectedBooking.seat,
                    terminal: selectedBooking.terminal || "Terminal 3",
                    gate: selectedBooking.gate || "A15",
                    passengers: selectedBooking.passengers,
                    totalAmount: selectedBooking.totalAmount,
                    passengerName: "John Doe",
                  }}
                  onPrint={() => window.print()}
                />
              )}

              {selectedBooking.type === "hotel" && (
                <HotelVoucher
                  booking={{
                    id: selectedBooking.id,
                    name: selectedBooking.name,
                    location: selectedBooking.location,
                    checkIn: selectedBooking.checkIn,
                    checkOut: selectedBooking.checkOut,
                    roomType: selectedBooking.roomType || "Deluxe Room",
                    bookingRef: selectedBooking.bookingRef,
                    guests: selectedBooking.guests || 2,
                    totalAmount: selectedBooking.totalAmount,
                    guestName: "John Doe",
                    phone: "+971 50 123 4567",
                    email: "guest@example.com",
                    nights: selectedBooking.nights || 1,
                    rating: 4,
                  }}
                  onPrint={() => window.print()}
                />
              )}

              {selectedBooking.type === "sightseeing" && (
                <SightseeingVoucher
                  booking={{
                    id: selectedBooking.id,
                    name: selectedBooking.name || "Burj Khalifa Experience",
                    location: selectedBooking.location || "Dubai, UAE",
                    visitDate:
                      selectedBooking.date || selectedBooking.visitDate,
                    visitTime:
                      selectedBooking.time ||
                      selectedBooking.visitTime ||
                      "10:30 AM",
                    bookingRef: selectedBooking.bookingRef,
                    guests:
                      selectedBooking.guests || selectedBooking.passengers || 2,
                    totalAmount: selectedBooking.totalAmount,
                    guestName: "John Doe",
                    email: "guest@example.com",
                    ticketType:
                      selectedBooking.ticketType || "Standard Admission",
                    duration: selectedBooking.duration || "1-2 hours",
                    rating: 4.6,
                    category: "Landmarks & Attractions",
                  }}
                  onPrint={() => window.print()}
                />
              )}

              {/* Action Buttons */}
              <div className="no-print sticky bottom-0 bg-white border-t border-gray-200 p-4 flex gap-3">
                <Button
                  onClick={() => window.print()}
                  className="flex-1 bg-[#003580] hover:bg-[#002a66]"
                >
                  Print Voucher
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setTicketModal(false)}
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Invoice Modal */}
      <Dialog open={invoiceModal} onOpenChange={setInvoiceModal}>
        <DialogContent className="w-full max-w-[95vw] sm:max-w-3xl lg:max-w-5xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Booking Invoice</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <>
              <FaredownInvoice
                booking={{
                  id: selectedBooking.id,
                  bookingRef: selectedBooking.bookingRef,
                  type: selectedBooking.type,
                  bookingDate:
                    selectedBooking.bookingDate ||
                    new Date().toISOString().split("T")[0],
                  customerName: "John Doe",
                  customerEmail: "john.doe@example.com",
                  customerPhone: "+971 50 123 4567",
                  customerAddress: "Dubai, United Arab Emirates",
                  serviceName:
                    selectedBooking.type === "flight"
                      ? `${selectedBooking.airline} ${selectedBooking.flightNumber}`
                      : selectedBooking.type === "hotel"
                        ? selectedBooking.name
                        : selectedBooking.name || "Sightseeing Experience",
                  serviceDetails:
                    selectedBooking.type === "flight"
                      ? `${selectedBooking.route} • ${selectedBooking.date} ${selectedBooking.time}`
                      : selectedBooking.type === "hotel"
                        ? `${selectedBooking.location} • ${selectedBooking.checkIn} to ${selectedBooking.checkOut}`
                        : `${selectedBooking.location || "Dubai, UAE"} • ${selectedBooking.date || selectedBooking.visitDate}`,
                  totalAmount: selectedBooking.totalAmount,
                  currency: "₹",
                }}
                items={[
                  {
                    description:
                      selectedBooking.type === "flight"
                        ? `Flight Ticket - ${selectedBooking.airline} ${selectedBooking.flightNumber}`
                        : selectedBooking.type === "hotel"
                          ? `Hotel Booking - ${selectedBooking.name} (${selectedBooking.roomType || "Deluxe Room"})`
                          : `Sightseeing Experience - ${selectedBooking.name || "Attraction Visit"}`,
                    quantity:
                      selectedBooking.passengers || selectedBooking.guests || 1,
                    unitPrice:
                      parseInt(
                        selectedBooking.totalAmount.replace(/[^\d]/g, ""),
                      ) /
                      (selectedBooking.passengers ||
                        selectedBooking.guests ||
                        1),
                    total: parseInt(
                      selectedBooking.totalAmount.replace(/[^\d]/g, ""),
                    ),
                  },
                ]}
                taxes={[
                  {
                    name: "Service Tax",
                    rate: 18,
                    amount:
                      parseInt(
                        selectedBooking.totalAmount.replace(/[^\d]/g, ""),
                      ) * 0.15,
                  },
                ]}
                subtotal={
                  parseInt(selectedBooking.totalAmount.replace(/[^\d]/g, "")) *
                  0.85
                }
                total={parseInt(
                  selectedBooking.totalAmount.replace(/[^\d]/g, ""),
                )}
                onPrint={() => window.print()}
              />

              {/* Action Buttons */}
              <div className="no-print sticky bottom-0 bg-white border-t border-gray-200 p-4 flex gap-3">
                <Button
                  onClick={() => {
                    // Email functionality
                    alert("Invoice will be sent to your email address.");
                  }}
                  className="flex-1 bg-[#003580] hover:bg-[#002a66]"
                >
                  Email Invoice
                </Button>
                <Button
                  onClick={() => window.print()}
                  variant="outline"
                  className="flex-1"
                >
                  Print/Download PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setInvoiceModal(false)}
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Booking Modal */}
      <Dialog open={cancelBookingModal} onOpenChange={setCancelBookingModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2 text-red-800">
                  <div className="w-5 h-5 bg-red-200 rounded-full flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-red-800"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                  <span className="font-medium">Cancellation Policy</span>
                </div>
                <p className="text-sm text-red-700 mt-2">
                  You can cancel this booking and receive a refund of{" "}
                  <span className="font-bold">
                    {selectedBooking.refundAmount}
                  </span>
                  . Cancellation fees have been deducted.
                </p>
              </div>

              <div className="space-y-3">
                <div className="text-sm">
                  <span className="text-gray-600">Booking:</span>
                  <p className="font-medium">
                    {selectedBooking.type === "flight"
                      ? `${selectedBooking.airline} ${selectedBooking.flightNumber}`
                      : selectedBooking.name}
                  </p>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Reference:</span>
                  <p className="font-medium">{selectedBooking.bookingRef}</p>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Refund Amount:</span>
                  <p className="font-medium text-green-600">
                    {selectedBooking.refundAmount}
                  </p>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setCancelBookingModal(false)}
                >
                  Keep Booking
                </Button>
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  onClick={() => {
                    // Handle cancellation logic here
                    setCancelBookingModal(false);
                    alert(
                      "Booking cancelled successfully. Refund will be processed in 3-5 business days.",
                    );
                  }}
                >
                  Cancel Booking
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Refund Status Modal */}
      <Dialog open={refundModal} onOpenChange={setRefundModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Refund Status</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 mx-auto mb-2 bg-emerald-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-emerald-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                </div>
                <h4 className="font-medium">{selectedBooking.bookingRef}</h4>
              </div>

              {selectedBooking.refundStatus ? (
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2 text-green-800">
                      <div className="w-5 h-5 bg-green-200 rounded-full flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-green-800"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <span className="font-medium">Refund Processed</span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      Refund of {selectedBooking.refundAmount} has been
                      processed to your original payment method.
                    </p>
                  </div>
                  <div className="text-sm">
                    <div className="flex justify-between mb-1">
                      <span>Amount:</span>
                      <span className="font-medium">
                        {selectedBooking.refundAmount}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date:</span>
                      <span className="font-medium">2024-01-10</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2 text-blue-800">
                      <div className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-blue-800"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <span className="font-medium">No Refunds</span>
                    </div>
                    <p className="text-sm text-blue-700 mt-1">
                      This booking has no pending or processed refunds.
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-3">
                      Need to cancel this booking?
                    </p>
                    <Button
                      onClick={() => {
                        setRefundModal(false);
                        setCancelBookingModal(true);
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      Cancel Booking
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Bookings;
