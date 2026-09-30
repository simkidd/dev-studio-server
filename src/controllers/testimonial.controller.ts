import { Request, Response } from "express";
import { Testimonial, Portfolio } from "../models";
import { AuthRequest } from "../middlewares";
import { asyncHandler, sendSuccess, sendError } from "../utils";

export const getPublicTestimonials = asyncHandler(
  async (req: Request, res: Response) => {
    const { slug, userId } = req.query;

    let targetUserId: any = userId ? String(userId) : undefined;
    if (slug) {
      const portfolio = await Portfolio.findOne({ slug: String(slug) });
      if (portfolio) {
        targetUserId = portfolio.userId;
      }
    }

    const query: Record<string, any> = { isApproved: true };
    if (targetUserId) {
      query.userId = targetUserId;
    }


    const testimonials = await Testimonial.find(query)
      .sort({ createdAt: -1 })
      .populate("projectRef", "title slug thumbnailUrl");

    sendSuccess(res, testimonials, "Testimonials retrieved successfully", 200);
  },
);

export const getAllTestimonialsAdmin = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
      sendError(res, "Unauthorized", 401);
      return;
    }

    const testimonials = await Testimonial.find({ userId })
      .sort({ createdAt: -1 })
      .populate("projectRef", "title slug");

    sendSuccess(res, testimonials, "All testimonials retrieved for admin", 200);
  },
);

export const createTestimonial = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
      sendError(res, "Unauthorized", 401);
      return;
    }

    const testimonial = await Testimonial.create({
      ...req.body,
      userId,
    });
    sendSuccess(res, testimonial, "Testimonial created successfully", 201);
  },
);

export const updateTestimonial = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId;
    if (!userId) {
      sendError(res, "Unauthorized", 401);
      return;
    }

    const testimonial = await Testimonial.findOneAndUpdate(
      { _id: id, userId },
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!testimonial) {
      sendError(res, "Testimonial not found", 404);
      return;
    }

    sendSuccess(res, testimonial, "Testimonial updated successfully", 200);
  },
);

export const deleteTestimonial = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId;
    if (!userId) {
      sendError(res, "Unauthorized", 401);
      return;
    }

    const testimonial = await Testimonial.findOneAndDelete({ _id: id, userId });

    if (!testimonial) {
      sendError(res, "Testimonial not found", 404);
      return;
    }

    sendSuccess(res, null, "Testimonial deleted successfully", 200);
  },
);

