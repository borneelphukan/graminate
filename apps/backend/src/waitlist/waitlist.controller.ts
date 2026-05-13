import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { WaitlistService } from './waitlist.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestWithUser } from '@/common/types/request.type';

@Controller('waitlist')
export class WaitlistController {
  constructor(private readonly waitlistService: WaitlistService) {}

  @Post()
  async addToWaitlist(
    @Body()
    body: {
      first_name: string;
      last_name: string;
      email: string;
      phone: string;
      role: string;
    },
  ) {
    return this.waitlistService.addToWaitlist(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getWaitlist(@Request() req: RequestWithUser) {
    if (!req.user?.isAdmin) {
      throw new UnauthorizedException('Admins only');
    }
    return this.waitlistService.getWaitlist();
  }
}
