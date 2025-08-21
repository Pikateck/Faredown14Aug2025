/**
 * GIATA Room Mapping Service
 * Handles room type standardization and mapping
 */

const axios = require("axios");

class GiataService {
  constructor() {
    this.config = {
      baseURL: "https://stagingapi.roommapping.com",
      endpoint: "/Map",
      authorization: "Basic RmFyZWRvd246RjRyM2Rvd240ODcz",
    };

    // Cache for mapped room types
    this.mappingCache = new Map();
  }

  /**
   * Map room types using GIATA API
   */
  async mapRoomTypes(roomData) {
    try {
      // Create cache key
      const cacheKey = this.generateCacheKey(roomData);

      // Check cache first
      if (this.mappingCache.has(cacheKey)) {
        console.log("Using cached GIATA mapping");
        return this.mappingCache.get(cacheKey);
      }

      const requestBody = {
        rooms: Array.isArray(roomData) ? roomData : [roomData],
      };

      const response = await axios.post(
        `${this.config.baseURL}${this.config.endpoint}`,
        requestBody,
        {
          headers: {
            Authorization: this.config.authorization,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          timeout: 15000,
        },
      );

      const mappedData = this.processGiataResponse(response.data);

      // Cache the result
      this.mappingCache.set(cacheKey, mappedData);

      return mappedData;
    } catch (error) {
      console.error(
        "GIATA mapping error:",
        error.response?.data || error.message,
      );

      // Return fallback mapping if GIATA fails
      return this.getFallbackMapping(roomData);
    }
  }

  /**
   * Process GIATA API response
   */
  processGiataResponse(response) {
    if (!response || !response.rooms) {
      return [];
    }

    return response.rooms.map((room) => ({
      originalName: room.originalName || "",
      standardName: room.standardName || room.originalName || "",
      category: room.category || "Standard Room",
      subCategory: room.subCategory || "",
      roomType: room.roomType || "Standard",
      bedType: room.bedType || "Various",
      view: room.view || "",
      accessibility: room.accessibility || false,
      smoking: room.smoking || false,
      confidence: room.confidence || 0.8,
      amenities: room.amenities || [],
      maxOccupancy: room.maxOccupancy || 2,
      size: room.size || "",
    }));
  }

  /**
   * Generate cache key for room data
   */
  generateCacheKey(roomData) {
    const rooms = Array.isArray(roomData) ? roomData : [roomData];
    const keyData = rooms.map((room) => ({
      name: room.name || "",
      description: room.description || "",
      code: room.code || "",
    }));
    return Buffer.from(JSON.stringify(keyData)).toString("base64");
  }

  /**
   * Fallback mapping when GIATA API is unavailable
   */
  getFallbackMapping(roomData) {
    const rooms = Array.isArray(roomData) ? roomData : [roomData];

    return rooms.map((room) => {
      const roomName = room.name || room.description || "Standard Room";
      const standardized = this.standardizeRoomName(roomName);

      return {
        originalName: roomName,
        standardName: standardized.name,
        category: standardized.category,
        subCategory: standardized.subCategory,
        roomType: standardized.type,
        bedType: standardized.bedType,
        view: standardized.view,
        accessibility: false,
        smoking: false,
        confidence: 0.6, // Lower confidence for fallback
        amenities: room.amenities || [],
        maxOccupancy: room.maxOccupancy || 2,
        size: room.size || "",
      };
    });
  }

  /**
   * Standardize room names using pattern matching
   */
  standardizeRoomName(roomName) {
    const name = roomName.toLowerCase();

    // Room categories
    let category = "Standard Room";
    let subCategory = "";
    let type = "Standard";
    let bedType = "Various";
    let view = "";

    // Detect room category
    if (
      name.includes("suite") ||
      name.includes("presidential") ||
      name.includes("royal")
    ) {
      category = "Suite";
      if (name.includes("presidential")) subCategory = "Presidential";
      else if (name.includes("royal")) subCategory = "Royal";
      else if (name.includes("junior")) subCategory = "Junior";
      else subCategory = "Standard";
      type = "Suite";
    } else if (
      name.includes("deluxe") ||
      name.includes("premium") ||
      name.includes("superior")
    ) {
      category = "Deluxe Room";
      if (name.includes("premium")) subCategory = "Premium";
      else if (name.includes("superior")) subCategory = "Superior";
      else subCategory = "Deluxe";
      type = "Deluxe";
    } else if (name.includes("executive") || name.includes("business")) {
      category = "Executive Room";
      subCategory = "Executive";
      type = "Executive";
    } else if (name.includes("family") || name.includes("connecting")) {
      category = "Family Room";
      subCategory = "Family";
      type = "Family";
    }

    // Detect bed type
    if (name.includes("twin") || name.includes("two beds")) {
      bedType = "Twin Beds";
    } else if (name.includes("double") || name.includes("queen")) {
      bedType = "Double Bed";
    } else if (name.includes("king")) {
      bedType = "King Bed";
    } else if (name.includes("single")) {
      bedType = "Single Bed";
    }

    // Detect view
    if (name.includes("sea") || name.includes("ocean")) {
      view = "Sea View";
    } else if (name.includes("city")) {
      view = "City View";
    } else if (name.includes("garden")) {
      view = "Garden View";
    } else if (name.includes("mountain")) {
      view = "Mountain View";
    } else if (name.includes("pool")) {
      view = "Pool View";
    }

    // Construct standardized name
    let standardName = category;
    if (bedType !== "Various") {
      standardName += ` - ${bedType}`;
    }
    if (view) {
      standardName += ` - ${view}`;
    }

    return {
      name: standardName,
      category,
      subCategory,
      type,
      bedType,
      view,
    };
  }

  /**
   * Map Hotelbeds room to standardized format
   */
  async mapHotelbedsRoom(hotelbedsRoom) {
    try {
      const roomData = {
        name: hotelbedsRoom.name || "",
        description: hotelbedsRoom.description || "",
        code: hotelbedsRoom.code || "",
        amenities: hotelbedsRoom.amenities || [],
        maxOccupancy: hotelbedsRoom.maxOccupancy || 2,
        size: hotelbedsRoom.size || "",
      };

      const mappedResults = await this.mapRoomTypes(roomData);
      return mappedResults[0] || this.getFallbackMapping(roomData)[0];
    } catch (error) {
      console.error("Error mapping Hotelbeds room:", error);
      return this.getFallbackMapping(hotelbedsRoom)[0];
    }
  }

  /**
   * Batch map multiple rooms
   */
  async batchMapRooms(rooms) {
    try {
      const roomsData = rooms.map((room) => ({
        name: room.name || "",
        description: room.description || "",
        code: room.code || "",
        amenities: room.amenities || [],
        maxOccupancy: room.maxOccupancy || 2,
        size: room.size || "",
      }));

      return await this.mapRoomTypes(roomsData);
    } catch (error) {
      console.error("Error batch mapping rooms:", error);
      return this.getFallbackMapping(roomsData);
    }
  }

  /**
   * Clear mapping cache
   */
  clearCache() {
    this.mappingCache.clear();
    console.log("GIATA mapping cache cleared");
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      totalMappings: this.mappingCache.size,
      cacheKeys: Array.from(this.mappingCache.keys()).slice(0, 5), // Show first 5 keys
    };
  }

  /**
   * Transform mapped room data for frontend
   */
  transformMappedRoom(originalRoom, mappedRoom, rates = null) {
    return {
      id: originalRoom.code || originalRoom.id,
      originalName: originalRoom.name || "",
      name: mappedRoom.standardName || mappedRoom.originalName,
      description: originalRoom.description || mappedRoom.standardName,
      category: mappedRoom.category,
      subCategory: mappedRoom.subCategory,
      roomType: mappedRoom.roomType,
      bedType: mappedRoom.bedType,
      view: mappedRoom.view,
      maxOccupancy: mappedRoom.maxOccupancy || originalRoom.maxOccupancy || 2,
      size: mappedRoom.size || originalRoom.size || "",
      amenities: this.mergeAmenities(
        originalRoom.amenities || [],
        mappedRoom.amenities || [],
      ),
      features: this.generateRoomFeatures(mappedRoom),
      accessibility: mappedRoom.accessibility,
      smoking: mappedRoom.smoking,
      images: originalRoom.images || [],
      rates: rates || [],
      confidence: mappedRoom.confidence || 0.8,
    };
  }

  /**
   * Merge amenities from original and mapped data
   */
  mergeAmenities(originalAmenities, mappedAmenities) {
    const amenitiesMap = new Map();

    // Add original amenities
    originalAmenities.forEach((amenity) => {
      amenitiesMap.set(amenity.name || amenity, {
        name: amenity.name || amenity,
        icon: amenity.icon || "amenity",
        included: true,
        source: "original",
      });
    });

    // Add mapped amenities
    mappedAmenities.forEach((amenity) => {
      if (!amenitiesMap.has(amenity)) {
        amenitiesMap.set(amenity, {
          name: amenity,
          icon: "amenity",
          included: true,
          source: "mapped",
        });
      }
    });

    return Array.from(amenitiesMap.values());
  }

  /**
   * Generate room features based on mapping
   */
  generateRoomFeatures(mappedRoom) {
    const features = [];

    if (mappedRoom.bedType && mappedRoom.bedType !== "Various") {
      features.push({
        name: mappedRoom.bedType,
        icon: "bed",
        included: true,
      });
    }

    if (mappedRoom.view) {
      features.push({
        name: mappedRoom.view,
        icon: "eye",
        included: true,
      });
    }

    if (mappedRoom.accessibility) {
      features.push({
        name: "Accessible Room",
        icon: "accessibility",
        included: true,
      });
    }

    if (mappedRoom.size) {
      features.push({
        name: `${mappedRoom.size}`,
        icon: "ruler",
        included: true,
      });
    }

    return features;
  }
}

module.exports = new GiataService();
