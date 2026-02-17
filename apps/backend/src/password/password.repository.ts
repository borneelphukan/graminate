import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import * as nodemailer from 'nodemailer';

const mjml2html = require('mjml');

@Injectable()
export class PasswordRepository {
  constructor(private readonly prisma: PrismaService) {}
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  private generateEmailHTML(resetLink: string, firstName: string): string {
    const templatePath = path.resolve('src/templates/resetPasswordEmail.mjml');
    const mjmlTemplate = fs.readFileSync(templatePath, 'utf8');

    const personalized = mjmlTemplate
      .replace('{{firstName}}', firstName)
      .replace('{{resetLink}}', resetLink);

    const htmlOutput = mjml2html(personalized);
    return htmlOutput.html;
  }

  async handleForgot(email: string) {
    if (!email) {
      return { status: 400, data: { error: 'Email is required' } };
    }

    try {
      const user = await this.prisma.users.findFirst({
        where: { email },
        select: { first_name: true },
      });

      if (!user) {
        return { status: 404, data: { error: 'User not found' } };
      }

      const firstName = user.first_name;
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = await argon2.hash(resetToken);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await this.prisma.password_resets.upsert({
        where: { email },
        update: { token: hashedToken, expires_at: expiresAt },
        create: { email, token: hashedToken, expires_at: expiresAt },
      });

      const resetLink = `http://localhost:3000/reset_password?token=${resetToken}&email=${email}`;
      const emailHTML = this.generateEmailHTML(resetLink, firstName);

      await this.transporter.sendMail({
        to: email,
        subject: 'Reset Your Graminate Password',
        html: emailHTML,
      });

      return {
        status: 200,
        data: { message: 'Password reset link sent to email.' },
      };
    } catch (error) {
      console.error('Error in forgot password:', error);
      return {
        status: 500,
        data: { error: 'Something went wrong' },
      };
    }
  }

  async handleReset(body: any) {
    const { email, token, newPassword } = body;

    if (!email || !token || !newPassword) {
      return { status: 400, data: { error: 'Invalid request' } };
    }

    try {
      const resetRecord = await this.prisma.password_resets.findUnique({
        where: { email },
      });

      if (!resetRecord) {
        return { status: 400, data: { error: 'Invalid token' } };
      }

      const { token: storedToken, expires_at } = resetRecord;
      if (new Date() > new Date(expires_at)) {
        return { status: 400, data: { error: 'Token expired' } };
      }

      const isMatch = await argon2.verify(storedToken, token);
      if (!isMatch) {
        return { status: 400, data: { error: 'Invalid token' } };
      }

      const user = await this.prisma.users.findUnique({
        where: { email },
        select: { password: true },
      });

      if (!user) {
        return { status: 404, data: { error: 'User not found' } };
      }

      const currentPassword = user.password;
      if (await argon2.verify(currentPassword, newPassword)) {
        return {
          status: 400,
          data: { error: 'Please enter a different password' },
        };
      }

      const hashedNewPassword = await argon2.hash(newPassword);
      await this.prisma.users.update({
        where: { email },
        data: { password: hashedNewPassword },
      });

      await this.prisma.password_resets.delete({ where: { email } });

      return { status: 200, data: { message: 'Password successfully reset' } };
    } catch (error) {
      console.error('Error in reset password:', error);
      return {
        status: 500,
        data: { error: 'Something went wrong' },
      };
    }
  }
}
