import { Document, Types } from "mongoose";

export interface ITestimonial extends Document {
  _id: Types.ObjectId;
  clientName: string;
  clientRole: string;
  company: string;
  quote: string;
  projectRef?: Types.ObjectId;
  linkedInUrl?: string;
  companyUrl?: string;
  isFeatured: boolean;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}
