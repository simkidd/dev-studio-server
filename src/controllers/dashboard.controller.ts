import { Request, Response } from "express";
import {
  Project,
  Post,
  Message,
  Experience,
  Skill,
  Testimonial,
} from "../models";
import { asyncHandler, sendSuccess } from "../utils";

export const getDashboardStats = asyncHandler(
  async (_req: Request, res: Response) => {
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
    ] = await Promise.all([
      Project.countDocuments(),
      Project.countDocuments({ isPublished: true }),
      Project.countDocuments({ isFeatured: true }),
      Post.countDocuments(),
      Post.countDocuments({ isPublished: true }),
      Message.countDocuments(),
      Message.countDocuments({ status: "unread" }),
      Experience.countDocuments(),
      Skill.countDocuments(),
      Testimonial.countDocuments(),
      Message.find().sort({ createdAt: -1 }).limit(5),
      Project.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("title slug category isPublished isFeatured createdAt"),
    ]);

    // Aggregate total views & likes across posts
    const postAggregates = await Post.aggregate([
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
      },
      "Dashboard statistics retrieved successfully",
      200,
    );
  },
);
