/**
 * PostgreSQL Database Connection and Configuration
 * Handles database connectivity for Faredown booking system
 */

const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

class DatabaseConnection {
  constructor() {
    this.pool = null;
    this.isConnected = false;
    this.connectionAttempts = 0;
    this.maxRetries = 5;
    this.retryDelay = 2000; // 2 seconds
  }

  /**
   * Initialize database connection
   */
  async initialize() {
    try {
      console.log("🔌 Initializing PostgreSQL connection...");

      // Database configuration - use DATABASE_URL if available (Render/Heroku style)
      let config;

      if (process.env.DATABASE_URL) {
        // Use DATABASE_URL for production (Render, Heroku, etc.)
        config = {
          connectionString: process.env.DATABASE_URL,
          // Connection pool settings optimized for Render
          max: 10, // Reduced max connections for stability
          min: 1, // Reduced minimum connections
          idleTimeoutMillis: 60000, // Increased idle timeout
          connectionTimeoutMillis: 30000, // Increased connection timeout for Render
          acquireTimeoutMillis: 60000, // Time to wait for connection from pool
          createTimeoutMillis: 30000, // Time to wait for new connection creation
          destroyTimeoutMillis: 5000, // Time to wait for connection to close
          reapIntervalMillis: 1000, // How often to check for idle connections
          createRetryIntervalMillis: 200, // Time between connection creation attempts
          // SSL configuration for Render PostgreSQL
          ssl: {
            rejectUnauthorized: false, // Required for Render PostgreSQL
            sslmode: "require",
          },
        };
      } else {
        // Fallback to individual environment variables
        config = {
          host: process.env.DB_HOST || "localhost",
          port: parseInt(process.env.DB_PORT) || 5432,
          database: process.env.DB_NAME || "faredown_bookings",
          user: process.env.DB_USER || "faredown_user",
          password: process.env.DB_PASSWORD || "faredown_password",

          // Connection pool settings
          max: 20,
          min: 2,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 5000,

          // SSL configuration for production
          ssl:
            process.env.NODE_ENV === "production"
              ? {
                  rejectUnauthorized: false,
                }
              : false,
        };
      }

      this.pool = new Pool(config);

      // Test connection
      await this.testConnection();

      // Set up event handlers
      this.setupEventHandlers();

      console.log("✅ PostgreSQL connection established successfully");
      this.isConnected = true;

      return true;
    } catch (error) {
      console.error("❌ Failed to initialize database connection:", error);

      if (this.connectionAttempts < this.maxRetries) {
        this.connectionAttempts++;
        console.log(
          `🔄 Retrying connection (${this.connectionAttempts}/${this.maxRetries}) in ${this.retryDelay}ms...`,
        );

        await new Promise((resolve) => setTimeout(resolve, this.retryDelay));
        return this.initialize();
      }

      throw error;
    }
  }

  /**
   * Test database connection
   */
  async testConnection() {
    const client = await this.pool.connect();
    try {
      const result = await client.query("SELECT NOW() as current_time");
      console.log(`📅 Database time: ${result.rows[0].current_time}`);
      return true;
    } finally {
      client.release();
    }
  }

  /**
   * Set up database event handlers
   */
  setupEventHandlers() {
    this.pool.on("connect", (client) => {
      console.log("🔗 New database client connected");
    });

    this.pool.on("error", (err, client) => {
      console.error("❌ Database client error:", err);
      this.isConnected = false;
    });

    this.pool.on("remove", (client) => {
      console.log("🔌 Database client removed from pool");
    });
  }

  /**
   * Execute a query with parameters
   */
  async query(text, params = []) {
    if (!this.isConnected) {
      throw new Error("Database not connected");
    }

    const start = Date.now();

    try {
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;

      // Log slow queries (over 1 second)
      if (duration > 1000) {
        console.warn(
          `🐌 Slow query detected (${duration}ms):`,
          text.substring(0, 100),
        );
      }

      return result;
    } catch (error) {
      console.error("❌ Database query error:", error);
      console.error("Query:", text);
      console.error("Params:", params);
      throw error;
    }
  }

  /**
   * Execute a transaction
   */
  async transaction(callback) {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");
      const result = await callback(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Initialize database schema if needed
   */
  async initializeSchema() {
    try {
      console.log("🏗️ Checking database schema...");

      // Check if tables exist
      const tableCheck = await this.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('hotel_bookings', 'payments', 'vouchers', 'suppliers')
      `);

      if (tableCheck.rows.length === 0) {
        console.log("📋 Creating database schema...");

        // Read and execute schema file
        const schemaPath = path.join(__dirname, "schema.sql");
        const schemaSQL = fs.readFileSync(schemaPath, "utf8");

        // Execute the entire schema as one transaction to handle functions properly
        try {
          await this.query(schemaSQL);
        } catch (error) {
          // If that fails, try splitting carefully
          if (error.message.includes("already exists")) {
            console.log("✅ Some schema elements already exist");
          } else {
            console.error("Schema error:", error.message);

            // As fallback, try executing individual statements that are safe
            const safeStatements = schemaSQL
              .split(/;\s*(?=CREATE TABLE|CREATE INDEX|INSERT INTO)/g)
              .map((stmt) => stmt.trim())
              .filter(
                (stmt) =>
                  stmt.length > 0 &&
                  !stmt.includes("FUNCTION") &&
                  !stmt.includes("TRIGGER"),
              );

            for (const statement of safeStatements) {
              try {
                await this.query(statement);
              } catch (err) {
                if (!err.message.includes("already exists")) {
                  console.error("Individual statement error:", err.message);
                }
              }
            }
          }
        }

        console.log("✅ Database schema created successfully");
      } else {
        console.log("✅ Database schema already exists");
      }
    } catch (error) {
      console.error("❌ Failed to initialize schema:", error);
      throw error;
    }
  }

  /**
   * Get connection statistics
   */
  getStats() {
    if (!this.pool) {
      return { connected: false };
    }

    return {
      connected: this.isConnected,
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount,
      maxConnections: this.pool.options.max,
      connectionAttempts: this.connectionAttempts,
    };
  }

  /**
   * Close database connection
   */
  async close() {
    if (this.pool) {
      console.log("🔌 Closing database connections...");
      await this.pool.end();
      this.isConnected = false;
      console.log("✅ Database connections closed");
    }
  }

  /**
   * Health check for monitoring
   */
  async healthCheck() {
    try {
      if (!this.isConnected) {
        return { healthy: false, error: "Not connected" };
      }

      const result = await this.query("SELECT 1 as health_check");
      return {
        healthy: true,
        timestamp: new Date().toISOString(),
        responseTime: "fast",
        connections: this.getStats(),
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

// Create singleton instance
const db = new DatabaseConnection();

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("🛑 Received SIGINT, closing database connections...");
  await db.close();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("🛑 Received SIGTERM, closing database connections...");
  await db.close();
  process.exit(0);
});

module.exports = db;
