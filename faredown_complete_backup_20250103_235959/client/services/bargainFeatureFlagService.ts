/**
 * Feature Flag Service with Event Logging
 * Logs feature flags into bargain events for clean A/B analysis
 */

import { bargainSecurityService } from "./bargainSecurityService";

interface FeatureFlagEvent {
  session_id: string;
  flag_name: string;
  flag_value: boolean | number | string;
  user_id?: string;
  timestamp: number;
}

class BargainFeatureFlagService {
  private flagHistory: Map<string, FeatureFlagEvent[]> = new Map();
  private logBuffer: FeatureFlagEvent[] = [];

  // Core feature flags for AI bargaining platform
  private defaultFlags = {
    AI_SHADOW: false, // Log decisions but use control
    AI_TRAFFIC: 0.0, // Percentage of traffic to AI (0.0 to 1.0)
    AI_KILL_SWITCH: false, // Emergency disable
    PROMO_SUGGESTIONS: false, // Enable promo suggestions
    TIER_BONUSES: false, // Enable user tier bonuses
    ADVANCED_ANALYTICS: false, // Enable advanced tracking
    LOADING_SKELETON: true, // Show loading skeleton
    CAPSULE_VERIFICATION: true, // Verify signature capsules
    MULTI_SUPPLIER: false, // Enable multi-supplier arbitration
    ELASTIC_PRICING: false, // Enable elasticity-based pricing
  };

  // Get feature flag value with logging
  getFlag(
    flagName: keyof typeof this.defaultFlags,
    sessionId?: string,
    userId?: string,
  ): boolean | number {
    const value = bargainSecurityService.getFeatureFlag(flagName as any);
    const resolvedValue =
      value !== undefined ? value : this.defaultFlags[flagName];

    // Log flag access for A/B analysis
    if (sessionId) {
      this.logFlagEvent({
        session_id: sessionId,
        flag_name: flagName,
        flag_value: resolvedValue,
        user_id: userId,
        timestamp: Date.now(),
      });
    }

    return resolvedValue;
  }

  // Set feature flag with immediate effect
  setFlag(
    flagName: keyof typeof this.defaultFlags,
    value: boolean | number,
  ): void {
    bargainSecurityService.setFeatureFlag(flagName as any, value);

    // Log flag change for audit trail
    this.logFlagEvent({
      session_id: "system",
      flag_name: `${flagName}_CHANGE`,
      flag_value: value,
      user_id: "admin",
      timestamp: Date.now(),
    });

    console.log(`🚩 Feature flag ${flagName} set to ${value}`);
  }

  // Check if user should receive AI bargaining
  shouldReceiveAI(userId: string, sessionId?: string): boolean {
    const killSwitch = this.getFlag("AI_KILL_SWITCH", sessionId, userId);
    if (killSwitch) {
      return false;
    }

    const trafficPercent = this.getFlag(
      "AI_TRAFFIC",
      sessionId,
      userId,
    ) as number;
    const shadowMode = this.getFlag("AI_SHADOW", sessionId, userId);

    // In shadow mode, compute decision but don't serve AI
    if (shadowMode) {
      const wouldReceive = this.computeUserBucket(userId) < trafficPercent;
      this.logFlagEvent({
        session_id: sessionId || "unknown",
        flag_name: "AI_SHADOW_DECISION",
        flag_value: wouldReceive,
        user_id: userId,
        timestamp: Date.now(),
      });
      return false; // Don't serve AI in shadow mode
    }

    return this.computeUserBucket(userId) < trafficPercent;
  }

  // Get current rollout configuration
  getRolloutConfig(
    sessionId?: string,
    userId?: string,
  ): {
    phase: string;
    traffic_percent: number;
    shadow_mode: boolean;
    features_enabled: string[];
  } {
    const shadowMode = this.getFlag("AI_SHADOW", sessionId, userId) as boolean;
    const trafficPercent = this.getFlag(
      "AI_TRAFFIC",
      sessionId,
      userId,
    ) as number;

    // Determine rollout phase
    let phase = "disabled";
    if (shadowMode) {
      phase = "shadow";
    } else if (trafficPercent === 0) {
      phase = "disabled";
    } else if (trafficPercent <= 0.1) {
      phase = "canary_10";
    } else if (trafficPercent <= 0.5) {
      phase = "canary_50";
    } else if (trafficPercent < 1.0) {
      phase = "partial_rollout";
    } else {
      phase = "full_rollout";
    }

    // Determine enabled features based on phase
    const features_enabled = [];
    if (this.getFlag("PROMO_SUGGESTIONS", sessionId, userId)) {
      features_enabled.push("promo_suggestions");
    }
    if (this.getFlag("TIER_BONUSES", sessionId, userId)) {
      features_enabled.push("tier_bonuses");
    }
    if (this.getFlag("MULTI_SUPPLIER", sessionId, userId)) {
      features_enabled.push("multi_supplier");
    }
    if (this.getFlag("ELASTIC_PRICING", sessionId, userId)) {
      features_enabled.push("elastic_pricing");
    }

    return {
      phase,
      traffic_percent: trafficPercent * 100,
      shadow_mode: shadowMode,
      features_enabled,
    };
  }

  // Log feature flag event for A/B analysis
  private logFlagEvent(event: FeatureFlagEvent): void {
    // Add to memory buffer
    this.logBuffer.push(event);

    // Add to session history
    const sessionHistory = this.flagHistory.get(event.session_id) || [];
    sessionHistory.push(event);
    this.flagHistory.set(event.session_id, sessionHistory);

    // Batch send to analytics when buffer is full
    if (this.logBuffer.length >= 50) {
      this.flushLogBuffer();
    }
  }

  // Send flag events to analytics/logging endpoint
  private async flushLogBuffer(): Promise<void> {
    if (this.logBuffer.length === 0) return;

    const events = [...this.logBuffer];
    this.logBuffer = [];

    try {
      // Send to analytics endpoint
      await fetch("/api/bargain/v1/event/log", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event_type: "feature_flags",
          events: events,
          batch_id: `flags_${Date.now()}`,
        }),
      });

      console.log(`📊 Logged ${events.length} feature flag events`);
    } catch (error) {
      console.error("Failed to log feature flag events:", error);
      // Re-add events to buffer for retry
      this.logBuffer.unshift(...events);
    }
  }

  // Compute consistent user bucket (0.0 to 1.0)
  private computeUserBucket(userId: string): number {
    // Simple hash function for consistent bucketing
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    // Convert to 0.0 to 1.0 range
    return Math.abs(hash) / 2147483647;
  }

  // Get flag summary for admin dashboard
  getFlagSummary(): {
    flags: Record<string, boolean | number>;
    rollout_status: string;
    active_experiments: string[];
    total_events_logged: number;
  } {
    const flags: Record<string, boolean | number> = {};
    for (const flagName of Object.keys(this.defaultFlags)) {
      flags[flagName] = this.getFlag(
        flagName as keyof typeof this.defaultFlags,
      );
    }

    const config = this.getRolloutConfig();
    const totalEvents = Array.from(this.flagHistory.values()).reduce(
      (sum, events) => sum + events.length,
      0,
    );

    return {
      flags,
      rollout_status: config.phase,
      active_experiments: config.features_enabled,
      total_events_logged: totalEvents,
    };
  }

  // Emergency rollback
  emergencyRollback(reason: string): void {
    console.log(`🚨 EMERGENCY ROLLBACK: ${reason}`);

    this.setFlag("AI_KILL_SWITCH", true);
    this.setFlag("AI_TRAFFIC", 0);
    this.setFlag("AI_SHADOW", false);

    // Log rollback event
    this.logFlagEvent({
      session_id: "system",
      flag_name: "EMERGENCY_ROLLBACK",
      flag_value: reason,
      user_id: "system",
      timestamp: Date.now(),
    });

    // Immediate flush
    this.flushLogBuffer();
  }

  // Gradual rollout helper
  async graduallRollout(
    targetPercent: number,
    intervalMinutes: number = 30,
  ): Promise<void> {
    const currentPercent = this.getFlag("AI_TRAFFIC") as number;
    const steps = 5; // 5 steps to reach target
    const increment = (targetPercent - currentPercent) / steps;

    console.log(
      `📈 Starting gradual rollout from ${currentPercent}% to ${targetPercent}%`,
    );

    for (let i = 1; i <= steps; i++) {
      const newPercent = currentPercent + increment * i;

      setTimeout(
        () => {
          this.setFlag("AI_TRAFFIC", Math.min(1.0, Math.max(0, newPercent)));
          console.log(
            `📊 Rollout step ${i}/${steps}: ${newPercent.toFixed(1)}%`,
          );
        },
        intervalMinutes * 60 * 1000 * i,
      );
    }
  }

  // Initialize service
  init(): void {
    console.log("🚩 Initializing feature flag service...");

    // Flush log buffer every 5 minutes
    setInterval(
      () => {
        this.flushLogBuffer();
      },
      5 * 60 * 1000,
    );

    // Load persisted flags
    for (const flagName of Object.keys(this.defaultFlags)) {
      const stored = localStorage.getItem(`feature_flag_${flagName}`);
      if (stored !== null) {
        const value =
          stored === "true"
            ? true
            : stored === "false"
              ? false
              : parseFloat(stored);
        this.setFlag(flagName as keyof typeof this.defaultFlags, value as any);
      }
    }

    console.log("✅ Feature flag service initialized");
    console.log("Current configuration:", this.getFlagSummary());
  }
}

export const bargainFeatureFlagService = new BargainFeatureFlagService();
export default bargainFeatureFlagService;
