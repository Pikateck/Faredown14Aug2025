#!/usr/bin/env node
/**
 * Supplier Fabric Worker
 * Pulls rates from Amadeus (flights) and Hotelbeds (hotels, sightseeing)
 * Normalizes into CPO and writes to DB + Redis with circuit breakers
 */

const { Client } = require("pg");
const { redisHotCache } = require("../services/redisHotCache");
const crypto = require("crypto");

class CircuitBreaker {
  constructor(threshold = 5, timeout = 30000) {
    this.failureThreshold = threshold;
    this.resetTimeout = timeout;
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.state = "CLOSED"; // CLOSED, OPEN, HALF_OPEN
  }

  async execute(operation) {
    if (this.state === "OPEN") {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = "HALF_OPEN";
      } else {
        throw new Error("Circuit breaker is OPEN");
      }
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
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.failureThreshold) {
      this.state = "OPEN";
    }
  }

  getState() {
    return {
      state: this.state,
      failures: this.failureCount,
      threshold: this.failureThreshold,
      lastFailure: this.lastFailureTime,
    };
  }
}

class SupplierFabricWorker {
  constructor() {
    this.pg = new Client({
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || "faredown",
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD,
    });

    // Circuit breakers for each supplier
    this.circuitBreakers = {
      AMADEUS: new CircuitBreaker(5, 30000),
      HOTELBEDS: new CircuitBreaker(5, 30000),
    };

    // SLA metrics
    this.metrics = {
      AMADEUS: { requests: 0, successes: 0, failures: 0, totalLatency: 0 },
      HOTELBEDS: { requests: 0, successes: 0, failures: 0, totalLatency: 0 },
    };

    // Top 1k CPOs for hotset refresh
    this.hotset = [];
    this.isRunning = false;
  }

  async connect() {
    await this.pg.connect();
    await redisHotCache.connect();
    console.log("🔌 Supplier fabric worker connected to DB and Redis");
  }

  async disconnect() {
    await this.pg.end();
    await redisHotCache.disconnect();
    console.log("🔌 Supplier fabric worker disconnected");
  }

  // ===== CPO GENERATION =====

  generateCPO(productType, attrs) {
    let cpo = "";

    switch (productType) {
      case "flight":
        // FL:AI-DEL-BOM-2024-06-15-E
        cpo = `FL:${attrs.airline}-${attrs.origin}-${attrs.dest}-${attrs.date}-${attrs.class.charAt(0).toUpperCase()}`;
        break;

      case "hotel":
        // HT:hotel_id:room_type:board_type:cancellation
        cpo = `HT:${attrs.hotel_id}:${attrs.room_type}:${attrs.board_type}:${attrs.cancellation}`;
        break;

      case "sightseeing":
        // ST:activity_id:pax_type:language
        cpo = `ST:${attrs.activity_id}:${attrs.pax_type}:${attrs.language}`;
        break;

      default:
        throw new Error(`Unsupported product type: ${productType}`);
    }

    return cpo;
  }

  // ===== AMADEUS INTEGRATION =====

  async fetchAmadeusRates(cpoList) {
    console.log(`🛩️ Fetching Amadeus rates for ${cpoList.length} CPOs...`);

    return this.circuitBreakers.AMADEUS.execute(async () => {
      const startTime = Date.now();
      this.metrics.AMADEUS.requests++;

      try {
        // Mock Amadeus API response for now
        const rates = [];

        for (const cpo of cpoList) {
          if (!cpo.startsWith("FL:")) continue;

          // Parse CPO: FL:AI-DEL-BOM-2024-06-15-E
          const parts = cpo.split("-");
          const airline = parts[0].split(":")[1];
          const origin = parts[1];
          const dest = parts[2];
          const date = parts[3];
          const classCode = parts[4];

          // Simulate API call with backoff + jitter
          await this.sleep(50 + Math.random() * 100);

          const basePrice = 150 + Math.random() * 400;
          const trueCost = basePrice * (0.75 + Math.random() * 0.15); // 75-90% of displayed

          rates.push({
            canonical_key: cpo,
            supplier_id: 1, // AMADEUS
            raw_response: {
              airline: airline,
              origin: origin,
              destination: dest,
              departure_date: date,
              class: classCode,
              price: basePrice,
              currency: "USD",
              available_seats: Math.floor(Math.random() * 9) + 1,
              timestamp: new Date().toISOString(),
            },
            parsed_price_usd: basePrice,
            true_cost_usd: trueCost,
            available_inventory: Math.floor(Math.random() * 9) + 1,
            expires_at: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
          });
        }

        const latency = Date.now() - startTime;
        this.metrics.AMADEUS.successes++;
        this.metrics.AMADEUS.totalLatency += latency;

        console.log(`✅ Amadeus: ${rates.length} rates in ${latency}ms`);
        return rates;
      } catch (error) {
        this.metrics.AMADEUS.failures++;
        console.error("❌ Amadeus fetch failed:", error);
        throw error;
      }
    });
  }

  // ===== HOTELBEDS INTEGRATION =====

  async fetchHotelbedsRates(cpoList) {
    console.log(`🏨 Fetching Hotelbeds rates for ${cpoList.length} CPOs...`);

    return this.circuitBreakers.HOTELBEDS.execute(async () => {
      const startTime = Date.now();
      this.metrics.HOTELBEDS.requests++;

      try {
        const rates = [];

        for (const cpo of cpoList) {
          if (!cpo.startsWith("HT:") && !cpo.startsWith("ST:")) continue;

          // Simulate API call with backoff + jitter
          await this.sleep(30 + Math.random() * 80);

          const basePrice = cpo.startsWith("HT:")
            ? 80 + Math.random() * 200
            : 25 + Math.random() * 100;
          const trueCost = basePrice * (0.7 + Math.random() * 0.2); // 70-90% of displayed

          rates.push({
            canonical_key: cpo,
            supplier_id: 2, // HOTELBEDS
            raw_response: {
              product_type: cpo.startsWith("HT:") ? "hotel" : "sightseeing",
              rate: basePrice,
              currency: "USD",
              available: true,
              check_in: "2024-06-15",
              check_out: "2024-06-17",
              timestamp: new Date().toISOString(),
            },
            parsed_price_usd: basePrice,
            true_cost_usd: trueCost,
            available_inventory: cpo.startsWith("ST:")
              ? 50
              : Math.floor(Math.random() * 10) + 1,
            expires_at: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
          });
        }

        const latency = Date.now() - startTime;
        this.metrics.HOTELBEDS.successes++;
        this.metrics.HOTELBEDS.totalLatency += latency;

        console.log(`✅ Hotelbeds: ${rates.length} rates in ${latency}ms`);
        return rates;
      } catch (error) {
        this.metrics.HOTELBEDS.failures++;
        console.error("❌ Hotelbeds fetch failed:", error);
        throw error;
      }
    });
  }

  // ===== DATABASE OPERATIONS =====

  async storeRateSnapshots(rates) {
    if (rates.length === 0) return 0;

    try {
      // Batch insert rate snapshots
      const values = rates.map((rate) => [
        rate.canonical_key,
        rate.supplier_id,
        JSON.stringify(rate.raw_response),
        rate.parsed_price_usd,
        rate.true_cost_usd,
        rate.available_inventory,
        rate.expires_at,
      ]);

      const query = `
        INSERT INTO ai.supplier_rate_snapshots 
        (canonical_key, supplier_id, raw_response, parsed_price_usd, true_cost_usd, available_inventory, expires_at)
        VALUES ${values.map((_, i) => `($${i * 7 + 1}, $${i * 7 + 2}, $${i * 7 + 3}, $${i * 7 + 4}, $${i * 7 + 5}, $${i * 7 + 6}, $${i * 7 + 7})`).join(", ")}
      `;

      const flatValues = values.flat();
      await this.pg.query(query, flatValues);

      console.log(`💾 Stored ${rates.length} rate snapshots to database`);
      return rates.length;
    } catch (error) {
      console.error("❌ Failed to store rate snapshots:", error);
      throw error;
    }
  }

  async updateRedisCache(rates) {
    let cached = 0;

    // Group rates by canonical_key
    const groupedRates = {};
    for (const rate of rates) {
      if (!groupedRates[rate.canonical_key]) {
        groupedRates[rate.canonical_key] = [];
      }
      groupedRates[rate.canonical_key].push(rate);
    }

    // Cache top-N supplier snapshots for each CPO
    for (const [canonicalKey, supplierRates] of Object.entries(groupedRates)) {
      const cacheData = {
        canonical_key: canonicalKey,
        suppliers: {},
        best_price: Math.min(...supplierRates.map((r) => r.parsed_price_usd)),
        last_updated: new Date().toISOString(),
        expires_at: Math.min(
          ...supplierRates.map((r) => new Date(r.expires_at).getTime()),
        ),
      };

      // Add supplier-specific data
      for (const rate of supplierRates) {
        const supplierCode = rate.supplier_id === 1 ? "AMADEUS" : "HOTELBEDS";
        cacheData.suppliers[supplierCode] = {
          price: rate.parsed_price_usd,
          true_cost: rate.true_cost_usd,
          inventory: rate.available_inventory,
          last_seen: new Date().toISOString(),
        };
      }

      if (await redisHotCache.setRates(canonicalKey, cacheData)) {
        cached++;
      }
    }

    console.log(`📦 Cached ${cached} CPO rate sets to Redis`);
    return cached;
  }

  // ===== HOTSET MANAGEMENT =====

  async loadHotset() {
    try {
      // Get top 1k CPOs by volume in last 30 days
      const result = await this.pg.query(`
        SELECT canonical_key, COUNT(*) as volume
        FROM ai.bargain_sessions
        WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY canonical_key
        ORDER BY volume DESC
        LIMIT 1000
      `);

      this.hotset = result.rows.map((row) => row.canonical_key);

      if (this.hotset.length === 0) {
        // Fallback to sample CPOs
        this.hotset = [
          "FL:AI-DEL-BOM-2024-06-15-E",
          "FL:EK-BOM-DXB-2024-06-16-B",
          "HT:mumbai_hotel_001:deluxe:BB:CXL-FLEX",
          "HT:goa_hotel_002:standard:RO:CXL-STRICT",
          "ST:mumbai_tour_001:ADT:ENG",
        ];
      }

      console.log(`📊 Loaded hotset: ${this.hotset.length} CPOs`);
      return this.hotset.length;
    } catch (error) {
      console.error("❌ Failed to load hotset:", error);
      return 0;
    }
  }

  // ===== WORKER EXECUTION =====

  async refreshHotset() {
    console.log("🔥 Starting hotset refresh...");

    try {
      // Split hotset by supplier
      const flightCPOs = this.hotset.filter((cpo) => cpo.startsWith("FL:"));
      const hotelCPOs = this.hotset.filter(
        (cpo) => cpo.startsWith("HT:") || cpo.startsWith("ST:"),
      );

      // Parallel fetch with circuit breakers
      const [amadeusRates, hotelbedsRates] = await Promise.allSettled([
        flightCPOs.length > 0
          ? this.fetchAmadeusRates(flightCPOs)
          : Promise.resolve([]),
        hotelCPOs.length > 0
          ? this.fetchHotelbedsRates(hotelCPOs)
          : Promise.resolve([]),
      ]);

      // Collect successful results
      const allRates = [];
      if (amadeusRates.status === "fulfilled") {
        allRates.push(...amadeusRates.value);
      } else {
        console.error("❌ Amadeus fetch failed:", amadeusRates.reason);
      }

      if (hotelbedsRates.status === "fulfilled") {
        allRates.push(...hotelbedsRates.value);
      } else {
        console.error("❌ Hotelbeds fetch failed:", hotelbedsRates.reason);
      }

      if (allRates.length > 0) {
        // Store to database and cache in parallel
        await Promise.all([
          this.storeRateSnapshots(allRates),
          this.updateRedisCache(allRates),
        ]);
      }

      console.log(
        `✅ Hotset refresh completed: ${allRates.length} rates updated`,
      );
      return allRates.length;
    } catch (error) {
      console.error("❌ Hotset refresh failed:", error);
      throw error;
    }
  }

  async refreshLongTail() {
    console.log("🐌 Starting long tail refresh...");

    try {
      // Get less frequent CPOs
      const result = await this.pg.query(
        `
        SELECT DISTINCT canonical_key
        FROM ai.supplier_rate_snapshots
        WHERE snapshot_at < NOW() - INTERVAL '15 minutes'
          AND canonical_key NOT IN (${this.hotset.map((_, i) => `$${i + 1}`).join(", ")})
        ORDER BY snapshot_at ASC
        LIMIT 200
      `,
        this.hotset,
      );

      const longTailCPOs = result.rows.map((row) => row.canonical_key);

      if (longTailCPOs.length === 0) {
        console.log("📊 No long tail CPOs to refresh");
        return 0;
      }

      // Process in smaller batches
      const batchSize = 50;
      let totalUpdated = 0;

      for (let i = 0; i < longTailCPOs.length; i += batchSize) {
        const batch = longTailCPOs.slice(i, i + batchSize);
        const flightCPOs = batch.filter((cpo) => cpo.startsWith("FL:"));
        const hotelCPOs = batch.filter(
          (cpo) => cpo.startsWith("HT:") || cpo.startsWith("ST:"),
        );

        const [amadeusRates, hotelbedsRates] = await Promise.allSettled([
          flightCPOs.length > 0
            ? this.fetchAmadeusRates(flightCPOs)
            : Promise.resolve([]),
          hotelCPOs.length > 0
            ? this.fetchHotelbedsRates(hotelCPOs)
            : Promise.resolve([]),
        ]);

        const batchRates = [];
        if (amadeusRates.status === "fulfilled")
          batchRates.push(...amadeusRates.value);
        if (hotelbedsRates.status === "fulfilled")
          batchRates.push(...hotelbedsRates.value);

        if (batchRates.length > 0) {
          await Promise.all([
            this.storeRateSnapshots(batchRates),
            this.updateRedisCache(batchRates),
          ]);
          totalUpdated += batchRates.length;
        }

        // Rate limiting between batches
        await this.sleep(1000);
      }

      console.log(
        `✅ Long tail refresh completed: ${totalUpdated} rates updated`,
      );
      return totalUpdated;
    } catch (error) {
      console.error("❌ Long tail refresh failed:", error);
      throw error;
    }
  }

  // ===== MONITORING =====

  getMetrics() {
    const getSLAMetrics = (supplier) => {
      const m = this.metrics[supplier];
      return {
        requests: m.requests,
        success_rate:
          m.requests > 0 ? ((m.successes / m.requests) * 100).toFixed(2) : 0,
        avg_latency_ms:
          m.successes > 0 ? Math.round(m.totalLatency / m.successes) : 0,
        circuit_breaker: this.circuitBreakers[supplier].getState(),
      };
    };

    return {
      timestamp: new Date().toISOString(),
      hotset_size: this.hotset.length,
      amadeus: getSLAMetrics("AMADEUS"),
      hotelbeds: getSLAMetrics("HOTELBEDS"),
      redis_health: null, // Will be populated by Redis health check
    };
  }

  // ===== WORKER LOOP =====

  async runWorkerLoop() {
    if (this.isRunning) {
      console.log("⚠️ Worker already running");
      return;
    }

    this.isRunning = true;
    console.log("🚀 Starting supplier fabric worker loop...");

    try {
      await this.connect();
      await this.loadHotset();

      // Initial hotset refresh
      await this.refreshHotset();

      // Set up intervals
      const hotsetInterval = setInterval(
        async () => {
          try {
            await this.refreshHotset();
          } catch (error) {
            console.error("❌ Hotset refresh error:", error);
          }
        },
        5 * 60 * 1000,
      ); // Every 5 minutes

      const longTailInterval = setInterval(
        async () => {
          try {
            await this.refreshLongTail();
          } catch (error) {
            console.error("❌ Long tail refresh error:", error);
          }
        },
        15 * 60 * 1000,
      ); // Every 15 minutes

      const hotsetReloadInterval = setInterval(
        async () => {
          try {
            await this.loadHotset();
          } catch (error) {
            console.error("❌ Hotset reload error:", error);
          }
        },
        60 * 60 * 1000,
      ); // Every hour

      // Handle graceful shutdown
      process.on("SIGINT", async () => {
        console.log("⏹️ Shutting down supplier fabric worker...");
        clearInterval(hotsetInterval);
        clearInterval(longTailInterval);
        clearInterval(hotsetReloadInterval);
        this.isRunning = false;
        await this.disconnect();
        process.exit(0);
      });

      console.log("✅ Supplier fabric worker started successfully");
      console.log("- Hotset refresh: every 5 minutes");
      console.log("- Long tail refresh: every 15 minutes");
      console.log("- Hotset reload: every hour");
    } catch (error) {
      console.error("💥 Worker startup failed:", error);
      this.isRunning = false;
      process.exit(1);
    }
  }

  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// CLI execution
if (require.main === module) {
  const worker = new SupplierFabricWorker();
  worker.runWorkerLoop();
}

module.exports = SupplierFabricWorker;
