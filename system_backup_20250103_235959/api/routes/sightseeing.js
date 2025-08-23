/**
 * Sightseeing API Routes - Complete CRUD operations for activities and bookings
 * Integrates with Hotelbeds Activities API and internal markup/promo systems
 */

const express = require("express");
const router = express.Router();
const { Pool } = require("pg");
const crypto = require("crypto");
const axios = require("axios");
const HotelbedsActivitiesService = require("../services/hotelbedsActivitiesService");

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

// Hotelbeds API configuration
const HOTELBEDS_CONFIG = {
  apiKey: process.env.HOTELBEDS_API_KEY || "4ad3d9b2d55424b58fdd61dcaeba81f8",
  secret: process.env.HOTELBEDS_SECRET || "5283c0c124",
  baseUrl: process.env.HOTELBEDS_BASE_URL || "https://api.test.hotelbeds.com",
  environment: "test",
};

// Generate Hotelbeds authentication headers
function generateHotelbedsHeaders() {
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = crypto
    .createHash("sha256")
    .update(HOTELBEDS_CONFIG.apiKey + HOTELBEDS_CONFIG.secret + timestamp)
    .digest("hex");

  return {
    "Api-key": HOTELBEDS_CONFIG.apiKey,
    "X-Signature": signature,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

// Helper function to apply markup rules
async function applyMarkupRules(basePrice, destination, category, supplier_id) {
  try {
    const markupQuery = `
      SELECT markup_type, markup_value, maximum_markup
      FROM sightseeing_markup_rules 
      WHERE is_active = true 
      AND (
        (rule_type = 'destination' AND destination_code = $1) OR
        (rule_type = 'category' AND category = $2) OR
        (rule_type = 'supplier' AND supplier_id = $3) OR
        (rule_type = 'global')
      )
      AND (valid_from IS NULL OR valid_from <= CURRENT_DATE)
      AND (valid_to IS NULL OR valid_to >= CURRENT_DATE)
      ORDER BY priority DESC
      LIMIT 1
    `;

    const result = await pool.query(markupQuery, [
      destination,
      category,
      supplier_id,
    ]);

    if (result.rows.length === 0) {
      // Default 15% markup if no rules found
      return {
        markup_amount: basePrice * 0.15,
        markup_percentage: 15.0,
        final_price: basePrice * 1.15,
      };
    }

    const rule = result.rows[0];
    let markupAmount = 0;

    if (rule.markup_type === "percentage") {
      markupAmount = basePrice * (rule.markup_value / 100);
      if (rule.maximum_markup && markupAmount > rule.maximum_markup) {
        markupAmount = rule.maximum_markup;
      }
    } else {
      markupAmount = rule.markup_value;
    }

    return {
      markup_amount: markupAmount,
      markup_percentage:
        rule.markup_type === "percentage"
          ? rule.markup_value
          : (markupAmount / basePrice) * 100,
      final_price: basePrice + markupAmount,
    };
  } catch (error) {
    console.error("Error applying markup rules:", error);
    // Fallback to 15% markup
    return {
      markup_amount: basePrice * 0.15,
      markup_percentage: 15.0,
      final_price: basePrice * 1.15,
    };
  }
}

// Initialize the Hotelbeds Activities service
const activitiesService = new HotelbedsActivitiesService();

// In-memory cache for destinations with 5-minute TTL
const destinationsCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * POST /api/sightseeing/destinations
 * Search sightseeing destinations using Hotelbeds Activities API with caching
 * Enforces min 3 chars on server, includes proper caching headers
 */
router.post("/destinations", async (req, res) => {
  try {
    const { query = "", limit = 15, popularOnly = false } = req.body;

    // Enforce minimum 3 characters for search (except for popular destinations)
    if (query.length > 0 && query.length < 3) {
      return res.status(400).json({
        success: false,
        error: "Minimum 3 characters required for search",
      });
    }

    console.log(`🎯 Sightseeing destinations API called with query: "${query}"`);

    // Create cache key
    const cacheKey = `${query.toLowerCase()}_${limit}_${popularOnly}`;

    // Check cache first
    const cached = destinationsCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      console.log(`✅ Returning cached sightseeing destinations for: "${query}"`);
      // Set cache headers
      res.set({
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=300',
        'X-Cache': 'HIT'
      });
      return res.json({
        success: true,
        data: { destinations: cached.data },
        cached: true
      });
    }

    // Get destinations from Hotelbeds Activities API
    const result = await activitiesService.getDestinations("en", limit * 2); // Get more to filter

    if (!result.success) {
      console.error("❌ Hotelbeds Activities API failed:", result.error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch destinations from Hotelbeds",
      });
    }

    let destinations = result.data.destinations || [];

    // Filter by query if provided (min 3 chars enforced above)
    if (query && query.length >= 3) {
      const lowerQuery = query.toLowerCase();
      destinations = destinations.filter(
        (dest) =>
          dest.name.toLowerCase().includes(lowerQuery) ||
          (dest.countryName && dest.countryName.toLowerCase().includes(lowerQuery)) ||
          dest.code.toLowerCase().includes(lowerQuery)
      );
    }

    // Mark popular destinations (major cities/tourist destinations)
    const popularCodes = [
      "DXB", "LON", "PAR", "BCN", "NYC", "BOM", "SIN", "BKK",
      "ROM", "MAD", "AMS", "BER", "MIL", "VEN", "FLR", "NAP",
      "ATH", "IST", "CAI", "JNB", "CPT", "SYD", "MEL", "PER",
      "HKG", "TPE", "SEL", "TYO", "OSA", "KUL", "JKT", "MNL"
    ];

    destinations = destinations.map((dest) => ({
      ...dest,
      popular: popularCodes.includes(dest.code),
    }));

    // If popularOnly is requested (empty query), filter to popular destinations
    if (popularOnly || query === "") {
      destinations = destinations.filter((dest) => dest.popular);
    }

    // Sort by popularity first, then by name
    destinations.sort((a, b) => {
      if (a.popular && !b.popular) return -1;
      if (!a.popular && b.popular) return 1;
      return a.name.localeCompare(b.name);
    });

    // Limit results
    destinations = destinations.slice(0, limit);

    // Cache the results
    destinationsCache.set(cacheKey, {
      data: destinations,
      timestamp: Date.now()
    });

    console.log(`✅ Found ${destinations.length} sightseeing destinations (cached)`);

    // Set cache headers
    res.set({
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=300',
      'X-Cache': 'MISS'
    });

    res.json({
      success: true,
      data: { destinations },
      cached: false
    });
  } catch (error) {
    console.error("❌ Sightseeing destinations API error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

// Route: Search activities by destination
router.get("/search", async (req, res) => {
  try {
    const {
      destination,
      from,
      to,
      adults = 2,
      children = 0,
      category,
      limit = 20,
    } = req.query;

    if (!destination || !from) {
      return res.status(400).json({
        success: false,
        error: "Destination and from date are required",
      });
    }

    // First, try to get activities from our local database
    let localQuery = `
      SELECT 
        activity_code, activity_name, activity_description, category,
        destination_name, duration_text, base_price, currency,
        main_image_url, gallery_images, rating, review_count,
        highlights, includes, available_times, is_featured
      FROM sightseeing_items 
      WHERE is_active = true
      AND (destination_code ILIKE $1 OR destination_name ILIKE $1)
    `;

    const queryParams = [`%${destination}%`];

    if (category) {
      localQuery += ` AND category = $${queryParams.length + 1}`;
      queryParams.push(category);
    }

    localQuery += ` ORDER BY is_featured DESC, rating DESC, review_count DESC LIMIT $${queryParams.length + 1}`;
    queryParams.push(limit);

    const localResult = await pool.query(localQuery, queryParams);

    // If we have local data, use it
    if (localResult.rows.length > 0) {
      const activities = await Promise.all(
        localResult.rows.map(async (activity) => {
          const markup = await applyMarkupRules(
            activity.base_price,
            destination,
            activity.category,
            1, // Default supplier ID
          );

          return {
            id: activity.activity_code,
            name: activity.activity_name,
            description: activity.activity_description,
            category: activity.category,
            location: activity.destination_name,
            duration: activity.duration_text,
            originalPrice: markup.final_price,
            currentPrice: markup.final_price,
            images: activity.gallery_images || [activity.main_image_url],
            rating: activity.rating,
            reviews: activity.review_count,
            highlights: activity.highlights || [],
            includes: activity.includes || [],
            features: [
              "Instant confirmation",
              "Mobile ticket",
              "Free cancellation",
            ],
            availableSlots: [
              {
                date: from,
                times: activity.available_times || ["09:00", "14:00"],
              },
            ],
            ticketTypes: [
              {
                name: "Standard",
                price: markup.final_price,
                features: activity.includes || [],
              },
            ],
          };
        }),
      );

      return res.json({
        success: true,
        count: activities.length,
        activities,
        source: "local_database",
      });
    }

    // If no local data, fall back to Hotelbeds API
    try {
      const hotelbedsRequest = {
        destination: destination,
        from: from,
        to: to || from,
        adults: parseInt(adults),
        children: parseInt(children),
        language: "en",
      };

      const hotelbedsResponse = await axios.post(
        `${HOTELBEDS_CONFIG.baseUrl}/activity-content-api/1.0/activities`,
        hotelbedsRequest,
        {
          headers: generateHotelbedsHeaders(),
          timeout: 30000,
        },
      );

      const hotelbedsActivities = hotelbedsResponse.data.activities || [];

      const activities = await Promise.all(
        hotelbedsActivities.slice(0, limit).map(async (activity) => {
          const basePrice = activity.price?.amount || 100;
          const markup = await applyMarkupRules(
            basePrice,
            destination,
            "tour",
            1,
          );

          return {
            id: activity.code,
            name: activity.name,
            description: activity.description,
            category: activity.type || "tour",
            location: destination,
            duration: activity.duration || "2-3 hours",
            originalPrice: markup.final_price,
            currentPrice: markup.final_price,
            images: activity.images || ["/api/placeholder/400/300"],
            rating: 4.5,
            reviews: Math.floor(Math.random() * 5000) + 100,
            highlights: activity.highlights || [],
            includes: activity.includes || [],
            features: [
              "Instant confirmation",
              "Mobile ticket",
              "Free cancellation",
            ],
            availableSlots: [
              {
                date: from,
                times: ["09:00", "11:00", "14:00", "16:00"],
              },
            ],
            ticketTypes: [
              {
                name: "Standard",
                price: markup.final_price,
                features: activity.includes || [],
              },
            ],
          };
        }),
      );

      res.json({
        success: true,
        count: activities.length,
        activities,
        source: "hotelbeds_api",
      });
    } catch (hotelbedsError) {
      console.error("Hotelbeds API error:", hotelbedsError.message);

      // Return sample data as fallback
      const sampleActivities = [
        {
          id: "burj-khalifa",
          name: "Burj Khalifa: Floors 124 and 125",
          description:
            "Skip the line and enjoy breathtaking views from the world's tallest building",
          category: "landmark",
          location: destination,
          duration: "1-2 hours",
          originalPrice: 189,
          currentPrice: 149,
          images: [
            "https://cdn.builder.io/api/v1/image/assets%2F4235b10530ff469795aa00c0333d773c%2Fadc752b547864028b3c403d353c64fe5?format=webp&width=800",
          ],
          rating: 4.6,
          reviews: 45879,
          highlights: ["360-degree views", "Skip-the-line access"],
          includes: ["Access to floors 124 & 125", "Welcome refreshment"],
          features: ["Skip the line", "Audio guide", "Mobile ticket"],
          availableSlots: [{ date: from, times: ["09:00", "14:00", "18:00"] }],
          ticketTypes: [
            { name: "Standard", price: 149, features: ["Floors 124 & 125"] },
          ],
        },
      ];

      res.json({
        success: true,
        count: sampleActivities.length,
        activities: sampleActivities,
        source: "sample_data",
      });
    }
  } catch (error) {
    console.error("Search activities error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to search activities",
      details: error.message,
    });
  }
});

// Route: Get activity details by ID
router.get("/details/:activityId", async (req, res) => {
  try {
    const { activityId } = req.params;
    const { adults = 2, children = 0 } = req.query;

    // First check local database
    const localQuery = `
      SELECT * FROM sightseeing_items 
      WHERE activity_code = $1 AND is_active = true
    `;

    const localResult = await pool.query(localQuery, [activityId]);

    if (localResult.rows.length > 0) {
      const activity = localResult.rows[0];
      const markup = await applyMarkupRules(
        activity.base_price,
        activity.destination_code,
        activity.category,
        activity.supplier_id,
      );

      const response = {
        id: activity.activity_code,
        name: activity.activity_name,
        description: activity.activity_description,
        category: activity.category,
        location: activity.destination_name,
        duration: activity.duration_text,
        images: activity.gallery_images || [activity.main_image_url],
        rating: activity.rating,
        reviews: activity.review_count,
        originalPrice: markup.final_price + 40, // Show savings
        currentPrice: markup.final_price,
        highlights: activity.highlights || [],
        includes: activity.includes || [],
        excludes: activity.excludes || [],
        requirements: activity.requirements || [],
        features: [
          "Instant confirmation",
          "Mobile ticket",
          "Free cancellation",
        ],
        availableSlots: [
          {
            date: new Date().toISOString().split("T")[0],
            times: activity.available_times || [
              "09:00",
              "11:00",
              "14:00",
              "16:00",
            ],
          },
        ],
        ticketTypes: [
          {
            name: "Standard",
            price: markup.final_price,
            features: activity.includes || [],
          },
          {
            name: "Premium",
            price: markup.final_price * 1.3,
            features: [
              ...(activity.includes || []),
              "Priority access",
              "Refreshments",
            ],
          },
        ],
        cancellationPolicy: activity.cancellation_policy,
      };

      return res.json({ success: true, activity: response });
    }

    // Fallback to sample data
    const sampleActivity = {
      id: activityId,
      name: "Sample Activity",
      description: "A great sightseeing experience",
      category: "tour",
      location: "Dubai",
      duration: "2-3 hours",
      images: [
        "https://cdn.builder.io/api/v1/image/assets%2F4235b10530ff469795aa00c0333d773c%2Fadc752b547864028b3c403d353c64fe5?format=webp&width=800",
      ],
      rating: 4.5,
      reviews: 1000,
      originalPrice: 189,
      currentPrice: 149,
      highlights: ["Great views", "Professional guide"],
      includes: ["Transportation", "Guide", "Refreshments"],
      features: ["Instant confirmation", "Mobile ticket"],
      availableSlots: [
        {
          date: new Date().toISOString().split("T")[0],
          times: ["09:00", "14:00"],
        },
      ],
      ticketTypes: [
        { name: "Standard", price: 149, features: ["Standard access"] },
      ],
    };

    res.json({ success: true, activity: sampleActivity });
  } catch (error) {
    console.error("Get activity details error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get activity details",
      details: error.message,
    });
  }
});

// Route: Validate promo code
router.post("/promocode/validate", async (req, res) => {
  try {
    const { code, totalAmount, destination, category, userEmail } = req.body;

    if (!code || !totalAmount) {
      return res.status(400).json({
        success: false,
        error: "Promo code and total amount are required",
      });
    }

    const promoQuery = `
      SELECT * FROM sightseeing_promocodes 
      WHERE UPPER(code) = UPPER($1) 
      AND is_active = true 
      AND valid_from <= CURRENT_TIMESTAMP 
      AND valid_to >= CURRENT_TIMESTAMP
      AND (usage_limit IS NULL OR usage_count < usage_limit)
      AND $2 >= minimum_booking_amount
    `;

    const promoResult = await pool.query(promoQuery, [code, totalAmount]);

    if (promoResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid or expired promo code",
      });
    }

    const promo = promoResult.rows[0];

    // Check destination/category restrictions
    if (
      promo.applicable_destinations &&
      !promo.applicable_destinations.includes(destination)
    ) {
      return res.status(400).json({
        success: false,
        error: "Promo code not applicable for this destination",
      });
    }

    if (
      promo.applicable_categories &&
      !promo.applicable_categories.includes(category)
    ) {
      return res.status(400).json({
        success: false,
        error: "Promo code not applicable for this category",
      });
    }

    // Check per-user usage limit
    if (userEmail && promo.usage_limit_per_user) {
      const usageQuery = `
        SELECT COUNT(*) as usage_count 
        FROM sightseeing_promo_usage 
        WHERE promo_id = $1 AND user_email = $2
      `;
      const usageResult = await pool.query(usageQuery, [promo.id, userEmail]);

      if (usageResult.rows[0].usage_count >= promo.usage_limit_per_user) {
        return res.status(400).json({
          success: false,
          error: "Promo code usage limit exceeded for this user",
        });
      }
    }

    // Calculate discount
    let discountAmount = 0;
    if (promo.discount_type === "percentage") {
      discountAmount = totalAmount * (promo.discount_value / 100);
      if (promo.maximum_discount && discountAmount > promo.maximum_discount) {
        discountAmount = promo.maximum_discount;
      }
    } else {
      discountAmount = promo.discount_value;
    }

    const finalAmount = Math.max(0, totalAmount - discountAmount);

    res.json({
      success: true,
      promo: {
        id: promo.id,
        code: promo.code,
        title: promo.title,
        description: promo.description,
        discount_type: promo.discount_type,
        discount_value: promo.discount_value,
        discount_amount: discountAmount,
        original_amount: totalAmount,
        final_amount: finalAmount,
      },
    });
  } catch (error) {
    console.error("Validate promo code error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to validate promo code",
      details: error.message,
    });
  }
});

// Route: Create new booking
router.post("/book", async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const {
      activityId,
      visitDate,
      visitTime,
      adults,
      children,
      childrenAges,
      ticketType,
      guestDetails,
      specialRequests,
      promoCode,
      totalAmount,
      basePrice,
      markupAmount,
      discountAmount,
    } = req.body;

    // Generate booking reference
    const bookingRef = "SG" + Date.now().toString().slice(-8);

    // Insert booking
    const bookingQuery = `
      INSERT INTO sightseeing_bookings (
        booking_ref, activity_code, activity_name, visit_date, visit_time,
        adults_count, children_count, children_ages, guest_details,
        ticket_type, base_total, markup_amount, discount_amount, total_amount,
        special_requests, promo_code, status, supplier_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING id, booking_ref, booking_date
    `;

    const bookingValues = [
      bookingRef,
      activityId,
      req.body.activityName || "Sample Activity",
      visitDate,
      visitTime,
      adults,
      children,
      childrenAges,
      guestDetails,
      ticketType,
      basePrice * adults,
      markupAmount,
      discountAmount,
      totalAmount,
      specialRequests,
      promoCode,
      "confirmed",
      1,
    ];

    const bookingResult = await client.query(bookingQuery, bookingValues);
    const booking = bookingResult.rows[0];

    // Update promo code usage if applicable
    if (promoCode) {
      const promoQuery = `
        UPDATE sightseeing_promocodes 
        SET usage_count = usage_count + 1 
        WHERE UPPER(code) = UPPER($1)
        RETURNING id
      `;
      const promoResult = await client.query(promoQuery, [promoCode]);

      if (promoResult.rows.length > 0) {
        await client.query(
          `INSERT INTO sightseeing_promo_usage (promo_id, booking_id, user_email, discount_applied) 
           VALUES ($1, $2, $3, $4)`,
          [
            promoResult.rows[0].id,
            booking.id,
            guestDetails.contactInfo.email,
            discountAmount,
          ],
        );
      }
    }

    await client.query("COMMIT");

    // Generate voucher automatically for confirmed bookings
    try {
      const SightseeingVoucherService = require("../services/sightseeingVoucherService");
      const voucherService = new SightseeingVoucherService();

      const voucherResult = await voucherService.generateVoucher(booking.id);

      res.json({
        success: true,
        booking: {
          id: booking.id,
          booking_ref: bookingRef,
          status: "confirmed",
          booking_date: booking.booking_date,
          total_amount: totalAmount,
        },
        voucher: voucherResult.success
          ? {
              voucher_number: voucherResult.voucher.voucher_number,
              generated: true,
            }
          : null,
      });
    } catch (voucherError) {
      console.error("Voucher generation failed:", voucherError);
      // Still return success for booking, voucher can be generated later
      res.json({
        success: true,
        booking: {
          id: booking.id,
          booking_ref: bookingRef,
          status: "confirmed",
          booking_date: booking.booking_date,
          total_amount: totalAmount,
        },
        voucher: null,
        voucher_error: "Voucher generation failed, will be generated manually",
      });
    }
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Create booking error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create booking",
      details: error.message,
    });
  } finally {
    client.release();
  }
});

// Route: Get booking details
router.get("/booking/:bookingRef", async (req, res) => {
  try {
    const { bookingRef } = req.params;

    const query = `
      SELECT * FROM sightseeing_booking_summary 
      WHERE booking_ref = $1
    `;

    const result = await pool.query(query, [bookingRef]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Booking not found",
      });
    }

    res.json({
      success: true,
      booking: result.rows[0],
    });
  } catch (error) {
    console.error("Get booking error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get booking details",
      details: error.message,
    });
  }
});

// Route: Get all bookings (for admin)
router.get("/bookings", async (req, res) => {
  try {
    const { limit = 50, offset = 0, status, destination } = req.query;

    let query = `
      SELECT * FROM sightseeing_booking_summary 
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ` AND status = $${params.length + 1}`;
      params.push(status);
    }

    if (destination) {
      query += ` AND destination_name ILIKE $${params.length + 1}`;
      params.push(`%${destination}%`);
    }

    query += ` ORDER BY booking_date DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      success: true,
      count: result.rows.length,
      bookings: result.rows,
    });
  } catch (error) {
    console.error("Get bookings error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get bookings",
      details: error.message,
    });
  }
});

// Import voucher service
const SightseeingVoucherService = require("../services/sightseeingVoucherService");
const voucherService = new SightseeingVoucherService();

// Route: Generate voucher for booking
router.post("/voucher/generate/:bookingId", async (req, res) => {
  try {
    const { bookingId } = req.params;

    const result = await voucherService.generateVoucher(bookingId);

    if (result.success) {
      res.json({
        success: true,
        message: "Voucher generated successfully",
        voucher: result.voucher,
        qr_code: result.qr_code,
      });
    } else {
      res.status(400).json({
        success: false,
        error: "Failed to generate voucher",
      });
    }
  } catch (error) {
    console.error("Generate voucher error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate voucher",
      details: error.message,
    });
  }
});

// Route: Get voucher by booking ID
router.get("/voucher/:bookingId", async (req, res) => {
  try {
    const { bookingId } = req.params;

    const result = await voucherService.getVoucherByBookingId(bookingId);

    if (result.success) {
      res.json({
        success: true,
        voucher: result.voucher,
        pdf_exists: result.pdf_exists,
      });
    } else {
      res.status(404).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    console.error("Get voucher error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get voucher",
      details: error.message,
    });
  }
});

// Route: Download voucher PDF
router.get("/voucher/:bookingId/download", async (req, res) => {
  try {
    const { bookingId } = req.params;

    const result = await voucherService.getVoucherByBookingId(bookingId);

    if (!result.success || !result.voucher) {
      return res.status(404).json({
        success: false,
        error: "Voucher not found",
      });
    }

    const fs = require("fs");
    if (!fs.existsSync(result.voucher.pdf_path)) {
      return res.status(404).json({
        success: false,
        error: "Voucher PDF file not found",
      });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="sightseeing-voucher-${result.voucher.voucher_number}.pdf"`,
    );

    const fileStream = fs.createReadStream(result.voucher.pdf_path);
    fileStream.pipe(res);
  } catch (error) {
    console.error("Download voucher error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to download voucher",
      details: error.message,
    });
  }
});

// Route: Verify voucher by QR code
router.post("/voucher/verify", async (req, res) => {
  try {
    const { qr_data } = req.body;

    if (!qr_data) {
      return res.status(400).json({
        success: false,
        error: "QR code data is required",
      });
    }

    const result = await voucherService.verifyVoucher(qr_data);

    res.json(result);
  } catch (error) {
    console.error("Verify voucher error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to verify voucher",
      details: error.message,
    });
  }
});

// Route: Verify voucher by booking reference (simple verification)
router.get("/voucher/verify/:bookingRef", async (req, res) => {
  try {
    const { bookingRef } = req.params;

    const booking = await voucherService.getBookingDetailsByRef(bookingRef);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: "Booking not found",
      });
    }

    const visitDate = new Date(booking.visit_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    visitDate.setHours(0, 0, 0, 0);

    const isValidDate = visitDate >= today;

    res.json({
      success: true,
      booking: {
        booking_ref: booking.booking_ref,
        activity_name: booking.activity_name,
        guest_name: booking.guest_name,
        visit_date: booking.visit_date,
        visit_time: booking.visit_time,
        guest_count: booking.adults_count + booking.children_count,
        status: booking.status,
      },
      valid_for_today: isValidDate,
      verification_time: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Verify voucher by ref error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to verify voucher",
      details: error.message,
    });
  }
});

module.exports = router;
