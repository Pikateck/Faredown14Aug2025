/**
 * Promo Code Service
 * Handles all promo code-related API operations for admin panel
 */

import { apiClient } from "@/lib/api";

export interface PromoCode {
  id: string;
  code: string;
  description: string;
  category: "flight" | "hotel" | "both";
  image?: string;
  discountType: "percentage" | "fixed";
  discountMinValue: number;
  discountMaxValue: number;
  minimumFareAmount: number;
  marketingBudget: number;
  expiryDate: string;
  promoCodeImage: string;
  displayOnHomePage: "yes" | "no";
  status: "pending" | "active";

  // Flight-specific fields
  origin?: string;
  destination?: string;
  carrierCode?: string;
  cabinClass?: string;
  flightBy?: string;

  // Hotel-specific fields
  hotelCity?: string;
  hotelName?: string;

  createdOn: string;
  updatedOn: string;
  module: "flight" | "hotel";
  validityType: "unlimited" | "limited";
  usageCount?: number;
  maxUsage?: number;
}

export interface CreatePromoCodeRequest {
  code: string;
  description: string;
  category: "flight" | "hotel" | "both";
  discountType: "percentage" | "fixed";
  discountMinValue: number;
  discountMaxValue: number;
  minimumFareAmount: number;
  marketingBudget: number;
  expiryDate: string;
  promoCodeImage?: string;
  displayOnHomePage: "yes" | "no";
  status: "pending" | "active";

  // Optional fields based on category
  origin?: string;
  destination?: string;
  carrierCode?: string;
  cabinClass?: string;
  flightBy?: string;
  hotelCity?: string;
  hotelName?: string;
  validityType: "unlimited" | "limited";
  maxUsage?: number;
}

export interface PromoCodeFilters {
  search?: string;
  module?: string;
  status?: string;
  page?: number;
  limit?: number;
}

class PromoCodeService {
  private baseUrl = "/api/promo";

  /**
   * Get all promo codes with optional filters
   */
  async getPromoCodes(filters: PromoCodeFilters = {}): Promise<{
    promoCodes: PromoCode[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const params = new URLSearchParams();

      if (filters.search) params.append("search", filters.search);
      if (filters.module && filters.module !== "all")
        params.append("module", filters.module);
      if (filters.status && filters.status !== "all")
        params.append("status", filters.status);
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());

      const response = await apiClient.get(
        `${this.baseUrl}?${params.toString()}`,
      );

      if (response.ok) {
        return response.data;
      } else {
        throw new Error(response.error || "Failed to fetch promo codes");
      }
    } catch (error) {
      console.error("Error fetching promo codes:", error);
      throw error;
    }
  }

  /**
   * Create a new promo code
   */
  async createPromoCode(promoData: CreatePromoCodeRequest): Promise<PromoCode> {
    try {
      const response = await apiClient.post(this.baseUrl, promoData);

      if (response.ok) {
        return response.data.promoCode;
      } else {
        throw new Error(response.error || "Failed to create promo code");
      }
    } catch (error) {
      console.error("Error creating promo code:", error);
      throw error;
    }
  }

  /**
   * Update an existing promo code
   */
  async updatePromoCode(
    promoId: string,
    promoData: Partial<CreatePromoCodeRequest>,
  ): Promise<PromoCode> {
    try {
      const response = await apiClient.put(
        `${this.baseUrl}/${promoId}`,
        promoData,
      );

      if (response.ok) {
        return response.data.promoCode;
      } else {
        throw new Error(response.error || "Failed to update promo code");
      }
    } catch (error) {
      console.error("Error updating promo code:", error);
      throw error;
    }
  }

  /**
   * Delete a promo code
   */
  async deletePromoCode(promoId: string): Promise<void> {
    try {
      const response = await apiClient.delete(`${this.baseUrl}/${promoId}`);

      if (!response.ok) {
        throw new Error(response.error || "Failed to delete promo code");
      }
    } catch (error) {
      console.error("Error deleting promo code:", error);
      throw error;
    }
  }

  /**
   * Toggle promo code status (active/pending)
   */
  async togglePromoCodeStatus(promoId: string): Promise<PromoCode> {
    try {
      const response = await apiClient.post(
        `${this.baseUrl}/${promoId}/toggle-status`,
      );

      if (response.ok) {
        return response.data.promoCode;
      } else {
        throw new Error(response.error || "Failed to toggle promo code status");
      }
    } catch (error) {
      console.error("Error toggling promo code status:", error);
      throw error;
    }
  }

  /**
   * Validate promo code for a specific booking
   */
  async validatePromoCode(
    code: string,
    bookingDetails: {
      amount: number;
      category: "flight" | "hotel";
      origin?: string;
      destination?: string;
      hotelCity?: string;
    },
  ): Promise<{
    valid: boolean;
    discount: number;
    finalAmount: number;
    message: string;
  }> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/validate`, {
        code,
        ...bookingDetails,
      });

      if (response.ok) {
        return response.data;
      } else {
        throw new Error(response.error || "Failed to validate promo code");
      }
    } catch (error) {
      console.error("Error validating promo code:", error);
      throw error;
    }
  }

  /**
   * Get promo code usage statistics
   */
  async getPromoCodeStats(promoId: string): Promise<{
    totalUsage: number;
    remainingUsage: number;
    totalSavings: number;
    recentUsage: {
      date: string;
      bookingId: string;
      amount: number;
      discount: number;
    }[];
  }> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${promoId}/stats`);

      if (response.ok) {
        return response.data;
      } else {
        throw new Error(
          response.error || "Failed to fetch promo code statistics",
        );
      }
    } catch (error) {
      console.error("Error fetching promo code stats:", error);
      throw error;
    }
  }

  /**
   * Apply promo code to a booking (used in bargain engine)
   */
  async applyPromoCode(
    code: string,
    originalAmount: number,
    bookingDetails: {
      category: "flight" | "hotel";
      origin?: string;
      destination?: string;
      hotelCity?: string;
      minimumMarkupThreshold: number; // Ensure we don't go below minimum markup
    },
  ): Promise<{
    success: boolean;
    discount: number;
    finalAmount: number;
    message: string;
    promoCodeId?: string;
  }> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/apply`, {
        code,
        originalAmount,
        ...bookingDetails,
      });

      if (response.ok) {
        return response.data;
      } else {
        throw new Error(response.error || "Failed to apply promo code");
      }
    } catch (error) {
      console.error("Error applying promo code:", error);
      throw error;
    }
  }
}

export const promoCodeService = new PromoCodeService();
