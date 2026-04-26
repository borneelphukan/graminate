import { Controller, Post, Body, Res } from '@nestjs/common';
import { OtpService } from './otp.service';
import { Response } from 'express';

@Controller('otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post('send-otp')
  async sendOtp(
    @Body() body: { email: string },
    @Res() res: Response,
  ): Promise<Response> {
    const result = await this.otpService.sendOtp(body.email);
    return res.status(result.status).json(result.data);
  }

  @Post('verify-otp')
  async verifyOtp(
    @Body() body: { email: string; otp: string },
    @Res() res: Response,
  ): Promise<Response> {
    const result = await this.otpService.verifyOtp(body.email, body.otp);
    return res.status(result.status).json(result.data);
  }
}
