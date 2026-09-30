import { Request, Response } from "express";
import { Skill, Portfolio } from "../models";
import { AuthRequest } from "../middlewares";
import { asyncHandler, sendSuccess, sendError } from "../utils";

export const getPublicSkills = asyncHandler(
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


    const skills = await Skill.find(query).sort({ category: 1, order: 1 });
    sendSuccess(res, skills, "Skills retrieved successfully", 200);
  },
);

export const getAllSkillsAdmin = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
      sendError(res, "Unauthorized", 401);
      return;
    }

    const skills = await Skill.find({ userId }).sort({ category: 1, order: 1 });
    sendSuccess(res, skills, "Skills retrieved for admin", 200);
  },
);

export const createSkill = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    sendError(res, "Unauthorized", 401);
    return;
  }

  const skill = await Skill.create({ ...req.body, userId });
  sendSuccess(res, skill, "Skill created successfully", 201);
});

export const updateSkill = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;
  if (!userId) {
    sendError(res, "Unauthorized", 401);
    return;
  }

  const skill = await Skill.findOneAndUpdate({ _id: id, userId }, req.body, {
    new: true,
    runValidators: true,
  });

  if (!skill) {
    sendError(res, "Skill not found", 404);
    return;
  }

  sendSuccess(res, skill, "Skill updated successfully", 200);
});

export const deleteSkill = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;
  if (!userId) {
    sendError(res, "Unauthorized", 401);
    return;
  }

  const skill = await Skill.findOneAndDelete({ _id: id, userId });

  if (!skill) {
    sendError(res, "Skill not found", 404);
    return;
  }

  sendSuccess(res, null, "Skill deleted successfully", 200);
});

export const reorderSkills = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
      sendError(res, "Unauthorized", 401);
      return;
    }

    const { orders } = req.body as { orders: { id: string; order: number }[] };

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

    await Skill.bulkWrite(bulkOps);
    sendSuccess(res, null, "Skills reordered successfully", 200);
  },
);

