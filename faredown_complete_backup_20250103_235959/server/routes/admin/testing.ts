import express from "express";
import {
  AuthenticatedRequest,
  requirePermission,
  Permission,
} from "../../middleware/adminAuth";
import { sendSuccess } from "../../utils/adminUtils";

const router = express.Router();

router.get(
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

export default router;
