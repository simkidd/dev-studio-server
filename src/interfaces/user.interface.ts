import { Document, Types } from "mongoose";

export type UserRole = "admin" | "superadmin";

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  headline?: string;
  role: UserRole;
  refreshToken?: string;
  lastLogin?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}
