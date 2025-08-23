/**
 * Payment Service
 * Handles Razorpay integration and payment processing
 */

import { apiClient, ApiResponse } from "@/lib/api";

export interface PaymentOrder {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export interface PaymentVerification {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  tempBookingRef: string;
}

export interface PaymentMethods {
  cards: {
    credit: boolean;
    debit: boolean;
    prepaid: boolean;
  };
  netbanking: {
    supported_banks: string[];
  };
  wallets: {
    supported: string[];
  };
  upi: {
    supported: boolean;
    apps: string[];
  };
  emi: {
    supported: boolean;
    tenure: number[];
  };
}

class PaymentService {
  private readonly baseUrl = "/api/payments";

  /**
   * Load Razorpay script
   */
  loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  /**
   * Create payment order
   */
  async createPaymentOrder(orderData: {
    tempBookingRef: string;
    amount: number;
    currency?: string;
    customerDetails: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    };
    hotelDetails: {
      hotelCode: string;
      hotelName: string;
    };
  }): Promise<PaymentOrder> {
    try {
      const response = await apiClient.post<ApiResponse<PaymentOrder>>(
        `${this.baseUrl}/create-order`,
        orderData,
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error("Failed to create payment order");
    } catch (error) {
      console.error("Create payment order error:", error);
      throw new Error("Failed to create payment order");
    }
  }

  /**
   * Open Razorpay checkout
   */
  async openRazorpayCheckout(
    paymentOrder: PaymentOrder,
    customerDetails: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    },
    hotelDetails: {
      hotelName: string;
    },
    onSuccess: (response: any) => void,
    onError: (error: any) => void,
  ): Promise<void> {
    try {
      const isLoaded = await this.loadRazorpayScript();
      if (!isLoaded) {
        throw new Error("Razorpay script failed to load");
      }

      const options = {
        key: paymentOrder.keyId,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        order_id: paymentOrder.orderId,
        name: "Faredown Travel",
        description: `Hotel Booking - ${hotelDetails.hotelName}`,
        image: "/favicon.ico", // Add your logo here
        handler: onSuccess,
        prefill: {
          name: `${customerDetails.firstName} ${customerDetails.lastName}`,
          email: customerDetails.email,
          contact: customerDetails.phone,
        },
        theme: {
          color: "#003580",
        },
        modal: {
          ondismiss: () => {
            onError(new Error("Payment cancelled by user"));
          },
        },
        retry: {
          enabled: true,
          max_count: 3,
        },
        timeout: 900, // 15 minutes
        remember_customer: false,
      };

      // @ts-ignore - Razorpay is loaded globally
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Razorpay checkout error:", error);
      onError(error);
    }
  }

  /**
   * Verify payment and confirm booking
   */
  async verifyPayment(verificationData: PaymentVerification): Promise<any> {
    try {
      const response = await apiClient.post<ApiResponse<any>>(
        `${this.baseUrl}/verify`,
        verificationData,
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error("Payment verification failed");
    } catch (error) {
      console.error("Payment verification error:", error);
      throw new Error("Payment verification failed");
    }
  }

  /**
   * Get supported payment methods
   */
  async getPaymentMethods(): Promise<PaymentMethods> {
    try {
      const response = await apiClient.get<ApiResponse<PaymentMethods>>(
        `${this.baseUrl}/methods`,
      );

      if (response.success && response.data) {
        return response.data;
      }

      return {
        cards: { credit: true, debit: true, prepaid: true },
        netbanking: { supported_banks: [] },
        wallets: { supported: [] },
        upi: { supported: true, apps: [] },
        emi: { supported: false, tenure: [] },
      };
    } catch (error) {
      console.error("Get payment methods error:", error);
      return {
        cards: { credit: true, debit: true, prepaid: true },
        netbanking: { supported_banks: [] },
        wallets: { supported: [] },
        upi: { supported: true, apps: [] },
        emi: { supported: false, tenure: [] },
      };
    }
  }

  /**
   * Calculate payment fees
   */
  async calculatePaymentFees(
    amount: number,
    method = "card",
  ): Promise<{
    gatewayFee: number;
    gst: number;
    totalFee: number;
  }> {
    try {
      const response = await apiClient.post<
        ApiResponse<{
          fees: {
            gatewayFee: number;
            gst: number;
            totalFee: number;
          };
        }>
      >(`${this.baseUrl}/calculate-fees`, { amount, method });

      if (response.success && response.data) {
        return response.data.fees;
      }

      return { gatewayFee: 0, gst: 0, totalFee: 0 };
    } catch (error) {
      console.error("Calculate payment fees error:", error);
      return { gatewayFee: 0, gst: 0, totalFee: 0 };
    }
  }

  /**
   * Process hotel booking payment flow
   */
  async processHotelBookingPayment(
    bookingData: {
      tempBookingRef: string;
      amount: number;
      currency?: string;
      customerDetails: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
      };
      hotelDetails: {
        hotelCode: string;
        hotelName: string;
      };
    },
    onSuccess: (bookingRef: string) => void,
    onError: (error: string) => void,
    onLoading?: (isLoading: boolean) => void,
  ): Promise<void> {
    try {
      if (onLoading) onLoading(true);

      // Step 1: Create payment order
      const paymentOrder = await this.createPaymentOrder(bookingData);

      // Step 2: Open Razorpay checkout
      await this.openRazorpayCheckout(
        paymentOrder,
        bookingData.customerDetails,
        bookingData.hotelDetails,
        async (razorpayResponse) => {
          try {
            // Step 3: Verify payment and confirm booking
            const verificationResult = await this.verifyPayment({
              razorpay_order_id: razorpayResponse.razorpay_order_id,
              razorpay_payment_id: razorpayResponse.razorpay_payment_id,
              razorpay_signature: razorpayResponse.razorpay_signature,
              tempBookingRef: bookingData.tempBookingRef,
            });

            if (verificationResult.booking?.bookingRef) {
              onSuccess(verificationResult.booking.bookingRef);
            } else {
              onError("Booking confirmation failed");
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            onError("Payment verification failed");
          } finally {
            if (onLoading) onLoading(false);
          }
        },
        (error) => {
          console.error("Payment error:", error);
          onError(error.message || "Payment failed");
          if (onLoading) onLoading(false);
        },
      );
    } catch (error) {
      console.error("Payment process error:", error);
      onError(error instanceof Error ? error.message : "Payment failed");
      if (onLoading) onLoading(false);
    }
  }

  /**
   * Generate payment link
   */
  async generatePaymentLink(linkData: {
    tempBookingRef: string;
    amount: number;
    currency?: string;
    customerDetails: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    };
    hotelDetails: {
      hotelCode: string;
      hotelName: string;
    };
  }): Promise<{ paymentLink: { short_url: string; id: string } }> {
    try {
      const response = await apiClient.post<ApiResponse<any>>(
        `${this.baseUrl}/generate-link`,
        linkData,
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error("Failed to generate payment link");
    } catch (error) {
      console.error("Generate payment link error:", error);
      throw new Error("Failed to generate payment link");
    }
  }
}

// Export singleton instance
export const paymentService = new PaymentService();
export default paymentService;
