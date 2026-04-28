import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  UnauthorizedException,
  Param,
  Delete,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './admin.dto';
import { RequestWithUser } from '@/common/types/request.type';
import type { users } from '@prisma/client';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req: RequestWithUser) {
    if (!req.user?.isAdmin || !req.user.adminId)
      throw new UnauthorizedException('Admins only');
    return this.adminService.getAdminProfile(req.user.adminId);
  }

  @Post('register')
  async register(@Body() dto: CreateAdminDto) {
    return this.adminService.register(
      dto.first_name,
      dto.last_name,
      dto.email,
      dto.password,
    );
  }

  @Post('login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return this.adminService.login(email, password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('all-users')
  async allUsers(@Request() req: RequestWithUser) {
    if (!req.user?.isAdmin) throw new UnauthorizedException('Admins only');
    return this.adminService.getAllUsers();
  }

  @UseGuards(JwtAuthGuard)
  @Get('user-count')
  async userCount(@Request() req: RequestWithUser) {
    if (!req.user?.isAdmin) throw new UnauthorizedException('Admins only');
    return this.adminService.getUserCount();
  }

  @UseGuards(JwtAuthGuard)
  @Get('users/:id')
  async getUserById(
    @Param('id') userId: string,
    @Request() req: RequestWithUser,
  ) {
    if (!req.user?.isAdmin) throw new UnauthorizedException('Admins only');
    return this.adminService.getUserById(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('users/:id/login-history')
  async getUserLoginHistory(
    @Param('id') userId: string,
    @Request() req: RequestWithUser,
  ) {
    if (!req.user?.isAdmin) throw new UnauthorizedException('Admins only');
    return this.adminService.getUserLoginHistory(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('users/:id')
  async deleteUser(
    @Param('id') userId: string,
    @Request() req: RequestWithUser,
  ) {
    if (!req.user?.isAdmin) throw new UnauthorizedException('Admins only');
    return this.adminService.deleteUser(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('users/:id')
  async updateUser(
    @Param('id') userId: string,
    @Body()
    body: Partial<users> & {
      darkMode?: boolean;
      widgets?: string[];
      admin_reason?: string;
      admin_action?: string;
    },
    @Request() req: RequestWithUser,
  ): Promise<{
    status: number;
    data: { message?: string; error?: string; user?: Partial<users> };
  }> {
    if (!req.user?.isAdmin) throw new UnauthorizedException('Admins only');
    return this.adminService.updateUser(userId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('users/:id/billing-history')
  async getUserBillingHistory(
    @Param('id') userId: string,
    @Request() req: RequestWithUser,
  ) {
    if (!req.user?.isAdmin) throw new UnauthorizedException('Admins only');
    return this.adminService.getUserBillingHistory(userId);
  }
}
