/**
 * Admin Authentication Service
 * Role-based access control for admin users
 */

import { apiClient, ApiResponse } from "@/lib/api";

// Admin User Types
export interface AdminUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: AdminRole;
  department: Department;
  permissions: Permission[];
  isActive: boolean;
  lastLogin: string;
  createdAt: string;
  createdBy: string;
}

export interface AdminRole {
  id: string;
  name: string;
  description: string;
  level: number; // 1 = Super Admin, 2 = Admin, 3 = Manager, 4 = Staff
  permissions: string[];
}

export interface Department {
  id: string;
  name:
    | "Sales"
    | "Accounts"
    | "Marketing"
    | "HR"
    | "CustomerSupport"
    | "IT"
    | "Management";
  description: string;
  defaultPermissions: string[];
}

export interface Permission {
  id: string;
  name: string;
  category: string;
  description: string;
}

export interface AdminLoginRequest {
  username: string;
  password: string;
  department?: string;
}

export interface AdminLoginResponse {
  user: AdminUser;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  permissions: string[];
}

// Predefined Roles and Permissions
export const ADMIN_ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  MANAGER: "manager",
  STAFF: "staff",
} as const;

export const DEPARTMENTS = {
  SALES: "Sales",
  ACCOUNTS: "Accounts",
  MARKETING: "Marketing",
  HR: "HR",
  CUSTOMER_SUPPORT: "CustomerSupport",
  IT: "IT",
  MANAGEMENT: "Management",
} as const;

export const PERMISSIONS = {
  // User Management
  USER_VIEW: "user.view",
  USER_CREATE: "user.create",
  USER_EDIT: "user.edit",
  USER_DELETE: "user.delete",
  USER_BULK_ACTIONS: "user.bulk_actions",

  // Booking Management
  BOOKING_VIEW: "booking.view",
  BOOKING_EDIT: "booking.edit",
  BOOKING_CANCEL: "booking.cancel",
  BOOKING_REFUND: "booking.refund",

  // Bargain Engine
  BARGAIN_VIEW: "bargain.view",
  BARGAIN_CONTROL: "bargain.control",
  BARGAIN_CONFIGURE: "bargain.configure",
  BARGAIN_INTERVENE: "bargain.intervene",

  // Financial
  FINANCE_VIEW: "finance.view",
  FINANCE_EDIT: "finance.edit",
  FINANCE_REPORTS: "finance.reports",
  PAYMENT_VIEW: "payment.view",
  PAYMENT_PROCESS: "payment.process",

  // Inventory
  INVENTORY_VIEW: "inventory.view",
  INVENTORY_UPLOAD: "inventory.upload",
  INVENTORY_EDIT: "inventory.edit",

  // Analytics
  ANALYTICS_VIEW: "analytics.view",
  ANALYTICS_EXPORT: "analytics.export",
  ANALYTICS_ADVANCED: "analytics.advanced",

  // System
  SYSTEM_SETTINGS: "system.settings",
  SYSTEM_USERS: "system.users",
  SYSTEM_BACKUP: "system.backup",

  // CMS
  CMS_VIEW: "cms.view",
  CMS_EDIT: "cms.edit",
  CMS_PUBLISH: "cms.publish",
} as const;

export class AdminAuthService {
  private readonly baseUrl = "/api/admin/auth";
  private currentUser: AdminUser | null = null;

  /**
   * Admin login
   */
  async login(credentials: AdminLoginRequest): Promise<AdminLoginResponse> {
    // For demo purposes, always use mock authentication
    // This avoids any fetch/network issues during development
    console.log("Using mock authentication for admin login");
    return this.mockLogin(credentials);

    // Original backend implementation (commented out for demo):
    /*
    // Check if backend is available by trying a simple health check first
    const backendAvailable = await this.checkBackendHealth();

    if (!backendAvailable) {
      console.log("Backend not available, using mock authentication");
      return this.mockLogin(credentials);
    }

    try {
      const response = await apiClient.post<ApiResponse<AdminLoginResponse>>(
        `${this.baseUrl}/login`,
        credentials,
      );

      if (response.data) {
        // Store admin auth token
        apiClient.setAuthToken(response.data.accessToken);

        // Store admin user data
        this.currentUser = response.data.user;
        localStorage.setItem("admin_user", JSON.stringify(response.data.user));
        localStorage.setItem(
          "admin_permissions",
          JSON.stringify(response.data.permissions),
        );
        localStorage.setItem("admin_refresh_token", response.data.refreshToken);

        return response.data;
      }

      throw new Error("Admin login failed: No data received");
    } catch (error) {
      console.error("Admin login error:", error);

      // Fallback to mock authentication when backend call fails
      console.log("Backend API failed, falling back to mock authentication");
      return this.mockLogin(credentials);
    }
    */
  }

  /**
   * Check if backend is available
   */
  private async checkBackendHealth(): Promise<boolean> {
    // Always return false to force fallback mode and avoid fetch errors
    console.log("Backend health check: Using fallback mode (fetch disabled)");
    return false;
  }

  /**
   * Mock login for demo purposes when backend is not available
   */
  private async mockLogin(
    credentials: AdminLoginRequest,
  ): Promise<AdminLoginResponse> {
    // Mock credentials for testing
    const mockUsers = {
      admin: {
        password: "admin123",
        user: {
          id: "admin-1",
          username: "admin",
          email: "admin@faredown.com",
          firstName: "Super",
          lastName: "Admin",
          role: {
            id: "role-1",
            name: ADMIN_ROLES.SUPER_ADMIN,
            description: "Super Administrator",
            level: 1,
            permissions: Object.values(PERMISSIONS),
          },
          department: {
            id: "dept-1",
            name: "Management" as any,
            description: "Management Department",
            defaultPermissions: Object.values(PERMISSIONS),
          },
          permissions: Object.values(PERMISSIONS).map((perm) => ({
            id: perm,
            name: perm,
            category: "admin",
            description: `Permission: ${perm}`,
          })),
          isActive: true,
          lastLogin: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          createdBy: "system",
        },
        permissions: Object.values(PERMISSIONS),
      },
      sales: {
        password: "sales123",
        user: {
          id: "sales-1",
          username: "sales",
          email: "sales@faredown.com",
          firstName: "Sales",
          lastName: "Manager",
          role: {
            id: "role-2",
            name: ADMIN_ROLES.MANAGER,
            description: "Sales Manager",
            level: 3,
            permissions: [
              PERMISSIONS.USER_VIEW,
              PERMISSIONS.USER_EDIT,
              PERMISSIONS.BOOKING_VIEW,
              PERMISSIONS.ANALYTICS_VIEW,
            ],
          },
          department: {
            id: "dept-2",
            name: "Sales" as any,
            description: "Sales Department",
            defaultPermissions: [
              PERMISSIONS.USER_VIEW,
              PERMISSIONS.BOOKING_VIEW,
            ],
          },
          permissions: [
            PERMISSIONS.USER_VIEW,
            PERMISSIONS.USER_EDIT,
            PERMISSIONS.BOOKING_VIEW,
            PERMISSIONS.ANALYTICS_VIEW,
          ].map((perm) => ({
            id: perm,
            name: perm,
            category: "sales",
            description: `Permission: ${perm}`,
          })),
          isActive: true,
          lastLogin: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          createdBy: "admin",
        },
        permissions: [
          PERMISSIONS.USER_VIEW,
          PERMISSIONS.USER_EDIT,
          PERMISSIONS.BOOKING_VIEW,
          PERMISSIONS.ANALYTICS_VIEW,
        ],
      },
      accounts: {
        password: "acc123",
        user: {
          id: "accounts-1",
          username: "accounts",
          email: "accounts@faredown.com",
          firstName: "Finance",
          lastName: "Team",
          role: {
            id: "role-3",
            name: ADMIN_ROLES.MANAGER,
            description: "Finance Manager",
            level: 3,
            permissions: [
              PERMISSIONS.FINANCE_VIEW,
              PERMISSIONS.FINANCE_EDIT,
              PERMISSIONS.PAYMENT_VIEW,
              PERMISSIONS.ANALYTICS_VIEW,
              PERMISSIONS.ANALYTICS_EXPORT,
            ],
          },
          department: {
            id: "dept-3",
            name: "Accounts" as any,
            description: "Accounts & Finance Department",
            defaultPermissions: [
              PERMISSIONS.FINANCE_VIEW,
              PERMISSIONS.PAYMENT_VIEW,
            ],
          },
          permissions: [
            PERMISSIONS.FINANCE_VIEW,
            PERMISSIONS.FINANCE_EDIT,
            PERMISSIONS.PAYMENT_VIEW,
            PERMISSIONS.ANALYTICS_VIEW,
            PERMISSIONS.ANALYTICS_EXPORT,
          ].map((perm) => ({
            id: perm,
            name: perm,
            category: "finance",
            description: `Permission: ${perm}`,
          })),
          isActive: true,
          lastLogin: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          createdBy: "admin",
        },
        permissions: [
          PERMISSIONS.FINANCE_VIEW,
          PERMISSIONS.FINANCE_EDIT,
          PERMISSIONS.PAYMENT_VIEW,
          PERMISSIONS.ANALYTICS_VIEW,
          PERMISSIONS.ANALYTICS_EXPORT,
        ],
      },
    };

    const mockUser = mockUsers[credentials.username as keyof typeof mockUsers];

    if (!mockUser || mockUser.password !== credentials.password) {
      throw new Error("Invalid username or password");
    }

    // Simulate API response
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay

    const mockResponse: AdminLoginResponse = {
      user: mockUser.user,
      accessToken: `mock-token-${Date.now()}`,
      refreshToken: `mock-refresh-${Date.now()}`,
      expiresIn: 3600,
      permissions: mockUser.permissions,
    };

    // Store auth data
    apiClient.setAuthToken(mockResponse.accessToken);
    this.currentUser = mockResponse.user;
    localStorage.setItem("admin_user", JSON.stringify(mockResponse.user));
    localStorage.setItem(
      "admin_permissions",
      JSON.stringify(mockResponse.permissions),
    );
    localStorage.setItem("admin_refresh_token", mockResponse.refreshToken);

    return mockResponse;
  }

  /**
   * Admin logout
   */
  async logout(): Promise<void> {
    try {
      // Only attempt backend logout if we have a real token (not mock)
      const token = localStorage.getItem("auth_token");
      if (token && !token.startsWith("mock-token-")) {
        await apiClient.post(`${this.baseUrl}/logout`);
      }
    } catch (error) {
      console.log("Admin logout error (ignoring for mock auth):", error);
    } finally {
      this.clearAdminAuth();
    }
  }

  /**
   * Get current admin user
   */
  async getCurrentUser(): Promise<AdminUser> {
    if (this.currentUser) {
      return this.currentUser;
    }

    // Try to get user from localStorage first (for mock auth)
    const storedUser = this.getStoredUser();
    if (storedUser) {
      this.currentUser = storedUser;
      return storedUser;
    }

    // If no stored user and not using mock auth, try backend
    try {
      const response = await apiClient.get<ApiResponse<AdminUser>>(
        `${this.baseUrl}/me`,
      );

      if (response.data) {
        this.currentUser = response.data;
        localStorage.setItem("admin_user", JSON.stringify(response.data));
        return response.data;
      }
    } catch (error) {
      console.log("Failed to get user from backend, user needs to login again");
    }

    throw new Error("No authenticated admin user found");
  }

  /**
   * Check if admin is authenticated
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem("auth_token");
    const user = localStorage.getItem("admin_user");
    return !!(token && user);
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(permission: string): boolean {
    try {
      const permissions = this.getStoredPermissions();
      return permissions.includes(permission) || this.isSuperAdmin();
    } catch {
      return false;
    }
  }

  /**
   * Check if user has any of the specified permissions
   */
  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some((permission) => this.hasPermission(permission));
  }

  /**
   * Check if user is super admin
   */
  isSuperAdmin(): boolean {
    const user = this.getStoredUser();
    return user?.role.name === ADMIN_ROLES.SUPER_ADMIN;
  }

  /**
   * Check if user can access specific department
   */
  canAccessDepartment(department: string): boolean {
    const user = this.getStoredUser();
    return this.isSuperAdmin() || user?.department.name === department;
  }

  /**
   * Get user's department
   */
  getUserDepartment(): string | null {
    const user = this.getStoredUser();
    return user?.department.name || null;
  }

  /**
   * Get user role level
   */
  getRoleLevel(): number {
    const user = this.getStoredUser();
    return user?.role.level || 999;
  }

  /**
   * Create new admin user (Super Admin only)
   */
  async createAdminUser(userData: {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    role: string;
    department: string;
    permissions?: string[];
  }): Promise<AdminUser> {
    if (!this.hasPermission(PERMISSIONS.SYSTEM_USERS)) {
      throw new Error("Insufficient permissions to create admin users");
    }

    const response = await apiClient.post<ApiResponse<AdminUser>>(
      `${this.baseUrl}/users`,
      userData,
    );

    if (response.data) {
      return response.data;
    }

    throw new Error("Failed to create admin user");
  }

  /**
   * Update admin user
   */
  async updateAdminUser(
    userId: string,
    updates: Partial<AdminUser>,
  ): Promise<AdminUser> {
    if (!this.hasPermission(PERMISSIONS.SYSTEM_USERS)) {
      throw new Error("Insufficient permissions to update admin users");
    }

    const response = await apiClient.put<ApiResponse<AdminUser>>(
      `${this.baseUrl}/users/${userId}`,
      updates,
    );

    if (response.data) {
      return response.data;
    }

    throw new Error("Failed to update admin user");
  }

  /**
   * Get all admin users
   */
  async getAdminUsers(): Promise<AdminUser[]> {
    if (!this.hasPermission(PERMISSIONS.SYSTEM_USERS)) {
      throw new Error("Insufficient permissions to view admin users");
    }

    const response = await apiClient.get<ApiResponse<AdminUser[]>>(
      `${this.baseUrl}/users`,
    );

    if (response.data) {
      return response.data;
    }

    throw new Error("Failed to get admin users");
  }

  /**
   * Update user permissions
   */
  async updateUserPermissions(
    userId: string,
    permissions: string[],
  ): Promise<void> {
    if (!this.isSuperAdmin()) {
      throw new Error("Only Super Admin can update permissions");
    }

    await apiClient.put(`${this.baseUrl}/users/${userId}/permissions`, {
      permissions,
    });
  }

  /**
   * Disable admin user
   */
  async disableUser(userId: string): Promise<void> {
    if (!this.hasPermission(PERMISSIONS.SYSTEM_USERS)) {
      throw new Error("Insufficient permissions to disable users");
    }

    await apiClient.put(`${this.baseUrl}/users/${userId}/disable`);
  }

  /**
   * Enable admin user
   */
  async enableUser(userId: string): Promise<void> {
    if (!this.hasPermission(PERMISSIONS.SYSTEM_USERS)) {
      throw new Error("Insufficient permissions to enable users");
    }

    await apiClient.put(`${this.baseUrl}/users/${userId}/enable`);
  }

  /**
   * Get activity logs
   */
  async getActivityLogs(filters?: {
    userId?: string;
    department?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<any[]> {
    if (!this.hasPermission(PERMISSIONS.SYSTEM_SETTINGS)) {
      throw new Error("Insufficient permissions to view activity logs");
    }

    const response = await apiClient.get<ApiResponse<any[]>>(
      `${this.baseUrl}/activity-logs`,
      filters,
    );

    if (response.data) {
      return response.data;
    }

    return [];
  }

  /**
   * Get stored user data
   */
  private getStoredUser(): AdminUser | null {
    try {
      const userData = localStorage.getItem("admin_user");
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  /**
   * Get stored permissions
   */
  private getStoredPermissions(): string[] {
    try {
      const permissions = localStorage.getItem("admin_permissions");
      return permissions ? JSON.parse(permissions) : [];
    } catch {
      return [];
    }
  }

  /**
   * Clear admin authentication data
   */
  private clearAdminAuth(): void {
    this.currentUser = null;
    apiClient.clearAuthToken();
    localStorage.removeItem("admin_user");
    localStorage.removeItem("admin_permissions");
    localStorage.removeItem("admin_refresh_token");
  }

  /**
   * Refresh admin token
   */
  async refreshToken(): Promise<{ accessToken: string; expiresIn: number }> {
    const refreshToken = localStorage.getItem("admin_refresh_token");

    if (!refreshToken) {
      throw new Error("No admin refresh token available");
    }

    const response = await apiClient.post<
      ApiResponse<{
        accessToken: string;
        expiresIn: number;
      }>
    >(`${this.baseUrl}/refresh`, {
      refreshToken,
    });

    if (response.data) {
      apiClient.setAuthToken(response.data.accessToken);
      return response.data;
    }

    throw new Error("Failed to refresh admin token");
  }
}

// Export singleton instance
export const adminAuthService = new AdminAuthService();
export default adminAuthService;
