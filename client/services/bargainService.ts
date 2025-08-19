/**
 * Bargain Engine API Service
 * Handles real-time bargaining for flights and hotels
 */

import { apiClient, ApiResponse } from "@/lib/api";

// Types
export interface BargainSession {
  id: string;
  userId: string;
  type: "flight" | "hotel";
  itemId: string;
  originalPrice: number;
  targetPrice: number;
  currentOffer: number;
  status: "active" | "accepted" | "rejected" | "expired" | "cancelled";
  maxAttempts: number;
  attemptCount: number;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  messages: BargainMessage[];
}

export interface BargainMessage {
  id: string;
  type: "user" | "ai" | "system";
  content: string;
  offer?: number;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface BargainRequest {
  type: "flight" | "hotel";
  itemId: string;
  originalPrice: number;
  targetPrice: number;
  message?: string;
}

export interface BargainResponse {
  sessionId: string;
  success: boolean;
  message: string;
  newOffer?: number;
  finalPrice?: number;
  reasoning?: string;
  suggestedActions?: string[];
}

export interface BargainCounter {
  sessionId: string;
  counterOffer: number;
  message?: string;
}

export interface BargainAcceptance {
  sessionId: string;
  accepted: boolean;
  finalPrice?: number;
}

export interface BargainStatistics {
  totalSessions: number;
  successRate: number;
  averageSavings: number;
  popularItems: {
    type: "flight" | "hotel";
    itemId: string;
    itemName: string;
    successCount: number;
    averageDiscount: number;
  }[];
  userStats: {
    totalSessions: number;
    successfulBargains: number;
    totalSavings: number;
    averageDiscount: number;
  };
}

export interface BargainTip {
  id: string;
  type: "flight" | "hotel" | "general";
  title: string;
  content: string;
  category: "timing" | "negotiation" | "strategy" | "market";
  effectiveness: number;
}

// Bargain Service Class
export class BargainService {
  private readonly baseUrl = "/api/bargain";

  /**
   * Start a new bargain session
   */
  async startBargain(request: BargainRequest): Promise<BargainSession> {
    const response = await apiClient.post<ApiResponse<BargainSession>>(
      `${this.baseUrl}/start`,
      request,
    );

    if (response.data) {
      return response.data;
    }

    throw new Error("Failed to start bargain session");
  }

  /**
   * Send a counter offer
   */
  async sendCounterOffer(counter: BargainCounter): Promise<BargainResponse> {
    const response = await apiClient.post<ApiResponse<BargainResponse>>(
      `${this.baseUrl}/counter`,
      counter,
    );

    if (response.data) {
      return response.data;
    }

    throw new Error("Failed to send counter offer");
  }

  /**
   * Accept or reject an offer
   */
  async respondToOffer(
    acceptance: BargainAcceptance,
  ): Promise<BargainResponse> {
    const response = await apiClient.post<ApiResponse<BargainResponse>>(
      `${this.baseUrl}/respond`,
      acceptance,
    );

    if (response.data) {
      return response.data;
    }

    throw new Error("Failed to respond to offer");
  }

  /**
   * Get active bargain session
   */
  async getSession(sessionId: string): Promise<BargainSession> {
    const response = await apiClient.get<ApiResponse<BargainSession>>(
      `${this.baseUrl}/sessions/${sessionId}`,
    );

    if (response.data) {
      return response.data;
    }

    throw new Error("Failed to get bargain session");
  }

  /**
   * Get user's bargain history
   */
  async getUserSessions(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    sessions: BargainSession[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const response = await apiClient.get<
      ApiResponse<{
        sessions: BargainSession[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }>
    >(`${this.baseUrl}/sessions`, { page, limit });

    if (response.data) {
      return response.data;
    }

    throw new Error("Failed to get user sessions");
  }

  /**
   * Cancel an active session
   */
  async cancelSession(sessionId: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/sessions/${sessionId}`);
  }

  /**
   * Get bargain statistics
   */
  async getStatistics(): Promise<BargainStatistics> {
    const response = await apiClient.get<ApiResponse<BargainStatistics>>(
      `${this.baseUrl}/statistics`,
    );

    if (response.data) {
      return response.data;
    }

    throw new Error("Failed to get bargain statistics");
  }

  /**
   * Get bargain tips and strategies
   */
  async getBargainTips(type?: "flight" | "hotel"): Promise<BargainTip[]> {
    const response = await apiClient.get<ApiResponse<BargainTip[]>>(
      `${this.baseUrl}/tips`,
      type ? { type } : {},
    );

    if (response.data) {
      return response.data;
    }

    throw new Error("Failed to get bargain tips");
  }

  /**
   * Get AI bargain suggestions
   */
  async getAISuggestions(
    type: "flight" | "hotel",
    itemId: string,
    originalPrice: number,
  ): Promise<{
    suggestedTargetPrice: number;
    confidence: number;
    reasoning: string;
    marketAnalysis: {
      averagePrice: number;
      priceRange: { min: number; max: number };
      demandLevel: "low" | "medium" | "high";
      seasonality: string;
    };
    negotiationTips: string[];
  }> {
    const response = await apiClient.get<
      ApiResponse<{
        suggestedTargetPrice: number;
        confidence: number;
        reasoning: string;
        marketAnalysis: {
          averagePrice: number;
          priceRange: { min: number; max: number };
          demandLevel: "low" | "medium" | "high";
          seasonality: string;
        };
        negotiationTips: string[];
      }>
    >(`${this.baseUrl}/suggestions`, {
      type,
      itemId,
      originalPrice,
    });

    if (response.data) {
      return response.data;
    }

    throw new Error("Failed to get AI suggestions");
  }

  /**
   * Report bargain outcome feedback
   */
  async reportOutcome(
    sessionId: string,
    feedback: {
      satisfaction: number; // 1-5 scale
      comment?: string;
      wouldRecommend: boolean;
    },
  ): Promise<void> {
    await apiClient.post(`${this.baseUrl}/feedback`, {
      sessionId,
      ...feedback,
    });
  }

  /**
   * Phase 1: Start bargain session with Base + Markup + Counter-offer logic
   */
  async startPhase1Bargain(request: {
    type: "flight" | "hotel";
    itemId: string;
    itemTitle: string;
    basePrice: number;
    userType?: "b2c" | "b2b";
    promoCode?: string;
    // Flight specific
    airline?: string;
    route?: { from: string; to: string };
    class?: string;
    // Hotel specific
    city?: string;
    hotelName?: string;
    starRating?: string;
    roomCategory?: string;
  }): Promise<{
    sessionId: string;
    initialPrice: number;
    markedUpPrice: number;
    bargainRange: { min: number; max: number };
    recommendedTarget: number;
    markupDetails: any;
    promoDetails?: any;
  }> {
    const response = await apiClient.post<
      ApiResponse<{
        sessionId: string;
        initialPrice: number;
        markedUpPrice: number;
        bargainRange: { min: number; max: number };
        recommendedTarget: number;
        markupDetails: any;
        promoDetails?: any;
      }>
    >(`${this.baseUrl}/phase1/start`, request);

    if (response.data) {
      return response.data;
    }

    throw new Error("Failed to start Phase 1 bargain session");
  }

  /**
   * Phase 1: Process user counter-offer
   */
  async processPhase1CounterOffer(request: {
    sessionId: string;
    userOfferPrice: number;
    currentPrice: number;
  }): Promise<{
    accepted: boolean;
    counterOffer?: number;
    finalPrice?: number;
    reasoning: string;
    nextAction: "accept" | "counter" | "reject";
    savingsAmount?: number;
    savingsPercentage?: number;
  }> {
    const response = await apiClient.post<
      ApiResponse<{
        accepted: boolean;
        counterOffer?: number;
        finalPrice?: number;
        reasoning: string;
        nextAction: "accept" | "counter" | "reject";
        savingsAmount?: number;
        savingsPercentage?: number;
      }>
    >(`${this.baseUrl}/phase1/counter-offer`, request);

    if (response.data) {
      return response.data;
    }

    throw new Error("Failed to process Phase 1 counter offer");
  }

  /**
   * Get real-time bargain activity (WebSocket endpoint info)
   */
  getBargainWebSocketUrl(sessionId: string): string {
    return `${apiClient["baseURL"].replace("http", "ws")}/api/bargain/ws/${sessionId}`;
  }

  /**
   * Validate bargain eligibility
   */
  async validateEligibility(
    type: "flight" | "hotel",
    itemId: string,
  ): Promise<{
    eligible: boolean;
    reason?: string;
    restrictions?: string[];
    maxDiscount?: number;
  }> {
    const response = await apiClient.get<
      ApiResponse<{
        eligible: boolean;
        reason?: string;
        restrictions?: string[];
        maxDiscount?: number;
      }>
    >(`${this.baseUrl}/validate`, { type, itemId });

    if (response.data) {
      return response.data;
    }

    throw new Error("Failed to validate bargain eligibility");
  }
}

// Export singleton instance
export const bargainService = new BargainService();
export default bargainService;
