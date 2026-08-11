import { Role } from "@prisma/client";
import { Router } from "express";
import {
  createStockMovement,
  getStockMovements,
} from "../controllers/stockMovement.controller";
import { authenticate } from "../middleware/authenticate";
import { requireRole } from "../middleware/requireRole";
import { validateBody } from "../middleware/validateBody";
import { validateQuery } from "../middleware/validateQuery";
import { createStockMovementSchema, stockMovementQuerySchema } from "../utils/stockMovement.validation";

const router = Router();

router.use(authenticate);

// GET /api/stock-movements - List movements (ADMIN, SALES, WAREHOUSE, ACCOUNTS)
router.get(
  "/",
  requireRole(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS),
  validateQuery(stockMovementQuerySchema),
  getStockMovements
);

// POST /api/stock-movements - Create movement (ADMIN, WAREHOUSE)
router.post(
  "/",
  requireRole(Role.ADMIN, Role.WAREHOUSE),
  validateBody(createStockMovementSchema),
  createStockMovement
);

export default router;
