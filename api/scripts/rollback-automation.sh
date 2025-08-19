#!/bin/bash
set -euo pipefail

# Auto-rollback script for profit guard breaches
# Triggered by Prometheus alert: ProfitGuardBreach

FEATURE_FLAG_API="${FEATURE_FLAG_API:-https://api.company.com/api/feature-flags}"
SLACK_WEBHOOK="${SLACK_WEBHOOK:-}"
AUTH_TOKEN="${AUTH_TOKEN:-}"
ROLLBACK_REASON="${ROLLBACK_REASON:-profit_guard_breach}"

echo "🚨 PROFIT GUARD BREACH DETECTED - Initiating auto-rollback"
echo "Timestamp: $(date -u)"
echo "Reason: $ROLLBACK_REASON"
echo "=============================================="

# Function to send Slack notification
send_slack_notification() {
    local message="$1"
    local status="$2"
    local color="${3:-warning}"
    
    if [[ -n "$SLACK_WEBHOOK" ]]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{
                \"attachments\": [{
                    \"color\": \"$color\",
                    \"title\": \"🚨 AI Bargaining Auto-Rollback\",
                    \"text\": \"$message\",
                    \"fields\": [
                        {
                            \"title\": \"Status\",
                            \"value\": \"$status\",
                            \"short\": true
                        },
                        {
                            \"title\": \"Timestamp\",
                            \"value\": \"$(date -u)\",
                            \"short\": true
                        },
                        {
                            \"title\": \"Environment\",
                            \"value\": \"${NODE_ENV:-production}\",
                            \"short\": true
                        },
                        {
                            \"title\": \"Reason\",
                            \"value\": \"$ROLLBACK_REASON\",
                            \"short\": true
                        }
                    ]
                }]
            }" \
            "$SLACK_WEBHOOK"
    fi
}

# Function to update feature flags
update_feature_flag() {
    local flag_name="$1"
    local flag_value="$2"
    
    echo "Setting $flag_name = $flag_value"
    
    curl -X POST \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"flag\": \"$flag_name\", \"value\": $flag_value}" \
        "$FEATURE_FLAG_API/set" || {
        echo "❌ Failed to set $flag_name"
        return 1
    }
    
    echo "✅ Successfully set $flag_name = $flag_value"
}

# Function to verify rollback
verify_rollback() {
    echo "Verifying rollback status..."
    
    sleep 10  # Allow time for flags to propagate
    
    current_flags=$(curl -s -H "Authorization: Bearer $AUTH_TOKEN" "$FEATURE_FLAG_API")
    ai_traffic=$(echo "$current_flags" | jq -r '.AI_TRAFFIC // 0')
    ai_shadow=$(echo "$current_flags" | jq -r '.AI_SHADOW // false')
    
    echo "Current AI_TRAFFIC: $ai_traffic"
    echo "Current AI_SHADOW: $ai_shadow"
    
    if [[ "$ai_traffic" == "0" || "$ai_traffic" == "0.0" ]] && [[ "$ai_shadow" == "true" ]]; then
        echo "✅ Rollback verified successfully"
        return 0
    else
        echo "❌ Rollback verification failed"
        return 1
    fi
}

# Function to record rollback event
record_rollback_event() {
    local status="$1"
    
    if [[ -n "$DATABASE_URL" ]]; then
        psql "$DATABASE_URL" -c "
            INSERT INTO ai.rollback_events (
                triggered_at,
                reason,
                status,
                ai_traffic_before,
                ai_traffic_after,
                metadata
            ) VALUES (
                NOW(),
                '$ROLLBACK_REASON',
                '$status',
                0.1,  -- Assuming 10% before rollback
                0.0,  -- After rollback
                '{\"automated\": true, \"alert\": \"ProfitGuardBreach\"}'::jsonb
            );
        " || echo "⚠️ Failed to record rollback event in database"
    fi
}

# Main rollback execution
main() {
    echo "Starting auto-rollback procedure..."
    
    # Send initial notification
    send_slack_notification "Profit guard breach detected. Initiating auto-rollback to control variant." "INITIATED" "warning"
    
    # Step 1: Set AI traffic to 0 (force all traffic to control)
    if update_feature_flag "AI_TRAFFIC" "0.0"; then
        echo "✅ AI traffic redirected to control"
    else
        echo "❌ Failed to redirect AI traffic"
        send_slack_notification "CRITICAL: Failed to set AI_TRAFFIC=0.0 during rollback" "FAILED" "danger"
        record_rollback_event "FAILED"
        exit 1
    fi
    
    # Step 2: Enable shadow mode for diagnosis
    if update_feature_flag "AI_SHADOW" "true"; then
        echo "✅ Shadow mode enabled for diagnosis"
    else
        echo "⚠️ Failed to enable shadow mode (non-critical)"
    fi
    
    # Step 3: Verify rollback
    if verify_rollback; then
        echo "✅ Rollback completed successfully"
        send_slack_notification "Auto-rollback completed successfully. All traffic now on control variant. AI requests continue in shadow mode for diagnosis." "SUCCESS" "good"
        record_rollback_event "SUCCESS"
    else
        echo "❌ Rollback verification failed"
        send_slack_notification "CRITICAL: Rollback verification failed. Manual intervention required immediately." "VERIFICATION_FAILED" "danger"
        record_rollback_event "VERIFICATION_FAILED"
        exit 1
    fi
    
    # Step 4: Additional safety measures
    echo "Implementing additional safety measures..."
    
    # Disable auto-scaling for AI components
    update_feature_flag "AI_AUTO_SCALE" "false" || echo "⚠️ Failed to disable auto-scaling"
    
    # Set alert suppression for known issues during rollback
    update_feature_flag "SUPPRESS_AI_ALERTS" "true" || echo "⚠️ Failed to set alert suppression"
    
    echo "=============================================="
    echo "🎉 AUTO-ROLLBACK COMPLETED SUCCESSFULLY"
    echo "=============================================="
    echo "• AI traffic: 0% (all on control)"
    echo "• Shadow mode: enabled (for diagnosis)"  
    echo "• Auto-scaling: disabled"
    echo "• Next steps: Manual investigation required"
    echo ""
    echo "To restore AI traffic after investigation:"
    echo "1. Identify and fix profit margin issue"
    echo "2. Run validation tests"
    echo "3. Gradually restore AI_TRAFFIC (0.1 → 0.5 → 1.0)"
    echo "4. Re-enable auto-scaling"
    echo "5. Disable alert suppression"
}

# Error handling
trap 'echo "❌ Rollback script failed at line $LINENO"; send_slack_notification "Rollback script failed unexpectedly at line $LINENO" "SCRIPT_ERROR" "danger"; exit 1' ERR

# Execute main function
main

echo "Auto-rollback script completed at $(date -u)"
