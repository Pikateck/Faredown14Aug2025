import express from "express";
import {
  AuthenticatedRequest,
  requirePermission,
  Permission,
} from "../../middleware/adminAuth";
import { sendSuccess } from "../../utils/adminUtils";

const router = express.Router();

router.get(
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

export default router;
