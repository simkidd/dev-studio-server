import { Document, Types } from "mongoose";

export interface ITestimonial extends Document {
  _id: Types.ObjectId;
  clientName: string;
  clientRole: string;
  company: string;
  avatarUrl?: string;
  quote: string;
  rating?: number; // 1 to 5
  projectRef?: Types.ObjectId;
  linkedInUrl?: string;
  companyUrl?: string;
  isFeatured: boolean;
  isApproved: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}
