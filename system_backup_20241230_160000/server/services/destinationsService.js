/**
 * Destinations Database Service
 * Handles database operations for countries, destinations, and hotel caching
 * Integrates with Hotelbeds API for live hotel data
 */

import { Pool } from "pg";

class DestinationsService {
  constructor() {
    // Database connection pool
    this.pool = new Pool({
      connectionString:
        process.env.DATABASE_URL || "postgresql://localhost:5432/faredown_db",
      ssl:
        process.env.DATABASE_URL?.includes("render.com") || process.env.NODE_ENV === "production"
          ? { rejectUnauthorized: false }
          : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000, // Increased for external DB
      statement_timeout: 30000,
      query_timeout: 30000,
    });

    // Initialize database if needed
    this.initializeDatabase();
  }

  /**
   * Initialize database with schema if it doesn't exist
   */
  async initializeDatabase() {
    try {
      // Check if destinations table exists
      const tableCheck = await this.pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'destinations'
      `);

      if (tableCheck.rows.length === 0) {
        console.log(
          "🔧 Destinations database not found, using in-memory fallback",
        );
        // In production, you would run the schema file here
        // For now, we'll use the existing MASTER_DESTINATIONS as fallback
      } else {
        console.log("✅ Destinations database connected successfully");
      }
    } catch (error) {
      console.warn(
        "⚠️ Database connection failed, using fallback mode:",
        error.message,
      );
      this.fallbackMode = true;
    }
  }

  /**
   * Search destinations with autocomplete support
   */
  async searchDestinations(query = "", limit = 20, popularOnly = false) {
    try {
      if (this.fallbackMode) {
        return this.searchDestinationsFallback(query, limit, popularOnly);
      }

      const result = await this.pool.query(
        "SELECT * FROM search_destinations($1, $2, $3)",
        [query, limit, popularOnly],
      );

      return result.rows.map((row) => ({
        id: row.hotelbeds_code,
        code: row.hotelbeds_code,
        name: row.name,
        type: row.type,
        country: row.country_name,
        countryCode: row.country_code,
        flag: row.flag_emoji,
        popular: row.popular,
      }));
    } catch (error) {
      console.error("Database search failed, using fallback:", error);
      return this.searchDestinationsFallback(query, limit, popularOnly);
    }
  }

  /**
   * Fallback search using in-memory MASTER_DESTINATIONS
   */
  searchDestinationsFallback(query = "", limit = 20, popularOnly = false) {
    // Import MASTER_DESTINATIONS from shared file
    const { MASTER_DESTINATIONS } = require("../../shared/destinations");

    let destinations = MASTER_DESTINATIONS;

    // Filter by popularity if requested
    if (popularOnly) {
      destinations = destinations.filter((dest) => dest.popular);
    }

    // Filter by search query
    if (query) {
      const searchTerm = query.toLowerCase();
      destinations = destinations.filter(
        (dest) =>
          dest.name.toLowerCase().includes(searchTerm) ||
          dest.country.toLowerCase().includes(searchTerm) ||
          dest.code.toLowerCase().includes(searchTerm),
      );
    }

    // Sort by popularity and name
    destinations.sort((a, b) => {
      if (a.popular && !b.popular) return -1;
      if (!a.popular && b.popular) return 1;
      return a.name.localeCompare(b.name);
    });

    // Limit results
    return destinations.slice(0, limit).map((dest) => ({
      id: dest.code,
      code: dest.code,
      name: dest.name,
      type: dest.type,
      country: dest.country,
      countryCode: dest.countryCode,
      popular: dest.popular,
    }));
  }

  /**
   * Get destination by code
   */
  async getDestinationByCode(code) {
    try {
      if (this.fallbackMode) {
        const { MASTER_DESTINATIONS } = require("../../shared/destinations");
        return MASTER_DESTINATIONS.find((dest) => dest.code === code);
      }

      const result = await this.pool.query(
        "SELECT * FROM destinations_search_view WHERE hotelbeds_code = $1",
        [code],
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        id: row.hotelbeds_code,
        code: row.hotelbeds_code,
        name: row.name,
        type: row.type,
        country: row.country_name,
        countryCode: row.country_code,
        popular: row.popular,
        coordinates: {
          latitude: row.latitude,
          longitude: row.longitude,
        },
      };
    } catch (error) {
      console.error("Failed to get destination by code:", error);
      return null;
    }
  }

  /**
   * Get popular destinations
   */
  async getPopularDestinations(limit = 10) {
    return this.searchDestinations("", limit, true);
  }

  /**
   * Cache hotel data from Hotelbeds API
   */
  async cacheHotelData(destinationCode, hotels) {
    try {
      if (this.fallbackMode) {
        console.log("📦 Cache skipped (fallback mode)");
        return false;
      }

      // Get destination ID
      const destResult = await this.pool.query(
        "SELECT id FROM destinations WHERE hotelbeds_code = $1",
        [destinationCode],
      );

      if (destResult.rows.length === 0) {
        console.warn("⚠️ Destination not found for caching:", destinationCode);
        return false;
      }

      const destinationId = destResult.rows[0].id;

      // Begin transaction
      const client = await this.pool.connect();

      try {
        await client.query("BEGIN");

        // Clear old cache for this destination
        await client.query(
          "DELETE FROM hotels_cache WHERE destination_code = $1",
          [destinationCode],
        );

        // Insert new hotel data
        for (const hotel of hotels) {
          const insertResult = await client.query(
            `
            INSERT INTO hotels_cache (
              hotelbeds_hotel_id, destination_id, destination_code, name, description,
              star_rating, review_score, review_count, address_street, address_city,
              address_country, latitude, longitude, amenities, facilities, images,
              price_range_min, price_range_max, currency_code, cancellation_policy,
              check_in_time, check_out_time, distance_to_center
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
            RETURNING id
          `,
            [
              hotel.id || hotel.code,
              destinationId,
              destinationCode,
              hotel.name,
              hotel.description,
              hotel.rating || hotel.starRating,
              hotel.reviewScore,
              hotel.reviewCount,
              hotel.address?.street,
              hotel.address?.city,
              hotel.address?.country,
              hotel.location?.latitude,
              hotel.location?.longitude,
              hotel.amenities || [],
              JSON.stringify(hotel.facilities || {}),
              hotel.images || [],
              hotel.priceRange?.min || hotel.currentPrice,
              hotel.priceRange?.max || hotel.originalPrice,
              hotel.currency || "EUR",
              hotel.cancellationPolicy,
              hotel.checkInTime || "15:00",
              hotel.checkOutTime || "11:00",
              hotel.distanceToCenter
                ? parseFloat(hotel.distanceToCenter)
                : null,
            ],
          );

          // Cache room data if available
          if (hotel.rooms && Array.isArray(hotel.rooms)) {
            const hotelCacheId = insertResult.rows[0].id;

            for (const room of hotel.rooms) {
              await client.query(
                `
                INSERT INTO hotel_rooms_cache (
                  hotel_cache_id, hotelbeds_room_id, name, description, size_sqm,
                  bed_type, max_occupancy, price_per_night, currency_code, amenities, features, images
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
              `,
                [
                  hotelCacheId,
                  room.id || `room-${Math.random()}`,
                  room.name,
                  room.description,
                  room.size ? parseInt(room.size) : null,
                  room.bedType,
                  room.maxOccupancy,
                  room.price || room.pricePerNight,
                  room.currency,
                  room.amenities || [],
                  room.features || [],
                  room.images || [],
                ],
              );
            }
          }
        }

        // Update hotel count for destination
        await client.query(
          "UPDATE destinations SET hotel_count = $1 WHERE hotelbeds_code = $2",
          [hotels.length, destinationCode],
        );

        await client.query("COMMIT");
        console.log(`✅ Cached ${hotels.length} hotels for ${destinationCode}`);
        return true;
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("Failed to cache hotel data:", error);
      return false;
    }
  }

  /**
   * Get cached hotel data
   */
  async getCachedHotels(destinationCode, maxAge = 24) {
    try {
      if (this.fallbackMode) {
        return [];
      }

      const result = await this.pool.query(
        `
        SELECT h.*, 
               array_agg(
                 json_build_object(
                   'name', r.name,
                   'description', r.description,
                   'size', r.size_sqm,
                   'bedType', r.bed_type,
                   'maxOccupancy', r.max_occupancy,
                   'price', r.price_per_night,
                   'currency', r.currency_code,
                   'amenities', r.amenities,
                   'features', r.features,
                   'images', r.images
                 )
               ) FILTER (WHERE r.id IS NOT NULL) as rooms
        FROM hotels_cache h
        LEFT JOIN hotel_rooms_cache r ON h.id = r.hotel_cache_id
        WHERE h.destination_code = $1 
          AND h.active = true
          AND h.cache_expires_at > CURRENT_TIMESTAMP
          AND h.last_updated > CURRENT_TIMESTAMP - INTERVAL '${maxAge} hours'
        GROUP BY h.id
        ORDER BY h.star_rating DESC, h.review_score DESC
      `,
        [destinationCode],
      );

      return result.rows.map((row) => ({
        id: row.hotelbeds_hotel_id,
        name: row.name,
        description: row.description,
        rating: row.star_rating,
        reviewScore: row.review_score,
        reviewCount: row.review_count,
        address: {
          street: row.address_street,
          city: row.address_city,
          country: row.address_country,
        },
        location: {
          latitude: row.latitude,
          longitude: row.longitude,
        },
        amenities: row.amenities,
        facilities: row.facilities,
        images: row.images,
        priceRange: {
          min: row.price_range_min,
          max: row.price_range_max,
          currency: row.currency_code,
        },
        rooms: row.rooms || [],
        cancellationPolicy: row.cancellation_policy,
        checkInTime: row.check_in_time,
        checkOutTime: row.check_out_time,
        distanceToCenter: row.distance_to_center,
        lastUpdated: row.last_updated,
      }));
    } catch (error) {
      console.error("Failed to get cached hotels:", error);
      return [];
    }
  }

  /**
   * Track destination search for analytics
   */
  async trackDestinationSearch(destinationCode) {
    try {
      if (this.fallbackMode) {
        return;
      }

      await this.pool.query(
        `
        INSERT INTO destination_searches (destination_id, destination_code, search_date, search_count)
        SELECT d.id, $1, CURRENT_DATE, 1
        FROM destinations d 
        WHERE d.hotelbeds_code = $1
        ON CONFLICT (destination_id, search_date) 
        DO UPDATE SET search_count = destination_searches.search_count + 1
      `,
        [destinationCode],
      );
    } catch (error) {
      console.error("Failed to track search:", error);
    }
  }

  /**
   * Get search analytics
   */
  async getSearchAnalytics(days = 30) {
    try {
      if (this.fallbackMode) {
        return [];
      }

      const result = await this.pool.query(`
        SELECT 
          ds.destination_code,
          d.name,
          d.country_name,
          SUM(ds.search_count) as total_searches,
          SUM(ds.booking_count) as total_bookings,
          MAX(ds.search_date) as last_searched
        FROM destination_searches ds
        JOIN destinations d ON ds.destination_id = d.id
        WHERE ds.search_date >= CURRENT_DATE - INTERVAL '${days} days'
        GROUP BY ds.destination_code, d.name, d.country_name
        ORDER BY total_searches DESC
        LIMIT 20
      `);

      return result.rows;
    } catch (error) {
      console.error("Failed to get analytics:", error);
      return [];
    }
  }

  /**
   * Clean up expired cache entries
   */
  async cleanupExpiredCache() {
    try {
      if (this.fallbackMode) {
        return 0;
      }

      const result = await this.pool.query(
        "DELETE FROM hotels_cache WHERE cache_expires_at < CURRENT_TIMESTAMP",
      );

      console.log(`🧹 Cleaned up ${result.rowCount} expired cache entries`);
      return result.rowCount;
    } catch (error) {
      console.error("Failed to cleanup cache:", error);
      return 0;
    }
  }

  /**
   * Close database connection
   */
  async close() {
    await this.pool.end();
  }
}

export default new DestinationsService();
