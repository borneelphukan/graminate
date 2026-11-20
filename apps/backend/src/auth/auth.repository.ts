import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { UserService } from '../user/user.service';
import { PrismaService } from '@/prisma/prisma.service';
import { OtpService } from '@/otp/otp.service';

@Injectable()
export class AuthRepository {
  constructor(
    private users: UserService,
    private jwtService: JwtService,
    private prisma: PrismaService,
    private otpService: OtpService,
  ) {}

  async validateUser(email: string, pass: string) {
    const userRecord = await this.users.findByEmail(email);
    if (!userRecord) throw new UnauthorizedException();
    const valid = await argon2.verify(userRecord.password, pass);
    if (!valid) throw new UnauthorizedException();
    return userRecord;
  }

  async login(email: string, pass: string) {
    // Phase 1: Validate credentials and send OTP
    const user = await this.validateUser(email, pass);

    // Create login history record
    const loginRecord = await this.prisma.login_history.create({
      data: {
        user_id: user.user_id,
      },
      select: {
        login_id: true,
      },
    });
    const loginId = loginRecord.login_id;

    // Send OTP to user's email
    const otpResult = await this.otpService.sendOtp(email);
    if (otpResult.status !== 200) {
      throw new Error(`Failed to send OTP: ${otpResult.data.error || 'Unknown error'}`);
    }

    // Return success with login_id (NO JWT yet)
    return {
      success: true,
      login_id: loginId,
      message: 'OTP sent successfully. Please verify to complete login.',
      user: {
        user_id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
      },
    };
  }

  async loginVerify(email: string, otp: string, loginId: string) {
    // Phase 2: Verify OTP and issue JWT
    const otpResult = await this.otpService.verifyOtp(email, otp);
    
    if (!otpResult.data.success) {
      throw new UnauthorizedException('Invalid OTP');
    }

    // OTP verified, now find the user and issue JWT
    const user = await this.users.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Update login history with logout timestamp (session active)
    await this.prisma.login_history.update({
      where: { login_id: loginId },
      data: {
        logged_in_at: new Date(),
      },
    });

    const payload = { userId: user.user_id };

    return {
      access_token: this.jwtService.sign(payload),
      login_id: loginId,
      user: {
        user_id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone_number: user.phone_number,
        business_name: user.business_name,
      },
    };
  }
}
