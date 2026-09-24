import { Router } from "express";
import {
  getPublicSkills,
  createSkill,
  updateSkill,
  deleteSkill,
  reorderSkills,
} from "../controllers";
import { authenticate, validateRequest } from "../middlewares";
import { createSkillSchema, updateSkillSchema } from "../validations";

const router = Router();

// Public
router.get("/", getPublicSkills);

// Protected admin routes
router.post("/", authenticate, validateRequest(createSkillSchema), createSkill);
router.put("/reorder", authenticate, reorderSkills);
router.put(
  "/:id",
  authenticate,
  validateRequest(updateSkillSchema),
  updateSkill,
);
router.delete("/:id", authenticate, deleteSkill);

export default router;
