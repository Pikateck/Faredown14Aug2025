/**
 * Redis Initialization Script for AI Bargaining Platform
 * Sets up cache structure and loads initial data
 */

const redisService = require("../services/redisService");
const { Pool } = require("pg");
require("dotenv").config();

async function initRedis() {
  console.log("🚀 Initializing Redis for AI Bargaining Platform...");

  try {
    // Initialize Redis connection
    const connected = await redisService.init();
    if (!connected) {
      throw new Error("Failed to connect to Redis");
    }

    console.log("✅ Redis connected successfully");

    // Initialize PostgreSQL connection for data loading
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl:
        process.env.NODE_ENV === "production"
          ? { rejectUnauthorized: false }
          : false,
    });

    console.log("📊 Loading initial data from PostgreSQL...");

    // 1. Load and cache active policy
    const policyResult = await pool.query(
      "SELECT * FROM ai.policies WHERE version = $1",
      ["v1"],
    );
    if (policyResult.rows.length > 0) {
      const policy = policyResult.rows[0];
      await redisService.setActivePolicy({
        version: policy.version,
        yaml: policy.dsl_yaml,
        checksum: policy.checksum,
        activated_at: policy.activated_at,
      });
      console.log("  ✓ Active policy v1 cached");
    }

    // 2. Load and cache supplier data
    const suppliersResult = await pool.query(
      "SELECT * FROM ai.suppliers WHERE active = true",
    );
    const suppliers = suppliersResult.rows;
    await redisService.set("config:suppliers", suppliers, 3600); // 1 hour TTL
    console.log(`  ✓ ${suppliers.length} active suppliers cached`);

    // 3. Load and cache model configuration
    const modelsResult = await pool.query(
      "SELECT * FROM ai.model_registry WHERE active = true",
    );
    const activeModels = modelsResult.rows.reduce((acc, model) => {
      acc[model.name] = {
        version: model.version,
        artifact_uri: model.artifact_uri,
        created_at: model.created_at,
      };
      return acc;
    }, {});

    await redisService.setModelConfig(activeModels);
    console.log(`  ✓ ${Object.keys(activeModels).length} active models cached`);

    // 4. Load and cache A/B test configuration
    const abTestsResult = await pool.query(
      "SELECT * FROM ai.ab_tests WHERE active = true",
    );
    const abTests = abTestsResult.rows.reduce((acc, test) => {
      acc[test.name] = {
        variants: test.variants,
        kpis: test.kpis,
        created_at: test.created_at,
      };
      return acc;
    }, {});

    await redisService.setABConfig(abTests);
    console.log(`  ✓ ${Object.keys(abTests).length} A/B tests cached`);

    // 5. Pre-cache top product features
    const topProductsResult = await pool.query(`
      SELECT p.canonical_key, p.product_type, p.attrs, pf.*
      FROM ai.products p
      LEFT JOIN ai.product_features pf ON p.canonical_key = pf.canonical_key
      ORDER BY pf.demand_score DESC NULLS LAST
      LIMIT 50
    `);

    let cachedProducts = 0;
    for (const product of topProductsResult.rows) {
      if (product.demand_score) {
        await redisService.setProductFeatures(product.canonical_key, {
          demand_score: product.demand_score,
          comp_pressure: product.comp_pressure,
          avg_accept_depth: product.avg_accept_depth,
          seasonality: product.seasonality,
          updated_at: product.updated_at,
        });
        cachedProducts++;
      }
    }
    console.log(`  ✓ ${cachedProducts} top product features cached`);

    // 6. Pre-cache latest supplier rate snapshots
    const snapshotsResult = await pool.query(`
      SELECT DISTINCT ON (canonical_key, supplier_id) 
        canonical_key, supplier_id, currency, net, taxes, fees, 
        fx_rate, inventory_state, snapshot_at
      FROM ai.supplier_rate_snapshots
      WHERE snapshot_at > NOW() - INTERVAL '1 hour'
      ORDER BY canonical_key, supplier_id, snapshot_at DESC
    `);

    // Group snapshots by canonical_key
    const snapshotsByProduct = {};
    for (const snapshot of snapshotsResult.rows) {
      if (!snapshotsByProduct[snapshot.canonical_key]) {
        snapshotsByProduct[snapshot.canonical_key] = [];
      }
      snapshotsByProduct[snapshot.canonical_key].push(snapshot);
    }

    let cachedSnapshots = 0;
    for (const [canonicalKey, snapshots] of Object.entries(
      snapshotsByProduct,
    )) {
      await redisService.setSupplierRates(canonicalKey, snapshots);
      cachedSnapshots++;
    }
    console.log(`  ✓ ${cachedSnapshots} product rate snapshots cached`);

    // 7. Cache demo user profiles
    const userProfilesResult = await pool.query(
      "SELECT * FROM ai.user_profiles LIMIT 10",
    );
    for (const profile of userProfilesResult.rows) {
      await redisService.setUserFeatures(profile.user_id, {
        tier: profile.tier,
        rfm: profile.rfm,
        style: profile.style,
        ltv_usd: profile.ltv_usd,
        updated_at: profile.updated_at,
      });
    }
    console.log(`  ✓ ${userProfilesResult.rows.length} user profiles cached`);

    // 8. Verify cache health
    const healthMetrics = await redisService.getHealthMetrics();
    console.log("\n📈 Cache Health Metrics:");
    console.log(`  Connected: ${healthMetrics?.connected}`);
    console.log(`  Policies: ${healthMetrics?.bargain_keys?.policies}`);
    console.log(`  Features: ${healthMetrics?.bargain_keys?.features}`);
    console.log(`  Rates: ${healthMetrics?.bargain_keys?.rates}`);
    console.log(`  Config: ${healthMetrics?.bargain_keys?.config}`);

    await pool.end();
    console.log("\n✅ Redis initialization completed successfully!");
    console.log(
      "🎯 AI Bargaining Platform cache is ready for <300ms responses",
    );
  } catch (error) {
    console.error("❌ Redis initialization failed:", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down Redis initialization...");
  await redisService.close();
  process.exit(0);
});

// Run initialization
if (require.main === module) {
  initRedis().catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  });
}

module.exports = { initRedis };
