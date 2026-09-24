import { Schema, model } from "mongoose";
import { ITestimonial } from "../interfaces";

const testimonialSchema = new Schema<ITestimonial>(
  {
    clientName: {
      type: String,
      required: [true, "Client name is required"],
      trim: true,
    },
    clientRole: {
      type: String,
      required: [true, "Client role is required"],
      trim: true,
    },
    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    avatarUrl: {
      type: String,
    },
    quote: {
      type: String,
      required: [true, "Testimonial quote is required"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    projectRef: {
      type: Schema.Types.ObjectId,
      ref: "Project",
    },
    linkedInUrl: {
      type: String,
      trim: true,
    },
    companyUrl: {
      type: String,
      trim: true,
    },
    isFeatured: {
      type: Boolean,
      default: true,
    },
    isApproved: {
      type: Boolean,
      default: true,
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

export const Testimonial = model<ITestimonial>("Testimonial", testimonialSchema);
