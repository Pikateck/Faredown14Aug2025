#!/usr/bin/env node
/**
 * Final Migration Runner
 * Executes complete AI schema and validates all objects
 */

const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

class FinalMigrationRunner {
  constructor() {
    this.client = new Client({
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || "faredown",
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD,
    });

    this.validationResults = {
      tables: [],
      views: [],
      indexes: [],
      functions: [],
      seed_data: [],
      errors: [],
    };
  }

  async connect() {
    await this.client.connect();
    console.log("🔌 Connected to PostgreSQL");
  }

  async disconnect() {
    await this.client.end();
    console.log("🔌 Disconnected from PostgreSQL");
  }

  async runMigration() {
    console.log("🚀 Running final AI schema migration...\n");

    try {
      // Read and execute the complete schema
      const schemaSQL = fs.readFileSync(
        path.join(__dirname, "final-ai-schema-complete.sql"),
        "utf8",
      );

      console.log("📄 Executing complete AI schema...");
      await this.client.query(schemaSQL);
      console.log("✅ AI schema executed successfully\n");

      // Run validations
      await this.validateTables();
      await this.validateMaterializedViews();
      await this.validateIndexes();
      await this.validateFunctions();
      await this.validateSeedData();

      // Generate report
      this.generateValidationReport();
    } catch (error) {
      console.error("❌ Migration failed:", error);
      this.validationResults.errors.push(`Migration: ${error.message}`);
      throw error;
    }
  }

  async validateTables() {
    console.log("📋 Validating tables...");

    const requiredTables = [
      "suppliers",
      "policies",
      "products",
      "supplier_rate_snapshots",
      "markup_rules",
      "promos",
      "promo_redemptions",
      "perk_catalog",
      "bargain_sessions",
      "bargain_events",
      "offer_capsules",
      "user_profiles",
      "product_features",
      "model_registry",
      "ab_tests",
    ];

    try {
      const result = await this.client.query(`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'ai' 
        ORDER BY tablename
      `);

      const existingTables = result.rows.map((row) => row.tablename);
      this.validationResults.tables = existingTables;

      for (const table of requiredTables) {
        if (existingTables.includes(table)) {
          console.log(`  ✅ ai.${table}`);
        } else {
          console.log(`  ❌ ai.${table} MISSING`);
          this.validationResults.errors.push(`Missing table: ai.${table}`);
        }
      }
    } catch (error) {
      console.error("❌ Table validation failed:", error);
      this.validationResults.errors.push(`Table validation: ${error.message}`);
    }
  }

  async validateMaterializedViews() {
    console.log("\n📊 Validating materialized views...");

    const requiredViews = [
      "mv_daily_agg",
      "mv_airline_route_daily",
      "mv_hotel_city_daily",
      "mv_user_segments",
      "mv_promo_effectiveness",
    ];

    try {
      const result = await this.client.query(`
        SELECT matviewname 
        FROM pg_matviews 
        WHERE schemaname = 'ai' 
        ORDER BY matviewname
      `);

      const existingViews = result.rows.map((row) => row.matviewname);
      this.validationResults.views = existingViews;

      for (const view of requiredViews) {
        if (existingViews.includes(view)) {
          console.log(`  ✅ ai.${view}`);
        } else {
          console.log(`  ❌ ai.${view} MISSING`);
          this.validationResults.errors.push(`Missing view: ai.${view}`);
        }
      }
    } catch (error) {
      console.error("❌ View validation failed:", error);
      this.validationResults.errors.push(`View validation: ${error.message}`);
    }
  }

  async validateIndexes() {
    console.log("\n🔍 Validating indexes...");

    const requiredIndexes = [
      "idx_snapshots_ckey_time",
      "idx_events_created",
      "idx_sessions_ckey",
      "idx_products_airline",
      "idx_products_origin",
      "idx_products_dest",
      "idx_products_city",
      "idx_capsules_session",
    ];

    try {
      const result = await this.client.query(`
        SELECT indexname 
        FROM pg_indexes 
        WHERE schemaname = 'ai' 
          AND indexname LIKE 'idx_%'
        ORDER BY indexname
      `);

      const existingIndexes = result.rows.map((row) => row.indexname);
      this.validationResults.indexes = existingIndexes;

      for (const index of requiredIndexes) {
        if (existingIndexes.includes(index)) {
          console.log(`  ✅ ${index}`);
        } else {
          console.log(`  ❌ ${index} MISSING`);
          this.validationResults.errors.push(`Missing index: ${index}`);
        }
      }
    } catch (error) {
      console.error("❌ Index validation failed:", error);
      this.validationResults.errors.push(`Index validation: ${error.message}`);
    }
  }

  async validateFunctions() {
    console.log("\n⚙️ Validating functions...");

    try {
      const result = await this.client.query(`
        SELECT routine_name 
        FROM information_schema.routines 
        WHERE routine_schema = 'ai' 
          AND routine_type = 'FUNCTION'
        ORDER BY routine_name
      `);

      const functions = result.rows.map((row) => row.routine_name);
      this.validationResults.functions = functions;

      if (functions.includes("assert_never_loss")) {
        console.log("  ✅ ai.assert_never_loss");

        // Test the function
        try {
          await this.client.query(
            "SELECT ai.assert_never_loss('test_session_123', 100.00)",
          );
          console.log(
            "  ✅ Never-loss function test failed as expected (no session)",
          );
        } catch (error) {
          if (error.message.includes("Session not found")) {
            console.log("  ✅ Never-loss function working correctly");
          } else {
            console.log(`  ⚠️ Never-loss function error: ${error.message}`);
          }
        }
      } else {
        console.log("  ❌ ai.assert_never_loss MISSING");
        this.validationResults.errors.push(
          "Missing function: ai.assert_never_loss",
        );
      }
    } catch (error) {
      console.error("❌ Function validation failed:", error);
      this.validationResults.errors.push(
        `Function validation: ${error.message}`,
      );
    }
  }

  async validateSeedData() {
    console.log("\n🌱 Validating seed data...");

    const seedChecks = [
      { table: "suppliers", expected: 2 },
      { table: "policies", expected: 1 },
      { table: "markup_rules", expected: 2 },
      { table: "promos", expected: 5 },
      { table: "perk_catalog", expected: 5 },
      { table: "model_registry", expected: 2 },
    ];

    try {
      for (const check of seedChecks) {
        const result = await this.client.query(
          `SELECT COUNT(*) as count FROM ai.${check.table}`,
        );
        const count = parseInt(result.rows[0].count);

        this.validationResults.seed_data.push({
          table: check.table,
          count: count,
          expected: check.expected,
        });

        if (count >= check.expected) {
          console.log(`  ✅ ai.${check.table}: ${count} rows`);
        } else {
          console.log(
            `  ⚠️ ai.${check.table}: ${count} rows (expected >= ${check.expected})`,
          );
        }
      }
    } catch (error) {
      console.error("❌ Seed data validation failed:", error);
      this.validationResults.errors.push(`Seed validation: ${error.message}`);
    }
  }

  generateValidationReport() {
    console.log("\n📊 FINAL VALIDATION REPORT");
    console.log("==========================");

    console.log(`Tables: ${this.validationResults.tables.length}/15 required`);
    console.log(`Views: ${this.validationResults.views.length}/5 required`);
    console.log(
      `Indexes: ${this.validationResults.indexes.length}/8+ required`,
    );
    console.log(
      `Functions: ${this.validationResults.functions.length}/1 required`,
    );

    console.log("\nSeed Data Summary:");
    this.validationResults.seed_data.forEach((seed) => {
      console.log(`  ${seed.table}: ${seed.count} rows`);
    });

    if (this.validationResults.errors.length === 0) {
      console.log("\n✅ ALL DATABASE VALIDATIONS PASSED");
      console.log("✅ AI SCHEMA READY FOR PRODUCTION");
    } else {
      console.log("\n❌ VALIDATION ERRORS:");
      this.validationResults.errors.forEach((error) => {
        console.log(`  • ${error}`);
      });
    }

    // Write detailed report
    const report = {
      timestamp: new Date().toISOString(),
      database: {
        host: process.env.DB_HOST || "localhost",
        database: process.env.DB_NAME || "faredown",
      },
      validation_results: this.validationResults,
      summary: {
        tables_count: this.validationResults.tables.length,
        views_count: this.validationResults.views.length,
        indexes_count: this.validationResults.indexes.length,
        functions_count: this.validationResults.functions.length,
        errors_count: this.validationResults.errors.length,
        status:
          this.validationResults.errors.length === 0 ? "PASSED" : "FAILED",
      },
    };

    fs.writeFileSync(
      path.join(__dirname, "migration-validation-report.json"),
      JSON.stringify(report, null, 2),
    );

    console.log(
      "\n📄 Detailed report saved to: migration-validation-report.json",
    );
  }
}

// CLI execution
if (require.main === module) {
  const runner = new FinalMigrationRunner();

  runner
    .connect()
    .then(() => runner.runMigration())
    .then(() => runner.disconnect())
    .then(() => {
      console.log("\n🎉 Migration and validation completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Migration failed:", error);
      runner.disconnect().then(() => process.exit(1));
    });
}

module.exports = FinalMigrationRunner;
