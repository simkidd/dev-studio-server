import { Router } from "express";
import {
  login,
  refreshToken,
  logout,
  getMe,
  changePassword,
  bootstrapInitialAdmin,
} from "../controllers";
import { authenticate, validateRequest } from "../middlewares";
import {
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
} from "../validations";

const router = Router();

// Public routes
router.post("/login", validateRequest(loginSchema), login);
router.post("/refresh", validateRequest(refreshTokenSchema), refreshToken);
router.post("/bootstrap", validateRequest(loginSchema), bootstrapInitialAdmin);

// Protected routes
router.post("/logout", authenticate, logout);
router.get("/me", authenticate, getMe);
router.post(
  "/change-password",
  authenticate,
  validateRequest(changePasswordSchema),
  changePassword,
);

export default router;
