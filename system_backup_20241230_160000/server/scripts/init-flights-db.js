/**
 * Flight Database Initialization Script
 * Run this to create flight tables in the Render database
 */

const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

// Database connection configuration
const dbConfig = {
  connectionString: process.env.DATABASE_URL || process.env.RENDER_DB_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
};

async function initializeFlightDatabase() {
  const pool = new Pool(dbConfig);

  try {
    console.log("🛫 Initializing flight database schema...");

    // Read the SQL schema file
    const schemaPath = path.join(__dirname, "../database/schema/flights.sql");
    const flightSchema = fs.readFileSync(schemaPath, "utf8");

    // Execute the schema
    console.log("📝 Creating flight tables...");
    await pool.query(flightSchema);

    console.log("✅ Flight database schema initialized successfully!");
    console.log("");
    console.log("Created tables:");
    console.log("  - airlines");
    console.log("  - airports");
    console.log("  - aircraft_types");
    console.log("  - flight_schedules");
    console.log("  - flights");
    console.log("  - flight_searches_cache");
    console.log("  - flight_bookings");
    console.log("  - flight_booking_segments");
    console.log("  - flight_passengers");
    console.log("  - flight_routes");
    console.log("");
    console.log("🎯 Flight booking system is ready to use!");

    // Test the connection
    const testQuery = `
      SELECT 
        COUNT(*) as airline_count,
        (SELECT COUNT(*) FROM airports) as airport_count,
        (SELECT COUNT(*) FROM flight_routes) as route_count
      FROM airlines
    `;

    const result = await pool.query(testQuery);
    const stats = result.rows[0];

    console.log("📊 Database Statistics:");
    console.log(`  - Airlines: ${stats.airline_count}`);
    console.log(`  - Airports: ${stats.airport_count}`);
    console.log(`  - Popular Routes: ${stats.route_count}`);
  } catch (error) {
    console.error("❌ Error initializing flight database:", error);
    console.error("");
    console.error("Common solutions:");
    console.error("1. Check DATABASE_URL environment variable");
    console.error("2. Ensure database is accessible");
    console.error("3. Verify database permissions");
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  initializeFlightDatabase();
}

module.exports = { initializeFlightDatabase };
