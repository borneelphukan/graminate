import { Injectable } from '@nestjs/common';
import { AuthRepository } from './auth.repository';

@Injectable()
export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  async validateUser(email: string, pass: string) {
    return this.authRepository.validateUser(email, pass);
  }

  async login(email: string, pass: string) {
    return this.authRepository.login(email, pass);
  }
}
