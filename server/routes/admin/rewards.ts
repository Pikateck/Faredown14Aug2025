import express from "express";
import {
  AuthenticatedRequest,
  requirePermission,
  Permission,
} from "../../middleware/adminAuth";
import { sendSuccess } from "../../utils/adminUtils";

const router = express.Router();

router.get(
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

export default router;
