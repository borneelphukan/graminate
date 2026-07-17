import { Controller, Post, Body, Res } from '@nestjs/common';
import { PasswordService } from './password.service';
import { Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { passwordForgotSchema, passwordResetSchema } from '@graminate/shared';
import { UseZodSchema } from '@/common/decorators/use-zod-schema.decorator';

@Controller('password')
export class PasswordController {
  constructor(private readonly passwordService: PasswordService) {}

  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @UseZodSchema(passwordForgotSchema)
  @Post('forgot')
  async forgotPassword(
    @Body() body: { email: string },
    @Res() res: Response,
  ): Promise<Response> {
    const result = await this.passwordService.handleForgot(body.email);
    return res.status(result.status).json(result.data);
  }

  @UseZodSchema(passwordResetSchema)
  @Post('reset')
  async resetPassword(
    @Body() body: { email: string; token: string; newPassword: string },
    @Res() res: Response,
  ): Promise<Response> {
    const result = await this.passwordService.handleReset(body);
    return res.status(result.status).json(result.data);
  }
}
