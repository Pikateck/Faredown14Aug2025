const express = require("express");
const axios = require("axios");
const crypto = require("crypto");
const db = require("../database/connection");
const router = express.Router();

// Hotelbeds API Configuration
const HOTELBEDS_API_KEY =
  process.env.HOTELBEDS_API_KEY || "91d2368789abdb5beec101ce95a9d185";
const HOTELBEDS_SECRET = process.env.HOTELBEDS_SECRET || "a9ffaaecce";
const HOTELBEDS_BASE_URL = "https://api.test.hotelbeds.com";

/**
 * Generate Hotelbeds API signature
 */
function generateHotelbedsSignature() {
  const timestamp = Math.floor(Date.now() / 1000);
  const stringToSign = HOTELBEDS_API_KEY + HOTELBEDS_SECRET + timestamp;
  const signature = crypto
    .createHash("sha256")
    .update(stringToSign)
    .digest("hex");

  return {
    signature,
    timestamp,
  };
}

/**
 * Get request headers for Hotelbeds API
 */
function getHotelbedsHeaders() {
  const { signature, timestamp } = generateHotelbedsSignature();

  return {
    "Api-key": HOTELBEDS_API_KEY,
    "X-Signature": signature,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

/**
 * Get markup for hotel and destination combination
 */
async function getHotelMarkupData(destination, starRating) {
  try {
    const query = `
      SELECT markup_percentage, markup_type, base_markup 
      FROM hotel_markups 
      WHERE (destination_code = $1 OR destination_code = 'ALL') 
      AND (star_rating = $2 OR star_rating = 0) 
      ORDER BY destination_code DESC, star_rating DESC 
      LIMIT 1
    `;

    const result = await db.query(query, [destination, starRating]);

    if (result.rows && result.rows.length > 0) {
      return result.rows[0];
    }

    // Default markup if none found
    return {
      markup_percentage: 20.0,
      markup_type: "percentage",
      base_markup: 0,
    };
  } catch (error) {
    console.error("Error getting hotel markup data:", error);
    return {
      markup_percentage: 20.0,
      markup_type: "percentage",
      base_markup: 0,
    };
  }
}

/**
 * Apply markup to hotel price
 */
function applyHotelMarkup(basePrice, markupData) {
  const { markup_percentage, markup_type, base_markup } = markupData;

  if (markup_type === "percentage") {
    return basePrice * (1 + markup_percentage / 100);
  } else if (markup_type === "fixed") {
    return basePrice + base_markup;
  }

  return basePrice;
}

/**
 * Apply promo code discount for hotels
 */
async function applyHotelPromoCode(price, promoCode, userId = null) {
  if (!promoCode)
    return { finalPrice: price, discount: 0, promoApplied: false };

  try {
    const query = `
      SELECT * FROM promo_codes 
      WHERE code = $1 
      AND is_active = true 
      AND (applicable_to = 'hotels' OR applicable_to = 'all')
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
    console.error("Error applying hotel promo code:", error);
    return {
      finalPrice: price,
      discount: 0,
      promoApplied: false,
      error: "Promo code application failed",
    };
  }
}

/**
 * Transform Hotelbeds hotel data to our format with markup applied
 */
async function transformHotelbedsData(hotelbedsData, searchParams) {
  const hotels = hotelbedsData.hotels || [];

  const transformedHotels = await Promise.all(
    hotels.map(async (hotel, index) => {
      // Get base price from the first available room
      const firstRoom = hotel.rooms?.[0];
      const basePrice = firstRoom
        ? parseFloat(firstRoom.rates?.[0]?.net || 0)
        : 0;
      const currency = firstRoom?.rates?.[0]?.currency || "EUR";

      // Get markup data
      const destination = searchParams.destination;
      const starRating = hotel.categoryCode || 3;
      const markupData = await getHotelMarkupData(destination, starRating);

      // Apply markup
      const markedUpPrice = applyHotelMarkup(basePrice, markupData);

      // Apply promo code if provided
      const promoResult = await applyHotelPromoCode(
        markedUpPrice,
        searchParams.promoCode,
        searchParams.userId,
      );

      const transformedHotel = {
        id: `hotelbeds_${hotel.code || index}`,
        name: hotel.name,
        description: hotel.description?.content || "",
        address: {
          street: hotel.address?.content || "",
          city: hotel.city?.content || "",
          country: hotel.country?.description || "",
          postalCode: hotel.postalCode || "",
        },
        location: {
          latitude: hotel.coordinates?.latitude || 0,
          longitude: hotel.coordinates?.longitude || 0,
          address: hotel.address?.content || "",
          city: hotel.city?.content || "",
          country: hotel.country?.description || "",
          landmarks: [],
        },
        rating: hotel.ranking || 0,
        starRating: hotel.categoryCode || 3,
        reviewCount: 0, // Hotelbeds doesn't provide review counts
        images: (hotel.images || []).map((img, imgIndex) => ({
          id: `img_${imgIndex}`,
          url: img.path,
          caption: img.type?.description || "",
          type: "exterior",
          order: imgIndex,
        })),
        amenities: (hotel.facilities || []).map((facility, facIndex) => ({
          id: `amenity_${facIndex}`,
          name: facility.description?.content || "",
          icon: "check",
          category: "general",
          available: true,
        })),
        roomTypes: (hotel.rooms || []).map((room, roomIndex) => ({
          id: `room_${roomIndex}`,
          name: room.name,
          description: room.description || "",
          occupancy: {
            maxAdults: room.paxes?.[0]?.adults || 2,
            maxChildren: room.paxes?.[0]?.children || 0,
            maxTotal:
              (room.paxes?.[0]?.adults || 2) + (room.paxes?.[0]?.children || 0),
          },
          bedTypes: [],
          amenities: [],
          images: [],
          rates:
            room.rates?.map((rate, rateIndex) => {
              const roomBasePrice = parseFloat(rate.net || 0);
              const roomMarkedUpPrice = applyHotelMarkup(
                roomBasePrice,
                markupData,
              );

              return {
                id: `rate_${rateIndex}`,
                name: rate.rateKey,
                price: {
                  amount: roomMarkedUpPrice,
                  originalAmount: roomBasePrice,
                  currency: rate.currency,
                  breakdown: {
                    baseRate: roomBasePrice,
                    taxes: 0,
                    fees: 0,
                    markup: roomMarkedUpPrice - roomBasePrice,
                    total: roomMarkedUpPrice,
                  },
                },
                cancellationPolicy: rate.cancellationPolicies?.[0] || {},
                boardType: rate.boardName || "Room Only",
                rateKey: rate.rateKey,
              };
            }) || [],
        })),
        policies: {
          checkIn: hotel.checkIn || "15:00",
          checkOut: hotel.checkOut || "11:00",
          cancellation: "Standard cancellation policy applies",
          pets: "Contact hotel for pet policy",
          children: "Children welcome",
        },
        contact: {
          phone: hotel.phones?.[0]?.phoneNumber || "",
          email: hotel.emails?.[0]?.email || "",
          website: hotel.web || "",
        },
        priceRange: {
          min: promoResult.finalPrice,
          max: promoResult.finalPrice * 2, // Estimate
          currency: currency,
        },
        // Additional pricing information
        pricing: {
          originalPrice: basePrice,
          markedUpPrice: markedUpPrice,
          finalPrice: promoResult.finalPrice,
          discount: promoResult.discount,
          markupApplied: markupData,
          promoApplied: promoResult.promoApplied,
          promoDetails: promoResult.promoDetails,
        },
        hotelbedsCode: hotel.code,
        hotelbedsData: hotel, // Store original data for booking
      };

      return transformedHotel;
    }),
  );

  return transformedHotels;
}

/**
 * Save hotel search to database
 */
async function saveHotelSearchToDatabase(searchParams, results) {
  try {
    const searchQuery = `
      INSERT INTO hotel_searches_cache (
        destination, checkin_date, checkout_date, 
        adults, children, rooms, 
        search_date, results_count, cached_results
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7, $8)
      RETURNING id
    `;

    const searchValues = [
      searchParams.destination,
      searchParams.checkIn,
      searchParams.checkOut,
      searchParams.adults,
      searchParams.children || 0,
      searchParams.rooms || 1,
      results.length,
      JSON.stringify(results),
    ];

    const result = await db.query(searchQuery, searchValues);
    console.log(
      `💾 Hotel search saved to database with ID: ${result.rows[0].id}`,
    );

    return result.rows[0].id;
  } catch (error) {
    console.error("Error saving hotel search to database:", error);
    return null;
  }
}

/**
 * Hotel Search Route - Main API Endpoint
 */
router.get("/search", async (req, res) => {
  try {
    console.log("🏨 Hotel search request received:", req.query);

    const {
      destination,
      checkIn,
      checkOut,
      adults = 2,
      children = 0,
      rooms = 1,
      promoCode,
      userId,
    } = req.query;

    // Validate required parameters
    if (!destination || !checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        error: "Missing required parameters: destination, checkIn, checkOut",
      });
    }

    // Get destination code from database or use as-is
    let destinationCode = destination;
    try {
      const destQuery = await db.query(
        "SELECT code FROM destinations WHERE name ILIKE $1 OR code = $2 LIMIT 1",
        [`%${destination}%`, destination],
      );
      if (destQuery.rows && destQuery.rows.length > 0) {
        destinationCode = destQuery.rows[0].code;
      }
    } catch (error) {
      console.log("Destination lookup failed, using provided value");
    }

    // Build room occupancy
    const occupancies = [
      {
        rooms: parseInt(rooms),
        adults: parseInt(adults),
        children: parseInt(children),
      },
    ];

    // Build Hotelbeds API request
    const hotelbedsRequest = {
      stay: {
        checkIn: checkIn,
        checkOut: checkOut,
      },
      occupancies: occupancies,
      destination: {
        code: destinationCode,
      },
      filter: {
        maxRooms: 10,
      },
    };

    console.log(
      "📡 Calling Hotelbeds API with request:",
      JSON.stringify(hotelbedsRequest, null, 2),
    );

    // Call Hotelbeds Hotel Search API
    const hotelbedsResponse = await axios.post(
      `${HOTELBEDS_BASE_URL}/hotel-api/1.0/hotels`,
      hotelbedsRequest,
      {
        headers: getHotelbedsHeaders(),
        timeout: 30000,
      },
    );

    console.log(
      `✅ Hotelbeds API returned ${hotelbedsResponse.data?.hotels?.length || 0} hotels`,
    );

    // Transform Hotelbeds data to our format with markup and promo codes
    const searchParams = { ...req.query };
    const transformedHotels = await transformHotelbedsData(
      hotelbedsResponse.data,
      searchParams,
    );

    // Save search to database
    await saveHotelSearchToDatabase(searchParams, transformedHotels);

    // Return results
    res.json({
      success: true,
      data: transformedHotels,
      meta: {
        totalResults: transformedHotels.length,
        searchParams: searchParams,
        source: "hotelbeds_live",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ Hotel search error:", error.message);

    // Return fallback data on API failure
    const fallbackHotels = getFallbackHotelData(req.query);

    res.json({
      success: true,
      data: fallbackHotels,
      meta: {
        totalResults: fallbackHotels.length,
        searchParams: req.query,
        source: "fallback",
        warning: "Live API unavailable, showing sample data",
        timestamp: new Date().toISOString(),
      },
    });
  }
});

/**
 * Get hotel details endpoint
 */
router.get("/details/:hotelId", async (req, res) => {
  try {
    const { hotelId } = req.params;

    console.log(`🏨 Hotel details request for: ${hotelId}`);

    // Call Hotelbeds Hotel Details API
    const hotelbedsResponse = await axios.get(
      `${HOTELBEDS_BASE_URL}/hotel-content-api/1.0/hotels/${hotelId}`,
      {
        headers: getHotelbedsHeaders(),
        timeout: 15000,
      },
    );

    const hotelDetails = hotelbedsResponse.data.hotel;

    res.json({
      success: true,
      data: hotelDetails,
      source: "hotelbeds_live",
    });
  } catch (error) {
    console.error("❌ Hotel details error:", error.message);

    res.status(500).json({
      success: false,
      error: "Failed to fetch hotel details",
    });
  }
});

/**
 * Fallback hotel data when API is unavailable
 */
function getFallbackHotelData(searchParams) {
  return [
    {
      id: "fallback_hotel_1",
      name: "Grand Plaza Hotel",
      description: "Luxury hotel in the heart of the city",
      address: {
        street: "123 Main Street",
        city: searchParams.destination || "Dubai",
        country: "UAE",
        postalCode: "00000",
      },
      rating: 4.5,
      starRating: 5,
      reviewCount: 1250,
      images: [
        {
          id: "img_1",
          url: "https://cdn.builder.io/api/v1/image/assets%2F4235b10530ff469795aa00c0333d773c%2Fhotel-placeholder",
          caption: "Hotel Exterior",
          type: "exterior",
          order: 1,
        },
      ],
      amenities: [
        {
          id: "wifi",
          name: "Free WiFi",
          icon: "wifi",
          category: "general",
          available: true,
        },
        {
          id: "pool",
          name: "Swimming Pool",
          icon: "waves",
          category: "wellness",
          available: true,
        },
        {
          id: "gym",
          name: "Fitness Center",
          icon: "dumbbell",
          category: "wellness",
          available: true,
        },
      ],
      priceRange: {
        min: 15000,
        max: 25000,
        currency: "INR",
      },
      pricing: {
        originalPrice: 15000,
        markedUpPrice: 18000,
        finalPrice: 15000,
        discount: 0,
        markupApplied: { markup_percentage: 20.0 },
        promoApplied: false,
      },
    },
  ];
}

module.exports = router;
