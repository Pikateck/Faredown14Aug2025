import { Response } from "express";
import { Pool } from "pg";

// Common response interfaces
export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: any;
}

// Database connection pool
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Pagination helper
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sort?: string;
  order?: "ASC" | "DESC";
  q?: string;
}

export const parsePaginationParams = (query: any): PaginationParams => {
  return {
    page: Math.max(1, parseInt(query.page) || 1),
    pageSize: Math.min(100, Math.max(1, parseInt(query.pageSize) || 20)),
    sort: query.sort || "created_at",
    order: query.order?.toUpperCase() === "ASC" ? "ASC" : "DESC",
    q: query.q?.trim() || undefined,
  };
};

// SQL query builder for pagination
export const buildPaginatedQuery = (
  baseQuery: string,
  params: PaginationParams,
  searchFields: string[] = [],
): { query: string; countQuery: string; queryParams: any[] } => {
  let query = baseQuery;
  let whereClause = "";
  const queryParams: any[] = [];
  let paramIndex = 1;

  // Add search if provided
  if (params.q && searchFields.length > 0) {
    const searchConditions = searchFields.map(() => {
      return `LOWER($${paramIndex}) LIKE LOWER($${paramIndex + 1})`;
    });

    searchFields.forEach((field) => {
      queryParams.push(field, `%${params.q}%`);
      paramIndex += 2;
    });

    whereClause = `WHERE (${searchConditions.join(" OR ")})`;
  }

  // Build complete query with pagination
  const orderClause = `ORDER BY ${params.sort} ${params.order}`;
  const limitClause = `LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;

  queryParams.push(params.pageSize);
  queryParams.push((params.page! - 1) * params.pageSize!);

  query = `${query} ${whereClause} ${orderClause} ${limitClause}`;

  // Count query for total records
  const countQuery = `SELECT COUNT(*) as total FROM (${baseQuery}) as base_query ${whereClause}`;

  return { query, countQuery, queryParams };
};

// Execute paginated query
export const executePaginatedQuery = async <T>(
  baseQuery: string,
  params: PaginationParams,
  searchFields: string[] = [],
): Promise<PaginatedResponse<T>> => {
  try {
    const { query, countQuery, queryParams } = buildPaginatedQuery(
      baseQuery,
      params,
      searchFields,
    );

    // Execute both queries
    const [dataResult, countResult] = await Promise.all([
      pool.query(query, queryParams),
      pool.query(countQuery, queryParams.slice(0, -2)), // Remove LIMIT/OFFSET params for count
    ]);

    const total = parseInt(countResult.rows[0]?.total || "0");
    const totalPages = Math.ceil(total / params.pageSize!);

    return {
      items: dataResult.rows,
      page: params.page!,
      pageSize: params.pageSize!,
      total,
      totalPages,
    };
  } catch (error) {
    console.error("Paginated query error:", error);
    throw error;
  }
};

// Standard success response
export const sendSuccess = <T>(res: Response, data: T, meta?: any) => {
  res.json({
    success: true,
    data,
    meta,
  } as ApiResponse<T>);
};

// Standard error response
export const sendError = (
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  details?: any,
) => {
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details,
    },
  } as ApiResponse);
};

// Validation error response
export const sendValidationError = (res: Response, errors: any) => {
  sendError(res, 400, "VALIDATION_ERROR", "Validation failed", errors);
};

// Database error handler
export const handleDatabaseError = (res: Response, error: any) => {
  console.error("Database error:", error);

  if (error.code === "23505") {
    sendError(res, 409, "DUPLICATE_ENTRY", "Record already exists");
  } else if (error.code === "23503") {
    sendError(res, 400, "FOREIGN_KEY_VIOLATION", "Referenced record not found");
  } else if (error.code === "23502") {
    sendError(res, 400, "NOT_NULL_VIOLATION", "Required field missing");
  } else {
    sendError(res, 500, "DATABASE_ERROR", "Database operation failed");
  }
};

// Transaction wrapper
export const withTransaction = async <T>(
  callback: (client: any) => Promise<T>,
): Promise<T> => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

// Audit logging helper
export const logAuditAction = async (
  adminId: string,
  module: string,
  action: string,
  entityType: string,
  entityId: string,
  beforeData?: any,
  afterData?: any,
  ipAddress?: string,
) => {
  try {
    await pool.query(
      `
      INSERT INTO admin_audit_log (
        admin_id, module, action, entity_type, entity_id, 
        before_data, after_data, ip_address, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
    `,
      [
        adminId,
        module,
        action,
        entityType,
        entityId,
        beforeData ? JSON.stringify(beforeData) : null,
        afterData ? JSON.stringify(afterData) : null,
        ipAddress,
      ],
    );
  } catch (error) {
    console.error("Audit logging failed:", error);
    // Don't throw - audit failure shouldn't break the main operation
  }
};

// Input sanitization
export const sanitizeInput = (input: any): any => {
  if (typeof input === "string") {
    return input.trim();
  }
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  if (typeof input === "object" && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  return input;
};

// Date range validation
export const validateDateRange = (from?: string, to?: string) => {
  const errors: string[] = [];

  if (from && isNaN(Date.parse(from))) {
    errors.push("Invalid from date format");
  }

  if (to && isNaN(Date.parse(to))) {
    errors.push("Invalid to date format");
  }

  if (from && to && new Date(from) > new Date(to)) {
    errors.push("From date must be before to date");
  }

  return errors;
};

// Currency formatting
export const formatCurrency = (
  amount: number,
  currency: string = "INR",
): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

// Common database queries
export const getRecordById = async (table: string, id: string) => {
  const result = await pool.query(`SELECT * FROM ${table} WHERE id = $1`, [id]);
  return result.rows[0] || null;
};

export const deleteRecord = async (table: string, id: string) => {
  const result = await pool.query(
    `DELETE FROM ${table} WHERE id = $1 RETURNING *`,
    [id],
  );
  return result.rows[0] || null;
};

export const updateRecord = async (table: string, id: string, updates: any) => {
  const fields = Object.keys(updates);
  const values = Object.values(updates);

  const setClause = fields
    .map((field, index) => `${field} = $${index + 2}`)
    .join(", ");

  const result = await pool.query(
    `UPDATE ${table} SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id, ...values],
  );

  return result.rows[0] || null;
};
