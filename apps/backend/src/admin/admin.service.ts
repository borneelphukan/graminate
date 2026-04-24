import { Injectable } from '@nestjs/common';
import { AdminRepository } from './admin.repository';

@Injectable()
export class AdminService {
  constructor(private readonly adminRepository: AdminRepository) {}

  async getAdminProfile(adminId: string) {
    return this.adminRepository.getAdminProfile(adminId);
  }

  async register(
    first_name: string,
    last_name: string,
    email: string,
    password: string,
  ) {
    return this.adminRepository.register(
      first_name,
      last_name,
      email,
      password,
    );
  }

  async login(email: string, password: string) {
    return this.adminRepository.login(email, password);
  }

  async getAllUsers() {
    return this.adminRepository.getAllUsers();
  }

  async getUserCount() {
    return this.adminRepository.getUserCount();
  }

  async getUserById(userId: string) {
    return this.adminRepository.getUserById(userId);
  }

  async getUserLoginHistory(userId: string) {
    return this.adminRepository.getUserLoginHistory(userId);
  }

  async deleteUser(userId: string) {
    return this.adminRepository.deleteUser(userId);
  }

  async updateUser(userId: string, body: any) {
    return this.adminRepository.updateUser(userId, body);
  }
}
