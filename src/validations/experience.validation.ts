import { z } from "zod";

export const createExperienceSchema = z.object({
  company: z.string().min(1, "Company name is required"),
  role: z.string().min(1, "Role title is required"),
  employmentType: z
    .enum(["full-time", "part-time", "contract", "freelance", "internship"])
    .optional()
    .default("full-time"),
  location: z.string().optional(),
  isRemote: z.boolean().optional().default(false),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()).optional().nullable(),
  isCurrent: z.boolean().optional().default(false),
  summary: z.string().min(1, "Summary is required"),
  achievements: z.array(z.string()).optional().default([]),
  technologies: z.array(z.string()).optional().default([]),
  companyLogoUrl: z.string().optional(),
  companyWebsiteUrl: z.string().optional(),
});

export const updateExperienceSchema = createExperienceSchema.partial();
