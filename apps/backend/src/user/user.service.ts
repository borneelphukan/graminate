import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getUserCount() {
    return this.userRepository.getUserCount();
  }

  async getAllUsers() {
    return this.userRepository.getAllUsers();
  }

  async getAvailableSubTypes(userId: string) {
    return this.userRepository.getAvailableSubTypes(userId);
  }

  async getUserById(id: string) {
    return this.userRepository.getUserById(id);
  }

  async updateUser(id: string, body: any) {
    return this.userRepository.updateUser(id, body);
  }

  async logout(loginId: string) {
    return this.userRepository.logout(loginId);
  }

  async validateUser(email: string, password: string) {
    return this.userRepository.validateUser(email, password);
  }

  async registerUser(body: any) {
    return this.userRepository.registerUser(body);
  }

  async deleteUser(id: string) {
    return this.userRepository.deleteUser(id);
  }

  async verifyPassword(userId: string, password: string) {
    return this.userRepository.verifyPassword(userId, password);
  }

  async findByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }
}
