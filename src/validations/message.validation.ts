import { z } from "zod";

export const createMessageSchema = z.object({
  senderName: z.string().min(1, "Name is required").trim(),
  senderEmail: z.email("Please provide a valid email address").trim(),
  subject: z.string().optional().default("New Portfolio Contact Inquiry"),
  message: z
    .string()
    .min(5, "Message must be at least 5 characters long")
    .trim(),
  company: z.string().optional(),
  budgetRange: z.string().optional(),
});

export const updateMessageStatusSchema = z.object({
  status: z.enum(["unread", "read", "replied", "archived"]),
  replyNotes: z.string().optional(),
  isReplied: z.boolean().optional(),
});
