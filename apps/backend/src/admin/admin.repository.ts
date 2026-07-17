import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@/prisma/prisma.service';
import { UserService } from '@/user/user.service';
import type { users } from '@prisma/client';

export const ADMIN_INVITE_CODE_ENV = 'ADMIN_INVITE_CODE';

export const ROOT_ADMIN_EMAIL = 'borneelphukan@gmail.com';

const INVITE_CODE_TTL_MS = 60 * 60 * 1000; // 1 hour

@Injectable()
export class AdminRepository {
  // In-memory store of root-generated invite codes -> expiry timestamp (ms)
  private readonly generatedInvites = new Map<string, number>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly prisma: PrismaService,
  ) {}

  private isValidGeneratedInvite(code: string): boolean {
    const expiry = this.generatedInvites.get(code);
    if (!expiry) return false;
    if (Date.now() > expiry) {
      this.generatedInvites.delete(code);
      return false;
    }
    return true;
  }

  private generateInviteCode(): string {
    // 12-character alphanumeric code (URL-safe, no ambiguous chars)
    return crypto
      .randomBytes(9)
      .toString('base64')
      .replace(/[^a-zA-Z0-9]/g, '')
      .slice(0, 12)
      .padEnd(12, '0');
  }

  async getAdminProfile(adminId: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { admin_id: adminId },
      select: {
        admin_id: true,
        first_name: true,
        last_name: true,
        email: true,
        is_root: true,
      },
    });
    if (!admin) {
      throw new UnauthorizedException('Admin not found');
    }
    return { status: 200, data: admin };
  }

  async hasAnyAdmin(): Promise<boolean> {
    const count = await this.prisma.admin.count();
    return count > 0;
  }

  async register(
    first_name: string,
    last_name: string,
    email: string,
    password: string,
    inviteCode: string,
  ) {
    const adminCount = await this.prisma.admin.count();
    const isFirstAdmin = adminCount === 0;

    if (!isFirstAdmin) {
      const staticInviteCode = process.env[ADMIN_INVITE_CODE_ENV];
      const valid =
        (staticInviteCode && inviteCode === staticInviteCode) ||
        this.isValidGeneratedInvite(inviteCode);
      if (!valid) {
        throw new ForbiddenException('Invalid or expired admin invite code');
      }
    }

    const existing = await this.prisma.admin.findUnique({
      where: { email },
    });
    if (existing) {
      throw new ConflictException('Admin with that email already exists');
    }

    const hash = await argon2.hash(password);
    const newAdmin = await this.prisma.admin.create({
      data: {
        first_name,
        last_name,
        email,
        password: hash,
        is_root: isFirstAdmin || email === ROOT_ADMIN_EMAIL,
      },
      select: {
        admin_id: true,
        first_name: true,
        last_name: true,
        email: true,
        is_root: true,
      },
    });

    return {
      status: 201,
      data: { admin: newAdmin, message: 'Admin registered' },
    };
  }

  async login(email: string, password: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { email },
    });
    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await argon2.verify(admin.password, password);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isRoot = admin.is_root || email === ROOT_ADMIN_EMAIL;
    if (isRoot && !admin.is_root) {
      await this.prisma.admin.update({
        where: { admin_id: admin.admin_id },
        data: { is_root: true },
      });
    }

    const token = this.jwtService.sign({
      isAdmin: true,
      adminId: admin.admin_id,
      isRoot,
    });
    return {
      status: 200,
      data: {
        access_token: token,
        admin_id: admin.admin_id,
        first_name: admin.first_name,
        last_name: admin.last_name,
        is_root: isRoot,
      },
    };
  }

  async createInviteCode(): Promise<{
    status: number;
    data: { inviteCode: string; expiresAt: string };
  }> {
    const inviteCode = this.generateInviteCode();
    const expiresAt = new Date(Date.now() + INVITE_CODE_TTL_MS);
    this.generatedInvites.set(inviteCode, expiresAt.getTime());
    return {
      status: 200,
      data: { inviteCode, expiresAt: expiresAt.toISOString() },
    };
  }

  async getAllAdmins(): Promise<{
    status: number;
    data: { admins: Array<{
      admin_id: string;
      first_name: string;
      last_name: string;
      email: string;
      is_root: boolean;
      created_at: Date | null;
    }> };
  }> {
    const admins = await this.prisma.admin.findMany({
      select: {
        admin_id: true,
        first_name: true,
        last_name: true,
        email: true,
        is_root: true,
        created_at: true,
      },
      orderBy: { created_at: 'asc' },
    });
    return { status: 200, data: { admins } };
  }

  async getAllUsers() {
    return this.userService.getAllUsers();
  }

  async getUserCount() {
    return this.userService.getUserCount();
  }

  async getUserById(userId: string) {
    return this.userService.getUserById(userId);
  }

  async getUserLoginHistory(userId: string) {
    try {
      const history = await this.prisma.login_history.findMany({
        where: { user_id: Number(userId) },
        orderBy: { logged_in_at: 'desc' },
        take: 10,
        select: {
          logged_in_at: true,
          logged_out_at: true,
        },
      });

      const formattedHistory = history.map((entry) => {
        let session_duration: string | null = null;
        if (entry.logged_out_at && entry.logged_in_at) {
          const diffMs =
            entry.logged_out_at.getTime() - entry.logged_in_at.getTime();
          const diffSec = Math.floor(diffMs / 1000);
          const hours = Math.floor(diffSec / 3600);
          const mins = Math.floor((diffSec % 3600) / 60);
          const secs = diffSec % 60;
          const pad = (n: number) => n.toString().padStart(2, '0');
          session_duration = `${pad(hours)}:${pad(mins)}:${pad(secs)}`;
        }
        return {
          logged_in_at: entry.logged_in_at,
          logged_out_at: entry.logged_out_at,
          session_duration,
        };
      });

      return { status: 200, data: { history: formattedHistory } };
    } catch (err) {
      console.error('Error fetching user login history:', err);
      return {
        status: 500,
        data: { error: 'Failed to fetch user login history' },
      };
    }
  }

  async deleteUser(userId: string): Promise<{
    status: number;
    data: { message?: string; error?: string };
  }> {
    return this.userService.deleteUser(userId);
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
    return this.userService.updateUser(userId, body);
  }

  async getUserBillingHistory(userId: string) {
    try {
      const payments = await this.prisma.payments.findMany({
        where: { user_id: Number(userId) },
        orderBy: { created_at: 'desc' },
        select: {
          payment_id: true,
          razorpay_order_id: true,
          razorpay_payment_id: true,
          amount: true,
          currency: true,
          status: true,
          plan_type: true,
          created_at: true,
          updated_at: true,
        },
      });

      return { status: 200, data: { payments } };
    } catch (err) {
      console.error('Error fetching billing history:', err);
      return {
        status: 500,
        data: { error: 'Failed to fetch billing history' },
      };
    }
  }
}
