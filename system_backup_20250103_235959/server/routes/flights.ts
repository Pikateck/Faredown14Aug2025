import { Router } from "express";
import fetch from "node-fetch";
import flightBookingService from "../services/flightBookingService";

const router = Router();

// Amadeus API Configuration
const AMADEUS_API_KEY =
  process.env.AMADEUS_API_KEY || "6H8SAsHAPdGAlWFYWNKgxQetHgeGCeNv";
const AMADEUS_API_SECRET = process.env.AMADEUS_API_SECRET || "2eVYfPeZVxmvbjRm";
const AMADEUS_BASE_URL = "https://test.api.amadeus.com";

// Get access token for Amadeus API
async function getAmadeusAccessToken(): Promise<string> {
  const formData = new URLSearchParams();
  formData.append("grant_type", "client_credentials");
  formData.append("client_id", AMADEUS_API_KEY);
  formData.append("client_secret", AMADEUS_API_SECRET);

  const response = await fetch(`${AMADEUS_BASE_URL}/v1/security/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  });

  if (!response.ok) {
    throw new Error("Failed to get Amadeus access token");
  }

  const data = await response.json();
  return data.access_token;
}

// Transform Amadeus flight data to our format
function transformAmadeusFlightData(amadeusData: any): any {
  const flights = amadeusData.data || [];

  return flights.map((flight: any, index: number) => {
    const outbound = flight.itineraries[0];
    const inbound = flight.itineraries[1]; // Return flight for round-trip

    const firstSegment = outbound.segments[0];
    const lastSegment = outbound.segments[outbound.segments.length - 1];

    // Calculate duration
    const duration =
      outbound.duration
        ?.replace("PT", "")
        ?.replace("H", "h ")
        ?.replace("M", "m") || "2h 30m";

    // Get airline info
    const airlineCode = firstSegment.carrierCode;

    // Calculate stops
    const stops = outbound.segments.length - 1;

    // Get price
    const totalPrice = parseFloat(flight.price.total);
    const currency = flight.price.currency;

    const transformedFlight: any = {
      id: `amadeus_${flight.id || index}`,
      airline: getAirlineName(airlineCode),
      airlineCode: airlineCode,
      flightNumber: `${airlineCode} ${firstSegment.number}`,
      departure: {
        code: firstSegment.departure.iataCode,
        name: getAirportName(firstSegment.departure.iataCode),
        city: getCityName(firstSegment.departure.iataCode),
        country: getCountryName(firstSegment.departure.iataCode),
        terminal: firstSegment.departure.terminal,
      },
      arrival: {
        code: lastSegment.arrival.iataCode,
        name: getAirportName(lastSegment.arrival.iataCode),
        city: getCityName(lastSegment.arrival.iataCode),
        country: getCountryName(lastSegment.arrival.iataCode),
        terminal: lastSegment.arrival.terminal,
      },
      departureTime: formatTime(firstSegment.departure.at),
      arrivalTime: formatTime(lastSegment.arrival.at),
      duration: duration,
      aircraft: firstSegment.aircraft?.code || "Unknown",
      stops: stops,
      price: {
        amount: totalPrice,
        currency: currency,
        breakdown: {
          baseFare: totalPrice * 0.8, // Estimate
          taxes: totalPrice * 0.15, // Estimate
          fees: totalPrice * 0.05, // Estimate
          total: totalPrice,
        },
      },
      amenities: getAmenities(airlineCode),
      baggage: getBaggageInfo(airlineCode),
      segments: outbound.segments.map((segment: any) => ({
        departure: {
          code: segment.departure.iataCode,
          time: formatTime(segment.departure.at),
          terminal: segment.departure.terminal,
        },
        arrival: {
          code: segment.arrival.iataCode,
          time: formatTime(segment.arrival.at),
          terminal: segment.arrival.terminal,
        },
        airline: getAirlineName(segment.carrierCode),
        flightNumber: `${segment.carrierCode} ${segment.number}`,
        aircraft: segment.aircraft?.code || "Unknown",
        duration:
          segment.duration
            ?.replace("PT", "")
            .replace("H", "h ")
            .replace("M", "m") || "Unknown",
      })),
      fareClass:
        flight.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin ||
        "ECONOMY",
      validatingAirlineCode: flight.validatingAirlineCodes?.[0] || airlineCode,
      amadeusData: flight, // Store original data for booking
    };

    // Add return flight information if available (round-trip)
    if (inbound && inbound.segments && inbound.segments.length > 0) {
      const returnFirstSegment = inbound.segments[0];
      const returnLastSegment = inbound.segments[inbound.segments.length - 1];
      const returnDuration =
        inbound.duration
          ?.replace("PT", "")
          ?.replace("H", "h ")
          ?.replace("M", "m") || "2h 30m";

      transformedFlight.returnDepartureTime = formatTime(
        returnFirstSegment.departure.at,
      );
      transformedFlight.returnArrivalTime = formatTime(
        returnLastSegment.arrival.at,
      );
      transformedFlight.returnDuration = returnDuration;
      transformedFlight.returnAirline = getAirlineName(
        returnFirstSegment.carrierCode,
      );
      transformedFlight.returnFlightNumber = `${returnFirstSegment.carrierCode} ${returnFirstSegment.number}`;
      transformedFlight.returnAircraft =
        returnFirstSegment.aircraft?.code || "Unknown";
      transformedFlight.returnStops = inbound.segments.length - 1;
    }

    return transformedFlight;
  });
}

// Helper functions
function getAirlineName(code: string): string {
  const airlines: Record<string, string> = {
    EK: "Emirates",
    AI: "Air India",
    "6E": "IndiGo",
    SG: "SpiceJet",
    UK: "Vistara",
    "9W": "Jet Airways",
    G8: "Go First",
    QR: "Qatar Airways",
    EY: "Etihad Airways",
    LH: "Lufthansa",
    BA: "British Airways",
    AF: "Air France",
    KL: "KLM",
    TK: "Turkish Airlines",
    SQ: "Singapore Airlines",
    CX: "Cathay Pacific",
    QF: "Qantas",
    UA: "United Airlines",
    DL: "Delta Air Lines",
    AA: "American Airlines",
  };
  return airlines[code] || code;
}

function getAirportName(code: string): string {
  const airports: Record<string, string> = {
    BOM: "Chhatrapati Shivaji Maharaj International Airport",
    DEL: "Indira Gandhi International Airport",
    BLR: "Kempegowda International Airport",
    MAA: "Chennai International Airport",
    HYD: "Rajiv Gandhi International Airport",
    CCU: "Netaji Subhash Chandra Bose International Airport",
    DXB: "Dubai International Airport",
    DOH: "Hamad International Airport",
    AUH: "Abu Dhabi International Airport",
    LHR: "Heathrow Airport",
    FRA: "Frankfurt Airport",
    CDG: "Charles de Gaulle Airport",
    AMS: "Amsterdam Airport Schiphol",
    IST: "Istanbul Airport",
    SIN: "Singapore Changi Airport",
    HKG: "Hong Kong International Airport",
    SYD: "Sydney Kingsford Smith Airport",
    LAX: "Los Angeles International Airport",
    JFK: "John F. Kennedy International Airport",
    ORD: "O'Hare International Airport",
  };
  return airports[code] || `${code} Airport`;
}

function getCityName(code: string): string {
  const cities: Record<string, string> = {
    BOM: "Mumbai",
    DEL: "New Delhi",
    BLR: "Bangalore",
    MAA: "Chennai",
    HYD: "Hyderabad",
    CCU: "Kolkata",
    DXB: "Dubai",
    DOH: "Doha",
    AUH: "Abu Dhabi",
    LHR: "London",
    FRA: "Frankfurt",
    CDG: "Paris",
    AMS: "Amsterdam",
    IST: "Istanbul",
    SIN: "Singapore",
    HKG: "Hong Kong",
    SYD: "Sydney",
    LAX: "Los Angeles",
    JFK: "New York",
    ORD: "Chicago",
  };
  return cities[code] || code;
}

function getCountryName(code: string): string {
  const countries: Record<string, string> = {
    BOM: "India",
    DEL: "India",
    BLR: "India",
    MAA: "India",
    HYD: "India",
    CCU: "India",
    DXB: "UAE",
    AUH: "UAE",
    DOH: "Qatar",
    LHR: "United Kingdom",
    FRA: "Germany",
    CDG: "France",
    AMS: "Netherlands",
    IST: "Turkey",
    SIN: "Singapore",
    HKG: "Hong Kong",
    SYD: "Australia",
    LAX: "United States",
    JFK: "United States",
    ORD: "United States",
  };
  return countries[code] || "Unknown";
}

function formatTime(dateTimeString: string): string {
  const date = new Date(dateTimeString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function getAmenities(airlineCode: string): string[] {
  const premiumAirlines = ["EK", "QR", "EY", "LH", "BA", "AF", "SQ", "CX"];
  const basicAmenities = ["Seat Selection", "Onboard Refreshments"];
  const premiumAmenities = [
    "WiFi",
    "Entertainment System",
    "Premium Meals",
    "Lounge Access",
  ];

  return premiumAirlines.includes(airlineCode)
    ? [...basicAmenities, ...premiumAmenities]
    : basicAmenities;
}

function getBaggageInfo(airlineCode: string): any {
  return {
    carryOn: {
      weight: "7kg",
      dimensions: "55x40x20cm",
      included: true,
    },
    checked: {
      weight: "20kg",
      count: 1,
      fee: 0,
    },
  };
}

// Routes

// Flight search endpoint
router.get("/search", async (req, res) => {
  try {
    console.log("🔍 Flight search request:", req.query);

    const {
      origin,
      destination,
      departureDate,
      returnDate,
      adults = 1,
      children = 0,
      cabinClass = "ECONOMY",
      tripType = "one_way",
    } = req.query;

    // Prepare search parameters for caching
    const searchParams = {
      origin: origin as string,
      destination: destination as string,
      departureDate: departureDate as string,
      returnDate: returnDate as string,
      adults: parseInt(adults as string),
      children: parseInt(children as string),
      cabinClass: cabinClass as string,
      tripType: tripType as string,
      currency: "INR",
    };

    // Check cache first
    const cachedResult =
      await flightBookingService.getCachedFlightSearch(searchParams);
    if (cachedResult.success && cachedResult.cached) {
      console.log("🎯 Returning cached flight search results");
      return res.json({
        success: true,
        data: cachedResult.data,
        cached: true,
        meta: {
          total: cachedResult.data.length,
          currency: "INR",
          searchParams: req.query,
        },
      });
    }

    // Validate required parameters
    if (!origin || !destination || !departureDate) {
      return res.status(400).json({
        success: false,
        error:
          "Missing required parameters: origin, destination, departureDate",
      });
    }

    // Get access token
    const accessToken = await getAmadeusAccessToken();

    // Prepare search parameters
    const queryParams = new URLSearchParams({
      originLocationCode: origin as string,
      destinationLocationCode: destination as string,
      departureDate: (departureDate as string).split("T")[0],
      adults: adults.toString(),
      currencyCode: "INR",
      max: "50", // Limit results
    });

    // Add optional parameters
    if (returnDate && tripType === "round_trip") {
      queryParams.append("returnDate", (returnDate as string).split("T")[0]);
    }

    if (children && parseInt(children as string) > 0) {
      queryParams.append("children", children.toString());
    }

    if (cabinClass) {
      queryParams.append("travelClass", cabinClass as string);
    }

    console.log("✈️ Amadeus flight search parameters:", {
      tripType,
      params: queryParams.toString(),
    });

    // Call Amadeus API
    const response = await fetch(
      `${AMADEUS_BASE_URL}/v2/shopping/flight-offers?${queryParams}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Amadeus API Error:", response.status, errorText);
      return res.status(500).json({
        success: false,
        error: "Failed to search flights",
        details: errorText,
      });
    }

    const amadeusData = await response.json();
    console.log(
      `✅ Found ${amadeusData.data?.length || 0} flights from Amadeus`,
    );

    // Transform data to our format
    const transformedFlights = transformAmadeusFlightData(amadeusData);

    // Cache the search results in database (don't wait for it)
    flightBookingService
      .cacheFlightSearch(searchParams, transformedFlights)
      .catch((error) => {
        console.error("Failed to cache flight search results:", error);
      });

    res.json({
      success: true,
      data: transformedFlights,
      cached: false,
      meta: {
        total: transformedFlights.length,
        currency: "INR",
        searchParams: req.query,
      },
    });
  } catch (error) {
    console.error("🚨 Flight search error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
});

// Get flight details
router.get("/:flightId", async (req, res) => {
  try {
    const { flightId } = req.params;
    console.log("🔍 Getting flight details for:", flightId);

    // Try to get flight details from the booking service first
    const flightDetails = await flightBookingService.getFlightDetails(flightId);

    if (flightDetails.success && flightDetails.data) {
      console.log("✅ Found flight details in booking service");
      return res.json({
        success: true,
        data: flightDetails.data,
      });
    }

    // If not found in booking service, return mock data based on flight ID patterns
    let mockFlight;

    if (flightId.includes("emirates") || flightId.includes("EK")) {
      mockFlight = {
        id: flightId,
        airline: "Emirates",
        airlineCode: "EK",
        flightNumber: "EK 500",
        departure: {
          code: "BOM",
          name: "Chhatrapati Shivaji Maharaj International Airport",
          city: "Mumbai",
          country: "India",
          terminal: "2",
        },
        arrival: {
          code: "DXB",
          name: "Dubai International Airport",
          city: "Dubai",
          country: "UAE",
          terminal: "3",
        },
        departureTime: "10:15",
        arrivalTime: "11:45",
        duration: "3h 30m",
        aircraft: "Boeing 777-300ER",
        stops: 0,
        price: {
          amount: 25890,
          currency: "INR",
          breakdown: {
            baseFare: 20712,
            taxes: 3890,
            fees: 1288,
            total: 25890,
          },
        },
        amenities: ["WiFi", "Entertainment System", "Premium Meals", "Lounge Access"],
        baggage: {
          carryOn: {
            weight: "7kg",
            dimensions: "55x40x20cm",
            included: true,
          },
          checked: {
            weight: "25kg",
            count: 1,
            fee: 0,
          },
        },
        fareClass: "ECONOMY",
        segments: [
          {
            departure: {
              code: "BOM",
              time: "10:15",
              terminal: "2",
            },
            arrival: {
              code: "DXB",
              time: "11:45",
              terminal: "3",
            },
            airline: "Emirates",
            flightNumber: "EK 500",
            aircraft: "Boeing 777-300ER",
            duration: "3h 30m",
          },
        ],
      };
    } else if (flightId.includes("indigo") || flightId.includes("6E")) {
      mockFlight = {
        id: flightId,
        airline: "Indigo",
        airlineCode: "6E",
        flightNumber: "6E 1407",
        departure: {
          code: "BOM",
          name: "Chhatrapati Shivaji Maharaj International Airport",
          city: "Mumbai",
          country: "India",
          terminal: "2",
        },
        arrival: {
          code: "DXB",
          name: "Dubai International Airport",
          city: "Dubai",
          country: "UAE",
          terminal: "2",
        },
        departureTime: "14:30",
        arrivalTime: "16:00",
        duration: "3h 30m",
        aircraft: "Airbus A320",
        stops: 0,
        price: {
          amount: 22650,
          currency: "INR",
          breakdown: {
            baseFare: 18120,
            taxes: 3400,
            fees: 1130,
            total: 22650,
          },
        },
        amenities: ["Seat Selection", "Onboard Refreshments"],
        baggage: {
          carryOn: {
            weight: "7kg",
            dimensions: "55x40x20cm",
            included: true,
          },
          checked: {
            weight: "15kg",
            count: 1,
            fee: 0,
          },
        },
        fareClass: "ECONOMY",
        segments: [
          {
            departure: {
              code: "BOM",
              time: "14:30",
              terminal: "2",
            },
            arrival: {
              code: "DXB",
              time: "16:00",
              terminal: "2",
            },
            airline: "Indigo",
            flightNumber: "6E 1407",
            aircraft: "Airbus A320",
            duration: "3h 30m",
          },
        ],
      };
    } else {
      // Generic mock flight for unknown IDs
      mockFlight = {
        id: flightId,
        airline: "Emirates",
        airlineCode: "EK",
        flightNumber: "EK 500",
        departure: {
          code: "BOM",
          name: "Chhatrapati Shivaji Maharaj International Airport",
          city: "Mumbai",
          country: "India",
          terminal: "2",
        },
        arrival: {
          code: "DXB",
          name: "Dubai International Airport",
          city: "Dubai",
          country: "UAE",
          terminal: "3",
        },
        departureTime: "10:15",
        arrivalTime: "11:45",
        duration: "3h 30m",
        aircraft: "Boeing 777-300ER",
        stops: 0,
        price: {
          amount: 25890,
          currency: "INR",
          breakdown: {
            baseFare: 20712,
            taxes: 3890,
            fees: 1288,
            total: 25890,
          },
        },
        amenities: ["WiFi", "Entertainment System", "Premium Meals"],
        baggage: {
          carryOn: {
            weight: "7kg",
            dimensions: "55x40x20cm",
            included: true,
          },
          checked: {
            weight: "20kg",
            count: 1,
            fee: 0,
          },
        },
        fareClass: "ECONOMY",
        segments: [
          {
            departure: {
              code: "BOM",
              time: "10:15",
              terminal: "2",
            },
            arrival: {
              code: "DXB",
              time: "11:45",
              terminal: "3",
            },
            airline: "Emirates",
            flightNumber: "EK 500",
            aircraft: "Boeing 777-300ER",
            duration: "3h 30m",
          },
        ],
      };
    }

    console.log("✅ Returning mock flight details");
    res.json({
      success: true,
      data: mockFlight,
    });
  } catch (error) {
    console.error("🚨 Flight details error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get flight details",
    });
  }
});

// Airport search
router.get("/airports/search", async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || (q as string).length < 2) {
      return res.status(400).json({
        success: false,
        error: "Query must be at least 2 characters",
      });
    }

    // Get access token
    const accessToken = await getAmadeusAccessToken();

    // Search airports using Amadeus
    const response = await fetch(
      `${AMADEUS_BASE_URL}/v1/reference-data/locations?subType=AIRPORT&keyword=${encodeURIComponent(q as string)}&page%5Blimit%5D=10`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to search airports");
    }

    const data = await response.json();

    const airports = data.data.map((airport: any) => ({
      code: airport.iataCode,
      name: airport.name,
      city: airport.address?.cityName || airport.name,
      country: airport.address?.countryName || "Unknown",
    }));

    res.json({
      success: true,
      data: airports,
    });
  } catch (error) {
    console.error("🚨 Airport search error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to search airports",
    });
  }
});

// Popular destinations
router.get("/destinations/popular", async (req, res) => {
  try {
    const popularDestinations = [
      {
        code: "DXB",
        name: "Dubai International Airport",
        city: "Dubai",
        country: "UAE",
      },
      {
        code: "DOH",
        name: "Hamad International Airport",
        city: "Doha",
        country: "Qatar",
      },
      {
        code: "LHR",
        name: "Heathrow Airport",
        city: "London",
        country: "United Kingdom",
      },
      {
        code: "SIN",
        name: "Singapore Changi Airport",
        city: "Singapore",
        country: "Singapore",
      },
      {
        code: "BKK",
        name: "Suvarnabhumi Airport",
        city: "Bangkok",
        country: "Thailand",
      },
      {
        code: "KUL",
        name: "Kuala Lumpur International Airport",
        city: "Kuala Lumpur",
        country: "Malaysia",
      },
      {
        code: "HKG",
        name: "Hong Kong International Airport",
        city: "Hong Kong",
        country: "Hong Kong",
      },
      {
        code: "FRA",
        name: "Frankfurt Airport",
        city: "Frankfurt",
        country: "Germany",
      },
    ];

    res.json({
      success: true,
      data: popularDestinations,
    });
  } catch (error) {
    console.error("🚨 Popular destinations error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get popular destinations",
    });
  }
});

// Get airline information
router.get("/airlines/:airlineCode", async (req, res) => {
  try {
    const { airlineCode } = req.params;

    const airlineInfo = {
      code: airlineCode,
      name: getAirlineName(airlineCode),
      logo: `https://pics.avs.io/120/120/${airlineCode}.png`, // Aviation API for logos
      country: "Unknown", // Would need additional API call to get this
    };

    res.json({
      success: true,
      data: airlineInfo,
    });
  } catch (error) {
    console.error("🚨 Airline info error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get airline information",
    });
  }
});

// Flight booking endpoint
router.post("/book", async (req, res) => {
  try {
    console.log("✈️ Flight booking request:", req.body);

    const {
      flightId,
      passengers,
      contactInfo,
      seatSelections,
      mealPreferences,
      specialRequests,
      totalAmount,
      currency = "INR",
    } = req.body;

    // Validate required fields
    if (!flightId || !passengers || !contactInfo || !totalAmount) {
      return res.status(400).json({
        success: false,
        error: "Missing required booking information",
      });
    }

    // Prepare booking data
    const bookingData = {
      flightId,
      passengers,
      contactInfo,
      seatSelections,
      mealPreferences,
      specialRequests,
      totalAmount,
      currency,
    };

    // Create pre-booking (this holds the booking during payment)
    const preBookingResult =
      await flightBookingService.preBookFlight(bookingData);

    if (!preBookingResult.success) {
      return res.status(400).json({
        success: false,
        error: preBookingResult.error || "Failed to create pre-booking",
      });
    }

    // For demo purposes, auto-confirm the booking
    // In production, this would be done after payment confirmation
    const mockPaymentDetails = {
      paymentId: `pay_${Date.now()}`,
      orderId: `order_${Date.now()}`,
      signature: `sig_${Date.now()}`,
      amount: totalAmount,
      currency,
      method: "card",
      status: "captured",
    };

    try {
      const confirmedBooking = await flightBookingService.confirmFlightBooking(
        preBookingResult.tempBookingRef,
        mockPaymentDetails,
      );

      console.log("✅ Flight booking confirmed:", confirmedBooking.bookingRef);

      res.json({
        success: true,
        data: {
          bookingRef: confirmedBooking.bookingRef,
          booking: confirmedBooking.booking,
          confirmationNumber: `FD${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
          tickets: passengers.map((passenger: any, index: number) => ({
            ticketNumber: `TKT${Math.random().toString(36).substr(2, 10).toUpperCase()}`,
            passengerName: `${passenger.firstName} ${passenger.lastName}`,
            seatNumber: seatSelections?.[passenger.id] || `${12 + index}A`,
          })),
        },
        message: "Flight booked successfully",
      });
    } catch (confirmError) {
      console.error("❌ Flight booking confirmation failed:", confirmError);
      res.status(500).json({
        success: false,
        error: "Booking confirmation failed",
        details: confirmError.message,
      });
    }
  } catch (error) {
    console.error("🚨 Flight booking error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to book flight",
      message: error.message,
    });
  }
});

// Get booking details
router.get("/bookings/:bookingRef", async (req, res) => {
  try {
    const { bookingRef } = req.params;

    // Fetch booking from database
    const bookingResult =
      await flightBookingService.getFlightBooking(bookingRef);

    if (!bookingResult.success) {
      return res.status(404).json({
        success: false,
        error: bookingResult.error || "Booking not found",
      });
    }

    res.json({
      success: true,
      data: bookingResult.data,
    });
  } catch (error) {
    console.error("🚨 Get booking error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get booking details",
    });
  }
});

// Cancel booking
router.delete("/bookings/:bookingRef", async (req, res) => {
  try {
    const { bookingRef } = req.params;

    // In a real implementation:
    // 1. Check cancellation policy
    // 2. Call Amadeus cancellation API
    // 3. Process refund if applicable
    // 4. Update booking status in database

    console.log(`✅ Booking ${bookingRef} cancelled`);

    res.json({
      success: true,
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    console.error("🚨 Cancel booking error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to cancel booking",
    });
  }
});

// Get user bookings
router.get("/bookings", async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // In a real implementation, fetch from database with user authentication
    // For now, return sample bookings

    const bookings = [
      {
        id: "booking_1",
        bookingRef: "PNR123ABC",
        status: "confirmed",
        flight: {
          airline: "Emirates",
          flightNumber: "EK 500",
          route: "BOM → DXB",
        },
        totalPrice: {
          amount: 25000,
          currency: "INR",
        },
        createdAt: new Date().toISOString(),
      },
    ];

    res.json({
      success: true,
      data: bookings,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: bookings.length,
        pages: 1,
      },
    });
  } catch (error) {
    console.error("🚨 Get user bookings error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get bookings",
    });
  }
});

export default router;
