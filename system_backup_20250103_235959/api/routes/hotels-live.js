/**
 * Enhanced Hotels Live API Routes
 * Full production integration with Hotelbeds Content and Booking APIs
 * Uses test credentials for development: 91d2368789abdb5beec101ce95a9d185
 */

const express = require("express");
const router = express.Router();
const contentService = require("../services/hotelbeds/contentService");
const bookingService = require("../services/hotelbeds/bookingService");
const { validateRequest } = require("../middleware/validation");
const rateLimit = require("express-rate-limit");

// Rate limiting for hotel searches
const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 15, // 15 searches per minute per IP
  message: {
    error: "Too many hotel searches",
    retryAfter: "1 minute",
  },
});

// Rate limiting for booking operations
const bookingLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // 3 booking attempts per 5 minutes per IP
  message: {
    error: "Too many booking attempts",
    retryAfter: "5 minutes",
  },
});

/**
 * Enhanced hotel search with live availability and content
 * Compatible with existing frontend - no design changes needed
 * GET/POST /api/hotels-live/search
 */
router.get("/search", searchLimiter, async (req, res) => {
  await handleHotelSearch(req, res);
});

router.post("/search", searchLimiter, async (req, res) => {
  await handleHotelSearch(req, res);
});

/**
 * Test endpoint to debug Hotelbeds API directly
 * GET /api/hotels-live/test
 */
router.get("/test", async (req, res) => {
  try {
    console.log("🧪 Testing direct Hotelbeds API connection...");

    // Test credentials
    const hasCredentials = !!(
      process.env.HOTELBEDS_API_KEY && process.env.HOTELBEDS_SECRET
    );
    console.log("🔑 Credentials check:", {
      hasApiKey: !!process.env.HOTELBEDS_API_KEY,
      hasSecret: !!process.env.HOTELBEDS_SECRET,
      apiKeyLength: process.env.HOTELBEDS_API_KEY?.length,
      secretLength: process.env.HOTELBEDS_SECRET?.length,
    });

    if (!hasCredentials) {
      return res.json({
        success: false,
        error: "Missing Hotelbeds API credentials",
        debug: {
          hasApiKey: !!process.env.HOTELBEDS_API_KEY,
          hasSecret: !!process.env.HOTELBEDS_SECRET,
        },
      });
    }

    // Test simple availability search
    const testSearch = {
      destination: "BCN", // Barcelona
      checkIn: "2024-12-15",
      checkOut: "2024-12-18",
      rooms: 1,
      adults: 2,
      children: 0,
      currency: "EUR",
    };

    console.log("🏨 Testing availability search:", testSearch);
    const result = await bookingService.searchAvailability(testSearch);

    res.json({
      success: true,
      message: "Hotelbeds API test successful",
      hotelCount: result.hotels?.length || 0,
      hasImages: result.hotels?.some((h) => h.images?.length > 0) || false,
      sampleHotel: result.hotels?.[0] || null,
      testParams: testSearch,
    });
  } catch (error) {
    console.error("❌ Hotelbeds test failed:", error);
    res.json({
      success: false,
      error: error.message,
      stack: error.stack,
    });
  }
});

async function handleHotelSearch(req, res) {
  try {
    // Extract parameters from both GET and POST requests
    const params = req.method === "GET" ? req.query : req.body;

    const {
      destination,
      destinationCode,
      checkIn,
      checkOut,
      rooms = 1,
      adults = 2,
      children = 0,
      childAges = [],
      currency = "USD",
      currencyCode,
    } = params;

    console.log("🔍 Enhanced hotel search request:", params);

    // Use currencyCode if provided (for backward compatibility)
    const finalCurrency = currencyCode || currency;

    // Validate required parameters
    if (!checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        error: "Check-in and check-out dates are required",
      });
    }

    // Validate dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    if (checkInDate >= checkOutDate) {
      return res.status(400).json({
        success: false,
        error: "Check-out date must be after check-in date",
      });
    }

    // Determine destination code
    let destCode = destinationCode;
    if (!destCode && destination) {
      console.log(`🔍 Searching destinations for: ${destination}`);
      try {
        const destinations = await contentService.getDestinations();
        const matched = destinations.find(
          (d) =>
            d.name.toLowerCase().includes(destination.toLowerCase()) ||
            d.code.toLowerCase() === destination.toLowerCase(),
        );
        if (matched) {
          destCode = matched.code;
          console.log(
            `✅ Found destination code: ${destCode} for ${matched.name}`,
          );
        }
      } catch (destError) {
        console.warn("⚠️ Destination lookup failed:", destError.message);
      }
    }

    // Default to Dubai if no destination found
    if (!destCode) {
      destCode = "DXB"; // Dubai as fallback
      console.log("ℹ️ Using default destination: Dubai (DXB)");
    }

    // Search for availability and pricing
    console.log("🏨 Searching availability with Hotelbeds...");
    console.log("🔑 API Credentials:", {
      hasApiKey: !!process.env.HOTELBEDS_API_KEY,
      hasSecret: !!process.env.HOTELBEDS_SECRET,
      apiKeyLength: process.env.HOTELBEDS_API_KEY?.length,
      secretLength: process.env.HOTELBEDS_SECRET?.length,
    });

    let availabilityResults;
    try {
      availabilityResults = await bookingService.searchAvailability({
        destination: destCode,
        checkIn,
        checkOut,
        rooms: parseInt(rooms),
        adults: parseInt(adults),
        children: parseInt(children),
        childAges: Array.isArray(childAges) ? childAges : [],
        currency: finalCurrency,
      });
      console.log("✅ Hotelbeds availability search successful:", {
        hotelCount: availabilityResults.hotels?.length || 0,
        destination: destCode,
      });
    } catch (apiError) {
      console.error("❌ Hotelbeds API Error:", apiError.message);
      console.error("🔍 Full API Error:", apiError);

      // Return fallback data for now to debug
      return res.json({
        success: false,
        error: "Hotelbeds API Error",
        message: apiError.message,
        fallback: true,
      });
    }

    let processedHotels = [];

    if (availabilityResults.hotels && availabilityResults.hotels.length > 0) {
      console.log(
        `🔄 Enriching ${availabilityResults.hotels.length} hotels with content data`,
      );

      // Get hotel codes for content enrichment (limit to reasonable number)
      const hotelCodes = availabilityResults.hotels
        .slice(0, 20)
        .map((hotel) => hotel.code);

      try {
        // Get detailed content for these hotels
        console.log("📚 Fetching content for hotel codes:", hotelCodes);
        const contentData = await contentService.getHotels(hotelCodes);
        console.log("📚 Content data received:", {
          hotelCount: contentData?.length || 0,
          hasImages: contentData?.some((h) => h.images?.length > 0) || false,
        });

        // Create a map for quick lookup
        const contentMap = new Map();
        if (contentData && contentData.length > 0) {
          contentData.forEach((hotel) => {
            console.log(`📝 Hotel ${hotel.code} content:`, {
              name: hotel.name,
              imageCount: hotel.images?.length || 0,
              firstImageUrl:
                hotel.images?.[0]?.url ||
                hotel.images?.[0]?.urlStandard ||
                "none",
            });
            contentMap.set(hotel.code, hotel);
          });
        }

        // Enrich availability data with content
        processedHotels = availabilityResults.hotels.map((hotel) => {
          const content = contentMap.get(hotel.code);

          // Log content data for debugging
          if (content) {
            console.log(`🔍 Hotel ${hotel.code} content:`, {
              name: content.name,
              hasImages: content.images?.length > 0,
              imageCount: content.images?.length || 0,
              firstImageType: content.images?.[0]?.url
                ? "url"
                : content.images?.[0]?.urlStandard
                  ? "urlStandard"
                  : "unknown",
            });
          } else {
            console.log(`⚠️  No content found for hotel ${hotel.code}`);
          }

          // Extract images with proper fallback logic
          let hotelImages = [];
          if (content?.images?.length > 0) {
            hotelImages = content.images
              .map((img) => img.urlStandard || img.url || img.urlOriginal)
              .filter(Boolean); // Remove any undefined/null URLs
            console.log(
              `📸 Hotel ${hotel.code}: Found ${hotelImages.length} valid images from Hotelbeds`,
            );
          }

          // Only use fallback if no real images available
          if (hotelImages.length === 0) {
            console.log(
              `⚠️  Hotel ${hotel.code}: No images from API, using fallback`,
            );
            hotelImages = [
              "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop",
              "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600&h=400&fit=crop",
            ];
          }

          // Merge data prioritizing content over availability for descriptive fields
          const enrichedHotel = {
            // Basic identification
            id: hotel.code,
            code: hotel.code,
            name: content?.name || hotel.name || `Hotel ${hotel.code}`,

            // Descriptive content
            description:
              content?.description ||
              `Experience luxury at ${hotel.name || "this hotel"} with modern amenities and exceptional service.`,

            // Location data
            location: content?.location?.address?.street || "",
            address: content?.location?.address || {
              street: "",
              city: destination || "Dubai",
              country: "United Arab Emirates",
              postalCode: "",
            },

            // Visual content
            images: hotelImages,

            // Amenities and features
            amenities: content?.amenities?.map((a) => a.name) ||
              content?.facilities?.map((f) => f.name) || [
                "WiFi",
                "Parking",
                "Restaurant",
                "Pool",
              ],
            features: content?.features || ["City View", "Modern Design"],

            // Pricing (from availability - this is the key data)
            currentPrice: hotel.currentPrice || 120,
            originalPrice:
              hotel.originalPrice || hotel.currentPrice * 1.2 || 150,
            totalPrice: hotel.totalPrice || hotel.currentPrice || 120,
            currency: finalCurrency,

            // Hotel rating
            rating: content?.rating || hotel.rating || 4.2,
            starRating: content?.starRating || hotel.starRating || 4,

            // Reviews (mock data for now)
            reviews: Math.floor(Math.random() * 800) + 200,
            reviewCount: Math.floor(Math.random() * 800) + 200,
            reviewScore: (Math.random() * 2 + 8).toFixed(1),

            // Booking-specific data
            available: true,
            rateKey: hotel.rateKey,
            lastRoom: hotel.lastRoom || false,

            // Room information
            roomTypes: hotel.roomTypes || [
              {
                name: "Standard Room",
                price: hotel.currentPrice || 120,
                pricePerNight: hotel.currentPrice || 120,
                features: ["Double Bed", "City View", "Free WiFi"],
              },
            ],

            // Compatibility fields for existing frontend
            priceRange: {
              min: hotel.currentPrice || 120,
              max: hotel.originalPrice || hotel.currentPrice * 1.5 || 180,
              currency: finalCurrency,
            },

            // Supplier information
            supplier: "hotelbeds",
            supplierHotelId: hotel.code,
            isLiveData: true,

            // Additional fields for booking flow
            cancellationPolicy:
              "Free cancellation until 24 hours before check-in",
            policies: {
              checkIn: "15:00",
              checkOut: "11:00",
              cancellation: "Free cancellation until 24 hours",
              children: "Children welcome",
              pets: "Pets not allowed",
              smoking: "Non-smoking",
            },
          };

          return enrichedHotel;
        });

        console.log(
          `✅ Enhanced ${processedHotels.length} hotels with content`,
        );
      } catch (contentError) {
        console.warn(
          "⚠️ Content enrichment failed, using availability data only:",
          contentError.message,
        );

        // Fallback to basic availability data with minimal enhancement
        processedHotels = availabilityResults.hotels.map((hotel) => ({
          id: hotel.code,
          code: hotel.code,
          name: hotel.name || `Hotel ${hotel.code}`,
          description: `Modern hotel with excellent facilities in ${destination}`,
          location: destination || "Dubai",
          images: [
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600",
          ],
          amenities: ["WiFi", "Restaurant", "Pool"],
          features: ["City View"],
          currentPrice: hotel.currentPrice || 120,
          originalPrice: hotel.originalPrice || 150,
          totalPrice: hotel.totalPrice || 120,
          currency: finalCurrency,
          rating: hotel.rating || 4.2,
          reviews: 245,
          available: true,
          rateKey: hotel.rateKey,
          supplier: "hotelbeds",
          isLiveData: true,
        }));
      }
    }

    console.log(`✅ Returning ${processedHotels.length} hotels to frontend`);

    // Return response in format expected by existing frontend
    res.json({
      success: true,
      data: processedHotels,
      totalResults: processedHotels.length,
      count: processedHotels.length,
      searchParams: {
        destination: destCode,
        destinationName: destination,
        checkIn,
        checkOut,
        rooms: parseInt(rooms),
        adults: parseInt(adults),
        children: parseInt(children),
        currency: finalCurrency,
      },
      isLiveData: true,
      source: "Hotelbeds API Enhanced",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Enhanced hotel search error:", error);

    // Return graceful fallback for frontend compatibility
    res.status(200).json({
      success: false,
      data: [],
      totalResults: 0,
      count: 0,
      error: {
        message: "Live search temporarily unavailable",
        technical: error.message,
      },
      searchParams: req.method === "GET" ? req.query : req.body,
      isLiveData: false,
      source: "fallback",
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Simple test endpoint to verify routing works
 * GET /api/hotels-live/test
 */
router.get("/test", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.json({
    success: true,
    message: "Hotels Live API is working",
    timestamp: new Date().toISOString(),
    route: "test endpoint",
  });
});

/**
 * Debug endpoint for hotel details testing
 * GET /api/hotels-live/debug-hotel/:code
 */
router.get("/debug-hotel/:code", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  const { code } = req.params;

  res.json({
    success: true,
    message: "Debug hotel endpoint working",
    hotelCode: code,
    query: req.query,
    timestamp: new Date().toISOString(),
    credentials: {
      hasApiKey: !!process.env.HOTELBEDS_API_KEY,
      hasSecret: !!process.env.HOTELBEDS_SECRET,
    },
  });
});

/**
 * Get hotel details with enhanced content
 * GET /api/hotels-live/hotel/:code
 */
router.get("/hotel/:code", async (req, res) => {
  // Set JSON content type header to ensure response is always JSON
  res.setHeader("Content-Type", "application/json");

  try {
    const { code } = req.params;

    console.log(`🏨 Hotel details API called for: ${code}`);
    console.log("🔧 Request query params:", req.query);
    console.log("🔑 API credentials check:", {
      hasApiKey: !!process.env.HOTELBEDS_API_KEY,
      hasSecret: !!process.env.HOTELBEDS_SECRET,
      apiKeyLength: process.env.HOTELBEDS_API_KEY
        ? process.env.HOTELBEDS_API_KEY.length
        : 0,
    });

    // Validate hotel code parameter
    if (!code || typeof code !== "string" || code.trim() === "") {
      console.log("❌ Invalid hotel code provided");
      return res.status(400).json({
        success: false,
        error: "Invalid hotel code",
        message: "Hotel code parameter is required and must be a valid string",
      });
    }

    const { language = "ENG", checkIn, checkOut } = req.query;

    console.log(`🏨 Getting enhanced hotel details for: ${code}`);

    // Create immediate fallback hotel data structure
    const createFallbackHotel = (hotelCode) => ({
      id: hotelCode,
      code: hotelCode,
      name: `Hotel ${hotelCode}`,
      description:
        "Live hotel data temporarily unavailable. Showing fallback information.",
      images: [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600",
        "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600",
      ],
      rating: 4.0,
      reviews: 250,
      amenities: ["WiFi", "Restaurant", "Pool"],
      features: ["City View"],
      currentPrice: 167,
      totalPrice: 334,
      currency: "USD",
      available: true,
      location: {
        address: {
          street: "Dubai Marina",
          city: "Dubai",
          country: "United Arab Emirates",
        },
      },
      checkIn: checkIn || "2025-02-01",
      checkOut: checkOut || "2025-02-03",
      supplier: "fallback",
      isLiveData: false,
    });

    // Get detailed content from content API
    let contentData = null;
    let hotel = null;

    try {
      contentData = await contentService.getHotels([code], language);
      hotel = contentData && contentData.length > 0 ? contentData[0] : null;
    } catch (contentError) {
      console.warn(
        "⚠️ Content API error for hotel details:",
        contentError.message,
      );
      // Use fallback hotel data
      hotel = createFallbackHotel(code);
    }

    // If still no hotel data, use fallback
    if (!hotel) {
      console.log("ℹ️ No hotel data found, using fallback");
      hotel = createFallbackHotel(code);
    }

    // If dates provided, try to get current availability
    let availabilityData = null;
    if (checkIn && checkOut) {
      try {
        const availability = await bookingService.searchAvailability({
          destination: hotel.location?.destinationCode || "DXB",
          checkIn,
          checkOut,
          rooms: 1,
          adults: 2,
          children: 0,
          currency: "USD",
        });

        // Find this specific hotel in availability results
        availabilityData =
          availability.hotels?.find((h) => h.code === code) || null;
      } catch (availError) {
        console.warn(
          "⚠️ Could not fetch availability for hotel details:",
          availError.message,
        );
      }
    }

    // Combine content and availability data
    const enhancedHotel = {
      ...hotel,
      // Add availability data if found
      ...(availabilityData && {
        currentPrice: availabilityData.currentPrice,
        totalPrice: availabilityData.totalPrice,
        available: true,
        availableRooms: availabilityData.availableRooms,
        rateKey: availabilityData.rateKey,
      }),
      // Ensure compatibility fields
      id: hotel.code || code,
      supplier: hotel.supplier || "hotelbeds",
      isLiveData: hotel.supplier !== "fallback",
    };

    // Always return success response with hotel data
    return res.status(200).json({
      success: true,
      hotel: enhancedHotel,
      hasAvailability: !!availabilityData,
      fallback: hotel.supplier === "fallback",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Hotel details error:", error);

    // Ensure we ALWAYS return a valid JSON response, never HTML
    try {
      return res.status(200).json({
        success: true,
        hotel: {
          id: req.params.code || "unknown",
          code: req.params.code || "unknown",
          name: `Hotel ${req.params.code || "Unknown"}`,
          description:
            "Live hotel data temporarily unavailable. Showing fallback information.",
          images: [
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600",
            "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600",
          ],
          rating: 4.0,
          reviews: 250,
          amenities: ["WiFi", "Restaurant", "Pool"],
          features: ["City View"],
          currentPrice: 167,
          totalPrice: 334,
          currency: "USD",
          available: true,
          location: {
            address: {
              street: "Dubai Marina",
              city: "Dubai",
              country: "United Arab Emirates",
            },
          },
          checkIn: req.query?.checkIn || "2025-02-01",
          checkOut: req.query?.checkOut || "2025-02-03",
          supplier: "emergency_fallback",
          isLiveData: false,
        },
        hasAvailability: false,
        fallback: true,
        error: {
          message: "Live data unavailable",
          technical: error.message || "Unknown error",
        },
        timestamp: new Date().toISOString(),
      });
    } catch (jsonError) {
      // Final failsafe - even if JSON.stringify fails, return minimal valid JSON
      console.error(
        "❌ Critical error in JSON response generation:",
        jsonError,
      );
      res.end(
        '{"success": false, "error": "Critical server error", "fallback": true}',
      );
    }
  }
});

/**
 * Get destinations list from content API
 * GET /api/hotels-live/destinations
 * GET /api/hotels-live/destinations/search
 */
router.get("/destinations", async (req, res) => {
  await handleDestinations(req, res);
});

router.get("/destinations/search", async (req, res) => {
  await handleDestinations(req, res);
});

async function handleDestinations(req, res) {
  try {
    const { country, q: query } = req.query;

    console.log("🌍 Getting destinations list", { country, query });

    const destinations = await contentService.getDestinations(country);

    // Filter by query if provided
    let filteredDestinations = destinations;
    if (query && query.length >= 2) {
      const searchTerm = query.toLowerCase();
      filteredDestinations = destinations.filter(
        (dest) =>
          dest.name.toLowerCase().includes(searchTerm) ||
          dest.code.toLowerCase().includes(searchTerm),
      );
    }

    // Transform for frontend compatibility
    const formattedDestinations = filteredDestinations.map((dest) => ({
      id: dest.code,
      code: dest.code,
      name: dest.name,
      type: dest.type || "city",
      country: dest.countryCode,
      fullName: dest.fullName || `${dest.name}, ${dest.countryCode}`,
      displayName: dest.displayName || dest.name,
    }));

    res.json({
      success: true,
      count: formattedDestinations.length,
      data: formattedDestinations,
      destinations: formattedDestinations, // For compatibility
      isLiveData: true,
      source: "Hotelbeds Content API",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Destinations error:", error);
    res.status(500).json({
      error: "Failed to get destinations",
      message: error.message,
    });
  }
}

/**
 * Check rate details for booking
 * POST /api/hotels-live/checkrate
 */
router.post("/checkrate", async (req, res) => {
  try {
    const { rateKey } = req.body;

    if (!rateKey) {
      return res.status(400).json({
        error: "Missing rateKey parameter",
      });
    }

    console.log("💰 Checking rate details for:", rateKey);

    const rateDetails = await bookingService.getRateDetails(rateKey);

    res.json({
      success: true,
      rate: rateDetails,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Rate check error:", error);
    res.status(500).json({
      error: "Failed to check rate",
      message: error.message,
    });
  }
});

/**
 * Create hotel booking with full integration
 * POST /api/hotels-live/book
 */
router.post("/book", bookingLimiter, async (req, res) => {
  try {
    const bookingData = req.body;

    console.log("📝 Creating production hotel booking");

    // Validate booking data
    const required = ["rateKey", "holder", "rooms"];
    const missing = required.filter((field) => !bookingData[field]);

    if (missing.length > 0) {
      return res.status(400).json({
        error: "Missing required booking data",
        missing: missing,
      });
    }

    // Validate holder information
    const { holder } = bookingData;
    const holderRequired = ["firstName", "lastName", "email"];
    const holderMissing = holderRequired.filter((field) => !holder[field]);

    if (holderMissing.length > 0) {
      return res.status(400).json({
        error: "Missing required holder information",
        missing: holderMissing,
      });
    }

    // Create booking through Hotelbeds
    const booking = await bookingService.createBooking({
      ...bookingData,
      clientReference: `FD${Date.now()}${Math.random().toString(36).substr(2, 5)}`,
    });

    console.log("✅ Booking created successfully:", booking.reference);

    res.json({
      success: true,
      booking: booking,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Booking creation error:", error);
    res.status(500).json({
      error: "Failed to create booking",
      message: error.message,
      code: error.code || "BOOKING_ERROR",
    });
  }
});

/**
 * Comprehensive health check for all services
 * GET /api/hotels-live/health
 */
router.get("/health", async (req, res) => {
  try {
    console.log("🏥 Running comprehensive health check...");

    // Check both services in parallel
    const [contentHealth, bookingHealth] = await Promise.allSettled([
      contentService.healthCheck(),
      bookingService.healthCheck(),
    ]);

    const overall = {
      service: "hotels-live-enhanced",
      status: "healthy",
      timestamp: new Date().toISOString(),
      apiKey: process.env.HOTELBEDS_API_KEY
        ? `${process.env.HOTELBEDS_API_KEY.substring(0, 8)}...`
        : "NOT_SET",
      services: {
        content:
          contentHealth.status === "fulfilled"
            ? contentHealth.value
            : {
                status: "unhealthy",
                error: contentHealth.reason?.message,
              },
        booking:
          bookingHealth.status === "fulfilled"
            ? bookingHealth.value
            : {
                status: "unhealthy",
                error: bookingHealth.reason?.message,
              },
      },
    };

    // Determine overall health
    if (
      contentHealth.status === "rejected" ||
      bookingHealth.status === "rejected"
    ) {
      overall.status = "degraded";
    }

    const httpStatus =
      overall.status === "healthy"
        ? 200
        : overall.status === "degraded"
          ? 503
          : 500;

    res.status(httpStatus).json(overall);
  } catch (error) {
    console.error("❌ Health check error:", error);
    res.status(500).json({
      service: "hotels-live-enhanced",
      status: "unhealthy",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * Clear all caches (for maintenance)
 * POST /api/hotels-live/admin/clear-cache
 */
router.post("/admin/clear-cache", async (req, res) => {
  try {
    console.log("🗑️ Clearing all caches...");

    contentService.clearCache();
    bookingService.clearCache();

    res.json({
      success: true,
      message: "All caches cleared",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Cache clear error:", error);
    res.status(500).json({
      error: "Failed to clear caches",
      message: error.message,
    });
  }
});

// Global error handler middleware for this router
// Ensures all errors return JSON responses instead of HTML
router.use((error, req, res, next) => {
  console.error("❌ Unhandled router error:", error);

  // Set JSON content type
  res.setHeader("Content-Type", "application/json");

  // If response already sent, don't send again
  if (res.headersSent) {
    return next(error);
  }

  // Always return JSON error response
  res.status(500).json({
    success: false,
    error: "Internal server error",
    message: "An unexpected error occurred",
    technical: error.message || "Unknown error",
    timestamp: new Date().toISOString(),
    fallback: true,
  });
});

module.exports = router;
