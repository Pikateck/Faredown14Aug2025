/**
 * Bargain App Initialization
 * Sets up performance monitoring, cache warming, and feature flags
 */

import { bargainPerformanceService } from "@/services/bargainPerformanceService";
import { bargainSecurityService } from "@/services/bargainSecurityService";

let isInitialized = false;

export async function initializeBargainPlatform(): Promise<void> {
  if (isInitialized) {
    console.log("🔄 Bargain platform already initialized");
    return;
  }

  try {
    console.log("🚀 Initializing AI Bargaining Platform...");

    // Initialize services in parallel
    await Promise.all([
      initializePerformanceService(),
      initializeSecurityService(),
      loadUserPreferences(),
      setupErrorTracking(),
    ]);

    isInitialized = true;
    console.log("✅ AI Bargaining Platform initialized successfully");

    // Log initialization metrics
    const perfStats = bargainPerformanceService.getPerformanceStats();
    const securityStats = bargainSecurityService.getSecurityMetrics();

    console.log("📊 Platform metrics:", {
      cacheHitRate: perfStats.cacheHitRate,
      totalRequests: perfStats.totalRequests,
      securityBlocks: securityStats.blockedRequests,
      aiEnabled: bargainSecurityService.isAIBargainingEnabled(),
    });
  } catch (error) {
    console.error("❌ Failed to initialize bargain platform:", error);
    // Don't throw - allow app to continue with degraded functionality
  }
}

async function initializePerformanceService(): Promise<void> {
  try {
    bargainPerformanceService.init();
    console.log("🚀 Performance service initialized");
  } catch (error) {
    console.error("❌ Performance service initialization failed:", error);
  }
}

async function initializeSecurityService(): Promise<void> {
  try {
    bargainSecurityService.init();
    console.log("🔒 Security service initialized");
  } catch (error) {
    console.error("❌ Security service initialization failed:", error);
  }
}

async function loadUserPreferences(): Promise<void> {
  try {
    // Load any user-specific bargain preferences
    const preferences = localStorage.getItem("bargain_preferences");
    if (preferences) {
      const parsed = JSON.parse(preferences);
      console.log("👤 User preferences loaded:", Object.keys(parsed));
    }
  } catch (error) {
    console.warn("⚠️ Failed to load user preferences:", error);
  }
}

async function setupErrorTracking(): Promise<void> {
  try {
    // Set up error boundaries and tracking for bargain-specific errors
    window.addEventListener("unhandledrejection", (event) => {
      if (
        event.reason?.message?.includes("bargain") ||
        event.reason?.message?.includes("AI")
      ) {
        console.error("🔥 Unhandled bargain error:", event.reason);
        // Could integrate with error tracking service here
      }
    });

    console.log("📡 Error tracking initialized");
  } catch (error) {
    console.warn("⚠️ Failed to setup error tracking:", error);
  }
}

// Health check function
export function getBargainPlatformHealth(): {
  initialized: boolean;
  performance: any;
  security: any;
  errors: string[];
} {
  const errors: string[] = [];

  try {
    const performance = bargainPerformanceService.getPerformanceStats();
    const security = bargainSecurityService.getSecurityMetrics();

    // Check for issues
    if (performance.p95ResponseTime > 300) {
      errors.push("Response time above 300ms threshold");
    }

    if (performance.cacheHitRate < 70) {
      errors.push("Cache hit rate below 70%");
    }

    if (security.blockedRequests > security.totalRequests * 0.1) {
      errors.push("High rate limiting activity");
    }

    return {
      initialized: isInitialized,
      performance,
      security,
      errors,
    };
  } catch (error) {
    errors.push(`Health check failed: ${error}`);
    return {
      initialized: false,
      performance: null,
      security: null,
      errors,
    };
  }
}

// Utility to check if bargaining should be available
export function isBargainingAvailable(): boolean {
  if (!isInitialized) {
    console.warn("⚠️ Bargain platform not initialized");
    return false;
  }

  return bargainSecurityService.isAIBargainingEnabled();
}

// Reset function for development/testing
export function resetBargainPlatform(): void {
  isInitialized = false;
  localStorage.removeItem("bargain_preferences");
  console.log("🔄 Bargain platform reset");
}

export default {
  initializeBargainPlatform,
  getBargainPlatformHealth,
  isBargainingAvailable,
  resetBargainPlatform,
};
