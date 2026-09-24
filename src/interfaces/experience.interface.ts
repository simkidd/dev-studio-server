import { Document, Types } from "mongoose";

export type ExperienceType =
  | "full-time"
  | "part-time"
  | "contract"
  | "freelance"
  | "internship";

export interface IExperience extends Document {
  _id: Types.ObjectId;
  company: string;
  role: string;
  employmentType?: ExperienceType;
  location?: string;
  isRemote: boolean;
  startDate: Date;
  endDate?: Date;
  isCurrent: boolean;
  summary: string;
  achievements: string[];
  technologies: string[];
  companyLogoUrl?: string;
  companyWebsiteUrl?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}
