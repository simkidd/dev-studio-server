import { z } from "zod";

export const updateProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required").optional(),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
  headline: z.string().min(1, "Headline is required").optional(),
  subHeadline: z.string().optional(),
  bio: z.string().min(1, "Bio is required").optional(),
  aboutMarkdown: z.string().optional(),
  avatarUrl: z.url("Invalid avatar URL").or(z.literal("")).optional(),
  resumeUrl: z.url("Invalid resume URL").or(z.literal("")).optional(),
  location: z.string().min(1, "Location is required").optional(),
  isAvailableForHire: z.boolean().optional(),
  availabilityNote: z.string().optional(),
  socialLinks: z
    .object({
      github: z.string().optional(),
      linkedin: z.string().optional(),
      twitter: z.string().optional(),
      discord: z.string().optional(),
      youtube: z.string().optional(),
      email: z.string().optional(),
      website: z.string().optional(),
    })
    .optional(),
  stats: z
    .object({
      yearsExperience: z.number().nonnegative().optional(),
      completedProjects: z.number().nonnegative().optional(),
      happyClients: z.number().nonnegative().optional(),
      codeCommits: z.number().nonnegative().optional(),
    })
    .optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.array(z.string()).optional(),
});
