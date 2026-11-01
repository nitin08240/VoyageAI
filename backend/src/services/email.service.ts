import nodemailer from 'nodemailer';
import { env } from '../config/env';

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initTransporter();
  }

  private initTransporter(): void {
    if (env.EMAIL_HOST && env.EMAIL_USER && env.EMAIL_PASS) {
      this.transporter = nodemailer.createTransport({
        host: env.EMAIL_HOST,
        port: env.EMAIL_PORT ? parseInt(env.EMAIL_PORT, 10) : 587,
        secure: env.EMAIL_PORT === '465',
        auth: {
          user: env.EMAIL_USER,
          pass: env.EMAIL_PASS,
        },
      });
    }
  }

  public isConfigured(): boolean {
    return this.transporter !== null;
  }

  public async sendPasswordResetEmail(
    to: string,
    userName: string,
    resetToken: string
  ): Promise<boolean> {
    const resetUrl = `${env.CLIENT_URL}/reset-password?token=${resetToken}`;

    if (!this.transporter) {
      if (env.NODE_ENV !== 'production') {
        console.log(`[EmailService] SMTP not configured. Development reset link for ${to}: ${resetUrl}`);
      } else {
        console.warn(`[EmailService] SMTP not configured. Unable to send password reset email to ${to}.`);
      }
      return false;
    }

    try {
      const mailOptions = {
        from: `"VoyageAI Support" <${env.EMAIL_USER}>`,
        to,
        subject: 'Password Reset Request – VoyageAI',
        text: `Hi ${userName || 'traveler'},\n\nYou requested a password reset for your VoyageAI account. Click the link below to set a new password:\n\n${resetUrl}\n\nThis link is valid for 1 hour. If you did not request this, you can safely ignore this email.\n\nBest regards,\nThe VoyageAI Team`,
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #0b1120; color: #f8fafc; border-radius: 12px; border: 1px solid #1e293b;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #38bdf8; font-size: 26px; margin: 0;">VoyageAI</h1>
              <p style="color: #94a3b8; font-size: 14px; margin-top: 4px;">Smart AI-Powered Travel Planner</p>
            </div>
            <div style="background-color: #111e38; padding: 24px; border-radius: 8px; border: 1px solid #1e3a8a;">
              <h2 style="color: #ffffff; font-size: 18px; margin-top: 0;">Password Reset Request</h2>
              <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
                Hi <strong>${userName || 'traveler'}</strong>,
              </p>
              <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
                We received a request to reset your password for your VoyageAI account. Click the button below to reset it:
              </p>
              <div style="text-align: center; margin: 28px 0;">
                <a href="${resetUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; display: inline-block;">Reset Password</a>
              </div>
              <p style="color: #94a3b8; font-size: 12px; line-height: 1.5;">
                This password reset link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
              </p>
              <hr style="border: 0; border-top: 1px solid #1e293b; margin: 20px 0;" />
              <p style="color: #64748b; font-size: 11px; word-break: break-all;">
                If the button above does not work, copy and paste this URL into your browser:<br/>
                <a href="${resetUrl}" style="color: #38bdf8; text-decoration: underline;">${resetUrl}</a>
              </p>
            </div>
            <div style="text-align: center; margin-top: 24px; color: #64748b; font-size: 12px;">
              &copy; ${new Date().getFullYear()} VoyageAI. All rights reserved.
            </div>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('[EmailService] Failed to send password reset email:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();

