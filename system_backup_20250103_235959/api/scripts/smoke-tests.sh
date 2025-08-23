#!/bin/bash
set -euo pipefail

# Smoke Tests for AI Bargaining Platform - Production Gate
# Must complete in under 15 minutes with all tests passing

API_URL="${API_URL:-https://api.company.com}"
AUTH_TOKEN="${AUTH_TOKEN:-test-token-123}"
TIMEOUT=30
POSTGRES_URI="${DATABASE_URL:-postgresql://user:pass@localhost:5432/faredown}"

echo "🔥 Starting Smoke Tests - $(date)"
echo "API URL: $API_URL"
echo "Timeout per test: ${TIMEOUT}s"
echo "====================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

test_counter=0
pass_counter=0
fail_counter=0

function run_test() {
    local test_name="$1"
    local test_command="$2"
    ((test_counter++))
    
    echo -e "\n${YELLOW}Test $test_counter: $test_name${NC}"
    
    if timeout $TIMEOUT bash -c "$test_command"; then
        echo -e "${GREEN}✅ PASS: $test_name${NC}"
        ((pass_counter++))
        return 0
    else
        echo -e "${RED}❌ FAIL: $test_name${NC}"
        ((fail_counter++))
        return 1
    fi
}

function check_response_time() {
    local url="$1"
    local method="${2:-GET}"
    local data="${3:-}"
    local max_time="${4:-0.3}"
    
    if [ -n "$data" ]; then
        time_total=$(curl -s -w '%{time_total}' -o /dev/null \
            -X "$method" \
            -H "Authorization: Bearer $AUTH_TOKEN" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$url")
    else
        time_total=$(curl -s -w '%{time_total}' -o /dev/null \
            -H "Authorization: Bearer $AUTH_TOKEN" \
            "$url")
    fi
    
    if (( $(echo "$time_total < $max_time" | bc -l) )); then
        echo "Response time: ${time_total}s (< ${max_time}s) ✅"
        return 0
    else
        echo "Response time: ${time_total}s (> ${max_time}s) ❌"
        return 1
    fi
}

# Test 1: API Health Check
run_test "API Health Check" '
    response=$(curl -s -H "Authorization: Bearer $AUTH_TOKEN" "$API_URL/api/health")
    echo "Health response: $response"
    echo "$response" | jq -e ".status == \"healthy\""
'

# Test 2: Metrics Endpoint
run_test "Metrics Endpoint Available" '
    curl -s -f "$API_URL/metrics" | grep -q "bargain_response_seconds"
'

# Test 3: Database Connectivity
run_test "Database Connectivity" '
    psql "$POSTGRES_URI" -c "SELECT 1;" > /dev/null
'

# Test 4: Redis Connectivity  
run_test "Redis Connectivity" '
    response=$(curl -s -H "Authorization: Bearer $AUTH_TOKEN" "$API_URL/api/cache/health")
    echo "$response" | jq -e ".redis_connected == true"
'

# Test 5: Session Start Latency
run_test "Session Start < 300ms" '
    session_data="{\"user\":{\"id\":\"smoke-u1\",\"tier\":\"GOLD\"},\"productCPO\":{\"type\":\"hotel\",\"canonical_key\":\"HT:12345:DLX:BRD-BB:CXL-FLEX\",\"displayed_price\":142,\"currency\":\"USD\"}}"
    check_response_time "$API_URL/api/bargain/v1/session/start" "POST" "$session_data" "0.3"
'

# Test 6: Full Bargain Flow
run_test "Complete Bargain Flow" '
    # Start session
    session_data="{\"user\":{\"id\":\"smoke-u2\",\"tier\":\"GOLD\"},\"productCPO\":{\"type\":\"hotel\",\"canonical_key\":\"HT:12345:DLX:BRD-BB:CXL-FLEX\",\"displayed_price\":142,\"currency\":\"USD\"}}"
    session_response=$(curl -s -w "\n%{time_total}s\n" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -H "Content-Type: application/json" \
        -d "$session_data" \
        "$API_URL/api/bargain/v1/session/start")
    
    session_id=$(echo "$session_response" | head -1 | jq -r ".session_id")
    session_time=$(echo "$session_response" | tail -1)
    
    echo "Session ID: $session_id"
    echo "Session time: $session_time"
    
    # Make offer
    offer_data="{\"session_id\":\"$session_id\",\"user_offer\":135.00}"
    offer_response=$(curl -s -w "\n%{time_total}s\n" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -H "Content-Type: application/json" \
        -d "$offer_data" \
        "$API_URL/api/bargain/v1/session/offer")
    
    counter_price=$(echo "$offer_response" | head -1 | jq -r ".counter_price")
    offer_time=$(echo "$offer_response" | tail -1)
    
    echo "Counter price: $counter_price"
    echo "Offer time: $offer_time"
    
    # Verify valid response
    if [[ "$counter_price" != "null" && "$counter_price" != "" ]]; then
        echo "✅ Full flow completed successfully"
    else
        echo "❌ Invalid counter price response"
        exit 1
    fi
'

# Test 7: Never-Loss Floor Check
run_test "Never-Loss Floor Audit (must = 0)" '
    violations=$(psql "$POSTGRES_URI" -tAc "
        SELECT COUNT(*) AS below_floor
        FROM ai.bargain_events e
        JOIN LATERAL (
            SELECT MAX(counter_price) AS final_price
            FROM ai.bargain_events e2
            WHERE e2.session_id = e.session_id
        ) f ON TRUE
        WHERE e.accepted IS TRUE AND f.final_price < e.true_cost_usd;
    ")
    
    echo "Floor violations found: $violations"
    
    if [[ "$violations" == "0" ]]; then
        echo "✅ No never-loss violations detected"
    else
        echo "❌ $violations never-loss violations found!"
        exit 1
    fi
'

# Test 8: Database Schema Validation
run_test "Database Schema Validation" '
    # Check required tables exist
    tables=$(psql "$POSTGRES_URI" -tAc "
        SELECT COUNT(*) FROM information_schema.tables 
        WHERE table_schema = \"ai\" 
        AND table_name IN (\"bargain_sessions\", \"bargain_events\", \"supplier_rates\", \"policies\", \"offerability_cache\");
    ")
    
    if [[ "$tables" == "5" ]]; then
        echo "✅ All required tables present"
    else
        echo "❌ Missing required tables (found: $tables/5)"
        exit 1
    fi
    
    # Check materialized views
    mvs=$(psql "$POSTGRES_URI" -tAc "
        SELECT COUNT(*) FROM pg_matviews WHERE schemaname = \"ai\";
    ")
    
    if [[ "$mvs" -ge "3" ]]; then
        echo "✅ Materialized views present ($mvs found)"
    else
        echo "❌ Missing materialized views (found: $mvs)"
        exit 1
    fi
'

# Test 9: Supplier Fabric Worker Health
run_test "Supplier Fabric Worker Health" '
    # Check if recent rate snapshots exist
    recent_rates=$(psql "$POSTGRES_URI" -tAc "
        SELECT COUNT(*) FROM ai.supplier_rates 
        WHERE updated_at > NOW() - INTERVAL \"10 minutes\";
    ")
    
    if [[ "$recent_rates" -gt "0" ]]; then
        echo "✅ Supplier fabric worker active ($recent_rates recent rates)"
    else
        echo "❌ No recent rate snapshots from supplier worker"
        exit 1
    fi
'

# Test 10: Cache Performance Check
run_test "Cache Performance Check" '
    cache_stats=$(curl -s -H "Authorization: Bearer $AUTH_TOKEN" "$API_URL/api/cache/stats")
    hit_rate=$(echo "$cache_stats" | jq -r ".hit_rate // 0")
    
    echo "Cache hit rate: $hit_rate"
    
    if (( $(echo "$hit_rate >= 0.85" | bc -l) )); then
        echo "✅ Cache performance acceptable (${hit_rate})"
    else
        echo "❌ Cache hit rate too low (${hit_rate} < 0.85)"
        exit 1
    fi
'

# Test 11: Model Registry Check
run_test "Model Registry Validation" '
    models=$(psql "$POSTGRES_URI" -tAc "
        SELECT COUNT(*) FROM ai.model_registry 
        WHERE is_active = true AND model_type IN (\"pricing\", \"offerability\");
    ")
    
    if [[ "$models" -ge "2" ]]; then
        echo "✅ Active models registered ($models found)"
    else
        echo "❌ Missing active models (found: $models)"
        exit 1
    fi
'

# Test 12: Feature Flag System
run_test "Feature Flag System" '
    flags=$(curl -s -H "Authorization: Bearer $AUTH_TOKEN" "$API_URL/api/feature-flags")
    ai_traffic=$(echo "$flags" | jq -r ".AI_TRAFFIC // 0")
    
    echo "AI_TRAFFIC flag: $ai_traffic"
    
    if [[ "$ai_traffic" != "null" ]]; then
        echo "✅ Feature flag system responding"
    else
        echo "❌ Feature flag system not responding"
        exit 1
    fi
'

# Summary
echo ""
echo "====================================="
echo "🔥 SMOKE TEST SUMMARY"
echo "====================================="
echo "Total Tests: $test_counter"
echo "Passed: $pass_counter"
echo "Failed: $fail_counter"

if [[ $fail_counter -eq 0 ]]; then
    echo -e "\n${GREEN}🎉 ALL SMOKE TESTS PASSED! ✅${NC}"
    echo -e "${GREEN}System ready for production traffic.${NC}"
    exit 0
else
    echo -e "\n${RED}💥 $fail_counter TESTS FAILED! ❌${NC}"
    echo -e "${RED}System NOT ready for production.${NC}"
    exit 1
fi
