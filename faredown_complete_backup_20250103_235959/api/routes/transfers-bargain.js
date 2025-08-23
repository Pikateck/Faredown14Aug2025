/**
 * Transfers Bargain API - AI-Powered Negotiation for Transfer Services
 * Handles bargain sessions specifically for transfers with real pricing data
 */

const express = require("express");
const { Client } = require("pg");
const crypto = require("crypto");
const winston = require("winston");
const transfersService = require("../services/transfersService");
const router = express.Router();

// Setup logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      return `${timestamp} [${level.toUpperCase()}] [TRANSFERS-BARGAIN] ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ""}`;
    }),
  ),
  transports: [new winston.transports.Console()],
});

// Database connection with fallback
let pgPool = null;
let dbAvailable = false;

try {
  const { Pool } = require("pg");
  pgPool = new Pool({
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || "faredown",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
  dbAvailable = true;
  logger.info("Database pool initialized for transfers bargain");
} catch (error) {
  logger.warn("Database pool initialization failed, using in-memory storage", {
    error: error.message,
  });
  dbAvailable = false;
}

// Transfers Bargain Engine
class TransfersBargainEngine {
  constructor() {
    this.activeSessions = new Map();
    this.minProfitMarginPercent = 0.08; // 8% minimum profit margin
    this.maxDiscountPercent = 0.2; // Maximum 20% discount
  }

  // Generate session ID
  generateSessionId() {
    return `transfers_bargain_${Date.now()}_${crypto.randomBytes(8).toString("hex")}`;
  }

  // Calculate transfer pricing structure
  calculateTransferPricing(transferData) {
    const basePrice =
      transferData.pricing?.basePrice || transferData.totalPrice * 0.8;
    const displayedPrice =
      transferData.pricing?.totalPrice || transferData.totalPrice;
    const costPrice = basePrice * 0.7; // Assume 70% of base price is cost
    const maxDiscount = displayedPrice * this.maxDiscountPercent;
    const minSellingPrice = costPrice + basePrice * this.minProfitMarginPercent;

    return {
      displayedPrice,
      basePrice,
      costPrice,
      maxDiscount,
      minSellingPrice,
      maxOfferPrice: Math.max(minSellingPrice, displayedPrice - maxDiscount),
      profitMargin: basePrice - costPrice,
    };
  }

  // AI Negotiation Algorithm for Transfers
  generateCounterOffer(sessionData, userOffer, round = 1) {
    const pricing = sessionData.pricing;
    const { displayedPrice, minSellingPrice, maxOfferPrice } = pricing;

    // If user offer is acceptable
    if (userOffer >= minSellingPrice) {
      const profit = userOffer - pricing.costPrice;
      const profitMargin = profit / userOffer;

      // Accept if profit margin is good or if it's later rounds
      if (profitMargin >= this.minProfitMarginPercent || round >= 3) {
        return {
          decision: "accept",
          finalPrice: userOffer,
          message: "Great! Your offer has been accepted.",
          savings: displayedPrice - userOffer,
        };
      }
    }

    // If offer is too low, provide final counter offer instead of rejecting
    if (userOffer < minSellingPrice) {
      const finalCounterOffer = Math.round(minSellingPrice * 1.05); // 5% above minimum for sustainability
      return {
        decision: "counter",
        counterPrice: finalCounterOffer,
        message: `This is our absolute final price of ₹${finalCounterOffer}. It covers all operational costs and ensures quality service with fair driver compensation.`,
        savings: displayedPrice - finalCounterOffer,
        acceptanceProbability: 0.95,
        isFinalOffer: true,
      };
    }

    // Generate counter offer using AI-like logic
    const discountRange = displayedPrice - maxOfferPrice;
    const aggressiveness = Math.min(0.8, round * 0.2); // More aggressive in later rounds

    let counterPrice;
    if (round === 1) {
      // First round: modest discount
      counterPrice = displayedPrice - discountRange * 0.3;
    } else if (round === 2) {
      // Second round: split the difference with slight favor to us
      counterPrice = (userOffer + displayedPrice) / 2 + displayedPrice * 0.05;
    } else {
      // Later rounds: more aggressive, closer to user offer
      const halfway = (userOffer + maxOfferPrice) / 2;
      counterPrice = Math.max(maxOfferPrice, halfway);
    }

    // Ensure counter price is reasonable
    counterPrice = Math.max(
      maxOfferPrice,
      Math.min(displayedPrice, counterPrice),
    );

    return {
      decision: "counter",
      counterPrice: Math.round(counterPrice),
      message: this.generateBargainMessage(sessionData, counterPrice, round),
      savings: displayedPrice - counterPrice,
      acceptanceProbability: this.calculateAcceptanceProbability(
        counterPrice,
        userOffer,
        displayedPrice,
      ),
    };
  }

  generateBargainMessage(sessionData, counterPrice, round) {
    const messages = [
      "Our pricing reflects current demand and service quality. This is our best offer considering peak travel times.",
      "We've analyzed market conditions and can offer this competitive rate that ensures premium service.",
      "This price includes professional driver service, vehicle maintenance, and insurance coverage.",
      "Considering fuel costs and driver compensation, this is the most competitive rate we can provide.",
    ];

    return messages[Math.min(round - 1, messages.length - 1)];
  }

  calculateAcceptanceProbability(counterPrice, userOffer, displayedPrice) {
    const discount = (displayedPrice - counterPrice) / displayedPrice;
    const userDiscount = (displayedPrice - userOffer) / displayedPrice;

    // Higher probability if our counter is close to user's offer
    const closeness = 1 - Math.abs(counterPrice - userOffer) / displayedPrice;
    return Math.min(0.9, Math.max(0.1, closeness * 0.8 + discount * 0.3));
  }
}

const bargainEngine = new TransfersBargainEngine();

// POST /api/transfers-bargain/session/start
router.post("/session/start", async (req, res) => {
  try {
    const { transferData, userProfile, searchDetails } = req.body;

    if (!transferData || !transferData.id) {
      return res.status(400).json({
        success: false,
        error: "Missing transfer data",
        code: "INVALID_TRANSFER_DATA",
      });
    }

    const sessionId = bargainEngine.generateSessionId();
    const pricing = bargainEngine.calculateTransferPricing(transferData);

    // Create session data
    const sessionData = {
      sessionId,
      transferId: transferData.id,
      vehicleType: transferData.vehicleType,
      vehicleClass: transferData.vehicleClass,
      vehicleName: transferData.vehicleName,
      pickupLocation:
        searchDetails?.pickupLocation || transferData.pickupLocation,
      dropoffLocation:
        searchDetails?.dropoffLocation || transferData.dropoffLocation,
      pickupDate: searchDetails?.pickupDate,
      pricing,
      userProfile: userProfile || { tier: "standard" },
      createdAt: new Date(),
      rounds: 0,
      status: "active",
    };

    // Store session in memory (in production, use Redis)
    bargainEngine.activeSessions.set(sessionId, sessionData);

    // Store in database if available
    if (dbAvailable && pgPool) {
      try {
        await pgPool.query(
          `INSERT INTO ai.transfers_bargain_sessions
           (session_id, transfer_id, vehicle_type, vehicle_class, vehicle_name,
            pickup_location, dropoff_location, pickup_date, displayed_price,
            base_price, cost_price, min_selling_price, user_tier, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'active')
           ON CONFLICT (session_id) DO NOTHING`,
          [
            sessionId,
            transferData.id,
            transferData.vehicleType,
            transferData.vehicleClass,
            transferData.vehicleName,
            sessionData.pickupLocation,
            sessionData.dropoffLocation,
            sessionData.pickupDate,
            pricing.displayedPrice,
            pricing.basePrice,
            pricing.costPrice,
            pricing.minSellingPrice,
            sessionData.userProfile.tier,
          ],
        );
        logger.info("Session stored in database", { sessionId });
      } catch (dbError) {
        logger.warn("Database storage failed, continuing with memory storage", {
          error: dbError.message,
        });
      }
    } else {
      logger.info("Using in-memory storage only", { sessionId });
    }

    // Generate initial AI response
    const initialPrice = pricing.displayedPrice;
    const initialMessage = `Welcome to our AI price negotiator! Our current rate for the ${transferData.vehicleName} is ₹${Math.round(initialPrice)}. This includes professional driver service, vehicle insurance, and our quality guarantee. What price would you like to pay?`;

    logger.info("Transfers bargain session started", {
      sessionId,
      transferId: transferData.id,
      displayedPrice: pricing.displayedPrice,
      minSellingPrice: pricing.minSellingPrice,
    });

    res.json({
      success: true,
      sessionId,
      transfer: {
        id: transferData.id,
        name: transferData.vehicleName,
        type: `${transferData.vehicleClass} ${transferData.vehicleType}`,
        route: `${sessionData.pickupLocation} → ${sessionData.dropoffLocation}`,
        maxPassengers: transferData.maxPassengers,
        estimatedDuration: transferData.estimatedDuration,
      },
      pricing: {
        displayedPrice: Math.round(pricing.displayedPrice),
        currency: "INR",
      },
      aiResponse: {
        message: initialMessage,
        minAcceptablePrice: Math.round(pricing.minSellingPrice),
        maxSavings: Math.round(pricing.maxDiscount),
      },
    });
  } catch (error) {
    logger.error("Failed to start transfers bargain session", {
      error: error.message,
    });
    res.status(500).json({
      success: false,
      error: "Failed to start bargain session",
      code: "SESSION_START_ERROR",
    });
  }
});

// POST /api/transfers-bargain/session/offer
router.post("/session/offer", async (req, res) => {
  try {
    const { sessionId, userOffer, message } = req.body;

    if (!sessionId || !userOffer) {
      return res.status(400).json({
        success: false,
        error: "Missing session ID or offer amount",
        code: "INVALID_REQUEST",
      });
    }

    // Get session data
    let sessionData = bargainEngine.activeSessions.get(sessionId);
    if (!sessionData) {
      return res.status(404).json({
        success: false,
        error: "Bargain session not found or expired",
        code: "SESSION_NOT_FOUND",
      });
    }

    // Increment round
    sessionData.rounds += 1;
    const currentRound = sessionData.rounds;

    // Generate AI response
    const aiResponse = bargainEngine.generateCounterOffer(
      sessionData,
      userOffer,
      currentRound,
    );

    // Log the negotiation round if database is available
    if (dbAvailable && pgPool) {
      try {
        await pgPool.query(
          `INSERT INTO ai.transfers_bargain_rounds
           (session_id, round_number, user_offer, ai_decision, ai_counter_price,
            ai_message, savings_amount, user_message)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            sessionId,
            currentRound,
            userOffer,
            aiResponse.decision,
            aiResponse.counterPrice || aiResponse.finalPrice || null,
            aiResponse.message,
            aiResponse.savings || 0,
            message || null,
          ],
        );
      } catch (dbError) {
        logger.warn("Failed to log bargain round", { error: dbError.message });
      }
    }

    // Update session status if accepted or rejected
    if (aiResponse.decision === "accept") {
      sessionData.status = "accepted";
      sessionData.finalPrice = aiResponse.finalPrice;
      bargainEngine.activeSessions.set(sessionId, sessionData);

      // Update database if available
      if (dbAvailable && pgPool) {
        try {
          await pgPool.query(
            "UPDATE ai.transfers_bargain_sessions SET status = 'accepted', final_price = $1 WHERE session_id = $2",
            [aiResponse.finalPrice, sessionId],
          );
        } catch (dbError) {
          logger.warn("Failed to update session status", {
            error: dbError.message,
          });
        }
      }
    }
    // Note: We no longer reject offers - we always provide counter offers to ensure conversion

    logger.info("Transfers bargain round completed", {
      sessionId,
      round: currentRound,
      userOffer,
      decision: aiResponse.decision,
      counterPrice: aiResponse.counterPrice,
      finalPrice: aiResponse.finalPrice,
    });

    res.json({
      success: true,
      sessionId,
      round: currentRound,
      userOffer,
      aiResponse: {
        decision: aiResponse.decision,
        message: aiResponse.message,
        counterPrice: aiResponse.counterPrice,
        finalPrice: aiResponse.finalPrice,
        savings: Math.round(aiResponse.savings || 0),
        acceptanceProbability: aiResponse.acceptanceProbability,
      },
      sessionStatus: sessionData.status,
    });
  } catch (error) {
    logger.error("Failed to process bargain offer", { error: error.message });
    res.status(500).json({
      success: false,
      error: "Failed to process offer",
      code: "OFFER_PROCESSING_ERROR",
    });
  }
});

// POST /api/transfers-bargain/session/accept
router.post("/session/accept", async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: "Missing session ID",
        code: "INVALID_REQUEST",
      });
    }

    const sessionData = bargainEngine.activeSessions.get(sessionId);
    if (!sessionData || sessionData.status !== "accepted") {
      return res.status(404).json({
        success: false,
        error: "No accepted bargain found for this session",
        code: "NO_ACCEPTED_BARGAIN",
      });
    }

    // Generate booking payload
    const bookingPayload = {
      sessionId,
      transferId: sessionData.transferId,
      vehicleType: sessionData.vehicleType,
      vehicleClass: sessionData.vehicleClass,
      vehicleName: sessionData.vehicleName,
      finalPrice: sessionData.finalPrice,
      originalPrice: sessionData.pricing.displayedPrice,
      savings: sessionData.pricing.displayedPrice - sessionData.finalPrice,
      pickupLocation: sessionData.pickupLocation,
      dropoffLocation: sessionData.dropoffLocation,
      pickupDate: sessionData.pickupDate,
      currency: "INR",
      bookingReference: `TRF_BARGAIN_${Date.now()}_${crypto.randomBytes(4).toString("hex").toUpperCase()}`,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
      negotiationRounds: sessionData.rounds,
    };

    // Update session
    sessionData.status = "booking_ready";
    sessionData.bookingPayload = bookingPayload;
    bargainEngine.activeSessions.set(sessionId, sessionData);

    if (dbAvailable && pgPool) {
      try {
        await pgPool.query(
          "UPDATE ai.transfers_bargain_sessions SET status = 'booking_ready', booking_reference = $1 WHERE session_id = $2",
          [bookingPayload.bookingReference, sessionId],
        );
      } catch (dbError) {
        logger.warn("Failed to update session for booking", {
          error: dbError.message,
        });
      }
    }

    logger.info("Transfers bargain accepted and ready for booking", {
      sessionId,
      finalPrice: sessionData.finalPrice,
      savings: bookingPayload.savings,
      bookingReference: bookingPayload.bookingReference,
    });

    res.json({
      success: true,
      bookingPayload,
      message:
        "Great! Your negotiated price has been locked in. You can now proceed to booking.",
    });
  } catch (error) {
    logger.error("Failed to accept bargain", { error: error.message });
    res.status(500).json({
      success: false,
      error: "Failed to accept bargain",
      code: "ACCEPT_ERROR",
    });
  }
});

// GET /api/transfers-bargain/session/:sessionId
router.get("/session/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;

    const sessionData = bargainEngine.activeSessions.get(sessionId);
    if (!sessionData) {
      return res.status(404).json({
        success: false,
        error: "Session not found",
        code: "SESSION_NOT_FOUND",
      });
    }

    // Get bargain history from database if available
    let rounds = [];
    if (dbAvailable && pgPool) {
      try {
        const result = await pgPool.query(
          `SELECT * FROM ai.transfers_bargain_rounds
           WHERE session_id = $1 ORDER BY round_number ASC`,
          [sessionId],
        );
        rounds = result.rows;
      } catch (dbError) {
        logger.warn("Failed to fetch bargain rounds", {
          error: dbError.message,
        });
      }
    }

    res.json({
      success: true,
      session: {
        sessionId: sessionData.sessionId,
        transferId: sessionData.transferId,
        vehicleName: sessionData.vehicleName,
        route: `${sessionData.pickupLocation} → ${sessionData.dropoffLocation}`,
        status: sessionData.status,
        rounds: sessionData.rounds,
        pricing: sessionData.pricing,
        finalPrice: sessionData.finalPrice,
      },
      history: rounds,
      bookingPayload: sessionData.bookingPayload,
    });
  } catch (error) {
    logger.error("Failed to get session details", { error: error.message });
    res.status(500).json({
      success: false,
      error: "Failed to get session details",
      code: "SESSION_FETCH_ERROR",
    });
  }
});

// Health check
router.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    activeSessions: bargainEngine.activeSessions.size,
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
