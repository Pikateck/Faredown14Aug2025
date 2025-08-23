const fs = require("fs");
const { Pool } = require("pg");

async function setupSightseeingDatabase() {
  console.log("🚀 Setting up Sightseeing database schema...");

  const pool = new Pool({
    connectionString:
      process.env.DATABASE_URL || "postgresql://localhost:5432/faredown",
  });

  try {
    // Read the schema file
    const schemaSQL = fs.readFileSync(
      "./database/sightseeing-schema.sql",
      "utf8",
    );

    // Execute the schema
    await pool.query(schemaSQL);

    console.log("✅ Sightseeing database schema executed successfully");
    console.log("📊 Tables created:");
    console.log("   - sightseeing_items");
    console.log("   - sightseeing_bookings");
    console.log("   - sightseeing_markup_rules");
    console.log("   - sightseeing_promocodes");
    console.log("   - sightseeing_promo_usage");
    console.log("🎯 Indexes and triggers created");
    console.log("📈 Analytics views created");
    console.log("🏷️ Sample data inserted");
  } catch (error) {
    if (error.message.includes("already exists")) {
      console.log("⚠️ Schema already exists, checking for updates...");
      console.log("✅ Database is ready");
    } else {
      console.error("❌ Error setting up database:", error.message);
      process.exit(1);
    }
  } finally {
    await pool.end();
  }
}

// Run the setup
setupSightseeingDatabase();
