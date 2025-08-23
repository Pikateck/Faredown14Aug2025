/**
 * Admin Bookings API Routes
 * Database-backed routes for viewing and managing hotel bookings
 */

const express = require("express");
const router = express.Router();
const HotelBooking = require("../models/HotelBooking");
const Payment = require("../models/Payment");
const Voucher = require("../models/Voucher");
const { authenticateToken, requireAdmin } = require("../middleware/auth");

// Apply authentication middleware to all routes
router.use(authenticateToken);
router.use(requireAdmin);

/**
 * Get all bookings with filters and pagination
 * GET /api/admin/bookings
 */
router.get("/", async (req, res) => {
  try {
    const {
      status,
      hotel_city,
      date_from,
      date_to,
      supplier_id,
      page = 1,
      limit = 20,
      search,
    } = req.query;

    const filters = {};

    if (status) filters.status = status;
    if (hotel_city) filters.hotel_city = hotel_city;
    if (date_from) filters.date_from = date_from;
    if (date_to) filters.date_to = date_to;
    if (supplier_id) filters.supplier_id = parseInt(supplier_id);

    const result = await HotelBooking.getAll(
      filters,
      parseInt(page),
      parseInt(limit),
    );

    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
        message: `Found ${result.data.length} bookings`,
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        message: "Failed to fetch bookings",
      });
    }
  } catch (error) {
    console.error("Admin bookings fetch error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Internal server error",
    });
  }
});

/**
 * Get booking by reference
 * GET /api/admin/bookings/:booking_ref
 */
router.get("/:booking_ref", async (req, res) => {
  try {
    const { booking_ref } = req.params;

    const bookingResult = await HotelBooking.findByReference(booking_ref);

    if (!bookingResult.success) {
      return res.status(404).json({
        success: false,
        error: "Booking not found",
        message: `No booking found with reference ${booking_ref}`,
      });
    }

    // Get associated payments
    const paymentsResult = await Payment.findByBookingId(bookingResult.data.id);

    // Get associated vouchers
    const vouchersResult = await Voucher.findLatestByBookingId(
      bookingResult.data.id,
    );

    res.json({
      success: true,
      data: {
        booking: bookingResult.data,
        payments: paymentsResult.success ? paymentsResult.data : [],
        voucher: vouchersResult.success ? vouchersResult.data : null,
      },
      message: "Booking details retrieved successfully",
    });
  } catch (error) {
    console.error("Admin booking details error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Failed to fetch booking details",
    });
  }
});

/**
 * Get booking analytics
 * GET /api/admin/bookings/analytics/overview
 */
router.get("/analytics/overview", async (req, res) => {
  try {
    const {
      date_from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0], // 30 days ago
      date_to = new Date().toISOString().split("T")[0], // Today
    } = req.query;

    const [bookingAnalytics, paymentAnalytics, voucherAnalytics] =
      await Promise.all([
        HotelBooking.getAnalytics(date_from, date_to),
        Payment.getAnalytics(date_from, date_to),
        Voucher.getAnalytics(date_from, date_to),
      ]);

    const analytics = {
      period: { from: date_from, to: date_to },
      bookings: bookingAnalytics.success ? bookingAnalytics.data : null,
      payments: paymentAnalytics.success ? paymentAnalytics.data : null,
      vouchers: voucherAnalytics.success ? voucherAnalytics.data : null,
    };

    res.json({
      success: true,
      data: analytics,
      message: "Analytics retrieved successfully",
    });
  } catch (error) {
    console.error("Admin analytics error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Failed to fetch analytics",
    });
  }
});

/**
 * Update booking status
 * PUT /api/admin/bookings/:booking_ref/status
 */
router.put("/:booking_ref/status", async (req, res) => {
  try {
    const { booking_ref } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: "Status is required",
        message: "Please provide a status to update",
      });
    }

    const result = await HotelBooking.updateStatus(booking_ref, status, {
      internal_notes: notes,
    });

    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        message: `Booking status updated to ${status}`,
      });
    } else {
      res.status(404).json({
        success: false,
        error: result.error,
        message: "Failed to update booking status",
      });
    }
  } catch (error) {
    console.error("Admin booking status update error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Failed to update booking status",
    });
  }
});

/**
 * Get all payments with filters
 * GET /api/admin/payments
 */
router.get("/payments/list", async (req, res) => {
  try {
    const {
      status,
      payment_method,
      date_from,
      date_to,
      booking_ref,
      page = 1,
      limit = 20,
    } = req.query;

    const filters = {};

    if (status) filters.status = status;
    if (payment_method) filters.payment_method = payment_method;
    if (date_from) filters.date_from = date_from;
    if (date_to) filters.date_to = date_to;
    if (booking_ref) filters.booking_ref = booking_ref;

    const result = await Payment.getAll(
      filters,
      parseInt(page),
      parseInt(limit),
    );

    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
        message: `Found ${result.data.length} payments`,
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        message: "Failed to fetch payments",
      });
    }
  } catch (error) {
    console.error("Admin payments fetch error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Internal server error",
    });
  }
});

/**
 * Get all vouchers with filters
 * GET /api/admin/vouchers
 */
router.get("/vouchers/list", async (req, res) => {
  try {
    const {
      voucher_type,
      email_sent,
      date_from,
      date_to,
      booking_ref,
      page = 1,
      limit = 20,
    } = req.query;

    const filters = {};

    if (voucher_type) filters.voucher_type = voucher_type;
    if (email_sent !== undefined) filters.email_sent = email_sent === "true";
    if (date_from) filters.date_from = date_from;
    if (date_to) filters.date_to = date_to;
    if (booking_ref) filters.booking_ref = booking_ref;

    const result = await Voucher.getAll(
      filters,
      parseInt(page),
      parseInt(limit),
    );

    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
        message: `Found ${result.data.length} vouchers`,
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        message: "Failed to fetch vouchers",
      });
    }
  } catch (error) {
    console.error("Admin vouchers fetch error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Internal server error",
    });
  }
});

/**
 * Resend voucher email
 * POST /api/admin/vouchers/:voucher_id/resend
 */
router.post("/vouchers/:voucher_id/resend", async (req, res) => {
  try {
    const { voucher_id } = req.params;
    const { email_address } = req.body;

    const result = await Voucher.resendEmail(
      parseInt(voucher_id),
      email_address,
    );

    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        message: "Voucher queued for resending",
      });
    } else {
      res.status(404).json({
        success: false,
        error: result.error,
        message: "Failed to resend voucher",
      });
    }
  } catch (error) {
    console.error("Admin voucher resend error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Failed to resend voucher",
    });
  }
});

/**
 * Get database health and statistics
 * GET /api/admin/database/health
 */
router.get("/database/health", async (req, res) => {
  try {
    const db = require("../database/connection");

    const health = await db.healthCheck();
    const stats = db.getStats();

    res.json({
      success: true,
      data: {
        health,
        stats,
        tables: {
          bookings: "hotel_bookings",
          payments: "payments",
          vouchers: "vouchers",
          suppliers: "suppliers",
        },
      },
      message: "Database health check completed",
    });
  } catch (error) {
    console.error("Database health check error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Database health check failed",
    });
  }
});

module.exports = router;
