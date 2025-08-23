/**
 * Request Validation Middleware
 * Joi-based validation for API requests
 */

const Joi = require("joi");

/**
 * Validation schemas
 */
const schemas = {
  // Authentication schemas
  login: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().min(6).required(),
    department: Joi.string().optional(),
  }),

  register: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string()
      .min(8)
      .pattern(
        new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])"),
      )
      .required()
      .messages({
        "string.pattern.base":
          "Password must contain at least one lowercase letter, one uppercase letter, one number and one special character",
      }),
    role: Joi.string()
      .valid(
        "admin",
        "sales_manager",
        "support",
        "accounts",
        "marketing",
        "user",
      )
      .optional(),
    department: Joi.string().optional(),
  }),

  // User management schemas
  createUser: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    role: Joi.string()
      .valid(
        "admin",
        "sales_manager",
        "support",
        "accounts",
        "marketing",
        "user",
      )
      .required(),
    department: Joi.string().required(),
    firstName: Joi.string().min(2).max(50).optional(),
    lastName: Joi.string().min(2).max(50).optional(),
    phone: Joi.string()
      .pattern(/^[+]?[1-9][\d\s\-\(\)]{7,15}$/)
      .optional(),
  }),

  updateUser: Joi.object({
    email: Joi.string().email().optional(),
    role: Joi.string()
      .valid(
        "admin",
        "sales_manager",
        "support",
        "accounts",
        "marketing",
        "user",
      )
      .optional(),
    department: Joi.string().optional(),
    firstName: Joi.string().min(2).max(50).optional(),
    lastName: Joi.string().min(2).max(50).optional(),
    phone: Joi.string()
      .pattern(/^[+]?[1-9][\d\s\-\(\)]{7,15}$/)
      .optional(),
    isActive: Joi.boolean().optional(),
  }),

  // Booking schemas
  createBooking: Joi.object({
    type: Joi.string().valid("flight", "hotel").required(),
    customerId: Joi.string().required(),
    details: Joi.object().required(),
    amount: Joi.number().positive().required(),
    currency: Joi.string().length(3).uppercase().default("INR"),
    paymentMethod: Joi.string().optional(),
    specialRequests: Joi.string().max(500).optional(),
  }),

  updateBooking: Joi.object({
    status: Joi.string()
      .valid("pending", "confirmed", "cancelled", "completed")
      .optional(),
    amount: Joi.number().positive().optional(),
    specialRequests: Joi.string().max(500).optional(),
    notes: Joi.string().max(1000).optional(),
  }),

  // Flight search schema
  flightSearch: Joi.object({
    from: Joi.string().length(3).uppercase().required(),
    to: Joi.string().length(3).uppercase().required(),
    departureDate: Joi.date().iso().min("now").required(),
    returnDate: Joi.date().iso().min(Joi.ref("departureDate")).optional(),
    adults: Joi.number().integer().min(1).max(9).default(1),
    children: Joi.number().integer().min(0).max(8).default(0),
    infants: Joi.number().integer().min(0).max(2).default(0),
    class: Joi.string()
      .valid("economy", "premium_economy", "business", "first")
      .default("economy"),
    tripType: Joi.string()
      .valid("one_way", "round_trip", "multi_city")
      .default("one_way"),
  }),

  // Hotel search schema
  hotelSearch: Joi.object({
    destination: Joi.string().min(2).required(),
    checkIn: Joi.date().iso().min("now").required(),
    checkOut: Joi.date().iso().min(Joi.ref("checkIn")).required(),
    adults: Joi.number().integer().min(1).max(20).default(2),
    children: Joi.number().integer().min(0).max(10).default(0),
    rooms: Joi.number().integer().min(1).max(8).default(1),
    priceRange: Joi.object({
      min: Joi.number().min(0).optional(),
      max: Joi.number().min(0).optional(),
    }).optional(),
    amenities: Joi.array().items(Joi.string()).optional(),
    starRating: Joi.number().integer().min(1).max(5).optional(),
  }),

  // Bargain schemas
  initiateBargain: Joi.object({
    bookingId: Joi.string().required(),
    originalPrice: Joi.number().positive().required(),
    offerPrice: Joi.number().positive().required(),
    currency: Joi.string().length(3).uppercase().default("INR"),
  }),

  counterOffer: Joi.object({
    sessionId: Joi.string().required(),
    offerPrice: Joi.number().positive().required(),
  }),

  // Promo code schemas
  createPromo: Joi.object({
    code: Joi.string().alphanum().min(3).max(20).uppercase().required(),
    name: Joi.string().min(3).max(100).required(),
    type: Joi.string().valid("percent", "fixed").required(),
    discountFrom: Joi.number().positive().required(),
    discountTo: Joi.number().positive().min(Joi.ref("discountFrom")).required(),
    applicableTo: Joi.string().valid("flights", "hotels", "both").required(),
    filters: Joi.object({
      fromCity: Joi.string().optional(),
      toCity: Joi.string().optional(),
      airlines: Joi.array().items(Joi.string()).optional(),
      cabinClass: Joi.array().items(Joi.string()).optional(),
      cities: Joi.array().items(Joi.string()).optional(),
      hotels: Joi.array().items(Joi.string()).optional(),
      roomCategories: Joi.array().items(Joi.string()).optional(),
    }).optional(),
    travelPeriod: Joi.object({
      from: Joi.date().iso().required(),
      to: Joi.date().iso().min(Joi.ref("from")).required(),
    }).optional(),
    validity: Joi.object({
      startDate: Joi.date().iso().required(),
      endDate: Joi.date().iso().min(Joi.ref("startDate")).required(),
    }).required(),
    marketingBudget: Joi.number().positive().required(),
    status: Joi.string()
      .valid("active", "paused", "exhausted", "expired")
      .default("active"),
  }),

  applyPromo: Joi.object({
    promoCode: Joi.string().required(),
    type: Joi.string().valid("flight", "hotel").required(),
    fromCity: Joi.string().optional(),
    toCity: Joi.string().optional(),
    airline: Joi.string().optional(),
    cabin: Joi.string().optional(),
    travelDate: Joi.date().iso().optional(),
    city: Joi.string().optional(),
    hotel: Joi.string().optional(),
    roomCategory: Joi.string().optional(),
    checkIn: Joi.date().iso().optional(),
    checkOut: Joi.date().iso().optional(),
  }),

  checkBargain: Joi.object({
    userInputPrice: Joi.number().positive().required(),
    baseNetPrice: Joi.number().positive().required(),
    discountRange: Joi.object({
      from: Joi.number().positive().required(),
      to: Joi.number().positive().min(Joi.ref("from")).required(),
      type: Joi.string().valid("percent", "fixed").required(),
    }).required(),
    promoCode: Joi.string().optional(),
    type: Joi.string().valid("flight", "hotel").required(),
    markup: Joi.object({
      from: Joi.number().positive().optional(),
      to: Joi.number().positive().optional(),
      type: Joi.string().valid("percent", "fixed").optional(),
    }).optional(),
  }),

  counterOffer: Joi.object({
    sessionId: Joi.string().required(),
    newPrice: Joi.number().positive().optional(),
    action: Joi.string().valid("accept", "reject", "counter").required(),
  }),

  validatePromo: Joi.object({
    code: Joi.string().required(),
    bookingAmount: Joi.number().positive().required(),
    serviceType: Joi.string().valid("flight", "hotel").required(),
  }),

  // Payment schemas
  processPayment: Joi.object({
    bookingId: Joi.string().required(),
    amount: Joi.number().positive().required(),
    currency: Joi.string().length(3).uppercase().default("INR"),
    paymentMethod: Joi.string()
      .valid("credit_card", "debit_card", "net_banking", "upi", "wallet")
      .required(),
    paymentDetails: Joi.object().required(),
  }),

  // Analytics query schema
  analyticsQuery: Joi.object({
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().min(Joi.ref("startDate")).required(),
    metrics: Joi.array()
      .items(
        Joi.string().valid(
          "bookings",
          "revenue",
          "users",
          "conversions",
          "cancellations",
        ),
      )
      .default(["bookings", "revenue"]),
    groupBy: Joi.string().valid("day", "week", "month").default("day"),
    filters: Joi.object({
      service: Joi.string().valid("flight", "hotel").optional(),
      status: Joi.string()
        .valid("pending", "confirmed", "cancelled", "completed")
        .optional(),
      department: Joi.string().optional(),
    }).optional(),
  }),

  // CMS schemas
  createContent: Joi.object({
    type: Joi.string().valid("page", "post", "banner", "popup").required(),
    title: Joi.string().min(3).max(200).required(),
    content: Joi.string().required(),
    slug: Joi.string()
      .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .optional(),
    status: Joi.string()
      .valid("draft", "published", "archived")
      .default("draft"),
    tags: Joi.array().items(Joi.string()).optional(),
    metadata: Joi.object({
      seoTitle: Joi.string().max(60).optional(),
      seoDescription: Joi.string().max(160).optional(),
      keywords: Joi.array().items(Joi.string()).optional(),
    }).optional(),
    publishAt: Joi.date().iso().optional(),
    expiresAt: Joi.date().iso().optional(),
  }),
};

/**
 * Generic validation middleware factory
 */
const validateRequest = (schema, property = "body") => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true,
    });

    if (error) {
      const errorDetails = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
        value: detail.context.value,
      }));

      return res.status(400).json({
        error: "Validation failed",
        message: "Invalid request data",
        details: errorDetails,
      });
    }

    // Replace the request property with the validated and sanitized value
    req[property] = value;
    next();
  };
};

/**
 * Validate specific schemas
 */
const validate = {
  login: validateRequest(schemas.login),
  register: validateRequest(schemas.register),
  createUser: validateRequest(schemas.createUser),
  updateUser: validateRequest(schemas.updateUser),
  createBooking: validateRequest(schemas.createBooking),
  updateBooking: validateRequest(schemas.updateBooking),
  flightSearch: validateRequest(schemas.flightSearch, "query"),
  hotelSearch: validateRequest(schemas.hotelSearch, "query"),
  initiateBargain: validateRequest(schemas.initiateBargain),
  counterOffer: validateRequest(schemas.counterOffer),
  createPromo: validateRequest(schemas.createPromo),
  applyPromo: validateRequest(schemas.applyPromo),
  checkBargain: validateRequest(schemas.checkBargain),
  counterOffer: validateRequest(schemas.counterOffer),
  validatePromo: validateRequest(schemas.validatePromo),
  processPayment: validateRequest(schemas.processPayment),
  analyticsQuery: validateRequest(schemas.analyticsQuery, "query"),
  createContent: validateRequest(schemas.createContent),
};

/**
 * Pagination validation
 */
const validatePagination = (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  // Limit the maximum number of items per page
  if (limit > 100) {
    return res.status(400).json({
      error: "Invalid pagination",
      message: "Maximum limit is 100 items per page",
    });
  }

  req.pagination = {
    page,
    limit,
    offset,
  };

  next();
};

/**
 * ID parameter validation
 */
const validateId = (paramName = "id") => {
  return (req, res, next) => {
    const id = req.params[paramName];

    if (!id || id.trim() === "") {
      return res.status(400).json({
        error: "Invalid ID",
        message: `${paramName} parameter is required`,
      });
    }

    // Additional ID format validation can be added here
    // For example, UUID validation, MongoDB ObjectId validation, etc.

    next();
  };
};

/**
 * Date range validation
 */
const validateDateRange = (req, res, next) => {
  const { startDate, endDate } = req.query;

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        error: "Invalid date format",
        message: "Please use ISO date format (YYYY-MM-DD)",
      });
    }

    if (start > end) {
      return res.status(400).json({
        error: "Invalid date range",
        message: "Start date must be before end date",
      });
    }

    // Limit date range to prevent excessive queries
    const daysDiff = (end - start) / (1000 * 60 * 60 * 24);
    if (daysDiff > 365) {
      return res.status(400).json({
        error: "Date range too large",
        message: "Maximum date range is 365 days",
      });
    }
  }

  next();
};

module.exports = {
  schemas,
  validateRequest,
  validate,
  validatePagination,
  validateId,
  validateDateRange,
};
