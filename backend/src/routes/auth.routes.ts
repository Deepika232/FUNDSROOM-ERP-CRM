import { Role } from "@prisma/client";
import { Router } from "express";
import {
  adminCheck,
  getMe,
  login,
  register,
} from "../controllers/auth.controller";
import { authenticate } from "../middleware/authenticate";
import { requireRole } from "../middleware/requireRole";
import { validateBody } from "../middleware/validateBody";
import { loginSchema, registerSchema } from "../utils/auth.validation";

const router = Router();

router.post(
  "/register",
  authenticate,
  requireRole(Role.ADMIN),
  validateBody(registerSchema),
  register,
);
router.post("/login", validateBody(loginSchema), login);
router.get("/me", authenticate, getMe);
router.get(
  "/admin-check",
  authenticate,
  requireRole(Role.ADMIN),
  adminCheck,
);

export default router;
