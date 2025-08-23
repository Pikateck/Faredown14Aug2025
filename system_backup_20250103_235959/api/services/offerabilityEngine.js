/**
 * Offerability Engine
 * Fast feasible action set generation with sub-50ms performance
 * Ensures legal safety, margin safety, and supplier compliance
 */

const policyParser = require("./policyParser");
const cpoRepository = require("./cpoRepository");
const redisService = require("./redisService");
const winston = require("winston");

class OfferabilityEngine {
  constructor() {
    this.logger = winston.createLogger({
      level: "info",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} [${level.toUpperCase()}] [OFFERABILITY] ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ""}`;
        }),
      ),
      transports: [new winston.transports.Console()],
    });

    // Performance telemetry
    this.telemetry = {
      calls: 0,
      totalTime: 0,
      avgTime: 0,
      maxTime: 0,
      errors: 0,
    };
  }

  /**
   * Generate feasible action set for bargaining
   * Target: <50ms execution time
   */
  async generateFeasibleActions(context) {
    const startTime = Date.now();

    try {
      const {
        canonical_key,
        product_type,
        supplier_snapshots,
        user_profile,
        session_context,
        promo_code,
      } = context;

      // Step 1: Get parsed policy (cached, ~5ms)
      const policy = await policyParser.getParsedPolicy();

      // Step 2: Calculate true cost floor (cached snapshots, ~10ms)
      const costFloor = await this.calculateTrueCostFloor(
        canonical_key,
        supplier_snapshots,
        policy,
      );

      // Step 3: Apply policy rules and constraints (~5ms)
      const constraints = this.applyPolicyConstraints(
        product_type,
        policy,
        costFloor,
      );

      // Step 4: Apply supplier overrides (~2ms)
      const supplierConstraints = this.applySupplierOverrides(
        supplier_snapshots,
        policy,
        constraints,
      );

      // Step 5: Apply promo rules if applicable (~5ms)
      const promoConstraints = await this.applyPromoConstraints(
        promo_code,
        supplierConstraints,
        policy,
      );

      // Step 6: Apply user tier bonuses (~2ms)
      const userConstraints = this.applyUserTierConstraints(
        user_profile,
        promoConstraints,
        policy,
      );

      // Step 7: Generate final feasible action set (~5ms)
      const feasibleActions = this.generateActionSet(
        userConstraints,
        session_context,
      );

      // Step 8: Apply guardrails filter (~2ms)
      const safeActions = this.applyGuardrails(
        feasibleActions,
        policy,
        session_context,
      );

      const executionTime = Date.now() - startTime;
      this.updateTelemetry(executionTime, false);

      this.logger.info(`Feasible actions generated`, {
        canonical_key,
        product_type,
        execution_time_ms: executionTime,
        action_count: safeActions.actions.length,
        cost_floor: safeActions.cost_floor,
        policy_version: policy.version,
      });

      return safeActions;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.updateTelemetry(executionTime, true);

      this.logger.error("Failed to generate feasible actions:", error);
      throw error;
    }
  }

  /**
   * Calculate true cost floor from supplier snapshots
   */
  async calculateTrueCostFloor(canonical_key, supplier_snapshots, policy) {
    try {
      // Use provided snapshots or fetch from cache/repository
      let snapshots = supplier_snapshots;
      if (!snapshots || snapshots.length === 0) {
        snapshots = await cpoRepository.getSupplierSnapshots(canonical_key, 3);
      }

      if (snapshots.length === 0) {
        throw new Error("No supplier snapshots available for cost calculation");
      }

      // Find the best (lowest cost) available snapshot
      const availableSnapshots = snapshots.filter(
        (s) => s.inventory_state === "AVAILABLE",
      );
      const bestSnapshot =
        availableSnapshots.length > 0
          ? availableSnapshots.reduce((min, current) => {
              const minCost =
                parseFloat(min.net) +
                parseFloat(min.taxes || 0) +
                parseFloat(min.fees || 0);
              const currentCost =
                parseFloat(current.net) +
                parseFloat(current.taxes || 0) +
                parseFloat(current.fees || 0);
              return currentCost < minCost ? current : min;
            })
          : snapshots[0];

      const trueCost =
        parseFloat(bestSnapshot.net) +
        parseFloat(bestSnapshot.taxes || 0) +
        parseFloat(bestSnapshot.fees || 0);

      // Get product type for margin rules
      const productAttrs = await this.getProductAttributes(canonical_key);
      const productType = productAttrs?.product_type || "flight";

      const minMargin = policy.price_rules[productType]?.min_margin_usd || 5.0;
      const costFloor = trueCost + minMargin;

      return {
        true_cost: trueCost,
        min_margin: minMargin,
        cost_floor: costFloor,
        currency: bestSnapshot.currency,
        supplier_id: bestSnapshot.supplier_id,
        snapshot_at: bestSnapshot.snapshot_at,
      };
    } catch (error) {
      this.logger.error("Failed to calculate cost floor:", error);
      throw error;
    }
  }

  /**
   * Apply base policy constraints for product type
   */
  applyPolicyConstraints(product_type, policy, costFloor) {
    const rules = policy.price_rules[product_type];
    if (!rules) {
      throw new Error(
        `No policy rules found for product type: ${product_type}`,
      );
    }

    // Calculate price boundaries
    const min_price = costFloor.cost_floor;
    const max_discount_amount = costFloor.true_cost * rules.max_discount_pct;
    const max_price = min_price + max_discount_amount;

    return {
      min_price: min_price,
      max_price: max_price,
      max_discount_pct: rules.max_discount_pct,
      min_margin_usd: rules.min_margin_usd,
      hold_minutes: rules.hold_minutes,
      allow_perks: rules.allow_perks,
      allowed_perks: rules.allowed_perks || [],
      cost_floor: costFloor,
      product_type: product_type,
    };
  }

  /**
   * Apply supplier-specific overrides
   */
  applySupplierOverrides(supplier_snapshots, policy, constraints) {
    if (!supplier_snapshots || supplier_snapshots.length === 0) {
      return constraints;
    }

    const primarySnapshot = supplier_snapshots[0];
    const supplierId = primarySnapshot.supplier_id;

    // Get supplier code from ID (should be cached)
    const supplierCode = this.getSupplierCodeById(supplierId);
    const overrides = policy.supplier_overrides[supplierCode];

    if (!overrides) {
      return constraints;
    }

    // Apply supplier overrides
    const updatedConstraints = { ...constraints };

    if (overrides.max_discount_pct !== undefined) {
      const newMaxDiscount = Math.min(
        constraints.max_discount_pct,
        overrides.max_discount_pct,
      );
      updatedConstraints.max_discount_pct = newMaxDiscount;

      // Recalculate max price
      const maxDiscountAmount =
        constraints.cost_floor.true_cost * newMaxDiscount;
      updatedConstraints.max_price = constraints.min_price + maxDiscountAmount;
    }

    if (overrides.allow_perks !== undefined) {
      updatedConstraints.allow_perks = overrides.allow_perks;
      if (!overrides.allow_perks) {
        updatedConstraints.allowed_perks = [];
      }
    }

    return updatedConstraints;
  }

  /**
   * Apply promo code constraints
   */
  async applyPromoConstraints(promo_code, constraints, policy) {
    if (!promo_code) {
      return constraints;
    }

    try {
      // Get promo details from cache or database
      const promoDetails = await this.getPromoDetails(promo_code);
      if (!promoDetails || !promoDetails.active) {
        return constraints;
      }

      // Calculate maximum total discount including promo
      const maxTotalDiscountPct =
        policy.promo_rules.stacking.max_total_discount_pct;
      const maxTotalDiscountAmount =
        constraints.cost_floor.true_cost * maxTotalDiscountPct;

      // Ensure combined discounts don't exceed limits
      const adjustedMaxPrice = Math.min(
        constraints.max_price,
        constraints.min_price + maxTotalDiscountAmount,
      );

      return {
        ...constraints,
        max_price: adjustedMaxPrice,
        promo_applied: true,
        promo_code: promo_code,
        promo_details: promoDetails,
        max_total_discount_pct: maxTotalDiscountPct,
      };
    } catch (error) {
      this.logger.warn(
        "Failed to apply promo constraints, continuing without promo:",
        error,
      );
      return constraints;
    }
  }

  /**
   * Apply user tier bonuses
   */
  applyUserTierConstraints(user_profile, constraints, policy) {
    if (!user_profile || !user_profile.tier) {
      return constraints;
    }

    const tierBoost =
      policy.promo_rules.eligibility.loyalty_tier_boost[user_profile.tier];
    if (!tierBoost) {
      return constraints;
    }

    // Apply tier boost to discount limits
    const boostedMaxDiscountPct = constraints.max_discount_pct * tierBoost;
    const boostedMaxDiscountAmount =
      constraints.cost_floor.true_cost * boostedMaxDiscountPct;
    const boostedMaxPrice = constraints.min_price + boostedMaxDiscountAmount;

    return {
      ...constraints,
      max_price: Math.min(constraints.max_price, boostedMaxPrice),
      max_discount_pct: Math.min(
        constraints.max_discount_pct,
        boostedMaxDiscountPct,
      ),
      tier_boost_applied: true,
      tier_boost: tierBoost,
      user_tier: user_profile.tier,
    };
  }

  /**
   * Generate final action set with discrete price points and perks
   */
  generateActionSet(constraints, session_context) {
    const actions = [];

    // Generate price actions (5-10 discrete points for efficiency)
    const priceRange = constraints.max_price - constraints.min_price;
    const priceSteps = Math.min(10, Math.max(5, Math.floor(priceRange / 5))); // 5-10 steps

    for (let i = 0; i < priceSteps; i++) {
      const stepRatio = i / (priceSteps - 1);
      const price = constraints.min_price + priceRange * stepRatio;

      actions.push({
        type: "COUNTER_PRICE",
        price: Math.round(price * 100) / 100, // Round to 2 decimals
        currency: constraints.cost_floor.currency,
        margin_usd: price - constraints.cost_floor.true_cost,
        discount_pct:
          (constraints.max_price - price) / constraints.cost_floor.true_cost,
        score: null, // Will be populated by Bargain Brain
      });
    }

    // Generate perk actions if allowed
    if (constraints.allow_perks && constraints.allowed_perks.length > 0) {
      for (const perk of constraints.allowed_perks) {
        actions.push({
          type: "OFFER_PERK",
          perk_name: perk,
          price: constraints.min_price, // Perks offered at minimum price
          currency: constraints.cost_floor.currency,
          margin_usd: constraints.min_price - constraints.cost_floor.true_cost,
          discount_pct: 0,
          score: null,
        });
      }
    }

    // Generate hold action
    actions.push({
      type: "HOLD",
      hold_minutes: constraints.hold_minutes,
      price: constraints.min_price,
      currency: constraints.cost_floor.currency,
      margin_usd: constraints.min_price - constraints.cost_floor.true_cost,
      discount_pct: 0,
      score: null,
    });

    return {
      actions: actions,
      constraints: constraints,
      action_count: actions.length,
      min_price: constraints.min_price,
      max_price: constraints.max_price,
      cost_floor: constraints.cost_floor.cost_floor,
      allow_perks: constraints.allow_perks,
      max_rounds: session_context.round || 1,
    };
  }

  /**
   * Apply safety guardrails - fast array filter style
   */
  applyGuardrails(actionSet, policy, session_context) {
    const guardrails = policy.guardrails;

    // Filter actions that violate never-loss rule
    if (policy.global.never_loss) {
      actionSet.actions = actionSet.actions.filter(
        (action) => action.price >= actionSet.cost_floor,
      );
    }

    // Filter actions that exceed round limits
    const maxRounds = policy.global.max_rounds;
    if (session_context.round >= maxRounds) {
      // Only allow acceptance or rejection, no new counters
      actionSet.actions = actionSet.actions.filter(
        (action) =>
          action.type === "HOLD" || action.price === actionSet.min_price,
      );
    }

    // Check inventory staleness
    if (
      session_context.inventory_age_minutes >
      guardrails.abort_if_inventory_stale_minutes
    ) {
      this.logger.warn("Inventory stale, limiting actions");
      actionSet.actions = actionSet.actions.filter(
        (action) => action.type === "HOLD",
      );
    }

    // Apply performance budget constraint
    if (session_context.elapsed_ms > guardrails.abort_if_latency_ms_over) {
      this.logger.warn("Latency budget exceeded, using fast path");
      // Keep only 3 best actions for speed
      actionSet.actions = actionSet.actions.slice(0, 3);
    }

    return {
      ...actionSet,
      guardrails_applied: true,
      filtered_action_count: actionSet.actions.length,
    };
  }

  // ==========================================
  // HELPER METHODS
  // ==========================================

  /**
   * Get product attributes (cached)
   */
  async getProductAttributes(canonical_key) {
    try {
      // Try cache first
      const cached = await redisService.get(`product_attrs:${canonical_key}`);
      if (cached) {
        return cached;
      }

      // Fallback to repository
      const product = await cpoRepository.getCPO(canonical_key);
      if (product) {
        await redisService.set(`product_attrs:${canonical_key}`, product, 3600);
        return product;
      }

      return null;
    } catch (error) {
      this.logger.error("Failed to get product attributes:", error);
      return null;
    }
  }

  /**
   * Get supplier code by ID (should implement caching)
   */
  getSupplierCodeById(supplierId) {
    // This should be cached mapping, for now return based on common IDs
    const supplierMap = {
      1: "AMADEUS",
      2: "HOTELBEDS",
      3: "TBO",
      4: "AGODA",
    };

    return supplierMap[supplierId] || "UNKNOWN";
  }

  /**
   * Get promo details (cached)
   */
  async getPromoDetails(promo_code) {
    try {
      const cached = await redisService.get(`promo:${promo_code}`);
      if (cached) {
        return cached;
      }

      // This should query ai.promos table
      // For now, return mock structure
      return null;
    } catch (error) {
      this.logger.error("Failed to get promo details:", error);
      return null;
    }
  }

  /**
   * Update performance telemetry
   */
  updateTelemetry(executionTime, isError) {
    this.telemetry.calls++;
    if (isError) {
      this.telemetry.errors++;
    } else {
      this.telemetry.totalTime += executionTime;
      this.telemetry.avgTime =
        this.telemetry.totalTime /
        (this.telemetry.calls - this.telemetry.errors);
      this.telemetry.maxTime = Math.max(this.telemetry.maxTime, executionTime);
    }
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    return {
      ...this.telemetry,
      error_rate:
        this.telemetry.calls > 0
          ? this.telemetry.errors / this.telemetry.calls
          : 0,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Reset performance metrics
   */
  resetMetrics() {
    this.telemetry = {
      calls: 0,
      totalTime: 0,
      avgTime: 0,
      maxTime: 0,
      errors: 0,
    };
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const policy = await policyParser.getParsedPolicy();
      const policyMetrics = policyParser.getPolicyMetrics();

      return {
        status: "healthy",
        policy_version: policy.version,
        policy_cache_age_ms: policyMetrics.cache_age_ms,
        performance: this.getPerformanceMetrics(),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: "unhealthy",
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

// Export singleton instance
const offerabilityEngine = new OfferabilityEngine();

module.exports = offerabilityEngine;
