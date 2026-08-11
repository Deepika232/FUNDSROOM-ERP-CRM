import { Role } from "@prisma/client";
import { Router } from "express";
import {
  cancelChallan,
  confirmChallan,
  createChallan,
  getChallanById,
  getChallans,
  updateChallan,
} from "../controllers/challan.controller";
import { authenticate } from "../middleware/authenticate";
import { requireRole } from "../middleware/requireRole";
import { validateBody } from "../middleware/validateBody";
import { validateQuery } from "../middleware/validateQuery";
import {
  challanQuerySchema,
  createChallanSchema,
  updateChallanSchema,
} from "../utils/challan.validation";

const router = Router();

router.use(authenticate);

// GET /api/challans
router.get(
  "/",
  requireRole(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS),
  validateQuery(challanQuerySchema),
  getChallans,
);

// GET /api/challans/:id
router.get(
  "/:id",
  requireRole(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS),
  getChallanById,
);

// POST /api/challans — create draft
router.post(
  "/",
  requireRole(Role.ADMIN, Role.SALES),
  validateBody(createChallanSchema),
  createChallan,
);

// PUT /api/challans/:id — edit draft
router.put(
  "/:id",
  requireRole(Role.ADMIN, Role.SALES),
  validateBody(updateChallanSchema),
  updateChallan,
);

// POST /api/challans/:id/confirm
router.post(
  "/:id/confirm",
  requireRole(Role.ADMIN, Role.WAREHOUSE),
  confirmChallan,
);

// POST /api/challans/:id/cancel
router.post(
  "/:id/cancel",
  requireRole(Role.ADMIN, Role.SALES),
  cancelChallan,
);

export default router;
