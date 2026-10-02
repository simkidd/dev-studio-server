import { Request, Response } from "express";
import {
  Portfolio,
  Profile,
  Project,
  Experience,
  Skill,
  Testimonial,
  Post,
  User,
  ReservedSlug,
} from "../models";
import { AuthRequest } from "../middlewares";
import { asyncHandler, sendSuccess, sendError, slugify } from "../utils";

export const getPortfolioSettings = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
      sendError(res, "Unauthorized", 401);
      return;
    }

    let portfolio = await Portfolio.findOne({ userId });

    if (!portfolio) {
      const user = await User.findById(userId);
      const baseSlug = user
        ? slugify(`${user.firstName || "dev"}-${user.lastName || "portfolio"}`)
        : `dev-${userId.slice(-4)}`;

      let finalSlug = baseSlug;
      let count = 1;
      while (await Portfolio.findOne({ slug: finalSlug })) {
        finalSlug = `${baseSlug}-${count++}`;
      }

      portfolio = await Portfolio.create({
        userId,
        slug: finalSlug,
        templateId: "nova-engine",
        isPublished: true,
        publishedAt: new Date(),
        seoTitle: user ? `${user.firstName} ${user.lastName} | Developer Portfolio` : "Developer Portfolio",
        seoDescription: "Welcome to my official developer portfolio.",
      });
    }

    sendSuccess(res, portfolio, "Portfolio settings retrieved", 200);
  },
);

export const updatePortfolioSettings = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
      sendError(res, "Unauthorized", 401);
      return;
    }

    const { slug, templateId, isPublished, seoTitle, seoDescription, customDomain, themePreference } = req.body;

    const updateData: Record<string, any> = {};

    if (slug) {
      const cleanSlug = slugify(slug);
      if (!cleanSlug || cleanSlug.length < 3) {
        sendError(res, "Slug must be at least 3 alphanumeric characters", 400);
        return;
      }

      const isReserved = await ReservedSlug.findOne({ slug: cleanSlug });
      if (isReserved) {
        sendError(res, `The slug "${cleanSlug}" is a reserved platform keyword and cannot be claimed`, 400);
        return;
      }

      const existingSlug = await Portfolio.findOne({
        slug: cleanSlug,
        userId: { $ne: userId },
      });

      if (existingSlug) {
        sendError(res, `The slug "${cleanSlug}" is already taken by another developer`, 409);
        return;
      }

      updateData.slug = cleanSlug;
    }

    if (templateId) updateData.templateId = templateId;
    if (seoTitle !== undefined) updateData.seoTitle = seoTitle;
    if (seoDescription !== undefined) updateData.seoDescription = seoDescription;
    if (customDomain !== undefined) updateData.customDomain = customDomain;
    if (themePreference !== undefined) updateData.themePreference = themePreference;

    if (isPublished !== undefined) {
      updateData.isPublished = isPublished;
      if (isPublished) {
        updateData.publishedAt = new Date();
      }
    }

    const portfolio = await Portfolio.findOneAndUpdate(
      { userId },
      updateData,
      { new: true, upsert: true, runValidators: true },
    );

    sendSuccess(res, portfolio, "Portfolio settings updated successfully", 200);
  },
);

export const getPublicPortfolioBySlug = asyncHandler(
  async (req: Request, res: Response) => {
    const { slug } = req.params;

    if (!slug) {
      sendError(res, "Portfolio slug is required", 400);
      return;
    }

    const portfolio = await Portfolio.findOne({ slug });

    if (!portfolio) {
      sendError(res, "Portfolio not found", 404);
      return;
    }

    if (!portfolio.isPublished) {
      sendError(res, "This developer portfolio is currently in private draft mode", 403);
      return;
    }

    const targetUserId = portfolio.userId;

    const [profile, projects, experiences, skills, testimonials, posts] =
      await Promise.all([
        Profile.findOne({ userId: targetUserId }),
        Project.find({ userId: targetUserId, isPublished: true }).sort({
          order: 1,
          createdAt: -1,
        }),
        Experience.find({ userId: targetUserId }).sort({
          order: 1,
          isCurrent: -1,
          startDate: -1,
          endDate: -1,
        }),
        Skill.find({ userId: targetUserId }).sort({ category: 1, order: 1 }),
        Testimonial.find({ userId: targetUserId, isApproved: true })
          .sort({ createdAt: -1 })
          .populate("projectRef", "title slug thumbnailUrl"),
        Post.find({ userId: targetUserId, isPublished: true }).sort({
          publishedAt: -1,
          createdAt: -1,
        }),
      ]);

    const fallbackProfile = profile || {
      firstName: "Developer",
      lastName: "Portfolio",
      headline: "Full-Stack Software Engineer",
      bio: "Welcome to my developer portfolio.",
      location: "Remote / Worldwide",
      isAvailableForHire: true,
      socialLinks: {},
      stats: {
        yearsExperience: 2,
        completedProjects: projects.length,
        happyClients: 4,
        codeCommits: 500,
      },
    };

    sendSuccess(
      res,
      {
        portfolio,
        profile: fallbackProfile,
        projects,
        experiences,
        skills,
        testimonials,
        posts,
      },
      "Public portfolio loaded successfully",
      200,
    );
  },
);
