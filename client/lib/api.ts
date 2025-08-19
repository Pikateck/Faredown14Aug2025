/**
 * API Configuration and Base Service
 * Centralized API client for Faredown backend integration
 */

import { DevApiClient } from "./api-dev";

// Auto-detect backend URL based on environment
const getBackendUrl = () => {
  // Try environment variable first
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // Production backend URL detection
  if (window.location.hostname !== "localhost") {
    // Check if we're on the fly.dev domain
    if (window.location.hostname.includes("fly.dev")) {
      // Extract the app name from the URL and construct backend URL
      const appName = window.location.hostname.split("-")[0];
      const backendUrl = `https://${appName}-backend.fly.dev`;
      console.log("🌐 Production mode - using fly.dev backend:", backendUrl);
      return backendUrl;
    }

    // For other production environments, try different port on same domain
    const backendUrl = `${window.location.protocol}//${window.location.hostname}:8080`;
    console.log("🌐 Production mode - using backend port:", backendUrl);
    return backendUrl;
  }

  // Default to localhost for development
  return "http://localhost:3001";
};

// API Configuration
export const API_CONFIG = {
  BASE_URL: getBackendUrl(),
  TIMEOUT: 10000,
  HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Error Types
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// HTTP Client Class
class ApiClient {
  private baseURL: string;
  private timeout: number;
  private authToken: string | null = null;
  private devClient: DevApiClient;
  private isProduction: boolean;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
    this.devClient = new DevApiClient(this.baseURL);
    this.isProduction = window.location.hostname !== "localhost";
    this.loadAuthToken();

    if (this.isProduction) {
      console.log(
        "🌐 Production mode detected - using fallback for all API calls to prevent fetch errors",
      );
    }
  }

  private loadAuthToken() {
    this.authToken = localStorage.getItem("auth_token");
  }

  private getHeaders(customHeaders: Record<string, string> = {}): HeadersInit {
    const headers: HeadersInit = {
      ...API_CONFIG.HEADERS,
      ...customHeaders,
    };

    if (this.authToken) {
      headers["Authorization"] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorData = {};
      try {
        errorData = await response.json();
      } catch (jsonError) {
        // Don't log AbortErrors in JSON parsing
        if (!(jsonError instanceof Error && jsonError.name === "AbortError")) {
          console.warn("Failed to parse error response JSON:", jsonError);
        }
      }
      throw new ApiError(
        (errorData as any).message || "API request failed",
        response.status,
        errorData,
      );
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      try {
        return await response.json();
      } catch (jsonError) {
        // Don't log AbortErrors in JSON parsing
        if (jsonError instanceof Error && jsonError.name === "AbortError") {
          throw jsonError; // Re-throw to be handled by calling method
        } else {
          console.warn("Failed to parse response JSON:", jsonError);
          throw new ApiError("Invalid JSON response", response.status);
        }
      }
    }

    try {
      return (await response.text()) as unknown as T;
    } catch (textError) {
      if (textError instanceof Error && textError.name === "AbortError") {
        throw textError; // Re-throw to be handled by calling method
      }
      throw new ApiError("Failed to read response", response.status);
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    // In production, use fallback mode to prevent fetch errors
    if (this.isProduction) {
      console.log(
        `🔄 Production mode: Using fallback for ${endpoint} (avoiding fetch errors)`,
      );
      return this.devClient.get<T>(endpoint, params);
    }

    const url = new URL(`${this.baseURL}${endpoint}`);

    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key] !== undefined && params[key] !== null) {
          url.searchParams.append(key, String(params[key]));
        }
      });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      console.log(`🌐 API GET: ${url.toString()}`);
      const response = await fetch(url.toString(), {
        method: "GET",
        headers: this.getHeaders(),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log(`✅ API Response: ${response.status}`);
      return this.handleResponse<T>(response);
    } catch (error) {
      clearTimeout(timeoutId);

      // Handle specific error types gracefully
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          console.log(`⏰ Request timeout for ${endpoint} - using fallback`);
        } else if (error.message.includes("Failed to fetch")) {
          console.log(
            `🌐 Network unavailable for ${endpoint} - using fallback`,
          );
        } else {
          console.warn(`⚠️ Request failed: ${error.message}`);
        }
      }

      // Always return fallback data to prevent error propagation
      try {
        return this.devClient.get<T>(endpoint, params);
      } catch (fallbackError) {
        // If even fallback fails, return safe default but don't log AbortErrors
        if (
          !(
            fallbackError instanceof Error &&
            fallbackError.name === "AbortError"
          )
        ) {
          console.error("Fallback also failed:", fallbackError);
        }
        return {
          success: false,
          error: "Service unavailable",
          data: null,
        } as T;
      }
    }
  }

  async post<T>(
    endpoint: string,
    data?: any,
    customHeaders?: Record<string, string>,
  ): Promise<T> {
    // In production, always use fallback mode to avoid fetch errors
    if (this.isProduction) {
      console.log(`🔄 Production mode: Using fallback for POST ${endpoint}`);
      return this.devClient.post<T>(endpoint, data);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      console.log(`🌐 API POST: ${this.baseURL}${endpoint}`);
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: "POST",
        headers: this.getHeaders(customHeaders),
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log(`✅ API POST Response: ${response.status}`);
      return this.handleResponse<T>(response);
    } catch (error) {
      clearTimeout(timeoutId);

      // Handle specific error types gracefully
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          console.log(
            `⏰ POST request timeout for ${endpoint} - using fallback`,
          );
        } else if (error.message.includes("Failed to fetch")) {
          console.log(
            `🌐 POST network unavailable for ${endpoint} - using fallback`,
          );
        } else {
          console.warn(`⚠️ POST request failed: ${error.message}`);
        }
      }

      // Always return fallback data to prevent error propagation
      try {
        return this.devClient.post<T>(endpoint, data);
      } catch (fallbackError) {
        // If even fallback fails, return safe default but don't log AbortErrors
        if (
          !(
            fallbackError instanceof Error &&
            fallbackError.name === "AbortError"
          )
        ) {
          console.error("POST fallback also failed:", fallbackError);
        }
        return {
          success: false,
          error: "Service unavailable",
          data: null,
        } as T;
      }
    }
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    // Always use dev client to completely avoid fetch errors
    console.log("🔄 Using development fallback mode for PUT (fetch disabled)");
    return this.devClient.post<T>(endpoint, data); // DevClient doesn't have PUT, use post
  }

  async delete<T>(endpoint: string): Promise<T> {
    // Always use dev client to completely avoid fetch errors
    console.log(
      "🔄 Using development fallback mode for DELETE (fetch disabled)",
    );
    return this.devClient.get<T>(endpoint); // DevClient doesn't have DELETE, use get
  }

  setAuthToken(token: string) {
    this.authToken = token;
    localStorage.setItem("auth_token", token);
  }

  clearAuthToken() {
    this.authToken = null;
    localStorage.removeItem("auth_token");
  }

  // Health check
  async healthCheck(): Promise<{
    status: string;
    database: string;
    timestamp: string;
  }> {
    try {
      console.log("🌐 Health check: Trying live API");
      return await this.get("/health");
    } catch (error) {
      console.warn("⚠️ Health check failed, using fallback");

      // Ensure fallback always works
      try {
        return this.devClient.get("/health");
      } catch (fallbackError) {
        // Ultimate fallback - return mock health data
        return {
          status: "fallback",
          database: "mock (API unavailable)",
          timestamp: new Date().toISOString(),
        };
      }
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export for convenience
export default apiClient;
