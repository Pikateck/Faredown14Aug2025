import express from "express";
import {
  authenticateAdmin,
  AuthenticatedRequest,
} from "../../middleware/adminAuth";

// Import all admin module routes
import authRoutes from "./auth";
import dashboardRoutes from "./dashboard";
import usersRoutes from "./users";
import bookingsRoutes from "./bookings";
import paymentsRoutes from "./payments";
import suppliersRoutes from "./suppliers";
import markupRoutes from "./markup";
import vatRoutes from "./vat";
import promosRoutes from "./promos";
import currencyRoutes from "./currency";
import reportsRoutes from "./reports";
import bargainRoutes from "./bargain";
import testingRoutes from "./testing";
import inventoryRoutes from "./inventory";
import rewardsRoutes from "./rewards";
import vouchersRoutes from "./vouchers";
import auditRoutes from "./audit";
import settingsRoutes from "./settings";
import loyaltyRoutes from "./loyalty";

const router = express.Router();

// Auth routes (no authentication required)
router.use("/auth", authRoutes);

// Apply admin authentication to all other routes
router.use(authenticateAdmin);

// Health check for admin API
router.get("/health", (req: AuthenticatedRequest, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    admin: {
      id: req.admin?.id,
      email: req.admin?.email,
      role: req.admin?.role,
    },
    modules: {
      dashboard: "enabled",
      users: "enabled",
      bookings: "enabled",
      payments: "enabled",
      suppliers: "enabled",
      markup: "enabled",
      vat: "enabled",
      promos: "enabled",
      currency: "enabled",
      reports: "enabled",
      bargain: "enabled",
      testing: "enabled",
      inventory: "enabled",
      rewards: "enabled",
      vouchers: "enabled",
      audit: "enabled",
      settings: "enabled",
      loyalty: "enabled",
    },
  });
});

// Mount all admin module routes
router.use("/dashboard", dashboardRoutes);
router.use("/users", usersRoutes);
router.use("/bookings", bookingsRoutes);
router.use("/payments", paymentsRoutes);
router.use("/suppliers", suppliersRoutes);
router.use("/markup", markupRoutes);
router.use("/vat", vatRoutes);
router.use("/promos", promosRoutes);
router.use("/currency", currencyRoutes);
router.use("/reports", reportsRoutes);
router.use("/bargain", bargainRoutes);
router.use("/testing", testingRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/rewards", rewardsRoutes);
router.use("/vouchers", vouchersRoutes);
router.use("/audit", auditRoutes);
router.use("/settings", settingsRoutes);
router.use("/loyalty", loyaltyRoutes);

export default router;
