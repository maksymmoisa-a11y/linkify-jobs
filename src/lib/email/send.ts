let nodemailer: typeof import("nodemailer") | null = null;

try {
  // nodemailer is an optional dependency — gracefully degrade if not installed
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  nodemailer = require("nodemailer");
} catch {
  // nodemailer not installed — email sending will be a no-op
}

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

function createTransporter() {
  if (!nodemailer) return null;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "localhost",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        }
      : undefined,
  });
}

export async function sendEmail(params: SendEmailParams): Promise<void> {
  const transporter = createTransporter();

  if (!transporter) {
    console.warn(
      "[email] nodemailer not installed — skipping email send to:",
      params.to
    );
    return;
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@linkify-jobs.com";

  await transporter.sendMail({
    from,
    to: params.to,
    subject: params.subject,
    html: params.html,
  });
}
