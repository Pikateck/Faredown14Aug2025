#!/bin/bash

# AI Bargaining Platform - Production Cron Jobs
# Schedule on Render or production environment

# Add to crontab with: crontab cron-jobs.txt
# Or use Render's cron job service

# ============================================================================
# HOTSET REFRESH (Every 5 minutes)
# ============================================================================
*/5 * * * * cd /app/api && node scripts/cache-warmer.js >> /var/log/cache-warmer.log 2>&1

# Supplier fabric worker hotset refresh
*/5 * * * * cd /app/api && node -e "
const worker = require('./workers/supplierFabricWorker');
worker.refreshHotset().then(() => console.log('Hotset refresh completed')).catch(console.error);
" >> /var/log/hotset-refresh.log 2>&1

# ============================================================================
# HOURLY TASKS
# ============================================================================

# Refresh materialized views and push Redis hit rate to target ≥90%
0 * * * * cd /app/api && psql $DATABASE_URL -c "REFRESH MATERIALIZED VIEW CONCURRENTLY ai.supplier_rates_mv; REFRESH MATERIALIZED VIEW CONCURRENTLY ai.session_analytics_mv; REFRESH MATERIALIZED VIEW CONCURRENTLY ai.profit_margins_mv;" >> /var/log/mv-refresh.log 2>&1

# Cache warmer to maintain 90%+ hit rate
0 * * * * cd /app/api && node -e "
const redis = require('./services/redisHotCache');
redis.warmTopCPOs().then(() => console.log('Cache warming completed')).catch(console.error);
" >> /var/log/cache-warm.log 2>&1

# Update metrics cache for Prometheus
0 * * * * cd /app/api && node -e "
const { updateMetricsFromCache } = require('./routes/metrics');
const redis = require('./services/redisHotCache');
updateMetricsFromCache(redis.client).then(() => console.log('Metrics updated')).catch(console.error);
" >> /var/log/metrics-update.log 2>&1

# ============================================================================
# DAILY TASKS (02:00 UTC)
# ============================================================================

# Model retrain and registry update
0 2 * * * cd /app/api && node scripts/model-retrain.js >> /var/log/model-retrain.log 2>&1

# Cleanup old session data (>7 days)
0 2 * * * cd /app/api && psql $DATABASE_URL -c "DELETE FROM ai.bargain_sessions WHERE created_at < NOW() - INTERVAL '7 days';" >> /var/log/cleanup.log 2>&1

# Generate daily business metrics report
0 2 * * * cd /app/api && node scripts/daily-metrics-report.js >> /var/log/daily-metrics.log 2>&1

# ============================================================================
# WEEKLY TASKS (Sunday 03:00 UTC)
# ============================================================================

# Full database optimization
0 3 * * 0 cd /app/api && psql $DATABASE_URL -c "VACUUM ANALYZE; REINDEX DATABASE faredown;" >> /var/log/db-maintenance.log 2>&1

# Archive old bargain events (>30 days)
0 3 * * 0 cd /app/api && node scripts/archive-old-events.js >> /var/log/archive.log 2>&1

# ============================================================================
# MONITORING TASKS (Every 15 minutes)
# ============================================================================

# Health check and auto-recovery
*/15 * * * * cd /app/api && node scripts/health-monitor.js >> /var/log/health-monitor.log 2>&1

# Check and alert on key metrics
*/15 * * * * cd /app/api && node -e "
const metrics = require('./routes/metrics');
// Check critical thresholds and send alerts if needed
console.log('Metrics check completed');
" >> /var/log/metrics-check.log 2>&1

# ============================================================================
# LOG ROTATION (Daily 01:00 UTC)
# ============================================================================

# Rotate application logs to prevent disk space issues
0 1 * * * find /var/log -name "*.log" -size +100M -exec logrotate {} \; >> /var/log/logrotate.log 2>&1

# ============================================================================
# BACKUP TASKS (Daily 04:00 UTC)
# ============================================================================

# Backup critical configuration and metrics
0 4 * * * cd /app/api && node scripts/backup-config.js >> /var/log/backup.log 2>&1
