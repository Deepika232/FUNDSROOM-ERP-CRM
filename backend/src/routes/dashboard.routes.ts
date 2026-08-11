import { Role } from "@prisma/client";
import { Router } from "express";
import { getDashboardSummary } from "../controllers/dashboard.controller";
import { authenticate } from "../middleware/authenticate";
import { requireRole } from "../middleware/requireRole";

const router = Router();

router.use(authenticate);

// GET /api/dashboard/summary — available to all authenticated roles
router.get(
  "/summary",
  requireRole(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS),
  getDashboardSummary,
);

export default router;
