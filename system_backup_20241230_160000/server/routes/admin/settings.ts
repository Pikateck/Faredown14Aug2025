import express from "express";
import {
  AuthenticatedRequest,
  requirePermission,
  Permission,
} from "../../middleware/adminAuth";
import { sendSuccess } from "../../utils/adminUtils";

const router = express.Router();

router.get(
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

export default router;
