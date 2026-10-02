import { Schema, model, Document } from "mongoose";

export interface ITemplateSetting extends Document {
  templateId: string;
  name: string;
  description: string;
  status: "active" | "pro" | "beta" | "maintenance";
  isFeatured: boolean;
  order: number;
  tags: string[];
  previewImageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const templateSettingSchema = new Schema<ITemplateSetting>(
  {
    templateId: {
      type: String,
      required: true,
      unique: true,
      enum: ["classic-dev", "nova-engine", "apex-studio"],
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "pro", "beta", "maintenance"],
      default: "active",
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
    tags: {
      type: [String],
      default: [],
    },
    previewImageUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export const TemplateSetting = model<ITemplateSetting>(
  "TemplateSetting",
  templateSettingSchema,
);
