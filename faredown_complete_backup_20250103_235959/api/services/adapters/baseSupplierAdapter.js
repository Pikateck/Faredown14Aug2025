/**
 * Base Supplier Adapter Interface
 * Standardizes integration with different travel suppliers (Amadeus, Hotelbeds, etc.)
 */

const cpoService = require("../cpoService");
const cpoRepository = require("../cpoRepository");
const winston = require("winston");

class BaseSupplierAdapter {
  constructor(supplierCode, config = {}) {
    this.supplierCode = supplierCode;
    this.config = config;
    this.logger = winston.createLogger({
      level: "info",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} [${level.toUpperCase()}] [${this.supplierCode}] ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ""}`;
        }),
      ),
      transports: [new winston.transports.Console()],
    });

    // Circuit breaker configuration
    this.circuitBreaker = {
      failureThreshold: 5,
      recoveryTimeout: 30000,
      failures: 0,
      state: "CLOSED", // CLOSED, OPEN, HALF_OPEN
      lastFailureTime: null,
    };

    // Rate limiting
    this.rateLimit = {
      requestsPerSecond: config.requestsPerSecond || 10,
      requests: [],
      maxRetries: 3,
      retryDelay: 1000,
    };
  }

  /**
   * Abstract methods that must be implemented by concrete adapters
   */
  async searchFlights(searchParams) {
    throw new Error("searchFlights must be implemented by subclass");
  }

  async searchHotels(searchParams) {
    throw new Error("searchHotels must be implemented by subclass");
  }

  async searchSightseeing(searchParams) {
    throw new Error("searchSightseeing must be implemented by subclass");
  }

  async getFlightDetails(flightId) {
    throw new Error("getFlightDetails must be implemented by subclass");
  }

  async getHotelDetails(hotelId) {
    throw new Error("getHotelDetails must be implemented by subclass");
  }

  async getSightseeingDetails(activityId) {
    throw new Error("getSightseeingDetails must be implemented by subclass");
  }

  async bookFlight(bookingData) {
    throw new Error("bookFlight must be implemented by subclass");
  }

  async bookHotel(bookingData) {
    throw new Error("bookHotel must be implemented by subclass");
  }

  async bookSightseeing(bookingData) {
    throw new Error("bookSightseeing must be implemented by subclass");
  }

  /**
   * Universal normalization method - converts supplier response to CPO
   */
  async normalizeProducts(products, productType) {
    const normalizedProducts = [];
    const supplierData = {
      supplierId: await this.getSupplierId(),
      supplierCode: this.supplierCode,
    };

    for (const product of products) {
      try {
        let cpo;

        switch (productType) {
          case "flight":
            cpo = cpoService.createFlightCPO(product, supplierData);
            break;
          case "hotel":
            cpo = cpoService.createHotelCPO(product, supplierData);
            break;
          case "sightseeing":
            cpo = cpoService.createSightseeingCPO(product, supplierData);
            break;
          default:
            throw new Error(`Unsupported product type: ${productType}`);
        }

        // Validate CPO
        const validation = cpoService.validateCPO(cpo);
        if (validation.valid) {
          normalizedProducts.push(cpo);
        } else {
          this.logger.warn("Invalid CPO generated:", validation.errors);
        }
      } catch (error) {
        this.logger.error("Failed to normalize product:", error);
      }
    }

    return normalizedProducts;
  }

  /**
   * Create rate snapshot for a product
   */
  async createRateSnapshot(product, cpo) {
    try {
      const supplierId = await this.getSupplierId();

      return {
        supplier_id: supplierId,
        currency: product.currency || "USD",
        net: parseFloat(product.netPrice || product.basePrice || product.price),
        taxes: parseFloat(product.taxes || 0),
        fees: parseFloat(product.fees || 0),
        fx_rate: parseFloat(product.fxRate || 1),
        policy_flags: product.policyFlags || {},
        inventory_state: product.inventoryState || "AVAILABLE",
        snapshot_at: new Date(),
        supplier_metadata: {
          original_id: product.id,
          rate_key: product.rateKey,
          booking_class: product.bookingClass,
          fare_basis: product.fareBasis,
        },
      };
    } catch (error) {
      this.logger.error("Failed to create rate snapshot:", error);
      return null;
    }
  }

  /**
   * Store products and snapshots in repository
   */
  async storeProductsAndSnapshots(products, productType) {
    const results = {
      products_stored: 0,
      snapshots_stored: 0,
      errors: [],
    };

    try {
      // Normalize products to CPOs
      const cpos = await this.normalizeProducts(products, productType);

      // Store CPOs
      const cpoResults = await cpoRepository.bulkStoreCPOs(cpos);
      results.products_stored = cpoResults.success;
      results.errors.push(...cpoResults.errors);

      // Create and store rate snapshots
      for (let i = 0; i < products.length && i < cpos.length; i++) {
        try {
          const snapshot = await this.createRateSnapshot(products[i], cpos[i]);
          if (snapshot) {
            await cpoRepository.storeSupplierSnapshot(
              cpos[i].canonical_key,
              snapshot,
            );
            results.snapshots_stored++;
          }
        } catch (error) {
          results.errors.push({
            product_id: products[i].id,
            error: error.message,
          });
        }
      }

      this.logger.info(
        `Stored ${results.products_stored} products and ${results.snapshots_stored} snapshots`,
      );
      return results;
    } catch (error) {
      this.logger.error("Failed to store products and snapshots:", error);
      throw error;
    }
  }

  /**
   * Get supplier ID from database
   */
  async getSupplierId() {
    if (this._supplierId) {
      return this._supplierId;
    }

    try {
      const { Pool } = require("pg");
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl:
          process.env.NODE_ENV === "production"
            ? { rejectUnauthorized: false }
            : false,
      });

      const result = await pool.query(
        "SELECT id FROM ai.suppliers WHERE code = $1",
        [this.supplierCode],
      );

      if (result.rows.length > 0) {
        this._supplierId = result.rows[0].id;
        return this._supplierId;
      }

      throw new Error(`Supplier not found: ${this.supplierCode}`);
    } catch (error) {
      this.logger.error("Failed to get supplier ID:", error);
      throw error;
    }
  }

  // ==========================================
  // RESILIENCE PATTERNS
  // ==========================================

  /**
   * Circuit breaker implementation
   */
  async executeWithCircuitBreaker(operation) {
    // Check circuit breaker state
    if (this.circuitBreaker.state === "OPEN") {
      const timeSinceLastFailure =
        Date.now() - this.circuitBreaker.lastFailureTime;
      if (timeSinceLastFailure < this.circuitBreaker.recoveryTimeout) {
        throw new Error("Circuit breaker is OPEN - requests are blocked");
      } else {
        this.circuitBreaker.state = "HALF_OPEN";
      }
    }

    try {
      const result = await operation();

      // Success - reset circuit breaker
      if (this.circuitBreaker.state === "HALF_OPEN") {
        this.circuitBreaker.state = "CLOSED";
        this.circuitBreaker.failures = 0;
        this.logger.info("Circuit breaker reset to CLOSED state");
      }

      return result;
    } catch (error) {
      this.circuitBreaker.failures++;
      this.circuitBreaker.lastFailureTime = Date.now();

      if (
        this.circuitBreaker.failures >= this.circuitBreaker.failureThreshold
      ) {
        this.circuitBreaker.state = "OPEN";
        this.logger.warn(
          `Circuit breaker opened after ${this.circuitBreaker.failures} failures`,
        );
      }

      throw error;
    }
  }

  /**
   * Rate limiting implementation
   */
  async checkRateLimit() {
    const now = Date.now();
    const windowStart = now - 1000; // 1 second window

    // Remove old requests
    this.rateLimit.requests = this.rateLimit.requests.filter(
      (time) => time > windowStart,
    );

    // Check if we're over the limit
    if (this.rateLimit.requests.length >= this.rateLimit.requestsPerSecond) {
      const oldestRequest = this.rateLimit.requests[0];
      const waitTime = 1000 - (now - oldestRequest);

      if (waitTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }

    // Record this request
    this.rateLimit.requests.push(now);
  }

  /**
   * Retry with exponential backoff
   */
  async executeWithRetry(operation, maxRetries = null) {
    const retries = maxRetries || this.rateLimit.maxRetries;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await this.checkRateLimit();
        return await this.executeWithCircuitBreaker(operation);
      } catch (error) {
        if (attempt === retries) {
          throw error;
        }

        // Exponential backoff
        const delay = this.rateLimit.retryDelay * Math.pow(2, attempt - 1);
        this.logger.warn(`Attempt ${attempt} failed, retrying in ${delay}ms`, {
          error: error.message,
        });
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Health check for supplier API
   */
  async healthCheck() {
    try {
      const startTime = Date.now();

      // Implement a lightweight health check specific to each supplier
      await this.performHealthCheck();

      const responseTime = Date.now() - startTime;

      return {
        supplier: this.supplierCode,
        status: "healthy",
        response_time_ms: responseTime,
        circuit_breaker_state: this.circuitBreaker.state,
        failures: this.circuitBreaker.failures,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        supplier: this.supplierCode,
        status: "unhealthy",
        error: error.message,
        circuit_breaker_state: this.circuitBreaker.state,
        failures: this.circuitBreaker.failures,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Override this method in concrete adapters for supplier-specific health checks
   */
  async performHealthCheck() {
    // Default implementation - just check if we can get supplier ID
    await this.getSupplierId();
  }

  /**
   * Get adapter metrics
   */
  getMetrics() {
    return {
      supplier: this.supplierCode,
      circuit_breaker: {
        state: this.circuitBreaker.state,
        failures: this.circuitBreaker.failures,
        last_failure: this.circuitBreaker.lastFailureTime,
      },
      rate_limit: {
        requests_per_second: this.rateLimit.requestsPerSecond,
        current_requests: this.rateLimit.requests.length,
      },
      configuration: {
        max_retries: this.rateLimit.maxRetries,
        retry_delay: this.rateLimit.retryDelay,
        recovery_timeout: this.circuitBreaker.recoveryTimeout,
      },
    };
  }

  /**
   * Reset circuit breaker (for admin use)
   */
  resetCircuitBreaker() {
    this.circuitBreaker.state = "CLOSED";
    this.circuitBreaker.failures = 0;
    this.circuitBreaker.lastFailureTime = null;
    this.logger.info("Circuit breaker manually reset");
  }

  /**
   * Update adapter configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };

    if (newConfig.requestsPerSecond) {
      this.rateLimit.requestsPerSecond = newConfig.requestsPerSecond;
    }

    if (newConfig.maxRetries) {
      this.rateLimit.maxRetries = newConfig.maxRetries;
    }

    if (newConfig.retryDelay) {
      this.rateLimit.retryDelay = newConfig.retryDelay;
    }

    this.logger.info("Adapter configuration updated", newConfig);
  }
}

module.exports = BaseSupplierAdapter;
