const express = require("express");
const axios = require("axios");
const crypto = require("crypto");
const db = require("../database/connection");
const router = express.Router();

// Amadeus API Configuration
const AMADEUS_API_KEY =
  process.env.AMADEUS_API_KEY || "6H8SAsHAPdGAlWFYWNKgxQetHgeGCeNv";
const AMADEUS_API_SECRET = process.env.AMADEUS_API_SECRET || "2eVYfPeZVxmvbjRm";
const AMADEUS_BASE_URL = "https://test.api.amadeus.com";

// Cache for access tokens
let amadeusAccessToken = "";
let tokenExpiryTime = 0;

/**
 * Get Amadeus Access Token with caching
 */
async function getAmadeusAccessToken() {
  // Check if token is still valid (with 5 minute buffer)
  if (amadeusAccessToken && Date.now() < tokenExpiryTime - 300000) {
    return amadeusAccessToken;
  }

  try {
    console.log("🔑 Getting new Amadeus access token...");

    const formData = new URLSearchParams();
    formData.append("grant_type", "client_credentials");
    formData.append("client_id", AMADEUS_API_KEY);
    formData.append("client_secret", AMADEUS_API_SECRET);

    const response = await axios.post(
      `${AMADEUS_BASE_URL}/v1/security/oauth2/token`,
      formData.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        timeout: 10000,
      },
    );

    if (response.data && response.data.access_token) {
      amadeusAccessToken = response.data.access_token;
      tokenExpiryTime = Date.now() + response.data.expires_in * 1000;
      console.log("✅ Amadeus token acquired successfully");
      return amadeusAccessToken;
    } else {
      throw new Error("No access token in response");
    }
  } catch (error) {
    console.error("❌ Amadeus authentication failed:", error.message);
    throw new Error("Failed to authenticate with Amadeus API");
  }
}

/**
 * Get markup for airline and route combination
 */
async function getMarkupData(airline, route, cabinClass) {
  try {
    const query = `
      SELECT markup_percentage, markup_type, base_markup 
      FROM airline_markups 
      WHERE airline_code = $1 
      AND (route = $2 OR route = 'ALL') 
      AND cabin_class = $3 
      ORDER BY route DESC 
      LIMIT 1
    `;

    const result = await db.query(query, [airline, route, cabinClass]);

    if (result.rows && result.rows.length > 0) {
      return result.rows[0];
    }

    // Default markup if none found
    return {
      markup_percentage: 15.0,
      markup_type: "percentage",
      base_markup: 0,
    };
  } catch (error) {
    console.error("Error getting markup data:", error);
    return {
      markup_percentage: 15.0,
      markup_type: "percentage",
      base_markup: 0,
    };
  }
}

/**
 * Apply markup to flight price
 */
function applyMarkup(basePrice, markupData) {
  const { markup_percentage, markup_type, base_markup } = markupData;

  if (markup_type === "percentage") {
    return basePrice * (1 + markup_percentage / 100);
  } else if (markup_type === "fixed") {
    return basePrice + base_markup;
  }

  return basePrice;
}

/**
 * Apply promo code discount
 */
async function applyPromoCode(price, promoCode, userId = null) {
  if (!promoCode)
    return { finalPrice: price, discount: 0, promoApplied: false };

  try {
    const query = `
      SELECT * FROM promo_codes 
      WHERE code = $1 
      AND is_active = true 
      AND (expiry_date IS NULL OR expiry_date > NOW())
      AND (usage_limit IS NULL OR usage_count < usage_limit)
    `;

    const result = await db.query(query, [promoCode]);

    if (result.rows && result.rows.length > 0) {
      const promo = result.rows[0];
      let discount = 0;

      if (promo.discount_type === "percentage") {
        discount = price * (promo.discount_value / 100);
        if (promo.max_discount && discount > promo.max_discount) {
          discount = promo.max_discount;
        }
      } else if (promo.discount_type === "fixed") {
        discount = promo.discount_value;
      }

      // Check minimum order value
      if (promo.min_order_value && price < promo.min_order_value) {
        return {
          finalPrice: price,
          discount: 0,
          promoApplied: false,
          error: "Minimum order value not met",
        };
      }

      const finalPrice = Math.max(0, price - discount);

      // Update usage count
      await db.query(
        "UPDATE promo_codes SET usage_count = usage_count + 1 WHERE id = $1",
        [promo.id],
      );

      return { finalPrice, discount, promoApplied: true, promoDetails: promo };
    }

    return {
      finalPrice: price,
      discount: 0,
      promoApplied: false,
      error: "Invalid promo code",
    };
  } catch (error) {
    console.error("Error applying promo code:", error);
    return {
      finalPrice: price,
      discount: 0,
      promoApplied: false,
      error: "Promo code application failed",
    };
  }
}

/**
 * Transform Amadeus flight data to our format with markup applied
 */
async function transformAmadeusFlightData(amadeusData, searchParams) {
  const flights = amadeusData.data || [];

  const transformedFlights = await Promise.all(
    flights.map(async (flight, index) => {
      const outbound = flight.itineraries[0];
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
      const airlineName = getAirlineName(airlineCode);

      // Calculate stops
      const stops = outbound.segments.length - 1;

      // Get base price from Amadeus
      const basePrice = parseFloat(flight.price.total);
      const currency = flight.price.currency;

      // Get markup data
      const route = `${firstSegment.departure.iataCode}-${lastSegment.arrival.iataCode}`;
      const cabinClass = searchParams.cabinClass || "ECONOMY";
      const markupData = await getMarkupData(airlineCode, route, cabinClass);

      // Apply markup
      const markedUpPrice = applyMarkup(basePrice, markupData);

      // Apply promo code if provided
      const promoResult = await applyPromoCode(
        markedUpPrice,
        searchParams.promoCode,
        searchParams.userId,
      );

      const transformedFlight = {
        id: `amadeus_${flight.id || index}`,
        airline: airlineName,
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
          amount: promoResult.finalPrice,
          originalAmount: basePrice,
          markedUpAmount: markedUpPrice,
          currency: currency,
          breakdown: {
            baseFare: basePrice * 0.8,
            taxes: basePrice * 0.15,
            fees: basePrice * 0.05,
            markup: markedUpPrice - basePrice,
            discount: promoResult.discount,
            total: promoResult.finalPrice,
          },
          markupApplied: markupData,
          promoApplied: promoResult.promoApplied,
          promoDetails: promoResult.promoDetails,
        },
        amenities: getAmenities(airlineCode),
        baggage: getBaggageInfo(airlineCode),
        segments: outbound.segments.map((segment) => ({
          departure: segment.departure,
          arrival: segment.arrival,
          carrierCode: segment.carrierCode,
          number: segment.number,
          aircraft: segment.aircraft,
          duration: segment.duration,
        })),
        // Add return flight for round-trip
        returnFlight: flight.itineraries[1]
          ? {
              segments: flight.itineraries[1].segments,
              duration: flight.itineraries[1].duration,
            }
          : null,
        validatingAirline: flight.validatingAirlineCodes?.[0] || airlineCode,
        lastTicketingDate: flight.lastTicketingDate,
        fareType: determineFareType(flight),
        bookingClass:
          firstSegment.travelerPricings?.[0]?.fareDetailsBySegment?.[0]
            ?.class || "Y",
      };

      return transformedFlight;
    }),
  );

  return transformedFlights;
}

/**
 * Save search to database
 */
async function saveSearchToDatabase(searchParams, results) {
  try {
    const searchQuery = `
      INSERT INTO flight_searches_cache (
        origin, destination, departure_date, return_date, 
        adults, children, cabin_class, trip_type, 
        search_date, results_count, cached_results
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), $9, $10)
      RETURNING id
    `;

    const searchValues = [
      searchParams.origin,
      searchParams.destination,
      searchParams.departureDate,
      searchParams.returnDate,
      searchParams.adults,
      searchParams.children || 0,
      searchParams.cabinClass || "ECONOMY",
      searchParams.tripType || "one_way",
      results.length,
      JSON.stringify(results),
    ];

    const result = await db.query(searchQuery, searchValues);
    console.log(`💾 Search saved to database with ID: ${result.rows[0].id}`);

    return result.rows[0].id;
  } catch (error) {
    console.error("Error saving search to database:", error);
    return null;
  }
}

/**
 * Flight Search Route - Main API Endpoint
 */
router.get("/search", async (req, res) => {
  try {
    console.log("🔍 Flight search request received:", req.query);

    const {
      origin,
      destination,
      departureDate,
      returnDate,
      adults = 1,
      children = 0,
      cabinClass = "ECONOMY",
      tripType = "one_way",
      promoCode,
      userId,
    } = req.query;

    // Validate required parameters
    if (!origin || !destination || !departureDate) {
      return res.status(400).json({
        success: false,
        error:
          "Missing required parameters: origin, destination, departureDate",
      });
    }

    // Get Amadeus access token
    const accessToken = await getAmadeusAccessToken();

    // Build Amadeus API request
    const amadeusParams = {
      originLocationCode: origin,
      destinationLocationCode: destination,
      departureDate: departureDate,
      adults: parseInt(adults),
      travelClass: cabinClass,
      nonStop: false,
      max: 50, // Get more results for better selection
    };

    // Add return date for round trip
    if (tripType === "round_trip" && returnDate) {
      amadeusParams.returnDate = returnDate;
    }

    // Add children if specified
    if (children && parseInt(children) > 0) {
      amadeusParams.children = parseInt(children);
    }

    console.log("���� Calling Amadeus API with params:", amadeusParams);

    // Call Amadeus Flight Offers Search API
    const amadeusResponse = await axios.get(
      `${AMADEUS_BASE_URL}/v2/shopping/flight-offers`,
      {
        params: amadeusParams,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      },
    );

    console.log(
      `✅ Amadeus API returned ${amadeusResponse.data?.data?.length || 0} flight offers`,
    );

    // Transform Amadeus data to our format with markup and promo codes
    const searchParams = { ...req.query, cabinClass, tripType };
    const transformedFlights = await transformAmadeusFlightData(
      amadeusResponse.data,
      searchParams,
    );

    // Save search to database
    await saveSearchToDatabase(searchParams, transformedFlights);

    // Return results
    res.json({
      success: true,
      data: transformedFlights,
      meta: {
        totalResults: transformedFlights.length,
        searchParams: searchParams,
        source: "amadeus_live",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ Flight search error:", error.message);

    // Return fallback data on API failure
    const fallbackFlights = getFallbackFlightData(req.query);

    res.json({
      success: true,
      data: fallbackFlights,
      meta: {
        totalResults: fallbackFlights.length,
        searchParams: req.query,
        source: "fallback",
        warning: "Live API unavailable, showing sample data",
        timestamp: new Date().toISOString(),
      },
    });
  }
});

/**
 * Utility Functions
 */
function getAirlineName(code) {
  const airlines = {
    EK: "Emirates",
    QR: "Qatar Airways",
    EY: "Etihad Airways",
    AI: "Air India",
    "6E": "IndiGo",
    UK: "Vistara",
    SG: "SpiceJet",
    LH: "Lufthansa",
    BA: "British Airways",
    AF: "Air France",
    KL: "KLM",
    TK: "Turkish Airlines",
    SQ: "Singapore Airlines",
    CX: "Cathay Pacific",
    JL: "Japan Airlines",
    AA: "American Airlines",
    DL: "Delta Air Lines",
    UA: "United Airlines",
  };
  return airlines[code] || `${code} Airlines`;
}

function getAirportName(code) {
  const airports = {
    BOM: "Chhatrapati Shivaji Maharaj International Airport",
    DEL: "Indira Gandhi International Airport",
    BLR: "Kempegowda International Airport",
    MAA: "Chennai International Airport",
    HYD: "Rajiv Gandhi International Airport",
    CCU: "Netaji Subhas Chandra Bose International Airport",
    DXB: "Dubai International Airport",
    DOH: "Hamad International Airport",
    AUH: "Abu Dhabi International Airport",
    LHR: "London Heathrow Airport",
    FRA: "Frankfurt Airport",
    CDG: "Charles de Gaulle Airport",
    AMS: "Amsterdam Schiphol Airport",
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

function getCityName(code) {
  const cities = {
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

function getCountryName(code) {
  const countries = {
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

function formatTime(dateTimeString) {
  const date = new Date(dateTimeString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function getAmenities(airlineCode) {
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

function getBaggageInfo(airlineCode) {
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

function determineFareType(flight) {
  const priceBreakdown = flight.travelerPricings?.[0]?.price;
  if (!priceBreakdown) return "ECONOMY";

  // Simple logic to determine fare type based on price and cabin
  const basePrice = parseFloat(priceBreakdown.base);
  if (basePrice > 100000) return "BUSINESS";
  if (basePrice > 50000) return "PREMIUM_ECONOMY";
  return "ECONOMY";
}

function getFallbackFlightData(searchParams) {
  // Return sample flight data when API is unavailable
  return [
    {
      id: "fallback_1",
      airline: "Emirates",
      airlineCode: "EK",
      flightNumber: "EK 506",
      departure: {
        code: searchParams.origin || "BOM",
        name: getAirportName(searchParams.origin || "BOM"),
        city: getCityName(searchParams.origin || "BOM"),
        country: getCountryName(searchParams.origin || "BOM"),
      },
      arrival: {
        code: searchParams.destination || "DXB",
        name: getAirportName(searchParams.destination || "DXB"),
        city: getCityName(searchParams.destination || "DXB"),
        country: getCountryName(searchParams.destination || "DXB"),
      },
      departureTime: "14:30",
      arrivalTime: "17:45",
      duration: "3h 15m",
      aircraft: "B777",
      stops: 0,
      price: {
        amount: 45000,
        currency: "INR",
        breakdown: {
          baseFare: 38000,
          taxes: 5500,
          fees: 1500,
          total: 45000,
        },
      },
      amenities: ["WiFi", "Entertainment System", "Premium Meals"],
      baggage: getBaggageInfo("EK"),
    },
  ];
}

module.exports = router;
