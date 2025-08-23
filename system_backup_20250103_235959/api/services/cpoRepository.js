/**
 * CPO Repository Service
 * Database operations for Comparable Product Objects
 */

const { Pool } = require("pg");
const cpoService = require("./cpoService");
const redisService = require("./redisService");
const winston = require("winston");

class CPORepository {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl:
        process.env.NODE_ENV === "production"
          ? { rejectUnauthorized: false }
          : false,
    });

    this.logger = winston.createLogger({
      level: "info",
      format: winston.format.json(),
      transports: [new winston.transports.Console()],
    });
  }

  /**
   * Store CPO in database
   */
  async storeCPO(cpo) {
    const client = await this.pool.connect();

    try {
      // Validate CPO first
      const validation = cpoService.validateCPO(cpo);
      if (!validation.valid) {
        throw new Error(`Invalid CPO: ${validation.errors.join(", ")}`);
      }

      await client.query("BEGIN");

      // Insert or update product
      await client.query(
        `
        INSERT INTO ai.products (canonical_key, product_type, attrs, created_at, updated_at)
        VALUES ($1, $2, $3, NOW(), NOW())
        ON CONFLICT (canonical_key) 
        DO UPDATE SET 
          attrs = $3,
          updated_at = NOW()
      `,
        [cpo.canonical_key, cpo.type, JSON.stringify(cpo.attrs)],
      );

      // Store searchable attributes for future indexing
      const searchableAttrs = cpoService.generateSearchableAttrs(cpo);

      await client.query("COMMIT");

      this.logger.info(`CPO stored successfully: ${cpo.canonical_key}`);
      return true;
    } catch (error) {
      await client.query("ROLLBACK");
      this.logger.error("Failed to store CPO:", error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Retrieve CPO by canonical key
   */
  async getCPO(canonicalKey) {
    try {
      const result = await this.pool.query(
        "SELECT * FROM ai.products WHERE canonical_key = $1",
        [canonicalKey],
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        type: row.product_type,
        canonical_key: row.canonical_key,
        attrs: row.attrs,
        created_at: row.created_at,
        updated_at: row.updated_at,
      };
    } catch (error) {
      this.logger.error("Failed to get CPO:", error);
      return null;
    }
  }

  /**
   * Store supplier rate snapshot for a CPO
   */
  async storeSupplierSnapshot(canonicalKey, supplierSnapshot) {
    const client = await this.pool.connect();

    try {
      await client.query(
        `
        INSERT INTO ai.supplier_rate_snapshots 
        (canonical_key, supplier_id, currency, net, taxes, fees, fx_rate, policy_flags, inventory_state, snapshot_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `,
        [
          canonicalKey,
          supplierSnapshot.supplier_id,
          supplierSnapshot.currency,
          supplierSnapshot.net,
          supplierSnapshot.taxes || 0,
          supplierSnapshot.fees || 0,
          supplierSnapshot.fx_rate || 1,
          JSON.stringify(supplierSnapshot.policy_flags || {}),
          supplierSnapshot.inventory_state || "AVAILABLE",
          supplierSnapshot.snapshot_at || new Date(),
        ],
      );

      // Cache the snapshot in Redis
      const existingSnapshots =
        (await redisService.getSupplierRates(canonicalKey)) || [];
      existingSnapshots.push(supplierSnapshot);

      // Keep only latest 5 snapshots per product
      const latestSnapshots = existingSnapshots
        .sort((a, b) => new Date(b.snapshot_at) - new Date(a.snapshot_at))
        .slice(0, 5);

      await redisService.setSupplierRates(canonicalKey, latestSnapshots);

      this.logger.info(`Supplier snapshot stored for ${canonicalKey}`);
      return true;
    } catch (error) {
      this.logger.error("Failed to store supplier snapshot:", error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get latest supplier snapshots for a CPO
   */
  async getSupplierSnapshots(canonicalKey, limit = 5) {
    try {
      // Try Redis first
      const cachedSnapshots = await redisService.getSupplierRates(canonicalKey);
      if (cachedSnapshots && cachedSnapshots.length > 0) {
        return cachedSnapshots;
      }

      // Fallback to database
      const result = await this.pool.query(
        `
        SELECT * FROM ai.supplier_rate_snapshots 
        WHERE canonical_key = $1 
        ORDER BY snapshot_at DESC 
        LIMIT $2
      `,
        [canonicalKey, limit],
      );

      const snapshots = result.rows;

      // Cache for next time
      if (snapshots.length > 0) {
        await redisService.setSupplierRates(canonicalKey, snapshots);
      }

      return snapshots;
    } catch (error) {
      this.logger.error("Failed to get supplier snapshots:", error);
      return [];
    }
  }

  /**
   * Calculate true cost floor for a CPO
   */
  async calculateTrueCostFloor(canonicalKey, supplierSnapshots = null) {
    try {
      if (!supplierSnapshots) {
        supplierSnapshots = await this.getSupplierSnapshots(canonicalKey);
      }

      if (supplierSnapshots.length === 0) {
        return null;
      }

      // Get product type for markup rules
      const cpo = await this.getCPO(canonicalKey);
      if (!cpo) {
        return null;
      }

      // Get applicable markup rules
      const markupRules = await this.pool.query(
        `
        SELECT * FROM ai.markup_rules 
        WHERE product_type = $1 AND active = true
        ORDER BY min_margin ASC
        LIMIT 1
      `,
        [cpo.type],
      );

      const minMargin =
        markupRules.rows.length > 0 ? markupRules.rows[0].min_margin : 5.0;

      // Calculate floor for each supplier snapshot
      const floors = supplierSnapshots.map((snapshot) => {
        const totalCost =
          parseFloat(snapshot.net) +
          parseFloat(snapshot.taxes || 0) +
          parseFloat(snapshot.fees || 0);

        const floorPrice = totalCost + parseFloat(minMargin);

        return {
          supplier_id: snapshot.supplier_id,
          total_cost: totalCost,
          floor_price: floorPrice,
          currency: snapshot.currency,
          inventory_state: snapshot.inventory_state,
        };
      });

      // Return the lowest viable floor
      const availableFloors = floors.filter(
        (f) => f.inventory_state === "AVAILABLE",
      );
      if (availableFloors.length === 0) {
        return floors[0]; // Return best unavailable option
      }

      return availableFloors.reduce((min, current) =>
        current.floor_price < min.floor_price ? current : min,
      );
    } catch (error) {
      this.logger.error("Failed to calculate true cost floor:", error);
      return null;
    }
  }

  /**
   * Search CPOs by criteria
   */
  async searchCPOs(criteria, limit = 50) {
    try {
      let query = "SELECT * FROM ai.products WHERE 1=1";
      const params = [];
      let paramCount = 0;

      if (criteria.type) {
        paramCount++;
        query += ` AND product_type = $${paramCount}`;
        params.push(criteria.type);
      }

      if (criteria.airline) {
        paramCount++;
        query += ` AND attrs->>'airline' = $${paramCount}`;
        params.push(criteria.airline.toUpperCase());
      }

      if (criteria.origin) {
        paramCount++;
        query += ` AND attrs->>'origin' = $${paramCount}`;
        params.push(criteria.origin.toUpperCase());
      }

      if (criteria.dest) {
        paramCount++;
        query += ` AND attrs->>'dest' = $${paramCount}`;
        params.push(criteria.dest.toUpperCase());
      }

      if (criteria.city) {
        paramCount++;
        query += ` AND attrs->>'city' = $${paramCount}`;
        params.push(criteria.city.toUpperCase());
      }

      if (criteria.location) {
        paramCount++;
        query += ` AND attrs->>'location' = $${paramCount}`;
        params.push(criteria.location.toUpperCase());
      }

      if (criteria.date_from && criteria.date_to) {
        paramCount += 2;
        query += ` AND (attrs->>'dep_date' BETWEEN $${paramCount - 1} AND $${paramCount} 
                       OR attrs->>'activity_date' BETWEEN $${paramCount - 1} AND $${paramCount})`;
        params.push(criteria.date_from, criteria.date_to);
      }

      paramCount++;
      query += ` ORDER BY updated_at DESC LIMIT $${paramCount}`;
      params.push(limit);

      const result = await this.pool.query(query, params);
      return result.rows.map((row) => ({
        type: row.product_type,
        canonical_key: row.canonical_key,
        attrs: row.attrs,
        created_at: row.created_at,
        updated_at: row.updated_at,
      }));
    } catch (error) {
      this.logger.error("Failed to search CPOs:", error);
      return [];
    }
  }

  /**
   * Get top products by demand score
   */
  async getTopProducts(productType = null, limit = 20) {
    try {
      let query = `
        SELECT p.*, pf.demand_score, pf.comp_pressure, pf.avg_accept_depth
        FROM ai.products p
        LEFT JOIN ai.product_features pf ON p.canonical_key = pf.canonical_key
      `;
      const params = [];

      if (productType) {
        query += " WHERE p.product_type = $1";
        params.push(productType);
      }

      query += `
        ORDER BY pf.demand_score DESC NULLS LAST, p.updated_at DESC
        LIMIT $${params.length + 1}
      `;
      params.push(limit);

      const result = await this.pool.query(query, params);
      return result.rows;
    } catch (error) {
      this.logger.error("Failed to get top products:", error);
      return [];
    }
  }

  /**
   * Store product features
   */
  async storeProductFeatures(canonicalKey, features) {
    const client = await this.pool.connect();

    try {
      await client.query(
        `
        INSERT INTO ai.product_features 
        (canonical_key, demand_score, comp_pressure, avg_accept_depth, seasonality, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
        ON CONFLICT (canonical_key)
        DO UPDATE SET 
          demand_score = $2,
          comp_pressure = $3,
          avg_accept_depth = $4,
          seasonality = $5,
          updated_at = NOW()
      `,
        [
          canonicalKey,
          features.demand_score,
          features.comp_pressure,
          features.avg_accept_depth,
          JSON.stringify(features.seasonality || {}),
        ],
      );

      // Cache in Redis
      await redisService.setProductFeatures(canonicalKey, features);

      this.logger.info(`Product features stored for ${canonicalKey}`);
      return true;
    } catch (error) {
      this.logger.error("Failed to store product features:", error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Bulk operations for efficiency
   */
  async bulkStoreCPOs(cpos) {
    const client = await this.pool.connect();
    const results = { success: 0, failed: 0, errors: [] };

    try {
      await client.query("BEGIN");

      for (const cpo of cpos) {
        try {
          await client.query(
            `
            INSERT INTO ai.products (canonical_key, product_type, attrs, created_at, updated_at)
            VALUES ($1, $2, $3, NOW(), NOW())
            ON CONFLICT (canonical_key) 
            DO UPDATE SET 
              attrs = $3,
              updated_at = NOW()
          `,
            [cpo.canonical_key, cpo.type, JSON.stringify(cpo.attrs)],
          );

          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            canonical_key: cpo.canonical_key,
            error: error.message,
          });
        }
      }

      await client.query("COMMIT");
      this.logger.info(
        `Bulk CPO storage: ${results.success} success, ${results.failed} failed`,
      );

      return results;
    } catch (error) {
      await client.query("ROLLBACK");
      this.logger.error("Bulk CPO storage failed:", error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Health check and statistics
   */
  async getRepositoryStats() {
    try {
      const stats = await this.pool.query(`
        SELECT 
          product_type,
          COUNT(*) as count,
          MAX(updated_at) as last_updated
        FROM ai.products 
        GROUP BY product_type
        ORDER BY count DESC
      `);

      const snapshotStats = await this.pool.query(`
        SELECT 
          COUNT(*) as total_snapshots,
          COUNT(DISTINCT canonical_key) as products_with_snapshots,
          MAX(snapshot_at) as last_snapshot
        FROM ai.supplier_rate_snapshots
        WHERE snapshot_at > NOW() - INTERVAL '24 hours'
      `);

      return {
        products: stats.rows,
        snapshots: snapshotStats.rows[0],
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error("Failed to get repository stats:", error);
      return null;
    }
  }

  /**
   * Cleanup old data
   */
  async cleanup(retentionDays = 90) {
    const client = await this.pool.connect();

    try {
      // Remove old snapshots
      const snapshotResult = await client.query(`
        DELETE FROM ai.supplier_rate_snapshots 
        WHERE snapshot_at < NOW() - INTERVAL '${retentionDays} days'
      `);

      this.logger.info(
        `Cleaned up ${snapshotResult.rowCount} old supplier snapshots`,
      );

      return {
        snapshots_removed: snapshotResult.rowCount,
      };
    } catch (error) {
      this.logger.error("Failed to cleanup old data:", error);
      return null;
    } finally {
      client.release();
    }
  }
}

// Export singleton instance
const cpoRepository = new CPORepository();

module.exports = cpoRepository;
