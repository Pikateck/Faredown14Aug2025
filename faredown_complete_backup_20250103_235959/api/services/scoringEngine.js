/**
 * Scoring Engine
 * Fast Expected Profit × Acceptance probability calculation
 * Target: 3-8ms model inference + 1-2ms scoring
 */

const winston = require("winston");

class ScoringEngine {
  constructor() {
    this.logger = winston.createLogger({
      level: "info",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} [${level.toUpperCase()}] [SCORING] ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ""}`;
        }),
      ),
      transports: [new winston.transports.Console()],
    });

    // Preloaded model (in production, load ONNX/sklearn model here)
    this.propensityModel = new MockPropensityModel();

    // Performance tracking
    this.telemetry = {
      total_calls: 0,
      total_time_ms: 0,
      avg_time_ms: 0,
      feature_prep_time: 0,
      inference_time: 0,
      scoring_time: 0,
    };
  }

  /**
   * Score all candidate actions for expected profit
   * Returns scored actions sorted by expected profit (highest first)
   */
  async scoreCandidates(context, feasibleActions) {
    const startTime = Date.now();

    try {
      const {
        canonical_key,
        product_type,
        user_profile,
        session_context,
        supplier_snapshots,
      } = context;

      // Step 1: Prepare features for all candidates (1-2ms)
      const featurePrepStart = Date.now();
      const baseFeatures = this.prepareBaseFeatures(context);
      const featurePrepTime = Date.now() - featurePrepStart;

      // Step 2: Prepare candidate-specific features (1ms)
      const candidates = feasibleActions.actions.map((action) => ({
        ...action,
        true_cost: this.calculateTrueCost(action, supplier_snapshots),
        features: this.prepareCandidateFeatures(
          action,
          baseFeatures,
          feasibleActions,
        ),
      }));

      // Step 3: Batch model inference (3-8ms)
      const inferenceStart = Date.now();
      const featureMatrix = candidates.map((c) => c.features);
      const acceptanceProbabilities =
        await this.propensityModel.predictBatch(featureMatrix);
      const inferenceTime = Date.now() - inferenceStart;

      // Step 4: Calculate expected profit and score (1-2ms)
      const scoringStart = Date.now();
      const scoredCandidates = candidates.map((candidate, index) => {
        const acceptProb = acceptanceProbabilities[index];
        const profit = this.calculateProfit(candidate, context);
        const expectedProfit = profit * acceptProb;

        return {
          ...candidate,
          accept_prob: acceptProb,
          profit_usd: profit,
          expected_profit: expectedProfit,
          confidence: this.calculateConfidence(candidate, baseFeatures),
        };
      });

      // Sort by expected profit (highest first)
      scoredCandidates.sort((a, b) => b.expected_profit - a.expected_profit);
      const scoringTime = Date.now() - scoringStart;

      const totalTime = Date.now() - startTime;
      this.updateTelemetry(
        totalTime,
        featurePrepTime,
        inferenceTime,
        scoringTime,
      );

      this.logger.info("Candidates scored successfully", {
        canonical_key,
        candidate_count: scoredCandidates.length,
        best_expected_profit: scoredCandidates[0]?.expected_profit,
        best_accept_prob: scoredCandidates[0]?.accept_prob,
        execution_time_ms: totalTime,
      });

      return {
        scored_candidates: scoredCandidates,
        best_candidate: scoredCandidates[0],
        performance: {
          total_time_ms: totalTime,
          feature_prep_ms: featurePrepTime,
          inference_ms: inferenceTime,
          scoring_ms: scoringTime,
        },
      };
    } catch (error) {
      this.logger.error("Failed to score candidates:", error);
      throw error;
    }
  }

  /**
   * Prepare base features shared across all candidates
   */
  prepareBaseFeatures(context) {
    const { user_profile, session_context, product_type, supplier_snapshots } =
      context;

    // Device and session features
    const deviceType = session_context.device_type || "desktop";
    const deviceScore = deviceType === "mobile" ? 1.0 : 0.0;

    // User tier features
    const tierMapping = { PLATINUM: 3, GOLD: 2, SILVER: 1 };
    const tierScore = tierMapping[user_profile?.tier] || 0;

    // User style features
    const styleMapping = { generous: 3, persistent: 2, cautious: 1 };
    const styleScore = styleMapping[user_profile?.style] || 1;

    // Session context features
    const roundNumber = session_context.round || 1;
    const sessionAge = session_context.elapsed_ms || 0;

    // Product type features
    const productTypeMapping = { flight: 1, hotel: 2, sightseeing: 3 };
    const productTypeScore = productTypeMapping[product_type] || 1;

    // Time-based features
    const currentHour = new Date().getHours();
    const isWeekend = new Date().getDay() % 6 === 0 ? 1.0 : 0.0;

    // Demand features (from product features if available)
    const demandScore = context.product_features?.demand_score || 0.5;
    const compPressure = context.product_features?.comp_pressure || 0.5;

    return [
      deviceScore, // 0: device type
      tierScore, // 1: user tier
      styleScore, // 2: user style
      roundNumber, // 3: bargain round
      sessionAge / 1000, // 4: session age in seconds
      productTypeScore, // 5: product type
      currentHour / 24, // 6: hour of day (normalized)
      isWeekend, // 7: weekend flag
      demandScore, // 8: demand score
      compPressure, // 9: competitive pressure
    ];
  }

  /**
   * Prepare candidate-specific features
   */
  prepareCandidateFeatures(action, baseFeatures, feasibleActions) {
    // Discount depth (key feature for acceptance)
    const maxPrice = feasibleActions.max_price;
    const minPrice = feasibleActions.min_price;
    const priceRange = maxPrice - minPrice;
    const discountDepth =
      priceRange > 0 ? (maxPrice - action.price) / priceRange : 0;

    // Relative position in price range
    const pricePosition =
      priceRange > 0 ? (action.price - minPrice) / priceRange : 0.5;

    // Action type features
    const actionTypeMapping = { COUNTER_PRICE: 1, OFFER_PERK: 2, HOLD: 3 };
    const actionTypeScore = actionTypeMapping[action.type] || 1;

    // Perk features
    const hasPerk = action.perk_name ? 1.0 : 0.0;
    const perkValue = this.estimatePerkValue(action.perk_name);

    // Margin features
    const marginRatio = action.margin_usd / action.price;

    // Combine base features with candidate-specific features
    return [
      ...baseFeatures, // 0-9: base features
      discountDepth, // 10: discount depth (0-1)
      pricePosition, // 11: price position in range
      actionTypeScore, // 12: action type
      hasPerk, // 13: has perk flag
      perkValue, // 14: estimated perk value
      marginRatio, // 15: margin ratio
      action.price / 100, // 16: price (scaled)
    ];
  }

  /**
   * Calculate true cost including perk costs
   */
  calculateTrueCost(action, supplier_snapshots) {
    const snapshot = supplier_snapshots?.[0];
    if (!snapshot) return 0;

    const baseCost =
      parseFloat(snapshot.net) +
      parseFloat(snapshot.taxes || 0) +
      parseFloat(snapshot.fees || 0);

    // Add perk cost if applicable
    const perkCost = action.perk_name ? this.getPerkCost(action.perk_name) : 0;

    return baseCost + perkCost;
  }

  /**
   * Calculate profit for a candidate action
   */
  calculateProfit(candidate, context) {
    const revenue = candidate.price;
    const trueCost = candidate.true_cost;
    const profit = revenue - trueCost;

    return Math.max(0, profit); // Ensure non-negative profit
  }

  /**
   * Calculate confidence score for the prediction
   */
  calculateConfidence(candidate, baseFeatures) {
    // Higher confidence for:
    // - Standard price actions vs perks
    // - Mid-range discounts vs extreme discounts
    // - Established user patterns

    let confidence = 0.7; // Base confidence

    // Action type confidence
    if (candidate.type === "COUNTER_PRICE") confidence += 0.1;
    if (candidate.type === "OFFER_PERK") confidence -= 0.05;

    // User tier confidence (more data for higher tiers)
    const tierScore = baseFeatures[1];
    confidence += tierScore * 0.05;

    // Discount depth confidence (mid-range more predictable)
    const discountDepth = baseFeatures[10] || 0;
    if (discountDepth > 0.2 && discountDepth < 0.8) {
      confidence += 0.1;
    } else {
      confidence -= 0.05;
    }

    return Math.min(1.0, Math.max(0.1, confidence));
  }

  /**
   * Estimate perk value in USD
   */
  estimatePerkValue(perkName) {
    const perkValues = {
      "Free breakfast": 15.0,
      "Late checkout": 8.0,
      "Skip the line": 5.0,
      "Free guide": 12.0,
      "Priority boarding": 10.0,
    };

    return perkValues[perkName] || 0;
  }

  /**
   * Get perk cost for profit calculation
   */
  getPerkCost(perkName) {
    // Cost to us (usually lower than value to customer)
    const perkCosts = {
      "Free breakfast": 8.0,
      "Late checkout": 2.0,
      "Skip the line": 3.0,
      "Free guide": 8.0,
      "Priority boarding": 5.0,
    };

    return perkCosts[perkName] || 0;
  }

  /**
   * Update performance telemetry
   */
  updateTelemetry(totalTime, featurePrepTime, inferenceTime, scoringTime) {
    this.telemetry.total_calls++;
    this.telemetry.total_time_ms += totalTime;
    this.telemetry.avg_time_ms =
      this.telemetry.total_time_ms / this.telemetry.total_calls;
    this.telemetry.feature_prep_time += featurePrepTime;
    this.telemetry.inference_time += inferenceTime;
    this.telemetry.scoring_time += scoringTime;
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    return {
      ...this.telemetry,
      avg_feature_prep_ms:
        this.telemetry.feature_prep_time / this.telemetry.total_calls,
      avg_inference_ms:
        this.telemetry.inference_time / this.telemetry.total_calls,
      avg_scoring_ms: this.telemetry.scoring_time / this.telemetry.total_calls,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Load production model (placeholder for ONNX/sklearn integration)
   */
  async loadProductionModel(modelPath) {
    try {
      // In production, load ONNX model here
      // const ort = require('onnxruntime-node');
      // this.propensityModel = new ONNXPropensityModel(modelPath);

      this.logger.info(`Production model loaded from ${modelPath}`);
      return true;
    } catch (error) {
      this.logger.error("Failed to load production model:", error);
      return false;
    }
  }
}

/**
 * Mock Propensity Model for development
 * In production, replace with ONNX/sklearn model
 */
class MockPropensityModel {
  /**
   * Predict acceptance probability for batch of feature vectors
   */
  async predictBatch(featureMatrix) {
    // Mock implementation - returns realistic probabilities
    return featureMatrix.map((features) => {
      // Simulate logistic regression with key features
      const discountDepth = features[10] || 0;
      const tierScore = features[1] || 0;
      const styleScore = features[2] || 1;
      const actionType = features[12] || 1;

      // Higher discount depth = higher acceptance
      let logit = -2.0 + discountDepth * 4.0;

      // User tier bonus
      logit += tierScore * 0.3;

      // User style adjustment
      logit += (styleScore - 1) * 0.2;

      // Action type adjustment
      if (actionType === 2) logit += 0.1; // Perk bonus
      if (actionType === 3) logit -= 0.3; // Hold penalty

      // Add some randomness
      logit += (Math.random() - 0.5) * 0.4;

      // Convert to probability via sigmoid
      const probability = 1 / (1 + Math.exp(-logit));

      // Ensure reasonable bounds
      return Math.min(0.95, Math.max(0.05, probability));
    });
  }
}

// Export singleton instance
const scoringEngine = new ScoringEngine();

module.exports = scoringEngine;
