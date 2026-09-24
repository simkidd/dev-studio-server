import { Router } from "express";
import {
  getPublicProjects,
  getProjectBySlug,
  getProjectById,
  getAllProjectsAdmin,
  createProject,
  updateProject,
  deleteProject,
  toggleFeatured,
  togglePublished,
  deleteGalleryImage,
  reorderProjects,
} from "../controllers";
import { authenticate, validateRequest, upload } from "../middlewares";
import { createProjectSchema, updateProjectSchema } from "../validations";

const router = Router();

// Public routes
router.get("/", getPublicProjects);
router.get("/slug/:slug", getProjectBySlug);
router.get("/:id", getProjectById);

// Protected admin routes
router.get("/admin/all", authenticate, getAllProjectsAdmin);
router.post(
  "/",
  authenticate,
  upload.single("image"),
  validateRequest(createProjectSchema),
  createProject,
);
router.put("/reorder", authenticate, reorderProjects);
router.put(
  "/:id",
  authenticate,
  upload.single("image"),
  validateRequest(updateProjectSchema),
  updateProject,
);
router.patch("/:id/toggle-featured", authenticate, toggleFeatured);
router.patch("/:id/toggle-published", authenticate, togglePublished);
router.delete("/:id/gallery", authenticate, deleteGalleryImage);
router.delete("/:id", authenticate, deleteProject);



export default router;
