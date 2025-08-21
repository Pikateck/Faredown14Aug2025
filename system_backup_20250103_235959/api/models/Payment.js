/**
 * Payment Database Model
 * Handles all database operations for payments
 */

const db = require("../database/connection");

class Payment {
  constructor() {
    this.tableName = "payments";
  }

  /**
   * Create a new payment record
   */
  async create(paymentData) {
    const {
      booking_id,
      gateway,
      gateway_payment_id,
      gateway_order_id,
      amount,
      currency,
      payment_method,
      payment_details,
      status,
      gateway_response,
      gateway_fee,
    } = paymentData;

    const query = `
      INSERT INTO ${this.tableName} (
        booking_id, gateway, gateway_payment_id, gateway_order_id,
        amount, currency, payment_method, payment_details, status,
        gateway_response, gateway_fee
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const values = [
      booking_id,
      gateway,
      gateway_payment_id,
      gateway_order_id,
      amount,
      currency,
      payment_method,
      JSON.stringify(payment_details),
      status,
      JSON.stringify(gateway_response),
      gateway_fee,
    ];

    try {
      const result = await db.query(query, values);
      return {
        success: true,
        data: result.rows[0],
        message: "Payment record created successfully",
      };
    } catch (error) {
      console.error("Error creating payment:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to create payment record",
      };
    }
  }

  /**
   * Find payment by gateway payment ID
   */
  async findByGatewayPaymentId(gateway_payment_id) {
    const query = `
      SELECT p.*, hb.booking_ref, hb.hotel_name
      FROM ${this.tableName} p
      LEFT JOIN hotel_bookings hb ON p.booking_id = hb.id
      WHERE p.gateway_payment_id = $1
    `;

    try {
      const result = await db.query(query, [gateway_payment_id]);

      if (result.rows.length === 0) {
        return {
          success: false,
          error: "Payment not found",
          data: null,
        };
      }

      return {
        success: true,
        data: result.rows[0],
      };
    } catch (error) {
      console.error("Error finding payment:", error);
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  }

  /**
   * Find payment by booking ID
   */
  async findByBookingId(booking_id) {
    const query = `
      SELECT * FROM ${this.tableName}
      WHERE booking_id = $1
      ORDER BY created_at DESC
    `;

    try {
      const result = await db.query(query, [booking_id]);
      return {
        success: true,
        data: result.rows,
      };
    } catch (error) {
      console.error("Error finding payments for booking:", error);
      return {
        success: false,
        error: error.message,
        data: [],
      };
    }
  }

  /**
   * Update payment status
   */
  async updateStatus(gateway_payment_id, status, additional_data = {}) {
    let updateFields = ["status = $2"];
    let values = [gateway_payment_id, status];
    let paramIndex = 3;

    // Add completion timestamp for successful payments
    if (status === "completed") {
      updateFields.push("completed_at = CURRENT_TIMESTAMP");
    }

    // Add failure reason for failed payments
    if (additional_data.failure_reason) {
      updateFields.push(`failure_reason = $${paramIndex}`);
      values.push(additional_data.failure_reason);
      paramIndex++;
    }

    // Update gateway response
    if (additional_data.gateway_response) {
      updateFields.push(`gateway_response = $${paramIndex}`);
      values.push(JSON.stringify(additional_data.gateway_response));
      paramIndex++;
    }

    const query = `
      UPDATE ${this.tableName}
      SET ${updateFields.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE gateway_payment_id = $1
      RETURNING *
    `;

    try {
      const result = await db.query(query, values);

      if (result.rows.length === 0) {
        return {
          success: false,
          error: "Payment not found",
        };
      }

      return {
        success: true,
        data: result.rows[0],
        message: `Payment status updated to ${status}`,
      };
    } catch (error) {
      console.error("Error updating payment status:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Process refund
   */
  async processRefund(gateway_payment_id, refund_amount, refund_reference) {
    const query = `
      UPDATE ${this.tableName}
      SET 
        refund_amount = $2,
        refund_date = CURRENT_TIMESTAMP,
        refund_reference = $3,
        status = 'refunded',
        updated_at = CURRENT_TIMESTAMP
      WHERE gateway_payment_id = $1
      RETURNING *
    `;

    try {
      const result = await db.query(query, [
        gateway_payment_id,
        refund_amount,
        refund_reference,
      ]);

      if (result.rows.length === 0) {
        return {
          success: false,
          error: "Payment not found",
        };
      }

      return {
        success: true,
        data: result.rows[0],
        message: "Refund processed successfully",
      };
    } catch (error) {
      console.error("Error processing refund:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get payment analytics
   */
  async getAnalytics(dateFrom, dateTo) {
    const query = `
      SELECT 
        COUNT(*) as total_transactions,
        SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as successful_amount,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as successful_count,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_count,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
        SUM(CASE WHEN status = 'refunded' THEN refund_amount ELSE 0 END) as total_refunds,
        AVG(CASE WHEN status = 'completed' THEN amount END) as average_transaction,
        SUM(gateway_fee) as total_gateway_fees
      FROM ${this.tableName}
      WHERE initiated_at BETWEEN $1 AND $2
    `;

    const methodQuery = `
      SELECT 
        payment_method,
        COUNT(*) as transaction_count,
        SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_amount
      FROM ${this.tableName}
      WHERE initiated_at BETWEEN $1 AND $2
      AND status = 'completed'
      GROUP BY payment_method
      ORDER BY transaction_count DESC
    `;

    const dailyQuery = `
      SELECT 
        DATE(initiated_at) as date,
        COUNT(*) as transactions,
        SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as revenue
      FROM ${this.tableName}
      WHERE initiated_at BETWEEN $1 AND $2
      GROUP BY DATE(initiated_at)
      ORDER BY date DESC
    `;

    try {
      const [analyticsResult, methodResult, dailyResult] = await Promise.all([
        db.query(query, [dateFrom, dateTo]),
        db.query(methodQuery, [dateFrom, dateTo]),
        db.query(dailyQuery, [dateFrom, dateTo]),
      ]);

      return {
        success: true,
        data: {
          overview: analyticsResult.rows[0],
          paymentMethods: methodResult.rows,
          dailyTrend: dailyResult.rows,
        },
      };
    } catch (error) {
      console.error("Error getting payment analytics:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get all payments with filters
   */
  async getAll(filters = {}, page = 1, limit = 20) {
    let whereConditions = [];
    let values = [];
    let paramIndex = 1;

    // Build where conditions
    if (filters.status) {
      whereConditions.push(`p.status = $${paramIndex}`);
      values.push(filters.status);
      paramIndex++;
    }

    if (filters.payment_method) {
      whereConditions.push(`p.payment_method = $${paramIndex}`);
      values.push(filters.payment_method);
      paramIndex++;
    }

    if (filters.date_from) {
      whereConditions.push(`p.initiated_at >= $${paramIndex}`);
      values.push(filters.date_from);
      paramIndex++;
    }

    if (filters.date_to) {
      whereConditions.push(`p.initiated_at <= $${paramIndex}`);
      values.push(filters.date_to);
      paramIndex++;
    }

    if (filters.booking_ref) {
      whereConditions.push(`hb.booking_ref = $${paramIndex}`);
      values.push(filters.booking_ref);
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
      FROM ${this.tableName} p
      LEFT JOIN hotel_bookings hb ON p.booking_id = hb.id
      ${whereClause}
    `;

    // Get payments
    const dataQuery = `
      SELECT 
        p.*,
        hb.booking_ref,
        hb.hotel_name,
        hb.hotel_city,
        hb.guest_details->>'contactInfo'->>'email' as guest_email
      FROM ${this.tableName} p
      LEFT JOIN hotel_bookings hb ON p.booking_id = hb.id
      ${whereClause}
      ORDER BY p.initiated_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    values.push(limit, offset);

    try {
      const [countResult, dataResult] = await Promise.all([
        db.query(countQuery, values.slice(0, -2)),
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
      console.error("Error getting payments:", error);
      return {
        success: false,
        error: error.message,
        data: [],
      };
    }
  }
}

module.exports = new Payment();
