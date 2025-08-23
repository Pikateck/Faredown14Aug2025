/**
 * Bargain API Controller
 * Main orchestrator for /api/bargain/v1/* endpoints
 * Target: <300ms p95 response time
 */

const { v4: uuidv4 } = require("uuid");
const offerabilityEngine = require("./offerabilityEngine");
const scoringEngine = require("./scoringEngine");
const offerCapsuleService = require("./offerCapsuleService");
const cpoRepository = require("./cpoRepository");
const redisService = require("./redisService");
const supplierAdapterManager = require("./adapters/supplierAdapterManager");
const winston = require("winston");

class BargainController {
  constructor() {
    this.logger = winston.createLogger({
      level: "info",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} [${level.toUpperCase()}] [BARGAIN_API] ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ""}`;
        }),
      ),
      transports: [new winston.transports.Console()],
    });

    // Performance tracking
    this.telemetry = {
      session_start: { calls: 0, total_time: 0, errors: 0 },
      session_offer: { calls: 0, total_time: 0, errors: 0 },
      session_accept: { calls: 0, total_time: 0, errors: 0 },
    };
  }

  /**
   * POST /api/bargain/v1/session/start
   * Initialize bargaining session
   */
  async startSession(req, res) {
    const startTime = Date.now();
    const sessionId = uuidv4();

    try {
      const { user, productCPO, supplierSnapshots = [], promo_code } = req.body;

      this.logger.info("Starting bargain session", {
        session_id: sessionId,
        user_id: user?.id,
        product_type: productCPO?.type,
        canonical_key: productCPO?.canonical_key,
      });

      // Step 1: Load context (Redis-cached data, ~5-10ms)
      const context = await this.loadContext({
        session_id: sessionId,
        user,
        productCPO,
        supplierSnapshots,
        promo_code,
        round: 1,
      });

      // Step 2: Build feasible action set (~30-50ms)
      const feasibleActions =
        await offerabilityEngine.generateFeasibleActions(context);

      // Step 3: Score candidates for expected profit (~10-15ms)
      const scoringResult = await scoringEngine.scoreCandidates(
        context,
        feasibleActions,
      );
      const bestCandidate = scoringResult.best_candidate;

      // Step 4: Create signed offer capsule (~5-10ms)
      const capsule = await offerCapsuleService.createSignedCapsule({
        session_id: sessionId,
        chosen_action: bestCandidate,
        feasible_actions: feasibleActions,
        supplier_snapshots: context.supplier_snapshots,
        policy_version: context.policy_version,
        model_version: "propensity_v1",
        user_context: context.user_profile,
      });

      // Step 5: Persist session state and event (async, ~5ms)
      await this.persistSessionStart(
        sessionId,
        context,
        bestCandidate,
        feasibleActions,
      );

      // Step 6: Prepare response
      const response = {
        session_id: sessionId,
        initial_offer: {
          price: bestCandidate.price,
          currency: bestCandidate.currency,
          perk: bestCandidate.perk_name || null,
          supplier_id: this.getChosenSupplierId(
            bestCandidate,
            context.supplier_snapshots,
          ),
          expires_at: capsule.payload.expires_at,
        },
        min_floor: feasibleActions.cost_floor,
        explain: capsule.payload.explain,
        safety_capsule: offerCapsuleService.getCapsuleSummary(capsule),
      };

      const executionTime = Date.now() - startTime;
      this.updateTelemetry("session_start", executionTime, false);

      this.logger.info("Bargain session started successfully", {
        session_id: sessionId,
        execution_time_ms: executionTime,
        initial_price: bestCandidate.price,
        expected_profit: bestCandidate.expected_profit,
        accept_prob: bestCandidate.accept_prob,
      });

      res.status(200).json(response);
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.updateTelemetry("session_start", executionTime, true);

      this.logger.error("Failed to start bargain session:", error);
      this.handleError(res, error, "SESSION_START_FAILED");
    }
  }

  /**
   * POST /api/bargain/v1/session/offer
   * Process user counter-offer
   */
  async sessionOffer(req, res) {
    const startTime = Date.now();

    try {
      const { session_id, user_offer, signals = {} } = req.body;

      this.logger.info("Processing session offer", {
        session_id,
        user_offer,
        signals: Object.keys(signals),
      });

      // Step 1: Load session context
      const sessionState = await this.getSessionState(session_id);
      if (!sessionState) {
        return this.handleError(
          res,
          new Error("Session not found"),
          "SESSION_NOT_FOUND",
          404,
        );
      }

      // Step 2: Update context for new round
      const context = await this.updateContextForRound(
        sessionState,
        user_offer,
        signals,
      );

      // Step 3: Check if user offer is acceptable
      if (user_offer && user_offer >= context.feasible_actions.cost_floor) {
        // User offer is acceptable - prepare acceptance response
        const response = await this.prepareAcceptanceResponse(
          context,
          user_offer,
        );

        const executionTime = Date.now() - startTime;
        this.updateTelemetry("session_offer", executionTime, false);

        return res.status(200).json(response);
      }

      // Step 4: Generate new feasible actions for this round
      const feasibleActions =
        await offerabilityEngine.generateFeasibleActions(context);

      // Step 5: Score and select best counter-offer
      const scoringResult = await scoringEngine.scoreCandidates(
        context,
        feasibleActions,
      );
      const bestCandidate = scoringResult.best_candidate;

      // Step 6: Create new signed capsule
      const capsule = await offerCapsuleService.createSignedCapsule({
        session_id: session_id,
        chosen_action: bestCandidate,
        feasible_actions: feasibleActions,
        supplier_snapshots: context.supplier_snapshots,
        policy_version: context.policy_version,
        model_version: "propensity_v1",
        user_context: context.user_profile,
      });

      // Step 7: Persist round event
      await this.persistRoundEvent(
        session_id,
        context.round,
        user_offer,
        bestCandidate,
      );

      // Step 8: Update session state
      await this.updateSessionState(session_id, context, feasibleActions);

      // Step 9: Prepare response
      const response = {
        decision: {
          counter_price: bestCandidate.price,
          perk: bestCandidate.perk_name || null,
          hold_minutes:
            bestCandidate.type === "HOLD" ? bestCandidate.hold_minutes : null,
          supplier_id: this.getChosenSupplierId(
            bestCandidate,
            context.supplier_snapshots,
          ),
        },
        accept_prob: bestCandidate.accept_prob,
        min_floor: feasibleActions.cost_floor,
        explain: capsule.payload.explain,
        safety_capsule: offerCapsuleService.getCapsuleSummary(capsule),
      };

      const executionTime = Date.now() - startTime;
      this.updateTelemetry("session_offer", executionTime, false);

      this.logger.info("Session offer processed successfully", {
        session_id,
        round: context.round,
        execution_time_ms: executionTime,
        counter_price: bestCandidate.price,
      });

      res.status(200).json(response);
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.updateTelemetry("session_offer", executionTime, true);

      this.logger.error("Failed to process session offer:", error);
      this.handleError(res, error, "SESSION_OFFER_FAILED");
    }
  }

  /**
   * POST /api/bargain/v1/session/accept
   * Accept offer and lock inventory
   */
  async sessionAccept(req, res) {
    const startTime = Date.now();

    try {
      const { session_id } = req.body;

      this.logger.info("Processing session acceptance", { session_id });

      // Step 1: Get session state and latest offer
      const sessionState = await this.getSessionState(session_id);
      if (!sessionState) {
        return this.handleError(
          res,
          new Error("Session not found"),
          "SESSION_NOT_FOUND",
          404,
        );
      }

      // Step 2: Get latest capsule for verification
      const capsule = await offerCapsuleService.getCapsule(session_id);
      if (!capsule) {
        return this.handleError(
          res,
          new Error("No valid offer found"),
          "NO_VALID_OFFER",
          400,
        );
      }

      // Step 3: Verify capsule is not expired
      if (offerCapsuleService.isCapsuleExpired(capsule)) {
        return this.handleError(
          res,
          new Error("Offer expired"),
          "OFFER_EXPIRED",
          410,
        );
      }

      // Step 4: Apply hard guardrails (never-loss check)
      const finalPrice = capsule.payload.chosen.price;
      const costFloor = capsule.payload.floor;

      if (finalPrice < costFloor) {
        this.logger.error("Never-loss violation detected", {
          session_id,
          final_price: finalPrice,
          cost_floor: costFloor,
        });
        return this.handleError(
          res,
          new Error("Pricing violation"),
          "NEVER_LOSS_VIOLATION",
          409,
        );
      }

      // Step 5: Lock inventory with supplier
      const supplierLockResult = await this.lockSupplierInventory(
        sessionState,
        capsule,
      );

      // Step 6: Persist final acceptance event
      await this.persistAcceptanceEvent(
        session_id,
        capsule,
        supplierLockResult,
      );

      // Step 7: Prepare payment payload
      const paymentPayload = this.createPaymentPayload(
        sessionState,
        capsule,
        supplierLockResult,
      );

      const response = {
        supplier_lock_id: supplierLockResult.lock_id,
        payment_payload: paymentPayload,
        final_capsule: offerCapsuleService.getCapsuleSummary(capsule),
      };

      const executionTime = Date.now() - startTime;
      this.updateTelemetry("session_accept", executionTime, false);

      this.logger.info("Session accepted successfully", {
        session_id,
        final_price: finalPrice,
        supplier_lock_id: supplierLockResult.lock_id,
        execution_time_ms: executionTime,
      });

      res.status(200).json(response);
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.updateTelemetry("session_accept", executionTime, true);

      this.logger.error("Failed to accept session:", error);
      this.handleError(res, error, "SESSION_ACCEPT_FAILED");
    }
  }

  /**
   * POST /api/bargain/v1/event/log
   * Log micro-events for analytics
   */
  async logEvent(req, res) {
    try {
      const { session_id, name, payload = {} } = req.body;

      // Log to lightweight telemetry (Redis stream or in-memory queue)
      await this.logMicroEvent(session_id, name, payload);

      res.status(204).send();
    } catch (error) {
      this.logger.error("Failed to log event:", error);
      res.status(500).json({ error: "EVENT_LOG_FAILED" });
    }
  }

  /**
   * GET /api/bargain/v1/session/replay/:id
   * Get session replay for admin
   */
  async sessionReplay(req, res) {
    try {
      const { id: session_id } = req.params;

      // Get full session trace
      const replay = await this.getSessionReplay(session_id);

      if (!replay) {
        return res.status(404).json({ error: "SESSION_NOT_FOUND" });
      }

      res.status(200).json(replay);
    } catch (error) {
      this.logger.error("Failed to get session replay:", error);
      res.status(500).json({ error: "REPLAY_FAILED" });
    }
  }

  // ==========================================
  // HELPER METHODS
  // ==========================================

  /**
   * Load context for bargaining session
   */
  async loadContext(params) {
    const {
      session_id,
      user,
      productCPO,
      supplierSnapshots,
      promo_code,
      round = 1,
    } = params;

    // Load user profile from cache
    const userProfile = user?.id
      ? await redisService.getUserFeatures(user.id)
      : null;

    // Load product features from cache
    const productFeatures = productCPO?.canonical_key
      ? await redisService.getProductFeatures(productCPO.canonical_key)
      : null;

    // Get or create supplier snapshots
    let snapshots = supplierSnapshots;
    if (!snapshots || snapshots.length === 0) {
      snapshots = await cpoRepository.getSupplierSnapshots(
        productCPO.canonical_key,
        3,
      );
    }

    // Get active policy version (cached)
    const policy = await redisService.getActivePolicy();

    return {
      session_id,
      canonical_key: productCPO.canonical_key,
      product_type: productCPO.type,
      user_profile: userProfile || { tier: "SILVER", style: "cautious" },
      product_features: productFeatures,
      supplier_snapshots: snapshots,
      promo_code,
      policy_version: policy?.version || "v1",
      session_context: {
        round: round,
        device_type: this.detectDeviceType(params.req),
        inventory_age_minutes: this.calculateInventoryAge(snapshots),
        elapsed_ms: 0,
      },
    };
  }

  /**
   * Get session state from Redis
   */
  async getSessionState(sessionId) {
    try {
      return await redisService.getSessionState(sessionId);
    } catch (error) {
      this.logger.error("Failed to get session state:", error);
      return null;
    }
  }

  /**
   * Update context for new round
   */
  async updateContextForRound(sessionState, userOffer, signals) {
    const newRound = (sessionState.round || 1) + 1;

    return {
      ...sessionState,
      round: newRound,
      user_offer: userOffer,
      signals: signals,
      session_context: {
        ...sessionState.session_context,
        round: newRound,
        elapsed_ms: Date.now() - new Date(sessionState.started_at).getTime(),
      },
    };
  }

  /**
   * Prepare acceptance response when user offer is acceptable
   */
  async prepareAcceptanceResponse(context, userOffer) {
    // User's offer is acceptable - match it
    return {
      decision: {
        counter_price: null,
        accepted_price: userOffer,
        supplier_id: context.supplier_snapshots[0]?.supplier_id,
      },
      accept_prob: 1.0,
      min_floor: context.feasible_actions?.cost_floor || userOffer,
      explain: `Your offer of $${userOffer} is accepted! Proceeding to booking confirmation.`,
      safety_capsule: {
        policy_version: context.policy_version,
        accepted: true,
      },
    };
  }

  /**
   * Get chosen supplier ID
   */
  getChosenSupplierId(action, snapshots) {
    // For now, use primary supplier
    // TODO: Implement supplier arbitration
    return snapshots[0]?.supplier_id || null;
  }

  /**
   * Lock inventory with supplier
   */
  async lockSupplierInventory(sessionState, capsule) {
    try {
      const supplierId = capsule.payload.chosen.supplier_id;
      const lockId = `lock_${Date.now()}_${supplierId}`;

      // TODO: Implement actual supplier inventory locking
      // For now, return mock lock
      return {
        success: true,
        lock_id: lockId,
        supplier_id: supplierId,
        locked_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 15 * 60000).toISOString(), // 15 minutes
      };
    } catch (error) {
      this.logger.error("Failed to lock supplier inventory:", error);
      throw error;
    }
  }

  /**
   * Create payment payload
   */
  createPaymentPayload(sessionState, capsule, lockResult) {
    return {
      amount: capsule.payload.chosen.price,
      currency: capsule.payload.chosen.currency,
      description: `Travel booking - ${sessionState.product_type}`,
      session_id: sessionState.session_id,
      supplier_lock_id: lockResult.lock_id,
      booking_deadline: lockResult.expires_at,
    };
  }

  /**
   * Persist session start event
   */
  async persistSessionStart(sessionId, context, chosenAction, feasibleActions) {
    try {
      // Store session state in Redis for quick access
      await redisService.setSessionState(sessionId, {
        session_id: sessionId,
        canonical_key: context.canonical_key,
        product_type: context.product_type,
        user_id: context.user_profile?.user_id,
        round: 1,
        started_at: new Date().toISOString(),
        last_action: chosenAction,
        feasible_actions: feasibleActions,
      });

      // TODO: Async queue for database writes
      // await this.queueDatabaseWrite('session_start', sessionData);
    } catch (error) {
      this.logger.error("Failed to persist session start:", error);
    }
  }

  /**
   * Persist round event
   */
  async persistRoundEvent(sessionId, round, userOffer, counterAction) {
    try {
      // TODO: Async queue for database writes
      // await this.queueDatabaseWrite('round_event', eventData);

      this.logger.info("Round event logged", {
        session_id: sessionId,
        round: round,
        user_offer: userOffer,
        counter_price: counterAction.price,
      });
    } catch (error) {
      this.logger.error("Failed to persist round event:", error);
    }
  }

  /**
   * Persist acceptance event
   */
  async persistAcceptanceEvent(sessionId, capsule, lockResult) {
    try {
      // TODO: Async queue for database writes
      this.logger.info("Acceptance event logged", {
        session_id: sessionId,
        final_price: capsule.payload.chosen.price,
        lock_id: lockResult.lock_id,
      });
    } catch (error) {
      this.logger.error("Failed to persist acceptance event:", error);
    }
  }

  /**
   * Update session state
   */
  async updateSessionState(sessionId, context, feasibleActions) {
    try {
      const updatedState = {
        ...context,
        last_updated: new Date().toISOString(),
        feasible_actions: feasibleActions,
      };

      await redisService.setSessionState(sessionId, updatedState);
    } catch (error) {
      this.logger.error("Failed to update session state:", error);
    }
  }

  /**
   * Log micro-event
   */
  async logMicroEvent(sessionId, eventName, payload) {
    try {
      // TODO: Implement Redis stream or lightweight queue
      this.logger.info("Micro-event logged", {
        session_id: sessionId,
        event: eventName,
        payload: payload,
      });
    } catch (error) {
      this.logger.error("Failed to log micro-event:", error);
    }
  }

  /**
   * Get session replay
   */
  async getSessionReplay(sessionId) {
    try {
      // TODO: Query ai.bargain_events and ai.offer_capsules
      return {
        session_id: sessionId,
        events: [],
        capsules: [],
        performance: {},
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error("Failed to get session replay:", error);
      return null;
    }
  }

  /**
   * Detect device type from request
   */
  detectDeviceType(req) {
    const userAgent = req?.headers?.["user-agent"] || "";
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
      return "mobile";
    }
    return "desktop";
  }

  /**
   * Calculate inventory age from snapshots
   */
  calculateInventoryAge(snapshots) {
    if (!snapshots || snapshots.length === 0) {
      return 60; // Assume stale if no snapshots
    }

    const latestSnapshot = snapshots[0];
    const snapshotTime = new Date(latestSnapshot.snapshot_at);
    const ageMinutes = (Date.now() - snapshotTime.getTime()) / (1000 * 60);

    return Math.round(ageMinutes);
  }

  /**
   * Update performance telemetry
   */
  updateTelemetry(endpoint, executionTime, isError) {
    const metric = this.telemetry[endpoint];
    if (metric) {
      metric.calls++;
      metric.total_time += executionTime;
      if (isError) metric.errors++;
    }
  }

  /**
   * Handle API errors
   */
  handleError(res, error, errorCode, statusCode = 500) {
    this.logger.error(`API Error [${errorCode}]:`, error);

    res.status(statusCode).json({
      error: errorCode,
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    const metrics = {};

    for (const [endpoint, data] of Object.entries(this.telemetry)) {
      metrics[endpoint] = {
        ...data,
        avg_time_ms: data.calls > 0 ? data.total_time / data.calls : 0,
        error_rate: data.calls > 0 ? data.errors / data.calls : 0,
      };
    }

    return {
      endpoints: metrics,
      timestamp: new Date().toISOString(),
    };
  }
}

// Export singleton instance
const bargainController = new BargainController();

module.exports = bargainController;
