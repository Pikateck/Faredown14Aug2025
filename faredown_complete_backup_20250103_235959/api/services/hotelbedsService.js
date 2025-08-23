/**
 * Hotelbeds API Integration Service
 * Handles authentication, content sync, and booking API calls
 */

const axios = require("axios");
const crypto = require("crypto");
const hotelCache = require("../database/hotelCache");

class HotelbedsService {
  constructor() {
    this.config = {
      apiKey:
        process.env.HOTELBEDS_API_KEY || "91d2368789abdb5beec101ce95a9d185",
      secret: process.env.HOTELBEDS_SECRET || "a9ffaaecce",
      contentAPI:
        process.env.HOTELBEDS_CONTENT_API ||
        "https://api.test.hotelbeds.com/hotel-content-api/1.0/",
      bookingAPI:
        process.env.HOTELBEDS_BOOKING_API ||
        "https://api.test.hotelbeds.com/hotel-api/1.0/",
    };

    // Cache for hotel content
    this.hotelCache = new Map();
    this.lastSyncTime = null;
  }

  /**
   * Generate X-Signature for Hotelbeds authentication
   */
  generateSignature() {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = crypto
      .createHash("sha256")
      .update(this.config.apiKey + this.config.secret + timestamp)
      .digest("hex");

    return {
      "Api-key": this.config.apiKey,
      "X-Signature": signature,
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }

  /**
   * Make authenticated request to Hotelbeds API
   */
  async makeRequest(
    endpoint,
    method = "GET",
    data = null,
    isContentAPI = true,
  ) {
    const baseURL = isContentAPI
      ? this.config.contentAPI
      : this.config.bookingAPI;
    const headers = this.generateSignature();

    try {
      const config = {
        method,
        url: `${baseURL}${endpoint}`,
        headers,
        timeout: 30000,
      };

      if (data && (method === "POST" || method === "PUT")) {
        config.data = data;
      } else if (data) {
        config.params = data;
      }

      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error("Hotelbeds API Error Details:");
      console.error("- URL:", `${baseURL}${endpoint}`);
      console.error("- Method:", method);
      console.error("- Headers:", headers);
      console.error("- Status:", error.response?.status);
      console.error("- Status Text:", error.response?.statusText);
      console.error(
        "- Response Data:",
        JSON.stringify(error.response?.data, null, 2),
      );
      console.error("- Error Message:", error.message);
      throw new Error(
        `Hotelbeds API Error: ${error.response?.status} - ${error.response?.statusText || error.message}`,
      );
    }
  }

  /**
   * Get hotel details by codes
   */
  async getHotelDetails(hotelCodes, language = "ENG") {
    try {
      const params = {
        codes: hotelCodes.join(","),
        language,
        useSecondaryLanguage: false,
      };

      const response = await this.makeRequest("hotels", "GET", params, true);
      return response.hotels || [];
    } catch (error) {
      console.error("Error fetching hotel details:", error);
      return [];
    }
  }

  /**
   * Get hotels by destination
   */
  async getHotelsByDestination(destinationCode, language = "ENG") {
    try {
      const params = {
        destinationCodes: destinationCode,
        language,
        fields: "all",
      };

      const response = await this.makeRequest("hotels", "GET", params, true);
      return response.hotels || [];
    } catch (error) {
      console.error("Error fetching hotels by destination:", error);
      return [];
    }
  }

  /**
   * Search destinations
   */
  async searchDestinations(query, language = "ENG") {
    try {
      console.log(`🔍 Searching destinations for: ${query}`);

      const response = await this.makeRequest(
        `locations/destinations?fields=all&language=${language}&from=1&to=1000&useSecondaryLanguage=true`,
        "GET",
        null,
        true,
      );

      console.log(
        "🔍 Destinations response status:",
        response ? "success" : "failed",
      );
      if (
        response &&
        response.destinations &&
        response.destinations.length > 0
      ) {
        console.log(
          "🔍 Sample destination structure:",
          JSON.stringify(response.destinations[0], null, 2),
        );
      }

      const destinations = response.destinations || [];

      // Filter destinations by query
      const filtered = destinations.filter((dest) => {
        const name = (dest.name?.content || dest.name || "").toString();
        const countryName = (
          dest.countryName?.content ||
          dest.countryName ||
          ""
        ).toString();
        return (
          name.toLowerCase().includes(query.toLowerCase()) ||
          countryName.toLowerCase().includes(query.toLowerCase())
        );
      });

      console.log(
        `✅ Found ${filtered.length} destinations matching "${query}"`,
      );

      return filtered.map((dest) => ({
        code: dest.code,
        name: dest.name?.content || dest.name,
        countryName: dest.countryName?.content || dest.countryName,
        isoCode: dest.isoCode,
        type: "destination",
      }));
    } catch (error) {
      console.error("Error searching destinations:", error);

      // Fallback to known destination codes for testing
      const knownDestinations = [
        {
          code: "MAD",
          name: "Madrid",
          countryName: "Spain",
          type: "destination",
        },
        {
          code: "BCN",
          name: "Barcelona",
          countryName: "Spain",
          type: "destination",
        },
        {
          code: "PMI",
          name: "Palma",
          countryName: "Spain",
          type: "destination",
        },
        {
          code: "VLC",
          name: "Valencia",
          countryName: "Spain",
          type: "destination",
        },
        {
          code: "SVQ",
          name: "Seville",
          countryName: "Spain",
          type: "destination",
        },
        {
          code: "AGP",
          name: "Malaga",
          countryName: "Spain",
          type: "destination",
        },
        {
          code: "LPA",
          name: "Las Palmas",
          countryName: "Spain",
          type: "destination",
        },
        {
          code: "TFS",
          name: "Tenerife",
          countryName: "Spain",
          type: "destination",
        },
      ];

      return knownDestinations.filter(
        (dest) =>
          dest.name.toLowerCase().includes(query.toLowerCase()) ||
          dest.countryName.toLowerCase().includes(query.toLowerCase()),
      );
    }
  }

  /**
   * Get room types and categories
   */
  async getRoomTypes(language = "ENG") {
    try {
      const params = { language };
      const response = await this.makeRequest(
        "types/rooms",
        "GET",
        params,
        true,
      );
      return response.rooms || [];
    } catch (error) {
      console.error("Error fetching room types:", error);
      return [];
    }
  }

  /**
   * Get hotel facilities
   */
  async getHotelFacilities(language = "ENG") {
    try {
      const params = { language };
      const response = await this.makeRequest(
        "types/facilities",
        "GET",
        params,
        true,
      );
      return response.facilities || [];
    } catch (error) {
      console.error("Error fetching facilities:", error);
      return [];
    }
  }

  /**
   * Search hotel availability and rates
   */
  async searchAvailability(searchParams) {
    try {
      const requestBody = {
        stay: {
          checkIn: searchParams.checkIn,
          checkOut: searchParams.checkOut,
        },
        occupancies: [
          {
            rooms: searchParams.rooms || 1,
            adults: searchParams.adults || 2,
            children: searchParams.children || 0,
          },
        ],
      };

      // Add destination filter using the correct API format
      if (searchParams.destination || searchParams.destinationCode) {
        requestBody.hotels = {
          destination: searchParams.destination || searchParams.destinationCode,
        };
      }

      console.log(
        "🔴 Hotelbeds API Request:",
        JSON.stringify(requestBody, null, 2),
      );

      const response = await this.makeRequest(
        "hotels",
        "POST",
        requestBody,
        false,
      );
      console.log(
        "🔴 Hotelbeds API Response:",
        JSON.stringify(response, null, 2),
      );

      return response.hotels || [];
    } catch (error) {
      console.error("Error searching availability:", error);
      return [];
    }
  }

  /**
   * Get detailed hotel information with rates
   */
  async getHotelAvailability(
    hotelCode,
    checkIn,
    checkOut,
    rooms = 1,
    adults = 2,
    children = 0,
  ) {
    try {
      const requestBody = {
        stay: {
          checkIn,
          checkOut,
        },
        occupancies: [
          {
            rooms,
            adults,
            children,
          },
        ],
        hotels: {
          hotel: [{ code: hotelCode }],
        },
      };

      const response = await this.makeRequest(
        "hotels",
        "POST",
        requestBody,
        false,
      );
      return response.hotels?.[0] || null;
    } catch (error) {
      console.error("Error getting hotel availability:", error);
      return null;
    }
  }

  /**
   * Sync hotel content for specific destinations
   */
  async syncHotelContent(destinationCodes = [], forceSync = false) {
    try {
      const now = Date.now();
      const oneDayInMs = 24 * 60 * 60 * 1000;

      // Check if sync is needed
      if (
        !forceSync &&
        this.lastSyncTime &&
        now - this.lastSyncTime < oneDayInMs
      ) {
        console.log("Hotel content sync skipped - recent sync available");
        return {
          success: true,
          message: "Sync skipped - recent data available",
        };
      }

      console.log("Starting hotel content sync...");
      let totalHotels = 0;

      for (const destCode of destinationCodes) {
        console.log(`Syncing hotels for destination: ${destCode}`);

        const hotels = await this.getHotelsByDestination(destCode);

        for (const hotel of hotels) {
          this.hotelCache.set(hotel.code, {
            ...hotel,
            lastUpdated: now,
            destinationCode: destCode,
          });
          totalHotels++;
        }
      }

      this.lastSyncTime = now;
      console.log(
        `Hotel content sync completed. ${totalHotels} hotels cached.`,
      );

      return {
        success: true,
        message: `Synced ${totalHotels} hotels for ${destinationCodes.length} destinations`,
        totalHotels,
        lastSyncTime: this.lastSyncTime,
      };
    } catch (error) {
      console.error("Error syncing hotel content:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get cached hotel by code
   */
  getCachedHotel(hotelCode) {
    return this.hotelCache.get(hotelCode) || null;
  }

  /**
   * Get all cached hotels for a destination
   */
  getCachedHotelsByDestination(destinationCode) {
    const hotels = [];
    for (const [code, hotel] of this.hotelCache.entries()) {
      if (hotel.destinationCode === destinationCode) {
        hotels.push(hotel);
      }
    }
    return hotels;
  }

  /**
   * Clear hotel cache
   */
  clearCache() {
    this.hotelCache.clear();
    this.lastSyncTime = null;
    console.log("Hotel cache cleared");
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      totalHotels: this.hotelCache.size,
      lastSyncTime: this.lastSyncTime,
      isStale: this.lastSyncTime
        ? Date.now() - this.lastSyncTime > 24 * 60 * 60 * 1000
        : true,
    };
  }

  /**
   * Transform Hotelbeds hotel data to our format
   */
  transformHotelData(hotelbedsHotel, rates = null) {
    const hotel = {
      id: hotelbedsHotel.code,
      supplierId: "hotelbeds",
      name: hotelbedsHotel.name?.content || hotelbedsHotel.name,
      description: hotelbedsHotel.description?.content || "",
      address: {
        street: hotelbedsHotel.address?.content || "",
        city: hotelbedsHotel.city?.content || "",
        country: hotelbedsHotel.country?.description || "",
        postalCode: hotelbedsHotel.postalCode || "",
      },
      location: {
        latitude: hotelbedsHotel.coordinates?.latitude || 0,
        longitude: hotelbedsHotel.coordinates?.longitude || 0,
        address: hotelbedsHotel.address?.content || "",
        city: hotelbedsHotel.city?.content || "",
        country: hotelbedsHotel.country?.description || "",
      },
      rating: 0, // Will be calculated from reviews
      starRating: hotelbedsHotel.categoryCode
        ? parseInt(hotelbedsHotel.categoryCode.replace(/\D/g, ""))
        : 0,
      reviewCount: 0,
      images: (hotelbedsHotel.images || []).map((img, index) => ({
        id: `${hotelbedsHotel.code}_${index}`,
        url: img.path,
        caption: img.type?.description || "",
        type: img.visualOrder === 1 ? "exterior" : "interior",
        order: img.visualOrder || index + 1,
      })),
      amenities: (hotelbedsHotel.facilities || []).map((facility) => ({
        id: facility.facilityCode,
        name: facility.description?.content || "",
        icon: this.mapFacilityToIcon(facility.facilityCode),
        category: this.mapFacilityToCategory(facility.facilityCode),
        available: true,
        fee: facility.indFee ? 0 : undefined,
      })),
      roomTypes: rates?.rooms || [],
      policies: {
        checkIn: hotelbedsHotel.checkIn || "15:00",
        checkOut: hotelbedsHotel.checkOut || "11:00",
        cancellation: "Varies by rate",
        children: "Children allowed",
        pets: "Contact hotel",
        smoking: "Varies by room",
      },
      contact: {
        phone: hotelbedsHotel.phones?.[0]?.phoneNumber || "",
        email: hotelbedsHotel.email || "",
        website: hotelbedsHotel.web || "",
      },
      priceRange: rates
        ? {
            min: Math.min(
              ...rates.rooms.map((room) => room.rates?.[0]?.net || 0),
            ),
            max: Math.max(
              ...rates.rooms.map((room) => room.rates?.[0]?.net || 0),
            ),
            currency: rates.rooms?.[0]?.rates?.[0]?.currency || "EUR",
          }
        : { min: 0, max: 0, currency: "EUR" },
    };

    return hotel;
  }

  /**
   * Map facility codes to icons
   */
  mapFacilityToIcon(facilityCode) {
    const facilityIconMap = {
      1: "wifi",
      2: "car",
      3: "pool",
      4: "restaurant",
      5: "gym",
      6: "spa",
      7: "business",
      8: "pet",
      9: "air-conditioning",
      10: "room-service",
    };
    return facilityIconMap[facilityCode] || "facility";
  }

  /**
   * Map facility codes to categories
   */
  mapFacilityToCategory(facilityCode) {
    const facilityCategoryMap = {
      1: "general", // WiFi
      2: "general", // Parking
      3: "wellness", // Pool
      4: "dining", // Restaurant
      5: "wellness", // Gym
      6: "wellness", // Spa
      7: "business", // Business center
      8: "general", // Pet friendly
      9: "general", // AC
      10: "general", // Room service
    };
    return facilityCategoryMap[facilityCode] || "general";
  }
}

module.exports = new HotelbedsService();
