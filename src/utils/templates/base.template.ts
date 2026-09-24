export interface BaseEmailOptions {
  title: string;
  preheader?: string;
  content: string;
  footerNote?: string;
  portfolioUrl?: string;
}

/**
 * Clean, minimalist email base template.
 * Inspired by Linear & Resend transactional design (high deliverability & clean typography).
 */
export function renderBaseEmail(options: BaseEmailOptions): string {
  const {
    title,
    preheader = "",
    content,
    footerNote = "Sent from your Developer Portfolio",
    portfolioUrl = "http://localhost:3000",
  } = options;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      -webkit-font-smoothing: antialiased;
    }
    table {
      border-spacing: 0;
      border-collapse: collapse;
    }
    a {
      color: #2563eb;
      text-decoration: none;
    }
    @media only screen and (max-width: 600px) {
      .container {
        width: 100% !important;
        border-radius: 0 !important;
        border: none !important;
      }
      .content {
        padding: 24px 20px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc;">
  ${
    preheader
      ? `<div style="display: none; max-height: 0px; overflow: hidden; font-size: 1px; line-height: 1px; color: #f8fafc;">
          ${preheader}
        </div>`
      : ""
  }

  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" class="container" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0;">
          
          <!-- Content Area -->
          <tr>
            <td class="content" style="padding: 36px 32px; font-size: 15px; line-height: 1.6; color: #334155;">
              ${content}
            </td>
          </tr>

          <!-- Minimal Footer -->
          <tr>
            <td style="padding: 16px 32px 24px 32px; border-top: 1px solid #f1f5f9; text-align: left; font-size: 12px; color: #94a3b8;">
              <p style="margin: 0;">
                <a href="${portfolioUrl}" style="color: #64748b; font-weight: 500;">Portfolio</a> &bull; ${footerNote}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}
