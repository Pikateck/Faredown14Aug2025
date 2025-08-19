const express = require("express");
const router = express.Router();
const razorpayService = require("../services/razorpayService");
const hotelBookingService = require("../services/hotelBookingService");
const { authenticateToken } = require("../middleware/auth");

/**
 * Create payment order for hotel booking
 * POST /api/payments/create-order
 */
router.post("/create-order", async (req, res) => {
  try {
    const {
      tempBookingRef,
      amount,
      currency = "INR",
      customerDetails,
      hotelDetails,
    } = req.body;

    if (!tempBookingRef || !amount || !customerDetails) {
      return res.status(400).json({
        success: false,
        error: "Booking reference, amount, and customer details are required",
      });
    }

    // Verify pre-booking exists
    const preBooking = hotelBookingService.getPreBooking(tempBookingRef);
    if (!preBooking) {
      return res.status(404).json({
        success: false,
        error: "Pre-booking not found or expired",
      });
    }

    const orderResult = await razorpayService.createBookingOrder({
      amount,
      currency,
      bookingRef: tempBookingRef,
      customerDetails,
      hotelDetails,
      notes: {
        check_in: preBooking.checkIn,
        check_out: preBooking.checkOut,
        hotel_code: preBooking.hotelCode,
      },
    });

    res.json({
      success: true,
      data: orderResult,
      message: "Payment order created successfully",
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to create payment order",
    });
  }
});

/**
 * Verify payment and confirm booking
 * POST /api/payments/verify
 */
router.post("/verify", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      tempBookingRef,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !tempBookingRef
    ) {
      return res.status(400).json({
        success: false,
        error: "Missing payment verification data",
      });
    }

    // Verify payment signature
    const verificationResult = razorpayService.verifyPaymentSignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    if (!verificationResult.verified) {
      return res.status(400).json({
        success: false,
        error: "Payment verification failed",
        details: verificationResult.error,
      });
    }

    // Get payment details
    const paymentDetails =
      await razorpayService.getPaymentDetails(razorpay_payment_id);

    // Confirm booking
    const bookingResult = await hotelBookingService.confirmBooking(
      tempBookingRef,
      {
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
        method: paymentDetails.payment?.method || "card",
        amount: paymentDetails.payment?.amount
          ? paymentDetails.payment.amount / 100
          : 0,
        currency: paymentDetails.payment?.currency || "INR",
      },
    );

    res.json({
      success: true,
      data: {
        paymentVerified: true,
        booking: bookingResult,
      },
      message: "Payment verified and booking confirmed",
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Payment verification failed",
    });
  }
});

/**
 * Get payment methods
 * GET /api/payments/methods
 */
router.get("/methods", (req, res) => {
  try {
    const methods = razorpayService.getSupportedMethods();

    res.json({
      success: true,
      data: methods,
    });
  } catch (error) {
    console.error("Get payment methods error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get payment methods",
    });
  }
});

/**
 * Calculate payment fees
 * POST /api/payments/calculate-fees
 */
router.post("/calculate-fees", (req, res) => {
  try {
    const { amount, method = "card" } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Valid amount is required",
      });
    }

    const fees = razorpayService.calculatePaymentFees(amount, method);

    res.json({
      success: true,
      data: {
        amount,
        method,
        fees,
        totalAmount: amount + fees.totalFee,
      },
    });
  } catch (error) {
    console.error("Calculate fees error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to calculate payment fees",
    });
  }
});

/**
 * Legacy process endpoint
 * POST /api/payments/process
 */
router.post("/process", (req, res) => {
  res.json({
    success: true,
    data: {
      status: "redirect_to_razorpay",
      message: "Use /create-order endpoint for new payments",
    },
  });
});

module.exports = router;
