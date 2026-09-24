import { renderBaseEmail } from "./base.template";

export interface ContactNotificationData {
  senderName: string;
  senderEmail: string;
  subject?: string;
  message: string;
  company?: string;
  budgetRange?: string;
  portfolioUrl?: string;
}

export function generateContactNotificationEmail(data: ContactNotificationData): string {
  const { senderName, senderEmail, subject, message, company, budgetRange, portfolioUrl } = data;

  const content = `
    <h2 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #0f172a;">
      New Contact Form Submission
    </h2>
    
    <p style="margin: 0 0 20px 0; font-size: 14px; color: #64748b;">
      You received a new inquiry from your portfolio website.
    </p>

    <div style="background-color: #f8fafc; border-radius: 6px; padding: 14px 16px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
      <p style="margin: 0 0 6px 0; font-size: 14px;"><strong>From:</strong> ${senderName} &lt;<a href="mailto:${senderEmail}">${senderEmail}</a>&gt;</p>
      ${company ? `<p style="margin: 0 0 6px 0; font-size: 14px;"><strong>Company:</strong> ${company}</p>` : ""}
      ${budgetRange ? `<p style="margin: 0 0 6px 0; font-size: 14px;"><strong>Budget:</strong> ${budgetRange}</p>` : ""}
      <p style="margin: 0; font-size: 14px;"><strong>Subject:</strong> ${subject || "General Inquiry"}</p>
    </div>

    <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: 0.05em;">
      Message:
    </p>
    <div style="background-color: #ffffff; border-left: 3px solid #0f172a; padding: 12px 16px; margin: 0 0 24px 0; font-size: 14px; color: #334155; line-height: 1.6; white-space: pre-line;">
      ${message}
    </div>

    <div style="margin-top: 24px;">
      <a href="mailto:${senderEmail}?subject=Re: ${encodeURIComponent(subject || "Your Inquiry")}" style="display: inline-block; background-color: #0f172a; color: #ffffff; padding: 10px 18px; border-radius: 6px; font-weight: 600; font-size: 13px; text-decoration: none;">
        Reply to ${senderName} &rarr;
      </a>
    </div>
  `;

  return renderBaseEmail({
    title: `Inquiry from ${senderName}`,
    preheader: `New message from ${senderName}: ${message.substring(0, 60)}...`,
    content,
    portfolioUrl,
  });
}
