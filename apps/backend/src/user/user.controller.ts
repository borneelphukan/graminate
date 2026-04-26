import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Delete,
  UnauthorizedException,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserService } from './user.service';
import { AuthService } from '../auth/auth.service';
import { RequestWithUser } from '@/common/types/request.type';
import { users } from '@prisma/client';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  async register(@Body() body: Partial<users>): Promise<any> {
    return this.userService.registerUser(body);
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }): Promise<any> {
    return this.authService.login(body.email, body.password);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(
    @Body('loginId') loginId: string,
  ): Promise<{ status: number; data: { message?: string; error?: string } }> {
    return this.userService.logout(loginId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/available-sub-types')
  async getAvailableSubTypes(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<{
    status: number;
    data: { subTypes?: string[]; error?: string };
  }> {
    if (String(req.user.userId) !== id) throw new UnauthorizedException();
    return this.userService.getAvailableSubTypes(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getUser(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: RequestWithUser,
  ): Promise<any> {
    if (req.user.userId !== id) throw new UnauthorizedException();
    try {
      return await this.userService.getUserById(String(id));
    } catch (err) {
      console.error('Error in UserController.getUser:', err);
      throw err;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body()
    body: Partial<users> & {
      darkMode?: boolean;
      widgets?: string[];
      admin_reason?: string;
      admin_action?: string;
    },
    @Request() req: RequestWithUser,
  ): Promise<any> {
    if (String(req.user.userId) !== id) throw new UnauthorizedException();
    try {
      return await this.userService.updateUser(id, body);
    } catch (err) {
      console.error('Error in UserController.updateUser:', err);
      throw err;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete/:id')
  async deleteUser(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<{ status: number; data: { message?: string; error?: string } }> {
    if (String(req.user.userId) !== id) throw new UnauthorizedException();
    return this.userService.deleteUser(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify-password/:id')
  async verifyPassword(
    @Param('id') userId: string,
    @Body('password') password: string,
    @Request() req: RequestWithUser,
  ): Promise<any> {
    if (String(req.user.userId) !== userId) throw new UnauthorizedException();
    const result = await this.userService.verifyPassword(userId, password);
    return result.data;
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/schedule-downgrade')
  async scheduleDowngrade(
    @Param('id') userId: string,
    @Body('plan') plan: string,
    @Request() req: RequestWithUser,
  ): Promise<any> {
    if (String(req.user.userId) !== userId) throw new UnauthorizedException();
    return this.userService.scheduleDowngrade(userId, plan);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/billing-history')
  async getBillingHistory(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<any> {
    if (String(req.user.userId) !== id) throw new UnauthorizedException();
    return this.userService.getBillingHistory(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/notifications')
  async getNotifications(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<any> {
    if (String(req.user.userId) !== id) throw new UnauthorizedException();
    return this.userService.getNotifications(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/notifications/read')
  async markNotificationsRead(
    @Param('id') id: string,
    @Body('notificationId') notificationId: number | undefined,
    @Request() req: RequestWithUser,
  ): Promise<any> {
    if (String(req.user.userId) !== id) throw new UnauthorizedException();
    return this.userService.markNotificationsRead(id, notificationId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/notifications/:notificationId')
  async deleteNotification(
    @Param('id') id: string,
    @Param('notificationId') notificationId: string,
    @Request() req: RequestWithUser,
  ): Promise<any> {
    if (String(req.user.userId) !== id) throw new UnauthorizedException();
    return this.userService.deleteNotification(id, Number(notificationId));
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/notifications')
  async clearAllNotifications(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<any> {
    if (String(req.user.userId) !== id) throw new UnauthorizedException();
    return this.userService.clearAllNotifications(id);
  }
}
