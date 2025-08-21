const express = require("express");
const router = express.Router();
const hotelbedsService = require("../services/hotelbedsService");
const markupService = require("../services/markupService");

// Mock supplier data - in production this would be from database
let suppliers = [
  {
    id: "1",
    name: "Hotelbeds",
    type: "hotel",
    status: "active",
    apiEndpoint: "https://api.test.hotelbeds.com",
    lastSync: new Date().toISOString(),
    totalBookings: 1247,
    successRate: 94.2,
    averageResponseTime: 850,
    credentials: {
      apiKey: "91d2368789abdb5beec101ce95a9d185",
      secret: "a9ffaaecce",
    },
    configuration: {
      contentAPI: "https://api.test.hotelbeds.com/hotel-content-api/1.0/",
      bookingAPI: "https://api.test.hotelbeds.com/hotel-api/1.0/",
      timeoutMs: 30000,
      retryAttempts: 3,
      cacheEnabled: true,
      syncFrequency: "daily",
    },
    supportedCurrencies: ["EUR", "USD", "GBP", "INR"],
    supportedDestinations: ["Dubai", "Mumbai", "Delhi", "Singapore"],
    markup: {
      defaultPercentage: 12,
      minPercentage: 8,
      maxPercentage: 25,
    },
  },
];

let syncLogs = [
  {
    id: "1",
    supplierId: "1",
    timestamp: new Date().toISOString(),
    status: "success",
    recordsProcessed: 1247,
    duration: 45000,
    errors: [],
    details: "Full hotel content sync completed successfully",
  },
];

/**
 * Get all suppliers
 * GET /api/suppliers
 */
router.get("/", (req, res) => {
  try {
    res.json({
      success: true,
      data: suppliers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to get suppliers",
      details: error.message,
    });
  }
});

/**
 * Sync supplier data
 * POST /api/suppliers/:id/sync
 */
router.post("/:id/sync", async (req, res) => {
  try {
    const { id } = req.params;
    const { destinationCodes = [], forceSync = false } = req.body;

    const supplier = suppliers.find((s) => s.id === id);
    if (!supplier) {
      return res.status(404).json({
        success: false,
        error: "Supplier not found",
      });
    }

    if (supplier.type !== "hotel" || supplier.name !== "Hotelbeds") {
      return res.status(400).json({
        success: false,
        error: "Sync is currently only supported for Hotelbeds",
      });
    }

    // Perform sync
    const syncResult = await hotelbedsService.syncHotelContent(
      destinationCodes,
      forceSync,
    );

    // Update supplier last sync time
    supplier.lastSync = new Date().toISOString();

    // Create sync log
    const syncLog = {
      id: Date.now().toString(),
      supplierId: id,
      timestamp: supplier.lastSync,
      status: syncResult.success ? "success" : "failed",
      recordsProcessed: syncResult.totalHotels || 0,
      duration: 30000, // Mock duration
      errors: syncResult.success ? [] : [syncResult.error || "Unknown error"],
      details: syncResult.message || "Manual sync triggered",
    };

    syncLogs.unshift(syncLog);

    res.json({
      success: true,
      data: {
        supplier,
        syncResult,
        syncLog,
      },
      message: "Sync completed successfully",
    });
  } catch (error) {
    console.error("Supplier sync error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to sync supplier data",
      details: error.message,
    });
  }
});

/**
 * Get sync logs
 * GET /api/suppliers/sync-logs
 */
router.get("/sync-logs", (req, res) => {
  try {
    const { supplierId, limit = 50 } = req.query;

    let filteredLogs = syncLogs;
    if (supplierId) {
      filteredLogs = syncLogs.filter((log) => log.supplierId === supplierId);
    }

    const limitedLogs = filteredLogs.slice(0, parseInt(limit));

    res.json({
      success: true,
      data: limitedLogs,
      total: filteredLogs.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to get sync logs",
      details: error.message,
    });
  }
});

/**
 * Get supplier analytics
 * GET /api/suppliers/analytics
 */
router.get("/analytics", (req, res) => {
  try {
    const analytics = {
      totalSuppliers: suppliers.length,
      activeSuppliers: suppliers.filter((s) => s.status === "active").length,
      testingSuppliers: suppliers.filter((s) => s.status === "testing").length,
      inactiveSuppliers: suppliers.filter((s) => s.status === "inactive")
        .length,
      averageSuccessRate:
        suppliers.reduce((sum, s) => sum + s.successRate, 0) / suppliers.length,
      averageResponseTime:
        suppliers.reduce((sum, s) => sum + s.averageResponseTime, 0) /
        suppliers.length,
      totalBookings: suppliers.reduce((sum, s) => sum + s.totalBookings, 0),
      supplierTypes: {
        hotel: suppliers.filter((s) => s.type === "hotel").length,
        flight: suppliers.filter((s) => s.type === "flight").length,
        car: suppliers.filter((s) => s.type === "car").length,
        package: suppliers.filter((s) => s.type === "package").length,
      },
      recentSyncs: syncLogs.slice(0, 10),
    };

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to get supplier analytics",
      details: error.message,
    });
  }
});

module.exports = router;
