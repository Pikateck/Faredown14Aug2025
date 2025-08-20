/**
 * Feature Flags API for AI Bargain System
 * Allows real-time control of AI behavior and features
 */

const express = require("express");
const router = express.Router();
const db = require("../database/connection");

// Middleware for admin authentication (reuse existing auth)
const authenticateToken = require("../middleware/auth").authenticateToken;
const requireAdmin = require("../middleware/auth").requireAdmin;

/**
 * GET /feature-flags
 * Get all feature flags
 */
router.get("/", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT key, enabled, payload, updated_at 
      FROM features 
      ORDER BY key
    `);

    const flags = {};
    result.rows.forEach(row => {
      flags[row.key] = {
        enabled: row.enabled,
        payload: row.payload,
        updatedAt: row.updated_at
      };
    });

    res.json({
      flags,
      count: result.rows.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Get feature flags error:", error);
    res.status(500).json({
      error: "Failed to fetch feature flags",
      code: "INTERNAL_ERROR"
    });
  }
});

/**
 * GET /feature-flags/:key
 * Get specific feature flag
 */
router.get("/:key", async (req, res) => {
  try {
    const { key } = req.params;

    const result = await db.query(
      "SELECT key, enabled, payload, updated_at FROM features WHERE key = $1",
      [key]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Feature flag not found",
        code: "FLAG_NOT_FOUND",
        key
      });
    }

    const flag = result.rows[0];

    res.json({
      key: flag.key,
      enabled: flag.enabled,
      payload: flag.payload,
      updatedAt: flag.updated_at
    });

  } catch (error) {
    console.error("Get feature flag error:", error);
    res.status(500).json({
      error: "Failed to fetch feature flag",
      code: "INTERNAL_ERROR"
    });
  }
});

/**
 * PUT /feature-flags/:key
 * Update feature flag (admin only)
 */
router.put("/:key", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { key } = req.params;
    const { enabled, payload } = req.body;

    // Validation
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({
        error: "enabled field must be a boolean",
        code: "INVALID_INPUT"
      });
    }

    // Update or insert feature flag
    const result = await db.query(`
      INSERT INTO features (key, enabled, payload, updated_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (key) 
      DO UPDATE SET 
        enabled = EXCLUDED.enabled,
        payload = EXCLUDED.payload,
        updated_at = NOW()
      RETURNING key, enabled, payload, updated_at
    `, [key, enabled, payload || {}]);

    const updatedFlag = result.rows[0];

    // Log the change
    console.log(`Feature flag updated: ${key} = ${enabled} by admin`);

    res.json({
      key: updatedFlag.key,
      enabled: updatedFlag.enabled,
      payload: updatedFlag.payload,
      updatedAt: updatedFlag.updated_at,
      message: "Feature flag updated successfully"
    });

  } catch (error) {
    console.error("Update feature flag error:", error);
    res.status(500).json({
      error: "Failed to update feature flag",
      code: "INTERNAL_ERROR"
    });
  }
});

/**
 * POST /feature-flags/bulk
 * Bulk update multiple feature flags (admin only)
 */
router.post("/bulk", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { flags } = req.body;

    if (!Array.isArray(flags)) {
      return res.status(400).json({
        error: "flags must be an array",
        code: "INVALID_INPUT"
      });
    }

    const results = [];

    // Use transaction for bulk update
    await db.transaction(async (client) => {
      for (const flag of flags) {
        const { key, enabled, payload } = flag;

        if (!key || typeof enabled !== 'boolean') {
          throw new Error(`Invalid flag: ${JSON.stringify(flag)}`);
        }

        const result = await client.query(`
          INSERT INTO features (key, enabled, payload, updated_at)
          VALUES ($1, $2, $3, NOW())
          ON CONFLICT (key) 
          DO UPDATE SET 
            enabled = EXCLUDED.enabled,
            payload = EXCLUDED.payload,
            updated_at = NOW()
          RETURNING key, enabled, payload, updated_at
        `, [key, enabled, payload || {}]);

        results.push(result.rows[0]);
      }
    });

    console.log(`Bulk feature flags update: ${results.length} flags updated by admin`);

    res.json({
      updated: results,
      count: results.length,
      message: "Feature flags updated successfully"
    });

  } catch (error) {
    console.error("Bulk update feature flags error:", error);
    res.status(500).json({
      error: "Failed to update feature flags",
      code: "INTERNAL_ERROR",
      details: error.message
    });
  }
});

/**
 * DELETE /feature-flags/:key
 * Delete feature flag (admin only)
 */
router.delete("/:key", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { key } = req.params;

    const result = await db.query(
      "DELETE FROM features WHERE key = $1 RETURNING key",
      [key]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Feature flag not found",
        code: "FLAG_NOT_FOUND",
        key
      });
    }

    console.log(`Feature flag deleted: ${key} by admin`);

    res.json({
      key,
      message: "Feature flag deleted successfully"
    });

  } catch (error) {
    console.error("Delete feature flag error:", error);
    res.status(500).json({
      error: "Failed to delete feature flag",
      code: "INTERNAL_ERROR"
    });
  }
});

/**
 * GET /feature-flags/check/:key
 * Quick check if feature is enabled (public endpoint for frontend)
 */
router.get("/check/:key", async (req, res) => {
  try {
    const { key } = req.params;

    const result = await db.query(
      "SELECT enabled FROM features WHERE key = $1",
      [key]
    );

    const enabled = result.rows.length > 0 ? result.rows[0].enabled : false;

    res.json({
      key,
      enabled,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Check feature flag error:", error);
    res.status(500).json({
      error: "Failed to check feature flag",
      code: "INTERNAL_ERROR"
    });
  }
});

/**
 * GET /feature-flags/ai/config
 * Get AI-specific configuration (public for bargain system)
 */
router.get("/ai/config", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT key, enabled, payload 
      FROM features 
      WHERE key LIKE 'ai_%' OR key IN ('visible_rounds_mode', 'hidden_rounds_mode', 'copy_pack_rotation', 'urgency_messaging')
    `);

    const config = {};
    result.rows.forEach(row => {
      config[row.key] = {
        enabled: row.enabled,
        ...row.payload
      };
    });

    res.json({
      config,
      timestamp: new Date().toISOString(),
      version: "1.0.0"
    });

  } catch (error) {
    console.error("Get AI config error:", error);
    res.status(500).json({
      error: "Failed to get AI configuration",
      code: "INTERNAL_ERROR"
    });
  }
});

/**
 * POST /feature-flags/preset/:preset
 * Apply predefined feature flag presets (admin only)
 */
router.post("/preset/:preset", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { preset } = req.params;

    let presetFlags = [];

    switch (preset) {
      case 'conservative':
        presetFlags = [
          { key: 'ai_bargain_enabled', enabled: true },
          { key: 'emotional_intelligence', enabled: false },
          { key: 'visible_rounds_mode', enabled: true },
          { key: 'hidden_rounds_mode', enabled: false },
          { key: 'urgency_messaging', enabled: false },
          { key: 'copy_pack_rotation', enabled: false }
        ];
        break;

      case 'aggressive':
        presetFlags = [
          { key: 'ai_bargain_enabled', enabled: true },
          { key: 'emotional_intelligence', enabled: true },
          { key: 'visible_rounds_mode', enabled: false },
          { key: 'hidden_rounds_mode', enabled: true },
          { key: 'urgency_messaging', enabled: true },
          { key: 'copy_pack_rotation', enabled: true }
        ];
        break;

      case 'balanced':
        presetFlags = [
          { key: 'ai_bargain_enabled', enabled: true },
          { key: 'emotional_intelligence', enabled: true },
          { key: 'visible_rounds_mode', enabled: true },
          { key: 'hidden_rounds_mode', enabled: false },
          { key: 'urgency_messaging', enabled: true },
          { key: 'copy_pack_rotation', enabled: true }
        ];
        break;

      case 'disabled':
        presetFlags = [
          { key: 'ai_bargain_enabled', enabled: false },
          { key: 'emotional_intelligence', enabled: false },
          { key: 'visible_rounds_mode', enabled: false },
          { key: 'hidden_rounds_mode', enabled: false },
          { key: 'urgency_messaging', enabled: false },
          { key: 'copy_pack_rotation', enabled: false }
        ];
        break;

      default:
        return res.status(400).json({
          error: "Invalid preset",
          code: "INVALID_PRESET",
          available: ['conservative', 'aggressive', 'balanced', 'disabled']
        });
    }

    // Apply preset
    const results = [];
    await db.transaction(async (client) => {
      for (const flag of presetFlags) {
        const result = await client.query(`
          INSERT INTO features (key, enabled, payload, updated_at)
          VALUES ($1, $2, $3, NOW())
          ON CONFLICT (key) 
          DO UPDATE SET enabled = EXCLUDED.enabled, updated_at = NOW()
          RETURNING key, enabled
        `, [flag.key, flag.enabled, {}]);

        results.push(result.rows[0]);
      }
    });

    console.log(`Feature preset '${preset}' applied by admin`);

    res.json({
      preset,
      applied: results,
      count: results.length,
      message: `Preset '${preset}' applied successfully`
    });

  } catch (error) {
    console.error("Apply preset error:", error);
    res.status(500).json({
      error: "Failed to apply preset",
      code: "INTERNAL_ERROR"
    });
  }
});

module.exports = router;
