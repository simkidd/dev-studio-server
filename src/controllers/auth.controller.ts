import { Request, Response } from "express";
import { AuthService } from "../services";
import { User, Profile, Portfolio } from "../models";
import { AuthRequest } from "../middlewares";
import { asyncHandler, sendSuccess, sendError, slugify } from "../utils";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, firstName, lastName, desiredSlug } = req.body;

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    sendError(res, "An account with this email already exists", 400);
    return;
  }

  // Generate unique slug
  let candidateSlug = desiredSlug
    ? slugify(desiredSlug)
    : slugify(`${firstName}-${lastName}`);

  if (!candidateSlug || candidateSlug.length < 3) {
    candidateSlug = slugify(email.split("@")[0]);
  }

  let finalSlug = candidateSlug;
  let counter = 1;
  while (await Portfolio.findOne({ slug: finalSlug })) {
    finalSlug = `${candidateSlug}-${counter++}`;
  }

  // Hash password & create user with default role 'user'
  const hashedPassword = await AuthService.hashPassword(password);
  const user = await User.create({
    email: email.toLowerCase(),
    password: hashedPassword,
    firstName,
    lastName,
    role: "user",
  });

  // Create initial profile linked to userId
  const profile = await Profile.create({
    userId: user._id,
    firstName,
    lastName,
    headline: "Full-Stack Developer",
    bio: "Passionate developer building high-impact web and software applications.",
    location: "Remote / Worldwide",
    isAvailableForHire: true,
    socialLinks: {},
    stats: {
      yearsExperience: 1,
      completedProjects: 0,
      happyClients: 0,
      codeCommits: 100,
    },
  });

  // Create initial portfolio settings linked to userId
  const portfolio = await Portfolio.create({
    userId: user._id,
    slug: finalSlug,
    templateId: "nova-engine",
    isPublished: true,
    publishedAt: new Date(),
    seoTitle: `${firstName} ${lastName} | Developer Portfolio`,
    seoDescription: `Welcome to the official developer portfolio of ${firstName} ${lastName}.`,
  });

  // Generate auth tokens
  const tokens = AuthService.generateTokens({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  user.refreshToken = tokens.refreshToken;
  await user.save();

  const userJson = user.toJSON();
  const userWithProfile = {
    ...userJson,
    firstName: profile.firstName || user.firstName,
    lastName: profile.lastName || user.lastName,
    avatarUrl: profile.avatarUrl || "",
    headline: profile.headline || "",
    portfolioSlug: portfolio.slug,
  };

  sendSuccess(
    res,
    {
      user: userWithProfile,
      portfolio,
      tokens,
    },
    "Account registered successfully",
    201,
  );
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await AuthService.login(email, password);

  // Scoped to the authenticated user
  const profile = await Profile.findOne({ userId: result.user._id });
  const portfolio = await Portfolio.findOne({ userId: result.user._id });

  const userJson = result.user.toJSON();
  const userWithProfile = {
    ...userJson,
    firstName: result.user.firstName || profile?.firstName || "",
    lastName: result.user.lastName || profile?.lastName || "",
    avatarUrl: profile?.avatarUrl || "",
    headline: profile?.headline || "",
    portfolioSlug: portfolio?.slug || "",
  };

  sendSuccess(
    res,
    {
      user: userWithProfile,
      tokens: result.tokens,
    },
    "Logged in successfully",
    200,
  );
});

export const refreshToken = asyncHandler(
  async (req: Request, res: Response) => {
    const { refreshToken: token } = req.body;
    const tokens = await AuthService.refresh(token);

    sendSuccess(res, { tokens }, "Tokens refreshed successfully", 200);
  },
);

export const logout = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (req.user?.userId) {
    await AuthService.logout(req.user.userId);
  }
  sendSuccess(res, null, "Logged out successfully", 200);
});

export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user?.userId) {
    sendError(res, "Unauthorized", 401);
    return;
  }

  const user = await User.findById(req.user.userId);
  if (!user) {
    sendError(res, "User not found", 404);
    return;
  }

  // Scoped to the authenticated user
  const profile = await Profile.findOne({ userId: user._id });
  const portfolio = await Portfolio.findOne({ userId: user._id });

  const userJson = user.toJSON();
  const responseData = {
    ...userJson,
    firstName: profile?.firstName || user.firstName || "",
    lastName: profile?.lastName || user.lastName || "",
    avatarUrl: profile?.avatarUrl || "",
    headline: profile?.headline || "",
    portfolioSlug: portfolio?.slug || "",
  };

  sendSuccess(res, responseData, "User profile retrieved", 200);
});

export const changePassword = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      sendError(res, "Unauthorized", 401);
      return;
    }

    const user = await User.findById(userId).select("+password");
    if (!user || !user.password) {
      sendError(res, "User not found", 404);
      return;
    }

    const isMatch = await AuthService.comparePassword(
      currentPassword,
      user.password,
    );
    if (!isMatch) {
      sendError(res, "Current password is incorrect", 400);
      return;
    }

    user.password = await AuthService.hashPassword(newPassword);
    await user.save();

    sendSuccess(res, null, "Password changed successfully", 200);
  },
);

export const bootstrapInitialAdmin = asyncHandler(
  async (req: Request, res: Response) => {
    const adminCount = await User.countDocuments();
    if (adminCount > 0) {
      sendError(
        res,
        "Setup already completed. Initial admin already exists.",
        403,
      );
      return;
    }

    const { email, password } = req.body;
    const hashedPassword = await AuthService.hashPassword(password);

    const admin = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "superadmin",
    });

    const tokens = AuthService.generateTokens({
      userId: admin._id.toString(),
      email: admin.email,
      role: admin.role,
    });

    admin.refreshToken = tokens.refreshToken;
    await admin.save();

    sendSuccess(
      res,
      {
        user: admin,
        tokens,
      },
      "Initial superadmin account created successfully",
      201,
    );
  },
);

