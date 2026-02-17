import { Injectable } from '@nestjs/common';
import { PasswordRepository } from './password.repository';

@Injectable()
export class PasswordService {
  constructor(private readonly passwordRepository: PasswordRepository) {}

  async handleForgot(email: string) {
    return this.passwordRepository.handleForgot(email);
  }

  async handleReset(body: any) {
    return this.passwordRepository.handleReset(body);
  }
}
