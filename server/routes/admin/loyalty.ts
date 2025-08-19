import { Router, Request, Response } from "express";
import { Pool } from "pg";
import LoyaltyService from "../../services/loyaltyService";
import { authenticateAdmin } from "../../middleware/adminAuth";

const router = Router();

// Initialize loyalty service (will be injected with proper DB connection)
let loyaltyService: LoyaltyService;

// Initialize with database connection
export function initializeLoyaltyService(dbPool: Pool) {
  loyaltyService = new LoyaltyService(dbPool);
}

// Get member loyalty profile
router.get("/me", authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const member = await loyaltyService.getOrCreateMember(userId);
    const tierRules = await loyaltyService.getTierRules();
    const expiringPoints = await loyaltyService.getExpiringPoints(userId, 60);

    // Calculate progress to next tier
    const currentTier = tierRules.find((t) => t.tier === member.tier);
    const nextTier = tierRules.find((t) => t.tier === member.tier + 1);

    let progress = 100; // Default if at highest tier
    let pointsToNext = 0;

    if (nextTier) {
      const currentPoints = member.points12m;
      const currentThreshold = currentTier?.thresholdPoints12m || 0;
      const nextThreshold = nextTier.thresholdPoints12m;

      progress = Math.round(
        ((currentPoints - currentThreshold) /
          (nextThreshold - currentThreshold)) *
          100,
      );
      pointsToNext = nextThreshold - currentPoints;
    }

    // Check for expiring points in next 60 days
    const expiringIn60Days = expiringPoints.filter((p) => {
      const daysUntilExpiry = Math.ceil(
        (new Date(p.expire_on).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
      );
      return daysUntilExpiry <= 60;
    });

    const response = {
      member: {
        id: member.id,
        memberCode: member.memberCode,
        tier: member.tier,
        tierName: currentTier?.tierName || "Bronze",
        pointsBalance: member.pointsBalance,
        pointsLocked: member.pointsLocked,
        pointsLifetime: member.pointsLifetime,
        points12m: member.points12m,
        joinDate: member.joinDate,
        status: member.status,
      },
      tier: {
        current: currentTier,
        next: nextTier,
        progress,
        pointsToNext,
      },
      expiringSoon: expiringIn60Days.map((p) => ({
        points: p.points,
        expireOn: p.expire_on,
        daysRemaining: Math.ceil(
          (new Date(p.expire_on).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24),
        ),
      })),
    };

    res.json({ success: true, data: response });
  } catch (error) {
    console.error("Get loyalty profile error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch loyalty profile",
    });
  }
});

// Get member transaction ledger
router.get(
  "/me/ledger",
  authenticateAdmin,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }

      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
      const offset = parseInt(req.query.offset as string) || 0;

      const ledger = await loyaltyService.getMemberLedger(
        userId,
        limit,
        offset,
      );

      res.json({
        success: true,
        data: {
          items: ledger.items,
          pagination: {
            total: ledger.total,
            limit,
            offset,
            hasMore: offset + limit < ledger.total,
          },
        },
      });
    } catch (error) {
      console.error("Get loyalty ledger error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch transaction history",
      });
    }
  },
);

// Quote redemption for cart
router.post(
  "/quote-redeem",
  authenticateAdmin,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }

      const { eligibleAmount, currency = "INR", fxRate = 1.0 } = req.body;

      if (!eligibleAmount || eligibleAmount <= 0) {
        return res.status(400).json({
          success: false,
          error: "Valid eligible amount required",
        });
      }

      const quote = await loyaltyService.quoteRedemption(
        userId,
        eligibleAmount,
        currency,
        fxRate,
      );

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
router.post(
  "/apply",
  authenticateAdmin,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }

      const {
        cartId,
        points,
        eligibleAmount,
        currency = "INR",
        fxRate = 1.0,
      } = req.body;

      if (!cartId || !points || !eligibleAmount) {
        return res.status(400).json({
          success: false,
          error: "Cart ID, points, and eligible amount required",
        });
      }

      if (points < 0 || points % 100 !== 0) {
        return res.status(400).json({
          success: false,
          error: "Points must be positive and in multiples of 100",
        });
      }

      const result = await loyaltyService.applyRedemption(
        userId,
        cartId,
        points,
        eligibleAmount,
        currency,
        fxRate,
      );

      if (!result.success) {
        return res.status(400).json({ success: false, error: result.error });
      }

      res.json({
        success: true,
        data: {
          lockedId: result.lockedId,
          pointsApplied: points,
          rupeeValue: result.rupeeValue,
        },
      });
    } catch (error) {
      console.error("Apply points error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to apply points",
      });
    }
  },
);

// Cancel point redemption
router.post(
  "/cancel-redemption",
  authenticateAdmin,
  async (req: Request, res: Response) => {
    try {
      const { lockedId } = req.body;

      if (!lockedId) {
        return res.status(400).json({
          success: false,
          error: "Locked ID required",
        });
      }

      const success = await loyaltyService.cancelRedemption(lockedId);

      if (!success) {
        return res.status(404).json({
          success: false,
          error: "Redemption not found or already processed",
        });
      }

      res.json({ success: true, message: "Points redemption cancelled" });
    } catch (error) {
      console.error("Cancel redemption error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to cancel redemption",
      });
    }
  },
);

// Confirm redemption (internal use - called after payment success)
router.post("/confirm-redemption", async (req: Request, res: Response) => {
  try {
    const { lockedId, bookingId } = req.body;

    if (!lockedId || !bookingId) {
      return res.status(400).json({
        success: false,
        error: "Locked ID and booking ID required",
      });
    }

    const success = await loyaltyService.confirmRedemption(lockedId, bookingId);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: "Redemption not found or already processed",
      });
    }

    res.json({ success: true, message: "Points redemption confirmed" });
  } catch (error) {
    console.error("Confirm redemption error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to confirm redemption",
    });
  }
});

// Calculate points earning (preview)
router.post("/calculate-earning", async (req: Request, res: Response) => {
  try {
    const {
      eligibleAmount,
      bookingType,
      currency = "INR",
      fxRate = 1.0,
    } = req.body;

    if (!eligibleAmount || !bookingType) {
      return res.status(400).json({
        success: false,
        error: "Eligible amount and booking type required",
      });
    }

    const calculation = await loyaltyService.calculateEarning(
      eligibleAmount,
      bookingType,
      currency,
      fxRate,
    );

    res.json({
      success: true,
      data: calculation,
    });
  } catch (error) {
    console.error("Calculate earning error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to calculate earning",
    });
  }
});

// Process earning (internal use - called after booking completion)
router.post("/process-earning", async (req: Request, res: Response) => {
  try {
    const { userId, bookingId, bookingType, eligibility, description } =
      req.body;

    if (!userId || !bookingId || !bookingType || !eligibility) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    const earnedPoints = await loyaltyService.processEarning(
      userId,
      bookingId,
      bookingType,
      eligibility,
      description,
    );

    // Update member tier if needed
    const tierUpdate = await loyaltyService.updateMemberTier(userId);

    res.json({
      success: true,
      data: {
        earnedPoints,
        tierUpdate,
      },
    });
  } catch (error) {
    console.error("Process earning error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to process earning",
    });
  }
});

// ADMIN ROUTES

// ===== LOYALTY RULES MANAGEMENT =====

// Get all loyalty rules
router.get(
  "/admin/rules",
  authenticateAdmin,
  async (req: Request, res: Response) => {
    try {
      const rules = await loyaltyService.getRules();
      res.json(rules);
    } catch (error) {
      console.error("Get loyalty rules error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch loyalty rules",
      });
    }
  },
);

// Create new loyalty rule
router.post(
  "/admin/rules",
  authenticateAdmin,
  async (req: Request, res: Response) => {
    try {
      const rule = await loyaltyService.createLoyaltyRule(req.body);
      res.status(201).json(rule);
    } catch (error) {
      console.error("Create loyalty rule error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to create loyalty rule",
      });
    }
  },
);

// Update loyalty rule
router.put(
  "/admin/rules/:id",
  authenticateAdmin,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const rule = await loyaltyService.updateLoyaltyRule(id, req.body);
      res.json(rule);
    } catch (error) {
      console.error("Update loyalty rule error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update loyalty rule",
      });
    }
  },
);

// Delete loyalty rule
router.delete(
  "/admin/rules/:id",
  authenticateAdmin,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await loyaltyService.deleteLoyaltyRule(id);
      res.status(204).send();
    } catch (error) {
      console.error("Delete loyalty rule error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to delete loyalty rule",
      });
    }
  },
);

// ===== TIER MANAGEMENT =====

// Get all tier rules
router.get(
  "/admin/tiers",
  authenticateAdmin,
  async (req: Request, res: Response) => {
    try {
      const tiers = await loyaltyService.getTierRules();
      res.json(tiers);
    } catch (error) {
      console.error("Get tier rules error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch tier rules",
      });
    }
  },
);

// Create new tier rule
router.post(
  "/admin/tiers",
  authenticateAdmin,
  async (req: Request, res: Response) => {
    try {
      const tier = await loyaltyService.createTierRule(req.body);
      res.status(201).json(tier);
    } catch (error) {
      console.error("Create tier rule error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to create tier rule",
      });
    }
  },
);

// Update tier rule
router.put(
  "/admin/tiers/:id",
  authenticateAdmin,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const tier = await loyaltyService.updateTierRule(id, req.body);
      res.json(tier);
    } catch (error) {
      console.error("Update tier rule error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update tier rule",
      });
    }
  },
);

// ===== MEMBER MANAGEMENT =====

// Get all loyalty members with search and pagination
router.get(
  "/admin/members",
  authenticateAdmin,
  async (req: Request, res: Response) => {
    try {
      const { search, page = 1, limit = 20 } = req.query;
      const members = await loyaltyService.getLoyaltyMembers({
        search: search as string,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
      });
      res.json(members);
    } catch (error) {
      console.error("Get loyalty members error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch loyalty members",
      });
    }
  },
);

// Update member status
router.patch(
  "/admin/members/:userId",
  authenticateAdmin,
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { status } = req.body;

      if (!["ACTIVE", "SUSPENDED", "INACTIVE"].includes(status)) {
        return res.status(400).json({
          success: false,
          error: "Invalid status",
        });
      }

      const member = await loyaltyService.updateMemberStatus(userId, status);
      res.json({ success: true, data: member });
    } catch (error) {
      console.error("Update member status error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update member status",
      });
    }
  },
);

// Manual point adjustment for members
router.post(
  "/admin/members/:userId/adjust-points",
  authenticateAdmin,
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { points, reason, type } = req.body;

      if (!points || !reason || !type) {
        return res.status(400).json({
          success: false,
          error: "Points, reason, and type are required",
        });
      }

      const adminUserId = (req as any).user?.id;
      const transaction = await loyaltyService.adjustMemberPoints({
        userId,
        points,
        reason,
        type,
        adminUserId,
      });

      res.json({ success: true, data: transaction });
    } catch (error) {
      console.error("Adjust member points error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to adjust member points",
      });
    }
  },
);

// Get member details (admin only)
router.get(
  "/admin/member/:userId",
  authenticateAdmin,
  async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const member = await loyaltyService.getMember(userId);

      if (!member) {
        return res.status(404).json({
          success: false,
          error: "Member not found",
        });
      }

      const ledger = await loyaltyService.getMemberLedger(userId, 50, 0);

      res.json({
        success: true,
        data: {
          member,
          recentTransactions: ledger.items,
        },
      });
    } catch (error) {
      console.error("Get member details error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch member details",
      });
    }
  },
);

// Get member transaction history
router.get(
  "/admin/members/:userId/transactions",
  authenticateAdmin,
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const transactions = await loyaltyService.getMemberTransactions(userId, {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
      });

      res.json({ success: true, data: transactions });
    } catch (error) {
      console.error("Get member transactions error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch member transactions",
      });
    }
  },
);

// ===== ANALYTICS & REPORTING =====

// Get loyalty program analytics
router.get(
  "/admin/analytics",
  authenticateAdmin,
  async (req: Request, res: Response) => {
    try {
      const { startDate, endDate } = req.query;
      const analytics = await loyaltyService.getLoyaltyAnalytics({
        startDate: startDate as string,
        endDate: endDate as string,
      });
      res.json({ success: true, data: analytics });
    } catch (error) {
      console.error("Get loyalty analytics error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch loyalty analytics",
      });
    }
  },
);

// Export loyalty data
router.get(
  "/admin/export",
  authenticateAdmin,
  async (req: Request, res: Response) => {
    try {
      const { type, format = "csv" } = req.query;
      const data = await loyaltyService.exportLoyaltyData(
        type as string,
        format as string,
      );

      res.setHeader(
        "Content-Type",
        format === "csv" ? "text/csv" : "application/json",
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=loyalty-${type}-${new Date().toISOString().split("T")[0]}.${format}`,
      );
      res.send(data);
    } catch (error) {
      console.error("Export loyalty data error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to export loyalty data",
      });
    }
  },
);

export default router;
