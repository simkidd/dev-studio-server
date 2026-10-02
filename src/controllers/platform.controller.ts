import { Request, Response } from "express";
import {
  User,
  Profile,
  Portfolio,
  Project,
  Post,
  Message,
  Skill,
  Experience,
  Testimonial,
  ReservedSlug,
  Announcement,
  AuditLog,
  TemplateSetting,
} from "../models";
import { AuthRequest } from "../middlewares";
import { AuthService } from "../services";
import { asyncHandler, sendSuccess, sendError } from "../utils";
import { Types } from "mongoose";

// Default system reserved slugs list
const DEFAULT_SYSTEM_SLUGS = [
  "admin", "api", "login", "register", "signup", "signin",
  "logout", "pricing", "blog", "support", "docs", "settings",
  "onboarding", "terms", "privacy", "status", "google", "github",
  "stripe", "devportfolio", "alex-morgan", "demo", "platform", "dashboard"
];

// Helper to log audit actions
const logAuditAction = async ({
  action,
  category,
  performedBy,
  targetUser,
  targetEntityId,
  entityType,
  details,
  req,
}: {
  action: string;
  category: "auth" | "user_management" | "domain" | "template" | "announcement" | "system";
  performedBy: any;
  targetUser?: any;
  targetEntityId?: any;
  entityType?: string;
  details?: Record<string, any>;
  req?: any;
}) => {
  try {
    await AuditLog.create({
      action,
      category,
      performedBy: new Types.ObjectId(String(performedBy)),
      targetUser: targetUser ? new Types.ObjectId(String(targetUser)) : undefined,
      targetEntityId: targetEntityId ? String(targetEntityId) : undefined,
      entityType,
      details: details || {},
      ipAddress: req?.ip || req?.socket.remoteAddress,
      userAgent: Array.isArray(req?.headers["user-agent"])
        ? req?.headers["user-agent"][0]
        : req?.headers["user-agent"],
    });
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
};

export const getPlatformStats = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    // Seed default template settings if none exist
    const templateCount = await TemplateSetting.countDocuments();
    if (templateCount === 0) {
      await TemplateSetting.create([
        {
          templateId: "classic-dev",
          name: "Classic Dev",
          description: "Minimalist, clean high-contrast engineering portfolio with dark/light themes.",
          status: "active",
          isFeatured: true,
          order: 1,
          tags: ["Minimalist", "Fast Load", "Clean"],
        },
        {
          templateId: "nova-engine",
          name: "Nova Engine",
          description: "Interactive canvas, dynamic architecture graphs, and futuristic HUD aesthetics.",
          status: "active",
          isFeatured: true,
          order: 2,
          tags: ["Interactive", "Canvas", "3D Motion"],
        },
        {
          templateId: "apex-studio",
          name: "Apex Studio",
          description: "Editorial luxury aesthetic with monospace typography for senior & staff architects.",
          status: "active",
          isFeatured: true,
          order: 3,
          tags: ["Editorial", "Staff Architect", "Monospace"],
        },
      ]);
    }

    // Seed default reserved slugs if none exist
    const slugCount = await ReservedSlug.countDocuments();
    if (slugCount === 0) {
      await ReservedSlug.insertMany(
        DEFAULT_SYSTEM_SLUGS.map((slug) => ({
          slug,
          reason: "Default system reserved route / brand protection",
          isSystem: true,
        })),
      );
    }

    const [
      totalUsers,
      totalPortfolios,
      publishedPortfolios,
      totalProjects,
      totalPosts,
      totalMessages,
      totalSkills,
      totalExperiences,
      totalTestimonials,
      totalReservedSlugs,
      activeAnnouncementsCount,
      totalAuditLogs,
      templateCountsRaw,
      roleCountsRaw,
      recentUsers,
    ] = await Promise.all([
      User.countDocuments(),
      Portfolio.countDocuments(),
      Portfolio.countDocuments({ isPublished: true }),
      Project.countDocuments(),
      Post.countDocuments(),
      Message.countDocuments(),
      Skill.countDocuments(),
      Experience.countDocuments(),
      Testimonial.countDocuments(),
      ReservedSlug.countDocuments(),
      Announcement.countDocuments({ isActive: true }),
      AuditLog.countDocuments(),
      Portfolio.aggregate([
        { $group: { _id: "$templateId", count: { $sum: 1 } } },
      ]),
      User.aggregate([
        { $group: { _id: "$role", count: { $sum: 1 } } },
      ]),
      User.find()
        .sort({ createdAt: -1 })
        .limit(8)
        .select("firstName lastName email role createdAt lastLogin"),
    ]);

    // Template map
    const templateDistribution: Record<string, number> = {
      "classic-dev": 0,
      "nova-engine": 0,
      "apex-studio": 0,
    };
    templateCountsRaw.forEach((t) => {
      if (t._id) {
        templateDistribution[t._id] = t.count;
      }
    });

    // Role map
    const roleDistribution: Record<string, number> = {
      superadmin: 0,
      admin: 0,
      user: 0,
    };
    roleCountsRaw.forEach((r) => {
      if (r._id) {
        roleDistribution[r._id] = r.count;
      }
    });

    // System Metrics
    const memory = process.memoryUsage();
    const systemInfo = {
      uptimeSeconds: Math.floor(process.uptime()),
      nodeVersion: process.version,
      platform: process.platform,
      memoryRssMb: Math.round(memory.rss / (1024 * 1024)),
      memoryHeapUsedMb: Math.round(memory.heapUsed / (1024 * 1024)),
      memoryHeapTotalMb: Math.round(memory.heapTotal / (1024 * 1024)),
      environment: process.env.NODE_ENV || "development",
    };

    sendSuccess(
      res,
      {
        metrics: {
          totalUsers,
          totalPortfolios,
          publishedPortfolios,
          totalProjects,
          totalPosts,
          totalMessages,
          totalSkills,
          totalExperiences,
          totalTestimonials,
          totalReservedSlugs,
          activeAnnouncementsCount,
          totalAuditLogs,
        },
        templateDistribution,
        roleDistribution,
        recentUsers,
        systemInfo,
      },
      "Platform analytics retrieved successfully",
      200,
    );
  },
);

export const getPlatformUsers = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const search = (req.query.search as string)?.trim() || "";
    const role = (req.query.role as string)?.trim() || "";

    const filter: Record<string, any> = {};

    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: "i" } },
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
      ];
    }

    if (role && ["user", "admin", "superadmin"].includes(role)) {
      filter.role = role;
    }

    const totalUsers = await User.countDocuments(filter);
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("firstName lastName email role createdAt lastLogin");

    const enhancedUsers = await Promise.all(
      users.map(async (u) => {
        const [portfolio, profile, projectCount] = await Promise.all([
          Portfolio.findOne({ userId: u._id }).select("slug templateId isPublished customDomain"),
          Profile.findOne({ userId: u._id }).select("avatarUrl headline location"),
          Project.countDocuments({ userId: u._id }),
        ]);

        return {
          _id: u._id,
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          role: u.role,
          createdAt: (u as any).createdAt,
          lastLogin: u.lastLogin,
          profile: profile
            ? {
                avatarUrl: profile.avatarUrl,
                headline: profile.headline,
                location: profile.location,
              }
            : null,
          portfolio: portfolio
            ? {
                slug: portfolio.slug,
                templateId: portfolio.templateId,
                isPublished: portfolio.isPublished,
                customDomain: portfolio.customDomain,
              }
            : null,
          projectCount,
        };
      }),
    );

    sendSuccess(
      res,
      {
        users: enhancedUsers,
        pagination: {
          total: totalUsers,
          page,
          limit,
          totalPages: Math.ceil(totalUsers / limit),
        },
      },
      "Platform users retrieved successfully",
      200,
    );
  },
);

export const updatePlatformUserRole = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { role } = req.body;

    if (!["user", "admin", "superadmin"].includes(role)) {
      sendError(res, "Invalid role specified", 400);
      return;
    }

    if (req.user?.userId === id && role !== "superadmin") {
      const superadminCount = await User.countDocuments({ role: "superadmin" });
      if (superadminCount <= 1) {
        sendError(res, "Cannot demote the last remaining superadmin account", 400);
        return;
      }
    }

    const previousUser = await User.findById(id);
    if (!previousUser) {
      sendError(res, "User not found", 404);
      return;
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true },
    ).select("firstName lastName email role");

    await logAuditAction({
      action: "USER_ROLE_UPDATED",
      category: "user_management",
      performedBy: req.user!.userId,
      targetUser: id,
      details: { previousRole: previousUser.role, newRole: role, email: previousUser.email },
      req,
    });

    sendSuccess(res, user, "User role updated successfully", 200);
  },
);

export const deletePlatformUser = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    if (req.user?.userId === id) {
      sendError(res, "You cannot delete your own superadmin account", 400);
      return;
    }

    const user = await User.findById(id);
    if (!user) {
      sendError(res, "User not found", 404);
      return;
    }

    await Promise.all([
      User.findByIdAndDelete(id),
      Profile.deleteMany({ userId: id }),
      Portfolio.deleteMany({ userId: id }),
      Project.deleteMany({ userId: id }),
      Post.deleteMany({ userId: id }),
      Message.deleteMany({ userId: id }),
      Skill.deleteMany({ userId: id }),
      Experience.deleteMany({ userId: id }),
      Testimonial.deleteMany({ userId: id }),
    ]);

    await logAuditAction({
      action: "USER_DELETED",
      category: "user_management",
      performedBy: req.user!.userId,
      targetUser: id,
      details: { email: user.email, name: `${user.firstName} ${user.lastName}` },
      req,
    });

    sendSuccess(res, { deletedUserId: id }, "User and associated portfolio deleted successfully", 200);
  },
);

export const impersonateUser = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const targetUser = await User.findById(id);
    if (!targetUser) {
      sendError(res, "Target user not found", 404);
      return;
    }

    const tokens = AuthService.generateTokens({
      userId: targetUser._id.toString(),
      email: targetUser.email,
      role: targetUser.role,
    });

    await logAuditAction({
      action: "SUPPORT_IMPERSONATION_STARTED",
      category: "auth",
      performedBy: req.user!.userId,
      targetUser: id,
      details: { targetEmail: targetUser.email, targetRole: targetUser.role },
      req,
    });

    sendSuccess(
      res,
      {
        user: {
          id: targetUser._id.toString(),
          email: targetUser.email,
          firstName: targetUser.firstName,
          lastName: targetUser.lastName,
          role: targetUser.role,
        },
        tokens,
      },
      `Impersonation session created for ${targetUser.email}`,
      200,
    );
  },
);

// ==========================================
// RESERVED SLUGS CONTROLLER
// ==========================================
export const getReservedSlugs = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const slugs = await ReservedSlug.find().sort({ isSystem: -1, slug: 1 });
    sendSuccess(res, slugs, "Reserved slugs retrieved successfully", 200);
  },
);

export const addReservedSlug = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { slug, reason } = req.body;
    if (!slug || slug.trim().length < 2) {
      sendError(res, "Valid slug name is required (minimum 2 characters)", 400);
      return;
    }

    const normalizedSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, "-");

    const existing = await ReservedSlug.findOne({ slug: normalizedSlug });
    if (existing) {
      sendError(res, "This slug is already in the reserved list", 400);
      return;
    }

    const reserved = await ReservedSlug.create({
      slug: normalizedSlug,
      reason: reason || "Reserved by platform administrator",
      isSystem: false,
      createdBy: new Types.ObjectId(req.user!.userId),
    });

    await logAuditAction({
      action: "SLUG_RESERVED",
      category: "domain",
      performedBy: req.user!.userId,
      targetEntityId: reserved._id.toString(),
      entityType: "ReservedSlug",
      details: { slug: normalizedSlug, reason },
      req,
    });

    sendSuccess(res, reserved, "Slug added to reservation list", 201);
  },
);

export const deleteReservedSlug = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const reserved = await ReservedSlug.findById(id);
    if (!reserved) {
      sendError(res, "Reserved slug entry not found", 404);
      return;
    }

    if (reserved.isSystem) {
      sendError(res, "Cannot delete protected system reserved route", 400);
      return;
    }

    await ReservedSlug.findByIdAndDelete(id);

    await logAuditAction({
      action: "SLUG_UNRESERVED",
      category: "domain",
      performedBy: req.user!.userId,
      targetEntityId: id,
      entityType: "ReservedSlug",
      details: { slug: reserved.slug },
      req,
    });

    sendSuccess(res, { id }, "Reserved slug removed", 200);
  },
);

// ==========================================
// TEMPLATES CONTROLLER
// ==========================================
export const getPlatformTemplates = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    let templates = await TemplateSetting.find().sort({ order: 1 });
    if (templates.length === 0) {
      await TemplateSetting.create([
        {
          templateId: "classic-dev",
          name: "Classic Dev",
          description: "Minimalist, clean high-contrast engineering portfolio with dark/light themes.",
          status: "active",
          isFeatured: true,
          order: 1,
          tags: ["Minimalist", "Fast Load", "Clean"],
        },
        {
          templateId: "nova-engine",
          name: "Nova Engine",
          description: "Interactive canvas, dynamic architecture graphs, and futuristic HUD aesthetics.",
          status: "active",
          isFeatured: true,
          order: 2,
          tags: ["Interactive", "Canvas", "3D Motion"],
        },
        {
          templateId: "apex-studio",
          name: "Apex Studio",
          description: "Editorial luxury aesthetic with monospace typography for senior & staff architects.",
          status: "active",
          isFeatured: true,
          order: 3,
          tags: ["Editorial", "Staff Architect", "Monospace"],
        },
      ]);
      templates = await TemplateSetting.find().sort({ order: 1 });
    }
    sendSuccess(res, templates, "Template settings retrieved successfully", 200);
  },
);

export const updatePlatformTemplate = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { templateId } = req.params;
    const { status, isFeatured, description, tags } = req.body;

    const template = await TemplateSetting.findOneAndUpdate(
      { templateId },
      { status, isFeatured, description, tags },
      { new: true, upsert: true },
    );

    await logAuditAction({
      action: "TEMPLATE_SETTING_UPDATED",
      category: "template",
      performedBy: req.user!.userId,
      targetEntityId: templateId,
      entityType: "TemplateSetting",
      details: { status, isFeatured },
      req,
    });

    sendSuccess(res, template, "Template setting updated successfully", 200);
  },
);

// ==========================================
// ANNOUNCEMENTS CONTROLLER
// ==========================================
export const getPlatformAnnouncements = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const announcements = await Announcement.find()
      .populate("createdBy", "firstName lastName email")
      .sort({ createdAt: -1 });
    sendSuccess(res, announcements, "Announcements retrieved successfully", 200);
  },
);

export const createPlatformAnnouncement = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { title, message, type, targetAudience, linkUrl, linkText, expiresAt } = req.body;

    if (!title || !message) {
      sendError(res, "Announcement title and message are required", 400);
      return;
    }

    const announcement = await Announcement.create({
      title,
      message,
      type: type || "info",
      targetAudience: targetAudience || "all",
      linkUrl,
      linkText,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      createdBy: new Types.ObjectId(req.user!.userId),
      isActive: true,
    });

    await logAuditAction({
      action: "ANNOUNCEMENT_CREATED",
      category: "announcement",
      performedBy: req.user!.userId,
      targetEntityId: announcement._id.toString(),
      entityType: "Announcement",
      details: { title, type },
      req,
    });

    sendSuccess(res, announcement, "Announcement published successfully", 201);
  },
);

export const updatePlatformAnnouncement = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const announcement = await Announcement.findByIdAndUpdate(
      id,
      req.body,
      { new: true },
    );

    if (!announcement) {
      sendError(res, "Announcement not found", 404);
      return;
    }

    await logAuditAction({
      action: "ANNOUNCEMENT_UPDATED",
      category: "announcement",
      performedBy: req.user!.userId,
      targetEntityId: id,
      entityType: "Announcement",
      details: req.body,
      req,
    });

    sendSuccess(res, announcement, "Announcement updated successfully", 200);
  },
);

export const deletePlatformAnnouncement = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const announcement = await Announcement.findByIdAndDelete(id);

    if (!announcement) {
      sendError(res, "Announcement not found", 404);
      return;
    }

    await logAuditAction({
      action: "ANNOUNCEMENT_DELETED",
      category: "announcement",
      performedBy: req.user!.userId,
      targetEntityId: id,
      entityType: "Announcement",
      details: { title: announcement.title },
      req,
    });

    sendSuccess(res, { id }, "Announcement deleted successfully", 200);
  },
);

export const getActivePublicAnnouncements = asyncHandler(
  async (_req: Request, res: Response) => {
    const now = new Date();
    const active = await Announcement.find({
      isActive: true,
      $or: [{ expiresAt: { $exists: false } }, { expiresAt: { $gt: now } }, { expiresAt: null }],
    })
      .sort({ createdAt: -1 })
      .limit(3);

    sendSuccess(res, active, "Active announcements retrieved", 200);
  },
);

// ==========================================
// AUDIT LOGS CONTROLLER
// ==========================================
export const getAuditLogs = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 25;
    const category = (req.query.category as string)?.trim() || "";

    const filter: Record<string, any> = {};
    if (category && category !== "all") {
      filter.category = category;
    }

    const total = await AuditLog.countDocuments(filter);
    const logs = await AuditLog.find(filter)
      .populate("performedBy", "firstName lastName email role")
      .populate("targetUser", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    sendSuccess(
      res,
      {
        logs,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Audit logs retrieved successfully",
      200,
    );
  },
);
