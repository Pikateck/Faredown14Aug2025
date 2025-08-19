/**
 * Marketing Budget Monitoring Service
 * Automated budget tracking, alerts, and auto-disable functionality
 */

const { PromoCodeValidator } = require("../middleware/promoValidation");
const { audit } = require("../middleware/audit");

// Budget monitoring configuration
const BUDGET_CONFIG = {
  // Thresholds for alerts (percentages)
  WARNING_THRESHOLD: 75, // Alert when 75% budget used
  CRITICAL_THRESHOLD: 90, // Alert when 90% budget used
  AUTO_DISABLE_THRESHOLD: 100, // Auto-disable when 100% budget used

  // Check intervals (in milliseconds)
  MONITORING_INTERVAL: 5 * 60 * 1000, // 5 minutes
  ALERT_COOLDOWN: 30 * 60 * 1000, // 30 minutes between alerts

  // Auto-recovery settings
  ENABLE_AUTO_RECOVERY: true,
  RECOVERY_CHECK_INTERVAL: 24 * 60 * 60 * 1000, // 24 hours
};

// Alert storage (in production, use database)
let alertHistory = [];
let budgetAlerts = new Map();

class BudgetMonitorService {
  constructor() {
    this.isRunning = false;
    this.monitoringInterval = null;
    this.recoveryInterval = null;
  }

  /**
   * Start budget monitoring
   */
  start() {
    if (this.isRunning) {
      console.log("Budget monitoring is already running");
      return;
    }

    console.log("Starting budget monitoring service...");
    this.isRunning = true;

    // Start monitoring interval
    this.monitoringInterval = setInterval(() => {
      this.checkAllBudgets();
    }, BUDGET_CONFIG.MONITORING_INTERVAL);

    // Start recovery interval
    if (BUDGET_CONFIG.ENABLE_AUTO_RECOVERY) {
      this.recoveryInterval = setInterval(() => {
        this.checkForRecovery();
      }, BUDGET_CONFIG.RECOVERY_CHECK_INTERVAL);
    }

    // Initial check
    this.checkAllBudgets();

    console.log("Budget monitoring service started");
  }

  /**
   * Stop budget monitoring
   */
  stop() {
    if (!this.isRunning) {
      console.log("Budget monitoring is not running");
      return;
    }

    console.log("Stopping budget monitoring service...");
    this.isRunning = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    if (this.recoveryInterval) {
      clearInterval(this.recoveryInterval);
      this.recoveryInterval = null;
    }

    console.log("Budget monitoring service stopped");
  }

  /**
   * Check all promo code budgets
   */
  async checkAllBudgets() {
    try {
      const promoCodes = PromoCodeValidator.getAllPromoCodes();

      for (const promo of promoCodes) {
        await this.checkBudget(promo);
      }

      // Generate daily report
      await this.generateDailyReport();
    } catch (error) {
      console.error("Error checking budgets:", error);
    }
  }

  /**
   * Check individual promo code budget
   */
  async checkBudget(promo) {
    const utilizationPercent = (promo.budgetUsed / promo.marketingBudget) * 100;
    const alertKey = `${promo.id}_${new Date().toDateString()}`;

    // Skip if alert already sent today
    if (budgetAlerts.has(alertKey)) {
      return;
    }

    let alertLevel = null;
    let shouldDisable = false;

    // Determine alert level
    if (utilizationPercent >= BUDGET_CONFIG.AUTO_DISABLE_THRESHOLD) {
      alertLevel = "CRITICAL";
      shouldDisable = true;
    } else if (utilizationPercent >= BUDGET_CONFIG.CRITICAL_THRESHOLD) {
      alertLevel = "CRITICAL";
    } else if (utilizationPercent >= BUDGET_CONFIG.WARNING_THRESHOLD) {
      alertLevel = "WARNING";
    }

    if (alertLevel) {
      await this.sendBudgetAlert(promo, alertLevel, utilizationPercent);
      budgetAlerts.set(alertKey, {
        level: alertLevel,
        timestamp: new Date(),
        utilizationPercent,
      });
    }

    // Auto-disable if threshold reached
    if (shouldDisable && promo.status === "active") {
      await this.autoDisablePromo(promo, utilizationPercent);
    }
  }

  /**
   * Send budget alert
   */
  async sendBudgetAlert(promo, level, utilizationPercent) {
    const alert = {
      id: `alert_${Date.now()}`,
      promoId: promo.id,
      promoCode: promo.code,
      promoName: promo.name,
      level,
      utilizationPercent: utilizationPercent.toFixed(2),
      budgetAllocated: promo.marketingBudget,
      budgetUsed: promo.budgetUsed,
      budgetRemaining: promo.marketingBudget - promo.budgetUsed,
      usageCount: promo.usageCount,
      timestamp: new Date().toISOString(),
      status: "sent",
    };

    alertHistory.push(alert);

    // Log alert
    console.log(
      `[BUDGET ALERT - ${level}] Promo ${promo.code}: ${utilizationPercent.toFixed(2)}% budget used`,
    );

    // Send notifications (implement email/slack/webhook notifications here)
    await this.sendNotification(alert);

    // Audit log
    await audit.systemAction(null, "budget_alert", {
      promoId: promo.id,
      level,
      utilizationPercent,
      budgetUsed: promo.budgetUsed,
      budgetAllocated: promo.marketingBudget,
    });
  }

  /**
   * Auto-disable promo code when budget exhausted
   */
  async autoDisablePromo(promo, utilizationPercent) {
    try {
      const updatedPromo = PromoCodeValidator.updatePromoCode(promo.id, {
        status: "exhausted",
        disabledAt: new Date().toISOString(),
        disabledReason: "Marketing budget exhausted",
        disabledBy: "system_auto",
      });

      if (updatedPromo) {
        console.log(
          `[AUTO-DISABLE] Promo ${promo.code} automatically disabled - budget exhausted`,
        );

        // Send critical notification
        await this.sendCriticalNotification({
          type: "PROMO_AUTO_DISABLED",
          promoCode: promo.code,
          promoName: promo.name,
          utilizationPercent,
          budgetUsed: promo.budgetUsed,
          budgetAllocated: promo.marketingBudget,
          timestamp: new Date().toISOString(),
        });

        // Audit log
        await audit.systemAction(null, "promo_auto_disabled", {
          promoId: promo.id,
          code: promo.code,
          budgetUsed: promo.budgetUsed,
          budgetAllocated: promo.marketingBudget,
          utilizationPercent,
        });
      }
    } catch (error) {
      console.error(`Error auto-disabling promo ${promo.code}:`, error);
    }
  }

  /**
   * Check for budget recovery (if budget is increased)
   */
  async checkForRecovery() {
    try {
      const promoCodes = PromoCodeValidator.getAllPromoCodes();

      for (const promo of promoCodes) {
        if (
          promo.status === "exhausted" &&
          promo.disabledBy === "system_auto"
        ) {
          const utilizationPercent =
            (promo.budgetUsed / promo.marketingBudget) * 100;

          // If budget utilization drops below threshold (budget was increased)
          if (utilizationPercent < BUDGET_CONFIG.AUTO_DISABLE_THRESHOLD) {
            await this.autoRecoverPromo(promo, utilizationPercent);
          }
        }
      }
    } catch (error) {
      console.error("Error checking for recovery:", error);
    }
  }

  /**
   * Auto-recover promo code when budget is increased
   */
  async autoRecoverPromo(promo, utilizationPercent) {
    try {
      const updatedPromo = PromoCodeValidator.updatePromoCode(promo.id, {
        status: "active",
        recoveredAt: new Date().toISOString(),
        recoveredReason: "Budget increased, auto-recovery triggered",
        recoveredBy: "system_auto",
      });

      if (updatedPromo) {
        console.log(
          `[AUTO-RECOVERY] Promo ${promo.code} automatically recovered - budget increased`,
        );

        // Send recovery notification
        await this.sendRecoveryNotification({
          type: "PROMO_AUTO_RECOVERED",
          promoCode: promo.code,
          promoName: promo.name,
          utilizationPercent,
          budgetUsed: promo.budgetUsed,
          budgetAllocated: promo.marketingBudget,
          timestamp: new Date().toISOString(),
        });

        // Audit log
        await audit.systemAction(null, "promo_auto_recovered", {
          promoId: promo.id,
          code: promo.code,
          budgetUsed: promo.budgetUsed,
          budgetAllocated: promo.marketingBudget,
          utilizationPercent,
        });
      }
    } catch (error) {
      console.error(`Error auto-recovering promo ${promo.code}:`, error);
    }
  }

  /**
   * Generate daily budget report
   */
  async generateDailyReport() {
    const promoCodes = PromoCodeValidator.getAllPromoCodes();
    const stats = PromoCodeValidator.getPromoStatistics();

    const report = {
      date: new Date().toISOString().split("T")[0],
      summary: {
        totalPromoCodes: promoCodes.length,
        activePromoCodes: promoCodes.filter((p) => p.status === "active")
          .length,
        exhaustedPromoCodes: promoCodes.filter((p) => p.status === "exhausted")
          .length,
        totalBudget: stats.totalBudget,
        totalBudgetUsed: stats.totalBudgetUsed,
        budgetUtilization: stats.budgetUtilization,
      },
      promoDetails: promoCodes.map((promo) => ({
        code: promo.code,
        name: promo.name,
        status: promo.status,
        budgetAllocated: promo.marketingBudget,
        budgetUsed: promo.budgetUsed,
        budgetRemaining: promo.marketingBudget - promo.budgetUsed,
        utilizationPercent: (
          (promo.budgetUsed / promo.marketingBudget) *
          100
        ).toFixed(2),
        usageCount: promo.usageCount,
      })),
      alerts: alertHistory.filter((alert) =>
        alert.timestamp.startsWith(new Date().toISOString().split("T")[0]),
      ),
    };

    // Log daily report
    console.log("=== DAILY BUDGET REPORT ===");
    console.log(`Date: ${report.date}`);
    console.log(
      `Total Budget: ₹${report.summary.totalBudget.toLocaleString()}`,
    );
    console.log(
      `Budget Used: ₹${report.summary.totalBudgetUsed.toLocaleString()} (${report.summary.budgetUtilization}%)`,
    );
    console.log(
      `Active Promos: ${report.summary.activePromoCodes}/${report.summary.totalPromoCodes}`,
    );
    console.log(`Alerts Today: ${report.alerts.length}`);
    console.log("===========================");

    return report;
  }

  /**
   * Send notification (implement email/slack/webhook)
   */
  async sendNotification(alert) {
    // Implementation depends on notification service
    // Could send email, Slack message, webhook, etc.

    const message = this.formatAlertMessage(alert);

    // Example: Log to console (replace with actual notification service)
    console.log(`[NOTIFICATION] ${message}`);

    // Example implementations:
    // await this.sendEmail(alert);
    // await this.sendSlackMessage(alert);
    // await this.sendWebhook(alert);
  }

  /**
   * Send critical notification for auto-disabled promos
   */
  async sendCriticalNotification(notification) {
    const message = `🚨 CRITICAL: Promo code "${notification.promoCode}" has been automatically disabled due to budget exhaustion (${notification.utilizationPercent.toFixed(2)}% used)`;

    console.log(`[CRITICAL NOTIFICATION] ${message}`);

    // Send to all admin channels
    // await this.sendUrgentAlert(notification);
  }

  /**
   * Send recovery notification
   */
  async sendRecoveryNotification(notification) {
    const message = `✅ RECOVERY: Promo code "${notification.promoCode}" has been automatically recovered due to budget increase (${notification.utilizationPercent.toFixed(2)}% utilization)`;

    console.log(`[RECOVERY NOTIFICATION] ${message}`);
  }

  /**
   * Format alert message
   */
  formatAlertMessage(alert) {
    const emoji = alert.level === "CRITICAL" ? "🚨" : "⚠️";
    return `${emoji} Budget Alert: Promo "${alert.promoCode}" is at ${alert.utilizationPercent}% budget utilization (₹${alert.budgetUsed.toLocaleString()} / ₹${alert.budgetAllocated.toLocaleString()})`;
  }

  /**
   * Get budget monitoring status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      config: BUDGET_CONFIG,
      stats: {
        totalAlerts: alertHistory.length,
        alertsToday: alertHistory.filter((alert) =>
          alert.timestamp.startsWith(new Date().toISOString().split("T")[0]),
        ).length,
        activeAlerts: budgetAlerts.size,
      },
    };
  }

  /**
   * Get alert history
   */
  getAlertHistory(filters = {}) {
    let alerts = [...alertHistory];

    if (filters.promoId) {
      alerts = alerts.filter((alert) => alert.promoId === filters.promoId);
    }

    if (filters.level) {
      alerts = alerts.filter((alert) => alert.level === filters.level);
    }

    if (filters.startDate) {
      alerts = alerts.filter((alert) => alert.timestamp >= filters.startDate);
    }

    if (filters.endDate) {
      alerts = alerts.filter((alert) => alert.timestamp <= filters.endDate);
    }

    return alerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  /**
   * Manual budget check for specific promo
   */
  async checkPromocodeBudget(promoId) {
    const promo = PromoCodeValidator.getAllPromoCodes().find(
      (p) => p.id === promoId,
    );
    if (promo) {
      await this.checkBudget(promo);
      return {
        promoId,
        utilizationPercent: (
          (promo.budgetUsed / promo.marketingBudget) *
          100
        ).toFixed(2),
        status: promo.status,
        lastChecked: new Date().toISOString(),
      };
    }
    return null;
  }

  /**
   * Update budget monitoring configuration
   */
  updateConfig(newConfig) {
    Object.assign(BUDGET_CONFIG, newConfig);
    console.log("Budget monitoring configuration updated:", BUDGET_CONFIG);

    // Restart monitoring with new config
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }
}

// Singleton instance
const budgetMonitorService = new BudgetMonitorService();

// Auto-start monitoring when module is loaded
budgetMonitorService.start();

// Graceful shutdown
process.on("SIGTERM", () => {
  budgetMonitorService.stop();
});

process.on("SIGINT", () => {
  budgetMonitorService.stop();
});

module.exports = {
  budgetMonitorService,
  BudgetMonitorService,
  BUDGET_CONFIG,
};
