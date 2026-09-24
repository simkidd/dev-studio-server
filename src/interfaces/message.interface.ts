import { Document, Types } from "mongoose";

export type MessageStatus = "unread" | "read" | "replied" | "archived";

export interface IMessage {
  senderName: string;
  senderEmail: string;
  subject?: string;
  message: string;
  company?: string;
  budgetRange?: string;
  status: MessageStatus;
  isReplied: boolean;
  repliedAt?: Date;
  replyNotes?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMessageDocument extends IMessage, Document {
  _id: Types.ObjectId;
}
