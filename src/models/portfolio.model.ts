import { Schema, model } from "mongoose";
import { IPortfolio } from "../interfaces";

const portfolioSchema = new Schema<IPortfolio>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      unique: true,
      index: true,
    },
    slug: {
      type: String,
      required: [true, "Portfolio slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [/^[a-z0-9-]+$/, "Slug must only contain lowercase alphanumeric characters and hyphens"],
    },
    templateId: {
      type: String,
      enum: ["classic-dev", "nova-engine", "apex-studio"],
      default: "classic-dev",
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
    seoTitle: {
      type: String,
      trim: true,
    },
    seoDescription: {
      type: String,
      trim: true,
    },
    seoKeywords: [
      {
        type: String,
        trim: true,
      },
    ],
    customDomain: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    customDomainVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, any>) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const Portfolio = model<IPortfolio>("Portfolio", portfolioSchema);
