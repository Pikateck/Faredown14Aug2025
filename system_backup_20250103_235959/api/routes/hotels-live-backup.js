/**
 * Live Hotel Search Routes (bypasses fallback for testing)
 */

const express = require("express");
const router = express.Router();
const hotelbedsService = require("../services/hotelbedsService");
const giataService = require("../services/giataService");
const markupService = require("../services/markupService");

/**
 * LIVE hotel search with real Hotelbeds data
 * GET /api/hotels-live/search
 */
router.get("/search", async (req, res) => {
  try {
    const {
      destination,
      checkIn,
      checkOut,
      rooms = 1,
      adults = 2,
      children = 0,
      currency = "INR",
      destinationCode,
    } = req.query;

    console.log("🔴 LIVE API CALL - Bypassing fallback mode");

    // Validate required parameters
    if (!checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        error: "Check-in and check-out dates are required",
      });
    }

    // Search for destinations if destinationCode not provided
    let destCode = destinationCode;
    if (!destCode && destination) {
      console.log(`🔍 Searching destinations for: ${destination}`);
      const destinations =
        await hotelbedsService.searchDestinations(destination);
      if (destinations.length > 0) {
        destCode = destinations[0].code;
        console.log(
          `✅ Found destination code: ${destCode} for ${destinations[0].name}`,
        );
      }
    }

    if (!destCode) {
      return res.status(400).json({
        success: false,
        error: "Valid destination required",
      });
    }

    // Search for hotel availability with LIVE API
    const searchParams = {
      destination: destCode,
      checkIn,
      checkOut,
      rooms: parseInt(rooms),
      adults: parseInt(adults),
      children: parseInt(children),
    };

    console.log("🏨 Searching hotels with params:", searchParams);
    const hotelResults =
      await hotelbedsService.searchAvailability(searchParams);
    console.log(`📊 Found ${hotelResults.length} hotels from Hotelbeds API`);

    if (hotelResults.length === 0) {
      return res.json({
        success: true,
        data: [],
        message: "No hotels found for the specified criteria",
        searchParams,
        isLiveData: true,
      });
    }

    // Process each hotel with GIATA mapping and markup
    const processedHotels = await Promise.all(
      hotelResults.map(async (hotel) => {
        try {
          // Apply GIATA room mapping
          const giataMapping = await giataService.mapRoomTypes({
            hotelCode: hotel.code,
            roomTypes: hotel.rooms || [],
          });

          // Apply markup
          const markup = await markupService.applyHotelMarkup({
            price: hotel.minRate || hotel.price || 0,
            supplier: "hotelbeds",
            destination: destCode,
            currency,
          });

          return {
            id: hotel.code,
            code: hotel.code,
            name: hotel.name,
            description:
              hotel.description ||
              `${hotel.name} offers comfortable accommodation with modern amenities.`,
            address: {
              street: hotel.address || "",
              city: hotel.city || "",
              country: hotel.countryCode || "",
              zipCode: hotel.postalCode || "",
            },
            location: {
              latitude: hotel.latitude || 0,
              longitude: hotel.longitude || 0,
            },
            rating: hotel.categoryCode ? parseInt(hotel.categoryCode) : 4,
            reviewScore: 8.5,
            reviewCount: Math.floor(Math.random() * 1000) + 100,
            currentPrice: markup.finalPrice,
            originalPrice: hotel.minRate || hotel.price || markup.finalPrice,
            currency: currency,
            images: hotel.images || [
              `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400`,
            ],
            amenities: hotel.facilities || [
              "WiFi",
              "Parking",
              "Restaurant",
              "Pool",
            ],
            rooms: hotel.rooms || [
              {
                name: "Standard Room",
                size: "25 sqm",
                bedType: "Double",
                maxOccupancy: 2,
                price: markup.finalPrice,
                currency: currency,
              },
            ],
            cancellationPolicy:
              "Free cancellation until 24 hours before check-in",
            supplier: "hotelbeds",
            supplierHotelId: hotel.code,
            isLiveData: true,
            giataMapping: giataMapping || null,
            markup: markup,
          };
        } catch (processingError) {
          console.error("Error processing hotel:", processingError);
          return null;
        }
      }),
    );

    // Filter out failed hotels
    const validHotels = processedHotels.filter((hotel) => hotel !== null);

    res.json({
      success: true,
      data: validHotels,
      totalResults: validHotels.length,
      searchParams,
      isLiveData: true,
      source: "Hotelbeds API",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Live hotel search error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to search hotels",
      isLiveData: true,
    });
  }
});

/**
 * Live destinations search
 * GET /api/hotels-live/destinations/search
 */
router.get("/destinations/search", async (req, res) => {
  try {
    const { q: query } = req.query;

    if (!query || query.length < 2) {
      return res.status(400).json({
        success: false,
        error: "Query must be at least 2 characters long",
      });
    }

    console.log(`🔴 LIVE DESTINATIONS SEARCH: ${query}`);
    const destinations = await hotelbedsService.searchDestinations(query);
    console.log(
      `📍 Found ${destinations.length} destinations from Hotelbeds API`,
    );

    const formattedDestinations = destinations.map((dest) => ({
      id: dest.code,
      name: dest.name?.content || dest.name,
      type: dest.type || "city",
      country: dest.countryName?.content || dest.country,
      code: dest.code,
    }));

    res.json({
      success: true,
      data: formattedDestinations,
      isLiveData: true,
      source: "Hotelbeds API",
    });
  } catch (error) {
    console.error("Live destination search error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to search destinations",
      isLiveData: true,
    });
  }
});

module.exports = router;
