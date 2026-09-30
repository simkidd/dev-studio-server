import { z } from "zod";

export const updatePortfolioSettingsSchema = z.object({
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(50, "Slug cannot exceed 50 characters")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens")
    .optional(),
  templateId: z.enum(["classic-dev", "nova-engine", "apex-studio"]).optional(),
  isPublished: z.boolean().optional(),
  seoTitle: z.string().max(100).optional(),
  seoDescription: z.string().max(250).optional(),
  socialImage: z.string().url().optional().or(z.literal("")),
  customDomain: z.string().max(100).optional().or(z.literal("")),
  themePreference: z.enum(["system", "dark", "light"]).optional(),
});
