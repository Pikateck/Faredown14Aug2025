/**
 * Test Database Connection to Render PostgreSQL
 */

require("dotenv").config();
const db = require("./database/connection");

async function testDatabaseConnection() {
  console.log("🧪 Testing PostgreSQL Connection to Render Database");
  console.log("=".repeat(50));

  try {
    console.log("📋 Configuration:");
    console.log(`  Host: ${process.env.DB_HOST}`);
    console.log(`  Database: ${process.env.DB_NAME}`);
    console.log(`  User: ${process.env.DB_USER}`);
    console.log(`  Port: ${process.env.DB_PORT}`);
    console.log(
      `  Using DATABASE_URL: ${process.env.DATABASE_URL ? "Yes" : "No"}`,
    );
    console.log("");

    // Initialize connection
    console.log("🔌 Initializing database connection...");
    await db.initialize();

    // Test basic query
    console.log("📊 Testing basic query...");
    const result = await db.query(
      "SELECT NOW() as server_time, version() as postgres_version",
    );
    console.log(`  Server Time: ${result.rows[0].server_time}`);
    console.log(
      `  PostgreSQL Version: ${result.rows[0].postgres_version.split(" ")[0]}`,
    );

    // Initialize schema
    console.log("🏗️ Initializing database schema...");
    await db.initializeSchema();

    // Test table creation
    console.log("📋 Checking created tables...");
    const tablesResult = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    console.log("  Created tables:");
    tablesResult.rows.forEach((row) => {
      console.log(`    ✅ ${row.table_name}`);
    });

    // Test inserting a supplier
    console.log("💾 Testing data insertion...");
    const supplierResult = await db.query(`
      INSERT INTO suppliers (name, is_active, markup_percentage) 
      VALUES ('hotelbeds', true, 15.00) 
      ON CONFLICT (name) DO UPDATE 
      SET updated_at = CURRENT_TIMESTAMP
      RETURNING id, name, markup_percentage
    `);

    console.log(
      `  Supplier inserted/updated: ${supplierResult.rows[0].name} (ID: ${supplierResult.rows[0].id})`,
    );

    // Get connection stats
    console.log("📈 Connection statistics:");
    const stats = db.getStats();
    console.log(`  Connected: ${stats.connected}`);
    console.log(`  Total connections: ${stats.totalCount}`);
    console.log(`  Idle connections: ${stats.idleCount}`);
    console.log(`  Max connections: ${stats.maxConnections}`);

    console.log("");
    console.log("🎉 Database connection test SUCCESSFUL!");
    console.log("✅ Render PostgreSQL is connected and ready");
    console.log("✅ Schema created successfully");
    console.log("✅ Data insertion/updates working");
  } catch (error) {
    console.error("");
    console.error("❌ Database connection test FAILED:");
    console.error(`   Error: ${error.message}`);
    console.error(`   Code: ${error.code}`);
    console.error("");

    if (error.code === "ENOTFOUND") {
      console.error(
        "💡 Troubleshooting: Check if the database host is correct",
      );
    } else if (error.code === "ECONNREFUSED") {
      console.error(
        "💡 Troubleshooting: Check if the database port is correct",
      );
    } else if (error.message.includes("authentication")) {
      console.error("💡 Troubleshooting: Check database username and password");
    }

    process.exit(1);
  } finally {
    // Close connection
    await db.close();
    console.log("🔌 Database connection closed");
    process.exit(0);
  }
}

// Run the test
if (require.main === module) {
  testDatabaseConnection();
}

module.exports = { testDatabaseConnection };
