import { renderBaseEmail } from "./base.template";

export interface PasswordResetData {
  resetUrl: string;
  expiresInMinutes?: number;
  portfolioUrl?: string;
}

export function generatePasswordResetEmail(data: PasswordResetData): string {
  const { resetUrl, expiresInMinutes = 15, portfolioUrl } = data;

  const content = `
    <h2 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #0f172a;">
      Reset your CMS password
    </h2>

    <p style="margin: 0 0 14px 0;">
      A password reset was requested for your Developer Portfolio Admin account.
    </p>

    <p style="margin: 0 0 24px 0;">
      Click the button below to set a new password. This link will expire in <strong>${expiresInMinutes} minutes</strong>:
    </p>

    <div style="margin: 0 0 24px 0;">
      <a href="${resetUrl}" style="display: inline-block; background-color: #0f172a; color: #ffffff; padding: 10px 20px; border-radius: 6px; font-weight: 600; font-size: 14px; text-decoration: none;">
        Reset Password
      </a>
    </div>

    <p style="margin: 0; font-size: 13px; color: #94a3b8;">
      If you did not request this, you can safely ignore this email.
    </p>
  `;

  return renderBaseEmail({
    title: "Reset CMS Password",
    preheader: "Reset your developer portfolio admin password.",
    content,
    footerNote: "Portfolio CMS Security",
    portfolioUrl,
  });
}
