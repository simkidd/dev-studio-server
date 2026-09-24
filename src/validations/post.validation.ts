import { z } from "zod";

export const createPostSchema = z.object({
  title: z.string().min(1, "Post title is required"),
  slug: z.string().min(1, "Slug is required").optional(),
  excerpt: z
    .string()
    .min(1, "Excerpt is required")
    .max(350, "Excerpt cannot exceed 350 characters"),
  content: z.string().min(1, "Post content is required"),
  coverImageUrl: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  canonicalUrl: z.url("Invalid canonical URL").or(z.literal("")).optional(),
  readingTimeMinutes: z.number().int().positive().optional().default(5),
  isPublished: z.boolean().optional().default(false),
  publishedAt: z.string().or(z.date()).optional(),
});

export const updatePostSchema = createPostSchema.partial();
