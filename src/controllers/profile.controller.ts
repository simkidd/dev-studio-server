import { Request, Response } from "express";
import { Profile, User, Portfolio } from "../models";
import { AuthRequest } from "../middlewares";
import { asyncHandler, sendSuccess, sendError } from "../utils";

export const getPublicProfile = asyncHandler(async (req: Request, res: Response) => {
  const { slug, userId } = req.query;

  let targetUserId: any = userId ? String(userId) : undefined;
  if (slug) {
    const portfolio = await Portfolio.findOne({ slug: String(slug) });
    if (portfolio) {
      targetUserId = portfolio.userId;
    }
  }

  const query: Record<string, any> = targetUserId ? { userId: targetUserId } : {};
  const profile = await Profile.findOne(query).sort({ createdAt: -1 });


  if (!profile) {
    sendSuccess(
      res,
      {
        firstName: "Developer",
        lastName: "Portfolio",
        headline: "Full-Stack Software Engineer",
        bio: "Welcome to my developer portfolio.",
        location: "Remote",
        isAvailableForHire: true,
        socialLinks: {},
        stats: {
          yearsExperience: 3,
          completedProjects: 12,
          happyClients: 8,
          codeCommits: 1500,
        },
      },
      "Default profile loaded",
      200,
    );
    return;
  }

  sendSuccess(res, profile, "Profile retrieved successfully", 200);
});

export const getAdminProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    sendError(res, "Unauthorized", 401);
    return;
  }

  let profile = await Profile.findOne({ userId });

  if (!profile) {
    const user = await User.findById(userId);
    profile = await Profile.create({
      userId,
      firstName: user?.firstName || "Developer",
      lastName: user?.lastName || "",
      headline: "Full-Stack Developer",
      bio: "Welcome to my developer portfolio.",
      location: "Remote",
      isAvailableForHire: true,
      socialLinks: {},
      stats: {
        yearsExperience: 1,
        completedProjects: 0,
        happyClients: 0,
        codeCommits: 100,
      },
    });
  }

  sendSuccess(res, profile, "Admin profile retrieved", 200);
});

export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    sendError(res, "Unauthorized", 401);
    return;
  }

  const profile = await Profile.findOneAndUpdate(
    { userId },
    { ...req.body, userId },
    { new: true, upsert: true, runValidators: true }
  );

  if (profile.firstName || profile.lastName) {
    await User.findByIdAndUpdate(userId, {
      ...(profile.firstName ? { firstName: profile.firstName } : {}),
      ...(profile.lastName ? { lastName: profile.lastName } : {}),
    });
  }

  sendSuccess(res, profile, "Profile updated successfully", 200);
});


