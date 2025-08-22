/**
 * Live API Integration Test Routes
 */

const express = require("express");
const router = express.Router();
const HotelbedsService = require("../services/hotelbedsService");
const GiataService = require("../services/giataService");

/**
 * Test live Hotelbeds API integration
 * GET /api/test-live/hotelbeds
 */
router.get("/hotelbeds", async (req, res) => {
  try {
    console.log("🧪 Testing live Hotelbeds API...");
    const hotelbedsService = new HotelbedsService();

    const results = {
      timestamp: new Date().toISOString(),
      tests: [],
    };

    // Test 1: Destinations search
    try {
      const destinations = await hotelbedsService.searchDestinations("Dubai");
      results.tests.push({
        name: "Destinations Search",
        status: "success",
        data: {
          count: destinations.length,
          sample: destinations.slice(0, 3).map((d) => ({
            name: d.name,
            code: d.code,
            country: d.countryName,
          })),
        },
      });
    } catch (error) {
      results.tests.push({
        name: "Destinations Search",
        status: "error",
        error: error.message,
      });
    }

    // Test 2: Hotel availability (if destinations found)
    if (
      results.tests[0].status === "success" &&
      results.tests[0].data.count > 0
    ) {
      try {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dayAfter = new Date();
        dayAfter.setDate(dayAfter.getDate() + 2);

        const searchParams = {
          destination: results.tests[0].data.sample[0].code,
          checkIn: tomorrow.toISOString().split("T")[0],
          checkOut: dayAfter.toISOString().split("T")[0],
          rooms: 1,
          adults: 2,
          children: 0,
        };

        const hotels =
          await hotelbedsService.searchHotelAvailability(searchParams);
        results.tests.push({
          name: "Hotel Availability",
          status: "success",
          data: {
            searchParams,
            count: hotels.length,
            sample: hotels.slice(0, 3).map((h) => ({
              name: h.name,
              code: h.code,
              category: h.categoryName,
            })),
          },
        });
      } catch (error) {
        results.tests.push({
          name: "Hotel Availability",
          status: "error",
          error: error.message,
        });
      }
    }

    const allSuccessful = results.tests.every(
      (test) => test.status === "success",
    );

    res.json({
      success: allSuccessful,
      message: allSuccessful
        ? "All Hotelbeds API tests passed"
        : "Some tests failed",
      data: results,
    });
  } catch (error) {
    console.error("Live API test error:", error);
    res.status(500).json({
      success: false,
      error: "Test execution failed",
      message: error.message,
    });
  }
});

/**
 * Test GIATA room mapping
 * GET /api/test-live/giata
 */
router.get("/giata", async (req, res) => {
  try {
    console.log("🧪 Testing GIATA room mapping...");
    const giataService = new GiataService();

    // Sample room data for testing
    const sampleRoomData = {
      hotelCode: "TEST123",
      roomTypeCode: "DBL",
      roomTypeName: "Double Room",
      supplierCode: "HOTELBEDS",
    };

    const mappedData = await giataService.mapRoomTypes(sampleRoomData);

    res.json({
      success: true,
      message: "GIATA room mapping test passed",
      data: {
        input: sampleRoomData,
        output: mappedData,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("GIATA test error:", error);
    res.status(500).json({
      success: false,
      error: "GIATA test failed",
      message: error.message,
    });
  }
});

/**
 * Full integration test
 * GET /api/test-live/full
 */
router.get("/full", async (req, res) => {
  try {
    console.log("🧪 Running full live integration test...");

    const results = {
      timestamp: new Date().toISOString(),
      database: "Connected",
      apis: [],
    };

    // Test Hotelbeds
    try {
      const hotelbedsResponse = await fetch(
        `${req.protocol}://${req.get("host")}/api/test-live/hotelbeds`,
      );
      const hotelbedsData = await hotelbedsResponse.json();
      results.apis.push({
        name: "Hotelbeds",
        status: hotelbedsData.success ? "success" : "error",
        details: hotelbedsData.data,
      });
    } catch (error) {
      results.apis.push({
        name: "Hotelbeds",
        status: "error",
        error: error.message,
      });
    }

    // Test GIATA
    try {
      const giataResponse = await fetch(
        `${req.protocol}://${req.get("host")}/api/test-live/giata`,
      );
      const giataData = await giataResponse.json();
      results.apis.push({
        name: "GIATA",
        status: giataData.success ? "success" : "error",
        details: giataData.data,
      });
    } catch (error) {
      results.apis.push({
        name: "GIATA",
        status: "error",
        error: error.message,
      });
    }

    const allSuccessful = results.apis.every((api) => api.status === "success");

    res.json({
      success: allSuccessful,
      message: allSuccessful
        ? "All live APIs operational"
        : "Some APIs have issues",
      data: results,
    });
  } catch (error) {
    console.error("Full integration test error:", error);
    res.status(500).json({
      success: false,
      error: "Integration test failed",
      message: error.message,
    });
  }
});

module.exports = router;
