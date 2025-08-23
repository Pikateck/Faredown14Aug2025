/**
 * Bargain Performance Service
 * Implements caching and pre-warming for <300ms p95 response times
 */

// In-memory cache for critical bargain data
const performanceCache = new Map<
  string,
  {
    data: any;
    timestamp: number;
    ttl: number;
  }
>();

interface CacheItem {
  data: any;
  timestamp: number;
  ttl: number;
}

interface PerformanceMetrics {
  responseTime: number;
  cacheHit: boolean;
  endpoint: string;
  timestamp: number;
}

class BargainPerformanceService {
  private metrics: PerformanceMetrics[] = [];
  private readonly maxMetrics = 1000;
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes

  // Cache management
  set(key: string, data: any, ttl: number = this.defaultTTL): void {
    performanceCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get(key: string): any | null {
    const item = performanceCache.get(key);
    if (!item) return null;

    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      performanceCache.delete(key);
      return null;
    }

    return item.data;
  }

  // Pre-warm cache with top products
  async preWarmCache(): Promise<void> {
    try {
      console.log("🔥 Pre-warming bargain cache...");

      // Pre-warm top routes for flights
      const topRoutes = [
        "DEL-BOM",
        "BOM-DEL",
        "DEL-BLR",
        "BLR-DEL",
        "BOM-BLR",
        "BLR-BOM",
        "DEL-HYD",
        "HYD-DEL",
      ];

      // Pre-warm top cities for hotels
      const topCities = [
        "mumbai",
        "delhi",
        "bangalore",
        "hyderabad",
        "goa",
        "jaipur",
        "kolkata",
        "chennai",
      ];

      // Pre-fetch popular CPOs
      const promises = [
        ...topRoutes.map((route) => this.preWarmRoute(route)),
        ...topCities.map((city) => this.preWarmCity(city)),
        this.preWarmPolicies(),
        this.preWarmModels(),
      ];

      await Promise.allSettled(promises);
      console.log("✅ Cache pre-warming completed");
    } catch (error) {
      console.error("❌ Cache pre-warming failed:", error);
    }
  }

  private async preWarmRoute(route: string): Promise<void> {
    const cacheKey = `flight_rates_${route}`;
    if (this.get(cacheKey)) return; // Already cached

    try {
      // Simulate fetching flight rates
      const mockRates = {
        route,
        base_price: 5000 + Math.random() * 10000,
        available_classes: ["economy", "business"],
        last_updated: Date.now(),
      };

      this.set(cacheKey, mockRates, 5 * 60 * 1000); // 5 min TTL
    } catch (error) {
      console.warn(`Failed to pre-warm route ${route}:`, error);
    }
  }

  private async preWarmCity(city: string): Promise<void> {
    const cacheKey = `hotel_rates_${city}`;
    if (this.get(cacheKey)) return;

    try {
      const mockRates = {
        city,
        avg_price: 3000 + Math.random() * 7000,
        hotel_count: Math.floor(50 + Math.random() * 200),
        last_updated: Date.now(),
      };

      this.set(cacheKey, mockRates, 5 * 60 * 1000);
    } catch (error) {
      console.warn(`Failed to pre-warm city ${city}:`, error);
    }
  }

  private async preWarmPolicies(): Promise<void> {
    const cacheKey = "bargain_policies";
    if (this.get(cacheKey)) return;

    try {
      const mockPolicies = {
        default_markup: { min: 5, max: 25 },
        discount_limits: { max: 30 },
        seasonal_adjustments: {},
        last_updated: Date.now(),
      };

      this.set(cacheKey, mockPolicies, 0); // Never expire
    } catch (error) {
      console.warn("Failed to pre-warm policies:", error);
    }
  }

  private async preWarmModels(): Promise<void> {
    const cacheKey = "ai_models";
    if (this.get(cacheKey)) return;

    try {
      const mockModels = {
        propensity_model: { version: "1.0", features: 17 },
        pricing_model: { version: "2.1", accuracy: 0.87 },
        last_updated: Date.now(),
      };

      this.set(cacheKey, mockModels, 24 * 60 * 60 * 1000); // 24 hours
    } catch (error) {
      console.warn("Failed to pre-warm models:", error);
    }
  }

  // Performance monitoring
  recordMetric(
    endpoint: string,
    responseTime: number,
    cacheHit: boolean,
  ): void {
    this.metrics.push({
      endpoint,
      responseTime,
      cacheHit,
      timestamp: Date.now(),
    });

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  getPerformanceStats(): {
    p95ResponseTime: number;
    avgResponseTime: number;
    cacheHitRate: number;
    totalRequests: number;
  } {
    if (this.metrics.length === 0) {
      return {
        p95ResponseTime: 0,
        avgResponseTime: 0,
        cacheHitRate: 0,
        totalRequests: 0,
      };
    }

    const sortedTimes = this.metrics
      .map((m) => m.responseTime)
      .sort((a, b) => a - b);

    const p95Index = Math.floor(sortedTimes.length * 0.95);
    const p95ResponseTime = sortedTimes[p95Index] || 0;

    const avgResponseTime =
      sortedTimes.reduce((a, b) => a + b, 0) / sortedTimes.length;

    const cacheHits = this.metrics.filter((m) => m.cacheHit).length;
    const cacheHitRate = (cacheHits / this.metrics.length) * 100;

    return {
      p95ResponseTime,
      avgResponseTime,
      cacheHitRate,
      totalRequests: this.metrics.length,
    };
  }

  // Fallback strategy for Redis outage
  async handleRedisOutage(): Promise<void> {
    console.warn("🔴 Redis outage detected - enabling fallback mode");

    // Use localStorage as backup cache
    const fallbackPolicies = {
      markup: { min: 5, max: 20 },
      discount: { max: 25 },
      emergency: true,
    };

    localStorage.setItem(
      "bargain_fallback_policies",
      JSON.stringify(fallbackPolicies),
    );
    localStorage.setItem("fallback_mode_timestamp", Date.now().toString());
  }

  getFallbackData(key: string): any | null {
    try {
      const fallbackKey = `bargain_fallback_${key}`;
      const data = localStorage.getItem(fallbackKey);
      if (!data) return null;

      const parsed = JSON.parse(data);

      // Check if fallback data is too old (5 minutes)
      const timestamp = localStorage.getItem("fallback_mode_timestamp");
      if (timestamp && Date.now() - parseInt(timestamp) > 5 * 60 * 1000) {
        localStorage.removeItem(fallbackKey);
        return null;
      }

      return parsed;
    } catch (error) {
      console.error("Failed to get fallback data:", error);
      return null;
    }
  }

  // Clear old cache entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of performanceCache.entries()) {
      if (now - item.timestamp > item.ttl) {
        performanceCache.delete(key);
      }
    }
  }

  // Initialize performance monitoring
  init(): void {
    console.log("🚀 Initializing bargain performance service...");

    // Pre-warm cache
    this.preWarmCache();

    // Set up cleanup interval
    setInterval(() => this.cleanup(), 60 * 1000); // Every minute

    // Set up performance monitoring
    this.monitorNetworkHealth();
  }

  private monitorNetworkHealth(): void {
    // Monitor for network issues
    window.addEventListener("online", () => {
      console.log("🟢 Network online - resuming normal operation");
    });

    window.addEventListener("offline", () => {
      console.log("🔴 Network offline - enabling offline mode");
      this.handleRedisOutage();
    });
  }

  // Enhanced fetch with caching and performance tracking
  async enhancedFetch(url: string, options?: RequestInit): Promise<Response> {
    const startTime = performance.now();
    const cacheKey = `fetch_${url}_${JSON.stringify(options?.body || {})}`;

    // Check cache first
    const cached = this.get(cacheKey);
    if (cached && !options?.method?.toUpperCase()?.includes("POST")) {
      this.recordMetric(url, performance.now() - startTime, true);
      return new Response(JSON.stringify(cached), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      const responseTime = performance.now() - startTime;
      this.recordMetric(url, responseTime, false);

      // Cache successful GET responses
      if (response.ok && !options?.method?.toUpperCase()?.includes("POST")) {
        const data = await response.clone().json();
        this.set(cacheKey, data, this.defaultTTL);
      }

      return response;
    } catch (error) {
      const responseTime = performance.now() - startTime;
      this.recordMetric(url, responseTime, false);

      // Try fallback data
      const fallback = this.getFallbackData(cacheKey);
      if (fallback) {
        console.log("📦 Using fallback data for:", url);
        return new Response(JSON.stringify(fallback), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      throw error;
    }
  }
}

export const bargainPerformanceService = new BargainPerformanceService();
export default bargainPerformanceService;
