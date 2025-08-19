import React, { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Download,
  Mail,
  MapPin,
  Calendar,
  Users,
  Hotel,
  CreditCard,
  Star,
  Plane,
  Clock,
  X,
  Send,
} from "lucide-react";
import { Header } from "@/components/Header";
import { generateBookingPackage } from "@/lib/downloadUtils";
import { MobileNavigation } from "@/components/mobile/MobileNavigation";

export default function BookingConfirmation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<any>(null);
  const [bookingType, setBookingType] = useState<"flight" | "hotel">("hotel");
  const [showVoucher, setShowVoucher] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailAddress, setEmailAddress] = useState("");
  const [emailSending, setEmailSending] = useState(false);

  // Format date to DD-MMM-YYYY
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${date.getDate().toString().padStart(2, "0")}-${months[date.getMonth()]}-${date.getFullYear()}`;
  };

  useEffect(() => {
    // Load booking data from localStorage - check for flight bookings first
    const savedFlightBooking = localStorage.getItem("latestBooking");
    const savedHotelBooking = localStorage.getItem("latestHotelBooking");

    // Check URL params for booking type hints
    const isFlightFlow =
      window.location.pathname.includes("flight") ||
      searchParams.get("type") === "flight" ||
      localStorage.getItem("currentBookingType") === "flight";

    const isHotelFlow =
      window.location.pathname.includes("hotel") ||
      searchParams.get("hotelId") ||
      searchParams.get("type") === "hotel" ||
      localStorage.getItem("currentBookingType") === "hotel";

    // Debug logging
    console.log("🔍 Booking type detection:", {
      isHotelFlow,
      isFlightFlow,
      hasHotelId: !!searchParams.get("hotelId"),
      currentUrl: window.location.href,
      savedFlightBooking: !!savedFlightBooking,
      savedHotelBooking: !!savedHotelBooking,
    });

    // If URL clearly indicates hotel booking, prioritize hotel flow
    if (isHotelFlow && !isFlightFlow) {
      console.log("🏨 Hotel flow detected - skipping flight data");
      // Skip flight data check and go directly to hotel logic below
    } else if (savedFlightBooking && !isHotelFlow) {
      const flightData = JSON.parse(savedFlightBooking);
      // Check if this is actually flight data by looking for flight-specific fields
      if (
        flightData.flights ||
        flightData.passengers ||
        flightData.baseFareTotal ||
        isFlightFlow
      ) {
        setBooking(flightData);
        setBookingType("flight");
        return;
      }
    }

    if (savedHotelBooking) {
      console.log("🏨 Using saved hotel booking data");
      setBooking(JSON.parse(savedHotelBooking));
      setBookingType("hotel");
    } else if (savedFlightBooking && !isHotelFlow) {
      // Only fallback to flight booking if it's not a hotel flow
      console.log("✈️ Using saved flight booking data");
      const flightBookingData = JSON.parse(savedFlightBooking);
      setBooking(flightBookingData);
      setBookingType("flight");

      // Save to faredownBookings array for My Bookings display
      const existingBookings = JSON.parse(
        localStorage.getItem("faredownBookings") || "[]",
      );
      const bookingExists = existingBookings.some(
        (b) => b.id === flightBookingData.id,
      );

      if (!bookingExists) {
        const formattedBooking = {
          id: flightBookingData.id,
          type: "flight",
          bookingDetails: {
            bookingRef: flightBookingData.id,
            bookingDate: new Date().toISOString(),
            passengers: flightBookingData.passengers || [],
            contactDetails: {
              email: "user@example.com",
              phone: "+91 9876543210",
              countryCode: "+91",
            },
          },
          flightDetails: {
            airline: flightBookingData.flights?.[0]?.airline || "Airlines",
            flightNumber:
              flightBookingData.flights?.[0]?.flightNumber || "FL-001",
            route: "Mumbai ⇄ Dubai",
            departureDate:
              flightBookingData.flights?.[0]?.date || "Select date",
            returnDate: flightBookingData.flights?.[1]?.date || null,
            class: "Economy",
          },
          totalAmount: flightBookingData.total || 0,
        };

        existingBookings.push(formattedBooking);
        localStorage.setItem(
          "faredownBookings",
          JSON.stringify(existingBookings),
        );
      }
    } else {
      // Create mock booking data from URL params for demo
      const hotelId = searchParams.get("hotelId");
      const hotelName = searchParams.get("hotelName");
      const roomType = searchParams.get("roomType");
      const price = searchParams.get("price");
      const totalPrice = searchParams.get("totalPrice");
      const nights = searchParams.get("nights");
      const bargained = searchParams.get("bargained");

      console.log("🏨 Hotel URL params:", {
        hotelId,
        hotelName,
        roomType,
        price,
        totalPrice,
        nights,
      });

      if (hotelId || (hotelName && price)) {
        console.log("🏨 Creating hotel booking from URL params");
        const mockBooking = {
          id: `HB${Date.now()}`,
          bookingDate: new Date().toISOString(),
          hotel: {
            id: hotelId || "htl-DXB-001",
            name: hotelName
              ? decodeURIComponent(hotelName)
              : "Grand Hyatt Dubai",
            location:
              "Near Sheikh Zayed Road & Mall Mall, Dubai, United Arab Emirates",
            image:
              "https://cdn.builder.io/api/v1/image/assets%2F4235b10530ff469795aa00c0333d773c%2F4e78c7022f0345f4909bc6063cdeffd6?format=webp&width=800",
            rating: 4.5,
            reviews: 1247,
          },
          room: {
            type: roomType,
            name:
              roomType === "twin-skyline"
                ? "Twin Room with Skyline View"
                : roomType === "king-skyline"
                  ? "King Room with Skyline View"
                  : roomType === "superior-king"
                    ? "Superior King Room"
                    : roomType === "superior-twin-club"
                      ? "Superior Twin Room - Club Access"
                      : "One Bedroom Grand Suite with Garden View",
            details:
              roomType === "twin-skyline"
                ? "1 X Twin Classic - Twin bed"
                : roomType === "king-skyline"
                  ? "1 X King Classic - 1 king bed"
                  : roomType === "superior-king"
                    ? "1 X Superior King - 1 king bed"
                    : roomType === "superior-twin-club"
                      ? "2 X Twin Superior Club - 2 twin beds"
                      : "1 X Grand Suite - 1 king bed + living area",
            pricePerNight: parseInt(price) / parseInt(nights),
            image:
              "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=300",
          },
          checkIn: "2025-07-16",
          checkOut: "2025-07-19",
          nights: parseInt(nights),
          guests: 2,
          rooms: 1,
          total: parseInt(price),
          originalPrice: bargained === "true" ? parseInt(price) * 1.15 : null,
          bargained: bargained === "true",
          paymentMethod: "Pay at Hotel",
          paymentStatus: "Confirmed",
          cancellation: "Free cancellation until 24 hours before check-in",
          guest: {
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@example.com",
            phone: "+91 98765 43210",
          },
          specialRequests: "Non-smoking room preferred",
        };
        setBooking(mockBooking);
        setBookingType("hotel");
        localStorage.setItem("latestHotelBooking", JSON.stringify(mockBooking));
      } else {
        // If no booking data and no URL params, create a mock flight booking for testing
        const mockFlightBooking = {
          id: `FD${Date.now().toString().slice(-8)}`,
          bookingType: "flight",
          bargained: false,
          baseFareTotal: 19424,
          extrasTotal: 600,
          seatFeesTotal: 2000,
          total: 23000,
          passengers: [
            { firstName: "Zubin", lastName: "Aibara", type: "adult" },
          ],
          flights: [
            {
              from: "Mumbai",
              to: "Dubai",
              date: "Thu, 01 Feb 2024",
              time: "04:25",
              duration: "1h 50m",
              airline: "Vistara",
              flightNumber: "UK 201",
              aircraft: "A321",
            },
            {
              from: "Dubai",
              to: "Mumbai",
              date: "Sat, 03 Feb 2024",
              time: "07:15",
              duration: "4h 40m",
              airline: "Vistara",
              flightNumber: "UK 202",
              aircraft: "A321",
            },
          ],
          seats: [
            {
              passenger: "Zubin Aibara",
              seat: "18A",
              price: 1500,
              flight: "Outbound",
            },
            {
              passenger: "Zubin Aibara",
              seat: "18A",
              price: 500,
              flight: "Return",
            },
          ],
          meals: [
            {
              id: "veg-biryani",
              name: "Veg Biryani + Beverage",
              price: 400,
            },
          ],
          baggage: [
            {
              type: "Extra Baggage",
              weight: "5kg",
              price: 1500,
              flight: "Outbound",
            },
          ],
          pnr: "UK4B2C",
          ticketNumber: "FDFB240001",
        };
        setBooking(mockFlightBooking);
        setBookingType("flight");
      }
    }
  }, [searchParams]);

  // Separate useEffect for auto-saving booking to trips
  useEffect(() => {
    if (booking && bookingType) {
      const existingTrips = JSON.parse(localStorage.getItem("myTrips") || "[]");
      // Check if this booking is already saved
      const bookingExists = existingTrips.some(
        (trip: any) => trip.id === booking.id,
      );

      if (!bookingExists) {
        const tripData = {
          ...booking,
          bookingType,
          bookingDate: booking.bookingDate || new Date().toISOString(),
        };
        const updatedTrips = [tripData, ...existingTrips];
        localStorage.setItem("myTrips", JSON.stringify(updatedTrips));
      }
    }
  }, [booking?.id, bookingType]); // Only depend on booking.id and bookingType

  const handleDownloadVoucher = () => {
    setShowVoucher(true);
    setTimeout(() => {
      window.print();
      setShowVoucher(false);
    }, 500);
  };

  const handleDownloadInvoice = () => {
    setShowInvoice(true);
    setTimeout(() => {
      window.print();
      setShowInvoice(false);
    }, 500);
  };

  const handleDownloadPackage = () => {
    if (booking) {
      try {
        generateBookingPackage(booking);
      } catch (error) {
        console.error("Package download failed:", error);
        alert("Failed to download package. Please try individual downloads.");
      }
    }
  };

  const handleEmailConfirmation = async () => {
    setShowEmailModal(true);
  };

  const handleSendEmail = async () => {
    if (!emailAddress.trim()) {
      alert("Please enter an email address");
      return;
    }

    setEmailSending(true);

    // Simulate email sending
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setEmailSent(true);
      setShowEmailModal(false);
      setEmailSending(false);
      console.log(
        `Sending ${bookingType} confirmation email to:`,
        emailAddress,
      );
    } catch (error) {
      setEmailSending(false);
      alert("Failed to send email. Please try again.");
    }
  };

  // Removed handleViewMyTrips - now using Account bookings tab

  // Email Modal Component
  const EmailModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Email {bookingType === "flight" ? "E-Ticket" : "Voucher"}
          </h3>
          <button onClick={() => setShowEmailModal(false)}>
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              placeholder={
                booking.passenger?.email ||
                booking.guest?.email ||
                "Enter email address"
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <p className="text-sm text-blue-700">
              We'll send your{" "}
              {bookingType === "flight" ? "e-ticket" : "booking voucher"} to
              this email address.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowEmailModal(false)}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendEmail}
              disabled={emailSending}
              className="flex-1 bg-blue-700 hover:bg-blue-800"
            >
              {emailSending ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Sending...
                </div>
              ) : (
                <div className="flex items-center">
                  <Send className="w-4 h-4 mr-2" />
                  Send Email
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  if (!booking || typeof booking !== "object") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              No booking found
            </h1>
            <Link to="/">
              <Button className="bg-blue-700 hover:bg-blue-800">
                Return to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (showVoucher) {
    return (
      <div className="min-h-screen bg-white p-8 print:p-0">
        <div className="max-w-4xl mx-auto">
          {bookingType === "flight" ? (
            /* Flight Ticket */
            <>
              {/* Header with Faredown Branding */}
              <div className="text-center border-b-4 border-blue-700 pb-6 mb-8">
                <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white p-6 rounded-t-lg">
                  <h1 className="text-4xl font-bold mb-2">FAREDOWN TRAVEL</h1>
                  <p className="text-blue-200 text-lg">
                    www.faredown.com | Your Travel Partner
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-b-lg border-l-4 border-r-4 border-blue-700">
                  <h2 className="text-2xl font-bold text-blue-700 mb-2">
                    E-TICKET ITINERARY & RECEIPT
                  </h2>
                  <p className="text-sm text-gray-600">
                    This is your official flight ticket - Please keep this for
                    your records
                  </p>
                </div>
              </div>

              {/* Ticket Numbers and Reference */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <h3 className="font-bold text-gray-900 mb-3 text-center">
                    TICKET NUMBER
                  </h3>
                  <div className="text-center">
                    <p className="font-mono text-2xl font-bold text-blue-700">
                      {booking.id
                        ? `FDFB${booking.id.slice(-6)}`
                        : `FDFB240001`}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Booking Reference
                    </p>
                  </div>
                </div>
                <div className="bg-green-50 border-l-4 border-green-400 p-4">
                  <h3 className="font-bold text-gray-900 mb-3 text-center">
                    PNR
                  </h3>
                  <div className="text-center">
                    <p className="font-mono text-2xl font-bold text-blue-700">
                      {booking.pnr ||
                        `UK${Math.random().toString(36).substr(2, 4).toUpperCase()}`}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">PNR</p>
                  </div>
                </div>
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                  <h3 className="font-bold text-gray-900 mb-3 text-center">
                    BOOKING REF
                  </h3>
                  <div className="text-center">
                    <p className="font-mono text-lg font-bold text-blue-700">
                      {booking.id || `FD${Date.now()}`}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Faredown Reference
                    </p>
                  </div>
                </div>
              </div>

              {/* Passenger Information */}
              <div className="border-2 border-blue-700 rounded-lg p-6 mb-8">
                <h3 className="text-xl font-bold text-blue-700 mb-4 border-b pb-2">
                  PASSENGER DETAILS
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Passenger Name
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {booking.passenger?.firstName ||
                        booking.guest?.firstName ||
                        "John"}{" "}
                      {booking.passenger?.lastName ||
                        booking.guest?.lastName ||
                        "Doe"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Contact Information
                    </p>
                    <p className="text-sm text-gray-900">
                      {booking.passenger?.email ||
                        booking.guest?.email ||
                        "john.doe@example.com"}
                    </p>
                    <p className="text-sm text-gray-900">
                      {booking.passenger?.phone ||
                        booking.guest?.phone ||
                        "+91 98765 43210"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Flight Details */}
              <div className="border-2 border-blue-700 rounded-lg p-6 mb-8">
                <h3 className="text-xl font-bold text-blue-700 mb-4 border-b pb-2">
                  FLIGHT INFORMATION
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">
                        {booking.flights?.[0]?.airline || "Airlines"} -{" "}
                        {booking.flights?.[0]?.flightNumber || "FL-001"}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Aircraft: {booking.flight?.aircraft || "Boeing 777"} |
                        Class: {booking.flight?.class || "Economy"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-600">
                        Flight Date
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        {formatDate(
                          booking.flight?.departureDate ||
                            new Date().toISOString(),
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-white p-4 rounded border">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-700">
                        {booking.flight?.departureTime || "10:15"}
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        {booking.flight?.departureCode || "BOM"}
                      </p>
                      <p className="text-sm text-gray-600">
                        {booking.flight?.departureCity || "Mumbai"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {booking.flight?.departureAirport ||
                          "Chhatrapati Shivaji International"}
                      </p>
                    </div>
                    <div className="flex-1 mx-8">
                      <div className="border-t-2 border-dashed border-gray-400 relative">
                        <Plane className="w-6 h-6 text-blue-600 absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white px-1" />
                      </div>
                      <p className="text-center text-sm font-medium text-gray-600 mt-2">
                        Duration: {booking.flight?.duration || "3h 30m"}
                      </p>
                      <p className="text-center text-xs text-gray-500">
                        {booking.flight?.stops === 0
                          ? "Non-stop"
                          : `${booking.flight?.stops || 0} Stop(s)`}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-700">
                        {booking.flight?.arrivalTime || "12:30"}
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        {booking.flight?.arrivalCode || "DXB"}
                      </p>
                      <p className="text-sm text-gray-600">
                        {booking.flight?.arrivalCity || "Dubai"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {booking.flight?.arrivalAirport ||
                          "Dubai International Airport"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fare Breakdown */}
              <div className="border-2 border-blue-700 rounded-lg p-6 mb-8">
                <h3 className="text-xl font-bold text-blue-700 mb-4 border-b pb-2">
                  FARE BREAKDOWN
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Base Fare</span>
                    <span className="font-medium">
                      ₹
                      {(
                        booking.fareBreakdown?.baseFare ||
                        (booking.total || 25890) * 0.75
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Taxes & Fees</span>
                    <span className="font-medium">
                      ₹
                      {(
                        booking.fareBreakdown?.taxes ||
                        (booking.total || 25890) * 0.15
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Airport Charges</span>
                    <span className="font-medium">
                      ₹
                      {(
                        booking.fareBreakdown?.airportCharges ||
                        (booking.total || 25890) * 0.05
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Fuel Surcharge</span>
                    <span className="font-medium">
                      ₹
                      {(
                        booking.fareBreakdown?.fuelSurcharge ||
                        (booking.total || 25890) * 0.05
                      ).toLocaleString()}
                    </span>
                  </div>
                  {booking.extras && booking.extras.length > 0 && (
                    <div className="border-t pt-2 mt-4">
                      <h4 className="font-medium text-gray-900 mb-2">
                        Extras Purchased
                      </h4>
                      {booking.extras.map((extra: any, index: number) => (
                        <div
                          key={index}
                          className="flex justify-between items-center"
                        >
                          <span className="text-sm text-gray-600">
                            {extra.name}
                          </span>
                          <span className="font-medium">
                            ��{(extra.price || 0).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="border-t-2 border-blue-700 pt-3 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-blue-700">
                        TOTAL AMOUNT
                      </span>
                      <span className="text-2xl font-bold text-blue-700">
                        ₹{(booking.total || 25890).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fare Rules Section */}
              <div className="border-2 border-blue-700 rounded-lg p-6 mb-8">
                <h3 className="text-xl font-bold text-blue-700 mb-4 border-b pb-2 flex items-center">
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  FARE RULES & CONDITIONS
                </h3>

                <div className="space-y-6">
                  {/* Outbound Flight Rules */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <svg
                        className="w-4 h-4 mr-2"
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
                      Outbound Flight: {booking.flights?.[0]?.from || "Mumbai"}{" "}
                      → {booking.flights?.[0]?.to || "Dubai"}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div>
                          <span className="font-medium text-gray-700">
                            Cancellation Policy:
                          </span>
                          <p className="text-gray-600">
                            Allowed with fee: ₹3,500 per passenger
                          </p>
                          <p className="text-xs text-gray-500">
                            Must be done 24 hours before departure
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">
                            Date Change Fee:
                          </span>
                          <p className="text-gray-600">
                            ₹2,500 per passenger + fare difference
                          </p>
                          <p className="text-xs text-gray-500">
                            Subject to seat availability
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <span className="font-medium text-gray-700">
                            Refund Policy:
                          </span>
                          <p className="text-gray-600">
                            {booking.bargained ||
                            booking.flights?.[0]?.refundable
                              ? "Fully Refundable"
                              : "Partially Refundable"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {booking.bargained ||
                            booking.flights?.[0]?.refundable
                              ? "Full refund minus service charges"
                              : "Only taxes and fees refundable"}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">
                            Baggage Allowance:
                          </span>
                          <p className="text-gray-600">
                            25kg checked + 7kg cabin bag included
                          </p>
                          <p className="text-xs text-gray-500">
                            Additional baggage charges apply
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Return Flight Rules (if applicable) */}
                  {booking.flights && booking.flights.length > 1 && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <svg
                          className="w-4 h-4 mr-2"
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
                        Return Flight: {booking.flights[1]?.from || "Dubai"} →{" "}
                        {booking.flights[1]?.to || "Mumbai"}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <div>
                            <span className="font-medium text-gray-700">
                              Cancellation Policy:
                            </span>
                            <p className="text-gray-600">
                              Allowed with fee: ₹3,500 per passenger
                            </p>
                            <p className="text-xs text-gray-500">
                              Must be done 24 hours before departure
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">
                              Date Change Fee:
                            </span>
                            <p className="text-gray-600">
                              ₹2,500 per passenger + fare difference
                            </p>
                            <p className="text-xs text-gray-500">
                              Subject to seat availability
                            </p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <span className="font-medium text-gray-700">
                              Refund Policy:
                            </span>
                            <p className="text-gray-600">
                              {booking.bargained ||
                              booking.flights[1]?.refundable
                                ? "Fully Refundable"
                                : "Partially Refundable"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {booking.bargained ||
                              booking.flights[1]?.refundable
                                ? "Full refund minus service charges"
                                : "Only taxes and fees refundable"}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">
                              Baggage Allowance:
                            </span>
                            <p className="text-gray-600">
                              25kg checked + 7kg cabin bag included
                            </p>
                            <p className="text-xs text-gray-500">
                              Additional baggage charges apply
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Important Terms & Conditions */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <svg
                        className="w-5 h-5 text-yellow-600 mr-3 mt-0.5"
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
                      <div className="flex-1">
                        <h5 className="font-semibold text-yellow-800 mb-2">
                          Important Terms & Conditions
                        </h5>
                        <ul className="text-sm text-yellow-700 space-y-1">
                          <li>
                            • Passenger names cannot be changed after booking
                            confirmation
                          </li>
                          <li>
                            • Check-in must be completed 2 hours before domestic
                            flight departure
                          </li>
                          <li>
                            • Valid government-issued photo ID required for
                            travel
                          </li>
                          <li>
                            • All fees mentioned are per passenger and inclusive
                            of applicable taxes
                          </li>
                          <li>
                            • Cancellation/change requests subject to airline
                            approval
                          </li>
                          <li>
                            • Infant fares (below 2 years) have separate terms
                            and conditions
                          </li>
                          <li>
                            • No-show will result in forfeiture of entire ticket
                            value
                          </li>
                          <li>
                            • Group bookings (9+ passengers) may have different
                            terms
                          </li>
                          <li>
                            • Force majeure events may affect refund/change
                            policies
                          </li>
                          <li>
                            • Seat assignments are subject to aircraft type and
                            availability
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information for Changes */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <svg
                        className="w-5 h-5 text-blue-600 mr-3 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      <div className="flex-1">
                        <h5 className="font-semibold text-blue-800 mb-2">
                          For Cancellations, Changes & Support
                        </h5>
                        <div className="text-sm text-blue-700 space-y-1">
                          <p>Customer Support: +91-80-4728-2525</p>
                          <p>Email: support@faredown.com</p>
                          <p>Available: 24/7 for booking assistance</p>
                          <p>WhatsApp: +91-80-4728-2525</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Important Information */}
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                <h4 className="font-bold text-red-700 mb-2">
                  IMPORTANT INFORMATION
                </h4>
                <ul className="text-sm text-red-600 space-y-1">
                  <li>
                    • Check-in opens 3 hours before departure for international
                    flights
                  </li>
                  <li>• Carry valid photo ID and this e-ticket for check-in</li>
                  <li>
                    • Arrive at airport 3 hours before international departure
                  </li>
                  <li>
                    • Baggage allowance:{" "}
                    {booking.flight?.baggage || "23kg checked + 7kg cabin"}
                  </li>
                </ul>
              </div>

              {/* Footer */}
              <div className="border-t-2 border-blue-700 pt-6 text-center">
                <div className="mb-4">
                  <p className="text-lg font-bold text-blue-700">
                    Thank you for choosing Faredown Travel!
                  </p>
                  <p className="text-sm text-gray-600">
                    Have a pleasant journey
                  </p>
                </div>
                <div className="text-xs text-gray-500">
                  <p>
                    This is an electronically generated ticket and does not
                    require signature
                  </p>
                  <p>For support: support@faredown.com | +91-11-4567-8900</p>
                  <p className="mt-2 font-mono">
                    Reference Copy - Keep for your records
                  </p>
                </div>
              </div>
            </>
          ) : (
            /* Hotel Voucher */
            <>
              <div className="text-center border-b-2 border-blue-700 pb-4 mb-6">
                <h1 className="text-2xl font-bold text-blue-700">
                  HOTEL BOOKING VOUCHER
                </h1>
                <p className="text-gray-600">faredown.com</p>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-6">
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">
                    Booking Details
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Booking ID:</span>{" "}
                      {booking.id || "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">Booking Date:</span>{" "}
                      {formatDate(
                        booking.bookingDate || new Date().toISOString(),
                      )}
                    </p>
                    <p>
                      <span className="font-medium">Payment Status:</span>{" "}
                      <span className="text-green-600">
                        {booking.paymentStatus || "Pending"}
                      </span>
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">
                    Guest Details
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Name:</span>{" "}
                      {booking.guest?.firstName || "Guest"}{" "}
                      {booking.guest?.lastName || "Name"}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {booking.guest?.email || "email@example.com"}
                    </p>
                    <p>
                      <span className="font-medium">Phone:</span>{" "}
                      {booking.guest?.phone || "Phone Number"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 mb-6">
                <h3 className="font-bold text-gray-900 mb-3">
                  Hotel Information
                </h3>
                <div className="flex gap-4">
                  <img
                    src={
                      booking.hotel?.image ||
                      "https://via.placeholder.com/96x96?text=Hotel"
                    }
                    alt={booking.hotel?.name || "Hotel"}
                    className="w-24 h-24 object-cover rounded"
                  />
                  <div>
                    <h4 className="font-bold text-lg">
                      {booking.hotel?.name || "Hotel Name"}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {booking.hotel?.location || "Location"}
                    </p>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(booking.hotel?.rating || 0)
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-sm">
                        {booking.hotel?.rating || 0} (
                        {booking.hotel?.reviews || 0} reviews)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-bold text-gray-900 mb-3">Stay Details</h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Check-in:</span>{" "}
                      {formatDate(booking.checkIn || new Date().toISOString())}
                    </p>
                    <p>
                      <span className="font-medium">Check-out:</span>{" "}
                      {formatDate(booking.checkOut || new Date().toISOString())}
                    </p>
                    <p>
                      <span className="font-medium">Nights:</span>{" "}
                      {booking.nights || 1}
                    </p>
                    <p>
                      <span className="font-medium">Guests:</span>{" "}
                      {booking.guests || 1}
                    </p>
                    <p>
                      <span className="font-medium">Rooms:</span>{" "}
                      {booking.rooms || 1}
                    </p>
                  </div>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-bold text-gray-900 mb-3">Room Details</h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Room Type:</span>{" "}
                      {booking.room?.name || "Room"}
                    </p>
                    <p>
                      <span className="font-medium">Details:</span>{" "}
                      {booking.room?.details || "Room details"}
                    </p>
                    <p>
                      <span className="font-medium">Rate per night:</span> ₹
                      {(booking.room?.pricePerNight || 0).toLocaleString()}{" "}
                      (incl. taxes & fees)
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t-2 border-blue-700 pt-4 text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Please present this voucher at the hotel during check-in
                </p>
                <p className="text-xs text-gray-500">
                  This is a computer-generated voucher and does not require a
                  signature
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  if (showInvoice) {
    return (
      <div className="min-h-screen bg-white p-8 print:p-0">
        <div className="max-w-4xl mx-auto">
          {/* Invoice Header */}
          <div className="text-center border-b-2 border-blue-700 pb-4 mb-6">
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-blue-700">
                FAREDOWN TRAVEL
              </h1>
              <p className="text-gray-600">www.faredown.com</p>
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {bookingType === "flight"
                ? "FLIGHT BOOKING INVOICE"
                : "HOTEL BOOKING INVOICE"}
            </h2>
            <p className="text-sm text-gray-500">
              Invoice Date:{" "}
              {formatDate(booking.bookingDate || new Date().toISOString())}
            </p>
            <p className="text-sm text-gray-500">
              Invoice No: INV-{booking.id}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-6">
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Bill To:</h3>
              <div className="space-y-1 text-sm">
                <p className="font-medium">
                  {booking.guest?.firstName || "Guest"}{" "}
                  {booking.guest?.lastName || "Name"}
                </p>
                <p> {booking.guest?.email || "email@example.com"}</p>
                <p> {booking.guest?.phone || "Phone Number"}</p>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Booking Details:</h3>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Booking ID:</span>{" "}
                  {booking.id || "N/A"}
                </p>
                <p>
                  <span className="font-medium">Invoice Date:</span>{" "}
                  {formatDate(booking.bookingDate || new Date().toISOString())}
                </p>
                <p>
                  <span className="font-medium">Payment Method:</span>{" "}
                  {booking.paymentMethod || "Credit Card"}
                </p>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 font-medium">Description</th>
                  <th className="text-center p-3 font-medium">Qty</th>
                  <th className="text-right p-3 font-medium">Rate</th>
                  <th className="text-right p-3 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {bookingType === "flight" ? (
                  /* Flight Invoice Items */
                  <>
                    <tr className="border-t">
                      <td className="p-3">
                        <div>
                          <p className="font-medium">Base Fare</p>
                          <p className="text-sm text-gray-600">
                            {booking.flights && booking.flights.length > 0
                              ? `${booking.flights[0].from} - ${booking.flights[0].to}`
                              : "Flight Booking"}
                          </p>
                          <p className="text-sm text-gray-600">
                            {booking.passengers?.length || 1} Passenger(s)
                          </p>
                        </div>
                      </td>
                      <td className="text-center p-3">
                        {booking.passengers?.length || 1}
                      </td>
                      <td className="text-right p-3">
                        ₹
                        {(
                          (booking.baseFareTotal || booking.total * 0.75) /
                          (booking.passengers?.length || 1)
                        ).toLocaleString()}
                      </td>
                      <td className="text-right p-3">
                        ₹
                        {(
                          booking.baseFareTotal || booking.total * 0.75
                        ).toLocaleString()}
                      </td>
                    </tr>
                    <tr className="border-t">
                      <td className="p-3">
                        <p className="font-medium">Taxes & Fees</p>
                        <p className="text-sm text-gray-600">
                          Airport charges, fuel surcharge, etc.
                        </p>
                      </td>
                      <td className="text-center p-3">1</td>
                      <td className="text-right p-3">
                        ₹{(booking.total * 0.2).toLocaleString()}
                      </td>
                      <td className="text-right p-3">
                        ₹{(booking.total * 0.2).toLocaleString()}
                      </td>
                    </tr>
                    {booking.extrasTotal > 0 && (
                      <tr className="border-t">
                        <td className="p-3">
                          <p className="font-medium">Meals & Extras</p>
                          <p className="text-sm text-gray-600">
                            Additional services
                          </p>
                        </td>
                        <td className="text-center p-3">1</td>
                        <td className="text-right p-3">
                          ₹{(booking.extrasTotal || 0).toLocaleString()}
                        </td>
                        <td className="text-right p-3">
                          ₹{(booking.extrasTotal || 0).toLocaleString()}
                        </td>
                      </tr>
                    )}
                    {booking.seatFeesTotal > 0 && (
                      <tr className="border-t">
                        <td className="p-3">
                          <p className="font-medium">Seat Selection</p>
                          <p className="text-sm text-gray-600">
                            Preferred seat charges
                          </p>
                        </td>
                        <td className="text-center p-3">1</td>
                        <td className="text-right p-3">
                          ₹{(booking.seatFeesTotal || 0).toLocaleString()}
                        </td>
                        <td className="text-right p-3">
                          ₹{(booking.seatFeesTotal || 0).toLocaleString()}
                        </td>
                      </tr>
                    )}
                  </>
                ) : (
                  /* Hotel Invoice Items */
                  <tr className="border-t">
                    <td className="p-3">
                      <div>
                        <p className="font-medium">
                          {booking.room?.name || "Room"}
                        </p>
                        <p className="text-sm text-gray-600">
                          {booking.hotel?.name || "Hotel Name"}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatDate(
                            booking.checkIn || new Date().toISOString(),
                          )}{" "}
                          to{" "}
                          {formatDate(
                            booking.checkOut || new Date().toISOString(),
                          )}
                        </p>
                      </div>
                    </td>
                    <td className="text-center p-3">{booking.nights} nights</td>
                    <td className="text-right p-3">
                      ₹ {(booking.room?.pricePerNight || 0).toLocaleString()}
                    </td>
                    <td className="text-right p-3">
                      ₹{(booking.total || 0).toLocaleString()}
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-gray-50 border-t">
                <tr>
                  <td colSpan={3} className="text-right p-3 font-medium">
                    Subtotal:
                  </td>
                  <td className="text-right p-3">
                    ₹{(booking.total || 0).toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td colSpan={3} className="text-right p-3 font-medium">
                    Service Tax (Included):
                  </td>
                  <td className="text-right p-3">₹0</td>
                </tr>
                <tr className="border-t-2">
                  <td colSpan={3} className="text-right p-3 font-bold text-lg">
                    Total Amount:
                  </td>
                  <td className="text-right p-3 font-bold text-lg">
                    ₹{(booking.total || 0).toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {booking.bargained && (
            <div className="bg-green-50 border border-green-200 rounded p-3 mb-6">
              <p className="text-sm text-green-800">
                <span className="font-medium">Bargain Savings:</span> You saved
                ₹
                {(
                  (booking.originalPrice || 0) - (booking.total || 0)
                ).toLocaleString()}{" "}
                with our bargaining feature!
              </p>
            </div>
          )}

          <div className="text-center text-xs text-gray-500">
            <p>
              This is a computer-generated invoice and does not require a
              signature
            </p>
            <p>For any queries, please contact our support team</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Success Message */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8 text-center">
          <div className="w-16 h-16 border border-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-gray-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-gray-600 mb-4">
            Your {bookingType}{" "}
            {bookingType === "flight" ? "ticket" : "reservation"} has been
            successfully confirmed. Here are your booking details:
          </p>
          <div className="border border-gray-300 text-gray-900 px-6 py-3 rounded-lg inline-block">
            <span className="text-lg font-bold">Booking ID: {booking.id}</span>
          </div>
          {booking.bargained && (
            <div className="mt-4">
              <Badge className="bg-gray-100 text-gray-800 px-4 py-2">
                You saved ₹
                {(
                  (booking.originalPrice || 0) - (booking.total || 0)
                ).toLocaleString()}{" "}
                with bargaining!
              </Badge>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Download Documents
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3">
            <Button
              onClick={handleDownloadVoucher}
              className="bg-blue-700 hover:bg-blue-800 flex items-center justify-center"
            >
              <Download className="w-4 h-4 mr-2" />
              {bookingType === "flight" ? "Flight Ticket" : "Hotel Voucher"}
            </Button>
            <Button
              onClick={handleDownloadInvoice}
              variant="outline"
              className="border-blue-700 text-blue-700 hover:bg-blue-700 hover:text-white flex items-center justify-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Invoice
            </Button>
            <Button
              onClick={handleEmailConfirmation}
              variant="outline"
              className="border-blue-700 text-blue-700 hover:bg-blue-700 hover:text-white flex items-center justify-center"
              disabled={emailSent}
            >
              <Mail className="w-4 h-4 mr-2" />
              {emailSent ? "Email Sent!" : "Email Details"}
            </Button>
          </div>
        </div>

        {/* Booking Summary */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Details Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              {bookingType === "flight" ? (
                <Plane className="w-5 h-5 text-blue-700 mr-2" />
              ) : (
                <Hotel className="w-5 h-5 text-blue-700 mr-2" />
              )}
              <h2 className="text-xl font-bold text-gray-900">
                {bookingType === "flight" ? "Flight Details" : "Hotel Details"}
              </h2>
            </div>
            {bookingType === "flight" ? (
              // Flight Details
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">
                        {booking.flights?.[0]?.airline || "Indigo"}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Flight {booking.flight?.flightNumber || "6E-1406"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {booking.flight?.aircraft || "Airbus A321"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Aircraft type can change anytime as per airline
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      {booking.flight?.departureTime || "10:15"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {booking.flight?.departureCode || "BOM"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {booking.flight?.departureCity || "Mumbai"}
                    </p>
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="border-t-2 border-dashed border-gray-300 relative">
                      <Plane className="w-4 h-4 text-blue-600 absolute -top-2 left-1/2 transform -translate-x-1/2 bg-white" />
                    </div>
                    <p className="text-xs text-center text-gray-500 mt-1">
                      {booking.flight?.duration || "3h 30m"}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      {booking.flight?.arrivalTime || "12:30"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {booking.flight?.arrivalCode || "DXB"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {booking.flight?.arrivalCity || "Dubai"}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              // Hotel Details
              <>
                <div className="flex gap-4 mb-4">
                  <img
                    src={
                      booking.hotel?.image ||
                      "https://via.placeholder.com/80x80?text=Hotel"
                    }
                    alt={booking.hotel?.name || "Hotel"}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900">
                      {booking.hotel?.name || "Hotel Name"}
                    </h3>
                    <div className="flex items-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(booking.hotel?.rating || 0)
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-sm">
                        {booking.hotel?.rating || 0} (
                        {booking.hotel?.reviews || 0} reviews)
                      </span>
                    </div>
                    <div className="flex items-start">
                      <MapPin className="w-4 h-4 text-gray-500 mr-1 mt-0.5" />
                      <p className="text-sm text-gray-600">
                        {booking.hotel?.location || "Location"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {booking.room?.name || "Room"}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {booking.room?.details || "Room details"}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Travel/Stay Details */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              {bookingType === "flight" ? (
                <Clock className="w-5 h-5 text-blue-700 mr-2" />
              ) : (
                <Calendar className="w-5 h-5 text-blue-700 mr-2" />
              )}
              <h2 className="text-xl font-bold text-gray-900">
                {bookingType === "flight" ? "Travel Details" : "Stay Details"}
              </h2>
            </div>
            <div className="space-y-4">
              {bookingType === "flight" ? (
                <>
                  {/* Flight Travel Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 border border-gray-200 rounded-lg text-center">
                      <p className="text-sm text-gray-600">Departure</p>
                      <p className="font-bold">
                        {formatDate(
                          booking.flights?.[0]?.date ||
                            booking.departureDate ||
                            new Date().toISOString(),
                        )}
                      </p>
                      <p className="text-xs text-gray-500">
                        {booking.flights?.[0]?.departureTime || "10:15"} -{" "}
                        {booking.flights?.[0]?.from || "BOM"}
                      </p>
                    </div>
                    <div className="p-3 border border-gray-200 rounded-lg text-center">
                      <p className="text-sm text-gray-600">Arrival</p>
                      <p className="font-bold">
                        {formatDate(
                          booking.flights?.[0]?.arrivalDate ||
                            booking.flights?.[0]?.date ||
                            new Date().toISOString(),
                        )}
                      </p>
                      <p className="text-xs text-gray-500">
                        {booking.flights?.[0]?.arrivalTime || "12:30"} -{" "}
                        {booking.flights?.[0]?.to || "DXB"}
                      </p>
                    </div>
                  </div>
                  {booking.flights?.[1] && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 border border-gray-200 rounded-lg text-center">
                        <p className="text-sm text-gray-600">
                          Return Departure
                        </p>
                        <p className="font-bold">
                          {formatDate(
                            booking.flights[1].date || new Date().toISOString(),
                          )}
                        </p>
                        <p className="text-xs text-gray-500">
                          {booking.flights[1].departureTime || "14:00"} -{" "}
                          {booking.flights[1].from || "DXB"}
                        </p>
                      </div>
                      <div className="p-3 border border-gray-200 rounded-lg text-center">
                        <p className="text-sm text-gray-600">Return Arrival</p>
                        <p className="font-bold">
                          {formatDate(
                            booking.flights[1].arrivalDate ||
                              booking.flights[1].date ||
                              new Date().toISOString(),
                          )}
                        </p>
                        <p className="text-xs text-gray-500">
                          {booking.flights[1].arrivalTime || "19:30"} -{" "}
                          {booking.flights[1].to || "BOM"}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-lg font-bold">
                        {booking.passengers?.adults || booking.adults || 1}
                      </p>
                      <p className="text-xs text-gray-600">adults</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold">
                        {booking.passengers?.children || booking.children || 0}
                      </p>
                      <p className="text-xs text-gray-600">children</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold">
                        {booking.flightClass || "Economy"}
                      </p>
                      <p className="text-xs text-gray-600">class</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Hotel Travel Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg text-center">
                      <p className="text-sm text-gray-600">Check-in</p>
                      <p className="font-bold">
                        {formatDate(
                          booking.checkIn || new Date().toISOString(),
                        )}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg text-center">
                      <p className="text-sm text-gray-600">Check-out</p>
                      <p className="font-bold">
                        {formatDate(
                          booking.checkOut || new Date().toISOString(),
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-lg font-bold">{booking.nights || 1}</p>
                      <p className="text-xs text-gray-600">nights</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold">{booking.guests || 1}</p>
                      <p className="text-xs text-gray-600">guests</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold">{booking.rooms || 1}</p>
                      <p className="text-xs text-gray-600">room</p>
                    </div>
                  </div>
                </>
              )}
              <div className="p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <CreditCard className="w-4 h-4 text-gray-700 mr-2" />
                  <span className="text-sm font-medium">Payment Method</span>
                </div>
                <p className="text-sm text-gray-700">
                  {booking.paymentMethod || "Credit Card"}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Status: {booking.paymentStatus || "Pending"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Guest Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mt-8">
          <div className="flex items-center mb-4">
            <Users className="w-5 h-5 text-blue-700 mr-2" />
            <h2 className="text-xl font-bold text-gray-900">
              Guest Information
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {bookingType === "flight"
                  ? "Primary Passenger"
                  : "Primary Guest"}
              </h3>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-gray-600">Name:</span>{" "}
                  {bookingType === "flight"
                    ? booking.passengers?.[0]?.firstName ||
                      booking.contactDetails?.firstName ||
                      booking.guest?.firstName ||
                      "John"
                    : booking.guest?.firstName || "Guest"}{" "}
                  {bookingType === "flight"
                    ? booking.passengers?.[0]?.lastName ||
                      booking.contactDetails?.lastName ||
                      booking.guest?.lastName ||
                      "Doe"
                    : booking.guest?.lastName || "Name"}
                </p>
                <p>
                  <span className="text-gray-600">Email:</span>{" "}
                  {bookingType === "flight"
                    ? booking.contactDetails?.email ||
                      booking.guest?.email ||
                      "john.doe@example.com"
                    : booking.guest?.email || "email@example.com"}
                </p>
                <p>
                  <span className="text-gray-600">Phone:</span>{" "}
                  {bookingType === "flight"
                    ? booking.contactDetails?.phone ||
                      booking.guest?.phone ||
                      "+91 9876543210"
                    : booking.guest?.phone || "Phone Number"}
                </p>
                {bookingType === "flight" &&
                  booking.passengers &&
                  booking.passengers.length > 1 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="font-medium text-gray-700 mb-2">
                        Additional Passengers:
                      </p>
                      {booking.passengers.slice(1).map((passenger, index) => (
                        <p key={index} className="text-sm text-gray-600">
                          {passenger.firstName} {passenger.lastName}
                          {passenger.age && ` (Age: ${passenger.age})`}
                        </p>
                      ))}
                    </div>
                  )}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {bookingType === "flight"
                  ? "Flight Information"
                  : "Special Requests"}
              </h3>
              {bookingType === "flight" ? (
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-gray-600">Airline:</span>{" "}
                    {booking.flights?.[0]?.airline || "Indigo"}
                  </p>
                  <p>
                    <span className="text-gray-600">Flight Number:</span>{" "}
                    {booking.flights?.[0]?.flightNumber || "6E 1406"}
                  </p>
                  <p>
                    <span className="text-gray-600">Aircraft:</span>{" "}
                    {booking.flights?.[0]?.aircraft || "Airbus A321"}
                  </p>
                  <p>
                    <span className="text-gray-600">Route:</span>{" "}
                    {booking.flights?.[0]?.from || "BOM"} →{" "}
                    {booking.flights?.[0]?.to || "DXB"}
                  </p>
                  {booking.flights?.[1] && (
                    <p>
                      <span className="text-gray-600">Return:</span>{" "}
                      {booking.flights[1].flightNumber || "6E 1408"} |
                      {booking.flights[1].from || "DXB"} →{" "}
                      {booking.flights[1].to || "BOM"}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-600">
                  {booking.specialRequests || "None"}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Total Amount */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mt-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Total Amount</h2>
              {booking.bargained && (
                <p className="text-sm text-gray-600">
                  Original price: ₹
                  {(booking.originalPrice || 0).toLocaleString()}
                </p>
              )}
            </div>
            <span className="text-3xl font-bold text-blue-700">
              ₹{(booking.total || 0).toLocaleString()}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            All taxes and fees included
          </p>
        </div>

        {/* Cancellation Policy */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mt-8">
          <h3 className="font-bold text-gray-900 mb-3">Cancellation Policy</h3>
          <div className="text-gray-700 text-sm space-y-2">
            {bookingType === "flight" ? (
              <>
                <p>
                  • <strong>Free cancellation:</strong> Cancel up to 24 hours
                  before departure for domestic flights, 48 hours for
                  international flights
                </p>
                <p>
                  • <strong>Partial cancellation:</strong> Cancellation fees may
                  apply as per airline policy
                </p>
                <p>
                  • <strong>No-show policy:</strong> No refund for no-shows or
                  missed flights
                </p>
                <p>
                  • <strong>Name changes:</strong> Name corrections may incur
                  additional charges
                </p>
              </>
            ) : (
              <p>
                {booking.cancellation ||
                  "Cancellation terms as per provider policy"}
              </p>
            )}
          </div>
        </div>

        {/* Important Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mt-8">
          <h3 className="font-bold text-gray-900 mb-3">
            Important Information
          </h3>
          <ul className="text-gray-700 space-y-2 text-sm">
            {bookingType === "flight" ? (
              <>
                <li>
                  • Please carry a valid government-issued photo ID for check-in
                </li>
                <li>
                  • Arrive at airport 2 hours before domestic flights, 3 hours
                  before international flights
                </li>
                <li>
                  • Check-in opens 48 hours before departure for most airlines
                </li>
                <li>• Baggage restrictions apply as per airline policy</li>
                <li>
                  • Contact airline directly for seat preferences and special
                  assistance
                </li>
                <li>
                  • Present your e-ticket and booking confirmation at the
                  airport
                </li>
              </>
            ) : (
              <>
                <li>
                  • Please carry a valid photo ID for check-in verification
                </li>
                <li>• Check-in time: 3:00 PM | Check-out time: 12:00 PM</li>
                <li>• Contact the hotel directly for any special requests</li>
                <li>• Present your booking confirmation at the reception</li>
              </>
            )}
          </ul>
        </div>

        {/* Navigation */}
        <div className="text-center mt-8">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {bookingType === "flight" ? (
              <Link to="/flights">
                <Button variant="outline" className="w-full sm:w-auto">
                  Book Another Flight
                </Button>
              </Link>
            ) : (
              <Link to="/hotels">
                <Button variant="outline" className="w-full sm:w-auto">
                  Book Another Hotel
                </Button>
              </Link>
            )}
            <Link to="/account?tab=bookings">
              <Button className="bg-blue-700 hover:bg-blue-800 w-full sm:w-auto">
                View My Bookings
              </Button>
            </Link>
            <Link to="/my-account">
              <Button variant="outline" className="w-full sm:w-auto">
                My Account
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal && <EmailModal />}

      {/* Mobile Navigation */}
      <MobileNavigation />
    </div>
  );
}
