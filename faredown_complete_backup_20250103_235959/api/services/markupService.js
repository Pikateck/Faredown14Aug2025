/**
 * Markup Service for Hotel Rates
 * Handles dynamic markup calculation based on admin configuration
 */

class MarkupService {
  constructor() {
    // Mock markup rules - in production, this would come from database
    this.markupRules = [
      {
        id: "1",
        type: "supplier",
        name: "Hotelbeds Default",
        supplierId: "hotelbeds",
        percentage: 12,
        fixedAmount: 0,
        minPercentage: 8,
        maxPercentage: 25,
        currency: "INR",
        active: true,
        priority: 1,
      },
      {
        id: "2",
        type: "city",
        name: "Dubai Premium",
        city: "Dubai",
        percentage: 15,
        fixedAmount: 0,
        minPercentage: 10,
        maxPercentage: 30,
        currency: "INR",
        active: true,
        priority: 2,
      },
      {
        id: "3",
        type: "star_rating",
        name: "5 Star Hotels",
        starRating: 5,
        percentage: 18,
        fixedAmount: 0,
        minPercentage: 15,
        maxPercentage: 35,
        currency: "INR",
        active: true,
        priority: 3,
      },
      {
        id: "4",
        type: "room_category",
        name: "Luxury Suites",
        roomCategory: "Suite",
        percentage: 20,
        fixedAmount: 0,
        minPercentage: 15,
        maxPercentage: 40,
        currency: "INR",
        active: true,
        priority: 4,
      },
    ];
  }

  /**
   * Apply markup to hotel rates
   */
  applyMarkup(hotelData, roomRates) {
    try {
      const applicableRules = this.getApplicableRules(hotelData);
      const finalRates = roomRates.map((room) => {
        const markedUpRoom = { ...room };

        if (room.rates && room.rates.length > 0) {
          markedUpRoom.rates = room.rates.map((rate) => {
            const rule = this.selectBestRule(applicableRules, hotelData, room);
            const markedUpRate = this.calculateMarkup(rate, rule);

            return {
              ...rate,
              originalNet: rate.net,
              originalTotal: rate.total || rate.net,
              net: markedUpRate.net,
              total: markedUpRate.total,
              markup: markedUpRate.markup,
              markupRule: rule
                ? {
                    id: rule.id,
                    name: rule.name,
                    type: rule.type,
                    percentage: rule.percentage,
                    amount: markedUpRate.markupAmount,
                  }
                : null,
            };
          });
        }

        return markedUpRoom;
      });

      return {
        originalRates: roomRates,
        markedUpRates: finalRates,
        markupSummary: this.generateMarkupSummary(finalRates),
      };
    } catch (error) {
      console.error("Error applying markup:", error);
      return {
        originalRates: roomRates,
        markedUpRates: roomRates,
        markupSummary: { totalMarkup: 0, averageMarkup: 0 },
      };
    }
  }

  /**
   * Get applicable markup rules for hotel
   */
  getApplicableRules(hotelData) {
    return this.markupRules
      .filter((rule) => {
        if (!rule.active) return false;

        switch (rule.type) {
          case "supplier":
            return rule.supplierId === hotelData.supplierId;

          case "city":
            return rule.city === hotelData.location?.city;

          case "star_rating":
            return rule.starRating === hotelData.starRating;

          case "room_category":
            return true; // Will be checked per room

          case "global":
            return true;

          default:
            return false;
        }
      })
      .sort((a, b) => b.priority - a.priority); // Higher priority first
  }

  /**
   * Select the best markup rule for a specific room
   */
  selectBestRule(applicableRules, hotelData, roomData) {
    // First, try to find room-specific rules
    const roomRule = applicableRules.find(
      (rule) =>
        rule.type === "room_category" &&
        rule.roomCategory === roomData.category,
    );

    if (roomRule) return roomRule;

    // Then try hotel-specific rules (star rating, city, etc.)
    const hotelRule = applicableRules.find(
      (rule) => rule.type !== "room_category",
    );

    if (hotelRule) return hotelRule;

    // Fallback to default rule if no specific rule found
    return this.getDefaultRule();
  }

  /**
   * Calculate markup for a specific rate
   */
  calculateMarkup(rate, rule) {
    if (!rule) {
      return {
        net: rate.net,
        total: rate.total || rate.net,
        markup: 0,
        markupAmount: 0,
      };
    }

    const netRate = parseFloat(rate.net) || 0;
    let markupAmount = 0;

    // Calculate markup amount
    if (rule.percentage > 0) {
      markupAmount = (netRate * rule.percentage) / 100;
    }

    if (rule.fixedAmount > 0) {
      markupAmount += rule.fixedAmount;
    }

    // Apply min/max constraints
    const minMarkup = rule.minPercentage
      ? (netRate * rule.minPercentage) / 100
      : 0;
    const maxMarkup = rule.maxPercentage
      ? (netRate * rule.maxPercentage) / 100
      : Infinity;

    markupAmount = Math.max(minMarkup, Math.min(maxMarkup, markupAmount));

    const finalNet = netRate + markupAmount;
    const finalTotal = finalNet; // Assuming no additional taxes for now

    return {
      net: Math.round(finalNet * 100) / 100,
      total: Math.round(finalTotal * 100) / 100,
      markup: rule.percentage,
      markupAmount: Math.round(markupAmount * 100) / 100,
    };
  }

  /**
   * Get default markup rule
   */
  getDefaultRule() {
    return {
      id: "default",
      name: "Default Markup",
      type: "global",
      percentage: 10,
      fixedAmount: 0,
      minPercentage: 5,
      maxPercentage: 25,
      currency: "INR",
      active: true,
      priority: 0,
    };
  }

  /**
   * Generate markup summary for all rooms
   */
  generateMarkupSummary(markedUpRates) {
    let totalMarkup = 0;
    let totalRates = 0;
    let roomCount = 0;

    markedUpRates.forEach((room) => {
      if (room.rates && room.rates.length > 0) {
        room.rates.forEach((rate) => {
          if (rate.markupAmount) {
            totalMarkup += rate.markupAmount;
            totalRates++;
          }
          roomCount++;
        });
      }
    });

    return {
      totalMarkup: Math.round(totalMarkup * 100) / 100,
      averageMarkup:
        totalRates > 0 ? Math.round((totalMarkup / totalRates) * 100) / 100 : 0,
      roomCount,
      rateCount: totalRates,
    };
  }

  /**
   * Add new markup rule
   */
  addMarkupRule(rule) {
    const newRule = {
      id: Date.now().toString(),
      active: true,
      priority: this.markupRules.length + 1,
      ...rule,
    };

    this.markupRules.push(newRule);
    return newRule;
  }

  /**
   * Update existing markup rule
   */
  updateMarkupRule(ruleId, updates) {
    const index = this.markupRules.findIndex((rule) => rule.id === ruleId);
    if (index !== -1) {
      this.markupRules[index] = { ...this.markupRules[index], ...updates };
      return this.markupRules[index];
    }
    return null;
  }

  /**
   * Delete markup rule
   */
  deleteMarkupRule(ruleId) {
    const index = this.markupRules.findIndex((rule) => rule.id === ruleId);
    if (index !== -1) {
      return this.markupRules.splice(index, 1)[0];
    }
    return null;
  }

  /**
   * Get all markup rules
   */
  getAllRules() {
    return this.markupRules.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Get markup rules by type
   */
  getRulesByType(type) {
    return this.markupRules.filter((rule) => rule.type === type);
  }

  /**
   * Validate markup rule
   */
  validateRule(rule) {
    const errors = [];

    if (!rule.name || rule.name.trim() === "") {
      errors.push("Rule name is required");
    }

    if (
      !rule.type ||
      !["supplier", "city", "star_rating", "room_category", "global"].includes(
        rule.type,
      )
    ) {
      errors.push("Valid rule type is required");
    }

    if (rule.percentage < 0 || rule.percentage > 100) {
      errors.push("Percentage must be between 0 and 100");
    }

    if (
      rule.minPercentage &&
      rule.maxPercentage &&
      rule.minPercentage > rule.maxPercentage
    ) {
      errors.push(
        "Minimum percentage cannot be greater than maximum percentage",
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Simulate markup calculation (for testing)
   */
  simulateMarkup(hotelData, roomRates, ruleOverrides = {}) {
    // Temporarily override rules for simulation
    const originalRules = [...this.markupRules];

    if (ruleOverrides.tempRule) {
      this.markupRules.unshift(ruleOverrides.tempRule);
    }

    const result = this.applyMarkup(hotelData, roomRates);

    // Restore original rules
    this.markupRules = originalRules;

    return result;
  }

  /**
   * Get markup statistics
   */
  getMarkupStats() {
    const activeRules = this.markupRules.filter((rule) => rule.active);
    const typeStats = {};

    activeRules.forEach((rule) => {
      if (!typeStats[rule.type]) {
        typeStats[rule.type] = {
          count: 0,
          avgPercentage: 0,
          totalPercentage: 0,
        };
      }
      typeStats[rule.type].count++;
      typeStats[rule.type].totalPercentage += rule.percentage;
    });

    // Calculate averages
    Object.keys(typeStats).forEach((type) => {
      typeStats[type].avgPercentage =
        Math.round(
          (typeStats[type].totalPercentage / typeStats[type].count) * 100,
        ) / 100;
    });

    return {
      totalRules: this.markupRules.length,
      activeRules: activeRules.length,
      inactiveRules: this.markupRules.length - activeRules.length,
      typeStats,
      averageMarkup:
        activeRules.length > 0
          ? Math.round(
              (activeRules.reduce((sum, rule) => sum + rule.percentage, 0) /
                activeRules.length) *
                100,
            ) / 100
          : 0,
    };
  }
}

module.exports = new MarkupService();
