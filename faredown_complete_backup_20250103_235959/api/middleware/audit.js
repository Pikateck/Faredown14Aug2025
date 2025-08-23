/**
 * Audit Logging Middleware
 * Tracks all admin actions for security and compliance
 */

const winston = require("winston");
const path = require("path");

// Configure Winston logger for audit logs
const auditLogger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  defaultMeta: { service: "faredown-audit" },
  transports: [
    // Write all audit logs to audit.log file
    new winston.transports.File({
      filename: path.join(__dirname, "../logs/audit.log"),
      maxsize: 5242880, // 5MB
      maxFiles: 10,
    }),
    // Write errors to separate error log
    new winston.transports.File({
      filename: path.join(__dirname, "../logs/error.log"),
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Also log to console in development
if (process.env.NODE_ENV !== "production") {
  auditLogger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
  );
}

// In-memory audit trail for quick access (last 1000 entries)
const auditTrail = [];
const MAX_MEMORY_ENTRIES = 1000;

/**
 * Add audit entry to memory trail
 */
const addToMemoryTrail = (entry) => {
  auditTrail.unshift(entry);
  if (auditTrail.length > MAX_MEMORY_ENTRIES) {
    auditTrail.pop();
  }
};

/**
 * Get client IP address
 */
const getClientIP = (req) => {
  return (
    req.ip ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.headers["x-real-ip"] ||
    "unknown"
  );
};

/**
 * Get user agent information
 */
const getUserAgent = (req) => {
  return req.headers["user-agent"] || "unknown";
};

/**
 * Get request details
 */
const getRequestDetails = (req) => {
  const sensitiveFields = ["password", "token", "secret", "key"];

  const sanitizeObject = (obj) => {
    if (!obj || typeof obj !== "object") return obj;

    const sanitized = { ...obj };
    Object.keys(sanitized).forEach((key) => {
      if (sensitiveFields.some((field) => key.toLowerCase().includes(field))) {
        sanitized[key] = "[REDACTED]";
      } else if (typeof sanitized[key] === "object") {
        sanitized[key] = sanitizeObject(sanitized[key]);
      }
    });

    return sanitized;
  };

  return {
    method: req.method,
    url: req.originalUrl || req.url,
    params: sanitizeObject(req.params),
    query: sanitizeObject(req.query),
    body: sanitizeObject(req.body),
    headers: {
      "content-type": req.headers["content-type"],
      authorization: req.headers["authorization"] ? "[PRESENT]" : "[ABSENT]",
      "x-forwarded-for": req.headers["x-forwarded-for"],
      "user-agent": req.headers["user-agent"],
    },
  };
};

/**
 * Audit action types
 */
const ACTION_TYPES = {
  // Authentication
  LOGIN: "AUTH_LOGIN",
  LOGOUT: "AUTH_LOGOUT",
  LOGIN_FAILED: "AUTH_LOGIN_FAILED",
  TOKEN_REFRESH: "AUTH_TOKEN_REFRESH",

  // User Management
  USER_CREATE: "USER_CREATE",
  USER_UPDATE: "USER_UPDATE",
  USER_DELETE: "USER_DELETE",
  USER_VIEW: "USER_VIEW",
  USER_ACTIVATE: "USER_ACTIVATE",
  USER_DEACTIVATE: "USER_DEACTIVATE",

  // Booking Management
  BOOKING_CREATE: "BOOKING_CREATE",
  BOOKING_UPDATE: "BOOKING_UPDATE",
  BOOKING_CANCEL: "BOOKING_CANCEL",
  BOOKING_VIEW: "BOOKING_VIEW",
  BOOKING_REFUND: "BOOKING_REFUND",

  // Financial Operations
  PAYMENT_PROCESS: "PAYMENT_PROCESS",
  REFUND_PROCESS: "REFUND_PROCESS",
  PAYMENT_VIEW: "PAYMENT_VIEW",
  FINANCE_REPORT: "FINANCE_REPORT",

  // System Operations
  CONFIG_UPDATE: "CONFIG_UPDATE",
  BACKUP_CREATE: "BACKUP_CREATE",
  BACKUP_RESTORE: "BACKUP_RESTORE",
  SYSTEM_RESTART: "SYSTEM_RESTART",

  // Content Management
  CONTENT_CREATE: "CONTENT_CREATE",
  CONTENT_UPDATE: "CONTENT_UPDATE",
  CONTENT_DELETE: "CONTENT_DELETE",
  CONTENT_PUBLISH: "CONTENT_PUBLISH",

  // Analytics
  REPORT_GENERATE: "REPORT_GENERATE",
  ANALYTICS_VIEW: "ANALYTICS_VIEW",
  DATA_EXPORT: "DATA_EXPORT",

  // Security
  PERMISSION_CHANGE: "PERMISSION_CHANGE",
  ROLE_CHANGE: "ROLE_CHANGE",
  SECURITY_ALERT: "SECURITY_ALERT",

  // General
  API_ACCESS: "API_ACCESS",
  DATA_ACCESS: "DATA_ACCESS",
  ERROR: "ERROR",
};

/**
 * Create audit log entry
 */
const createAuditEntry = (actionType, req, additionalData = {}) => {
  const timestamp = new Date().toISOString();
  const user = req.user || {
    id: "anonymous",
    username: "anonymous",
    role: "guest",
  };

  const entry = {
    id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp,
    actionType,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      department: user.department,
    },
    request: getRequestDetails(req),
    client: {
      ip: getClientIP(req),
      userAgent: getUserAgent(req),
    },
    ...additionalData,
  };

  return entry;
};

/**
 * Log audit event
 */
const logAuditEvent = (actionType, req, additionalData = {}) => {
  const entry = createAuditEntry(actionType, req, additionalData);

  // Log to Winston
  auditLogger.info("Audit Event", entry);

  // Add to memory trail
  addToMemoryTrail(entry);

  return entry;
};

/**
 * Audit middleware for logging all admin requests
 */
const auditMiddleware = (req, res, next) => {
  // Skip audit for certain endpoints
  const skipPaths = ["/health", "/api/docs", "/favicon.ico"];
  if (skipPaths.some((path) => req.originalUrl.startsWith(path))) {
    return next();
  }

  const startTime = Date.now();

  // Log the request
  const entry = createAuditEntry(ACTION_TYPES.API_ACCESS, req, {
    requestStartTime: startTime,
  });

  // Override res.json to capture response
  const originalJson = res.json;
  res.json = function (data) {
    const endTime = Date.now();
    const duration = endTime - startTime;

    // Update audit entry with response information
    const responseEntry = {
      ...entry,
      response: {
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        success: res.statusCode < 400,
      },
      requestEndTime: endTime,
    };

    // Log the complete request-response cycle
    auditLogger.info("API Request Completed", responseEntry);
    addToMemoryTrail(responseEntry);

    // Call original json method
    return originalJson.call(this, data);
  };

  // Log errors
  res.on("error", (error) => {
    logAuditEvent(ACTION_TYPES.ERROR, req, {
      error: {
        message: error.message,
        stack: error.stack,
      },
      severity: "high",
    });
  });

  next();
};

/**
 * Specific audit functions for different actions
 */
const audit = {
  login: (req, user, success = true) => {
    return logAuditEvent(
      success ? ACTION_TYPES.LOGIN : ACTION_TYPES.LOGIN_FAILED,
      req,
      {
        targetUser: success ? { id: user.id, username: user.username } : null,
        loginAttempt: { success, timestamp: new Date().toISOString() },
      },
    );
  },

  logout: (req) => {
    return logAuditEvent(ACTION_TYPES.LOGOUT, req);
  },

  userAction: (req, action, targetUser, changes = {}) => {
    const actionTypes = {
      create: ACTION_TYPES.USER_CREATE,
      update: ACTION_TYPES.USER_UPDATE,
      delete: ACTION_TYPES.USER_DELETE,
      view: ACTION_TYPES.USER_VIEW,
      activate: ACTION_TYPES.USER_ACTIVATE,
      deactivate: ACTION_TYPES.USER_DEACTIVATE,
    };

    return logAuditEvent(actionTypes[action] || ACTION_TYPES.USER_VIEW, req, {
      targetUser: {
        id: targetUser.id,
        username: targetUser.username,
        role: targetUser.role,
      },
      changes,
    });
  },

  bookingAction: (req, action, bookingId, changes = {}) => {
    const actionTypes = {
      create: ACTION_TYPES.BOOKING_CREATE,
      update: ACTION_TYPES.BOOKING_UPDATE,
      cancel: ACTION_TYPES.BOOKING_CANCEL,
      view: ACTION_TYPES.BOOKING_VIEW,
      refund: ACTION_TYPES.BOOKING_REFUND,
    };

    return logAuditEvent(
      actionTypes[action] || ACTION_TYPES.BOOKING_VIEW,
      req,
      {
        bookingId,
        changes,
      },
    );
  },

  paymentAction: (req, action, paymentData) => {
    const actionTypes = {
      process: ACTION_TYPES.PAYMENT_PROCESS,
      refund: ACTION_TYPES.REFUND_PROCESS,
      view: ACTION_TYPES.PAYMENT_VIEW,
    };

    return logAuditEvent(
      actionTypes[action] || ACTION_TYPES.PAYMENT_VIEW,
      req,
      {
        paymentId: paymentData.id,
        amount: paymentData.amount,
        currency: paymentData.currency,
        method: paymentData.method,
      },
    );
  },

  contentAction: (req, action, contentData) => {
    const actionTypes = {
      create: ACTION_TYPES.CONTENT_CREATE,
      update: ACTION_TYPES.CONTENT_UPDATE,
      delete: ACTION_TYPES.CONTENT_DELETE,
      publish: ACTION_TYPES.CONTENT_PUBLISH,
    };

    return logAuditEvent(
      actionTypes[action] || ACTION_TYPES.CONTENT_CREATE,
      req,
      {
        contentId: contentData.id,
        contentType: contentData.type,
        title: contentData.title,
      },
    );
  },

  systemAction: (req, action, details = {}) => {
    const actionTypes = {
      config: ACTION_TYPES.CONFIG_UPDATE,
      backup: ACTION_TYPES.BACKUP_CREATE,
      restore: ACTION_TYPES.BACKUP_RESTORE,
      restart: ACTION_TYPES.SYSTEM_RESTART,
    };

    return logAuditEvent(
      actionTypes[action] || ACTION_TYPES.CONFIG_UPDATE,
      req,
      details,
    );
  },

  securityEvent: (req, event, details = {}) => {
    return logAuditEvent(ACTION_TYPES.SECURITY_ALERT, req, {
      securityEvent: event,
      severity: details.severity || "medium",
      ...details,
    });
  },
};

/**
 * Get audit trail
 */
const getAuditTrail = (filters = {}) => {
  let filtered = [...auditTrail];

  // Apply filters
  if (filters.userId) {
    filtered = filtered.filter((entry) => entry.user.id === filters.userId);
  }

  if (filters.actionType) {
    filtered = filtered.filter(
      (entry) => entry.actionType === filters.actionType,
    );
  }

  if (filters.startDate && filters.endDate) {
    const start = new Date(filters.startDate);
    const end = new Date(filters.endDate);
    filtered = filtered.filter((entry) => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= start && entryDate <= end;
    });
  }

  if (filters.ip) {
    filtered = filtered.filter((entry) => entry.client.ip === filters.ip);
  }

  return filtered;
};

/**
 * Get audit statistics
 */
const getAuditStats = (timeframe = "24h") => {
  const now = new Date();
  let startTime;

  switch (timeframe) {
    case "1h":
      startTime = new Date(now.getTime() - 60 * 60 * 1000);
      break;
    case "24h":
      startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case "7d":
      startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "30d":
      startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }

  const recentEntries = auditTrail.filter(
    (entry) => new Date(entry.timestamp) >= startTime,
  );

  const stats = {
    total: recentEntries.length,
    byActionType: {},
    byUser: {},
    byIP: {},
    errors: 0,
    timeframe,
  };

  recentEntries.forEach((entry) => {
    // Count by action type
    stats.byActionType[entry.actionType] =
      (stats.byActionType[entry.actionType] || 0) + 1;

    // Count by user
    stats.byUser[entry.user.username] =
      (stats.byUser[entry.user.username] || 0) + 1;

    // Count by IP
    stats.byIP[entry.client.ip] = (stats.byIP[entry.client.ip] || 0) + 1;

    // Count errors
    if (
      entry.actionType === ACTION_TYPES.ERROR ||
      (entry.response && entry.response.statusCode >= 400)
    ) {
      stats.errors++;
    }
  });

  return stats;
};

module.exports = {
  auditLogger: auditMiddleware,
  logAuditEvent,
  audit,
  getAuditTrail,
  getAuditStats,
  ACTION_TYPES,
};
