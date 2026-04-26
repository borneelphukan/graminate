import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@/prisma/prisma.service';
import { UserService } from '@/user/user.service';

@Injectable()
export class AdminRepository {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly prisma: PrismaService,
  ) {}

  async getAdminProfile(adminId: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { admin_id: adminId },
      select: {
        admin_id: true,
        first_name: true,
        last_name: true,
        email: true,
      },
    });
    if (!admin) {
      throw new UnauthorizedException('Admin not found');
    }
    return { status: 200, data: admin };
  }

  async register(
    first_name: string,
    last_name: string,
    email: string,
    password: string,
  ) {
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
      },
      select: {
        admin_id: true,
        first_name: true,
        last_name: true,
        email: true,
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

    const token = this.jwtService.sign({
      isAdmin: true,
      adminId: admin.admin_id,
    });
    return {
      status: 200,
      data: {
        access_token: token,
        admin_id: admin.admin_id,
        first_name: admin.first_name,
        last_name: admin.last_name,
      },
    };
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

  async deleteUser(userId: string) {
    return this.userService.deleteUser(userId);
  }

  async updateUser(userId: string, body: any) {
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
