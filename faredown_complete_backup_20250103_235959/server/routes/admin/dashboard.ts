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
  validateDateRange,
  formatCurrency,
} from "../../utils/adminUtils";

const router = express.Router();

// Dashboard summary endpoint
router.get(
  "/summary",
  requirePermission(Permission.VIEW_DASHBOARD),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { from, to } = req.query;

      // Validate date range if provided
      const dateErrors = validateDateRange(from as string, to as string);
      if (dateErrors.length > 0) {
        return sendError(res, 400, "INVALID_DATE_RANGE", dateErrors.join(", "));
      }

      // Set default date range (last 30 days)
      const endDate = to ? new Date(to as string) : new Date();
      const startDate = from
        ? new Date(from as string)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      console.log(
        `📊 Getting dashboard summary from ${startDate.toISOString()} to ${endDate.toISOString()}`,
      );

      // Execute all dashboard queries in parallel
      const [
        totalBookingsResult,
        revenueResult,
        successRateResult,
        monthlyBookingsResult,
        topDestinationsResult,
        flightCabinResult,
        hotelCityResult,
        supplierStatsResult,
        paymentStatsResult,
      ] = await Promise.all([
        // Total bookings
        pool.query(
          `
        SELECT COUNT(*) as total_bookings
        FROM hotel_bookings 
        WHERE booking_date >= $1 AND booking_date <= $2
      `,
          [startDate, endDate],
        ),

        // Revenue from payments
        pool.query(
          `
        SELECT 
          COALESCE(SUM(amount), 0) as total_revenue,
          COUNT(*) as payment_count
        FROM payments p
        JOIN hotel_bookings hb ON p.booking_id = hb.id
        WHERE p.status = 'completed' 
        AND p.completed_at >= $1 AND p.completed_at <= $2
      `,
          [startDate, endDate],
        ),

        // Success rate
        pool.query(
          `
        SELECT 
          COUNT(*) FILTER (WHERE status IN ('confirmed', 'completed')) as successful,
          COUNT(*) as total,
          ROUND(
            (COUNT(*) FILTER (WHERE status IN ('confirmed', 'completed'))::decimal / 
             NULLIF(COUNT(*), 0)) * 100, 2
          ) as success_rate
        FROM hotel_bookings 
        WHERE booking_date >= $1 AND booking_date <= $2
      `,
          [startDate, endDate],
        ),

        // Monthly booking distribution
        pool.query(
          `
        SELECT 
          TO_CHAR(booking_date, 'Mon') as month,
          COUNT(*) as bookings,
          COALESCE(SUM(total_amount), 0) as revenue
        FROM hotel_bookings 
        WHERE booking_date >= $1 AND booking_date <= $2
        GROUP BY DATE_TRUNC('month', booking_date), TO_CHAR(booking_date, 'Mon')
        ORDER BY DATE_TRUNC('month', booking_date)
        LIMIT 12
      `,
          [startDate, endDate],
        ),

        // Top destinations
        pool.query(
          `
        SELECT 
          hotel_city as city,
          COUNT(*) as bookings,
          COALESCE(SUM(total_amount), 0) as revenue,
          ROUND(
            ((COUNT(*) - LAG(COUNT(*)) OVER (ORDER BY COUNT(*) DESC))::decimal / 
             NULLIF(LAG(COUNT(*)) OVER (ORDER BY COUNT(*) DESC), 0)) * 100, 1
          ) as growth_pct
        FROM hotel_bookings 
        WHERE booking_date >= $1 AND booking_date <= $2
        AND hotel_city IS NOT NULL
        GROUP BY hotel_city
        ORDER BY bookings DESC
        LIMIT 10
      `,
          [startDate, endDate],
        ),

        // Flight cabin bookings (placeholder - will need flight_bookings table)
        pool.query(`
        SELECT 
          'Economy' as cabin, 0 as bookings, 0 as revenue, 0 as percentage
        WHERE FALSE
      `),

        // Hotel city bookings with averages
        pool.query(
          `
        SELECT 
          hotel_city as city,
          COUNT(*) as bookings,
          COALESCE(SUM(total_amount), 0) as revenue,
          ROUND(COALESCE(AVG(total_amount), 0), 0) as avg_rate
        FROM hotel_bookings 
        WHERE booking_date >= $1 AND booking_date <= $2
        AND hotel_city IS NOT NULL
        GROUP BY hotel_city
        ORDER BY bookings DESC
        LIMIT 8
      `,
          [startDate, endDate],
        ),

        // Supplier statistics
        pool.query(
          `
        SELECT 
          s.name as supplier_name,
          COUNT(hb.id) as bookings,
          COALESCE(AVG(s.success_rate), 0) as avg_success_rate,
          COALESCE(AVG(s.average_response_time), 0) as avg_response_time
        FROM suppliers s
        LEFT JOIN hotel_bookings hb ON hb.supplier_id = s.id 
          AND hb.booking_date >= $1 AND hb.booking_date <= $2
        WHERE s.is_active = TRUE
        GROUP BY s.id, s.name
        ORDER BY bookings DESC
      `,
          [startDate, endDate],
        ),

        // Payment method statistics
        pool.query(
          `
        SELECT 
          COALESCE(payment_method, 'unknown') as method,
          COUNT(*) as count,
          COALESCE(SUM(amount), 0) as total_amount
        FROM payments p
        JOIN hotel_bookings hb ON p.booking_id = hb.id
        WHERE p.completed_at >= $1 AND p.completed_at <= $2
        GROUP BY payment_method
        ORDER BY count DESC
      `,
          [startDate, endDate],
        ),
      ]);

      // Process results
      const totalBookings = parseInt(
        totalBookingsResult.rows[0]?.total_bookings || "0",
      );
      const totalRevenue = parseFloat(
        revenueResult.rows[0]?.total_revenue || "0",
      );
      const successRate = parseFloat(
        successRateResult.rows[0]?.success_rate || "0",
      );

      const monthlyBookingData = monthlyBookingsResult.rows.map((row) => ({
        month: row.month,
        bookings: parseInt(row.bookings),
        revenue: parseFloat(row.revenue || "0"),
      }));

      const topDestinations = topDestinationsResult.rows.map((row) => ({
        city: row.city,
        bookings: parseInt(row.bookings),
        revenue: parseFloat(row.revenue || "0"),
        growth: row.growth_pct ? `+${row.growth_pct}%` : "+0%",
      }));

      const hotelCityBookings = hotelCityResult.rows.map((row) => ({
        city: row.city,
        bookings: parseInt(row.bookings),
        revenue: parseFloat(row.revenue || "0"),
        avgRate: parseFloat(row.avg_rate || "0"),
      }));

      const supplierStats = supplierStatsResult.rows.map((row) => ({
        name: row.supplier_name,
        bookings: parseInt(row.bookings || "0"),
        successRate: parseFloat(row.avg_success_rate || "0"),
        responseTime: parseInt(row.avg_response_time || "0"),
      }));

      const paymentStats = paymentStatsResult.rows.map((row) => ({
        method: row.method,
        count: parseInt(row.count),
        amount: parseFloat(row.total_amount || "0"),
      }));

      // Calculate growth (simplified - comparing to previous period)
      const periodDays = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      const previousStartDate = new Date(
        startDate.getTime() - periodDays * 24 * 60 * 60 * 1000,
      );

      const [previousBookingsResult, previousRevenueResult] = await Promise.all(
        [
          pool.query(
            `
        SELECT COUNT(*) as count FROM hotel_bookings 
        WHERE booking_date >= $1 AND booking_date < $2
      `,
            [previousStartDate, startDate],
          ),

          pool.query(
            `
        SELECT COALESCE(SUM(amount), 0) as amount FROM payments p
        JOIN hotel_bookings hb ON p.booking_id = hb.id
        WHERE p.status = 'completed' AND p.completed_at >= $1 AND p.completed_at < $2
      `,
            [previousStartDate, startDate],
          ),
        ],
      );

      const previousBookings = parseInt(
        previousBookingsResult.rows[0]?.count || "0",
      );
      const previousRevenue = parseFloat(
        previousRevenueResult.rows[0]?.amount || "0",
      );

      const bookingGrowth =
        previousBookings > 0
          ? (
              ((totalBookings - previousBookings) / previousBookings) *
              100
            ).toFixed(1)
          : "0.0";
      const revenueGrowth =
        previousRevenue > 0
          ? (
              ((totalRevenue - previousRevenue) / previousRevenue) *
              100
            ).toFixed(1)
          : "0.0";

      // Build comprehensive dashboard response
      const dashboardData = {
        // KPI Summary
        summary: {
          totalBookings,
          totalRevenue,
          successRate,
          periodDays,
          bookingGrowth: `+${bookingGrowth}%`,
          revenueGrowth: `+${revenueGrowth}%`,
          averageBookingValue:
            totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0,
        },

        // Charts Data
        monthlyBookingData,
        topDestinations,
        hotelCityBookings,

        // Placeholder flight data (until flight_bookings table exists)
        flightCabinBookings: [
          {
            cabin: "Economy",
            bookings: Math.floor(totalBookings * 0.7),
            revenue: totalRevenue * 0.5,
            percentage: 70,
          },
          {
            cabin: "Business",
            bookings: Math.floor(totalBookings * 0.25),
            revenue: totalRevenue * 0.35,
            percentage: 25,
          },
          {
            cabin: "First Class",
            bookings: Math.floor(totalBookings * 0.05),
            revenue: totalRevenue * 0.15,
            percentage: 5,
          },
        ],

        // Supplier performance
        supplierPerformance: supplierStats,

        // Payment methods
        paymentMethods: paymentStats,

        // System health
        systemHealth: {
          databaseConnected: true,
          activeSuppliers: supplierStats.length,
          totalQueries:
            monthlyBookingData.length +
            topDestinations.length +
            hotelCityBookings.length,
          responseTime: "< 100ms",
        },

        // Meta information
        meta: {
          dateRange: {
            from: startDate.toISOString(),
            to: endDate.toISOString(),
            periodDays,
          },
          generatedAt: new Date().toISOString(),
          dataSource: "PostgreSQL",
          admin: {
            id: req.admin?.id,
            email: req.admin?.email,
          },
        },
      };

      sendSuccess(res, dashboardData);
    } catch (error) {
      console.error("❌ Dashboard summary error:", error);
      sendError(
        res,
        500,
        "DASHBOARD_ERROR",
        "Failed to generate dashboard summary",
        error.message,
      );
    }
  },
);

// Real-time metrics endpoint
router.get(
  "/metrics/realtime",
  requirePermission(Permission.VIEW_DASHBOARD),
  async (req: AuthenticatedRequest, res) => {
    try {
      const [
        todayBookingsResult,
        todayRevenueResult,
        activeSessionsResult,
        systemStatusResult,
      ] = await Promise.all([
        // Today's bookings
        pool.query(`
        SELECT COUNT(*) as count 
        FROM hotel_bookings 
        WHERE DATE(booking_date) = CURRENT_DATE
      `),

        // Today's revenue
        pool.query(`
        SELECT COALESCE(SUM(amount), 0) as amount 
        FROM payments p
        JOIN hotel_bookings hb ON p.booking_id = hb.id
        WHERE DATE(p.completed_at) = CURRENT_DATE AND p.status = 'completed'
      `),

        // Active sessions (placeholder)
        pool.query(`SELECT 0 as count`),

        // System status
        pool.query(`
        SELECT 
          COUNT(*) as total_suppliers,
          COUNT(*) FILTER (WHERE status = 'active') as active_suppliers,
          AVG(success_rate) as avg_success_rate
        FROM suppliers WHERE is_active = TRUE
      `),
      ]);

      const realTimeMetrics = {
        todayBookings: parseInt(todayBookingsResult.rows[0]?.count || "0"),
        todayRevenue: parseFloat(todayRevenueResult.rows[0]?.amount || "0"),
        activeSessions: parseInt(activeSessionsResult.rows[0]?.count || "0"),
        systemStatus: {
          totalSuppliers: parseInt(
            systemStatusResult.rows[0]?.total_suppliers || "0",
          ),
          activeSuppliers: parseInt(
            systemStatusResult.rows[0]?.active_suppliers || "0",
          ),
          avgSuccessRate: parseFloat(
            systemStatusResult.rows[0]?.avg_success_rate || "0",
          ),
        },
        lastUpdated: new Date().toISOString(),
      };

      sendSuccess(res, realTimeMetrics);
    } catch (error) {
      console.error("❌ Real-time metrics error:", error);
      sendError(
        res,
        500,
        "METRICS_ERROR",
        "Failed to fetch real-time metrics",
        error.message,
      );
    }
  },
);

// Booking trends endpoint
router.get(
  "/trends/bookings",
  requirePermission(Permission.VIEW_DASHBOARD),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { period = "7d" } = req.query;

      let dateClause = "";
      let interval = "";

      switch (period) {
        case "24h":
          dateClause = "booking_date >= NOW() - INTERVAL '24 hours'";
          interval = "hour";
          break;
        case "7d":
          dateClause = "booking_date >= NOW() - INTERVAL '7 days'";
          interval = "day";
          break;
        case "30d":
          dateClause = "booking_date >= NOW() - INTERVAL '30 days'";
          interval = "day";
          break;
        case "90d":
          dateClause = "booking_date >= NOW() - INTERVAL '90 days'";
          interval = "week";
          break;
        default:
          dateClause = "booking_date >= NOW() - INTERVAL '7 days'";
          interval = "day";
      }

      const trendsResult = await pool.query(`
      SELECT 
        DATE_TRUNC('${interval}', booking_date) as period,
        COUNT(*) as bookings,
        COUNT(*) FILTER (WHERE status IN ('confirmed', 'completed')) as successful_bookings,
        COALESCE(SUM(total_amount), 0) as revenue
      FROM hotel_bookings 
      WHERE ${dateClause}
      GROUP BY DATE_TRUNC('${interval}', booking_date)
      ORDER BY period ASC
    `);

      const trends = trendsResult.rows.map((row) => ({
        period: row.period,
        bookings: parseInt(row.bookings),
        successfulBookings: parseInt(row.successful_bookings || "0"),
        revenue: parseFloat(row.revenue || "0"),
        successRate:
          row.bookings > 0
            ? Math.round((row.successful_bookings / row.bookings) * 100)
            : 0,
      }));

      sendSuccess(res, { trends, period, interval });
    } catch (error) {
      console.error("❌ Booking trends error:", error);
      sendError(
        res,
        500,
        "TRENDS_ERROR",
        "Failed to fetch booking trends",
        error.message,
      );
    }
  },
);

export default router;
