/**
 * Transfers Service
 * Frontend service for handling transfer-related API calls
 */

import { apiClient as api } from "@/lib/api";

export interface TransferDestination {
  id: string;
  code: string;
  name: string;
  type: "airport" | "city" | "hotel" | "destination";
  country: string;
  countryCode: string;
  popular?: boolean;
}

export interface TransferSearchParams {
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  pickupTime: string;
  returnDate?: string;
  returnTime?: string;
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };
  isRoundTrip: boolean;
  vehicleType?: string;
  currency?: string;
  promoCode?: string;
}

export interface Transfer {
  id: string;
  rateKey: string;
  supplierCode: string;
  vehicleType: string;
  vehicleClass: string;
  vehicleName: string;
  vehicleImage?: string;
  maxPassengers: number;
  maxLuggage: number;
  pickupLocation: string;
  pickupInstructions?: string;
  dropoffLocation: string;
  dropoffInstructions?: string;
  estimatedDuration: number;
  distance?: string;
  currency: string;
  basePrice: number;
  totalPrice: number;
  pricing: {
    basePrice: number;
    markupAmount: number;
    discountAmount: number;
    totalPrice: number;
    currency: string;
    savings: number;
  };
  features: string[];
  inclusions: string[];
  exclusions: string[];
  providerName: string;
  providerRating?: number;
  cancellationPolicy: any;
  freeWaitingTime: number;
  confirmationType: string;
  searchSessionId: string;
}

export interface TransferSearchResponse {
  transfers: Transfer[];
  searchParams: TransferSearchParams;
  sessionId: string;
  summary: {
    totalResults: number;
    priceRange: {
      min: number;
      max: number;
      currency: string;
    } | null;
    vehicleTypes: string[];
    suppliers: string[];
  };
  searchedAt: string;
}

export interface TransferBookingData {
  transferId: string;
  guestDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    specialRequests?: string;
  };
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  pickupTime: string;
  returnDate?: string;
  returnTime?: string;
  isRoundTrip: boolean;
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };
  flightNumber?: string;
  specialRequests?: string;
  mobilityRequirements?: string;
  childSeatsRequired?: number;
  totalAmount: number;
  currency: string;
  promoCode?: string;
  paymentMethod: string;
}

export interface TransferBookingResponse {
  success: boolean;
  bookingReference: string;
  supplierReference: string;
  status: string;
  confirmationDate: string;
  transferDetails: any;
  pricing: {
    basePrice: number;
    markupAmount: number;
    discountAmount: number;
    totalAmount: number;
    currency: string;
  };
  voucherUrl?: string;
  bookingId: number;
}

export interface TransferBookingDetails {
  bookingReference: string;
  supplierReference: string;
  status: string;
  transferDetails: {
    pickupLocation: string;
    dropoffLocation: string;
    pickupDate: string;
    pickupTime: string;
    vehicleType: string;
    vehicleClass: string;
    maxPassengers: number;
  };
  guestDetails: any;
  pricing: {
    basePrice: number;
    markupAmount: number;
    discountAmount: number;
    totalAmount: number;
    currency: string;
  };
  dates: {
    bookingDate: string;
    confirmationDate?: string;
    cancellationDate?: string;
  };
  driverDetails?: {
    name: string;
    phone: string;
    vehicle: {
      make: string;
      model: string;
      color: string;
      licensePlate: string;
    };
  };
  trackingUrl?: string;
  voucherUrl?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class TransfersService {
  /**
   * Search for available transfers
   */
  async searchTransfers(
    params: TransferSearchParams,
  ): Promise<TransferSearchResponse> {
    try {
      console.log("🔍 Searching transfers:", params);

      const response = await api.post("/transfers/search", params);

      if (!response.data.success) {
        throw new Error(response.data.error || "Failed to search transfers");
      }

      console.log("✅ Transfer search successful:", {
        transfersCount: response.data.data.transfers?.length || 0,
        sessionId: response.data.data.sessionId,
      });

      return response.data.data;
    } catch (error: any) {
      console.error("❌ Transfer search failed:", error);

      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }

      throw new Error(error.message || "Failed to search transfers");
    }
  }

  /**
   * Get detailed information about a specific transfer
   */
  async getTransferDetails(
    transferId: string,
    searchParams?: any,
  ): Promise<Transfer> {
    try {
      console.log("🔍 Getting transfer details:", transferId);

      const queryParams = new URLSearchParams();
      if (searchParams) {
        Object.keys(searchParams).forEach((key) => {
          if (searchParams[key] !== undefined && searchParams[key] !== null) {
            queryParams.append(key, searchParams[key].toString());
          }
        });
      }

      const url = `/transfers/product/${transferId}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      const response = await api.get(url);

      if (!response.data.success) {
        throw new Error(
          response.data.error || "Failed to get transfer details",
        );
      }

      console.log("✅ Transfer details retrieved:", {
        transferId,
        vehicleType: response.data.data.vehicleType,
        totalPrice: response.data.data.pricing?.totalPrice,
      });

      return response.data.data;
    } catch (error: any) {
      console.error("❌ Get transfer details failed:", error);
      console.warn("🔄 Using fallback transfer details for demo");

      // Return fallback data for demo purposes
      return this.getFallbackTransferDetails(transferId);
    }
  }

  /**
   * Get fallback transfer details for demo purposes
   */
  private getFallbackTransferDetails(transferId: string): Transfer {
    // Determine transfer type from ID
    const isLuxury = transferId.includes("3") || transferId.includes("luxury");
    const isSUV = transferId.includes("2") || transferId.includes("suv");

    const baseTransfer = {
      id: transferId,
      rateKey: `rate_${transferId}`,
      supplierCode: "hotelbeds",
      searchSessionId: "demo_session",
    };

    if (isLuxury) {
      return {
        ...baseTransfer,
        vehicleType: "luxury",
        vehicleClass: "luxury",
        vehicleName: "Mercedes E-Class",
        vehicleImage:
          "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800",
        maxPassengers: 3,
        maxLuggage: 3,
        pickupLocation: "Mumbai Airport (BOM)",
        dropoffLocation: "Hotel Taj Mahal Palace",
        estimatedDuration: 40,
        distance: "25 km",
        currency: "INR",
        basePrice: 3800,
        totalPrice: 4370,
        pricing: {
          basePrice: 3800,
          markupAmount: 570,
          discountAmount: 0,
          totalPrice: 4370,
          currency: "INR",
          savings: 0,
        },
        features: [
          "meet_greet",
          "professional_driver",
          "free_waiting",
          "wifi",
          "air_conditioning",
          "flight_monitoring",
        ],
        inclusions: [
          "Professional chauffeur",
          "VIP service",
          "Flight monitoring",
          "Complimentary refreshments",
          "120 minutes free waiting",
        ],
        exclusions: ["Tolls", "Parking fees"],
        providerName: "Luxury Chauffeurs",
        providerRating: 4.9,
        cancellationPolicy: { freeUntil: "12h", feePercentage: 25 },
        freeWaitingTime: 120,
        confirmationType: "INSTANT",
      };
    } else if (isSUV) {
      return {
        ...baseTransfer,
        vehicleType: "suv",
        vehicleClass: "premium",
        vehicleName: "SUV - Premium",
        vehicleImage:
          "https://images.unsplash.com/photo-1549317336-206569e8475c?w=800",
        maxPassengers: 6,
        maxLuggage: 4,
        pickupLocation: "Mumbai Airport (BOM)",
        dropoffLocation: "Hotel Taj Mahal Palace",
        estimatedDuration: 45,
        distance: "25 km",
        currency: "INR",
        basePrice: 2200,
        totalPrice: 2530,
        pricing: {
          basePrice: 2200,
          markupAmount: 330,
          discountAmount: 0,
          totalPrice: 2530,
          currency: "INR",
          savings: 0,
        },
        features: [
          "meet_greet",
          "professional_driver",
          "free_waiting",
          "wifi",
          "air_conditioning",
        ],
        inclusions: [
          "Professional driver",
          "Meet & greet service",
          "Free WiFi",
          "Air conditioning",
          "90 minutes free waiting",
        ],
        exclusions: ["Tolls", "Parking fees"],
        providerName: "Premium Transfers",
        providerRating: 4.7,
        cancellationPolicy: { freeUntil: "24h", feePercentage: 15 },
        freeWaitingTime: 90,
        confirmationType: "INSTANT",
      };
    } else {
      return {
        ...baseTransfer,
        vehicleType: "sedan",
        vehicleClass: "economy",
        vehicleName: "Sedan - Economy",
        vehicleImage:
          "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800",
        maxPassengers: 3,
        maxLuggage: 2,
        pickupLocation: "Mumbai Airport (BOM)",
        dropoffLocation: "Hotel Taj Mahal Palace",
        estimatedDuration: 45,
        distance: "25 km",
        currency: "INR",
        basePrice: 1200,
        totalPrice: 1380,
        pricing: {
          basePrice: 1200,
          markupAmount: 180,
          discountAmount: 0,
          totalPrice: 1380,
          currency: "INR",
          savings: 0,
        },
        features: ["meet_greet", "professional_driver", "free_waiting"],
        inclusions: [
          "Professional driver",
          "Meet & greet service",
          "60 minutes free waiting",
        ],
        exclusions: ["Tolls", "Parking fees"],
        providerName: "Mumbai Transfers Ltd",
        providerRating: 4.3,
        cancellationPolicy: { freeUntil: "24h", feePercentage: 10 },
        freeWaitingTime: 60,
        confirmationType: "INSTANT",
      };
    }
  }

  /**
   * Book a transfer
   */
  async bookTransfer(
    bookingData: TransferBookingData,
  ): Promise<TransferBookingResponse> {
    try {
      console.log("📝 Booking transfer:", {
        transferId: bookingData.transferId,
        guestName: `${bookingData.guestDetails.firstName} ${bookingData.guestDetails.lastName}`,
        totalAmount: bookingData.totalAmount,
      });

      const response = await api.post("/transfers/book", bookingData);

      if (!response.data.success) {
        throw new Error(response.data.error || "Failed to book transfer");
      }

      console.log("✅ Transfer booking successful:", {
        bookingReference: response.data.data.bookingReference,
        status: response.data.data.status,
        totalAmount: response.data.data.pricing?.totalAmount,
      });

      return response.data.data;
    } catch (error: any) {
      console.error("❌ Transfer booking failed:", error);

      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }

      throw new Error(error.message || "Failed to book transfer");
    }
  }

  /**
   * Get booking details by reference
   */
  async getBookingDetails(
    bookingReference: string,
  ): Promise<TransferBookingDetails> {
    try {
      console.log("🔍 Getting booking details:", bookingReference);

      const response = await api.get(`/transfers/booking/${bookingReference}`);

      if (!response.data.success) {
        throw new Error(response.data.error || "Failed to get booking details");
      }

      console.log("✅ Booking details retrieved:", {
        bookingReference,
        status: response.data.data.status,
      });

      return response.data.data;
    } catch (error: any) {
      console.error("❌ Get booking details failed:", error);

      if (error.response?.status === 404) {
        throw new Error("Booking not found");
      }

      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }

      throw new Error(error.message || "Failed to get booking details");
    }
  }

  /**
   * Cancel a transfer booking
   */
  async cancelBooking(bookingReference: string, reason?: string): Promise<any> {
    try {
      console.log("❌ Cancelling transfer booking:", bookingReference);

      const response = await api.post(
        `/transfers/booking/${bookingReference}/cancel`,
        {
          reason,
        },
      );

      if (!response.data.success) {
        throw new Error(response.data.error || "Failed to cancel booking");
      }

      console.log("✅ Booking cancelled successfully:", {
        bookingReference,
        refundAmount: response.data.data.refundAmount,
      });

      return response.data.data;
    } catch (error: any) {
      console.error("❌ Cancel booking failed:", error);

      if (error.response?.status === 404) {
        throw new Error("Booking not found");
      }

      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }

      throw new Error(error.message || "Failed to cancel booking");
    }
  }

  /**
   * Get user's transfer bookings
   */
  async getUserBookings(
    userId: number,
    options: { limit?: number; offset?: number; status?: string } = {},
  ): Promise<any[]> {
    try {
      console.log("🔍 Getting user transfer bookings:", userId);

      const queryParams = new URLSearchParams();
      if (options.limit) queryParams.append("limit", options.limit.toString());
      if (options.offset)
        queryParams.append("offset", options.offset.toString());
      if (options.status) queryParams.append("status", options.status);

      const url = `/transfers/bookings/user/${userId}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      const response = await api.get(url);

      if (!response.data.success) {
        throw new Error(response.data.error || "Failed to get user bookings");
      }

      console.log("✅ User bookings retrieved:", {
        userId,
        bookingsCount: response.data.data.length,
      });

      return response.data.data;
    } catch (error: any) {
      console.error("❌ Get user bookings failed:", error);

      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }

      throw new Error(error.message || "Failed to get user bookings");
    }
  }

  /**
   * Re-price a transfer with updated parameters
   */
  async repriceTransfer(
    transferId: string,
    options: {
      promoCode?: string;
      passengers?: any;
      additionalServices?: any[];
    } = {},
  ): Promise<any> {
    try {
      console.log("💰 Re-pricing transfer:", transferId);

      const response = await api.post("/transfers/repricing", {
        transferId,
        ...options,
      });

      if (!response.data.success) {
        throw new Error(response.data.error || "Failed to reprice transfer");
      }

      console.log("✅ Transfer repriced:", {
        transferId,
        originalPrice: response.data.data.originalPrice,
        finalPrice: response.data.data.finalPrice,
      });

      return response.data.data;
    } catch (error: any) {
      console.error("❌ Reprice transfer failed:", error);

      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }

      throw new Error(error.message || "Failed to reprice transfer");
    }
  }

  /**
   * Check service health
   */
  async healthCheck(): Promise<any> {
    try {
      const response = await api.get("/transfers/health");
      return response.data;
    } catch (error: any) {
      console.error("❌ Transfers health check failed:", error);
      throw new Error("Transfers service is unavailable");
    }
  }

  /**
   * Search destinations using Hotelbeds Transfers API
   * Matches hotels/sightseeing service signature exactly
   */
  async searchDestinations(query: string): Promise<TransferDestination[]> {
    try {
      console.log(`🎯 Searching transfer destinations: "${query}"`);

      let response;
      try {
        // Call the backend Hotelbeds Transfers API
        response = await api.post<{
          success: boolean;
          data: { destinations: any[] };
        }>("/api/transfers/destinations", {
          query,
          limit: 15, // Fixed limit like hotels/sightseeing
          popularOnly: query === "", // Popular when empty query
        });
      } catch (apiError) {
        console.warn("❌ Transfer destinations API request failed:", apiError);
        return this.getFallbackDestinations(query);
      }

      // Check if response or response.data is null/undefined
      if (!response || !response.data) {
        console.warn("❌ Transfer destinations API returned null response");
        return this.getFallbackDestinations(query);
      }

      if (!response.data.success) {
        console.warn("❌ Transfer destinations API failed:", response.data);
        return this.getFallbackDestinations(query);
      }

      // Check if destinations data exists
      const destinationsData = response.data.data?.destinations;
      if (!destinationsData || !Array.isArray(destinationsData)) {
        console.warn(
          "❌ Transfer destinations data is invalid:",
          response.data.data,
        );
        return this.getFallbackDestinations(query);
      }

      const destinations = destinationsData.map((dest: any) => ({
        id: dest.code,
        code: dest.code,
        name: dest.name,
        type: dest.type || "destination",
        country: dest.country,
        countryCode: dest.countryCode,
        popular: dest.popular || false,
      }));

      console.log(
        `✅ Found ${destinations.length} transfer destinations from API`,
      );
      return destinations;
    } catch (error) {
      console.error("❌ Transfer destinations search error:", error);
      return this.getFallbackDestinations(query);
    }
  }

  /**
   * Fallback destinations when API fails
   */
  private getFallbackDestinations(query: string): TransferDestination[] {
    const fallbackDestinations: TransferDestination[] = [
      {
        id: "DEL",
        code: "DEL",
        name: "Delhi Airport",
        country: "India",
        countryCode: "IN",
        type: "airport",
        popular: true,
      },
      {
        id: "BOM",
        code: "BOM",
        name: "Mumbai Airport",
        country: "India",
        countryCode: "IN",
        type: "airport",
        popular: true,
      },
      {
        id: "BLR",
        code: "BLR",
        name: "Bangalore Airport",
        country: "India",
        countryCode: "IN",
        type: "airport",
        popular: true,
      },
      {
        id: "MAA",
        code: "MAA",
        name: "Chennai Airport",
        country: "India",
        countryCode: "IN",
        type: "airport",
        popular: true,
      },
      {
        id: "CCU",
        code: "CCU",
        name: "Kolkata Airport",
        country: "India",
        countryCode: "IN",
        type: "airport",
        popular: true,
      },
      {
        id: "HYD",
        code: "HYD",
        name: "Hyderabad Airport",
        country: "India",
        countryCode: "IN",
        type: "airport",
        popular: true,
      },
      {
        id: "GOI",
        code: "GOI",
        name: "Goa Airport",
        country: "India",
        countryCode: "IN",
        type: "airport",
        popular: true,
      },
      {
        id: "PNQ",
        code: "PNQ",
        name: "Pune Airport",
        country: "India",
        countryCode: "IN",
        type: "airport",
        popular: true,
      },
      {
        id: "DXB",
        code: "DXB",
        name: "Dubai Airport",
        country: "UAE",
        countryCode: "AE",
        type: "airport",
        popular: true,
      },
      {
        id: "SIN",
        code: "SIN",
        name: "Singapore Airport",
        country: "Singapore",
        countryCode: "SG",
        type: "airport",
        popular: true,
      },
    ];

    if (!query) return fallbackDestinations;

    return fallbackDestinations.filter(
      (dest) =>
        dest.name.toLowerCase().includes(query.toLowerCase()) ||
        dest.country.toLowerCase().includes(query.toLowerCase()) ||
        dest.code.toLowerCase().includes(query.toLowerCase()),
    );
  }

  /**
   * Validate search parameters
   */
  validateSearchParams(params: TransferSearchParams): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!params.pickupLocation?.trim()) {
      errors.push("Pickup location is required");
    }

    if (!params.dropoffLocation?.trim()) {
      errors.push("Drop-off location is required");
    }

    if (!params.pickupDate) {
      errors.push("Pickup date is required");
    } else {
      const pickupDate = new Date(params.pickupDate);
      if (pickupDate < new Date()) {
        errors.push("Pickup date cannot be in the past");
      }
    }

    if (params.isRoundTrip) {
      if (!params.returnDate) {
        errors.push("Return date is required for round trip");
      } else {
        const pickupDate = new Date(params.pickupDate);
        const returnDate = new Date(params.returnDate);
        if (returnDate <= pickupDate) {
          errors.push("Return date must be after pickup date");
        }
      }
    }

    if (!params.passengers) {
      errors.push("Passenger information is required");
    } else {
      if (params.passengers.adults < 1 || params.passengers.adults > 8) {
        errors.push("Adults count must be between 1 and 8");
      }
      if (params.passengers.children < 0 || params.passengers.children > 6) {
        errors.push("Children count must be between 0 and 6");
      }
      if (params.passengers.infants < 0 || params.passengers.infants > 3) {
        errors.push("Infants count must be between 0 and 3");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Format transfer duration
   */
  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }

  /**
   * Get vehicle type display name
   */
  getVehicleTypeDisplayName(vehicleType: string): string {
    const typeMap: Record<string, string> = {
      sedan: "Sedan",
      suv: "SUV",
      minivan: "Minivan",
      luxury: "Luxury Car",
      wheelchair: "Wheelchair Accessible",
      bus: "Bus",
    };

    return typeMap[vehicleType.toLowerCase()] || vehicleType;
  }

  /**
   * Get feature display name
   */
  getFeatureDisplayName(feature: string): string {
    const featureMap: Record<string, string> = {
      meet_greet: "Meet & Greet",
      flight_monitoring: "Flight Monitoring",
      free_waiting: "Free Waiting Time",
      professional_driver: "Professional Driver",
      wifi: "Free WiFi",
      air_conditioning: "Air Conditioning",
      child_seats: "Child Seats Available",
    };

    return (
      featureMap[feature] ||
      feature.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    );
  }
}

// Export singleton instance
export const transfersService = new TransfersService();
export default transfersService;
