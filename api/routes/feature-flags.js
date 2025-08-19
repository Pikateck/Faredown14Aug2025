const express = require("express");
const router = express.Router();
const redisClient = require("../services/redisHotCache");

// Feature flag configuration with defaults
const DEFAULT_FLAGS = {
  AI_TRAFFIC: 0.0, // Percentage of traffic to AI variant (0.0 to 1.0)
  AI_SHADOW: true, // Enable shadow mode (logs AI predictions without using them)
  AI_AUTO_SCALE: false, // Enable auto-scaling for AI components
  SUPPRESS_AI_ALERTS: false, // Suppress alerts during rollback periods
  ENABLE_OFFERABILITY: true, // Enable offerability engine
  ENABLE_MODEL_INFERENCE: true, // Enable ML model inference
  MAX_OFFER_ROUNDS: 3, // Maximum bargaining rounds per session
  CACHE_WARMER_ENABLED: true, // Enable cache warming
  CIRCUIT_BREAKER_ENABLED: true, // Enable circuit breakers
  PROFIT_GUARD_ENABLED: true, // Enable profit margin protection
  AUDIT_LEVEL: "full", // Audit logging level: 'minimal', 'standard', 'full'
};

// Flag metadata for documentation and validation
const FLAG_METADATA = {
  AI_TRAFFIC: {
    type: "float",
    range: [0.0, 1.0],
    description: "Percentage of traffic routed to AI bargaining engine",
    rollout_phases: [0.0, 0.1, 0.5, 1.0],
    safety_critical: true,
  },
  AI_SHADOW: {
    type: "boolean",
    description: "Enable shadow mode for AI predictions (logging only)",
    safety_critical: false,
  },
  AI_AUTO_SCALE: {
    type: "boolean",
    description: "Enable automatic scaling of AI components",
    safety_critical: true,
  },
  SUPPRESS_AI_ALERTS: {
    type: "boolean",
    description: "Temporarily suppress AI-related alerts during maintenance",
    safety_critical: false,
  },
  ENABLE_OFFERABILITY: {
    type: "boolean",
    description: "Enable the offerability engine for product eligibility",
    safety_critical: true,
  },
  ENABLE_MODEL_INFERENCE: {
    type: "boolean",
    description: "Enable ML model inference for pricing",
    safety_critical: true,
  },
  MAX_OFFER_ROUNDS: {
    type: "integer",
    range: [1, 10],
    description: "Maximum number of bargaining rounds per session",
    safety_critical: false,
  },
  CACHE_WARMER_ENABLED: {
    type: "boolean",
    description: "Enable automatic cache warming",
    safety_critical: false,
  },
  CIRCUIT_BREAKER_ENABLED: {
    type: "boolean",
    description: "Enable circuit breakers for external dependencies",
    safety_critical: true,
  },
  PROFIT_GUARD_ENABLED: {
    type: "boolean",
    description: "Enable profit margin protection and auto-rollback",
    safety_critical: true,
  },
  AUDIT_LEVEL: {
    type: "string",
    values: ["minimal", "standard", "full"],
    description: "Level of audit logging and data collection",
    safety_critical: false,
  },
};

// Validate flag value against metadata
function validateFlagValue(flagName, value) {
  const metadata = FLAG_METADATA[flagName];
  if (!metadata) {
    return { valid: false, error: `Unknown flag: ${flagName}` };
  }

  switch (metadata.type) {
    case "boolean":
      if (typeof value !== "boolean") {
        return { valid: false, error: `${flagName} must be a boolean` };
      }
      break;

    case "float":
      if (typeof value !== "number") {
        return { valid: false, error: `${flagName} must be a number` };
      }
      if (
        metadata.range &&
        (value < metadata.range[0] || value > metadata.range[1])
      ) {
        return {
          valid: false,
          error: `${flagName} must be between ${metadata.range[0]} and ${metadata.range[1]}`,
        };
      }
      break;

    case "integer":
      if (!Number.isInteger(value)) {
        return { valid: false, error: `${flagName} must be an integer` };
      }
      if (
        metadata.range &&
        (value < metadata.range[0] || value > metadata.range[1])
      ) {
        return {
          valid: false,
          error: `${flagName} must be between ${metadata.range[0]} and ${metadata.range[1]}`,
        };
      }
      break;

    case "string":
      if (typeof value !== "string") {
        return { valid: false, error: `${flagName} must be a string` };
      }
      if (metadata.values && !metadata.values.includes(value)) {
        return {
          valid: false,
          error: `${flagName} must be one of: ${metadata.values.join(", ")}`,
        };
      }
      break;
  }

  return { valid: true };
}

// Get feature flag value with fallback to default
async function getFlag(flagName) {
  try {
    const cached = await redisClient.get(`config:flags:${flagName}`);
    if (cached !== null) {
      return JSON.parse(cached);
    }
    return DEFAULT_FLAGS[flagName];
  } catch (error) {
    console.error(`Error getting flag ${flagName}:`, error);
    return DEFAULT_FLAGS[flagName];
  }
}

// Set feature flag value with validation
async function setFlag(flagName, value, ttl = 0) {
  const validation = validateFlagValue(flagName, value);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const flagKey = `config:flags:${flagName}`;
  const flagValue = JSON.stringify(value);

  if (ttl > 0) {
    await redisClient.setex(flagKey, ttl, flagValue);
  } else {
    await redisClient.set(flagKey, flagValue);
  }

  // Log flag change for audit
  await redisClient.lpush(
    "audit:flag_changes",
    JSON.stringify({
      flag: flagName,
      old_value: await getFlag(flagName),
      new_value: value,
      timestamp: new Date().toISOString(),
      user: "system", // In production, would track actual user
    }),
  );

  // Keep only last 100 flag changes
  await redisClient.ltrim("audit:flag_changes", 0, 99);
}

// Initialize default flags
async function initializeFlags() {
  for (const [flagName, defaultValue] of Object.entries(DEFAULT_FLAGS)) {
    const exists = await redisClient.exists(`config:flags:${flagName}`);
    if (!exists) {
      await setFlag(flagName, defaultValue);
    }
  }
}

// GET /feature-flags - Get all current flag values
router.get("/", async (req, res) => {
  try {
    const flags = {};

    for (const flagName of Object.keys(DEFAULT_FLAGS)) {
      flags[flagName] = await getFlag(flagName);
    }

    res.json(flags);
  } catch (error) {
    console.error("Error getting feature flags:", error);
    res.status(500).json({ error: "Failed to get feature flags" });
  }
});

// GET /feature-flags/:flag - Get specific flag value
router.get("/:flag", async (req, res) => {
  try {
    const { flag } = req.params;

    if (!DEFAULT_FLAGS.hasOwnProperty(flag)) {
      return res.status(404).json({ error: `Unknown flag: ${flag}` });
    }

    const value = await getFlag(flag);
    const metadata = FLAG_METADATA[flag];

    res.json({
      flag: flag,
      value: value,
      metadata: metadata,
    });
  } catch (error) {
    console.error(`Error getting flag ${req.params.flag}:`, error);
    res.status(500).json({ error: "Failed to get feature flag" });
  }
});

// POST /feature-flags/set - Set feature flag value
router.post("/set", async (req, res) => {
  try {
    const { flag, value, ttl } = req.body;

    if (!flag || value === undefined) {
      return res
        .status(400)
        .json({ error: "Missing required fields: flag, value" });
    }

    if (!DEFAULT_FLAGS.hasOwnProperty(flag)) {
      return res.status(404).json({ error: `Unknown flag: ${flag}` });
    }

    await setFlag(flag, value, ttl);

    res.json({
      flag: flag,
      value: value,
      ttl: ttl || "permanent",
      updated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error setting feature flag:", error);
    res.status(400).json({ error: error.message });
  }
});

// POST /feature-flags/batch-set - Set multiple flags atomically
router.post("/batch-set", async (req, res) => {
  try {
    const { flags } = req.body;

    if (!flags || typeof flags !== "object") {
      return res
        .status(400)
        .json({ error: "Missing required field: flags (object)" });
    }

    // Validate all flags first
    for (const [flagName, value] of Object.entries(flags)) {
      if (!DEFAULT_FLAGS.hasOwnProperty(flagName)) {
        return res.status(404).json({ error: `Unknown flag: ${flagName}` });
      }

      const validation = validateFlagValue(flagName, value);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
      }
    }

    // Set all flags
    const results = {};
    for (const [flagName, value] of Object.entries(flags)) {
      await setFlag(flagName, value);
      results[flagName] = value;
    }

    res.json({
      updated_flags: results,
      updated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error batch setting feature flags:", error);
    res.status(500).json({ error: "Failed to set feature flags" });
  }
});

// GET /feature-flags/metadata - Get flag metadata and documentation
router.get("/meta/documentation", async (req, res) => {
  try {
    const documentation = {};

    for (const [flagName, metadata] of Object.entries(FLAG_METADATA)) {
      const currentValue = await getFlag(flagName);
      documentation[flagName] = {
        ...metadata,
        current_value: currentValue,
        default_value: DEFAULT_FLAGS[flagName],
      };
    }

    res.json({
      flags: documentation,
      rollout_guide: {
        phases: [
          {
            phase: "shadow",
            ai_traffic: 0.0,
            ai_shadow: true,
            description: "Log predictions only",
          },
          {
            phase: "canary",
            ai_traffic: 0.1,
            ai_shadow: true,
            description: "10% traffic with monitoring",
          },
          {
            phase: "partial",
            ai_traffic: 0.5,
            ai_shadow: false,
            description: "50% traffic rollout",
          },
          {
            phase: "full",
            ai_traffic: 1.0,
            ai_shadow: false,
            description: "Full production traffic",
          },
        ],
      },
    });
  } catch (error) {
    console.error("Error getting feature flag metadata:", error);
    res.status(500).json({ error: "Failed to get metadata" });
  }
});

// GET /feature-flags/audit/history - Get flag change history
router.get("/audit/history", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const history = await redisClient.lrange(
      "audit:flag_changes",
      0,
      limit - 1,
    );

    const changes = history.map((change) => JSON.parse(change));

    res.json({
      changes: changes,
      total_returned: changes.length,
    });
  } catch (error) {
    console.error("Error getting flag change history:", error);
    res.status(500).json({ error: "Failed to get change history" });
  }
});

// POST /feature-flags/rollout/:phase - Execute predefined rollout phase
router.post("/rollout/:phase", async (req, res) => {
  try {
    const { phase } = req.params;

    const rolloutPhases = {
      shadow: { AI_TRAFFIC: 0.0, AI_SHADOW: true, SUPPRESS_AI_ALERTS: false },
      canary: { AI_TRAFFIC: 0.1, AI_SHADOW: true, SUPPRESS_AI_ALERTS: false },
      partial: { AI_TRAFFIC: 0.5, AI_SHADOW: false, SUPPRESS_AI_ALERTS: false },
      full: { AI_TRAFFIC: 1.0, AI_SHADOW: false, SUPPRESS_AI_ALERTS: false },
      rollback: { AI_TRAFFIC: 0.0, AI_SHADOW: true, SUPPRESS_AI_ALERTS: true },
    };

    if (!rolloutPhases[phase]) {
      return res.status(400).json({
        error: `Unknown rollout phase: ${phase}`,
        available_phases: Object.keys(rolloutPhases),
      });
    }

    const phaseConfig = rolloutPhases[phase];
    const results = {};

    for (const [flagName, value] of Object.entries(phaseConfig)) {
      await setFlag(flagName, value);
      results[flagName] = value;
    }

    res.json({
      phase: phase,
      configured_flags: results,
      executed_at: new Date().toISOString(),
      message: `Successfully executed ${phase} rollout phase`,
    });
  } catch (error) {
    console.error(`Error executing rollout phase ${req.params.phase}:`, error);
    res.status(500).json({ error: "Failed to execute rollout phase" });
  }
});

// Middleware to check if AI traffic is enabled for a request
function aiTrafficGate(req, res, next) {
  getFlag("AI_TRAFFIC")
    .then((aiTraffic) => {
      if (Math.random() < aiTraffic) {
        req.useAI = true;
      } else {
        req.useAI = false;
      }
      next();
    })
    .catch((error) => {
      console.error("Error in AI traffic gate:", error);
      req.useAI = false; // Default to control on error
      next();
    });
}

// Initialize flags on startup
initializeFlags().catch(console.error);

module.exports = {
  router,
  getFlag,
  setFlag,
  aiTrafficGate,
  initializeFlags,
};
