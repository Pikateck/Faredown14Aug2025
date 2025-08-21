/**
 * AI Bargaining Platform Migration Runner
 * Executes the AI schema and seed data migrations
 */

const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Database configuration
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL || process.env.DB_CONNECTION_STRING,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

async function runMigration() {
  const client = await pool.connect();

  try {
    console.log("🚀 Starting AI Bargaining Platform migration...");

    // Read schema file
    const schemaPath = path.join(__dirname, "ai-bargaining-schema.sql");
    const schemaSQL = fs.readFileSync(schemaPath, "utf8");

    // Read seed file
    const seedPath = path.join(__dirname, "ai-bargaining-seed.sql");
    const seedSQL = fs.readFileSync(seedPath, "utf8");

    // Begin transaction
    await client.query("BEGIN");

    console.log("📊 Creating AI schema and tables...");
    await client.query(schemaSQL);

    console.log("🌱 Inserting seed data...");
    await client.query(seedSQL);

    // Create unique indexes for materialized views (for concurrent refresh)
    console.log("📈 Creating materialized view indexes...");
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS mv_daily_agg_pkey 
      ON ai.mv_daily_agg (day, product_type, COALESCE(primary_supplier_id, 0));
      
      CREATE UNIQUE INDEX IF NOT EXISTS mv_airline_route_daily_pkey 
      ON ai.mv_airline_route_daily (day, COALESCE(airline, ''), COALESCE(origin, ''), COALESCE(dest, ''));
      
      CREATE UNIQUE INDEX IF NOT EXISTS mv_hotel_city_daily_pkey 
      ON ai.mv_hotel_city_daily (day, COALESCE(city, ''), COALESCE(hotel_id, ''));
    `);

    // Commit transaction
    await client.query("COMMIT");

    console.log("✅ AI Bargaining Platform migration completed successfully!");

    // Display summary
    const summary = await client.query(`
      SELECT 
        'suppliers' as table_name, COUNT(*) as count FROM ai.suppliers
      UNION ALL
      SELECT 'policies', COUNT(*) FROM ai.policies  
      UNION ALL
      SELECT 'products', COUNT(*) FROM ai.products
      UNION ALL
      SELECT 'supplier_snapshots', COUNT(*) FROM ai.supplier_rate_snapshots
      UNION ALL
      SELECT 'markup_rules', COUNT(*) FROM ai.markup_rules
      UNION ALL
      SELECT 'perks', COUNT(*) FROM ai.perk_catalog
      UNION ALL
      SELECT 'promos', COUNT(*) FROM ai.promos
      UNION ALL
      SELECT 'user_profiles', COUNT(*) FROM ai.user_profiles
      ORDER BY table_name;
    `);

    console.log("\n📋 Migration Summary:");
    summary.rows.forEach((row) => {
      console.log(`  ${row.table_name}: ${row.count} records`);
    });

    // Test policy parsing
    const policyTest = await client.query(
      "SELECT version, LEFT(dsl_yaml, 100) as preview FROM ai.policies WHERE version = $1",
      ["v1"],
    );
    if (policyTest.rows.length > 0) {
      console.log("\n🎯 Policy v1 loaded successfully");
      console.log("Preview:", policyTest.rows[0].preview + "...");
    }
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Migration interrupted");
  await pool.end();
  process.exit(0);
});

// Run migration
if (require.main === module) {
  runMigration().catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  });
}

module.exports = { runMigration };
