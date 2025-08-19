/**
 * Debug Database Connection Issues
 */

require("dotenv").config();
const { Pool } = require("pg");

async function debugConnection() {
  console.log("🔍 DEBUG: Testing Render PostgreSQL Connection");
  console.log("=".repeat(50));

  console.log("📋 Environment Variables:");
  console.log(`DATABASE_URL exists: ${!!process.env.DATABASE_URL}`);
  console.log(`DB_HOST: ${process.env.DB_HOST}`);
  console.log(`DB_NAME: ${process.env.DB_NAME}`);
  console.log(`DB_USER: ${process.env.DB_USER}`);
  console.log(`DB_PORT: ${process.env.DB_PORT}`);
  console.log("");

  // Test 1: Basic connection with DATABASE_URL
  console.log("🧪 Test 1: Basic connection with DATABASE_URL");
  try {
    const pool1 = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });

    const client = await pool1.connect();
    const result = await client.query("SELECT NOW()");
    console.log("✅ DATABASE_URL connection successful");
    console.log(`   Server time: ${result.rows[0].now}`);
    client.release();
    await pool1.end();
  } catch (error) {
    console.log("❌ DATABASE_URL connection failed:");
    console.log(`   Error: ${error.message}`);
    console.log(`   Code: ${error.code}`);
  }

  console.log("");

  // Test 2: Individual parameters
  console.log("🧪 Test 2: Individual connection parameters");
  try {
    const pool2 = new Pool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: { rejectUnauthorized: false },
    });

    const client = await pool2.connect();
    const result = await client.query("SELECT version()");
    console.log("✅ Individual params connection successful");
    console.log(
      `   PostgreSQL version: ${result.rows[0].version.split(" ")[0]}`,
    );
    client.release();
    await pool2.end();
  } catch (error) {
    console.log("❌ Individual params connection failed:");
    console.log(`   Error: ${error.message}`);
    console.log(`   Code: ${error.code}`);
  }

  console.log("");

  // Test 3: Connection without SSL
  console.log("🧪 Test 3: Connection without SSL");
  try {
    const pool3 = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: false,
    });

    const client = await pool3.connect();
    const result = await client.query("SELECT 1");
    console.log("✅ No SSL connection successful");
    client.release();
    await pool3.end();
  } catch (error) {
    console.log("❌ No SSL connection failed:");
    console.log(`   Error: ${error.message}`);
    console.log(`   Code: ${error.code}`);
  }

  console.log("");
  console.log("🔍 Connection troubleshooting suggestions:");
  console.log('   1. Check if Render database is in "Available" status');
  console.log(
    "   2. Verify IP allowlist includes 0.0.0.0/0 in Render dashboard",
  );
  console.log(
    "   3. Confirm the database URL is exactly as provided by Render",
  );
  console.log(
    "   4. Check if SSL is required (most cloud providers require it)",
  );

  process.exit(0);
}

debugConnection().catch(console.error);
