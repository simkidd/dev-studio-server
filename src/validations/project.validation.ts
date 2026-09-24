import { z } from "zod";

const jsonOrArray = <T extends z.ZodTypeAny>(schema: T) =>
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

const numberPreprocess = z.preprocess((val) => {
  if (typeof val === "string" && val.trim() !== "") {
    const num = Number(val);
    return isNaN(num) ? val : num;
  }
  return val;
}, z.number().int());

const projectMetricSchema = z.object({
  label: z.string().min(1, "Metric label is required"),
  value: z.string().min(1, "Metric value is required"),
});

const projectImageSchema = z.union([
  z.string().transform((url) => ({ url, publicId: undefined })),
  z.object({
    url: z.string().min(1, "Image URL is required"),
    publicId: z.string().optional(),
  }),
]);

export const createProjectSchema = z.object({
  title: z.string().min(1, "Project title is required"),
  slug: z.string().min(1, "Slug is required").optional(),
  summary: z
    .string()
    .min(1, "Summary is required")
    .max(300, "Summary cannot exceed 300 characters"),
  caseStudy: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  thumbnailPublicId: z.string().optional(),
  galleryImages: jsonOrArray(z.array(projectImageSchema)).optional().default([]),
  technologies: jsonOrArray(
    z.array(z.string()).min(1, "At least one technology is required")
  ),

  category: z
    .enum([
      "Full-Stack",
      "Frontend",
      "Backend",
      "Mobile",
      "DevOps",
      "AI/ML",
      "System Design",
    ])
    .default("Full-Stack"),
  liveUrl: z.string().url("Invalid live URL").or(z.literal("")).optional(),
  githubUrl: z.string().url("Invalid GitHub URL").or(z.literal("")).optional(),
  isFeatured: booleanPreprocess.optional().default(false),
  metrics: jsonOrArray(z.array(projectMetricSchema)).optional().default([]),
  order: numberPreprocess.optional().default(0),
  isPublished: booleanPreprocess.optional().default(true),
});

export const updateProjectSchema = createProjectSchema.partial();
