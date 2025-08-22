/**
 * Hotelbeds Booking Service
 * Handles hotel booking operations with Hotelbeds API
 */

const hotelbedsService = require("./hotelbedsService");
const markupService = require("./markupService");
const emailService = require("./emailService");
const voucherService = require("./voucherService");
const loyaltyService = require("./loyaltyService");
const HotelBooking = require("../models/HotelBooking");
const Payment = require("../models/Payment");
const Voucher = require("../models/Voucher");
const db = require("../database/connection");
const { v4: uuidv4 } = require("uuid");

class HotelBookingService {
  constructor() {
    // Initialize database connection
    this.initializeDatabase();
    this.pendingBookings = new Map(); // Temporary storage for payment pending bookings (15 min TTL)
  }

  /**
   * Initialize database connection
   */
  async initializeDatabase() {
    try {
      if (!db.isConnected) {
        await db.initialize();
        await db.initializeSchema();
      }
    } catch (error) {
      console.error(
        "Failed to initialize database for booking service:",
        error,
      );
    }
  }

  /**
   * Pre-book hotel (hold inventory during payment)
   */
  async preBookHotel(bookingData) {
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
      } = bookingData;

      // Generate temporary booking reference
      const tempBookingRef = `TEMP_${uuidv4().substring(0, 8).toUpperCase()}`;

      // Validate guest details
      const validationResult = this.validateGuestDetails(guestDetails);
      if (!validationResult.isValid) {
        throw new Error(
          `Validation failed: ${validationResult.errors.join(", ")}`,
        );
      }

      // Create pre-booking record
      const preBooking = {
        tempBookingRef,
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
        status: "pending_payment",
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
        paymentStatus: "pending",
      };

      // Store temporarily
      this.pendingBookings.set(tempBookingRef, preBooking);

      // Set auto-cleanup
      setTimeout(
        () => {
          this.pendingBookings.delete(tempBookingRef);
        },
        15 * 60 * 1000,
      ); // 15 minutes

      return {
        success: true,
        tempBookingRef,
        expiresAt: preBooking.expiresAt,
        totalAmount,
        currency,
      };
    } catch (error) {
      console.error("Pre-booking error:", error);
      throw new Error(`Pre-booking failed: ${error.message}`);
    }
  }

  /**
   * Confirm booking after successful payment
   */
  async confirmBooking(tempBookingRef, paymentDetails) {
    try {
      const preBooking = this.pendingBookings.get(tempBookingRef);

      if (!preBooking) {
        throw new Error("Pre-booking not found or expired");
      }

      if (new Date() > new Date(preBooking.expiresAt)) {
        this.pendingBookings.delete(tempBookingRef);
        throw new Error("Pre-booking has expired");
      }

      // Prepare Hotelbeds booking request
      const hotelbedsBookingRequest = {
        clientReference: tempBookingRef,
        holder: {
          name: preBooking.guestDetails.primaryGuest.firstName,
          surname: preBooking.guestDetails.primaryGuest.lastName,
          email: preBooking.contactInfo.email,
          phoneNumber: preBooking.contactInfo.phone,
        },
        stay: {
          checkIn: preBooking.checkIn,
          checkOut: preBooking.checkOut,
        },
        occupancies: preBooking.rooms.map((room) => ({
          rooms: 1,
          adults: room.adults,
          children: room.children,
          childrenAges: room.childrenAges || [],
        })),
        hotel: {
          code: preBooking.hotelCode,
        },
        rooms: [
          {
            rateKey: preBooking.rateKey,
            roomCode: preBooking.roomCode,
          },
        ],
        remark: preBooking.specialRequests || "Booking via Faredown",
      };

      // Make booking with Hotelbeds
      const hotelbedsResponse = await this.makeHotelbedsBooking(
        hotelbedsBookingRequest,
      );

      if (!hotelbedsResponse.success) {
        throw new Error(`Hotelbeds booking failed: ${hotelbedsResponse.error}`);
      }

      // Generate final booking reference
      const finalBookingRef = HotelBooking.generateBookingRef();

      // Get hotel details for database storage
      const hotelDetails = hotelbedsResponse.bookingDetails?.hotel || {};

      // Prepare booking data for database
      const bookingDbData = {
        booking_ref: finalBookingRef,
        supplier_id: 1, // Hotelbeds supplier ID from database
        hotel_code: preBooking.hotelCode,
        hotel_name: hotelDetails.name || "Hotel Name",
        hotel_address: hotelDetails.address || "",
        hotel_city: hotelDetails.city || "",
        hotel_country: hotelDetails.country || "",
        hotel_rating: hotelDetails.rating || null,
        room_type: hotelDetails.roomType || "Standard Room",
        room_name: hotelDetails.roomName || "Standard Room",
        room_code: preBooking.roomCode,
        guest_details: {
          primaryGuest: preBooking.guestDetails.primaryGuest,
          additionalGuests: preBooking.guestDetails.additionalGuests || [],
          contactInfo: preBooking.contactInfo,
        },
        check_in_date: preBooking.checkIn,
        check_out_date: preBooking.checkOut,
        nights: this.calculateNights(preBooking.checkIn, preBooking.checkOut),
        rooms_count: preBooking.rooms.length,
        adults_count: preBooking.rooms.reduce(
          (sum, room) => sum + room.adults,
          0,
        ),
        children_count: preBooking.rooms.reduce(
          (sum, room) => sum + (room.children || 0),
          0,
        ),
        children_ages: preBooking.rooms.flatMap(
          (room) => room.childrenAges || [],
        ),
        base_price: preBooking.totalAmount * 0.85, // Approximate base price
        markup_amount: preBooking.totalAmount * 0.15, // Approximate markup
        markup_percentage: 15.0,
        total_amount: preBooking.totalAmount,
        currency: preBooking.currency,
        status: "confirmed",
        supplier_booking_ref: hotelbedsResponse.bookingReference,
        supplier_response: hotelbedsResponse,
        special_requests: preBooking.specialRequests,
      };

      // Store confirmed booking in database
      const dbResult = await HotelBooking.create(bookingDbData);

      if (!dbResult.success) {
        throw new Error(
          `Failed to store booking in database: ${dbResult.error}`,
        );
      }

      const confirmedBooking = dbResult.data;

      // Store payment details in database
      const paymentDbData = {
        booking_id: confirmedBooking.id,
        gateway: "razorpay",
        gateway_payment_id: paymentDetails.razorpay_payment_id,
        gateway_order_id: paymentDetails.razorpay_order_id,
        amount: paymentDetails.amount,
        currency: paymentDetails.currency,
        payment_method: paymentDetails.method,
        payment_details: {
          signature: paymentDetails.razorpay_signature,
          paidAt: new Date().toISOString(),
        },
        status: "completed",
        gateway_response: paymentDetails,
      };

      const paymentResult = await Payment.create(paymentDbData);

      if (!paymentResult.success) {
        console.error(
          "Failed to store payment in database:",
          paymentResult.error,
        );
      }

      // Remove from pending
      this.pendingBookings.delete(tempBookingRef);

      // Generate voucher and send confirmation email (don't wait for it)
      this.processBookingConfirmation(confirmedBooking).catch((error) => {
        console.error("Failed to process booking confirmation:", error);
      });

      return {
        success: true,
        bookingRef: finalBookingRef,
        confirmationNumber: hotelbedsResponse.confirmationNumber,
        booking: confirmedBooking,
      };
    } catch (error) {
      console.error("Booking confirmation error:", error);
      throw new Error(`Booking confirmation failed: ${error.message}`);
    }
  }

  /**
   * Make actual booking with Hotelbeds API
   */
  async makeHotelbedsBooking(bookingRequest) {
    try {
      // Mock Hotelbeds booking API call
      // In production, this would make actual API call to Hotelbeds

      const response = await hotelbedsService.makeRequest(
        "bookings",
        "POST",
        bookingRequest,
        false,
      );

      // Simulate successful booking response
      const mockResponse = {
        success: true,
        bookingReference: `HB${Date.now()}`,
        confirmationNumber: `CNF${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        status: "CONFIRMED",
        bookingDetails: {
          hotel: {
            code: bookingRequest.hotel.code,
            name: "Sample Hotel Name",
          },
          rooms: bookingRequest.rooms,
          stay: bookingRequest.stay,
          totalAmount: bookingRequest.totalAmount || 5000,
          currency: "EUR",
        },
      };

      return mockResponse;
    } catch (error) {
      console.error("Hotelbeds booking API error:", error);
      return {
        success: false,
        error: error.message || "Unknown booking error",
      };
    }
  }

  /**
   * Cancel booking
   */
  async cancelBooking(bookingRef, reason = "Customer request") {
    try {
      const booking = this.bookings.get(bookingRef);

      if (!booking) {
        throw new Error("Booking not found");
      }

      if (booking.status === "cancelled") {
        throw new Error("Booking is already cancelled");
      }

      // Check cancellation policy
      const cancellationAllowed = this.checkCancellationPolicy(booking);
      if (!cancellationAllowed.allowed) {
        throw new Error(
          `Cancellation not allowed: ${cancellationAllowed.reason}`,
        );
      }

      // Update booking status
      booking.status = "cancelled";
      booking.cancelledAt = new Date().toISOString();
      booking.cancellationReason = reason;
      booking.refundAmount = cancellationAllowed.refundAmount;

      return {
        success: true,
        booking,
        refundAmount: cancellationAllowed.refundAmount,
      };
    } catch (error) {
      console.error("Booking cancellation error:", error);
      throw new Error(`Cancellation failed: ${error.message}`);
    }
  }

  /**
   * Get booking details
   */
  getBooking(bookingRef) {
    return this.bookings.get(bookingRef) || null;
  }

  /**
   * Get pre-booking details
   */
  getPreBooking(tempBookingRef) {
    return this.pendingBookings.get(tempBookingRef) || null;
  }

  /**
   * Get user bookings
   */
  getUserBookings(userId, limit = 10, offset = 0) {
    const userBookings = Array.from(this.bookings.values())
      .filter((booking) =>
        booking.guestDetails?.primaryGuest?.email?.includes(userId),
      )
      .sort((a, b) => new Date(b.confirmedAt) - new Date(a.confirmedAt))
      .slice(offset, offset + limit);

    return {
      bookings: userBookings,
      total: userBookings.length,
      hasMore: userBookings.length === limit,
    };
  }

  /**
   * Validate guest details
   */
  validateGuestDetails(guestDetails) {
    const errors = [];

    if (!guestDetails.primaryGuest) {
      errors.push("Primary guest details are required");
    } else {
      const primary = guestDetails.primaryGuest;
      if (!primary.firstName)
        errors.push("Primary guest first name is required");
      if (!primary.lastName) errors.push("Primary guest last name is required");
    }

    if (!guestDetails.contactInfo) {
      errors.push("Contact information is required");
    } else {
      const contact = guestDetails.contactInfo;
      if (!contact.email) errors.push("Email is required");
      if (!contact.phone) errors.push("Phone number is required");

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (contact.email && !emailRegex.test(contact.email)) {
        errors.push("Valid email address is required");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check cancellation policy
   */
  checkCancellationPolicy(booking) {
    const checkInDate = new Date(booking.checkIn);
    const now = new Date();
    const daysUntilCheckIn = Math.ceil(
      (checkInDate - now) / (1000 * 60 * 60 * 24),
    );

    // Sample cancellation policy
    if (daysUntilCheckIn >= 7) {
      return {
        allowed: true,
        refundAmount: booking.totalAmount * 0.9, // 90% refund
        reason: "Free cancellation",
      };
    } else if (daysUntilCheckIn >= 3) {
      return {
        allowed: true,
        refundAmount: booking.totalAmount * 0.5, // 50% refund
        reason: "Partial refund",
      };
    } else {
      return {
        allowed: false,
        refundAmount: 0,
        reason: "No refund within 3 days of check-in",
      };
    }
  }

  /**
   * Get booking statistics
   */
  getBookingStats() {
    const allBookings = Array.from(this.bookings.values());
    const pendingBookings = Array.from(this.pendingBookings.values());

    return {
      totalBookings: allBookings.length,
      confirmedBookings: allBookings.filter((b) => b.status === "confirmed")
        .length,
      cancelledBookings: allBookings.filter((b) => b.status === "cancelled")
        .length,
      pendingPayment: pendingBookings.length,
      totalRevenue: allBookings
        .filter((b) => b.status === "confirmed")
        .reduce((sum, b) => sum + (b.totalAmount || 0), 0),
      averageBookingValue:
        allBookings.length > 0
          ? allBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0) /
            allBookings.length
          : 0,
    };
  }

  /**
   * Send booking confirmation email
   */
  async sendBookingConfirmationEmail(booking) {
    try {
      await emailService.sendBookingConfirmation(booking);
      console.log(`Booking confirmation email sent for ${booking.bookingRef}`);
    } catch (error) {
      console.error(
        `Failed to send booking confirmation email for ${booking.bookingRef}:`,
        error,
      );
    }
  }

  /**
   * Cleanup expired pre-bookings
   */
  cleanupExpiredBookings() {
    const now = new Date();
    for (const [ref, booking] of this.pendingBookings.entries()) {
      if (new Date(booking.expiresAt) <= now) {
        this.pendingBookings.delete(ref);
      }
    }
  }

  /**
   * Calculate number of nights between check-in and check-out
   */
  calculateNights(checkIn, checkOut) {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  /**
   * Process booking confirmation - generate voucher and send email
   */
  async processBookingConfirmation(booking) {
    try {
      console.log(`Processing booking confirmation for ${booking.booking_ref}`);

      // Generate voucher
      const voucherResult = await voucherService.generateHotelVoucher({
        bookingRef: booking.booking_ref,
        hotelName: booking.hotel_name,
        hotelAddress: booking.hotel_address,
        checkIn: booking.check_in_date,
        checkOut: booking.check_out_date,
        nights: booking.nights,
        roomType: booking.room_type,
        guestName: `${booking.guest_details.primaryGuest.firstName} ${booking.guest_details.primaryGuest.lastName}`,
        totalAmount: booking.total_amount,
        currency: booking.currency,
      });

      if (voucherResult.success) {
        // Store voucher in database
        const voucherNumber = Voucher.generateVoucherNumber(
          booking.booking_ref,
        );
        const voucherDbData = {
          booking_id: booking.id,
          voucher_type: "hotel",
          voucher_number: voucherNumber,
          pdf_path: `/vouchers/${booking.booking_ref}.pdf`,
          pdf_size_bytes: voucherResult.pdf ? voucherResult.pdf.length : 0,
          email_address: booking.guest_details.contactInfo.email,
        };

        const voucherDbResult = await Voucher.create(voucherDbData);

        if (voucherDbResult.success) {
          // Send confirmation email with voucher
          const emailResult = await emailService.sendBookingConfirmation({
            to: booking.guest_details.contactInfo.email,
            guestName: `${booking.guest_details.primaryGuest.firstName} ${booking.guest_details.primaryGuest.lastName}`,
            bookingRef: booking.booking_ref,
            hotelName: booking.hotel_name,
            checkIn: booking.check_in_date,
            checkOut: booking.check_out_date,
            voucherAttachment: voucherResult.pdf,
          });

          if (emailResult.success) {
            // Update voucher email status
            await Voucher.updateEmailStatus(voucherDbResult.data.id, "sent");

            // Process loyalty points earning
            await this.processLoyaltyEarning(booking);

            console.log(
              `✅ Booking confirmation processed successfully for ${booking.booking_ref}`,
            );
          } else {
            console.error(
              `❌ Failed to send email for booking ${booking.booking_ref}:`,
              emailResult.error,
            );
            await Voucher.updateEmailStatus(
              voucherDbResult.data.id,
              "failed",
              emailResult.error,
            );
          }
        } else {
          console.error(
            `�� Failed to store voucher in database for booking ${booking.booking_ref}:`,
            voucherDbResult.error,
          );
        }
      } else {
        console.error(
          `❌ Failed to generate voucher for booking ${booking.booking_ref}:`,
          voucherResult.error,
        );
      }
    } catch (error) {
      console.error(
        `❌ Error processing booking confirmation for ${booking.booking_ref}:`,
        error,
      );
    }
  }

  /**
   * Process loyalty points earning for a confirmed booking
   */
  async processLoyaltyEarning(booking) {
    try {
      console.log(
        `🎯 Processing loyalty earning for booking ${booking.booking_ref}`,
      );

      // Extract user email from booking (adjust based on your data structure)
      const userEmail = booking.guest_details?.contactInfo?.email;
      if (!userEmail) {
        console.log(
          `⚠️ No user email found for booking ${booking.booking_ref}, skipping loyalty earning`,
        );
        return;
      }

      // Calculate eligible amount (base price excluding taxes/fees)
      // This should be the amount on which loyalty points are earned
      const basePrice = parseFloat(booking.total_price) || 0;
      const taxes = parseFloat(booking.taxes) || 0;
      const fees = parseFloat(booking.fees) || 0;
      const eligibleAmount = Math.max(0, basePrice - taxes - fees);

      if (eligibleAmount <= 0) {
        console.log(
          `⚠️ No eligible amount for loyalty earning in booking ${booking.booking_ref}`,
        );
        return;
      }

      // Prepare loyalty earning data
      const loyaltyData = {
        userId: userEmail, // Using email as identifier for now
        bookingId: booking.booking_ref,
        bookingType: "HOTEL",
        eligibility: {
          eligibleAmount: eligibleAmount,
          currency: booking.currency || "INR",
          fxRate: 1.0, // Adjust if currency conversion is needed
        },
        description: `Hotel booking at ${booking.hotel_name || "Selected Hotel"}`,
      };

      // Process the earning (non-blocking)
      const result = await loyaltyService.processEarning(loyaltyData);

      if (result.success) {
        console.log(
          `✅ Loyalty points earned for booking ${booking.booking_ref}: ${result.data?.earnedPoints || 0} points`,
        );
      } else {
        console.error(
          `❌ Failed to process loyalty earning for booking ${booking.booking_ref}:`,
          result.error,
        );
      }
    } catch (error) {
      console.error(
        `❌ Error in loyalty earning process for booking ${booking.booking_ref}:`,
        error,
      );
      // Don't throw - loyalty earning failure shouldn't break booking confirmation
    }
  }

  /**
   * Get booking by reference from database
   */
  async getBooking(bookingRef) {
    try {
      const result = await HotelBooking.findByReference(bookingRef);
      return result;
    } catch (error) {
      console.error("Error getting booking:", error);
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  }

  /**
   * Get all bookings with filters (database version)
   */
  async getAllBookingsFromDb(filters = {}, page = 1, limit = 20) {
    try {
      const result = await HotelBooking.getAll(filters, page, limit);
      return result;
    } catch (error) {
      console.error("Error getting all bookings:", error);
      return {
        success: false,
        error: error.message,
        data: [],
      };
    }
  }

  /**
   * Get booking analytics from database
   */
  async getBookingAnalyticsFromDb(dateFrom, dateTo) {
    try {
      const result = await HotelBooking.getAnalytics(dateFrom, dateTo);
      return result;
    } catch (error) {
      console.error("Error getting booking analytics:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = new HotelBookingService();
