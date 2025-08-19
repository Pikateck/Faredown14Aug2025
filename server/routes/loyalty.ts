import { Router, Request, Response } from "express";
import LoyaltyService from "../services/loyaltyService";

const router = Router();

// Basic auth middleware (simplified - replace with your actual auth)
const requireAuth = (req: Request, res: Response, next: any) => {
  // For demo purposes, we'll use a simple header check
  // In production, this should verify JWT tokens
  const userId = req.headers["x-user-id"];
  if (!userId) {
    return res
      .status(401)
      .json({ success: false, error: "Authentication required" });
  }
  (req as any).userId = parseInt(userId as string);
  next();
};

// Get current user's loyalty profile
router.get("/me", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    // This will be properly implemented with the database connection
    // For now, return a mock response
    const mockResponse = {
      member: {
        id: 1,
        memberCode: "FD12345678",
        tier: 1,
        tierName: "Bronze",
        pointsBalance: 1250,
        pointsLocked: 0,
        pointsLifetime: 2500,
        points12m: 1250,
        joinDate: "2024-01-15T00:00:00Z",
        status: "active",
      },
      tier: {
        current: {
          tier: 1,
          tierName: "Bronze",
          thresholdPoints12m: 0,
          earnMultiplier: 1.0,
          benefits: {
            description: "Member hotel prices, account wallet, earn/redeem",
          },
        },
        next: {
          tier: 2,
          tierName: "Silver",
          thresholdPoints12m: 1000,
          earnMultiplier: 1.1,
          benefits: {
            description:
              "10% earn boost, priority support, flexible cancellation",
          },
        },
        progress: 25,
        pointsToNext: 750,
      },
      expiringSoon: [],
    };

    res.json({ success: true, data: mockResponse });
  } catch (error) {
    console.error("Get loyalty profile error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch loyalty profile",
    });
  }
});

// Get transaction history
router.get("/me/history", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    // Mock transaction history
    const mockTransactions = [
      {
        id: 1,
        eventType: "earn",
        pointsDelta: 150,
        rupeeValue: 3000,
        description: "Earned from HOTEL booking",
        createdAt: "2024-01-20T10:30:00Z",
        bookingId: "HTL-2024-001",
      },
      {
        id: 2,
        eventType: "redeem",
        pointsDelta: -200,
        rupeeValue: 20,
        description: "Points redeemed on booking",
        createdAt: "2024-01-18T15:45:00Z",
        bookingId: "FLT-2024-003",
      },
    ];

    res.json({
      success: true,
      data: {
        items: mockTransactions,
        pagination: {
          total: 2,
          limit,
          offset,
          hasMore: false,
        },
      },
    });
  } catch (error) {
    console.error("Get transaction history error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch transaction history",
    });
  }
});

// Quote redemption for cart
router.post(
  "/quote-redeem",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const { eligibleAmount, currency = "INR", fxRate = 1.0 } = req.body;

      if (!eligibleAmount || eligibleAmount <= 0) {
        return res.status(400).json({
          success: false,
          error: "Valid eligible amount required",
        });
      }

      // Mock redemption calculation
      const maxRedeemValue = eligibleAmount * 0.2; // 20% cap
      const maxPoints = Math.floor((maxRedeemValue / 10) * 100); // 100 points = ₹10
      const availablePoints = 1250; // Mock available points

      const finalMaxPoints = Math.min(maxPoints, availablePoints);
      const finalMaxPoints100 = Math.floor(finalMaxPoints / 100) * 100; // Round to nearest 100

      const quote = {
        maxPoints: finalMaxPoints100,
        rupeeValue: (finalMaxPoints100 / 100) * 10,
        capReason:
          finalMaxPoints100 === maxPoints
            ? "Limited to 20% of booking value"
            : "Limited by available point balance",
      };

      res.json({ success: true, data: quote });
    } catch (error) {
      console.error("Quote redemption error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to calculate redemption",
      });
    }
  },
);

// Apply points to cart
router.post("/apply", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { cartId, points, eligibleAmount } = req.body;

    if (!cartId || !points || !eligibleAmount) {
      return res.status(400).json({
        success: false,
        error: "Cart ID, points, and eligible amount required",
      });
    }

    if (points < 200 || points % 100 !== 0) {
      return res.status(400).json({
        success: false,
        error: "Points must be at least 200 and in multiples of 100",
      });
    }

    // Mock application
    const rupeeValue = (points / 100) * 10; // 100 points = ₹10
    const lockedId = `lock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    res.json({
      success: true,
      data: {
        lockedId,
        pointsApplied: points,
        rupeeValue,
      },
    });
  } catch (error) {
    console.error("Apply points error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to apply points",
    });
  }
});

// Get loyalty program rules (public)
router.get("/rules", async (req: Request, res: Response) => {
  try {
    const rules = {
      earning: {
        hotel: {
          pointsPer100: 5,
          description: "Earn 5 points for every ₹100 spent on hotels",
        },
        air: {
          pointsPer100: 3,
          description: "Earn 3 points for every ₹100 spent on flights",
        },
      },
      redemption: {
        valuePerPoint: 0.1,
        minRedeem: 200,
        maxCapPercentage: 20,
        description: "100 points = ₹10. Use up to 20% of booking value.",
      },
      tiers: [
        {
          tier: 1,
          name: "Bronze",
          threshold: 0,
          multiplier: 1.0,
          benefits: [
            "Member hotel prices",
            "Account wallet",
            "Earn and redeem points",
          ],
        },
        {
          tier: 2,
          name: "Silver",
          threshold: 1000,
          multiplier: 1.1,
          benefits: [
            "10% bonus points",
            "Priority support",
            "Flexible cancellation",
          ],
        },
        {
          tier: 3,
          name: "Gold",
          threshold: 7000,
          multiplier: 1.2,
          benefits: ["20% bonus points", "Room upgrades", "Dedicated support"],
        },
      ],
      expiry: {
        months: 24,
        description: "Points expire 24 months after earning",
      },
    };

    res.json({ success: true, data: rules });
  } catch (error) {
    console.error("Get loyalty rules error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch loyalty rules",
    });
  }
});

export default router;
