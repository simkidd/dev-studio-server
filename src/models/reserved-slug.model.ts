import { Schema, model, Document, Types } from "mongoose";

export interface IReservedSlug extends Document {
  slug: string;
  reason: string;
  isSystem: boolean;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const reservedSlugSchema = new Schema<IReservedSlug>(
  {
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    reason: {
      type: String,
      default: "System reserved route or protected brand keyword",
    },
    isSystem: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

export const ReservedSlug = model<IReservedSlug>("ReservedSlug", reservedSlugSchema);
