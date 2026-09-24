import { Request, Response } from "express";
import { Skill } from "../models";
import { asyncHandler, sendSuccess, sendError } from "../utils";

export const getPublicSkills = asyncHandler(
  async (_req: Request, res: Response) => {
    const skills = await Skill.find().sort({ category: 1, order: 1 });
    sendSuccess(res, skills, "Skills retrieved successfully", 200);
  },
);

export const createSkill = asyncHandler(async (req: Request, res: Response) => {
  const skill = await Skill.create(req.body);
  sendSuccess(res, skill, "Skill created successfully", 201);
});

export const updateSkill = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const skill = await Skill.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!skill) {
    sendError(res, "Skill not found", 404);
    return;
  }

  sendSuccess(res, skill, "Skill updated successfully", 200);
});

export const deleteSkill = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const skill = await Skill.findByIdAndDelete(id);

  if (!skill) {
    sendError(res, "Skill not found", 404);
    return;
  }

  sendSuccess(res, null, "Skill deleted successfully", 200);
});

export const reorderSkills = asyncHandler(
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

    await Skill.bulkWrite(bulkOps);
    sendSuccess(res, null, "Skills reordered successfully", 200);
  },
);
