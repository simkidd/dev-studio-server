import { z } from "zod";

export const createSkillSchema = z.object({
  name: z.string().min(1, "Skill name is required"),
  category: z.enum([
    "Languages",
    "Frontend",
    "Backend",
    "Database",
    "DevOps/Cloud",
    "Architecture",
    "Tools",
  ]),
  icon: z.string().optional(),
  proficiency: z.number().min(0).max(100).optional().default(80),
  level: z
    .enum(["Beginner", "Intermediate", "Advanced", "Expert"])
    .optional()
    .default("Advanced"),
  isTopSkill: z.boolean().optional().default(false),
  order: z.number().int().optional().default(0),
});

export const updateSkillSchema = createSkillSchema.partial();
