import { Router } from "express";
import {
  submitContactMessage,
  getAllMessages,
  getMessageById,
  updateMessageStatus,
  deleteMessage,
} from "../controllers";
import { authenticate, validateRequest } from "../middlewares";
import { createMessageSchema, updateMessageStatusSchema } from "../validations";

const router = Router();

// Public: Contact form submission
router.post("/", validateRequest(createMessageSchema), submitContactMessage);

// Protected admin routes
router.get("/", authenticate, getAllMessages);
router.get("/:id", authenticate, getMessageById);
router.patch(
  "/:id/status",
  authenticate,
  validateRequest(updateMessageStatusSchema),
  updateMessageStatus,
);
router.delete("/:id", authenticate, deleteMessage);

export default router;
