const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Mock database - In production, use a real database
let users = [
  {
    id: "1",
    title: "Mr",
    firstName: "Zubin",
    lastName: "Aibara",
    email: "zubin@faredown.com",
    phone: "+91 9876543210",
    address: "Mumbai, India",
    dateOfBirth: "1985-05-15",
    countryCode: "+91",
    role: "super_admin",
    status: "active",
    password: "$2a$10$hashedPasswordExample",
    lastLogin: new Date().toISOString(),
    createdAt: "2023-01-01T00:00:00Z",
    permissions: ["all"],
  },
];

// Middleware to check authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET || "your-secret-key",
    (err, user) => {
      if (err) {
        return res.status(403).json({ error: "Invalid token" });
      }
      req.user = user;
      next();
    },
  );
};

// Check if user has required permission
const checkPermission = (permission) => {
  return (req, res, next) => {
    const user = users.find((u) => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (
      user.role === "super_admin" ||
      user.permissions.includes("all") ||
      user.permissions.includes(permission)
    ) {
      next();
    } else {
      res.status(403).json({ error: "Insufficient permissions" });
    }
  };
};

// GET /api/users - Get all users
router.get(
  "/",
  authenticateToken,
  checkPermission("manage_users"),
  (req, res) => {
    try {
      const { search, role, status, page = 1, limit = 10 } = req.query;

      let filteredUsers = users.map((user) => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });

      // Apply filters
      if (search) {
        filteredUsers = filteredUsers.filter(
          (user) =>
            user.firstName.toLowerCase().includes(search.toLowerCase()) ||
            user.lastName.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase()),
        );
      }

      if (role && role !== "all") {
        filteredUsers = filteredUsers.filter((user) => user.role === role);
      }

      if (status && status !== "all") {
        filteredUsers = filteredUsers.filter((user) => user.status === status);
      }

      // Pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + parseInt(limit);
      const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

      res.json({
        users: paginatedUsers,
        total: filteredUsers.length,
        page: parseInt(page),
        totalPages: Math.ceil(filteredUsers.length / limit),
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  },
);

// GET /api/users/:id - Get user by ID
router.get(
  "/:id",
  authenticateToken,
  checkPermission("manage_users"),
  (req, res) => {
    try {
      const user = users.find((u) => u.id === req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  },
);

// POST /api/users - Create new user
router.post(
  "/",
  authenticateToken,
  checkPermission("manage_users"),
  async (req, res) => {
    try {
      const {
        title,
        firstName,
        lastName,
        email,
        phone,
        address,
        dateOfBirth,
        countryCode,
        role,
        status,
        password,
      } = req.body;

      // Validate required fields
      if (!firstName || !lastName || !email || !password || !role) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Check if email already exists
      if (users.find((u) => u.email === email)) {
        return res.status(400).json({ error: "Email already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Define permissions based on role
      const rolePermissions = {
        super_admin: ["all"],
        finance: [
          "view_reports",
          "manage_payments",
          "view_bookings",
          "manage_vat",
        ],
        sales: [
          "view_bookings",
          "manage_promos",
          "view_reports",
          "manage_markup",
        ],
        marketing: ["manage_promos", "view_reports", "manage_content"],
      };

      const newUser = {
        id: Date.now().toString(),
        title: title || "Mr",
        firstName,
        lastName,
        email,
        phone: phone || "",
        address: address || "",
        dateOfBirth: dateOfBirth || "",
        countryCode: countryCode || "+91",
        role,
        status: status || "active",
        password: hashedPassword,
        lastLogin: "",
        createdAt: new Date().toISOString(),
        permissions: rolePermissions[role] || [],
      };

      users.push(newUser);

      const { password: _, ...userWithoutPassword } = newUser;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Failed to create user" });
    }
  },
);

// PUT /api/users/:id - Update user
router.put(
  "/:id",
  authenticateToken,
  checkPermission("manage_users"),
  (req, res) => {
    try {
      const userIndex = users.findIndex((u) => u.id === req.params.id);
      if (userIndex === -1) {
        return res.status(404).json({ error: "User not found" });
      }

      const {
        title,
        firstName,
        lastName,
        email,
        phone,
        address,
        dateOfBirth,
        countryCode,
        role,
        status,
      } = req.body;

      // Check if email already exists (excluding current user)
      if (
        email &&
        users.find((u) => u.email === email && u.id !== req.params.id)
      ) {
        return res.status(400).json({ error: "Email already exists" });
      }

      // Update user
      const updatedUser = {
        ...users[userIndex],
        title: title || users[userIndex].title,
        firstName: firstName || users[userIndex].firstName,
        lastName: lastName || users[userIndex].lastName,
        email: email || users[userIndex].email,
        phone: phone || users[userIndex].phone,
        address: address || users[userIndex].address,
        dateOfBirth: dateOfBirth || users[userIndex].dateOfBirth,
        countryCode: countryCode || users[userIndex].countryCode,
        role: role || users[userIndex].role,
        status: status || users[userIndex].status,
        updatedAt: new Date().toISOString(),
      };

      // Update permissions if role changed
      if (role && role !== users[userIndex].role) {
        const rolePermissions = {
          super_admin: ["all"],
          finance: [
            "view_reports",
            "manage_payments",
            "view_bookings",
            "manage_vat",
          ],
          sales: [
            "view_bookings",
            "manage_promos",
            "view_reports",
            "manage_markup",
          ],
          marketing: ["manage_promos", "view_reports", "manage_content"],
        };
        updatedUser.permissions = rolePermissions[role] || [];
      }

      users[userIndex] = updatedUser;

      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  },
);

// DELETE /api/users/:id - Delete user
router.delete(
  "/:id",
  authenticateToken,
  checkPermission("manage_users"),
  (req, res) => {
    try {
      const userIndex = users.findIndex((u) => u.id === req.params.id);
      if (userIndex === -1) {
        return res.status(404).json({ error: "User not found" });
      }

      // Prevent deletion of super admin
      if (users[userIndex].role === "super_admin") {
        return res
          .status(400)
          .json({ error: "Cannot delete super admin user" });
      }

      users.splice(userIndex, 1);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  },
);

// POST /api/users/:id/reset-password - Reset user password
router.post(
  "/:id/reset-password",
  authenticateToken,
  checkPermission("manage_users"),
  async (req, res) => {
    try {
      const { newPassword } = req.body;

      if (!newPassword) {
        return res.status(400).json({ error: "New password is required" });
      }

      const userIndex = users.findIndex((u) => u.id === req.params.id);
      if (userIndex === -1) {
        return res.status(404).json({ error: "User not found" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      users[userIndex].password = hashedPassword;
      users[userIndex].updatedAt = new Date().toISOString();

      res.json({ message: "Password reset successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to reset password" });
    }
  },
);

// POST /api/users/:id/toggle-status - Toggle user status
router.post(
  "/:id/toggle-status",
  authenticateToken,
  checkPermission("manage_users"),
  (req, res) => {
    try {
      const userIndex = users.findIndex((u) => u.id === req.params.id);
      if (userIndex === -1) {
        return res.status(404).json({ error: "User not found" });
      }

      // Prevent deactivating super admin
      if (users[userIndex].role === "super_admin") {
        return res
          .status(400)
          .json({ error: "Cannot deactivate super admin user" });
      }

      users[userIndex].status =
        users[userIndex].status === "active" ? "inactive" : "active";
      users[userIndex].updatedAt = new Date().toISOString();

      const { password, ...userWithoutPassword } = users[userIndex];
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Failed to toggle user status" });
    }
  },
);

// GET /api/users/stats - Get user statistics
router.get(
  "/stats",
  authenticateToken,
  checkPermission("view_dashboard"),
  (req, res) => {
    try {
      const totalUsers = users.length;
      const activeUsers = users.filter((u) => u.status === "active").length;
      const inactiveUsers = users.filter((u) => u.status === "inactive").length;
      const pendingUsers = users.filter((u) => u.status === "pending").length;

      const roleDistribution = users.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {});

      res.json({
        totalUsers,
        activeUsers,
        inactiveUsers,
        pendingUsers,
        roleDistribution,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user statistics" });
    }
  },
);

// GET /api/users/stats/overview - Get user statistics (legacy route)
router.get(
  "/stats/overview",
  authenticateToken,
  checkPermission("view_dashboard"),
  (req, res) => {
    try {
      const totalUsers = users.length;
      const activeUsers = users.filter((u) => u.status === "active").length;
      const roleDistribution = users.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {});

      res.json({
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        roleDistribution,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user statistics" });
    }
  },
);

module.exports = router;
