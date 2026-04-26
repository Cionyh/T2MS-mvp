import sgMail from "@sendgrid/mail";

const apiKey = process.env.SENDGRID_API_KEY?.trim();
const fromEmail = process.env.SENDGRID_FROM_EMAIL?.trim() ?? "noreply@t2ms.biz";

if (apiKey) {
  sgMail.setApiKey(apiKey);
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send an email via SendGrid.
 * No-ops if SENDGRID_API_KEY is not set (e.g. in development).
 */
export async function sendEmail(options: SendEmailOptions): Promise<void> {
  if (!apiKey) {
    console.warn(
      "[SendGrid] SENDGRID_API_KEY not set; skipping email",
      { to: options.to, subject: options.subject }
    );
    return;
  }

  console.log("[SendGrid] Sending email", {
    to: options.to,
    subject: options.subject,
  });

  try {
    const [response] = await sgMail.send({
      to: options.to,
      from: { email: fromEmail, name: process.env.SENDGRID_FROM_NAME ?? "T2MS" },
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    console.log("[SendGrid] Email sent successfully", {
      to: options.to,
      subject: options.subject,
      statusCode: response?.statusCode,
      messageId: response?.headers?.["x-message-id"],
    });
  } catch (err: unknown) {
    const error = err as { response?: { body?: unknown; statusCode?: number } };
    console.error("[SendGrid] Email send failed", {
      to: options.to,
      subject: options.subject,
      statusCode: error.response?.statusCode,
      body: error.response?.body,
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}
