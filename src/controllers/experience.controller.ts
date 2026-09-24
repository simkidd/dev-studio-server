import { Request, Response } from "express";
import { Experience } from "../models";
import { asyncHandler, sendSuccess, sendError } from "../utils";

export const getPublicExperiences = asyncHandler(
  async (_req: Request, res: Response) => {
    const experiences = await Experience.find().sort({
      order: 1,
      startDate: -1,
    });
    sendSuccess(
      res,
      experiences,
      "Career timeline retrieved successfully",
      200,
    );
  },
);

export const createExperience = asyncHandler(
  async (req: Request, res: Response) => {
    const experience = await Experience.create(req.body);
    sendSuccess(res, experience, "Experience added successfully", 201);
  },
);

export const updateExperience = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const experience = await Experience.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!experience) {
      sendError(res, "Experience not found", 404);
      return;
    }

    sendSuccess(res, experience, "Experience updated successfully", 200);
  },
);

export const deleteExperience = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const experience = await Experience.findByIdAndDelete(id);

    if (!experience) {
      sendError(res, "Experience not found", 404);
      return;
    }

    sendSuccess(res, null, "Experience deleted successfully", 200);
  },
);

export const reorderExperiences = asyncHandler(
  async (req: Request, res: Response) => {
    const { orders } = req.body as { orders: { id: string; order: number }[] };

    if (!Array.isArray(orders)) {
      sendError(res, "Invalid reorder payload", 400);
      return;
    }

    const bulkOps = orders.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { order: item.order } },
      },
    }));

    await Experience.bulkWrite(bulkOps);
    sendSuccess(res, null, "Experiences reordered successfully", 200);
  },
);
