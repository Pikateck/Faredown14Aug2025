import express from "express";
import { generateAdminToken, AdminRole } from "../../middleware/adminAuth";
import { sendSuccess, sendError } from "../../utils/adminUtils";

const router = express.Router();

// POST /api/admin/auth/login - Admin login (simplified for development)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("🔐 Admin login attempt:", email);

    // Simplified authentication for development
    // In production, this would verify against database with proper password hashing
    const validAdmins = [
      {
        email: "admin@faredown.com",
        password: "admin123",
        name: "Admin User",
        role: AdminRole.ADMIN,
      },
      {
        email: "superadmin@faredown.com",
        password: "super123",
        name: "Super Admin",
        role: AdminRole.SUPER_ADMIN,
      },
      {
        email: "finance@faredown.com",
        password: "finance123",
        name: "Finance User",
        role: AdminRole.FINANCE,
      },
    ];

    const admin = validAdmins.find(
      (a) => a.email === email && a.password === password,
    );

    if (!admin) {
      return sendError(
        res,
        401,
        "INVALID_CREDENTIALS",
        "Invalid email or password",
      );
    }

    // Generate JWT token
    const token = generateAdminToken({
      id: `admin-${Date.now()}`,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    });

    sendSuccess(res, {
      token,
      admin: {
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
      expiresIn: "24h",
    });
  } catch (error) {
    console.error("❌ Admin login error:", error);
    sendError(res, 500, "LOGIN_ERROR", "Login failed");
  }
});

// GET /api/admin/auth/test-token - Generate test token for development
router.get("/test-token", async (req, res) => {
  try {
    if (process.env.NODE_ENV === "production") {
      return sendError(
        res,
        403,
        "NOT_ALLOWED",
        "Test tokens not available in production",
      );
    }

    const testToken = generateAdminToken({
      id: "test-admin-1",
      email: "admin@faredown.com",
      name: "Test Admin",
      role: AdminRole.ADMIN,
    });

    sendSuccess(res, {
      token: testToken,
      message: "Test admin token generated",
      usage:
        'Add this token to localStorage as "auth_token" or use in Authorization header',
    });
  } catch (error) {
    console.error("❌ Test token generation error:", error);
    sendError(res, 500, "TOKEN_ERROR", "Failed to generate test token");
  }
});

export default router;
