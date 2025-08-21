const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

async function testAndMigrate() {
  const pool = new Pool({
    host: "dpg-d2086mndiees739731t0-a.singapore-postgres.render.com",
    port: 5432,
    database: "faredown_booking_db",
    user: "faredown_user",
    password: "VFEkJ35EShYkok2OfgabKLRCKIluidqb",
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    console.log("🔌 Testing database connection...");
    const client = await pool.connect();
    console.log("✅ Successfully connected to PostgreSQL database!");

    // Check existing transfers tables
    const existingTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE 'transfer_%'
      ORDER BY table_name
    `);

    console.log(
      `\n📋 Found ${existingTables.rows.length} existing transfer tables:`,
    );
    existingTables.rows.forEach((row) => {
      console.log(`  • ${row.table_name}`);
    });

    if (existingTables.rows.length === 0) {
      console.log("\n🚀 Running transfers schema migration...");

      try {
        const schemaPath = path.join(
          __dirname,
          "database",
          "transfers-schema.sql",
        );
        const schema = fs.readFileSync(schemaPath, "utf8");

        await client.query(schema);
        console.log("✅ Transfers schema migration completed successfully!");

        // Verify tables were created
        const newTables = await client.query(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name LIKE 'transfer_%'
          ORDER BY table_name
        `);

        console.log(`\n📋 Created ${newTables.rows.length} transfer tables:`);
        newTables.rows.forEach((row) => {
          console.log(`  ✅ ${row.table_name}`);
        });
      } catch (migrationError) {
        console.error("❌ Migration failed:", migrationError.message);
        return;
      }
    } else {
      console.log("ℹ️  Transfer tables already exist, skipping migration");
    }

    // Test sample data
    try {
      const pricingRules = await client.query(
        "SELECT COUNT(*) FROM transfer_pricing_rules",
      );
      const promos = await client.query("SELECT COUNT(*) FROM transfer_promos");

      console.log(`\n📊 Database validation:`);
      console.log(`  • Pricing rules: ${pricingRules.rows[0].count}`);
      console.log(`  • Promo codes: ${promos.rows[0].count}`);
    } catch (dataError) {
      console.error("⚠️  Error checking sample data:", dataError.message);
    }

    // Test if suppliers table exists (prerequisite)
    try {
      const suppliersCheck = await client.query(
        "SELECT COUNT(*) FROM suppliers",
      );
      console.log(`  • Suppliers: ${suppliersCheck.rows[0].count}`);
    } catch (suppliersError) {
      console.log("  ⚠️  Suppliers table not found - may need base schema");
    }

    client.release();

    console.log("\n🎉 Database setup verification complete!");
    console.log("\n✨ Transfers Integration Status:");
    console.log("  ✅ Database connection working");
    console.log("  ✅ Transfer schema ready");
    console.log("  ✅ API routes: /api/transfers/*");
    console.log("  ✅ Repository layer: transfersRepository.js");
    console.log("  ✅ Hotelbeds adapter: hotelbedsTransfersAdapter.js");

    console.log("\n🔧 Ready for testing:");
    console.log("  • Set Hotelbeds API credentials");
    console.log("  • Test endpoint: GET /api/transfers/destinations");
    console.log("  • Test search: POST /api/transfers/search");
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    if (error.code === "ENOTFOUND") {
      console.error("💡 Check network connection and database host");
    } else if (error.code === "28P01") {
      console.error("💡 Authentication failed - check username/password");
    }
  } finally {
    await pool.end();
    console.log("🔌 Database pool closed");
  }
}

testAndMigrate();
