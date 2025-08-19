/**
 * Redis Service for AI Bargaining Platform
 * Handles caching and feature store with hot key patterns
 */

const redis = require("redis");
const winston = require("winston");

class RedisService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.logger = winston.createLogger({
      level: "info",
      format: winston.format.json(),
      transports: [new winston.transports.Console()],
    });

    // Cache configuration
    this.TTL = {
      POLICIES: 0, // Never expire (until manually updated)
      USER_FEATURES: 24 * 60 * 60, // 24 hours
      PRODUCT_FEATURES: 24 * 60 * 60, // 24 hours
      SUPPLIER_RATES: 5 * 60, // 5 minutes
      SESSION_STATE: 30 * 60, // 30 minutes
      MODEL_CONFIG: 60 * 60, // 1 hour
      AB_CONFIG: 60 * 60, // 1 hour
    };
  }

  /**
   * Initialize Redis connection
   */
  async init() {
    try {
      const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

      this.client = redis.createClient({
        url: redisUrl,
        password: process.env.REDIS_PASSWORD,
        socket: {
          reconnectStrategy: (retries) => Math.min(retries * 50, 500),
        },
      });

      this.client.on("error", (err) => {
        this.logger.error("Redis Client Error:", err);
        this.connected = false;
      });

      this.client.on("connect", () => {
        this.logger.info("Redis connected successfully");
        this.connected = true;
      });

      this.client.on("ready", () => {
        this.logger.info("Redis ready for commands");
      });

      this.client.on("end", () => {
        this.logger.warn("Redis connection ended");
        this.connected = false;
      });

      await this.client.connect();
      return true;
    } catch (error) {
      this.logger.error("Failed to initialize Redis:", error);
      return false;
    }
  }

  /**
   * Check if Redis is connected
   */
  isConnected() {
    return this.connected && this.client?.isReady;
  }

  /**
   * Graceful shutdown
   */
  async close() {
    if (this.client) {
      await this.client.quit();
      this.connected = false;
    }
  }

  // ==========================================
  // AI BARGAINING SPECIFIC CACHE METHODS
  // ==========================================

  /**
   * Policy Management
   */
  async setActivePolicy(policyData) {
    if (!this.isConnected()) return false;
    try {
      await this.client.set("policies:active", JSON.stringify(policyData));
      this.logger.info("Active policy cached");
      return true;
    } catch (error) {
      this.logger.error("Failed to cache active policy:", error);
      return false;
    }
  }

  async getActivePolicy() {
    if (!this.isConnected()) return null;
    try {
      const data = await this.client.get("policies:active");
      return data ? JSON.parse(data) : null;
    } catch (error) {
      this.logger.error("Failed to get active policy:", error);
      return null;
    }
  }

  /**
   * User Feature Store
   */
  async setUserFeatures(userId, features) {
    if (!this.isConnected()) return false;
    try {
      await this.client.setEx(
        `features:user:${userId}`,
        this.TTL.USER_FEATURES,
        JSON.stringify(features),
      );
      return true;
    } catch (error) {
      this.logger.error("Failed to cache user features:", error);
      return false;
    }
  }

  async getUserFeatures(userId) {
    if (!this.isConnected()) return null;
    try {
      const data = await this.client.get(`features:user:${userId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      this.logger.error("Failed to get user features:", error);
      return null;
    }
  }

  /**
   * Product Feature Store
   */
  async setProductFeatures(canonicalKey, features) {
    if (!this.isConnected()) return false;
    try {
      await this.client.setEx(
        `features:product:${canonicalKey}`,
        this.TTL.PRODUCT_FEATURES,
        JSON.stringify(features),
      );
      return true;
    } catch (error) {
      this.logger.error("Failed to cache product features:", error);
      return false;
    }
  }

  async getProductFeatures(canonicalKey) {
    if (!this.isConnected()) return null;
    try {
      const data = await this.client.get(`features:product:${canonicalKey}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      this.logger.error("Failed to get product features:", error);
      return null;
    }
  }

  /**
   * Supplier Rate Snapshots (Hot Cache)
   */
  async setSupplierRates(canonicalKey, snapshots) {
    if (!this.isConnected()) return false;
    try {
      await this.client.setEx(
        `rates:${canonicalKey}`,
        this.TTL.SUPPLIER_RATES,
        JSON.stringify(snapshots),
      );
      return true;
    } catch (error) {
      this.logger.error("Failed to cache supplier rates:", error);
      return false;
    }
  }

  async getSupplierRates(canonicalKey) {
    if (!this.isConnected()) return null;
    try {
      const data = await this.client.get(`rates:${canonicalKey}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      this.logger.error("Failed to get supplier rates:", error);
      return null;
    }
  }

  /**
   * Session State Management
   */
  async setSessionState(sessionId, state) {
    if (!this.isConnected()) return false;
    try {
      await this.client.setEx(
        `sessions:${sessionId}`,
        this.TTL.SESSION_STATE,
        JSON.stringify(state),
      );
      return true;
    } catch (error) {
      this.logger.error("Failed to cache session state:", error);
      return false;
    }
  }

  async getSessionState(sessionId) {
    if (!this.isConnected()) return null;
    try {
      const data = await this.client.get(`sessions:${sessionId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      this.logger.error("Failed to get session state:", error);
      return null;
    }
  }

  async deleteSessionState(sessionId) {
    if (!this.isConnected()) return false;
    try {
      await this.client.del(`sessions:${sessionId}`);
      return true;
    } catch (error) {
      this.logger.error("Failed to delete session state:", error);
      return false;
    }
  }

  /**
   * Model Configuration Cache
   */
  async setModelConfig(config) {
    if (!this.isConnected()) return false;
    try {
      await this.client.setEx(
        "config:models",
        this.TTL.MODEL_CONFIG,
        JSON.stringify(config),
      );
      return true;
    } catch (error) {
      this.logger.error("Failed to cache model config:", error);
      return false;
    }
  }

  async getModelConfig() {
    if (!this.isConnected()) return null;
    try {
      const data = await this.client.get("config:models");
      return data ? JSON.parse(data) : null;
    } catch (error) {
      this.logger.error("Failed to get model config:", error);
      return null;
    }
  }

  /**
   * A/B Test Configuration
   */
  async setABConfig(config) {
    if (!this.isConnected()) return false;
    try {
      await this.client.setEx(
        "config:ab_tests",
        this.TTL.AB_CONFIG,
        JSON.stringify(config),
      );
      return true;
    } catch (error) {
      this.logger.error("Failed to cache A/B config:", error);
      return false;
    }
  }

  async getABConfig() {
    if (!this.isConnected()) return null;
    try {
      const data = await this.client.get("config:ab_tests");
      return data ? JSON.parse(data) : null;
    } catch (error) {
      this.logger.error("Failed to get A/B config:", error);
      return null;
    }
  }

  // ==========================================
  // BULK OPERATIONS
  // ==========================================

  /**
   * Warm cache with top products
   */
  async warmCache(topProducts = []) {
    if (!this.isConnected()) return false;

    try {
      this.logger.info(`Warming cache for ${topProducts.length} products`);

      const pipeline = this.client.multi();

      for (const product of topProducts) {
        // Pre-cache supplier rates for hot products
        pipeline.setEx(
          `rates:${product.canonical_key}`,
          this.TTL.SUPPLIER_RATES,
          JSON.stringify(product.snapshots || []),
        );

        // Pre-cache product features
        if (product.features) {
          pipeline.setEx(
            `features:product:${product.canonical_key}`,
            this.TTL.PRODUCT_FEATURES,
            JSON.stringify(product.features),
          );
        }
      }

      await pipeline.exec();
      this.logger.info("Cache warmed successfully");
      return true;
    } catch (error) {
      this.logger.error("Failed to warm cache:", error);
      return false;
    }
  }

  /**
   * Clear all bargain-related cache
   */
  async clearBargainCache() {
    if (!this.isConnected()) return false;

    try {
      const patterns = [
        "policies:*",
        "features:*",
        "rates:*",
        "sessions:*",
        "config:*",
      ];

      for (const pattern of patterns) {
        const keys = await this.client.keys(pattern);
        if (keys.length > 0) {
          await this.client.del(keys);
        }
      }

      this.logger.info("Bargain cache cleared");
      return true;
    } catch (error) {
      this.logger.error("Failed to clear bargain cache:", error);
      return false;
    }
  }

  // ==========================================
  // MONITORING & HEALTH
  // ==========================================

  /**
   * Get cache health metrics
   */
  async getHealthMetrics() {
    if (!this.isConnected()) return null;

    try {
      const info = await this.client.info("memory");
      const keyspace = await this.client.info("keyspace");

      // Count bargain-related keys
      const bargainKeys = {
        policies: (await this.client.keys("policies:*")).length,
        features: (await this.client.keys("features:*")).length,
        rates: (await this.client.keys("rates:*")).length,
        sessions: (await this.client.keys("sessions:*")).length,
        config: (await this.client.keys("config:*")).length,
      };

      return {
        connected: this.connected,
        memory_info: info,
        keyspace_info: keyspace,
        bargain_keys: bargainKeys,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error("Failed to get health metrics:", error);
      return null;
    }
  }

  /**
   * Generic cache methods for fallback
   */
  async set(key, value, ttl = null) {
    if (!this.isConnected()) return false;
    try {
      if (ttl) {
        await this.client.setEx(key, ttl, JSON.stringify(value));
      } else {
        await this.client.set(key, JSON.stringify(value));
      }
      return true;
    } catch (error) {
      this.logger.error("Failed to set cache key:", error);
      return false;
    }
  }

  async get(key) {
    if (!this.isConnected()) return null;
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      this.logger.error("Failed to get cache key:", error);
      return null;
    }
  }

  async del(key) {
    if (!this.isConnected()) return false;
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      this.logger.error("Failed to delete cache key:", error);
      return false;
    }
  }

  async exists(key) {
    if (!this.isConnected()) return false;
    try {
      return await this.client.exists(key);
    } catch (error) {
      this.logger.error("Failed to check key existence:", error);
      return false;
    }
  }
}

// Export singleton instance
const redisService = new RedisService();

module.exports = redisService;
