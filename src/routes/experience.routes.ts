import { Router } from "express";
import {
  getPublicExperiences,
  createExperience,
  updateExperience,
  deleteExperience,
  reorderExperiences,
} from "../controllers";
import { authenticate, validateRequest } from "../middlewares";
import { createExperienceSchema, updateExperienceSchema } from "../validations";

const router = Router();

// Public
router.get("/", getPublicExperiences);

// Protected admin routes
router.post(
  "/",
  authenticate,
  validateRequest(createExperienceSchema),
  createExperience,
);
router.put("/reorder", authenticate, reorderExperiences);
router.put(
  "/:id",
  authenticate,
  validateRequest(updateExperienceSchema),
  updateExperience,
);
router.delete("/:id", authenticate, deleteExperience);

export default router;
