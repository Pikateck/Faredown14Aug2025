const express = require("express");
const axios = require("axios");
const crypto = require("crypto");
const db = require("../database/connection");
const router = express.Router();

// Hotelbeds Activities API Configuration
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
 * Get markup for sightseeing activities
 */
async function getSightseeingMarkupData(destination, category) {
  try {
    const query = `
      SELECT markup_percentage, markup_type, base_markup 
      FROM sightseeing_markups 
      WHERE (destination_code = $1 OR destination_code = 'ALL') 
      AND (category = $2 OR category = 'ALL') 
      ORDER BY destination_code DESC, category DESC 
      LIMIT 1
    `;

    const result = await db.query(query, [destination, category]);

    if (result.rows && result.rows.length > 0) {
      return result.rows[0];
    }

    // Default markup if none found
    return {
      markup_percentage: 25.0,
      markup_type: "percentage",
      base_markup: 0,
    };
  } catch (error) {
    console.error("Error getting sightseeing markup data:", error);
    return {
      markup_percentage: 25.0,
      markup_type: "percentage",
      base_markup: 0,
    };
  }
}

/**
 * Apply markup to activity price
 */
function applySightseeingMarkup(basePrice, markupData) {
  const { markup_percentage, markup_type, base_markup } = markupData;

  if (markup_type === "percentage") {
    return basePrice * (1 + markup_percentage / 100);
  } else if (markup_type === "fixed") {
    return basePrice + base_markup;
  }

  return basePrice;
}

/**
 * Apply promo code discount for sightseeing
 */
async function applySightseeingPromoCode(price, promoCode, userId = null) {
  if (!promoCode)
    return { finalPrice: price, discount: 0, promoApplied: false };

  try {
    const query = `
      SELECT * FROM promo_codes 
      WHERE code = $1 
      AND is_active = true 
      AND (applicable_to = 'sightseeing' OR applicable_to = 'all')
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
    console.error("Error applying sightseeing promo code:", error);
    return {
      finalPrice: price,
      discount: 0,
      promoApplied: false,
      error: "Promo code application failed",
    };
  }
}

/**
 * Transform Hotelbeds activities data to our format with markup applied
 */
async function transformActivitiesData(activitiesData, searchParams) {
  const activities = activitiesData.activities || [];

  const transformedActivities = await Promise.all(
    activities.map(async (activity, index) => {
      // Get base price from the first available modality
      const firstModality = activity.modalities?.[0];
      const basePrice = firstModality
        ? parseFloat(
            firstModality.rates?.[0]?.rateDetails?.[0]?.totalAmount?.amount ||
              0,
          )
        : 0;
      const currency =
        firstModality?.rates?.[0]?.rateDetails?.[0]?.totalAmount?.currency ||
        "EUR";

      // Get markup data
      const destination = searchParams.destination;
      const category = activity.category?.name || "GENERAL";
      const markupData = await getSightseeingMarkupData(destination, category);

      // Apply markup
      const markedUpPrice = applySightseeingMarkup(basePrice, markupData);

      // Apply promo code if provided
      const promoResult = await applySightseeingPromoCode(
        markedUpPrice,
        searchParams.promoCode,
        searchParams.userId,
      );

      const transformedActivity = {
        id: `hotelbeds_activity_${activity.code || index}`,
        code: activity.code,
        name: activity.name,
        description: activity.description || "",
        category: {
          id: activity.category?.code || "",
          name: activity.category?.name || "General",
          icon: getCategoryIcon(activity.category?.name),
        },
        destination: {
          code: activity.destination?.code || "",
          name: activity.destination?.name || "",
          country: activity.country?.name || "",
        },
        location: {
          address: activity.address || "",
          coordinates: {
            latitude: activity.coordinates?.latitude || 0,
            longitude: activity.coordinates?.longitude || 0,
          },
        },
        duration: {
          value: activity.duration?.value || 0,
          metric: activity.duration?.metric || "HOURS",
        },
        images: (activity.images || []).map((img, imgIndex) => ({
          id: `img_${imgIndex}`,
          url: img.url,
          caption: img.description || "",
          type: "main",
          order: imgIndex,
        })),
        highlights: activity.highlights || [],
        includes: activity.includes || [],
        excludes: activity.excludes || [],
        importantInfo: activity.importantInfo || [],
        cancellationPolicy:
          activity.cancellationPolicy || "Standard cancellation policy",
        rating: activity.rating || 0,
        reviewCount: activity.reviewCount || 0,
        languages: activity.languages || [],
        modalities: (activity.modalities || []).map(
          (modality, modalityIndex) => ({
            id: `modality_${modalityIndex}`,
            code: modality.code,
            name: modality.name,
            description: modality.description || "",
            duration: modality.duration || activity.duration,
            rates: (modality.rates || []).map((rate, rateIndex) => {
              const rateDetail = rate.rateDetails?.[0];
              const modalityBasePrice = parseFloat(
                rateDetail?.totalAmount?.amount || 0,
              );
              const modalityMarkedUpPrice = applySightseeingMarkup(
                modalityBasePrice,
                markupData,
              );

              return {
                id: `rate_${rateIndex}`,
                rateKey: rate.rateKey,
                rateType: rate.rateType,
                price: {
                  amount: modalityMarkedUpPrice,
                  originalAmount: modalityBasePrice,
                  currency: rateDetail?.totalAmount?.currency || currency,
                  breakdown: {
                    basePrice: modalityBasePrice,
                    taxes: 0,
                    fees: 0,
                    markup: modalityMarkedUpPrice - modalityBasePrice,
                    total: modalityMarkedUpPrice,
                  },
                },
                cancellationPolicies: rate.cancellationPolicies || [],
                sessions: rate.sessions || [],
              };
            }),
          }),
        ),
        // Overall pricing with promo code applied
        pricing: {
          originalPrice: basePrice,
          markedUpPrice: markedUpPrice,
          finalPrice: promoResult.finalPrice,
          discount: promoResult.discount,
          currency: currency,
          markupApplied: markupData,
          promoApplied: promoResult.promoApplied,
          promoDetails: promoResult.promoDetails,
        },
        hotelbedsCode: activity.code,
        hotelbedsData: activity, // Store original data for booking
      };

      return transformedActivity;
    }),
  );

  return transformedActivities;
}

/**
 * Save sightseeing search to database
 */
async function saveSightseeingSearchToDatabase(searchParams, results) {
  try {
    const searchQuery = `
      INSERT INTO sightseeing_searches_cache (
        destination, date_from, date_to, 
        adults, children, 
        search_date, results_count, cached_results
      ) VALUES ($1, $2, $3, $4, $5, NOW(), $6, $7)
      RETURNING id
    `;

    const searchValues = [
      searchParams.destination,
      searchParams.dateFrom,
      searchParams.dateTo,
      searchParams.adults || 2,
      searchParams.children || 0,
      results.length,
      JSON.stringify(results),
    ];

    const result = await db.query(searchQuery, searchValues);
    console.log(
      `💾 Sightseeing search saved to database with ID: ${result.rows[0].id}`,
    );

    return result.rows[0].id;
  } catch (error) {
    console.error("Error saving sightseeing search to database:", error);
    return null;
  }
}

/**
 * Sightseeing Search Route - Main API Endpoint
 */
router.get("/search", async (req, res) => {
  try {
    console.log("🎯 Sightseeing search request received:", req.query);

    const {
      destination,
      dateFrom,
      dateTo,
      adults = 2,
      children = 0,
      category,
      promoCode,
      userId,
    } = req.query;

    // Validate required parameters
    if (!destination || !dateFrom) {
      return res.status(400).json({
        success: false,
        error: "Missing required parameters: destination, dateFrom",
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

    // Build Hotelbeds Activities API request
    const activitiesRequest = {
      destination: destinationCode,
      dateFrom: dateFrom,
      dateTo: dateTo || dateFrom,
      paxes: [
        {
          type: "ADULT",
          age: 30,
        },
      ],
    };

    // Add additional pax for adults and children
    for (let i = 1; i < parseInt(adults); i++) {
      activitiesRequest.paxes.push({
        type: "ADULT",
        age: 30,
      });
    }

    for (let i = 0; i < parseInt(children); i++) {
      activitiesRequest.paxes.push({
        type: "CHILD",
        age: 10,
      });
    }

    console.log(
      "📡 Calling Hotelbeds Activities API with request:",
      JSON.stringify(activitiesRequest, null, 2),
    );

    // Call Hotelbeds Activities Search API
    const activitiesResponse = await axios.post(
      `${HOTELBEDS_BASE_URL}/activity-booking-api/1.0/activities/availability`,
      activitiesRequest,
      {
        headers: getHotelbedsHeaders(),
        timeout: 30000,
      },
    );

    console.log(
      `✅ Hotelbeds Activities API returned ${activitiesResponse.data?.activities?.length || 0} activities`,
    );

    // Transform Activities data to our format with markup and promo codes
    const searchParams = { ...req.query };
    const transformedActivities = await transformActivitiesData(
      activitiesResponse.data,
      searchParams,
    );

    // Save search to database
    await saveSightseeingSearchToDatabase(searchParams, transformedActivities);

    // Return results
    res.json({
      success: true,
      data: transformedActivities,
      meta: {
        totalResults: transformedActivities.length,
        searchParams: searchParams,
        source: "hotelbeds_activities_live",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ Sightseeing search error:", error.message);

    // Return fallback data on API failure
    const fallbackActivities = getFallbackSightseeingData(req.query);

    res.json({
      success: true,
      data: fallbackActivities,
      meta: {
        totalResults: fallbackActivities.length,
        searchParams: req.query,
        source: "fallback",
        warning: "Live API unavailable, showing sample data",
        timestamp: new Date().toISOString(),
      },
    });
  }
});

/**
 * Get activity details endpoint
 */
router.get("/details/:activityCode", async (req, res) => {
  try {
    const { activityCode } = req.params;

    console.log(`🎯 Activity details request for: ${activityCode}`);

    // Call Hotelbeds Activity Details API
    const activitiesResponse = await axios.get(
      `${HOTELBEDS_BASE_URL}/activity-content-api/1.0/activities/${activityCode}`,
      {
        headers: getHotelbedsHeaders(),
        timeout: 15000,
      },
    );

    const activityDetails = activitiesResponse.data.activity;

    res.json({
      success: true,
      data: activityDetails,
      source: "hotelbeds_activities_live",
    });
  } catch (error) {
    console.error("❌ Activity details error:", error.message);

    res.status(500).json({
      success: false,
      error: "Failed to fetch activity details",
    });
  }
});

/**
 * Utility Functions
 */
function getCategoryIcon(categoryName) {
  const categoryIcons = {
    MUSEUMS: "building",
    TOURS: "map",
    ATTRACTIONS: "camera",
    NATURE: "tree-pine",
    ADVENTURE: "mountain",
    CULTURAL: "landmark",
    ENTERTAINMENT: "music",
    SPORTS: "football",
    TRANSPORTATION: "car",
    FOOD: "utensils",
  };

  return categoryIcons[categoryName?.toUpperCase()] || "map-pin";
}

/**
 * Fallback sightseeing data when API is unavailable
 */
function getFallbackSightseeingData(searchParams) {
  return [
    {
      id: "fallback_activity_1",
      code: "SAMPLE001",
      name: "City Walking Tour",
      description: "Explore the historic city center with a professional guide",
      category: {
        id: "TOURS",
        name: "Tours",
        icon: "map",
      },
      destination: {
        code: searchParams.destination || "DXB",
        name: searchParams.destination || "Dubai",
        country: "UAE",
      },
      duration: {
        value: 3,
        metric: "HOURS",
      },
      images: [
        {
          id: "img_1",
          url: "https://cdn.builder.io/api/v1/image/assets%2F4235b10530ff469795aa00c0333d773c%2Fsightseeing-placeholder",
          caption: "City Tour",
          type: "main",
          order: 1,
        },
      ],
      highlights: [
        "Professional guide",
        "Small group size",
        "Historic landmarks",
        "Photo opportunities",
      ],
      pricing: {
        originalPrice: 5000,
        markedUpPrice: 6250,
        finalPrice: 5000,
        discount: 0,
        currency: "INR",
        markupApplied: { markup_percentage: 25.0 },
        promoApplied: false,
      },
    },
  ];
}

module.exports = router;
