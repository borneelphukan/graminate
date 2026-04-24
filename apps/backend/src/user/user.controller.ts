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

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) { }

  @Post('register')
  async register(@Body() body: any) {
    return this.userService.registerUser(body);
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Body('loginId') loginId: string) {
    return this.userService.logout(loginId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/available-sub-types')
  async getAvailableSubTypes(@Param('id') id: string, @Request() req) {
    if (String(req.user.userId) !== id) throw new UnauthorizedException();
    return this.userService.getAvailableSubTypes(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getUser(@Param('id', ParseIntPipe) id: number, @Request() req) {
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
  async updateUser(@Param('id') id: string, @Body() body: any, @Request() req) {
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
  async deleteUser(@Param('id') id: string, @Request() req) {
    if (String(req.user.userId) !== id) throw new UnauthorizedException();
    return this.userService.deleteUser(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify-password/:id')
  async verifyPassword(
    @Param('id') userId: string,
    @Body('password') password: string,
    @Request() req,
  ) {
    if (String(req.user.userId) !== userId) throw new UnauthorizedException();
    const result = await this.userService.verifyPassword(userId, password);
    return result.data;
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/schedule-downgrade')
  async scheduleDowngrade(@Param('id') userId: string, @Body('plan') plan: string, @Request() req) {
    if (String(req.user.userId) !== userId) throw new UnauthorizedException();
    return this.userService.scheduleDowngrade(userId, plan);
  }
}
