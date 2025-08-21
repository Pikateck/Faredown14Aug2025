/**
 * Promo Code and Bargain Engine API Routes
 * Handles dynamic pricing, promo codes, and bargain validation for flights and hotels
 */

const express = require("express");
const router = express.Router();
const {
  requirePermission,
  PERMISSIONS,
  authenticateToken,
} = require("../middleware/auth");
const { validate } = require("../middleware/validation");
const { audit } = require("../middleware/audit");
const {
  PromoCodeValidator,
  validatePromoCode,
  trackPromoUsage,
  checkBudgetLimits,
} = require("../middleware/promoValidation");

// In-memory storage for promo codes and bargain sessions (in production, use database)
let promoCodes = [
  {
    id: "promo_001",
    code: "FLYHIGH100",
    name: "Fly High Discount",
    type: "percent", // 'percent' or 'fixed'
    discountFrom: 5,
    discountTo: 15,
    applicableTo: "flights", // 'flights', 'hotels', 'both'
    filters: {
      fromCity: "Mumbai",
      toCity: "Dubai",
      airlines: ["Emirates", "Air India"],
      cabinClass: ["Economy", "Business"],
    },
    travelPeriod: {
      from: "2025-02-01",
      to: "2025-12-31",
    },
    validity: {
      startDate: "2025-01-15",
      endDate: "2025-12-31",
    },
    marketingBudget: 100000,
    budgetUsed: 15750,
    status: "active", // 'active', 'paused', 'exhausted', 'expired'
    usageCount: 157,
    createdAt: "2025-01-15T00:00:00Z",
    createdBy: "admin",
  },
  {
    id: "promo_002",
    code: "HOTELFEST",
    name: "Hotel Festival Offer",
    type: "fixed",
    discountFrom: 2000,
    discountTo: 5000,
    applicableTo: "hotels",
    filters: {
      cities: ["Dubai", "Singapore"],
      hotels: ["Atlantis The Palm", "Marina Bay Sands"],
      roomCategories: ["Deluxe", "Suite", "Presidential"],
    },
    travelPeriod: {
      from: "2025-03-01",
      to: "2025-06-30",
    },
    validity: {
      startDate: "2025-01-20",
      endDate: "2025-06-30",
    },
    marketingBudget: 250000,
    budgetUsed: 87500,
    status: "active",
    usageCount: 203,
    createdAt: "2025-01-20T00:00:00Z",
    createdBy: "admin",
  },
  {
    id: "promo_003",
    code: "TRAVEL25",
    name: "Universal Travel Discount",
    type: "percent",
    discountFrom: 8,
    discountTo: 25,
    applicableTo: "both",
    filters: {
      // Universal - applies to all
    },
    travelPeriod: {
      from: "2025-01-01",
      to: "2025-12-31",
    },
    validity: {
      startDate: "2025-01-01",
      endDate: "2025-12-31",
    },
    marketingBudget: 500000,
    budgetUsed: 125000,
    status: "active",
    usageCount: 892,
    createdAt: "2025-01-01T00:00:00Z",
    createdBy: "admin",
  },
  // Zubin's Sample Data - FAREDOWNBONUS Promo Code for Flights
  {
    id: "promo_004",
    code: "FAREDOWNBONUS",
    name: "FAREDOWNBONUS Flight Discount",
    type: "fixed", // INR (Flat) as per Zubin's spec
    discountFrom: 2000, // Min Discount: ₹2,000
    discountTo: 5000, // Max Discount: ₹5,000
    applicableTo: "flights",
    filters: {
      // Universal for flights - no specific filters
      minFare: 10500, // Min Fare: ₹10,500 from Zubin's spec
    },
    travelPeriod: {
      from: "2025-01-01",
      to: "2025-12-31",
    },
    validity: {
      startDate: "2025-01-01",
      endDate: "2025-12-31",
    },
    marketingBudget: 100000, // Budget: ₹100,000 from Zubin's spec
    budgetUsed: 0,
    status: "active", // Status: Active from Zubin's spec
    usageCount: 0,
    createdAt: new Date().toISOString(),
    createdBy: "admin",
  },
  // Zubin's Sample Data - FAREDOWNBONUS Promo Code for Hotels
  {
    id: "promo_005",
    code: "FAREDOWNBONUS",
    name: "FAREDOWNBONUS Hotel Discount",
    type: "fixed", // INR (Flat) as per Zubin's spec
    discountFrom: 2000, // Min Discount: ₹2,000
    discountTo: 5000, // Max Discount: ₹5,000
    applicableTo: "hotels",
    filters: {
      // Universal for hotels - no specific filters
      minFare: 10500, // Min Fare: ₹10,500 from Zubin's spec
    },
    travelPeriod: {
      from: "2025-01-01",
      to: "2025-12-31",
    },
    validity: {
      startDate: "2025-01-01",
      endDate: "2025-12-31",
    },
    marketingBudget: 100000, // Budget: ₹100,000 from Zubin's spec
    budgetUsed: 0,
    status: "active", // Status: Active from Zubin's spec
    usageCount: 0,
    createdAt: new Date().toISOString(),
    createdBy: "admin",
  },
];

let bargainSessions = new Map();

// Markup configuration (can be moved to database)
const markupConfig = {
  flights: {
    domestic: { from: 8, to: 15 }, // 8-15%
    international: { from: 12, to: 20 }, // 12-20%
  },
  hotels: {
    budget: { from: 10, to: 18 }, // 10-18%
    luxury: { from: 15, to: 25 }, // 15-25%
    premium: { from: 20, to: 30 }, // 20-30%
  },
};

/**
 * @api {post} /api/promo/apply Apply Promo Code
 * @apiName ApplyPromoCode
 * @apiGroup PromoCode
 * @apiVersion 1.0.0
 *
 * @apiHeader {String} Authorization Bearer token
 *
 * @apiParam {String} promoCode Promo code to apply
 * @apiParam {String} type Type of booking (flight/hotel)
 * @apiParam {String} [fromCity] For flights: departure city
 * @apiParam {String} [toCity] For flights: destination city
 * @apiParam {String} [airline] For flights: airline code
 * @apiParam {String} [cabin] For flights: cabin class
 * @apiParam {String} [travelDate] For flights: travel date
 * @apiParam {String} [city] For hotels: city
 * @apiParam {String} [hotel] For hotels: hotel name
 * @apiParam {String} [roomCategory] For hotels: room category
 * @apiParam {String} [checkIn] For hotels: check-in date
 * @apiParam {String} [checkOut] For hotels: check-out date
 *
 * @apiSuccess {String} status Validation status (valid/invalid)
 * @apiSuccess {Number} [discountFrom] Minimum discount value
 * @apiSuccess {Number} [discountTo] Maximum discount value
 * @apiSuccess {String} [type] Discount type (percent/fixed)
 * @apiSuccess {Number} [remainingBudget] Remaining marketing budget
 * @apiSuccess {String} [message] Status message
 */
router.post(
  "/apply",
  authenticateToken,
  validate.applyPromo,
  checkBudgetLimits,
  async (req, res) => {
    try {
      const { promoCode, type, ...filters } = req.body;

      // Log promo code application attempt
      await audit.userAction(req, "promo_apply", {
        promoCode,
        type,
        ...filters,
      });

      // Create booking details object for validation
      const bookingDetails = {
        type,
        amount: filters.amount || 10000, // Default amount for validation
        fromCity: filters.fromCity,
        toCity: filters.toCity,
        airline: filters.airline,
        cabin: filters.cabin,
        travelDate: filters.travelDate,
        city: filters.city,
        hotel: filters.hotel,
        roomCategory: filters.roomCategory,
        checkIn: filters.checkIn,
        checkOut: filters.checkOut,
      };

      // Use PromoCodeValidator for comprehensive validation
      const validation = PromoCodeValidator.validatePromoCode(
        promoCode,
        bookingDetails,
        req.user?.id,
      );

      if (!validation.isValid) {
        return res.json({
          success: false,
          status: "invalid",
          message: validation.message,
          errors: validation.errors,
        });
      }

      // Valid promo code
      res.json({
        success: true,
        status: "valid",
        discountFrom: validation.promo.discountFrom,
        discountTo: validation.promo.discountTo,
        type: validation.promo.type,
        remainingBudget: validation.remainingBudget,
        message: `${validation.promo.name} applied successfully`,
        promoDetails: {
          id: validation.promo.id,
          name: validation.promo.name,
          description: `Save ${validation.promo.discountFrom}${validation.promo.type === "percent" ? "%" : "₹"} to ${validation.promo.discountTo}${validation.promo.type === "percent" ? "%" : "₹"}`,
        },
      });
    } catch (error) {
      console.error("Promo apply error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to apply promo code",
      });
    }
  },
);

/**
 * @api {post} /api/promo/check Check Bargain Price
 * @apiName CheckBargainPrice
 * @apiGroup PromoCode
 * @apiVersion 1.0.0
 *
 * @apiHeader {String} Authorization Bearer token
 *
 * @apiParam {Number} userInputPrice Price entered by user
 * @apiParam {Number} baseNetPrice Base net price from supplier
 * @apiParam {Object} discountRange Discount range from promo code
 * @apiParam {Number} discountRange.from Minimum discount
 * @apiParam {Number} discountRange.to Maximum discount
 * @apiParam {String} discountRange.type Discount type (percent/fixed)
 * @apiParam {String} [promoCode] Applied promo code
 * @apiParam {String} type Booking type (flight/hotel)
 * @apiParam {Object} [markup] Markup configuration
 *
 * @apiSuccess {String} status Bargain status (matched/rejected/counter)
 * @apiSuccess {Number} [finalPrice] Final accepted price
 * @apiSuccess {Number} [counterOffer] Counter offer price
 * @apiSuccess {String} message Status message
 * @apiSuccess {Object} [priceBreakdown] Detailed price breakdown
 */
router.post(
  "/check",
  authenticateToken,
  validate.checkBargain,
  trackPromoUsage,
  async (req, res) => {
    try {
      const {
        userInputPrice,
        baseNetPrice,
        discountRange,
        promoCode,
        type,
        markup = {},
      } = req.body;

      // Log bargain attempt
      await audit.userAction(req, "bargain_check", {
        userInputPrice,
        baseNetPrice,
        promoCode,
        type,
      });

      // Calculate markup range (from config or provided)
      let markupRange = markup;
      if (!markup.from || !markup.to) {
        if (type === "flight") {
          // Determine domestic vs international based on some logic
          markupRange = markupConfig.flights.international; // default
        } else {
          // Determine hotel category based on price
          if (baseNetPrice < 5000) {
            markupRange = markupConfig.hotels.budget;
          } else if (baseNetPrice < 15000) {
            markupRange = markupConfig.hotels.luxury;
          } else {
            markupRange = markupConfig.hotels.premium;
          }
        }
      }

      // Calculate price with markup
      const markupAmount =
        markupRange.type === "percent"
          ? (baseNetPrice * markupRange.from) / 100
          : markupRange.from;
      const priceWithMarkup = baseNetPrice + markupAmount;

      // Calculate discounted price range
      let minDiscountedPrice, maxDiscountedPrice;

      if (discountRange.type === "percent") {
        maxDiscountedPrice = priceWithMarkup * (1 - discountRange.from / 100);
        minDiscountedPrice = priceWithMarkup * (1 - discountRange.to / 100);
      } else {
        maxDiscountedPrice = priceWithMarkup - discountRange.from;
        minDiscountedPrice = priceWithMarkup - discountRange.to;
      }

      // Ensure minimum price doesn't go below cost
      minDiscountedPrice = Math.max(
        minDiscountedPrice,
        baseNetPrice + baseNetPrice * 0.02,
      ); // 2% minimum margin

      const sessionId = `bargain_${Date.now()}_${req.user.id}`;

      // Check if user price is within acceptable range
      if (
        userInputPrice >= minDiscountedPrice &&
        userInputPrice <= maxDiscountedPrice
      ) {
        // Accept the bargain
        const session = {
          id: sessionId,
          userId: req.user.id,
          type,
          originalPrice: priceWithMarkup,
          targetPrice: userInputPrice,
          finalPrice: userInputPrice,
          status: "accepted",
          promoCode,
          baseNetPrice,
          markupAmount,
          discountAmount: priceWithMarkup - userInputPrice,
          timestamp: new Date().toISOString(),
        };

        bargainSessions.set(sessionId, session);

        // Update promo code usage if applicable
        if (promoCode) {
          const promo = promoCodes.find((p) => p.code === promoCode);
          if (promo) {
            const discountValue = priceWithMarkup - userInputPrice;
            promo.budgetUsed += discountValue;
            promo.usageCount += 1;

            // Check if budget is exhausted
            if (promo.budgetUsed >= promo.marketingBudget) {
              promo.status = "exhausted";
            }
          }
        }

        res.json({
          success: true,
          status: "matched",
          finalPrice: userInputPrice,
          sessionId,
          message: "Great! Your bargain price has been accepted.",
          priceBreakdown: {
            basePrice: baseNetPrice,
            markup: markupAmount,
            originalPrice: priceWithMarkup,
            discount: priceWithMarkup - userInputPrice,
            finalPrice: userInputPrice,
            savings: priceWithMarkup - userInputPrice,
            savingsPercent: (
              ((priceWithMarkup - userInputPrice) / priceWithMarkup) *
              100
            ).toFixed(1),
          },
        });
      } else if (userInputPrice < minDiscountedPrice) {
        // User price is too low, offer counter
        const counterOffer = Math.round(
          minDiscountedPrice + (maxDiscountedPrice - minDiscountedPrice) * 0.3,
        );

        const session = {
          id: sessionId,
          userId: req.user.id,
          type,
          originalPrice: priceWithMarkup,
          targetPrice: userInputPrice,
          counterOffer,
          status: "negotiating",
          promoCode,
          baseNetPrice,
          markupAmount,
          attempts: 1,
          timestamp: new Date().toISOString(),
        };

        bargainSessions.set(sessionId, session);

        res.json({
          success: true,
          status: "counter",
          counterOffer,
          sessionId,
          message: `Your price is a bit low. How about ₹${counterOffer.toLocaleString()}?`,
          priceBreakdown: {
            basePrice: baseNetPrice,
            markup: markupAmount,
            originalPrice: priceWithMarkup,
            yourPrice: userInputPrice,
            counterOffer,
            minAcceptable: Math.round(minDiscountedPrice),
            maxAcceptable: Math.round(maxDiscountedPrice),
          },
        });
      } else {
        // User price is higher than maximum discount, just accept it
        res.json({
          success: true,
          status: "matched",
          finalPrice: userInputPrice,
          sessionId,
          message: "Price accepted! You could have gotten it for less though.",
          priceBreakdown: {
            basePrice: baseNetPrice,
            markup: markupAmount,
            originalPrice: priceWithMarkup,
            finalPrice: userInputPrice,
          },
        });
      }
    } catch (error) {
      console.error("Bargain check error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to check bargain price",
      });
    }
  },
);

/**
 * @api {post} /api/promo/counter Handle Counter Offer
 * @apiName HandleCounterOffer
 * @apiGroup PromoCode
 * @apiVersion 1.0.0
 *
 * @apiHeader {String} Authorization Bearer token
 *
 * @apiParam {String} sessionId Bargain session ID
 * @apiParam {Number} newPrice New price offered by user
 * @apiParam {String} action Action (accept/reject/counter)
 *
 * @apiSuccess {String} status Response status
 * @apiSuccess {Number} [finalPrice] Final price if accepted
 * @apiSuccess {Number} [counterOffer] New counter offer
 * @apiSuccess {String} message Response message
 */
router.post(
  "/counter",
  authenticateToken,
  validate.counterOffer,
  async (req, res) => {
    try {
      const { sessionId, newPrice, action } = req.body;

      const session = bargainSessions.get(sessionId);
      if (!session) {
        return res.status(404).json({
          success: false,
          message: "Bargain session not found",
        });
      }

      if (session.userId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized access to bargain session",
        });
      }

      await audit.userAction(req, "bargain_counter", {
        sessionId,
        newPrice,
        action,
      });

      if (action === "accept") {
        // User accepts our counter offer
        session.finalPrice = session.counterOffer;
        session.status = "accepted";
        session.updatedAt = new Date().toISOString();

        res.json({
          success: true,
          status: "matched",
          finalPrice: session.counterOffer,
          message: "Great! Deal confirmed.",
          sessionId,
        });
      } else if (action === "reject") {
        // User rejects, end session
        session.status = "rejected";
        session.updatedAt = new Date().toISOString();

        res.json({
          success: true,
          status: "rejected",
          message: "No worries! You can try again or book at original price.",
          originalPrice: session.originalPrice,
        });
      } else if (action === "counter" && newPrice) {
        // User makes a new counter offer
        session.attempts = (session.attempts || 1) + 1;

        if (session.attempts > 3) {
          // Max attempts reached
          session.status = "expired";
          res.json({
            success: false,
            status: "expired",
            message:
              "Maximum negotiation attempts reached. Book at original price.",
            originalPrice: session.originalPrice,
          });
          return;
        }

        // Check if new price is acceptable
        const { baseNetPrice, markupAmount } = session;
        const minPrice = baseNetPrice + baseNetPrice * 0.02; // 2% minimum margin

        if (newPrice >= minPrice) {
          // Accept user's counter
          session.finalPrice = newPrice;
          session.status = "accepted";
          session.updatedAt = new Date().toISOString();

          res.json({
            success: true,
            status: "matched",
            finalPrice: newPrice,
            message: "Excellent negotiation! Deal confirmed.",
            sessionId,
          });
        } else {
          // Make a new counter offer
          const newCounter = Math.round(
            minPrice + (session.originalPrice - minPrice) * 0.2,
          );
          session.counterOffer = newCounter;
          session.updatedAt = new Date().toISOString();

          res.json({
            success: true,
            status: "counter",
            counterOffer: newCounter,
            message: `How about ₹${newCounter.toLocaleString()}? This is our best offer.`,
            sessionId,
            attemptsLeft: 3 - session.attempts,
          });
        }
      }
    } catch (error) {
      console.error("Counter offer error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to handle counter offer",
      });
    }
  },
);

/**
 * @api {get} /api/promo/logs Promo Code Usage Logs
 * @apiName GetPromoLogs
 * @apiGroup PromoCode
 * @apiVersion 1.0.0
 *
 * @apiHeader {String} Authorization Bearer token
 * @apiPermission admin
 *
 * @apiQuery {String} [promoCode] Filter by promo code
 * @apiQuery {String} [status] Filter by status
 * @apiQuery {String} [startDate] Start date filter
 * @apiQuery {String} [endDate] End date filter
 * @apiQuery {Number} [page=1] Page number
 * @apiQuery {Number} [limit=50] Items per page
 *
 * @apiSuccess {Array} logs Promo usage logs
 * @apiSuccess {Object} stats Usage statistics
 */
router.get(
  "/logs",
  requirePermission(PERMISSIONS.PROMO_VIEW),
  async (req, res) => {
    try {
      const {
        promoCode,
        status,
        startDate,
        endDate,
        page = 1,
        limit = 50,
      } = req.query;

      await audit.systemAction(req, "promo_logs_view", { promoCode, status });

      // Filter promo codes based on criteria
      let filteredPromos = promoCodes;

      if (promoCode) {
        filteredPromos = filteredPromos.filter((p) =>
          p.code.toLowerCase().includes(promoCode.toLowerCase()),
        );
      }

      if (status) {
        filteredPromos = filteredPromos.filter((p) => p.status === status);
      }

      if (startDate) {
        filteredPromos = filteredPromos.filter(
          (p) => new Date(p.createdAt) >= new Date(startDate),
        );
      }

      if (endDate) {
        filteredPromos = filteredPromos.filter(
          (p) => new Date(p.createdAt) <= new Date(endDate),
        );
      }

      // Pagination
      const offset = (page - 1) * limit;
      const paginatedPromos = filteredPromos.slice(offset, offset + limit);

      // Calculate statistics
      const stats = {
        totalCodes: promoCodes.length,
        activeCodes: promoCodes.filter((p) => p.status === "active").length,
        exhaustedCodes: promoCodes.filter((p) => p.status === "exhausted")
          .length,
        totalBudget: promoCodes.reduce((sum, p) => sum + p.marketingBudget, 0),
        budgetUsed: promoCodes.reduce((sum, p) => sum + p.budgetUsed, 0),
        totalUsage: promoCodes.reduce((sum, p) => sum + p.usageCount, 0),
        conversionRate: "15.2%", // Mock value
        topPerformingCodes: promoCodes
          .sort((a, b) => b.usageCount - a.usageCount)
          .slice(0, 5)
          .map((p) => ({
            code: p.code,
            name: p.name,
            usage: p.usageCount,
            budgetUsed: p.budgetUsed,
            roi: ((p.budgetUsed / p.marketingBudget) * 100).toFixed(1) + "%",
          })),
      };

      res.json({
        success: true,
        data: {
          logs: paginatedPromos,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: filteredPromos.length,
            totalPages: Math.ceil(filteredPromos.length / limit),
          },
          stats,
          filters: { promoCode, status, startDate, endDate },
        },
      });
    } catch (error) {
      console.error("Promo logs error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch promo logs",
      });
    }
  },
);

/**
 * @api {get} /api/promo/sessions Get Bargain Sessions
 * @apiName GetBargainSessions
 * @apiGroup PromoCode
 * @apiVersion 1.0.0
 *
 * @apiHeader {String} Authorization Bearer token
 *
 * @apiQuery {String} [status] Filter by status
 * @apiQuery {Number} [page=1] Page number
 * @apiQuery {Number} [limit=20] Items per page
 *
 * @apiSuccess {Array} sessions Bargain sessions
 * @apiSuccess {Object} pagination Pagination info
 */
router.get("/sessions", authenticateToken, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    // Get user's sessions
    const userSessions = Array.from(bargainSessions.values()).filter(
      (session) => session.userId === req.user.id,
    );

    // Apply status filter if provided
    let filteredSessions = userSessions;
    if (status) {
      filteredSessions = userSessions.filter(
        (session) => session.status === status,
      );
    }

    // Sort by timestamp (newest first)
    filteredSessions.sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
    );

    // Pagination
    const offset = (page - 1) * limit;
    const paginatedSessions = filteredSessions.slice(offset, offset + limit);

    res.json({
      success: true,
      data: {
        sessions: paginatedSessions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: filteredSessions.length,
          totalPages: Math.ceil(filteredSessions.length / limit),
        },
      },
    });
  } catch (error) {
    console.error("Bargain sessions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bargain sessions",
    });
  }
});

/**
 * @api {get} /api/promo/price-range Get Dynamic Price Range
 * @apiName GetPriceRange
 * @apiGroup PromoCode
 * @apiVersion 1.0.0
 *
 * @apiHeader {String} Authorization Bearer token
 *
 * @apiQuery {Number} basePrice Base price from supplier
 * @apiQuery {String} type Booking type (flight/hotel)
 * @apiQuery {String} [promoCode] Applied promo code
 * @apiQuery {String} [category] Category (domestic/international for flights, budget/luxury/premium for hotels)
 *
 * @apiSuccess {Object} priceRange Dynamic price range for display
 */
router.get("/price-range", authenticateToken, async (req, res) => {
  try {
    const { basePrice, type, promoCode, category } = req.query;

    if (!basePrice || !type) {
      return res.status(400).json({
        success: false,
        message: "basePrice and type are required",
      });
    }

    const basePriceNum = parseFloat(basePrice);

    // Get markup configuration
    let markupRange;
    if (type === "flight") {
      markupRange = markupConfig.flights[category || "international"];
    } else {
      markupRange = markupConfig.hotels[category || "luxury"];
    }

    // Calculate price with markup
    const minMarkupAmount = (basePriceNum * markupRange.from) / 100;
    const maxMarkupAmount = (basePriceNum * markupRange.to) / 100;
    const minPrice = basePriceNum + minMarkupAmount;
    const maxPrice = basePriceNum + maxMarkupAmount;

    // Apply promo code if provided
    let discountedMinPrice = minPrice;
    let discountedMaxPrice = maxPrice;
    let promoInfo = null;

    if (promoCode) {
      const promo = promoCodes.find(
        (p) => p.code.toLowerCase() === promoCode.toLowerCase(),
      );
      if (promo && promo.status === "active") {
        if (promo.type === "percent") {
          discountedMaxPrice = maxPrice * (1 - promo.discountFrom / 100);
          discountedMinPrice = maxPrice * (1 - promo.discountTo / 100);
        } else {
          discountedMaxPrice = maxPrice - promo.discountFrom;
          discountedMinPrice = maxPrice - promo.discountTo;
        }

        // Ensure minimum doesn't go below cost
        discountedMinPrice = Math.max(discountedMinPrice, basePriceNum * 1.02);

        promoInfo = {
          code: promo.code,
          name: promo.name,
          type: promo.type,
          discountFrom: promo.discountFrom,
          discountTo: promo.discountTo,
        };
      }
    }

    // Generate dynamic price band for UI display
    const priceSteps = [];
    const stepCount = 5;
    const priceRangeStart = promoCode ? discountedMaxPrice : minPrice;
    const priceRangeEnd = promoCode ? discountedMinPrice : maxPrice;
    const stepSize = (priceRangeEnd - priceRangeStart) / (stepCount - 1);

    for (let i = 0; i < stepCount; i++) {
      priceSteps.push(Math.round(priceRangeStart + stepSize * i));
    }

    res.json({
      success: true,
      data: {
        basePrice: basePriceNum,
        markup: {
          from: markupRange.from,
          to: markupRange.to,
          type: "percent",
        },
        originalPriceRange: {
          min: Math.round(minPrice),
          max: Math.round(maxPrice),
        },
        discountedPriceRange: promoCode
          ? {
              min: Math.round(discountedMinPrice),
              max: Math.round(discountedMaxPrice),
            }
          : null,
        priceSteps,
        recommendedBargainRange: {
          min: Math.round(promoCode ? discountedMinPrice : minPrice * 0.95),
          max: Math.round(promoCode ? discountedMaxPrice : minPrice * 1.05),
        },
        promo: promoInfo,
        savings: promoCode
          ? {
              min: Math.round(maxPrice - discountedMaxPrice),
              max: Math.round(maxPrice - discountedMinPrice),
              minPercent: (
                ((maxPrice - discountedMaxPrice) / maxPrice) *
                100
              ).toFixed(1),
              maxPercent: (
                ((maxPrice - discountedMinPrice) / maxPrice) *
                100
              ).toFixed(1),
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Price range error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to calculate price range",
    });
  }
});

/**
 * @api {post} /api/promo/admin/create Create Promo Code
 * @apiName CreatePromoCode
 * @apiGroup PromoCodeAdmin
 * @apiVersion 1.0.0
 *
 * @apiHeader {String} Authorization Bearer token
 * @apiPermission admin
 *
 * @apiParam {String} code Promo code
 * @apiParam {String} name Display name
 * @apiParam {String} type Discount type (percent/fixed)
 * @apiParam {Number} discountFrom Minimum discount
 * @apiParam {Number} discountTo Maximum discount
 * @apiParam {String} applicableTo Applicable to (flights/hotels/both)
 * @apiParam {Object} [filters] Filters object
 * @apiParam {Object} [travelPeriod] Travel period
 * @apiParam {Object} validity Validity period
 * @apiParam {Number} marketingBudget Marketing budget
 *
 * @apiSuccess {Object} promo Created promo code
 */
router.post(
  "/admin/create",
  requirePermission(PERMISSIONS.PROMO_MANAGE),
  validate.createPromo,
  async (req, res) => {
    try {
      const promoData = {
        ...req.body,
        createdBy: req.user.username,
      };

      // Check if code already exists
      const existingPromo = PromoCodeValidator.findPromoCode(req.body.code);
      if (existingPromo) {
        return res.status(400).json({
          success: false,
          message: "Promo code already exists",
        });
      }

      const newPromo = PromoCodeValidator.createPromoCode(promoData);

      await audit.adminAction(req, "promo_create", {
        promoId: newPromo.id,
        code: newPromo.code,
      });

      res.json({
        success: true,
        message: "Promo code created successfully",
        data: newPromo,
      });
    } catch (error) {
      console.error("Create promo error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create promo code",
      });
    }
  },
);

/**
 * @api {put} /api/promo/admin/:id Update Promo Code
 * @apiName UpdatePromoCode
 * @apiGroup PromoCodeAdmin
 * @apiVersion 1.0.0
 *
 * @apiHeader {String} Authorization Bearer token
 * @apiPermission admin
 *
 * @apiParam {String} id Promo code ID
 *
 * @apiSuccess {Object} promo Updated promo code
 */
router.put(
  "/admin/:id",
  requirePermission(PERMISSIONS.PROMO_MANAGE),
  async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = {
        ...req.body,
        updatedBy: req.user.username,
      };

      const updatedPromo = PromoCodeValidator.updatePromoCode(id, updateData);

      if (!updatedPromo) {
        return res.status(404).json({
          success: false,
          message: "Promo code not found",
        });
      }

      await audit.adminAction(req, "promo_update", {
        promoId: id,
        changes: Object.keys(updateData),
      });

      res.json({
        success: true,
        message: "Promo code updated successfully",
        data: updatedPromo,
      });
    } catch (error) {
      console.error("Update promo error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update promo code",
      });
    }
  },
);

/**
 * @api {delete} /api/promo/admin/:id Delete Promo Code
 * @apiName DeletePromoCode
 * @apiGroup PromoCodeAdmin
 * @apiVersion 1.0.0
 *
 * @apiHeader {String} Authorization Bearer token
 * @apiPermission admin
 *
 * @apiParam {String} id Promo code ID
 *
 * @apiSuccess {String} message Success message
 */
router.delete(
  "/admin/:id",
  requirePermission(PERMISSIONS.PROMO_MANAGE),
  async (req, res) => {
    try {
      const { id } = req.params;

      const deleted = PromoCodeValidator.deletePromoCode(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Promo code not found",
        });
      }

      await audit.adminAction(req, "promo_delete", { promoId: id });

      res.json({
        success: true,
        message: "Promo code deleted successfully",
      });
    } catch (error) {
      console.error("Delete promo error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete promo code",
      });
    }
  },
);

/**
 * @api {get} /api/promo/admin/all Get All Promo Codes
 * @apiName GetAllPromoCodes
 * @apiGroup PromoCodeAdmin
 * @apiVersion 1.0.0
 *
 * @apiHeader {String} Authorization Bearer token
 * @apiPermission admin
 *
 * @apiSuccess {Array} promoCodes All promo codes
 */
router.get(
  "/admin/all",
  requirePermission(PERMISSIONS.PROMO_VIEW),
  async (req, res) => {
    try {
      const promoCodes = PromoCodeValidator.getAllPromoCodes();

      res.json({
        success: true,
        data: promoCodes,
      });
    } catch (error) {
      console.error("Get all promos error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch promo codes",
      });
    }
  },
);

/**
 * @api {get} /api/promo/admin/statistics Get Promo Statistics
 * @apiName GetPromoStatistics
 * @apiGroup PromoCodeAdmin
 * @apiVersion 1.0.0
 *
 * @apiHeader {String} Authorization Bearer token
 * @apiPermission admin
 *
 * @apiQuery {String} [code] Specific promo code
 *
 * @apiSuccess {Object} statistics Promo code statistics
 */
router.get(
  "/admin/statistics",
  requirePermission(PERMISSIONS.ANALYTICS_VIEW),
  async (req, res) => {
    try {
      const { code } = req.query;
      const statistics = PromoCodeValidator.getPromoStatistics(code);

      res.json({
        success: true,
        data: statistics,
      });
    } catch (error) {
      console.error("Get promo statistics error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch promo statistics",
      });
    }
  },
);

/**
 * @api {get} /api/promo/admin/usage-logs Get Usage Logs
 * @apiName GetUsageLogs
 * @apiGroup PromoCodeAdmin
 * @apiVersion 1.0.0
 *
 * @apiHeader {String} Authorization Bearer token
 * @apiPermission admin
 *
 * @apiQuery {String} [promoCode] Filter by promo code
 * @apiQuery {String} [userId] Filter by user ID
 * @apiQuery {String} [startDate] Start date filter
 * @apiQuery {String} [endDate] End date filter
 * @apiQuery {String} [bookingType] Filter by booking type
 *
 * @apiSuccess {Array} logs Usage logs
 */
router.get(
  "/admin/usage-logs",
  requirePermission(PERMISSIONS.AUDIT_VIEW),
  async (req, res) => {
    try {
      const logs = PromoCodeValidator.getUsageLogs(req.query);

      res.json({
        success: true,
        data: logs,
      });
    } catch (error) {
      console.error("Get usage logs error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch usage logs",
      });
    }
  },
);

module.exports = router;
