/**
 * Enhanced Hotel Booking Service
 * Integrates with live Hotelbeds API and currency conversion
 */

import { apiClient, ApiResponse } from "@/lib/api";

export interface BookingRequest {
  hotelId: string;
  roomId?: string;
  destinationCode: string;
  destinationName: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  adults: number;
  children: number;
  childrenAges?: number[];
  currency: string;
  customerDetails?: {
    title: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    country?: string;
  };
  specialRequests?: string;
  totalPrice?: number;
}

export interface PreBookingResponse {
  bookingRef: string;
  hotelId: string;
  destinationCode: string;
  roomId?: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  rooms: number;
  adults: number;
  children: number;
  pricing: {
    basePrice: number;
    subtotal: number;
    taxes: number;
    fees: number;
    total: number;
    currency: string;
    originalPrice?: number;
    originalCurrency?: string;
  };
  holdTime: string;
  holdExpiry: string;
  status: string;
  createdAt: string;
}

export interface PaymentOrderResponse {
  orderId: string;
  bookingRef: string;
  amount: number;
  currency: string;
  status: string;
  paymentUrl: string;
  paymentMethods: string[];
  expiryTime: string;
  customerDetails: {
    name: string;
    email: string;
  };
  securityInfo: {
    encrypted: boolean;
    pciCompliant: boolean;
    ssl: boolean;
  };
  createdAt: string;
}

export interface BookingConfirmation {
  bookingRef: string;
  originalRef: string;
  confirmationNumber: string;
  status: string;
  paymentId: string;
  orderId?: string;
  destinationCode?: string;
  confirmedAt: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  booking: {
    type: string;
    supplier: string;
    supplierRef: string;
    voucherGenerated: boolean;
  };
  nextSteps: string[];
}

export interface VoucherInfo {
  voucherUrl: string;
  bookingRef: string;
  confirmationNumber: string;
  generated: boolean;
  generatedAt: string;
  format: string;
  currency: string;
  validity: {
    validFrom: string;
    validUntil: string;
  };
  features: {
    qrCode: boolean;
    barcodeSupported: boolean;
    multiLanguage: boolean;
    mobileOptimized: boolean;
  };
  downloadInfo: {
    fileSize: string;
    pages: number;
    downloadExpiry: string;
  };
}

export interface EmailDeliveryInfo {
  emailSent: boolean;
  messageId: string;
  recipient: string;
  subject: string;
  bookingRef: string;
  sentAt: string;
  emailDetails: {
    template: string;
    language: string;
    customerName: string;
    attachments: {
      name: string;
      type: string;
      size: string;
    }[];
  };
  deliveryInfo: {
    provider: string;
    priority: string;
    tracking: boolean;
    estimatedDelivery: string;
    retryCount: number;
    maxRetries: number;
  };
}

class HotelBookingService {
  private readonly baseUrl = "/api/bookings/hotels";
  private readonly paymentUrl = "/api/payments";
  private readonly voucherUrl = "/api/vouchers";

  /**
   * Create a pre-booking hold with live hotel data and currency conversion
   */
  async createPreBooking(request: BookingRequest): Promise<PreBookingResponse> {
    try {
      console.log("🏨 Creating pre-booking with live integration:", {
        hotelId: request.hotelId,
        destinationCode: request.destinationCode,
        currency: request.currency,
      });

      const response = await apiClient.post<ApiResponse<PreBookingResponse>>(
        `${this.baseUrl}/pre-book`,
        {
          hotelId: request.hotelId,
          roomId: request.roomId,
          destinationCode: request.destinationCode,
          destinationName: request.destinationName,
          checkIn: request.checkIn,
          checkOut: request.checkOut,
          rooms: request.rooms,
          adults: request.adults,
          children: request.children,
          childrenAges: request.childrenAges,
          currency: request.currency,
          customerDetails: request.customerDetails,
          specialRequests: request.specialRequests,
          totalPrice: request.totalPrice,
        },
      );

      if (response.success && response.data) {
        console.log("✅ Pre-booking created:", response.data.bookingRef);
        return response.data;
      }

      throw new Error(response.error || "Pre-booking failed");
    } catch (error) {
      console.error("Pre-booking error:", error);
      throw new Error(
        error instanceof Error ? error.message : "Pre-booking failed",
      );
    }
  }

  /**
   * Create payment order with enhanced security and currency support
   */
  async createPaymentOrder(
    bookingRef: string,
    amount: number,
    currency: string,
    customerDetails: {
      name: string;
      email: string;
    },
    hotelId?: string,
    destinationCode?: string,
  ): Promise<PaymentOrderResponse> {
    try {
      console.log("💳 Creating payment order:", {
        bookingRef,
        amount,
        currency,
        destinationCode,
      });

      const response = await apiClient.post<ApiResponse<PaymentOrderResponse>>(
        `${this.paymentUrl}/create-order`,
        {
          bookingRef,
          amount,
          currency,
          customerDetails,
          hotelId,
          destinationCode,
        },
      );

      if (response.success && response.data) {
        console.log("✅ Payment order created:", response.data.orderId);
        return response.data;
      }

      throw new Error(response.error || "Payment order creation failed");
    } catch (error) {
      console.error("Payment order error:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "Payment order creation failed",
      );
    }
  }

  /**
   * Confirm booking after successful payment
   */
  async confirmBooking(
    bookingRef: string,
    paymentId: string,
    orderId?: string,
    destinationCode?: string,
    customerDetails?: {
      name: string;
      email: string;
      phone?: string;
    },
  ): Promise<BookingConfirmation> {
    try {
      console.log("✅ Confirming booking:", {
        bookingRef,
        paymentId,
        destinationCode,
      });

      const response = await apiClient.post<ApiResponse<BookingConfirmation>>(
        `${this.baseUrl}/confirm`,
        {
          bookingRef,
          paymentId,
          orderId,
          destinationCode,
          customerDetails,
        },
      );

      if (response.success && response.data) {
        console.log("✅ Booking confirmed:", response.data.confirmationNumber);
        return response.data;
      }

      throw new Error(response.error || "Booking confirmation failed");
    } catch (error) {
      console.error("Booking confirmation error:", error);
      throw new Error(
        error instanceof Error ? error.message : "Booking confirmation failed",
      );
    }
  }

  /**
   * Generate hotel voucher with booking details
   */
  async generateVoucher(
    bookingRef: string,
    currency?: string,
  ): Promise<VoucherInfo> {
    try {
      console.log("🎟️ Generating voucher for booking:", bookingRef);

      const queryParams = currency ? `?currency=${currency}` : "";
      const response = await apiClient.get<ApiResponse<VoucherInfo>>(
        `${this.voucherUrl}/hotel/${bookingRef}${queryParams}`,
      );

      if (response.success && response.data) {
        console.log("✅ Voucher generated:", response.data.voucherUrl);
        return response.data;
      }

      throw new Error(response.error || "Voucher generation failed");
    } catch (error) {
      console.error("Voucher generation error:", error);
      throw new Error(
        error instanceof Error ? error.message : "Voucher generation failed",
      );
    }
  }

  /**
   * Send voucher and booking confirmation via email
   */
  async sendVoucherEmail(
    bookingRef: string,
    recipientEmail: string,
    customerName: string,
    options: {
      language?: string;
      includeAttachments?: boolean;
    } = {},
  ): Promise<EmailDeliveryInfo> {
    try {
      console.log("📧 Sending voucher email:", {
        bookingRef,
        recipientEmail,
        customerName,
      });

      const response = await apiClient.post<ApiResponse<EmailDeliveryInfo>>(
        `${this.voucherUrl}/hotel/${bookingRef}/email`,
        {
          recipientEmail,
          customerName,
          language: options.language || "en",
          includeAttachments: options.includeAttachments ?? true,
        },
      );

      if (response.success && response.data) {
        console.log("✅ Email sent:", response.data.messageId);
        return response.data;
      }

      throw new Error(response.error || "Email sending failed");
    } catch (error) {
      console.error("Email sending error:", error);
      throw new Error(
        error instanceof Error ? error.message : "Email sending failed",
      );
    }
  }

  /**
   * Get booking details by reference
   */
  async getBookingDetails(bookingRef: string): Promise<any> {
    try {
      const response = await apiClient.get<ApiResponse<any>>(
        `${this.baseUrl}/details/${bookingRef}`,
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.error || "Booking details not found");
    } catch (error) {
      console.error("Get booking details error:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "Failed to get booking details",
      );
    }
  }

  /**
   * Cancel booking (if cancellation policy allows)
   */
  async cancelBooking(
    bookingRef: string,
    reason?: string,
  ): Promise<{ cancelled: boolean; refundAmount?: number; currency?: string }> {
    try {
      console.log("❌ Cancelling booking:", bookingRef);

      const response = await apiClient.post<ApiResponse<any>>(
        `${this.baseUrl}/cancel`,
        {
          bookingRef,
          reason,
        },
      );

      if (response.success && response.data) {
        console.log("✅ Booking cancelled:", response.data);
        return response.data;
      }

      throw new Error(response.error || "Booking cancellation failed");
    } catch (error) {
      console.error("Booking cancellation error:", error);
      throw new Error(
        error instanceof Error ? error.message : "Booking cancellation failed",
      );
    }
  }

  /**
   * Complete booking flow with automatic voucher generation and email
   */
  async completeBookingFlow(
    request: BookingRequest,
    paymentDetails: {
      paymentMethod: string;
      paymentId: string;
    },
  ): Promise<{
    booking: BookingConfirmation;
    voucher: VoucherInfo;
    email: EmailDeliveryInfo;
  }> {
    try {
      console.log("🔄 Starting complete booking flow...");

      // Step 1: Create pre-booking
      const preBooking = await this.createPreBooking(request);
      console.log("📝 Pre-booking created:", preBooking.bookingRef);

      // Step 2: Create payment order
      const paymentOrder = await this.createPaymentOrder(
        preBooking.bookingRef,
        preBooking.pricing.total,
        preBooking.pricing.currency,
        {
          name:
            request.customerDetails?.firstName &&
            request.customerDetails?.lastName
              ? `${request.customerDetails.firstName} ${request.customerDetails.lastName}`
              : "Guest",
          email: request.customerDetails?.email || "guest@example.com",
        },
        request.hotelId,
        request.destinationCode,
      );
      console.log("💳 Payment order created:", paymentOrder.orderId);

      // Step 3: Confirm booking (simulating successful payment)
      const confirmation = await this.confirmBooking(
        preBooking.bookingRef,
        paymentDetails.paymentId,
        paymentOrder.orderId,
        request.destinationCode,
        {
          name:
            request.customerDetails?.firstName &&
            request.customerDetails?.lastName
              ? `${request.customerDetails.firstName} ${request.customerDetails.lastName}`
              : "Guest",
          email: request.customerDetails?.email || "guest@example.com",
          phone: request.customerDetails?.phone,
        },
      );
      console.log("✅ Booking confirmed:", confirmation.confirmationNumber);

      // Step 4: Generate voucher
      const voucher = await this.generateVoucher(
        confirmation.bookingRef,
        preBooking.pricing.currency,
      );
      console.log("🎟️ Voucher generated");

      // Step 5: Send email
      const email = await this.sendVoucherEmail(
        confirmation.bookingRef,
        request.customerDetails?.email || "guest@example.com",
        request.customerDetails?.firstName || "Guest",
      );
      console.log("📧 Email sent");

      console.log("🎉 Complete booking flow finished successfully!");

      return {
        booking: confirmation,
        voucher,
        email,
      };
    } catch (error) {
      console.error("Complete booking flow error:", error);
      throw new Error(
        error instanceof Error ? error.message : "Booking flow failed",
      );
    }
  }
}

// Export singleton instance
export const hotelBookingService = new HotelBookingService();
export default hotelBookingService;
