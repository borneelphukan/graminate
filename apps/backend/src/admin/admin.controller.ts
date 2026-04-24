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

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req) {
    if (!req.user?.isAdmin) throw new UnauthorizedException('Admins only');
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
  async allUsers(@Request() req) {
    if (!req.user?.isAdmin) throw new UnauthorizedException('Admins only');
    return this.adminService.getAllUsers();
  }

  @UseGuards(JwtAuthGuard)
  @Get('user-count')
  async userCount(@Request() req) {
    if (!req.user?.isAdmin) throw new UnauthorizedException('Admins only');
    return this.adminService.getUserCount();
  }

  @UseGuards(JwtAuthGuard)
  @Get('users/:id')
  async getUserById(@Param('id') userId: string, @Request() req) {
    if (!req.user?.isAdmin) throw new UnauthorizedException('Admins only');
    return this.adminService.getUserById(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('users/:id/login-history')
  async getUserLoginHistory(@Param('id') userId: string, @Request() req) {
    if (!req.user?.isAdmin) throw new UnauthorizedException('Admins only');
    return this.adminService.getUserLoginHistory(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('users/:id')
  async deleteUser(@Param('id') userId: string, @Request() req) {
    if (!req.user?.isAdmin) throw new UnauthorizedException('Admins only');
    return this.adminService.deleteUser(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('users/:id')
  async updateUser(@Param('id') userId: string, @Body() body: any, @Request() req) {
    if (!req.user?.isAdmin) throw new UnauthorizedException('Admins only');
    return this.adminService.updateUser(userId, body);
  }
}
