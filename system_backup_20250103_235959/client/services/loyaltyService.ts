import { apiClient as api } from "../lib/api";

export interface LoyaltyMember {
  id: number;
  memberCode: string;
  tier: number;
  tierName: string;
  pointsBalance: number;
  pointsLocked: number;
  pointsLifetime: number;
  points12m: number;
  joinDate: string;
  status: string;
}

export interface TierInfo {
  current: {
    tier: number;
    tierName: string;
    thresholdPoints12m: number;
    earnMultiplier: number;
    benefits: any;
  };
  next?: {
    tier: number;
    tierName: string;
    thresholdPoints12m: number;
    earnMultiplier: number;
    benefits: any;
  };
  progress: number;
  pointsToNext: number;
}

export interface LoyaltyProfile {
  member: LoyaltyMember;
  tier: TierInfo;
  expiringSoon: Array<{
    points: number;
    expireOn: string;
    daysRemaining: number;
  }>;
}

export interface TransactionHistoryItem {
  id: number;
  eventType: "earn" | "redeem" | "adjust" | "expire" | "revoke";
  pointsDelta: number;
  rupeeValue?: number;
  description?: string;
  createdAt: string;
  bookingId?: string;
}

export interface RedemptionQuote {
  maxPoints: number;
  rupeeValue: number;
  capReason?: string;
}

export interface ApplyRedemptionResult {
  lockedId: string;
  pointsApplied: number;
  rupeeValue: number;
}

export interface LoyaltyRules {
  earning: {
    hotel: { pointsPer100: number; description: string };
    air: { pointsPer100: number; description: string };
  };
  redemption: {
    valuePerPoint: number;
    minRedeem: number;
    maxCapPercentage: number;
    description: string;
  };
  tiers: Array<{
    tier: number;
    name: string;
    threshold: number;
    multiplier: number;
    benefits: string[];
  }>;
  expiry: {
    months: number;
    description: string;
  };
}

class LoyaltyService {
  private baseUrl = "/api/loyalty";

  // Get current user's loyalty profile
  async getProfile(): Promise<LoyaltyProfile> {
    try {
      const response = await api.get(`${this.baseUrl}/me`);

      // Handle different response structures safely
      if (response && response.success && response.data) {
        return response.data;
      } else if (response && response.data && response.data.success) {
        return response.data.data;
      }

      // If no valid response structure, throw error (but this shouldn't happen with fallback)
      const errorMessage =
        (response && response.error) ||
        (response && response.data && response.data.error) ||
        "Failed to fetch loyalty profile";
      throw new Error(errorMessage);
    } catch (error) {
      // Don't log AbortErrors or fetch errors in production
      if (
        error instanceof Error &&
        (error.name === "AbortError" ||
          error.message.includes("Failed to fetch"))
      ) {
        console.log("Loyalty API unavailable, fallback should handle this");
      } else {
        console.error("Error fetching loyalty profile:", error);
      }
      throw error;
    }
  }

  // Get transaction history with pagination
  async getTransactionHistory(
    limit = 20,
    offset = 0,
  ): Promise<{
    items: TransactionHistoryItem[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  }> {
    try {
      const response = await api.get(`${this.baseUrl}/me/history`, {
        params: { limit, offset },
      });

      // Handle different response structures safely
      if (response && response.success && response.data) {
        return response.data;
      } else if (response && response.data && response.data.success) {
        return response.data.data;
      }

      // If no valid response structure, throw error
      const errorMessage =
        (response && response.error) ||
        (response && response.data && response.data.error) ||
        "Failed to fetch transaction history";
      throw new Error(errorMessage);
    } catch (error) {
      console.error("Error fetching transaction history:", error);
      throw error;
    }
  }

  // Quote redemption for a cart
  async quoteRedemption(
    eligibleAmount: number,
    currency = "INR",
    fxRate = 1.0,
  ): Promise<RedemptionQuote> {
    try {
      const response = await api.post(`${this.baseUrl}/quote-redeem`, {
        eligibleAmount,
        currency,
        fxRate,
      });

      // Handle different response structures safely
      if (response && response.success && response.data) {
        return response.data;
      } else if (response && response.data && response.data.success) {
        return response.data.data;
      }

      // If no valid response structure, throw error
      const errorMessage =
        (response && response.error) ||
        (response && response.data && response.data.error) ||
        "Failed to quote redemption";
      throw new Error(errorMessage);
    } catch (error) {
      console.error("Error quoting redemption:", error);
      throw error;
    }
  }

  // Apply points to cart
  async applyRedemption(
    cartId: string,
    points: number,
    eligibleAmount: number,
    currency = "INR",
    fxRate = 1.0,
  ): Promise<ApplyRedemptionResult> {
    try {
      const response = await api.post(`${this.baseUrl}/apply`, {
        cartId,
        points,
        eligibleAmount,
        currency,
        fxRate,
      });

      // Handle different response structures safely
      if (response && response.success && response.data) {
        return response.data;
      } else if (response && response.data && response.data.success) {
        return response.data.data;
      }

      // If no valid response structure, throw error
      const errorMessage =
        (response && response.error) ||
        (response && response.data && response.data.error) ||
        "Failed to apply points";
      throw new Error(errorMessage);
    } catch (error) {
      console.error("Error applying points:", error);
      throw error;
    }
  }

  // Cancel point redemption
  async cancelRedemption(lockedId: string): Promise<boolean> {
    try {
      const response = await api.post(`${this.baseUrl}/cancel-redemption`, {
        lockedId,
      });

      // Handle different response structures safely
      if (response && response.success !== undefined) {
        return response.success;
      } else if (
        response &&
        response.data &&
        response.data.success !== undefined
      ) {
        return response.data.success;
      }

      return false;
    } catch (error) {
      console.error("Error cancelling redemption:", error);
      return false;
    }
  }

  // Get loyalty program rules (public endpoint)
  async getRules(): Promise<LoyaltyRules> {
    try {
      const response = await api.get(`${this.baseUrl}/rules`);

      // Handle different response structures safely
      if (response && response.success && response.data) {
        return response.data;
      } else if (response && response.data && response.data.success) {
        return response.data.data;
      }

      // If no valid response structure, throw error
      const errorMessage =
        (response && response.error) ||
        (response && response.data && response.data.error) ||
        "Failed to fetch loyalty rules";
      throw new Error(errorMessage);
    } catch (error) {
      console.error("Error fetching loyalty rules:", error);
      throw error;
    }
  }

  // Format points for display
  formatPoints(points: number): string {
    return points.toLocaleString("en-IN");
  }

  // Format rupee value for display
  formatRupees(amount: number): string {
    return `₹${amount.toLocaleString("en-IN")}`;
  }

  // Calculate points earned from amount
  calculatePointsEarned(
    amount: number,
    bookingType: "air" | "hotel",
    tierMultiplier = 1.0,
  ): number {
    const earnRate = bookingType === "hotel" ? 5 : 3; // points per ₹100
    const basePoints = Math.floor((amount / 100) * earnRate);
    return Math.floor(basePoints * tierMultiplier);
  }

  // Validate redemption points
  validateRedemptionPoints(points: number): { valid: boolean; error?: string } {
    if (points < 200) {
      return { valid: false, error: "Minimum 200 points required" };
    }
    if (points % 100 !== 0) {
      return { valid: false, error: "Points must be in multiples of 100" };
    }
    return { valid: true };
  }

  // Get tier progress percentage
  getTierProgress(
    currentPoints: number,
    currentThreshold: number,
    nextThreshold?: number,
  ): number {
    if (!nextThreshold) return 100; // Already at highest tier

    const progress =
      ((currentPoints - currentThreshold) /
        (nextThreshold - currentThreshold)) *
      100;
    return Math.max(0, Math.min(100, Math.round(progress)));
  }

  // Check if points are expiring soon
  hasExpiringPoints(expiringSoon: any[]): boolean {
    return expiringSoon.length > 0;
  }

  // Get days until points expire
  getDaysUntilExpiry(expireOn: string): number {
    const expireDate = new Date(expireOn);
    const today = new Date();
    const timeDiff = expireDate.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }
}

// Create singleton instance
export const loyaltyService = new LoyaltyService();
export default loyaltyService;
