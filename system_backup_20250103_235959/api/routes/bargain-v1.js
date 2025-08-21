/**
 * Bargain API v1 Routes
 * /api/bargain/v1/* endpoints for AI bargaining platform
 */

const express = require("express");
const rateLimit = require("express-rate-limit");
const bargainController = require("../services/bargainController");
const auth = require("../middleware/auth");

const router = express.Router();

// Rate limiting for bargain endpoints
const bargainRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute per IP
  message: {
    error: "RATE_LIMIT_EXCEEDED",
    message: "Too many bargain requests, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Aggressive rate limiting for session start (more expensive)
const sessionStartRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 session starts per minute per IP
  message: {
    error: "SESSION_START_RATE_LIMIT",
    message: "Too many new sessions, please try again later",
  },
});

// Apply rate limiting to all bargain routes
router.use(bargainRateLimit);

// Request logging middleware
router.use((req, res, next) => {
  req.bargainStartTime = Date.now();
  console.log(
    `${new Date().toISOString()} [BARGAIN_API] ${req.method} ${req.path}`,
  );
  next();
});

// Response time logging middleware
router.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function (data) {
    const responseTime = Date.now() - req.bargainStartTime;
    res.setHeader("X-Response-Time", `${responseTime}ms`);

    // Log slow requests
    if (responseTime > 300) {
      console.warn(
        `[SLOW_REQUEST] ${req.method} ${req.path} took ${responseTime}ms`,
      );
    }

    originalSend.call(this, data);
  };
  next();
});

// Input validation middleware
const validateSessionStart = (req, res, next) => {
  const { user, productCPO } = req.body;

  if (!productCPO || !productCPO.canonical_key || !productCPO.type) {
    return res.status(400).json({
      error: "INVALID_INPUT",
      message: "Missing required productCPO fields",
    });
  }

  if (!["flight", "hotel", "sightseeing"].includes(productCPO.type)) {
    return res.status(400).json({
      error: "INVALID_PRODUCT_TYPE",
      message: "Product type must be flight, hotel, or sightseeing",
    });
  }

  next();
};

const validateSessionOffer = (req, res, next) => {
  const { session_id } = req.body;

  if (!session_id) {
    return res.status(400).json({
      error: "MISSING_SESSION_ID",
      message: "Session ID is required",
    });
  }

  // Validate UUID format
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(session_id)) {
    return res.status(400).json({
      error: "INVALID_SESSION_ID",
      message: "Invalid session ID format",
    });
  }

  next();
};

// ==========================================
// MAIN BARGAIN ENDPOINTS
// ==========================================

/**
 * POST /api/bargain/v1/session/start
 * Initialize new bargaining session
 */
router.post(
  "/session/start",
  sessionStartRateLimit,
  auth.optionalAuth, // Allow anonymous bargaining
  validateSessionStart,
  async (req, res) => {
    try {
      await bargainController.startSession(req, res);
    } catch (error) {
      console.error("Unhandled error in session/start:", error);
      res.status(500).json({
        error: "INTERNAL_ERROR",
        message: "An unexpected error occurred",
      });
    }
  },
);

/**
 * POST /api/bargain/v1/session/offer
 * Process user counter-offer
 */
router.post(
  "/session/offer",
  auth.optionalAuth,
  validateSessionOffer,
  async (req, res) => {
    try {
      await bargainController.sessionOffer(req, res);
    } catch (error) {
      console.error("Unhandled error in session/offer:", error);
      res.status(500).json({
        error: "INTERNAL_ERROR",
        message: "An unexpected error occurred",
      });
    }
  },
);

/**
 * POST /api/bargain/v1/session/accept
 * Accept final offer and lock inventory
 */
router.post(
  "/session/accept",
  auth.optionalAuth,
  validateSessionOffer, // Same validation as offer
  async (req, res) => {
    try {
      await bargainController.sessionAccept(req, res);
    } catch (error) {
      console.error("Unhandled error in session/accept:", error);
      res.status(500).json({
        error: "INTERNAL_ERROR",
        message: "An unexpected error occurred",
      });
    }
  },
);

/**
 * POST /api/bargain/v1/event/log
 * Log micro-events for analytics
 */
router.post("/event/log", auth.optionalAuth, async (req, res) => {
  try {
    await bargainController.logEvent(req, res);
  } catch (error) {
    console.error("Unhandled error in event/log:", error);
    res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "An unexpected error occurred",
    });
  }
});

/**
 * GET /api/bargain/v1/session/replay/:id
 * Get session replay for admin (requires admin auth)
 */
router.get(
  "/session/replay/:id",
  auth.requireAuth,
  auth.requireAdmin,
  async (req, res) => {
    try {
      await bargainController.sessionReplay(req, res);
    } catch (error) {
      console.error("Unhandled error in session/replay:", error);
      res.status(500).json({
        error: "INTERNAL_ERROR",
        message: "An unexpected error occurred",
      });
    }
  },
);

// ==========================================
// HEALTH AND MONITORING ENDPOINTS
// ==========================================

/**
 * GET /api/bargain/v1/health
 * Health check endpoint
 */
router.get("/health", async (req, res) => {
  try {
    const healthChecks = await Promise.all([
      bargainController.getPerformanceMetrics(),
      // Add other health checks here
    ]);

    const overallHealth = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: "v1",
      performance: healthChecks[0],
      uptime: process.uptime(),
    };

    res.status(200).json(overallHealth);
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/bargain/v1/metrics
 * Performance metrics endpoint (admin only)
 */
router.get(
  "/metrics",
  auth.requireAuth,
  auth.requireAdmin,
  async (req, res) => {
    try {
      const metrics = bargainController.getPerformanceMetrics();
      res.status(200).json(metrics);
    } catch (error) {
      res.status(500).json({
        error: "METRICS_ERROR",
        message: error.message,
      });
    }
  },
);

// ==========================================
// ERROR HANDLING
// ==========================================

// 404 handler for unmatched bargain routes
router.use((req, res) => {
  res.status(404).json({
    error: "ENDPOINT_NOT_FOUND",
    message: `Bargain API endpoint ${req.method} ${req.path} not found`,
    available_endpoints: [
      "POST /session/start",
      "POST /session/offer",
      "POST /session/accept",
      "POST /event/log",
      "GET /session/replay/:id",
      "GET /health",
      "GET /metrics",
    ],
  });
});

// Global error handler for bargain routes
router.use((error, req, res, next) => {
  console.error("Bargain API error:", error);

  // Don't expose internal errors in production
  const isDevelopment = process.env.NODE_ENV !== "production";

  res.status(500).json({
    error: "BARGAIN_API_ERROR",
    message: isDevelopment ? error.message : "Internal server error",
    timestamp: new Date().toISOString(),
    ...(isDevelopment && { stack: error.stack }),
  });
});

module.exports = router;
