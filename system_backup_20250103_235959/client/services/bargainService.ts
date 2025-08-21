interface BargainRequest {
  flight_id: string;
  user_price: number;
  original_price: number;
}

interface BargainOffer {
  price_now: number;
  was?: number;
  expiry_ts: number;
  hold_seconds: number;
  perks?: string[];
}

interface BargainResponse {
  negotiation_id: string;
  round: number;
  offer: BargainOffer;
  status: "active" | "expired" | "holding";
}

interface CounterRequest {
  negotiation_id: string;
}

interface HoldRequest {
  negotiation_id: string;
}

interface HoldResponse {
  hold_id: string;
  expires_at: number;
  booking_url?: string;
}

class BargainService {
  private baseUrl = "/api";

  async startNegotiation(request: BargainRequest): Promise<BargainResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/bargain/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to start negotiation:", error);

      // Fallback mock response for development
      const mockOffer = this.generateMockOffer(
        request.user_price,
        request.original_price,
      );
      return {
        negotiation_id: `neg_${Date.now()}`,
        round: 1,
        offer: mockOffer,
        status: "active",
      };
    }
  }

  async counter(request: CounterRequest): Promise<BargainResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/bargain/counter`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to counter offer:", error);

      // Fallback mock response
      return {
        negotiation_id: request.negotiation_id,
        round: Math.floor(Math.random() * 3) + 2,
        offer: {
          price_now: Math.floor(Math.random() * 5000) + 15000,
          was: 22650,
          expiry_ts: Date.now() + 30000,
          hold_seconds: 30,
          perks: ["priority_seat"],
        },
        status: "active",
      };
    }
  }

  async hold(request: HoldRequest): Promise<HoldResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/bargain/hold`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to place hold:", error);

      // Fallback mock response
      return {
        hold_id: `hold_${Date.now()}`,
        expires_at: Date.now() + 30000,
        booking_url: "/booking-flow",
      };
    }
  }

  async refresh(request: CounterRequest): Promise<BargainResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/bargain/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to refresh offer:", error);

      // Fallback mock response
      return {
        negotiation_id: request.negotiation_id,
        round: 1,
        offer: {
          price_now: Math.floor(Math.random() * 3000) + 18000,
          was: 22650,
          expiry_ts: Date.now() + 30000,
          hold_seconds: 30,
        },
        status: "active",
      };
    }
  }

  private generateMockOffer(
    userPrice: number,
    originalPrice: number,
  ): BargainOffer {
    const discountRequested = (originalPrice - userPrice) / originalPrice;
    let counterPrice: number;

    if (discountRequested <= 0.3) {
      // Small discount requested - likely to accept or counter close
      counterPrice =
        Math.random() < 0.7 ? userPrice : Math.round(userPrice * 1.1);
    } else if (discountRequested <= 0.5) {
      // Medium discount - counter somewhere in between
      const minOffer = Math.round(originalPrice * 0.7);
      const maxOffer = Math.round(originalPrice * 0.85);
      counterPrice =
        Math.floor(Math.random() * (maxOffer - minOffer)) + minOffer;
    } else {
      // Large discount requested - counter with smaller discount
      const minOffer = Math.round(originalPrice * 0.8);
      const maxOffer = Math.round(originalPrice * 0.9);
      counterPrice =
        Math.floor(Math.random() * (maxOffer - minOffer)) + minOffer;
    }

    return {
      price_now: Math.max(counterPrice, userPrice),
      was: originalPrice,
      expiry_ts: Date.now() + 30000, // 30 seconds
      hold_seconds: 30,
      perks: Math.random() > 0.5 ? ["priority_seat"] : undefined,
    };
  }
}

export const bargainService = new BargainService();
export type {
  BargainRequest,
  BargainResponse,
  BargainOffer,
  HoldRequest,
  HoldResponse,
};
