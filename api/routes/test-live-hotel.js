/**
 * Test Live Hotel Data Endpoint
 * Shows exactly what data we get from Hotelbeds for a specific hotel
 */

const express = require("express");
const router = express.Router();
const contentService = require("../services/hotelbeds/contentService");
const bookingService = require("../services/hotelbeds/bookingService");

/**
 * Test live hotel data for Dubai hotels
 * GET /api/test-live-hotel/dubai
 */
router.get("/dubai", async (req, res) => {
  try {
    console.log("🔍 Testing live Dubai hotel search...");
    
    // Search for availability in Dubai
    const searchParams = {
      destination: 'DXB', // Dubai
      checkIn: '2025-02-01',
      checkOut: '2025-02-03',
      rooms: 1,
      adults: 2,
      children: 0,
      currency: 'USD'
    };
    
    const availability = await bookingService.searchAvailability(searchParams);
    console.log(`Found ${availability.hotels?.length || 0} available hotels`);
    
    // Get the first hotel for detailed testing
    if (availability.hotels && availability.hotels.length > 0) {
      const firstHotel = availability.hotels[0];
      
      // Get detailed content for this hotel
      let contentData = null;
      try {
        const content = await contentService.getHotels([firstHotel.code]);
        contentData = content && content.length > 0 ? content[0] : null;
      } catch (contentError) {
        console.warn("Content API error:", contentError.message);
      }
      
      // Prepare response showing exactly what data is available
      const testResult = {
        success: true,
        message: "Live hotel data test for Dubai",
        searchParams: searchParams,
        results: {
          availabilityData: {
            hotelCode: firstHotel.code,
            hotelName: firstHotel.name,
            pricing: {
              currentPrice: firstHotel.currentPrice,
              totalPrice: firstHotel.totalPrice,
              currency: 'USD'
            },
            availability: {
              available: firstHotel.available,
              rateKey: firstHotel.rateKey ? 'AVAILABLE' : 'NOT_AVAILABLE'
            }
          },
          contentData: contentData ? {
            hotelCode: contentData.code,
            hotelName: contentData.name,
            description: contentData.description || 'No description available',
            images: {
              count: contentData.images ? contentData.images.length : 0,
              sampleImages: contentData.images ? contentData.images.slice(0, 3).map(img => ({
                url: img.url,
                type: img.type
              })) : [],
              allImageUrls: contentData.images ? contentData.images.map(img => img.url) : []
            },
            amenities: {
              count: contentData.amenities ? contentData.amenities.length : 0,
              list: contentData.amenities ? contentData.amenities.map(a => a.name) : []
            },
            location: contentData.location || 'No location data',
            rating: contentData.rating || 'No rating'
          } : {
            error: "Content data not available",
            note: "This means images and detailed descriptions are not available from Hotelbeds Content API"
          },
          combinedResult: {
            // This is what the frontend would receive
            id: firstHotel.code,
            name: contentData?.name || firstHotel.name,
            images: contentData?.images?.map(img => img.url) || [
              "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600",
              "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600"
            ],
            description: contentData?.description || `Experience luxury at ${firstHotel.name}`,
            currentPrice: firstHotel.currentPrice,
            totalPrice: firstHotel.totalPrice,
            rating: contentData?.rating || 4.2,
            amenities: contentData?.amenities?.map(a => a.name) || ["WiFi", "Pool", "Restaurant"],
            available: firstHotel.available,
            isLiveData: true,
            supplier: "hotelbeds"
          }
        },
        dataQuality: {
          hasLivePricing: !!firstHotel.currentPrice,
          hasLiveImages: !!(contentData?.images?.length > 0),
          hasDetailedContent: !!contentData?.description,
          hasAmenities: !!(contentData?.amenities?.length > 0),
          overallQuality: contentData?.images?.length > 0 ? "HIGH" : "MEDIUM"
        },
        timestamp: new Date().toISOString()
      };
      
      res.json(testResult);
      
    } else {
      res.json({
        success: false,
        message: "No hotels found for Dubai",
        searchParams: searchParams,
        error: "No availability data returned from Hotelbeds",
        timestamp: new Date().toISOString()
      });
    }
    
  } catch (error) {
    console.error("❌ Test error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Failed to test live hotel data",
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Test specific hotel by code
 * GET /api/test-live-hotel/hotel/:code
 */
router.get("/hotel/:code", async (req, res) => {
  try {
    const { code } = req.params;
    console.log(`🏨 Testing specific hotel: ${code}`);
    
    // Get content data for this hotel
    const contentData = await contentService.getHotels([code]);
    const hotel = contentData && contentData.length > 0 ? contentData[0] : null;
    
    if (hotel) {
      res.json({
        success: true,
        message: `Hotel content data for ${code}`,
        hotel: {
          code: hotel.code,
          name: hotel.name,
          description: hotel.description,
          images: {
            count: hotel.images?.length || 0,
            urls: hotel.images?.map(img => img.url) || [],
            sampleImages: hotel.images?.slice(0, 5) || []
          },
          amenities: hotel.amenities || [],
          rating: hotel.rating,
          location: hotel.location
        },
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(404).json({
        success: false,
        error: `Hotel ${code} not found`,
        timestamp: new Date().toISOString()
      });
    }
    
  } catch (error) {
    console.error("❌ Hotel test error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Show image comparison (live vs fallback)
 * GET /api/test-live-hotel/images
 */
router.get("/images", async (req, res) => {
  try {
    console.log("🖼️ Testing image availability...");
    
    // Test a few known hotel codes
    const testCodes = ['123456', '789012', '345678']; // Common test hotel codes
    const results = [];
    
    for (const code of testCodes) {
      try {
        const contentData = await contentService.getHotels([code]);
        if (contentData && contentData.length > 0) {
          const hotel = contentData[0];
          results.push({
            hotelCode: code,
            hotelName: hotel.name,
            imageCount: hotel.images?.length || 0,
            images: hotel.images?.slice(0, 3).map(img => ({
              url: img.url,
              type: img.type
            })) || []
          });
        }
      } catch (error) {
        results.push({
          hotelCode: code,
          error: error.message
        });
      }
    }
    
    res.json({
      success: true,
      message: "Image availability test results",
      results: results,
      fallbackImages: [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600",
        "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600",
        "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600"
      ],
      note: "If no live images are available, fallback images are used",
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("❌ Image test error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
