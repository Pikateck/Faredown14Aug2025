/**
 * Test endpoint for Hotelbeds API integration
 * Verify credentials and basic functionality
 */

const express = require("express");
const router = express.Router();
const contentService = require("../services/hotelbeds/contentService");
const bookingService = require("../services/hotelbeds/bookingService");

/**
 * Test Hotelbeds API credentials and connectivity
 * GET /api/test-hotelbeds/credentials
 */
router.get("/credentials", async (req, res) => {
  try {
    console.log("🔑 Testing Hotelbeds API credentials...");
    
    const config = {
      apiKey: process.env.HOTELBEDS_API_KEY,
      secret: process.env.HOTELBEDS_SECRET,
      contentAPI: process.env.HOTELBEDS_CONTENT_API,
      bookingAPI: process.env.HOTELBEDS_BOOKING_API
    };
    
    // Mask sensitive data for response
    const maskedConfig = {
      apiKey: config.apiKey ? `${config.apiKey.substring(0, 8)}...` : 'NOT_SET',
      secret: config.secret ? `${config.secret.substring(0, 4)}...` : 'NOT_SET',
      contentAPI: config.contentAPI,
      bookingAPI: config.bookingAPI
    };
    
    console.log("API Configuration:", maskedConfig);
    
    res.json({
      success: true,
      message: "Hotelbeds API credentials configured",
      config: maskedConfig,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("❌ Credentials test error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Test Hotelbeds Content API
 * GET /api/test-hotelbeds/content
 */
router.get("/content", async (req, res) => {
  try {
    console.log("🏨 Testing Hotelbeds Content API...");
    
    // Test getting destinations
    const destinations = await contentService.getDestinations('ES'); // Spain as test
    
    res.json({
      success: true,
      message: "Content API working",
      data: {
        destinationsCount: destinations.length,
        sampleDestinations: destinations.slice(0, 3),
        testPerformed: "getDestinations('ES')"
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("❌ Content API test error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: "Content API test failed",
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Test Hotelbeds Booking API with availability search
 * GET /api/test-hotelbeds/booking
 */
router.get("/booking", async (req, res) => {
  try {
    console.log("💰 Testing Hotelbeds Booking API...");
    
    // Test availability search for tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);
    
    const testSearch = {
      destination: 'PMI', // Palma, Mallorca - common test destination
      checkIn: tomorrow.toISOString(),
      checkOut: dayAfter.toISOString(),
      rooms: 1,
      adults: 2,
      children: 0,
      currency: 'USD'
    };
    
    console.log("Test search parameters:", testSearch);
    
    const availability = await bookingService.searchAvailability(testSearch);
    
    res.json({
      success: true,
      message: "Booking API working",
      data: {
        hotelsFound: availability.hotels?.length || 0,
        sampleHotels: availability.hotels?.slice(0, 2) || [],
        searchParams: testSearch,
        testPerformed: "searchAvailability for PMI"
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("❌ Booking API test error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: "Booking API test failed",
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Test full integration (content + booking)
 * GET /api/test-hotelbeds/integration
 */
router.get("/integration", async (req, res) => {
  try {
    console.log("🔄 Testing full Hotelbeds integration...");
    
    const results = {
      credentials: { status: 'checking...' },
      content: { status: 'checking...' },
      booking: { status: 'checking...' },
      overall: { status: 'testing...' }
    };
    
    // Test 1: Credentials
    try {
      if (process.env.HOTELBEDS_API_KEY && process.env.HOTELBEDS_SECRET) {
        results.credentials = { 
          status: 'ok', 
          apiKey: `${process.env.HOTELBEDS_API_KEY.substring(0, 8)}...` 
        };
      } else {
        results.credentials = { status: 'error', message: 'API credentials not configured' };
      }
    } catch (error) {
      results.credentials = { status: 'error', message: error.message };
    }
    
    // Test 2: Content API
    try {
      const contentHealth = await contentService.healthCheck();
      results.content = { 
        status: contentHealth.status === 'healthy' ? 'ok' : 'error',
        ...contentHealth 
      };
    } catch (error) {
      results.content = { status: 'error', message: error.message };
    }
    
    // Test 3: Booking API  
    try {
      const bookingHealth = await bookingService.healthCheck();
      results.booking = { 
        status: bookingHealth.status === 'healthy' ? 'ok' : 'error',
        ...bookingHealth 
      };
    } catch (error) {
      results.booking = { status: 'error', message: error.message };
    }
    
    // Overall status
    const allOk = [results.credentials, results.content, results.booking]
      .every(test => test.status === 'ok');
    
    results.overall = {
      status: allOk ? 'ok' : 'error',
      message: allOk ? 'All systems operational' : 'Some systems have issues',
      readyForProduction: allOk
    };
    
    const httpStatus = allOk ? 200 : 500;
    
    res.status(httpStatus).json({
      success: allOk,
      message: "Full integration test completed",
      results: results,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("❌ Integration test error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Integration test failed",
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
