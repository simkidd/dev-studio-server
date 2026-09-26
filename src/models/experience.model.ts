import { Schema, model } from "mongoose";
import { IExperience } from "../interfaces";

const experienceSchema = new Schema<IExperience>(
  {
    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    role: {
      type: String,
      required: [true, "Role title is required"],
      trim: true,
    },
    employmentType: {
      type: String,
      enum: ["full-time", "part-time", "contract", "freelance", "internship"],
      default: "full-time",
    },
    location: {
      type: String,
      trim: true,
    },
    isRemote: {
      type: Boolean,
      default: false,
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
    },
    isCurrent: {
      type: Boolean,
      default: false,
    },
    summary: {
      type: String,
      required: [true, "Role summary is required"],
    },
    achievements: [
      {
        type: String,
      },
    ],
    technologies: [
      {
        type: String,
        trim: true,
      },
    ],
    companyLogoUrl: {
      type: String,
    },
    companyWebsiteUrl: {
      type: String,
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

export const Experience = model<IExperience>("Experience", experienceSchema);
