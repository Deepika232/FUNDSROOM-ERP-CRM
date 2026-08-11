import { Router } from "express";
import authRoutes from "./auth.routes";
import challanRoutes from "./challan.routes";
import customerRoutes from "./customer.routes";
import dashboardRoutes from "./dashboard.routes";
import healthRoutes from "./health.routes";
import productRoutes from "./product.routes";
import stockMovementRoutes from "./stockMovement.routes";

const router = Router();

router.use(healthRoutes);
router.use("/auth", authRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/customers", customerRoutes);
router.use("/products", productRoutes);
router.use("/stock-movements", stockMovementRoutes);
router.use("/challans", challanRoutes);

export default router;
