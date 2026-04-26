import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { users, payments, Prisma } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getUserCount(): Promise<{
    status: number;
    data: { count?: number; error?: string };
  }> {
    return this.userRepository.getUserCount();
  }

  async getAllUsers(): Promise<{
    status: number;
    data: { users: (Partial<users> & { is_subscription_active: boolean })[] };
  }> {
    return this.userRepository.getAllUsers();
  }

  async getAvailableSubTypes(userId: string): Promise<{
    status: number;
    data: { subTypes?: string[]; error?: string };
  }> {
    return this.userRepository.getAvailableSubTypes(userId);
  }

  async getUserById(id: string): Promise<{
    status: number;
    data: {
      user?: Partial<users> & { is_subscription_active: boolean };
      error?: string;
    };
  }> {
    return this.userRepository.getUserById(id);
  }

  async updateUser(
    id: string,
    body: Partial<users> & {
      darkMode?: boolean;
      widgets?: string[];
      admin_reason?: string;
      admin_action?: string;
    },
  ): Promise<{ status: number; data: { message?: string; error?: string } }> {
    return this.userRepository.updateUser(id, body);
  }

  async logout(
    loginId: string,
  ): Promise<{ status: number; data: { message?: string; error?: string } }> {
    return this.userRepository.logout(loginId);
  }

  async validateUser(email: string, password: string): Promise<users> {
    return this.userRepository.validateUser(email, password);
  }

  async registerUser(body: Partial<users>): Promise<{
    status: number;
    data: { message?: string; error?: string; user?: any };
  }> {
    return this.userRepository.registerUser(body);
  }

  async deleteUser(
    id: string,
  ): Promise<{ status: number; data: { message?: string; error?: string } }> {
    return this.userRepository.deleteUser(id);
  }

  async verifyPassword(
    userId: string,
    password: string,
  ): Promise<{ status: number; data: { valid?: boolean; error?: string } }> {
    return this.userRepository.verifyPassword(userId, password);
  }

  async scheduleDowngrade(
    userId: string,
    plan: string,
  ): Promise<{ status: number; data: { message?: string; error?: string } }> {
    return this.userRepository.scheduleDowngrade(userId, plan);
  }

  async getBillingHistory(userId: string): Promise<{
    status: number;
    data: { payments?: Partial<payments>[]; error?: string };
  }> {
    return this.userRepository.getBillingHistory(userId);
  }

  async getNotifications(userId: string): Promise<{
    status: number;
    data: {
      notifications?: Partial<Prisma.notificationsUpdateInput>[];
      error?: string;
    };
  }> {
    return this.userRepository.getNotifications(userId);
  }

  async markNotificationsRead(
    userId: string,
    notificationId?: number,
  ): Promise<{ status: number; data: { message?: string; error?: string } }> {
    return this.userRepository.markNotificationsRead(userId, notificationId);
  }

  async deleteNotification(
    userId: string,
    notificationId: number,
  ): Promise<{ status: number; data: { message?: string; error?: string } }> {
    return this.userRepository.deleteNotification(userId, notificationId);
  }

  async clearAllNotifications(
    userId: string,
  ): Promise<{ status: number; data: { message?: string; error?: string } }> {
    return this.userRepository.clearAllNotifications(userId);
  }

  async findByEmail(email: string): Promise<users | null> {
    return this.userRepository.findByEmail(email);
  }
}
