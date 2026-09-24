import { Document, Types } from "mongoose";

export interface IPost {
  title: string;
  slug: string;
  excerpt: string;
  content: string; // Markdown / MDX content
  coverImageUrl?: string;
  tags: string[];
  canonicalUrl?: string;
  readingTimeMinutes: number;
  viewsCount: number;
  likesCount: number;
  isPublished: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPostDocument extends IPost, Document {
  _id: Types.ObjectId;
}
