import { Router } from "express";
import { getDashboardStats } from "../controllers";
import { authenticate } from "../middlewares";

const router = Router();

// Protected admin overview stats
router.get("/stats", authenticate, getDashboardStats);

export default router;
