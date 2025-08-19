import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CalendarDays,
  MapPin,
  Plane,
  Hotel,
  Users,
  Clock,
  Download,
  Eye,
  Filter,
  Search,
} from "lucide-react";
import { Header } from "@/components/Header";

interface Trip {
  id: string;
  bookingType: "flight" | "hotel" | "sightseeing" | "transfer";
  bookingDate: string;
  total: number;
  passengers?: any[];
  guests?: number;
  flights?: any[];
  hotel?: any;
  checkIn?: string;
  checkOut?: string;
  nights?: number;
  // Sightseeing fields
  name?: string;
  location?: string;
  visitDate?: string;
  time?: string;
  duration?: string;
  ticketType?: string;
  category?: string;
  // Transfer fields
  service?: string;
  route?: string;
  pickupDate?: string;
  pickupTime?: string;
  vehicle?: string;
  pickupLocation?: string;
  dropoffLocation?: string;
}

export default function MyTrips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
  const [filterType, setFilterType] = useState<
    "all" | "flight" | "hotel" | "sightseeing" | "transfer"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Load trips from localStorage
    const savedTrips = JSON.parse(localStorage.getItem("myTrips") || "[]");

    // Also load any existing bookings that haven't been added to trips yet
    const existingTrips = [...savedTrips];

    // Generate unique ID function
    const generateUniqueId = (bookingType: string, baseId?: string) => {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substr(2, 5);
      return baseId && baseId !== ""
        ? `${baseId}_${timestamp}`
        : `${bookingType.toUpperCase()}_${timestamp}_${random}`;
    };

    // Check for flight booking
    const flightBooking = localStorage.getItem("latestBooking");
    if (flightBooking) {
      try {
        const flightData = JSON.parse(flightBooking);
        // Ensure unique ID for flight booking
        const uniqueFlightId = generateUniqueId("flight", flightData.id);

        // Check if this booking is already in trips (by original ID or unique ID)
        const existsInTrips = existingTrips.some(
          (trip) => trip.id === flightData.id || trip.id === uniqueFlightId,
        );

        if (!existsInTrips && flightData.id) {
          const flightTrip: Trip = {
            ...flightData,
            id: uniqueFlightId,
            bookingType: "flight",
            bookingDate: new Date().toISOString(),
          };
          existingTrips.push(flightTrip);
        }
      } catch (error) {
        console.error("Error parsing flight booking:", error);
      }
    }

    // Check for hotel booking
    const hotelBooking = localStorage.getItem("latestHotelBooking");
    if (hotelBooking) {
      try {
        const hotelData = JSON.parse(hotelBooking);
        // Ensure unique ID for hotel booking
        const uniqueHotelId = generateUniqueId("hotel", hotelData.id);

        // Check if this booking is already in trips (by original ID or unique ID)
        const existsInTrips = existingTrips.some(
          (trip) => trip.id === hotelData.id || trip.id === uniqueHotelId,
        );

        if (!existsInTrips && hotelData.id) {
          const hotelTrip: Trip = {
            ...hotelData,
            id: uniqueHotelId,
            bookingType: "hotel",
            bookingDate: hotelData.bookingDate || new Date().toISOString(),
          };
          existingTrips.push(hotelTrip);
        }
      } catch (error) {
        console.error("Error parsing hotel booking:", error);
      }
    }

    // Add test bookings if no trips exist (for testing)
    if (existingTrips.length === 0) {
      const testHotelTrip: Trip = {
        id: generateUniqueId("hotel", "HB240001"),
        bookingType: "hotel",
        bookingDate: "2024-01-16",
        total: 9148,
        guests: 2,
        hotel: {
          id: "1",
          name: "Roessli Hotel",
          location: "Mumbai, India",
          image: "https://via.placeholder.com/80x80?text=Hotel",
          rating: 4.2,
          reviews: 150,
        },
        room: {
          type: "twin-double",
          name: "Twin/Double with Shared Bathroom",
          details: "ROOM ONLY",
          pricePerNight: 2287,
        },
        checkIn: "2024-02-01",
        checkOut: "2024-02-05",
        nights: 4,
        paymentMethod: "Credit Card",
        paymentStatus: "Confirmed",
        cancellation: "Free cancellation until 24 hours before check-in",
        guest: {
          firstName: "Zubin",
          lastName: "Aibara",
          email: "zubin@example.com",
          phone: "+91 98765 43210",
        },
      };
      existingTrips.push(testHotelTrip);

      // Add test sightseeing trip
      const testSightseeingTrip: Trip = {
        id: generateUniqueId("sightseeing", "SG240001"),
        bookingType: "sightseeing",
        bookingDate: "2024-01-15",
        total: 2850,
        guests: 2,
        name: "Burj Khalifa: Floors 124 and 125",
        location: "Dubai, UAE",
        visitDate: "2024-02-03",
        time: "14:30",
        duration: "1-2 hours",
        ticketType: "Standard Admission",
        category: "landmark",
      };
      existingTrips.push(testSightseeingTrip);

      // Add test transfer trip
      const testTransferTrip: Trip = {
        id: generateUniqueId("transfer", "TR240001"),
        bookingType: "transfer",
        bookingDate: "2024-01-15",
        total: 425,
        passengers: 2,
        service: "Airport Transfer",
        route: "DXB Airport → Downtown Dubai",
        pickupDate: "2024-02-01",
        pickupTime: "12:30",
        vehicle: "Sedan - Economy",
        pickupLocation: "Dubai International Airport Terminal 3",
        dropoffLocation: "Grand Hyatt Dubai",
      };
      existingTrips.push(testTransferTrip);
    }

    // Remove any potential duplicates by ID (additional safeguard)
    const uniqueTrips = existingTrips.filter(
      (trip, index, self) => index === self.findIndex((t) => t.id === trip.id),
    );

    // Update localStorage with the combined trips
    if (uniqueTrips.length > savedTrips.length) {
      localStorage.setItem("myTrips", JSON.stringify(uniqueTrips));
    }

    console.log("All trips:", uniqueTrips);
    console.log(
      "Hotel trips:",
      uniqueTrips.filter((trip) => trip.bookingType === "hotel"),
    );

    setTrips(uniqueTrips);
    setFilteredTrips(uniqueTrips);
  }, []);

  useEffect(() => {
    // Filter trips based on type and search term
    let filtered = trips;

    console.log("Filtering trips:", { trips, filterType, searchTerm });

    if (filterType !== "all") {
      filtered = filtered.filter((trip) => trip.bookingType === filterType);
      console.log(`Filtered by ${filterType}:`, filtered);
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((trip) => {
        // Search by booking ID
        if (trip.id.toLowerCase().includes(searchLower)) return true;

        // Search by booking type
        if (trip.bookingType.toLowerCase().includes(searchLower)) return true;

        // Search by dates (multiple formats)
        const bookingDate = new Date(trip.bookingDate);
        const bookingDateStr = bookingDate.toLocaleDateString();
        const bookingDateISO = trip.bookingDate;
        const bookingDateFormatted = formatDate(trip.bookingDate);

        if (
          bookingDateStr.includes(searchLower) ||
          bookingDateISO.includes(searchLower) ||
          bookingDateFormatted.toLowerCase().includes(searchLower)
        )
          return true;

        // Search by total amount
        if (trip.total?.toString().includes(searchLower)) return true;

        // Hotel-specific searches
        if (trip.bookingType === "hotel" && trip.hotel) {
          // Hotel name
          if (trip.hotel.name?.toLowerCase().includes(searchLower)) return true;

          // Hotel location
          if (trip.hotel.location?.toLowerCase().includes(searchLower))
            return true;

          // Room type
          if (trip.room?.type?.toLowerCase().includes(searchLower)) return true;
          if (trip.room?.name?.toLowerCase().includes(searchLower)) return true;

          // Check-in/Check-out dates
          if (trip.checkIn) {
            const checkInDate = new Date(trip.checkIn);
            const checkInStr = checkInDate.toLocaleDateString();
            const checkInFormatted = formatDate(trip.checkIn);
            if (
              checkInStr.includes(searchLower) ||
              checkInFormatted.toLowerCase().includes(searchLower)
            )
              return true;
          }

          if (trip.checkOut) {
            const checkOutDate = new Date(trip.checkOut);
            const checkOutStr = checkOutDate.toLocaleDateString();
            const checkOutFormatted = formatDate(trip.checkOut);
            if (
              checkOutStr.includes(searchLower) ||
              checkOutFormatted.toLowerCase().includes(searchLower)
            )
              return true;
          }

          // Guest information
          if (trip.guest?.firstName?.toLowerCase().includes(searchLower))
            return true;
          if (trip.guest?.lastName?.toLowerCase().includes(searchLower))
            return true;
          if (trip.guest?.email?.toLowerCase().includes(searchLower))
            return true;

          // Payment method and status
          if (trip.paymentMethod?.toLowerCase().includes(searchLower))
            return true;
          if (trip.paymentStatus?.toLowerCase().includes(searchLower))
            return true;
        }

        // Flight-specific searches
        if (trip.bookingType === "flight" && trip.flights) {
          return trip.flights.some((flight: any) => {
            // Airline name and flight number
            if (flight.airline?.toLowerCase().includes(searchLower))
              return true;
            if (flight.flightNumber?.toLowerCase().includes(searchLower))
              return true;

            // Airports (from/to)
            if (flight.from?.toLowerCase().includes(searchLower)) return true;
            if (flight.to?.toLowerCase().includes(searchLower)) return true;

            // Flight date and time
            if (flight.date?.toLowerCase().includes(searchLower)) return true;
            if (flight.time?.toLowerCase().includes(searchLower)) return true;

            // Departure and arrival times
            if (flight.departure?.toLowerCase().includes(searchLower))
              return true;
            if (flight.arrival?.toLowerCase().includes(searchLower))
              return true;

            return false;
          });
        }

        // Passenger information for flights
        if (trip.passengers) {
          return trip.passengers.some((passenger: any) => {
            if (passenger.firstName?.toLowerCase().includes(searchLower))
              return true;
            if (passenger.lastName?.toLowerCase().includes(searchLower))
              return true;
            if (passenger.email?.toLowerCase().includes(searchLower))
              return true;
            return false;
          });
        }

        return false;
      });
      console.log(`Filtered by search "${searchTerm}":`, filtered);
    }

    console.log("Final filtered trips:", filtered);
    setFilteredTrips(filtered);
  }, [trips, filterType, searchTerm]);

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

  const handleViewDetails = (trip: Trip) => {
    // Create a detailed view of the trip information
    const details = generateTripDetails(trip);

    // Open in a new window/tab for better visibility
    const detailsWindow = window.open(
      "",
      "_blank",
      "width=800,height=600,scrollbars=yes",
    );
    if (detailsWindow) {
      detailsWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Trip Details - ${trip.id}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
              .header { background: #003580; color: white; padding: 20px; margin: -20px -20px 20px -20px; }
              .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
              .label { font-weight: bold; color: #333; }
              .value { margin-left: 10px; }
              .flight-segment { background: #f0f8ff; padding: 10px; margin: 10px 0; border-radius: 5px; }
              .hotel-info { background: #f0fff0; padding: 10px; margin: 10px 0; border-radius: 5px; }
              @media print { .no-print { display: none; } }
            </style>
          </head>
          <body>
            ${details}
            <div class="no-print" style="margin-top: 30px; text-align: center;">
              <button onclick="window.print()" style="padding: 10px 20px; background: #003580; color: white; border: none; border-radius: 5px; cursor: pointer;">Print Details</button>
              <button onclick="window.close()" style="padding: 10px 20px; background: #666; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">Close</button>
            </div>
          </body>
        </html>
      `);
      detailsWindow.document.close();
    }
  };

  const handleDownload = (trip: Trip) => {
    try {
      const content = generateDownloadContent(trip);
      const blob = new Blob([content], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${trip.bookingType}-booking-${trip.id}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Download failed. Please try again.");
    }
  };

  const generateTripDetails = (trip: Trip): string => {
    const bookingDate = formatDate(trip.bookingDate);

    if (trip.bookingType === "flight") {
      return `
        <div class="header">
          <h1>Flight Booking Details</h1>
          <p>Booking Reference: ${trip.id}</p>
        </div>

        <div class="section">
          <h2>Booking Information</h2>
          <p><span class="label">Booking ID:</span><span class="value">${trip.id}</span></p>
          <p><span class="label">Booking Date:</span><span class="value">${bookingDate}</span></p>
          <p><span class="label">Total Amount:</span><span class="value">₹${trip.total?.toLocaleString() || "N/A"}</span></p>
          <p><span class="label">Passengers:</span><span class="value">${trip.passengers?.length || 1}</span></p>
        </div>

        ${
          trip.flights
            ?.map(
              (flight: any, index: number) => `
          <div class="flight-segment">
            <h3>Flight ${index + 1}</h3>
            <p><span class="label">Route:</span><span class="value">${flight.from} → ${flight.to}</span></p>
            <p><span class="label">Airline:</span><span class="value">${flight.airline} ${flight.flightNumber}</span></p>
            <p><span class="label">Date:</span><span class="value">${flight.date}</span></p>
            <p><span class="label">Time:</span><span class="value">${flight.time}</span></p>
            ${flight.departure ? `<p><span class="label">Departure:</span><span class="value">${flight.departure}</span></p>` : ""}
            ${flight.arrival ? `<p><span class="label">Arrival:</span><span class="value">${flight.arrival}</span></p>` : ""}
          </div>
        `,
            )
            .join("") || ""
        }

        ${
          trip.passengers
            ?.map(
              (passenger: any, index: number) => `
          <div class="section">
            <h3>Passenger ${index + 1}</h3>
            <p><span class="label">Name:</span><span class="value">${passenger.firstName} ${passenger.lastName}</span></p>
            <p><span class="label">Type:</span><span class="value">${passenger.type || "Adult"}</span></p>
            ${passenger.email ? `<p><span class="label">Email:</span><span class="value">${passenger.email}</span></p>` : ""}
          </div>
        `,
            )
            .join("") || ""
        }
      `;
    } else {
      const checkInDate = trip.checkIn ? formatDate(trip.checkIn) : "N/A";
      const checkOutDate = trip.checkOut ? formatDate(trip.checkOut) : "N/A";

      return `
        <div class="header">
          <h1>Hotel Booking Details</h1>
          <p>Booking Reference: ${trip.id}</p>
        </div>

        <div class="section">
          <h2>Booking Information</h2>
          <p><span class="label">Booking ID:</span><span class="value">${trip.id}</span></p>
          <p><span class="label">Booking Date:</span><span class="value">${bookingDate}</span></p>
          <p><span class="label">Total Amount:</span><span class="value">₹${trip.total?.toLocaleString() || "N/A"}</span></p>
          <p><span class="label">Guests:</span><span class="value">${trip.guests || 1}</span></p>
          <p><span class="label">Nights:</span><span class="value">${trip.nights || 1}</span></p>
        </div>

        ${
          trip.hotel
            ? `
          <div class="hotel-info">
            <h3>Hotel Information</h3>
            <p><span class="label">Hotel Name:</span><span class="value">${trip.hotel.name}</span></p>
            <p><span class="label">Location:</span><span class="value">${trip.hotel.location}</span></p>
            ${trip.hotel.rating ? `<p><span class="label">Rating:</span><span class="value">${trip.hotel.rating}/5 (${trip.hotel.reviews} reviews)</span></p>` : ""}
          </div>
        `
            : ""
        }

        <div class="section">
          <h3>Stay Details</h3>
          <p><span class="label">Check-in:</span><span class="value">${checkInDate}</span></p>
          <p><span class="label">Check-out:</span><span class="value">${checkOutDate}</span></p>
          ${
            trip.room
              ? `
            <p><span class="label">Room Type:</span><span class="value">${trip.room.name || trip.room.type}</span></p>
            <p><span class="label">Room Details:</span><span class="value">${trip.room.details || "N/A"}</span></p>
            ${trip.room.pricePerNight ? `<p><span class="label">Price per Night:</span><span class="value">₹${trip.room.pricePerNight.toLocaleString()}</span></p>` : ""}
          `
              : ""
          }
        </div>

        ${
          trip.guest
            ? `
          <div class="section">
            <h3>Guest Information</h3>
            <p><span class="label">Name:</span><span class="value">${trip.guest.firstName} ${trip.guest.lastName}</span></p>
            <p><span class="label">Email:</span><span class="value">${trip.guest.email}</span></p>
            <p><span class="label">Phone:</span><span class="value">${trip.guest.phone}</span></p>
          </div>
        `
            : ""
        }

        ${
          trip.paymentMethod || trip.paymentStatus
            ? `
          <div class="section">
            <h3>Payment Information</h3>
            ${trip.paymentMethod ? `<p><span class="label">Payment Method:</span><span class="value">${trip.paymentMethod}</span></p>` : ""}
            ${trip.paymentStatus ? `<p><span class="label">Payment Status:</span><span class="value">${trip.paymentStatus}</span></p>` : ""}
            ${trip.cancellation ? `<p><span class="label">Cancellation Policy:</span><span class="value">${trip.cancellation}</span></p>` : ""}
          </div>
        `
            : ""
        }
      `;
    }
  };

  const generateDownloadContent = (trip: Trip): string => {
    const bookingDate = formatDate(trip.bookingDate);

    if (trip.bookingType === "flight") {
      return `FLIGHT BOOKING CONFIRMATION
faredown.com

========================================
BOOKING DETAILS
========================================
Booking Reference: ${trip.id}
Booking Date: ${bookingDate}
Total Amount: ₹${trip.total?.toLocaleString() || "N/A"}
Number of Passengers: ${trip.passengers?.length || 1}

========================================
FLIGHT INFORMATION
========================================
${
  trip.flights
    ?.map(
      (flight: any, index: number) => `
Flight ${index + 1}:
  Route: ${flight.from} → ${flight.to}
  Airline: ${flight.airline} ${flight.flightNumber}
  Date: ${flight.date}
  Time: ${flight.time}
  ${flight.departure ? `Departure: ${flight.departure}` : ""}
  ${flight.arrival ? `Arrival: ${flight.arrival}` : ""}
`,
    )
    .join("\n") || "Flight details not available"
}

========================================
PASSENGER INFORMATION
========================================
${
  trip.passengers
    ?.map(
      (passenger: any, index: number) => `
Passenger ${index + 1}:
  Name: ${passenger.firstName} ${passenger.lastName}
  Type: ${passenger.type || "Adult"}
  ${passenger.email ? `Email: ${passenger.email}` : ""}
`,
    )
    .join("\n") || "Passenger details not available"
}

========================================
IMPORTANT INFORMATION
========================================
- Please arrive at the airport at least 2 hours before domestic flights and 3 hours before international flights
- Carry a valid government-issued photo ID
- Check baggage allowances with your airline
- Keep this booking confirmation for your records

For support, contact: support@faredown.com
Website: https://faredown.com

Thank you for choosing Faredown!
`;
    } else {
      const checkInDate = trip.checkIn ? formatDate(trip.checkIn) : "N/A";
      const checkOutDate = trip.checkOut ? formatDate(trip.checkOut) : "N/A";

      return `HOTEL BOOKING CONFIRMATION
faredown.com

========================================
BOOKING DETAILS
========================================
Booking Reference: ${trip.id}
Booking Date: ${bookingDate}
Total Amount: ₹${trip.total?.toLocaleString() || "N/A"}
Number of Guests: ${trip.guests || 1}
Number of Nights: ${trip.nights || 1}

========================================
HOTEL INFORMATION
========================================
${
  trip.hotel
    ? `Hotel Name: ${trip.hotel.name}
Location: ${trip.hotel.location}
${trip.hotel.rating ? `Rating: ${trip.hotel.rating}/5 (${trip.hotel.reviews} reviews)` : ""}`
    : "Hotel details not available"
}

========================================
STAY DETAILS
========================================
Check-in Date: ${checkInDate}
Check-out Date: ${checkOutDate}
${
  trip.room
    ? `Room Type: ${trip.room.name || trip.room.type}
Room Details: ${trip.room.details || "N/A"}
${trip.room.pricePerNight ? `Price per Night: ₹${trip.room.pricePerNight.toLocaleString()}` : ""}`
    : "Room details not available"
}

========================================
GUEST INFORMATION
========================================
${
  trip.guest
    ? `Name: ${trip.guest.firstName} ${trip.guest.lastName}
Email: ${trip.guest.email}
Phone: ${trip.guest.phone}`
    : "Guest details not available"
}

========================================
PAYMENT INFORMATION
========================================
${trip.paymentMethod ? `Payment Method: ${trip.paymentMethod}` : ""}
${trip.paymentStatus ? `Payment Status: ${trip.paymentStatus}` : ""}
${trip.cancellation ? `Cancellation Policy: ${trip.cancellation}` : ""}

========================================
IMPORTANT INFORMATION
========================================
- Please carry a valid government-issued photo ID for check-in
- Check-in time is usually 2:00 PM and check-out time is usually 12:00 PM
- Contact the hotel directly for any special requests
- Keep this booking confirmation for your records

For support, contact: support@faredown.com
Website: https://faredown.com

Thank you for choosing Faredown!
`;
    }
  };

  const TripCard = ({ trip }: { trip: Trip }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center">
          {trip.bookingType === "flight" ? (
            <Plane className="w-5 h-5 text-blue-600 mr-2" />
          ) : trip.bookingType === "hotel" ? (
            <Hotel className="w-5 h-5 text-green-600 mr-2" />
          ) : trip.bookingType === "sightseeing" ? (
            <svg
              className="w-5 h-5 text-purple-600 mr-2"
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
          ) : (
            <svg
              className="w-5 h-5 text-emerald-600 mr-2"
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
          )}
          <div>
            <h3 className="font-semibold text-gray-900">
              {trip.bookingType === "flight"
                ? "Flight Booking"
                : trip.bookingType === "hotel"
                  ? "Hotel Booking"
                  : trip.bookingType === "sightseeing"
                    ? "Sightseeing Booking"
                    : "Transfer Booking"}
            </h3>
            <p className="text-sm text-gray-500">Booking ID: {trip.id}</p>
          </div>
        </div>
        <Badge
          variant={trip.bookingType === "flight" ? "default" : "secondary"}
        >
          {trip.bookingType === "flight"
            ? "Flight"
            : trip.bookingType === "hotel"
              ? "Hotel"
              : trip.bookingType === "sightseeing"
                ? "Sightseeing"
                : "Transfer"}
        </Badge>
      </div>

      {trip.bookingType === "flight" ? (
        // Flight Trip Details
        <div className="space-y-3">
          {trip.flights && trip.flights.length > 0 && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <div className="text-sm">
                  <p className="font-medium">
                    {trip.flights[0].from} → {trip.flights[0].to}
                  </p>
                  <p className="text-gray-600">
                    {trip.flights[0].airline} {trip.flights[0].flightNumber}
                  </p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-medium">{trip.flights[0].date}</p>
                  <p className="text-gray-600">{trip.flights[0].time}</p>
                </div>
              </div>
              {trip.flights.length > 1 && (
                <div className="mt-2 pt-2 border-t border-blue-200">
                  <div className="flex justify-between items-center">
                    <div className="text-sm">
                      <p className="font-medium">
                        {trip.flights[1].from} → {trip.flights[1].to}
                      </p>
                      <p className="text-gray-600">
                        {trip.flights[1].airline} {trip.flights[1].flightNumber}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-medium">{trip.flights[1].date}</p>
                      <p className="text-gray-600">{trip.flights[1].time}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="flex items-center text-sm text-gray-600">
            <Users className="w-4 h-4 mr-1" />
            {trip.passengers?.length || 1} Passenger(s)
          </div>
        </div>
      ) : trip.bookingType === "sightseeing" ? (
        // Sightseeing Trip Details
        <div className="space-y-3">
          <div className="bg-purple-50 p-3 rounded-lg">
            <h4 className="font-medium text-gray-900">
              {trip.name || "Sightseeing Experience"}
            </h4>
            <div className="flex items-start mt-1">
              <MapPin className="w-4 h-4 text-gray-500 mr-1 mt-0.5" />
              <p className="text-sm text-gray-600">
                {trip.location || "Location not specified"}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-600">
              <CalendarDays className="w-4 h-4 mr-1" />
              {trip.visitDate
                ? formatDate(trip.visitDate)
                : "Date not available"}
            </div>
            <div className="flex items-center text-gray-600">
              <Clock className="w-4 h-4 mr-1" />
              {trip.time || "Time not specified"}
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-600">
              <Users className="w-4 h-4 mr-1" />
              {trip.guests || 1} Guest(s)
            </div>
            <div className="flex items-center text-gray-600">
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                {trip.duration || "Duration varies"}
              </span>
            </div>
          </div>
        </div>
      ) : trip.bookingType === "transfer" ? (
        // Transfer Trip Details
        <div className="space-y-3">
          <div className="bg-emerald-50 p-3 rounded-lg">
            <h4 className="font-medium text-gray-900">
              {trip.service || "Transfer Service"}
            </h4>
            <div className="flex items-start mt-1">
              <MapPin className="w-4 h-4 text-gray-500 mr-1 mt-0.5" />
              <p className="text-sm text-gray-600">
                {trip.route || "Route not specified"}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-600">
              <CalendarDays className="w-4 h-4 mr-1" />
              {trip.pickupDate
                ? formatDate(trip.pickupDate)
                : "Date not available"}
            </div>
            <div className="flex items-center text-gray-600">
              <Clock className="w-4 h-4 mr-1" />
              {trip.pickupTime || "Time not specified"}
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-600">
              <Users className="w-4 h-4 mr-1" />
              {trip.passengers || 1} Passenger(s)
            </div>
            <div className="flex items-center text-gray-600">
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                {trip.vehicle || "Vehicle not specified"}
              </span>
            </div>
          </div>
        </div>
      ) : (
        // Hotel Trip Details
        <div className="space-y-3">
          {trip.hotel && (
            <div className="bg-green-50 p-3 rounded-lg">
              <h4 className="font-medium text-gray-900">{trip.hotel.name}</h4>
              <div className="flex items-start mt-1">
                <MapPin className="w-4 h-4 text-gray-500 mr-1 mt-0.5" />
                <p className="text-sm text-gray-600">{trip.hotel.location}</p>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-600">
              <CalendarDays className="w-4 h-4 mr-1" />
              {trip.checkIn && trip.checkOut
                ? `${formatDate(trip.checkIn)} - ${formatDate(trip.checkOut)}`
                : "Dates not available"}
            </div>
            <div className="flex items-center text-gray-600">
              <Clock className="w-4 h-4 mr-1" />
              {trip.nights || 1} Night(s)
            </div>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Users className="w-4 h-4 mr-1" />
            {trip.guests || 1} Guest(s)
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
        <div>
          <p className="text-sm text-gray-500">Total Amount</p>
          <p className="text-lg font-bold text-gray-900">
            ��{trip.total?.toLocaleString() || "N/A"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleViewDetails(trip)}
          >
            <Eye className="w-4 h-4 mr-1" />
            View Details
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDownload(trip)}
          >
            <Download className="w-4 h-4 mr-1" />
            Download
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">View and manage all your bookings</p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by booking ID, hotel name, airline, passenger name, dates, amount..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto">
              <Button
                onClick={() => setFilterType("all")}
                variant={filterType === "all" ? "default" : "outline"}
                size="sm"
              >
                <Filter className="w-4 h-4 mr-1" />
                All
              </Button>
              <Button
                onClick={() => setFilterType("flight")}
                variant={filterType === "flight" ? "default" : "outline"}
                size="sm"
              >
                <Plane className="w-4 h-4 mr-1" />
                Flights
              </Button>
              <Button
                onClick={() => setFilterType("hotel")}
                variant={filterType === "hotel" ? "default" : "outline"}
                size="sm"
              >
                <Hotel className="w-4 h-4 mr-1" />
                Hotels
              </Button>
              <Button
                onClick={() => setFilterType("sightseeing")}
                variant={filterType === "sightseeing" ? "default" : "outline"}
                size="sm"
              >
                <svg
                  className="w-4 h-4 mr-1"
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
                Sightseeing
              </Button>
              <Button
                onClick={() => setFilterType("transfer")}
                variant={filterType === "transfer" ? "default" : "outline"}
                size="sm"
              >
                <svg
                  className="w-4 h-4 mr-1"
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
                Transfers
              </Button>
            </div>
          </div>
        </div>

        {/* Trips List */}
        {filteredTrips.length > 0 ? (
          <div className="grid gap-6">
            {filteredTrips.map((trip, index) => (
              <TripCard key={`${trip.id}-${index}`} trip={trip} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {filterType === "all" ? (
                <CalendarDays className="w-8 h-8 text-gray-400" />
              ) : filterType === "flight" ? (
                <Plane className="w-8 h-8 text-gray-400" />
              ) : (
                <Hotel className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm
                ? "No trips found"
                : `No ${filterType === "all" ? "" : filterType} trips yet`}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? "Try adjusting your search criteria"
                : `When you book ${filterType === "all" ? "flights or hotels" : `a ${filterType}`}, they'll appear here.`}
            </p>
            <div className="flex gap-3 justify-center">
              <Link to="/flights">
                <Button className="bg-blue-700 hover:bg-blue-800">
                  <Plane className="w-4 h-4 mr-2" />
                  Book a Flight
                </Button>
              </Link>
              <Link to="/hotels">
                <Button variant="outline">
                  <Hotel className="w-4 h-4 mr-2" />
                  Book a Hotel
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
