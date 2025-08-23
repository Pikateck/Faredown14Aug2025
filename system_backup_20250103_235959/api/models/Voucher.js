/**
 * Voucher Database Model
 * Handles all database operations for vouchers
 */

const db = require("../database/connection");

class Voucher {
  constructor() {
    this.tableName = "vouchers";
  }

  /**
   * Create a new voucher record
   */
  async create(voucherData) {
    const {
      booking_id,
      voucher_type,
      voucher_number,
      pdf_path,
      pdf_size_bytes,
      email_address,
    } = voucherData;

    // Mark any existing vouchers for this booking as not latest
    await this.markOldVouchersAsNotLatest(booking_id);

    const query = `
      INSERT INTO ${this.tableName} (
        booking_id, voucher_type, voucher_number, pdf_path,
        pdf_size_bytes, email_address, is_latest
      )
      VALUES ($1, $2, $3, $4, $5, $6, true)
      RETURNING *
    `;

    const values = [
      booking_id,
      voucher_type,
      voucher_number,
      pdf_path,
      pdf_size_bytes,
      email_address,
    ];

    try {
      const result = await db.query(query, values);
      return {
        success: true,
        data: result.rows[0],
        message: "Voucher created successfully",
      };
    } catch (error) {
      console.error("Error creating voucher:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to create voucher",
      };
    }
  }

  /**
   * Mark old vouchers as not latest
   */
  async markOldVouchersAsNotLatest(booking_id) {
    const query = `
      UPDATE ${this.tableName}
      SET is_latest = false, updated_at = CURRENT_TIMESTAMP
      WHERE booking_id = $1 AND is_latest = true
    `;

    try {
      await db.query(query, [booking_id]);
      return { success: true };
    } catch (error) {
      console.error("Error marking old vouchers:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Find voucher by voucher number
   */
  async findByVoucherNumber(voucher_number) {
    const query = `
      SELECT v.*, hb.booking_ref, hb.hotel_name
      FROM ${this.tableName} v
      LEFT JOIN hotel_bookings hb ON v.booking_id = hb.id
      WHERE v.voucher_number = $1
    `;

    try {
      const result = await db.query(query, [voucher_number]);

      if (result.rows.length === 0) {
        return {
          success: false,
          error: "Voucher not found",
          data: null,
        };
      }

      return {
        success: true,
        data: result.rows[0],
      };
    } catch (error) {
      console.error("Error finding voucher:", error);
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  }

  /**
   * Find latest voucher by booking ID
   */
  async findLatestByBookingId(booking_id) {
    const query = `
      SELECT v.*, hb.booking_ref, hb.hotel_name
      FROM ${this.tableName} v
      LEFT JOIN hotel_bookings hb ON v.booking_id = hb.id
      WHERE v.booking_id = $1 AND v.is_latest = true
    `;

    try {
      const result = await db.query(query, [booking_id]);

      if (result.rows.length === 0) {
        return {
          success: false,
          error: "No voucher found for this booking",
          data: null,
        };
      }

      return {
        success: true,
        data: result.rows[0],
      };
    } catch (error) {
      console.error("Error finding voucher by booking:", error);
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  }

  /**
   * Update email delivery status
   */
  async updateEmailStatus(voucher_id, status, failure_reason = null) {
    let updateFields = ["email_delivery_status = $2"];
    let values = [voucher_id, status];
    let paramIndex = 3;

    if (status === "sent") {
      updateFields.push(
        "email_sent = true",
        "email_sent_at = CURRENT_TIMESTAMP",
      );
    }

    if (failure_reason) {
      updateFields.push(`email_failure_reason = $${paramIndex}`);
      values.push(failure_reason);
      paramIndex++;
    }

    const query = `
      UPDATE ${this.tableName}
      SET ${updateFields.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    try {
      const result = await db.query(query, values);

      if (result.rows.length === 0) {
        return {
          success: false,
          error: "Voucher not found",
        };
      }

      return {
        success: true,
        data: result.rows[0],
        message: `Email status updated to ${status}`,
      };
    } catch (error) {
      console.error("Error updating email status:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Record voucher download
   */
  async recordDownload(voucher_id) {
    const query = `
      UPDATE ${this.tableName}
      SET 
        download_count = download_count + 1,
        last_downloaded_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    try {
      const result = await db.query(query, [voucher_id]);

      if (result.rows.length === 0) {
        return {
          success: false,
          error: "Voucher not found",
        };
      }

      return {
        success: true,
        data: result.rows[0],
        message: "Download recorded successfully",
      };
    } catch (error) {
      console.error("Error recording download:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get all vouchers with filters
   */
  async getAll(filters = {}, page = 1, limit = 20) {
    let whereConditions = [];
    let values = [];
    let paramIndex = 1;

    // Build where conditions
    if (filters.voucher_type) {
      whereConditions.push(`v.voucher_type = $${paramIndex}`);
      values.push(filters.voucher_type);
      paramIndex++;
    }

    if (filters.email_sent !== undefined) {
      whereConditions.push(`v.email_sent = $${paramIndex}`);
      values.push(filters.email_sent);
      paramIndex++;
    }

    if (filters.date_from) {
      whereConditions.push(`v.generated_at >= $${paramIndex}`);
      values.push(filters.date_from);
      paramIndex++;
    }

    if (filters.date_to) {
      whereConditions.push(`v.generated_at <= $${paramIndex}`);
      values.push(filters.date_to);
      paramIndex++;
    }

    if (filters.booking_ref) {
      whereConditions.push(`hb.booking_ref = $${paramIndex}`);
      values.push(filters.booking_ref);
      paramIndex++;
    }

    // Only show latest vouchers by default
    if (filters.latest_only !== false) {
      whereConditions.push("v.is_latest = true");
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
      FROM ${this.tableName} v
      LEFT JOIN hotel_bookings hb ON v.booking_id = hb.id
      ${whereClause}
    `;

    // Get vouchers
    const dataQuery = `
      SELECT 
        v.*,
        hb.booking_ref,
        hb.hotel_name,
        hb.hotel_city,
        hb.check_in_date,
        hb.check_out_date,
        hb.guest_details->>'contactInfo'->>'email' as guest_email,
        hb.guest_details->>'primaryGuest'->>'firstName' as guest_first_name,
        hb.guest_details->>'primaryGuest'->>'lastName' as guest_last_name
      FROM ${this.tableName} v
      LEFT JOIN hotel_bookings hb ON v.booking_id = hb.id
      ${whereClause}
      ORDER BY v.generated_at DESC
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
      console.error("Error getting vouchers:", error);
      return {
        success: false,
        error: error.message,
        data: [],
      };
    }
  }

  /**
   * Get voucher analytics
   */
  async getAnalytics(dateFrom, dateTo) {
    const query = `
      SELECT 
        COUNT(*) as total_vouchers,
        SUM(CASE WHEN email_sent = true THEN 1 ELSE 0 END) as vouchers_sent,
        SUM(CASE WHEN email_sent = false THEN 1 ELSE 0 END) as vouchers_pending,
        SUM(download_count) as total_downloads,
        AVG(download_count) as average_downloads,
        COUNT(CASE WHEN voucher_type = 'hotel' THEN 1 END) as hotel_vouchers,
        COUNT(CASE WHEN voucher_type = 'gst_invoice' THEN 1 END) as gst_invoices
      FROM ${this.tableName}
      WHERE generated_at BETWEEN $1 AND $2
      AND is_latest = true
    `;

    const deliveryQuery = `
      SELECT 
        email_delivery_status,
        COUNT(*) as count
      FROM ${this.tableName}
      WHERE generated_at BETWEEN $1 AND $2
      AND is_latest = true
      GROUP BY email_delivery_status
    `;

    try {
      const [analyticsResult, deliveryResult] = await Promise.all([
        db.query(query, [dateFrom, dateTo]),
        db.query(deliveryQuery, [dateFrom, dateTo]),
      ]);

      return {
        success: true,
        data: {
          overview: analyticsResult.rows[0],
          deliveryStatus: deliveryResult.rows,
        },
      };
    } catch (error) {
      console.error("Error getting voucher analytics:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Generate unique voucher number
   */
  generateVoucherNumber(booking_ref, type = "hotel") {
    const timestamp = Date.now().toString().slice(-6);
    const typePrefix = type === "gst_invoice" ? "GST" : "V";
    return `${typePrefix}-${booking_ref}-${timestamp}`;
  }

  /**
   * Resend voucher email
   */
  async resendEmail(voucher_id, new_email_address = null) {
    let updateFields = ["email_sent = false", "email_delivery_status = $2"];
    let values = [voucher_id, "pending"];
    let paramIndex = 3;

    if (new_email_address) {
      updateFields.push(`email_address = $${paramIndex}`);
      values.push(new_email_address);
      paramIndex++;
    }

    const query = `
      UPDATE ${this.tableName}
      SET ${updateFields.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    try {
      const result = await db.query(query, values);

      if (result.rows.length === 0) {
        return {
          success: false,
          error: "Voucher not found",
        };
      }

      return {
        success: true,
        data: result.rows[0],
        message: "Voucher queued for resending",
      };
    } catch (error) {
      console.error("Error queuing voucher for resend:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = new Voucher();
