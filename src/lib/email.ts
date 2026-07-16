import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<void> {
  if (!process.env.SMTP_USER) {
    console.log(`[EMAIL MOCK] To: ${to}\nSubject: ${subject}\n`);
    return;
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'ModernStore <noreply@modernstore.com>',
    to,
    subject,
    html,
  });
}

export function generateResetEmail(resetUrl: string): { subject: string; html: string } {
  return {
    subject: 'Reset Your Password - ModernStore',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2563eb;">Reset Your Password</h1>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <a href="${resetUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">Reset Password</a>
        <p style="color: #666; font-size: 14px;">This link will expire in 24 hours. If you didn't request this, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px;">ModernStore - Your Premium Shopping Destination</p>
      </div>
    `,
  };
}

export function generateVerificationEmail(verificationUrl: string): { subject: string; html: string } {
  return {
    subject: 'Verify Your Email - ModernStore',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2563eb;">Welcome to ModernStore!</h1>
        <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
        <a href="${verificationUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">Verify Email</a>
        <p style="color: #666; font-size: 14px;">If you didn't create an account, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px;">ModernStore - Your Premium Shopping Destination</p>
      </div>
    `,
  };
}
