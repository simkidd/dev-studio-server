import { Request, Response } from "express";
import { Testimonial } from "../models";
import { asyncHandler, sendSuccess, sendError } from "../utils";

export const getPublicTestimonials = asyncHandler(
  async (_req: Request, res: Response) => {
    const testimonials = await Testimonial.find({ isApproved: true })
      .sort({ order: 1, createdAt: -1 })
      .populate("projectRef", "title slug thumbnailUrl");

    sendSuccess(res, testimonials, "Testimonials retrieved successfully", 200);
  },
);

export const getAllTestimonialsAdmin = asyncHandler(
  async (_req: Request, res: Response) => {
    const testimonials = await Testimonial.find()
      .sort({ order: 1, createdAt: -1 })
      .populate("projectRef", "title slug");

    sendSuccess(res, testimonials, "All testimonials retrieved for admin", 200);
  },
);

export const createTestimonial = asyncHandler(
  async (req: Request, res: Response) => {
    const testimonial = await Testimonial.create(req.body);
    sendSuccess(res, testimonial, "Testimonial created successfully", 201);
  },
);

export const updateTestimonial = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const testimonial = await Testimonial.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!testimonial) {
      sendError(res, "Testimonial not found", 404);
      return;
    }

    sendSuccess(res, testimonial, "Testimonial updated successfully", 200);
  },
);

export const deleteTestimonial = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const testimonial = await Testimonial.findByIdAndDelete(id);

    if (!testimonial) {
      sendError(res, "Testimonial not found", 404);
      return;
    }

    sendSuccess(res, null, "Testimonial deleted successfully", 200);
  },
);
