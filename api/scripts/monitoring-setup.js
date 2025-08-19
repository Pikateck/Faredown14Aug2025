#!/usr/bin/env node
/**
 * Monitoring & Alerts Setup
 * Configures alerts for latency, Redis, inventory flips, and profit guard
 */

const fs = require("fs");
const path = require("path");

class MonitoringSetup {
  constructor() {
    this.alerts = [];
    this.dashboards = [];
    this.setupTime = new Date().toISOString();
  }

  // Generate Prometheus alert rules
  generatePrometheusAlerts() {
    return {
      groups: [
        {
          name: "bargain_api_alerts",
          rules: [
            {
              alert: "BargainAPIHighLatency",
              expr: 'histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{job="bargain-api", endpoint=~"/api/bargain/v1/session.*"}[5m])) > 0.3',
              for: "5m",
              labels: {
                severity: "critical",
                component: "bargain-api",
              },
              annotations: {
                summary: "Bargain API P95 latency above 300ms",
                description:
                  "P95 latency for bargain API endpoints has been above 300ms for 5 minutes. Current value: {{ $value }}s",
              },
            },
            {
              alert: "BargainAPIHighErrorRate",
              expr: 'rate(http_requests_total{job="bargain-api", code!~"2.."}[5m]) / rate(http_requests_total{job="bargain-api"}[5m]) > 0.005',
              for: "2m",
              labels: {
                severity: "critical",
                component: "bargain-api",
              },
              annotations: {
                summary: "Bargain API error rate above 0.5%",
                description:
                  "Error rate has been above 0.5% for 2 minutes. Current rate: {{ $value | humanizePercentage }}",
              },
            },
          ],
        },
        {
          name: "redis_alerts",
          rules: [
            {
              alert: "RedisHighMissRate",
              expr: "rate(redis_keyspace_misses_total[10m]) / (rate(redis_keyspace_hits_total[10m]) + rate(redis_keyspace_misses_total[10m])) > 0.1",
              for: "10m",
              labels: {
                severity: "warning",
                component: "redis",
              },
              annotations: {
                summary: "Redis cache miss rate above 10%",
                description:
                  "Redis miss rate has been above 10% for 10 minutes. Current rate: {{ $value | humanizePercentage }}. Consider cache warming.",
              },
            },
            {
              alert: "RedisDown",
              expr: "redis_up == 0",
              for: "1m",
              labels: {
                severity: "critical",
                component: "redis",
              },
              annotations: {
                summary: "Redis instance is down",
                description:
                  "Redis instance {{ $labels.instance }} has been down for 1 minute. Fallback mode should be active.",
              },
            },
          ],
        },
        {
          name: "business_alerts",
          rules: [
            {
              alert: "InventoryFlipRateHigh",
              expr: "rate(bargain_inventory_changes_total[15m]) / rate(bargain_sessions_total[15m]) > 0.02",
              for: "15m",
              labels: {
                severity: "warning",
                component: "inventory",
              },
              annotations: {
                summary: "High inventory flip rate detected",
                description:
                  "Inventory changes are affecting more than 2% of sessions. Current rate: {{ $value | humanizePercentage }}. Check supplier refresh rates.",
              },
            },
            {
              alert: "ProfitMarginDrop",
              expr: "avg_over_time(bargain_profit_margin_pct[6h]) < on() scalar(avg_over_time(bargain_profit_margin_pct[6h] offset 6h)) - 3",
              for: "6h",
              labels: {
                severity: "critical",
                component: "profit-guard",
              },
              annotations: {
                summary: "Profit margin dropped by more than 3%",
                description:
                  "Profit margin has dropped by more than 3% compared to previous 6h period. Consider auto-rollback to control group.",
              },
            },
            {
              alert: "NeverLossViolation",
              expr: "increase(bargain_below_floor_accepts_total[1h]) > 0",
              for: "0m",
              labels: {
                severity: "critical",
                component: "never-loss",
              },
              annotations: {
                summary: "CRITICAL: Accept below cost floor detected",
                description:
                  "{{ $value }} accepts below cost floor in the last hour. Immediate investigation required!",
              },
            },
          ],
        },
      ],
    };
  }

  // Generate Grafana dashboard JSON
  generateGrafanaDashboard() {
    return {
      dashboard: {
        id: null,
        title: "AI Bargaining Platform Monitoring",
        tags: ["bargain", "ai", "monitoring"],
        timezone: "UTC",
        refresh: "30s",
        time: {
          from: "now-1h",
          to: "now",
        },
        panels: [
          {
            id: 1,
            title: "API Response Time P95",
            type: "stat",
            targets: [
              {
                expr: 'histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{job="bargain-api"}[5m]))',
                legendFormat: "P95 Latency",
              },
            ],
            fieldConfig: {
              defaults: {
                unit: "s",
                max: 0.5,
                thresholds: {
                  steps: [
                    { color: "green", value: null },
                    { color: "yellow", value: 0.2 },
                    { color: "red", value: 0.3 },
                  ],
                },
              },
            },
            gridPos: { h: 8, w: 6, x: 0, y: 0 },
          },
          {
            id: 2,
            title: "Redis Cache Hit Rate",
            type: "stat",
            targets: [
              {
                expr: "rate(redis_keyspace_hits_total[5m]) / (rate(redis_keyspace_hits_total[5m]) + rate(redis_keyspace_misses_total[5m]))",
                legendFormat: "Hit Rate",
              },
            ],
            fieldConfig: {
              defaults: {
                unit: "percentunit",
                min: 0,
                max: 1,
                thresholds: {
                  steps: [
                    { color: "red", value: null },
                    { color: "yellow", value: 0.8 },
                    { color: "green", value: 0.9 },
                  ],
                },
              },
            },
            gridPos: { h: 8, w: 6, x: 6, y: 0 },
          },
          {
            id: 3,
            title: "Sessions per Minute",
            type: "stat",
            targets: [
              {
                expr: "rate(bargain_sessions_total[1m]) * 60",
                legendFormat: "Sessions/min",
              },
            ],
            gridPos: { h: 8, w: 6, x: 12, y: 0 },
          },
          {
            id: 4,
            title: "Acceptance Rate",
            type: "stat",
            targets: [
              {
                expr: "rate(bargain_accepts_total[5m]) / rate(bargain_sessions_total[5m])",
                legendFormat: "Acceptance Rate",
              },
            ],
            fieldConfig: {
              defaults: {
                unit: "percentunit",
                min: 0,
                max: 1,
              },
            },
            gridPos: { h: 8, w: 6, x: 18, y: 0 },
          },
          {
            id: 5,
            title: "API Latency Trends",
            type: "timeseries",
            targets: [
              {
                expr: 'histogram_quantile(0.50, rate(http_request_duration_seconds_bucket{job="bargain-api"}[5m]))',
                legendFormat: "P50",
              },
              {
                expr: 'histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{job="bargain-api"}[5m]))',
                legendFormat: "P95",
              },
              {
                expr: 'histogram_quantile(0.99, rate(http_request_duration_seconds_bucket{job="bargain-api"}[5m]))',
                legendFormat: "P99",
              },
            ],
            fieldConfig: {
              defaults: {
                unit: "s",
              },
            },
            gridPos: { h: 8, w: 12, x: 0, y: 8 },
          },
          {
            id: 6,
            title: "Error Rate by Endpoint",
            type: "timeseries",
            targets: [
              {
                expr: 'rate(http_requests_total{job="bargain-api", code!~"2.."}[5m]) by (endpoint)',
                legendFormat: "{{ endpoint }}",
              },
            ],
            gridPos: { h: 8, w: 12, x: 12, y: 8 },
          },
          {
            id: 7,
            title: "Profit Margin Trends",
            type: "timeseries",
            targets: [
              {
                expr: "avg_over_time(bargain_profit_margin_pct[1h])",
                legendFormat: "Profit Margin %",
              },
            ],
            fieldConfig: {
              defaults: {
                unit: "percent",
              },
            },
            gridPos: { h: 8, w: 12, x: 0, y: 16 },
          },
          {
            id: 8,
            title: "Never-Loss Violations (24h)",
            type: "stat",
            targets: [
              {
                expr: "increase(bargain_below_floor_accepts_total[24h])",
                legendFormat: "Violations",
              },
            ],
            fieldConfig: {
              defaults: {
                color: {
                  mode: "thresholds",
                },
                thresholds: {
                  steps: [
                    { color: "green", value: 0 },
                    { color: "red", value: 1 },
                  ],
                },
              },
            },
            gridPos: { h: 8, w: 12, x: 12, y: 16 },
          },
        ],
      },
    };
  }

  // Generate application metrics collection
  generateMetricsCollection() {
    return {
      // Prometheus metrics for the Node.js app
      javascript: `
// Add to your Express app
const prometheus = require('prom-client');

// Custom metrics for bargain platform
const bargainSessionsTotal = new prometheus.Counter({
  name: 'bargain_sessions_total',
  help: 'Total number of bargain sessions started',
  labelNames: ['product_type', 'user_tier']
});

const bargainAcceptsTotal = new prometheus.Counter({
  name: 'bargain_accepts_total', 
  help: 'Total number of accepted bargains',
  labelNames: ['product_type', 'decision_type']
});

const bargainLatencyHistogram = new prometheus.Histogram({
  name: 'bargain_request_duration_seconds',
  help: 'Bargain API request duration',
  labelNames: ['endpoint', 'method'],
  buckets: [0.01, 0.05, 0.1, 0.2, 0.3, 0.5, 1, 2, 5]
});

const bargainProfitMargin = new prometheus.Gauge({
  name: 'bargain_profit_margin_pct',
  help: 'Current profit margin percentage',
  labelNames: ['product_type']
});

const bargainInventoryChanges = new prometheus.Counter({
  name: 'bargain_inventory_changes_total',
  help: 'Total inventory changes during bargaining',
  labelNames: ['supplier', 'reason']
});

const bargainBelowFloorAccepts = new prometheus.Counter({
  name: 'bargain_below_floor_accepts_total',
  help: 'CRITICAL: Accepts below cost floor',
  labelNames: ['product_type', 'user_id']
});

// Export metrics endpoint
app.get('/metrics', (req, res) => {
  res.set('Content-Type', prometheus.register.contentType);
  res.end(prometheus.register.metrics());
});
`,

      // Middleware for automatic instrumentation
      middleware: `
// Request instrumentation middleware
function instrumentBargainRequests(req, res, next) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const endpoint = req.route?.path || 'unknown';
    
    bargainLatencyHistogram
      .labels(endpoint, req.method)
      .observe(duration);
      
    // Track sessions
    if (endpoint.includes('/session/start')) {
      const productType = req.body?.productCPO?.type || 'unknown';
      const userTier = req.body?.user?.tier || 'standard';
      bargainSessionsTotal.labels(productType, userTier).inc();
    }
    
    // Track accepts
    if (endpoint.includes('/session/accept') && res.statusCode === 200) {
      const productType = req.session?.productType || 'unknown';
      bargainAcceptsTotal.labels(productType, 'accept').inc();
    }
  });
  
  next();
}
`,
    };
  }

  // Generate alerting configuration
  generateAlertManager() {
    return {
      global: {
        smtp_smarthost: "localhost:587",
        smtp_from: "alerts@faredown.ai",
      },
      route: {
        group_by: ["alertname"],
        group_wait: "10s",
        group_interval: "10s",
        repeat_interval: "1h",
        receiver: "web.hook",
      },
      receivers: [
        {
          name: "web.hook",
          webhook_configs: [
            {
              url: "http://localhost:3000/api/alerts/webhook",
              send_resolved: true,
            },
          ],
          slack_configs: [
            {
              api_url: process.env.SLACK_WEBHOOK_URL,
              channel: "#bargain-alerts",
              title: "Bargain Platform Alert",
              text: "{{ range .Alerts }}{{ .Annotations.summary }}\n{{ .Annotations.description }}{{ end }}",
            },
          ],
        },
      ],
    };
  }

  // Generate health check endpoints
  generateHealthChecks() {
    return {
      basic: `
// Basic health check
app.get('/health', async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version,
      uptime: process.uptime(),
      services: {
        redis: await checkRedisHealth(),
        database: await checkDatabaseHealth(),
        apis: await checkExternalAPIs()
      }
    };
    
    const allHealthy = Object.values(health.services)
      .every(service => service.status === 'healthy');
    
    res.status(allHealthy ? 200 : 503).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});
`,

      detailed: `
// Detailed health check for bargain services
app.get('/health/bargain', async (req, res) => {
  const health = {
    status: 'healthy',
    checks: {
      redis_cache: await testRedisConnection(),
      policy_engine: await testPolicyEngine(), 
      model_inference: await testModelInference(),
      supplier_apis: await testSupplierAPIs(),
      database_queries: await testDatabaseQueries()
    },
    metrics: {
      active_sessions: await getActiveSessionCount(),
      cache_hit_rate: await getCacheHitRate(),
      avg_latency_ms: await getAverageLatency(),
      error_rate_pct: await getErrorRate()
    }
  };
  
  const criticalFailed = Object.entries(health.checks)
    .filter(([key, check]) => check.critical && check.status !== 'pass');
    
  if (criticalFailed.length > 0) {
    health.status = 'unhealthy';
    res.status(503);
  } else {
    res.status(200);
  }
  
  res.json(health);
});
`,
    };
  }

  // Setup rollout configuration
  generateRolloutConfig() {
    return {
      shadow_mode: {
        description: "Log AI decisions but use control flow",
        traffic_percentage: 0,
        log_decisions: true,
        duration_hours: 24,
        success_criteria: {
          no_errors: true,
          latency_p95_ms: 300,
          decision_accuracy: 0.85,
        },
      },

      canary_10_percent: {
        description: "10% live traffic with monitoring",
        traffic_percentage: 10,
        duration_hours: 24,
        success_criteria: {
          error_rate_pct: 0.5,
          latency_p95_ms: 300,
          margin_drop_vs_control_pct: 3,
          acceptance_rate_min: 0.15,
        },
        rollback_triggers: {
          error_rate_5min_pct: 1.0,
          latency_p95_5min_ms: 500,
          margin_drop_1hr_pct: 5,
        },
      },

      canary_50_percent: {
        description: "50% traffic with promo suggestions",
        traffic_percentage: 50,
        duration_hours: 48,
        features_enabled: ["promo_suggestions", "tier_bonuses"],
        success_criteria: {
          error_rate_pct: 0.3,
          latency_p95_ms: 280,
          margin_improvement_pct: 2,
          user_satisfaction_score: 4.2,
        },
      },

      full_rollout: {
        description: "100% traffic with all features",
        traffic_percentage: 100,
        features_enabled: ["all"],
        monitoring: {
          auto_rollback_enabled: true,
          margin_threshold_pct: 3,
          error_threshold_pct: 0.5,
          rollback_window_hours: 6,
        },
      },
    };
  }

  // Generate complete monitoring setup
  async setupAll() {
    console.log("🔧 Setting up monitoring and alerts...\n");

    const configs = {
      prometheus_alerts: this.generatePrometheusAlerts(),
      grafana_dashboard: this.generateGrafanaDashboard(),
      metrics_collection: this.generateMetricsCollection(),
      alertmanager: this.generateAlertManager(),
      health_checks: this.generateHealthChecks(),
      rollout_config: this.generateRolloutConfig(),
    };

    // Write configuration files
    for (const [name, config] of Object.entries(configs)) {
      const filename = `${name.replace(/_/g, "-")}.json`;
      const filepath = path.join(__dirname, "..", "monitoring", filename);

      // Create monitoring directory if it doesn't exist
      const dir = path.dirname(filepath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(filepath, JSON.stringify(config, null, 2));
      console.log(`✅ Generated ${filename}`);
    }

    // Generate setup summary
    const summary = {
      setup_time: this.setupTime,
      components: Object.keys(configs),
      alerts_configured: configs.prometheus_alerts.groups.reduce(
        (total, group) => total + group.rules.length,
        0,
      ),
      dashboard_panels: configs.grafana_dashboard.dashboard.panels.length,
      health_endpoints: Object.keys(configs.health_checks).length,
      rollout_phases: Object.keys(configs.rollout_config).length,
    };

    fs.writeFileSync(
      path.join(__dirname, "..", "monitoring", "setup-summary.json"),
      JSON.stringify(summary, null, 2),
    );

    console.log("\n📊 MONITORING SETUP COMPLETE");
    console.log("==============================");
    console.log(`Alerts configured: ${summary.alerts_configured}`);
    console.log(`Dashboard panels: ${summary.dashboard_panels}`);
    console.log(`Health endpoints: ${summary.health_endpoints}`);
    console.log(`Rollout phases: ${summary.rollout_phases}`);
    console.log("\n🚀 Ready for production deployment!");

    this.generateQuickStartGuide();
  }

  generateQuickStartGuide() {
    const guide = `
# Monitoring Quick Start Guide

## 1. Install Dependencies
\`\`\`bash
npm install prom-client
\`\`\`

## 2. Add Metrics to Your App
\`\`\`javascript
${this.generateMetricsCollection().javascript}
\`\`\`

## 3. Add Request Instrumentation
\`\`\`javascript
${this.generateMetricsCollection().middleware}
\`\`\`

## 4. Setup Health Checks
\`\`\`javascript
${this.generateHealthChecks().basic}
\`\`\`

## 5. Configure Alerts
- Copy prometheus-alerts.json to your Prometheus config
- Import grafana-dashboard.json to Grafana
- Setup AlertManager with alertmanager.json

## 6. Rollout Checklist
- [ ] Shadow mode: 24h with no live traffic
- [ ] 10% canary: Monitor for 24h
- [ ] 50% canary: Enable promo features, 48h
- [ ] 100% rollout: Auto-rollback armed

## Key Metrics to Watch
- API P95 latency < 300ms
- Error rate < 0.5%
- Redis hit rate > 90%
- Profit margin vs control
- Never-loss violations = 0

## Emergency Procedures
\`\`\`bash
# Rollback to control
curl -X POST /api/admin/rollback -d '{"reason":"emergency"}'

# Disable AI bargaining
curl -X POST /api/admin/feature-flags -d '{"AI_KILL_SWITCH":true}'

# Check system health
curl /health/bargain
\`\`\`
`;

    fs.writeFileSync(
      path.join(__dirname, "..", "monitoring", "QUICK-START.md"),
      guide,
    );

    console.log("✅ Generated monitoring/QUICK-START.md");
  }
}

// CLI execution
if (require.main === module) {
  const setup = new MonitoringSetup();
  setup.setupAll().catch((error) => {
    console.error("❌ Monitoring setup failed:", error);
    process.exit(1);
  });
}

module.exports = MonitoringSetup;
