#!/usr/bin/env node

/**
 * Initialize Destinations Database
 * Sets up the destinations database schema and inserts initial data
 *
 * Usage:
 *   node server/scripts/init-destinations-db.js
 *
 * Environment Variables:
 *   DATABASE_URL - PostgreSQL connection string
 *   NODE_ENV - Environment (development/production)
 */

const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

class DatabaseInitializer {
  constructor() {
    this.pool = new Pool({
      connectionString:
        process.env.DATABASE_URL || "postgresql://localhost:5432/faredown_db",
      ssl:
        process.env.NODE_ENV === "production"
          ? { rejectUnauthorized: false }
          : false,
    });
  }

  async initialize() {
    console.log("🚀 Starting destinations database initialization...");

    try {
      // Test connection
      await this.testConnection();

      // Check if schema exists
      const schemaExists = await this.checkSchemaExists();

      if (schemaExists) {
        console.log("📊 Destinations schema already exists");
        const choice = await this.promptUser(
          "Do you want to recreate the schema? This will delete all existing data. (y/N): ",
        );

        if (choice.toLowerCase() !== "y" && choice.toLowerCase() !== "yes") {
          console.log("✅ Database initialization skipped");
          return;
        }

        console.log("🗑️  Dropping existing schema...");
        await this.dropSchema();
      }

      // Create schema
      await this.createSchema();

      // Verify setup
      await this.verifySetup();

      console.log("✅ Destinations database initialized successfully!");
      console.log("");
      console.log("📊 Database Statistics:");
      await this.showStatistics();
    } catch (error) {
      console.error("❌ Database initialization failed:", error);
      process.exit(1);
    } finally {
      await this.pool.end();
    }
  }

  async testConnection() {
    try {
      const result = await this.pool.query("SELECT NOW() as timestamp");
      console.log("✅ Database connection successful");
      console.log(`   Connected at: ${result.rows[0].timestamp}`);
    } catch (error) {
      console.error("❌ Database connection failed:", error.message);
      throw error;
    }
  }

  async checkSchemaExists() {
    try {
      const result = await this.pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name IN ('countries', 'destinations')
      `);

      return result.rows.length > 0;
    } catch (error) {
      console.error("Error checking schema:", error);
      return false;
    }
  }

  async dropSchema() {
    const tables = [
      "hotel_rooms_cache",
      "hotels_cache",
      "destination_searches",
      "destinations",
      "countries",
    ];

    for (const table of tables) {
      try {
        await this.pool.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
        console.log(`   Dropped table: ${table}`);
      } catch (error) {
        console.warn(
          `   Warning: Could not drop table ${table}:`,
          error.message,
        );
      }
    }

    // Drop functions
    try {
      await this.pool.query(
        "DROP FUNCTION IF EXISTS search_destinations CASCADE",
      );
      await this.pool.query(
        "DROP FUNCTION IF EXISTS update_updated_at_column CASCADE",
      );
      console.log("   Dropped functions");
    } catch (error) {
      console.warn("   Warning: Could not drop functions:", error.message);
    }

    // Drop views
    try {
      await this.pool.query(
        "DROP VIEW IF EXISTS destinations_search_view CASCADE",
      );
      console.log("   Dropped views");
    } catch (error) {
      console.warn("   Warning: Could not drop views:", error.message);
    }
  }

  async createSchema() {
    console.log("📊 Creating destinations database schema...");

    try {
      // Read schema file
      const schemaPath = path.join(
        __dirname,
        "../database/schema/destinations.sql",
      );
      const schemaSql = fs.readFileSync(schemaPath, "utf8");

      // Execute schema
      await this.pool.query(schemaSql);
      console.log("✅ Schema created successfully");
    } catch (error) {
      console.error("❌ Schema creation failed:", error);
      throw error;
    }
  }

  async verifySetup() {
    console.log("🔍 Verifying database setup...");

    // Check tables
    const tables = [
      "countries",
      "destinations",
      "hotels_cache",
      "hotel_rooms_cache",
      "destination_searches",
    ];
    for (const table of tables) {
      const result = await this.pool.query(`
        SELECT COUNT(*) as count FROM ${table}
      `);
      console.log(`   Table ${table}: ${result.rows[0].count} rows`);
    }

    // Check functions
    const functions = await this.pool.query(`
      SELECT routine_name FROM information_schema.routines 
      WHERE routine_schema = 'public' AND routine_type = 'FUNCTION'
    `);
    console.log(
      `   Functions: ${functions.rows.map((r) => r.routine_name).join(", ")}`,
    );

    // Check views
    const views = await this.pool.query(`
      SELECT table_name FROM information_schema.views 
      WHERE table_schema = 'public'
    `);
    console.log(`   Views: ${views.rows.map((r) => r.table_name).join(", ")}`);
  }

  async showStatistics() {
    try {
      // Countries count
      const countries = await this.pool.query(
        "SELECT COUNT(*) as count FROM countries",
      );
      console.log(`   Countries: ${countries.rows[0].count}`);

      // Destinations count
      const destinations = await this.pool.query(
        "SELECT COUNT(*) as count FROM destinations",
      );
      console.log(`   Destinations: ${destinations.rows[0].count}`);

      // Popular destinations
      const popular = await this.pool.query(
        "SELECT COUNT(*) as count FROM destinations WHERE popular = true",
      );
      console.log(`   Popular destinations: ${popular.rows[0].count}`);

      // Sample destinations
      const samples = await this.pool.query(`
        SELECT hotelbeds_code, name, country_name, popular 
        FROM destinations 
        ORDER BY popular DESC, search_priority ASC 
        LIMIT 10
      `);

      console.log("");
      console.log("📍 Sample destinations:");
      samples.rows.forEach((dest) => {
        const star = dest.popular ? "⭐" : "  ";
        console.log(
          `   ${star} ${dest.hotelbeds_code} - ${dest.name}, ${dest.country_name}`,
        );
      });
    } catch (error) {
      console.error("Error getting statistics:", error);
    }
  }

  async promptUser(question) {
    const readline = require("readline");
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve) => {
      rl.question(question, (answer) => {
        rl.close();
        resolve(answer);
      });
    });
  }
}

// Run if called directly
if (require.main === module) {
  const initializer = new DatabaseInitializer();
  initializer.initialize();
}

module.exports = DatabaseInitializer;
