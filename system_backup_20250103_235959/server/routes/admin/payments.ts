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
  formatCurrency,
} from "../../utils/adminUtils";

const router = express.Router();

// GET /api/admin/payments - List payments with filtering
router.get(
  "/",
  requirePermission(Permission.VIEW_PAYMENTS),
  async (req: AuthenticatedRequest, res) => {
    try {
      const params = parsePaginationParams(req.query);
      const {
        status,
        gateway,
        method,
        bookingRef,
        from,
        to,
        minAmount,
        maxAmount,
        currency,
      } = req.query;

      console.log(
        `💳 Getting payments list - page ${params.page}, pageSize ${params.pageSize}`,
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
        p.id,
        p.booking_id,
        p.gateway,
        p.gateway_payment_id,
        p.gateway_order_id,
        p.amount,
        p.currency,
        p.payment_method,
        p.status,
        p.failure_reason,
        p.gateway_fee,
        p.refund_amount,
        p.refund_date,
        p.refund_reference,
        p.initiated_at,
        p.completed_at,
        p.created_at,
        
        -- Booking details
        hb.booking_ref,
        hb.hotel_name,
        hb.hotel_city,
        hb.total_amount as booking_amount,
        
        -- User details
        u.first_name,
        u.last_name,
        u.email
        
      FROM payments p
      JOIN hotel_bookings hb ON p.booking_id = hb.id
      LEFT JOIN users u ON hb.user_id = u.id
    `;

      const whereConditions: string[] = [];
      const queryParams: any[] = [];
      let paramIndex = 1;

      // Add filters
      if (status) {
        whereConditions.push(`p.status = $${paramIndex}`);
        queryParams.push(status);
        paramIndex++;
      }

      if (gateway) {
        whereConditions.push(`p.gateway = $${paramIndex}`);
        queryParams.push(gateway);
        paramIndex++;
      }

      if (method) {
        whereConditions.push(`p.payment_method = $${paramIndex}`);
        queryParams.push(method);
        paramIndex++;
      }

      if (bookingRef) {
        whereConditions.push(`hb.booking_ref ILIKE $${paramIndex}`);
        queryParams.push(`%${bookingRef}%`);
        paramIndex++;
      }

      if (currency) {
        whereConditions.push(`p.currency = $${paramIndex}`);
        queryParams.push(currency);
        paramIndex++;
      }

      if (from) {
        whereConditions.push(`p.initiated_at >= $${paramIndex}`);
        queryParams.push(from);
        paramIndex++;
      }

      if (to) {
        whereConditions.push(`p.initiated_at <= $${paramIndex}`);
        queryParams.push(to);
        paramIndex++;
      }

      if (minAmount) {
        whereConditions.push(`p.amount >= $${paramIndex}`);
        queryParams.push(parseFloat(minAmount as string));
        paramIndex++;
      }

      if (maxAmount) {
        whereConditions.push(`p.amount <= $${paramIndex}`);
        queryParams.push(parseFloat(maxAmount as string));
        paramIndex++;
      }

      // Add search
      if (params.q) {
        whereConditions.push(`(
        p.gateway_payment_id ILIKE $${paramIndex} OR
        p.gateway_order_id ILIKE $${paramIndex + 1} OR
        hb.booking_ref ILIKE $${paramIndex + 2} OR
        u.email ILIKE $${paramIndex + 3}
      )`);
        const searchTerm = `%${params.q}%`;
        queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
        paramIndex += 4;
      }

      if (whereConditions.length > 0) {
        baseQuery += ` WHERE ${whereConditions.join(" AND ")}`;
      }

      // Add ordering and pagination
      const orderBy =
        params.sort === "guest"
          ? "u.first_name"
          : params.sort === "booking"
            ? "hb.booking_ref"
            : `p.${params.sort}`;

      const finalQuery = `${baseQuery} ORDER BY ${orderBy} ${params.order} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      queryParams.push(params.pageSize, (params.page! - 1) * params.pageSize!);

      // Get total count
      const countQuery = `SELECT COUNT(*) as total FROM (${baseQuery}) as count_query`;

      const [dataResult, countResult] = await Promise.all([
        pool.query(finalQuery, queryParams),
        pool.query(countQuery, queryParams.slice(0, -2)),
      ]);

      const payments = dataResult.rows.map((row) => ({
        id: row.id,
        bookingId: row.booking_id,
        bookingRef: row.booking_ref,
        gateway: {
          name: row.gateway,
          paymentId: row.gateway_payment_id,
          orderId: row.gateway_order_id,
        },
        amount: {
          total: parseFloat(row.amount || "0"),
          currency: row.currency || "INR",
          fee: parseFloat(row.gateway_fee || "0"),
          refunded: parseFloat(row.refund_amount || "0"),
          net:
            parseFloat(row.amount || "0") - parseFloat(row.gateway_fee || "0"),
        },
        method: row.payment_method,
        status: row.status,
        failureReason: row.failure_reason,
        refund: {
          amount: parseFloat(row.refund_amount || "0"),
          date: row.refund_date,
          reference: row.refund_reference,
        },
        booking: {
          ref: row.booking_ref,
          hotel: row.hotel_name,
          city: row.hotel_city,
          amount: parseFloat(row.booking_amount || "0"),
        },
        customer: {
          name: `${row.first_name || ""} ${row.last_name || ""}`.trim(),
          email: row.email,
        },
        dates: {
          initiated: row.initiated_at,
          completed: row.completed_at,
          created: row.created_at,
        },
      }));

      const total = parseInt(countResult.rows[0]?.total || "0");
      const totalPages = Math.ceil(total / params.pageSize!);

      const response = {
        items: payments,
        page: params.page!,
        pageSize: params.pageSize!,
        total,
        totalPages,
        filters: {
          status,
          gateway,
          method,
          bookingRef,
          currency,
          dateRange: { from, to },
          amountRange: { min: minAmount, max: maxAmount },
        },
      };

      sendSuccess(res, response);
    } catch (error) {
      console.error("❌ Error getting payments:", error);
      handleDatabaseError(res, error);
    }
  },
);

// GET /api/admin/payments/:id - Get payment details
router.get(
  "/:id",
  requirePermission(Permission.VIEW_PAYMENTS),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;

      console.log(`💳 Getting payment details: ${id}`);

      const paymentResult = await pool.query(
        `
      SELECT 
        p.*,
        hb.booking_ref,
        hb.hotel_name,
        hb.hotel_city,
        hb.total_amount as booking_amount,
        hb.status as booking_status,
        u.first_name,
        u.last_name,
        u.email,
        u.phone
      FROM payments p
      JOIN hotel_bookings hb ON p.booking_id = hb.id
      LEFT JOIN users u ON hb.user_id = u.id
      WHERE p.id = $1
    `,
        [id],
      );

      if (paymentResult.rows.length === 0) {
        return sendError(res, 404, "PAYMENT_NOT_FOUND", "Payment not found");
      }

      const payment = paymentResult.rows[0];

      const paymentDetails = {
        id: payment.id,
        bookingId: payment.booking_id,

        // Gateway details
        gateway: {
          name: payment.gateway,
          paymentId: payment.gateway_payment_id,
          orderId: payment.gateway_order_id,
          response: payment.gateway_response,
        },

        // Amount breakdown
        amount: {
          total: parseFloat(payment.amount || "0"),
          currency: payment.currency || "INR",
          fee: parseFloat(payment.gateway_fee || "0"),
          refunded: parseFloat(payment.refund_amount || "0"),
          net:
            parseFloat(payment.amount || "0") -
            parseFloat(payment.gateway_fee || "0"),
          formatted: formatCurrency(
            parseFloat(payment.amount || "0"),
            payment.currency,
          ),
        },

        // Payment method and details
        method: payment.payment_method,
        paymentDetails: payment.payment_details,

        // Status and failure info
        status: payment.status,
        failureReason: payment.failure_reason,

        // Refund information
        refund: {
          amount: parseFloat(payment.refund_amount || "0"),
          date: payment.refund_date,
          reference: payment.refund_reference,
          formatted: payment.refund_amount
            ? formatCurrency(
                parseFloat(payment.refund_amount),
                payment.currency,
              )
            : null,
        },

        // Booking information
        booking: {
          id: payment.booking_id,
          ref: payment.booking_ref,
          hotel: payment.hotel_name,
          city: payment.hotel_city,
          amount: parseFloat(payment.booking_amount || "0"),
          status: payment.booking_status,
          formatted: formatCurrency(
            parseFloat(payment.booking_amount || "0"),
            payment.currency,
          ),
        },

        // Customer information
        customer: {
          name: `${payment.first_name || ""} ${payment.last_name || ""}`.trim(),
          email: payment.email,
          phone: payment.phone,
        },

        // Important dates
        dates: {
          initiated: payment.initiated_at,
          completed: payment.completed_at,
          created: payment.created_at,
          updated: payment.updated_at,
        },

        // Metadata
        meta: {
          canRefund:
            payment.status === "completed" &&
            parseFloat(payment.refund_amount || "0") === 0,
          canPartialRefund:
            payment.status === "completed" &&
            parseFloat(payment.refund_amount || "0") <
              parseFloat(payment.amount || "0"),
          isRefunded: parseFloat(payment.refund_amount || "0") > 0,
          isFullyRefunded:
            parseFloat(payment.refund_amount || "0") >=
            parseFloat(payment.amount || "0"),
        },
      };

      sendSuccess(res, paymentDetails);
    } catch (error) {
      console.error("❌ Error getting payment details:", error);
      handleDatabaseError(res, error);
    }
  },
);

// POST /api/admin/payments/:id/refund - Process refund
router.post(
  "/:id/refund",
  requirePermission(Permission.PROCESS_REFUNDS),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { amount, reason, refundReference } = req.body;

      console.log(`💸 Processing refund for payment: ${id}`);

      // Validate input
      if (!amount || amount <= 0) {
        return sendValidationError(res, [
          "Refund amount must be greater than 0",
        ]);
      }

      if (!reason || reason.trim().length < 3) {
        return sendValidationError(res, [
          "Refund reason must be at least 3 characters",
        ]);
      }

      // Get payment details
      const paymentResult = await pool.query(
        `
      SELECT * FROM payments WHERE id = $1
    `,
        [id],
      );

      if (paymentResult.rows.length === 0) {
        return sendError(res, 404, "PAYMENT_NOT_FOUND", "Payment not found");
      }

      const payment = paymentResult.rows[0];

      // Validate refund eligibility
      if (payment.status !== "completed") {
        return sendError(
          res,
          400,
          "INVALID_STATUS",
          "Can only refund completed payments",
        );
      }

      const currentRefunded = parseFloat(payment.refund_amount || "0");
      const totalAmount = parseFloat(payment.amount);
      const requestedAmount = parseFloat(amount);

      if (currentRefunded + requestedAmount > totalAmount) {
        return sendError(
          res,
          400,
          "EXCESSIVE_REFUND",
          `Refund amount cannot exceed remaining balance of ${formatCurrency(totalAmount - currentRefunded, payment.currency)}`,
        );
      }

      // Process refund (in real implementation, this would call payment gateway)
      const newRefundAmount = currentRefunded + requestedAmount;
      const refundRef =
        refundReference || `REF-${payment.gateway_payment_id}-${Date.now()}`;

      const updateResult = await pool.query(
        `
      UPDATE payments SET 
        refund_amount = $1,
        refund_date = NOW(),
        refund_reference = $2,
        updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `,
        [newRefundAmount, refundRef, id],
      );

      const updatedPayment = updateResult.rows[0];

      // Log refund action
      await logAuditAction(
        req.admin!.id,
        "payments",
        "refund_processed",
        "payment",
        id,
        { refund_amount: currentRefunded },
        {
          refund_amount: newRefundAmount,
          refund_reason: reason,
          refund_reference: refundRef,
        },
        req.ip,
      );

      // Log in booking audit as well
      await pool.query(
        `
      INSERT INTO booking_audit_log (
        booking_id, action, field_changed, old_value, new_value, 
        changed_by, change_reason, changed_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
    `,
        [
          payment.booking_id,
          "refund_processed",
          "payment_refund",
          formatCurrency(currentRefunded, payment.currency),
          formatCurrency(newRefundAmount, payment.currency),
          req.admin!.email,
          reason,
        ],
      );

      sendSuccess(res, {
        paymentId: id,
        refundProcessed: true,
        refundAmount: requestedAmount,
        totalRefunded: newRefundAmount,
        refundReference: refundRef,
        currency: payment.currency,
        processedBy: req.admin!.email,
        processedAt: new Date().toISOString(),
        formatted: {
          refundAmount: formatCurrency(requestedAmount, payment.currency),
          totalRefunded: formatCurrency(newRefundAmount, payment.currency),
        },
      });
    } catch (error) {
      console.error("❌ Error processing refund:", error);
      handleDatabaseError(res, error);
    }
  },
);

// PATCH /api/admin/payments/:id/reconcile - Mark payment as reconciled
router.patch(
  "/:id/reconcile",
  requirePermission(Permission.MANAGE_PAYMENTS),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { reconciled, settlementDate, notes } = req.body;

      console.log(`🔄 Reconciling payment: ${id}`);

      // Get payment details
      const paymentResult = await pool.query(
        `
      SELECT * FROM payments WHERE id = $1
    `,
        [id],
      );

      if (paymentResult.rows.length === 0) {
        return sendError(res, 404, "PAYMENT_NOT_FOUND", "Payment not found");
      }

      const payment = paymentResult.rows[0];

      // For now, we'll add reconciliation info to the gateway_response JSON
      const currentResponse = payment.gateway_response || {};
      const updatedResponse = {
        ...currentResponse,
        reconciliation: {
          reconciled: reconciled !== false,
          settlementDate: settlementDate || new Date().toISOString(),
          reconciledBy: req.admin!.email,
          reconciledAt: new Date().toISOString(),
          notes: notes || null,
        },
      };

      const updateResult = await pool.query(
        `
      UPDATE payments SET 
        gateway_response = $1,
        updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `,
        [JSON.stringify(updatedResponse), id],
      );

      // Log reconciliation action
      await logAuditAction(
        req.admin!.id,
        "payments",
        "reconciled",
        "payment",
        id,
        { reconciled: false },
        { reconciled: reconciled !== false, notes },
        req.ip,
      );

      sendSuccess(res, {
        paymentId: id,
        reconciled: reconciled !== false,
        settlementDate: settlementDate || new Date().toISOString(),
        reconciledBy: req.admin!.email,
        notes: notes || null,
      });
    } catch (error) {
      console.error("❌ Error reconciling payment:", error);
      handleDatabaseError(res, error);
    }
  },
);

// GET /api/admin/payments/stats/summary - Payment statistics
router.get(
  "/stats/summary",
  requirePermission(Permission.VIEW_PAYMENTS),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { from, to } = req.query;

      // Set default date range (last 30 days)
      const endDate = to ? new Date(to as string) : new Date();
      const startDate = from
        ? new Date(from as string)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      console.log("📊 Getting payment statistics summary");

      const [
        overallStatsResult,
        statusBreakdownResult,
        gatewayBreakdownResult,
        methodBreakdownResult,
        dailyVolumeResult,
        refundStatsResult,
      ] = await Promise.all([
        // Overall payment statistics
        pool.query(
          `
        SELECT 
          COUNT(*) as total_transactions,
          COUNT(*) FILTER (WHERE status = 'completed') as successful_transactions,
          COALESCE(SUM(amount), 0) as total_volume,
          COALESCE(SUM(amount) FILTER (WHERE status = 'completed'), 0) as successful_volume,
          COALESCE(SUM(gateway_fee), 0) as total_fees,
          COALESCE(SUM(refund_amount), 0) as total_refunded,
          COALESCE(AVG(amount) FILTER (WHERE status = 'completed'), 0) as avg_transaction_value
        FROM payments 
        WHERE initiated_at >= $1 AND initiated_at <= $2
      `,
          [startDate, endDate],
        ),

        // Status breakdown
        pool.query(
          `
        SELECT 
          status,
          COUNT(*) as count,
          COALESCE(SUM(amount), 0) as volume,
          ROUND((COUNT(*)::decimal / SUM(COUNT(*)) OVER()) * 100, 2) as percentage
        FROM payments 
        WHERE initiated_at >= $1 AND initiated_at <= $2
        GROUP BY status
        ORDER BY count DESC
      `,
          [startDate, endDate],
        ),

        // Gateway breakdown
        pool.query(
          `
        SELECT 
          gateway,
          COUNT(*) as transaction_count,
          COALESCE(SUM(amount), 0) as volume,
          COALESCE(SUM(gateway_fee), 0) as fees,
          ROUND((COUNT(*) FILTER (WHERE status = 'completed')::decimal / NULLIF(COUNT(*), 0)) * 100, 2) as success_rate
        FROM payments 
        WHERE initiated_at >= $1 AND initiated_at <= $2
        GROUP BY gateway
        ORDER BY volume DESC
      `,
          [startDate, endDate],
        ),

        // Payment method breakdown
        pool.query(
          `
        SELECT 
          COALESCE(payment_method, 'unknown') as method,
          COUNT(*) as transaction_count,
          COALESCE(SUM(amount), 0) as volume,
          COALESCE(AVG(amount), 0) as avg_amount
        FROM payments 
        WHERE initiated_at >= $1 AND initiated_at <= $2
        AND status = 'completed'
        GROUP BY payment_method
        ORDER BY volume DESC
      `,
          [startDate, endDate],
        ),

        // Daily volume trend
        pool.query(
          `
        SELECT 
          DATE(initiated_at) as date,
          COUNT(*) as transaction_count,
          COALESCE(SUM(amount), 0) as volume,
          COUNT(*) FILTER (WHERE status = 'completed') as successful_count
        FROM payments 
        WHERE initiated_at >= $1 AND initiated_at <= $2
        GROUP BY DATE(initiated_at)
        ORDER BY date ASC
      `,
          [startDate, endDate],
        ),

        // Refund statistics
        pool.query(
          `
        SELECT 
          COUNT(*) FILTER (WHERE refund_amount > 0) as refunded_transactions,
          COALESCE(SUM(refund_amount), 0) as total_refunded,
          COALESCE(AVG(refund_amount) FILTER (WHERE refund_amount > 0), 0) as avg_refund
        FROM payments 
        WHERE initiated_at >= $1 AND initiated_at <= $2
      `,
          [startDate, endDate],
        ),
      ]);

      const overallStats = overallStatsResult.rows[0];
      const successRate =
        overallStats.total_transactions > 0
          ? (overallStats.successful_transactions /
              overallStats.total_transactions) *
            100
          : 0;

      const stats = {
        overview: {
          totalTransactions: parseInt(overallStats.total_transactions || "0"),
          successfulTransactions: parseInt(
            overallStats.successful_transactions || "0",
          ),
          totalVolume: parseFloat(overallStats.total_volume || "0"),
          successfulVolume: parseFloat(overallStats.successful_volume || "0"),
          totalFees: parseFloat(overallStats.total_fees || "0"),
          totalRefunded: parseFloat(overallStats.total_refunded || "0"),
          avgTransactionValue: parseFloat(
            overallStats.avg_transaction_value || "0",
          ),
          successRate: Math.round(successRate * 100) / 100,
          netVolume:
            parseFloat(overallStats.successful_volume || "0") -
            parseFloat(overallStats.total_refunded || "0"),
        },

        statusBreakdown: statusBreakdownResult.rows.map((row) => ({
          status: row.status,
          count: parseInt(row.count),
          volume: parseFloat(row.volume || "0"),
          percentage: parseFloat(row.percentage || "0"),
        })),

        gatewayBreakdown: gatewayBreakdownResult.rows.map((row) => ({
          gateway: row.gateway,
          transactionCount: parseInt(row.transaction_count),
          volume: parseFloat(row.volume || "0"),
          fees: parseFloat(row.fees || "0"),
          successRate: parseFloat(row.success_rate || "0"),
        })),

        methodBreakdown: methodBreakdownResult.rows.map((row) => ({
          method: row.method,
          transactionCount: parseInt(row.transaction_count),
          volume: parseFloat(row.volume || "0"),
          avgAmount: parseFloat(row.avg_amount || "0"),
        })),

        dailyTrend: dailyVolumeResult.rows.map((row) => ({
          date: row.date,
          transactionCount: parseInt(row.transaction_count),
          volume: parseFloat(row.volume || "0"),
          successfulCount: parseInt(row.successful_count || "0"),
          successRate:
            row.transaction_count > 0
              ? Math.round((row.successful_count / row.transaction_count) * 100)
              : 0,
        })),

        refunds: {
          refundedTransactions: parseInt(
            refundStatsResult.rows[0]?.refunded_transactions || "0",
          ),
          totalRefunded: parseFloat(
            refundStatsResult.rows[0]?.total_refunded || "0",
          ),
          avgRefund: parseFloat(refundStatsResult.rows[0]?.avg_refund || "0"),
          refundRate:
            overallStats.successful_transactions > 0
              ? Math.round(
                  (refundStatsResult.rows[0]?.refunded_transactions /
                    overallStats.successful_transactions) *
                    100 *
                    100,
                ) / 100
              : 0,
        },

        dateRange: {
          from: startDate.toISOString(),
          to: endDate.toISOString(),
        },
      };

      sendSuccess(res, stats);
    } catch (error) {
      console.error("❌ Error getting payment stats:", error);
      handleDatabaseError(res, error);
    }
  },
);

// GET /api/admin/payments/export/settlement - Export settlement report
router.get(
  "/export/settlement",
  requirePermission(Permission.VIEW_PAYMENTS),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { from, to, gateway, format = "csv" } = req.query;

      console.log("📊 Generating settlement report");

      // Set default date range (last 7 days)
      const endDate = to ? new Date(to as string) : new Date();
      const startDate = from
        ? new Date(from as string)
        : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      let whereClause =
        "WHERE p.status = 'completed' AND p.completed_at >= $1 AND p.completed_at <= $2";
      const queryParams = [startDate, endDate];

      if (gateway) {
        whereClause += " AND p.gateway = $3";
        queryParams.push(gateway);
      }

      const settlementResult = await pool.query(
        `
      SELECT 
        p.id,
        p.gateway_payment_id,
        p.gateway_order_id,
        p.gateway,
        p.payment_method,
        p.amount,
        p.currency,
        p.gateway_fee,
        p.refund_amount,
        p.completed_at,
        hb.booking_ref,
        hb.hotel_name,
        u.email as customer_email
      FROM payments p
      JOIN hotel_bookings hb ON p.booking_id = hb.id
      LEFT JOIN users u ON hb.user_id = u.id
      ${whereClause}
      ORDER BY p.completed_at DESC
    `,
        queryParams,
      );

      const settlementData = settlementResult.rows.map((row) => ({
        paymentId: row.gateway_payment_id,
        orderId: row.gateway_order_id,
        gateway: row.gateway,
        method: row.payment_method,
        amount: parseFloat(row.amount || "0"),
        currency: row.currency,
        fee: parseFloat(row.gateway_fee || "0"),
        refunded: parseFloat(row.refund_amount || "0"),
        netAmount:
          parseFloat(row.amount || "0") -
          parseFloat(row.gateway_fee || "0") -
          parseFloat(row.refund_amount || "0"),
        completedAt: row.completed_at,
        bookingRef: row.booking_ref,
        hotel: row.hotel_name,
        customerEmail: row.customer_email,
      }));

      if (format === "csv") {
        // Generate CSV
        const csvHeaders = [
          "Payment ID",
          "Order ID",
          "Gateway",
          "Method",
          "Amount",
          "Currency",
          "Fee",
          "Refunded",
          "Net Amount",
          "Completed At",
          "Booking Ref",
          "Hotel",
          "Customer Email",
        ];

        const csvRows = settlementData.map((row) => [
          row.paymentId,
          row.orderId,
          row.gateway,
          row.method,
          row.amount,
          row.currency,
          row.fee,
          row.refunded,
          row.netAmount,
          row.completedAt,
          row.bookingRef,
          row.hotel,
          row.customerEmail,
        ]);

        const csvContent = [csvHeaders, ...csvRows]
          .map((row) => row.map((field) => `"${field}"`).join(","))
          .join("\n");

        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="settlement-report-${startDate.toISOString().split("T")[0]}-to-${endDate.toISOString().split("T")[0]}.csv"`,
        );
        res.send(csvContent);
      } else {
        // Return JSON format
        sendSuccess(res, {
          settlementData,
          summary: {
            totalTransactions: settlementData.length,
            totalAmount: settlementData.reduce(
              (sum, row) => sum + row.amount,
              0,
            ),
            totalFees: settlementData.reduce((sum, row) => sum + row.fee, 0),
            totalRefunded: settlementData.reduce(
              (sum, row) => sum + row.refunded,
              0,
            ),
            netAmount: settlementData.reduce(
              (sum, row) => sum + row.netAmount,
              0,
            ),
          },
          reportParams: {
            dateRange: { from: startDate, to: endDate },
            gateway: gateway || "all",
            generatedAt: new Date().toISOString(),
            generatedBy: req.admin!.email,
          },
        });
      }
    } catch (error) {
      console.error("❌ Error generating settlement report:", error);
      handleDatabaseError(res, error);
    }
  },
);

export default router;
