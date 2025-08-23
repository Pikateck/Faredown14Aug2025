/**
 * Redis Hot Cache Service
 * Manages Redis keys with proper TTLs as specified in final package
 */

const Redis = require("redis");

class RedisHotCacheService {
  constructor() {
    this.client = Redis.createClient({
      host: process.env.REDIS_HOST || "localhost",
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD,
      retryStrategy: (times) => Math.min(times * 50, 2000),
    });

    // TTL configurations as per specification
    this.ttlConfig = {
      POLICIES: 0, // policies:active - no TTL (never expire)
      RATES: 300, // rates:{canonical_key} - 3-5 min (using 5 min)
      USER_FEATURES: 86400, // features:user:{user_id} - 24h
      PRODUCT_FEATURES: 86400, // features:product:{canonical_key} - 24h
      SESSION: 1800, // session:{uuid} - 30 min
      CONFIG: 0, // config:models - no TTL
    };

    this.connected = false;
    this.hitCount = 0;
    this.missCount = 0;
  }

  async connect() {
    try {
      await this.client.connect();
      this.connected = true;
      console.log("🔌 Redis hot cache connected");

      // Set up event listeners
      this.client.on("error", (err) => {
        console.error("❌ Redis error:", err);
        this.connected = false;
      });

      this.client.on("reconnecting", () => {
        console.log("🔄 Redis reconnecting...");
      });
    } catch (error) {
      console.error("❌ Redis connection failed:", error);
      this.connected = false;
      throw error;
    }
  }

  async disconnect() {
    if (this.connected) {
      await this.client.quit();
      this.connected = false;
      console.log("🔌 Redis disconnected");
    }
  }

  // ===== POLICY CACHE (no TTL) =====

  async setPolicies(policyData) {
    if (!this.connected) return false;

    try {
      await this.client.set("policies:active", JSON.stringify(policyData));
      console.log("📋 Policies cached (no TTL)");
      return true;
    } catch (error) {
      console.error("❌ Failed to cache policies:", error);
      return false;
    }
  }

  async getPolicies() {
    if (!this.connected) return null;

    try {
      const data = await this.client.get("policies:active");
      if (data) {
        this.hitCount++;
        return JSON.parse(data);
      } else {
        this.missCount++;
        return null;
      }
    } catch (error) {
      console.error("❌ Failed to get policies:", error);
      this.missCount++;
      return null;
    }
  }

  // ===== RATE CACHE (3-5 min TTL) =====

  async setRates(canonicalKey, rateData) {
    if (!this.connected) return false;

    try {
      const key = `rates:${canonicalKey}`;
      await this.client.setEx(
        key,
        this.ttlConfig.RATES,
        JSON.stringify(rateData),
      );
      return true;
    } catch (error) {
      console.error(`❌ Failed to cache rates for ${canonicalKey}:`, error);
      return false;
    }
  }

  async getRates(canonicalKey) {
    if (!this.connected) return null;

    try {
      const key = `rates:${canonicalKey}`;
      const data = await this.client.get(key);
      if (data) {
        this.hitCount++;
        return JSON.parse(data);
      } else {
        this.missCount++;
        return null;
      }
    } catch (error) {
      console.error(`❌ Failed to get rates for ${canonicalKey}:`, error);
      this.missCount++;
      return null;
    }
  }

  // ===== USER FEATURES (24h TTL) =====

  async setUserFeatures(userId, features) {
    if (!this.connected) return false;

    try {
      const key = `features:user:${userId}`;
      await this.client.setEx(
        key,
        this.ttlConfig.USER_FEATURES,
        JSON.stringify(features),
      );
      return true;
    } catch (error) {
      console.error(`❌ Failed to cache user features for ${userId}:`, error);
      return false;
    }
  }

  async getUserFeatures(userId) {
    if (!this.connected) return null;

    try {
      const key = `features:user:${userId}`;
      const data = await this.client.get(key);
      if (data) {
        this.hitCount++;
        return JSON.parse(data);
      } else {
        this.missCount++;
        return null;
      }
    } catch (error) {
      console.error(`❌ Failed to get user features for ${userId}:`, error);
      this.missCount++;
      return null;
    }
  }

  // ===== PRODUCT FEATURES (24h TTL) =====

  async setProductFeatures(canonicalKey, features) {
    if (!this.connected) return false;

    try {
      const key = `features:product:${canonicalKey}`;
      await this.client.setEx(
        key,
        this.ttlConfig.PRODUCT_FEATURES,
        JSON.stringify(features),
      );
      return true;
    } catch (error) {
      console.error(
        `❌ Failed to cache product features for ${canonicalKey}:`,
        error,
      );
      return false;
    }
  }

  async getProductFeatures(canonicalKey) {
    if (!this.connected) return null;

    try {
      const key = `features:product:${canonicalKey}`;
      const data = await this.client.get(key);
      if (data) {
        this.hitCount++;
        return JSON.parse(data);
      } else {
        this.missCount++;
        return null;
      }
    } catch (error) {
      console.error(
        `❌ Failed to get product features for ${canonicalKey}:`,
        error,
      );
      this.missCount++;
      return null;
    }
  }

  // ===== SESSION CACHE (30 min TTL) =====

  async setSession(sessionId, sessionData) {
    if (!this.connected) return false;

    try {
      const key = `session:${sessionId}`;
      // Compact session state - only essential data
      const compactData = {
        user_id: sessionData.user_id,
        canonical_key: sessionData.canonical_key,
        true_cost: sessionData.true_cost,
        min_floor: sessionData.min_floor,
        created_at: sessionData.created_at,
      };
      await this.client.setEx(
        key,
        this.ttlConfig.SESSION,
        JSON.stringify(compactData),
      );
      return true;
    } catch (error) {
      console.error(`❌ Failed to cache session ${sessionId}:`, error);
      return false;
    }
  }

  async getSession(sessionId) {
    if (!this.connected) return null;

    try {
      const key = `session:${sessionId}`;
      const data = await this.client.get(key);
      if (data) {
        this.hitCount++;
        return JSON.parse(data);
      } else {
        this.missCount++;
        return null;
      }
    } catch (error) {
      console.error(`❌ Failed to get session ${sessionId}:`, error);
      this.missCount++;
      return null;
    }
  }

  // ===== MODEL CONFIG CACHE (no TTL) =====

  async setModelConfig(modelData) {
    if (!this.connected) return false;

    try {
      await this.client.set("config:models", JSON.stringify(modelData));
      console.log("🤖 Model config cached (no TTL)");
      return true;
    } catch (error) {
      console.error("❌ Failed to cache model config:", error);
      return false;
    }
  }

  async getModelConfig() {
    if (!this.connected) return null;

    try {
      const data = await this.client.get("config:models");
      if (data) {
        this.hitCount++;
        return JSON.parse(data);
      } else {
        this.missCount++;
        return null;
      }
    } catch (error) {
      console.error("❌ Failed to get model config:", error);
      this.missCount++;
      return null;
    }
  }

  // ===== BULK OPERATIONS =====

  async warmTopCPOs(cpoList) {
    if (!this.connected) return false;

    console.log(`🔥 Warming ${cpoList.length} top CPOs...`);
    let warmed = 0;

    for (const cpo of cpoList) {
      // Generate mock rate data for warming
      const mockRates = {
        canonical_key: cpo,
        suppliers: {
          AMADEUS: {
            price: 150 + Math.random() * 300,
            available: true,
            last_seen: new Date().toISOString(),
          },
          HOTELBEDS: {
            price: 100 + Math.random() * 200,
            available: true,
            last_seen: new Date().toISOString(),
          },
        },
        best_price: 100 + Math.random() * 250,
        last_updated: new Date().toISOString(),
      };

      if (await this.setRates(cpo, mockRates)) {
        warmed++;
      }
    }

    console.log(`✅ Warmed ${warmed}/${cpoList.length} CPOs`);
    return warmed;
  }

  // ===== HEALTH & METRICS =====

  async getHealthStatus() {
    try {
      if (!this.connected) {
        return {
          status: "disconnected",
          hit_rate: 0,
          total_requests: 0,
        };
      }

      const info = await this.client.info("stats");
      const lines = info.split("\r\n");

      let keyspaceHits = 0;
      let keyspaceMisses = 0;

      for (const line of lines) {
        if (line.startsWith("keyspace_hits:")) {
          keyspaceHits = parseInt(line.split(":")[1]);
        } else if (line.startsWith("keyspace_misses:")) {
          keyspaceMisses = parseInt(line.split(":")[1]);
        }
      }

      const totalRequests = keyspaceHits + keyspaceMisses;
      const hitRate =
        totalRequests > 0 ? (keyspaceHits / totalRequests) * 100 : 0;

      return {
        status: "connected",
        hit_rate: hitRate.toFixed(2),
        keyspace_hits: keyspaceHits,
        keyspace_misses: keyspaceMisses,
        total_requests: totalRequests,
        app_hits: this.hitCount,
        app_misses: this.missCount,
      };
    } catch (error) {
      console.error("❌ Failed to get Redis health:", error);
      return {
        status: "error",
        error: error.message,
      };
    }
  }

  async getCacheKeys() {
    if (!this.connected) return [];

    try {
      const keys = await this.client.keys("*");
      const categorized = {
        policies: keys.filter((k) => k.startsWith("policies:")),
        rates: keys.filter((k) => k.startsWith("rates:")),
        features: keys.filter((k) => k.startsWith("features:")),
        sessions: keys.filter((k) => k.startsWith("session:")),
        config: keys.filter((k) => k.startsWith("config:")),
      };

      return {
        total: keys.length,
        by_category: categorized,
        sample_keys: keys.slice(0, 10),
      };
    } catch (error) {
      console.error("❌ Failed to get cache keys:", error);
      return [];
    }
  }

  // ===== MAINTENANCE =====

  async flushStaleKeys() {
    if (!this.connected) return false;

    try {
      // Only flush expired keys, not keys with no TTL
      const keys = await this.client.keys("rates:*");
      let flushed = 0;

      for (const key of keys) {
        const ttl = await this.client.ttl(key);
        if (ttl === -1) {
          // Key exists but has no TTL (should have one)
          await this.client.del(key);
          flushed++;
        }
      }

      if (flushed > 0) {
        console.log(`🧹 Flushed ${flushed} stale rate keys`);
      }

      return flushed;
    } catch (error) {
      console.error("❌ Failed to flush stale keys:", error);
      return false;
    }
  }

  // ===== INITIALIZATION =====

  async initialize() {
    console.log("🚀 Initializing Redis hot cache...");

    await this.connect();

    // Set up default configurations
    const defaultModels = {
      propensity_model: {
        version: "v2.1.0",
        accuracy: 0.87,
        features: 17,
        path: "/models/propensity_v2.1.pkl",
      },
      pricing_model: {
        version: "v1.8.2",
        mse: 0.043,
        features: 12,
        path: "/models/pricing_v1.8.pkl",
      },
      last_updated: new Date().toISOString(),
    };

    await this.setModelConfig(defaultModels);

    console.log("✅ Redis hot cache initialized");

    return this.getHealthStatus();
  }
}

module.exports = RedisHotCacheService;

// Export singleton instance
const redisHotCache = new RedisHotCacheService();
module.exports.redisHotCache = redisHotCache;
