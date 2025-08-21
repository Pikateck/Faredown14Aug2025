#!/usr/bin/env node
/**
 * Transfers Module Migration Runner
 * Executes transfers database schema and validates all objects
 */

const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

class TransfersMigrationRunner {
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
      indexes: [],
      views: [],
      triggers: [],
      functions: [],
      sample_data: [],
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
    console.log("🚀 Running Transfers module migration...\n");

    try {
      // Check if suppliers table exists (prerequisite)
      await this.validatePrerequisites();

      // Read and execute the transfers schema
      const schemaSQL = fs.readFileSync(
        path.join(__dirname, "transfers-schema.sql"),
        "utf8",
      );

      console.log("📄 Executing transfers schema...");
      await this.client.query(schemaSQL);
      console.log("✅ Transfers schema executed successfully\n");

      // Run validations
      await this.validateTables();
      await this.validateIndexes();
      await this.validateViews();
      await this.validateTriggers();
      await this.validateSampleData();

      // Generate report
      this.generateValidationReport();
    } catch (error) {
      console.error("❌ Migration failed:", error);
      this.validationResults.errors.push(`Migration: ${error.message}`);
      throw error;
    }
  }

  async validatePrerequisites() {
    console.log("🔍 Validating prerequisites...");

    const requiredTables = ["suppliers", "users"];

    for (const table of requiredTables) {
      try {
        const result = await this.client.query(
          `
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          )
        `,
          [table],
        );

        if (!result.rows[0].exists) {
          throw new Error(
            `Required table '${table}' does not exist. Please run base schema migration first.`,
          );
        }
        console.log(`  ✅ ${table} table exists`);
      } catch (error) {
        console.error(`  ❌ ${table} table check failed:`, error.message);
        this.validationResults.errors.push(
          `Prerequisite: ${table} table missing`,
        );
        throw error;
      }
    }
    console.log("✅ All prerequisites validated\n");
  }

  async validateTables() {
    console.log("📋 Validating transfers tables...");

    const requiredTables = [
      "transfer_suppliers",
      "transfer_routes_cache",
      "transfer_products",
      "transfer_bookings",
      "transfer_pricing_rules",
      "transfer_promos",
      "transfer_promo_usage",
      "transfer_audit_logs",
    ];

    try {
      const result = await this.client.query(`
        SELECT table_name, 
               (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
        FROM information_schema.tables t
        WHERE table_schema = 'public' 
        AND table_name LIKE 'transfer_%'
        ORDER BY table_name
      `);

      const existingTables = result.rows.map((row) => row.table_name);
      console.log(`  Found ${existingTables.length} transfers tables`);

      for (const table of requiredTables) {
        if (existingTables.includes(table)) {
          const tableInfo = result.rows.find((row) => row.table_name === table);
          console.log(`  ✅ ${table} (${tableInfo.column_count} columns)`);
          this.validationResults.tables.push({
            name: table,
            status: "created",
            columns: tableInfo.column_count,
          });
        } else {
          console.log(`  ❌ ${table} - MISSING`);
          this.validationResults.errors.push(`Table: ${table} not created`);
        }
      }

      console.log("✅ Tables validation completed\n");
    } catch (error) {
      console.error("❌ Tables validation failed:", error);
      this.validationResults.errors.push(`Tables: ${error.message}`);
    }
  }

  async validateIndexes() {
    console.log("🔍 Validating transfers indexes...");

    try {
      const result = await this.client.query(`
        SELECT 
          schemaname,
          tablename,
          indexname,
          indexdef
        FROM pg_indexes 
        WHERE tablename LIKE 'transfer_%'
        ORDER BY tablename, indexname
      `);

      console.log(`  Found ${result.rows.length} indexes on transfers tables`);

      const expectedIndexes = [
        "idx_transfer_suppliers_supplier_id",
        "idx_transfer_suppliers_is_active",
        "idx_transfer_routes_cache_hash",
        "idx_transfer_routes_cache_supplier",
        "idx_transfer_routes_cache_expires",
        "idx_transfer_bookings_ref",
        "idx_transfer_bookings_supplier",
        "idx_transfer_bookings_user",
        "idx_transfer_bookings_status",
        "idx_transfer_pricing_rules_type",
        "idx_transfer_promos_code",
        "idx_transfer_promos_is_active",
      ];

      const existingIndexes = result.rows.map((row) => row.indexname);

      for (const expectedIndex of expectedIndexes) {
        if (existingIndexes.includes(expectedIndex)) {
          console.log(`  ✅ ${expectedIndex}`);
          this.validationResults.indexes.push({
            name: expectedIndex,
            status: "created",
          });
        } else {
          console.log(`  ⚠️  ${expectedIndex} - NOT FOUND`);
          this.validationResults.errors.push(
            `Index: ${expectedIndex} not created`,
          );
        }
      }

      console.log("✅ Indexes validation completed\n");
    } catch (error) {
      console.error("❌ Indexes validation failed:", error);
      this.validationResults.errors.push(`Indexes: ${error.message}`);
    }
  }

  async validateViews() {
    console.log("👁️  Validating transfers views...");

    const expectedViews = [
      "transfer_booking_summary",
      "transfer_revenue_analytics",
    ];

    try {
      const result = await this.client.query(`
        SELECT table_name
        FROM information_schema.views
        WHERE table_schema = 'public'
        AND table_name LIKE 'transfer_%'
        ORDER BY table_name
      `);

      const existingViews = result.rows.map((row) => row.table_name);
      console.log(`  Found ${existingViews.length} transfers views`);

      for (const view of expectedViews) {
        if (existingViews.includes(view)) {
          console.log(`  ✅ ${view}`);
          this.validationResults.views.push({
            name: view,
            status: "created",
          });
        } else {
          console.log(`  ❌ ${view} - MISSING`);
          this.validationResults.errors.push(`View: ${view} not created`);
        }
      }

      console.log("✅ Views validation completed\n");
    } catch (error) {
      console.error("❌ Views validation failed:", error);
      this.validationResults.errors.push(`Views: ${error.message}`);
    }
  }

  async validateTriggers() {
    console.log("⚡ Validating transfers triggers...");

    try {
      const result = await this.client.query(`
        SELECT 
          trigger_name,
          table_name,
          action_timing,
          event_manipulation
        FROM information_schema.triggers
        WHERE table_name LIKE 'transfer_%'
        ORDER BY table_name, trigger_name
      `);

      console.log(`  Found ${result.rows.length} triggers on transfers tables`);

      const expectedTriggers = [
        "update_transfer_suppliers_updated_at",
        "update_transfer_routes_cache_updated_at",
        "update_transfer_products_updated_at",
        "update_transfer_bookings_updated_at",
        "update_transfer_pricing_rules_updated_at",
        "update_transfer_promos_updated_at",
      ];

      const existingTriggers = result.rows.map((row) => row.trigger_name);

      for (const trigger of expectedTriggers) {
        if (existingTriggers.includes(trigger)) {
          console.log(`  ✅ ${trigger}`);
          this.validationResults.triggers.push({
            name: trigger,
            status: "created",
          });
        } else {
          console.log(`  ⚠️  ${trigger} - NOT FOUND`);
        }
      }

      console.log("✅ Triggers validation completed\n");
    } catch (error) {
      console.error("❌ Triggers validation failed:", error);
      this.validationResults.errors.push(`Triggers: ${error.message}`);
    }
  }

  async validateSampleData() {
    console.log("📊 Validating sample data...");

    try {
      // Check default pricing rule
      const pricingResult = await this.client.query(`
        SELECT COUNT(*) as count
        FROM transfer_pricing_rules 
        WHERE rule_name = 'Global Transfer Markup'
      `);

      if (pricingResult.rows[0].count > 0) {
        console.log("  ✅ Default pricing rule created");
        this.validationResults.sample_data.push({
          type: "pricing_rule",
          status: "created",
        });
      } else {
        console.log("  ⚠️  Default pricing rule missing");
      }

      // Check sample promo code
      const promoResult = await this.client.query(`
        SELECT COUNT(*) as count
        FROM transfer_promos 
        WHERE code = 'TRANSFER25'
      `);

      if (promoResult.rows[0].count > 0) {
        console.log("  ✅ Sample promo code created");
        this.validationResults.sample_data.push({
          type: "promo_code",
          status: "created",
        });
      } else {
        console.log("  ⚠️  Sample promo code missing");
      }

      console.log("✅ Sample data validation completed\n");
    } catch (error) {
      console.error("❌ Sample data validation failed:", error);
      this.validationResults.errors.push(`Sample data: ${error.message}`);
    }
  }

  generateValidationReport() {
    console.log("📊 TRANSFERS MIGRATION VALIDATION REPORT");
    console.log("=".repeat(50));

    const { tables, indexes, views, triggers, sample_data, errors } =
      this.validationResults;

    // Summary
    console.log(`\n📈 SUMMARY:`);
    console.log(`  • Tables: ${tables.length} created`);
    console.log(`  • Indexes: ${indexes.length} created`);
    console.log(`  • Views: ${views.length} created`);
    console.log(`  • Triggers: ${triggers.length} created`);
    console.log(`  • Sample Data: ${sample_data.length} items created`);
    console.log(`  • Errors: ${errors.length} errors`);

    // Errors
    if (errors.length > 0) {
      console.log(`\n❌ ERRORS (${errors.length}):`);
      errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }

    // Success
    if (errors.length === 0) {
      console.log(`\n🎉 TRANSFERS MIGRATION COMPLETED SUCCESSFULLY!`);
      console.log(`\n✨ Ready for Transfers module development:`);
      console.log(`  • Database schema is ready`);
      console.log(`  • All required tables created`);
      console.log(`  • Indexes optimized for performance`);
      console.log(`  • Views available for analytics`);
      console.log(`  • Sample data inserted`);
      console.log(`\nNext steps:`);
      console.log(`  1. Implement Hotelbeds Transfers API adapter`);
      console.log(`  2. Create transfer search and booking services`);
      console.log(`  3. Build transfer results and checkout pages`);
      console.log(`  4. Add admin dashboard sections`);
    } else {
      console.log(`\n⚠️  MIGRATION COMPLETED WITH ISSUES`);
      console.log(`Please review and fix the errors above.`);
    }

    console.log("\n" + "=".repeat(50));
  }
}

// Main execution
async function main() {
  const runner = new TransfersMigrationRunner();

  try {
    await runner.connect();
    await runner.runMigration();
  } catch (error) {
    console.error("💥 Migration failed:", error.message);
    process.exit(1);
  } finally {
    await runner.disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = TransfersMigrationRunner;
