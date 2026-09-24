import { Schema, model } from "mongoose";
import { IPost } from "../interfaces";

const postSchema = new Schema<IPost>(
  {
    title: {
      type: String,
      required: [true, "Post title is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Post slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    excerpt: {
      type: String,
      required: [true, "Post excerpt is required"],
      maxlength: [350, "Excerpt cannot exceed 350 characters"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Post markdown content is required"],
    },
    coverImageUrl: {
      type: String,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    canonicalUrl: {
      type: String,
    },
    readingTimeMinutes: {
      type: Number,
      default: 5,
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
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
  },
);

export const Post = model<IPost>("Post", postSchema);
