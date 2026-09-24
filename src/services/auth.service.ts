import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { HydratedDocument } from "mongoose";
import { User } from "../models";
import { ENV } from "../config/env";
import { IUser } from "../interfaces";

export interface ITokenPayload {
  userId: string;
  email: string;
  role: string;
}

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  private static readonly SALT_ROUNDS = 12;

  /**
   * Hash plain text password
   */
  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(this.SALT_ROUNDS);
    return bcrypt.hash(password, salt);
  }

  /**
   * Compare candidate password with stored hash
   */
  static async comparePassword(candidate: string, hash: string): Promise<boolean> {
    if (!candidate || !hash) return false;
    return bcrypt.compare(candidate, hash);
  }

  /**
   * Generate short-lived Access Token
   */
  static generateAccessToken(payload: ITokenPayload): string {
    const options: SignOptions = {
      expiresIn: (ENV.JWT_EXPIRES_IN || "15m") as any,
    };
    return jwt.sign(payload, ENV.JWT_SECRET, options);
  }

  /**
   * Generate long-lived Refresh Token
   */
  static generateRefreshToken(payload: ITokenPayload): string {
    const options: SignOptions = {
      expiresIn: (ENV.JWT_REFRESH_EXPIRES_IN || "7d") as any,
    };
    return jwt.sign(payload, ENV.JWT_REFRESH_SECRET || ENV.JWT_SECRET, options);
  }

  /**
   * Generate both access and refresh tokens
   */
  static generateTokens(payload: ITokenPayload): IAuthTokens {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  /**
   * Verify Access Token
   */
  static verifyAccessToken(token: string): ITokenPayload {
    return jwt.verify(token, ENV.JWT_SECRET) as ITokenPayload;
  }

  /**
   * Verify Refresh Token
   */
  static verifyRefreshToken(token: string): ITokenPayload {
    return jwt.verify(
      token,
      ENV.JWT_REFRESH_SECRET || ENV.JWT_SECRET,
    ) as ITokenPayload;
  }

  /**
   * Login user by email & password
   */
  static async login(
    email: string,
    candidatePassword: string,
  ): Promise<{ user: HydratedDocument<IUser>; tokens: IAuthTokens }> {
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password +refreshToken",
    );

    if (!user || !user.password) {
      throw new Error("Invalid email or password");
    }

    const isMatch = await this.comparePassword(candidatePassword, user.password);
    if (!isMatch) {
      throw new Error("Invalid email or password");
    }

    const payload: ITokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const tokens = this.generateTokens(payload);

    // Save refresh token & update last login
    user.refreshToken = tokens.refreshToken;
    user.lastLogin = new Date();
    await user.save();

    return { user, tokens };
  }

  /**
   * Refresh auth tokens using a valid refresh token
   */
  static async refresh(refreshToken: string): Promise<IAuthTokens> {
    if (!refreshToken) {
      throw new Error("Refresh token is required");
    }

    const payload = this.verifyRefreshToken(refreshToken);
    const user = await User.findById(payload.userId).select("+refreshToken");

    if (!user || user.refreshToken !== refreshToken) {
      throw new Error("Invalid or revoked refresh token");
    }

    const newTokens = this.generateTokens({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    user.refreshToken = newTokens.refreshToken;
    await user.save();

    return newTokens;
  }

  /**
   * Logout user and invalidate refresh token
   */
  static async logout(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
  }
}
