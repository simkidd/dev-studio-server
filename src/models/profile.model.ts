import { Schema, model } from "mongoose";
import { IProfile } from "../interfaces";

const profileSchema = new Schema<IProfile>(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    middleName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    headline: {
      type: String,
      required: [true, "Headline is required"],
      trim: true,
    },
    subHeadline: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      required: [true, "Bio is required"],
    },
    aboutMarkdown: {
      type: String,
    },
    avatarUrl: {
      type: String,
    },
    resumeUrl: {
      type: String,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
    },
    isAvailableForHire: {
      type: Boolean,
      default: true,
    },
    availabilityNote: {
      type: String,
      default: "Available for full-time senior roles & selected contract projects",
    },
    socialLinks: {
      github: { type: String, trim: true },
      linkedin: { type: String, trim: true },
      twitter: { type: String, trim: true },
      discord: { type: String, trim: true },
      youtube: { type: String, trim: true },
      email: { type: String, trim: true },
      website: { type: String, trim: true },
    },
    stats: {
      yearsExperience: { type: Number, default: 0 },
      completedProjects: { type: Number, default: 0 },
      happyClients: { type: Number, default: 0 },
      codeCommits: { type: Number, default: 0 },
    },
    seoTitle: { type: String },
    seoDescription: { type: String },
    seoKeywords: [{ type: String }],
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

export const Profile = model<IProfile>("Profile", profileSchema);
