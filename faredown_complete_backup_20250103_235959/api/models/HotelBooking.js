/**
 * Hotel Booking Database Model
 * Handles all database operations for hotel bookings
 */

const db = require("../database/connection");

class HotelBooking {
  constructor() {
    this.tableName = "hotel_bookings";
  }

  /**
   * Create a new hotel booking
   */
  async create(bookingData) {
    const {
      booking_ref,
      supplier_id,
      user_id,
      hotel_code,
      hotel_name,
      hotel_address,
      hotel_city,
      hotel_country,
      hotel_rating,
      room_type,
      room_name,
      room_code,
      giata_room_type,
      max_occupancy,
      guest_details,
      check_in_date,
      check_out_date,
      nights,
      rooms_count,
      adults_count,
      children_count,
      children_ages,
      base_price,
      markup_amount,
      markup_percentage,
      taxes,
      fees,
      total_amount,
      currency,
      status,
      supplier_booking_ref,
      supplier_response,
      special_requests,
      internal_notes,
    } = bookingData;

    const query = `
      INSERT INTO ${this.tableName} (
        booking_ref, supplier_id, user_id, hotel_code, hotel_name, hotel_address,
        hotel_city, hotel_country, hotel_rating, room_type, room_name, room_code,
        giata_room_type, max_occupancy, guest_details, check_in_date, check_out_date,
        nights, rooms_count, adults_count, children_count, children_ages,
        base_price, markup_amount, markup_percentage, taxes, fees, total_amount,
        currency, status, supplier_booking_ref, supplier_response,
        special_requests, internal_notes
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
        $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34
      )
      RETURNING *
    `;

    const values = [
      booking_ref,
      supplier_id,
      user_id,
      hotel_code,
      hotel_name,
      hotel_address,
      hotel_city,
      hotel_country,
      hotel_rating,
      room_type,
      room_name,
      room_code,
      giata_room_type,
      max_occupancy,
      JSON.stringify(guest_details),
      check_in_date,
      check_out_date,
      nights,
      rooms_count,
      adults_count,
      children_count,
      children_ages,
      base_price,
      markup_amount,
      markup_percentage,
      taxes,
      fees,
      total_amount,
      currency,
      status,
      supplier_booking_ref,
      JSON.stringify(supplier_response),
      special_requests,
      internal_notes,
    ];

    try {
      const result = await db.query(query, values);
      return {
        success: true,
        data: result.rows[0],
        message: "Booking created successfully",
      };
    } catch (error) {
      console.error("Error creating booking:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to create booking",
      };
    }
  }

  /**
   * Find booking by reference
   */
  async findByReference(booking_ref) {
    const query = `
      SELECT hb.*, s.name as supplier_name
      FROM ${this.tableName} hb
      LEFT JOIN suppliers s ON hb.supplier_id = s.id
      WHERE hb.booking_ref = $1
    `;

    try {
      const result = await db.query(query, [booking_ref]);

      if (result.rows.length === 0) {
        return {
          success: false,
          error: "Booking not found",
          data: null,
        };
      }

      return {
        success: true,
        data: result.rows[0],
      };
    } catch (error) {
      console.error("Error finding booking:", error);
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  }

  /**
   * Update booking status
   */
  async updateStatus(booking_ref, status, additional_data = {}) {
    let updateFields = ["status = $2"];
    let values = [booking_ref, status];
    let paramIndex = 3;

    // Add optional fields
    if (additional_data.supplier_booking_ref) {
      updateFields.push(`supplier_booking_ref = $${paramIndex}`);
      values.push(additional_data.supplier_booking_ref);
      paramIndex++;
    }

    if (additional_data.supplier_response) {
      updateFields.push(`supplier_response = $${paramIndex}`);
      values.push(JSON.stringify(additional_data.supplier_response));
      paramIndex++;
    }

    if (status === "confirmed") {
      updateFields.push(`confirmation_date = CURRENT_TIMESTAMP`);
    } else if (status === "cancelled") {
      updateFields.push(`cancellation_date = CURRENT_TIMESTAMP`);
    }

    const query = `
      UPDATE ${this.tableName}
      SET ${updateFields.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE booking_ref = $1
      RETURNING *
    `;

    try {
      const result = await db.query(query, values);

      if (result.rows.length === 0) {
        return {
          success: false,
          error: "Booking not found",
        };
      }

      return {
        success: true,
        data: result.rows[0],
        message: `Booking status updated to ${status}`,
      };
    } catch (error) {
      console.error("Error updating booking status:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get all bookings with filters
   */
  async getAll(filters = {}, page = 1, limit = 20) {
    let whereConditions = [];
    let values = [];
    let paramIndex = 1;

    // Build where conditions
    if (filters.status) {
      whereConditions.push(`hb.status = $${paramIndex}`);
      values.push(filters.status);
      paramIndex++;
    }

    if (filters.hotel_city) {
      whereConditions.push(`hb.hotel_city ILIKE $${paramIndex}`);
      values.push(`%${filters.hotel_city}%`);
      paramIndex++;
    }

    if (filters.date_from) {
      whereConditions.push(`hb.booking_date >= $${paramIndex}`);
      values.push(filters.date_from);
      paramIndex++;
    }

    if (filters.date_to) {
      whereConditions.push(`hb.booking_date <= $${paramIndex}`);
      values.push(filters.date_to);
      paramIndex++;
    }

    if (filters.supplier_id) {
      whereConditions.push(`hb.supplier_id = $${paramIndex}`);
      values.push(filters.supplier_id);
      paramIndex++;
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";

    // Calculate offset
    const offset = (page - 1) * limit;

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM ${this.tableName} hb
      ${whereClause}
    `;

    // Get bookings
    const dataQuery = `
      SELECT 
        hb.*,
        s.name as supplier_name,
        p.status as payment_status,
        p.gateway_payment_id,
        v.email_sent as voucher_sent
      FROM ${this.tableName} hb
      LEFT JOIN suppliers s ON hb.supplier_id = s.id
      LEFT JOIN payments p ON hb.id = p.booking_id AND p.status = 'completed'
      LEFT JOIN vouchers v ON hb.id = v.booking_id AND v.is_latest = true
      ${whereClause}
      ORDER BY hb.booking_date DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    values.push(limit, offset);

    try {
      const [countResult, dataResult] = await Promise.all([
        db.query(countQuery, values.slice(0, -2)), // Remove limit and offset for count
        db.query(dataQuery, values),
      ]);

      const total = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        data: dataResult.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      console.error("Error getting bookings:", error);
      return {
        success: false,
        error: error.message,
        data: [],
      };
    }
  }

  /**
   * Get booking analytics
   */
  async getAnalytics(dateFrom, dateTo) {
    const query = `
      SELECT 
        COUNT(*) as total_bookings,
        SUM(total_amount) as total_revenue,
        AVG(total_amount) as average_booking_value,
        SUM(markup_amount) as total_markup,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_bookings,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_bookings,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_bookings
      FROM ${this.tableName}
      WHERE booking_date BETWEEN $1 AND $2
    `;

    const cityQuery = `
      SELECT 
        hotel_city,
        COUNT(*) as bookings_count,
        SUM(total_amount) as revenue
      FROM ${this.tableName}
      WHERE booking_date BETWEEN $1 AND $2
      AND status IN ('confirmed', 'completed')
      GROUP BY hotel_city
      ORDER BY bookings_count DESC
      LIMIT 10
    `;

    const monthlyQuery = `
      SELECT 
        DATE_TRUNC('month', booking_date) as month,
        COUNT(*) as bookings,
        SUM(total_amount) as revenue
      FROM ${this.tableName}
      WHERE booking_date BETWEEN $1 AND $2
      AND status IN ('confirmed', 'completed')
      GROUP BY DATE_TRUNC('month', booking_date)
      ORDER BY month DESC
    `;

    try {
      const [analyticsResult, cityResult, monthlyResult] = await Promise.all([
        db.query(query, [dateFrom, dateTo]),
        db.query(cityQuery, [dateFrom, dateTo]),
        db.query(monthlyQuery, [dateFrom, dateTo]),
      ]);

      return {
        success: true,
        data: {
          overview: analyticsResult.rows[0],
          topCities: cityResult.rows,
          monthlyTrend: monthlyResult.rows,
        },
      };
    } catch (error) {
      console.error("Error getting analytics:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Generate unique booking reference
   */
  generateBookingRef() {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `FD${timestamp}${random}`;
  }
}

module.exports = new HotelBooking();
