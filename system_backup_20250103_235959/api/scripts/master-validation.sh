#!/bin/bash
set -euo pipefail

# Master Validation Script - AI Bargaining Platform
# Final production readiness gate - ALL TESTS MUST PASS

echo "🚀 AI BARGAINING PLATFORM - MASTER VALIDATION SUITE"
echo "===================================================="
echo "Timestamp: $(date -u)"
echo "Environment: ${NODE_ENV:-production}"
echo "API URL: ${API_URL:-https://api.company.com}"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Validation results
VALIDATION_RESULTS=()
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

# Function to run validation check
validate() {
    local check_name="$1"
    local check_command="$2"
    local is_critical="${3:-true}"
    
    ((TOTAL_CHECKS++))
    echo -e "\n${BLUE}[$TOTAL_CHECKS] Validating: $check_name${NC}"
    echo "Command: $check_command"
    
    if eval "$check_command" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS: $check_name${NC}"
        VALIDATION_RESULTS+=("✅ $check_name")
        ((PASSED_CHECKS++))
        return 0
    else
        if [[ "$is_critical" == "true" ]]; then
            echo -e "${RED}❌ FAIL (CRITICAL): $check_name${NC}"
            VALIDATION_RESULTS+=("❌ $check_name (CRITICAL)")
        else
            echo -e "${YELLOW}⚠️ WARN: $check_name${NC}"
            VALIDATION_RESULTS+=("⚠️ $check_name (WARNING)")
        fi
        ((FAILED_CHECKS++))
        return 1
    fi
}

echo -e "${YELLOW}Starting comprehensive validation...${NC}"

# 1. DATABASE VALIDATION
echo -e "\n🗄️ DATABASE VALIDATION"
echo "======================"

validate "Database connectivity" \
    "psql \"\$DATABASE_URL\" -c 'SELECT 1;'"

validate "AI schema exists" \
    "psql \"\$DATABASE_URL\" -tAc \"SELECT 1 FROM information_schema.schemata WHERE schema_name = 'ai'\" | grep -q '1'"

validate "Required tables present (15+)" \
    "psql \"\$DATABASE_URL\" -tAc \"SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'ai'\" | awk '{if(\$1 >= 15) exit 0; else exit 1}'"

validate "Materialized views present (3+)" \
    "psql \"\$DATABASE_URL\" -tAc \"SELECT COUNT(*) FROM pg_matviews WHERE schemaname = 'ai'\" | awk '{if(\$1 >= 3) exit 0; else exit 1}'"

validate "Never-loss function exists" \
    "psql \"\$DATABASE_URL\" -tAc \"SELECT 1 FROM pg_proc WHERE proname = 'assert_never_loss'\" | grep -q '1'"

validate "Active models in registry (2+)" \
    "psql \"\$DATABASE_URL\" -tAc \"SELECT COUNT(*) FROM ai.model_registry WHERE is_active = true\" | awk '{if(\$1 >= 2) exit 0; else exit 1}'"

validate "Supplier policies loaded (3+)" \
    "psql \"\$DATABASE_URL\" -tAc \"SELECT COUNT(*) FROM ai.policies WHERE is_active = true\" | awk '{if(\$1 >= 3) exit 0; else exit 1}'"

validate "Zero never-loss violations" \
    "psql \"\$DATABASE_URL\" -tAc \"SELECT COUNT(*) FROM ai.bargain_events e JOIN LATERAL (SELECT MAX(counter_price) AS final_price FROM ai.bargain_events e2 WHERE e2.session_id = e.session_id) f ON TRUE WHERE e.accepted IS TRUE AND f.final_price < e.true_cost_usd\" | grep -q '^0$'"

# 2. REDIS VALIDATION
echo -e "\n🔴 REDIS VALIDATION"
echo "=================="

validate "Redis connectivity" \
    "curl -s -f \"\$API_URL/api/cache/health\" | jq -e '.redis_connected == true'"

validate "Redis TTL configuration" \
    "curl -s \"\$API_URL/api/cache/config\" | jq -e '.ttl_policies.RATES == 300'"

validate "Cache hit rate >= 85%" \
    "curl -s \"\$API_URL/api/cache/stats\" | jq -e '.hit_rate >= 0.85'"

# 3. API VALIDATION  
echo -e "\n🌐 API VALIDATION"
echo "================"

validate "API health endpoint" \
    "curl -s -f \"\$API_URL/api/health\" | jq -e '.status == \"healthy\"'"

validate "Metrics endpoint responding" \
    "curl -s -f \"\$API_URL/metrics\" | grep -q 'bargain_response_seconds'"

validate "Bargain API session start <300ms" \
    "timeout 30 bash -c '
        start=\$(date +%s%N)
        curl -s -H \"Authorization: Bearer \$AUTH_TOKEN\" -H \"Content-Type: application/json\" \
        -d \"{\\\"user\\\":{\\\"id\\\":\\\"val-u1\\\",\\\"tier\\\":\\\"GOLD\\\"},\\\"productCPO\\\":{\\\"type\\\":\\\"hotel\\\",\\\"canonical_key\\\":\\\"HT:12345:DLX:BRD-BB:CXL-FLEX\\\",\\\"displayed_price\\\":142,\\\"currency\\\":\\\"USD\\\"}}\" \
        \"\$API_URL/api/bargain/v1/session/start\" >/dev/null
        end=\$(date +%s%N)
        duration=\$(((\$end - \$start) / 1000000))
        if [[ \$duration -lt 300 ]]; then exit 0; else exit 1; fi
    '"

validate "Feature flags responding" \
    "curl -s -f \"\$API_URL/api/feature-flags\" | jq -e 'has(\"AI_TRAFFIC\")'"

# 4. SUPPLIER FABRIC VALIDATION
echo -e "\n🏭 SUPPLIER FABRIC VALIDATION"
echo "============================"

validate "Recent rate snapshots (last 10min)" \
    "psql \"\$DATABASE_URL\" -tAc \"SELECT COUNT(*) FROM ai.supplier_rates WHERE updated_at > NOW() - INTERVAL '10 minutes'\" | awk '{if(\$1 > 0) exit 0; else exit 1}'"

validate "Amadeus adapter functional" \
    "psql \"\$DATABASE_URL\" -tAc \"SELECT COUNT(*) FROM ai.supplier_rates WHERE supplier_id = 'amadeus' AND updated_at > NOW() - INTERVAL '1 hour'\" | awk '{if(\$1 > 0) exit 0; else exit 1}'"

validate "Hotelbeds adapter functional" \
    "psql \"\$DATABASE_URL\" -tAc \"SELECT COUNT(*) FROM ai.supplier_rates WHERE supplier_id = 'hotelbeds' AND updated_at > NOW() - INTERVAL '1 hour'\" | awk '{if(\$1 > 0) exit 0; else exit 1}'"

# 5. MONITORING VALIDATION
echo -e "\n📊 MONITORING VALIDATION"
echo "======================="

validate "Prometheus alerts loaded" \
    "curl -s -f \"http://prometheus:9090/api/v1/rules\" | jq -e '.data.groups[] | select(.name == \"bargain-slo\")'"

validate "Grafana dashboard accessible" \
    "curl -s -f \"http://grafana:3000/api/health\" | jq -e '.database == \"ok\"'" \
    "false"

validate "Alertmanager configured" \
    "curl -s -f \"http://alertmanager:9093/api/v1/status\" | jq -e '.data.uptime'" \
    "false"

# 6. LOAD TEST VALIDATION
echo -e "\n⚡ LOAD TEST VALIDATION"
echo "======================"

validate "k6 load test passes SLA" \
    "cd \$(dirname \$0) && k6 run --quiet load-test.js | grep -q 'passed_sla.*true'"

# 7. SECURITY VALIDATION
echo -e "\n🔒 SECURITY VALIDATION"
echo "====================="

validate "No secrets in environment response" \
    "! curl -s \"\$API_URL/api/health\" | grep -i -E '(password|secret|key|token)'"

validate "HTTPS enforced" \
    "curl -s -I \"\$API_URL/api/health\" | grep -q 'Strict-Transport-Security'"

validate "Rate limiting configured" \
    "curl -s -I \"\$API_URL/api/bargain/v1/session/start\" | grep -q 'X-RateLimit'" \
    "false"

# 8. BUSINESS LOGIC VALIDATION
echo -e "\n💼 BUSINESS LOGIC VALIDATION"
echo "============================"

validate "Offerability engine responding" \
    "psql \"\$DATABASE_URL\" -tAc \"SELECT COUNT(*) FROM ai.offerability_cache WHERE updated_at > NOW() - INTERVAL '1 hour'\" | awk '{if(\$1 > 0) exit 0; else exit 1}'"

validate "Model inference working" \
    "curl -s \"\$API_URL/metrics\" | grep -q 'bargain_model_infer_ms'"

validate "Policy engine active" \
    "psql \"\$DATABASE_URL\" -tAc \"SELECT COUNT(*) FROM ai.policy_evaluations WHERE created_at > NOW() - INTERVAL '1 hour'\" | awk '{if(\$1 > 0) exit 0; else exit 1}'" \
    "false"

# 9. FINAL SMOKE TEST
echo -e "\n🔥 FINAL SMOKE TEST"
echo "=================="

validate "Complete bargain flow (end-to-end)" \
    "bash \$(dirname \$0)/smoke-tests.sh | grep -q 'ALL SMOKE TESTS PASSED'"

# RESULTS SUMMARY
echo ""
echo "=============================================="
echo "🎯 VALIDATION SUMMARY"
echo "=============================================="
echo "Total Checks: $TOTAL_CHECKS"
echo "Passed: $PASSED_CHECKS"
echo "Failed: $FAILED_CHECKS"
echo ""

echo "Detailed Results:"
for result in "${VALIDATION_RESULTS[@]}"; do
    echo "  $result"
done

echo ""
echo "=============================================="

# Final decision
CRITICAL_FAILURES=$(echo "${VALIDATION_RESULTS[@]}" | grep -c "CRITICAL" || true)

if [[ $FAILED_CHECKS -eq 0 ]]; then
    echo -e "${GREEN}"
    echo "██████╗ ███████╗ █████╗ ██████╗ ██╗   ██╗"
    echo "██╔══██╗██╔════╝██╔══██╗██╔══██╗╚██╗ ██╔╝"
    echo "██████╔╝█████╗  ███████║██║  ██║ ╚████╔╝ "
    echo "██╔══██╗██╔══╝  ██╔══██║██║  ██║  ╚██╔╝  "
    echo "██║  ██║███████╗██║  ██║██████╔╝   ██║   "
    echo "╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝    ╚═╝   "
    echo ""
    echo "███████╗ ██████╗ ██████╗     ██████╗ ██████╗  ██████╗ ██████╗ ██╗   ██╗ ██████╗████████╗██╗ ██████╗ ███╗   ██╗"
    echo "██╔════╝██╔═══██╗██╔══██╗    ██╔══██╗██╔══██╗██╔═══██╗██╔══██╗██║   ██║██╔════╝╚══██╔══╝██║██╔═══██╗████╗  ██║"
    echo "█████╗  ██║   ██║██████╔╝    ██████╔╝██████╔╝██║   ██║██║  ██║██║   ██║██║        ██║   ██║██║   ██║██╔██╗ ██║"
    echo "██╔══╝  ██║   ██║██╔══██╗    ██╔═══╝ ██╔══██╗██║   ██║██║  ██║██║   ██║██║        ██║   ██║██║   ██║██║╚██╗██║"
    echo "██║     ╚██████╔╝██║  ██║    ██║     ██║  ██║╚██████╔╝██████╔╝╚██████╔╝╚██████╗   ██║   ██║╚██████╔╝██║ ╚████║"
    echo "╚═╝      ╚═════╝ ╚═╝  ╚═╝    ╚═╝     ╚═╝  ╚═╝ ╚═════╝ ╚═════╝  ╚═════╝  ╚═════╝   ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝"
    echo ""
    echo "██████╗  ██████╗ ██╗     ██╗      ██████╗ ██╗   ██╗████████╗"
    echo "██╔══██╗██╔═══██╗██║     ██║     ██╔═══██╗██║   ██║╚══██╔══╝"
    echo "██████╔╝██║   ██║██║     ██║     ██║   ██║██║   ██║   ██║   "
    echo "██╔══██╗██║   ██║██║     ██║     ██║   ██║██║   ██║   ██║   "
    echo "██║  ██║╚██████╔╝███████╗███████╗╚��█████╔╝╚██████╔╝   ██║   "
    echo "╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚══════╝ ╚═════╝  ╚═════╝    ╚═╝   "
    echo -e "${NC}"
    echo ""
    echo "🎉 ALL VALIDATION CHECKS PASSED!"
    echo "🚀 System is READY FOR PRODUCTION ROLLOUT!"
    echo ""
    echo "Next steps:"
    echo "1. Set AI_TRAFFIC=0.1 for 10% rollout"
    echo "2. Monitor SLA metrics for 1 hour"
    echo "3. Gradually increase to 50% then 100%"
    echo "4. Celebrate successful deployment! 🎊"
    
    exit 0
    
elif [[ $CRITICAL_FAILURES -eq 0 ]]; then
    echo -e "${YELLOW}⚠️ VALIDATION COMPLETED WITH WARNINGS${NC}"
    echo "Non-critical issues found but system may proceed"
    echo "Review warnings before production rollout"
    exit 0
    
else
    echo -e "${RED}❌ VALIDATION FAILED${NC}"
    echo "$CRITICAL_FAILURES critical issues must be resolved"
    echo "System is NOT ready for production rollout"
    echo ""
    echo "Failed checks:"
    for result in "${VALIDATION_RESULTS[@]}"; do
        if [[ "$result" == *"❌"* ]]; then
            echo "  $result"
        fi
    done
    exit 1
fi
