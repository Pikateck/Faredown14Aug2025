require("dotenv").config();
const db = require("./database/connection");

async function quickTest() {
  try {
    console.log("🧪 Quick Database Test");
    console.log("======================");

    await db.initialize();

    // Test 1: Basic query
    const timeResult = await db.query("SELECT NOW() as current_time");
    console.log(`✅ Database time: ${timeResult.rows[0].current_time}`);

    // Test 2: Check tables
    const tablesResult = await db.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' ORDER BY table_name
    `);
    console.log(`✅ Tables found: ${tablesResult.rows.length}`);
    tablesResult.rows.forEach((row) => console.log(`   - ${row.table_name}`));

    // Test 3: Test suppliers table
    const suppliersResult = await db.query(
      "SELECT COUNT(*) as count FROM suppliers",
    );
    console.log(`✅ Suppliers count: ${suppliersResult.rows[0].count}`);

    console.log("\n🎉 Database is fully operational!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  } finally {
    await db.close();
  }
}

quickTest();
