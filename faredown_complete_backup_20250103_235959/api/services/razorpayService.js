/**
 * Razorpay Payment Service
 * Handles payment processing, order creation, and verification
 */

const Razorpay = require("razorpay");
const crypto = require("crypto");

class RazorpayService {
  constructor() {
    // Initialize Razorpay with test keys (to be replaced with production keys)
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_faredown",
      key_secret: process.env.RAZORPAY_KEY_SECRET || "test_secret_faredown",
    });

    // Store orders temporarily
    this.orders = new Map();
  }

  /**
   * Create Razorpay order for hotel booking
   */
  async createBookingOrder(orderData) {
    try {
      const {
        amount, // Amount in smallest currency unit (paise for INR)
        currency = "INR",
        bookingRef,
        customerDetails,
        hotelDetails,
        notes = {},
      } = orderData;

      // Validate amount
      if (!amount || amount <= 0) {
        throw new Error("Valid amount is required");
      }

      // Create order with Razorpay
      const orderOptions = {
        amount: Math.round(amount * 100), // Convert to paise
        currency,
        receipt: bookingRef,
        notes: {
          booking_ref: bookingRef,
          hotel_code: hotelDetails?.hotelCode || "",
          customer_email: customerDetails?.email || "",
          booking_type: "hotel",
          ...notes,
        },
        payment_capture: 1, // Auto capture
      };

      const razorpayOrder = await this.razorpay.orders.create(orderOptions);

      // Store order details
      const orderRecord = {
        orderId: razorpayOrder.id,
        bookingRef,
        amount: amount,
        currency,
        customerDetails,
        hotelDetails,
        status: "created",
        createdAt: new Date().toISOString(),
        razorpayOrder,
      };

      this.orders.set(razorpayOrder.id, orderRecord);

      return {
        success: true,
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: this.razorpay.key_id,
        orderDetails: orderRecord,
      };
    } catch (error) {
      console.error("Razorpay order creation error:", error);
      throw new Error(`Failed to create payment order: ${error.message}`);
    }
  }

  /**
   * Verify Razorpay payment signature
   */
  verifyPaymentSignature(paymentData) {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
        paymentData;

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        throw new Error("Missing payment verification data");
      }

      // Create signature string
      const signatureString = `${razorpay_order_id}|${razorpay_payment_id}`;

      // Generate expected signature
      const expectedSignature = crypto
        .createHmac("sha256", this.razorpay.key_secret)
        .update(signatureString)
        .digest("hex");

      // Verify signature
      const isSignatureValid = expectedSignature === razorpay_signature;

      if (!isSignatureValid) {
        throw new Error("Payment signature verification failed");
      }

      // Update order status
      const orderRecord = this.orders.get(razorpay_order_id);
      if (orderRecord) {
        orderRecord.status = "paid";
        orderRecord.paymentId = razorpay_payment_id;
        orderRecord.paidAt = new Date().toISOString();
      }

      return {
        success: true,
        verified: true,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
      };
    } catch (error) {
      console.error("Payment verification error:", error);
      return {
        success: false,
        verified: false,
        error: error.message,
      };
    }
  }

  /**
   * Get payment details from Razorpay
   */
  async getPaymentDetails(paymentId) {
    try {
      const payment = await this.razorpay.payments.fetch(paymentId);
      return {
        success: true,
        payment,
      };
    } catch (error) {
      console.error("Get payment details error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Process refund
   */
  async processRefund(paymentId, amount, reason = "Customer request") {
    try {
      const refundOptions = {
        amount: Math.round(amount * 100), // Convert to paise
        notes: {
          reason,
          processed_by: "faredown_system",
          refund_date: new Date().toISOString(),
        },
      };

      const refund = await this.razorpay.payments.refund(
        paymentId,
        refundOptions,
      );

      return {
        success: true,
        refund,
      };
    } catch (error) {
      console.error("Refund processing error:", error);
      throw new Error(`Failed to process refund: ${error.message}`);
    }
  }

  /**
   * Get order details
   */
  getOrder(orderId) {
    return this.orders.get(orderId) || null;
  }

  /**
   * Update order status
   */
  updateOrderStatus(orderId, status, additionalData = {}) {
    const order = this.orders.get(orderId);
    if (order) {
      order.status = status;
      order.updatedAt = new Date().toISOString();
      Object.assign(order, additionalData);
      return order;
    }
    return null;
  }

  /**
   * Get supported payment methods
   */
  getSupportedMethods() {
    return {
      cards: {
        credit: true,
        debit: true,
        prepaid: true,
      },
      netbanking: {
        supported_banks: [
          "SBI",
          "HDFC",
          "ICICI",
          "AXIS",
          "PNB",
          "BOB",
          "CANARA",
          "UNION",
          "ALLAHABAD",
          "ANDHRA",
          "CORPORATION",
          "INDIAN",
          "PUNJAB",
          "SYNDICATE",
          "UCO",
          "VIJAYA",
        ],
      },
      wallets: {
        supported: ["paytm", "mobikwik", "olamoney", "freecharge"],
      },
      upi: {
        supported: true,
        apps: ["gpay", "phonepe", "paytm", "bhim", "amazon"],
      },
      emi: {
        supported: true,
        tenure: [3, 6, 9, 12, 18, 24],
      },
    };
  }

  /**
   * Calculate payment fees
   */
  calculatePaymentFees(amount, method = "card") {
    const fees = {
      card: amount * 0.02, // 2% for cards
      netbanking: amount * 0.015, // 1.5% for netbanking
      upi: amount * 0.005, // 0.5% for UPI
      wallet: amount * 0.01, // 1% for wallets
    };

    const fee = fees[method] || fees.card;
    const gst = fee * 0.18; // 18% GST on payment gateway fees
    const totalFee = fee + gst;

    return {
      gatewayFee: Math.round(fee * 100) / 100,
      gst: Math.round(gst * 100) / 100,
      totalFee: Math.round(totalFee * 100) / 100,
    };
  }

  /**
   * Generate payment link for hotel booking
   */
  async generatePaymentLink(linkData) {
    try {
      const {
        amount,
        currency = "INR",
        bookingRef,
        customerDetails,
        hotelDetails,
        expiryTime = 900, // 15 minutes
      } = linkData;

      const linkOptions = {
        amount: Math.round(amount * 100),
        currency,
        accept_partial: false,
        first_min_partial_amount: Math.round(amount * 100),
        reference_id: bookingRef,
        description: `Hotel Booking Payment - ${hotelDetails?.hotelName || "Hotel"}`,
        customer: {
          name: `${customerDetails.firstName} ${customerDetails.lastName}`,
          email: customerDetails.email,
          contact: customerDetails.phone,
        },
        notify: {
          sms: true,
          email: true,
        },
        reminder_enable: true,
        notes: {
          booking_ref: bookingRef,
          hotel_code: hotelDetails?.hotelCode || "",
          booking_type: "hotel",
        },
        callback_url: `${process.env.FRONTEND_URL}/booking/confirm`,
        callback_method: "get",
        expire_by: Math.floor((Date.now() + expiryTime * 1000) / 1000),
      };

      const paymentLink = await this.razorpay.paymentLink.create(linkOptions);

      return {
        success: true,
        paymentLink,
      };
    } catch (error) {
      console.error("Payment link creation error:", error);
      throw new Error(`Failed to create payment link: ${error.message}`);
    }
  }

  /**
   * Get payment statistics
   */
  getPaymentStats() {
    const allOrders = Array.from(this.orders.values());

    const stats = {
      totalOrders: allOrders.length,
      completedPayments: allOrders.filter((o) => o.status === "paid").length,
      pendingPayments: allOrders.filter((o) => o.status === "created").length,
      failedPayments: allOrders.filter((o) => o.status === "failed").length,
      totalAmount: allOrders
        .filter((o) => o.status === "paid")
        .reduce((sum, o) => sum + o.amount, 0),
      averageOrderValue: 0,
    };

    if (stats.completedPayments > 0) {
      stats.averageOrderValue = stats.totalAmount / stats.completedPayments;
    }

    return stats;
  }

  /**
   * Validate webhook signature
   */
  validateWebhookSignature(payload, signature, secret) {
    try {
      const expectedSignature = crypto
        .createHmac("sha256", secret || this.razorpay.key_secret)
        .update(payload)
        .digest("hex");

      return expectedSignature === signature;
    } catch (error) {
      console.error("Webhook signature validation error:", error);
      return false;
    }
  }
}

module.exports = new RazorpayService();
