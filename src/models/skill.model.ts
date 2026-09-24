import { Schema, model } from "mongoose";
import { ISkill } from "../interfaces";

const skillSchema = new Schema<ISkill>(
  {
    name: {
      type: String,
      required: [true, "Skill name is required"],
      trim: true,
    },
    category: {
      type: String,
      enum: [
        "Languages",
        "Frontend",
        "Backend",
        "Database",
        "DevOps/Cloud",
        "Architecture",
        "Tools",
      ],
      required: [true, "Skill category is required"],
      index: true,
    },
    icon: {
      type: String,
      trim: true,
    },
    proficiency: {
      type: Number,
      min: 0,
      max: 100,
      default: 80,
    },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced", "Expert"],
      default: "Advanced",
    },
    isTopSkill: {
      type: Boolean,
      default: false,
      index: true,
    },
    order: {
      type: Number,
      default: 0,
      index: true,
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

export const Skill = model<ISkill>("Skill", skillSchema);
