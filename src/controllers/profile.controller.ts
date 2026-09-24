import { Request, Response } from "express";
import { Profile } from "../models";
import { asyncHandler, sendSuccess, sendError } from "../utils";

export const getPublicProfile = asyncHandler(async (_req: Request, res: Response) => {
  const profile = await Profile.findOne().sort({ createdAt: -1 });

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

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  let profile = await Profile.findOne().sort({ createdAt: -1 });

  if (!profile) {
    profile = await Profile.create(req.body);
  } else {
    Object.assign(profile, req.body);
    await profile.save();
  }

  sendSuccess(res, profile, "Profile updated successfully", 200);
});
