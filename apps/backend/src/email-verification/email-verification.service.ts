import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

export interface VerificationTokenRecord {
  userId: number;
  email: string;
  expiresAt: number;
}

const verificationTokens: Record<string, VerificationTokenRecord> = {};

const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

@Injectable()
export class EmailVerificationService {
  constructor(private prisma: PrismaService) {}

  generateToken(userId: number, email: string): string {
    const token = crypto.randomBytes(32).toString('hex');
    verificationTokens[token] = {
      userId,
      email,
      expiresAt: Date.now() + TOKEN_EXPIRY_MS,
    };
    return token;
  }

  async verifyEmail(
    token: string,
  ): Promise<{ status: number; data: { message: string } }> {
    const record = verificationTokens[token];

    if (!record) {
      throw new UnauthorizedException('Invalid or expired verification token');
    }

    if (Date.now() > record.expiresAt) {
      delete verificationTokens[token];
      throw new UnauthorizedException('Verification token has expired');
    }

    await this.prisma.users.update({
      where: { user_id: record.userId },
      data: { email_verified: true },
    });

    delete verificationTokens[token];

    return {
      status: 200,
      data: { message: 'Email verified successfully' },
    };
  }

  async resendVerification(
    email: string,
  ): Promise<{ status: number; data: { message: string; token?: string } }> {
    const user = await this.prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      return {
        status: 200,
        data: {
          message: 'If the email exists, a verification link has been sent',
        },
      };
    }

    if (user.email_verified) {
      return {
        status: 200,
        data: { message: 'Email is already verified' },
      };
    }

    // Invalidate old tokens for this user
    for (const [key, val] of Object.entries(verificationTokens)) {
      if (val.userId === user.user_id) {
        delete verificationTokens[key];
      }
    }

    const token = this.generateToken(user.user_id, email);

    return {
      status: 200,
      data: {
        message: 'Verification token generated',
        token,
      },
    };
  }
}
