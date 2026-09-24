import { Document, Types } from "mongoose";

export type SkillCategory =
  | "Languages"
  | "Frontend"
  | "Backend"
  | "Database"
  | "DevOps/Cloud"
  | "Architecture"
  | "Tools";

export interface ISkill extends Document {
  _id: Types.ObjectId;
  name: string;
  category: SkillCategory;
  icon?: string;
  proficiency?: number; // 0 - 100
  level?: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  isTopSkill: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}
