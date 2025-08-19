const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Get sightseeing statistics
router.get("/stats", async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM sightseeing_items) as total_activities,
        (SELECT COUNT(*) FROM sightseeing_items WHERE is_active = true) as active_activities,
        (SELECT COUNT(*) FROM sightseeing_bookings) as total_bookings,
        (SELECT COUNT(*) FROM sightseeing_bookings WHERE status = 'pending') as pending_bookings,
        (SELECT COALESCE(SUM(total_amount), 0) FROM sightseeing_bookings WHERE status IN ('confirmed', 'completed')) as total_revenue,
        (SELECT COUNT(*) FROM sightseeing_promocodes WHERE is_active = true AND valid_to > NOW()) as active_promo_codes
    `);

    res.json(stats.rows[0]);
  } catch (error) {
    console.error("Error fetching sightseeing stats:", error);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
});

// Activities management
router.get("/activities", async (req, res) => {
  try {
    const { page = 1, limit = 50, search = "", status = "all" } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = "WHERE 1=1";
    const queryParams = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      whereClause += ` AND (activity_name ILIKE $${paramCount} OR destination_name ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }

    if (status !== "all") {
      paramCount++;
      whereClause += ` AND is_active = $${paramCount}`;
      queryParams.push(status === "active");
    }

    paramCount++;
    queryParams.push(limit);
    paramCount++;
    queryParams.push(offset);

    const query = `
      SELECT 
        id,
        activity_code as activity_id,
        activity_name as name,
        category,
        destination_name as destination,
        duration_minutes / 60.0 as duration,
        base_price as price,
        currency,
        rating,
        main_image_url as image_url,
        activity_description as description,
        includes as inclusions,
        excludes as exclusions,
        available_times,
        1 as min_capacity,
        10 as max_capacity,
        CASE WHEN is_active THEN 'active' ELSE 'inactive' END as status,
        created_at,
        updated_at
      FROM sightseeing_items 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramCount - 1} OFFSET $${paramCount}
    `;

    const result = await pool.query(query, queryParams);

    // Format the data for frontend
    const activities = result.rows.map((row) => ({
      ...row,
      inclusions: row.inclusions || [],
      exclusions: row.exclusions || [],
      available_times: row.available_times || [],
    }));

    res.json(activities);
  } catch (error) {
    console.error("Error fetching activities:", error);
    res.status(500).json({ error: "Failed to fetch activities" });
  }
});

router.post("/activities", async (req, res) => {
  try {
    const {
      name,
      category,
      destination,
      duration,
      price,
      currency = "USD",
      description,
      inclusions,
      exclusions,
      available_times,
      min_capacity,
      max_capacity,
      status,
    } = req.body;

    const query = `
      INSERT INTO sightseeing_items (
        activity_code,
        activity_name,
        category,
        destination_name,
        duration_minutes,
        base_price,
        currency,
        activity_description,
        includes,
        excludes,
        available_times,
        is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;

    const activityCode = `ACT${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    const result = await pool.query(query, [
      activityCode,
      name,
      category,
      destination,
      duration * 60, // Convert hours to minutes
      price,
      currency,
      description,
      JSON.stringify(inclusions),
      JSON.stringify(exclusions),
      JSON.stringify(available_times),
      status === "active",
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating activity:", error);
    res.status(500).json({ error: "Failed to create activity" });
  }
});

router.put("/activities/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      category,
      destination,
      duration,
      price,
      currency,
      description,
      inclusions,
      exclusions,
      available_times,
      status,
    } = req.body;

    const query = `
      UPDATE sightseeing_items SET
        activity_name = $1,
        category = $2,
        destination_name = $3,
        duration_minutes = $4,
        base_price = $5,
        currency = $6,
        activity_description = $7,
        includes = $8,
        excludes = $9,
        available_times = $10,
        is_active = $11,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $12
      RETURNING *
    `;

    const result = await pool.query(query, [
      name,
      category,
      destination,
      duration * 60,
      price,
      currency,
      description,
      JSON.stringify(inclusions),
      JSON.stringify(exclusions),
      JSON.stringify(available_times),
      status === "active",
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Activity not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating activity:", error);
    res.status(500).json({ error: "Failed to update activity" });
  }
});

router.delete("/activities/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM sightseeing_items WHERE id = $1 RETURNING id",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Activity not found" });
    }

    res.json({ message: "Activity deleted successfully" });
  } catch (error) {
    console.error("Error deleting activity:", error);
    res.status(500).json({ error: "Failed to delete activity" });
  }
});

// Bookings management
router.get("/bookings", async (req, res) => {
  try {
    const { page = 1, limit = 50, search = "", status = "all" } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = "WHERE 1=1";
    const queryParams = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      whereClause += ` AND (booking_ref ILIKE $${paramCount} OR activity_name ILIKE $${paramCount} OR guest_details->>'primaryGuest'->>'firstName' ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }

    if (status !== "all") {
      paramCount++;
      whereClause += ` AND status = $${paramCount}`;
      queryParams.push(status);
    }

    paramCount++;
    queryParams.push(limit);
    paramCount++;
    queryParams.push(offset);

    const query = `
      SELECT 
        id,
        booking_ref as booking_reference,
        activity_code as activity_id,
        activity_name,
        user_id,
        (guest_details->>'primaryGuest'->>'firstName')::text || ' ' || 
        (guest_details->>'primaryGuest'->>'lastName')::text as guest_name,
        guest_details->>'contactInfo'->>'email' as guest_email,
        guest_details->>'contactInfo'->>'phone' as guest_phone,
        visit_date,
        visit_time as selected_time,
        adults_count + children_count as guest_count,
        total_amount as total_price,
        currency,
        status,
        'paid' as payment_status,
        '' as voucher_code,
        special_requests,
        created_at,
        updated_at
      FROM sightseeing_bookings 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramCount - 1} OFFSET $${paramCount}
    `;

    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

// Markup rules management
router.get("/markup-rules", async (req, res) => {
  try {
    const query = `
      SELECT 
        id,
        rule_name as name,
        markup_type as type,
        markup_value as value,
        JSONB_BUILD_OBJECT(
          'destination', destination_code,
          'category', category,
          'price_range', CASE 
            WHEN minimum_margin > 0 OR maximum_markup > 0 
            THEN JSONB_BUILD_OBJECT('min', minimum_margin, 'max', maximum_markup)
            ELSE NULL 
          END,
          'date_range', CASE 
            WHEN valid_from IS NOT NULL AND valid_to IS NOT NULL 
            THEN JSONB_BUILD_OBJECT('start', valid_from, 'end', valid_to)
            ELSE NULL 
          END
        ) as conditions,
        priority,
        is_active,
        created_at,
        updated_at
      FROM sightseeing_markup_rules 
      ORDER BY priority DESC, created_at DESC
    `;

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching markup rules:", error);
    res.status(500).json({ error: "Failed to fetch markup rules" });
  }
});

router.post("/markup-rules", async (req, res) => {
  try {
    const {
      name,
      type,
      value,
      conditions = {},
      priority,
      is_active,
    } = req.body;

    const query = `
      INSERT INTO sightseeing_markup_rules (
        rule_name,
        rule_type,
        markup_type,
        markup_value,
        destination_code,
        category,
        valid_from,
        valid_to,
        minimum_margin,
        maximum_markup,
        priority,
        is_active,
        created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;

    const result = await pool.query(query, [
      name,
      conditions.destination || conditions.category ? "specific" : "global",
      type,
      value,
      conditions.destination || null,
      conditions.category || null,
      conditions.date_range?.start || null,
      conditions.date_range?.end || null,
      conditions.price_range?.min || 0,
      conditions.price_range?.max || null,
      priority,
      is_active,
      "admin",
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating markup rule:", error);
    res.status(500).json({ error: "Failed to create markup rule" });
  }
});

router.put("/markup-rules/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      type,
      value,
      conditions = {},
      priority,
      is_active,
    } = req.body;

    const query = `
      UPDATE sightseeing_markup_rules SET
        rule_name = $1,
        markup_type = $2,
        markup_value = $3,
        destination_code = $4,
        category = $5,
        valid_from = $6,
        valid_to = $7,
        minimum_margin = $8,
        maximum_markup = $9,
        priority = $10,
        is_active = $11,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $12
      RETURNING *
    `;

    const result = await pool.query(query, [
      name,
      type,
      value,
      conditions.destination || null,
      conditions.category || null,
      conditions.date_range?.start || null,
      conditions.date_range?.end || null,
      conditions.price_range?.min || 0,
      conditions.price_range?.max || null,
      priority,
      is_active,
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Markup rule not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating markup rule:", error);
    res.status(500).json({ error: "Failed to update markup rule" });
  }
});

router.delete("/markup-rules/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM sightseeing_markup_rules WHERE id = $1 RETURNING id",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Markup rule not found" });
    }

    res.json({ message: "Markup rule deleted successfully" });
  } catch (error) {
    console.error("Error deleting markup rule:", error);
    res.status(500).json({ error: "Failed to delete markup rule" });
  }
});

// Promo codes management
router.get("/promo-codes", async (req, res) => {
  try {
    const query = `
      SELECT 
        id,
        code,
        discount_type as type,
        discount_value as value,
        minimum_booking_amount as min_booking_amount,
        maximum_discount as max_discount_amount,
        usage_limit,
        usage_count as used_count,
        valid_from,
        valid_to as valid_until,
        is_active,
        created_at,
        updated_at
      FROM sightseeing_promocodes 
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching promo codes:", error);
    res.status(500).json({ error: "Failed to fetch promo codes" });
  }
});

router.post("/promo-codes", async (req, res) => {
  try {
    const {
      code,
      type,
      value,
      min_booking_amount,
      max_discount_amount,
      usage_limit,
      valid_from,
      valid_until,
      is_active,
    } = req.body;

    const query = `
      INSERT INTO sightseeing_promocodes (
        code,
        title,
        description,
        discount_type,
        discount_value,
        maximum_discount,
        minimum_booking_amount,
        usage_limit,
        valid_from,
        valid_to,
        is_active,
        created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;

    const result = await pool.query(query, [
      code.toUpperCase(),
      `${code} Promotion`,
      `${type === "percentage" ? value + "%" : "$" + value} discount`,
      type,
      value,
      max_discount_amount || null,
      min_booking_amount,
      usage_limit,
      valid_from,
      valid_until,
      is_active,
      "admin",
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating promo code:", error);
    if (error.code === "23505") {
      res.status(400).json({ error: "Promo code already exists" });
    } else {
      res.status(500).json({ error: "Failed to create promo code" });
    }
  }
});

router.put("/promo-codes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      code,
      type,
      value,
      min_booking_amount,
      max_discount_amount,
      usage_limit,
      valid_from,
      valid_until,
      is_active,
    } = req.body;

    const query = `
      UPDATE sightseeing_promocodes SET
        code = $1,
        title = $2,
        description = $3,
        discount_type = $4,
        discount_value = $5,
        maximum_discount = $6,
        minimum_booking_amount = $7,
        usage_limit = $8,
        valid_from = $9,
        valid_to = $10,
        is_active = $11,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $12
      RETURNING *
    `;

    const result = await pool.query(query, [
      code.toUpperCase(),
      `${code} Promotion`,
      `${type === "percentage" ? value + "%" : "$" + value} discount`,
      type,
      value,
      max_discount_amount || null,
      min_booking_amount,
      usage_limit,
      valid_from,
      valid_until,
      is_active,
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Promo code not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating promo code:", error);
    res.status(500).json({ error: "Failed to update promo code" });
  }
});

router.delete("/promo-codes/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM sightseeing_promocodes WHERE id = $1 RETURNING id",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Promo code not found" });
    }

    res.json({ message: "Promo code deleted successfully" });
  } catch (error) {
    console.error("Error deleting promo code:", error);
    res.status(500).json({ error: "Failed to delete promo code" });
  }
});

module.exports = router;
