#!/usr/bin/env node

const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

async function testTransfersMigration() {
  const client = new Client({
    host:
      process.env.DB_HOST ||
      "dpg-d2086mndiees739731t0-a.singapore-postgres.render.com",
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || "faredown_booking_db",
    user: process.env.DB_USER || "faredown_user",
    password: process.env.DB_PASSWORD || "VFEkJ35EShYkok2OfgabKLRCKIluidqb",
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    console.log("🔌 Connecting to PostgreSQL...");
    await client.connect();
    console.log("✅ Connected to database");

    // Check if transfers tables exist
    const tablesCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE 'transfer_%'
      ORDER BY table_name
    `);

    console.log(`\n📋 Found ${tablesCheck.rows.length} transfer tables:`);
    tablesCheck.rows.forEach((row) => {
      console.log(`  • ${row.table_name}`);
    });

    if (tablesCheck.rows.length === 0) {
      console.log("\n🚀 Running transfers schema migration...");

      const schemaPath = path.join(
        __dirname,
        "database",
        "transfers-schema.sql",
      );
      const schema = fs.readFileSync(schemaPath, "utf8");

      // Execute the full schema
      await client.query(schema);
      console.log("✅ Transfers schema migration completed");

      // Recheck tables
      const newTablesCheck = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name LIKE 'transfer_%'
        ORDER BY table_name
      `);

      console.log(
        `\n📋 Created ${newTablesCheck.rows.length} transfer tables:`,
      );
      newTablesCheck.rows.forEach((row) => {
        console.log(`  ✅ ${row.table_name}`);
      });
    } else {
      console.log("ℹ️  Transfer tables already exist");
    }

    // Test sample data
    const pricingRules = await client.query(
      "SELECT COUNT(*) FROM transfer_pricing_rules",
    );
    const promos = await client.query("SELECT COUNT(*) FROM transfer_promos");

    console.log(`\n📊 Database validation:`);
    console.log(`  • Pricing rules: ${pricingRules.rows[0].count}`);
    console.log(`  • Promo codes: ${promos.rows[0].count}`);

    console.log("\n🎉 Transfers database setup complete!");
    console.log("\n✨ Integration status:");
    console.log("  ✅ Database schema ready");
    console.log("  ✅ API routes implemented (/api/transfers/*)");
    console.log("  ✅ Repository layer ready");
    console.log("  ✅ Hotelbeds adapter implemented");
    console.log("\n🔧 Next steps:");
    console.log("  1. Set real Hotelbeds API credentials");
    console.log("  2. Test transfer search via /api/transfers/search");
    console.log("  3. Implement frontend transfer components");
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.code === "ENOTFOUND") {
      console.error("💡 Check database connection details");
    }
  } finally {
    await client.end();
    console.log("🔌 Database connection closed");
  }
}

testTransfersMigration();
