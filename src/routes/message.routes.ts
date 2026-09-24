import { Router } from "express";
import {
  submitContactMessage,
  getAllMessages,
  getMessageById,
  updateMessageStatus,
  replyToMessage,
  deleteMessage,
} from "../controllers";
import { authenticate, validateRequest } from "../middlewares";
import {
  createMessageSchema,
  updateMessageStatusSchema,
  replyMessageSchema,
} from "../validations";

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
router.post(
  "/:id/reply",
  authenticate,
  validateRequest(replyMessageSchema),
  replyToMessage,
);
router.delete("/:id", authenticate, deleteMessage);

export default router;
