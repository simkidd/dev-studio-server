import { Router } from "express";
import { getPublicProfile, getAdminProfile, updateProfile } from "../controllers";
import { authenticate, validateRequest } from "../middlewares";
import { updateProfileSchema } from "../validations";

const router = Router();

// Public
router.get("/", getPublicProfile);

// Admin / Authenticated User
router.get("/admin", authenticate, getAdminProfile);
router.put(
  "/",
  authenticate,
  validateRequest(updateProfileSchema),
  updateProfile,
);

export default router;

