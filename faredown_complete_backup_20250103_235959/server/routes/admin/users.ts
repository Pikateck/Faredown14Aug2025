import express from "express";
import {
  AuthenticatedRequest,
  requirePermission,
  Permission,
  AdminRole,
} from "../../middleware/adminAuth";
import {
  pool,
  sendSuccess,
  sendError,
  sendValidationError,
  handleDatabaseError,
  parsePaginationParams,
  executePaginatedQuery,
  logAuditAction,
  sanitizeInput,
  withTransaction,
} from "../../utils/adminUtils";

const router = express.Router();

// Validation schemas
const validateUserData = (data: any) => {
  const errors: string[] = [];

  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push("Valid email is required");
  }

  if (!data.first_name || data.first_name.trim().length < 2) {
    errors.push("First name must be at least 2 characters");
  }

  if (!data.last_name || data.last_name.trim().length < 2) {
    errors.push("Last name must be at least 2 characters");
  }

  if (data.phone && !/^\+?[\d\s-()]+$/.test(data.phone)) {
    errors.push("Invalid phone number format");
  }

  return errors;
};

// GET /api/admin/users - List users with pagination and search
router.get(
  "/",
  requirePermission(Permission.VIEW_USERS),
  async (req: AuthenticatedRequest, res) => {
    try {
      const params = parsePaginationParams(req.query);
      const { status, role } = req.query;

      console.log(
        `👥 Getting users list - page ${params.page}, pageSize ${params.pageSize}`,
      );

      let baseQuery = `
      SELECT 
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.phone,
        u.is_active,
        u.created_at,
        u.updated_at,
        u.last_login_at,
        COUNT(hb.id) as total_bookings,
        COALESCE(SUM(hb.total_amount), 0) as total_spent,
        MAX(hb.booking_date) as last_booking_date
      FROM users u
      LEFT JOIN hotel_bookings hb ON u.id = hb.user_id
    `;

      const whereConditions: string[] = [];
      const queryParams: any[] = [];
      let paramIndex = 1;

      // Add filters
      if (status) {
        whereConditions.push(`u.is_active = $${paramIndex}`);
        queryParams.push(status === "active");
        paramIndex++;
      }

      // Add search
      if (params.q) {
        whereConditions.push(`(
        LOWER(u.first_name) LIKE LOWER($${paramIndex}) OR 
        LOWER(u.last_name) LIKE LOWER($${paramIndex + 1}) OR 
        LOWER(u.email) LIKE LOWER($${paramIndex + 2})
      )`);
        queryParams.push(`%${params.q}%`, `%${params.q}%`, `%${params.q}%`);
        paramIndex += 3;
      }

      if (whereConditions.length > 0) {
        baseQuery += ` WHERE ${whereConditions.join(" AND ")}`;
      }

      baseQuery += ` GROUP BY u.id, u.email, u.first_name, u.last_name, u.phone, u.is_active, u.created_at, u.updated_at, u.last_login_at`;

      // Execute paginated query
      const orderBy =
        params.sort === "name" ? "u.first_name" : `u.${params.sort}`;
      const finalQuery = `${baseQuery} ORDER BY ${orderBy} ${params.order} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      queryParams.push(params.pageSize, (params.page! - 1) * params.pageSize!);

      // Get total count
      const countQuery = `SELECT COUNT(DISTINCT u.id) as total FROM users u ${whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : ""}`;

      const [dataResult, countResult] = await Promise.all([
        pool.query(finalQuery, queryParams),
        pool.query(countQuery, queryParams.slice(0, -2)),
      ]);

      const users = dataResult.rows.map((row) => ({
        id: row.id,
        email: row.email,
        firstName: row.first_name,
        lastName: row.last_name,
        fullName: `${row.first_name} ${row.last_name}`,
        phone: row.phone,
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        lastLoginAt: row.last_login_at,
        totalBookings: parseInt(row.total_bookings || "0"),
        totalSpent: parseFloat(row.total_spent || "0"),
        lastBookingDate: row.last_booking_date,
        status: row.is_active ? "active" : "inactive",
      }));

      const total = parseInt(countResult.rows[0]?.total || "0");
      const totalPages = Math.ceil(total / params.pageSize!);

      const response = {
        items: users,
        page: params.page!,
        pageSize: params.pageSize!,
        total,
        totalPages,
      };

      sendSuccess(res, response);
    } catch (error) {
      console.error("❌ Error getting users:", error);
      handleDatabaseError(res, error);
    }
  },
);

// GET /api/admin/users/:id - Get user details
router.get(
  "/:id",
  requirePermission(Permission.VIEW_USERS),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;

      console.log(`👤 Getting user details: ${id}`);

      const userResult = await pool.query(
        `
      SELECT 
        u.*,
        COUNT(hb.id) as total_bookings,
        COALESCE(SUM(hb.total_amount), 0) as total_spent,
        COALESCE(SUM(CASE WHEN hb.status = 'confirmed' THEN hb.total_amount ELSE 0 END), 0) as confirmed_spent,
        MAX(hb.booking_date) as last_booking_date,
        AVG(hb.total_amount) as avg_booking_value
      FROM users u
      LEFT JOIN hotel_bookings hb ON u.id = hb.user_id
      WHERE u.id = $1
      GROUP BY u.id
    `,
        [id],
      );

      if (userResult.rows.length === 0) {
        return sendError(res, 404, "USER_NOT_FOUND", "User not found");
      }

      const user = userResult.rows[0];

      // Get recent bookings
      const bookingsResult = await pool.query(
        `
      SELECT 
        id,
        booking_ref,
        hotel_name,
        hotel_city,
        check_in_date,
        check_out_date,
        total_amount,
        currency,
        status,
        booking_date
      FROM hotel_bookings 
      WHERE user_id = $1 
      ORDER BY booking_date DESC 
      LIMIT 10
    `,
        [id],
      );

      const userDetails = {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        fullName: `${user.first_name} ${user.last_name}`,
        phone: user.phone,
        isActive: user.is_active,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        lastLoginAt: user.last_login_at,

        // Booking statistics
        stats: {
          totalBookings: parseInt(user.total_bookings || "0"),
          totalSpent: parseFloat(user.total_spent || "0"),
          confirmedSpent: parseFloat(user.confirmed_spent || "0"),
          avgBookingValue: parseFloat(user.avg_booking_value || "0"),
          lastBookingDate: user.last_booking_date,
        },

        // Recent bookings
        recentBookings: bookingsResult.rows.map((booking) => ({
          id: booking.id,
          bookingRef: booking.booking_ref,
          hotelName: booking.hotel_name,
          city: booking.hotel_city,
          checkIn: booking.check_in_date,
          checkOut: booking.check_out_date,
          amount: parseFloat(booking.total_amount || "0"),
          currency: booking.currency,
          status: booking.status,
          bookingDate: booking.booking_date,
        })),
      };

      sendSuccess(res, userDetails);
    } catch (error) {
      console.error("❌ Error getting user details:", error);
      handleDatabaseError(res, error);
    }
  },
);

// POST /api/admin/users - Create user (invitation)
router.post(
  "/",
  requirePermission(Permission.MANAGE_USERS),
  async (req: AuthenticatedRequest, res) => {
    try {
      const userData = sanitizeInput(req.body);

      console.log(`➕ Creating new user: ${userData.email}`);

      // Validate input
      const validationErrors = validateUserData(userData);
      if (validationErrors.length > 0) {
        return sendValidationError(res, validationErrors);
      }

      // Check if user already exists
      const existingUser = await pool.query(
        "SELECT id FROM users WHERE email = $1",
        [userData.email],
      );
      if (existingUser.rows.length > 0) {
        return sendError(
          res,
          409,
          "USER_EXISTS",
          "User with this email already exists",
        );
      }

      const result = await pool.query(
        `
      INSERT INTO users (
        email, first_name, last_name, phone, is_active, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *
    `,
        [
          userData.email,
          userData.first_name,
          userData.last_name,
          userData.phone || null,
          userData.is_active !== false,
        ],
      );

      const newUser = result.rows[0];

      // Log audit action
      await logAuditAction(
        req.admin!.id,
        "users",
        "create",
        "user",
        newUser.id,
        null,
        newUser,
        req.ip,
      );

      const userResponse = {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        phone: newUser.phone,
        isActive: newUser.is_active,
        createdAt: newUser.created_at,
        updatedAt: newUser.updated_at,
      };

      sendSuccess(res, userResponse, { created: true });
    } catch (error) {
      console.error("❌ Error creating user:", error);
      handleDatabaseError(res, error);
    }
  },
);

// PUT /api/admin/users/:id - Update user
router.put(
  "/:id",
  requirePermission(Permission.MANAGE_USERS),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const userData = sanitizeInput(req.body);

      console.log(`✏️ Updating user: ${id}`);

      // Get existing user
      const existingResult = await pool.query(
        "SELECT * FROM users WHERE id = $1",
        [id],
      );
      if (existingResult.rows.length === 0) {
        return sendError(res, 404, "USER_NOT_FOUND", "User not found");
      }

      const existingUser = existingResult.rows[0];

      // Validate input
      const validationErrors = validateUserData({
        ...existingUser,
        ...userData,
      });
      if (validationErrors.length > 0) {
        return sendValidationError(res, validationErrors);
      }

      // Check email uniqueness if email is being changed
      if (userData.email && userData.email !== existingUser.email) {
        const emailCheck = await pool.query(
          "SELECT id FROM users WHERE email = $1 AND id != $2",
          [userData.email, id],
        );
        if (emailCheck.rows.length > 0) {
          return sendError(
            res,
            409,
            "EMAIL_EXISTS",
            "Email already in use by another user",
          );
        }
      }

      const result = await pool.query(
        `
      UPDATE users SET 
        email = COALESCE($1, email),
        first_name = COALESCE($2, first_name),
        last_name = COALESCE($3, last_name),
        phone = COALESCE($4, phone),
        is_active = COALESCE($5, is_active),
        updated_at = NOW()
      WHERE id = $6
      RETURNING *
    `,
        [
          userData.email,
          userData.first_name,
          userData.last_name,
          userData.phone,
          userData.is_active,
          id,
        ],
      );

      const updatedUser = result.rows[0];

      // Log audit action
      await logAuditAction(
        req.admin!.id,
        "users",
        "update",
        "user",
        id,
        existingUser,
        updatedUser,
        req.ip,
      );

      const userResponse = {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
        phone: updatedUser.phone,
        isActive: updatedUser.is_active,
        createdAt: updatedUser.created_at,
        updatedAt: updatedUser.updated_at,
      };

      sendSuccess(res, userResponse, { updated: true });
    } catch (error) {
      console.error("❌ Error updating user:", error);
      handleDatabaseError(res, error);
    }
  },
);

// PATCH /api/admin/users/:id/status - Toggle user status
router.patch(
  "/:id/status",
  requirePermission(Permission.MANAGE_USERS),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { is_active } = req.body;

      console.log(`🔄 Toggling user status: ${id} -> ${is_active}`);

      const existingResult = await pool.query(
        "SELECT * FROM users WHERE id = $1",
        [id],
      );
      if (existingResult.rows.length === 0) {
        return sendError(res, 404, "USER_NOT_FOUND", "User not found");
      }

      const existingUser = existingResult.rows[0];

      const result = await pool.query(
        `
      UPDATE users SET 
        is_active = $1,
        updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `,
        [is_active, id],
      );

      const updatedUser = result.rows[0];

      // Log audit action
      await logAuditAction(
        req.admin!.id,
        "users",
        "status_change",
        "user",
        id,
        { is_active: existingUser.is_active },
        { is_active: updatedUser.is_active },
        req.ip,
      );

      sendSuccess(res, {
        id: updatedUser.id,
        isActive: updatedUser.is_active,
        status: updatedUser.is_active ? "active" : "inactive",
      });
    } catch (error) {
      console.error("❌ Error updating user status:", error);
      handleDatabaseError(res, error);
    }
  },
);

// DELETE /api/admin/users/:id - Deactivate user (soft delete)
router.delete(
  "/:id",
  requirePermission(Permission.MANAGE_USERS),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;

      console.log(`🗑️ Deactivating user: ${id}`);

      const existingResult = await pool.query(
        "SELECT * FROM users WHERE id = $1",
        [id],
      );
      if (existingResult.rows.length === 0) {
        return sendError(res, 404, "USER_NOT_FOUND", "User not found");
      }

      const existingUser = existingResult.rows[0];

      // Soft delete by setting is_active to false
      const result = await pool.query(
        `
      UPDATE users SET 
        is_active = false,
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `,
        [id],
      );

      // Log audit action
      await logAuditAction(
        req.admin!.id,
        "users",
        "deactivate",
        "user",
        id,
        existingUser,
        result.rows[0],
        req.ip,
      );

      sendSuccess(res, { id, deactivated: true });
    } catch (error) {
      console.error("❌ Error deactivating user:", error);
      handleDatabaseError(res, error);
    }
  },
);

// GET /api/admin/users/stats/summary - User statistics
router.get(
  "/stats/summary",
  requirePermission(Permission.VIEW_USERS),
  async (req: AuthenticatedRequest, res) => {
    try {
      console.log("📊 Getting user statistics summary");

      const [
        totalUsersResult,
        activeUsersResult,
        newUsersResult,
        topSpendersResult,
      ] = await Promise.all([
        // Total users
        pool.query("SELECT COUNT(*) as total FROM users"),

        // Active users
        pool.query(
          "SELECT COUNT(*) as active FROM users WHERE is_active = true",
        ),

        // New users (last 30 days)
        pool.query(
          "SELECT COUNT(*) as new_users FROM users WHERE created_at >= NOW() - INTERVAL '30 days'",
        ),

        // Top spenders
        pool.query(`
        SELECT 
          u.id,
          u.first_name,
          u.last_name,
          u.email,
          COUNT(hb.id) as booking_count,
          COALESCE(SUM(hb.total_amount), 0) as total_spent
        FROM users u
        LEFT JOIN hotel_bookings hb ON u.id = hb.user_id
        WHERE u.is_active = true
        GROUP BY u.id, u.first_name, u.last_name, u.email
        HAVING COUNT(hb.id) > 0
        ORDER BY total_spent DESC
        LIMIT 10
      `),
      ]);

      const stats = {
        totalUsers: parseInt(totalUsersResult.rows[0]?.total || "0"),
        activeUsers: parseInt(activeUsersResult.rows[0]?.active || "0"),
        inactiveUsers:
          parseInt(totalUsersResult.rows[0]?.total || "0") -
          parseInt(activeUsersResult.rows[0]?.active || "0"),
        newUsersThisMonth: parseInt(newUsersResult.rows[0]?.new_users || "0"),
        topSpenders: topSpendersResult.rows.map((row) => ({
          id: row.id,
          name: `${row.first_name} ${row.last_name}`,
          email: row.email,
          bookingCount: parseInt(row.booking_count || "0"),
          totalSpent: parseFloat(row.total_spent || "0"),
        })),
      };

      sendSuccess(res, stats);
    } catch (error) {
      console.error("❌ Error getting user stats:", error);
      handleDatabaseError(res, error);
    }
  },
);

export default router;
