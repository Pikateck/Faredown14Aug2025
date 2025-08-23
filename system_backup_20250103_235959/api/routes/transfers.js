/**
 * Transfers API Routes
 * Handles all transfer-related API endpoints following Hotels/Sightseeing pattern
 */

const express = require("express");
const transfersService = require("../services/transfersService");
const transfersRepository = require("../repositories/transfersRepository");
const markupService = require("../services/markupService");
const promoService = require("../services/promoService");
const voucherService = require("../services/voucherService");
const emailService = require("../services/emailService");
const { validateBookingData } = require("../middleware/validation");
const { auditRequest } = require("../middleware/audit");
const { requireAuth, requireAdmin } = require("../middleware/auth");
const winston = require("winston");

const router = express.Router();

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      return `${timestamp} [${level.toUpperCase()}] [TRANSFERS-API] ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ""}`;
    }),
  ),
  transports: [new winston.transports.Console()],
});

/**
 * @route POST /api/transfers/destinations
 * @desc Search transfer destinations using Hotelbeds Transfers API
 * @access Public
 */
router.post("/destinations", auditRequest, async (req, res) => {
  try {
    const { query = "", limit = 15, popularOnly = false } = req.body;

    logger.info("Transfers destinations API called", {
      query,
      limit,
      popularOnly,
    });

    const result = await transfersService.getDestinations(
      query,
      limit,
      popularOnly,
    );

    if (!result.success) {
      logger.error("Transfers destinations API failed", {
        error: result.error,
      });
      return res.status(500).json({
        success: false,
        error: "Failed to fetch transfer destinations",
      });
    }

    logger.info(`Found ${result.destinations.length} transfer destinations`);

    res.json({
      success: true,
      data: { destinations: result.destinations },
    });
  } catch (error) {
    logger.error("Transfers destinations API error", { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

/**
 * @route POST /api/transfers/search
 * @desc Search for available transfers with caching and normalization
 * @access Public
 */
router.post("/search", auditRequest, async (req, res) => {
  try {
    const {
      pickupLocation,
      dropoffLocation,
      pickupDate,
      pickupTime = "10:00",
      returnDate,
      returnTime = "14:00",
      passengers = { adults: 2, children: 0, infants: 0 },
      isRoundTrip = false,
      vehicleType,
      currency = "INR",
      promoCode,
      flightNumber,
    } = req.body;

    // Validate required fields
    if (!pickupLocation || !dropoffLocation || !pickupDate) {
      return res.status(400).json({
        success: false,
        error:
          "Missing required fields: pickupLocation, dropoffLocation, pickupDate",
      });
    }

    const searchParams = {
      pickupLocation,
      dropoffLocation,
      pickupDate,
      pickupTime,
      returnDate,
      returnTime,
      passengers,
      isRoundTrip,
      vehicleType,
      currency,
      promoCode,
      flightNumber,
      userAgent: req.headers["user-agent"],
      ipAddress: req.ip,
      sessionId: req.sessionID,
    };

    logger.info("Transfer search initiated", { searchParams });

    const results = await transfersService.searchTransfers(searchParams);

    if (!results.success) {
      logger.error("Transfer search failed", { error: results.error });
      return res.status(500).json({
        success: false,
        error: results.error || "Search failed",
      });
    }

    logger.info(`Transfer search completed`, {
      offerCount: results.data?.offers?.length || 0,
      cached: results.data?.cached || false,
    });

    res.json({
      success: true,
      data: results.data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Transfer search error", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

/**
 * @route GET /api/transfers/product/:id
 * @desc Get transfer product details with current pricing
 * @access Public
 */
router.get("/product/:id", auditRequest, async (req, res) => {
  try {
    const { id } = req.params;
    const { currency = "INR", promoCode } = req.query;

    logger.info("Transfer product details requested", {
      id,
      currency,
      promoCode,
    });

    const product = await transfersService.getProduct(id, {
      currency,
      promoCode,
      userAgent: req.headers["user-agent"],
      ipAddress: req.ip,
    });

    if (!product.success) {
      logger.error("Transfer product not found", { id, error: product.error });
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    res.json({
      success: true,
      data: product.data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Transfer product details error", {
      error: error.message,
      id: req.params.id,
    });
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

/**
 * @route POST /api/transfers/checkout/price
 * @desc Calculate final pricing with markups, promos, and never-loss protection
 * @access Public
 */
router.post("/checkout/price", auditRequest, async (req, res) => {
  try {
    const { offerId, promoCode, currency = "INR", bargainAmount } = req.body;

    if (!offerId) {
      return res.status(400).json({
        success: false,
        error: "Missing required field: offerId",
      });
    }

    logger.info("Transfer checkout pricing requested", {
      offerId,
      promoCode,
      currency,
      bargainAmount,
    });

    const pricing = await transfersService.calculateCheckoutPrice({
      offerId,
      promoCode,
      currency,
      bargainAmount,
      userAgent: req.headers["user-agent"],
      ipAddress: req.ip,
    });

    if (!pricing.success) {
      logger.error("Transfer pricing calculation failed", {
        offerId,
        error: pricing.error,
      });
      return res.status(400).json({
        success: false,
        error: pricing.error || "Pricing calculation failed",
      });
    }

    res.json({
      success: true,
      data: pricing.data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Transfer checkout pricing error", { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

/**
 * @route POST /api/transfers/checkout/book
 * @desc Book transfer with payment processing
 * @access Private (requires authentication)
 */
router.post(
  "/checkout/book",
  requireAuth,
  validateBookingData,
  auditRequest,
  async (req, res) => {
    try {
      const {
        offerId,
        guestDetails,
        contactDetails,
        flightDetails,
        specialRequests,
        promoCode,
        bargainAmount,
        paymentMethod = "online",
        currency = "INR",
      } = req.body;

      if (!offerId || !guestDetails || !contactDetails) {
        return res.status(400).json({
          success: false,
          error:
            "Missing required fields: offerId, guestDetails, contactDetails",
        });
      }

      const bookingData = {
        offerId,
        guestDetails,
        contactDetails,
        flightDetails,
        specialRequests,
        promoCode,
        bargainAmount,
        paymentMethod,
        currency,
        userId: req.user?.id,
        userAgent: req.headers["user-agent"],
        ipAddress: req.ip,
        sessionId: req.sessionID,
      };

      logger.info("Transfer booking initiated", {
        offerId,
        userId: req.user?.id,
        paymentMethod,
        guestEmail: guestDetails.email,
      });

      const booking = await transfersService.createBooking(bookingData);

      if (!booking.success) {
        logger.error("Transfer booking failed", {
          offerId,
          userId: req.user?.id,
          error: booking.error,
        });
        return res.status(400).json({
          success: false,
          error: booking.error || "Booking failed",
        });
      }

      logger.info("Transfer booking successful", {
        bookingId: booking.data.id,
        bookingRef: booking.data.reference,
        userId: req.user?.id,
      });

      res.json({
        success: true,
        data: booking.data,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("Transfer booking error", {
        error: error.message,
        userId: req.user?.id,
      });
      res.status(500).json({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  },
);

/**
 * @route GET /api/transfers/booking/:id
 * @desc Get booking details
 * @access Private (user's own bookings or admin)
 */
router.get("/booking/:id", requireAuth, auditRequest, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const isAdmin = req.user?.role === "admin";

    logger.info("Transfer booking details requested", {
      bookingId: id,
      userId,
      isAdmin,
    });

    const booking = await transfersService.getBooking(id, { userId, isAdmin });

    if (!booking.success) {
      logger.error("Transfer booking not found", {
        bookingId: id,
        userId,
        error: booking.error,
      });
      return res.status(404).json({
        success: false,
        error: "Booking not found",
      });
    }

    res.json({
      success: true,
      data: booking.data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Transfer booking details error", {
      error: error.message,
      bookingId: req.params.id,
    });
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

/**
 * @route POST /api/transfers/booking/:id/cancel
 * @desc Cancel transfer booking with refund processing
 * @access Private (user's own bookings or admin)
 */
router.post(
  "/booking/:id/cancel",
  requireAuth,
  auditRequest,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { reason = "Customer requested cancellation" } = req.body;
      const userId = req.user?.id;
      const isAdmin = req.user?.role === "admin";

      logger.info("Transfer booking cancellation requested", {
        bookingId: id,
        userId,
        isAdmin,
        reason,
      });

      const cancellation = await transfersService.cancelBooking(id, {
        reason,
        userId,
        isAdmin,
        userAgent: req.headers["user-agent"],
        ipAddress: req.ip,
      });

      if (!cancellation.success) {
        logger.error("Transfer booking cancellation failed", {
          bookingId: id,
          userId,
          error: cancellation.error,
        });
        return res.status(400).json({
          success: false,
          error: cancellation.error || "Cancellation failed",
        });
      }

      logger.info("Transfer booking cancelled successfully", {
        bookingId: id,
        userId,
        refundAmount: cancellation.data?.refundAmount,
      });

      res.json({
        success: true,
        data: cancellation.data,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("Transfer booking cancellation error", {
        error: error.message,
        bookingId: req.params.id,
      });
      res.status(500).json({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  },
);

// =============================================================================
// ADMIN ROUTES
// =============================================================================

/**
 * @route GET /api/transfers/admin/bookings
 * @desc Get all transfer bookings with filtering
 * @access Admin
 */
router.get("/admin/bookings", requireAdmin, auditRequest, async (req, res) => {
  try {
    const {
      status,
      dateFrom,
      dateTo,
      supplier,
      page = 1,
      limit = 50,
    } = req.query;

    logger.info("Admin transfer bookings list requested", {
      status,
      dateFrom,
      dateTo,
      supplier,
      page,
      limit,
    });

    const bookings = await transfersService.getAdminBookings({
      status,
      dateFrom,
      dateTo,
      supplier,
      page: parseInt(page),
      limit: parseInt(limit),
    });

    res.json({
      success: true,
      data: bookings.data,
      pagination: bookings.pagination,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Admin transfer bookings error", { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

/**
 * @route GET/POST /api/transfers/admin/markup
 * @desc Manage transfer pricing rules and markups
 * @access Admin
 */
router.get("/admin/markup", requireAdmin, async (req, res) => {
  try {
    const rules = await markupService.getTransferRules();
    res.json({ success: true, data: rules });
  } catch (error) {
    logger.error("Get transfer markup rules error", { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/admin/markup", requireAdmin, auditRequest, async (req, res) => {
  try {
    const rule = await markupService.createTransferRule(req.body);
    logger.info("Transfer markup rule created", {
      ruleId: rule.id,
      adminId: req.user?.id,
    });
    res.json({ success: true, data: rule });
  } catch (error) {
    logger.error("Create transfer markup rule error", { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route GET/POST /api/transfers/admin/promos
 * @desc Manage transfer promotional codes
 * @access Admin
 */
router.get("/admin/promos", requireAdmin, async (req, res) => {
  try {
    const promos = await promoService.getTransferPromos();
    res.json({ success: true, data: promos });
  } catch (error) {
    logger.error("Get transfer promos error", { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/admin/promos", requireAdmin, auditRequest, async (req, res) => {
  try {
    const promo = await promoService.createTransferPromo(req.body);
    logger.info("Transfer promo created", {
      promoCode: promo.code,
      adminId: req.user?.id,
    });
    res.json({ success: true, data: promo });
  } catch (error) {
    logger.error("Create transfer promo error", { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route GET /api/transfers/admin/reports/revenue
 * @desc Transfer revenue analytics
 * @access Admin
 */
router.get("/admin/reports/revenue", requireAdmin, async (req, res) => {
  try {
    const {
      dateFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      dateTo = new Date().toISOString().split("T")[0],
      supplier,
      vehicleType,
    } = req.query;

    const report = await transfersService.getRevenueReport({
      dateFrom,
      dateTo,
      supplier,
      vehicleType,
    });

    res.json({
      success: true,
      data: report,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Transfer revenue report error", { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

/**
 * @route GET /api/transfers/admin/reports/never-loss
 * @desc Never-loss incidents report
 * @access Admin
 */
router.get("/admin/reports/never-loss", requireAdmin, async (req, res) => {
  try {
    const {
      dateFrom = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      dateTo = new Date().toISOString().split("T")[0],
    } = req.query;

    const report = await transfersService.getNeverLossReport({
      dateFrom,
      dateTo,
    });

    res.json({
      success: true,
      data: report,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Transfer never-loss report error", { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

/**
 * @route GET /api/transfers/admin/audit-logs
 * @desc Get transfer audit logs
 * @access Admin
 */
router.get("/admin/audit-logs", requireAdmin, async (req, res) => {
  try {
    const {
      bookingId,
      eventType,
      dateFrom,
      dateTo,
      page = 1,
      limit = 100,
    } = req.query;

    const logs = await transfersService.getAuditLogs({
      bookingId,
      eventType,
      dateFrom,
      dateTo,
      page: parseInt(page),
      limit: parseInt(limit),
    });

    res.json({
      success: true,
      data: logs.data,
      pagination: logs.pagination,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Transfer audit logs error", { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

/**
 * @route GET /api/transfers/health
 * @desc Health check for transfers service
 * @access Public
 */
router.get("/health", async (req, res) => {
  try {
    const health = await transfersService.healthCheck();

    res.json({
      success: true,
      data: health,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Transfer health check error", { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message || "Service unhealthy",
      timestamp: new Date().toISOString(),
    });
  }
});

// Error handling middleware for transfers routes
router.use((error, req, res, next) => {
  logger.error("Unhandled transfers route error", {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
  });

  res.status(500).json({
    success: false,
    error: "Internal server error",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
