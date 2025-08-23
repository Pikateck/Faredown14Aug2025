const express = require("express");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");
const router = express.Router();

// Import metrics module
const {
  createMetricsMiddleware,
  recordFallback,
  recordOfferabilityTime,
  recordModelInferenceTime,
} = require("./metrics");

// Apply metrics middleware to all routes
router.use(createMetricsMiddleware());

// Database connection
const pgPool = require("../database/connection");
const redisClient = require("../services/redisHotCache");

// Rate limiting middleware (production)
const rateLimit = require("express-rate-limit");
const sessionRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 requests per windowMs
  message: { error: "Too many session requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

// ECDSA key for capsule signing
const ECDSA_PRIVATE_KEY =
  process.env.ECDSA_PRIVATE_KEY ||
  crypto.generateKeyPairSync("ec", { namedCurve: "secp256k1" }).privateKey;

// Policy engine with in-memory caching
class OfferabilityEngine {
  constructor() {
    this.policyCache = new Map();
    this.lastPolicyLoad = 0;
    this.CACHE_TTL = 300000; // 5 minutes
  }

  async loadPolicies() {
    const now = Date.now();
    if (now - this.lastPolicyLoad < this.CACHE_TTL) return;

    try {
      const result = await pgPool.query(`
        SELECT policy_id, policy_dsl, conditions, is_active 
        FROM ai.policies 
        WHERE is_active = true
      `);

      this.policyCache.clear();
      result.rows.forEach((policy) => {
        this.policyCache.set(policy.policy_id, {
          dsl: policy.policy_dsl,
          conditions: policy.conditions,
          compiled: this.compilePolicyDSL(policy.policy_dsl),
        });
      });

      this.lastPolicyLoad = now;
      console.log(`Loaded ${result.rows.length} active policies`);
    } catch (error) {
      console.error("Failed to load policies:", error);
      throw error;
    }
  }

  compilePolicyDSL(dsl) {
    // Simple DSL compiler for policy evaluation
    return new Function(
      "context",
      `
      with (context) {
        return ${dsl.replace(/and/g, "&&").replace(/or/g, "||")};
      }
    `,
    );
  }

  async evaluateOfferability(context) {
    const startTime = Date.now();

    try {
      await this.loadPolicies();

      for (const [policyId, policy] of this.policyCache) {
        try {
          if (!policy.compiled(context)) {
            recordOfferabilityTime(Date.now() - startTime);
            return {
              offerable: false,
              reason: `Policy ${policyId} failed`,
              policy_id: policyId,
            };
          }
        } catch (error) {
          console.error(`Policy ${policyId} evaluation error:`, error);
          recordOfferabilityTime(Date.now() - startTime);
          return {
            offerable: false,
            reason: "Policy evaluation error",
            policy_id: policyId,
          };
        }
      }

      recordOfferabilityTime(Date.now() - startTime);
      return { offerable: true, reason: "All policies passed" };
    } catch (error) {
      recordOfferabilityTime(Date.now() - startTime);
      throw error;
    }
  }
}

const offerabilityEngine = new OfferabilityEngine();

// Model inference wrapper with metrics
async function runModelInference(modelType, features) {
  const startTime = Date.now();

  try {
    // Get active model from registry
    const modelResult = await pgPool.query(
      `
      SELECT model_config, endpoint_url 
      FROM ai.model_registry 
      WHERE model_type = $1 AND is_active = true 
      ORDER BY created_at DESC 
      LIMIT 1
    `,
      [modelType],
    );

    if (modelResult.rows.length === 0) {
      throw new Error(`No active model found for type: ${modelType}`);
    }

    const { model_config, endpoint_url } = modelResult.rows[0];

    // Simple pricing model simulation (replace with actual ML inference)
    let prediction;
    if (modelType === "pricing") {
      const basePrice = features.displayed_price;
      const userTierMultiplier =
        features.user_tier === "PLATINUM"
          ? 0.95
          : features.user_tier === "GOLD"
            ? 0.92
            : features.user_tier === "SILVER"
              ? 0.9
              : 0.88;

      prediction = {
        counter_price: Math.round(basePrice * userTierMultiplier * 100) / 100,
        confidence: 0.87,
        model_version: model_config.version || "v1.0",
      };
    } else {
      prediction = { result: "default" };
    }

    recordModelInferenceTime(Date.now() - startTime);
    return prediction;
  } catch (error) {
    recordModelInferenceTime(Date.now() - startTime);
    throw error;
  }
}

// Generate ECDSA signature for audit trail
function generateCapsuleSignature(sessionData) {
  const dataString = JSON.stringify(
    sessionData,
    Object.keys(sessionData).sort(),
  );
  const sign = crypto.createSign("SHA256");
  sign.update(dataString);
  sign.end();
  return sign.sign(ECDSA_PRIVATE_KEY, "hex");
}

// Circuit breaker for external dependencies
class CircuitBreaker {
  constructor(threshold = 5, timeout = 60000) {
    this.failureCount = 0;
    this.threshold = threshold;
    this.timeout = timeout;
    this.state = "CLOSED"; // CLOSED, OPEN, HALF_OPEN
    this.nextAttempt = Date.now();
  }

  async execute(operation) {
    if (this.state === "OPEN") {
      if (Date.now() < this.nextAttempt) {
        throw new Error("Circuit breaker is OPEN");
      }
      this.state = "HALF_OPEN";
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    this.state = "CLOSED";
  }

  onFailure() {
    this.failureCount++;
    if (this.failureCount >= this.threshold) {
      this.state = "OPEN";
      this.nextAttempt = Date.now() + this.timeout;
    }
  }
}

const supplierCircuitBreaker = new CircuitBreaker();

// Helper to get rate with fallback
async function getRateWithFallback(canonicalKey, userContext) {
  try {
    // Try Redis first
    const cachedRate = await redisClient.get(`rates:${canonicalKey}`);
    if (cachedRate) {
      return JSON.parse(cachedRate);
    }

    // Try database with circuit breaker
    const rate = await supplierCircuitBreaker.execute(async () => {
      const result = await pgPool.query(
        `
        SELECT rate_data, true_cost_usd, supplier_id, updated_at
        FROM ai.supplier_rates 
        WHERE canonical_key = $1 
        ORDER BY updated_at DESC 
        LIMIT 1
      `,
        [canonicalKey],
      );

      if (result.rows.length === 0) {
        throw new Error("Rate not found");
      }

      return result.rows[0];
    });

    return rate;
  } catch (error) {
    console.error("Rate fetch failed, using fallback:", error);

    // Record fallback reason
    if (error.message.includes("Circuit breaker")) {
      recordFallback("CIRCUIT_OPEN");
    } else if (error.message.includes("Rate not found")) {
      recordFallback("RATE_NOT_FOUND");
    } else {
      recordFallback("RATE_STALE");
    }

    // Return default fallback rate
    return {
      rate_data: { base_price: userContext.displayed_price },
      true_cost_usd: userContext.displayed_price * 0.75,
      supplier_id: "fallback",
      updated_at: new Date(),
    };
  }
}

// POST /session/start - Initialize bargaining session
router.post("/session/start", sessionRateLimit, async (req, res) => {
  const startTime = Date.now();

  try {
    const { user, productCPO } = req.body;

    if (!user?.id || !productCPO?.canonical_key) {
      return res.status(400).json({
        error: "Missing required fields: user.id, productCPO.canonical_key",
      });
    }

    const sessionId = uuidv4();

    // Evaluate offerability
    const offerabilityContext = {
      user_tier: user.tier || "BRONZE",
      product_type: productCPO.type,
      displayed_price: productCPO.displayed_price,
      currency: productCPO.currency || "USD",
    };

    const offerabilityResult =
      await offerabilityEngine.evaluateOfferability(offerabilityContext);

    if (!offerabilityResult.offerable) {
      return res.status(403).json({
        error: "Product not eligible for bargaining",
        reason: offerabilityResult.reason,
        session_id: sessionId,
      });
    }

    // Get current rate
    const rateData = await getRateWithFallback(
      productCPO.canonical_key,
      productCPO,
    );

    // Initialize session in database
    await pgPool.query(
      `
      INSERT INTO ai.bargain_sessions (
        session_id, user_id, product_cpo, displayed_price, 
        true_cost_usd, supplier_id, created_at, status
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), 'active')
    `,
      [
        sessionId,
        user.id,
        JSON.stringify(productCPO),
        productCPO.displayed_price,
        rateData.true_cost_usd,
        rateData.supplier_id,
      ],
    );

    // Cache session data in Redis
    const sessionData = {
      session_id: sessionId,
      user_id: user.id,
      user_tier: user.tier,
      product_cpo: productCPO,
      true_cost_usd: rateData.true_cost_usd,
      created_at: new Date().toISOString(),
    };

    await redisClient.setex(
      `session:${sessionId}`,
      1800,
      JSON.stringify(sessionData),
    ); // 30min TTL

    const responseTime = Date.now() - startTime;

    res.json({
      session_id: sessionId,
      initial_price: productCPO.displayed_price,
      bargain_eligible: true,
      offerability_reason: offerabilityResult.reason,
      response_time_ms: responseTime,
    });
  } catch (error) {
    console.error("Session start error:", error);
    res.status(500).json({
      error: "Failed to start bargaining session",
      session_id: null,
    });
  }
});

// POST /session/offer - Process user offer and generate counter
router.post("/session/offer", async (req, res) => {
  try {
    const { session_id, user_offer } = req.body;

    if (!session_id || !user_offer) {
      return res.status(400).json({
        error: "Missing required fields: session_id, user_offer",
      });
    }

    // Get session data
    const cachedSession = await redisClient.get(`session:${session_id}`);
    if (!cachedSession) {
      return res.status(404).json({
        error: "Session not found or expired",
      });
    }

    const sessionData = JSON.parse(cachedSession);

    // Prepare features for model inference
    const features = {
      user_offer: user_offer,
      displayed_price: sessionData.product_cpo.displayed_price,
      true_cost_usd: sessionData.true_cost_usd,
      user_tier: sessionData.user_tier,
      product_type: sessionData.product_cpo.type,
      session_history: [], // Could include previous offers
    };

    // Run pricing model inference
    const modelPrediction = await runModelInference("pricing", features);

    const counterPrice = modelPrediction.counter_price;
    const confidence = modelPrediction.confidence;

    // Log bargain event
    await pgPool.query(
      `
      INSERT INTO ai.bargain_events (
        session_id, user_offer, counter_price, model_confidence,
        true_cost_usd, created_at, accepted
      ) VALUES ($1, $2, $3, $4, $5, NOW(), false)
    `,
      [
        session_id,
        user_offer,
        counterPrice,
        confidence,
        sessionData.true_cost_usd,
      ],
    );

    res.json({
      session_id: session_id,
      user_offer: user_offer,
      counter_price: counterPrice,
      confidence: confidence,
      model_version: modelPrediction.model_version,
    });
  } catch (error) {
    console.error("Offer processing error:", error);
    res.status(500).json({
      error: "Failed to process offer",
    });
  }
});

// POST /session/accept - Accept final negotiated price
router.post("/session/accept", async (req, res) => {
  try {
    const { session_id } = req.body;

    if (!session_id) {
      return res.status(400).json({
        error: "Missing required field: session_id",
      });
    }

    // Get latest counter price
    const eventResult = await pgPool.query(
      `
      SELECT counter_price, true_cost_usd 
      FROM ai.bargain_events 
      WHERE session_id = $1 
      ORDER BY created_at DESC 
      LIMIT 1
    `,
      [session_id],
    );

    if (eventResult.rows.length === 0) {
      return res.status(404).json({
        error: "No bargain events found for session",
      });
    }

    const { counter_price: finalPrice, true_cost_usd } = eventResult.rows[0];

    // NEVER-LOSS ENFORCEMENT - Critical business rule
    try {
      await pgPool.query("SELECT ai.assert_never_loss($1, $2)", [
        session_id,
        finalPrice,
      ]);
    } catch (neverLossError) {
      console.error("Never-loss violation:", neverLossError);
      return res.status(409).json({
        error: "Never-loss violation detected",
        code: "NEVER_LOSS_VIOLATION",
        details: "Final price below cost threshold",
      });
    }

    // Mark as accepted
    await pgPool.query(
      `
      UPDATE ai.bargain_events 
      SET accepted = true, accepted_at = NOW() 
      WHERE session_id = $1 
      AND counter_price = $2
    `,
      [session_id, finalPrice],
    );

    // Update session status
    await pgPool.query(
      `
      UPDATE ai.bargain_sessions 
      SET status = 'completed', final_price = $2, completed_at = NOW() 
      WHERE session_id = $1
    `,
      [session_id, finalPrice],
    );

    // Generate audit capsule with ECDSA signature
    const auditCapsule = {
      session_id: session_id,
      final_price: finalPrice,
      true_cost_usd: true_cost_usd,
      accepted_at: new Date().toISOString(),
      profit_margin: (
        ((finalPrice - true_cost_usd) / finalPrice) *
        100
      ).toFixed(2),
    };

    const capsuleSignature = generateCapsuleSignature(auditCapsule);

    // Clear session from Redis
    await redisClient.del(`session:${session_id}`);

    res.json({
      session_id: session_id,
      final_price: finalPrice,
      status: "accepted",
      profit_margin_pct: auditCapsule.profit_margin,
      audit_signature: capsuleSignature,
      accepted_at: auditCapsule.accepted_at,
    });
  } catch (error) {
    console.error("Accept processing error:", error);
    res.status(500).json({
      error: "Failed to accept bargain",
    });
  }
});

// GET /session/:session_id/status - Get session status
router.get("/session/:session_id/status", async (req, res) => {
  try {
    const { session_id } = req.params;

    // Check Redis first
    const cachedSession = await redisClient.get(`session:${session_id}`);
    if (cachedSession) {
      const sessionData = JSON.parse(cachedSession);
      return res.json({
        session_id: session_id,
        status: "active",
        created_at: sessionData.created_at,
        product_cpo: sessionData.product_cpo,
      });
    }

    // Check database
    const result = await pgPool.query(
      `
      SELECT status, created_at, completed_at, final_price, product_cpo
      FROM ai.bargain_sessions 
      WHERE session_id = $1
    `,
      [session_id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Session not found",
      });
    }

    res.json({
      session_id: session_id,
      ...result.rows[0],
    });
  } catch (error) {
    console.error("Status check error:", error);
    res.status(500).json({
      error: "Failed to get session status",
    });
  }
});

module.exports = router;
