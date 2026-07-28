import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import {
  otpStore,
  isOtpLocked,
  recordOtpAttempt,
  resetOtpAttempts,
  OTP_LOCKOUT_DURATION_MS,
} from '@/stores/store';
import { Resend } from 'resend';
const mjml2html = require('mjml');

@Injectable()
export class OtpRepository {
  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private generateOtpEmailHTML(otp: string): string {
    try {
      const templatePath = path.resolve('src/templates/verifyEmail.mjml');

      if (!fs.existsSync(templatePath)) {
        console.error('Template file not found:', templatePath);
        return `<p>Your OTP is: <strong>${otp}</strong></p>`;
      }

      const mjmlTemplate = fs.readFileSync(templatePath, 'utf8');

      const otpFormatted = otp
        .split('')
        .map((digit) => `<span class="otp-digit">${digit}</span>`)
        .join('');

      const personalizedTemplate = mjmlTemplate.replace(
        '{{otpDigits}}',
        otpFormatted,
      );

      const htmlOutput = mjml2html(personalizedTemplate);

      return htmlOutput.html;
    } catch (error) {
      console.error('Error generating OTP email template:', error);
      return `<p>Your OTP is: <strong>${otp}</strong></p>`;
    }
  }

  private getResend(): Resend {
    return new Resend(process.env.RESEND_API_KEY || 'graminate');
  }

  async sendOtp(email: string): Promise<{
    status: number;
    data: { message?: string; error?: string };
  }> {
    if (!email || typeof email !== 'string') {
      return {
        status: 400,
        data: { error: 'Valid email is required' },
      };
    }

    if (isOtpLocked(email)) {
      const remainingMs = OTP_LOCKOUT_DURATION_MS;
      const remainingMin = Math.ceil(remainingMs / 60000);
      return {
        status: 429,
        data: {
          error: `Account locked due to too many failed attempts. Try again in ${remainingMin} minutes.`,
        },
      };
    }

    try {
      const otp = this.generateOtp();
      otpStore[email] = otp;

      const emailHTML = this.generateOtpEmailHTML(otp);

      const { error } = await this.getResend().emails.send({
        from: 'Graminate <no-reply@graminate.com>',
        to: email,
        subject: 'Verify your Email',
        html: emailHTML,
        text: `OTP for Email Verification: ${otp}`,
      });

      if (error) {
        console.error('Resend API error:', error);
        return {
          status: 500,
          data: { error: error.message || 'Failed to send OTP email' },
        };
      }

      return {
        status: 200,
        data: { message: 'OTP sent successfully.' },
      };
    } catch (err) {
      console.error('Error sending OTP:', err);
      return {
        status: 500,
        data: { error: err.message || 'Something went wrong' },
      };
    }
  }

  async verifyOtp(
    email: string,
    otp: string,
  ): Promise<{
    status: number;
    data: { success: boolean; message: string };
  }> {
    if (!email || !otp) {
      return {
        status: 400,
        data: { success: false, message: 'Email and OTP are required' },
      };
    }

    if (isOtpLocked(email)) {
      const remainingMs = OTP_LOCKOUT_DURATION_MS;
      const remainingMin = Math.ceil(remainingMs / 60000);
      return {
        status: 429,
        data: {
          success: false,
          message: `Account locked due to too many failed attempts. Try again in ${remainingMin} minutes.`,
        },
      };
    }

    await Promise.resolve();

    if (otpStore[email] && otpStore[email] === otp) {
      delete otpStore[email];
      resetOtpAttempts(email);
      return {
        status: 200,
        data: { success: true, message: 'OTP verified successfully' },
      };
    } else {
      recordOtpAttempt(email);
      return {
        status: 400,
        data: { success: false, message: 'Invalid OTP' },
      };
    }
  }
}
