import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Admin roles and permissions
export enum AdminRole {
  SUPER_ADMIN = "super_admin",
  ADMIN = "admin",
  FINANCE = "finance",
  SUPPORT = "support",
  VIEWER = "viewer",
}

export enum Permission {
  // Dashboard
  VIEW_DASHBOARD = "view_dashboard",

  // Users
  VIEW_USERS = "view_users",
  MANAGE_USERS = "manage_users",

  // Bookings
  VIEW_BOOKINGS = "view_bookings",
  MANAGE_BOOKINGS = "manage_bookings",
  CANCEL_BOOKINGS = "cancel_bookings",

  // Payments
  VIEW_PAYMENTS = "view_payments",
  MANAGE_PAYMENTS = "manage_payments",
  PROCESS_REFUNDS = "process_refunds",

  // Suppliers
  VIEW_SUPPLIERS = "view_suppliers",
  MANAGE_SUPPLIERS = "manage_suppliers",

  // Markup & Pricing
  VIEW_MARKUP = "view_markup",
  MANAGE_MARKUP = "manage_markup",

  // Reports
  VIEW_REPORTS = "view_reports",
  EXPORT_REPORTS = "export_reports",

  // System
  MANAGE_SYSTEM = "manage_system",
  VIEW_AUDIT = "view_audit",
}

// Role-permission mapping
const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  [AdminRole.SUPER_ADMIN]: Object.values(Permission),
  [AdminRole.ADMIN]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_USERS,
    Permission.MANAGE_USERS,
    Permission.VIEW_BOOKINGS,
    Permission.MANAGE_BOOKINGS,
    Permission.VIEW_PAYMENTS,
    Permission.MANAGE_PAYMENTS,
    Permission.VIEW_SUPPLIERS,
    Permission.MANAGE_SUPPLIERS,
    Permission.VIEW_MARKUP,
    Permission.MANAGE_MARKUP,
    Permission.VIEW_REPORTS,
    Permission.EXPORT_REPORTS,
    Permission.VIEW_AUDIT,
  ],
  [AdminRole.FINANCE]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_BOOKINGS,
    Permission.VIEW_PAYMENTS,
    Permission.MANAGE_PAYMENTS,
    Permission.PROCESS_REFUNDS,
    Permission.VIEW_REPORTS,
    Permission.EXPORT_REPORTS,
  ],
  [AdminRole.SUPPORT]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_USERS,
    Permission.VIEW_BOOKINGS,
    Permission.MANAGE_BOOKINGS,
    Permission.VIEW_PAYMENTS,
    Permission.VIEW_REPORTS,
  ],
  [AdminRole.VIEWER]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_USERS,
    Permission.VIEW_BOOKINGS,
    Permission.VIEW_PAYMENTS,
    Permission.VIEW_SUPPLIERS,
    Permission.VIEW_MARKUP,
    Permission.VIEW_REPORTS,
  ],
};

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  permissions: Permission[];
  lastLogin?: Date;
}

export interface AuthenticatedRequest extends Request {
  admin?: AdminUser;
}

// JWT secret (in production, use environment variable)
const JWT_SECRET =
  process.env.ADMIN_JWT_SECRET || "your-super-secret-admin-jwt-key";

// Authentication middleware
export const authenticateAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message: "Missing or invalid authorization header",
        },
      });
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;

      // In production, you would fetch the user from database
      // For now, using decoded token data
      const admin: AdminUser = {
        id: decoded.id || "admin-1",
        email: decoded.email || "admin@faredown.com",
        name: decoded.name || "Admin User",
        role: decoded.role || AdminRole.ADMIN,
        permissions: ROLE_PERMISSIONS[decoded.role || AdminRole.ADMIN],
        lastLogin: new Date(),
      };

      req.admin = admin;
      next();
    } catch (jwtError) {
      return res.status(401).json({
        error: {
          code: "INVALID_TOKEN",
          message: "Invalid or expired token",
        },
      });
    }
  } catch (error) {
    console.error("Admin auth error:", error);
    return res.status(500).json({
      error: {
        code: "AUTH_ERROR",
        message: "Authentication service error",
      },
    });
  }
};

// Permission check middleware factory
export const requirePermission = (permission: Permission) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.admin) {
      return res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      });
    }

    if (!req.admin.permissions.includes(permission)) {
      return res.status(403).json({
        error: {
          code: "FORBIDDEN",
          message: `Permission '${permission}' required`,
        },
      });
    }

    next();
  };
};

// Role check middleware factory
export const requireRole = (roles: AdminRole | AdminRole[]) => {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.admin) {
      return res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      });
    }

    if (!allowedRoles.includes(req.admin.role)) {
      return res.status(403).json({
        error: {
          code: "FORBIDDEN",
          message: `Role must be one of: ${allowedRoles.join(", ")}`,
        },
      });
    }

    next();
  };
};

// Helper function to generate admin JWT (for login)
export const generateAdminToken = (admin: Partial<AdminUser>): string => {
  return jwt.sign(
    {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    },
    JWT_SECRET,
    { expiresIn: "24h" },
  );
};

// Helper function to check if admin has permission
export const hasPermission = (
  admin: AdminUser,
  permission: Permission,
): boolean => {
  return admin.permissions.includes(permission);
};

// Helper function to log admin actions for audit
export const logAdminAction = async (
  admin: AdminUser,
  action: string,
  module: string,
  entityId?: string,
  details?: any,
) => {
  // This would insert into admin_audit_log table
  console.log("Admin Action:", {
    adminId: admin.id,
    adminEmail: admin.email,
    action,
    module,
    entityId,
    details,
    timestamp: new Date().toISOString(),
  });
};
