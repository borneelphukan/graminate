import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { EmailVerificationService } from './email-verification.service';

@Controller('auth')
export class EmailVerificationController {
  constructor(
    private readonly emailVerificationService: EmailVerificationService,
  ) {}

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    return this.emailVerificationService.verifyEmail(token);
  }

  @Post('resend-verification')
  async resendVerification(@Body() body: { email: string }) {
    return this.emailVerificationService.resendVerification(body.email);
  }
}
