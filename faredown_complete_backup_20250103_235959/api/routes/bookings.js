const express = require("express");
const router = express.Router();
const hotelBookingService = require("../services/hotelBookingService");
const hotelbedsService = require("../services/hotelbedsService");
const markupService = require("../services/markupService");
const { authenticateToken } = require("../middleware/auth");

/**
 * Pre-book hotel (create temporary booking for payment)
 * POST /api/bookings/hotels/pre-book
 */
router.post("/hotels/pre-book", async (req, res) => {
  try {
    const {
      hotelCode,
      roomCode,
      rateKey,
      checkIn,
      checkOut,
      rooms,
      guestDetails,
      contactInfo,
      specialRequests,
      totalAmount,
      currency = "INR",
    } = req.body;

    // Validate required fields
    if (
      !hotelCode ||
      !roomCode ||
      !checkIn ||
      !checkOut ||
      !guestDetails ||
      !contactInfo
    ) {
      return res.status(400).json({
        success: false,
        error: "Missing required booking details",
      });
    }

    // Validate dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkInDate < today) {
      return res.status(400).json({
        success: false,
        error: "Check-in date cannot be in the past",
      });
    }

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({
        success: false,
        error: "Check-out date must be after check-in date",
      });
    }

    const preBookingResult = await hotelBookingService.preBookHotel({
      hotelCode,
      roomCode,
      rateKey,
      checkIn,
      checkOut,
      rooms,
      guestDetails,
      contactInfo,
      specialRequests,
      totalAmount,
      currency,
    });

    res.json({
      success: true,
      data: preBookingResult,
      message: "Pre-booking created successfully",
    });
  } catch (error) {
    console.error("Pre-booking error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to create pre-booking",
    });
  }
});

/**
 * Confirm booking after successful payment
 * POST /api/bookings/hotels/confirm
 */
router.post("/hotels/confirm", async (req, res) => {
  try {
    const { tempBookingRef, paymentDetails } = req.body;

    if (!tempBookingRef || !paymentDetails) {
      return res.status(400).json({
        success: false,
        error: "Booking reference and payment details are required",
      });
    }

    // Validate payment details
    if (
      !paymentDetails.razorpay_payment_id ||
      !paymentDetails.razorpay_order_id
    ) {
      return res.status(400).json({
        success: false,
        error: "Valid payment details are required",
      });
    }

    const confirmationResult = await hotelBookingService.confirmBooking(
      tempBookingRef,
      paymentDetails,
    );

    res.json({
      success: true,
      data: confirmationResult,
      message: "Booking confirmed successfully",
    });
  } catch (error) {
    console.error("Booking confirmation error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to confirm booking",
    });
  }
});

/**
 * Get booking details
 * GET /api/bookings/hotels/:bookingRef
 */
router.get("/hotels/:bookingRef", (req, res) => {
  try {
    const { bookingRef } = req.params;

    const booking = hotelBookingService.getBooking(bookingRef);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: "Booking not found",
      });
    }

    res.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error("Get booking error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get booking details",
    });
  }
});

/**
 * Get pre-booking details
 * GET /api/bookings/hotels/pre-book/:tempRef
 */
router.get("/hotels/pre-book/:tempRef", (req, res) => {
  try {
    const { tempRef } = req.params;

    const preBooking = hotelBookingService.getPreBooking(tempRef);

    if (!preBooking) {
      return res.status(404).json({
        success: false,
        error: "Pre-booking not found or expired",
      });
    }

    res.json({
      success: true,
      data: preBooking,
    });
  } catch (error) {
    console.error("Get pre-booking error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get pre-booking details",
    });
  }
});

/**
 * Cancel booking
 * POST /api/bookings/hotels/:bookingRef/cancel
 */
router.post(
  "/hotels/:bookingRef/cancel",
  authenticateToken,
  async (req, res) => {
    try {
      const { bookingRef } = req.params;
      const { reason = "Customer request" } = req.body;

      const cancellationResult = await hotelBookingService.cancelBooking(
        bookingRef,
        reason,
      );

      res.json({
        success: true,
        data: cancellationResult,
        message: "Booking cancelled successfully",
      });
    } catch (error) {
      console.error("Booking cancellation error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to cancel booking",
      });
    }
  },
);

/**
 * Get user bookings
 * GET /api/bookings/hotels/user/:userId
 */
router.get("/hotels/user/:userId", authenticateToken, (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10, offset = 0 } = req.query;

    const userBookings = hotelBookingService.getUserBookings(
      userId,
      parseInt(limit),
      parseInt(offset),
    );

    res.json({
      success: true,
      data: userBookings,
    });
  } catch (error) {
    console.error("Get user bookings error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get user bookings",
    });
  }
});

/**
 * Get booking statistics (Admin only)
 * GET /api/bookings/hotels/stats
 */
router.get("/hotels/stats", authenticateToken, (req, res) => {
  try {
    const stats = hotelBookingService.getBookingStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get booking stats error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get booking statistics",
    });
  }
});

/**
 * Calculate booking price with markup
 * POST /api/bookings/hotels/calculate-price
 */
router.post("/hotels/calculate-price", async (req, res) => {
  try {
    const {
      hotelCode,
      roomCode,
      rateKey,
      checkIn,
      checkOut,
      rooms = 1,
      adults = 2,
      children = 0,
    } = req.body;

    if (!hotelCode || !checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        error: "Hotel code, check-in and check-out dates are required",
      });
    }

    // Get hotel availability and rates
    const availability = await hotelbedsService.getHotelAvailability(
      hotelCode,
      checkIn,
      checkOut,
      rooms,
      adults,
      children,
    );

    if (!availability || !availability.rooms) {
      return res.status(404).json({
        success: false,
        error: "No availability found for the specified dates",
      });
    }

    // Find the specific room
    const selectedRoom = availability.rooms.find(
      (room) =>
        room.code === roomCode ||
        room.rates?.some((rate) => rate.rateKey === rateKey),
    );

    if (!selectedRoom) {
      return res.status(404).json({
        success: false,
        error: "Selected room not available",
      });
    }

    // Get hotel content for markup calculation
    const hotelContent = hotelbedsService.getCachedHotel(hotelCode) || {
      code: hotelCode,
      supplierId: "hotelbeds",
    };

    // Apply markup
    const markupResult = markupService.applyMarkup(hotelContent, [
      selectedRoom,
    ]);
    const markedUpRoom = markupResult.markedUpRates[0];

    // Calculate total price
    const selectedRate =
      markedUpRoom.rates?.find((rate) => rate.rateKey === rateKey) ||
      markedUpRoom.rates?.[0];

    if (!selectedRate) {
      return res.status(404).json({
        success: false,
        error: "Rate not found",
      });
    }

    const nights = Math.ceil(
      (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24),
    );
    const totalPrice = selectedRate.total * nights * rooms;

    res.json({
      success: true,
      data: {
        room: markedUpRoom,
        selectedRate,
        pricing: {
          basePrice: selectedRate.originalTotal || selectedRate.total,
          markupAmount: selectedRate.markupAmount || 0,
          totalPerNight: selectedRate.total,
          nights,
          rooms,
          totalPrice,
          currency: selectedRate.currency || "EUR",
        },
        markupSummary: markupResult.markupSummary,
      },
    });
  } catch (error) {
    console.error("Price calculation error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to calculate booking price",
    });
  }
});

/**
 * Cleanup expired pre-bookings
 * POST /api/bookings/hotels/cleanup
 */
router.post("/hotels/cleanup", (req, res) => {
  try {
    hotelBookingService.cleanupExpiredBookings();

    res.json({
      success: true,
      message: "Expired pre-bookings cleaned up",
    });
  } catch (error) {
    console.error("Cleanup error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to cleanup expired bookings",
    });
  }
});

module.exports = router;
