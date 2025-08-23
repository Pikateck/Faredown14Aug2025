const express = require("express");
const router = express.Router();

// Simple database validation endpoint
router.get("/ai-tables-check", async (req, res) => {
  try {
    // Use the existing database connection from your app
    const { Pool } = require("pg");
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    // Check if AI schema exists
    const schemaCheck = await pool.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name = 'ai'
    `);

    // Count AI tables
    const tableCount = await pool.query(`
      SELECT COUNT(*) as table_count 
      FROM information_schema.tables 
      WHERE table_schema = 'ai'
    `);

    // List all AI tables
    const tableList = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'ai' 
      ORDER BY table_name
    `);

    // Check specific important tables
    const importantTables = [
      "suppliers",
      "policies",
      "bargain_sessions",
      "bargain_events",
      "supplier_rates",
    ];
    const tableChecks = {};

    for (const tableName of importantTables) {
      const result = await pool.query(
        `
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables 
          WHERE table_schema = 'ai' AND table_name = $1
        )
      `,
        [tableName],
      );
      tableChecks[tableName] = result.rows[0].exists;
    }

    res.json({
      success: true,
      ai_schema_exists: schemaCheck.rows.length > 0,
      total_ai_tables: parseInt(tableCount.rows[0].table_count),
      ai_tables: tableList.rows.map((row) => row.table_name),
      important_tables_check: tableChecks,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Database check error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

module.exports = router;
