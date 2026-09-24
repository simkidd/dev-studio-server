import { ENV } from "../config/env";
import { logger } from "./logger";

export interface EmailPayload {
  to: string;
  subject: string;
  htmlContent: string;
  fromName?: string;
  fromEmail?: string;
}

export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  const { to, subject, htmlContent, fromName, fromEmail } = payload;
  const apiKey = ENV.BREVO_API_KEY;

  if (!apiKey) {
    logger.warn(
      `No email provider API key configured in ENV — skipping email dispatch to: ${to} | subject: ${subject}`,
    );
    return false;
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: fromName || ENV.BREVO_FROM_NAME,
          email: fromEmail || ENV.BREVO_FROM_EMAIL,
        },
        to: [{ email: to }],
        subject,
        htmlContent,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      logger.error(`Email sending failed: ${response.statusText} - ${errBody}`);
      return false;
    }

    logger.info(`Email successfully dispatched to ${to}`);
    return true;
  } catch (error: any) {
    logger.error(`Error sending email to ${to}: ${error.message}`);
    return false;
  }
}
