import { Injectable } from '@nestjs/common';
import { OtpRepository } from './otp.repository';

@Injectable()
export class OtpService {
  constructor(private readonly otpRepository: OtpRepository) {}

  async sendOtp(email: string) {
    return this.otpRepository.sendOtp(email);
  }

  async verifyOtp(email: string, otp: string) {
    return this.otpRepository.verifyOtp(email, otp);
  }
}
