import { Document, Types } from "mongoose";

export type PortfolioTemplateId = "classic-dev" | "nova-engine" | "apex-studio";

export interface IPortfolio extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  slug: string;
  templateId: PortfolioTemplateId;
  isPublished: boolean;
  publishedAt?: Date;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  customDomain?: string;
  customDomainVerified?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
