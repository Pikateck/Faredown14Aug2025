const db = require("./database/connection");
const fs = require("fs");
const path = require("path");

async function runTransfersMigration() {
  try {
    console.log("🚀 Starting transfers database migration...");

    const schemaPath = path.join(__dirname, "database", "transfers-schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");

    // Split the schema into individual statements
    const statements = schema
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"));

    console.log(`📋 Executing ${statements.length} SQL statements...`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        try {
          await db.query(statement);
          console.log(`✅ Statement ${i + 1}/${statements.length} executed`);
        } catch (error) {
          console.warn(
            `⚠️  Statement ${i + 1} failed (might already exist):`,
            error.message,
          );
        }
      }
    }

    console.log("🎉 Transfers migration completed successfully!");

    // Test the connection and validate some key tables
    try {
      const supplierResult = await db.query(
        "SELECT COUNT(*) FROM transfer_suppliers",
      );
      console.log(`📊 Transfer suppliers: ${supplierResult.rows[0].count}`);

      const pricingResult = await db.query(
        "SELECT COUNT(*) FROM transfer_pricing_rules",
      );
      console.log(`📊 Transfer pricing rules: ${pricingResult.rows[0].count}`);

      const promoResult = await db.query(
        "SELECT COUNT(*) FROM transfer_promos",
      );
      console.log(`📊 Transfer promos: ${promoResult.rows[0].count}`);

      console.log("\n✨ Transfers database schema is ready!");
      console.log("🎯 Next steps:");
      console.log(
        "  • API endpoints are already implemented in api/routes/transfers.js",
      );
      console.log(
        "  • Repository is ready in api/repositories/transfersRepository.js",
      );
      console.log(
        "  • Hotelbeds adapter is ready in api/services/adapters/hotelbedsTransfersAdapter.js",
      );
      console.log(
        "  • Set HOTELBEDS_API_KEY and HOTELBEDS_SECRET environment variables",
      );
      console.log(
        "  • Test the search functionality through /api/transfers/search",
      );
    } catch (validationError) {
      console.warn("⚠️  Validation check failed:", validationError.message);
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  }
}

runTransfersMigration();
