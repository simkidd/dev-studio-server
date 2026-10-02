import { Schema, model, Document, Types } from "mongoose";

export interface IAnnouncement extends Document {
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "announcement";
  targetAudience: "all" | "developers" | "public";
  isActive: boolean;
  linkUrl?: string;
  linkText?: string;
  expiresAt?: Date;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const announcementSchema = new Schema<IAnnouncement>(
  {
    title: {
      type: String,
      required: [true, "Announcement title is required"],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Announcement message is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["info", "warning", "success", "announcement"],
      default: "info",
    },
    targetAudience: {
      type: String,
      enum: ["all", "developers", "public"],
      default: "all",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    linkUrl: {
      type: String,
      trim: true,
    },
    linkText: {
      type: String,
      trim: true,
    },
    expiresAt: {
      type: Date,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Announcement = model<IAnnouncement>("Announcement", announcementSchema);
