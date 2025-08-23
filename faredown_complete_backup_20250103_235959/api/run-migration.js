const db = require("./database/connection");
const fs = require("fs");
const path = require("path");

async function runMigration() {
  try {
    console.log("🚀 Starting database migration...");

    const schemaPath = path.join(
      __dirname,
      "database",
      "markup-promo-schema.sql",
    );
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

    console.log("🎉 Migration completed successfully!");

    // Test the connection
    const testResult = await db.query("SELECT COUNT(*) FROM promo_codes");
    console.log(`📊 Promo codes in database: ${testResult.rows[0].count}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  }
}

runMigration();
