/**
 * Bargain Security Service
 * Implements rate limiting, error handling, and security guardrails
 */

interface RateLimit {
  count: number;
  resetTime: number;
  blocked: boolean;
}

interface SecurityMetrics {
  totalRequests: number;
  blockedRequests: number;
  errors: number;
  lastError?: string;
}

class BargainSecurityService {
  private rateLimits = new Map<string, RateLimit>();
  private metrics: SecurityMetrics = {
    totalRequests: 0,
    blockedRequests: 0,
    errors: 0,
  };

  // Rate limiting config
  private readonly limits = {
    perIP: { requests: 30, window: 60 * 1000 }, // 30 requests per minute per IP
    perSession: { requests: 10, window: 60 * 1000 }, // 10 session starts per minute
    perUser: { requests: 50, window: 60 * 1000 }, // 50 requests per minute per user
  };

  // Get client IP (simplified for frontend)
  private getClientIP(): string {
    // In a real implementation, this would come from server headers
    return (
      "client_" + (localStorage.getItem("client_id") || this.generateClientId())
    );
  }

  private generateClientId(): string {
    const id = Math.random().toString(36).substring(2, 15);
    localStorage.setItem("client_id", id);
    return id;
  }

  // Check rate limit
  checkRateLimit(
    type: "perIP" | "perSession" | "perUser",
    identifier?: string,
  ): boolean {
    const key = identifier || this.getClientIP();
    const limitKey = `${type}_${key}`;
    const limit = this.limits[type];
    const now = Date.now();

    let rateLimit = this.rateLimits.get(limitKey);

    if (!rateLimit || now > rateLimit.resetTime) {
      // Reset or create new rate limit
      rateLimit = {
        count: 0,
        resetTime: now + limit.window,
        blocked: false,
      };
    }

    rateLimit.count++;
    this.rateLimits.set(limitKey, rateLimit);

    if (rateLimit.count > limit.requests) {
      rateLimit.blocked = true;
      this.metrics.blockedRequests++;
      return false;
    }

    this.metrics.totalRequests++;
    return true;
  }

  // Security headers for requests
  getSecurityHeaders(): Record<string, string> {
    return {
      "X-Client-Version": "1.0.0",
      "X-Request-ID": this.generateRequestId(),
      "X-Client-Time": Date.now().toString(),
      "X-Rate-Limit-Check": "true",
    };
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  // Sanitize user inputs
  sanitizeInput(input: any): any {
    if (typeof input === "string") {
      // Remove potentially dangerous characters
      return input
        .replace(/[<>]/g, "")
        .replace(/javascript:/gi, "")
        .replace(/data:/gi, "")
        .trim()
        .substring(0, 1000); // Max length
    }

    if (typeof input === "number") {
      // Ensure reasonable bounds
      return Math.max(0, Math.min(1000000, input));
    }

    if (typeof input === "object" && input !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(input)) {
        if (typeof key === "string" && key.length < 100) {
          sanitized[key] = this.sanitizeInput(value);
        }
      }
      return sanitized;
    }

    return input;
  }

  // Validate bargain request
  validateBargainRequest(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required fields
    if (!data.productCPO || typeof data.productCPO !== "object") {
      errors.push("Invalid product data");
    }

    if (!data.user || typeof data.user !== "object") {
      errors.push("Invalid user data");
    }

    // Check user offer bounds
    if (data.user_offer !== undefined) {
      const offer = Number(data.user_offer);
      if (isNaN(offer) || offer < 0 || offer > 1000000) {
        errors.push("Invalid offer amount");
      }
    }

    // Check session ID format
    if (data.session_id && !/^[a-zA-Z0-9_-]+$/.test(data.session_id)) {
      errors.push("Invalid session ID format");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Handle different error types
  handleError(
    error: any,
    context: string,
  ): {
    userMessage: string;
    shouldRetry: boolean;
    retryDelay?: number;
  } {
    this.metrics.errors++;
    this.metrics.lastError = error.message || error.toString();

    console.error(`🔒 Security service error in ${context}:`, error);

    // Rate limit exceeded
    if (error.status === 429 || error.message?.includes("rate limit")) {
      return {
        userMessage: "Too many requests. Please wait a moment and try again.",
        shouldRetry: true,
        retryDelay: 60000, // 1 minute
      };
    }

    // Server errors
    if (error.status >= 500) {
      return {
        userMessage: "Service temporarily unavailable. Please try again.",
        shouldRetry: true,
        retryDelay: 5000, // 5 seconds
      };
    }

    // Client errors
    if (error.status >= 400 && error.status < 500) {
      return {
        userMessage:
          error.message || "Invalid request. Please check your input.",
        shouldRetry: false,
      };
    }

    // Network errors
    if (error.name === "NetworkError" || error.message?.includes("fetch")) {
      return {
        userMessage:
          "Connection failed. Please check your internet connection.",
        shouldRetry: true,
        retryDelay: 3000, // 3 seconds
      };
    }

    // Generic error
    return {
      userMessage: "Something went wrong. Please try again.",
      shouldRetry: true,
      retryDelay: 3000,
    };
  }

  // Obfuscate session IDs for logging
  obfuscateSessionId(sessionId: string): string {
    if (!sessionId || sessionId.length < 8) return "[REDACTED]";
    return (
      sessionId.substring(0, 4) +
      "***" +
      sessionId.substring(sessionId.length - 4)
    );
  }

  // PII minimization
  sanitizeForLogging(data: any): any {
    if (!data || typeof data !== "object") return data;

    const sanitized = { ...data };

    // Remove or obfuscate sensitive fields
    const sensitiveFields = [
      "email",
      "phone",
      "credit_card",
      "password",
      "token",
      "user_agent",
      "ip_address",
      "device_id",
    ];

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = "[REDACTED]";
      }
    }

    // Obfuscate session IDs
    if (sanitized.session_id) {
      sanitized.session_id = this.obfuscateSessionId(sanitized.session_id);
    }

    return sanitized;
  }

  // Feature flags
  private featureFlags = {
    AI_SHADOW: true,
    AI_TRAFFIC: 1.0,
    AI_KILL_SWITCH: false,
  };

  getFeatureFlag(flag: keyof typeof this.featureFlags): boolean | number {
    return this.featureFlags[flag];
  }

  setFeatureFlag(
    flag: keyof typeof this.featureFlags,
    value: boolean | number,
  ): void {
    this.featureFlags[flag] = value;
    localStorage.setItem(`feature_flag_${flag}`, value.toString());
  }

  // Load feature flags from storage
  loadFeatureFlags(): void {
    for (const flag in this.featureFlags) {
      const stored = localStorage.getItem(`feature_flag_${flag}`);
      if (stored !== null) {
        const value =
          stored === "true"
            ? true
            : stored === "false"
              ? false
              : parseFloat(stored);
        this.featureFlags[flag as keyof typeof this.featureFlags] =
          value as never;
      }
    }
  }

  // Check if AI bargaining is enabled
  isAIBargainingEnabled(): boolean {
    if (this.getFeatureFlag("AI_KILL_SWITCH")) {
      return false;
    }

    const trafficPercentage = this.getFeatureFlag("AI_TRAFFIC") as number;
    const userId = localStorage.getItem("user_id") || this.generateClientId();
    const hash = this.simpleHash(userId);

    return hash % 100 < trafficPercentage * 100;
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Get security metrics
  getSecurityMetrics(): SecurityMetrics & {
    rateLimitStatus: Array<{ key: string; count: number; remaining: number }>;
  } {
    const rateLimitStatus = Array.from(this.rateLimits.entries()).map(
      ([key, limit]) => ({
        key,
        count: limit.count,
        remaining: Math.max(0, this.limits.perIP.requests - limit.count),
      }),
    );

    return {
      ...this.metrics,
      rateLimitStatus,
    };
  }

  // Initialize security service
  init(): void {
    console.log("🔒 Initializing bargain security service...");

    // Load feature flags
    this.loadFeatureFlags();

    // Clean up old rate limits every minute
    setInterval(() => {
      const now = Date.now();
      for (const [key, limit] of this.rateLimits.entries()) {
        if (now > limit.resetTime) {
          this.rateLimits.delete(key);
        }
      }
    }, 60 * 1000);

    console.log("✅ Security service initialized");
  }
}

export const bargainSecurityService = new BargainSecurityService();
export default bargainSecurityService;
