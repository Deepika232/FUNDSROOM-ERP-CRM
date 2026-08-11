import { Role } from "@prisma/client";
import { Router } from "express";
import {
  createCustomer,
  deleteCustomer,
  getCustomerById,
  getCustomers,
  updateCustomer,
} from "../controllers/customer.controller";
import { authenticate } from "../middleware/authenticate";
import { requireRole } from "../middleware/requireRole";
import { validateBody } from "../middleware/validateBody";
import { validateQuery } from "../middleware/validateQuery";
import { createCustomerSchema, updateCustomerSchema, customerQuerySchema } from "../utils/customer.validation";

const router = Router();

// All customer routes require authentication
router.use(authenticate);

// GET /api/customers - List customers (ADMIN, SALES, ACCOUNTS)
router.get(
  "/",
  requireRole(Role.ADMIN, Role.SALES, Role.ACCOUNTS),
  validateQuery(customerQuerySchema),
  getCustomers
);

// GET /api/customers/:id - Get single customer (ADMIN, SALES, ACCOUNTS)
router.get(
  "/:id",
  requireRole(Role.ADMIN, Role.SALES, Role.ACCOUNTS),
  getCustomerById
);

// POST /api/customers - Create customer (ADMIN, SALES)
router.post(
  "/",
  requireRole(Role.ADMIN, Role.SALES),
  validateBody(createCustomerSchema),
  createCustomer
);

// PUT /api/customers/:id - Update customer (ADMIN, SALES)
router.put(
  "/:id",
  requireRole(Role.ADMIN, Role.SALES),
  validateBody(updateCustomerSchema),
  updateCustomer
);

// DELETE /api/customers/:id - Delete customer (ADMIN only)
router.delete(
  "/:id",
  requireRole(Role.ADMIN),
  deleteCustomer
);

export default router;
