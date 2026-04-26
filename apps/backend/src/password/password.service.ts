import { Injectable } from '@nestjs/common';
import { PasswordRepository } from './password.repository';

@Injectable()
export class PasswordService {
  constructor(private readonly passwordRepository: PasswordRepository) {}

  async handleForgot(email: string): Promise<{
    status: number;
    data: { message?: string; error?: string };
  }> {
    return this.passwordRepository.handleForgot(email);
  }

  async handleReset(body: {
    email?: string;
    token?: string;
    newPassword?: string;
  }): Promise<{
    status: number;
    data: { message?: string; error?: string };
  }> {
    return this.passwordRepository.handleReset(body);
  }
}
