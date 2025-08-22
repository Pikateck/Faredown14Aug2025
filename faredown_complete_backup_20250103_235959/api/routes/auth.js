/**
 * Authentication Routes
 * Handles user login, registration, and token management
 */

const express = require("express");
const router = express.Router();
const {
  generateToken,
  comparePassword,
  getUserByUsername,
  createUser,
  authenticateToken,
} = require("../middleware/auth");
const { validate } = require("../middleware/validation");
const { audit } = require("../middleware/audit");

/**
 * @api {post} /api/auth/login User Login
 * @apiName LoginUser
 * @apiGroup Authentication
 * @apiVersion 1.0.0
 *
 * @apiParam {String} username User's username
 * @apiParam {String} password User's password
 * @apiParam {String} [department] User's department
 *
 * @apiSuccess {Boolean} success Login success status
 * @apiSuccess {String} message Success message
 * @apiSuccess {String} token JWT access token
 * @apiSuccess {Object} user User information
 * @apiSuccess {String} user.id User ID
 * @apiSuccess {String} user.username Username
 * @apiSuccess {String} user.email Email address
 * @apiSuccess {String} user.role User role
 * @apiSuccess {String} user.department User department
 * @apiSuccess {Array} user.permissions User permissions
 *
 * @apiError {Boolean} success=false Login failed
 * @apiError {String} message Error message
 */
router.post("/login", validate.login, async (req, res) => {
  try {
    const { username, password, department } = req.body;

    // Get user from database
    const user = getUserByUsername(username);

    if (!user) {
      await audit.login(req, { username }, false);
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      await audit.login(req, user, false);
      return res.status(401).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      await audit.login(req, user, false);
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    // Department check for admin users
    if (department && user.department !== department) {
      await audit.login(req, user, false);
      return res.status(401).json({
        success: false,
        message: "Invalid department",
      });
    }

    // Update last login
    user.lastLogin = new Date();

    // Generate JWT token
    const token = generateToken(user);

    // Log successful login
    await audit.login(req, user, true);

    // Return success response
    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        department: user.department,
        permissions: user.permissions || [],
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during login",
    });
  }
});

/**
 * @api {post} /api/auth/register User Registration
 * @apiName RegisterUser
 * @apiGroup Authentication
 * @apiVersion 1.0.0
 *
 * @apiParam {String} username Unique username
 * @apiParam {String} email Email address
 * @apiParam {String} password Password (min 8 characters)
 * @apiParam {String} [role=user] User role
 * @apiParam {String} [department] User department
 *
 * @apiSuccess {Boolean} success Registration success status
 * @apiSuccess {String} message Success message
 * @apiSuccess {Object} user Created user information
 *
 * @apiError {Boolean} success=false Registration failed
 * @apiError {String} message Error message
 */
router.post("/register", validate.register, async (req, res) => {
  try {
    const { username, email, password, role, department } = req.body;

    // Check if user already exists
    const existingUser = getUserByUsername(username);

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Username already exists",
      });
    }

    // Create new user
    const newUser = await createUser({
      username,
      email,
      password,
      role: role || "user",
      department,
    });

    // Log user creation
    await audit.userAction(req, "create", newUser);

    // Return success response (without password)
    const { password: _, ...userResponse } = newUser;

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during registration",
    });
  }
});

/**
 * @api {post} /api/auth/logout User Logout
 * @apiName LogoutUser
 * @apiGroup Authentication
 * @apiVersion 1.0.0
 *
 * @apiHeader {String} Authorization Bearer token
 *
 * @apiSuccess {Boolean} success Logout success status
 * @apiSuccess {String} message Success message
 */
router.post("/logout", authenticateToken, async (req, res) => {
  try {
    // Log logout
    await audit.logout(req);

    // In a real implementation, you might want to blacklist the token
    // For now, we just return success
    res.json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during logout",
    });
  }
});

/**
 * @api {get} /api/auth/me Get Current User
 * @apiName GetCurrentUser
 * @apiGroup Authentication
 * @apiVersion 1.0.0
 *
 * @apiHeader {String} Authorization Bearer token
 *
 * @apiSuccess {Boolean} success Request success status
 * @apiSuccess {Object} user Current user information
 */
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = req.user;

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        department: user.department,
        permissions: user.permissions || [],
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

/**
 * @api {post} /api/auth/refresh Refresh Token
 * @apiName RefreshToken
 * @apiGroup Authentication
 * @apiVersion 1.0.0
 *
 * @apiHeader {String} Authorization Bearer token
 *
 * @apiSuccess {Boolean} success Request success status
 * @apiSuccess {String} token New JWT token
 */
router.post("/refresh", authenticateToken, async (req, res) => {
  try {
    const user = req.user;

    // Get full user data
    const fullUser = getUserByUsername(user.username);

    if (!fullUser || !fullUser.isActive) {
      return res.status(401).json({
        success: false,
        message: "User not found or inactive",
      });
    }

    // Generate new token
    const token = generateToken(fullUser);

    res.json({
      success: true,
      token,
      message: "Token refreshed successfully",
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during token refresh",
    });
  }
});

/**
 * @api {post} /api/auth/change-password Change Password
 * @apiName ChangePassword
 * @apiGroup Authentication
 * @apiVersion 1.0.0
 *
 * @apiHeader {String} Authorization Bearer token
 * @apiParam {String} currentPassword Current password
 * @apiParam {String} newPassword New password
 *
 * @apiSuccess {Boolean} success Password change success status
 * @apiSuccess {String} message Success message
 */
router.post("/change-password", authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = req.user;

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters long",
      });
    }

    // Get full user data
    const fullUser = getUserByUsername(user.username);

    if (!fullUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(
      currentPassword,
      fullUser.password,
    );

    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Hash new password
    const { hashPassword } = require("../middleware/auth");
    const hashedNewPassword = await hashPassword(newPassword);

    // Update password
    fullUser.password = hashedNewPassword;
    fullUser.passwordChangedAt = new Date();

    // Log password change
    await audit.userAction(req, "update", fullUser, { passwordChanged: true });

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during password change",
    });
  }
});

/**
 * @api {get} /api/auth/permissions Get User Permissions
 * @apiName GetUserPermissions
 * @apiGroup Authentication
 * @apiVersion 1.0.0
 *
 * @apiHeader {String} Authorization Bearer token
 *
 * @apiSuccess {Boolean} success Request success status
 * @apiSuccess {Array} permissions User permissions list
 * @apiSuccess {String} role User role
 */
router.get("/permissions", authenticateToken, async (req, res) => {
  try {
    const user = req.user;

    res.json({
      success: true,
      permissions: user.permissions || [],
      role: user.role,
    });
  } catch (error) {
    console.error("Get permissions error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

module.exports = router;
