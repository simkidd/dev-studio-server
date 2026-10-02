import { Schema, model, Document, Types } from "mongoose";

export interface IAuditLog extends Document {
  action: string;
  category: "auth" | "user_management" | "domain" | "template" | "announcement" | "system";
  performedBy: Types.ObjectId;
  targetUser?: Types.ObjectId;
  targetEntityId?: string;
  entityType?: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    action: {
      type: String,
      required: [true, "Action name is required"],
      trim: true,
    },
    category: {
      type: String,
      enum: ["auth", "user_management", "domain", "template", "announcement", "system"],
      default: "system",
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetUser: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    targetEntityId: {
      type: String,
    },
    entityType: {
      type: String,
    },
    details: {
      type: Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export const AuditLog = model<IAuditLog>("AuditLog", auditLogSchema);
