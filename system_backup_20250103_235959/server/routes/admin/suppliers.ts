import express from "express";
import {
  AuthenticatedRequest,
  requirePermission,
  Permission,
} from "../../middleware/adminAuth";
import {
  sendSuccess,
  sendError,
  pool,
  handleDatabaseError,
} from "../../utils/adminUtils";

const router = express.Router();

// GET /api/admin/suppliers - Get all suppliers
router.get(
  "/",
  requirePermission(Permission.VIEW_SUPPLIERS),
  async (req: AuthenticatedRequest, res) => {
    try {
      console.log("📊 Admin: Getting all suppliers...");

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
          hasApiKey: true, // Simplified for now
          hasApiSecret: true,
          configuredEnvironment: row.environment,
        },
      }));

      sendSuccess(res, suppliers);
    } catch (error) {
      console.error("❌ Admin: Error getting suppliers:", error);
      handleDatabaseError(res, error);
    }
  },
);

// GET /api/admin/suppliers/analytics - Get supplier analytics summary
router.get(
  "/analytics",
  requirePermission(Permission.VIEW_SUPPLIERS),
  async (req: AuthenticatedRequest, res) => {
    try {
      console.log("📈 Admin: Getting supplier analytics...");

      // Check if suppliers table exists
      const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'suppliers'
      );
    `);

      if (!tableCheck.rows[0].exists) {
        console.warn(
          "⚠️ Suppliers table does not exist, returning empty analytics",
        );
        return sendSuccess(res, {
          totalSuppliers: 0,
          activeSuppliers: 0,
          testingSuppliers: 0,
          disabledSuppliers: 0,
          healthySuppliers: 0,
          degradedSuppliers: 0,
          downSuppliers: 0,
          averageSuccessRate: 0,
          averageResponseTime: 0,
          supplierTypes: { hotel: 0, flight: 0, car: 0, package: 0 },
          recentSyncs: [],
        });
      }

      // Get summary statistics
      const summaryResult = await pool.query(`
      SELECT
        COUNT(*) as total_suppliers,
        COUNT(*) FILTER (WHERE status = 'active') as active_suppliers,
        COUNT(*) FILTER (WHERE status = 'testing') as testing_suppliers,
        COUNT(*) FILTER (WHERE status = 'disabled') as disabled_suppliers,
        COUNT(*) FILTER (WHERE health_status = 'healthy') as healthy_suppliers,
        COUNT(*) FILTER (WHERE health_status = 'degraded') as degraded_suppliers,
        COUNT(*) FILTER (WHERE health_status = 'down') as down_suppliers,
        COALESCE(AVG(success_rate), 0) as avg_success_rate,
        COALESCE(AVG(average_response_time), 0) as avg_response_time
      FROM suppliers
      WHERE is_active = TRUE
    `);

      const summary = summaryResult.rows[0];

      // Get recent sync logs (last 50) - check if table exists first
      let logsResult;
      try {
        const syncTableCheck = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = 'supplier_sync_logs'
        );
      `);

        if (syncTableCheck.rows[0].exists) {
          logsResult = await pool.query(`
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
        } else {
          logsResult = { rows: [] };
        }
      } catch (error) {
        console.warn("⚠️ Could not fetch sync logs:", error.message);
        logsResult = { rows: [] };
      }

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

      sendSuccess(res, analytics);
    } catch (error) {
      console.error("❌ Admin: Error getting supplier analytics:", error);
      handleDatabaseError(res, error);
    }
  },
);

// GET /api/admin/suppliers/sync-logs - Get sync logs
router.get(
  "/sync-logs",
  requirePermission(Permission.VIEW_SUPPLIERS),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { supplierId, limit = 50 } = req.query;

      console.log(
        `📋 Admin: Getting sync logs... supplier: ${supplierId}, limit: ${limit}`,
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

      sendSuccess(res, syncLogs);
    } catch (error) {
      console.error("❌ Admin: Error getting sync logs:", error);
      handleDatabaseError(res, error);
    }
  },
);

export default router;
