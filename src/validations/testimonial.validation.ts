import { z } from "zod";

export const createTestimonialSchema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  clientRole: z.string().min(1, "Client role is required"),
  company: z.string().min(1, "Company name is required"),
  avatarUrl: z.string().url("Invalid avatar URL").or(z.literal("")).optional(),
  quote: z.string().min(5, "Testimonial quote must be at least 5 characters"),
  rating: z.number().min(1).max(5).optional().default(5),
  projectRef: z.string().optional(),
  linkedInUrl: z.url("Invalid LinkedIn URL").or(z.literal("")).optional(),
  companyUrl: z.url("Invalid Company URL").or(z.literal("")).optional(),
  isFeatured: z.boolean().optional().default(true),
  isApproved: z.boolean().optional().default(true),
  order: z.number().int().optional().default(0),
});

export const updateTestimonialSchema = createTestimonialSchema.partial();
