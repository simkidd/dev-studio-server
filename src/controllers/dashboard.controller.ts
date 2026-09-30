import { Response } from "express";
import { Types } from "mongoose";
import {
  Project,
  Post,
  Message,
  Experience,
  Skill,
  Testimonial,
  Portfolio,
  Profile,
} from "../models";
import { AuthRequest } from "../middlewares";
import { asyncHandler, sendSuccess, sendError } from "../utils";

export const getDashboardStats = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
      sendError(res, "Unauthorized", 401);
      return;
    }

    const userObjectId = new Types.ObjectId(userId);

    const [
      totalProjects,
      publishedProjects,
      featuredProjects,
      totalPosts,
      publishedPosts,
      totalMessages,
      unreadMessages,
      totalExperiences,
      totalSkills,
      totalTestimonials,
      recentMessages,
      recentProjects,
      portfolio,
      profile,
    ] = await Promise.all([
      Project.countDocuments({ userId }),
      Project.countDocuments({ userId, isPublished: true }),
      Project.countDocuments({ userId, isFeatured: true }),
      Post.countDocuments({ userId }),
      Post.countDocuments({ userId, isPublished: true }),
      Message.countDocuments({ userId }),
      Message.countDocuments({ userId, status: "unread" }),
      Experience.countDocuments({ userId }),
      Skill.countDocuments({ userId }),
      Testimonial.countDocuments({ userId }),
      Message.find({ userId }).sort({ createdAt: -1 }).limit(5),
      Project.find({ userId })
        .sort({ order: 1, createdAt: -1 })
        .limit(5)
        .select(
          "title slug category isPublished isFeatured thumbnailUrl technologies createdAt",
        ),
      Portfolio.findOne({ userId }),
      Profile.findOne({ userId }),
    ]);

    // Aggregate total views & likes across user's posts
    const postAggregates = await Post.aggregate([
      { $match: { userId: userObjectId } },
      {
        $group: {
          _id: null,
          totalViews: { $sum: "$viewsCount" },
          totalLikes: { $sum: "$likesCount" },
        },
      },
    ]);

    const totalViews = postAggregates[0]?.totalViews || 0;
    const totalLikes = postAggregates[0]?.totalLikes || 0;

    // Calculate Portfolio Completion Percentage
    const completionSteps = [
      { id: "profile", label: "Profile Information", done: Boolean(profile?.headline && profile?.bio) },
      { id: "avatar", label: "Avatar Photo", done: Boolean(profile?.avatarUrl) },
      { id: "projects", label: "Add Projects", done: totalProjects > 0 },
      { id: "experience", label: "Career Experience", done: totalExperiences > 0 },
      { id: "skills", label: "Skills Inventory", done: totalSkills > 0 },
      { id: "socials", label: "Social Links", done: Boolean(profile?.socialLinks && Object.values(profile.socialLinks).some(Boolean)) },
      { id: "published", label: "Publish Portfolio", done: Boolean(portfolio?.isPublished) },
    ];

    const completedSteps = completionSteps.filter((s) => s.done).length;
    const completionPercentage = Math.round((completedSteps / completionSteps.length) * 100);

    sendSuccess(
      res,
      {
        counts: {
          projects: {
            total: totalProjects,
            published: publishedProjects,
            featured: featuredProjects,
          },
          posts: {
            total: totalPosts,
            published: publishedPosts,
            totalViews,
            totalLikes,
          },
          messages: {
            total: totalMessages,
            unread: unreadMessages,
          },
          experiences: totalExperiences,
          skills: totalSkills,
          testimonials: totalTestimonials,
        },
        recent: {
          messages: recentMessages,
          projects: recentProjects,
        },
        portfolio: {
          slug: portfolio?.slug || "",
          templateId: portfolio?.templateId || "nova-engine",
          isPublished: portfolio?.isPublished ?? false,
          seoTitle: portfolio?.seoTitle || "",
          seoDescription: portfolio?.seoDescription || "",
        },
        completion: {
          percentage: completionPercentage,
          steps: completionSteps,
        },
      },
      "Dashboard statistics retrieved successfully",
      200,
    );
  },
);

