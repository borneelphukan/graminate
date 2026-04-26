import { Injectable } from '@nestjs/common';
import { AdminRepository } from './admin.repository';
import { users } from '@prisma/client';

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

  async deleteUser(userId: string): Promise<{
    status: number;
    data: { message?: string; error?: string };
  }> {
    return this.adminRepository.deleteUser(userId);
  }

  async updateUser(
    userId: string,
    body: Partial<users> & {
      darkMode?: boolean;
      widgets?: string[];
      admin_reason?: string;
      admin_action?: string;
    },
  ): Promise<{
    status: number;
    data: { message?: string; error?: string; user?: Partial<users> };
  }> {
    return this.adminRepository.updateUser(userId, body);
  }

  async getUserBillingHistory(userId: string) {
    return this.adminRepository.getUserBillingHistory(userId);
  }
}
