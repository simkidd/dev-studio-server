import { Request, Response } from "express";
import { Message } from "../models";
import { ENV } from "../config/env";
import {
  asyncHandler,
  sendSuccess,
  sendError,
  sendEmail,
  paginate,
  generateContactNotificationEmail,
  generateContactConfirmationEmail,
} from "../utils";

export const submitContactMessage = asyncHandler(async (req: Request, res: Response) => {
  const { senderName, senderEmail, subject, message, company, budgetRange } = req.body;

  const rawIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const ipAddress = Array.isArray(rawIp) ? rawIp[0] : (rawIp || "");
  const rawUserAgent = req.headers["user-agent"];
  const userAgent = Array.isArray(rawUserAgent) ? rawUserAgent[0] : (rawUserAgent || "");

  const newMessage = await Message.create({
    senderName,
    senderEmail,
    subject: subject || `New Inquiry from ${senderName}`,
    message,
    company: company || undefined,
    budgetRange: budgetRange || undefined,
    ipAddress: ipAddress || undefined,
    userAgent: userAgent || undefined,
  });

  // 1. Send Admin Notification Email via Brevo
  if (ENV.BREVO_FROM_EMAIL) {
    sendEmail({
      to: ENV.BREVO_FROM_EMAIL,
      subject: `🚨 Portfolio Lead: ${senderName} (${company || "Individual"})`,
      htmlContent: generateContactNotificationEmail({
        senderName,
        senderEmail,
        subject,
        message,
        company,
        budgetRange,
      }),
    }).catch(() => {});
  }

  // 2. Send Confirmation Auto-responder to Sender
  if (senderEmail) {
    sendEmail({
      to: senderEmail,
      subject: `Thanks for reaching out! - Re: ${subject || "Your Inquiry"}`,
      htmlContent: generateContactConfirmationEmail({
        senderName,
        senderEmail,
        subject,
        portfolioUrl: ENV.CORS_ORIGIN,
      }),
    }).catch(() => {});
  }

  sendSuccess(
    res,
    { id: newMessage._id },
    "Thank you! Your message has been received. I will get back to you shortly.",
    201,
  );
});

export const getAllMessages = asyncHandler(async (req: Request, res: Response) => {
  const { status, page = 1, limit = 20 } = req.query;

  const filter: Record<string, any> = {};
  if (status && status !== "all") {
    filter.status = status;
  }

  const result = await paginate(Message, filter, {
    page: page as string,
    limit: limit as string,
    sort: { createdAt: -1 },
  });

  sendSuccess(
    res,
    result.docs,
    "Messages retrieved successfully",
    200,
    {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.pages,
    },
  );
});

export const getMessageById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const message = await Message.findById(id);
  if (!message) {
    sendError(res, "Message not found", 404);
    return;
  }

  if (message.status === "unread") {
    message.status = "read";
    await message.save();
  }

  sendSuccess(res, message, "Message details retrieved", 200);
});

export const updateMessageStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, replyNotes, isReplied } = req.body;

  const updateData: Record<string, any> = { status };
  if (replyNotes !== undefined) updateData.replyNotes = replyNotes;
  if (isReplied !== undefined) {
    updateData.isReplied = isReplied;
    if (isReplied) updateData.repliedAt = new Date();
  }

  const message = await Message.findByIdAndUpdate(id, updateData, { new: true });
  if (!message) {
    sendError(res, "Message not found", 404);
    return;
  }

  sendSuccess(res, message, "Message status updated successfully", 200);
});

export const deleteMessage = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const message = await Message.findByIdAndDelete(id);

  if (!message) {
    sendError(res, "Message not found", 404);
    return;
  }

  sendSuccess(res, null, "Message deleted successfully", 200);
});
