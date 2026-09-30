import { Request, Response } from "express";
import { Experience, Portfolio } from "../models";
import { AuthRequest } from "../middlewares";
import { asyncHandler, sendSuccess, sendError } from "../utils";

export const getPublicExperiences = asyncHandler(
  async (req: Request, res: Response) => {
    const { slug, userId } = req.query;

    let targetUserId: any = userId ? String(userId) : undefined;
    if (slug) {
      const portfolio = await Portfolio.findOne({ slug: String(slug) });
      if (portfolio) {
        targetUserId = portfolio.userId;
      }
    }

    const query: Record<string, any> = {};
    if (targetUserId) {
      query.userId = targetUserId;
    }


    const experiences = await Experience.find(query).sort({
      order: 1,
      isCurrent: -1,
      startDate: -1,
      endDate: -1,
    });
    sendSuccess(
      res,
      experiences,
      "Career timeline retrieved successfully",
      200,
    );
  },
);

export const getAllExperiencesAdmin = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
      sendError(res, "Unauthorized", 401);
      return;
    }

    const experiences = await Experience.find({ userId }).sort({
      order: 1,
      isCurrent: -1,
      startDate: -1,
      endDate: -1,
    });

    sendSuccess(res, experiences, "Experiences retrieved successfully", 200);
  },
);

export const createExperience = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
      sendError(res, "Unauthorized", 401);
      return;
    }

    const experience = await Experience.create({
      ...req.body,
      userId,
    });
    sendSuccess(res, experience, "Experience added successfully", 201);
  },
);

export const updateExperience = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId;
    if (!userId) {
      sendError(res, "Unauthorized", 401);
      return;
    }

    const experience = await Experience.findOneAndUpdate(
      { _id: id, userId },
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!experience) {
      sendError(res, "Experience not found", 404);
      return;
    }

    sendSuccess(res, experience, "Experience updated successfully", 200);
  },
);

export const deleteExperience = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId;
    if (!userId) {
      sendError(res, "Unauthorized", 401);
      return;
    }

    const experience = await Experience.findOneAndDelete({ _id: id, userId });

    if (!experience) {
      sendError(res, "Experience not found", 404);
      return;
    }

    sendSuccess(res, null, "Experience deleted successfully", 200);
  },
);

export const reorderExperiences = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
      sendError(res, "Unauthorized", 401);
      return;
    }

    const orders = (req.body.orders || req.body.items) as { id: string; order: number }[];

    if (!Array.isArray(orders)) {
      sendError(res, "Invalid reorder payload", 400);
      return;
    }

    const bulkOps = orders.map((item) => ({
      updateOne: {
        filter: { _id: item.id, userId },
        update: { $set: { order: item.order } },
      },
    }));

    await Experience.bulkWrite(bulkOps);
    sendSuccess(res, null, "Experiences reordered successfully", 200);
  },
);

