import { Document, Types } from "mongoose";

export interface ISocialLinks {
  github?: string;
  linkedin?: string;
  twitter?: string;
  discord?: string;
  youtube?: string;
  email?: string;
  website?: string;
}

export interface IProfileStats {
  yearsExperience: number;
  completedProjects: number;
  happyClients?: number;
  codeCommits?: number;
}

export interface IProfile extends Document {
  _id: Types.ObjectId;
  firstName: string;
  middleName?: string;
  lastName: string;
  headline: string;
  subHeadline?: string;
  bio: string;
  aboutMarkdown?: string;
  avatarUrl?: string;
  resumeUrl?: string;
  location: string;
  isAvailableForHire: boolean;
  availabilityNote?: string;
  socialLinks: ISocialLinks;
  stats: IProfileStats;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  createdAt: Date;
  updatedAt: Date;
}
