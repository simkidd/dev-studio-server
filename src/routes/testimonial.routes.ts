import { Router } from "express";
import {
  getPublicTestimonials,
  getAllTestimonialsAdmin,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from "../controllers";
import { authenticate, validateRequest } from "../middlewares";
import {
  createTestimonialSchema,
  updateTestimonialSchema,
} from "../validations";

const router = Router();

// Public
router.get("/", getPublicTestimonials);

// Protected admin routes
router.get("/admin/all", authenticate, getAllTestimonialsAdmin);
router.post(
  "/",
  authenticate,
  validateRequest(createTestimonialSchema),
  createTestimonial,
);
router.put(
  "/:id",
  authenticate,
  validateRequest(updateTestimonialSchema),
  updateTestimonial,
);
router.delete("/:id", authenticate, deleteTestimonial);

export default router;
