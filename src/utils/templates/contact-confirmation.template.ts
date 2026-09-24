import { renderBaseEmail } from "./base.template";

export interface ContactConfirmationData {
  senderName: string;
  senderEmail: string;
  subject?: string;
  myFullName?: string;
  myHeadline?: string;
  portfolioUrl?: string;
}

export function generateContactConfirmationEmail(data: ContactConfirmationData): string {
  const {
    senderName,
    subject,
    myFullName = "John Doe",
    portfolioUrl = "http://localhost:3000",
  } = data;

  const content = `
    <h2 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #0f172a;">
      Thanks for reaching out!
    </h2>

    <p style="margin: 0 0 14px 0;">Hi ${senderName},</p>
    
    <p style="margin: 0 0 14px 0;">
      I received your message regarding <strong>"${subject || "your inquiry"}"</strong>.
    </p>

    <p style="margin: 0 0 20px 0;">
      I will review your message and get back to you within <strong>24 hours</strong>.
    </p>

    <p style="margin: 0 0 24px 0; color: #64748b; font-size: 14px;">
      If you need immediate access to my work or code samples, feel free to visit <a href="${portfolioUrl}">${portfolioUrl}</a>.
    </p>

    <p style="margin: 0; color: #334155; font-size: 14px;">
      Best regards,<br />
      <strong>${myFullName}</strong>
    </p>
  `;

  return renderBaseEmail({
    title: "Thank you for reaching out",
    preheader: `Hi ${senderName}, I received your message and will reply shortly.`,
    content,
    portfolioUrl,
  });
}
