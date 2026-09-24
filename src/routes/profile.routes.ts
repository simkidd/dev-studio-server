import { Router } from "express";
import { getPublicProfile, updateProfile } from "../controllers";
import { authenticate, validateRequest } from "../middlewares";
import { updateProfileSchema } from "../validations";

const router = Router();

// Public
router.get("/", getPublicProfile);

// Admin
router.put(
  "/",
  authenticate,
  validateRequest(updateProfileSchema),
  updateProfile,
);

export default router;
