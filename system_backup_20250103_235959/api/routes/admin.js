/**
 * Admin Routes
 * Handles all admin dashboard operations and management
 */

const express = require("express");
const router = express.Router();
const { requirePermission, PERMISSIONS } = require("../middleware/auth");
const {
  validate,
  validatePagination,
  validateDateRange,
} = require("../middleware/validation");
const { audit, getAuditTrail, getAuditStats } = require("../middleware/audit");
const { budgetMonitorService } = require("../services/budgetMonitorService");

// Mock data for demonstration
const mockStats = {
  totalBookings: 1247,
  totalRevenue: 2847392,
  totalUsers: 8934,
  successRate: 94.2,
  rewardsIssued: 85420,
  monthlyGrowth: 12.5,
  flightBookings: 728,
  hotelBookings: 519,
  topDestinations: [
    { city: "Mumbai", bookings: 189, revenue: 485230 },
    { city: "Dubai", bookings: 156, revenue: 623450 },
    { city: "Delhi", bookings: 134, revenue: 356780 },
    { city: "Singapore", bookings: 98, revenue: 445670 },
    { city: "London", bookings: 87, revenue: 567890 },
  ],
  recentBookings: [
    {
      id: "FD001",
      type: "Flight",
      customer: "John Doe",
      amount: 25890,
      status: "Confirmed",
      date: new Date("2025-01-20"),
      destination: "Dubai",
    },
    {
      id: "HD002",
      type: "Hotel",
      customer: "Jane Smith",
      amount: 12500,
      status: "Pending",
      date: new Date("2025-01-20"),
      destination: "Mumbai",
    },
    {
      id: "FD003",
      type: "Flight",
      customer: "Mike Johnson",
      amount: 35200,
      status: "Confirmed",
      date: new Date("2025-01-19"),
      destination: "London",
    },
  ],
  todayStats: {
    bookings: 23,
    revenue: 145670,
    users: 89,
    cancellations: 2,
  },
  weeklyStats: {
    bookings: [12, 18, 15, 22, 19, 25, 23],
    revenue: [45000, 67000, 52000, 78000, 69000, 89000, 82000],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  },
  monthlyStats: {
    totalBookings: 456,
    totalRevenue: 1245670,
    averageBookingValue: 2730,
    conversionRate: 8.5,
  },
};

/**
 * @api {get} /api/admin/dashboard Dashboard Overview
 * @apiName GetDashboard
 * @apiGroup Admin
 * @apiVersion 1.0.0
 *
 * @apiHeader {String} Authorization Bearer token
 * @apiPermission admin
 *
 * @apiSuccess {Object} stats Dashboard statistics
 * @apiSuccess {Number} stats.totalBookings Total number of bookings
 * @apiSuccess {Number} stats.totalRevenue Total revenue
 * @apiSuccess {Number} stats.totalUsers Total registered users
 * @apiSuccess {Number} stats.successRate Success rate percentage
 * @apiSuccess {Array} stats.topDestinations Top booking destinations
 * @apiSuccess {Array} stats.recentBookings Recent booking activities
 */
router.get(
  "/dashboard",
  requirePermission(PERMISSIONS.ADMIN_DASHBOARD),
  async (req, res) => {
    try {
      const { timeframe = "30d" } = req.query;

      // Log dashboard access
      await audit.systemAction(req, "dashboard_view", { timeframe });

      // Calculate real-time stats (in a real app, this would query the database)
      const dashboardData = {
        ...mockStats,
        timestamp: new Date().toISOString(),
        timeframe,
        systemHealth: {
          database: "healthy",
          api: "healthy",
          paymentGateway: "healthy",
          externalAPIs: "healthy",
        },
        alerts: [
          {
            id: "alert_001",
            type: "info",
            message: "System backup completed successfully",
            timestamp: new Date().toISOString(),
          },
          {
            id: "alert_002",
            type: "warning",
            message: "Payment gateway response time increased",
            timestamp: new Date(Date.now() - 3600000).toISOString(),
          },
        ],
      };

      res.json({
        success: true,
        data: dashboardData,
      });
    } catch (error) {
      console.error("Dashboard error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch dashboard data",
      });
    }
  },
);

/**
 * @api {get} /api/admin/stats Real-time Statistics
 * @apiName GetStats
 * @apiGroup Admin
 * @apiVersion 1.0.0
 *
 * @apiHeader {String} Authorization Bearer token
 * @apiPermission admin
 *
 * @apiQuery {String} [period=today] Statistics period (today, week, month, year)
 * @apiQuery {String} [metric=all] Specific metric (bookings, revenue, users, cancellations)
 *
 * @apiSuccess {Object} stats Real-time statistics
 */
router.get(
  "/stats",
  requirePermission(PERMISSIONS.ANALYTICS_VIEW),
  validateDateRange,
  async (req, res) => {
    try {
      const { period = "today", metric = "all" } = req.query;

      // Generate stats based on period
      let stats;
      switch (period) {
        case "today":
          stats = mockStats.todayStats;
          break;
        case "week":
          stats = mockStats.weeklyStats;
          break;
        case "month":
          stats = mockStats.monthlyStats;
          break;
        default:
          stats = mockStats.todayStats;
      }

      // Filter by specific metric if requested
      if (metric !== "all" && stats[metric]) {
        stats = { [metric]: stats[metric] };
      }

      res.json({
        success: true,
        data: {
          period,
          metric,
          stats,
          lastUpdated: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Stats error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch statistics",
      });
    }
  },
);

/**
 * @api {get} /api/admin/analytics Analytics Data
 * @apiName GetAnalytics
 * @apiGroup Admin
 * @apiVersion 1.0.0
 *
 * @apiHeader {String} Authorization Bearer token
 * @apiPermission admin
 *
 * @apiQuery {String} startDate Start date (ISO format)
 * @apiQuery {String} endDate End date (ISO format)
 * @apiQuery {String} [groupBy=day] Group by (day, week, month)
 * @apiQuery {String} [metric=all] Metrics to include
 *
 * @apiSuccess {Object} analytics Analytics data
 */
router.get(
  "/analytics",
  requirePermission(PERMISSIONS.ANALYTICS_VIEW),
  validate.analyticsQuery,
  async (req, res) => {
    try {
      const { startDate, endDate, groupBy, metrics } = req.query;

      // Log analytics access
      await audit.systemAction(req, "analytics_view", {
        startDate,
        endDate,
        groupBy,
        metrics,
      });

      // Generate analytics data (mock implementation)
      const analyticsData = {
        period: { startDate, endDate },
        groupBy,
        metrics,
        data: {
          bookings: {
            total: mockStats.totalBookings,
            trend: "+12.5%",
            chartData: mockStats.weeklyStats.bookings,
          },
          revenue: {
            total: mockStats.totalRevenue,
            trend: "+15.3%",
            chartData: mockStats.weeklyStats.revenue,
          },
          users: {
            total: mockStats.totalUsers,
            trend: "+8.7%",
            newUsers: 234,
          },
          conversions: {
            rate: mockStats.successRate,
            trend: "+2.1%",
          },
        },
        insights: [
          "Peak booking time: 2-4 PM",
          "Mobile bookings increased by 25%",
          "Dubai routes show highest profitability",
          "Customer satisfaction improved by 4%",
        ],
      };

      res.json({
        success: true,
        data: analyticsData,
      });
    } catch (error) {
      console.error("Analytics error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch analytics data",
      });
    }
  },
);

/**
 * @api {get} /api/admin/reports Generate Reports
 * @apiName GenerateReports
 * @apiGroup Admin
 * @apiVersion 1.0.0
 *
 * @apiHeader {String} Authorization Bearer token
 * @apiPermission admin
 *
 * @apiQuery {String} type Report type (financial, bookings, users, performance)
 * @apiQuery {String} format Export format (json, csv, excel, pdf)
 * @apiQuery {String} startDate Start date
 * @apiQuery {String} endDate End date
 *
 * @apiSuccess {Object} report Generated report data
 */
router.get(
  "/reports",
  requirePermission(PERMISSIONS.REPORTS_GENERATE),
  validateDateRange,
  async (req, res) => {
    try {
      const {
        type = "financial",
        format = "json",
        startDate,
        endDate,
      } = req.query;

      // Log report generation
      await audit.systemAction(req, "report_generate", {
        type,
        format,
        startDate,
        endDate,
      });

      // Generate report based on type
      let reportData;
      switch (type) {
        case "financial":
          reportData = {
            totalRevenue: mockStats.totalRevenue,
            totalBookings: mockStats.totalBookings,
            averageBookingValue: Math.round(
              mockStats.totalRevenue / mockStats.totalBookings,
            ),
            revenueByService: {
              flights: mockStats.totalRevenue * 0.65,
              hotels: mockStats.totalRevenue * 0.35,
            },
            topDestinations: mockStats.topDestinations,
          };
          break;

        case "bookings":
          reportData = {
            totalBookings: mockStats.totalBookings,
            flightBookings: mockStats.flightBookings,
            hotelBookings: mockStats.hotelBookings,
            successRate: mockStats.successRate,
            cancellationRate: 100 - mockStats.successRate,
            recentBookings: mockStats.recentBookings,
          };
          break;

        case "users":
          reportData = {
            totalUsers: mockStats.totalUsers,
            activeUsers: Math.round(mockStats.totalUsers * 0.75),
            newUsersThisMonth: 234,
            userRetentionRate: 85.5,
            topUserSegments: [
              { segment: "Business Travelers", count: 3456, percentage: 38.7 },
              { segment: "Leisure Travelers", count: 2890, percentage: 32.3 },
              { segment: "Family Bookings", count: 1567, percentage: 17.5 },
              { segment: "Group Bookings", count: 1021, percentage: 11.4 },
            ],
          };
          break;

        case "performance":
          reportData = {
            systemUptime: "99.8%",
            averageResponseTime: "245ms",
            apiCallsToday: 15678,
            errorRate: "0.2%",
            paymentSuccessRate: "98.5%",
            searchSuccessRate: "99.1%",
          };
          break;

        default:
          return res.status(400).json({
            success: false,
            message: "Invalid report type",
          });
      }

      const report = {
        id: `report_${Date.now()}`,
        type,
        format,
        period: { startDate, endDate },
        generatedAt: new Date().toISOString(),
        generatedBy: req.user.username,
        data: reportData,
      };

      // For non-JSON formats, you would generate the appropriate file format here
      if (format === "csv") {
        // Generate CSV
        res.header("Content-Type", "text/csv");
        res.header(
          "Content-Disposition",
          `attachment; filename="report_${type}_${Date.now()}.csv"`,
        );
        // Convert data to CSV and send
      } else if (format === "excel") {
        // Generate Excel file
        res.header(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        );
        res.header(
          "Content-Disposition",
          `attachment; filename="report_${type}_${Date.now()}.xlsx"`,
        );
        // Generate Excel file and send
      } else if (format === "pdf") {
        // Generate PDF
        res.header("Content-Type", "application/pdf");
        res.header(
          "Content-Disposition",
          `attachment; filename="report_${type}_${Date.now()}.pdf"`,
        );
        // Generate PDF and send
      } else {
        // Default JSON response
        res.json({
          success: true,
          data: report,
        });
      }
    } catch (error) {
      console.error("Reports error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to generate report",
      });
    }
  },
);

/**
 * @api {get} /api/admin/audit Audit Logs
 * @apiName GetAuditLogs
 * @apiGroup Admin
 * @apiVersion 1.0.0
 *
 * @apiHeader {String} Authorization Bearer token
 * @apiPermission admin
 *
 * @apiQuery {String} [userId] Filter by user ID
 * @apiQuery {String} [actionType] Filter by action type
 * @apiQuery {String} [startDate] Start date filter
 * @apiQuery {String} [endDate] End date filter
 * @apiQuery {Number} [page=1] Page number
 * @apiQuery {Number} [limit=50] Items per page
 *
 * @apiSuccess {Array} logs Audit log entries
 * @apiSuccess {Object} pagination Pagination info
 * @apiSuccess {Object} stats Audit statistics
 */
router.get(
  "/audit",
  requirePermission(PERMISSIONS.AUDIT_VIEW),
  validatePagination,
  validateDateRange,
  async (req, res) => {
    try {
      const { userId, actionType, startDate, endDate } = req.query;
      const { page, limit, offset } = req.pagination;

      // Get audit trail with filters
      const filters = { userId, actionType, startDate, endDate };
      const auditLogs = getAuditTrail(filters);

      // Paginate results
      const total = auditLogs.length;
      const paginatedLogs = auditLogs.slice(offset, offset + limit);

      // Get audit statistics
      const auditStats = getAuditStats("24h");

      res.json({
        success: true,
        data: {
          logs: paginatedLogs,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
          stats: auditStats,
          filters,
        },
      });
    } catch (error) {
      console.error("Audit logs error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch audit logs",
      });
    }
  },
);

/**
 * @api {get} /api/admin/system System Information
 * @apiName GetSystemInfo
 * @apiGroup Admin
 * @apiVersion 1.0.0
 *
 * @apiHeader {String} Authorization Bearer token
 * @apiPermission admin
 *
 * @apiSuccess {Object} system System information
 */
router.get(
  "/system",
  requirePermission(PERMISSIONS.SYSTEM_CONFIG),
  async (req, res) => {
    try {
      const systemInfo = {
        version: "1.0.0",
        environment: process.env.NODE_ENV || "development",
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        nodeVersion: process.version,
        platform: process.platform,
        cpuUsage: process.cpuUsage(),
        timestamp: new Date().toISOString(),
        services: {
          database: "connected",
          redis: "connected",
          paymentGateway: "connected",
          emailService: "connected",
          externalAPIs: "connected",
        },
        health: {
          status: "healthy",
          lastHealthCheck: new Date().toISOString(),
          issues: [],
        },
      };

      res.json({
        success: true,
        data: systemInfo,
      });
    } catch (error) {
      console.error("System info error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch system information",
      });
    }
  },
);

/**
 * @api {post} /api/admin/backup Create Backup
 * @apiName CreateBackup
 * @apiGroup Admin
 * @apiVersion 1.0.0
 *
 * @apiHeader {String} Authorization Bearer token
 * @apiPermission admin
 *
 * @apiParam {String} [type=full] Backup type (full, database, files)
 * @apiParam {String} [description] Backup description
 *
 * @apiSuccess {Object} backup Backup information
 */
router.post(
  "/backup",
  requirePermission(PERMISSIONS.BACKUP_MANAGE),
  async (req, res) => {
    try {
      const { type = "full", description } = req.body;

      // Log backup creation
      await audit.systemAction(req, "backup", { type, description });

      // Create backup (mock implementation)
      const backup = {
        id: `backup_${Date.now()}`,
        type,
        description,
        createdAt: new Date().toISOString(),
        createdBy: req.user.username,
        size: "145.7 MB",
        status: "completed",
        downloadUrl: `/api/admin/backup/download/backup_${Date.now()}`,
      };

      res.json({
        success: true,
        message: "Backup created successfully",
        data: backup,
      });
    } catch (error) {
      console.error("Backup error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create backup",
      });
    }
  },
);

/**
 * @api {get} /api/admin/budget/status Budget Monitor Status
 * @apiName GetBudgetMonitorStatus
 * @apiGroup AdminBudget
 * @apiVersion 1.0.0
 *
 * @apiHeader {String} Authorization Bearer token
 * @apiPermission admin
 *
 * @apiSuccess {Object} status Budget monitoring status
 */
router.get(
  "/budget/status",
  requirePermission(PERMISSIONS.ADMIN_DASHBOARD),
  async (req, res) => {
    try {
      const status = budgetMonitorService.getStatus();

      res.json({
        success: true,
        data: status,
      });
    } catch (error) {
      console.error("Budget status error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get budget monitor status",
      });
    }
  },
);

/**
 * @api {get} /api/admin/budget/alerts Budget Alert History
 * @apiName GetBudgetAlerts
 * @apiGroup AdminBudget
 * @apiVersion 1.0.0
 *
 * @apiHeader {String} Authorization Bearer token
 * @apiPermission admin
 *
 * @apiQuery {String} [promoId] Filter by promo ID
 * @apiQuery {String} [level] Filter by alert level
 * @apiQuery {String} [startDate] Start date filter
 * @apiQuery {String} [endDate] End date filter
 *
 * @apiSuccess {Array} alerts Alert history
 */
router.get(
  "/budget/alerts",
  requirePermission(PERMISSIONS.PROMO_VIEW),
  async (req, res) => {
    try {
      const alerts = budgetMonitorService.getAlertHistory(req.query);

      res.json({
        success: true,
        data: alerts,
      });
    } catch (error) {
      console.error("Budget alerts error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get budget alerts",
      });
    }
  },
);

/**
 * @api {post} /api/admin/budget/check/:promoId Manual Budget Check
 * @apiName ManualBudgetCheck
 * @apiGroup AdminBudget
 * @apiVersion 1.0.0
 *
 * @apiHeader {String} Authorization Bearer token
 * @apiPermission admin
 *
 * @apiParam {String} promoId Promo code ID
 *
 * @apiSuccess {Object} result Budget check result
 */
router.post(
  "/budget/check/:promoId",
  requirePermission(PERMISSIONS.PROMO_MANAGE),
  async (req, res) => {
    try {
      const { promoId } = req.params;
      const result = await budgetMonitorService.checkPromocodeBudget(promoId);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: "Promo code not found",
        });
      }

      await audit.adminAction(req, "manual_budget_check", { promoId });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Manual budget check error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to check budget",
      });
    }
  },
);

/**
 * @api {put} /api/admin/budget/config Update Budget Config
 * @apiName UpdateBudgetConfig
 * @apiGroup AdminBudget
 * @apiVersion 1.0.0
 *
 * @apiHeader {String} Authorization Bearer token
 * @apiPermission admin
 *
 * @apiParam {Number} [warningThreshold] Warning threshold percentage
 * @apiParam {Number} [criticalThreshold] Critical threshold percentage
 * @apiParam {Number} [monitoringInterval] Monitoring interval in milliseconds
 * @apiParam {Boolean} [enableAutoRecovery] Enable auto-recovery
 *
 * @apiSuccess {Object} config Updated configuration
 */
router.put(
  "/budget/config",
  requirePermission(PERMISSIONS.SYSTEM_CONFIG),
  async (req, res) => {
    try {
      const allowedFields = [
        "WARNING_THRESHOLD",
        "CRITICAL_THRESHOLD",
        "MONITORING_INTERVAL",
        "ENABLE_AUTO_RECOVERY",
      ];

      const updateConfig = {};

      for (const [key, value] of Object.entries(req.body)) {
        const configKey = key.toUpperCase();
        if (allowedFields.includes(configKey)) {
          updateConfig[configKey] = value;
        }
      }

      if (Object.keys(updateConfig).length === 0) {
        return res.status(400).json({
          success: false,
          message: "No valid configuration fields provided",
        });
      }

      budgetMonitorService.updateConfig(updateConfig);

      await audit.adminAction(req, "budget_config_update", updateConfig);

      res.json({
        success: true,
        message: "Budget configuration updated",
        data: budgetMonitorService.getStatus().config,
      });
    } catch (error) {
      console.error("Budget config update error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update budget configuration",
      });
    }
  },
);

/**
 * @api {get} /api/admin/budget/report Daily Budget Report
 * @apiName GetDailyBudgetReport
 * @apiGroup AdminBudget
 * @apiVersion 1.0.0
 *
 * @apiHeader {String} Authorization Bearer token
 * @apiPermission admin
 *
 * @apiSuccess {Object} report Daily budget report
 */
router.get(
  "/budget/report",
  requirePermission(PERMISSIONS.REPORTS_GENERATE),
  async (req, res) => {
    try {
      const report = await budgetMonitorService.generateDailyReport();

      res.json({
        success: true,
        data: report,
      });
    } catch (error) {
      console.error("Budget report error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to generate budget report",
      });
    }
  },
);

module.exports = router;
