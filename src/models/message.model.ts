import { Schema, model } from "mongoose";
import { IMessage } from "../interfaces";

const messageSchema = new Schema<IMessage>(
  {
    senderName: {
      type: String,
      required: [true, "Sender name is required"],
      trim: true,
    },
    senderEmail: {
      type: String,
      required: [true, "Sender email is required"],
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, "Please enter a valid email address"],
    },
    subject: {
      type: String,
      trim: true,
      default: "New Portfolio Contact Inquiry",
    },
    message: {
      type: String,
      required: [true, "Message body is required"],
      trim: true,
    },
    company: {
      type: String,
      trim: true,
    },
    budgetRange: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["unread", "read", "replied", "archived"],
      default: "unread",
      index: true,
    },
    isReplied: {
      type: Boolean,
      default: false,
    },
    repliedAt: {
      type: Date,
    },
    replyNotes: {
      type: String,
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
    toJSON: {
      transform(_doc, ret: Record<string, any>) {
        delete ret.__v;
        return ret;
      },
    },
  },
);

export const Message = model<IMessage>("Message", messageSchema);
