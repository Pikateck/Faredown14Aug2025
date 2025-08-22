/**
 * Promo Code Validation Middleware
 * Comprehensive validation, budget tracking, and usage monitoring
 */

const { audit } = require("./audit");

// In-memory storage for promo codes (in production, use database)
let promoCodes = [];
let promoUsageLog = [];

// Promo code utilities
class PromoCodeValidator {
  /**
   * Initialize promo codes (load from database in production)
   */
  static initializePromoCodes() {
    // This would typically load from database
    promoCodes = [
      {
        id: "promo_001",
        code: "FLYHIGH100",
        name: "Fly High Discount",
        type: "percent",
        discountFrom: 5,
        discountTo: 15,
        applicableTo: "flights",
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
        status: "active",
        usageCount: 157,
        usageLimit: null, // unlimited
        userUsageLimit: 5, // per user limit
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
        usageLimit: 1000,
        userUsageLimit: 3,
        createdAt: "2025-01-20T00:00:00Z",
        createdBy: "admin",
      },
    ];
  }

  /**
   * Find promo code by code
   */
  static findPromoCode(code) {
    return promoCodes.find((p) => p.code.toLowerCase() === code.toLowerCase());
  }

  /**
   * Check if promo code is valid
   */
  static validatePromoCode(promoCode, bookingDetails, userId = null) {
    const validationResult = {
      isValid: false,
      message: "",
      promo: null,
      discountAmount: 0,
      errors: [],
    };

    // Find promo code
    const promo = this.findPromoCode(promoCode);
    if (!promo) {
      validationResult.message = "Promo code not found";
      validationResult.errors.push("PROMO_NOT_FOUND");
      return validationResult;
    }

    // Check status
    if (promo.status !== "active") {
      validationResult.message = `Promo code is ${promo.status}`;
      validationResult.errors.push("PROMO_INACTIVE");
      return validationResult;
    }

    // Check validity period
    const now = new Date();
    const startDate = new Date(promo.validity.startDate);
    const endDate = new Date(promo.validity.endDate);

    if (now < startDate) {
      validationResult.message = "Promo code is not yet valid";
      validationResult.errors.push("PROMO_NOT_YET_VALID");
      return validationResult;
    }

    if (now > endDate) {
      validationResult.message = "Promo code has expired";
      validationResult.errors.push("PROMO_EXPIRED");
      // Auto-update status
      promo.status = "expired";
      return validationResult;
    }

    // Check budget availability
    const remainingBudget = promo.marketingBudget - promo.budgetUsed;
    if (remainingBudget <= 0) {
      validationResult.message = "Promo code budget exhausted";
      validationResult.errors.push("BUDGET_EXHAUSTED");
      // Auto-update status
      promo.status = "exhausted";
      return validationResult;
    }

    // Check usage limits
    if (promo.usageLimit && promo.usageCount >= promo.usageLimit) {
      validationResult.message = "Promo code usage limit reached";
      validationResult.errors.push("USAGE_LIMIT_REACHED");
      promo.status = "exhausted";
      return validationResult;
    }

    // Check user usage limit
    if (userId && promo.userUsageLimit) {
      const userUsageCount = this.getUserUsageCount(promo.code, userId);
      if (userUsageCount >= promo.userUsageLimit) {
        validationResult.message = `You have already used this promo code ${promo.userUsageLimit} times`;
        validationResult.errors.push("USER_USAGE_LIMIT_REACHED");
        return validationResult;
      }
    }

    // Check applicability
    if (
      promo.applicableTo !== "both" &&
      promo.applicableTo !== bookingDetails.type
    ) {
      validationResult.message = `Promo code not applicable to ${bookingDetails.type} bookings`;
      validationResult.errors.push("NOT_APPLICABLE");
      return validationResult;
    }

    // Check filters
    const filterValidation = this.validateFilters(promo, bookingDetails);
    if (!filterValidation.isValid) {
      validationResult.message = filterValidation.message;
      validationResult.errors = filterValidation.errors;
      return validationResult;
    }

    // Check travel period
    if (promo.travelPeriod && bookingDetails.travelDate) {
      const travelDate = new Date(bookingDetails.travelDate);
      const travelStart = new Date(promo.travelPeriod.from);
      const travelEnd = new Date(promo.travelPeriod.to);

      if (travelDate < travelStart || travelDate > travelEnd) {
        validationResult.message = `Valid for travel between ${promo.travelPeriod.from} and ${promo.travelPeriod.to}`;
        validationResult.errors.push("TRAVEL_PERIOD_INVALID");
        return validationResult;
      }
    }

    // Calculate discount amount
    const discountAmount = this.calculateDiscount(promo, bookingDetails.amount);

    // Check if discount would exceed remaining budget
    if (discountAmount > remainingBudget) {
      validationResult.message = "Insufficient budget for this discount";
      validationResult.errors.push("INSUFFICIENT_BUDGET");
      return validationResult;
    }

    // Valid promo code
    validationResult.isValid = true;
    validationResult.message = "Promo code applied successfully";
    validationResult.promo = promo;
    validationResult.discountAmount = discountAmount;
    validationResult.remainingBudget = remainingBudget - discountAmount;

    return validationResult;
  }

  /**
   * Validate filters based on booking type
   */
  static validateFilters(promo, bookingDetails) {
    const result = { isValid: true, message: "", errors: [] };

    if (!promo.filters) {
      return result; // No filters means universal applicability
    }

    if (bookingDetails.type === "flight") {
      // Flight filters
      if (
        promo.filters.fromCity &&
        bookingDetails.fromCity !== promo.filters.fromCity
      ) {
        result.isValid = false;
        result.message = `Must depart from ${promo.filters.fromCity}`;
        result.errors.push("FROM_CITY_MISMATCH");
      }

      if (
        promo.filters.toCity &&
        bookingDetails.toCity !== promo.filters.toCity
      ) {
        result.isValid = false;
        result.message = `Must arrive at ${promo.filters.toCity}`;
        result.errors.push("TO_CITY_MISMATCH");
      }

      if (
        promo.filters.airlines &&
        bookingDetails.airline &&
        !promo.filters.airlines.includes(bookingDetails.airline)
      ) {
        result.isValid = false;
        result.message = `Valid only for ${promo.filters.airlines.join(", ")}`;
        result.errors.push("AIRLINE_MISMATCH");
      }

      if (
        promo.filters.cabinClass &&
        bookingDetails.cabin &&
        !promo.filters.cabinClass.includes(bookingDetails.cabin)
      ) {
        result.isValid = false;
        result.message = `Valid only for ${promo.filters.cabinClass.join(", ")} class`;
        result.errors.push("CABIN_CLASS_MISMATCH");
      }
    } else if (bookingDetails.type === "hotel") {
      // Hotel filters
      if (
        promo.filters.cities &&
        bookingDetails.city &&
        !promo.filters.cities.includes(bookingDetails.city)
      ) {
        result.isValid = false;
        result.message = `Valid only for ${promo.filters.cities.join(", ")}`;
        result.errors.push("CITY_MISMATCH");
      }

      if (
        promo.filters.hotels &&
        bookingDetails.hotel &&
        !promo.filters.hotels.includes(bookingDetails.hotel)
      ) {
        result.isValid = false;
        result.message = `Valid only for ${promo.filters.hotels.join(", ")}`;
        result.errors.push("HOTEL_MISMATCH");
      }

      if (
        promo.filters.roomCategories &&
        bookingDetails.roomCategory &&
        !promo.filters.roomCategories.includes(bookingDetails.roomCategory)
      ) {
        result.isValid = false;
        result.message = `Valid only for ${promo.filters.roomCategories.join(", ")} rooms`;
        result.errors.push("ROOM_CATEGORY_MISMATCH");
      }
    }

    return result;
  }

  /**
   * Calculate discount amount
   */
  static calculateDiscount(promo, bookingAmount) {
    let discountAmount = 0;

    if (promo.type === "percent") {
      // Use the maximum discount percentage for calculation
      const discountPercent = promo.discountTo;
      discountAmount = (bookingAmount * discountPercent) / 100;
    } else {
      // Fixed amount - use maximum discount
      discountAmount = promo.discountTo;
    }

    // Ensure discount doesn't exceed booking amount
    return Math.min(discountAmount, bookingAmount);
  }

  /**
   * Get user usage count for a promo code
   */
  static getUserUsageCount(promoCode, userId) {
    return promoUsageLog.filter(
      (log) =>
        log.promoCode === promoCode &&
        log.userId === userId &&
        log.status === "used",
    ).length;
  }

  /**
   * Record promo code usage
   */
  static async recordUsage(
    promoCode,
    userId,
    bookingDetails,
    discountAmount,
    sessionId,
  ) {
    const promo = this.findPromoCode(promoCode);
    if (!promo) return false;

    // Create usage log entry
    const usageEntry = {
      id: `usage_${Date.now()}_${userId}`,
      promoCode: promo.code,
      promoId: promo.id,
      userId,
      sessionId,
      bookingDetails,
      discountAmount,
      status: "used",
      timestamp: new Date().toISOString(),
      ipAddress: null, // Would be set by calling middleware
      userAgent: null, // Would be set by calling middleware
    };

    promoUsageLog.push(usageEntry);

    // Update promo code statistics
    promo.usageCount += 1;
    promo.budgetUsed += discountAmount;

    // Check if budget is exhausted
    if (promo.budgetUsed >= promo.marketingBudget) {
      promo.status = "exhausted";
    }

    // Check if usage limit is reached
    if (promo.usageLimit && promo.usageCount >= promo.usageLimit) {
      promo.status = "exhausted";
    }

    return usageEntry;
  }

  /**
   * Get promo code statistics
   */
  static getPromoStatistics(promoCode = null) {
    if (promoCode) {
      const promo = this.findPromoCode(promoCode);
      if (!promo) return null;

      const usageLogs = promoUsageLog.filter(
        (log) => log.promoCode === promo.code,
      );
      const totalDiscount = usageLogs.reduce(
        (sum, log) => sum + log.discountAmount,
        0,
      );
      const uniqueUsers = new Set(usageLogs.map((log) => log.userId)).size;

      return {
        code: promo.code,
        name: promo.name,
        status: promo.status,
        totalUsage: promo.usageCount,
        budgetAllocated: promo.marketingBudget,
        budgetUsed: promo.budgetUsed,
        budgetRemaining: promo.marketingBudget - promo.budgetUsed,
        budgetUtilization: (
          (promo.budgetUsed / promo.marketingBudget) *
          100
        ).toFixed(2),
        totalDiscount,
        uniqueUsers,
        averageDiscount: usageLogs.length
          ? (totalDiscount / usageLogs.length).toFixed(2)
          : 0,
        conversionRate: "15.2%", // Mock value - would calculate from actual data
        roi: "3.5x", // Mock value - would calculate from actual revenue data
      };
    }

    // Overall statistics
    const activePromos = promoCodes.filter((p) => p.status === "active").length;
    const totalBudget = promoCodes.reduce(
      (sum, p) => sum + p.marketingBudget,
      0,
    );
    const totalUsed = promoCodes.reduce((sum, p) => sum + p.budgetUsed, 0);
    const totalUsage = promoCodes.reduce((sum, p) => sum + p.usageCount, 0);

    return {
      totalPromoCodes: promoCodes.length,
      activePromoCodes: activePromos,
      totalBudget,
      totalBudgetUsed: totalUsed,
      totalBudgetRemaining: totalBudget - totalUsed,
      budgetUtilization: ((totalUsed / totalBudget) * 100).toFixed(2),
      totalUsage,
      uniqueUsers: new Set(promoUsageLog.map((log) => log.userId)).size,
      averageDiscountPerUse: totalUsage
        ? (totalUsed / totalUsage).toFixed(2)
        : 0,
    };
  }

  /**
   * Get usage logs with filters
   */
  static getUsageLogs(filters = {}) {
    let logs = [...promoUsageLog];

    if (filters.promoCode) {
      logs = logs.filter((log) =>
        log.promoCode.toLowerCase().includes(filters.promoCode.toLowerCase()),
      );
    }

    if (filters.userId) {
      logs = logs.filter((log) => log.userId === filters.userId);
    }

    if (filters.startDate) {
      logs = logs.filter(
        (log) => new Date(log.timestamp) >= new Date(filters.startDate),
      );
    }

    if (filters.endDate) {
      logs = logs.filter(
        (log) => new Date(log.timestamp) <= new Date(filters.endDate),
      );
    }

    if (filters.bookingType) {
      logs = logs.filter(
        (log) => log.bookingDetails.type === filters.bookingType,
      );
    }

    // Sort by timestamp (newest first)
    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return logs;
  }

  /**
   * Administrative functions
   */
  static createPromoCode(promoData) {
    const newPromo = {
      id: `promo_${Date.now()}`,
      ...promoData,
      budgetUsed: 0,
      usageCount: 0,
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    promoCodes.push(newPromo);
    return newPromo;
  }

  static updatePromoCode(promoId, updateData) {
    const promoIndex = promoCodes.findIndex((p) => p.id === promoId);
    if (promoIndex === -1) return null;

    promoCodes[promoIndex] = {
      ...promoCodes[promoIndex],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    return promoCodes[promoIndex];
  }

  static deletePromoCode(promoId) {
    const promoIndex = promoCodes.findIndex((p) => p.id === promoId);
    if (promoIndex === -1) return false;

    promoCodes.splice(promoIndex, 1);
    return true;
  }

  static getAllPromoCodes() {
    return promoCodes;
  }
}

// Middleware functions
const validatePromoCode = (req, res, next) => {
  try {
    const { promoCode, bookingDetails } = req.body;
    const userId = req.user?.id;

    if (!promoCode || !bookingDetails) {
      return res.status(400).json({
        success: false,
        message: "Promo code and booking details are required",
      });
    }

    const validation = PromoCodeValidator.validatePromoCode(
      promoCode,
      bookingDetails,
      userId,
    );

    req.promoValidation = validation;

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
        errors: validation.errors,
      });
    }

    next();
  } catch (error) {
    console.error("Promo validation error:", error);
    res.status(500).json({
      success: false,
      message: "Promo code validation failed",
    });
  }
};

const trackPromoUsage = async (req, res, next) => {
  try {
    if (req.promoValidation && req.promoValidation.isValid) {
      const { promoCode, bookingDetails } = req.body;
      const userId = req.user?.id;
      const sessionId = req.sessionId || `session_${Date.now()}`;

      const usageEntry = await PromoCodeValidator.recordUsage(
        promoCode,
        userId,
        bookingDetails,
        req.promoValidation.discountAmount,
        sessionId,
      );

      // Audit log
      await audit.userAction(req, "promo_code_used", {
        promoCode,
        discountAmount: req.promoValidation.discountAmount,
        bookingType: bookingDetails.type,
        usageId: usageEntry.id,
      });

      req.promoUsage = usageEntry;
    }

    next();
  } catch (error) {
    console.error("Promo usage tracking error:", error);
    // Don't fail the request if usage tracking fails
    next();
  }
};

const checkBudgetLimits = (req, res, next) => {
  try {
    // Check overall budget limits and send alerts if needed
    const stats = PromoCodeValidator.getPromoStatistics();
    const budgetUtilization = parseFloat(stats.budgetUtilization);

    // Alert if budget utilization is high
    if (budgetUtilization > 90) {
      console.warn(`High budget utilization: ${budgetUtilization}%`);
      // Send notification to admin (implement notification service)
    }

    // Check individual promo codes for budget exhaustion
    const exhaustedPromos = PromoCodeValidator.getAllPromoCodes().filter(
      (p) => p.status === "exhausted",
    );

    if (exhaustedPromos.length > 0) {
      console.info(`${exhaustedPromos.length} promo codes have been exhausted`);
      // Send notification about exhausted promos
    }

    next();
  } catch (error) {
    console.error("Budget check error:", error);
    next();
  }
};

// Initialize promo codes on module load
PromoCodeValidator.initializePromoCodes();

module.exports = {
  PromoCodeValidator,
  validatePromoCode,
  trackPromoUsage,
  checkBudgetLimits,
};
