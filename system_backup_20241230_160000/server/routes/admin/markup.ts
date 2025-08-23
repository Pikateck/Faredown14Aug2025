import express from "express";
import {
  AuthenticatedRequest,
  requirePermission,
  Permission,
} from "../../middleware/adminAuth";
import { sendSuccess, sendError } from "../../utils/adminUtils";

const router = express.Router();

// Placeholder markup management endpoints
router.get(
  "/hotel",
  requirePermission(Permission.VIEW_MARKUP),
  async (req: AuthenticatedRequest, res) => {
    sendSuccess(res, {
      items: [],
      total: 0,
      message: "Hotel markup rules - coming soon",
    });
  },
);

router.get(
  "/air",
  requirePermission(Permission.VIEW_MARKUP),
  async (req: AuthenticatedRequest, res) => {
    sendSuccess(res, {
      items: [],
      total: 0,
      message: "Air markup rules - coming soon",
    });
  },
);

export default router;
