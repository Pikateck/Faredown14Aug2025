/**
 * Booking Service
 * Handles hotel booking operations from pre-booking to confirmation
 */

import { apiClient, ApiResponse } from "@/lib/api";

export interface PreBookingRequest {
  hotelCode: string;
  roomCode: string;
  rateKey: string;
  checkIn: string;
  checkOut: string;
  rooms: BookingRoom[];
  guestDetails: GuestDetails;
  contactInfo: ContactInfo;
  specialRequests?: string;
  totalAmount: number;
  currency?: string;
}

export interface BookingRoom {
  adults: number;
  children: number;
  childrenAges?: number[];
}

export interface GuestDetails {
  primaryGuest: Guest;
  additionalGuests?: Guest[];
}

export interface Guest {
  title: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
}

export interface PreBookingResponse {
  tempBookingRef: string;
  expiresAt: string;
  totalAmount: number;
  currency: string;
}

export interface BookingConfirmation {
  bookingRef: string;
  confirmationNumber: string;
  booking: HotelBooking;
}

export interface HotelBooking {
  bookingRef: string;
  status: string;
  hotelDetails: {
    name: string;
    address: string;
    phone: string;
    email: string;
    starRating: number;
  };
  guestDetails: GuestDetails & { contactInfo: ContactInfo };
  roomDetails: {
    name: string;
    category: string;
    bedType: string;
  };
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  currency: string;
  paymentDetails: any;
  confirmedAt: string;
}

export interface PriceCalculation {
  room: any;
  selectedRate: any;
  pricing: {
    basePrice: number;
    markupAmount: number;
    totalPerNight: number;
    nights: number;
    rooms: number;
    totalPrice: number;
    currency: string;
  };
  markupSummary: any;
}

class BookingService {
  private readonly baseUrl = "/api/bookings";

  /**
   * Calculate booking price with markup
   */
  async calculateBookingPrice(priceData: {
    hotelCode: string;
    roomCode?: string;
    rateKey?: string;
    checkIn: string;
    checkOut: string;
    rooms?: number;
    adults?: number;
    children?: number;
  }): Promise<PriceCalculation> {
    try {
      const response = await apiClient.post<ApiResponse<PriceCalculation>>(
        `${this.baseUrl}/hotels/calculate-price`,
        priceData,
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error("Failed to calculate booking price");
    } catch (error) {
      console.error("Price calculation error:", error);
      throw new Error("Failed to calculate booking price");
    }
  }

  /**
   * Create pre-booking (temporary reservation for payment)
   */
  async createPreBooking(
    bookingData: PreBookingRequest,
  ): Promise<PreBookingResponse> {
    try {
      const response = await apiClient.post<ApiResponse<PreBookingResponse>>(
        `${this.baseUrl}/hotels/pre-book`,
        bookingData,
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error("Failed to create pre-booking");
    } catch (error) {
      console.error("Pre-booking error:", error);
      throw new Error("Failed to create pre-booking");
    }
  }

  /**
   * Get pre-booking details
   */
  async getPreBooking(tempBookingRef: string): Promise<any> {
    try {
      const response = await apiClient.get<ApiResponse<any>>(
        `${this.baseUrl}/hotels/pre-book/${tempBookingRef}`,
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error("Pre-booking not found");
    } catch (error) {
      console.error("Get pre-booking error:", error);
      throw new Error("Failed to get pre-booking details");
    }
  }

  /**
   * Confirm booking after successful payment
   */
  async confirmBooking(confirmationData: {
    tempBookingRef: string;
    paymentDetails: {
      razorpay_payment_id: string;
      razorpay_order_id: string;
      razorpay_signature: string;
    };
  }): Promise<BookingConfirmation> {
    try {
      const response = await apiClient.post<ApiResponse<BookingConfirmation>>(
        `${this.baseUrl}/hotels/confirm`,
        confirmationData,
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error("Failed to confirm booking");
    } catch (error) {
      console.error("Booking confirmation error:", error);
      throw new Error("Failed to confirm booking");
    }
  }

  /**
   * Get booking details
   */
  async getBooking(bookingRef: string): Promise<HotelBooking> {
    try {
      const response = await apiClient.get<ApiResponse<HotelBooking>>(
        `${this.baseUrl}/hotels/${bookingRef}`,
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error("Booking not found");
    } catch (error) {
      console.error("Get booking error:", error);
      throw new Error("Failed to get booking details");
    }
  }

  /**
   * Cancel booking
   */
  async cancelBooking(
    bookingRef: string,
    reason = "Customer request",
  ): Promise<any> {
    try {
      const response = await apiClient.post<ApiResponse<any>>(
        `${this.baseUrl}/hotels/${bookingRef}/cancel`,
        { reason },
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error("Failed to cancel booking");
    } catch (error) {
      console.error("Cancel booking error:", error);
      throw new Error("Failed to cancel booking");
    }
  }

  /**
   * Get user bookings
   */
  async getUserBookings(
    userId: string,
    limit = 10,
    offset = 0,
  ): Promise<{
    bookings: HotelBooking[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      const response = await apiClient.get<
        ApiResponse<{
          bookings: HotelBooking[];
          total: number;
          hasMore: boolean;
        }>
      >(`${this.baseUrl}/hotels/user/${userId}`, { limit, offset });

      if (response.success && response.data) {
        return response.data;
      }

      return { bookings: [], total: 0, hasMore: false };
    } catch (error) {
      console.error("Get user bookings error:", error);
      throw new Error("Failed to get user bookings");
    }
  }

  /**
   * Validate booking data
   */
  validateBookingData(bookingData: PreBookingRequest): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Validate required fields
    if (!bookingData.hotelCode) errors.push("Hotel code is required");
    if (!bookingData.roomCode) errors.push("Room code is required");
    if (!bookingData.checkIn) errors.push("Check-in date is required");
    if (!bookingData.checkOut) errors.push("Check-out date is required");
    if (!bookingData.totalAmount || bookingData.totalAmount <= 0) {
      errors.push("Valid total amount is required");
    }

    // Validate dates
    const checkInDate = new Date(bookingData.checkIn);
    const checkOutDate = new Date(bookingData.checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkInDate < today) {
      errors.push("Check-in date cannot be in the past");
    }

    if (checkOutDate <= checkInDate) {
      errors.push("Check-out date must be after check-in date");
    }

    // Validate guest details
    if (!bookingData.guestDetails?.primaryGuest) {
      errors.push("Primary guest details are required");
    } else {
      const primary = bookingData.guestDetails.primaryGuest;
      if (!primary.firstName)
        errors.push("Primary guest first name is required");
      if (!primary.lastName) errors.push("Primary guest last name is required");
    }

    // Validate contact info
    if (!bookingData.contactInfo?.email) {
      errors.push("Contact email is required");
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(bookingData.contactInfo.email)) {
        errors.push("Valid email address is required");
      }
    }

    if (!bookingData.contactInfo?.phone) {
      errors.push("Contact phone number is required");
    }

    // Validate rooms
    if (!bookingData.rooms || bookingData.rooms.length === 0) {
      errors.push("At least one room is required");
    } else {
      bookingData.rooms.forEach((room, index) => {
        if (!room.adults || room.adults < 1) {
          errors.push(`Room ${index + 1}: At least one adult is required`);
        }
        if (room.children < 0) {
          errors.push(
            `Room ${index + 1}: Number of children cannot be negative`,
          );
        }
        if (
          room.children > 0 &&
          (!room.childrenAges || room.childrenAges.length !== room.children)
        ) {
          errors.push(
            `Room ${index + 1}: Children ages are required for all children`,
          );
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Calculate nights between dates
   */
  calculateNights(checkIn: string, checkOut: string): number {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  }

  /**
   * Format booking summary
   */
  formatBookingSummary(booking: PreBookingRequest): string {
    const nights = this.calculateNights(booking.checkIn, booking.checkOut);
    const totalGuests = booking.rooms.reduce(
      (sum, room) => sum + room.adults + room.children,
      0,
    );

    return `${booking.rooms.length} room${booking.rooms.length > 1 ? "s" : ""}, ${totalGuests} guest${totalGuests > 1 ? "s" : ""}, ${nights} night${nights > 1 ? "s" : ""}`;
  }

  /**
   * Complete booking flow (pre-book + payment + confirm)
   */
  async completeBookingFlow(
    bookingData: PreBookingRequest,
    onPreBookingCreated: (tempRef: string) => void,
    onPaymentRequired: (tempRef: string, amount: number) => void,
    onBookingConfirmed: (bookingRef: string) => void,
    onError: (error: string) => void,
  ): Promise<void> {
    try {
      // Step 1: Validate booking data
      const validation = this.validateBookingData(bookingData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(", "));
      }

      // Step 2: Create pre-booking
      const preBookingResult = await this.createPreBooking(bookingData);
      onPreBookingCreated(preBookingResult.tempBookingRef);

      // Step 3: Trigger payment flow
      onPaymentRequired(
        preBookingResult.tempBookingRef,
        preBookingResult.totalAmount,
      );
    } catch (error) {
      console.error("Booking flow error:", error);
      onError(error instanceof Error ? error.message : "Booking failed");
    }
  }
}

// Export singleton instance
export const bookingService = new BookingService();
export default bookingService;
