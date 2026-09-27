import { z } from "zod";

const jsonOrArray = <T extends z.ZodType>(schema: T) =>
  z.preprocess((val) => {
    if (typeof val === "string") {
      try {
        return JSON.parse(val);
      } catch {
        return val;
      }
    }
    return val;
  }, schema);

const booleanPreprocess = z.preprocess((val) => {
  if (typeof val === "string") {
    if (val === "true") return true;
    if (val === "false") return false;
  }
  return val;
}, z.boolean());

export const createPostSchema = z.object({
  title: z.string().min(1, "Post title is required"),
  slug: z.string().min(1, "Slug is required").optional(),
  excerpt: z
    .string()
    .min(1, "Excerpt is required")
    .max(350, "Excerpt cannot exceed 350 characters"),
  content: z.string().min(1, "Post content is required"),
  tags: jsonOrArray(z.array(z.string())).optional().default([]),
  canonicalUrl: z.url("Invalid canonical URL").or(z.literal("")).optional(),
  readingTimeMinutes: z.number().int().positive().optional().default(5),
  isPublished: booleanPreprocess.optional().default(false),
  publishedAt: z.string().or(z.date()).optional(),
});

export const updatePostSchema = createPostSchema.partial();
