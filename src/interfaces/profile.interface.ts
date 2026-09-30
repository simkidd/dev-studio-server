import { Document, Types } from "mongoose";

export interface ISocialLinks {
  github?: string;
  linkedin?: string;
  twitter?: string;
  discord?: string;
  youtube?: string;
  email?: string;
  phone?: string;
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
  userId: Types.ObjectId;
  brandName?: string;
  logoUrl?: string;
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
  contactEmail?: string;
  contactPhone?: string;
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
