const express = require("express");
const router = express.Router();
const HotelbedsActivitiesService = require("../services/hotelbedsActivitiesService");

// Initialize the Hotelbeds Activities service
const activitiesService = new HotelbedsActivitiesService();

/**
 * POST /api/sightseeing/destinations
 * Search sightseeing destinations using Hotelbeds Activities API
 */
router.post("/destinations", async (req, res) => {
  try {
    const { query = "", limit = 10, popularOnly = false } = req.body;

    console.log(`🎯 Sightseeing destinations API called with query: "${query}"`);

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

    // Filter by query if provided
    if (query && query.length > 0) {
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

    // If popularOnly is requested, filter to popular destinations
    if (popularOnly) {
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

    console.log(`✅ Found ${destinations.length} sightseeing destinations`);

    res.json({
      success: true,
      data: { destinations },
    });
  } catch (error) {
    console.error("❌ Sightseeing destinations API error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

module.exports = router;
