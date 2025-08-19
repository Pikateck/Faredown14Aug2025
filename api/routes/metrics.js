const express = require("express");
const promClient = require("prom-client");
const router = express.Router();

const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics({ timeout: 5000 });

const register = new promClient.Registry();
register.setDefaultLabels({
  app: "bargain-api",
  version: process.env.API_VERSION || "1.0.0",
});

promClient.register.setDefaultLabels({
  app: "bargain-api",
});

const httpRequestDuration = new promClient.Histogram({
  name: "bargain_response_seconds",
  help: "Request duration for /session/* endpoints",
  labelNames: ["route", "method", "status_code"],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.3, 0.5, 1, 2.5, 5, 10],
});

const httpRequestTotal = new promClient.Counter({
  name: "bargain_requests_total",
  help: "Total number of requests by route and status code",
  labelNames: ["route", "code", "method"],
});

const redisHitRate = new promClient.Gauge({
  name: "bargain_redis_hit_rate",
  help: "Redis cache hit rate (0-1)",
});

const inventoryFlipRate = new promClient.Gauge({
  name: "bargain_inventory_flip_rate",
  help: "Rate of inventory changes affecting sessions",
});

const contributionMarginPct = new promClient.Gauge({
  name: "bargain_contribution_margin_pct",
  help: "Contribution margin percentage (0-1)",
  labelNames: ["variant"],
});

const fallbackTotal = new promClient.Counter({
  name: "bargain_fallback_total",
  help: "Total fallbacks by reason",
  labelNames: ["reason"],
});

const offerabilityDuration = new promClient.Histogram({
  name: "bargain_offerability_ms",
  help: "Offerability engine processing time",
  buckets: [1, 5, 10, 25, 50, 100, 250, 500, 1000],
});

const modelInferDuration = new promClient.Histogram({
  name: "bargain_model_infer_ms",
  help: "Model inference processing time",
  buckets: [5, 10, 25, 50, 100, 200, 500, 1000, 2000],
});

const asyncQueueLag = new promClient.Gauge({
  name: "bargain_async_queue_lag",
  help: "Async queue processing lag in seconds",
});

const policyVersion = new promClient.Gauge({
  name: "bargain_policy_version",
  help: "Current policy version deployed",
  labelNames: ["version", "environment"],
});

const modelVersion = new promClient.Gauge({
  name: "bargain_model_version",
  help: "Current model version deployed",
  labelNames: ["version", "model_type", "environment"],
});

register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
register.registerMetric(redisHitRate);
register.registerMetric(inventoryFlipRate);
register.registerMetric(contributionMarginPct);
register.registerMetric(fallbackTotal);
register.registerMetric(offerabilityDuration);
register.registerMetric(modelInferDuration);
register.registerMetric(asyncQueueLag);
register.registerMetric(policyVersion);
register.registerMetric(modelVersion);

function createMetricsMiddleware() {
  return (req, res, next) => {
    const start = Date.now();

    res.on("finish", () => {
      const duration = (Date.now() - start) / 1000;
      const route = req.route ? req.route.path : req.path;

      if (route && route.startsWith("/session")) {
        httpRequestDuration
          .labels(route, req.method, res.statusCode.toString())
          .observe(duration);
        httpRequestTotal
          .labels(route, res.statusCode.toString(), req.method)
          .inc();
      }
    });

    next();
  };
}

async function updateMetricsFromCache(redisClient) {
  try {
    const cacheStats = await redisClient.get("metrics:cache_stats");
    if (cacheStats) {
      const stats = JSON.parse(cacheStats);
      redisHitRate.set(stats.hit_rate || 0);
    }

    const inventoryStats = await redisClient.get("metrics:inventory_stats");
    if (inventoryStats) {
      const stats = JSON.parse(inventoryStats);
      inventoryFlipRate.set(stats.flip_rate || 0);
    }

    const marginStats = await redisClient.get("metrics:margin_stats");
    if (marginStats) {
      const stats = JSON.parse(marginStats);
      contributionMarginPct.labels("ai").set(stats.ai_margin || 0);
      contributionMarginPct.labels("control").set(stats.control_margin || 0);
    }

    const queueStats = await redisClient.get("metrics:queue_stats");
    if (queueStats) {
      const stats = JSON.parse(queueStats);
      asyncQueueLag.set(stats.lag_seconds || 0);
    }

    const versionInfo = await redisClient.get("config:versions");
    if (versionInfo) {
      const versions = JSON.parse(versionInfo);
      policyVersion
        .labels(
          versions.policy_version || "unknown",
          process.env.NODE_ENV || "development",
        )
        .set(1);
      modelVersion
        .labels(
          versions.model_version || "unknown",
          "pricing",
          process.env.NODE_ENV || "development",
        )
        .set(1);
    }
  } catch (error) {
    console.error("Error updating metrics from cache:", error);
  }
}

function recordFallback(reason) {
  fallbackTotal.labels(reason).inc();
}

function recordOfferabilityTime(durationMs) {
  offerabilityDuration.observe(durationMs);
}

function recordModelInferenceTime(durationMs) {
  modelInferDuration.observe(durationMs);
}

router.get("/metrics", async (req, res) => {
  try {
    if (req.app.locals.redisClient) {
      await updateMetricsFromCache(req.app.locals.redisClient);
    }

    res.set("Content-Type", register.contentType);
    const metrics = await register.metrics();
    res.end(metrics);
  } catch (error) {
    console.error("Error generating metrics:", error);
    res.status(500).send("Error generating metrics");
  }
});

router.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    metrics_endpoint: "/metrics",
  });
});

module.exports = {
  router,
  createMetricsMiddleware,
  recordFallback,
  recordOfferabilityTime,
  recordModelInferenceTime,
  updateMetricsFromCache,
  metrics: {
    httpRequestDuration,
    httpRequestTotal,
    redisHitRate,
    inventoryFlipRate,
    contributionMarginPct,
    fallbackTotal,
    offerabilityDuration,
    modelInferDuration,
    asyncQueueLag,
    policyVersion,
    modelVersion,
  },
};
