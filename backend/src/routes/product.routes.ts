import { Role } from "@prisma/client";
import { Router } from "express";
import {
  createProduct,
  getProductById,
  getProducts,
  updateProduct,
} from "../controllers/product.controller";
import { authenticate } from "../middleware/authenticate";
import { requireRole } from "../middleware/requireRole";
import { validateBody } from "../middleware/validateBody";
import { validateQuery } from "../middleware/validateQuery";
import { createProductSchema, updateProductSchema, productQuerySchema } from "../utils/product.validation";

const router = Router();

router.use(authenticate);

// GET /api/products - List products (ADMIN, SALES, WAREHOUSE, ACCOUNTS)
router.get(
  "/",
  requireRole(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS),
  validateQuery(productQuerySchema),
  getProducts
);

// GET /api/products/:id - Get single product (ADMIN, SALES, WAREHOUSE, ACCOUNTS)
router.get(
  "/:id",
  requireRole(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS),
  getProductById
);

// POST /api/products - Create product (ADMIN, WAREHOUSE)
router.post(
  "/",
  requireRole(Role.ADMIN, Role.WAREHOUSE),
  validateBody(createProductSchema),
  createProduct
);

// PUT /api/products/:id - Update product (ADMIN, WAREHOUSE)
router.put(
  "/:id",
  requireRole(Role.ADMIN, Role.WAREHOUSE),
  validateBody(updateProductSchema),
  updateProduct
);

export default router;
