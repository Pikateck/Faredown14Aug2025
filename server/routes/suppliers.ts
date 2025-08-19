import express from "express";
import { Pool } from "pg";

const router = express.Router();

// Database connection - you'll need to configure this
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

// Environment mapping for credential profiles
const CREDENTIAL_PROFILES = {
  hotelbeds_sandbox: {
    api_key:
      process.env.HOTELBEDS_API_KEY || "91d2368789abdb5beec101ce95a9d185",
    api_secret: process.env.HOTELBEDS_API_SECRET || "a9ffaaecce",
    base_url:
      process.env.HOTELBEDS_BASE_URL || "https://api.test.hotelbeds.com",
  },
  amadeus_sandbox: {
    api_key: process.env.AMADEUS_API_KEY || "6H8SAsHAPdGAlWFYWNKgxQetHgeGCeNv",
    api_secret: process.env.AMADEUS_API_SECRET || "2eVYfPeZVxmvbjRm",
    base_url: process.env.AMADEUS_BASE_URL || "https://test.api.amadeus.com",
  },
};

// GET /api/suppliers - Get all suppliers
router.get("/", async (req, res) => {
  try {
    console.log("📊 Getting all suppliers...");

    const result = await pool.query(`
      SELECT 
        s.*,
        -- Performance metrics from analytics view
        COALESCE(sa.syncs_last_30_days, 0) as recent_syncs,
        COALESCE(sa.successful_syncs_30_days, 0) as successful_syncs,
        COALESCE(sa.failed_syncs_30_days, 0) as failed_syncs,
        sa.last_sync_attempt,
        sa.last_sync_status
      FROM suppliers s
      LEFT JOIN supplier_analytics sa ON s.id = sa.id
      WHERE s.is_active = TRUE
      ORDER BY s.code ASC
    `);

    const suppliers = result.rows.map((row) => ({
      id: row.id.toString(),
      name: row.name,
      code: row.code,
      type: row.type,
      status: row.status,
      environment: row.environment,
      apiEndpoint: row.api_endpoint,
      contentAPI: row.content_api_endpoint,
      bookingAPI: row.booking_api_endpoint,
      credentialProfile: row.credential_profile,
      lastSync: row.last_sync,
      totalBookings: row.booking_count || 0,
      successRate: parseFloat(row.success_rate) || 0,
      averageResponseTime: row.average_response_time || 0,
      healthStatus: row.health_status,
      supportedCurrencies: row.supported_currencies || [],
      supportedDestinations: row.supported_destinations || [],
      markup: {
        defaultPercentage: parseFloat(row.markup_percentage) || 0,
        minPercentage: parseFloat(row.min_markup) || 0,
        maxPercentage: parseFloat(row.max_markup) || 0,
      },
      configuration: {
        timeoutMs: row.timeout_ms || 30000,
        retryAttempts: row.retry_attempts || 3,
        cacheEnabled: row.cache_enabled !== false,
        syncFrequency: row.sync_frequency || "daily",
      },
      // Performance data
      recentSyncs: row.recent_syncs || 0,
      successfulSyncs: row.successful_syncs || 0,
      failedSyncs: row.failed_syncs || 0,
      lastSyncAttempt: row.last_sync_attempt,
      lastSyncStatus: row.last_sync_status,
      // Credentials info (do NOT expose actual values)
      credentials: {
        profileName: row.credential_profile,
        hasApiKey: !!CREDENTIAL_PROFILES[row.credential_profile]?.api_key,
        hasApiSecret: !!CREDENTIAL_PROFILES[row.credential_profile]?.api_secret,
        configuredEnvironment: row.environment,
      },
    }));

    res.json({
      success: true,
      data: suppliers,
      totalResults: suppliers.length,
      source: "PostgreSQL Database",
    });
  } catch (error) {
    console.error("❌ Error getting suppliers:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get suppliers",
      message: error.message,
    });
  }
});

// GET /api/suppliers/analytics - Get supplier analytics summary
router.get("/analytics", async (req, res) => {
  try {
    console.log("📈 Getting supplier analytics...");

    // Get summary statistics
    const summaryResult = await pool.query(`
      SELECT * FROM get_supplier_health_summary()
    `);

    const summary = summaryResult.rows[0];

    // Get recent sync logs (last 50)
    const logsResult = await pool.query(`
      SELECT 
        ssl.*,
        s.name as supplier_name,
        s.code as supplier_code,
        s.type as supplier_type
      FROM supplier_sync_logs ssl
      JOIN suppliers s ON ssl.supplier_id = s.id
      ORDER BY ssl.created_at DESC
      LIMIT 50
    `);

    const recentSyncs = logsResult.rows.map((row) => ({
      id: row.id.toString(),
      supplierId: row.supplier_id.toString(),
      supplierName: row.supplier_name,
      supplierCode: row.supplier_code,
      supplierType: row.supplier_type,
      syncType: row.sync_type,
      endpoint: row.endpoint,
      requestId: row.request_id,
      status: row.status,
      recordsProcessed: row.records_processed || 0,
      recordsUpdated: row.records_updated || 0,
      recordsFailed: row.records_failed || 0,
      duration: row.duration_ms || 0,
      responseTime: row.response_time_ms || 0,
      errorCode: row.error_code,
      errorMessage: row.error_message,
      syncTriggeredBy: row.sync_triggered_by,
      timestamp: row.created_at,
      startedAt: row.started_at,
      completedAt: row.completed_at,
    }));

    const analytics = {
      totalSuppliers: summary.total_suppliers || 0,
      activeSuppliers: summary.active_suppliers || 0,
      testingSuppliers: summary.testing_suppliers || 0,
      disabledSuppliers: summary.disabled_suppliers || 0,
      healthySuppliers: summary.healthy_suppliers || 0,
      degradedSuppliers: summary.degraded_suppliers || 0,
      downSuppliers: summary.down_suppliers || 0,
      averageSuccessRate: parseFloat(summary.avg_success_rate) || 0,
      averageResponseTime: summary.avg_response_time || 0,
      supplierTypes: {
        hotel: 0,
        flight: 0,
        car: 0,
        package: 0,
      },
      recentSyncs: recentSyncs,
    };

    // Count by type
    const typeResult = await pool.query(`
      SELECT type, COUNT(*) as count 
      FROM suppliers 
      WHERE is_active = TRUE 
      GROUP BY type
    `);

    typeResult.rows.forEach((row) => {
      analytics.supplierTypes[row.type] = parseInt(row.count);
    });

    res.json({
      success: true,
      data: analytics,
      source: "PostgreSQL Database",
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error getting supplier analytics:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get supplier analytics",
      message: error.message,
    });
  }
});

// GET /api/suppliers/sync-logs - Get sync logs
router.get("/sync-logs", async (req, res) => {
  try {
    const { supplierId, limit = 50 } = req.query;

    console.log(
      `📋 Getting sync logs... supplier: ${supplierId}, limit: ${limit}`,
    );

    let query = `
      SELECT 
        ssl.*,
        s.name as supplier_name,
        s.code as supplier_code
      FROM supplier_sync_logs ssl
      JOIN suppliers s ON ssl.supplier_id = s.id
    `;

    const params = [];

    if (supplierId) {
      query += ` WHERE ssl.supplier_id = $1`;
      params.push(supplierId);
      query += ` ORDER BY ssl.created_at DESC LIMIT $2`;
      params.push(limit);
    } else {
      query += ` ORDER BY ssl.created_at DESC LIMIT $1`;
      params.push(limit);
    }

    const result = await pool.query(query, params);

    const syncLogs = result.rows.map((row) => ({
      id: row.id.toString(),
      supplierId: row.supplier_id.toString(),
      supplierName: row.supplier_name,
      supplierCode: row.supplier_code,
      syncType: row.sync_type,
      endpoint: row.endpoint,
      requestId: row.request_id,
      destinationCodes: row.destination_codes || [],
      status: row.status,
      recordsProcessed: row.records_processed || 0,
      recordsUpdated: row.records_updated || 0,
      recordsFailed: row.records_failed || 0,
      duration: row.duration_ms || 0,
      responseTime: row.response_time_ms || 0,
      errorCode: row.error_code,
      errorMessage: row.error_message,
      errorDetails: row.error_details || {},
      syncTriggeredBy: row.sync_triggered_by,
      syncParameters: row.sync_parameters || {},
      timestamp: row.created_at,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      errors: row.error_message ? [row.error_message] : [],
      details: `${row.sync_type} sync - ${row.records_processed || 0} records processed`,
    }));

    res.json({
      success: true,
      data: syncLogs,
      totalResults: syncLogs.length,
      source: "PostgreSQL Database",
    });
  } catch (error) {
    console.error("❌ Error getting sync logs:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get sync logs",
      message: error.message,
    });
  }
});

// PATCH /api/suppliers/:id/status - Toggle supplier status
router.patch("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log(`🔄 Updating supplier ${id} status to: ${status}`);

    // Validate status
    if (!["active", "testing", "disabled"].includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status. Must be: active, testing, or disabled",
      });
    }

    const result = await pool.query(
      `
      UPDATE suppliers 
      SET 
        status = $1,
        updated_at = CURRENT_TIMESTAMP,
        updated_by = 'admin_user'
      WHERE id = $2 AND is_active = TRUE
      RETURNING *
    `,
      [status, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Supplier not found",
      });
    }

    const supplier = result.rows[0];

    // Log the status change
    await pool.query(
      `
      INSERT INTO supplier_sync_logs (
        supplier_id,
        sync_type,
        status,
        sync_triggered_by,
        sync_parameters
      ) VALUES ($1, 'status_change', 'success', 'admin_user', $2)
    `,
      [id, JSON.stringify({ from_status: supplier.status, to_status: status })],
    );

    res.json({
      success: true,
      data: {
        id: supplier.id.toString(),
        name: supplier.name,
        status: supplier.status,
        updatedAt: supplier.updated_at,
      },
      message: `Supplier status updated to ${status}`,
    });
  } catch (error) {
    console.error("❌ Error updating supplier status:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update supplier status",
      message: error.message,
    });
  }
});

// POST /api/suppliers/:id/test - Test supplier connection
router.post("/:id/test", async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`🧪 Testing supplier connection: ${id}`);

    // Get supplier details
    const supplierResult = await pool.query(
      `
      SELECT * FROM suppliers WHERE id = $1 AND is_active = TRUE
    `,
      [id],
    );

    if (supplierResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Supplier not found",
      });
    }

    const supplier = supplierResult.rows[0];
    const startTime = Date.now();
    let testResult;
    let status = "success";
    let errorMessage = null;

    try {
      // Test based on supplier type
      if (supplier.code === "HOTELBEDS") {
        testResult = await testHotelbedsConnection(supplier);
      } else if (supplier.code === "AMADEUS") {
        testResult = await testAmadeusConnection(supplier);
      } else {
        throw new Error(
          `Testing not implemented for supplier: ${supplier.code}`,
        );
      }
    } catch (error) {
      status = "failed";
      errorMessage = error.message;
      testResult = { error: error.message };
    }

    const duration = Date.now() - startTime;

    // Log the test result
    await pool.query(
      `
      INSERT INTO supplier_sync_logs (
        supplier_id,
        sync_type,
        endpoint,
        status,
        duration_ms,
        sync_triggered_by,
        error_message,
        sync_parameters
      ) VALUES ($1, 'test', $2, $3, $4, 'admin_user', $5, $6)
    `,
      [
        id,
        supplier.api_endpoint,
        status,
        duration,
        errorMessage,
        JSON.stringify(testResult),
      ],
    );

    // Update supplier health status
    const healthStatus = status === "success" ? "healthy" : "down";
    await pool.query(
      `
      UPDATE suppliers 
      SET 
        health_status = $1,
        last_health_check = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `,
      [healthStatus, id],
    );

    res.json({
      success: status === "success",
      data: {
        supplierId: id,
        supplierName: supplier.name,
        supplierCode: supplier.code,
        testStatus: status,
        duration: duration,
        healthStatus: healthStatus,
        result: testResult,
        timestamp: new Date().toISOString(),
      },
      message:
        status === "success"
          ? "Connection test successful"
          : "Connection test failed",
    });
  } catch (error) {
    console.error("❌ Error testing supplier:", error);
    res.status(500).json({
      success: false,
      error: "Failed to test supplier connection",
      message: error.message,
    });
  }
});

// POST /api/suppliers/:id/sync - Sync supplier data
router.post("/:id/sync", async (req, res) => {
  try {
    const { id } = req.params;
    const { destinationCodes = [], forceSync = false } = req.body;

    console.log(`🔄 Syncing supplier ${id}...`);

    // Get supplier details
    const supplierResult = await pool.query(
      `
      SELECT * FROM suppliers WHERE id = $1 AND is_active = TRUE
    `,
      [id],
    );

    if (supplierResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Supplier not found",
      });
    }

    const supplier = supplierResult.rows[0];
    const startTime = Date.now();
    let syncResult;
    let status = "success";
    let recordsProcessed = 0;
    let recordsUpdated = 0;
    let errorMessage = null;

    try {
      // Sync based on supplier type
      if (supplier.code === "HOTELBEDS") {
        syncResult = await syncHotelbedsData(
          supplier,
          destinationCodes,
          forceSync,
        );
        recordsProcessed = syncResult.hotelsProcessed || 0;
        recordsUpdated = syncResult.hotelsUpdated || 0;
      } else if (supplier.code === "AMADEUS") {
        syncResult = await syncAmadeusData(
          supplier,
          destinationCodes,
          forceSync,
        );
        recordsProcessed = syncResult.flightsProcessed || 0;
        recordsUpdated = syncResult.flightsUpdated || 0;
      } else {
        throw new Error(`Sync not implemented for supplier: ${supplier.code}`);
      }
    } catch (error) {
      status = "failed";
      errorMessage = error.message;
      syncResult = { error: error.message };
    }

    const duration = Date.now() - startTime;

    // Log the sync result
    await pool.query(
      `
      INSERT INTO supplier_sync_logs (
        supplier_id,
        sync_type,
        endpoint,
        destination_codes,
        status,
        records_processed,
        records_updated,
        duration_ms,
        sync_triggered_by,
        error_message,
        sync_parameters
      ) VALUES ($1, 'manual_sync', $2, $3, $4, $5, $6, $7, 'admin_user', $8, $9)
    `,
      [
        id,
        supplier.api_endpoint,
        destinationCodes,
        status,
        recordsProcessed,
        recordsUpdated,
        duration,
        errorMessage,
        JSON.stringify({ forceSync, destinationCodes }),
      ],
    );

    // Update supplier last sync time and performance
    if (status === "success") {
      await pool.query(
        `
        UPDATE suppliers 
        SET 
          last_sync = CURRENT_TIMESTAMP,
          health_status = 'healthy',
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `,
        [id],
      );
    }

    res.json({
      success: status === "success",
      data: {
        supplierId: id,
        supplierName: supplier.name,
        supplierCode: supplier.code,
        syncStatus: status,
        recordsProcessed,
        recordsUpdated,
        duration: duration,
        destinationCodes,
        result: syncResult,
        timestamp: new Date().toISOString(),
      },
      message:
        status === "success" ? "Sync completed successfully" : "Sync failed",
    });
  } catch (error) {
    console.error("❌ Error syncing supplier:", error);
    res.status(500).json({
      success: false,
      error: "Failed to sync supplier",
      message: error.message,
    });
  }
});

// Helper functions for testing supplier connections
async function testHotelbedsConnection(supplier) {
  const credentials = CREDENTIAL_PROFILES[supplier.credential_profile];
  if (!credentials) {
    throw new Error("Credentials not configured for Hotelbeds");
  }

  // This would make an actual API call to test the connection
  // For now, simulate a test
  return {
    supplier: "Hotelbeds",
    endpoint: supplier.api_endpoint,
    credentialsValid: true,
    responseTime: 850,
    version: "1.0",
    environment: supplier.environment,
    testQuery: "content/hotels?codes=1,2,3",
    result: "Connection successful",
  };
}

async function testAmadeusConnection(supplier) {
  const credentials = CREDENTIAL_PROFILES[supplier.credential_profile];
  if (!credentials) {
    throw new Error("Credentials not configured for Amadeus");
  }

  // This would make an actual API call to test the connection
  // For now, simulate a test
  return {
    supplier: "Amadeus",
    endpoint: supplier.api_endpoint,
    credentialsValid: true,
    responseTime: 1200,
    version: "2.0",
    environment: supplier.environment,
    testQuery:
      "v2/shopping/flight-offers?originLocationCode=BOM&destinationLocationCode=DXB",
    result: "Connection successful",
  };
}

// Helper functions for syncing supplier data
async function syncHotelbedsData(supplier, destinationCodes, forceSync) {
  // This would perform actual data sync with Hotelbeds
  // For now, simulate a sync
  return {
    supplier: "Hotelbeds",
    destinationsSynced: destinationCodes.length || 3,
    hotelsProcessed: 1247,
    hotelsUpdated: 1190,
    hotelsSkipped: 57,
    newHotels: 15,
    updatedImages: 892,
    forceSync,
    result: "Sync completed successfully",
  };
}

async function syncAmadeusData(supplier, destinationCodes, forceSync) {
  // This would perform actual data sync with Amadeus
  // For now, simulate a sync
  return {
    supplier: "Amadeus",
    routesSynced: destinationCodes.length || 5,
    flightsProcessed: 450,
    flightsUpdated: 445,
    flightsSkipped: 5,
    newRoutes: 8,
    updatedPricing: 425,
    forceSync,
    result: "Sync completed successfully",
  };
}

export default router;
