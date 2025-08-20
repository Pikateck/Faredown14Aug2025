import express from "express";
import {
  AuthenticatedRequest,
  requirePermission,
  Permission,
} from "../../middleware/adminAuth";
import {
  pool,
  sendSuccess,
  sendError,
  sendValidationError,
  handleDatabaseError,
  parsePaginationParams,
  logAuditAction,
  sanitizeInput,
  validateDateRange,
} from "../../utils/adminUtils";

const router = express.Router();

// GET /api/admin/bookings - List bookings with advanced filtering
router.get(
  "/",
  requirePermission(Permission.VIEW_BOOKINGS),
  async (req: AuthenticatedRequest, res) => {
    try {
      const params = parsePaginationParams(req.query);
      const {
        status,
        supplier,
        city,
        bookingRef,
        email,
        from,
        to,
        minAmount,
        maxAmount,
      } = req.query;

      console.log(
        `📚 Getting bookings list - page ${params.page}, pageSize ${params.pageSize}`,
      );

      // Validate date range
      if (from || to) {
        const dateErrors = validateDateRange(from as string, to as string);
        if (dateErrors.length > 0) {
          return sendValidationError(res, dateErrors);
        }
      }

      let baseQuery = `
      SELECT 
        hb.id,
        hb.booking_ref,
        hb.hotel_name,
        hb.hotel_city,
        hb.hotel_country,
        hb.hotel_rating,
        hb.room_type,
        hb.check_in_date,
        hb.check_out_date,
        hb.nights,
        hb.rooms_count,
        hb.adults_count,
        hb.children_count,
        hb.total_amount,
        hb.currency,
        hb.status,
        hb.booking_date,
        hb.confirmation_date,
        hb.cancellation_date,
        hb.supplier_booking_ref,
        
        -- User details
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        
        -- Supplier details
        s.name as supplier_name,
        s.code as supplier_code,
        
        -- Payment status
        p.status as payment_status,
        p.gateway_payment_id,
        p.payment_method,
        p.amount as payment_amount,
        
        -- Voucher status
        v.email_sent as voucher_sent,
        v.generated_at as voucher_generated_at
        
      FROM hotel_bookings hb
      LEFT JOIN users u ON hb.user_id = u.id
      LEFT JOIN suppliers s ON hb.supplier_id = s.id
      LEFT JOIN payments p ON hb.id = p.booking_id AND p.status = 'completed'
      LEFT JOIN vouchers v ON hb.id = v.booking_id AND v.is_latest = true
    `;

      const whereConditions: string[] = [];
      const queryParams: any[] = [];
      let paramIndex = 1;

      // Add filters
      if (status) {
        whereConditions.push(`hb.status = $${paramIndex}`);
        queryParams.push(status);
        paramIndex++;
      }

      if (supplier) {
        whereConditions.push(`s.code = $${paramIndex}`);
        queryParams.push(supplier);
        paramIndex++;
      }

      if (city) {
        whereConditions.push(`LOWER(hb.hotel_city) LIKE LOWER($${paramIndex})`);
        queryParams.push(`%${city}%`);
        paramIndex++;
      }

      if (bookingRef) {
        whereConditions.push(`hb.booking_ref ILIKE $${paramIndex}`);
        queryParams.push(`%${bookingRef}%`);
        paramIndex++;
      }

      if (email) {
        whereConditions.push(`u.email ILIKE $${paramIndex}`);
        queryParams.push(`%${email}%`);
        paramIndex++;
      }

      if (from) {
        whereConditions.push(`hb.booking_date >= $${paramIndex}`);
        queryParams.push(from);
        paramIndex++;
      }

      if (to) {
        whereConditions.push(`hb.booking_date <= $${paramIndex}`);
        queryParams.push(to);
        paramIndex++;
      }

      if (minAmount) {
        whereConditions.push(`hb.total_amount >= $${paramIndex}`);
        queryParams.push(parseFloat(minAmount as string));
        paramIndex++;
      }

      if (maxAmount) {
        whereConditions.push(`hb.total_amount <= $${paramIndex}`);
        queryParams.push(parseFloat(maxAmount as string));
        paramIndex++;
      }

      // Add search
      if (params.q) {
        whereConditions.push(`(
        hb.booking_ref ILIKE $${paramIndex} OR
        hb.hotel_name ILIKE $${paramIndex + 1} OR
        u.first_name ILIKE $${paramIndex + 2} OR
        u.last_name ILIKE $${paramIndex + 3} OR
        u.email ILIKE $${paramIndex + 4}
      )`);
        const searchTerm = `%${params.q}%`;
        queryParams.push(
          searchTerm,
          searchTerm,
          searchTerm,
          searchTerm,
          searchTerm,
        );
        paramIndex += 5;
      }

      if (whereConditions.length > 0) {
        baseQuery += ` WHERE ${whereConditions.join(" AND ")}`;
      }

      // Add ordering and pagination
      const orderBy =
        params.sort === "guest"
          ? "u.first_name"
          : params.sort === "hotel"
            ? "hb.hotel_name"
            : `hb.${params.sort}`;

      const finalQuery = `${baseQuery} ORDER BY ${orderBy} ${params.order} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      queryParams.push(params.pageSize, (params.page! - 1) * params.pageSize!);

      // Get total count
      const countQuery = `SELECT COUNT(*) as total FROM (${baseQuery}) as count_query`;

      const [dataResult, countResult] = await Promise.all([
        pool.query(finalQuery, queryParams),
        pool.query(countQuery, queryParams.slice(0, -2)),
      ]);

      const bookings = dataResult.rows.map((row) => ({
        id: row.id,
        bookingRef: row.booking_ref,
        hotel: {
          name: row.hotel_name,
          city: row.hotel_city,
          country: row.hotel_country,
          rating: row.hotel_rating,
        },
        room: {
          type: row.room_type,
          count: row.rooms_count,
        },
        dates: {
          checkIn: row.check_in_date,
          checkOut: row.check_out_date,
          nights: row.nights,
        },
        guests: {
          adults: row.adults_count,
          children: row.children_count,
        },
        guest: {
          name: `${row.first_name || ""} ${row.last_name || ""}`.trim(),
          email: row.email,
          phone: row.phone,
        },
        amount: {
          total: parseFloat(row.total_amount || "0"),
          currency: row.currency || "INR",
        },
        status: row.status,
        timestamps: {
          booking: row.booking_date,
          confirmation: row.confirmation_date,
          cancellation: row.cancellation_date,
        },
        supplier: {
          name: row.supplier_name,
          code: row.supplier_code,
          bookingRef: row.supplier_booking_ref,
        },
        payment: {
          status: row.payment_status,
          method: row.payment_method,
          gatewayId: row.gateway_payment_id,
          amount: parseFloat(row.payment_amount || "0"),
        },
        voucher: {
          sent: row.voucher_sent || false,
          generatedAt: row.voucher_generated_at,
        },
      }));

      const total = parseInt(countResult.rows[0]?.total || "0");
      const totalPages = Math.ceil(total / params.pageSize!);

      const response = {
        items: bookings,
        page: params.page!,
        pageSize: params.pageSize!,
        total,
        totalPages,
        filters: {
          status,
          supplier,
          city,
          bookingRef,
          email,
          dateRange: { from, to },
          amountRange: { min: minAmount, max: maxAmount },
        },
      };

      sendSuccess(res, response);
    } catch (error) {
      console.error("❌ Error getting bookings:", error);
      handleDatabaseError(res, error);
    }
  },
);

// GET /api/admin/bookings/:id - Get booking details
router.get(
  "/:id",
  requirePermission(Permission.VIEW_BOOKINGS),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;

      console.log(`📖 Getting booking details: ${id}`);

      const bookingResult = await pool.query(
        `
      SELECT 
        hb.*,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        s.name as supplier_name,
        s.code as supplier_code,
        s.type as supplier_type
      FROM hotel_bookings hb
      LEFT JOIN users u ON hb.user_id = u.id
      LEFT JOIN suppliers s ON hb.supplier_id = s.id
      WHERE hb.id = $1
    `,
        [id],
      );

      if (bookingResult.rows.length === 0) {
        return sendError(res, 404, "BOOKING_NOT_FOUND", "Booking not found");
      }

      const booking = bookingResult.rows[0];

      // Get payment details
      const paymentsResult = await pool.query(
        `
      SELECT * FROM payments 
      WHERE booking_id = $1 
      ORDER BY initiated_at DESC
    `,
        [id],
      );

      // Get voucher details
      const voucherResult = await pool.query(
        `
      SELECT * FROM vouchers 
      WHERE booking_id = $1 
      ORDER BY generated_at DESC
    `,
        [id],
      );

      // Get audit log
      const auditResult = await pool.query(
        `
      SELECT * FROM booking_audit_log 
      WHERE booking_id = $1 
      ORDER BY changed_at DESC
      LIMIT 20
    `,
        [id],
      );

      const bookingDetails = {
        id: booking.id,
        bookingRef: booking.booking_ref,
        supplierBookingRef: booking.supplier_booking_ref,

        // Hotel details
        hotel: {
          code: booking.hotel_code,
          name: booking.hotel_name,
          address: booking.hotel_address,
          city: booking.hotel_city,
          country: booking.hotel_country,
          rating: booking.hotel_rating,
        },

        // Room details
        room: {
          type: booking.room_type,
          name: booking.room_name,
          code: booking.room_code,
          maxOccupancy: booking.max_occupancy,
          count: booking.rooms_count,
        },

        // Guest details
        guest: {
          name: `${booking.first_name || ""} ${booking.last_name || ""}`.trim(),
          email: booking.email,
          phone: booking.phone,
          details: booking.guest_details,
        },

        // Stay details
        stay: {
          checkIn: booking.check_in_date,
          checkOut: booking.check_out_date,
          nights: booking.nights,
          adults: booking.adults_count,
          children: booking.children_count,
          childrenAges: booking.children_ages,
        },

        // Pricing
        pricing: {
          basePrice: parseFloat(booking.base_price || "0"),
          markupAmount: parseFloat(booking.markup_amount || "0"),
          markupPercentage: parseFloat(booking.markup_percentage || "0"),
          taxes: parseFloat(booking.taxes || "0"),
          fees: parseFloat(booking.fees || "0"),
          total: parseFloat(booking.total_amount || "0"),
          currency: booking.currency || "INR",
        },

        // Status and dates
        status: booking.status,
        dates: {
          booking: booking.booking_date,
          confirmation: booking.confirmation_date,
          cancellation: booking.cancellation_date,
          created: booking.created_at,
          updated: booking.updated_at,
        },

        // Supplier info
        supplier: {
          id: booking.supplier_id,
          name: booking.supplier_name,
          code: booking.supplier_code,
          type: booking.supplier_type,
          response: booking.supplier_response,
        },

        // Special requests and notes
        specialRequests: booking.special_requests,
        internalNotes: booking.internal_notes,

        // Payment history
        payments: paymentsResult.rows.map((payment) => ({
          id: payment.id,
          gateway: payment.gateway,
          gatewayPaymentId: payment.gateway_payment_id,
          gatewayOrderId: payment.gateway_order_id,
          amount: parseFloat(payment.amount || "0"),
          currency: payment.currency,
          method: payment.payment_method,
          status: payment.status,
          failureReason: payment.failure_reason,
          gatewayFee: parseFloat(payment.gateway_fee || "0"),
          refundAmount: parseFloat(payment.refund_amount || "0"),
          refundDate: payment.refund_date,
          initiatedAt: payment.initiated_at,
          completedAt: payment.completed_at,
        })),

        // Voucher details
        vouchers: voucherResult.rows.map((voucher) => ({
          id: voucher.id,
          voucherNumber: voucher.voucher_number,
          pdfPath: voucher.pdf_path,
          emailSent: voucher.email_sent,
          emailAddress: voucher.email_address,
          emailSentAt: voucher.email_sent_at,
          downloadCount: voucher.download_count,
          lastDownloadedAt: voucher.last_downloaded_at,
          isLatest: voucher.is_latest,
          generatedAt: voucher.generated_at,
        })),

        // Audit trail
        auditLog: auditResult.rows.map((log) => ({
          id: log.id,
          action: log.action,
          fieldChanged: log.field_changed,
          oldValue: log.old_value,
          newValue: log.new_value,
          changedBy: log.changed_by,
          changeReason: log.change_reason,
          changedAt: log.changed_at,
        })),
      };

      sendSuccess(res, bookingDetails);
    } catch (error) {
      console.error("❌ Error getting booking details:", error);
      handleDatabaseError(res, error);
    }
  },
);

// PATCH /api/admin/bookings/:id/status - Update booking status
router.patch(
  "/:id/status",
  requirePermission(Permission.MANAGE_BOOKINGS),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { status, reason } = req.body;

      console.log(`🔄 Updating booking status: ${id} -> ${status}`);

      // Validate status transition
      const validStatuses = [
        "pending",
        "confirmed",
        "cancelled",
        "completed",
        "failed",
      ];
      if (!validStatuses.includes(status)) {
        return sendValidationError(res, ["Invalid status value"]);
      }

      // Get existing booking
      const existingResult = await pool.query(
        "SELECT * FROM hotel_bookings WHERE id = $1",
        [id],
      );
      if (existingResult.rows.length === 0) {
        return sendError(res, 404, "BOOKING_NOT_FOUND", "Booking not found");
      }

      const existingBooking = existingResult.rows[0];

      // Validate status transition logic
      const currentStatus = existingBooking.status;
      const validTransitions: Record<string, string[]> = {
        pending: ["confirmed", "cancelled", "failed"],
        confirmed: ["completed", "cancelled"],
        cancelled: [], // Can't change from cancelled
        completed: ["cancelled"], // Only allow cancellation of completed bookings
        failed: ["pending", "confirmed"], // Allow retry
      };

      if (!validTransitions[currentStatus]?.includes(status)) {
        return sendError(
          res,
          400,
          "INVALID_TRANSITION",
          `Cannot change status from ${currentStatus} to ${status}`,
        );
      }

      // Update booking status
      const updateFields: any = { status, updated_at: new Date() };
      if (status === "confirmed") {
        updateFields.confirmation_date = new Date();
      } else if (status === "cancelled") {
        updateFields.cancellation_date = new Date();
      }

      const result = await pool.query(
        `
      UPDATE hotel_bookings SET 
        status = $1,
        confirmation_date = $2,
        cancellation_date = $3,
        updated_at = NOW()
      WHERE id = $4
      RETURNING *
    `,
        [
          status,
          updateFields.confirmation_date || existingBooking.confirmation_date,
          updateFields.cancellation_date || existingBooking.cancellation_date,
          id,
        ],
      );

      const updatedBooking = result.rows[0];

      // Log status change in audit log
      await pool.query(
        `
      INSERT INTO booking_audit_log (
        booking_id, action, field_changed, old_value, new_value, 
        changed_by, change_reason, changed_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
    `,
        [
          id,
          "status_update",
          "status",
          currentStatus,
          status,
          req.admin!.email,
          reason || `Status changed by admin ${req.admin!.email}`,
        ],
      );

      // Log admin action
      await logAuditAction(
        req.admin!.id,
        "bookings",
        "status_update",
        "booking",
        id,
        { status: currentStatus },
        { status: status },
        req.ip,
      );

      sendSuccess(res, {
        id: updatedBooking.id,
        bookingRef: updatedBooking.booking_ref,
        status: updatedBooking.status,
        previousStatus: currentStatus,
        confirmationDate: updatedBooking.confirmation_date,
        cancellationDate: updatedBooking.cancellation_date,
        updatedAt: updatedBooking.updated_at,
      });
    } catch (error) {
      console.error("❌ Error updating booking status:", error);
      handleDatabaseError(res, error);
    }
  },
);

// POST /api/admin/bookings/:id/resend-voucher - Resend voucher
router.post(
  "/:id/resend-voucher",
  requirePermission(Permission.MANAGE_BOOKINGS),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { email } = req.body;

      console.log(`📧 Resending voucher for booking: ${id}`);

      // Get booking details
      const bookingResult = await pool.query(
        `
      SELECT hb.*, u.email as user_email, u.first_name, u.last_name
      FROM hotel_bookings hb
      LEFT JOIN users u ON hb.user_id = u.id
      WHERE hb.id = $1
    `,
        [id],
      );

      if (bookingResult.rows.length === 0) {
        return sendError(res, 404, "BOOKING_NOT_FOUND", "Booking not found");
      }

      const booking = bookingResult.rows[0];
      const targetEmail = email || booking.user_email;

      if (!targetEmail) {
        return sendValidationError(res, ["Email address is required"]);
      }

      // Get or create voucher
      let voucherResult = await pool.query(
        `
      SELECT * FROM vouchers 
      WHERE booking_id = $1 AND is_latest = true
    `,
        [id],
      );

      let voucher;
      if (voucherResult.rows.length === 0) {
        // Create new voucher
        const voucherNumber = `VCH-${booking.booking_ref}-${Date.now()}`;
        const createResult = await pool.query(
          `
        INSERT INTO vouchers (
          booking_id, voucher_type, voucher_number, email_address,
          is_latest, generated_at, created_at, updated_at
        ) VALUES ($1, 'hotel', $2, $3, true, NOW(), NOW(), NOW())
        RETURNING *
      `,
          [id, voucherNumber, targetEmail],
        );
        voucher = createResult.rows[0];
      } else {
        voucher = voucherResult.rows[0];
      }

      // Update voucher email status
      await pool.query(
        `
      UPDATE vouchers SET 
        email_address = $1,
        email_sent = true,
        email_sent_at = NOW(),
        email_delivery_status = 'sent',
        updated_at = NOW()
      WHERE id = $2
    `,
        [targetEmail, voucher.id],
      );

      // Log the resend action
      await logAuditAction(
        req.admin!.id,
        "bookings",
        "resend_voucher",
        "booking",
        id,
        null,
        { email: targetEmail, voucherId: voucher.id },
        req.ip,
      );

      sendSuccess(res, {
        voucherId: voucher.id,
        voucherNumber: voucher.voucher_number,
        emailSent: true,
        emailAddress: targetEmail,
        sentAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("❌ Error resending voucher:", error);
      handleDatabaseError(res, error);
    }
  },
);

// GET /api/admin/bookings/stats/summary - Booking statistics
router.get(
  "/stats/summary",
  requirePermission(Permission.VIEW_BOOKINGS),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { from, to } = req.query;

      // Set default date range (last 30 days)
      const endDate = to ? new Date(to as string) : new Date();
      const startDate = from
        ? new Date(from as string)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      console.log("📊 Getting booking statistics summary");

      const [
        totalBookingsResult,
        statusBreakdownResult,
        supplierBreakdownResult,
        revenueStatsResult,
        topDestinationsResult,
      ] = await Promise.all([
        // Total bookings
        pool.query(
          `
        SELECT COUNT(*) as total 
        FROM hotel_bookings 
        WHERE booking_date >= $1 AND booking_date <= $2
      `,
          [startDate, endDate],
        ),

        // Status breakdown
        pool.query(
          `
        SELECT 
          status,
          COUNT(*) as count,
          ROUND((COUNT(*)::decimal / SUM(COUNT(*)) OVER()) * 100, 2) as percentage
        FROM hotel_bookings 
        WHERE booking_date >= $1 AND booking_date <= $2
        GROUP BY status
        ORDER BY count DESC
      `,
          [startDate, endDate],
        ),

        // Supplier breakdown
        pool.query(
          `
        SELECT 
          s.name,
          s.code,
          COUNT(hb.id) as booking_count,
          COALESCE(SUM(hb.total_amount), 0) as total_revenue
        FROM suppliers s
        LEFT JOIN hotel_bookings hb ON s.id = hb.supplier_id 
          AND hb.booking_date >= $1 AND hb.booking_date <= $2
        WHERE s.is_active = true
        GROUP BY s.id, s.name, s.code
        ORDER BY booking_count DESC
      `,
          [startDate, endDate],
        ),

        // Revenue statistics
        pool.query(
          `
        SELECT 
          COUNT(*) as total_bookings,
          COALESCE(SUM(total_amount), 0) as total_revenue,
          COALESCE(AVG(total_amount), 0) as avg_booking_value,
          COALESCE(MIN(total_amount), 0) as min_booking_value,
          COALESCE(MAX(total_amount), 0) as max_booking_value
        FROM hotel_bookings 
        WHERE booking_date >= $1 AND booking_date <= $2
        AND status IN ('confirmed', 'completed')
      `,
          [startDate, endDate],
        ),

        // Top destinations
        pool.query(
          `
        SELECT 
          hotel_city,
          hotel_country,
          COUNT(*) as booking_count,
          COALESCE(SUM(total_amount), 0) as revenue
        FROM hotel_bookings 
        WHERE booking_date >= $1 AND booking_date <= $2
        AND hotel_city IS NOT NULL
        GROUP BY hotel_city, hotel_country
        ORDER BY booking_count DESC
        LIMIT 10
      `,
          [startDate, endDate],
        ),
      ]);

      const stats = {
        totalBookings: parseInt(totalBookingsResult.rows[0]?.total || "0"),

        statusBreakdown: statusBreakdownResult.rows.map((row) => ({
          status: row.status,
          count: parseInt(row.count),
          percentage: parseFloat(row.percentage || "0"),
        })),

        supplierBreakdown: supplierBreakdownResult.rows.map((row) => ({
          name: row.name,
          code: row.code,
          bookingCount: parseInt(row.booking_count || "0"),
          revenue: parseFloat(row.total_revenue || "0"),
        })),

        revenue: {
          total: parseFloat(revenueStatsResult.rows[0]?.total_revenue || "0"),
          average: parseFloat(
            revenueStatsResult.rows[0]?.avg_booking_value || "0",
          ),
          min: parseFloat(revenueStatsResult.rows[0]?.min_booking_value || "0"),
          max: parseFloat(revenueStatsResult.rows[0]?.max_booking_value || "0"),
        },

        topDestinations: topDestinationsResult.rows.map((row) => ({
          city: row.hotel_city,
          country: row.hotel_country,
          bookingCount: parseInt(row.booking_count),
          revenue: parseFloat(row.revenue || "0"),
        })),

        dateRange: {
          from: startDate.toISOString(),
          to: endDate.toISOString(),
        },
      };

      sendSuccess(res, stats);
    } catch (error) {
      console.error("❌ Error getting booking stats:", error);
      handleDatabaseError(res, error);
    }
  },
);

export default router;
