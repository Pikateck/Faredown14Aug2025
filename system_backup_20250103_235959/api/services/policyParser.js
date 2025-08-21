/**
 * Policy DSL Parser
 * Fast YAML policy parsing with caching for <300ms performance
 * Loads once per activation, cached in Redis + in-memory
 */

const yaml = require("js-yaml");
const redisService = require("./redisService");
const winston = require("winston");

class PolicyParser {
  constructor() {
    this.cachedPolicy = null;
    this.lastCacheTime = null;
    this.cacheValidityMs = 60000; // 1 minute cache validity

    this.logger = winston.createLogger({
      level: "info",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} [${level.toUpperCase()}] [POLICY_PARSER] ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ""}`;
        }),
      ),
      transports: [new winston.transports.Console()],
    });
  }

  /**
   * Get parsed policy with in-memory + Redis caching
   * Optimized for <30ms response time
   */
  async getParsedPolicy() {
    const now = Date.now();

    // Check in-memory cache first (fastest path)
    if (
      this.cachedPolicy &&
      this.lastCacheTime &&
      now - this.lastCacheTime < this.cacheValidityMs
    ) {
      return this.cachedPolicy;
    }

    try {
      // Try Redis cache (fast path)
      const redisPolicy = await redisService.getActivePolicy();
      if (redisPolicy && redisPolicy.parsed) {
        this.cachedPolicy = redisPolicy.parsed;
        this.lastCacheTime = now;
        return this.cachedPolicy;
      }

      // Parse from database (slow path - should be rare)
      this.logger.info("Policy not cached, parsing from database");
      const parsedPolicy = await this.parseAndCachePolicy();

      this.cachedPolicy = parsedPolicy;
      this.lastCacheTime = now;

      return parsedPolicy;
    } catch (error) {
      this.logger.error("Failed to get parsed policy:", error);

      // Return fallback policy to prevent service disruption
      return this.getFallbackPolicy();
    }
  }

  /**
   * Parse policy YAML and cache in Redis
   */
  async parseAndCachePolicy() {
    const { Pool } = require("pg");
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl:
        process.env.NODE_ENV === "production"
          ? { rejectUnauthorized: false }
          : false,
    });

    try {
      // Get active policy from database
      const result = await pool.query(
        "SELECT version, dsl_yaml, checksum, activated_at FROM ai.policies WHERE version = $1",
        ["v1"], // For now, always use v1
      );

      if (result.rows.length === 0) {
        throw new Error("No active policy found in database");
      }

      const policyRow = result.rows[0];
      const startTime = Date.now();

      // Parse YAML to JSON
      const parsedYaml = yaml.load(policyRow.dsl_yaml);
      const parseTime = Date.now() - startTime;

      // Transform to optimized structure for fast lookups
      const optimizedPolicy = this.optimizePolicyStructure(parsedYaml);

      // Cache in Redis with parsed structure
      await redisService.setActivePolicy({
        version: policyRow.version,
        yaml: policyRow.dsl_yaml,
        parsed: optimizedPolicy,
        checksum: policyRow.checksum,
        activated_at: policyRow.activated_at,
        parsed_at: new Date().toISOString(),
        parse_time_ms: parseTime,
      });

      this.logger.info(
        `Policy parsed and cached: ${policyRow.version} (${parseTime}ms)`,
      );

      await pool.end();
      return optimizedPolicy;
    } catch (error) {
      this.logger.error("Failed to parse and cache policy:", error);
      await pool.end();
      throw error;
    }
  }

  /**
   * Transform policy YAML into optimized lookup structure
   */
  optimizePolicyStructure(yamlPolicy) {
    const optimized = {
      version: yamlPolicy.version,
      global: {
        currency_base: yamlPolicy.global?.currency_base || "USD",
        exploration_pct: yamlPolicy.global?.exploration_pct || 0.08,
        max_rounds: yamlPolicy.global?.max_rounds || 3,
        response_budget_ms: yamlPolicy.global?.response_budget_ms || 300,
        never_loss: yamlPolicy.global?.never_loss !== false,
      },

      // Indexed by product type for O(1) lookup
      price_rules: {
        flight: {
          min_margin_usd: yamlPolicy.price_rules?.flight?.min_margin_usd || 6.0,
          max_discount_pct:
            yamlPolicy.price_rules?.flight?.max_discount_pct || 0.15,
          hold_minutes: yamlPolicy.price_rules?.flight?.hold_minutes || 10,
          allow_perks: yamlPolicy.price_rules?.flight?.allow_perks || false,
          allowed_perks: yamlPolicy.price_rules?.flight?.allowed_perks || [],
        },
        hotel: {
          min_margin_usd: yamlPolicy.price_rules?.hotel?.min_margin_usd || 4.0,
          max_discount_pct:
            yamlPolicy.price_rules?.hotel?.max_discount_pct || 0.2,
          hold_minutes: yamlPolicy.price_rules?.hotel?.hold_minutes || 15,
          allow_perks: yamlPolicy.price_rules?.hotel?.allow_perks !== false,
          allowed_perks: yamlPolicy.price_rules?.hotel?.allowed_perks || [
            "Late checkout",
            "Free breakfast",
          ],
        },
        sightseeing: {
          min_margin_usd:
            yamlPolicy.price_rules?.sightseeing?.min_margin_usd || 3.0,
          max_discount_pct:
            yamlPolicy.price_rules?.sightseeing?.max_discount_pct || 0.25,
          hold_minutes: yamlPolicy.price_rules?.sightseeing?.hold_minutes || 5,
          allow_perks:
            yamlPolicy.price_rules?.sightseeing?.allow_perks !== false,
          allowed_perks: yamlPolicy.price_rules?.sightseeing?.allowed_perks || [
            "Skip the line",
            "Free guide",
          ],
        },
      },

      // Indexed by supplier code for O(1) lookup
      supplier_overrides: this.indexSupplierOverrides(
        yamlPolicy.supplier_overrides || {},
      ),

      // Promo rules for stacking validation
      promo_rules: {
        stacking: {
          max_total_discount_pct:
            yamlPolicy.promo_rules?.stacking?.max_total_discount_pct || 0.25,
        },
        eligibility: {
          loyalty_tier_boost: yamlPolicy.promo_rules?.eligibility
            ?.loyalty_tier_boost || {
            GOLD: 1.05,
            PLATINUM: 1.08,
          },
        },
      },

      // Guardrails for safety checks
      guardrails: {
        abort_if_inventory_stale_minutes:
          yamlPolicy.guardrails?.abort_if_inventory_stale_minutes || 5,
        abort_if_latency_ms_over:
          yamlPolicy.guardrails?.abort_if_latency_ms_over || 280,
      },

      // Explanation settings
      explanations: {
        include_floor: yamlPolicy.explanations?.include_floor !== false,
        include_policy: yamlPolicy.explanations?.include_policy !== false,
      },
    };

    return optimized;
  }

  /**
   * Index supplier overrides for fast lookup
   */
  indexSupplierOverrides(overrides) {
    const indexed = {};

    for (const [supplierCode, override] of Object.entries(overrides)) {
      indexed[supplierCode] = {
        max_discount_pct: override.max_discount_pct,
        allow_perks: override.allow_perks,
        min_margin_override: override.min_margin_override,
        custom_rules: override.custom_rules || {},
      };
    }

    return indexed;
  }

  /**
   * Get fallback policy for service continuity
   */
  getFallbackPolicy() {
    this.logger.warn("Using fallback policy due to parsing failure");

    return {
      version: "fallback",
      global: {
        currency_base: "USD",
        exploration_pct: 0.05, // Conservative exploration
        max_rounds: 2,
        response_budget_ms: 300,
        never_loss: true,
      },
      price_rules: {
        flight: {
          min_margin_usd: 10.0, // Higher margin for safety
          max_discount_pct: 0.1,
          hold_minutes: 5,
          allow_perks: false,
          allowed_perks: [],
        },
        hotel: {
          min_margin_usd: 8.0,
          max_discount_pct: 0.15,
          hold_minutes: 10,
          allow_perks: false,
          allowed_perks: [],
        },
        sightseeing: {
          min_margin_usd: 6.0,
          max_discount_pct: 0.15,
          hold_minutes: 5,
          allow_perks: false,
          allowed_perks: [],
        },
      },
      supplier_overrides: {},
      promo_rules: {
        stacking: { max_total_discount_pct: 0.15 },
        eligibility: { loyalty_tier_boost: {} },
      },
      guardrails: {
        abort_if_inventory_stale_minutes: 3,
        abort_if_latency_ms_over: 250,
      },
      explanations: {
        include_floor: false,
        include_policy: false,
      },
    };
  }

  /**
   * Validate policy structure
   */
  validatePolicyStructure(policy) {
    const errors = [];

    // Required sections
    if (!policy.global) errors.push("Missing global section");
    if (!policy.price_rules) errors.push("Missing price_rules section");
    if (!policy.guardrails) errors.push("Missing guardrails section");

    // Global validation
    if (policy.global) {
      if (policy.global.max_rounds < 1 || policy.global.max_rounds > 5) {
        errors.push("max_rounds must be between 1 and 5");
      }
      if (
        policy.global.response_budget_ms < 100 ||
        policy.global.response_budget_ms > 1000
      ) {
        errors.push("response_budget_ms must be between 100 and 1000");
      }
    }

    // Price rules validation
    if (policy.price_rules) {
      for (const [productType, rules] of Object.entries(policy.price_rules)) {
        if (rules.min_margin_usd < 0) {
          errors.push(`${productType}: min_margin_usd cannot be negative`);
        }
        if (rules.max_discount_pct < 0 || rules.max_discount_pct > 1) {
          errors.push(
            `${productType}: max_discount_pct must be between 0 and 1`,
          );
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors,
    };
  }

  /**
   * Refresh policy cache manually (for admin use)
   */
  async refreshPolicyCache() {
    try {
      this.cachedPolicy = null;
      this.lastCacheTime = null;

      const refreshedPolicy = await this.parseAndCachePolicy();

      this.logger.info("Policy cache refreshed successfully");
      return {
        success: true,
        version: refreshedPolicy.version,
        refreshed_at: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error("Failed to refresh policy cache:", error);
      return {
        success: false,
        error: error.message,
        refreshed_at: new Date().toISOString(),
      };
    }
  }

  /**
   * Get policy performance metrics
   */
  getPolicyMetrics() {
    return {
      cached_policy_version: this.cachedPolicy?.version || null,
      last_cache_time: this.lastCacheTime,
      cache_age_ms: this.lastCacheTime ? Date.now() - this.lastCacheTime : null,
      cache_validity_ms: this.cacheValidityMs,
      has_cached_policy: !!this.cachedPolicy,
    };
  }
}

// Export singleton instance
const policyParser = new PolicyParser();

module.exports = policyParser;
