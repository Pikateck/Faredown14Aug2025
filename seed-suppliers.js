#!/usr/bin/env node

/**
 * Supplier Management Database Seeding Script
 * Run this to set up the enhanced suppliers table and seed initial data
 */

const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

async function seedDatabase() {
  // Database connection configuration
  const client = new Client({
    connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
  });

  try {
    console.log("🔗 Connecting to PostgreSQL database...");
    await client.connect();
    console.log("✅ Connected successfully!");

    // Read the migration SQL file
    const migrationPath = path.join(
      __dirname,
      "database-suppliers-migration.sql",
    );
    const migrationSQL = fs.readFileSync(migrationPath, "utf8");

    console.log("🗄️ Running suppliers migration...");

    // Execute the migration in a transaction
    await client.query("BEGIN");

    try {
      // Split SQL into individual statements and execute them
      const statements = migrationSQL
        .split(";")
        .map((stmt) => stmt.trim())
        .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"));

      for (const statement of statements) {
        if (statement.trim()) {
          await client.query(statement);
        }
      }

      await client.query("COMMIT");
      console.log("✅ Migration completed successfully!");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }

    // Verify the seeded data
    console.log("🔍 Verifying seeded suppliers...");
    const result = await client.query(`
      SELECT name, code, type, status, environment, credential_profile 
      FROM suppliers 
      ORDER BY code
    `);

    console.log("📊 Seeded suppliers:");
    result.rows.forEach((row) => {
      console.log(
        `  • ${row.name} (${row.code}) - ${row.type} - ${row.status} - ${row.environment}`,
      );
      console.log(`    Credential Profile: ${row.credential_profile}`);
    });

    // Check sync logs
    const logsResult = await client.query(`
      SELECT COUNT(*) as log_count FROM supplier_sync_logs
    `);

    console.log(`📋 Sample sync logs created: ${logsResult.rows[0].log_count}`);

    // Get analytics summary
    const analyticsResult = await client.query(`
      SELECT * FROM get_supplier_health_summary()
    `);

    const analytics = analyticsResult.rows[0];
    console.log("📈 Supplier Health Summary:");
    console.log(`  • Total: ${analytics.total_suppliers}`);
    console.log(`  • Active: ${analytics.active_suppliers}`);
    console.log(`  • Testing: ${analytics.testing_suppliers}`);
    console.log(`  • Disabled: ${analytics.disabled_suppliers}`);
    console.log(`  • Avg Success Rate: ${analytics.avg_success_rate || 0}%`);
    console.log(`  • Avg Response Time: ${analytics.avg_response_time || 0}ms`);

    console.log("\n🎉 Supplier management system is ready!");
    console.log("\n📋 Next steps:");
    console.log("1. Go to Admin Dashboard → Supplier Management");
    console.log("2. Verify Hotelbeds and Amadeus suppliers are listed");
    console.log("3. Test supplier connections using the test buttons");
    console.log('4. Set suppliers to "Active" when ready for production');

    console.log("\n🔐 Credential Configuration:");
    console.log("Environment variables should be set:");
    console.log("- HOTELBEDS_API_KEY");
    console.log("- HOTELBEDS_API_SECRET");
    console.log("- HOTELBEDS_BASE_URL");
    console.log("- AMADEUS_API_KEY");
    console.log("- AMADEUS_API_SECRET");
    console.log("- AMADEUS_BASE_URL");
  } catch (error) {
    console.error("❌ Database seeding failed:", error);
    process.exit(1);
  } finally {
    await client.end();
    console.log("🔚 Database connection closed.");
  }
}

// Environment variable check
function checkEnvironment() {
  console.log("🔧 Checking environment configuration...");

  const requiredEnvVars = [
    "DATABASE_URL",
    "HOTELBEDS_API_KEY",
    "HOTELBEDS_API_SECRET",
    "AMADEUS_API_KEY",
    "AMADEUS_API_SECRET",
  ];

  const missing = requiredEnvVars.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    console.log("⚠️ Missing environment variables:");
    missing.forEach((varName) => console.log(`  • ${varName}`));
    console.log(
      "\nNote: Seeding will continue, but supplier testing may fail without proper credentials.",
    );
  } else {
    console.log("✅ All required environment variables are set.");
  }
}

// Run the seeding
async function main() {
  console.log("🚀 Starting Supplier Management Database Setup...\n");

  checkEnvironment();
  await seedDatabase();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { seedDatabase };
