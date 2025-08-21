// File contains stubs for all remaining admin modules
import express from "express";
import {
  AuthenticatedRequest,
  requirePermission,
  Permission,
} from "../../middleware/adminAuth";
import { sendSuccess } from "../../utils/adminUtils";

// VAT Management
export const vatRouter = express.Router();
vatRouter.get(
  "/",
  requirePermission(Permission.VIEW_DASHBOARD),
  (req: AuthenticatedRequest, res) => {
    sendSuccess(res, {
      items: [],
      total: 0,
      message: "VAT rules - database ready",
    });
  },
);

// Promo Codes
export const promosRouter = express.Router();
promosRouter.get(
  "/",
  requirePermission(Permission.VIEW_DASHBOARD),
  (req: AuthenticatedRequest, res) => {
    sendSuccess(res, {
      items: [],
      total: 0,
      message: "Promo codes - database ready",
    });
  },
);

// Currency
export const currencyRouter = express.Router();
currencyRouter.get(
  "/rates",
  requirePermission(Permission.VIEW_DASHBOARD),
  (req: AuthenticatedRequest, res) => {
    sendSuccess(res, {
      items: [],
      total: 0,
      message: "FX rates - database ready",
    });
  },
);

// Reports
export const reportsRouter = express.Router();
reportsRouter.get(
  "/bookings",
  requirePermission(Permission.VIEW_REPORTS),
  (req: AuthenticatedRequest, res) => {
    sendSuccess(res, {
      items: [],
      total: 0,
      message: "Booking reports - database ready",
    });
  },
);

// Bargain Engine
export const bargainRouter = express.Router();
bargainRouter.get(
  "/sessions",
  requirePermission(Permission.VIEW_DASHBOARD),
  (req: AuthenticatedRequest, res) => {
    sendSuccess(res, {
      items: [],
      total: 0,
      message: "Bargain sessions - database ready",
    });
  },
);

// API Testing
export const testingRouter = express.Router();
testingRouter.get(
  "/runs",
  requirePermission(Permission.VIEW_DASHBOARD),
  (req: AuthenticatedRequest, res) => {
    sendSuccess(res, {
      items: [],
      total: 0,
      message: "API test runs - database ready",
    });
  },
);

// Inventory
export const inventoryRouter = express.Router();
inventoryRouter.get(
  "/hotels",
  requirePermission(Permission.VIEW_DASHBOARD),
  (req: AuthenticatedRequest, res) => {
    sendSuccess(res, {
      items: [],
      total: 0,
      message: "Hotel inventory - database ready",
    });
  },
);

// Rewards
export const rewardsRouter = express.Router();
rewardsRouter.get(
  "/accounts",
  requirePermission(Permission.VIEW_DASHBOARD),
  (req: AuthenticatedRequest, res) => {
    sendSuccess(res, {
      items: [],
      total: 0,
      message: "Loyalty accounts - database ready",
    });
  },
);

// Vouchers
export const vouchersRouter = express.Router();
vouchersRouter.get(
  "/templates",
  requirePermission(Permission.VIEW_DASHBOARD),
  (req: AuthenticatedRequest, res) => {
    sendSuccess(res, {
      items: [],
      total: 0,
      message: "Voucher templates - database ready",
    });
  },
);

// Audit
export const auditRouter = express.Router();
auditRouter.get(
  "/",
  requirePermission(Permission.VIEW_AUDIT),
  (req: AuthenticatedRequest, res) => {
    sendSuccess(res, {
      items: [],
      total: 0,
      message: "Audit logs - database ready",
    });
  },
);

// Settings
export const settingsRouter = express.Router();
settingsRouter.get(
  "/",
  requirePermission(Permission.MANAGE_SYSTEM),
  (req: AuthenticatedRequest, res) => {
    sendSuccess(res, {
      items: [],
      total: 0,
      message: "System settings - database ready",
    });
  },
);
