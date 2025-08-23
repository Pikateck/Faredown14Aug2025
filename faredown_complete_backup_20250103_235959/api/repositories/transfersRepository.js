/**
 * Transfers Repository
 * Handles all database operations for transfers
 */

const { Pool } = require("pg");
const crypto = require("crypto");
const winston = require("winston");

class TransfersRepository {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl:
        process.env.NODE_ENV === "production"
          ? { rejectUnauthorized: false }
          : false,
    });

    this.logger = winston.createLogger({
      level: "info",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} [${level.toUpperCase()}] [TRANSFERS-REPO] ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ""}`;
        }),
      ),
      transports: [new winston.transports.Console()],
    });
  }

  /**
   * Save search cache
   */
  async saveSearchCache(searchHash, searchParams, results, ttlSeconds = 3600) {
    try {
      const query = `
        INSERT INTO transfer_routes_cache (
          search_hash, request_params, raw_response, normalized_products,
          ttl_seconds, expires_at, supplier_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (search_hash) DO UPDATE SET
          raw_response = EXCLUDED.raw_response,
          normalized_products = EXCLUDED.normalized_products,
          expires_at = EXCLUDED.expires_at,
          hit_count = transfer_routes_cache.hit_count + 1,
          updated_at = CURRENT_TIMESTAMP
        RETURNING id
      `;

      const values = [
        searchHash,
        JSON.stringify(searchParams),
        JSON.stringify(results.raw || results),
        JSON.stringify(results.normalized || results),
        ttlSeconds,
        new Date(Date.now() + ttlSeconds * 1000),
        1, // Default to Hotelbeds supplier ID
      ];

      const result = await this.pool.query(query, values);

      this.logger.info("Search cache saved", {
        searchHash: searchHash.substring(0, 8),
        cacheId: result.rows[0]?.id,
      });

      return result.rows[0];
    } catch (error) {
      this.logger.error("Error saving search cache", {
        error: error.message,
        searchHash,
      });
      throw error;
    }
  }

  /**
   * Get search cache
   */
  async getSearchCache(searchHash) {
    try {
      const query = `
        SELECT * FROM transfer_routes_cache 
        WHERE search_hash = $1 AND expires_at > CURRENT_TIMESTAMP
      `;

      const result = await this.pool.query(query, [searchHash]);

      if (result.rows.length > 0) {
        // Update hit count
        await this.pool.query(
          `UPDATE transfer_routes_cache SET hit_count = hit_count + 1 WHERE id = $1`,
          [result.rows[0].id],
        );

        this.logger.info("Search cache hit", {
          searchHash: searchHash.substring(0, 8),
          hitCount: result.rows[0].hit_count + 1,
        });
      }

      return result.rows[0] || null;
    } catch (error) {
      this.logger.error("Error getting search cache", {
        error: error.message,
        searchHash,
      });
      return null;
    }
  }

  /**
   * Save transfer products/offers
   */
  async saveTransferProducts(searchId, offers) {
    try {
      const query = `
        INSERT INTO transfer_products (
          search_session_id, supplier_id, product_code, product_name,
          vehicle_type, vehicle_class, max_passengers, max_luggage,
          pickup_location, pickup_location_code, pickup_type,
          dropoff_location, dropoff_location_code, dropoff_type,
          distance_km, estimated_duration_minutes,
          base_price, currency, features, inclusions,
          cancellation_policy, provider_name, provider_rating,
          supplier_data
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
        RETURNING id
      `;

      const savedProducts = [];

      for (const offer of offers) {
        const values = [
          searchId,
          1, // Default supplier ID for Hotelbeds
          offer.supplierReference || offer.id,
          offer.vehicleName || "Private Transfer",
          offer.vehicleType || "sedan",
          offer.vehicleClass || "Standard",
          offer.maxPassengers || 4,
          offer.maxLuggage || 2,
          offer.meta?.searchParams?.pickupLocation?.name || "",
          offer.meta?.searchParams?.pickupLocation?.code || "",
          offer.meta?.searchParams?.pickupLocation?.type || "airport",
          offer.meta?.searchParams?.dropoffLocation?.name || "",
          offer.meta?.searchParams?.dropoffLocation?.code || "",
          offer.meta?.searchParams?.dropoffLocation?.type || "hotel",
          offer.distance || null,
          offer.duration || null,
          offer.pricing?.netAmount || 0,
          offer.pricing?.currency || "INR",
          JSON.stringify(offer.features || []),
          JSON.stringify(offer.inclusions || []),
          JSON.stringify(offer.cancellationPolicy || {}),
          offer.supplier?.name || "Hotelbeds Transfers",
          offer.supplier?.rating || null,
          JSON.stringify(offer.meta?.originalService || offer),
        ];

        const result = await this.pool.query(query, values);
        savedProducts.push({ ...offer, dbId: result.rows[0].id });
      }

      this.logger.info("Transfer products saved", {
        searchId,
        productCount: savedProducts.length,
      });

      return savedProducts;
    } catch (error) {
      this.logger.error("Error saving transfer products", {
        error: error.message,
        searchId,
      });
      throw error;
    }
  }

  /**
   * Get transfer product by ID
   */
  async getTransferProduct(productId) {
    try {
      const query = `
        SELECT tp.*, s.name as supplier_name
        FROM transfer_products tp
        LEFT JOIN suppliers s ON tp.supplier_id = s.id
        WHERE tp.id = $1 AND tp.is_active = true
      `;

      const result = await this.pool.query(query, [productId]);
      return result.rows[0] || null;
    } catch (error) {
      this.logger.error("Error getting transfer product", {
        error: error.message,
        productId,
      });
      throw error;
    }
  }

  /**
   * Create transfer booking
   */
  async createBooking(bookingData) {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      // Generate booking reference
      const bookingRef = this.generateBookingReference();

      const query = `
        INSERT INTO transfer_bookings (
          booking_ref, supplier_id, user_id, product_id,
          transfer_type, vehicle_type, vehicle_class, product_code, product_name,
          pickup_location, pickup_location_code, pickup_type, pickup_address,
          dropoff_location, dropoff_location_code, dropoff_type, dropoff_address,
          pickup_date, pickup_time, return_date, return_time,
          adults_count, children_count, infants_count, total_passengers,
          guest_details, flight_number, flight_arrival_time,
          special_requests, base_price, markup_amount, discount_amount,
          total_amount, currency, promo_code, bargain_session_id,
          bargain_savings, status, supplier_booking_ref, supplier_response,
          payment_status, payment_method, internal_notes
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
          $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32,
          $33, $34, $35, $36, $37, $38, $39, $40, $41, $42
        ) RETURNING id, booking_ref
      `;

      const values = [
        bookingRef,
        bookingData.supplierId || 1,
        bookingData.userId,
        bookingData.productId,
        bookingData.transferType || "one_way",
        bookingData.vehicleType,
        bookingData.vehicleClass,
        bookingData.productCode,
        bookingData.productName,
        bookingData.pickupLocation,
        bookingData.pickupLocationCode,
        bookingData.pickupType,
        bookingData.pickupAddress,
        bookingData.dropoffLocation,
        bookingData.dropoffLocationCode,
        bookingData.dropoffType,
        bookingData.dropoffAddress,
        bookingData.pickupDate,
        bookingData.pickupTime,
        bookingData.returnDate,
        bookingData.returnTime,
        bookingData.passengers?.adults || 2,
        bookingData.passengers?.children || 0,
        bookingData.passengers?.infants || 0,
        (bookingData.passengers?.adults || 2) +
          (bookingData.passengers?.children || 0),
        JSON.stringify(bookingData.guestDetails),
        bookingData.flightDetails?.flightNumber,
        bookingData.flightDetails?.arrivalTime,
        bookingData.specialRequests,
        bookingData.pricing?.netAmount || 0,
        bookingData.pricing?.markupAmount || 0,
        bookingData.pricing?.discountAmount || 0,
        bookingData.pricing?.totalAmount || 0,
        bookingData.currency || "INR",
        bookingData.promoCode,
        bookingData.bargainSessionId,
        bookingData.bargainSavings || 0,
        "pending",
        bookingData.supplierBookingRef,
        JSON.stringify(bookingData.supplierResponse || {}),
        bookingData.paymentStatus || "pending",
        bookingData.paymentMethod || "online",
        bookingData.internalNotes,
      ];

      const result = await client.query(query, values);
      const booking = result.rows[0];

      // Save audit log
      await this.saveAuditLog(client, {
        bookingId: booking.id,
        eventType: "booking_created",
        eventDescription: "Transfer booking created",
        userId: bookingData.userId,
        userEmail: bookingData.guestDetails?.email,
        ipAddress: bookingData.ipAddress,
        userAgent: bookingData.userAgent,
        requestPayload: bookingData,
        sessionId: bookingData.sessionId,
      });

      await client.query("COMMIT");

      this.logger.info("Transfer booking created", {
        bookingId: booking.id,
        bookingRef: booking.booking_ref,
        userId: bookingData.userId,
      });

      return booking;
    } catch (error) {
      await client.query("ROLLBACK");
      this.logger.error("Error creating transfer booking", {
        error: error.message,
      });
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Update booking status
   */
  async updateBookingStatus(
    bookingId,
    status,
    supplierResponse = null,
    userId = null,
  ) {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      const query = `
        UPDATE transfer_bookings 
        SET status = $1, 
            supplier_response = COALESCE($2, supplier_response),
            updated_at = CURRENT_TIMESTAMP,
            confirmation_date = CASE WHEN $1 = 'confirmed' THEN CURRENT_TIMESTAMP ELSE confirmation_date END,
            cancellation_date = CASE WHEN $1 = 'cancelled' THEN CURRENT_TIMESTAMP ELSE cancellation_date END,
            completion_date = CASE WHEN $1 = 'completed' THEN CURRENT_TIMESTAMP ELSE completion_date END
        WHERE id = $3
        RETURNING booking_ref, status
      `;

      const result = await client.query(query, [
        status,
        supplierResponse ? JSON.stringify(supplierResponse) : null,
        bookingId,
      ]);

      if (result.rows.length === 0) {
        throw new Error("Booking not found");
      }

      // Save audit log
      await this.saveAuditLog(client, {
        bookingId,
        eventType: "status_changed",
        eventDescription: `Booking status changed to ${status}`,
        userId,
        newValues: { status },
        responsePayload: supplierResponse,
      });

      await client.query("COMMIT");

      this.logger.info("Booking status updated", {
        bookingId,
        status,
        bookingRef: result.rows[0].booking_ref,
      });

      return result.rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      this.logger.error("Error updating booking status", {
        error: error.message,
        bookingId,
        status,
      });
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get booking by ID
   */
  async getBooking(bookingId, userId = null, isAdmin = false) {
    try {
      let query = `
        SELECT tb.*, s.name as supplier_name, u.email as user_email
        FROM transfer_bookings tb
        LEFT JOIN suppliers s ON tb.supplier_id = s.id
        LEFT JOIN users u ON tb.user_id = u.id
        WHERE tb.id = $1
      `;

      const params = [bookingId];

      // Add user filter for non-admin users
      if (!isAdmin && userId) {
        query += ` AND tb.user_id = $2`;
        params.push(userId);
      }

      const result = await this.pool.query(query, params);
      return result.rows[0] || null;
    } catch (error) {
      this.logger.error("Error getting booking", {
        error: error.message,
        bookingId,
        userId,
      });
      throw error;
    }
  }

  /**
   * Get bookings with filters (admin)
   */
  async getBookings(filters = {}) {
    try {
      const {
        status,
        dateFrom,
        dateTo,
        supplier,
        page = 1,
        limit = 50,
        userId,
      } = filters;

      let query = `
        SELECT tb.*, s.name as supplier_name, u.email as user_email
        FROM transfer_bookings tb
        LEFT JOIN suppliers s ON tb.supplier_id = s.id
        LEFT JOIN users u ON tb.user_id = u.id
        WHERE 1=1
      `;

      const params = [];
      let paramCount = 0;

      if (status) {
        paramCount++;
        query += ` AND tb.status = $${paramCount}`;
        params.push(status);
      }

      if (dateFrom) {
        paramCount++;
        query += ` AND tb.pickup_date >= $${paramCount}`;
        params.push(dateFrom);
      }

      if (dateTo) {
        paramCount++;
        query += ` AND tb.pickup_date <= $${paramCount}`;
        params.push(dateTo);
      }

      if (supplier) {
        paramCount++;
        query += ` AND s.name ILIKE $${paramCount}`;
        params.push(`%${supplier}%`);
      }

      if (userId) {
        paramCount++;
        query += ` AND tb.user_id = $${paramCount}`;
        params.push(userId);
      }

      // Get total count
      const countQuery = `SELECT COUNT(*) as total FROM (${query}) as filtered_bookings`;
      const countResult = await this.pool.query(countQuery, params);
      const total = parseInt(countResult.rows[0].total);

      // Add pagination
      query += ` ORDER BY tb.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
      params.push(limit, (page - 1) * limit);

      const result = await this.pool.query(query, params);

      return {
        data: result.rows,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error("Error getting bookings", {
        error: error.message,
        filters,
      });
      throw error;
    }
  }

  /**
   * Save audit log
   */
  async saveAuditLog(client, logData) {
    try {
      const query = `
        INSERT INTO transfer_audit_logs (
          booking_id, event_type, event_description, user_id, user_email,
          ip_address, user_agent, old_values, new_values, request_payload,
          response_payload, session_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `;

      const values = [
        logData.bookingId,
        logData.eventType,
        logData.eventDescription,
        logData.userId,
        logData.userEmail,
        logData.ipAddress,
        logData.userAgent,
        logData.oldValues ? JSON.stringify(logData.oldValues) : null,
        logData.newValues ? JSON.stringify(logData.newValues) : null,
        logData.requestPayload
          ? this.encryptPayload(JSON.stringify(logData.requestPayload))
          : null,
        logData.responsePayload
          ? this.encryptPayload(JSON.stringify(logData.responsePayload))
          : null,
        logData.sessionId,
      ];

      await client.query(query, values);
    } catch (error) {
      this.logger.error("Error saving audit log", { error: error.message });
      // Don't throw - audit logging should not break the main flow
    }
  }

  /**
   * Get audit logs
   */
  async getAuditLogs(filters = {}) {
    try {
      const {
        bookingId,
        eventType,
        dateFrom,
        dateTo,
        page = 1,
        limit = 100,
      } = filters;

      let query = `
        SELECT id, booking_id, event_type, event_description, user_id, user_email,
               ip_address, user_agent, old_values, new_values, session_id, created_at
        FROM transfer_audit_logs
        WHERE 1=1
      `;

      const params = [];
      let paramCount = 0;

      if (bookingId) {
        paramCount++;
        query += ` AND booking_id = $${paramCount}`;
        params.push(bookingId);
      }

      if (eventType) {
        paramCount++;
        query += ` AND event_type = $${paramCount}`;
        params.push(eventType);
      }

      if (dateFrom) {
        paramCount++;
        query += ` AND created_at >= $${paramCount}`;
        params.push(dateFrom);
      }

      if (dateTo) {
        paramCount++;
        query += ` AND created_at <= $${paramCount}`;
        params.push(dateTo);
      }

      // Get total count
      const countQuery = `SELECT COUNT(*) as total FROM (${query}) as filtered_logs`;
      const countResult = await this.pool.query(countQuery, params);
      const total = parseInt(countResult.rows[0].total);

      // Add pagination
      query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
      params.push(limit, (page - 1) * limit);

      const result = await this.pool.query(query, params);

      return {
        data: result.rows,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error("Error getting audit logs", {
        error: error.message,
        filters,
      });
      throw error;
    }
  }

  /**
   * Get revenue analytics
   */
  async getRevenueAnalytics(
    dateFrom,
    dateTo,
    supplier = null,
    vehicleType = null,
  ) {
    try {
      let query = `
        SELECT 
          DATE_TRUNC('day', tb.created_at) as booking_date,
          s.name as supplier_name,
          tb.vehicle_type,
          COUNT(*) as total_bookings,
          COUNT(CASE WHEN tb.status = 'confirmed' THEN 1 END) as confirmed_bookings,
          COUNT(CASE WHEN tb.status = 'cancelled' THEN 1 END) as cancelled_bookings,
          SUM(tb.base_price) as total_base_amount,
          SUM(tb.markup_amount) as total_markup_amount,
          SUM(tb.total_amount) as total_revenue,
          AVG(tb.total_amount) as average_booking_value,
          SUM(CASE WHEN tb.payment_status = 'paid' THEN tb.total_amount ELSE 0 END) as paid_revenue
        FROM transfer_bookings tb
        LEFT JOIN suppliers s ON tb.supplier_id = s.id
        WHERE tb.created_at >= $1 AND tb.created_at <= $2
      `;

      const params = [dateFrom, dateTo];
      let paramCount = 2;

      if (supplier) {
        paramCount++;
        query += ` AND s.name ILIKE $${paramCount}`;
        params.push(`%${supplier}%`);
      }

      if (vehicleType) {
        paramCount++;
        query += ` AND tb.vehicle_type = $${paramCount}`;
        params.push(vehicleType);
      }

      query += ` GROUP BY DATE_TRUNC('day', tb.created_at), s.name, tb.vehicle_type
                 ORDER BY booking_date DESC, total_revenue DESC`;

      const result = await this.pool.query(query, params);

      return result.rows;
    } catch (error) {
      this.logger.error("Error getting revenue analytics", {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Generate unique booking reference
   */
  generateBookingReference() {
    const prefix = "TR";
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  }

  /**
   * Generate search hash for caching
   */
  generateSearchHash(searchParams) {
    const normalized = {
      pickup:
        searchParams.pickupLocation?.code || searchParams.pickupLocation?.name,
      dropoff:
        searchParams.dropoffLocation?.code ||
        searchParams.dropoffLocation?.name,
      date: searchParams.pickupDate,
      time: searchParams.pickupTime,
      passengers: `${searchParams.passengers?.adults || 2}-${searchParams.passengers?.children || 0}`,
      vehicle: searchParams.vehicleType || "any",
      roundTrip: searchParams.isRoundTrip || false,
      returnDate: searchParams.returnDate || null,
    };

    return crypto
      .createHash("md5")
      .update(JSON.stringify(normalized))
      .digest("hex");
  }

  /**
   * Encrypt sensitive payload data
   */
  encryptPayload(payload) {
    try {
      const secret = process.env.AUDIT_ENCRYPTION_KEY || "default-secret-key";
      const cipher = crypto.createCipher("aes-256-cbc", secret);
      let encrypted = cipher.update(payload, "utf8", "hex");
      encrypted += cipher.final("hex");
      return encrypted;
    } catch (error) {
      this.logger.error("Error encrypting payload", { error: error.message });
      return "[ENCRYPTION_FAILED]";
    }
  }

  /**
   * Clean up expired cache entries
   */
  async cleanupExpiredCache() {
    try {
      const result = await this.pool.query(
        `DELETE FROM transfer_routes_cache WHERE expires_at < CURRENT_TIMESTAMP`,
      );

      this.logger.info(`Cleaned up ${result.rowCount} expired cache entries`);
      return result.rowCount;
    } catch (error) {
      this.logger.error("Error cleaning up expired cache", {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const result = await this.pool.query("SELECT 1 as health");
      return { status: "healthy", database: "connected" };
    } catch (error) {
      this.logger.error("Database health check failed", {
        error: error.message,
      });
      return {
        status: "unhealthy",
        database: "disconnected",
        error: error.message,
      };
    }
  }
}

module.exports = new TransfersRepository();
