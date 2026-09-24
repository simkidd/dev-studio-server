import { Request, Response } from "express";
import { AuthService } from "../services";
import { User, Profile } from "../models";
import { AuthRequest } from "../middlewares";
import { asyncHandler, sendSuccess, sendError } from "../utils";

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await AuthService.login(email, password);

  const profile = await Profile.findOne().sort({ createdAt: -1 });
  const userJson = result.user.toJSON();
  const userWithProfile = {
    ...userJson,
    firstName: result.user.firstName || profile?.firstName || "",
    lastName: result.user.lastName || profile?.lastName || "",
    avatarUrl: profile?.avatarUrl || "",
    headline: profile?.headline || "",
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

  const profile = await Profile.findOne().sort({ createdAt: -1 });
  const userJson = user.toJSON();
  const responseData = {
    ...userJson,
    firstName: user.firstName || profile?.firstName || "",
    lastName: user.lastName || profile?.lastName || "",
    avatarUrl: profile?.avatarUrl || "",
    headline: profile?.headline || "",
  };

  sendSuccess(res, responseData, "Admin profile retrieved", 200);
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
