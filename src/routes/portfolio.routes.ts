import { Router } from "express";
import {
  getPortfolioSettings,
  updatePortfolioSettings,
  getPublicPortfolioBySlug,
} from "../controllers";
import { authenticate, validateRequest } from "../middlewares";
import { updatePortfolioSettingsSchema } from "../validations";

const router = Router();

// Public: View a developer's portfolio by public slug
router.get("/public/:slug", getPublicPortfolioBySlug);
router.get("/:slug", getPublicPortfolioBySlug);

// Protected: Portfolio owner settings
router.get("/settings/me", authenticate, getPortfolioSettings);
router.put(
  "/settings/me",
  authenticate,
  validateRequest(updatePortfolioSettingsSchema),
  updatePortfolioSettings,
);

export default router;
