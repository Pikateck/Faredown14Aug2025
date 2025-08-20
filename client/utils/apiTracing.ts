/**
 * API Request Tracing and Performance Monitoring
 */

interface RequestTrace {
  id: string;
  method: string;
  url: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status?: number;
  error?: Error;
  cacheHit?: boolean;
  size?: number;
}

interface PerformanceMetrics {
  averageResponseTime: number;
  totalRequests: number;
  errorRate: number;
  cacheHitRate: number;
  slowQueries: RequestTrace[];
}

class APITracer {
  private traces: Map<string, RequestTrace> = new Map();
  private completedTraces: RequestTrace[] = [];
  private maxTraces = 1000; // Keep last 1000 requests
  private slowQueryThreshold = 2000; // 2 seconds

  /**
   * Start tracing a request
   */
  startTrace(method: string, url: string): string {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const trace: RequestTrace = {
      id,
      method: method.toUpperCase(),
      url,
      startTime: performance.now(),
    };

    this.traces.set(id, trace);
    
    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 API Request: ${method} ${url} [${id}]`);
    }

    return id;
  }

  /**
   * End tracing a request
   */
  endTrace(
    id: string,
    status: number,
    error?: Error,
    responseSize?: number,
    cacheHit: boolean = false
  ): void {
    const trace = this.traces.get(id);
    if (!trace) return;

    const endTime = performance.now();
    const duration = endTime - trace.startTime;

    const completedTrace: RequestTrace = {
      ...trace,
      endTime,
      duration,
      status,
      error,
      size: responseSize,
      cacheHit,
    };

    this.traces.delete(id);
    this.completedTraces.push(completedTrace);

    // Keep only recent traces
    if (this.completedTraces.length > this.maxTraces) {
      this.completedTraces = this.completedTraces.slice(-this.maxTraces);
    }

    // Log performance in development
    if (process.env.NODE_ENV === 'development') {
      const statusEmoji = status >= 200 && status < 300 ? '✅' : '❌';
      const cacheEmoji = cacheHit ? '💾' : '';
      console.log(
        `${statusEmoji} API Response: ${trace.method} ${trace.url} [${id}] - ${duration.toFixed(1)}ms ${cacheEmoji}`
      );

      // Warn about slow requests
      if (duration > this.slowQueryThreshold) {
        console.warn(`🐌 Slow API request detected: ${duration.toFixed(1)}ms - ${trace.method} ${trace.url}`);
      }
    }

    // In production, send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoring(completedTrace);
    }
  }

  /**
   * Get performance metrics
   */
  getMetrics(): PerformanceMetrics {
    const validTraces = this.completedTraces.filter(t => t.duration !== undefined);
    const totalRequests = validTraces.length;

    if (totalRequests === 0) {
      return {
        averageResponseTime: 0,
        totalRequests: 0,
        errorRate: 0,
        cacheHitRate: 0,
        slowQueries: [],
      };
    }

    const averageResponseTime = validTraces.reduce((sum, t) => sum + (t.duration || 0), 0) / totalRequests;
    const errorCount = validTraces.filter(t => t.error || (t.status && t.status >= 400)).length;
    const cacheHits = validTraces.filter(t => t.cacheHit).length;
    const slowQueries = validTraces.filter(t => (t.duration || 0) > this.slowQueryThreshold);

    return {
      averageResponseTime,
      totalRequests,
      errorRate: (errorCount / totalRequests) * 100,
      cacheHitRate: (cacheHits / totalRequests) * 100,
      slowQueries: slowQueries.slice(-10), // Last 10 slow queries
    };
  }

  /**
   * Send metrics to monitoring service (placeholder)
   */
  private sendToMonitoring(trace: RequestTrace): void {
    // Placeholder for production monitoring integration
    // Examples: DataDog, New Relic, Sentry Performance, etc.
    
    // Example payload:
    // {
    //   timestamp: Date.now(),
    //   service: 'faredown-frontend',
    //   method: trace.method,
    //   endpoint: trace.url,
    //   duration: trace.duration,
    //   status: trace.status,
    //   error: trace.error?.message,
    // }
  }

  /**
   * Clear all traces
   */
  clear(): void {
    this.traces.clear();
    this.completedTraces = [];
  }
}

// Global tracer instance
export const apiTracer = new APITracer();

/**
 * Enhanced fetch wrapper with tracing and caching
 */
export async function tracedFetch(
  url: string,
  options: RequestInit = {},
  cacheKey?: string,
  cacheTimeMs: number = 300000 // 5 minutes default
): Promise<Response> {
  const method = options.method || 'GET';
  const traceId = apiTracer.startTrace(method, url);

  // Simple in-memory cache for GET requests
  if (method.toUpperCase() === 'GET' && cacheKey) {
    const cached = getCachedResponse(cacheKey);
    if (cached) {
      apiTracer.endTrace(traceId, 200, undefined, undefined, true);
      return new Response(JSON.stringify(cached.data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  try {
    const startTime = performance.now();
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const responseSize = parseInt(response.headers.get('content-length') || '0', 10);

    // Cache successful GET responses
    if (method.toUpperCase() === 'GET' && response.ok && cacheKey) {
      const data = await response.clone().json();
      setCachedResponse(cacheKey, data, cacheTimeMs);
    }

    apiTracer.endTrace(traceId, response.status, undefined, responseSize, false);
    return response;
  } catch (error) {
    apiTracer.endTrace(traceId, 0, error as Error);
    throw error;
  }
}

/**
 * Simple in-memory cache
 */
interface CacheEntry {
  data: any;
  timestamp: number;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

function getCachedResponse(key: string): CacheEntry | null {
  const entry = cache.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  return entry;
}

function setCachedResponse(key: string, data: any, ttlMs: number): void {
  const now = Date.now();
  cache.set(key, {
    data,
    timestamp: now,
    expiresAt: now + ttlMs,
  });

  // Simple cache cleanup - remove expired entries periodically
  if (cache.size > 100) {
    for (const [k, entry] of cache.entries()) {
      if (now > entry.expiresAt) {
        cache.delete(k);
      }
    }
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  const now = Date.now();
  const entries = Array.from(cache.entries());
  const validEntries = entries.filter(([, entry]) => now <= entry.expiresAt);
  
  return {
    totalEntries: cache.size,
    validEntries: validEntries.length,
    expiredEntries: cache.size - validEntries.length,
    hitRate: 0, // Would need to track hits/misses for accurate rate
  };
}

/**
 * Clear cache
 */
export function clearCache(): void {
  cache.clear();
}
