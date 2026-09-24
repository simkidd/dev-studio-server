import { Schema, model } from "mongoose";
import { IProject, IProjectImage } from "../interfaces";

const projectImageSchema = new Schema<IProjectImage>(
  {
    url: {
      type: String,
      required: [true, "Image URL is required"],
    },
    publicId: {
      type: String,
    },
  },
  { _id: false }
);

const projectSchema = new Schema<IProject>(
  {
    title: {
      type: String,
      required: [true, "Project title is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Project slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    summary: {
      type: String,
      required: [true, "Short summary is required"],
      maxlength: [300, "Summary cannot exceed 300 characters"],
      trim: true,
    },
    caseStudy: {
      type: String, // Rich Markdown case study
    },
    thumbnailUrl: {
      type: String,
      required: [true, "Thumbnail image URL is required"],
    },
    thumbnailPublicId: {
      type: String,
    },
    galleryImages: [projectImageSchema],
    technologies: [
      {
        type: String,
        trim: true,
      },
    ],
    category: {
      type: String,
      enum: [
        "Full-Stack",
        "Frontend",
        "Backend",
        "Mobile",
        "DevOps",
        "AI/ML",
        "System Design",
      ],
      default: "Full-Stack",
    },
    liveUrl: {
      type: String,
      trim: true,
    },
    githubUrl: {
      type: String,
      trim: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    metrics: [
      {
        label: { type: String, required: true },
        value: { type: String, required: true },
      },
    ],
    order: {
      type: Number,
      default: 0,
      index: true,
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

export const Project = model<IProject>("Project", projectSchema);
