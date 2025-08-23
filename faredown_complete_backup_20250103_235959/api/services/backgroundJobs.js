/**
 * Background Jobs Service
 * Handles materialized view refresh, model training, and maintenance tasks
 */

const cron = require("node-cron");
const { Pool } = require("pg");
const redisService = require("./redisService");
const supplierAdapterManager = require("./adapters/supplierAdapterManager");
const winston = require("winston");

class BackgroundJobsService {
  constructor() {
    this.logger = winston.createLogger({
      level: "info",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} [${level.toUpperCase()}] [JOBS] ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ""}`;
        }),
      ),
      transports: [new winston.transports.Console()],
    });

    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl:
        process.env.NODE_ENV === "production"
          ? { rejectUnauthorized: false }
          : false,
    });

    this.isRunning = false;
    this.jobStatus = new Map();
  }

  /**
   * Start all background jobs
   */
  start() {
    if (this.isRunning) {
      this.logger.warn("Background jobs already running");
      return;
    }

    this.logger.info("Starting background jobs...");
    this.isRunning = true;

    // Hourly jobs (every hour at minute 0)
    cron.schedule("0 * * * *", () => {
      this.runHourlyJobs();
    });

    // Nightly jobs (every day at 2:00 AM UTC)
    cron.schedule("0 2 * * *", () => {
      this.runNightlyJobs();
    });

    // Every 5 minutes - supplier snapshots refresh for hot products
    cron.schedule("*/5 * * * *", () => {
      this.refreshHotSupplierSnapshots();
    });

    // Every 15 minutes - health checks
    cron.schedule("*/15 * * * *", () => {
      this.runHealthChecks();
    });

    this.logger.info("Background jobs scheduled successfully");
  }

  /**
   * Stop all background jobs
   */
  stop() {
    this.isRunning = false;
    this.logger.info("Background jobs stopped");
  }

  /**
   * Hourly jobs execution
   */
  async runHourlyJobs() {
    const jobId = "hourly_" + Date.now();
    this.updateJobStatus(jobId, "running", "Hourly jobs started");

    try {
      this.logger.info("Starting hourly jobs...");

      // 1. Refresh materialized views
      await this.refreshMaterializedViews();

      // 2. Cache warm for top products
      await this.warmCacheForTopProducts();

      // 3. Update product features
      await this.updateProductFeatures();

      // 4. Cleanup old Redis keys
      await this.cleanupRedisKeys();

      this.updateJobStatus(
        jobId,
        "completed",
        "Hourly jobs completed successfully",
      );
      this.logger.info("Hourly jobs completed successfully");
    } catch (error) {
      this.updateJobStatus(jobId, "failed", error.message);
      this.logger.error("Hourly jobs failed:", error);
    }
  }

  /**
   * Nightly jobs execution
   */
  async runNightlyJobs() {
    const jobId = "nightly_" + Date.now();
    this.updateJobStatus(jobId, "running", "Nightly jobs started");

    try {
      this.logger.info("Starting nightly jobs...");

      // 1. Archive old sessions (90+ days)
      await this.archiveOldSessions();

      // 2. Update user profiles
      await this.updateUserProfiles();

      // 3. Train/retrain models (placeholder)
      await this.trainModels();

      // 4. Generate daily reports
      await this.generateDailyReports();

      // 5. Cleanup old snapshots
      await this.cleanupOldSnapshots();

      this.updateJobStatus(
        jobId,
        "completed",
        "Nightly jobs completed successfully",
      );
      this.logger.info("Nightly jobs completed successfully");
    } catch (error) {
      this.updateJobStatus(jobId, "failed", error.message);
      this.logger.error("Nightly jobs failed:", error);
    }
  }

  /**
   * Refresh materialized views for reporting
   */
  async refreshMaterializedViews() {
    try {
      this.logger.info("Refreshing materialized views...");

      const views = [
        "ai.mv_daily_agg",
        "ai.mv_airline_route_daily",
        "ai.mv_hotel_city_daily",
      ];

      for (const view of views) {
        const startTime = Date.now();

        try {
          await this.pool.query(
            `REFRESH MATERIALIZED VIEW CONCURRENTLY ${view}`,
          );
          const duration = Date.now() - startTime;
          this.logger.info(`Refreshed ${view} in ${duration}ms`);
        } catch (error) {
          // Fallback to non-concurrent refresh if concurrent fails
          if (error.message.includes("concurrently")) {
            this.logger.warn(
              `Concurrent refresh failed for ${view}, trying non-concurrent...`,
            );
            await this.pool.query(`REFRESH MATERIALIZED VIEW ${view}`);
            const duration = Date.now() - startTime;
            this.logger.info(
              `Refreshed ${view} (non-concurrent) in ${duration}ms`,
            );
          } else {
            throw error;
          }
        }
      }

      this.logger.info("All materialized views refreshed successfully");
    } catch (error) {
      this.logger.error("Failed to refresh materialized views:", error);
      throw error;
    }
  }

  /**
   * Warm cache for top products
   */
  async warmCacheForTopProducts() {
    try {
      this.logger.info("Warming cache for top products...");

      // Get top 100 products by demand score
      const result = await this.pool.query(`
        SELECT p.canonical_key, p.product_type, pf.demand_score
        FROM ai.products p
        LEFT JOIN ai.product_features pf ON p.canonical_key = pf.canonical_key
        ORDER BY pf.demand_score DESC NULLS LAST
        LIMIT 100
      `);

      let warmedCount = 0;
      for (const product of result.rows) {
        try {
          // Cache product features
          if (product.demand_score) {
            await redisService.setProductFeatures(product.canonical_key, {
              demand_score: product.demand_score,
              updated_at: new Date().toISOString(),
            });
            warmedCount++;
          }
        } catch (error) {
          this.logger.warn(
            `Failed to warm cache for ${product.canonical_key}:`,
            error,
          );
        }
      }

      this.logger.info(`Cache warmed for ${warmedCount} products`);
    } catch (error) {
      this.logger.error("Failed to warm cache:", error);
      throw error;
    }
  }

  /**
   * Update product features based on recent activity
   */
  async updateProductFeatures() {
    try {
      this.logger.info("Updating product features...");

      // Calculate demand scores based on recent activity
      const result = await this.pool.query(`
        WITH recent_activity AS (
          SELECT 
            s.canonical_key,
            COUNT(*) as session_count,
            AVG(CASE WHEN e.accepted THEN 1.0 ELSE 0.0 END) as accept_rate,
            AVG(e.accept_prob) as avg_accept_prob
          FROM ai.bargain_sessions s
          LEFT JOIN ai.bargain_events e ON s.id = e.session_id
          WHERE s.started_at > NOW() - INTERVAL '7 days'
          GROUP BY s.canonical_key
          HAVING COUNT(*) >= 3
        )
        SELECT 
          canonical_key,
          session_count,
          accept_rate,
          avg_accept_prob,
          -- Demand score based on activity level and acceptance
          LEAST(1.0, (session_count::float / 50.0) * (1.0 + accept_rate)) as demand_score
        FROM recent_activity
      `);

      let updatedCount = 0;
      for (const row of result.rows) {
        try {
          await this.pool.query(
            `
            INSERT INTO ai.product_features (canonical_key, demand_score, avg_accept_depth, updated_at)
            VALUES ($1, $2, $3, NOW())
            ON CONFLICT (canonical_key) DO UPDATE SET
              demand_score = $2,
              avg_accept_depth = $3,
              updated_at = NOW()
          `,
            [
              row.canonical_key,
              parseFloat(row.demand_score),
              parseFloat(row.avg_accept_prob || 0),
            ],
          );
          updatedCount++;
        } catch (error) {
          this.logger.warn(
            `Failed to update features for ${row.canonical_key}:`,
            error,
          );
        }
      }

      this.logger.info(`Updated features for ${updatedCount} products`);
    } catch (error) {
      this.logger.error("Failed to update product features:", error);
      throw error;
    }
  }

  /**
   * Refresh supplier snapshots for hot products
   */
  async refreshHotSupplierSnapshots() {
    try {
      // Get top 20 most active products from last hour
      const result = await this.pool.query(`
        SELECT s.canonical_key, s.product_type, COUNT(*) as activity_count
        FROM ai.bargain_sessions s
        WHERE s.started_at > NOW() - INTERVAL '1 hour'
        GROUP BY s.canonical_key, s.product_type
        ORDER BY activity_count DESC
        LIMIT 20
      `);

      if (result.rows.length === 0) {
        return;
      }

      this.logger.info(
        `Refreshing snapshots for ${result.rows.length} hot products`,
      );

      // Trigger supplier adapter refresh for these products
      for (const product of result.rows) {
        try {
          await supplierAdapterManager.refreshSupplierSnapshots(
            product.product_type,
            1,
          );
        } catch (error) {
          this.logger.warn(
            `Failed to refresh snapshot for ${product.canonical_key}:`,
            error,
          );
        }
      }
    } catch (error) {
      this.logger.warn("Hot snapshot refresh failed:", error);
    }
  }

  /**
   * Archive old sessions
   */
  async archiveOldSessions() {
    try {
      const result = await this.pool.query(`
        SELECT ai.archive_old_sessions(90)
      `);

      const archiveResult = result.rows[0].archive_old_sessions;
      this.logger.info("Session archival completed:", archiveResult);
    } catch (error) {
      this.logger.error("Failed to archive old sessions:", error);
      throw error;
    }
  }

  /**
   * Update user profiles based on recent activity
   */
  async updateUserProfiles() {
    try {
      this.logger.info("Updating user profiles...");

      // Calculate user behavior patterns
      const result = await this.pool.query(`
        WITH user_stats AS (
          SELECT 
            (e.context->>'user_tier') as user_tier,
            COUNT(*) as total_sessions,
            AVG(CASE WHEN e.accepted THEN 1.0 ELSE 0.0 END) as accept_rate,
            AVG(e.accept_prob) as avg_accept_prob,
            SUM(CASE WHEN e.accepted THEN e.revenue_usd - e.true_cost_usd ELSE 0 END) as total_profit
          FROM ai.bargain_events e
          WHERE e.created_at > NOW() - INTERVAL '30 days'
            AND e.context->>'user_tier' IS NOT NULL
          GROUP BY (e.context->>'user_tier')
        )
        SELECT * FROM user_stats WHERE total_sessions >= 5
      `);

      for (const userStat of result.rows) {
        const userId = `tier_${userStat.user_tier.toLowerCase()}`;
        const style =
          userStat.accept_rate > 0.6
            ? "generous"
            : userStat.accept_rate > 0.3
              ? "persistent"
              : "cautious";

        await this.pool.query(
          `
          INSERT INTO ai.user_profiles (user_id, tier, style, ltv_usd, updated_at)
          VALUES ($1, $2, $3, $4, NOW())
          ON CONFLICT (user_id) DO UPDATE SET
            tier = $2,
            style = $3,
            ltv_usd = $4,
            updated_at = NOW()
        `,
          [
            userId,
            userStat.user_tier,
            style,
            parseFloat(userStat.total_profit || 0),
          ],
        );
      }

      this.logger.info(`Updated ${result.rows.length} user profiles`);
    } catch (error) {
      this.logger.error("Failed to update user profiles:", error);
      throw error;
    }
  }

  /**
   * Train/retrain models (placeholder)
   */
  async trainModels() {
    try {
      this.logger.info("Model training placeholder...");

      // In production, this would:
      // 1. Extract features from ai.bargain_events
      // 2. Train propensity model
      // 3. Validate model performance
      // 4. Update ai.model_registry
      // 5. Export ONNX/pickle model files

      this.logger.info("Model training completed (placeholder)");
    } catch (error) {
      this.logger.error("Failed to train models:", error);
      throw error;
    }
  }

  /**
   * Generate daily reports
   */
  async generateDailyReports() {
    try {
      this.logger.info("Generating daily reports...");

      // Cache key performance metrics
      const kpiResult = await this.pool.query(`
        SELECT 
          CURRENT_DATE as report_date,
          COUNT(*) as total_sessions,
          COUNT(*) FILTER (WHERE e.accepted) as accepted_sessions,
          SUM(e.revenue_usd - e.true_cost_usd - COALESCE(e.perk_cost_usd, 0)) as total_profit
        FROM ai.bargain_events e
        WHERE e.created_at >= CURRENT_DATE
          AND e.created_at < CURRENT_DATE + INTERVAL '1 day'
      `);

      if (kpiResult.rows.length > 0) {
        const kpis = kpiResult.rows[0];
        await redisService.set("reports:daily_kpis", kpis, 25 * 60 * 60); // 25 hours
        this.logger.info("Daily KPIs cached:", kpis);
      }
    } catch (error) {
      this.logger.error("Failed to generate daily reports:", error);
      throw error;
    }
  }

  /**
   * Cleanup old supplier snapshots
   */
  async cleanupOldSnapshots() {
    try {
      const result = await this.pool.query(`
        DELETE FROM ai.supplier_rate_snapshots 
        WHERE snapshot_at < NOW() - INTERVAL '7 days'
      `);

      this.logger.info(`Cleaned up ${result.rowCount} old supplier snapshots`);
    } catch (error) {
      this.logger.error("Failed to cleanup old snapshots:", error);
      throw error;
    }
  }

  /**
   * Cleanup old Redis keys
   */
  async cleanupRedisKeys() {
    try {
      // This would use Redis SCAN to find and delete old keys
      // For now, just log that we're doing cleanup
      this.logger.info("Redis cleanup completed (placeholder)");
    } catch (error) {
      this.logger.error("Failed to cleanup Redis keys:", error);
    }
  }

  /**
   * Run health checks
   */
  async runHealthChecks() {
    try {
      // Check component health
      const healthChecks = await Promise.all([
        redisService.getHealthMetrics(),
        supplierAdapterManager.getAdapterHealthStatus(),
        this.checkDatabaseHealth(),
      ]);

      const overallHealth = {
        redis: healthChecks[0]?.connected || false,
        suppliers:
          healthChecks[1]?.every((s) => s.status === "healthy") || false,
        database: healthChecks[2] || false,
        timestamp: new Date().toISOString(),
      };

      await redisService.set("health:system", overallHealth, 20 * 60); // 20 minutes

      const healthyComponents =
        Object.values(overallHealth).filter(Boolean).length;
      if (healthyComponents < 3) {
        this.logger.warn("System health degraded:", overallHealth);
      }
    } catch (error) {
      this.logger.error("Health check failed:", error);
    }
  }

  /**
   * Check database health
   */
  async checkDatabaseHealth() {
    try {
      const result = await this.pool.query("SELECT NOW()");
      return result.rows.length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Update job status tracking
   */
  updateJobStatus(jobId, status, message) {
    this.jobStatus.set(jobId, {
      status,
      message,
      timestamp: new Date().toISOString(),
    });

    // Keep only last 50 job statuses
    if (this.jobStatus.size > 50) {
      const firstKey = this.jobStatus.keys().next().value;
      this.jobStatus.delete(firstKey);
    }
  }

  /**
   * Get job status for monitoring
   */
  getJobStatus() {
    const jobs = Array.from(this.jobStatus.entries()).map(([id, status]) => ({
      job_id: id,
      ...status,
    }));

    return {
      jobs: jobs.slice(-10), // Last 10 jobs
      total_jobs: this.jobStatus.size,
      is_running: this.isRunning,
    };
  }

  /**
   * Get service health
   */
  async getHealth() {
    return {
      service: "background_jobs",
      is_running: this.isRunning,
      recent_jobs: this.getJobStatus(),
      timestamp: new Date().toISOString(),
    };
  }
}

// Export singleton instance
const backgroundJobsService = new BackgroundJobsService();

module.exports = backgroundJobsService;
