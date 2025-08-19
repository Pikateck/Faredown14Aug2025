/**
 * Admin Dashboard Service
 * Handles all dashboard-related API operations for admin panel
 */

import { apiClient } from "@/lib/api";

export interface DashboardStats {
  totalBookings: number;
  totalRevenue: number;
  totalUsers: number;
  successRate: number;
  rewardsIssued: number;
  monthlyGrowth: number;
  flightBookings: number;
  hotelBookings: number;
}

export interface TopDestination {
  city: string;
  bookings: number;
  revenue: number;
}

export interface RecentBooking {
  id: string;
  type: "Flight" | "Hotel";
  customer: string;
  amount: number;
  status: "Confirmed" | "Pending" | "Cancelled";
  date: string;
  destination: string;
}

export interface FlightBookingStats {
  class: string;
  bookings: number;
  revenue: number;
}

export interface HotelBookingStats {
  city: string;
  bookings: number;
  revenue: number;
}

export interface DashboardData {
  stats: DashboardStats;
  topDestinations: TopDestination[];
  recentBookings: RecentBooking[];
  flightBookings: FlightBookingStats[];
  hotelBookings: HotelBookingStats[];
  monthlyBookingDistribution: {
    month: string;
    bookings: number;
    revenue: number;
  }[];
}

class AdminDashboardService {
  private baseUrl = "/api/admin";

  /**
   * Get complete dashboard data
   */
  async getDashboardData(): Promise<DashboardData> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/dashboard`);

      if (response.ok) {
        return response.data;
      } else {
        throw new Error(response.error || "Failed to fetch dashboard data");
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      throw error;
    }
  }

  /**
   * Get real-time statistics
   */
  async getStats(
    period: "today" | "week" | "month" | "year" = "today",
  ): Promise<DashboardStats> {
    try {
      const response = await apiClient.get(
        `${this.baseUrl}/stats?period=${period}`,
      );

      if (response.ok) {
        return response.data.stats;
      } else {
        throw new Error(response.error || "Failed to fetch statistics");
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      throw error;
    }
  }

  /**
   * Get analytics data with filters
   */
  async getAnalytics(
    params: {
      startDate?: string;
      endDate?: string;
      type?: "revenue" | "bookings" | "users";
      granularity?: "day" | "week" | "month";
    } = {},
  ): Promise<{
    revenue: { date: string; amount: number }[];
    bookings: { date: string; count: number }[];
    users: { date: string; count: number }[];
    growth: {
      revenue: number;
      bookings: number;
      users: number;
    };
  }> {
    try {
      const queryParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await apiClient.get(
        `${this.baseUrl}/analytics?${queryParams.toString()}`,
      );

      if (response.ok) {
        return response.data;
      } else {
        throw new Error(response.error || "Failed to fetch analytics");
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      throw error;
    }
  }

  /**
   * Get system health and status
   */
  async getSystemStatus(): Promise<{
    database: { status: "healthy" | "warning" | "error"; latency: number };
    api: { status: "healthy" | "warning" | "error"; responseTime: number };
    cache: { status: "healthy" | "warning" | "error"; hitRate: number };
    storage: { used: number; total: number; percentage: number };
    uptime: number;
    lastUpdated: string;
  }> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/system`);

      if (response.ok) {
        return response.data;
      } else {
        throw new Error(response.error || "Failed to fetch system status");
      }
    } catch (error) {
      console.error("Error fetching system status:", error);
      throw error;
    }
  }

  /**
   * Generate and download reports
   */
  async generateReport(
    type: "financial" | "bookings" | "users" | "performance",
    options: {
      format: "json" | "csv" | "excel" | "pdf";
      startDate?: string;
      endDate?: string;
      filters?: Record<string, any>;
    },
  ): Promise<{ downloadUrl: string; fileName: string }> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/reports`, {
        type,
        ...options,
      });

      if (response.ok) {
        return response.data;
      } else {
        throw new Error(response.error || "Failed to generate report");
      }
    } catch (error) {
      console.error("Error generating report:", error);
      throw error;
    }
  }

  /**
   * Get audit trail
   */
  async getAuditLogs(
    filters: {
      userId?: string;
      actionType?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
    } = {},
  ): Promise<{
    logs: {
      id: string;
      userId: string;
      username: string;
      action: string;
      resource: string;
      details: any;
      timestamp: string;
      ipAddress: string;
      userAgent: string;
    }[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const queryParams = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });

      const response = await apiClient.get(
        `${this.baseUrl}/audit?${queryParams.toString()}`,
      );

      if (response.ok) {
        return response.data;
      } else {
        throw new Error(response.error || "Failed to fetch audit logs");
      }
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      throw error;
    }
  }

  /**
   * Refresh dashboard data (force reload)
   */
  async refreshData(): Promise<DashboardData> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/refresh`);

      if (response.ok) {
        return response.data;
      } else {
        throw new Error(response.error || "Failed to refresh dashboard data");
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
      throw error;
    }
  }
}

export const adminDashboardService = new AdminDashboardService();
